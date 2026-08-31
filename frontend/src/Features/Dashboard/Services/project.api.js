// Real Project Management Service with Local Persistence + Kubernetes Pod Orchestration
import { request } from "../../../utils/api.js";

const STORAGE_KEY = "lovable_projects_v2";
const DEFAULT_PROJECTS = [];

export const projectService = {
  async getProjects() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
      return DEFAULT_PROJECTS;
    } catch {
      return DEFAULT_PROJECTS;
    }
  },

  async createProject(title) {
    const cleanTitle = title.trim();
    const newProject = {
      id: "proj_" + Math.random().toString(36).substring(2, 10),
      title: cleanTitle,
      createdAt: new Date().toISOString(),
      status: "ready",
      starred: false,
      owned: true,
    };

    try {
      const existing = await this.getProjects();
      const updated = [
        newProject,
        ...existing.filter((p) => p.id !== newProject.id),
      ];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error("Failed to save project locally:", e);
    }

    return newProject;
  },

  async deleteProject(id) {
    try {
      // 1. Delete pod and service from cluster if sandbox exists
      try {
        await request(`/api/sandbox/${id}`, { method: "DELETE" });
      } catch (err) {
        console.warn("Cluster pod cleanup notification:", err.message);
      }

      // 2. Remove from local store
      const existing = await this.getProjects();
      const filtered = existing.filter((p) => (p.id || p._id) !== id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
      return true;
    } catch {
      return false;
    }
  },
};
