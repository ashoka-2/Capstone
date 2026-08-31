import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Check, Eye, EyeOff, ShieldCheck, Trash2, Loader2, Sparkles, Terminal } from "lucide-react";

export default function ConnectorModal({ connector, isOpen, onClose, onSave, onDisconnect }) {
  const [formData, setFormData] = useState({});
  const [showSecrets, setShowSecrets] = useState({});
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);

  useEffect(() => {
    if (connector) {
      setFormData(connector.config || {});
      setTestResult(connector.connected ? { success: true, message: "Connector is actively linked." } : null);
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

    // Simulate verification check with connector endpoint / MCP ping
    setTimeout(() => {
      setTesting(false);
      setTestResult({
        success: true,
        message: "Credentials verified successfully! Linked to user account.",
      });
      setTimeout(() => {
        onSave(connector.id, formData);
        onClose();
      }, 700);
    }, 900);
  };

  const handleDisconnect = () => {
    onDisconnect(connector.id);
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/70 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative w-full max-w-md bg-[#0b0e17] border border-white/[0.12] rounded-3xl p-6 shadow-2xl overflow-hidden z-10"
        >
          {/* Subtle Ambient Background Gradient */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

          {/* Header */}
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-2xl ${
                  connector.color || "bg-purple-500/10 text-purple-400 border-purple-500/20"
                } border flex items-center justify-center`}
              >
                {connector.icon && <connector.icon className="w-5 h-5" />}
              </div>
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  {connector.name}
                  {connector.connected && (
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-semibold px-2 py-0.5 rounded-full border border-emerald-500/30">
                      Connected
                    </span>
                  )}
                </h3>
                <p className="text-xs text-slate-400">Scoped to your account (user_me)</p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/[0.04] hover:bg-white/[0.1] text-slate-400 hover:text-white flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleTestAndSave} className="space-y-4">
            {connector.fields && connector.fields.map((field) => (
              <div key={field.key} className="space-y-1.5 text-left">
                <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                  <span>{field.label}</span>
                  {field.required && <span className="text-[10px] text-purple-400 font-normal">Required</span>}
                </label>

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
                    className="w-full bg-[#121624] border border-white/[0.08] focus:border-purple-500/50 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 outline-none transition-all pr-10"
                  />

                  {field.type === "password" && (
                    <button
                      type="button"
                      onClick={() => toggleShowSecret(field.key)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors"
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

            {/* Test result indicator */}
            {testResult && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-3 rounded-xl text-xs flex items-center gap-2 border ${
                  testResult.success
                    ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-300"
                    : "bg-red-500/10 border-red-500/20 text-red-300"
                }`}
              >
                <ShieldCheck className="w-4 h-4 shrink-0" />
                <span>{testResult.message}</span>
              </motion.div>
            )}

            {/* Actions */}
            <div className="pt-2 flex items-center justify-between gap-3">
              {connector.connected ? (
                <button
                  type="button"
                  onClick={handleDisconnect}
                  className="px-3 py-2 rounded-xl text-xs font-semibold text-red-400 hover:bg-red-500/10 border border-red-500/20 transition-colors flex items-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Disconnect
                </button>
              ) : (
                <div />
              )}

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] transition-colors"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={testing}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 shadow-md shadow-purple-500/20 transition-all flex items-center gap-1.5 disabled:opacity-50"
                >
                  {testing ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Verifying...
                    </>
                  ) : connector.connected ? (
                    "Update Credentials"
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      Connect Tool
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
