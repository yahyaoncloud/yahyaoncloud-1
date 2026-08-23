import { useEffect, useRef, useState, useId, useCallback } from "react";
import { ZoomIn, ZoomOut, RotateCcw, Maximize2, X, Move } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
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
  
  // Inline zoom & pan state
  const [scale, setScale] = useState<number>(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0 });

  // Fullscreen modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalScale, setModalScale] = useState<number>(1);
  const [modalPosition, setModalPosition] = useState({ x: 0, y: 0 });
  const [isModalDragging, setIsModalDragging] = useState(false);
  const modalDragStartRef = useRef({ x: 0, y: 0 });

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
                background: "transparent",
                primaryColor: "#18181b",
                primaryTextColor: "#f4f4f5",
                primaryBorderColor: "#3f3f46",
                lineColor: "#71717a",
                secondaryColor: "#18181b",
                tertiaryColor: "#18181b",
                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
              }
            : {
                darkMode: false,
                background: "transparent",
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

  // Handle escape key to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isModalOpen) {
        setIsModalOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isModalOpen]);

  // Inline Controls
  const handleZoomIn = () => setScale((prev) => Math.min(Number((prev + 0.2).toFixed(1)), 3));
  const handleZoomOut = () => setScale((prev) => Math.max(Number((prev - 0.2).toFixed(1)), 0.6));
  const handleReset = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  // Inline Drag Handlers
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button !== 0) return;
    setIsDragging(true);
    dragStartRef.current = { x: e.clientX - position.x, y: e.clientY - position.y };
  }, [position]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - dragStartRef.current.x,
      y: e.clientY - dragStartRef.current.y,
    });
  }, [isDragging]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Modal Controls
  const handleModalZoomIn = () => setModalScale((prev) => Math.min(Number((prev + 0.25).toFixed(2)), 4));
  const handleModalZoomOut = () => setModalScale((prev) => Math.max(Number((prev - 0.25).toFixed(2)), 0.5));
  const handleModalReset = () => {
    setModalScale(1);
    setModalPosition({ x: 0, y: 0 });
  };

  // Modal Drag Handlers
  const handleModalMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button !== 0) return;
    setIsModalDragging(true);
    modalDragStartRef.current = { x: e.clientX - modalPosition.x, y: e.clientY - modalPosition.y };
  }, [modalPosition]);

  const handleModalMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isModalDragging) return;
    setModalPosition({
      x: e.clientX - modalDragStartRef.current.x,
      y: e.clientY - modalDragStartRef.current.y,
    });
  }, [isModalDragging]);

  const handleModalMouseUp = useCallback(() => {
    setIsModalDragging(false);
  }, []);

  if (!isClient) {
    return (
      <div className="my-6 p-4 rounded-lg border border-zinc-200/60 dark:border-zinc-800/60 bg-zinc-50/50 dark:bg-zinc-900/30 flex items-center justify-center min-h-[140px]">
        <span className="text-xs text-zinc-400 font-mono">Loading diagram...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="my-6 p-4 rounded-lg border border-zinc-200/60 dark:border-zinc-800/60 bg-zinc-50 dark:bg-zinc-900/40 text-xs font-mono text-zinc-600 dark:text-zinc-400 overflow-x-auto">
        <p className="font-semibold text-zinc-900 dark:text-zinc-100 mb-2">Diagram Source</p>
        <pre>{chart}</pre>
      </div>
    );
  }

  const isCustomTransform = scale !== 1 || position.x !== 0 || position.y !== 0;

  return (
    <>
      <div
        className={`relative my-6 rounded-lg border border-zinc-200/60 dark:border-zinc-800/60 bg-zinc-50/50 dark:bg-zinc-900/30 overflow-hidden group select-none ${className}`}
      >
        {/* Floating Zoom & Pan Controls Bar */}
        <div className="absolute top-2.5 right-2.5 z-10 flex items-center gap-1 bg-zinc-100/90 dark:bg-zinc-800/90 backdrop-blur-sm px-1.5 py-1 rounded-md border border-zinc-200/80 dark:border-zinc-700/80 shadow-xs opacity-80 group-hover:opacity-100 transition-opacity">
          <button
            type="button"
            onClick={handleZoomIn}
            className="p-1 rounded text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-200/60 dark:hover:bg-zinc-700/60 transition-colors cursor-pointer"
            title="Zoom in (+)"
            aria-label="Zoom in"
          >
            <ZoomIn size={15} />
          </button>
          <button
            type="button"
            onClick={handleZoomOut}
            className="p-1 rounded text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-200/60 dark:hover:bg-zinc-700/60 transition-colors cursor-pointer"
            title="Zoom out (-)"
            aria-label="Zoom out"
          >
            <ZoomOut size={15} />
          </button>
          {isCustomTransform && (
            <button
              type="button"
              onClick={handleReset}
              className="p-1 rounded text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-200/60 dark:hover:bg-zinc-700/60 transition-colors cursor-pointer"
              title="Reset default size (100%)"
              aria-label="Reset default size"
            >
              <RotateCcw size={14} />
            </button>
          )}
          <span className="h-3.5 w-px bg-zinc-300 dark:bg-zinc-600 mx-0.5" />
          <button
            type="button"
            onClick={() => {
              setModalPosition({ x: 0, y: 0 });
              setModalScale(1);
              setIsModalOpen(true);
            }}
            className="p-1 rounded text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-200/60 dark:hover:bg-zinc-700/60 transition-colors cursor-pointer"
            title="Fullscreen view"
            aria-label="Fullscreen view"
          >
            <Maximize2 size={15} />
          </button>
        </div>

        {/* Diagram SVG Container - Height dynamically fits diagram naturally */}
        <div
          className={`p-4 sm:p-6 overflow-hidden w-full h-auto flex justify-center items-center ${
            isDragging ? "cursor-grabbing" : isCustomTransform ? "cursor-grab" : "cursor-default"
          }`}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onDoubleClick={handleReset}
          title={isCustomTransform ? "Drag to pan • Double-click to reset" : "Click zoom controls to adjust"}
        >
          <div
            ref={containerRef}
            style={{
              transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
              transformOrigin: "center center",
              transition: isDragging ? "none" : "transform 0.15s ease-out",
            }}
            className="w-full h-auto flex justify-center items-center [&_svg]:max-w-full [&_svg]:h-auto pointer-events-none"
            dangerouslySetInnerHTML={{ __html: svgContent }}
          />
        </div>
      </div>

      {/* Fullscreen Interactive Drag & Zoom Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex flex-col items-center justify-center p-4 select-none"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setIsModalOpen(false);
              }
            }}
          >
            {/* Modal Controls Header */}
            <div className="absolute top-4 right-4 z-50 flex items-center gap-2 bg-zinc-900/90 text-zinc-200 px-3 py-1.5 rounded-lg border border-zinc-800 shadow-lg">
              <div className="flex items-center gap-1 text-zinc-400 text-xs font-mono pr-1.5 border-r border-zinc-700">
                <Move size={13} />
                <span>Drag to pan</span>
              </div>
              <button
                type="button"
                onClick={handleModalZoomIn}
                className="p-1.5 rounded text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
                title="Zoom In"
              >
                <ZoomIn size={18} />
              </button>
              <button
                type="button"
                onClick={handleModalZoomOut}
                className="p-1.5 rounded text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
                title="Zoom Out"
              >
                <ZoomOut size={18} />
              </button>
              <button
                type="button"
                onClick={handleModalReset}
                className="p-1.5 rounded text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
                title="Reset to Default (100%)"
              >
                <RotateCcw size={17} />
              </button>
              <span className="font-mono text-xs text-zinc-400 px-1">
                {Math.round(modalScale * 100)}%
              </span>
              <span className="h-4 w-px bg-zinc-700 mx-1" />
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded text-zinc-300 hover:text-red-400 hover:bg-zinc-800 transition-colors cursor-pointer"
                title="Close (Esc)"
              >
                <X size={18} />
              </button>
            </div>

            {/* Draggable & Zoomable SVG Surface */}
            <div
              className={`w-full h-full flex items-center justify-center overflow-hidden ${
                isModalDragging ? "cursor-grabbing" : "cursor-grab"
              }`}
              onMouseDown={handleModalMouseDown}
              onMouseMove={handleModalMouseMove}
              onMouseUp={handleModalMouseUp}
              onMouseLeave={handleModalMouseUp}
              onDoubleClick={handleModalReset}
            >
              <div
                style={{
                  transform: `translate(${modalPosition.x}px, ${modalPosition.y}px) scale(${modalScale})`,
                  transformOrigin: "center center",
                  transition: isModalDragging ? "none" : "transform 0.15s ease-out",
                }}
                className="[&_svg]:max-w-none flex justify-center items-center pointer-events-none"
                dangerouslySetInnerHTML={{ __html: svgContent }}
              />
            </div>

            {/* Bottom Hint */}
            <div className="absolute bottom-4 z-40 text-xs font-mono text-zinc-400 bg-zinc-900/80 px-3 py-1 rounded-full border border-zinc-800">
              Drag to pan • Double-click to reset (100%) • Press Esc to exit
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
