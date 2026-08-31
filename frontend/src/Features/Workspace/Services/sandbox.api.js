import { request } from "../../../utils/api.js";

export const sandboxService = {
  // Real endpoint on sandbox-server: POST /api/sandbox/start
  async startSandbox(projectId) {
    const data = await request("/api/sandbox/start", {
      method: "POST",
      body: JSON.stringify({ projectId }),
    });
    return data;
  },

  // Real endpoint on sandbox-server: GET /api/sandbox/health
  async getHealth() {
    return await request("/api/sandbox/health");
  },

  // Real endpoints on container agent (${agentBase})
  async listFiles(agentBase) {
    const data = await request(`${agentBase}/list-files`);
    return data.files || [];
  },

  async readFiles(agentBase, files = []) {
    const fileParam = encodeURIComponent(
      Array.isArray(files) ? files.join(",") : files
    );
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

  async createFiles(agentBase, files = []) {
    const data = await request(`${agentBase}/create-files`, {
      method: "POST",
      body: JSON.stringify({ files }),
    });
    return data;
  },

  async createFolder(agentBase, folder) {
    const data = await request(`${agentBase}/create-folder`, {
      method: "POST",
      body: JSON.stringify({ folder }),
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
