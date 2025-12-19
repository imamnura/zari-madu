import { PrismaClient } from "@prisma/client";
import { uploadToCloudinary } from "../lib/cloudinary";

const prisma = new PrismaClient();

async function migrateImages() {
  console.log("🚀 Starting migration to Cloudinary...\n");

  try {
    // 1. Migrate Hero Content
    console.log("📸 Migrating Hero Content images...");
    const heroes = await prisma.heroContent.findMany();

    for (const hero of heroes) {
      if (hero.productImage && hero.productImage.startsWith("data:image")) {
        console.log(`  Migrating hero #${hero.id}...`);

        try {
          // Convert base64 to buffer
          const base64Data = hero.productImage.split(",")[1];
          const buffer = Buffer.from(base64Data, "base64");

          // Upload to Cloudinary
          const result = await uploadToCloudinary(buffer, "zari-honey/heroes");

          // Update database
          await prisma.heroContent.update({
            where: { id: hero.id },
            data: { productImage: result.secure_url },
          });

          console.log(`  ✅ Hero #${hero.id} migrated`);
        } catch (error) {
          console.error(`  ❌ Failed to migrate hero #${hero.id}:`, error);
        }
      } else {
        console.log(`  ⏭️  Hero #${hero.id} - no base64 image found`);
      }
    }

    // 2. Honey Collection - Images stored in JSON field, not as base64
    console.log("\n🍯 Honey Collection - Skipped (images in JSON structure)");

    // 3. About Content - No imageUrl field in schema
    console.log("\n📄 About Content - Skipped (no imageUrl field)");

    // 4. Articles - Images stored in JSON field as URLs from TiptapEditor
    console.log("\n📰 Articles - Skipped (images managed by TiptapEditor)");

    console.log("\n✨ Migration completed successfully!");
    console.log("\n💡 Next steps:");
    console.log("1. Verify images are displaying correctly");
    console.log("2. Check Cloudinary dashboard for uploaded images");
    console.log("3. Test new uploads through admin panel");
    console.log("4. Monitor Cloudinary usage in dashboard");
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

migrateImages();
