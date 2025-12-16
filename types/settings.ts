// Shared types for Settings across the application

export interface Settings {
  id?: string;
  whatsapp: string;
  instagram: string;
  email: string;
  shopeeLink: string;
  mapsLocation: string;
  mapsEmbed: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ContactInfo {
  whatsapp: string;
  email: string;
  instagram: string;
  shopee: string;
  maps: string;
  mapsEmbed: string;
}

// Type guard for checking if data has shopeeLink or shopee
export function getShopeeLink(data: Settings | ContactInfo): string {
  if ("shopeeLink" in data) {
    return data.shopeeLink;
  }
  if ("shopee" in data) {
    return data.shopee;
  }
  return "";
}
