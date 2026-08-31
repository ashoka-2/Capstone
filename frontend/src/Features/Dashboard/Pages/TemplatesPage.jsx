import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { motion } from "framer-motion";
import {
  Sparkles,
  ArrowLeft,
  Code2,
  Globe,
  Layers,
  Search,
  Rocket,
  ArrowRight,
  Loader2,
} from "lucide-react";
import { useProjects } from "../Hooks/useProjects.js";
import { useSandbox } from "../../Workspace/Hooks/useSandbox.js";
import { addToast } from "../../../utils/toast.slice.js";

import { projectService } from "../Services/project.api.js";

export default function TemplatesPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { createProject } = useProjects();
  const { startSandbox } = useSandbox();
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [launchingId, setLaunchingId] = useState(null);

  const categories = [
    { id: "all", label: "All Templates" },
    { id: "landing", label: "Landing Pages" },
    { id: "games", label: "Games & Canvas" },
    { id: "dashboards", label: "Dashboards & Analytics" },
    { id: "apps", label: "Web Applications" },
  ];

  const templates = [
    {
      id: "canva-design",
      title: "Canva Design Editor",
      category: "apps",
      tag: "Fullstack",
      desc: "Build an interactive canvas design tool with draggable elements, color palette selection, layer management, and PNG export.",
      color: "from-blue-600/30 via-indigo-600/20 to-purple-600/30",
    },
    {
      id: "retro-nokia-snake",
      title: "Retro Nokia Snake Game",
      category: "games",
      tag: "Canvas Game",
      desc: "Create a complete retro Nokia 3310 snake game on canvas with LCD pixel styling, sound effects toggle, score counter, and difficulty levels.",
      color: "from-emerald-600/30 via-teal-600/20 to-cyan-600/30",
    },
    {
      id: "saas-landing-dark",
      title: "SaaS Landing Page",
      category: "landing",
      tag: "Landing",
      desc: "Generate a sleek dark-themed SaaS landing page with animated feature cards, pricing toggle calculator, customer testimonials, and FAQ accordion.",
      color: "from-purple-600/30 via-indigo-600/20 to-pink-600/30",
    },
    {
      id: "crypto-analytics-dashboard",
      title: "Crypto Telemetry Dashboard",
      category: "dashboards",
      tag: "Dashboard",
      desc: "Build a real-time crypto telemetry analytics dashboard with interactive price charts, portfolio metrics, top gainers list, and dark modern aesthetics.",
      color: "from-amber-600/30 via-orange-600/20 to-red-600/30",
    },
  ];

  const handleLaunch = async (tpl) => {
    setLaunchingId(tpl.id);
    try {
      const projRes = await createProject(tpl.title);
      if (!projRes.success) throw new Error(projRes.error);
      const newProj = projRes.data;
      const projId = newProj._id || newProj.id || newProj.projectId;

      dispatch(
        addToast({
          message: `Launching "${tpl.title}" and instructing AI to build...`,
          type: "info",
        })
      );

      const sandboxRes = await startSandbox(projId, tpl.title);
      if (!sandboxRes.success) throw new Error(sandboxRes.error);
      const sandbox = sandboxRes.data;

      await projectService.updateProjectSandboxId(projId, sandbox.sandboxId);

      dispatch(
        addToast({
          message: `Workspace "${tpl.title}" is ready!`,
          type: "success",
        })
      );

      navigate(`/workspace/${sandbox.sandboxId}`, {
        state: {
          initialPrompt: tpl.desc,
          projectId: projId,
          projectTitle: tpl.title,
        },
      });
    } catch (err) {
      dispatch(
        addToast({
          message: err.message || "Failed to launch template",
          type: "error",
        })
      );
    } finally {
      setLaunchingId(null);
    }
  };

  const filtered = templates.filter((tpl) => {
    const matchCategory =
      selectedCategory === "all" || tpl.category === selectedCategory;
    const matchSearch =
      tpl.title.toLowerCase().includes(search.toLowerCase()) ||
      tpl.desc.toLowerCase().includes(search.toLowerCase());
    return matchCategory && matchSearch;
  });

  return (
    <div className="flex-1 h-screen bg-[#040508] overflow-y-auto flex flex-col items-center select-none relative p-6">
      {/* Top Header */}
      <div className="w-full max-w-6xl flex items-center justify-between mb-8 pb-4 border-b border-white/[0.07]">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </button>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-500" />
            <input
              type="text"
              placeholder="Search templates..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 pr-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none w-56"
            />
          </div>
        </div>
      </div>

      {/* Main Title */}
      <div className="w-full max-w-6xl text-left mb-6">
        <h1 className="text-3xl font-extrabold text-white tracking-tight mb-2">
          Lovable{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-400">
            Templates
          </span>
        </h1>
        <p className="text-sm text-slate-400">
          Jumpstart your next project with pre-built production-ready templates.
        </p>

        {/* Category Pills */}
        <div className="flex items-center gap-2 mt-5 overflow-x-auto pb-1">
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedCategory(c.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === c.id
                  ? "bg-white/[0.12] text-white shadow-sm border border-white/[0.15]"
                  : "bg-white/[0.02] text-slate-400 hover:text-slate-200 border border-white/[0.05]"
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Templates */}
      <div className="w-full max-w-6xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((tpl) => {
          const isLaunching = launchingId === tpl.id;
          return (
            <motion.div
              key={tpl.id}
              whileHover={{ y: -4 }}
              className="flex flex-col rounded-3xl bg-[#090b12] border border-white/[0.07] hover:border-cyan-500/40 overflow-hidden transition-all duration-300 group shadow-xl"
            >
              <div
                className={`h-44 w-full bg-gradient-to-tr ${tpl.color} relative p-4 flex flex-col justify-between`}
              >
                <span className="self-start px-2 py-0.5 rounded-full bg-black/50 backdrop-blur-md text-[10px] font-semibold text-white border border-white/10">
                  {tpl.tag}
                </span>
                <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
              </div>

              <div className="p-5 flex flex-col flex-1 justify-between">
                <div>
                  <span className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors">
                    {tpl.title}
                  </span>
                  <p className="text-xs text-slate-400 mt-1.5 leading-relaxed line-clamp-2">
                    {tpl.desc}
                  </p>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleLaunch(tpl)}
                  disabled={isLaunching}
                  className="mt-5 w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-cyan-500/20 to-indigo-500/20 hover:from-cyan-500 hover:to-indigo-500 text-cyan-300 hover:text-white border border-cyan-500/30 text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-sm disabled:opacity-50"
                >
                  {isLaunching ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Booting Sandbox...</span>
                    </>
                  ) : (
                    <>
                      <Rocket className="w-3.5 h-3.5" />
                      <span>Launch Template</span>
                    </>
                  )}
                </motion.button>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
