import { request } from "./api.js";

export const projectService = {
  async getProjects() {
    const data = await request("/api/sandbox/project");
    return data.projects || [];
  },

  async createProject(title) {
    const data = await request("/api/sandbox/project", {
      method: "POST",
      body: JSON.stringify({ title }),
    });
    return data.project || data;
  },
};
