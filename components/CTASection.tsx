"use client";

import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef, useMemo, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { CTA_SECTION } from "@/lib/constants";
import { openWhatsApp } from "@/lib/whatsapp";
import {
  trackWhatsAppClick,
  trackShopeeClick,
} from "@/components/GoogleAnalytics";
import { MessageCircle, Sparkles, ShoppingBag } from "lucide-react";

interface Settings {
  whatsapp: string;
  instagram: string;
  email: string;
  shopeeLink: string;
  mapsLocation: string;
  mapsEmbed: string;
  whatsappOrderMessage?: string;
  whatsappResellerMessage?: string;
}

type ContactSettings = Settings;

export function CTASection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [settings, setSettings] = useState<Settings | null>(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch("/api/admin/settings");
        if (res.ok) {
          const data = await res.json();
          setSettings(data);
        }
      } catch (error) {
        console.error("Error fetching settings:", error);
      }
    };

    fetchSettings();
  }, []);

  const particles = useMemo(
    () =>
      [...Array(10)].map((_, i) => ({
        top: (i * 13 + 7) % 100,
        left: (i * 23 + 11) % 100,
        duration: 3 + (i % 3),
        delay: (i % 5) * 0.4,
      })),
    []
  );

  const handleOrderClick = () => {
    if (settings) {
      const message =
        settings.whatsappOrderMessage ||
        "Halo Zari, saya tertarik memesan madu premium. Mohon info detail & harganya.";
      trackWhatsAppClick("order");
      openWhatsApp(settings.whatsapp, message);
    }
  };

  const handleResellerClick = () => {
    if (settings) {
      const message =
        settings.whatsappResellerMessage ||
        "Halo Zari, saya tertarik menjadi reseller premium. Mohon informasi lebih lanjut.";
      trackWhatsAppClick("reseller");
      openWhatsApp(settings.whatsapp, message);
    }
  };

  const handleShopeeClick = () => {
    if (settings) {
      trackShopeeClick();
      window.open(settings.shopeeLink, "_blank");
    }
  };

  return (
    <section
      id="cta"
      ref={ref}
      className="py-20 lg:py-32 bg-gradient-to-br from-amber-600 via-amber-700 to-amber-800 relative overflow-hidden"
    >
      {/* Enhanced Decorative elements */}
      <div className="absolute inset-0">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.1, 0.2, 0.1],
          }}
          transition={{ duration: 8, repeat: Infinity }}
          className="absolute top-10 left-10 w-64 h-64 bg-white rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.1, 0.15, 0.1],
          }}
          transition={{ duration: 10, repeat: Infinity, delay: 1 }}
          className="absolute bottom-10 right-10 w-96 h-96 bg-white rounded-full blur-3xl"
        />

        {/* Floating particles */}
        {particles.map((particle, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full"
            style={{
              top: `${particle.top}%`,
              left: `${particle.left}%`,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: particle.duration,
              repeat: Infinity,
              delay: particle.delay,
            }}
          />
        ))}
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center max-w-4xl mx-auto"
        >
          <motion.h2
            initial={{ opacity: 0, scale: 0.9 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.5 }}
            className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6"
          >
            {CTA_SECTION.heading}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="text-lg sm:text-xl text-amber-50 mb-12 leading-relaxed"
          >
            {CTA_SECTION.body}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                size="lg"
                onClick={handleOrderClick}
                className="bg-white text-amber-700 hover:bg-amber-50 px-8 py-6 text-base sm:text-lg font-semibold shadow-2xl hover:shadow-3xl transition-all"
              >
                <MessageCircle className="w-5 h-5 mr-2" />
                Pesan via WhatsApp
              </Button>
            </motion.div>

            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                size="lg"
                onClick={handleShopeeClick}
                className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-8 py-6 text-base sm:text-lg font-semibold shadow-2xl hover:shadow-3xl transition-all border-2 border-orange-400"
              >
                <ShoppingBag className="w-5 h-5 mr-2" />
                Pesan via Shopee
              </Button>
            </motion.div>
          </motion.div>

          {/* Reseller CTA - Separate and more attractive */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="mt-8"
          >
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                size="lg"
                onClick={handleResellerClick}
                className="bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 hover:from-purple-700 hover:via-pink-700 hover:to-purple-700 text-white px-10 py-7 text-lg font-bold shadow-2xl hover:shadow-3xl transition-all border-2 border-purple-400 relative overflow-hidden group"
              >
                {/* Animated shine effect */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-20"
                  animate={{
                    x: [-200, 200],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    repeatDelay: 1,
                  }}
                />
                <Sparkles className="w-5 h-5 mr-2" />
                <span className="relative z-10">
                  Bergabung Reseller Premium
                </span>
                <Sparkles className="w-5 h-5 ml-2" />
              </Button>
            </motion.div>
            <p className="text-amber-100 text-sm mt-3">
              Dapatkan harga spesial & bonus menarik untuk reseller!
            </p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
