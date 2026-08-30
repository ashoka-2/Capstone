import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send,
  Sparkles,
  Bot,
  User,
  Loader2,
  Copy,
  Check,
  CheckCircle2,
  XCircle,
  Wrench,
  Zap,
  FileCode2,
  FilePlus2,
  FileX2,
  ChevronDown,
  ChevronRight,
} from "lucide-react";

// ─── File Change Card (Antigravity-style diff block) ──────────────────
function FileChangeCard({ change, onAccept, onReject }) {
  const [expanded, setExpanded] = useState(false);
  const [status, setStatus] = useState("pending"); // 'pending' | 'accepted' | 'rejected'

  const typeConfig = {
    created: {
      icon: FilePlus2,
      label: "Created",
      color: "text-emerald-400",
      bg: "bg-emerald-500/8",
      border: "border-emerald-500/20",
      badge: "bg-emerald-500/15 text-emerald-300",
    },
    updated: {
      icon: FileCode2,
      label: "Modified",
      color: "text-amber-400",
      bg: "bg-amber-500/8",
      border: "border-amber-500/20",
      badge: "bg-amber-500/15 text-amber-300",
    },
    deleted: {
      icon: FileX2,
      label: "Deleted",
      color: "text-red-400",
      bg: "bg-red-500/8",
      border: "border-red-500/20",
      badge: "bg-red-500/15 text-red-300",
    },
  };

  const cfg = typeConfig[change.type] || typeConfig.updated;
  const Icon = cfg.icon;

  const handleAccept = () => {
    setStatus("accepted");
    onAccept?.(change);
  };

  const handleReject = () => {
    setStatus("rejected");
    onReject?.(change);
  };

  return (
    <div className={`rounded-xl border ${cfg.border} ${cfg.bg} overflow-hidden transition-all`}>
      {/* File Header Row */}
      <div
        className="flex items-center justify-between px-3 py-2 cursor-pointer hover:bg-white/[0.02] transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-2 min-w-0">
          <Icon className={`w-3.5 h-3.5 ${cfg.color} shrink-0`} />
          <span className="text-[11px] font-mono text-slate-200 truncate">
            {change.path}
          </span>
          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${cfg.badge}`}>
            {cfg.label}
          </span>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {status === "pending" ? (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); handleAccept(); }}
                className="p-1 rounded-md hover:bg-emerald-500/20 text-slate-500 hover:text-emerald-400 transition-colors"
                title="Accept this file change"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); handleReject(); }}
                className="p-1 rounded-md hover:bg-red-500/20 text-slate-500 hover:text-red-400 transition-colors"
                title="Reject this file change"
              >
                <XCircle className="w-3.5 h-3.5" />
              </button>
            </>
          ) : status === "accepted" ? (
            <span className="text-[9px] font-bold text-emerald-400 flex items-center gap-0.5">
              <Check className="w-3 h-3" /> Accepted
            </span>
          ) : (
            <span className="text-[9px] font-bold text-red-400 flex items-center gap-0.5">
              <XCircle className="w-3 h-3" /> Rejected
            </span>
          )}

          {change.diff && (
            expanded
              ? <ChevronDown className="w-3 h-3 text-slate-500" />
              : <ChevronRight className="w-3 h-3 text-slate-500" />
          )}
        </div>
      </div>

      {/* Diff Content (Expanded) */}
      <AnimatePresence>
        {expanded && change.diff && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-3 pb-3 pt-1">
              <pre className="text-[10px] font-mono leading-[1.6] overflow-x-auto max-h-52 rounded-lg bg-[#0a0a0a] border border-white/[0.04] p-2.5">
                {change.diff.split("\n").map((line, i) => {
                  let lineClass = "text-slate-500";
                  if (line.startsWith("+")) lineClass = "text-emerald-400 bg-emerald-500/8";
                  else if (line.startsWith("-")) lineClass = "text-red-400 bg-red-500/8";

                  return (
                    <div key={i} className={`${lineClass} px-1 -mx-1 rounded-sm`}>
                      {line}
                    </div>
                  );
                })}
              </pre>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Main AiChat Component ───────────────────────────────────────────
export default function AiChat({ projectId, onFilesChanged }) {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Hello Ashok! I am **Lovable**, your autonomous AI developer. Tell me what you'd like to build — features, pages, games, or entire apps.",
    },
  ]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [toolActivity, setToolActivity] = useState(null);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, toolActivity]);

  const quickPrompts = [
    "Build a Retro Nokia 3310 Snake Game in React",
    "Create a responsive SaaS Landing page with pricing",
  ];

  // Parse AI response to extract file changes
  const parseFileChanges = (text) => {
    const changes = [];
    // Match patterns like: "Created src/App.jsx", "Updated src/index.css", "Deleted src/old.jsx"
    const patterns = [
      { regex: /(?:✅\s*)?(?:Created|created|CREATED|New file)[:\s]+([^\n,]+)/g, type: "created" },
      { regex: /(?:📝\s*)?(?:Updated|updated|UPDATED|Modified|modified)[:\s]+([^\n,]+)/g, type: "updated" },
      { regex: /(?:🗑️?\s*)?(?:Deleted|deleted|DELETED|Removed|removed)[:\s]+([^\n,]+)/g, type: "deleted" },
    ];

    for (const { regex, type } of patterns) {
      let match;
      while ((match = regex.exec(text)) !== null) {
        const path = match[1].trim().replace(/[`*]/g, "");
        if (path && path.length < 120 && !path.includes(" ")) {
          changes.push({ path, type, diff: null });
        }
      }
    }

    return changes;
  };

  const handleSend = async (customPrompt) => {
    const text = (customPrompt || input).trim();
    if (!text || isStreaming) return;

    setInput("");
    const userMessage = { role: "user", content: text };
    setMessages((prev) => [...prev, userMessage]);
    setIsStreaming(true);
    setToolActivity("Analyzing workspace...");

    try {
      const response = await fetch("/api/ai/invoke", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, projectId }),
      });

      if (!response.ok) {
        throw new Error(`Agent request failed (${response.status})`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let assistantText = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });

        // Real-time tool activity detection
        if (chunk.includes("Listing files") || chunk.includes("Files listed")) {
          setToolActivity("Browsing workspace files...");
        } else if (chunk.includes("Reading files") || chunk.includes("Files read")) {
          setToolActivity("Inspecting file contents...");
        } else if (chunk.includes("Updating files") || chunk.includes("Files updated")) {
          setToolActivity("Writing code changes...");
        } else if (chunk.includes("Deleting files") || chunk.includes("Files deleted")) {
          setToolActivity("Deleting files...");
        }

        assistantText += chunk;
      }

      const finalText =
        assistantText.trim() ||
        "Task completed! I have updated your project files.";

      // Extract file changes from AI response
      const fileChanges = parseFileChanges(finalText);

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: finalText,
          fileChanges: fileChanges.length > 0 ? fileChanges : null,
        },
      ]);

      onFilesChanged?.();
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `⚠️ **Error:** ${err.message}`,
        },
      ]);
    } finally {
      setIsStreaming(false);
      setToolActivity(null);
    }
  };

  const handleAcceptAll = (msgIdx) => {
    setMessages((prev) =>
      prev.map((m, i) =>
        i === msgIdx
          ? { ...m, allAccepted: true, allRejected: false }
          : m
      )
    );
  };

  const handleRejectAll = (msgIdx) => {
    setMessages((prev) =>
      prev.map((m, i) =>
        i === msgIdx
          ? { ...m, allRejected: true, allAccepted: false }
          : m
      )
    );
  };

  const copyMessage = (text, idx) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="h-full w-80 md:w-[420px] bg-[#0c0a09]/95 border-r border-white/[0.06] flex flex-col shrink-0 select-none z-20 backdrop-blur-2xl">
      {/* Chat Header */}
      <div className="p-4 bg-[#0e0c0b] border-b border-white/[0.06] flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-orange-500 to-rose-500 flex items-center justify-center shadow-lg shadow-orange-500/20">
            <Sparkles className="w-3.5 h-3.5 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-bold text-white tracking-tight">
              Lovable
            </span>
            <span className="text-[10px] text-orange-400/70 font-mono">
              AI Agent
            </span>
          </div>
        </div>

        {isStreaming && (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-[10px] text-orange-300 animate-pulse font-medium">
            <Loader2 className="w-3 h-3 animate-spin" />
            <span>Building...</span>
          </div>
        )}
      </div>

      {/* Messages List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs select-text">
        {messages.map((m, idx) => {
          const isUser = m.role === "user";
          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className={`flex gap-2.5 ${isUser ? "flex-row-reverse" : "flex-row"}`}
            >
              {/* Avatar */}
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                  isUser
                    ? "bg-gradient-to-tr from-orange-500 to-amber-500 text-white shadow-md"
                    : "bg-orange-500/10 border border-orange-500/20 text-orange-400"
                }`}
              >
                {isUser ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
              </div>

              {/* Message Bubble */}
              <div className="flex flex-col max-w-[85%] gap-2">
                <div
                  className={`group relative p-3.5 rounded-2xl leading-relaxed ${
                    isUser
                      ? "bg-[#1c1917] text-white rounded-tr-none border border-white/[0.06]"
                      : "bg-[#0e0c0b] text-slate-200 border border-white/[0.05] rounded-tl-none"
                  }`}
                >
                  <div className="whitespace-pre-wrap font-sans text-xs leading-relaxed">
                    {m.content}
                  </div>

                  {!isUser && (
                    <button
                      onClick={() => copyMessage(m.content, idx)}
                      className="opacity-0 group-hover:opacity-100 absolute -bottom-2 right-2 p-1 rounded-lg bg-black/70 border border-white/10 text-slate-400 hover:text-white transition-all text-[10px]"
                      title="Copy message"
                    >
                      {copiedIndex === idx ? (
                        <Check className="w-3 h-3 text-emerald-400" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </button>
                  )}
                </div>

                {/* File Changes Block (Antigravity-style) */}
                {!isUser && m.fileChanges && m.fileChanges.length > 0 && (
                  <div className="flex flex-col gap-1.5 mt-1">
                    {/* Accept All / Reject All bar */}
                    {!m.allAccepted && !m.allRejected && (
                      <div className="flex items-center justify-between px-1 py-1">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                          {m.fileChanges.length} file{m.fileChanges.length > 1 ? "s" : ""} changed
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleAcceptAll(idx)}
                            className="text-[10px] font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 px-2 py-0.5 rounded-md hover:bg-emerald-500/10 transition-colors"
                          >
                            <CheckCircle2 className="w-3 h-3" /> Accept All
                          </button>
                          <button
                            onClick={() => handleRejectAll(idx)}
                            className="text-[10px] font-bold text-red-400 hover:text-red-300 flex items-center gap-1 px-2 py-0.5 rounded-md hover:bg-red-500/10 transition-colors"
                          >
                            <XCircle className="w-3 h-3" /> Reject All
                          </button>
                        </div>
                      </div>
                    )}

                    {m.allAccepted && (
                      <div className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-[10px] font-bold text-emerald-300">All changes accepted</span>
                      </div>
                    )}

                    {m.allRejected && (
                      <div className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg bg-red-500/10 border border-red-500/20">
                        <XCircle className="w-3.5 h-3.5 text-red-400" />
                        <span className="text-[10px] font-bold text-red-300">All changes rejected</span>
                      </div>
                    )}

                    {!m.allAccepted && !m.allRejected &&
                      m.fileChanges.map((fc, fci) => (
                        <FileChangeCard key={fci} change={fc} />
                      ))
                    }
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}

        {/* Real-time Tool Activity Floating Indicator */}
        <AnimatePresence>
          {toolActivity && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="flex items-center gap-2.5 p-3 rounded-2xl bg-orange-500/8 border border-orange-500/15 text-orange-300 text-xs"
            >
              <Wrench className="w-3.5 h-3.5 animate-spin text-orange-400 shrink-0" />
              <span className="font-medium text-[11px]">{toolActivity}</span>
            </motion.div>
          )}
        </AnimatePresence>

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Prompts */}
      {!isStreaming && messages.length <= 2 && (
        <div className="px-4 pb-3 flex flex-col gap-1.5">
          <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
            Quick Prompts
          </span>
          <div className="flex flex-col gap-1.5">
            {quickPrompts.map((p, i) => (
              <motion.button
                key={i}
                whileHover={{ scale: 1.01, x: 2 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => handleSend(p)}
                className="text-left p-2 rounded-xl bg-white/[0.02] hover:bg-white/[0.05] border border-white/[0.04] text-[11px] text-slate-300 hover:text-white truncate transition-all flex items-center gap-2"
              >
                <Zap className="w-3 h-3 text-orange-400 shrink-0" />
                <span className="truncate">{p}</span>
              </motion.button>
            ))}
          </div>
        </div>
      )}

      {/* Floating Capsule Input */}
      <div className="p-3.5 bg-[#0e0c0b] border-t border-white/[0.06]">
        <div className="flex items-center gap-1.5 mb-2">
          <span className="text-[10px] text-slate-500 flex items-center gap-1">
            <FileCode2 className="w-3 h-3" /> Code
          </span>
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="relative flex items-center rounded-2xl bg-[#1c1917] border border-white/[0.08] p-1 focus-within:border-orange-500/30 transition-all duration-300"
        >
          <input
            type="text"
            placeholder="Ask Lovable..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isStreaming}
            className="flex-1 px-3 py-2 bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none disabled:opacity-50 font-sans"
          />

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            disabled={isStreaming || !input.trim()}
            className="p-2 rounded-xl bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-400 hover:to-rose-400 text-white transition-all shadow-md shadow-orange-500/25 disabled:opacity-30 disabled:cursor-not-allowed shrink-0"
            title="Send"
          >
            <Send className="w-3.5 h-3.5" />
          </motion.button>
        </form>
      </div>
    </div>
  );
}
