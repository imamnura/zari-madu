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
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
