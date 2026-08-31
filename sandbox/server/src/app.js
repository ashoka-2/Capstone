import express from "express";
import morgan from "morgan";
import { createPod, deletePod } from "./kubernetes/pod.js";
import { createService, deleteService } from "./kubernetes/service.js";

import {v7 as uuid} from "uuid";


const app = express();

app.use(express.json());
app.use(morgan("dev"))


app.get("/api/sandbox/health",(req,res)=>{
    res.status(200).json({
        message:"Sandbox API is healthy.",
        status: "ok"
    })
})

app.post("/api/sandbox/start",async (req,res)=>{
    const sandboxId = uuid();

    await Promise.all([
        createPod(sandboxId),
        createService(sandboxId)
    ]);

    return res.status(201).json({
        message:"Sandbox environment created successfully",
        sandboxId,
        previewUrl:`http://${sandboxId}.preview.localhost`
    })
})

app.delete("/api/sandbox/:id", async (req, res) => {
    const { id } = req.params;
    await Promise.allSettled([
        deletePod(id),
        deleteService(id)
    ]);
    return res.status(200).json({
        message: "Sandbox environment deleted successfully",
        sandboxId: id,
        status: "ok"
    });
});



export default app;