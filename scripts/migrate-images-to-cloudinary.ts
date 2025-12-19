import { PrismaClient } from "@prisma/client";
import { uploadToCloudinary } from "../lib/cloudinary";

const prisma = new PrismaClient();

/**
 * Migration script untuk convert base64 images ke Cloudinary URLs
 *
 * Usage: npx tsx scripts/migrate-images-to-cloudinary.ts
 */
async function migrateImages() {
  console.log("🚀 Starting migration to Cloudinary...\n");

  try {
    // Migrate Hero Content (productImage field)
    console.log("📸 Migrating Hero Content images...");
    const heroes = await prisma.heroContent.findMany();
    let heroMigrated = 0;

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

          heroMigrated++;
          console.log(`  ✅ Hero #${hero.id} migrated successfully`);
        } catch (error) {
          console.error(`  ❌ Failed to migrate hero #${hero.id}:`, error);
        }
      }
    }

    console.log(`\n✨ Migration completed!`);
    console.log(`  Heroes migrated: ${heroMigrated}/${heroes.length}`);

    console.log("\n💡 Next steps:");
    console.log("1. Verify images display correctly on website");
    console.log(
      "2. Check Cloudinary dashboard: https://cloudinary.com/console"
    );
    console.log("3. Test new uploads through admin panel");
    console.log("4. Monitor usage in Cloudinary dashboard");
    console.log("\n🎉 All done!");
  } catch (error) {
    console.error("\n❌ Migration failed:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run migration
migrateImages();
