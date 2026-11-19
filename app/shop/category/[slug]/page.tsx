import { redirect } from "next/navigation";

interface ICategoryPageProps {
  params: Promise<{ slug: string }>;
}

export default async function CategoryPage({ params }: ICategoryPageProps) {
  const { slug } = await params;
  redirect(`/shop?category=${encodeURIComponent(slug)}`);
}
