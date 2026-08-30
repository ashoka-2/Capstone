import { request } from "./api.js";

export const sandboxService = {
  async startSandbox(projectId) {
    const data = await request("/api/sandbox/start", {
      method: "POST",
      body: JSON.stringify({ projectId }),
    });
    return data;
  },

  async listFiles(agentBase) {
    const data = await request(`${agentBase}/list-files`);
    return data.files || [];
  },

  async readFiles(agentBase, files = []) {
    const fileParam = encodeURIComponent(Array.isArray(files) ? files.join(",") : files);
    const data = await request(`${agentBase}/read-files?files=${fileParam}`);
    return data;
  },

  async updateFiles(agentBase, updates = []) {
    const data = await request(`${agentBase}/update-files`, {
      method: "PATCH",
      body: JSON.stringify({ updates }),
    });
    return data;
  },

  async deleteFiles(agentBase, paths = []) {
    const data = await request(`${agentBase}/delete`, {
      method: "DELETE",
      body: JSON.stringify({ paths }),
    });
    return data;
  },
};
