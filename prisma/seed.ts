import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // Create default admin user
  const hashedPassword = await bcrypt.hash("admin123", 10);

  const admin = await prisma.admin.upsert({
    where: { email: "admin@zarilife.com" },
    update: {},
    create: {
      email: "admin@zarilife.com",
      password: hashedPassword,
      name: "Admin Zari Life",
    },
  });

  console.log("✅ Admin user created:", admin.email);

  // Create default hero content
  const heroContent = await prisma.heroContent.upsert({
    where: { id: "default" },
    update: {},
    create: {
      id: "default",
      badges: JSON.stringify([
        "100% Raw Honey",
        "Single-Origin",
        "Lab Tested",
        "Premium Quality",
      ]),
      typewriterTexts: JSON.stringify([
        "Madu Premium Asli dari Alam Indonesia",
        "Kualitas Terpercaya - Tanpa Aditif",
      ]),
      description:
        "Nikmati kemurnian alam dalam setiap tetes. 100% murni, tanpa campuran, langsung dari sumbernya.",
      productImage: null,
    },
  });

  console.log("✅ Hero content created");

  // Create default about content
  const aboutContent = await prisma.aboutContent.upsert({
    where: { id: "default" },
    update: {},
    create: {
      id: "default",
      tagline: "Terpercaya & Berkualitas",
      heading: "Tentang Zari Life",
      body: "Zari Life hadir dengan komitmen menghadirkan madu dan hasil alam Indonesia yang premium, murni, dan berkualitas tinggi. Kami bekerja langsung dengan peternak lokal terpilih untuk memastikan setiap produk memenuhi standar kualitas tertinggi.",
      stats: JSON.stringify([
        { value: "1M+", label: "Pelanggan Puas" },
        { value: "100%", label: "Madu Murni" },
        { value: "50+", label: "Sumber Panen" },
        { value: "10+", label: "Tahun Pengalaman" },
      ]),
    },
  });

  console.log("✅ About content created");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
