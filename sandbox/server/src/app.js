import express from "express";
import morgan from "morgan";
import { createPod, deletePod, getPod } from "./kubernetes/pod.js";
import { createService, deleteService } from "./kubernetes/service.js";

import {v7 as uuid} from "uuid";


const app = express();

app.use(express.json());
app.use(morgan("dev"))

const projectSandboxMap = new Map();
const inFlightLaunches = new Map(); // key -> Promise

app.get("/api/sandbox/health",(req,res)=>{
    res.status(200).json({
        message:"Sandbox API is healthy.",
        status: "ok"
    })
})

app.post("/api/sandbox/start", async (req, res) => {
    const { projectId, sandboxId: requestedSandboxId } = req.body || {};
    const lockKey = projectId || requestedSandboxId || "default";

    if (inFlightLaunches.has(lockKey)) {
        try {
            const result = await inFlightLaunches.get(lockKey);
            return res.status(200).json(result);
        } catch (e) {
            // fallback
        }
    }

    const launchPromise = (async () => {
        const candidateSandboxId = requestedSandboxId || (projectId ? projectSandboxMap.get(projectId) : null);
        
        if (candidateSandboxId) {
            try {
                const existingPod = await getPod(candidateSandboxId);
                if (existingPod && existingPod.body?.status?.phase !== "Failed" && existingPod.body?.status?.phase !== "Terminating") {
                    return {
                        message: "Connected to existing active sandbox environment",
                        sandboxId: candidateSandboxId,
                        previewUrl: `http://${candidateSandboxId}.preview.localhost`,
                        reused: true
                    };
                }
            } catch {
                // Pod not found or error, create fresh
            }
        }

        const sandboxId = candidateSandboxId || uuid();

        if (projectId) {
            projectSandboxMap.set(projectId, sandboxId);
        }

        await Promise.all([
            createPod(sandboxId),
            createService(sandboxId)
        ]);

        return {
            message: "Sandbox environment created successfully",
            sandboxId,
            previewUrl: `http://${sandboxId}.preview.localhost`,
            reused: false
        };
    })();

    inFlightLaunches.set(lockKey, launchPromise);

    try {
        const result = await launchPromise;
        return res.status(result.reused ? 200 : 201).json(result);
    } catch (err) {
        return res.status(500).json({
            message: `Failed to launch sandbox: ${err.message}`,
            error: err.message
        });
    } finally {
        inFlightLaunches.delete(lockKey);
    }
});

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