import "dotenv/config";
import { ChatMistralAI } from "@langchain/mistralai";
import { createAgent } from "langchain";
import { listFiles, readFiles, updateFiles } from "./tools.js";
import { ChatGoogle} from "@langchain/google";


const mistralModel = new ChatMistralAI({
    model: "codestral-latest",
    apiKey: process.env.MISTRAL_API_KEY,
    temperature: 0.7
});

const geminiModel = new ChatGoogle({
    model: "gemini-3.5-flash-lite",
    apiKey: process.env.GEMINI_API_KEY,
    temperature: 0.7
});


const agent = createAgent({
    model: geminiModel,
    tools: [listFiles, readFiles, updateFiles],
});

const res = await agent.invoke({
    messages: [
        {
            role: "user",
            content: "You are an autonomous coding assistant. Inspect the workspace with list_files, read the relevant CSS/style files, and update the files to apply a toggle in right top for theme chaging from light theme to dark and from dark to light use icons. You have added a icon but theme is not chaging and aslo remove everthing from app.jsx and create a snake game inside it without errors"
        }
    ]
});

console.log("Agent response:", res);
