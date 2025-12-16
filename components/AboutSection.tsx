"use client";

import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef, useEffect, useState } from "react";
import { ABOUT_CONTENT } from "@/lib/constants";
import { TrendingUp } from "lucide-react";

function Counter({ value, isInView }: { value: string; isInView: boolean }) {
  const count = useMotionValue(0);
  const rounded = useTransform(count, Math.round);
  const numericValue = parseInt(value.replace(/\D/g, "")) || 0;

  useEffect(() => {
    if (isInView && numericValue > 0) {
      const controls = animate(count, numericValue, { duration: 2 });
      return controls.stop;
    }
  }, [isInView, numericValue, count]);

  // If value contains M or + or %, just show it
  if (value.includes("M") || value.includes("%")) {
    return <span>{value}</span>;
  }

  return <span>{value}</span>;
}

interface AboutData {
  tagline: string;
  heading: string;
  body: string;
  stats: Array<{ value: string; label: string }>;
}

export function AboutSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [aboutData, setAboutData] = useState<AboutData | null>(null);

  useEffect(() => {
    // Fetch dynamic content from API
    fetch("/api/admin/about-content")
      .then((res) => res.json())
      .then((data) => setAboutData(data))
      .catch((error) => {
        console.error("Error loading about content:", error);
        // Fallback to static content if API fails
        setAboutData({
          tagline: "Terpercaya & Berkualitas",
          heading: ABOUT_CONTENT.heading,
          body: ABOUT_CONTENT.body,
          stats: ABOUT_CONTENT.stats,
        });
      });
  }, []);

  // Use dynamic data or fallback to static
  const tagline = aboutData?.tagline || "Terpercaya & Berkualitas";
  const heading = aboutData?.heading || ABOUT_CONTENT.heading;
  const body = aboutData?.body || ABOUT_CONTENT.body;
  const stats = aboutData?.stats || ABOUT_CONTENT.stats;

  return (
    <section
      id="about"
      ref={ref}
      className="py-20 lg:py-32 bg-gradient-to-b from-white to-amber-50/20"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center mb-16">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 bg-amber-100 text-amber-800 px-4 py-2 rounded-full mb-6"
          >
            <TrendingUp className="w-4 h-4" />
            <span className="text-sm font-semibold">{tagline}</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6"
          >
            <span className="bg-gradient-to-r from-amber-600 via-amber-700 to-amber-800 bg-clip-text text-transparent">
              {heading}
            </span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="text-lg sm:text-xl text-gray-600 leading-relaxed"
          >
            {body}
          </motion.p>
        </div>

        {/* Enhanced Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={isInView ? { opacity: 1, scale: 1 } : {}}
              transition={{
                delay: 0.3 + index * 0.1,
                duration: 0.5,
                type: "spring",
              }}
              whileHover={{ scale: 1.05, y: -10 }}
              className="text-center p-6 rounded-2xl bg-white shadow-lg hover:shadow-2xl transition-all duration-300 border-2 border-amber-100 hover:border-amber-300"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={isInView ? { scale: 1 } : {}}
                transition={{
                  delay: 0.5 + index * 0.1,
                  duration: 0.5,
                  type: "spring",
                }}
                className="text-5xl sm:text-6xl font-bold mb-3"
              >
                <span className="bg-gradient-to-br from-amber-600 via-amber-700 to-amber-800 bg-clip-text text-transparent">
                  <Counter value={stat.value} isInView={isInView} />
                </span>
              </motion.div>
              <div className="text-sm sm:text-base text-gray-600 font-semibold">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
