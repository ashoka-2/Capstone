import axios from "axios";
import { tool } from "langchain";
import * as z from "zod";



export const listFiles = tool(
    async ({}, config) => {
        try {
            const writer = config?.writer;
            writer?.("Listing files in the project directory ...\n");

            const response = await axios.get(`http://sandbox-service-${config?.context?.projectId}:3000/list-files`);
            const files = response.data?.files || [];

            writer?.("Files listed successfully: " + files.join(", ") + "\n");

            return JSON.stringify(files);
        } catch (error) {
            console.error("Error in list_files:", error.message);
            return `Error listing files: ${error.message}. Do not retry if the server is unreachable.`;
        }
    },
    {
        name: "list_files",
        description: "List all files in the project workspace directory. Returns an array of relative file paths.",
        schema: z.object({})
    }
);

export const readFiles = tool(
    async (input, config) => {
        try {
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

            const writer = config?.writer;
            writer?.("Reading files from the project directory: " + fileList.join(", ") + " ...\n");

            const query = fileList.join(",");
            const response = await axios.get(`http://sandbox-service-${config?.context?.projectId}:3000/read-files?files=${encodeURIComponent(query)}`);

            writer?.("Files read successfully: " + fileList.join(", ") + "\n");

            return JSON.stringify(response.data.files);
        } catch (error) {
            console.error("Error in read_files:", error.message);
            return `Error reading files: ${error.message}`;
        }
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
    async (input, config) => {
        try {
            let updates = [];
            if (Array.isArray(input?.files)) {
                updates = input.files;
            } else if (Array.isArray(input?.updates)) {
                updates = input.updates;
            } else if (Array.isArray(input)) {
                updates = input;
            }

            const updatedFiles = updates.map((u) => u.file).filter(Boolean);

            const writer = config?.writer;
            writer?.("Updating/creating files in the project directory: " + updatedFiles.join(", ") + " ...\n");

            const response = await axios.patch(`http://sandbox-service-${config?.context?.projectId}:3000/update-files`, {
                updates
            });

            writer?.("Files updated/created successfully: " + updatedFiles.join(", ") + "\n");

            return JSON.stringify(response.data.results);
        } catch (error) {
            console.error("Error in update_files:", error.message);
            return `Error updating files: ${error.message}`;
        }
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


export const createFolder = tool(
    async ({ path: folderPath }, config) => {
        try {
            const writer = config?.writer;
            writer?.(`Creating directory: ${folderPath} ...\n`);

            const cleanPath = folderPath.startsWith("/") ? folderPath.slice(1) : folderPath;
            const response = await axios.post(`http://sandbox-service-${config?.context?.projectId}:3000/create-folder`, {
                path: cleanPath
            });

            writer?.(`Directory created successfully: ${folderPath}\n`);
            return JSON.stringify(response.data);
        } catch (error) {
            console.error("Error in create_folder:", error.message);
            return `Error creating directory: ${error.message}`;
        }
    },
    {
        name: "create_folder",
        description: "Create a new empty directory in the project workspace (e.g. 'src/components', 'src/assets/icons').",
        schema: z.object({
            path: z.string().describe("Relative directory path to create")
        })
    }
);

export const deleteFiles = tool(
    async ({ paths }, config) => {
        try {
            const writer = config?.writer;
            const targetPaths = Array.isArray(paths) ? paths : [paths];
            writer?.(`Deleting files/folders: ${targetPaths.join(", ")} ...\n`);

            const results = [];
            for (const p of targetPaths) {
                const clean = p.startsWith("/") ? p.slice(1) : p;
                const response = await axios.delete(
                    `http://sandbox-service-${config?.context?.projectId}:3000/delete-file?path=${encodeURIComponent(clean)}`
                );
                results.push({ path: p, status: response.data?.status || "ok" });
            }

            writer?.(`Deleted successfully: ${targetPaths.join(", ")}\n`);
            return JSON.stringify(results);
        } catch (error) {
            console.error("Error in delete_files:", error.message);
            return `Error deleting files: ${error.message}`;
        }
    },
    {
        name: "delete_files",
        description: "Delete one or more files or entire directories recursively from the workspace.",
        schema: z.object({
            paths: z.array(z.string()).describe("Array of relative paths to delete (e.g. ['src/old.jsx', 'temp/'])")
        })
    }
);

export const moveFiles = tool(
    async ({ moves }, config) => {
        try {
            const writer = config?.writer;
            writer?.(`Moving/renaming files: ${moves.map(m => `${m.source} -> ${m.destination}`).join(", ")} ...\n`);

            const results = [];
            for (const m of moves) {
                const cleanSrc = m.source.startsWith("/") ? m.source.slice(1) : m.source;
                const cleanDest = m.destination.startsWith("/") ? m.destination.slice(1) : m.destination;
                const response = await axios.post(
                    `http://sandbox-service-${config?.context?.projectId}:3000/move-file`,
                    { source: cleanSrc, destination: cleanDest }
                );
                results.push({ source: m.source, destination: m.destination, status: response.data?.status || "ok" });
            }

            writer?.(`Files moved successfully\n`);
            return JSON.stringify(results);
        } catch (error) {
            console.error("Error in move_files:", error.message);
            return `Error moving files: ${error.message}`;
        }
    },
    {
        name: "move_files",
        description: "Move or rename files and directories in the workspace (e.g. moving a component to a new folder).",
        schema: z.object({
            moves: z.array(z.object({
                source: z.string().describe("Source relative path"),
                destination: z.string().describe("Destination relative path")
            })).describe("List of moves to execute")
        })
    }
);

const C7 = "https://context7.com/api/v1";

const getC7Headers = () => {
    return process.env.CONTEXT7_API_KEY
        ? { Authorization: `Bearer ${process.env.CONTEXT7_API_KEY}` }
        : {};
};

export const context7Resolve = tool(
    async ({ name }) => {
        try {
            const res = await axios.get(`${C7}/search`, {
                params: { query: name },
                headers: getC7Headers(),
            });
            return JSON.stringify((res.data.results ?? []).slice(0, 3));
        } catch (error) {
            return `Context7 resolve error: ${error.response?.data?.message || error.message}`;
        }
    },
    {
        name: "context7_resolve",
        description: "Find the Context7 library ID for a package name. Use when adding or using libraries with frequent updates or breaking API changes (e.g. 'gsap', 'tailwindcss', 'lenis'). Never use for basic HTML/CSS or standard React.",
        schema: z.object({ name: z.string() })
    }
);

export const context7Docs = tool(
    async ({ libraryId, topic }) => {
        try {
            const res = await axios.get(`${C7}${libraryId}`, {
                params: { type: "txt", topic, tokens: 4000 },
                headers: getC7Headers(),
            });
            return String(res.data);
        } catch (error) {
            return `Context7 docs error: ${error.response?.data?.message || error.message}`;
        }
    },
    {
        name: "context7_docs",
        description: "Fetch current docs and code examples for a library ID from Context7. Use to check latest syntax for fast-changing packages. Never use for basic HTML/CSS or routine edits.",
        schema: z.object({
            libraryId: z.string().describe("ID from context7_resolve, e.g. '/greensock/gsap'"),
            topic: z.string().describe("Narrow topic, e.g. 'ScrollTrigger with React'")
        })
    }
);

export const searchImages = tool(
    async ({ query }) => {
        try {
            const url = `https://en.wikipedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent(query)}&prop=pageimages&pithumbsize=1200&format=json`;
            const res = await axios.get(url, { headers: { "User-Agent": "CapstoneAIOrchestration/1.0" } });
            const pages = Object.values(res.data?.query?.pages || {});
            const images = pages
                .filter((p) => p.thumbnail?.source)
                .map((p) => ({ title: p.title, url: p.thumbnail.source }))
                .slice(0, 5);

            if (images.length === 0) {
                return `No direct images found for "${query}". You can use verified Unsplash photography URLs.`;
            }

            return JSON.stringify(images);
        } catch (error) {
            return `Image search error: ${error.message}`;
        }
    },
    {
        name: "search_images",
        description: "Search for authentic, high-resolution public images for a specific topic, product, or theme (e.g. 'artisan coffee', 'minimalist chair', 'modern office'). Returns verified image URLs with titles to use in <img> tags.",
        schema: z.object({
            query: z.string().describe("Topic or product to search images for"),
        }),
    }
);
