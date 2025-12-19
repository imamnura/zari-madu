"use client";

import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { openWhatsApp } from "@/lib/whatsapp";
import { trackWhatsAppClick } from "@/components/GoogleAnalytics";

interface HoneyCollection {
  id: string;
  name: string;
  description: string;
  price?: string;
  image?: string;
  label?: string;
}

interface Settings {
  whatsapp: string;
  whatsappOrderMessage?: string;
}

export function ProductShowcaseSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [collections, setCollections] = useState<HoneyCollection[]>([]);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [sectionTitle, setSectionTitle] = useState("Koleksi Madu Premium");
  const [sectionDescription, setSectionDescription] = useState(
    "Pilihan terbaik dari berbagai sumber nektar pilihan Indonesia"
  );

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch section content
        const contentResponse = await fetch(
          "/api/admin/honey-collection-content"
        );
        const contentData = await contentResponse.json();

        if (contentData.success) {
          setSectionTitle(contentData.data.title);
          setSectionDescription(contentData.data.description);
        }

        // Fetch collections
        const response = await fetch("/api/admin/honey-collection");
        const data = await response.json();

        if (data.success) {
          setCollections(data.data);
        }

        // Fetch settings
        const settingsRes = await fetch("/api/admin/settings");
        if (settingsRes.ok) {
          const settingsData = await settingsRes.json();
          setSettings(settingsData);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleOrderClick = () => {
    if (settings) {
      const message =
        settings.whatsappOrderMessage ||
        "Halo Zari, saya tertarik memesan madu premium. Mohon info detail & harganya.";
      trackWhatsAppClick("order");
      openWhatsApp(settings.whatsapp, message);
    }
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
            {sectionTitle}
          </h2>
          <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
            {sectionDescription}
          </p>
        </motion.div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
          </div>
        ) : (
          <>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {collections.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ delay: 0.2 + index * 0.1, duration: 0.6 }}
                >
                  <Card className="h-full hover:shadow-2xl transition-all duration-300 group overflow-hidden border-2 hover:border-amber-300">
                    {/* Product Image */}
                    <div className="relative w-full aspect-square bg-gradient-to-br from-amber-100 to-amber-200 overflow-hidden">
                      {product.label && (
                        <Badge className="absolute top-4 left-4 bg-amber-600 text-white z-10">
                          {product.label}
                        </Badge>
                      )}
                      {product.image ? (
                        <img
                          src={product.image}
                          alt={product.name}
                          className="absolute inset-0 w-full h-full object-cover"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="text-center p-8">
                            <div className="text-7xl mb-2">🍯</div>
                            <p className="text-xs text-amber-800">
                              Product Image
                            </p>
                          </div>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-amber-600/0 group-hover:bg-amber-600/10 transition-colors duration-300" />
                    </div>

                    <CardContent className="p-6">
                      <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-amber-700 transition-colors">
                        {product.name}
                      </h3>
                      <p className="text-gray-600 text-sm leading-relaxed">
                        {product.description}
                      </p>
                      {product.price && (
                        <p className="text-amber-600 font-semibold mt-3">
                          {product.price}
                        </p>
                      )}
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
          </>
        )}
      </div>
    </section>
  );
}
