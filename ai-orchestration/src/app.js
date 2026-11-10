import express from "express";
import morgan from "morgan";
import agentRouter from "./routes/agent.routes.js";

const app = express();

app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/api/ai/healthz", (req, res) => {
  res.status(200).json({
    message: "AI Agent is healthy",
    status: "Ok",
  });
});

app.get("/api/ai/readyz", (req, res) => {
  res.status(200).json({
    message: "AI Agent is ready",
    status: "ready",
  });
});

// Routes
app.use("/api/ai", agentRouter);

export default app;
