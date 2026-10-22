import express from "express";
import morgan from "morgan";
import fs from "fs";


const WORKING_DIR = "/workspace";

const app = express();

app.use(morgan("combined"));
app.use(express.json());
app.use(express.urlencoded({extended: true}));



app.get("/api/sandbox/healthz", (req,res) => {
    res.status(200).json({
        message: "Sandbox Agent is healthy",
        status: "Ok"
    })
})

app.get("/api/sandbox/readyz", (req,res)=>{
    res.status(200).json({
        message:"Sandbox Agent is ready",
        status:"ready"
    })
})



app.get("/list-files",async (req,res)=>{

    try{
        const elements = await fs.promises.readdir(WORKING_DIR);
        return res.status(200).json({
            message:"Elements in working directory",
            elements
        })
    }catch(error){
        console.log(error);
        return res.status(500).json({
            message:"Failed to list files",
            error:error.message
        });
    }

})









export default app;