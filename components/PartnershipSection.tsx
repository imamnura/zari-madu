"use client";

import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { PARTNERSHIPS } from "@/lib/constants";

type PartnershipData = {
  heading: string;
  title: string;
  partnerships: Array<{
    id: number;
    name: string;
    logo: string;
    description: string;
  }>;
};

export function PartnershipSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [content, setContent] = useState<PartnershipData>({
    heading: "Partner & Sertifikasi",
    title: "Dipercaya dan bersertifikat resmi dari berbagai lembaga terkemuka",
    partnerships: PARTNERSHIPS,
  });

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const res = await fetch("/api/admin/partnership-content");
        if (res.ok) {
          const data = await res.json();
          setContent(data);
        }
      } catch (error) {
        console.error("Error fetching partnership content:", error);
      }
    };

    fetchContent();
  }, []);

  return (
    <section ref={ref} className="py-20 lg:py-32 bg-white">
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

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {content.partnerships.map((partner, index) => (
            <motion.div
              key={partner.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={isInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ delay: 0.1 * index, duration: 0.5 }}
            >
              <Card className="h-full hover:shadow-xl transition-all duration-300 group border-2 hover:border-amber-300">
                <CardContent className="p-6 flex flex-col items-center justify-center text-center h-full">
                  {/* Placeholder for logo */}
                  <div className="w-20 h-20 bg-gradient-to-br from-amber-100 to-amber-200 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <span className="text-3xl">🏆</span>
                  </div>
                  <h3 className="text-sm font-bold text-gray-900 mb-1">
                    {partner.name}
                  </h3>
                  <p className="text-xs text-gray-600 line-clamp-2">
                    {partner.description}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
