import { Router } from "express";
import agent from "../agents/code.agent.js";

const agentRouter = Router();

agentRouter.post("/invoke", async (req, res) => {
    try {
        const { message, projectId } = req.body || {};

        res.writeHead(200, {
            'Content-Type': 'text/event-stream',
            'cache-control': 'no-cache',
            'connection': 'keep-alive'
        });

        if (!message) {
            res.write(`data: ${JSON.stringify({ error: "Missing 'message' in request body" })}\n\n`);
            return res.end();
        }

        // Writer streams tool activity lines to the client in real-time as the agent works
        const writer = (text) => {
            if (typeof text === 'string') {
                res.write(`data: ${JSON.stringify(text)}\n\n`);
            }
        };

        const response = await agent.stream({
            messages: [{
                role: "user",
                content: message
            }]
        }, {
            context: {
                projectId,
                writer,
            },
            streamMode: ["values", "custom"]
        });

        let finalAiMessage = "";

        for await (const chunk of response) {
            // Check if chunk is [streamMode, payload]
            if (Array.isArray(chunk)) {
                const [mode, payload] = chunk;
                if (mode === "custom" && typeof payload === "string") {
                    res.write(`data: ${JSON.stringify(payload)}\n\n`);
                } else if (mode === "values" && payload?.messages) {
                    for (let i = payload.messages.length - 1; i >= 0; i--) {
                        const msg = payload.messages[i];
                        const isAi = msg._getType?.() === 'ai' || msg.role === 'assistant';
                        const hasToolCalls = (msg.tool_calls && msg.tool_calls.length > 0) || (msg.additional_kwargs?.tool_calls && msg.additional_kwargs.tool_calls.length > 0);
                        if (isAi && !hasToolCalls && typeof msg.content === 'string' && msg.content.trim()) {
                            finalAiMessage = msg.content;
                            break;
                        }
                    }
                }
            } else if (chunk?.messages) {
                for (let i = chunk.messages.length - 1; i >= 0; i--) {
                    const msg = chunk.messages[i];
                    const isAi = msg._getType?.() === 'ai' || msg.role === 'assistant';
                    const hasToolCalls = (msg.tool_calls && msg.tool_calls.length > 0) || (msg.additional_kwargs?.tool_calls && msg.additional_kwargs.tool_calls.length > 0);
                    if (isAi && !hasToolCalls && typeof msg.content === 'string' && msg.content.trim()) {
                        finalAiMessage = msg.content;
                        break;
                    }
                }
            }
        }

        // Deliver final AI message content
        if (finalAiMessage) {
            res.write(`data: ${JSON.stringify(finalAiMessage)}\n\n`);
        }

        res.write(`data: "[DONE]"\n\n`);
        res.end();
    } catch (error) {
        console.error("Error invoking agent: ", error);
        if (res.headersSent) {
            res.write(`data: ${JSON.stringify({ error: error.message || "Failed to invoke agent" })}\n\n`);
            res.end();
        } else {
            res.status(500).json({ error: error.message || "Failed to invoke agent" });
        }
    }
});

export default agentRouter;
