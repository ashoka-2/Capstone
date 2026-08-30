import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
  Zap,
  Box,
  Compass,
  Command,
} from "lucide-react";

export default function SplashScreen({ onSandboxCreated }) {
  const [loading, setLoading] = useState(false);
  const [loadingProjectId, setLoadingProjectId] = useState(null);
  const [error, setError] = useState(null);
  const [title, setTitle] = useState("");
  const [loadingStep, setLoadingStep] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const [projects, setProjects] = useState([]);
  const [projectsLoading, setProjectsLoading] = useState(true);

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
    {
      title: "React 19 + Vite",
      tag: "Starter",
      icon: Code2,
      desc: "Fast HMR, Tailwind 4, Lucide icons",
      color: "from-cyan-500/20 to-blue-500/10 border-cyan-500/20",
    },
    {
      title: "SaaS Landing Page",
      tag: "Design",
      icon: Globe,
      desc: "Hero, dynamic pricing, dark aesthetic",
      color: "from-purple-500/20 to-indigo-500/10 border-purple-500/20",
    },
    {
      title: "Retro Nokia Game",
      tag: "Canvas",
      icon: Sparkles,
      desc: "LCD canvas grid, state loop, score tracking",
      color: "from-emerald-500/20 to-teal-500/10 border-emerald-500/20",
    },
    {
      title: "Admin Analytics Pro",
      tag: "Dashboard",
      icon: Layers,
      desc: "Telemetry stats, charts, modular widgets",
      color: "from-amber-500/20 to-orange-500/10 border-amber-500/20",
    },
  ];

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen w-full bg-[#040508] text-slate-100 p-6 overflow-x-hidden overflow-y-auto select-none">
      {/* Living Mesh Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-32 -left-32 w-[600px] h-[600px] bg-cyan-500/[0.08] rounded-full blur-[140px] animate-blob-1" />
        <div className="absolute top-1/2 -right-48 w-[650px] h-[650px] bg-indigo-600/[0.09] rounded-full blur-[150px] animate-blob-2" />
        <div className="absolute -bottom-32 left-1/3 w-[550px] h-[550px] bg-purple-600/[0.07] rounded-full blur-[130px]" />
        
        {/* Subtle dot matrix grid */}
        <div
          className="absolute inset-0 opacity-[0.14]"
          style={{
            backgroundImage: "radial-gradient(rgba(255, 255, 255, 0.18) 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />
      </div>

      {/* Hero Header Section */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 text-center max-w-2xl mb-10 flex flex-col items-center"
      >
        {/* Hero 3D Orb Badge */}
        <div className="relative mb-5 group">
          <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-cyan-500 via-indigo-500 to-purple-500 opacity-40 blur-lg group-hover:opacity-75 transition-opacity duration-700" />
          <img
            src="/hero-orb.jpg"
            alt="Cloud Sandbox"
            className="relative w-20 h-20 rounded-full object-cover border border-white/20 shadow-2xl ring-1 ring-white/10 group-hover:scale-105 transition-transform duration-500"
          />
        </div>

        {/* Feature Pill */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.04] border border-white/10 text-xs font-medium text-cyan-300 backdrop-blur-xl mb-4 shadow-inner">
          <Zap className="w-3.5 h-3.5 text-cyan-400 fill-cyan-400" />
          <span>Cloud Kubernetes Sandbox Environment</span>
        </div>

        {/* Title */}
        <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-white mb-4 leading-none">
          Code at the speed of{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-indigo-300 to-purple-300">
            Thought.
          </span>
        </h1>

        <p className="text-slate-400 text-sm md:text-base max-w-lg leading-relaxed font-normal">
          Instant Kubernetes React spaces with autonomous AI orchestration, live browser previews, and embedded PTY terminals.
        </p>
      </motion.div>

      {/* Main Dual Cards Grid */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-5xl grid grid-cols-1 md:grid-cols-12 gap-6"
      >
        {/* Left Column: Create Workspace */}
        <div className="md:col-span-6 flex flex-col justify-between p-7 rounded-3xl bg-[#090b12]/75 border border-white/[0.08] backdrop-blur-2xl shadow-2xl glow-border">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
                  <Plus className="w-4 h-4 text-cyan-400" />
                </div>
                <h3 className="text-base font-semibold text-white tracking-tight">
                  New Sandbox
                </h3>
              </div>
              <span className="text-[11px] font-mono text-cyan-400/80 bg-cyan-500/10 px-2 py-0.5 rounded-md border border-cyan-500/20">
                React 19
              </span>
            </div>

            <p className="text-xs text-slate-400 mb-5 leading-relaxed">
              Launch an isolated pod with dedicated port mapping, live Hot-Reloading, and Mistral Agent tools.
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleCreate();
              }}
              className="flex flex-col gap-3.5"
            >
              <div className="relative">
                <input
                  type="text"
                  placeholder="e.g. Neo SaaS Landing, AI Dashboard"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  disabled={loading || loadingProjectId !== null}
                  className="w-full px-4 py-3.5 rounded-2xl glass-input text-sm text-white placeholder-slate-500 focus:outline-none transition-all duration-300"
                />
              </div>

              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading || !title.trim() || loadingProjectId !== null}
                className="relative overflow-hidden w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-cyan-500 via-indigo-600 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white font-semibold text-sm flex items-center justify-center gap-2.5 shadow-lg shadow-cyan-500/25 transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed group"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>
                      {loadingStep === "project"
                        ? "Registering Workspace..."
                        : "Provisioning Kubernetes Pod..."}
                    </span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-current group-hover:translate-x-0.5 transition-transform" />
                    <span>Launch Environment</span>
                  </>
                )}
              </motion.button>
            </form>
          </div>

          {/* Quick Start Templates */}
          <div className="mt-6 pt-5 border-t border-white/[0.06]">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest block mb-3">
              Starter Templates
            </span>
            <div className="grid grid-cols-2 gap-2.5">
              {templates.map((tpl, i) => (
                <motion.button
                  key={i}
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleCreate(tpl.title)}
                  disabled={loading || loadingProjectId !== null}
                  className={`flex flex-col p-3 rounded-2xl bg-gradient-to-br ${tpl.color} hover:border-white/20 text-left transition-all duration-300 group border`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <tpl.icon className="w-4 h-4 text-white group-hover:scale-110 transition-transform duration-300" />
                    <span className="text-[9px] font-mono text-slate-400 uppercase tracking-wider bg-black/40 px-1.5 py-0.5 rounded">
                      {tpl.tag}
                    </span>
                  </div>
                  <span className="text-xs font-semibold text-white truncate block">
                    {tpl.title}
                  </span>
                  <span className="text-[10px] text-slate-400 truncate mt-0.5">
                    {tpl.desc}
                  </span>
                </motion.button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Existing Workspaces */}
        <div className="md:col-span-6 flex flex-col p-7 rounded-3xl bg-[#090b12]/75 border border-white/[0.08] backdrop-blur-2xl shadow-2xl glow-border">
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
                <FolderCode className="w-4 h-4 text-purple-400" />
              </div>
              <h3 className="text-base font-semibold text-white tracking-tight">
                Workspaces
              </h3>
            </div>
            <span className="text-xs font-mono text-slate-400 bg-white/[0.04] px-2.5 py-1 rounded-full border border-white/5">
              {projects.length} saved
            </span>
          </div>

          <p className="text-xs text-slate-400 mb-4">
            Pick up right where you left off. Reconnect to your active sandboxes.
          </p>

          {/* Search Box */}
          <div className="relative mb-3.5">
            <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-500" />
            <input
              type="text"
              placeholder="Search workspaces by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-xs text-white placeholder-slate-500 focus:outline-none transition-all duration-300"
            />
          </div>

          {/* Workspaces Scroll List */}
          <div className="flex-1 overflow-y-auto max-h-[300px] space-y-2 pr-1">
            {projectsLoading ? (
              <div className="flex flex-col items-center justify-center py-16 text-slate-500 gap-2.5 text-xs">
                <Loader2 className="w-5 h-5 animate-spin text-indigo-400" />
                <span>Loading your clusters...</span>
              </div>
            ) : filteredProjects.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center text-slate-500 text-xs px-4">
                <Box className="w-8 h-8 text-slate-600 mb-2" />
                <span className="font-medium text-slate-400">No workspaces found</span>
                <span className="text-[11px] text-slate-500 mt-0.5">
                  Launch a new one on the left to start coding!
                </span>
              </div>
            ) : (
              filteredProjects.map((p) => {
                const pId = p._id || p.id;
                const pName = p.title || p.name || "Untitled Workspace";
                const isOpening = loadingProjectId === pId;

                return (
                  <motion.div
                    key={pId}
                    whileHover={{ scale: 1.01 }}
                    className="flex items-center justify-between p-3.5 rounded-2xl bg-white/[0.02] hover:bg-white/[0.05] border border-white/[0.05] hover:border-white/[0.12] transition-all duration-300 group"
                  >
                    <div className="flex items-center gap-3 min-w-0 pr-2">
                      <div className="w-7 h-7 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shrink-0">
                        <Code2 className="w-3.5 h-3.5 text-indigo-400" />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-xs font-medium text-slate-200 group-hover:text-white truncate">
                          {pName}
                        </span>
                        <span className="text-[10px] font-mono text-slate-500 truncate">
                          {pId}
                        </span>
                      </div>
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.04 }}
                      whileTap={{ scale: 0.96 }}
                      onClick={() => handleOpenProject(pId, pName)}
                      disabled={loading || loadingProjectId !== null}
                      className="px-3 py-1.5 rounded-xl bg-indigo-500/20 hover:bg-indigo-500 text-indigo-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-all duration-300 shrink-0 shadow-sm disabled:opacity-40"
                    >
                      {isOpening ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Booting...</span>
                        </>
                      ) : (
                        <>
                          <span>Resume</span>
                          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                        </>
                      )}
                    </motion.button>
                  </motion.div>
                );
              })
            )}
          </div>
        </div>
      </motion.div>

      {/* Error Alert */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="relative z-20 mt-6 px-4 py-3 rounded-2xl bg-red-500/10 border border-red-500/25 text-red-400 text-xs max-w-lg text-center backdrop-blur-xl shadow-xl"
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
