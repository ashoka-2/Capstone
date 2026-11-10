import { Router } from "express";
import agent from "../agents/code.agent.js";

const agentRouter = Router();

agentRouter.post("/invoke", async (req, res) => {
    try {
        const { message , projectId} = req.body || {};

        res.writeHead(200,{
            'Content-Type':'text/event-stream',
            'cache-control':'no-cache',
            'connection':'keep-alive'
        })

        if (!message) {
            return res.status(400).json({ error: "Missing 'message' in request body" });
        }

        const response = await agent.stream({
            messages: [{
                role: "user",
                content: message
            }]
        },{
            context: {
                projectId
            },
            streamMode: "custom"
        });

        for await (const chunk of response){
            console.log(chunk);
            res.write(`data: ${JSON.stringify(chunk)}\n\n`);
        }

        res.end();
    } catch (error) {
        console.log("Error invoking agent: ", error);
        res.status(500).json({ error: error.message || "Failed to invoke agent" });
    }
});

export default agentRouter;
