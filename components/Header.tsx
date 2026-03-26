"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Menu, X } from "lucide-react";
const navigation = [
  { name: "Tentang", href: "#about" },
  { name: "Koleksi", href: "#products" },
  { name: "Mengapa Zari", href: "#why-zari" },
  { name: "Testimoni", href: "#testimonials" },
  { name: "Pesan Sekarang", href: "#cta" },
];

export function Header() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [siteName, setSiteName] = useState("Zari Honey");

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const fetchSiteName = async () => {
      try {
        const response = await fetch("/api/admin/settings");
        const data = await response.json();
        if (data.siteName) {
          setSiteName(data.siteName);
        }
      } catch (error) {
        console.error("Error fetching site name:", error);
      }
    };

    fetchSiteName();
  }, []);

  const goHome = () => {
    setMobileMenuOpen(false);
    if (isHome) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      window.location.assign("/");
    }
  };

  /** Di beranda: scroll halus. Di halaman lain: navigasi ke `/#id` agar section ada di DOM. */
  const scrollToSection = (href: string) => {
    setMobileMenuOpen(false);
    if (href === "#") {
      goHome();
      return;
    }
    if (isHome) {
      const element = document.querySelector(href);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
      return;
    }
    window.location.assign(`/${href}`);
  };

  const navLinkClass =
    "text-sm font-semibold leading-6 text-gray-700 hover:text-amber-600 transition-colors";
  const mobileNavLinkClass =
    "block w-full text-left px-3 py-2 text-base font-semibold leading-7 text-gray-700 hover:bg-amber-50 rounded-md transition-colors";

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-[110] transition-all duration-300 ${
        scrolled ? "bg-white/95 backdrop-blur-md shadow-md" : "bg-transparent"
      }`}
    >
      <nav
        className="container mx-auto px-4 sm:px-6 lg:px-8"
        aria-label="Global"
      >
        <div className="flex h-16 lg:h-20 items-center justify-between">
          {/* Logo */}
          <div className="flex lg:flex-1">
            <button
              type="button"
              onClick={goHome}
              className="-m-1.5 p-1.5 cursor-pointer hover:opacity-80 transition-opacity"
            >
              <span className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-amber-600 to-amber-800 bg-clip-text text-transparent">
                {siteName}
              </span>
            </button>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex lg:gap-x-8">
            {navigation.map((item) =>
              isHome ? (
                <button
                  key={item.name}
                  type="button"
                  onClick={() => scrollToSection(item.href)}
                  className={navLinkClass}
                >
                  {item.name}
                </button>
              ) : (
                <Link
                  key={item.name}
                  href={`/${item.href}`}
                  className={navLinkClass}
                >
                  {item.name}
                </Link>
              ),
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex lg:hidden">
            <button
              type="button"
              className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-700"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <span className="sr-only">Toggle menu</span>
              {mobileMenuOpen ? (
                <X className="h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="lg:hidden py-4 bg-white rounded-b-2xl shadow-lg"
          >
            <div className="space-y-2">
              {navigation.map((item) =>
                isHome ? (
                  <button
                    key={item.name}
                    type="button"
                    onClick={() => scrollToSection(item.href)}
                    className={mobileNavLinkClass}
                  >
                    {item.name}
                  </button>
                ) : (
                  <Link
                    key={item.name}
                    href={`/${item.href}`}
                    className={mobileNavLinkClass}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.name}
                  </Link>
                ),
              )}
            </div>
          </motion.div>
        )}
      </nav>
    </header>
  );
}
