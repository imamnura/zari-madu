import { HeaderNav } from "@/components/HeaderNav";
import { getSiteSettings } from "@/lib/data/content";

export async function Header() {
  const { siteName } = await getSiteSettings();
  return <HeaderNav siteName={siteName} />;
}
