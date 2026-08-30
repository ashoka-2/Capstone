import { Router } from "express";
import agent from "../agents/code.agent.js";

const agentRouter = new Router();

agentRouter.post("/invoke", async (req, res) => {
  try {
    const { message, projectId } = req.body;

    res.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
    });


    if (!message || !projectId) {
      return res.status(400).json({
        status: "error",
        message: "Both 'message' and 'projectId' are required",
      });
    }

    const response = await agent.stream(
      {
        messages: [
          {
            role: "user",
            content: message,
          },
        ],
      },
      {
        context: {
          projectId,
        },
        streamMode: "custom",
      },
    );

    for await (const chunk of response) {
      res.write(typeof chunk === "string" ? chunk : JSON.stringify(chunk) + "\n");
      console.log(chunk);
    }

    res.end();
  } catch (err) {
    if (!res.headersSent) {
      res.status(500).json({
        status: "error",
        message: "Failed to invoke agent",
        error: err.message,
      });
    } else {
      res.write(`\nError: ${err.message}\n`);
      res.end();
    }
  }
});

export default agentRouter;
