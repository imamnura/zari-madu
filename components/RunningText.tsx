"use client";

import { motion } from "framer-motion";
import { RUNNING_TEXT } from "@/lib/constants";

export function RunningText() {
  return (
    <div className="w-full overflow-hidden bg-gradient-to-r from-amber-500 via-amber-600 to-amber-500 py-3">
      <motion.div
        className="flex gap-12 whitespace-nowrap"
        animate={{
          x: [0, -1000],
        }}
        transition={{
          x: {
            repeat: Infinity,
            repeatType: "loop",
            duration: 20,
            ease: "linear",
          },
        }}
      >
        {/* Duplicate array untuk seamless loop */}
        {[...RUNNING_TEXT, ...RUNNING_TEXT, ...RUNNING_TEXT].map(
          (text, index) => (
            <span
              key={index}
              className="text-white font-semibold text-sm sm:text-base"
            >
              {text}
            </span>
          )
        )}
      </motion.div>
    </div>
  );
}
