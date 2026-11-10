import { Router } from "express";
import agent from "../agents/code.agent.js";

const agentRouter = Router();

agentRouter.post("/invoke", async (req, res) => {
    try {
        const { message , projectId} = req.body || {};
        if (!message) {
            return res.status(400).json({ error: "Missing 'message' in request body" });
        }

        const response = await agent.invoke({
            messages: [{
                role: "user",
                content: message
            }]
        },{
            context: {
                projectId
            }
        });

        res.json({ response });
    } catch (error) {
        console.log("Error invoking agent: ", error);
        res.status(500).json({ error: error.message || "Failed to invoke agent" });
    }
});

export default agentRouter;
