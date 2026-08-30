import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Zap,
  GitBranch,
  Palette,
  Database,
  Globe,
  CreditCard,
  Mail,
  Cpu,
  Check,
  Plus,
} from "lucide-react";

export default function ConnectorsPage() {
  const navigate = useNavigate();

  const [connectors, setConnectors] = useState([
    {
      id: "github",
      name: "GitHub",
      desc: "Sync repositories, push commits, and open pull requests automatically.",
      icon: GitBranch,
      color: "bg-blue-500/10 border-blue-500/20 text-blue-400",
      connected: true,
    },
    {
      id: "figma",
      name: "Figma",
      desc: "Import frames and design tokens directly into React code.",
      icon: Palette,
      color: "bg-purple-500/10 border-purple-500/20 text-purple-400",
      connected: true,
    },
    {
      id: "supabase",
      name: "Supabase",
      desc: "Instant Postgres database, authentication, and vector embeddings.",
      icon: Database,
      color: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400",
      connected: false,
    },
    {
      id: "vercel",
      name: "Vercel",
      desc: "One-click production deployment with custom domain routing.",
      icon: Globe,
      color: "bg-white/10 border-white/20 text-white",
      connected: false,
    },
    {
      id: "stripe",
      name: "Stripe",
      desc: "Payments, subscription checkouts, and customer billing portal.",
      icon: CreditCard,
      color: "bg-indigo-500/10 border-indigo-500/20 text-indigo-400",
      connected: false,
    },
    {
      id: "resend",
      name: "Resend",
      desc: "Transactional emails and notifications using React Email templates.",
      icon: Mail,
      color: "bg-amber-500/10 border-amber-500/20 text-amber-400",
      connected: false,
    },
  ]);

  const toggleConnect = (id) => {
    setConnectors((prev) =>
      prev.map((c) => (c.id === id ? { ...c, connected: !c.connected } : c))
    );
  };

  return (
    <div className="flex-1 h-screen bg-[#040508] overflow-y-auto flex flex-col items-center select-none relative p-6">
      {/* Top Bar */}
      <div className="w-full max-w-5xl flex items-center justify-between mb-8 pb-4 border-b border-white/[0.07]">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </button>
      </div>

      {/* Main Title */}
      <div className="w-full max-w-5xl text-left mb-8">
        <h1 className="text-3xl font-extrabold text-white tracking-tight mb-2">
          Workspace <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-400">Connectors</span>
        </h1>
        <p className="text-sm text-slate-400">
          Supercharge your AI agent with access to databases, Figma designs, and deployment tools.
        </p>
      </div>

      {/* Grid of Connectors */}
      <div className="w-full max-w-5xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {connectors.map((c) => (
          <motion.div
            key={c.id}
            whileHover={{ y: -3 }}
            className="p-6 rounded-3xl bg-[#090b12] border border-white/[0.07] hover:border-white/[0.15] flex flex-col justify-between transition-all duration-300 shadow-xl"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className={`w-10 h-10 rounded-2xl ${c.color} border flex items-center justify-center`}>
                  <c.icon className="w-5 h-5" />
                </div>

                {c.connected ? (
                  <span className="flex items-center gap-1 text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                    <Check className="w-3 h-3" /> Connected
                  </span>
                ) : (
                  <span className="text-[10px] font-semibold text-slate-500 bg-white/[0.03] px-2.5 py-1 rounded-full border border-white/5">
                    Not connected
                  </span>
                )}
              </div>

              <h3 className="text-base font-bold text-white mb-1">{c.name}</h3>
              <p className="text-xs text-slate-400 leading-relaxed">{c.desc}</p>
            </div>

            <button
              onClick={() => toggleConnect(c.id)}
              className={`mt-6 w-full py-2 px-3 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
                c.connected
                  ? "bg-white/[0.04] hover:bg-red-500/10 text-slate-400 hover:text-red-400 border border-white/[0.06]"
                  : "bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-white shadow-md shadow-purple-500/20"
              }`}
            >
              {c.connected ? "Disconnect" : "Connect Tool"}
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
