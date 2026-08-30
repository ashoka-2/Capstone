import { useState } from "react";
import { useNavigate } from "react-router-dom";
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
import { useProjects } from "../hooks/useProjects.js";
import { useSandbox } from "../hooks/useSandbox.js";

export default function TemplatesPage() {
  const navigate = useNavigate();
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
      title: "canva-design",
      category: "apps",
      tag: "Fullstack",
      desc: "Interactive canvas editor with drag-and-drop elements, layers, and export tools.",
      color: "from-blue-600/30 via-indigo-600/20 to-purple-600/30",
    },
    {
      id: "flutter-forge-friendly",
      title: "flutter-forge-friendly",
      category: "apps",
      tag: "Mobile",
      desc: "Cross-platform mobile UI simulator and component catalog with live state switching.",
      color: "from-cyan-600/30 via-teal-600/20 to-emerald-600/30",
    },
    {
      id: "retro-nokia-snake",
      title: "retro-nokia-snake",
      category: "games",
      tag: "Canvas Game",
      desc: "Monochrome LCD retro Nokia 3310 snake game with high scores and keyboard controls.",
      color: "from-emerald-600/30 via-teal-600/20 to-cyan-600/30",
    },
    {
      id: "saas-landing-dark",
      title: "saas-landing-dark",
      category: "landing",
      tag: "Landing",
      desc: "High-conversion SaaS product landing page with animated gradients and pricing calculator.",
      color: "from-purple-600/30 via-indigo-600/20 to-pink-600/30",
    },
    {
      id: "crypto-analytics-dashboard",
      title: "crypto-analytics-dashboard",
      category: "dashboards",
      tag: "Dashboard",
      desc: "Real-time telemetry and financial market dashboard with sleek dark charts.",
      color: "from-amber-600/30 via-orange-600/20 to-red-600/30",
    },
    {
      id: "portfolio-minimalist",
      title: "portfolio-minimalist",
      category: "landing",
      tag: "Portfolio",
      desc: "Minimalist modern designer portfolio with project galleries and contact form.",
      color: "from-slate-600/30 via-zinc-600/20 to-stone-600/30",
    },
  ];

  const handleLaunch = async (tpl) => {
    setLaunchingId(tpl.id);
    try {
      const newProj = await createProject(tpl.title).unwrap();
      const projId = newProj._id || newProj.id || newProj.projectId;
      const sandbox = await startSandbox(projId, tpl.title).unwrap();
      navigate(`/workspace/${sandbox.sandboxId}`);
    } catch (err) {
      alert(err.message || "Failed to launch template");
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
              className="pl-8 pr-3 py-1.5 rounded-xl glass-input text-xs text-white placeholder-slate-500 focus:outline-none w-56"
            />
          </div>
        </div>
      </div>

      {/* Main Title */}
      <div className="w-full max-w-6xl text-left mb-6">
        <h1 className="text-3xl font-extrabold text-white tracking-tight mb-2">
          Lovable <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-400">Templates</span>
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
              <div className={`h-44 w-full bg-gradient-to-tr ${tpl.color} relative p-4 flex flex-col justify-between`}>
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
