import express from "express";
import morgan from "morgan";



const app = express();
app.use(morgan("dev"));



app.get("/api/ai/healthz", (req, res) => {
    res.status(200).json({
        message: "AI Agent is healthy",
        status: "Ok"
    })
})

app.get("/api/ai/readyz", (req, res) => {
    res.status(200).json({
        message: "AI Agent is ready",
        status: "ready"
    })
})




export default  app;