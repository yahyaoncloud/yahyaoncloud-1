import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Highlight, themes } from "prism-react-renderer";
import { FileCode, Terminal, Copy, Check } from "lucide-react";
import { useTheme } from "~/Contexts/ThemeContext";
import MermaidViewer from "./MermaidViewer";

interface MarkdownViewerProps {
  content: string;
  className?: string;
}

function CodeBlock({
  inline,
  className,
  children,
  ...props
}: {
  inline?: boolean;
  className?: string;
  children?: React.ReactNode;
  [key: string]: unknown;
}) {
  const { isDark } = useTheme();
  const [copied, setCopied] = useState(false);

  // 1. Extract language and filename from className (e.g. language-ts:app/routes.ts)
  let lang = "";
  let detectedFileName = "";

  const colonMatch = /language-([a-zA-Z0-9_-]+):([a-zA-Z0-9_./-]+)/.exec(className || "");
  if (colonMatch) {
    lang = colonMatch[1];
    detectedFileName = colonMatch[2];
  } else {
    const standardMatch = /language-([a-zA-Z0-9_-]+)/.exec(className || "");
    lang = standardMatch ? standardMatch[1] : "";
  }

  // 2. Check meta string (e.g. ```terraform filename="main.tf" or ```yaml docker-compose.yml)
  const meta = ((props as Record<string, unknown>).node as { data?: { meta?: string } })?.data?.meta || "";
  if (!detectedFileName && meta) {
    const metaTitleMatch = /(?:title|filename|file)=["']?([^"'\s]+)["']?/i.exec(meta);
    if (metaTitleMatch) {
      detectedFileName = metaTitleMatch[1];
    } else if (!meta.includes("=") && /^[a-zA-Z0-9_./-]+\.[a-zA-Z0-9]+$/.test(meta.trim())) {
      detectedFileName = meta.trim();
    }
  }

  let codeString = String(children).replace(/\n$/, "");

  if (lang === "mermaid") {
    return <MermaidViewer chart={codeString} />;
  }

  // 3. Extract filename from first-line comments if present (e.g. // main.tf or # terraform.tf)
  const lines = codeString.split("\n");
  if (!detectedFileName && lines.length > 1) {
    const firstLine = lines[0].trim();
    const commentFileMatch = /^(?:\/\/|#|\/\*|--)\s*(?:filename:\s*|file:\s*)?([a-zA-Z0-9_./-]+\.[a-zA-Z0-9]+)\s*(?:\*\/)?$/i.exec(firstLine);
    if (commentFileMatch) {
      detectedFileName = commentFileMatch[1];
      codeString = lines.slice(1).join("\n");
    }
  }

  // Accurately determine if this is an inline code snippet or a multi-line fenced code block
  const isInline = inline ?? (!className && !codeString.includes("\n"));

  if (isInline) {
    return (
      <code
        className="px-1.5 py-0.5 rounded text-[13px] sm:text-[13.5px] font-mono bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border border-zinc-200/60 dark:border-zinc-700/60"
        {...props}
      >
        {children}
      </code>
    );
  }

  // Display title: either the explicit file name or the language name
  const displayTitle = detectedFileName || (lang ? lang.toUpperCase() : "CODE");
  const isShell = ["bash", "sh", "zsh", "shell", "terminal", "powershell", "cmd"].includes(lang.toLowerCase());

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(codeString);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy code:", err);
    }
  };

  return (
    <div className="my-5 rounded-lg border border-zinc-800/90 bg-zinc-900 dark:bg-zinc-950 overflow-hidden shadow-xs w-full max-w-full">
      {/* Code Snippet Header with Filename & Copy Button */}
      <div className="flex items-center justify-between px-3.5 py-1.5 border-b border-zinc-800 bg-zinc-800/60 dark:bg-zinc-900/90 text-xs font-mono select-none">
        <div className="flex items-center gap-2 text-zinc-300 font-medium truncate">
          {isShell ? (
            <Terminal size={13} className="text-zinc-400 shrink-0" />
          ) : (
            <FileCode size={13} className="text-zinc-400 shrink-0" />
          )}
          <span className="truncate text-xs">{displayTitle}</span>
        </div>

        <button
          type="button"
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-2 py-0.5 rounded text-zinc-400 hover:text-zinc-100 hover:bg-zinc-700/50 transition-colors cursor-pointer"
          title="Copy code"
          aria-label="Copy code to clipboard"
        >
          {copied ? (
            <>
              <Check size={12} className="text-emerald-400" />
              <span className="text-[11px] text-emerald-400 font-sans font-medium">Copied</span>
            </>
          ) : (
            <>
              <Copy size={12} />
              <span className="text-[11px] font-sans">Copy</span>
            </>
          )}
        </button>
      </div>

      {/* Syntax Highlighted Code Content */}
      <Highlight
        theme={themes.vsDark}
        code={codeString}
        language={lang || "bash"}
      >
        {({ className: highlightClass, style, tokens, getLineProps, getTokenProps }) => (
          <pre
            className={`p-3.5 sm:p-4 overflow-x-auto font-mono text-[13px] sm:text-[13.5px] md:text-[14px] leading-relaxed text-zinc-100 custom-scroll w-full max-w-full m-0 !bg-transparent ${highlightClass}`}
            style={{ ...style, backgroundColor: "transparent" }}
          >
            <code className="block w-full !bg-transparent !p-0 !rounded-none !border-0 font-mono text-inherit whitespace-pre">
              {tokens.map((line, i) => (
                <div key={i} {...getLineProps({ line })}>
                  {line.map((token, key) => (
                    <span key={key} {...getTokenProps({ token })} />
                  ))}
                </div>
              ))}
            </code>
          </pre>
        )}
      </Highlight>
    </div>
  );
}

export default function MarkdownViewer({ content, className = "" }: MarkdownViewerProps) {
  // Strip duplicate leading title if markdown starts with '# Title'
  const sanitizedContent = content.replace(/^#\s+[^\n]+\n*/, "");

  return (
    <div className={`space-y-4 text-[15px] sm:text-base md:text-[17px] leading-relaxed text-zinc-700 dark:text-zinc-300 [&>*:first-child]:mt-0 ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          // Prevent ReactMarkdown from creating an outer redundant pre tag
          pre: ({ children }) => <>{children}</>,
          code: CodeBlock as any,
          h1: ({ children }) => (
            <h1 className="text-lg sm:text-xl md:text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 mt-6 sm:mt-7 mb-2.5 sm:mb-3 break-words">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-base sm:text-lg md:text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100 mt-5 sm:mt-6 mb-2 sm:mb-2.5 break-words">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-[15px] sm:text-base md:text-lg font-medium tracking-tight text-zinc-900 dark:text-zinc-100 mt-4 sm:mt-5 mb-1.5 sm:mb-2 break-words">
              {children}
            </h3>
          ),
          h4: ({ children }) => (
            <h4 className="text-sm sm:text-[15px] md:text-base font-medium tracking-tight text-zinc-900 dark:text-zinc-100 mt-3.5 sm:mt-4 mb-1.5 break-words">
              {children}
            </h4>
          ),
          p: ({ children }) => (
            <p className="text-[15px] sm:text-base md:text-[17px] leading-relaxed my-3 sm:my-3.5 text-zinc-700 dark:text-zinc-300 break-words">
              {children}
            </p>
          ),
          ul: ({ children }) => (
            <ul className="list-disc pl-5 my-3 sm:my-3.5 space-y-1.5 text-[15px] sm:text-base md:text-[17px] text-zinc-700 dark:text-zinc-300 marker:text-zinc-400 dark:marker:text-zinc-600">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal pl-5 my-3 sm:my-3.5 space-y-1.5 text-[15px] sm:text-base md:text-[17px] text-zinc-700 dark:text-zinc-300 marker:text-zinc-400 dark:marker:text-zinc-600">
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className="leading-relaxed text-[15px] sm:text-base md:text-[17px] my-0.5 text-zinc-700 dark:text-zinc-300 break-words">{children}</li>
          ),
          blockquote: ({ children }) => (
            <blockquote className="my-3 sm:my-4 pl-3 sm:pl-3.5 border-l-2 border-zinc-300 dark:border-zinc-700 italic text-zinc-600 dark:text-zinc-400 py-0.5 text-[15px] sm:text-base md:text-[17px]">
              {children}
            </blockquote>
          ),
          img: ({ src, alt }) => (
            <span className="block my-4 overflow-hidden rounded-lg border border-zinc-200/80 dark:border-zinc-800/80">
              <img
                src={src}
                alt={alt || ""}
                loading="lazy"
                className="w-full h-auto object-cover max-h-[500px]"
              />
            </span>
          ),
          a: ({ href, children }) => {
            const isExternal = href?.startsWith("http");
            return (
              <a
                href={href}
                target={isExternal ? "_blank" : undefined}
                rel={isExternal ? "noreferrer noopener" : undefined}
                className="text-zinc-900 dark:text-zinc-100 underline decoration-zinc-300 dark:decoration-zinc-700 underline-offset-4 hover:decoration-zinc-900 dark:hover:decoration-zinc-100 transition-colors break-words"
              >
                {children}
              </a>
            );
          },
          hr: () => <hr className="my-6 sm:my-7 border-zinc-200 dark:border-zinc-800" />,
          table: ({ children }) => (
            <div className="my-4 sm:my-5 overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-800 -mx-1 sm:mx-0">
              <table className="min-w-full divide-y divide-zinc-200 dark:divide-zinc-800 text-xs sm:text-sm">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 font-semibold">
              {children}
            </thead>
          ),
          tbody: ({ children }) => (
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800 bg-transparent">
              {children}
            </tbody>
          ),
          tr: ({ children }) => <tr>{children}</tr>,
          th: ({ children }) => (
            <th className="px-2.5 sm:px-3 py-2 text-left font-medium">{children}</th>
          ),
          td: ({ children }) => (
            <td className="px-2.5 sm:px-3 py-2 text-zinc-700 dark:text-zinc-300">{children}</td>
          ),
        }}
      >
        {sanitizedContent}
      </ReactMarkdown>
    </div>
  );
}
