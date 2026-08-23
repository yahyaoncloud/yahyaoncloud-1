import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Highlight, themes } from "prism-react-renderer";
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
}) {
  const match = /language-(\w+)/.exec(className || "");
  const lang = match ? match[1] : "";
  const codeString = String(children).replace(/\n$/, "");

  if (lang === "mermaid") {
    return <MermaidViewer chart={codeString} />;
  }

  if (inline) {
    return (
      <code
        className="px-1.5 py-0.5 rounded text-[15px] font-mono bg-zinc-100 dark:bg-zinc-800/80 text-zinc-800 dark:text-zinc-200 border border-zinc-200/50 dark:border-zinc-700/50"
        {...props}
      >
        {children}
      </code>
    );
  }

  // Syntax Highlighted snippet with NO header bar / copy header
  return (
    <Highlight
      theme={themes.vsDark}
      code={codeString}
      language={lang || "bash"}
    >
      {({ className: highlightClass, style, tokens, getLineProps, getTokenProps }) => (
        <pre
          className={`p-4 rounded-lg overflow-x-auto font-mono text-[14px] md:text-[15px] leading-relaxed my-5 border border-zinc-200/60 dark:border-zinc-800 bg-zinc-950 text-zinc-100 custom-scroll ${highlightClass}`}
          style={{ ...style, backgroundColor: undefined }}
        >
          <code className="block">
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
  );
}

export default function MarkdownViewer({ content, className = "" }: MarkdownViewerProps) {
  return (
    <div className={`space-y-4 text-[17px] md:text-lg leading-relaxed text-zinc-700 dark:text-zinc-300 ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          code: CodeBlock,
          h1: ({ children }) => (
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 mt-8 mb-3.5">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-xl md:text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100 mt-7 mb-3">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-lg md:text-xl font-medium tracking-tight text-zinc-900 dark:text-zinc-100 mt-6 mb-2.5">
              {children}
            </h3>
          ),
          h4: ({ children }) => (
            <h4 className="text-[17px] md:text-lg font-medium tracking-tight text-zinc-900 dark:text-zinc-100 mt-5 mb-2">
              {children}
            </h4>
          ),
          p: ({ children }) => (
            <p className="leading-relaxed my-3.5 text-zinc-700 dark:text-zinc-300">
              {children}
            </p>
          ),
          ul: ({ children }) => (
            <ul className="list-disc pl-6 my-4 space-y-2 text-zinc-700 dark:text-zinc-300 marker:text-zinc-400 dark:marker:text-zinc-600">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal pl-6 my-4 space-y-2 text-zinc-700 dark:text-zinc-300 marker:text-zinc-400 dark:marker:text-zinc-600">
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className="leading-relaxed text-[17px] md:text-lg">{children}</li>
          ),
          blockquote: ({ children }) => (
            <blockquote className="my-5 pl-4 border-l-2 border-zinc-300 dark:border-zinc-700 italic text-zinc-600 dark:text-zinc-400 py-1">
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
                className="text-zinc-900 dark:text-zinc-100 underline decoration-zinc-300 dark:decoration-zinc-700 underline-offset-4 hover:decoration-zinc-900 dark:hover:decoration-zinc-100 transition-colors"
              >
                {children}
              </a>
            );
          },
          hr: () => <hr className="my-8 border-zinc-200 dark:border-zinc-800" />,
          table: ({ children }) => (
            <div className="my-6 overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-800">
              <table className="min-w-full divide-y divide-zinc-200 dark:divide-zinc-800 text-sm md:text-base">
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
            <th className="px-3.5 py-2.5 text-left font-medium">{children}</th>
          ),
          td: ({ children }) => (
            <td className="px-3.5 py-2.5 text-zinc-700 dark:text-zinc-300">{children}</td>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
