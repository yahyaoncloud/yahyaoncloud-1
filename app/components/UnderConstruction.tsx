// components/UnderConstruction.tsx

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "@remix-run/react";
import { Wrench, Clock, Mail, ArrowLeft, Hammer, Cog } from "lucide-react";

interface UnderConstructionProps {
  title?: string;
  message?: string;
  estimatedCompletion?: string;
  showBackButton?: boolean;
}

export function UnderConstruction({
  title = "Under Construction",
  message = "We're working hard to bring you something amazing. This page is currently under development and will be available soon.",
  estimatedCompletion = "Coming Soon",
  showBackButton = true,
}: UnderConstructionProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => (prev >= 100 ? 0 : prev + 1));
    }, 100);
    return () => clearInterval(interval);
  }, []);

  const container = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.2,
        staggerChildren: 0.1,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };

  return (
    <div className="min-h-screen overflow-hidden flex items-center justify-center bg-gradient-to-br from-orange-50 via-yellow-50 to-amber-50 dark:from-gray-900 dark:via-orange-900/20 dark:to-yellow-900/20 p-4">
      <motion.div
        className="w-full max-w-2xl text-center"
        variants={container}
        initial="hidden"
        animate="visible"
      >
        {/* Animated Tool Icons */}
        <motion.div className="relative mb-8">
          <motion.div
            className="flex justify-center items-center space-x-4 mb-6"
            variants={item}
          >
            <motion.div
              animate={{
                rotate: [0, 360],
                scale: [1, 1.1, 1],
              }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            >
              <Cog size={48} className="text-orange-500" />
            </motion.div>

            <motion.div
              animate={{
                rotate: [0, -15, 0, 15, 0],
                y: [0, -5, 0],
              }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              <Hammer size={56} className="text-yellow-600" />
            </motion.div>

            <motion.div
              animate={{
                rotate: [-360, 0],
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 1,
              }}
            >
              <Wrench size={44} className="text-amber-600" />
            </motion.div>
          </motion.div>

          {/* Progress Bar */}
          <motion.div className="w-full max-w-md mx-auto mb-6" variants={item}>
            <div className="flex justify-between mb-2 text-sm">
              <span className="text-gray-600 dark:text-gray-400">Progress</span>
              <span className="font-medium text-orange-600 dark:text-orange-400">
                {progress}%
              </span>
            </div>
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <motion.div
                className="h-3 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-full"
                style={{ width: `${progress}%` }}
                transition={{ duration: 0.1 }}
              />
            </div>
          </motion.div>
        </motion.div>

        {/* Headline and Message */}
        <motion.h1
          className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4"
          variants={item}
        >
          {title}
        </motion.h1>
        <motion.p
          className="text-lg text-gray-600 dark:text-gray-300 max-w-lg mx-auto leading-relaxed mb-6"
          variants={item}
        >
          {message}
        </motion.p>

        {/* Info Cards */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-lg mx-auto mb-6"
          variants={item}
        >
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-4 border border-orange-200 dark:border-orange-800 rounded-xl shadow-lg">
            <div className="flex items-center space-x-3">
              <Clock size={20} className="text-orange-500" />
              <div className="text-left">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  Timeline
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  {estimatedCompletion}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-4 border border-orange-200 dark:border-orange-800 rounded-xl shadow-lg">
            <div className="flex items-center space-x-3">
              <Mail size={20} className="text-orange-500" />
              <div className="text-left">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  Updates
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  We’ll notify you
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Navigation */}
        {showBackButton && (
          <motion.div
            className="flex justify-center items-center pt-4"
            variants={item}
          >
            <Link
              to="/admin/blog"
              className="group flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white rounded-xl shadow-lg transform hover:scale-105 transition-all duration-300 font-medium"
            >
              <ArrowLeft size={18} />
              <span>Back to Dashboard</span>
            </Link>
          </motion.div>
        )}

        {/* Background Animation Particles */}
        <motion.div
          className="absolute inset-0 pointer-events-none -z-10 overflow-hidden"
          variants={item}
        >
          {Array.from({ length: 8 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 rounded-full bg-orange-400 dark:bg-orange-300 opacity-30"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [-30, 30],
                x: [-10, 10],
                opacity: [0.3, 0.7, 0.3],
                scale: [1, 1.5, 1],
              }}
              transition={{
                duration: 4 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
}
