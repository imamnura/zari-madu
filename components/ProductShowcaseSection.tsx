"use client";

import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  PRODUCTS_SHOWCASE,
  CONTACT_INFO,
  WHATSAPP_MESSAGES,
} from "@/lib/constants";
import { openWhatsApp } from "@/lib/whatsapp";

export function ProductShowcaseSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const handleOrderClick = () => {
    openWhatsApp(CONTACT_INFO.whatsapp, WHATSAPP_MESSAGES.order);
  };

  return (
    <section
      id="products"
      ref={ref}
      className="py-20 lg:py-32 bg-gradient-to-b from-amber-50/30 to-white"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Koleksi Madu Premium
          </h2>
          <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
            Pilihan terbaik dari berbagai sumber nektar pilihan Indonesia
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {PRODUCTS_SHOWCASE.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.2 + index * 0.1, duration: 0.6 }}
            >
              <Card className="h-full hover:shadow-2xl transition-all duration-300 group overflow-hidden border-2 hover:border-amber-300">
                {/* Product Image Placeholder */}
                <div className="relative w-full aspect-square bg-gradient-to-br from-amber-100 to-amber-200 overflow-hidden">
                  {product.label && (
                    <Badge className="absolute top-4 left-4 bg-amber-600 text-white z-10">
                      {product.label}
                    </Badge>
                  )}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center p-8">
                      <div className="text-7xl mb-2">🍯</div>
                      <p className="text-xs text-amber-800">Product Image</p>
                    </div>
                  </div>
                  <div className="absolute inset-0 bg-amber-600/0 group-hover:bg-amber-600/10 transition-colors duration-300" />
                </div>

                <CardContent className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-amber-700 transition-colors">
                    {product.name}
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {product.description}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="text-center mt-12"
        >
          <Button
            size="lg"
            onClick={handleOrderClick}
            className="bg-amber-600 hover:bg-amber-700 text-white px-8 py-6 text-lg font-semibold shadow-lg hover:shadow-xl transition-all"
          >
            Lihat Detail & Pesan Sekarang
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
