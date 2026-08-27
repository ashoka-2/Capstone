import "dotenv/config";
import {ChatMistralAI} from "@langchain/mistralai";
import { listFiles, readFiles, updateFiles, deleteFiles } from "./tools.js";

import { createAgent } from "langchain";

const model = new ChatMistralAI({
    model:"mistral-medium-latest",
    apiKey:process.env.MISTRAL_API_KEY,
    temperature:0.7
})


const agent = createAgent({
    model,
    tools:[listFiles,readFiles,updateFiles,deleteFiles],
    description:"You are a code agent that can read, write, and update or create files in the project directory. You can also create and delete files and folders. Be careful when using these tools, as they can make permanent changes to the project directory.",
})


const response = await agent.invoke({
    messages:[
        {
            role:"user",
            content:"Update the theme of the project to light"
        }
    ]
})

export default model;