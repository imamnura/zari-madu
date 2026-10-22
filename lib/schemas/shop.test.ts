import { describe, it, expect } from "vitest";
import {
  phoneSchema,
  postalCodeSchema,
  addressInputSchema,
  registerCustomerSchema,
  adminOrderTransitionSchema,
  categoryInputSchema,
} from "./shop";

describe("phoneSchema", () => {
  it.each([
    "081234567890",
    "+6281234567890",
    "6281234567890",
    "08123456789012",
  ])("accepts %s", (v) => {
    expect(phoneSchema.safeParse(v).success).toBe(true);
  });

  it.each(["123", "08abc", "+1234567890", "9081234567"])("rejects %s", (v) => {
    expect(phoneSchema.safeParse(v).success).toBe(false);
  });
});

describe("postalCodeSchema", () => {
  it("accepts exactly 5 digits", () => {
    expect(postalCodeSchema.safeParse("17112").success).toBe(true);
  });
  it("rejects non-5-digit", () => {
    expect(postalCodeSchema.safeParse("1234").success).toBe(false);
    expect(postalCodeSchema.safeParse("123456").success).toBe(false);
    expect(postalCodeSchema.safeParse("abcde").success).toBe(false);
  });
});

describe("addressInputSchema", () => {
  it("accepts a complete valid address", () => {
    const result = addressInputSchema.safeParse({
      recipientName: "Sari Dewi",
      phone: "081234567890",
      addressLine: "Jl. Merdeka No. 1",
      kelurahan: "Menteng",
      kecamatan: "Menteng",
      city: "Jakarta Pusat",
      province: "DKI Jakarta",
      postalCode: "10310",
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing required fields", () => {
    const result = addressInputSchema.safeParse({
      recipientName: "A",
      phone: "081234567890",
      addressLine: "x",
      kelurahan: "x",
      kecamatan: "x",
      city: "x",
      province: "x",
      postalCode: "10310",
    });
    expect(result.success).toBe(false);
  });
});

describe("registerCustomerSchema", () => {
  it("requires turnstileToken non-empty", () => {
    const valid = registerCustomerSchema.safeParse({
      name: "Sari",
      email: "sari@example.com",
      password: "password123",
      turnstileToken: "abc",
    });
    expect(valid.success).toBe(true);

    const missing = registerCustomerSchema.safeParse({
      name: "Sari",
      email: "sari@example.com",
      password: "password123",
      turnstileToken: "",
    });
    expect(missing.success).toBe(false);
  });

  it("rejects passwords shorter than 8 chars", () => {
    const r = registerCustomerSchema.safeParse({
      name: "Sari",
      email: "sari@example.com",
      password: "short",
      turnstileToken: "abc",
    });
    expect(r.success).toBe(false);
  });
});

describe("adminOrderTransitionSchema", () => {
  it("requires trackingNumber + courier when target is SHIPPED", () => {
    const noTracking = adminOrderTransitionSchema.safeParse({
      targetStatus: "SHIPPED",
    });
    expect(noTracking.success).toBe(false);

    const ok = adminOrderTransitionSchema.safeParse({
      targetStatus: "SHIPPED",
      trackingNumber: "JNE12345",
      courier: "JNE",
    });
    expect(ok.success).toBe(true);
  });

  it("requires cancelReason when target is CANCELLED", () => {
    const noReason = adminOrderTransitionSchema.safeParse({
      targetStatus: "CANCELLED",
    });
    expect(noReason.success).toBe(false);

    const ok = adminOrderTransitionSchema.safeParse({
      targetStatus: "CANCELLED",
      cancelReason: "Customer request",
    });
    expect(ok.success).toBe(true);
  });
});

describe("categoryInputSchema", () => {
  it("enforces slug shape", () => {
    expect(
      categoryInputSchema.safeParse({
        slug: "Madu Premium",
        name: "Madu",
        displayOrder: 0,
        isActive: true,
      }).success,
    ).toBe(false);
    expect(
      categoryInputSchema.safeParse({
        slug: "madu-premium",
        name: "Madu Premium",
        displayOrder: 0,
        isActive: true,
      }).success,
    ).toBe(true);
  });
});
