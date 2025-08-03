import React from "react";
import { useTheme } from "../Contexts/ThemeContext";
import { Sun, Moon } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "@remix-run/react";

const LoginNavbar: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleReaderNavigation = () => {
    navigate("/admin/blog");
  };

  return (
    <motion.nav
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed top-0 left-0 right-0 z-50 px-6 py-4  "
    >
      <div className="max-w-ful mx-auto flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={handleReaderNavigation}
            className="px-4 py-2 rounded-xl font-semibold transition-colors bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-blue-500 dark:hover:bg-blue-600"
          >
            A Reader?
          </button>
          <motion.button
            onClick={toggleTheme}
            className="p-3 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-300"
            aria-label="Toggle theme"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <motion.div
              animate={{ rotate: theme === "dark" ? 360 : 0 }}
              transition={{ duration: 0.5 }}
            >
              {theme === "light" ? (
                <Moon size={18} className="text-gray-600 dark:text-gray-300" />
              ) : (
                <Sun size={18} className="text-yellow-500" />
              )}
            </motion.div>
          </motion.button>
        </div>
      </div>
    </motion.nav>
  );
};

export default LoginNavbar;
