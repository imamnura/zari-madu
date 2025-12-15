"use client";

import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, ArrowRight } from "lucide-react";
import { ARTICLES } from "@/lib/constants";
import Link from "next/link";

export function ArticlesSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section
      id="articles"
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
          <Badge className="bg-amber-100 text-amber-800 mb-4">
            Artikel & Tips
          </Badge>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Edukasi Sehat dengan Madu
          </h2>
          <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
            Tips, resep, dan informasi bermanfaat seputar madu dan kesehatan
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {ARTICLES.slice(0, 4).map((article, index) => (
            <motion.div
              key={article.id}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.1 * index, duration: 0.6 }}
            >
              <Link href={`/articles/${article.slug}`}>
                <Card className="h-full hover:shadow-2xl transition-all duration-300 group overflow-hidden border-2 hover:border-amber-300 cursor-pointer">
                  {/* Article Image */}
                  <div className="relative w-full aspect-video bg-gradient-to-br from-amber-100 to-amber-200 overflow-hidden">
                    <Badge className="absolute top-4 left-4 bg-amber-600 text-white z-10">
                      {article.category}
                    </Badge>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center p-8">
                        <div className="text-6xl mb-2">📰</div>
                        <p className="text-xs text-amber-800">Article Image</p>
                      </div>
                    </div>
                    <div className="absolute inset-0 bg-amber-600/0 group-hover:bg-amber-600/10 transition-colors duration-300" />
                  </div>

                  <CardHeader className="pb-3">
                    <h3 className="text-lg font-bold text-gray-900 group-hover:text-amber-700 transition-colors line-clamp-2 mb-2">
                      {article.title}
                    </h3>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {article.date}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {article.readTime}
                      </span>
                    </div>
                  </CardHeader>

                  <CardContent>
                    <p className="text-sm text-gray-600 line-clamp-3 mb-4">
                      {article.excerpt}
                    </p>
                    <Button
                      variant="ghost"
                      className="text-amber-600 hover:text-amber-700 hover:bg-amber-50 font-semibold p-0 h-auto"
                    >
                      Baca Selengkapnya
                      <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* CTA to see all articles */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="text-center"
        >
          <Link href="/articles">
            <Button
              size="lg"
              variant="outline"
              className="border-2 border-amber-600 text-amber-600 hover:bg-amber-50 px-8 py-6 text-base sm:text-lg font-semibold"
            >
              Lihat Semua Artikel
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
