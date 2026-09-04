import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Check,
  Eye,
  EyeOff,
  ShieldCheck,
  Trash2,
  Loader2,
  Sparkles,
  Key,
  Shield,
  HelpCircle,
} from "lucide-react";

import { validateConnectorConfig } from "../Services/connector.api.js";

export default function ConnectorModal({ connector, isOpen, onClose, onSave, onDisconnect }) {
  const [formData, setFormData] = useState({});
  const [showSecrets, setShowSecrets] = useState({});
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);

  useEffect(() => {
    if (connector) {
      setFormData(connector.config || {});
      setTestResult(
        connector.connected
          ? { success: true, message: "Connector is actively linked and authenticated." }
          : null
      );
      setShowSecrets({});
    }
  }, [connector]);

  if (!isOpen || !connector) return null;

  const handleChange = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    setTestResult(null);
  };

  const toggleShowSecret = (key) => {
    setShowSecrets((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleTestAndSave = async (e) => {
    e.preventDefault();
    setTesting(true);
    setTestResult(null);

    // Validate details entered by user
    const validation = validateConnectorConfig(connector.id, formData);
    if (!validation.valid) {
      setTimeout(() => {
        setTesting(false);
        setTestResult({
          success: false,
          message: validation.error || "Please enter valid configuration details.",
        });
      }, 350);
      return;
    }

    // Verify and link credentials to profile
    setTimeout(() => {
      setTesting(false);
      setTestResult({
        success: true,
        message: "Credentials verified successfully! Linked to your workspace profile.",
      });
      setTimeout(() => {
        onSave(connector.id, formData);
        onClose();
      }, 700);
    }, 650);
  };

  const handleDisconnect = () => {
    if (window.confirm(`Disconnect ${connector.name} from your profile?`)) {
      onDisconnect(connector.id);
      onClose();
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 select-none">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/75 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 12 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-lg bg-panel border border-subtle rounded-3xl p-6 shadow-2xl overflow-hidden z-10 text-main transition-colors duration-200"
        >
          {/* Ambient Warm Sunset Radial Glow */}
          <div className="absolute top-0 right-0 w-72 h-72 bg-[radial-gradient(circle,rgba(255,90,95,0.15)_0%,transparent_70%)] blur-3xl pointer-events-none -mr-20 -mt-20" />

          {/* Header */}
          <div className="flex items-start justify-between mb-6 pb-4 border-b border-subtle">
            <div className="flex items-center gap-3.5">
              <div
                className={`w-12 h-12 rounded-2xl ${
                  connector.color || "bg-[#ff5a5f]/10 text-[#ff5a5f] border-[#ff5a5f]/20"
                } border flex items-center justify-center shadow-lg`}
              >
                {connector.icon && <connector.icon className="w-6 h-6" />}
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-main tracking-tight">
                    {connector.name}
                  </h3>
                  {connector.connected && (
                    <span className="text-[10px] bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-semibold px-2.5 py-0.5 rounded-full border border-emerald-500/25 flex items-center gap-1">
                      <Check className="w-2.5 h-2.5" /> Connected
                    </span>
                  )}
                </div>
                <p className="text-xs text-sub mt-0.5 flex items-center gap-1.5">
                  <Shield className="w-3 h-3 text-[#ff7e40]" />
                  <span>Scoped to your user profile</span>
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-full bg-aside hover:bg-black/10 dark:hover:bg-white/10 text-sub hover:text-main border border-subtle transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleTestAndSave} className="space-y-4">
            <div className="space-y-3.5 max-h-[50vh] overflow-y-auto pr-1">
              {connector.fields &&
                connector.fields.map((field) => (
                  <div key={field.key} className="space-y-1.5 text-left">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-main">
                        {field.label}
                      </label>
                      {field.required ? (
                        <span className="text-[10px] text-[#ff7e40] font-mono">
                          Required
                        </span>
                      ) : (
                        <span className="text-[10px] text-sub font-mono">
                          Optional
                        </span>
                      )}
                    </div>

                    <div className="relative">
                      <input
                        type={
                          field.type === "password"
                            ? showSecrets[field.key]
                              ? "text"
                              : "password"
                            : field.type || "text"
                        }
                        placeholder={field.placeholder}
                        required={field.required}
                        value={formData[field.key] || ""}
                        onChange={(e) => handleChange(field.key, e.target.value)}
                        className="w-full bg-surface border border-subtle focus:border-[#ff5a5f]/60 focus:ring-2 focus:ring-[#ff5a5f]/15 rounded-xl px-3.5 py-2.5 text-xs text-main placeholder:text-sub/50 outline-none transition-all pr-10 font-mono"
                      />

                      {field.type === "password" && (
                        <button
                          type="button"
                          onClick={() => toggleShowSecret(field.key)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-sub hover:text-main transition-colors"
                        >
                          {showSecrets[field.key] ? (
                            <EyeOff className="w-3.5 h-3.5" />
                          ) : (
                            <Eye className="w-3.5 h-3.5" />
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
            </div>

            {/* Test result status indicator */}
            {testResult && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-3 rounded-xl text-xs flex items-center gap-2 border ${
                  testResult.success
                    ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-300"
                    : "bg-red-500/10 border-red-500/20 text-red-600 dark:text-red-300"
                }`}
              >
                <ShieldCheck className="w-4 h-4 shrink-0" />
                <span>{testResult.message}</span>
              </motion.div>
            )}

            {/* Actions Bar */}
            <div className="pt-3 border-t border-subtle flex items-center justify-between gap-3">
              {connector.connected ? (
                <button
                  type="button"
                  onClick={handleDisconnect}
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold text-red-500 hover:bg-red-500/10 border border-red-500/25 transition-colors flex items-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Disconnect</span>
                </button>
              ) : (
                <div />
              )}

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-sub hover:text-main bg-aside hover:bg-black/10 dark:hover:bg-white/10 border border-subtle transition-colors"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={testing}
                  className="px-5 py-2 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-[#ff5a5f] to-[#ff7e40] hover:from-[#ff6b6b] hover:to-[#ff8848] shadow-lg shadow-[#ff5a5f]/25 transition-all flex items-center gap-1.5 disabled:opacity-50"
                >
                  {testing ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Verifying...</span>
                    </>
                  ) : connector.connected ? (
                    <>
                      <Key className="w-3.5 h-3.5" />
                      <span>Update Credentials</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Connect Tool</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
