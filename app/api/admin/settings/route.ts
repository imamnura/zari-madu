import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const settingsSchema = z.object({
  siteName: z.string().min(1, "Nama site harus diisi"),
  whatsapp: z.string().min(10, "Nomor WhatsApp minimal 10 karakter"),
  instagram: z.string().url("Instagram harus berupa URL yang valid"),
  email: z.string().email("Email harus valid"),
  shopeeLink: z.string().url("Link Shopee harus berupa URL yang valid"),
  mapsLocation: z.string().url("Link Maps harus berupa URL yang valid"),
  mapsEmbed: z.string().min(10, "Embed code Maps harus diisi"),
});

// GET - Fetch settings
export async function GET() {
  try {
    let settings = await prisma.settings.findFirst({
      orderBy: { updatedAt: "desc" },
    });

    // If no settings exist, create default
    if (!settings) {
      settings = await prisma.settings.create({
        data: {
          siteName: "Zari Honey",
          whatsapp: "+6285777578827",
          instagram: "https://www.instagram.com/zarihoney",
          email: "info@zarilife.com",
          shopeeLink: "https://id.shp.ee/GgH8AKs",
          mapsLocation: "https://maps.app.goo.gl/Yfnw3MHWgm2YPEeU8",
          mapsEmbed:
            "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15856.26522818341!2d107.44402569879621!3d-6.513291791330821!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e690d5a79b9f5f7%3A0x8213696bb15cd519!2sToko%20Madu%20ZARI%20HONEY%20%7C%20Pusat%20Dan%20Grosir%20Madu%20Asli%20(Murni)!5e0!3m2!1sen!2sid!4v1765776563151!5m2!1sen!2sid",
        },
      });
    }

    return NextResponse.json(settings);
  } catch (error) {
    console.error("Error fetching settings:", error);
    return NextResponse.json(
      { error: "Failed to fetch settings" },
      { status: 500 }
    );
  }
}

// PUT - Update settings
export async function PUT(request: Request) {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = settingsSchema.parse(body);

    // Find existing settings or get the first one
    const existingSettings = await prisma.settings.findFirst();

    let settings;
    if (existingSettings) {
      settings = await prisma.settings.update({
        where: { id: existingSettings.id },
        data: validatedData,
      });
    } else {
      settings = await prisma.settings.create({
        data: validatedData,
      });
    }

    return NextResponse.json(settings);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      );
    }

    console.error("Error updating settings:", error);
    return NextResponse.json(
      { error: "Failed to update settings" },
      { status: 500 }
    );
  }
}
