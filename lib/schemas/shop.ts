import { z } from "zod";

const PHONE_REGEX = /^(\+62|62|0)8\d{8,12}$/;
const POSTAL_REGEX = /^\d{5}$/;

export const phoneSchema = z
  .string()
  .trim()
  .regex(PHONE_REGEX, "Nomor HP harus diawali 08 / +628 / 628 dan terdiri dari 10-13 digit");

export const postalCodeSchema = z
  .string()
  .trim()
  .regex(POSTAL_REGEX, "Kode pos harus 5 digit angka");

export const addressInputSchema = z.object({
  recipientName: z.string().trim().min(2, "Nama penerima minimal 2 karakter"),
  phone: phoneSchema,
  addressLine: z.string().trim().min(5, "Alamat minimal 5 karakter"),
  rtRw: z.string().trim().max(20).optional().nullable(),
  kelurahan: z.string().trim().min(2),
  kecamatan: z.string().trim().min(2),
  city: z.string().trim().min(2),
  province: z.string().trim().min(2),
  postalCode: postalCodeSchema,
  notes: z.string().trim().max(500).optional().nullable(),
});

export const guestCheckoutSchema = addressInputSchema.extend({
  email: z.string().trim().email("Email tidak valid"),
});

export const customerCheckoutSchema = z
  .object({
    addressId: z.string().cuid().optional(),
    newAddress: addressInputSchema.optional(),
    saveNewAddress: z.boolean().optional(),
    notes: z.string().trim().max(500).optional().nullable(),
  })
  .refine(
    (val) => Boolean(val.addressId) || Boolean(val.newAddress),
    "Pilih alamat tersimpan atau isi alamat baru",
  );

export const registerCustomerSchema = z.object({
  name: z.string().trim().min(2, "Nama minimal 2 karakter"),
  email: z.string().trim().email("Email tidak valid"),
  password: z.string().min(8, "Password minimal 8 karakter"),
  phone: phoneSchema.optional(),
  turnstileToken: z.string().trim().min(1, "Selesaikan verifikasi captcha"),
});

export const loginCustomerSchema = z.object({
  email: z.string().trim().email("Email tidak valid"),
  password: z.string().min(1, "Password wajib diisi"),
});

export const addToCartSchema = z.object({
  productId: z.string().cuid(),
  quantity: z.number().int().min(1).max(99),
});

export const updateCartItemSchema = z.object({
  quantity: z.number().int().min(1).max(99),
});

export const mergeGuestCartSchema = z.object({
  items: z
    .array(
      z.object({
        productId: z.string().cuid(),
        quantity: z.number().int().min(1).max(99),
      }),
    )
    .max(50),
});

export const checkoutSchema = z.object({
  guest: guestCheckoutSchema.optional(),
  customer: customerCheckoutSchema.optional(),
});

const orderStatusEnum = z.enum([
  "PENDING",
  "PAID",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
]);

export const adminOrderTransitionSchema = z
  .object({
    targetStatus: orderStatusEnum,
    trackingNumber: z.string().trim().optional(),
    courier: z.string().trim().optional(),
    cancelReason: z.string().trim().max(500).optional(),
  })
  .superRefine((val, ctx) => {
    if (val.targetStatus === "SHIPPED") {
      if (!val.trackingNumber || !val.courier) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Nomor resi dan kurir wajib diisi saat status SHIPPED",
          path: ["trackingNumber"],
        });
      }
    }
    if (val.targetStatus === "CANCELLED" && !val.cancelReason) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Alasan pembatalan wajib diisi",
        path: ["cancelReason"],
      });
    }
  });

export const categoryInputSchema = z.object({
  slug: z
    .string()
    .trim()
    .min(2)
    .regex(/^[a-z0-9-]+$/, "Slug hanya boleh huruf kecil, angka, dan tanda hubung"),
  name: z.string().trim().min(2),
  description: z.string().trim().max(500).optional().nullable(),
  image: z.string().url().optional().nullable(),
  displayOrder: z.number().int().min(0),
  isActive: z.boolean(),
});

export const shippingRateInputSchema = z.object({
  province: z.string().trim().min(2),
  fee: z.number().int().min(0),
  estimatedDays: z.string().trim().max(50).optional().nullable(),
  isActive: z.boolean(),
});

export const guestOrderTrackSchema = z.object({
  orderNumber: z.string().trim().min(5),
  email: z.string().trim().email(),
});

export type AddressInput = z.infer<typeof addressInputSchema>;
export type GuestCheckoutInput = z.infer<typeof guestCheckoutSchema>;
export type CustomerCheckoutInput = z.infer<typeof customerCheckoutSchema>;
export type RegisterCustomerInput = z.infer<typeof registerCustomerSchema>;
export type CategoryInput = z.infer<typeof categoryInputSchema>;
export type ShippingRateInput = z.infer<typeof shippingRateInputSchema>;
