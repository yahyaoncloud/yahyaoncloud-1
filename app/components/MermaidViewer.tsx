import { useEffect, useRef, useState, useId } from "react";
import { useTheme } from "~/Contexts/ThemeContext";

interface MermaidViewerProps {
  chart: string;
  className?: string;
}

export default function MermaidViewer({ chart, className = "" }: MermaidViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [svgContent, setSvgContent] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);
  const rawId = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const uniqueId = `mermaid-${rawId}`;
  const { theme, isDark } = useTheme();

  const isDarkMode = isDark !== undefined ? isDark : theme === "dark";

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient || !chart) return;

    let isMounted = true;

    async function renderChart() {
      try {
        setError(null);
        const mermaid = (await import("mermaid")).default;

        mermaid.initialize({
          startOnLoad: false,
          securityLevel: "loose",
          theme: isDarkMode ? "dark" : "default",
          themeVariables: isDarkMode
            ? {
                darkMode: true,
                background: "#09090b",
                primaryColor: "#27272a",
                primaryTextColor: "#f43f5e",
                primaryBorderColor: "#3f3f46",
                lineColor: "#71717a",
                secondaryColor: "#18181b",
                tertiaryColor: "#18181b",
                fontFamily: "Inter, sans-serif",
              }
            : {
                darkMode: false,
                background: "#ffffff",
                primaryColor: "#f4f4f5",
                primaryTextColor: "#18181b",
                primaryBorderColor: "#e4e4e7",
                lineColor: "#a1a1aa",
                secondaryColor: "#fafafa",
                tertiaryColor: "#fafafa",
                fontFamily: "Inter, sans-serif",
              },
        });

        // Clean any residual elements with this ID
        const existingElement = document.getElementById(uniqueId);
        if (existingElement) {
          existingElement.remove();
        }

        const { svg } = await mermaid.render(uniqueId, chart.trim());
        if (isMounted) {
          setSvgContent(svg);
        }
      } catch (err: unknown) {
        if (isMounted) {
          console.error("Mermaid render error:", err);
          setError(err instanceof Error ? err.message : "Failed to render architecture diagram");
        }
      }
    }

    renderChart();

    return () => {
      isMounted = false;
    };
  }, [chart, isDarkMode, isClient, uniqueId]);

  if (!isClient) {
    return (
      <div className="my-6 p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30 flex items-center justify-center min-h-[160px] animate-pulse">
        <span className="text-xs text-zinc-400 font-mono">Loading architecture diagram...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="my-6 p-4 rounded-xl border border-amber-200/50 dark:border-amber-900/30 bg-amber-50/30 dark:bg-amber-950/20 text-xs font-mono text-zinc-600 dark:text-zinc-400 overflow-x-auto">
        <p className="font-semibold text-amber-600 dark:text-amber-400 mb-2">Diagram Source Preview</p>
        <pre className="text-zinc-700 dark:text-zinc-300">{chart}</pre>
      </div>
    );
  }

  return (
    <div
      className={`my-6 p-4 sm:p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800/80 bg-zinc-50/40 dark:bg-zinc-900/40 backdrop-blur-sm overflow-x-auto custom-scroll shadow-sm ${className}`}
    >
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-zinc-200/60 dark:border-zinc-800/60 text-xs text-zinc-400">
        <span className="font-medium tracking-wide uppercase text-[10px] text-indigo-600 dark:text-indigo-400">
          Architecture & System Flow
        </span>
        <span className="text-[10px] font-mono text-zinc-400">Interactive Diagram</span>
      </div>
      <div
        ref={containerRef}
        className="flex justify-center items-center [&_svg]:max-w-full [&_svg]:h-auto transition-opacity duration-300"
        dangerouslySetInnerHTML={{ __html: svgContent }}
      />
    </div>
  );
}
