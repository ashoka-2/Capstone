import { useMemo } from 'react';
import { marked } from 'marked';
import { FileText, Copy, Check } from 'lucide-react';
import { useState } from 'react';

// Configure marked options
marked.setOptions({
  gfm: true,
  breaks: true,
});

export const MarkdownViewer = ({ content = '', fileName = 'document.md' }) => {
  const [copied, setCopied] = useState(false);

  const html = useMemo(() => {
    try {
      return marked.parse(content || '*No content*');
    } catch {
      return '<p>Error rendering markdown</p>';
    }
  }, [content]);

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[var(--surface-2)] overflow-hidden">
      {/* Header toolbar */}
      <div className="h-10 px-4 border-b border-[var(--line)] bg-[var(--surface)] flex items-center justify-between shrink-0 text-xs">
        <div className="flex items-center gap-2 text-[var(--text-muted)] font-mono">
          <FileText className="w-3.5 h-3.5 text-blue-400" />
          <span>{fileName}</span>
          <span className="text-[10px] text-[var(--text-subtle)]">Preview</span>
        </div>

        <button
          type="button"
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-2 py-1 text-xs rounded text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--surface-2)] transition-colors cursor-pointer"
          title="Copy markdown text"
        >
          {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
          <span>{copied ? 'Copied' : 'Copy'}</span>
        </button>
      </div>

      {/* Rendered Markdown Body */}
      <div className="flex-1 overflow-y-auto p-6 md:p-8 bg-[var(--surface)] text-[var(--text)]">
        <div
          className="max-w-3xl mx-auto prose prose-invert prose-neutral text-sm leading-relaxed
            [&>h1]:text-2xl [&>h1]:font-semibold [&>h1]:tracking-tight [&>h1]:pb-2 [&>h1]:mb-4 [&>h1]:border-b [&>h1]:border-[var(--line)]
            [&>h2]:text-lg [&>h2]:font-semibold [&>h2]:mt-6 [&>h2]:mb-3 [&>h2]:pb-1 [&>h2]:border-b [&>h2]:border-[var(--line)]
            [&>h3]:text-base [&>h3]:font-medium [&>h3]:mt-4 [&>h3]:mb-2
            [&>p]:mb-4 [&>p]:text-[var(--text)] [&>p]:leading-relaxed
            [&>ul]:list-disc [&>ul]:pl-6 [&>ul]:mb-4 [&>ul]:space-y-1
            [&>ol]:list-decimal [&>ol]:pl-6 [&>ol]:mb-4 [&>ol]:space-y-1
            [&>blockquote]:pl-4 [&>blockquote]:border-l-2 [&>blockquote]:border-[var(--accent)] [&>blockquote]:italic [&>blockquote]:text-[var(--text-muted)] [&>blockquote]:my-4
            [&>pre]:p-4 [&>pre]:rounded-[var(--r-card)] [&>pre]:bg-[var(--surface-2)] [&>pre]:border [&>pre]:border-[var(--line)] [&>pre]:overflow-x-auto [&>pre]:mb-4 [&>pre]:font-mono [&>pre]:text-xs
            [&>code]:px-1.5 [&>code]:py-0.5 [&>code]:rounded [&>code]:bg-[var(--surface-2)] [&>code]:text-[var(--accent-text)] [&>code]:font-mono [&>code]:text-xs
            [&>table]:w-full [&>table]:border-collapse [&>table]:mb-4 [&>table]:text-xs
            [&>table_th]:border [&>table_th]:border-[var(--line)] [&>table_th]:p-2 [&>table_th]:bg-[var(--surface-2)] [&>table_th]:font-semibold
            [&>table_td]:border [&>table_td]:border-[var(--line)] [&>table_td]:p-2
            [&>hr]:my-6 [&>hr]:border-[var(--line)]"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </div>
    </div>
  );
};

export default MarkdownViewer;

