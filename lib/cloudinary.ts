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
        (error: unknown, result: unknown) => {
          if (error) {
            reject(error);
          } else if (
            result &&
            typeof result === "object" &&
            "secure_url" in result &&
            "public_id" in result
          ) {
            resolve({
              secure_url: result.secure_url as string,
              public_id: result.public_id as string,
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
