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
                primaryColor: "#18181b",
                primaryTextColor: "#f4f4f5",
                primaryBorderColor: "#27272a",
                lineColor: "#71717a",
                secondaryColor: "#18181b",
                tertiaryColor: "#18181b",
                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
              }
            : {
                darkMode: false,
                background: "#ffffff",
                primaryColor: "#f4f4f5",
                primaryTextColor: "#18181b",
                primaryBorderColor: "#e4e4e7",
                lineColor: "#71717a",
                secondaryColor: "#fafafa",
                tertiaryColor: "#fafafa",
                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
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
      <div className="my-6 p-4 rounded border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30 flex items-center justify-center min-h-[140px]">
        <span className="text-xs text-zinc-400 font-mono">Loading diagram...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="my-6 p-4 rounded border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-xs font-mono text-zinc-600 dark:text-zinc-400 overflow-x-auto">
        <p className="font-semibold text-zinc-900 dark:text-zinc-100 mb-2">Diagram Source</p>
        <pre>{chart}</pre>
      </div>
    );
  }

  return (
    <div
      className={`my-6 p-4 sm:p-5 rounded border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 overflow-x-auto custom-scroll ${className}`}
    >
      <div
        ref={containerRef}
        className="flex justify-center items-center [&_svg]:max-w-full [&_svg]:h-auto transition-opacity duration-300"
        dangerouslySetInnerHTML={{ __html: svgContent }}
      />
    </div>
  );
}
