// Real Connector Management Service scoped to the active user (Hardcoded 'user_me' until multi-user auth is linked to MongoDB)
import { addToast } from "../../../utils/toast.slice.js";

const CURRENT_USER_ID = "user_me";
const STORAGE_KEY = `lovable_connectors_${CURRENT_USER_ID}`;

export const DEFAULT_CONNECTORS = [
  {
    id: "github",
    name: "GitHub",
    desc: "Sync repositories, push commits, and open pull requests automatically via GitHub MCP.",
    authType: "token",
    fields: [
      { key: "token", label: "GitHub Personal Access Token", placeholder: "ghp_xxxxxxxxxxxx", type: "password", required: true },
      { key: "defaultRepo", label: "Default Repository (optional)", placeholder: "owner/repo", type: "text" },
    ],
    connected: false,
    config: null,
  },
  {
    id: "figma",
    name: "Figma",
    desc: "Import frames, components, and design tokens directly into React code.",
    authType: "token",
    fields: [
      { key: "token", label: "Figma Access Token", placeholder: "figd_xxxxxxxxxxxx", type: "password", required: true },
      { key: "teamId", label: "Team / Project ID (optional)", placeholder: "123456789", type: "text" },
    ],
    connected: false,
    config: null,
  },
  {
    id: "supabase",
    name: "Supabase",
    desc: "Instant Postgres database, authentication, and vector embeddings.",
    authType: "api_key",
    fields: [
      { key: "projectUrl", label: "Project URL", placeholder: "https://xyzcompany.supabase.co", type: "text", required: true },
      { key: "anonKey", label: "Anon / Service Role Key", placeholder: "eyJhbGciOi...", type: "password", required: true },
    ],
    connected: false,
    config: null,
  },
  {
    id: "vercel",
    name: "Vercel",
    desc: "One-click production deployment with custom domain routing.",
    authType: "token",
    fields: [
      { key: "token", label: "Vercel API Token", placeholder: "vck_xxxxxxxxxxxx", type: "password", required: true },
      { key: "projectId", label: "Project Name or ID", placeholder: "my-next-app", type: "text" },
    ],
    connected: false,
    config: null,
  },
  {
    id: "stripe",
    name: "Stripe",
    desc: "Payments, subscription checkouts, and customer billing portal.",
    authType: "api_key",
    fields: [
      { key: "secretKey", label: "Stripe Secret Key", placeholder: "sk_test_51xxxxxxxxxx", type: "password", required: true },
    ],
    connected: false,
    config: null,
  },
  {
    id: "resend",
    name: "Resend",
    desc: "Transactional emails and notifications using React Email templates.",
    authType: "api_key",
    fields: [
      { key: "apiKey", label: "Resend API Key", placeholder: "re_xxxxxxxxxxxx", type: "password", required: true },
      { key: "fromEmail", label: "Default From Email", placeholder: "onboarding@resend.dev", type: "text" },
    ],
    connected: false,
    config: null,
  },
  {
    id: "custom_mcp",
    name: "Custom MCP Server",
    desc: "Connect any custom Model Context Protocol server (SSE / HTTP / Local Stdio).",
    authType: "mcp",
    fields: [
      { key: "serverUrl", label: "MCP Server URL or Command", placeholder: "http://localhost:3000/sse or npx -y @modelcontextprotocol/server-postgres", type: "text", required: true },
      { key: "serverName", label: "Display Identifier", placeholder: "my-custom-mcp", type: "text", required: true },
    ],
    connected: false,
    config: null,
  },
];

export const connectorService = {
  getCurrentUser() {
    return {
      id: CURRENT_USER_ID,
      name: "Current User",
      email: "user@localhost.dev",
      role: "Owner",
    };
  },

  getConnectors() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const savedMap = JSON.parse(stored);
        return DEFAULT_CONNECTORS.map((def) => {
          const saved = savedMap[def.id];
          if (saved && saved.connected) {
            return {
              ...def,
              connected: true,
              config: saved.config,
              connectedAt: saved.connectedAt,
            };
          }
          return { ...def, connected: false, config: null };
        });
      }
      return DEFAULT_CONNECTORS;
    } catch (e) {
      console.error("Failed to load connectors:", e);
      return DEFAULT_CONNECTORS;
    }
  },

  saveConnector(id, config) {
    try {
      const currentList = this.getConnectors();
      const savedMap = {};
      currentList.forEach((c) => {
        if (c.id === id) {
          savedMap[c.id] = {
            connected: true,
            config,
            connectedAt: new Date().toISOString(),
          };
        } else if (c.connected) {
          savedMap[c.id] = {
            connected: true,
            config: c.config,
            connectedAt: c.connectedAt,
          };
        }
      });
      localStorage.setItem(STORAGE_KEY, JSON.stringify(savedMap));
      return true;
    } catch (e) {
      console.error("Failed to save connector:", e);
      return false;
    }
  },

  disconnectConnector(id) {
    try {
      const currentList = this.getConnectors();
      const savedMap = {};
      currentList.forEach((c) => {
        if (c.id !== id && c.connected) {
          savedMap[c.id] = {
            connected: true,
            config: c.config,
            connectedAt: c.connectedAt,
          };
        }
      });
      localStorage.setItem(STORAGE_KEY, JSON.stringify(savedMap));
      return true;
    } catch (e) {
      console.error("Failed to disconnect connector:", e);
      return false;
    }
  },
};
