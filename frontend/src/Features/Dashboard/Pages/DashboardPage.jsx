import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Plus,
  Mic,
  Code2,
  Loader2,
  GitBranch,
  Palette,
  Database,
  Trash2,
  Sparkles,
  Terminal,
  Cpu,
  Zap,
  Layers,
} from "lucide-react";
import { useProjects } from "../Hooks/useProjects.js";
import { projectService } from "../Services/project.api.js";
import { useSandbox } from "../../Workspace/Hooks/useSandbox.js";
import { SkeletonProjectList } from "../../../Components/SkeletonLoader.jsx";
import AnimatedText from "../../../Components/AnimatedText.jsx";
import { addToast } from "../../../utils/toast.slice.js";

export default function DashboardPage({ userName = "Ashok" }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const {
    filteredProjects,
    loading: projectsLoading,
    createProject,
    deleteProject,
  } = useProjects();
  const { startSandbox, startingProjectId } = useSandbox();

  const [prompt, setPrompt] = useState("");
  const [activeTab, setActiveTab] = useState("my-projects");
  const [submitting, setSubmitting] = useState(false);

  const handleCreateAndLaunch = async (customPrompt) => {
    const title = (customPrompt || prompt).trim();
    if (!title || submitting) return;
    setSubmitting(true);
    try {
      const result = await createProject(title);
      if (!result.success) throw new Error(result.error);
      const newProj = result.data;
      const projId = newProj._id || newProj.id || newProj.projectId;

      dispatch(
        addToast({
          message: `Created project "${title}". Launching container pod...`,
          type: "info",
        })
      );

      const sandboxRes = await startSandbox(projId, title);
      if (!sandboxRes.success) throw new Error(sandboxRes.error);
      const sandbox = sandboxRes.data;

      // Save sandboxId with project metadata
      await projectService.updateProjectSandboxId(projId, sandbox.sandboxId);

      dispatch(
        addToast({
          message: `Workspace "${title}" is ready!`,
          type: "success",
        })
      );

      navigate(`/workspace/${sandbox.sandboxId}`, {
        state: { initialPrompt: title, projectId: projId, projectTitle: title },
      });
    } catch (err) {
      dispatch(
        addToast({
          message: err.message || "Failed to launch workspace",
          type: "error",
        })
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenExisting = async (projectId, projectTitle) => {
    try {
      const proj = filteredProjects.find((p) => (p._id || p.id) === projectId);
      const sandboxRes = await startSandbox(
        projectId,
        projectTitle,
        proj?.sandboxId
      );
      if (!sandboxRes.success) throw new Error(sandboxRes.error);
      const sandbox = sandboxRes.data;

      if (proj && !proj.sandboxId && sandbox.sandboxId) {
        projectService.updateProjectSandboxId(projectId, sandbox.sandboxId);
      }

      navigate(`/workspace/${sandbox.sandboxId}`, {
        state: { projectId, projectTitle },
      });
    } catch (err) {
      dispatch(
        addToast({
          message: err.message || "Failed to launch workspace",
          type: "error",
        })
      );
    }
  };

  const handleDeleteProject = async (e, pId, pTitle) => {
    e.stopPropagation();
    if (
      window.confirm(
        `Are you sure you want to delete "${pTitle}" and terminate its container pod?`
      )
    ) {
      const res = await deleteProject(pId);
      if (res.success) {
        dispatch(
          addToast({
            message: `Deleted "${pTitle}" and pod cleaned up.`,
            type: "success",
          })
        );
      } else {
        dispatch(
          addToast({
            message: res.error || "Failed to delete project",
            type: "error",
          })
        );
      }
    }
  };

  return (
    <div className="flex-1 h-screen overflow-y-auto flex flex-col items-center select-none relative bg-canvas text-main transition-colors duration-200">
      {/* ── Ambient Sunset Coral & Warm Orange Radial Glow ── */}
      <div className="absolute top-0 left-0 right-0 h-[480px] overflow-hidden pointer-events-none flex items-center justify-center">
        <div className="absolute -top-24 w-[750px] h-[420px] rounded-full bg-[radial-gradient(ellipse_at_center,rgba(255,90,95,0.15)_0%,rgba(255,126,64,0.08)_50%,transparent_80%)] blur-[110px]" />
      </div>

      {/* ── Main Content Container ── */}
      <div className="w-full max-w-5xl px-4 sm:px-6 py-8 sm:py-12 flex flex-col items-center relative z-10">
        {/* Connectors badge */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={() => navigate("/connectors")}
          className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full border border-subtle bg-panel/80 cursor-pointer group mb-6 backdrop-blur-md transition-all hover:border-[#ff5a5f]/40 shadow-sm dark:shadow-lg"
        >
          <div className="flex items-center -space-x-1">
            <div className="w-5 h-5 rounded-full bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-[#ff5a5f]">
              <GitBranch className="w-3 h-3" />
            </div>
            <div className="w-5 h-5 rounded-full bg-orange-500/20 border border-orange-500/40 flex items-center justify-center text-[#ff7e40]">
              <Database className="w-3 h-3" />
            </div>
            <div className="w-5 h-5 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Sparkles className="w-3 h-3" />
            </div>
          </div>
          <span className="text-xs font-medium text-sub group-hover:text-main transition-colors">
            Connect developer tools & MCP
          </span>
          <ArrowRight className="w-3.5 h-3.5 text-sub group-hover:translate-x-0.5 group-hover:text-[#ff7e40] transition-all" />
        </motion.div>

        {/* Hero Heading with Word Stagger */}
        <div className="mb-8 text-center">
          <AnimatedText
            text={`What would you like to build, ${userName}?`}
            className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-main justify-center"
          />
          <p className="text-sub text-sm mt-2.5 font-normal">
            Kubernetes-powered AI workspaces with live previews and full terminal access
          </p>
        </div>

        {/* Sunset Studio Prompt Input Box */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="w-full max-w-2xl mb-10 sm:mb-12"
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleCreateAndLaunch();
            }}
            className="relative flex flex-col p-3 rounded-2xl border border-subtle bg-panel shadow-xl backdrop-blur-xl transition-all duration-200 focus-within:border-[#ff5a5f]/50 focus-within:ring-2 focus-within:ring-[#ff5a5f]/20"
          >
            <textarea
              rows={2}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Ask Lovable to create a modern web app, dashboard, tool..."
              className="w-full bg-transparent px-3 py-2 text-sm text-main placeholder:text-sub focus:outline-none resize-none font-sans leading-relaxed"
            />
            <div className="flex items-center justify-between pt-2 border-t border-subtle">
              <div className="flex items-center gap-1 text-sub">
                <button
                  type="button"
                  className="p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 hover:text-main transition-colors"
                  title="Add files"
                >
                  <Plus className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  className="p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 hover:text-main transition-colors"
                  title="Voice input"
                >
                  <Mic className="w-4 h-4" />
                </button>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={submitting || !prompt.trim()}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl font-semibold text-xs bg-gradient-to-r from-[#ff5a5f] to-[#ff7e40] hover:opacity-90 text-white shadow-lg shadow-[#ff5a5f]/20 disabled:opacity-40 transition-all"
              >
                {submitting ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <>
                    <span>Build App</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </motion.button>
            </div>
          </form>
        </motion.div>

        {/* Projects Section */}
        <div className="w-full flex flex-col p-4 sm:p-6 rounded-2xl border border-subtle bg-panel shadow-lg backdrop-blur-xl">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-1 p-1 rounded-xl bg-aside border border-subtle">
              {[
                { id: "my-projects", label: "All Projects" },
                { id: "recently-viewed", label: "Active Sandboxes" },
              ].map(({ id, label }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    activeTab === id
                      ? "bg-panel text-main shadow-sm border border-subtle"
                      : "text-sub hover:text-main"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
            <span className="text-xs font-mono text-sub">
              {filteredProjects.length} {filteredProjects.length === 1 ? "project" : "projects"}
            </span>
          </div>

          {/* Cards Grid */}
          {projectsLoading ? (
            <SkeletonProjectList count={6} />
          ) : filteredProjects.length === 0 ? (
            <div className="py-16 text-center text-xs flex flex-col items-center justify-center gap-3 text-sub">
              <div className="w-12 h-12 rounded-2xl bg-aside border border-subtle flex items-center justify-center text-sub">
                <Code2 className="w-6 h-6 text-[#ff7e40]" />
              </div>
              <span className="font-semibold text-main text-sm">No workspaces created yet</span>
              <span className="text-xs text-sub max-w-sm">
                Enter what you want to build in the box above and click "Build App" to provision a live container pod.
              </span>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredProjects.map((p) => {
                const pId = p._id || p.id;
                const pTitle = p.title || p.name || "Untitled Project";
                const isOpening = startingProjectId === pId;
                return (
                  <motion.div
                    key={pId}
                    whileHover={{ y: -3 }}
                    onClick={() => handleOpenExisting(pId, pTitle)}
                    className="group flex flex-col rounded-xl border border-subtle bg-panel overflow-hidden cursor-pointer transition-all duration-200 hover:border-[#ff5a5f]/40 shadow-sm hover:shadow-xl relative glow-card"
                  >
                    {/* Top Terminal / Visual Mock Header */}
                    <div className="h-32 w-full relative p-3 flex flex-col justify-between bg-gradient-to-br from-black/[0.03] to-black/[0.08] dark:from-[#16171d] dark:to-[#121316] border-b border-subtle">
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-red-500/80" />
                          <span className="w-2 h-2 rounded-full bg-yellow-500/80" />
                          <span className="w-2 h-2 rounded-full bg-green-500/80" />
                        </div>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-medium bg-[#ff5a5f]/15 text-[#ff7e40] border border-[#ff5a5f]/30">
                          {p.sandboxId ? "Pod Active" : "Ready"}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-aside border border-subtle flex items-center justify-center text-main">
                            <Terminal className="w-3.5 h-3.5" />
                          </div>
                          <span className="text-[11px] font-mono text-sub truncate max-w-[120px]">
                            {p.sandboxId ? `pod-${p.sandboxId.slice(0, 6)}` : "standalone"}
                          </span>
                        </div>

                        <button
                          onClick={(e) => handleDeleteProject(e, pId, pTitle)}
                          className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg bg-aside hover:bg-red-500/20 hover:text-red-500 text-sub transition-all"
                          title="Delete Project & Terminate Pod"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Bottom Metadata */}
                    <div className="p-3.5 flex items-center justify-between bg-panel">
                      <div className="flex items-center gap-2.5 min-w-0 pr-2">
                        <div className="w-6 h-6 rounded-md bg-gradient-to-tr from-[#ff5a5f] to-[#ff7e40] flex items-center justify-center text-white text-[10px] font-bold shrink-0 shadow-sm shadow-[#ff5a5f]/20">
                          {userName.charAt(0)}
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="text-xs font-semibold text-main truncate group-hover:text-[#ff7e40] transition-colors">
                            {pTitle}
                          </span>
                          <span className="text-[10px] text-sub truncate">
                            {p.updatedAt ? new Date(p.updatedAt).toLocaleDateString() : "Active container"}
                          </span>
                        </div>
                      </div>

                      {isOpening ? (
                        <Loader2 className="w-4 h-4 animate-spin text-[#ff7e40] shrink-0" />
                      ) : (
                        <ArrowRight className="w-4 h-4 text-sub group-hover:translate-x-1 group-hover:text-[#ff7e40] transition-all shrink-0" />
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
