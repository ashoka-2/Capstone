import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  ArrowRight,
  Plus,
  Mic,
  Search,
  Globe,
  Layers,
  Code2,
  FolderKanban,
  Clock,
  ExternalLink,
  Loader2,
  Zap,
  GitBranch,
  Palette,
  Database,
  ArrowUpRight,
} from "lucide-react";

export default function HomeScreen({
  projects = [],
  projectsLoading = false,
  onOpenProject,
  onCreateProject,
  loading = false,
  loadingProjectId = null,
  userName = "Ashok Kumar",
}) {
  const [prompt, setPrompt] = useState("");
  const [activeTab, setActiveTab] = useState("my-projects"); // 'search' | 'my-projects' | 'recently-viewed' | 'templates'
  const [searchQuery, setSearchQuery] = useState("");

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!prompt.trim() || loading) return;
    onCreateProject(prompt.trim());
  };

  const templates = [
    {
      id: "tpl-1",
      title: "canva-design",
      desc: "Interactive canvas editor with drag-and-drop layers & exports",
      tag: "Published",
      date: "Edited Oct 25, 2025",
      color: "from-blue-600/30 via-indigo-600/20 to-purple-600/30",
    },
    {
      id: "tpl-2",
      title: "flutter-forge-friendly",
      desc: "Cross-platform mobile UI simulator and state builder",
      tag: "Published",
      date: "Edited Sep 11, 2025",
      color: "from-cyan-600/30 via-teal-600/20 to-emerald-600/30",
    },
    {
      id: "tpl-3",
      title: "retro-nokia-snake",
      desc: "Monochrome LCD retro Nokia 3310 snake game in React",
      tag: "Game",
      date: "Edited Today",
      color: "from-emerald-600/30 via-teal-600/20 to-cyan-600/30",
    },
  ];

  const filteredProjects = projects.filter((p) =>
    (p.title || p.name || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex-1 h-screen bg-[#040508] overflow-y-auto flex flex-col items-center select-none relative">
      {/* Background ambient lighting */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[850px] h-[400px] bg-cyan-500/[0.04] blur-[150px] pointer-events-none rounded-full" />
      <div className="absolute top-1/3 left-1/3 w-[600px] h-[400px] bg-purple-500/[0.04] blur-[140px] pointer-events-none rounded-full" />

      {/* Center Container */}
      <div className="w-full max-w-5xl px-6 py-12 flex flex-col items-center">
        {/* Connect all your tools banner badge */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-3 px-3.5 py-1.5 rounded-full bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.08] transition-all cursor-pointer group mb-8 shadow-sm backdrop-blur-xl"
        >
          <div className="flex items-center -space-x-1.5">
            <div className="w-5 h-5 rounded-full bg-blue-500/20 border border-blue-400/40 flex items-center justify-center text-[9px] font-bold text-blue-300">
              <GitBranch className="w-3 h-3" />
            </div>
            <div className="w-5 h-5 rounded-full bg-purple-500/20 border border-purple-400/40 flex items-center justify-center text-[9px] font-bold text-purple-300">
              <Palette className="w-3 h-3" />
            </div>
            <div className="w-5 h-5 rounded-full bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-[9px] font-bold text-emerald-300">
              <Database className="w-3 h-3" />
            </div>
          </div>
          <span className="text-xs font-medium text-slate-300 group-hover:text-white">
            Connect all your tools
          </span>
          <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-cyan-300 group-hover:translate-x-0.5 transition-all" />
        </motion.div>

        {/* Hero Heading */}
        <motion.h1
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-3xl md:text-4xl font-extrabold tracking-tight text-white mb-8 text-center"
        >
          Got an idea, {userName.split(" ")[0]}?
        </motion.h1>

        {/* Hero Floating Prompt / Chat Input Capsule (Lovable Form) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="w-full max-w-2xl mb-14"
        >
          <form
            onSubmit={handleFormSubmit}
            className="relative flex flex-col p-3 rounded-3xl bg-[#090b12]/90 border border-white/[0.12] focus-within:border-cyan-500/50 shadow-2xl backdrop-blur-2xl transition-all duration-300 glow-border"
          >
            <textarea
              rows={2}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Ask Lovable to create a dashboard, landing page, or game..."
              className="w-full bg-transparent px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none resize-none font-sans leading-relaxed"
            />

            {/* Bottom Actions Row */}
            <div className="flex items-center justify-between pt-2 border-t border-white/[0.05]">
              <button
                type="button"
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/[0.05] transition-colors"
                title="Add attachment"
              >
                <Plus className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/[0.05] transition-colors"
                  title="Voice prompt"
                >
                  <Mic className="w-4 h-4" />
                </button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={loading || !prompt.trim()}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 disabled:opacity-40 disabled:hover:from-cyan-500 text-white font-semibold text-xs shadow-md shadow-cyan-500/25 transition-all"
                >
                  {loading ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Sparkles className="w-3.5 h-3.5" />
                  )}
                  <span>Build</span>
                </motion.button>
              </div>
            </div>
          </form>
        </motion.div>

        {/* Projects Section Header & Tabs */}
        <div className="w-full flex flex-col space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/[0.07] pb-3">
            {/* Tab List */}
            <div className="flex items-center gap-1 bg-[#090b12] p-1 rounded-2xl border border-white/[0.06]">
              <button
                onClick={() => setActiveTab("my-projects")}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  activeTab === "my-projects"
                    ? "bg-white/[0.1] text-white shadow-sm"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                My projects
              </button>

              <button
                onClick={() => setActiveTab("recently-viewed")}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  activeTab === "recently-viewed"
                    ? "bg-white/[0.1] text-white shadow-sm"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                Recently viewed
              </button>

              <button
                onClick={() => setActiveTab("templates")}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  activeTab === "templates"
                    ? "bg-white/[0.1] text-white shadow-sm"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                Lovable templates
              </button>
            </div>

            {/* Browse All Link */}
            <button className="flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-cyan-300 transition-colors">
              <span>Browse all</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeTab === "templates" ? (
              templates.map((tpl) => (
                <motion.div
                  key={tpl.id}
                  whileHover={{ y: -4 }}
                  onClick={() => onCreateProject(tpl.title)}
                  className="flex flex-col rounded-3xl bg-[#090b12] border border-white/[0.07] hover:border-white/[0.18] overflow-hidden cursor-pointer transition-all duration-300 group shadow-xl"
                >
                  {/* Thumbnail Preview Area */}
                  <div
                    className={`h-44 w-full bg-gradient-to-tr ${tpl.color} relative p-4 flex flex-col justify-between`}
                  >
                    <span className="self-start px-2 py-0.5 rounded-full bg-black/50 backdrop-blur-md text-[10px] font-semibold text-white border border-white/10">
                      {tpl.tag}
                    </span>
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
                        <Sparkles className="w-3.5 h-3.5 text-white" />
                      </div>
                    </div>
                  </div>

                  {/* Card Details */}
                  <div className="p-4 flex flex-col">
                    <span className="text-sm font-semibold text-white group-hover:text-cyan-300 transition-colors">
                      {tpl.title}
                    </span>
                    <span className="text-xs text-slate-400 line-clamp-2 mt-1">
                      {tpl.desc}
                    </span>
                    <span className="text-[10px] font-mono text-slate-500 mt-3">
                      {tpl.date}
                    </span>
                  </div>
                </motion.div>
              ))
            ) : projectsLoading ? (
              <div className="col-span-full py-16 flex flex-col items-center justify-center text-slate-500 text-xs gap-2">
                <Loader2 className="w-5 h-5 animate-spin text-cyan-400" />
                <span>Loading your projects...</span>
              </div>
            ) : filteredProjects.length === 0 ? (
              <div className="col-span-full py-16 text-center text-slate-500 text-xs">
                No projects yet. Enter an idea above to build your first app!
              </div>
            ) : (
              filteredProjects.map((p) => {
                const pId = p._id || p.id;
                const pTitle = p.title || p.name || "Untitled Project";
                const isOpening = loadingProjectId === pId;

                return (
                  <motion.div
                    key={pId}
                    whileHover={{ y: -4 }}
                    onClick={() => onOpenProject(pId, pTitle)}
                    className="flex flex-col rounded-3xl bg-[#090b12] border border-white/[0.07] hover:border-cyan-500/40 overflow-hidden cursor-pointer transition-all duration-300 group shadow-xl"
                  >
                    {/* Thumbnail Preview Area */}
                    <div className="h-44 w-full bg-gradient-to-tr from-cyan-950/40 via-[#0d101a] to-indigo-950/40 relative p-4 flex flex-col justify-between border-b border-white/[0.05]">
                      <span className="self-start px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-semibold border border-emerald-500/30">
                        Published
                      </span>
                      <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
                        <Code2 className="w-4 h-4 text-cyan-300" />
                      </div>
                    </div>

                    {/* Card Details */}
                    <div className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3 min-w-0 pr-2">
                        <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-[10px] font-bold text-white shrink-0">
                          {userName.charAt(0)}
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="text-xs font-semibold text-white truncate group-hover:text-cyan-300 transition-colors">
                            {pTitle}
                          </span>
                          <span className="text-[10px] font-mono text-slate-500 truncate">
                            Edited recently
                          </span>
                        </div>
                      </div>

                      {isOpening ? (
                        <Loader2 className="w-4 h-4 animate-spin text-cyan-400 shrink-0" />
                      ) : (
                        <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-300 group-hover:translate-x-0.5 transition-all shrink-0" />
                      )}
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
