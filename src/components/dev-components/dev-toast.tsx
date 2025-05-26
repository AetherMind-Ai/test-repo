"use client";
import MindBotZustand from "@/utils/mindbot-zustand";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { AiOutlineClose } from "react-icons/ai";

const DevToast = () => {
  const { devToast, setToast } = MindBotZustand();
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    if (devToast) {
      setProgress(100);
      const interval = setInterval(() => {
        setProgress((prev) => Math.max(prev - 5, 0));
      }, 150);

      setTimeout(() => {
        setToast(null);
      }, 3000);

      return () => clearInterval(interval);
    }
  }, [devToast, setToast]);

  return (
    <AnimatePresence>
      {devToast && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="fixed bottom-6 left-6 w-80 p-4 text-white text-sm rounded-lg shadow-xl bg-gradient-to-r from-gray-900 to-gray-800 dark:from-white dark:to-gray-200 dark:text-black flex items-center justify-between z-50"
        >
          {/* Toast Message */}
          <span className="font-medium">{devToast}</span>

          {/* Close Button */}
          <button onClick={() => setToast(null)} className="focus:outline-none p-1 rounded-md hover:bg-gray-700 dark:hover:bg-gray-300 transition">
            <AiOutlineClose className="w-5 h-5 text-white dark:text-black" />
          </button>

          {/* Progress Bar */}
          <motion.div
            initial={{ width: "100%" }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 3, ease: "linear" }}
            className="absolute bottom-0 left-0 h-1 bg-blue-500 rounded-full"
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default DevToast;
