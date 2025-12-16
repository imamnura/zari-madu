import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  try {
    // Get the current hero content
    const heroContent = await prisma.heroContent.findFirst({
      where: { id: "default" },
    });

    if (heroContent) {
      console.log("Current badges:", heroContent.badges);
      console.log("Current typewriterTexts:", heroContent.typewriterTexts);

      // Update with properly formatted JSON
      await prisma.heroContent.update({
        where: { id: "default" },
        data: {
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
        },
      });

      console.log("✅ Hero content updated successfully");
    } else {
      console.log("❌ No hero content found");
    }
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
