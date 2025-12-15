import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, ArrowLeft, ArrowRight } from "lucide-react";
import { ARTICLES } from "@/lib/constants";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export default function ArticlesPage() {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="pt-24 lg:pt-28 pb-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-16">
            <Link href="/">
              <Button variant="ghost" className="mb-6">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Kembali ke Beranda
              </Button>
            </Link>
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
              Artikel & Tips Kesehatan
            </h1>
            <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
              Pelajari lebih lanjut tentang madu, kesehatan, dan tips hidup
              sehat
            </p>
          </div>

          {/* Articles Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {ARTICLES.map((article) => (
              <Link key={article.id} href={`/articles/${article.slug}`}>
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
                    <h3 className="text-xl font-bold text-gray-900 group-hover:text-amber-700 transition-colors line-clamp-2 mb-2">
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
                    <div className="flex items-center text-amber-600 font-semibold text-sm group-hover:text-amber-700">
                      Baca Selengkapnya
                      <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
