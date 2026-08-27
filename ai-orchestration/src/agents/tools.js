import axios from "axios";

import { tool } from "langchain";
import * as z from "zod";

export const listFiles = tool(
  async ({}) => {
    console.log("=======================================================");
    console.log("Listing the files in project");
    console.log("=======================================================");

    const response = await axios.get(
      "http://01a033a4-3631-742f-870d-4d0e52684b8a.agent.localhost/list-files",
    );

    console.log("=======================================================");
    console.log("Response from list files tool. ", response.data);
    console.log("=======================================================");
    return JSON.stringify(response.data.files);
  },
  {
    name: "list-files",
    description:
      "lists the files in the project directory.This is useful for understanding what files are available to work with.",
    inputSchema: z.object({}),
  },
);

export const readFiles = tool(
  async ({ paths, files }) => {
    const fileList = paths || files || [];
    console.log("=======================================================");
    console.log("Reading files:", fileList);
    console.log("=======================================================");

    const response = await axios.get(
      "http://01a033a4-3631-742f-870d-4d0e52684b8a.agent.localhost/read-files?files=" +
        fileList.join(","),
    );

    console.log("=======================================================");
    console.log("Response from read files tool:", response.data);
    console.log("=======================================================");
    return JSON.stringify(response.data.files);
  },
  {
    name: "read-files",
    description:
      "Read the contents of specified files. This is useful for understanding the content of files that are relevant to the task at hand.",
    inputSchema: z.object({
      paths: z
        .array(z.string())
        .describe(
          "The list of file relative paths to read. These should be files that were listed using the 'list-files' tool or created later by 'update-files' tool.",
        ),
    }),
  },
);

export const updateFiles = tool(
  async ({ updates, files }) => {
    const updateList = updates || files || [];
    console.log("=======================================================");
    console.log(
      "Updating files:",
      updateList.map((u) => u.file),
    );
    console.log("=======================================================");

    const response = await axios.patch(
      "http://01a033a4-3631-742f-870d-4d0e52684b8a.agent.localhost/update-files",
      {
        updates: updateList,
      },
    );

    console.log("=======================================================");
    console.log("Response from update files tool:", response.data);
    console.log("=======================================================");
    return JSON.stringify(response.data.results);
  },
  {
    name: "update-files",
    description:
      "Update the contents of specified files. This is useful for making changes to files that are relevant to the task at hand. Also this tool can be used to create files by providing a new file name in the file field and the content to be added in content field.",
    inputSchema: z.object({
      updates: z
        .array(
          z.object({
            file: z
              .string()
              .describe("The relative path to the file to update."),
            content: z.string().describe("The new content for the file."),
          }),
        )
        .describe(
          "The list of files to update. These should be files that were listed using the 'list-files' tool or created later by 'update-files' tool.",
        ),
    }),
  },
);

export const deleteFiles = tool(
  async ({ paths, files }) => {
    const deleteList = paths || files || [];
    console.log("=======================================================");
    console.log("Deleting files/folders:", deleteList);
    console.log("=======================================================");

    const response = await axios.delete(
      "http://01a033a4-3631-742f-870d-4d0e52684b8a.agent.localhost/delete",
      {
        data: { paths: deleteList },
      },
    );

    console.log("=======================================================");
    console.log("Response from delete files tool:", response.data);
    console.log("=======================================================");
    return JSON.stringify(response.data.results);
  },
  {
    name: "delete-files",
    description:
      "Delete specified files or folders. This is useful for removing files that are no longer needed.",
    inputSchema: z.object({
      paths: z
        .array(z.string())
        .describe(
          "The list of relative paths to delete. These should be files or folders that were listed using the 'list-files' tool or created later by 'update-files' tool.",
        ),
    }),
  },
);
