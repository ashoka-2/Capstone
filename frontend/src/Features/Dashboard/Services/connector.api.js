// Real Connector Management Service scoped to the active user
// Provides rigorous validation and live connector context injection for the AI agent

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

export function validateConnectorConfig(connectorId, config) {
  if (!config) return { valid: false, error: "Configuration details are required." };

  switch (connectorId) {
    case "github": {
      const token = (config.token || "").trim();
      if (!token) return { valid: false, error: "GitHub Personal Access Token is required." };
      if (
        !token.startsWith("ghp_") &&
        !token.startsWith("github_pat_") &&
        !token.startsWith("gho_") &&
        token.length < 30
      ) {
        return {
          valid: false,
          error: "Invalid GitHub Token: Must start with 'ghp_' (classic) or 'github_pat_' (fine-grained), or be at least 30 characters.",
        };
      }
      if (config.defaultRepo) {
        const repo = config.defaultRepo.trim();
        if (!/^[a-zA-Z0-9_.-]+\/[a-zA-Z0-9_.-]+$/.test(repo)) {
          return {
            valid: false,
            error: "Invalid Repository format: Must be 'owner/repo' (e.g. 'octocat/hello-world').",
          };
        }
      }
      return { valid: true };
    }

    case "supabase": {
      const url = (config.projectUrl || "").trim();
      const key = (config.anonKey || "").trim();
      if (!url) return { valid: false, error: "Supabase Project URL is required." };
      if (!/^https:\/\/[a-zA-Z0-9-]+\.[a-zA-Z0-9.]+/.test(url)) {
        return {
          valid: false,
          error: "Invalid Project URL: Must be a valid HTTPS URL (e.g. 'https://xyzcompany.supabase.co').",
        };
      }
      if (!key) return { valid: false, error: "Supabase Anon / Service Role Key is required." };
      if (!key.startsWith("ey") && key.length < 30) {
        return {
          valid: false,
          error: "Invalid Supabase Key: Must be a valid JWT token (starts with 'ey...').",
        };
      }
      return { valid: true };
    }

    case "vercel": {
      const token = (config.token || "").trim();
      if (!token) return { valid: false, error: "Vercel API Token is required." };
      if (token.length < 20 || /\s/.test(token)) {
        return {
          valid: false,
          error: "Invalid Vercel Token: Must be at least 20 characters without spaces.",
        };
      }
      return { valid: true };
    }

    case "figma": {
      const token = (config.token || "").trim();
      if (!token) return { valid: false, error: "Figma Access Token is required." };
      if (!token.startsWith("figd_") && token.length < 20) {
        return {
          valid: false,
          error: "Invalid Figma Token: Must start with 'figd_' or be at least 20 characters.",
        };
      }
      return { valid: true };
    }

    case "stripe": {
      const key = (config.secretKey || "").trim();
      if (!key) return { valid: false, error: "Stripe Secret Key is required." };
      if (!/^(sk_test_|sk_live_|rk_test_|rk_live_)[a-zA-Z0-9_]+$/.test(key)) {
        return {
          valid: false,
          error: "Invalid Stripe Key: Must start with 'sk_test_', 'sk_live_', or restricted key 'rk_'.",
        };
      }
      return { valid: true };
    }

    case "resend": {
      const key = (config.apiKey || "").trim();
      if (!key) return { valid: false, error: "Resend API Key is required." };
      if (!key.startsWith("re_") || key.length < 15) {
        return {
          valid: false,
          error: "Invalid Resend API Key: Must start with 're_' followed by valid key characters.",
        };
      }
      if (config.fromEmail) {
        const email = config.fromEmail.trim();
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
          return {
            valid: false,
            error: "Invalid From Email format: Must be a valid email (e.g. 'onboarding@resend.dev').",
          };
        }
      }
      return { valid: true };
    }

    case "custom_mcp": {
      const url = (config.serverUrl || "").trim();
      const name = (config.serverName || "").trim();
      if (!url) return { valid: false, error: "MCP Server URL or command is required." };
      if (
        !url.startsWith("http://") &&
        !url.startsWith("https://") &&
        !url.startsWith("ws://") &&
        !url.startsWith("wss://") &&
        !url.startsWith("npx ") &&
        !url.startsWith("node ") &&
        !url.startsWith("python ")
      ) {
        return {
          valid: false,
          error: "Invalid MCP endpoint: Must be an HTTP/WS URL or CLI command (e.g. 'http://localhost:3000/sse' or 'npx -y ...').",
        };
      }
      if (!name || name.length < 2) {
        return { valid: false, error: "Display Identifier must be at least 2 characters." };
      }
      return { valid: true };
    }

    default:
      return { valid: true };
  }
}

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
      const validation = validateConnectorConfig(id, config);
      if (!validation.valid) {
        return { success: false, error: validation.error };
      }

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
      return { success: true };
    } catch (e) {
      console.error("Failed to save connector:", e);
      return { success: false, error: e.message };
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

  // Generates AI system guidance string describing all connected and active tools
  getConnectedToolsPromptContext() {
    try {
      const connected = this.getConnectors().filter((c) => c.connected && c.config);
      if (connected.length === 0) return "";

      let context = "\n\n═══ [ACTIVE DEVELOPER CONNECTORS & INTEGRATIONS AVAILABLE] ═══\n";
      context += "The user has authenticated and linked the following services to this workspace:\n";

      connected.forEach((c) => {
        context += `\n• ${c.name} (${c.id.toUpperCase()}): ${c.desc}\n`;
        if (c.id === "supabase" && c.config.projectUrl) {
          context += `  - Project URL: ${c.config.projectUrl}\n`;
          context += `  - Anon/Service Key: ${c.config.anonKey ? "(Configured & authenticated)" : ""}\n`;
          context += `  - Instructions: When the user needs a backend database, user authentication, or data tables, use @supabase/supabase-js with this URL and initialize the database client in 'src/lib/supabase.js'.\n`;
        } else if (c.id === "github") {
          if (c.config.defaultRepo) context += `  - Target Repository: ${c.config.defaultRepo}\n`;
          context += `  - Instructions: User is syncing with GitHub; provide clean modular architecture, production README, and GitHub Actions workflow if asked.\n`;
        } else if (c.id === "stripe") {
          context += `  - Instructions: For payments, pricing tiers, or subscriptions, integrate Stripe checkout and payment links.\n`;
        } else if (c.id === "resend") {
          if (c.config.fromEmail) context += `  - From Email: ${c.config.fromEmail}\n`;
          context += `  - Instructions: For email notifications or contact forms, use Resend API endpoints.\n`;
        } else if (c.id === "custom_mcp") {
          context += `  - MCP Server URL/Command: ${c.config.serverUrl}\n`;
          context += `  - Identifier: ${c.config.serverName}\n`;
          context += `  - Instructions: Utilize this Model Context Protocol server tools when applicable.\n`;
        }
      });

      context += "\nUnderstand the user's intent and naturally incorporate these connected tools whenever relevant!\n";
      return context;
    } catch (err) {
      console.error("Failed to generate connected tools context:", err);
      return "";
    }
  },
};
