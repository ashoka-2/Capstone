import { useState } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism/index.js";
import { Copy, Check } from "lucide-react";

export default function CodeBlock({
  language = "javascript",
  value = "",
  showLineNumbers = false,
  fileName,
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-xl overflow-hidden border border-neutral-800 bg-[#1e1e1e] my-3 shadow-lg group">
      {/* Code Block Header */}
      <div className="flex items-center justify-between px-3.5 py-1.5 bg-[#252526] border-b border-neutral-800/80 text-xs font-mono text-neutral-400 select-none">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#ff5a5f]/70" />
          <span className="text-neutral-300 font-semibold">{fileName || language}</span>
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 px-2 py-0.5 rounded hover:bg-neutral-700/60 text-neutral-400 hover:text-neutral-200 transition-colors text-[11px]"
          title="Copy code"
        >
          {copied ? (
            <>
              <Check className="w-3 h-3 text-[#ff7e40]" />
              <span className="text-[#ff7e40]">Copied</span>
            </>
          ) : (
            <>
              <Copy className="w-3 h-3" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>

      {/* Code Syntax Highlight */}
      <div className="text-xs overflow-x-auto">
        <SyntaxHighlighter
          language={language.toLowerCase()}
          style={vscDarkPlus}
          showLineNumbers={showLineNumbers}
          customStyle={{
            margin: 0,
            padding: "1rem",
            background: "#1e1e1e",
            fontSize: "0.8125rem",
            lineHeight: "1.6",
            fontFamily:
              "'JetBrains Mono', 'Fira Code', 'Cascadia Code', Menlo, Monaco, Consolas, monospace",
          }}
          codeTagProps={{
            style: {
              fontFamily: "inherit",
            },
          }}
        >
          {value}
        </SyntaxHighlighter>
      </div>
    </div>
  );
}
