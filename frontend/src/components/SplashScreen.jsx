import { useState, useEffect } from "react";
import {
  Code2,
  FolderCode,
  Sparkles,
  Play,
  Layers,
  Plus,
  Search,
  Cpu,
  Terminal as TermIcon,
  Globe,
  Loader2,
  ArrowRight,
} from "lucide-react";

export default function SplashScreen({ onSandboxCreated }) {
  const [loading, setLoading] = useState(false);
  const [loadingProjectId, setLoadingProjectId] = useState(null);
  const [error, setError] = useState(null);
  const [title, setTitle] = useState("");
  const [loadingStep, setLoadingStep] = useState(""); // 'project' | 'sandbox'
  const [searchQuery, setSearchQuery] = useState("");

  const [projects, setProjects] = useState([]);
  const [projectsLoading, setProjectsLoading] = useState(true);

  // Fetch existing projects on mount
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await fetch("/api/sandbox/project", {
          credentials: "include",
        });
        if (res.ok) {
          const data = await res.json();
          setProjects(data.projects || []);
        }
      } catch {
        // Silently ignore
      } finally {
        setProjectsLoading(false);
      }
    };
    fetchProjects();
  }, []);

  // Launch existing sandbox
  const handleOpenProject = async (projectId, projectTitle) => {
    setLoadingProjectId(projectId);
    setError(null);
    try {
      const res = await fetch("/api/sandbox/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ projectId }),
      });
      if (!res.ok) throw new Error(`Failed to start sandbox (${res.status})`);
      const data = await res.json();
      onSandboxCreated({ ...data, projectId, projectTitle });
    } catch (err) {
      setError(err.message || "Failed to start sandbox");
      setLoadingProjectId(null);
    }
  };

  // Create new project then start its sandbox
  const handleCreate = async (customTitle) => {
    const projectTitle = (customTitle || title).trim();
    if (!projectTitle) {
      setError("Please provide a project name");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      setLoadingStep("project");
      const projectRes = await fetch("/api/sandbox/project", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ title: projectTitle }),
      });
      if (!projectRes.ok)
        throw new Error(`Failed to create project (${projectRes.status})`);
      const projectData = await projectRes.json();
      const projectId = projectData.project?._id || projectData.project?.id || projectData.projectId;

      setLoadingStep("sandbox");
      const sandboxRes = await fetch("/api/sandbox/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ projectId }),
      });
      if (!sandboxRes.ok)
        throw new Error(`Failed to start sandbox (${sandboxRes.status})`);
      const sandboxData = await sandboxRes.json();
      onSandboxCreated({ ...sandboxData, projectId, projectTitle });
    } catch (err) {
      setError(err.message || "Failed to create sandbox");
      setLoading(false);
      setLoadingStep("");
    }
  };

  const filteredProjects = projects.filter((p) =>
    (p.title || p.name || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  const templates = [
    { title: "React + Vite App", icon: Code2, desc: "Standard Vite React workspace with Tailwind CSS" },
    { title: "SaaS Landing Page", icon: Globe, desc: "Modern conversion-focused landing page with animations" },
    { title: "Interactive Web Game", icon: Sparkles, desc: "Canvas & React-based retro game template" },
    { title: "Admin Analytics Dashboard", icon: Layers, desc: "Data visualization metrics with dark UI" },
  ];

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen w-full bg-[#0a0b10] text-gray-100 p-6 overflow-y-auto select-none">
      {/* Dynamic Background Glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none -translate-x-1/2" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none translate-x-1/2" />

      {/* Header / Brand */}
      <div className="relative z-10 text-center max-w-2xl mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-semibold mb-4 tracking-wide uppercase">
          <Cpu className="w-3.5 h-3.5" /> Next-Gen Cloud Code Spaces
        </div>
        <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white mb-3">
          AI Cloud <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-indigo-400 to-purple-400">Sandbox</span>
        </h1>
        <p className="text-gray-400 text-sm md:text-base leading-relaxed">
          Spin up isolated Kubernetes React environments with instant live previews, interactive web terminals, and autonomous AI agents.
        </p>
      </div>

      {/* Main Action Container */}
      <div className="relative z-10 w-full max-w-4xl grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Left Column: Create New Project */}
        <div className="md:col-span-6 flex flex-col gap-4 p-6 rounded-2xl bg-[#12131c]/90 border border-white/10 backdrop-blur-xl shadow-2xl">
          <div className="flex items-center gap-2 text-white font-semibold text-lg">
            <Plus className="w-5 h-5 text-cyan-400" /> Create Workspace
          </div>

          <p className="text-xs text-gray-400">
            Launch a dedicated sandbox pod with Hot-Module Replacement and AI coding support.
          </p>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleCreate();
            }}
            className="flex flex-col gap-3 mt-2"
          >
            <input
              type="text"
              placeholder="Project Name (e.g. My Portfolio, Snake Game)"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={loading || loadingProjectId !== null}
              className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/10 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
            />

            <button
              type="submit"
              disabled={loading || !title.trim() || loadingProjectId !== null}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-medium text-sm flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  {loadingStep === "project" ? "Creating Project..." : "Spinning up Kubernetes Pod..."}
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" /> Start Instant Sandbox
                </>
              )}
            </button>
          </form>

          {/* Quick Start Templates */}
          <div className="mt-4 pt-4 border-t border-white/5">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-2">
              Quick Templates
            </span>
            <div className="grid grid-cols-2 gap-2">
              {templates.map((tpl, i) => (
                <button
                  key={i}
                  onClick={() => handleCreate(tpl.title)}
                  disabled={loading || loadingProjectId !== null}
                  className="flex items-center gap-2.5 p-2.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/5 text-left text-xs text-gray-300 hover:text-white transition-all group"
                >
                  <tpl.icon className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform shrink-0" />
                  <span className="truncate font-medium">{tpl.title}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Existing Projects */}
        <div className="md:col-span-6 flex flex-col p-6 rounded-2xl bg-[#12131c]/90 border border-white/10 backdrop-blur-xl shadow-2xl">
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2 text-white font-semibold text-lg">
              <FolderCode className="w-5 h-5 text-indigo-400" /> Recent Projects
            </div>
            <span className="text-xs text-gray-500 font-mono">
              {projects.length} Saved
            </span>
          </div>

          {/* Search Box */}
          <div className="relative mb-3">
            <Search className="w-4 h-4 absolute left-3 top-3 text-gray-500" />
            <input
              type="text"
              placeholder="Search your workspaces..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-lg bg-black/40 border border-white/10 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-all"
            />
          </div>

          {/* Projects List */}
          <div className="flex-1 overflow-y-auto max-h-64 space-y-2 pr-1">
            {projectsLoading ? (
              <div className="flex items-center justify-center py-10 text-gray-500 gap-2 text-xs">
                <Loader2 className="w-4 h-4 animate-spin" /> Loading your workspaces...
              </div>
            ) : filteredProjects.length === 0 ? (
              <div className="text-center py-10 text-gray-500 text-xs">
                No matching projects found. Create one to get started!
              </div>
            ) : (
              filteredProjects.map((p) => {
                const pId = p._id || p.id;
                const pName = p.title || p.name || "Untitled Project";
                const isOpening = loadingProjectId === pId;

                return (
                  <div
                    key={pId}
                    className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.06] border border-white/5 transition-all group"
                  >
                    <div className="flex flex-col min-w-0 pr-2">
                      <span className="text-sm font-medium text-gray-200 group-hover:text-white truncate">
                        {pName}
                      </span>
                      <span className="text-[10px] font-mono text-gray-500 truncate">
                        ID: {pId}
                      </span>
                    </div>

                    <button
                      onClick={() => handleOpenProject(pId, pName)}
                      disabled={loading || loadingProjectId !== null}
                      className="px-3 py-1.5 rounded-lg bg-indigo-500/20 hover:bg-indigo-500 text-indigo-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-all shrink-0 disabled:opacity-50"
                    >
                      {isOpening ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Booting...</span>
                        </>
                      ) : (
                        <>
                          <span>Launch</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </>
                      )}
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="relative z-10 mt-6 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs max-w-lg text-center">
          {error}
        </div>
      )}
    </div>
  );
}
