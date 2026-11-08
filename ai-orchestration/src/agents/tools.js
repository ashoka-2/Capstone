import axios from "axios";
import { tool } from "langchain";
import * as z from "zod";

const SANDBOX_BASE_URL = "http://01a1afc5-2b61-76c5-af13-1191548a8ab3.agent.localhost";

export const listFiles = tool(
    async () => {
        console.log("=====================================================");
        console.log("Using list files tool");
        console.log("=====================================================");

        const response = await axios.get(`${SANDBOX_BASE_URL}/list-files`);

        console.log("=====================================================");
        console.log("Response from list files tool", response.data);
        console.log("=====================================================");

        return JSON.stringify(response.data.files);
    },
    {
        name: "list_files",
        description: "List all files in the project workspace directory. Returns an array of relative file paths.",
        schema: z.object({})
    }
);

export const readFiles = tool(
    async (input) => {
        let fileList = [];
        if (Array.isArray(input?.files)) {
            fileList = input.files;
        } else if (typeof input?.files === "string") {
            fileList = [input.files];
        } else if (typeof input?.input === "string") {
            fileList = [input.input];
        } else if (Array.isArray(input)) {
            fileList = input;
        }

        console.log("=====================================================");
        console.log("Using read files tool with files:", fileList);
        console.log("=====================================================");

        const query = fileList.join(",");
        const response = await axios.get(`${SANDBOX_BASE_URL}/read-files?files=${encodeURIComponent(query)}`);

        console.log("=====================================================");
        console.log("Response from read files tool:", response.data);
        console.log("=====================================================");

        return JSON.stringify(response.data.files);
    },
    {
        name: "read_files",
        description: "Read the content of specified files from the project workspace. Provide a list of relative file paths to read.",
        schema: z.object({
            files: z.array(z.string()).describe("Array of relative file paths to read (e.g. ['src/App.css', 'src/App.jsx'])")
        })
    }
);

export const updateFiles = tool(
    async (input) => {
        let updates = [];
        if (Array.isArray(input?.files)) {
            updates = input.files;
        } else if (Array.isArray(input?.updates)) {
            updates = input.updates;
        } else if (Array.isArray(input)) {
            updates = input;
        }

        console.log("=====================================================");
        console.log("Using update files tool with updates:", updates);
        console.log("=====================================================");

        const response = await axios.patch(`${SANDBOX_BASE_URL}/update-files`, {
            updates
        });

        console.log("=====================================================");
        console.log("Response from update files tool:", response.data);
        console.log("=====================================================");

        return JSON.stringify(response.data.results);
    },
    {
        name: "update_files",
        description: "Update the content of existing files or create new files in the project workspace. Provide an array of file update objects with file path and new content.",
        schema: z.object({
            files: z.array(z.object({
                file: z.string().describe("Relative path of the file to update (e.g. 'src/App.css')"),
                content: z.string().describe("Full new content of the file")
            })).describe("List of file updates")
        })
    }
);
