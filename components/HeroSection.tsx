"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { HERO_CONTENT } from "@/lib/constants";
import { openWhatsApp } from "@/lib/whatsapp";
import {
  trackWhatsAppClick,
  trackShopeeClick,
} from "@/components/GoogleAnalytics";
import { RunningText } from "./RunningText";
import { Typewriter } from "./Typewriter";
import { Sparkles, ShoppingBag } from "lucide-react";
import { useState, useEffect } from "react";
import Image from "next/image";

interface HeroData {
  badges: string[];
  typewriterTexts: string[];
  description: string;
  productImage: string | null;
}

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

export function HeroSection() {
  const [heroData, setHeroData] = useState<HeroData | null>(null);
  const [settings, setSettings] = useState<Settings | null>(null);

  useEffect(() => {
    // Fetch dynamic content from API
    fetch("/api/admin/hero-content")
      .then((res) => res.json())
      .then((data) => setHeroData(data))
      .catch((error) => {
        console.error("Error loading hero content:", error);
      });

    // Fetch settings
    fetch("/api/admin/settings")
      .then((res) => res.json())
      .then((data) => setSettings(data))
      .catch((error) => {
        console.error("Error fetching settings:", error);
        // Fallback to static content if API fails
        setHeroData({
          badges: HERO_CONTENT.badges,
          typewriterTexts: [
            "Madu Premium Asli dari Alam Indonesia",
            "Kualitas Terpercaya - Tanpa Aditif",
          ],
          description: HERO_CONTENT.subheadline,
          productImage: null,
        });
      });
  }, []);

  const contactInfo: ContactSettings | null = settings;

  const handleOrderClick = () => {
    if (contactInfo) {
      const message =
        contactInfo.whatsappOrderMessage ||
        "Halo Zari, saya tertarik memesan madu premium. Mohon info detail & harganya.";
      trackWhatsAppClick("order");
      openWhatsApp(contactInfo.whatsapp, message);
    }
  };

  const handleResellerClick = () => {
    if (contactInfo) {
      const message =
        contactInfo.whatsappResellerMessage ||
        "Halo Zari, saya tertarik menjadi reseller premium. Mohon informasi lebih lanjut.";
      trackWhatsAppClick("reseller");
      openWhatsApp(contactInfo.whatsapp, message);
    }
  };

  const handleShopeeClick = () => {
    if (contactInfo) {
      trackShopeeClick();
      window.open(contactInfo.shopeeLink, "_blank");
    }
  };

  // Show loading or fallback while data is being fetched
  const badges = heroData?.badges || HERO_CONTENT.badges;
  const typewriterTexts = heroData?.typewriterTexts || [
    "Madu Premium Asli dari Alam Indonesia",
    "Kualitas Terpercaya - Tanpa Aditif",
  ];
  const description = heroData?.description || HERO_CONTENT.subheadline;
  const productImage = heroData?.productImage;

  return (
    <>
      <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 via-white to-amber-50 pt-16 lg:pt-20">
        {/* Enhanced Decorative background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{ duration: 8, repeat: Infinity }}
            className="absolute top-1/4 left-10 w-72 h-72 bg-amber-200/30 rounded-full blur-3xl"
          />
          <motion.div
            animate={{
              scale: [1, 1.1, 1],
              opacity: [0.2, 0.4, 0.2],
            }}
            transition={{ duration: 10, repeat: Infinity, delay: 1 }}
            className="absolute bottom-1/4 right-10 w-96 h-96 bg-amber-300/20 rounded-full blur-3xl"
          />

          {/* Floating particles */}
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-amber-400 rounded-full"
              style={{
                top: `${20 + i * 15}%`,
                left: `${10 + i * 20}%`,
              }}
              animate={{
                y: [0, -30, 0],
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 3 + i,
                repeat: Infinity,
                delay: i * 0.5,
              }}
            />
          ))}
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-24 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left content */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, type: "spring" }}
              className="text-center lg:text-left"
            >
              {/* Badges dengan animasi */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.6 }}
                className="flex flex-wrap gap-2 justify-center lg:justify-start mb-6"
              >
                {badges.map((badge, index) => (
                  <motion.div
                    key={index}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Badge
                      variant="secondary"
                      className="bg-amber-100 text-amber-900 hover:bg-amber-200 text-xs sm:text-sm border border-amber-300"
                    >
                      <Sparkles className="w-3 h-3 mr-1" />
                      {badge}
                    </Badge>
                  </motion.div>
                ))}
              </motion.div>

              {/* Headline dengan gradient dan typewriter */}
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.6 }}
                className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight min-h-[5rem] sm:min-h-[6rem] lg:min-h-[7rem]"
              >
                <span className="bg-gradient-to-r from-amber-600 via-amber-700 to-amber-800 bg-clip-text text-transparent">
                  <Typewriter
                    texts={typewriterTexts}
                    typingSpeed={80}
                    deletingSpeed={50}
                    delayBetween={2500}
                  />
                </span>
              </motion.h1>

              {/* Subheadline */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.6 }}
                className="text-lg sm:text-xl text-gray-600 mb-8 max-w-2xl mx-auto lg:mx-0"
              >
                {description}
              </motion.p>

              {/* Enhanced CTA Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.6 }}
                className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
              >
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    size="lg"
                    onClick={handleOrderClick}
                    className="bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white px-8 py-6 text-base sm:text-lg font-semibold shadow-lg hover:shadow-2xl transition-all"
                  >
                    <ShoppingBag className="w-5 h-5 mr-2" />
                    Pesan via WhatsApp
                  </Button>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    size="lg"
                    onClick={handleShopeeClick}
                    className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-8 py-6 text-base sm:text-lg font-semibold shadow-lg hover:shadow-2xl transition-all"
                  >
                    🛒 Pesan via Shopee
                  </Button>
                </motion.div>
              </motion.div>

              {/* Reseller button with new style */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.6 }}
                className="mt-4"
              >
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    size="lg"
                    onClick={handleResellerClick}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-6 text-base sm:text-lg font-semibold shadow-lg hover:shadow-2xl transition-all w-full sm:w-auto"
                  >
                    <Sparkles className="w-5 h-5 mr-2" />
                    Bergabung Reseller Premium
                  </Button>
                </motion.div>
              </motion.div>
            </motion.div>

            {/* Right visual dengan enhanced animation */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ delay: 0.6, duration: 1, type: "spring" }}
              className="relative"
            >
              <div className="relative w-full aspect-square max-w-lg mx-auto">
                {/* Animated glow effect */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-br from-amber-400 to-amber-600 rounded-3xl blur-2xl opacity-50"
                  animate={{
                    scale: [1, 1.1, 1],
                    opacity: [0.5, 0.7, 0.5],
                  }}
                  transition={{ duration: 4, repeat: Infinity }}
                />

                {/* Main product card */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-br from-amber-400 to-amber-600 rounded-3xl shadow-2xl flex items-center justify-center overflow-hidden"
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  {productImage ? (
                    <div className="relative w-full h-full">
                      <Image
                        src={productImage}
                        alt="Zari Premium Honey"
                        fill
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="text-center text-white p-8 relative z-10">
                      <motion.div
                        animate={{ rotate: [0, 5, -5, 0] }}
                        transition={{ duration: 3, repeat: Infinity }}
                        className="text-8xl mb-4"
                      >
                        🍯
                      </motion.div>
                      <p className="text-2xl font-bold">Zari Premium Honey</p>
                      <p className="text-sm mt-2 opacity-90">
                        100% Murni & Natural
                      </p>
                    </div>
                  )}

                  {/* Decorative pattern overlay */}
                  <div className="absolute inset-0 opacity-10">
                    <div
                      className="absolute inset-0"
                      style={{
                        backgroundImage:
                          "radial-gradient(circle, white 1px, transparent 1px)",
                        backgroundSize: "30px 30px",
                      }}
                    />
                  </div>
                </motion.div>

                {/* Floating decorative elements */}
                <motion.div
                  className="absolute -top-4 -right-4 w-24 h-24 bg-amber-300 rounded-full blur-xl"
                  animate={{
                    y: [0, -20, 0],
                    opacity: [0.5, 0.8, 0.5],
                  }}
                  transition={{ duration: 3, repeat: Infinity }}
                />
                <motion.div
                  className="absolute -bottom-4 -left-4 w-32 h-32 bg-amber-400 rounded-full blur-xl"
                  animate={{
                    y: [0, 20, 0],
                    opacity: [0.5, 0.8, 0.5],
                  }}
                  transition={{ duration: 4, repeat: Infinity, delay: 0.5 }}
                />
              </div>
            </motion.div>
          </div>
        </div>

        {/* Enhanced scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 0.6 }}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className="w-6 h-10 border-2 border-amber-600 rounded-full flex items-start justify-center p-2 cursor-pointer hover:border-amber-700 transition-colors"
          >
            <motion.div
              className="w-1 h-2 bg-amber-600 rounded-full"
              animate={{ y: [0, 8, 0] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
            />
          </motion.div>
        </motion.div>
      </section>

      {/* Running Text */}
      <RunningText />
    </>
  );
}
