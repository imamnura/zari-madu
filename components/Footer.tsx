"use client";

import { Instagram, MessageCircle, Mail } from "lucide-react";
import { CONTACT_INFO } from "@/lib/constants";

export function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-12 lg:py-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-12 items-start">
          {/* Left: Brand & Contact */}
          <div>
            <h3 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-amber-400 to-amber-600 bg-clip-text text-transparent mb-8">
              Zari Life
            </h3>

            <div className="space-y-4">
              <a
                href={`https://wa.me/${CONTACT_INFO.whatsapp.replace(
                  /\D/g,
                  ""
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 text-gray-300 hover:text-amber-400 transition-colors group"
              >
                <div className="w-10 h-10 bg-amber-600 rounded-full flex items-center justify-center group-hover:bg-amber-500 transition-colors">
                  <MessageCircle className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="text-xs text-gray-500">WhatsApp</div>
                  <div className="font-semibold">{CONTACT_INFO.whatsapp}</div>
                </div>
              </a>

              <a
                href={CONTACT_INFO.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 text-gray-300 hover:text-amber-400 transition-colors group"
              >
                <div className="w-10 h-10 bg-amber-600 rounded-full flex items-center justify-center group-hover:bg-amber-500 transition-colors">
                  <Instagram className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="text-xs text-gray-500">Instagram</div>
                  <div className="font-semibold">@zarihoney</div>
                </div>
              </a>

              <a
                href={`mailto:${CONTACT_INFO.email}`}
                className="flex items-center gap-3 text-gray-300 hover:text-amber-400 transition-colors group"
              >
                <div className="w-10 h-10 bg-amber-600 rounded-full flex items-center justify-center group-hover:bg-amber-500 transition-colors">
                  <Mail className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="text-xs text-gray-500">Email</div>
                  <div className="font-semibold">{CONTACT_INFO.email}</div>
                </div>
              </a>
            </div>
          </div>

          {/* Right: Google Maps */}
          <div>
            <h4 className="text-lg font-bold mb-4">Lokasi Kami</h4>
            <div className="rounded-2xl overflow-hidden shadow-2xl border-4 border-amber-600/20">
              <iframe
                src={CONTACT_INFO.mapsEmbed}
                width="100%"
                height="300"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Lokasi Zari Life"
              />
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-gray-800 mt-12 pt-8">
          <p className="text-center text-gray-400 text-sm">
            © 2025 Zari Life. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
