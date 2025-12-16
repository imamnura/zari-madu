import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Calendar, Clock, ArrowLeft, User, ArrowRight } from "lucide-react";
import { ARTICLES } from "@/lib/constants";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

// Force dynamic rendering - no caching
export const dynamic = "force-dynamic";
export const revalidate = 0;

async function getArticles() {
  try {
    const content = await prisma.articleContent.findFirst({
      orderBy: { updatedAt: "desc" },
    });

    if (!content || !content.articles) {
      return ARTICLES;
    }

    const articles =
      typeof content.articles === "string"
        ? JSON.parse(content.articles)
        : content.articles;

    return articles.length > 0 ? articles : ARTICLES;
  } catch (error) {
    console.error("Error fetching articles:", error);
    return ARTICLES;
  }
}

export default async function ArticleDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const articles = await getArticles();
  const article = articles.find((a: any) => a.slug === slug);

  if (!article) {
    notFound();
  }

  // Get related articles (exclude current article, max 3)
  const relatedArticles = articles
    .filter((a: any) => a.id !== article.id)
    .slice(0, 3);

  return (
    <div className="min-h-screen">
      <Header />
      <main className="pt-24 lg:pt-28 pb-20">
        <article className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
          {/* Back button */}
          <Link href="/articles">
            <Button variant="ghost" className="mb-6">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Kembali ke Artikel
            </Button>
          </Link>

          {/* Article Header */}
          <div className="mb-8">
            <Badge className="bg-amber-600 text-white mb-4">
              {article.category}
            </Badge>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              {article.title}
            </h1>

            {/* Meta info */}
            <div className="flex flex-wrap items-center gap-6 text-gray-600 mb-6">
              <span className="flex items-center gap-2">
                <User className="w-4 h-4" />
                {article.author}
              </span>
              <span className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                {article.date}
              </span>
              <span className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                {article.readTime}
              </span>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-2">
              {article.tags.map((tag: string) => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className="bg-amber-50 text-amber-700"
                >
                  #{tag}
                </Badge>
              ))}
            </div>
          </div>

          {/* Featured Image */}
          <div className="w-full aspect-video bg-gradient-to-br from-amber-100 to-amber-200 rounded-2xl overflow-hidden mb-12">
            {article.image ? (
              <img
                src={article.image}
                alt={article.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="text-9xl mb-4">📰</div>
                  <p className="text-amber-800">Article Featured Image</p>
                </div>
              </div>
            )}
          </div>

          {/* Article Content */}
          <div className="prose prose-lg max-w-none mb-12">
            <div
              className="article-content"
              dangerouslySetInnerHTML={{ __html: article.content }}
            />
          </div>

          {/* CTA Box */}
          <div className="bg-gradient-to-r from-amber-50 to-amber-100 p-8 rounded-2xl border-2 border-amber-300 mb-12">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Tertarik Mencoba Madu Premium Kami?
            </h3>
            <p className="text-gray-700 mb-6">
              Dapatkan manfaat kesehatan maksimal dengan madu murni 100% dari
              Zari Life
            </p>
            <Link href="/#products">
              <Button
                size="lg"
                className="bg-amber-600 hover:bg-amber-700 text-white"
              >
                Lihat Produk Kami
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </article>

        {/* Related Articles */}
        {relatedArticles.length > 0 && (
          <section className="container mx-auto px-4 sm:px-6 lg:px-8 mt-20">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">
              Artikel Terkait
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              {relatedArticles.map((relatedArticle: any) => (
                <Link
                  key={relatedArticle.id}
                  href={`/articles/${relatedArticle.slug}`}
                >
                  <Card className="h-full hover:shadow-xl transition-all duration-300 group border-2 hover:border-amber-300">
                    <div className="relative w-full aspect-video bg-gradient-to-br from-amber-100 to-amber-200 overflow-hidden">
                      <Badge className="absolute top-4 left-4 bg-amber-600 text-white z-10">
                        {relatedArticle.category}
                      </Badge>
                      {relatedArticle.image ? (
                        <img
                          src={relatedArticle.image}
                          alt={relatedArticle.title}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="text-6xl">📰</div>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-amber-600/0 group-hover:bg-amber-600/10 transition-colors duration-300" />
                    </div>
                    <CardHeader className="pb-3">
                      <h3 className="text-lg font-bold text-gray-900 group-hover:text-amber-700 transition-colors line-clamp-2">
                        {relatedArticle.title}
                      </h3>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                        {relatedArticle.excerpt}
                      </p>
                      <div className="flex items-center text-amber-600 font-semibold text-sm">
                        Baca Artikel
                        <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>
      <Footer />
    </div>
  );
}

// Generate static params for all articles
export async function generateStaticParams() {
  const articles = await getArticles();
  return articles.map((article: any) => ({
    slug: article.slug,
  }));
}
