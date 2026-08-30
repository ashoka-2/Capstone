import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Sparkles,
  ArrowRight,
  Plus,
  Mic,
  Code2,
  Loader2,
  GitBranch,
  Palette,
  Database,
  ArrowUpRight,
  ChevronDown,
} from "lucide-react";
import { useProjects } from "../hooks/useProjects.js";
import { useSandbox } from "../hooks/useSandbox.js";
import { SkeletonProjectList } from "../components/SkeletonLoader.jsx";

export default function DashboardPage({ userName = "Ashok" }) {
  const navigate = useNavigate();
  const { filteredProjects, loading: projectsLoading, createProject } = useProjects();
  const { startSandbox, startingProjectId } = useSandbox();

  const [prompt, setPrompt] = useState("");
  const [activeTab, setActiveTab] = useState("my-projects");
  const [submitting, setSubmitting] = useState(false);

  const handleCreateAndLaunch = async (customPrompt) => {
    const title = (customPrompt || prompt).trim();
    if (!title || submitting) return;
    setSubmitting(true);
    try {
      const newProj = await createProject(title).unwrap();
      const projId = newProj._id || newProj.id || newProj.projectId;
      const sandbox = await startSandbox(projId, title).unwrap();
      navigate(`/workspace/${sandbox.sandboxId}`);
    } catch (err) {
      alert(err.message || "Failed to launch workspace");
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenExisting = async (projectId, projectTitle) => {
    try {
      const sandbox = await startSandbox(projectId, projectTitle).unwrap();
      navigate(`/workspace/${sandbox.sandboxId}`);
    } catch (err) {
      alert(err.message || "Failed to launch workspace");
    }
  };

  return (
    <div className="flex-1 h-screen bg-[#0c0a09] overflow-y-auto flex flex-col items-center select-none relative">
      {/* Warm gradient background */}
      <div className="absolute top-0 left-0 right-0 h-[520px] bg-gradient-to-b from-[#2a1a3e] via-[#3d1a3a] to-[#0c0a09] pointer-events-none" />
      <div className="absolute top-20 left-1/4 w-[600px] h-[350px] bg-rose-500/[0.08] blur-[150px] pointer-events-none rounded-full" />
      <div className="absolute top-10 right-1/4 w-[500px] h-[350px] bg-orange-500/[0.06] blur-[130px] pointer-events-none rounded-full" />

      {/* Center Container */}
      <div className="w-full max-w-5xl px-6 py-12 flex flex-col items-center relative z-10">
        {/* Connect all your tools badge */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={() => navigate("/connectors")}
          className="inline-flex items-center gap-3 px-3.5 py-1.5 rounded-full bg-white/[0.05] hover:bg-white/[0.08] border border-white/[0.1] transition-all cursor-pointer group mb-8 backdrop-blur-sm"
        >
          <div className="flex items-center -space-x-1.5">
            <div className="w-5 h-5 rounded-full bg-blue-500/20 border border-blue-400/30 flex items-center justify-center">
              <GitBranch className="w-3 h-3 text-blue-300" />
            </div>
            <div className="w-5 h-5 rounded-full bg-purple-500/20 border border-purple-400/30 flex items-center justify-center">
              <Palette className="w-3 h-3 text-purple-300" />
            </div>
            <div className="w-5 h-5 rounded-full bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center">
              <Database className="w-3 h-3 text-emerald-300" />
            </div>
          </div>
          <span className="text-xs font-medium text-stone-300 group-hover:text-white">
            Connect all your tools
          </span>
          <ArrowRight className="w-3.5 h-3.5 text-stone-500 group-hover:text-orange-300 group-hover:translate-x-0.5 transition-all" />
        </motion.div>

        {/* Hero Heading */}
        <motion.h1
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-3xl md:text-4xl font-extrabold tracking-tight text-white mb-8 text-center"
        >
          Got an idea, {userName}?
        </motion.h1>

        {/* Floating Prompt Input */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="w-full max-w-2xl mb-14"
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleCreateAndLaunch();
            }}
            className="relative flex flex-col p-3 rounded-2xl bg-[#1c1917]/80 border border-white/[0.1] focus-within:border-orange-500/40 shadow-2xl backdrop-blur-xl transition-all duration-300"
          >
            <textarea
              rows={2}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Ask Lovable to create a dashboard to..."
              className="w-full bg-transparent px-3 py-2 text-sm text-white placeholder-stone-500 focus:outline-none resize-none font-sans leading-relaxed"
            />

            <div className="flex items-center justify-between pt-2 border-t border-white/[0.05]">
              <button
                type="button"
                className="p-2 rounded-xl text-stone-500 hover:text-white hover:bg-white/[0.05] transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="p-2 rounded-xl text-stone-500 hover:text-white hover:bg-white/[0.05] transition-colors"
                >
                  <Mic className="w-4 h-4" />
                </button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={submitting || !prompt.trim()}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white text-black font-semibold text-xs shadow-md hover:bg-stone-200 disabled:opacity-40 transition-all"
                >
                  {submitting ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <span>Build</span>
                  )}
                  <ChevronDown className="w-3 h-3" />
                </motion.button>
              </div>
            </div>
          </form>
        </motion.div>

        {/* Projects Section */}
        <div className="w-full flex flex-col space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            {/* Tab List */}
            <div className="flex items-center gap-0 bg-[#1c1917] p-1 rounded-xl border border-white/[0.06]">
              {["search", "my-projects", "recently-viewed", "templates"].map((tab) => {
                const labels = {
                  search: "Search",
                  "my-projects": "My projects",
                  "recently-viewed": "Recently viewed",
                  templates: "Lovable templates",
                };
                return (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      activeTab === tab
                        ? "bg-white/[0.08] text-white"
                        : "text-stone-500 hover:text-stone-300"
                    }`}
                  >
                    {labels[tab]}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => navigate("/templates")}
              className="flex items-center gap-1.5 text-xs font-medium text-stone-400 hover:text-orange-300 transition-colors"
            >
              <span>Browse all</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Project Cards Grid */}
          {projectsLoading ? (
            <SkeletonProjectList count={6} />
          ) : filteredProjects.length === 0 ? (
            <div className="py-16 text-center text-stone-500 text-xs">
              No projects found. Enter an idea above to start building!
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProjects.map((p) => {
                const pId = p._id || p.id;
                const pTitle = p.title || p.name || "Untitled Project";
                const isOpening = startingProjectId === pId;

                return (
                  <motion.div
                    key={pId}
                    whileHover={{ y: -4 }}
                    onClick={() => handleOpenExisting(pId, pTitle)}
                    className="flex flex-col rounded-2xl bg-[#1c1917] border border-white/[0.06] hover:border-orange-500/30 overflow-hidden cursor-pointer transition-all duration-300 group shadow-xl"
                  >
                    {/* Thumbnail */}
                    <div className="h-44 w-full bg-gradient-to-br from-orange-950/30 via-[#1c1917] to-rose-950/30 relative p-4 flex flex-col justify-between border-b border-white/[0.04]">
                      <span className="self-start px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 text-[10px] font-semibold border border-emerald-500/20">
                        Published
                      </span>
                      <div className="w-8 h-8 rounded-xl bg-white/[0.06] border border-white/[0.08] flex items-center justify-center">
                        <Code2 className="w-4 h-4 text-stone-300" />
                      </div>
                    </div>

                    {/* Card Details */}
                    <div className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3 min-w-0 pr-2">
                        <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-orange-500 to-rose-500 flex items-center justify-center text-[10px] font-bold text-white shrink-0">
                          {userName.charAt(0)}
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="text-xs font-semibold text-white truncate group-hover:text-orange-300 transition-colors">
                            {pTitle}
                          </span>
                          <span className="text-[10px] text-stone-500 truncate">
                            Edited recently
                          </span>
                        </div>
                      </div>

                      {isOpening ? (
                        <Loader2 className="w-4 h-4 animate-spin text-orange-400 shrink-0" />
                      ) : (
                        <ArrowRight className="w-4 h-4 text-stone-600 group-hover:text-orange-300 group-hover:translate-x-0.5 transition-all shrink-0" />
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
