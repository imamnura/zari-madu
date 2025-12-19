"use client";

import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import {
  ShieldCheck,
  Sparkles,
  Leaf,
  MapPin,
  Users,
  Award,
  Heart,
  Star,
  Zap,
  Globe,
} from "lucide-react";
import { WHY_CHOOSE_ZARI } from "@/lib/constants";

const iconMap = {
  ShieldCheck,
  Sparkles,
  Leaf,
  MapPin,
  Users,
  Award,
  Heart,
  Star,
  Zap,
  Globe,
};

type WhyChooseData = {
  heading: string;
  title: string;
  criteria: Array<{
    icon: string;
    title: string;
    description: string;
  }>;
};

export function WhyChooseSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [content, setContent] = useState<WhyChooseData>({
    heading: "Mengapa Memilih Zari Honey?",
    title: "Komitmen kami pada kualitas dan kepuasan Anda",
    criteria: WHY_CHOOSE_ZARI,
  });

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const res = await fetch("/api/admin/why-choose-content");
        if (res.ok) {
          const data = await res.json();
          setContent(data);
        }
      } catch (error) {
        console.error("Error fetching why choose content:", error);
      }
    };

    fetchContent();
  }, []);

  return (
    <section id="why-zari" ref={ref} className="py-20 lg:py-32 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            {content.heading}
          </h2>
          <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
            {content.title}
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12">
          {content.criteria.map((item, index) => {
            const Icon = iconMap[item.icon as keyof typeof iconMap];

            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={isInView ? { opacity: 1, scale: 1 } : {}}
                transition={{
                  delay: 0.1 + index * 0.1,
                  duration: 0.5,
                  type: "spring",
                }}
                whileHover={{ scale: 1.05, y: -5 }}
                className="group"
              >
                <div className="flex flex-col items-center text-center p-6 rounded-2xl hover:bg-gradient-to-br hover:from-amber-50 hover:to-amber-100 transition-all duration-300 border-2 border-transparent hover:border-amber-300 shadow-sm hover:shadow-xl">
                  <motion.div
                    className="w-20 h-20 bg-gradient-to-br from-amber-100 to-amber-200 rounded-3xl flex items-center justify-center mb-4 shadow-md"
                    whileHover={{ rotate: [0, -10, 10, -10, 0], scale: 1.1 }}
                    transition={{ duration: 0.5 }}
                  >
                    {Icon && <Icon className="w-10 h-10 text-amber-600" />}
                  </motion.div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-amber-700 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
