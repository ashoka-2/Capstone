import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  GitBranch,
  Palette,
  Database,
  Globe,
  CreditCard,
  Mail,
  Check,
  Terminal,
  Settings,
  User,
  Shield,
  Key,
} from "lucide-react";
import { useDispatch } from "react-redux";
import { addToast } from "../../../utils/toast.slice.js";
import { connectorService } from "../Services/connector.api.js";
import ConnectorModal from "../Components/ConnectorModal.jsx";

const ICON_MAP = {
  github: { icon: GitBranch, color: "bg-blue-500/10 border-blue-500/20 text-blue-400" },
  figma: { icon: Palette, color: "bg-purple-500/10 border-purple-500/20 text-purple-400" },
  supabase: { icon: Database, color: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" },
  vercel: { icon: Globe, color: "bg-white/10 border-white/20 text-white" },
  stripe: { icon: CreditCard, color: "bg-indigo-500/10 border-indigo-500/20 text-indigo-400" },
  resend: { icon: Mail, color: "bg-amber-500/10 border-amber-500/20 text-amber-400" },
  custom_mcp: { icon: Terminal, color: "bg-teal-500/10 border-teal-500/20 text-teal-400" },
};

export default function ConnectorsPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [connectors, setConnectors] = useState([]);
  const [selectedConnector, setSelectedConnector] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const currentUser = connectorService.getCurrentUser();

  const loadConnectors = () => {
    const raw = connectorService.getConnectors();
    const mapped = raw.map((c) => ({
      ...c,
      icon: ICON_MAP[c.id]?.icon || Terminal,
      color: ICON_MAP[c.id]?.color || "bg-purple-500/10 border-purple-500/20 text-purple-400",
    }));
    setConnectors(mapped);
  };

  useEffect(() => {
    loadConnectors();
  }, []);

  const handleOpenConfig = (connector) => {
    setSelectedConnector(connector);
    setIsModalOpen(true);
  };

  const handleSave = (id, config) => {
    const success = connectorService.saveConnector(id, config);
    if (success) {
      loadConnectors();
      dispatch(
        addToast({
          message: `Successfully connected ${id.toUpperCase()} to your account!`,
          type: "success",
        })
      );
    }
  };

  const handleDisconnect = (id) => {
    const success = connectorService.disconnectConnector(id);
    if (success) {
      loadConnectors();
      dispatch(
        addToast({
          message: `Disconnected ${id.toUpperCase()}`,
          type: "info",
        })
      );
    }
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

        {/* Current Active Account Pill */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.08] text-xs">
          <div className="w-5 h-5 rounded-full bg-purple-500/20 text-purple-300 flex items-center justify-center font-bold text-[10px]">
            <User className="w-3 h-3" />
          </div>
          <span className="text-slate-300 font-medium">{currentUser.name}</span>
          <span className="text-[10px] text-slate-500 font-mono">({currentUser.id})</span>
          <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 flex items-center gap-1 font-semibold">
            <Shield className="w-2.5 h-2.5" /> Isolated Profile
          </span>
        </div>
      </div>

      {/* Main Title */}
      <div className="w-full max-w-5xl text-left mb-8">
        <h1 className="text-3xl font-extrabold text-white tracking-tight mb-2">
          Workspace{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-400">
            Connectors & MCP
          </span>
        </h1>
        <p className="text-sm text-slate-400">
          Connect your personal developer tools, databases, and Model Context Protocol (MCP) servers to power your AI sandbox agents.
        </p>
      </div>

      {/* Grid of Connectors */}
      <div className="w-full max-w-5xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pb-12">
        {connectors.map((c) => (
          <motion.div
            key={c.id}
            whileHover={{ y: -3 }}
            className="p-6 rounded-3xl bg-[#090b12] border border-white/[0.07] hover:border-white/[0.15] flex flex-col justify-between transition-all duration-300 shadow-xl relative overflow-hidden group"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div
                  className={`w-10 h-10 rounded-2xl ${c.color} border flex items-center justify-center`}
                >
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

              <h3 className="text-base font-bold text-white mb-1 flex items-center justify-between">
                <span>{c.name}</span>
                {c.connected && (
                  <span className="text-[10px] text-slate-500 font-mono flex items-center gap-1">
                    <Key className="w-2.5 h-2.5" /> Auth active
                  </span>
                )}
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">{c.desc}</p>
            </div>

            <div className="mt-6 flex items-center gap-2">
              {c.connected ? (
                <>
                  <button
                    onClick={() => handleOpenConfig(c)}
                    className="flex-1 py-2 px-3 rounded-xl text-xs font-semibold bg-white/[0.05] hover:bg-white/[0.1] text-slate-200 border border-white/[0.08] transition-all flex items-center justify-center gap-1.5"
                  >
                    <Settings className="w-3.5 h-3.5" />
                    Configure
                  </button>
                  <button
                    onClick={() => handleDisconnect(c.id)}
                    className="py-2 px-3 rounded-xl text-xs font-semibold bg-white/[0.03] hover:bg-red-500/10 text-slate-400 hover:text-red-400 border border-white/[0.06] hover:border-red-500/20 transition-all"
                  >
                    Disconnect
                  </button>
                </>
              ) : (
                <button
                  onClick={() => handleOpenConfig(c)}
                  className="w-full py-2 px-3 rounded-xl text-xs font-semibold bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-white shadow-md shadow-purple-500/20 transition-all flex items-center justify-center gap-1.5"
                >
                  Connect Tool
                </button>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Modal */}
      <ConnectorModal
        isOpen={isModalOpen}
        connector={selectedConnector}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedConnector(null);
        }}
        onSave={handleSave}
        onDisconnect={handleDisconnect}
      />
    </div>
  );
}
