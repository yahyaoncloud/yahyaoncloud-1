import { useEffect, useRef } from "react";
import { useTheme } from "../Contexts/ThemeContext";

// Helper function to generate a random RGB color
const getRandomColor = () => {
  const r = Math.floor(Math.random() * 256);
  const g = Math.floor(Math.random() * 256);
  const b = Math.floor(Math.random() * 256);
  return `rgb(${r}, ${g}, ${b})`;
};

// Props for customization
interface ColorBlendBackgroundProps {
  className?: string;
  animationDuration?: number; // in seconds
}

const ColorBlendBackground = ({
  className = "",
  animationDuration = 5,
}: ColorBlendBackgroundProps) => {
  const { theme } = useTheme();
  const divRef = useRef<HTMLDivElement>(null);

  // Inject CSS keyframes only on the client side
  useEffect(() => {
    if (typeof document !== "undefined") {
      const styleSheet = document.createElement("style");
      styleSheet.textContent = `
        @keyframes colorBlend {
          0% { filter: brightness(1); }
          50% { filter: brightness(1.2); }
          100% { filter: brightness(1); }
        }
      `;
      document.head.appendChild(styleSheet);

      // Cleanup to avoid duplicate styles
      return () => {
        document.head.removeChild(styleSheet);
      };
    }
  }, []); // Empty dependency array to run once on mount

  // Update colors for animation
  useEffect(() => {
    const updateColors = () => {
      if (divRef.current) {
        const color1 = getRandomColor();
        const color2 = getRandomColor();
        divRef.current.style.background = `linear-gradient(45deg, ${color1}, ${color2})`;
      }
    };

    // Initial color set
    updateColors();

    // Update colors at the end of each animation cycle
    const interval = setInterval(updateColors, animationDuration * 1000);

    return () => clearInterval(interval);
  }, [animationDuration]);

  return (
    <div
      ref={divRef}
      className={`absolute inset-0 ${className}`}
      style={{
        animation: `colorBlend ${animationDuration}s infinite ease-in-out`,
        opacity: theme === "dark" ? 0.2 : 0.3,
      }}
    />
  );
};

export default ColorBlendBackground;
