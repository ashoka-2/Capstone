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
    const res = connectorService.saveConnector(id, config);
    if (res.success) {
      loadConnectors();
      dispatch(
        addToast({
          message: `Successfully connected ${id.toUpperCase()} to your account!`,
          type: "success",
        })
      );
    } else {
      dispatch(
        addToast({
          message: res.error || `Failed to connect ${id.toUpperCase()}`,
          type: "error",
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
    <div className="flex-1 h-screen bg-canvas text-main overflow-y-auto flex flex-col items-center select-none relative p-6 transition-colors duration-200">
      {/* Top Bar */}
      <div className="w-full max-w-5xl flex items-center justify-between mb-8 pb-4 border-b border-subtle">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-xs font-semibold text-sub hover:text-main transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </button>

        {/* Current Active Account Pill */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-panel border border-subtle text-xs">
          <div className="w-5 h-5 rounded-full bg-[#ff5a5f]/20 text-[#ff7e40] flex items-center justify-center font-bold text-[10px]">
            <User className="w-3 h-3" />
          </div>
          <span className="text-main font-medium">{currentUser.name}</span>
          <span className="text-[10px] text-sub font-mono">({currentUser.id})</span>
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 flex items-center gap-1 font-semibold">
            <Shield className="w-2.5 h-2.5" /> Isolated Profile
          </span>
        </div>
      </div>

      {/* Main Title */}
      <div className="w-full max-w-5xl text-left mb-8">
        <h1 className="text-3xl font-bold text-main tracking-tight mb-2">
          Developer{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ff5a5f] to-[#ff7e40]">
            Connectors & MCP
          </span>
        </h1>
        <p className="text-sm text-sub">
          Connect developer APIs, databases, and Model Context Protocol (MCP) servers to empower your sandbox agent.
        </p>
      </div>

      {/* Grid of Connectors */}
      <div className="w-full max-w-5xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 pb-12">
        {connectors.map((c) => (
          <motion.div
            key={c.id}
            whileHover={{ y: -3 }}
            className="p-5 rounded-2xl bg-panel border border-subtle hover:border-[#ff5a5f]/40 flex flex-col justify-between transition-all duration-200 shadow-sm hover:shadow-xl relative overflow-hidden group"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div
                  className={`w-10 h-10 rounded-xl ${c.color} border flex items-center justify-center`}
                >
                  <c.icon className="w-5 h-5" />
                </div>

                {c.connected ? (
                  <span className="flex items-center gap-1 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                    <Check className="w-3 h-3" /> Connected
                  </span>
                ) : (
                  <span className="text-[10px] font-semibold text-sub bg-aside px-2.5 py-1 rounded-full border border-subtle">
                    Not connected
                  </span>
                )}
              </div>

              <h3 className="text-base font-bold text-main mb-1 flex items-center justify-between">
                <span>{c.name}</span>
                {c.connected && (
                  <span className="text-[10px] text-sub font-mono flex items-center gap-1">
                    <Key className="w-2.5 h-2.5" /> Auth active
                  </span>
                )}
              </h3>
              <p className="text-xs text-sub mb-6 leading-relaxed">
                {c.desc}
              </p>
            </div>

            <div className="pt-4 border-t border-subtle flex items-center justify-between gap-2">
              <button
                onClick={() => handleOpenConfig(c)}
                className="flex-1 py-2 px-3 rounded-xl bg-aside hover:bg-black/10 dark:hover:bg-neutral-700/80 text-main text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
              >
                <Settings className="w-3.5 h-3.5" />
                <span>{c.connected ? "Settings" : "Connect"}</span>
              </button>

              {c.connected && (
                <button
                  onClick={() => handleDisconnect(c.id)}
                  className="py-2 px-3 rounded-xl hover:bg-red-500/10 text-sub hover:text-red-500 text-xs font-semibold transition-colors"
                >
                  Disconnect
                </button>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Modal */}
      <ConnectorModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        connector={selectedConnector}
        onSave={handleSave}
        onDisconnect={handleDisconnect}
      />
    </div>
  );
}
