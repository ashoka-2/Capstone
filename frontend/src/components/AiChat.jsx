import { useState, useRef, useEffect } from "react";
import {
  Send,
  Sparkles,
  Bot,
  User,
  CheckCircle2,
  Loader2,
  Copy,
  Check,
  Code,
  Wrench,
} from "lucide-react";

export default function AiChat({ projectId, onFilesChanged }) {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Hello! I am **FrontendForge**, your autonomous AI frontend developer. Tell me what you'd like to build or modify in your project.",
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
    "Build a Retro Nokia 3310 Snake Game with score and controls",
    "Design a modern SaaS Landing page with hero & pricing cards",
    "Add responsive Navigation Bar with mobile drawer",
    "Update styling to sleek Dark Mode with glassmorphic cards",
  ];

  const handleSend = async (customPrompt) => {
    const text = (customPrompt || input).trim();
    if (!text || isStreaming) return;

    setInput("");
    const userMessage = { role: "user", content: text };
    setMessages((prev) => [...prev, userMessage]);
    setIsStreaming(true);
    setToolActivity("AI Agent analyzing workspace...");

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
        
        // Detect tool activity messages from tools.js writer
        if (chunk.includes("Listing files") || chunk.includes("Files listed")) {
          setToolActivity("Browsing workspace files...");
        } else if (chunk.includes("Reading files") || chunk.includes("Files read")) {
          setToolActivity("Inspecting file contents...");
        } else if (chunk.includes("Updating files") || chunk.includes("Files updated")) {
          setToolActivity("Writing updated code to files...");
        } else if (chunk.includes("Deleting files") || chunk.includes("Files deleted")) {
          setToolActivity("Deleting obsolete files...");
        }

        assistantText += chunk;
      }

      // Add final assistant message
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            assistantText.trim() ||
            "Task completed! I have updated your project files according to your request.",
        },
      ]);

      // Notify parent to refresh file explorer & preview
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

  const copyMessage = (text, idx) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="h-full w-80 md:w-96 bg-[#10121a] border-l border-white/10 flex flex-col shrink-0 select-none z-20">
      {/* Chat Header */}
      <div className="p-3.5 bg-[#141622] border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center">
            <Sparkles className="w-3.5 h-3.5 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-bold text-white">FrontendForge AI</span>
            <span className="text-[10px] text-cyan-400">Mistral Autonomous Agent</span>
          </div>
        </div>

        {isStreaming && (
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-[10px] text-cyan-300 animate-pulse font-medium">
            <Loader2 className="w-3 h-3 animate-spin" />
            <span>Working...</span>
          </div>
        )}
      </div>

      {/* Messages List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3.5 text-xs select-text">
        {messages.map((m, idx) => {
          const isUser = m.role === "user";
          return (
            <div
              key={idx}
              className={`flex gap-2.5 ${isUser ? "flex-row-reverse" : "flex-row"}`}
            >
              {/* Avatar */}
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
                  isUser
                    ? "bg-indigo-600 text-white"
                    : "bg-cyan-500/20 border border-cyan-500/30 text-cyan-400"
                }`}
              >
                {isUser ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
              </div>

              {/* Message Bubble */}
              <div
                className={`group relative max-w-[85%] p-3 rounded-2xl leading-relaxed ${
                  isUser
                    ? "bg-indigo-600 text-white rounded-tr-none shadow-md shadow-indigo-600/20"
                    : "bg-[#181926] text-gray-200 border border-white/5 rounded-tl-none"
                }`}
              >
                <div className="whitespace-pre-wrap">{m.content}</div>

                {/* Copy button on hover */}
                {!isUser && (
                  <button
                    onClick={() => copyMessage(m.content, idx)}
                    className="opacity-0 group-hover:opacity-100 absolute -bottom-2 right-2 p-1 rounded bg-black/60 border border-white/10 text-gray-400 hover:text-white transition-all text-[10px]"
                    title="Copy response"
                  >
                    {copiedIndex === idx ? (
                      <Check className="w-3 h-3 text-emerald-400" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                  </button>
                )}
              </div>
            </div>
          );
        })}

        {/* Real-time Tool Activity Indicator */}
        {toolActivity && (
          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-xs">
            <Wrench className="w-3.5 h-3.5 animate-spin text-cyan-400" />
            <span className="font-medium text-[11px]">{toolActivity}</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Prompts (when idle) */}
      {!isStreaming && messages.length <= 3 && (
        <div className="px-3 pb-2 flex flex-col gap-1">
          <span className="text-[10px] uppercase font-semibold text-gray-500 tracking-wider">
            Quick Prompts
          </span>
          <div className="flex flex-col gap-1">
            {quickPrompts.slice(0, 2).map((p, i) => (
              <button
                key={i}
                onClick={() => handleSend(p)}
                className="text-left p-1.5 rounded-lg bg-white/[0.03] hover:bg-white/[0.08] border border-white/5 text-[11px] text-gray-300 hover:text-white truncate transition-all"
              >
                💡 {p}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="p-3 bg-[#141622] border-t border-white/10 flex items-center gap-2"
      >
        <input
          type="text"
          placeholder="Ask AI to build or edit files..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={isStreaming}
          className="flex-1 px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all disabled:opacity-50"
        />

        <button
          type="submit"
          disabled={isStreaming || !input.trim()}
          className="p-2 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white transition-all shadow-md shadow-cyan-500/20 disabled:opacity-30 disabled:cursor-not-allowed"
          title="Send to AI Agent"
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
}
