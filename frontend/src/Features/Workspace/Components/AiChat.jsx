import { useState, useRef, useEffect, useCallback } from "react";
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
  Layers,
  Terminal,
} from "lucide-react";

/* ── File Change Card (Antigravity style) ── */
function FileChangeCard({ change, onAccept, onReject }) {
  const [expanded, setExpanded] = useState(false);
  const [status, setStatus] = useState("pending"); // 'pending' | 'accepted' | 'rejected'

  const typeConfig = {
    created: {
      icon: FilePlus2,
      label: "Created",
      fg: "hsl(var(--success-foreground))",
      bg: "hsl(var(--success) / 0.15)",
      border: "hsl(var(--success-foreground) / 0.25)",
      tagBg: "hsl(var(--success) / 0.25)",
    },
    updated: {
      icon: FileCode2,
      label: "Modified",
      fg: "hsl(var(--warning-foreground))",
      bg: "hsl(var(--warning) / 0.15)",
      border: "hsl(var(--warning-foreground) / 0.25)",
      tagBg: "hsl(var(--warning) / 0.25)",
    },
    deleted: {
      icon: FileX2,
      label: "Deleted",
      fg: "hsl(var(--destructive-foreground))",
      bg: "hsl(var(--destructive) / 0.15)",
      border: "hsl(var(--destructive-foreground) / 0.25)",
      tagBg: "hsl(var(--destructive) / 0.25)",
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
    <div
      className="rounded-xl overflow-hidden transition-all shadow-sm"
      style={{
        backgroundColor: cfg.bg,
        border: `1px solid ${cfg.border}`,
      }}
    >
      <div
        className="flex items-center justify-between px-3 py-2 cursor-pointer hover:opacity-85 transition-opacity"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-2 min-w-0">
          <Icon className="w-3.5 h-3.5 shrink-0" style={{ color: cfg.fg }} />
          <span
            className="text-[11px] font-mono truncate"
            style={{ color: "hsl(var(--foreground))" }}
          >
            {change.path}
          </span>
          <span
            className="text-[9px] font-bold px-1.5 py-0.5 rounded-md uppercase tracking-wider"
            style={{ backgroundColor: cfg.tagBg, color: cfg.fg }}
          >
            {cfg.label}
          </span>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {status === "pending" ? (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleAccept();
                }}
                className="p-1 rounded-md transition-colors hover:bg-emerald-500/20"
                style={{ color: "hsl(var(--muted-foreground))" }}
                title="Accept this file change"
              >
                <CheckCircle2 className="w-3.5 h-3.5 hover:text-emerald-400" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleReject();
                }}
                className="p-1 rounded-md transition-colors hover:bg-red-500/20"
                style={{ color: "hsl(var(--muted-foreground))" }}
                title="Reject this file change"
              >
                <XCircle className="w-3.5 h-3.5 hover:text-red-400" />
              </button>
            </>
          ) : status === "accepted" ? (
            <span
              className="text-[9px] font-bold flex items-center gap-0.5"
              style={{ color: "hsl(var(--success-foreground))" }}
            >
              <Check className="w-3 h-3" /> Accepted
            </span>
          ) : (
            <span
              className="text-[9px] font-bold flex items-center gap-0.5"
              style={{ color: "hsl(var(--destructive-foreground))" }}
            >
              <XCircle className="w-3 h-3" /> Rejected
            </span>
          )}

          {change.diff && (
            expanded ? (
              <ChevronDown
                className="w-3.5 h-3.5"
                style={{ color: "hsl(var(--muted-foreground))" }}
              />
            ) : (
              <ChevronRight
                className="w-3.5 h-3.5"
                style={{ color: "hsl(var(--muted-foreground))" }}
              />
            )
          )}
        </div>
      </div>

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
              <pre
                className="text-[10px] font-mono leading-[1.6] overflow-x-auto max-h-52 rounded-lg p-2.5"
                style={{
                  backgroundColor: "hsl(var(--background))",
                  border: "1px solid hsl(var(--border) / 0.5)",
                }}
              >
                {change.diff.split("\n").map((line, i) => {
                  let style = { color: "hsl(var(--muted-foreground))" };
                  if (line.startsWith("+")) {
                    style = {
                      color: "hsl(var(--success-foreground))",
                      backgroundColor: "hsl(var(--success) / 0.2)",
                    };
                  } else if (line.startsWith("-")) {
                    style = {
                      color: "hsl(var(--destructive-foreground))",
                      backgroundColor: "hsl(var(--destructive) / 0.2)",
                    };
                  }
                  return (
                    <div key={i} style={style} className="px-1 -mx-1 rounded-sm">
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

/* ── Main AiChat Component ── */
export default function AiChat({ projectId, initialPrompt, onFilesChanged }) {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Hello Ashok! I am **Lovable**, your AI fullstack developer. Tell me what application or features you'd like to build.",
    },
  ]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [toolActivity, setToolActivity] = useState(null);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const messagesEndRef = useRef(null);
  const hasTriggeredInitialRef = useRef(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, toolActivity]);

  const parseFileChanges = (text) => {
    const changes = [];
    const patterns = [
      { regex: /(?:✅\s*)?(?:Created|created|CREATED|New file|Creating)[:\s]+([^\n,]+)/g, type: "created" },
      { regex: /(?:📝\s*)?(?:Updated|updated|UPDATED|Modified|modified|Updating)[:\s]+([^\n,]+)/g, type: "updated" },
      { regex: /(?:🗑️?\s*)?(?:Deleted|deleted|DELETED|Removed|removed|Deleting)[:\s]+([^\n,]+)/g, type: "deleted" },
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

  const handleSend = useCallback(
    async (customPrompt) => {
      const text = (customPrompt || input).trim();
      if (!text || isStreaming) return;

      setInput("");
      const userMessage = { role: "user", content: text };
      setMessages((prev) => [...prev, userMessage]);
      setIsStreaming(true);
      setToolActivity("Pod container active. Initializing AI developer agent...");

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

        // Placeholder for streaming message
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: "Starting task execution...",
            isStreamingNow: true,
          },
        ]);

        while (true) {
          const { value, done } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });

          // Live tool activity status
          if (chunk.includes("Listing files") || chunk.includes("Files listed")) {
            setToolActivity("🔍 Inspecting workspace files & structure...");
          } else if (chunk.includes("Reading files") || chunk.includes("Files read")) {
            setToolActivity("📖 Reading existing code files...");
          } else if (chunk.includes("Updating files") || chunk.includes("Files updated")) {
            setToolActivity("⚡ Writing updated React code to files...");
          } else if (chunk.includes("Deleting files") || chunk.includes("Files deleted")) {
            setToolActivity("🗑️ Cleaning up obsolete files...");
          } else if (chunk.includes("Created") || chunk.includes("New file")) {
            setToolActivity("✨ Generating new components & assets...");
          }

          assistantText += chunk;

          // Update streaming message in-place
          setMessages((prev) => {
            const copy = [...prev];
            if (copy[copy.length - 1]?.role === "assistant") {
              copy[copy.length - 1] = {
                role: "assistant",
                content: assistantText,
                isStreamingNow: true,
              };
            }
            return copy;
          });
        }

        const finalText =
          assistantText.trim() ||
          "Task completed successfully! All code files have been written to the container workspace.";

        const fileChanges = parseFileChanges(finalText);

        setMessages((prev) => {
          const copy = [...prev];
          if (copy[copy.length - 1]?.role === "assistant") {
            copy[copy.length - 1] = {
              role: "assistant",
              content: finalText,
              isStreamingNow: false,
              fileChanges: fileChanges.length > 0 ? fileChanges : null,
            };
          }
          return copy;
        });

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
    },
    [input, isStreaming, messages.length, onFilesChanged, projectId]
  );

  // Auto-send prompt from Dashboard when pod is ready
  useEffect(() => {
    if (initialPrompt && !hasTriggeredInitialRef.current && projectId) {
      hasTriggeredInitialRef.current = true;
      handleSend(initialPrompt);
    }
  }, [initialPrompt, projectId, handleSend]);

  const handleAcceptAll = (idx) => {
    setMessages((prev) =>
      prev.map((m, i) =>
        i === idx ? { ...m, allAccepted: true, allRejected: false } : m
      )
    );
  };

  const handleRejectAll = (idx) => {
    setMessages((prev) =>
      prev.map((m, i) =>
        i === idx ? { ...m, allRejected: true, allAccepted: false } : m
      )
    );
  };

  const copyMessage = (text, idx) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const quickPrompts = [
    "Build a Retro Nokia 3310 Snake Game in React",
    "Create a responsive modern Landing page with hero & pricing",
  ];

  return (
    <div
      className="h-full w-80 md:w-[420px] border-r flex flex-col shrink-0 select-none z-20 backdrop-blur-2xl transition-colors"
      style={{
        backgroundColor: "hsl(var(--card) / 0.95)",
        borderColor: "hsl(var(--border) / 0.5)",
      }}
    >
      {/* Header */}
      <div
        className="p-4 border-b flex items-center justify-between"
        style={{
          backgroundColor: "hsl(var(--card))",
          borderColor: "hsl(var(--border) / 0.5)",
        }}
      >
        <div className="flex items-center gap-2.5">
          <div
            className="w-7 h-7 rounded-xl flex items-center justify-center shadow-lg"
            style={{
              background:
                "linear-gradient(135deg, hsl(var(--brand-tiger-primary)), hsl(var(--brand-flamingo-primary)))",
            }}
          >
            <Sparkles className="w-3.5 h-3.5 text-white" />
          </div>
          <div className="flex flex-col">
            <span
              className="text-xs font-bold tracking-tight"
              style={{ color: "hsl(var(--foreground))" }}
            >
              Lovable AI
            </span>
            <span
              className="text-[10px] font-mono"
              style={{ color: "hsl(var(--muted-foreground) / 0.6)" }}
            >
              Pod Connected
            </span>
          </div>
        </div>

        {isStreaming && (
          <div
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full animate-pulse text-[10px] font-medium"
            style={{
              backgroundColor: "hsl(var(--warning) / 0.25)",
              color: "hsl(var(--warning-foreground))",
              border: "1px solid hsl(var(--warning-foreground) / 0.2)",
            }}
          >
            <Loader2 className="w-3 h-3 animate-spin" />
            <span>Building files...</span>
          </div>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs select-text">
        {messages.map((m, idx) => {
          const isUser = m.role === "user";
          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              className={`flex gap-2.5 ${isUser ? "flex-row-reverse" : "flex-row"}`}
            >
              {/* Avatar */}
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 shadow-sm"
                style={
                  isUser
                    ? {
                        background:
                          "linear-gradient(135deg, hsl(var(--brand-tiger-primary)), hsl(var(--brand-saffron-primary)))",
                        color: "white",
                      }
                    : {
                        backgroundColor: "hsl(var(--accent) / 0.3)",
                        border: "1px solid hsl(var(--accent-primary) / 0.3)",
                        color: "hsl(var(--accent-primary))",
                      }
                }
              >
                {isUser ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
              </div>

              <div className="flex flex-col max-w-[85%] gap-2">
                {/* Bubble */}
                <div
                  className={`group relative p-3.5 rounded-2xl leading-relaxed shadow-sm ${
                    isUser ? "rounded-tr-none" : "rounded-tl-none"
                  }`}
                  style={{
                    backgroundColor: isUser ? "hsl(var(--muted))" : "hsl(var(--card))",
                    color: "hsl(var(--foreground))",
                    border: `1px solid hsl(var(--border) / 0.6)`,
                  }}
                >
                  <div className="whitespace-pre-wrap font-sans text-xs leading-relaxed">
                    {m.content}
                  </div>

                  {m.isStreamingNow && (
                    <span className="inline-block w-1.5 h-3.5 bg-orange-400 ml-1 animate-pulse" />
                  )}

                  {!isUser && !m.isStreamingNow && (
                    <button
                      onClick={() => copyMessage(m.content, idx)}
                      className="opacity-0 group-hover:opacity-100 absolute -bottom-2 right-2 p-1 rounded-lg transition-all text-[10px] shadow-sm"
                      style={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        color: "hsl(var(--muted-foreground))",
                      }}
                      title="Copy response"
                    >
                      {copiedIndex === idx ? (
                        <Check
                          className="w-3 h-3"
                          style={{ color: "hsl(var(--success-foreground))" }}
                        />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </button>
                  )}
                </div>

                {/* File Changes Cards */}
                {!isUser && m.fileChanges && m.fileChanges.length > 0 && (
                  <div className="flex flex-col gap-1.5 mt-1">
                    {!m.allAccepted && !m.allRejected && (
                      <div className="flex items-center justify-between px-1 py-1">
                        <span
                          className="text-[10px] font-bold uppercase tracking-wider"
                          style={{ color: "hsl(var(--muted-foreground) / 0.7)" }}
                        >
                          {m.fileChanges.length} file{m.fileChanges.length > 1 ? "s" : ""} changed
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleAcceptAll(idx)}
                            className="text-[10px] font-bold flex items-center gap-1 px-2 py-0.5 rounded-md transition-colors"
                            style={{ color: "hsl(var(--success-foreground))" }}
                          >
                            <CheckCircle2 className="w-3 h-3" /> Accept All
                          </button>
                          <button
                            onClick={() => handleRejectAll(idx)}
                            className="text-[10px] font-bold flex items-center gap-1 px-2 py-0.5 rounded-md transition-colors"
                            style={{ color: "hsl(var(--destructive-foreground))" }}
                          >
                            <XCircle className="w-3 h-3" /> Reject All
                          </button>
                        </div>
                      </div>
                    )}

                    {m.allAccepted && (
                      <div
                        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg"
                        style={{
                          backgroundColor: "hsl(var(--success) / 0.2)",
                          border: "1px solid hsl(var(--success-foreground) / 0.3)",
                        }}
                      >
                        <CheckCircle2
                          className="w-3.5 h-3.5"
                          style={{ color: "hsl(var(--success-foreground))" }}
                        />
                        <span
                          className="text-[10px] font-bold"
                          style={{ color: "hsl(var(--success-foreground))" }}
                        >
                          All changes accepted
                        </span>
                      </div>
                    )}

                    {m.allRejected && (
                      <div
                        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg"
                        style={{
                          backgroundColor: "hsl(var(--destructive) / 0.2)",
                          border: "1px solid hsl(var(--destructive-foreground) / 0.3)",
                        }}
                      >
                        <XCircle
                          className="w-3.5 h-3.5"
                          style={{ color: "hsl(var(--destructive-foreground))" }}
                        />
                        <span
                          className="text-[10px] font-bold"
                          style={{ color: "hsl(var(--destructive-foreground))" }}
                        >
                          All changes rejected
                        </span>
                      </div>
                    )}

                    {!m.allAccepted &&
                      !m.allRejected &&
                      m.fileChanges.map((fc, fci) => (
                        <FileChangeCard key={fci} change={fc} />
                      ))}
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}

        {/* Streaming Tool Activity Floating Indicator */}
        <AnimatePresence>
          {toolActivity && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="flex items-center gap-2.5 p-3 rounded-2xl text-xs shadow-sm"
              style={{
                backgroundColor: "hsl(var(--warning) / 0.15)",
                border: "1px solid hsl(var(--warning-foreground) / 0.25)",
                color: "hsl(var(--warning-foreground))",
              }}
            >
              <Wrench className="w-3.5 h-3.5 animate-spin shrink-0" />
              <span className="font-medium text-[11px]">{toolActivity}</span>
            </motion.div>
          )}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Prompts */}
      {!isStreaming && messages.length <= 2 && (
        <div className="px-4 pb-3 flex flex-col gap-1.5">
          <span
            className="text-[10px] uppercase font-bold tracking-wider"
            style={{ color: "hsl(var(--muted-foreground) / 0.5)" }}
          >
            Quick Prompts
          </span>
          <div className="flex flex-col gap-1.5">
            {quickPrompts.map((p, i) => (
              <motion.button
                key={i}
                whileHover={{ scale: 1.01, x: 2 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => handleSend(p)}
                className="text-left p-2 rounded-xl border text-[11px] truncate transition-all flex items-center gap-2"
                style={{
                  backgroundColor: "hsl(var(--muted) / 0.2)",
                  borderColor: "hsl(var(--border) / 0.3)",
                  color: "hsl(var(--muted-foreground))",
                }}
              >
                <Zap
                  className="w-3 h-3 shrink-0"
                  style={{ color: "hsl(var(--brand-tiger-primary))" }}
                />
                <span className="truncate">{p}</span>
              </motion.button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div
        className="p-3.5 border-t"
        style={{
          backgroundColor: "hsl(var(--card))",
          borderColor: "hsl(var(--border) / 0.5)",
        }}
      >
        <div className="flex items-center gap-1.5 mb-2">
          <span
            className="text-[10px] flex items-center gap-1 font-medium"
            style={{ color: "hsl(var(--muted-foreground) / 0.6)" }}
          >
            <FileCode2 className="w-3 h-3" /> Code & Design
          </span>
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="relative flex items-center rounded-2xl border p-1 transition-all duration-300"
          style={{
            backgroundColor: "hsl(var(--muted) / 0.3)",
            borderColor: "hsl(var(--border))",
          }}
        >
          <input
            type="text"
            placeholder="Ask Lovable to edit code, add features..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isStreaming}
            className="flex-1 px-3 py-2 bg-transparent text-xs focus:outline-none disabled:opacity-50 font-sans"
            style={{ color: "hsl(var(--foreground))" }}
          />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            disabled={isStreaming || !input.trim()}
            className="p-2 rounded-xl text-white transition-all shadow-md disabled:opacity-30 disabled:cursor-not-allowed shrink-0"
            style={{
              background:
                "linear-gradient(135deg, hsl(var(--brand-tiger-primary)), hsl(var(--brand-flamingo-primary)))",
            }}
          >
            <Send className="w-3.5 h-3.5" />
          </motion.button>
        </form>
      </div>
    </div>
  );
}
