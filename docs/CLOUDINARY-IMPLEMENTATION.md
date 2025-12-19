# 🖼️ Implementasi Cloudinary untuk Zari Honey

## 📋 Daftar Isi

1. [Overview](#overview)
2. [Kenapa Cloudinary?](#kenapa-cloudinary)
3. [Setup Cloudinary](#setup-cloudinary)
4. [Instalasi Dependencies](#instalasi-dependencies)
5. [Environment Variables](#environment-variables)
6. [Implementasi Backend](#implementasi-backend)
7. [Implementasi Frontend](#implementasi-frontend)
8. [Update Semua Upload Points](#update-semua-upload-points)
9. [Testing](#testing)
10. [Migration dari Base64](#migration-dari-base64)

---

## 🎯 Overview

Dokumen ini menjelaskan cara mengimplementasikan **Cloudinary** sebagai solusi penyimpanan gambar untuk Zari Honey website.

### Arsitektur Baru:

```
┌─────────────┐      ┌─────────────┐      ┌─────────────┐
│   Browser   │─────▶│  Next.js    │─────▶│ Cloudinary  │
│  (Upload)   │      │  API Route  │      │   Storage   │
└─────────────┘      └─────────────┘      └─────────────┘
                            │
                            ▼
                     ┌─────────────┐
                     │  Database   │
                     │ (image_url) │
                     └─────────────┘
```

**Yang Disimpan di Database:** Hanya URL string (bukan base64)

---

## 🌟 Kenapa Cloudinary?

### ✅ Kelebihan Cloudinary

1. **Free Tier Generous**

   - 25 GB storage gratis
   - 25 GB bandwidth/bulan gratis
   - Unlimited transformations
   - 1 juta transformasi/bulan

2. **Automatic Image Optimization**

   - Auto format (WebP, AVIF)
   - Auto quality adjustment
   - Lazy loading support
   - Responsive images

3. **Built-in Transformations**

   - Resize on-the-fly
   - Crop, rotate, effects
   - Watermarking
   - Face detection

4. **Fast CDN**

   - Global CDN delivery
   - Auto compression
   - Cache optimization
   - Low latency

5. **Easy Integration**
   - Official SDK
   - Next.js friendly
   - Simple API
   - Great documentation

### 📊 Perbandingan dengan Base64

| Feature         | Base64 (Current) | Cloudinary          |
| --------------- | ---------------- | ------------------- |
| Storage         | Database (bloat) | Cloud (dedicated)   |
| Performance     | Slow queries     | Fast CDN            |
| Bandwidth       | Server bandwidth | CDN bandwidth       |
| Optimization    | Manual           | Automatic           |
| Transformations | None             | On-the-fly          |
| Cost            | Database cost    | Free tier available |
| Scalability     | Limited          | Unlimited           |

---

## 🚀 Setup Cloudinary

### Step 1: Create Cloudinary Account

1. Buka [cloudinary.com](https://cloudinary.com)
2. Klik **"Sign Up for Free"**
3. Isi form registrasi atau gunakan GitHub/Google
4. Verifikasi email

### Step 2: Get Credentials

Setelah login, di **Dashboard** kamu akan melihat:

```
Cloud Name: your-cloud-name
API Key: 123456789012345
API Secret: AbCdEfGhIjKlMnOpQrStUvWxYz
```

**PENTING:** Simpan credentials ini dengan aman!

### Step 3: Configure Upload Preset (Optional tapi Recommended)

1. Pergi ke **Settings** → **Upload**
2. Scroll ke **Upload presets**
3. Klik **Add upload preset**
4. Isi:
   - **Preset name:** `zari-honey-uploads`
   - **Signing Mode:** `Unsigned` (untuk upload langsung dari browser)
   - **Folder:** `zari-honey/` (opsional)
   - **Allowed formats:** `jpg, png, webp, gif`
   - **Max file size:** `10 MB`
   - **Transformation:**
     - Width: 1920
     - Height: 1080
     - Crop: limit
     - Quality: auto
5. Klik **Save**

---

## 📦 Instalasi Dependencies

Install Cloudinary SDK:

```bash
pnpm add cloudinary next-cloudinary
```

**Package explanation:**

- `cloudinary`: Official SDK untuk Node.js (server-side)
- `next-cloudinary`: React components untuk Next.js (optional)

---

## 🔐 Environment Variables

Buat atau update file `.env.local`:

```env
# Cloudinary Configuration
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=123456789012345
CLOUDINARY_API_SECRET=AbCdEfGhIjKlMnOpQrStUvWxYz
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=zari-honey-uploads
```

**PENTING:**

- `NEXT_PUBLIC_*` = Accessible di browser (untuk direct upload)
- Tanpa `NEXT_PUBLIC_` = Server-side only (untuk signed uploads)

Update `.env.example`:

```env
# Cloudinary Configuration
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=zari-honey-uploads
```

---

## 🛠️ Implementasi Backend

### 1. Create Cloudinary Client Utility

Buat file `lib/cloudinary.ts`:

```typescript
import { v2 as cloudinary } from "cloudinary";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Upload image buffer to Cloudinary
 * @param buffer - Image buffer from uploaded file
 * @param folder - Folder path in Cloudinary (e.g., 'zari-honey/heroes')
 * @returns Cloudinary upload result with secure_url
 */
export async function uploadToCloudinary(
  buffer: Buffer,
  folder: string = "zari-honey"
): Promise<{ secure_url: string; public_id: string }> {
  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        {
          folder,
          resource_type: "auto",
          transformation: [
            { width: 1920, height: 1080, crop: "limit" },
            { quality: "auto:best" },
            { fetch_format: "auto" },
          ],
        },
        (error, result) => {
          if (error) {
            reject(error);
          } else if (result) {
            resolve({
              secure_url: result.secure_url,
              public_id: result.public_id,
            });
          } else {
            reject(new Error("Upload failed"));
          }
        }
      )
      .end(buffer);
  });
}

/**
 * Delete image from Cloudinary
 * @param publicId - Public ID of the image to delete
 */
export async function deleteFromCloudinary(publicId: string): Promise<void> {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error("Error deleting from Cloudinary:", error);
    throw error;
  }
}

/**
 * Get optimized image URL with transformations
 * @param publicId - Public ID of the image
 * @param width - Desired width
 * @param height - Desired height
 */
export function getOptimizedImageUrl(
  publicId: string,
  width?: number,
  height?: number
): string {
  const transformations = [];

  if (width || height) {
    transformations.push({
      width,
      height,
      crop: "fill",
      gravity: "auto",
    });
  }

  transformations.push({ quality: "auto:best" }, { fetch_format: "auto" });

  return cloudinary.url(publicId, {
    transformation: transformations,
  });
}

export default cloudinary;
```

### 2. Create Upload API Route

Buat file `app/api/admin/cloudinary-upload/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { uploadToCloudinary } from "@/lib/cloudinary";

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get form data
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const folder = (formData.get("folder") as string) || "zari-honey";

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file type
    const validTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        {
          error:
            "Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed.",
        },
        { status: 400 }
      );
    }

    // Validate file size (10MB max)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "File too large. Maximum size is 10MB." },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload to Cloudinary
    const result = await uploadToCloudinary(buffer, folder);

    return NextResponse.json({
      success: true,
      url: result.secure_url,
      publicId: result.public_id,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload image" },
      { status: 500 }
    );
  }
}
```

---

## 💻 Implementasi Frontend

### 1. Update TiptapEditor Component

Update `components/admin/TiptapEditor.tsx`:

```typescript
// Add this image upload function
const handleImageUpload = async (file: File) => {
  try {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", "zari-honey/articles");

    const response = await fetch("/api/admin/cloudinary-upload", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error("Upload failed");
    }

    const data = await response.json();
    return data.url; // Return Cloudinary URL
  } catch (error) {
    console.error("Error uploading image:", error);
    throw error;
  }
};

// Update Image extension configuration
Image.configure({
  inline: true,
  allowBase64: false, // Disable base64
  HTMLAttributes: {
    class: "rounded-lg max-w-full h-auto",
  },
});

// Update addImage command in the toolbar
editor
  ?.chain()
  .focus()
  .insertContent({
    type: "image",
    attrs: {
      src: imageUrl, // Use Cloudinary URL instead of base64
      alt: file.name,
    },
  })
  .run();
```

**Full TiptapEditor image handler:**

```typescript
// Add to your TiptapEditor component
const addImage = useCallback(() => {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = "image/*";

  input.onchange = async (e) => {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (!file) return;

    try {
      // Show loading state
      const loadingNode = editor
        ?.chain()
        .focus()
        .insertContent("<p>Uploading image...</p>")
        .run();

      // Upload to Cloudinary
      const imageUrl = await handleImageUpload(file);

      // Remove loading text and insert image
      editor
        ?.chain()
        .focus()
        .deleteRange({
          from: editor.state.selection.from - 1,
          to: editor.state.selection.to,
        })
        .insertContent({
          type: "image",
          attrs: {
            src: imageUrl,
            alt: file.name,
          },
        })
        .run();
    } catch (error) {
      console.error("Error uploading image:", error);
      alert("Failed to upload image");
    }
  };

  input.click();
}, [editor]);
```

### 2. Update Hero Image Upload

Update `app/admin/dashboard/hero/page.tsx`:

```typescript
// Replace base64 conversion with Cloudinary upload
const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (!file) return;

  try {
    setIsLoading(true);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", "zari-honey/heroes");

    const response = await fetch("/api/admin/cloudinary-upload", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error("Upload failed");
    }

    const data = await response.json();

    // Set image URL from Cloudinary
    setImageUrl(data.url);
  } catch (error) {
    console.error("Error uploading image:", error);
    alert("Failed to upload image");
  } finally {
    setIsLoading(false);
  }
};

// When saving, use imageUrl directly
const response = await fetch("/api/admin/hero-content", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    ...formData,
    imageUrl: imageUrl, // Cloudinary URL, not base64
  }),
});
```

### 3. Update Honey Collection Image Upload

Update `app/admin/dashboard/honey-collection/page.tsx`:

```typescript
// Add upload handler
const uploadImage = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("folder", "zari-honey/products");

  const response = await fetch("/api/admin/cloudinary-upload", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error("Upload failed");
  }

  const data = await response.json();
  return data.url;
};

// Update form handler
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);

  try {
    let imageUrl = formData.imageUrl;

    // If new image selected, upload to Cloudinary
    if (imageFile) {
      imageUrl = await uploadImage(imageFile);
    }

    const response = await fetch("/api/admin/honey-collection-content", {
      method: editingId ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...formData,
        imageUrl, // Cloudinary URL
      }),
    });

    if (response.ok) {
      fetchCollections();
      resetForm();
      alert("Honey collection saved successfully!");
    }
  } catch (error) {
    console.error("Error:", error);
    alert("Failed to save honey collection");
  } finally {
    setLoading(false);
  }
};
```

### 4. Create Reusable Upload Component (Optional)

Buat `components/admin/CloudinaryUpload.tsx`:

```typescript
"use client";

import { useState } from "react";
import { Upload, X, Loader2 } from "lucide-react";
import Image from "next/image";

interface CloudinaryUploadProps {
  folder: string;
  currentImageUrl?: string;
  onImageUploaded: (url: string) => void;
  maxSize?: number; // in MB
}

export default function CloudinaryUpload({
  folder,
  currentImageUrl,
  onImageUploaded,
  maxSize = 10,
}: CloudinaryUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(currentImageUrl);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size
    if (file.size > maxSize * 1024 * 1024) {
      setError(`File size must be less than ${maxSize}MB`);
      return;
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setError("Please select an image file");
      return;
    }

    setError(null);
    setIsUploading(true);

    try {
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);

      // Upload to Cloudinary
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", folder);

      const response = await fetch("/api/admin/cloudinary-upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      const data = await response.json();
      onImageUploaded(data.url);
    } catch (error) {
      console.error("Upload error:", error);
      setError("Failed to upload image. Please try again.");
      setPreviewUrl(currentImageUrl);
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemove = () => {
    setPreviewUrl(undefined);
    onImageUploaded("");
  };

  return (
    <div className="space-y-4">
      {previewUrl ? (
        <div className="relative w-full h-64 border-2 border-gray-200 rounded-lg overflow-hidden">
          <Image src={previewUrl} alt="Preview" fill className="object-cover" />
          {!isUploading && (
            <button
              onClick={handleRemove}
              className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          {isUploading && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-white animate-spin" />
            </div>
          )}
        </div>
      ) : (
        <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-amber-500 transition">
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <Upload className="w-12 h-12 text-gray-400 mb-3" />
            <p className="mb-2 text-sm text-gray-500">
              <span className="font-semibold">Click to upload</span> or drag and
              drop
            </p>
            <p className="text-xs text-gray-500">
              PNG, JPG, WebP or GIF (MAX. {maxSize}MB)
            </p>
          </div>
          <input
            type="file"
            className="hidden"
            accept="image/*"
            onChange={handleFileChange}
            disabled={isUploading}
          />
        </label>
      )}

      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}
```

**Usage example:**

```typescript
import CloudinaryUpload from "@/components/admin/CloudinaryUpload";

// In your form component
<CloudinaryUpload
  folder="zari-honey/heroes"
  currentImageUrl={formData.imageUrl}
  onImageUploaded={(url) => setFormData({ ...formData, imageUrl: url })}
  maxSize={10}
/>;
```

---

## 🔄 Update Semua Upload Points

### Summary of Files to Update:

1. **TiptapEditor** - `components/admin/TiptapEditor.tsx`

   - Update image insertion to use Cloudinary
   - Remove base64 conversion

2. **Hero Section** - `app/admin/dashboard/hero/page.tsx`

   - Replace base64 with Cloudinary upload
   - Store only URL in database

3. **Honey Collection** - `app/admin/dashboard/honey-collection/page.tsx`

   - Update product image upload
   - Use Cloudinary URLs

4. **Articles** - If you have article image uploads

   - Update to use Cloudinary
   - Store URLs in database

5. **Testimonials** - If you have testimonial images

   - Update to use Cloudinary
   - Store URLs in database

6. **Settings/Logo** - `app/admin/dashboard/settings/page.tsx`
   - Update logo upload to Cloudinary

---

## 🧪 Testing

### 1. Test Upload API

```bash
# Test the upload endpoint
curl -X POST http://localhost:3000/api/admin/cloudinary-upload \
  -H "Cookie: next-auth.session-token=YOUR_SESSION_TOKEN" \
  -F "file=@/path/to/test-image.jpg" \
  -F "folder=zari-honey/test"
```

### 2. Test in Browser

1. Login ke admin panel
2. Pergi ke Hero Section
3. Upload new image
4. Check:
   - ✅ Image uploads successfully
   - ✅ Preview shows correctly
   - ✅ Save works
   - ✅ Image displays on frontend
   - ✅ URL saved in database (not base64)

### 3. Verify Database

```sql
-- Check that URLs are saved, not base64
SELECT id, imageUrl FROM HeroContent LIMIT 5;
-- Should show: https://res.cloudinary.com/...

SELECT id, imageUrl FROM HoneyCollection LIMIT 5;
-- Should show: https://res.cloudinary.com/...
```

### 4. Test Transformations

Access images with transformations:

```
Original:
https://res.cloudinary.com/your-cloud/image/upload/v1234567890/zari-honey/hero.jpg

Resized to 800x600:
https://res.cloudinary.com/your-cloud/image/upload/w_800,h_600,c_fill/v1234567890/zari-honey/hero.jpg

Thumbnail 200x200:
https://res.cloudinary.com/your-cloud/image/upload/w_200,h_200,c_thumb,g_face/v1234567890/zari-honey/hero.jpg

Auto format & quality:
https://res.cloudinary.com/your-cloud/image/upload/f_auto,q_auto/v1234567890/zari-honey/hero.jpg
```

---

## 🔄 Migration dari Base64

### Step 1: Backup Database

```bash
# Backup existing database
pnpm prisma db pull
pnpm prisma db push --force-reset # DANGER: Only in dev!

# Or better, export data
pnpm prisma studio
# Export tables manually
```

### Step 2: Create Migration Script

Buat `scripts/migrate-to-cloudinary.ts`:

```typescript
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
      if (hero.imageUrl && hero.imageUrl.startsWith("data:image")) {
        console.log(`  Migrating hero #${hero.id}...`);

        // Convert base64 to buffer
        const base64Data = hero.imageUrl.split(",")[1];
        const buffer = Buffer.from(base64Data, "base64");

        // Upload to Cloudinary
        const result = await uploadToCloudinary(buffer, "zari-honey/heroes");

        // Update database
        await prisma.heroContent.update({
          where: { id: hero.id },
          data: { imageUrl: result.secure_url },
        });

        console.log(`  ✅ Hero #${hero.id} migrated`);
      }
    }

    // 2. Migrate Honey Collection
    console.log("\n🍯 Migrating Honey Collection images...");
    const products = await prisma.honeyCollection.findMany();

    for (const product of products) {
      if (product.imageUrl && product.imageUrl.startsWith("data:image")) {
        console.log(`  Migrating product #${product.id}...`);

        const base64Data = product.imageUrl.split(",")[1];
        const buffer = Buffer.from(base64Data, "base64");

        const result = await uploadToCloudinary(buffer, "zari-honey/products");

        await prisma.honeyCollection.update({
          where: { id: product.id },
          data: { imageUrl: result.secure_url },
        });

        console.log(`  ✅ Product #${product.id} migrated`);
      }
    }

    // 3. Migrate About Content
    console.log("\n📄 Migrating About Content images...");
    const aboutContents = await prisma.aboutContent.findMany();

    for (const about of aboutContents) {
      if (about.imageUrl && about.imageUrl.startsWith("data:image")) {
        console.log(`  Migrating about #${about.id}...`);

        const base64Data = about.imageUrl.split(",")[1];
        const buffer = Buffer.from(base64Data, "base64");

        const result = await uploadToCloudinary(buffer, "zari-honey/about");

        await prisma.aboutContent.update({
          where: { id: about.id },
          data: { imageUrl: result.secure_url },
        });

        console.log(`  ✅ About #${about.id} migrated`);
      }
    }

    console.log("\n✨ Migration completed successfully!");
  } catch (error) {
    console.error("❌ Migration failed:", error);
  } finally {
    await prisma.$disconnect();
  }
}

migrateImages();
```

### Step 3: Run Migration

```bash
# Run migration script
npx tsx scripts/migrate-to-cloudinary.ts
```

### Step 4: Verify Migration

```bash
# Check database
pnpm prisma studio

# Verify no more base64 in database
# All imageUrl should start with https://res.cloudinary.com
```

---

## 🎨 Optimization Tips

### 1. Use Automatic Format & Quality

Always use `f_auto,q_auto` in URLs:

```typescript
// In your Image components
<Image
  src={imageUrl.replace("/upload/", "/upload/f_auto,q_auto/")}
  alt="Optimized"
  width={800}
  height={600}
/>
```

### 2. Responsive Images

Use Cloudinary transformations for different screen sizes:

```typescript
const getResponsiveUrl = (url: string, width: number) => {
  return url.replace("/upload/", `/upload/w_${width},c_scale,f_auto,q_auto/`);
};

// Usage
<picture>
  <source media="(max-width: 640px)" srcSet={getResponsiveUrl(imageUrl, 640)} />
  <source
    media="(max-width: 1024px)"
    srcSet={getResponsiveUrl(imageUrl, 1024)}
  />
  <img src={getResponsiveUrl(imageUrl, 1920)} alt="Hero" />
</picture>;
```

### 3. Lazy Loading

```typescript
<Image
  src={imageUrl}
  alt="Product"
  width={800}
  height={600}
  loading="lazy" // Native lazy loading
  placeholder="blur"
  blurDataURL={`${imageUrl.replace("/upload/", "/upload/w_50,q_30,f_auto/")}`}
/>
```

### 4. Preload Critical Images

```typescript
// In app/layout.tsx or page.tsx
<link
  rel="preload"
  as="image"
  href={heroImageUrl}
  imageSrcSet={`
    ${getResponsiveUrl(heroImageUrl, 640)} 640w,
    ${getResponsiveUrl(heroImageUrl, 1024)} 1024w,
    ${getResponsiveUrl(heroImageUrl, 1920)} 1920w
  `}
/>
```

---

## 🔒 Security Best Practices

### 1. Validate File Types

```typescript
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

if (!ALLOWED_TYPES.includes(file.type)) {
  throw new Error("Invalid file type");
}
```

### 2. Limit File Size

```typescript
const MAX_SIZE = 10 * 1024 * 1024; // 10MB

if (file.size > MAX_SIZE) {
  throw new Error("File too large");
}
```

### 3. Use Signed Uploads (Production)

For production, consider using signed uploads:

```typescript
// In API route
import { v2 as cloudinary } from "cloudinary";

export async function GET() {
  const timestamp = Math.round(new Date().getTime() / 1000);

  const signature = cloudinary.utils.api_sign_request(
    {
      timestamp,
      folder: "zari-honey",
    },
    process.env.CLOUDINARY_API_SECRET!
  );

  return NextResponse.json({
    signature,
    timestamp,
    cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
  });
}
```

### 4. Sanitize Filenames

```typescript
const sanitizeFilename = (filename: string) => {
  return filename
    .toLowerCase()
    .replace(/[^a-z0-9.-]/g, "-")
    .replace(/-+/g, "-");
};
```

---

## 💰 Cost Estimation

### Free Tier Limits:

- **Storage:** 25 GB
- **Bandwidth:** 25 GB/month
- **Transformations:** 25 credits/month (1 credit = 1,000 transformations)

### Estimated Usage for Zari Honey:

**Assumptions:**

- 100 products
- 50 articles
- 10 hero images
- 20 testimonials
- Average image size: 500 KB

**Total Storage:**

- 180 images × 500 KB = 90 MB
- **Well within 25 GB free tier** ✅

**Monthly Bandwidth:**

- 1,000 visitors/month
- 5 images per visit
- 5,000 image loads × 500 KB = 2.5 GB
- **Well within 25 GB free tier** ✅

**Transformations:**

- 5,000 image loads × 2 transformations (format + resize) = 10,000 transformations
- 10,000 / 1,000 = 10 credits
- **Well within 25 credits free tier** ✅

### Conclusion:

**Zari Honey akan tetap di free tier untuk waktu yang lama!** 🎉

---

## 📈 Monitoring

### 1. Check Usage in Dashboard

1. Login ke Cloudinary
2. Pergi ke **Dashboard**
3. Lihat **Current Month Usage:**
   - Storage used
   - Bandwidth used
   - Transformations used

### 2. Set Up Usage Alerts

1. Pergi ke **Settings** → **Account**
2. Set up email alerts untuk:
   - 80% storage used
   - 80% bandwidth used
   - 80% transformations used

### 3. Monitor Performance

Use Cloudinary's **Reports** section untuk:

- Most viewed images
- Transformation types
- Geographic distribution
- Error rates

---

## 🐛 Troubleshooting

### Issue 1: "Upload failed" Error

**Solution:**

- Check environment variables
- Verify Cloudinary credentials
- Check API key permissions
- Ensure upload preset exists

### Issue 2: Images Not Loading

**Solution:**

- Check CORS settings in Cloudinary
- Verify URL format
- Check browser console for errors
- Ensure images are publicly accessible

### Issue 3: Slow Upload

**Solution:**

- Reduce image size before upload
- Use compression
- Check network connection
- Consider client-side resizing

### Issue 4: Transformation Not Working

**Solution:**

- Check transformation syntax
- Verify URL format
- Use Cloudinary documentation
- Test in playground first

---

## ✅ Implementation Checklist

- [ ] Create Cloudinary account
- [ ] Get credentials (Cloud Name, API Key, API Secret)
- [ ] Create upload preset (optional)
- [ ] Install dependencies (`cloudinary`, `next-cloudinary`)
- [ ] Add environment variables
- [ ] Create `lib/cloudinary.ts`
- [ ] Create upload API route
- [ ] Update TiptapEditor
- [ ] Update Hero image upload
- [ ] Update Honey Collection upload
- [ ] Update other upload points
- [ ] Test all upload functionality
- [ ] Run migration script (if needed)
- [ ] Verify no base64 in database
- [ ] Test frontend display
- [ ] Set up monitoring
- [ ] Configure alerts
- [ ] Deploy to production

---

## 📚 Additional Resources

- [Cloudinary Documentation](https://cloudinary.com/documentation)
- [Cloudinary Node.js SDK](https://cloudinary.com/documentation/node_integration)
- [Next.js Image Optimization](https://nextjs.org/docs/basic-features/image-optimization)
- [Cloudinary Transformation Reference](https://cloudinary.com/documentation/transformation_reference)

---

## 🎯 Next Steps

1. **Immediate:**

   - Create Cloudinary account
   - Get credentials
   - Install dependencies
   - Create utility files

2. **Implementation:**

   - Create upload API route
   - Update TiptapEditor
   - Update all upload points
   - Test thoroughly

3. **Migration:**

   - Backup database
   - Run migration script
   - Verify results
   - Clean up old base64 data

4. **Optimization:**
   - Set up transformations
   - Implement lazy loading
   - Add responsive images
   - Monitor usage

---

**Last Updated:** 19 Desember 2025  
**Status:** ✅ Ready for Implementation  
**Estimated Time:** 2-4 hours  
**Difficulty:** Medium

**Happy Coding! 🚀**
