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
  ArrowUpRight,
  ChevronDown,
  Trash2,
  Sparkles,
} from "lucide-react";
import { useProjects } from "../Hooks/useProjects.js";
import { projectService } from "../Services/project.api.js";
import { useSandbox } from "../../Workspace/Hooks/useSandbox.js";
import { SkeletonProjectList } from "../../../Components/SkeletonLoader.jsx";
import { addToast } from "../../../utils/toast.slice.js";
import heartGlowImg from "../../../assets/lovable-heart-glow.png";

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
    <div
      className="flex-1 h-screen overflow-y-auto flex flex-col items-center select-none relative"
      style={{ backgroundColor: "hsl(var(--background))" }}
    >
      {/* ── Lovable Layered Blur Heart Glow Background ── */}
      <div className="absolute top-0 left-0 right-0 h-[620px] overflow-hidden pointer-events-none flex items-center justify-center">
        {/* Layer 1: Ambient wide radial halo */}
        <div
          className="absolute -top-32 w-[900px] h-[700px] rounded-full opacity-60 dark:opacity-40 blur-[140px] pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse at center, rgba(28, 105, 228, 0.78) 0%, rgba(252, 64, 158, 0.6) 40%, rgba(249, 22, 86, 0.52) 70%, transparent 100%)",
          }}
        />

        {/* Layer 2: Concentric Glowing Blur Heart Asset */}
        <div className="relative top-90 w-[700px] h-[550px] flex items-center justify-center">
          <img
            src={heartGlowImg}
            alt="Lovable Glow"
            className="w-auto h-auto object-contain mix-blend-screen dark:opacity-90 opacity-75 filter blur-[2px] transform scale-510"
          />
        </div>

        {/* Layer 3: Smooth bottom gradient mask into background */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "linear-gradient(to bottom, transparent 0%, transparent 60%, hsl(var(--background)) 100%)",
          }}
        />
      </div>

      {/* ── Main Content Container ── */}
      <div className="w-full max-w-5xl px-6 py-10 flex flex-col items-center relative z-10">
        {/* Connect all your tools badge */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={() => navigate("/connectors")}
          className="inline-flex items-center gap-3 px-3.5 py-1.5 rounded-full border cursor-pointer group mb-8 backdrop-blur-md transition-all shadow-lg shadow-black/20"
          style={{
            backgroundColor: "hsl(var(--card) / 0.7)",
            borderColor: "hsl(var(--border) / 0.7)",
          }}
        >
          <div className="flex items-center -space-x-1.5">
            <div
              className="w-5 h-5 rounded-full flex items-center justify-center shadow-sm"
              style={{
                backgroundColor: "hsl(var(--brand-ocean-primary) / 0.2)",
                border: "1px solid hsl(var(--brand-ocean-primary) / 0.4)",
              }}
            >
              <GitBranch
                className="w-3 h-3"
                style={{ color: "hsl(var(--brand-ocean-primary))" }}
              />
            </div>
            <div
              className="w-5 h-5 rounded-full flex items-center justify-center shadow-sm"
              style={{
                backgroundColor: "hsl(var(--brand-twilight-primary) / 0.2)",
                border: "1px solid hsl(var(--brand-twilight-primary) / 0.4)",
              }}
            >
              <Palette
                className="w-3 h-3"
                style={{ color: "hsl(var(--brand-twilight-primary))" }}
              />
            </div>
            <div
              className="w-5 h-5 rounded-full flex items-center justify-center shadow-sm"
              style={{
                backgroundColor: "hsl(var(--success) / 0.3)",
                border: "1px solid hsl(var(--success-foreground) / 0.4)",
              }}
            >
              <Database
                className="w-3 h-3"
                style={{ color: "hsl(var(--success-foreground))" }}
              />
            </div>
          </div>
          <span
            className="text-xs font-medium"
            style={{ color: "hsl(var(--muted-foreground))" }}
          >
            Connect all your tools
          </span>
          <ArrowRight
            className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform"
            style={{ color: "hsl(var(--muted-foreground))" }}
          />
        </motion.div>

        {/* Hero Heading */}
        <motion.h1
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight mb-8 text-center drop-shadow-lg"
          style={{ color: "hsl(var(--foreground))" }}
        >
          Got an idea, {userName}?
        </motion.h1>

        {/* Floating Prompt Input Box */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="w-full max-w-2xl mb-12 sm:mb-14"
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleCreateAndLaunch();
            }}
            className="relative flex flex-col p-3 rounded-2xl border shadow-2xl backdrop-blur-xl transition-all duration-300 group focus-within:ring-2 focus-within:ring-orange-500/30"
            style={{
              backgroundColor: "hsl(var(--card) / 0.85)",
              borderColor: "hsl(var(--border) / 0.8)",
            }}
          >
            <textarea
              rows={2}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Ask Lovable to create an app, dashboard, game..."
              className="w-full bg-transparent px-3 py-2 text-sm placeholder-[hsl(var(--muted-foreground)/0.5)] focus:outline-none resize-none font-sans leading-relaxed"
              style={{ color: "hsl(var(--foreground))" }}
            />
            <div
              className="flex items-center justify-between pt-2"
              style={{ borderTop: "1px solid hsl(var(--border) / 0.5)" }}
            >
              <button
                type="button"
                className="p-2 rounded-xl transition-colors hover:opacity-80"
                style={{ color: "hsl(var(--muted-foreground))" }}
              >
                <Plus className="w-4 h-4" />
              </button>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="p-2 rounded-xl transition-colors hover:opacity-80"
                  style={{ color: "hsl(var(--muted-foreground))" }}
                >
                  <Mic className="w-4 h-4" />
                </button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={submitting || !prompt.trim()}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl font-semibold text-xs shadow-lg disabled:opacity-40 transition-all"
                  style={{
                    backgroundColor: "hsl(var(--primary))",
                    color: "hsl(var(--primary-foreground))",
                  }}
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

        {/* Projects Section Card Container */}
        <div
          className="w-full flex flex-col p-4 sm:p-6 rounded-3xl border shadow-2xl backdrop-blur-xl"
          style={{
            backgroundColor: "hsl(var(--card) / 0.8)",
            borderColor: "hsl(var(--border) / 0.6)",
          }}
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div
              className="flex items-center gap-0.5 p-1 rounded-xl border flex-wrap"
              style={{
                backgroundColor: "hsl(var(--muted) / 0.5)",
                borderColor: "hsl(var(--border) / 0.5)",
              }}
            >
              {[
                { id: "my-projects", label: "My projects" },
                { id: "recently-viewed", label: "Recently viewed" },
              ].map(({ id, label }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all"
                  style={{
                    backgroundColor:
                      activeTab === id ? "hsl(var(--card))" : "transparent",
                    color:
                      activeTab === id
                        ? "hsl(var(--foreground))"
                        : "hsl(var(--muted-foreground))",
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
            <span
              className="text-xs font-medium"
              style={{ color: "hsl(var(--muted-foreground))" }}
            >
              {filteredProjects.length} {filteredProjects.length === 1 ? "project" : "projects"}
            </span>
          </div>

          {/* Cards Grid */}
          {projectsLoading ? (
            <SkeletonProjectList count={6} />
          ) : filteredProjects.length === 0 ? (
            <div
              className="py-16 text-center text-xs flex flex-col items-center justify-center gap-2"
              style={{ color: "hsl(var(--muted-foreground))" }}
            >
              <div
                className="w-10 h-10 rounded-2xl flex items-center justify-center mb-1"
                style={{
                  backgroundColor: "hsl(var(--muted) / 0.4)",
                  border: "1px solid hsl(var(--border) / 0.5)",
                }}
              >
                <Code2
                  className="w-5 h-5"
                  style={{ color: "hsl(var(--muted-foreground))" }}
                />
              </div>
              <span className="font-medium">No projects created yet.</span>
              <span className="text-[11px] opacity-75">
                Type an idea above and click "Build" to launch your first workspace!
              </span>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
              {filteredProjects.map((p) => {
                const pId = p._id || p.id;
                const pTitle = p.title || p.name || "Untitled Project";
                const isOpening = startingProjectId === pId;
                return (
                  <motion.div
                    key={pId}
                    whileHover={{ y: -4 }}
                    onClick={() => handleOpenExisting(pId, pTitle)}
                    className="flex flex-col rounded-2xl border overflow-hidden cursor-pointer transition-all duration-300 group shadow-lg hover:shadow-xl relative"
                    style={{
                      backgroundColor: "hsl(var(--card))",
                      borderColor: "hsl(var(--border) / 0.6)",
                    }}
                  >
                    {/* Top Canvas Preview Thumbnail */}
                    <div
                      className="h-40 w-full relative p-4 flex flex-col justify-between"
                      style={{
                        background:
                          "linear-gradient(135deg, hsl(var(--brand-tiger-primary) / 0.12), hsl(var(--card)), hsl(var(--brand-twilight-primary) / 0.12))",
                        borderBottom: "1px solid hsl(var(--border) / 0.3)",
                      }}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span
                          className="px-2 py-0.5 rounded-full text-[10px] font-semibold shadow-sm"
                          style={{
                            backgroundColor: "hsl(var(--success) / 0.3)",
                            color: "hsl(var(--success-foreground))",
                            border:
                              "1px solid hsl(var(--success-foreground) / 0.3)",
                          }}
                        >
                          Published
                        </span>
                        {/* Delete project button */}
                        <button
                          onClick={(e) =>
                            handleDeleteProject(e, pId, pTitle)
                          }
                          className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg bg-black/40 hover:bg-red-500/20 hover:text-red-400 text-neutral-400 transition-all"
                          title="Delete Project & Pod"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div
                        className="w-8 h-8 rounded-xl flex items-center justify-center shadow-sm"
                        style={{
                          backgroundColor: "hsl(var(--muted) / 0.5)",
                          border: "1px solid hsl(var(--border))",
                        }}
                      >
                        <Code2
                          className="w-4 h-4"
                          style={{ color: "hsl(var(--muted-foreground))" }}
                        />
                      </div>
                    </div>

                    {/* Bottom Metadata */}
                    <div className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3 min-w-0 pr-2">
                        <div
                          className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0 shadow-sm"
                          style={{
                            backgroundColor:
                              "hsl(var(--brand-tiger-primary))",
                          }}
                        >
                          {userName.charAt(0)}
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span
                            className="text-xs font-semibold truncate"
                            style={{ color: "hsl(var(--foreground))" }}
                          >
                            {pTitle}
                          </span>
                          <span
                            className="text-[10px] truncate"
                            style={{ color: "hsl(var(--muted-foreground))" }}
                          >
                            Edited recently
                          </span>
                        </div>
                      </div>
                      {isOpening ? (
                        <Loader2
                          className="w-4 h-4 animate-spin shrink-0"
                          style={{ color: "hsl(var(--brand-tiger-primary))" }}
                        />
                      ) : (
                        <ArrowRight
                          className="w-4 h-4 group-hover:translate-x-0.5 transition-all shrink-0"
                          style={{ color: "hsl(var(--muted-foreground))" }}
                        />
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
