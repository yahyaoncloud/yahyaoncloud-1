import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Check, Copy, ExternalLink } from "lucide-react";
import MermaidViewer from "./MermaidViewer";

interface MarkdownViewerProps {
  content: string;
  className?: string;
}

function CodeBlock({
  node,
  inline,
  className,
  children,
  ...props
}: {
  node?: unknown;
  inline?: boolean;
  className?: string;
  children?: React.ReactNode;
}) {
  const match = /language-(\w+)/.exec(className || "");
  const lang = match ? match[1] : "";
  const codeString = String(children).replace(/\n$/, "");
  const [copied, setCopied] = useState(false);

  if (lang === "mermaid") {
    return <MermaidViewer chart={codeString} />;
  }

  if (inline) {
    return (
      <code
        className="px-1.5 py-0.5 rounded-md text-xs font-mono bg-zinc-100 dark:bg-zinc-800/80 text-indigo-600 dark:text-indigo-400 border border-zinc-200/60 dark:border-zinc-700/60"
        {...props}
      >
        {children}
      </code>
    );
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(codeString);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  return (
    <div className="relative group my-5 rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-zinc-950 text-zinc-100 shadow-sm">
      <div className="flex items-center justify-between px-4 py-2 bg-zinc-900 border-b border-zinc-800 text-xs text-zinc-400 font-mono">
        <span className="uppercase text-[10px] tracking-wider text-zinc-400 font-medium">
          {lang || "code"}
        </span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-2 py-1 rounded-md text-[11px] text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
          aria-label="Copy code"
        >
          {copied ? (
            <>
              <Check size={12} className="text-emerald-400" />
              <span className="text-emerald-400">Copied</span>
            </>
          ) : (
            <>
              <Copy size={12} />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      <pre className="p-4 text-xs sm:text-sm font-mono overflow-x-auto leading-relaxed text-zinc-200 custom-scroll">
        <code>{codeString}</code>
      </pre>
    </div>
  );
}

export default function MarkdownViewer({ content, className = "" }: MarkdownViewerProps) {
  return (
    <div className={`prose dark:prose-invert max-w-none text-zinc-700 dark:text-zinc-300 ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          code: CodeBlock,
          h1: ({ children }) => (
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 mt-10 mb-4 pb-2 border-b border-zinc-200/80 dark:border-zinc-800">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100 mt-8 mb-3">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-lg sm:text-xl font-medium tracking-tight text-zinc-900 dark:text-zinc-100 mt-6 mb-2">
              {children}
            </h3>
          ),
          p: ({ children }) => (
            <p className="text-sm sm:text-base leading-relaxed text-zinc-600 dark:text-zinc-300 my-4">
              {children}
            </p>
          ),
          ul: ({ children }) => (
            <ul className="list-disc pl-5 my-4 space-y-1.5 text-sm sm:text-base text-zinc-600 dark:text-zinc-300">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal pl-5 my-4 space-y-1.5 text-sm sm:text-base text-zinc-600 dark:text-zinc-300">
              {children}
            </ol>
          ),
          li: ({ children }) => <li className="leading-relaxed">{children}</li>,
          blockquote: ({ children }) => (
            <blockquote className="my-5 pl-4 border-l-2 border-indigo-500 italic text-zinc-600 dark:text-zinc-400 bg-zinc-50/50 dark:bg-zinc-900/20 py-2 rounded-r-lg">
              {children}
            </blockquote>
          ),
          a: ({ href, children }) => {
            const isExternal = href?.startsWith("http");
            return (
              <a
                href={href}
                target={isExternal ? "_blank" : undefined}
                rel={isExternal ? "noreferrer noopener" : undefined}
                className="inline-flex items-center gap-1 font-medium text-indigo-600 dark:text-indigo-400 hover:underline transition-colors"
              >
                <span>{children}</span>
                {isExternal && <ExternalLink size={12} className="inline opacity-70" />}
              </a>
            );
          },
          hr: () => <hr className="my-8 border-zinc-200 dark:border-zinc-800" />,
          table: ({ children }) => (
            <div className="my-6 overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800">
              <table className="min-w-full divide-y divide-zinc-200 dark:divide-zinc-800 text-xs sm:text-sm">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="bg-zinc-50 dark:bg-zinc-900/70 text-zinc-900 dark:text-zinc-100 font-semibold">
              {children}
            </thead>
          ),
          tbody: ({ children }) => (
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800/60 bg-transparent">
              {children}
            </tbody>
          ),
          tr: ({ children }) => <tr className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/30">{children}</tr>,
          th: ({ children }) => <th className="px-4 py-3 text-left font-medium">{children}</th>,
          td: ({ children }) => <td className="px-4 py-3 text-zinc-600 dark:text-zinc-300">{children}</td>,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
