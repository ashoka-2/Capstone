import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  Send,
  Sparkles,
  Bot,
  User,
  Loader2,
  Copy,
  Check,
  RotateCcw,
  CheckCircle2,
  XCircle,
  FileCode2,
  FilePlus2,
  FileX2,
  ChevronDown,
  ChevronRight,
  BookOpen,
  Eye,
  PanelLeftClose,
  PanelLeft,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import {
  saveSnapshot,
  setPendingChanges,
  acceptFileChange,
  rejectFileChange,
  clearAllPendingChangesForMessage,
} from "../State/sandbox.slice.js";
import { sandboxService } from "../Services/sandbox.api.js";
import { connectorService } from "../../Dashboard/Services/connector.api.js";
import { addToast } from "../../../utils/toast.slice.js";
import CodeBlock from "../../../Components/CodeBlock.jsx";

/* ── Individual File Change Card ── */
function FileChangeCard({ change, onAccept, onReject }) {
  const [status, setStatus] = useState("pending");

  const typeConfig = {
    created: {
      icon: FilePlus2,
      label: "Created",
      color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30",
    },
    updated: {
      icon: FileCode2,
      label: "Modified",
      color: "text-[#ff7e40] bg-[#ff7e40]/10 border-[#ff7e40]/30",
    },
    deleted: {
      icon: FileX2,
      label: "Deleted",
      color: "text-red-400 bg-red-500/10 border-red-500/30",
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
    <div className="flex items-center justify-between p-2 rounded-xl bg-neutral-900/80 border border-neutral-800 text-xs font-mono transition-all">
      <div className="flex items-center gap-2 min-w-0 pr-2">
        <Icon className="w-3.5 h-3.5 shrink-0 text-neutral-400" />
        <span className="truncate text-neutral-200">{change.path.replace(/^\/app\//, "")}</span>
        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border uppercase ${cfg.color}`}>
          {cfg.label}
        </span>
      </div>

      <div className="flex items-center gap-1 shrink-0">
        {status === "pending" ? (
          <>
            <button
              onClick={handleAccept}
              className="p-1 rounded hover:bg-[#ff5a5f]/20 text-[#ff7e40] transition-colors"
              title="Accept change"
            >
              <Check className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleReject}
              className="p-1 rounded hover:bg-red-500/20 text-red-400 transition-colors"
              title="Reject & Revert file"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </>
        ) : status === "accepted" ? (
          <span className="flex items-center gap-1 text-[10px] text-[#ff7e40] px-1.5 py-0.5">
            <CheckCircle2 className="w-3 h-3" /> Accepted
          </span>
        ) : (
          <span className="flex items-center gap-1 text-[10px] text-red-400 px-1.5 py-0.5">
            <XCircle className="w-3 h-3" /> Reverted
          </span>
        )}
      </div>
    </div>
  );
}

/* ── Main AiChat Component ── */
export default function AiChat({
  projectId,
  initialPrompt,
  onFilesChanged,
  collapsed = false,
  onToggleCollapse,
  width = 380,
}) {
  const dispatch = useDispatch();
  const activeSandbox = useSelector((state) => state.sandbox.activeSandbox);
  const agentBase = activeSandbox?.agentBase;

  const [messages, setMessages] = useState([
    {
      id: "welcome",
      role: "assistant",
      content:
        "Hello Ashok! I am **Lovable AI**. I can read your code files, create components, refactor pages, and build fullstack features. What would you like to build?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [toolActivity, setToolActivity] = useState(null);
  const [currentReadingFiles, setCurrentReadingFiles] = useState([]);
  const [currentUpdatedFiles, setCurrentUpdatedFiles] = useState([]);

  const messagesEndRef = useRef(null);
  const hasTriggeredInitialRef = useRef(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, toolActivity, currentReadingFiles]);

  // Capture snapshot before invocation
  const captureWorkspaceSnapshot = async () => {
    if (!agentBase) return null;
    try {
      const files = await sandboxService.listFiles(agentBase);
      if (!files || files.length === 0) return {};
      const data = await sandboxService.readFiles(agentBase, files);
      const snapshot = {};
      if (data && Array.isArray(data.files)) {
        data.files.forEach((f) => {
          const key = Object.keys(f)[0];
          if (key) snapshot[key] = f[key];
        });
      }
      return snapshot;
    } catch (err) {
      console.warn("Could not capture snapshot:", err);
      return null;
    }
  };

  const handleSend = useCallback(
    async (customPrompt) => {
      const text = (customPrompt || input).trim();
      if (!text || isStreaming) return;

      setInput("");
      const messageId = `msg-${Date.now()}`;
      const userMessage = { id: `u-${Date.now()}`, role: "user", content: text };

      setMessages((prev) => [...prev, userMessage]);
      setIsStreaming(true);
      setToolActivity("Container pod active. Capturing workspace snapshot...");
      setCurrentReadingFiles([]);
      setCurrentUpdatedFiles([]);

      const snapshot = await captureWorkspaceSnapshot();
      if (snapshot) {
        dispatch(saveSnapshot({ messageId, filesMap: snapshot }));
      }

      setToolActivity("Initializing AI agent...");

      try {
        const connectorContext = connectorService.getConnectedToolsPromptContext();
        const outboundMessage = connectorContext ? `${text}\n${connectorContext}` : text;

        const response = await fetch("/api/ai/invoke", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: outboundMessage, projectId }),
        });

        if (!response.ok) {
          throw new Error(`Agent request failed with status ${response.status}`);
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let assistantText = "";
        const readFilesSet = new Set();
        const updatedFilesSet = new Set();

        setMessages((prev) => [
          ...prev,
          {
            id: messageId,
            role: "assistant",
            content: "Starting task execution...",
            isStreamingNow: true,
            snapshot,
            readingFiles: [],
            updatedFiles: [],
          },
        ]);

        while (true) {
          const { value, done } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });

          // Parse reading files
          const readMatch = chunk.match(/Reading files\.\.\.([^\n]+)/);
          if (readMatch && readMatch[1]) {
            const files = readMatch[1].split(",").map((f) => f.trim()).filter(Boolean);
            files.forEach((f) => readFilesSet.add(f));
            setCurrentReadingFiles(Array.from(readFilesSet));
            setToolActivity(`Inspecting ${files.length} file(s)...`);
          }

          // Parse updating files
          const updateMatch = chunk.match(/Updating files\.\.\.([^\n]+)/);
          if (updateMatch && updateMatch[1]) {
            const files = updateMatch[1].split(",").map((f) => f.trim()).filter(Boolean);
            files.forEach((f) => updatedFilesSet.add(f));
            setCurrentUpdatedFiles(Array.from(updatedFilesSet));
            setToolActivity(`Writing changes to ${files.length} file(s)...`);
          }

          if (chunk.includes("Files updated successfully")) {
            setToolActivity("Files updated in container sandbox.");
          }

          assistantText += chunk;

          setMessages((prev) => {
            const copy = [...prev];
            const last = copy[copy.length - 1];
            if (last && last.id === messageId) {
              copy[copy.length - 1] = {
                ...last,
                content: assistantText,
                readingFiles: Array.from(readFilesSet),
                updatedFiles: Array.from(updatedFilesSet),
                isStreamingNow: true,
              };
            }
            return copy;
          });
        }

        const finalText =
          assistantText.trim() ||
          "Task completed successfully! Files have been updated in the sandbox.";

        const fileChanges = Array.from(updatedFilesSet).map((path) => {
          const isNew = !snapshot || !snapshot[path];
          return {
            path,
            type: isNew ? "created" : "updated",
            previousContent: snapshot ? snapshot[path] : null,
          };
        });

        if (fileChanges.length > 0) {
          dispatch(
            setPendingChanges({
              messageId,
              changes: fileChanges.map((c) => ({
                filePath: c.path,
                previousContent: c.previousContent,
              })),
            })
          );
        }

        setMessages((prev) => {
          const copy = [...prev];
          const last = copy[copy.length - 1];
          if (last && last.id === messageId) {
            copy[copy.length - 1] = {
              ...last,
              content: finalText,
              isStreamingNow: false,
              readingFiles: Array.from(readFilesSet),
              updatedFiles: Array.from(updatedFilesSet),
              fileChanges: fileChanges.length > 0 ? fileChanges : null,
              status: "pending_review",
            };
          }
          return copy;
        });

        onFilesChanged?.();
      } catch (err) {
        setMessages((prev) => [
          ...prev,
          {
            id: `err-${Date.now()}`,
            role: "assistant",
            content: `⚠️ **Error:** ${err.message}`,
          },
        ]);
      } finally {
        setIsStreaming(false);
        setToolActivity(null);
      }
    },
    [input, isStreaming, onFilesChanged, projectId, agentBase, dispatch]
  );

  const handleAcceptAll = (messageId) => {
    dispatch(clearAllPendingChangesForMessage({ messageId }));
    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === messageId ? { ...msg, status: "accepted" } : msg
      )
    );
    dispatch(
      addToast({
        message: "Accepted all file updates!",
        type: "success",
      })
    );
  };

  const handleRejectAll = async (msg) => {
    if (!agentBase || !msg.snapshot) {
      dispatch(
        addToast({
          message: "No snapshot available to rollback.",
          type: "error",
        })
      );
      return;
    }

    try {
      const updates = [];
      const deletions = [];

      (msg.updatedFiles || []).forEach((filePath) => {
        if (msg.snapshot[filePath] !== undefined) {
          updates.push({
            file: filePath,
            content: msg.snapshot[filePath],
          });
        } else {
          deletions.push(filePath);
        }
      });

      if (updates.length > 0) {
        await sandboxService.updateFiles(agentBase, updates);
      }
      if (deletions.length > 0) {
        await sandboxService.deleteFiles(agentBase, deletions);
      }

      dispatch(clearAllPendingChangesForMessage({ messageId: msg.id }));
      setMessages((prev) =>
        prev.map((m) =>
          m.id === msg.id ? { ...m, status: "rejected" } : m
        )
      );

      dispatch(
        addToast({
          message: "Reverted code changes back to previous version.",
          type: "info",
        })
      );

      onFilesChanged?.();
    } catch (err) {
      dispatch(
        addToast({
          message: `Revert failed: ${err.message}`,
          type: "error",
        })
      );
    }
  };

  const handleAcceptFile = (change) => {
    dispatch(acceptFileChange({ filePath: change.path }));
    dispatch(
      addToast({
        message: `Accepted changes in ${change.path.replace(/^\/app\//, "")}`,
        type: "success",
      })
    );
  };

  const handleRejectFile = async (change, msg) => {
    if (!agentBase) return;
    try {
      if (change.previousContent !== null && change.previousContent !== undefined) {
        await sandboxService.updateFiles(agentBase, [
          { file: change.path, content: change.previousContent },
        ]);
      } else {
        await sandboxService.deleteFiles(agentBase, [change.path]);
      }
      dispatch(rejectFileChange({ filePath: change.path }));
      dispatch(
        addToast({
          message: `Reverted ${change.path.replace(/^\/app\//, "")}`,
          type: "info",
        })
      );
      onFilesChanged?.();
    } catch (err) {
      dispatch(
        addToast({
          message: `Failed to revert file: ${err.message}`,
          type: "error",
        })
      );
    }
  };

  useEffect(() => {
    if (initialPrompt && !hasTriggeredInitialRef.current) {
      hasTriggeredInitialRef.current = true;
      handleSend(initialPrompt);
    }
  }, [initialPrompt, handleSend]);

  return (
    <div
      style={{ width: `${width}px` }}
      className="h-full flex flex-col bg-card border-r border-subtle shrink-0 select-none z-20 transition-colors duration-200"
    >
      {/* Chat Header */}
      <div className="h-12 px-4 border-b border-subtle flex items-center justify-between bg-aside">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-[#ff5a5f] to-[#ff7e40] flex items-center justify-center text-white shadow-sm shadow-[#ff5a5f]/20">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-semibold text-main">Lovable AI</span>
            <span className="text-[10px] text-sub font-mono">Sunset Studio Agent</span>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {onToggleCollapse && (
            <button
              onClick={onToggleCollapse}
              className="p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-neutral-800 text-sub hover:text-main transition-colors"
              title="Collapse chat panel"
            >
              <PanelLeftClose className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Messages Feed */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 font-sans text-xs bg-card">
        {messages.map((msg, idx) => {
          const isUser = msg.role === "user";
          return (
            <div
              key={msg.id || idx}
              className={`flex flex-col ${isUser ? "items-end" : "items-start"}`}
            >
              <div
                className={`max-w-[92%] p-3.5 rounded-2xl leading-relaxed shadow-md ${
                  isUser
                    ? "bg-gradient-to-r from-[#ff5a5f] to-[#ff7e40] text-white rounded-br-none shadow-[#ff5a5f]/20"
                    : "bg-panel text-main border border-subtle rounded-bl-none shadow-sm"
                }`}
              >
                {!isUser && (
                  <div className="flex items-center gap-1.5 mb-2 text-[11px] font-semibold text-[#ff7e40]">
                    <Bot className="w-3.5 h-3.5" />
                    <span>Lovable Agent</span>
                  </div>
                )}

                <div className="prose prose-invert prose-xs max-w-none break-words">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      code({ node, inline, className, children, ...props }) {
                        const match = /language-(\w+)/.exec(className || "");
                        const codeString = String(children).replace(/\n$/, "");
                        if (!inline && match) {
                          return (
                            <CodeBlock
                              language={match[1]}
                              value={codeString}
                            />
                          );
                        }
                        return (
                          <code
                            className="bg-neutral-800 px-1.5 py-0.5 rounded text-[11px] text-[#ff7e40] font-mono"
                            {...props}
                          >
                            {children}
                          </code>
                        );
                      },
                    }}
                  >
                    {msg.content}
                  </ReactMarkdown>
                </div>

                {/* ── Files Read One-by-One Indicator ── */}
                {msg.readingFiles && msg.readingFiles.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-neutral-800/80">
                    <div className="flex items-center gap-1.5 text-[10px] font-mono text-neutral-400 uppercase tracking-wider mb-2">
                      <BookOpen className="w-3 h-3 text-[#ff7e40]" />
                      <span>Files Inspected ({msg.readingFiles.length})</span>
                    </div>
                    <div className="flex flex-col space-y-1">
                      {msg.readingFiles.map((f, i) => (
                        <motion.div
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.05 }}
                          key={i}
                          className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-neutral-900 border border-neutral-800 text-[11px] font-mono text-neutral-300"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-[#ff7e40]" />
                          <span className="truncate">{f.replace(/^\/app\//, "")}</span>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}

                {/* ── Changed Files with Accept / Reject ── */}
                {msg.fileChanges && msg.fileChanges.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-neutral-800/80 space-y-2">
                    <div className="flex items-center justify-between text-[11px] text-neutral-400">
                      <span className="font-semibold text-neutral-300">
                        Modified Files ({msg.fileChanges.length})
                      </span>
                    </div>

                    <div className="space-y-1.5">
                      {msg.fileChanges.map((change, i) => (
                        <FileChangeCard
                          key={i}
                          change={change}
                          onAccept={() => handleAcceptFile(change)}
                          onReject={() => handleRejectFile(change, msg)}
                        />
                      ))}
                    </div>

                    {/* Bulk Accept / Reject Buttons */}
                    {msg.status === "pending_review" && (
                      <div className="flex items-center gap-2 pt-2">
                        <button
                          onClick={() => handleAcceptAll(msg.id)}
                          className="flex-1 py-1.5 px-3 rounded-xl bg-gradient-to-r from-[#ff5a5f] to-[#ff7e40] hover:opacity-90 text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-md shadow-[#ff5a5f]/20 transition-all"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Accept All</span>
                        </button>
                        <button
                          onClick={() => handleRejectAll(msg)}
                          className="flex-1 py-1.5 px-3 rounded-xl bg-neutral-800 hover:bg-red-500/20 hover:text-red-400 text-neutral-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Reject All & Revert</span>
                        </button>
                      </div>
                    )}

                    {msg.status === "accepted" && (
                      <div className="text-center py-1 text-[11px] text-[#ff7e40] font-medium flex items-center justify-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        All changes accepted
                      </div>
                    )}

                    {msg.status === "rejected" && (
                      <div className="text-center py-1 text-[11px] text-red-400 font-medium flex items-center justify-center gap-1">
                        <XCircle className="w-3.5 h-3.5" />
                        Changes reverted to previous snapshot
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {isStreaming && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 p-2.5 rounded-xl bg-aside border border-subtle text-xs text-sub font-mono shadow-sm"
          >
            <Loader2 className="w-3.5 h-3.5 animate-spin text-[#ff7e40]" />
            <span className="truncate">{toolActivity || "Agent thinking..."}</span>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Box */}
      <div className="p-3 border-t border-subtle bg-aside">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2 p-1.5 rounded-xl bg-panel border border-subtle focus-within:border-[#ff5a5f]/50 transition-colors shadow-sm"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask AI to modify, add components, or fix bugs..."
            disabled={isStreaming}
            className="flex-1 bg-transparent px-2.5 py-1 text-xs text-main placeholder:text-sub focus:outline-none disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={isStreaming || !input.trim()}
            className="w-8 h-8 rounded-lg bg-gradient-to-r from-[#ff5a5f] to-[#ff7e40] hover:opacity-90 text-white flex items-center justify-center disabled:opacity-30 transition-all shadow-md shadow-[#ff5a5f]/20"
          >
            {isStreaming ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Send className="w-3.5 h-3.5" />
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
