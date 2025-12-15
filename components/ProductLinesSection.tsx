"use client";

import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PRODUCT_LINES } from "@/lib/constants";

export function ProductLinesSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const scrollToProducts = () => {
    const element = document.querySelector("#products");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section
      ref={ref}
      className="py-20 lg:py-32 bg-gradient-to-b from-white to-amber-50/30"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Lini Produk Kami
          </h2>
          <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
            Tiga koleksi premium untuk memenuhi kebutuhan hidup sehat Anda
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {PRODUCT_LINES.map((line, index) => (
            <motion.div
              key={line.id}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.2 + index * 0.1, duration: 0.6 }}
            >
              <Card className="h-full border-2 hover:border-amber-300 hover:shadow-xl transition-all duration-300 group">
                <CardHeader className="text-center">
                  <div className="text-6xl mb-4 group-hover:scale-110 transition-transform duration-300">
                    {line.icon}
                  </div>
                  <CardTitle className="text-2xl text-amber-800">
                    {line.name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <CardDescription className="text-base text-gray-600 mb-6">
                    {line.description}
                  </CardDescription>
                  <Button
                    variant="ghost"
                    onClick={scrollToProducts}
                    className="text-amber-600 hover:text-amber-700 hover:bg-amber-50 font-semibold"
                  >
                    Lihat Koleksi →
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
