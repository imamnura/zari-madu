export type Role = "admin" | "customer";

export type OrderStatusValue =
  | "PENDING"
  | "PAID"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED";

export type PaymentStatusValue =
  | "PENDING"
  | "SETTLEMENT"
  | "EXPIRE"
  | "CANCEL"
  | "DENY"
  | "FAILURE";

export type SortOption =
  | "newest"
  | "price_asc"
  | "price_desc"
  | "name_asc";

export type LabelBadge = "bestseller" | "new" | "promo";

export interface ICategory {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  image: string | null;
  displayOrder: number;
  isActive: boolean;
}

export interface IProduct {
  id: string;
  slug: string;
  name: string;
  description: string;
  image: string | null;
  label: string | null;
  price: string | null;
  priceNumeric: number;
  stock: number;
  alwaysAvailable: boolean;
  weightGrams: number | null;
  features: unknown;
  category: ICategory | null;
}

export interface IFilterParams {
  categories: string[];
  priceMin: number | null;
  priceMax: number | null;
  label: LabelBadge | null;
  sort: SortOption;
  page: number;
}

export interface IPagination {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

export interface IProductListResponse {
  items: IProduct[];
  pagination: IPagination;
}

export interface ICartItemView {
  id: string;
  productId: string;
  productSlug: string;
  productName: string;
  productImage: string | null;
  unitPriceNumeric: number;
  quantity: number;
  stockRemaining: number;
  alwaysAvailable: boolean;
  lineTotal: number;
}

export interface ICartView {
  id: string | null;
  items: ICartItemView[];
  subtotal: number;
  itemCount: number;
}

export interface IGuestCartEntry {
  productId: string;
  quantity: number;
}

export interface IAddressInput {
  recipientName: string;
  phone: string;
  addressLine: string;
  rtRw?: string | null;
  kelurahan: string;
  kecamatan: string;
  city: string;
  province: string;
  postalCode: string;
  notes?: string | null;
}

export interface IAddressView extends IAddressInput {
  id: string;
  isDefault: boolean;
}

export interface IGuestCheckoutInput extends IAddressInput {
  email: string;
}

export interface ICustomerCheckoutInput {
  addressId?: string;
  newAddress?: IAddressInput;
  saveNewAddress?: boolean;
  notes?: string;
}

export interface IOrderItemView {
  id: string;
  productId: string | null;
  productName: string;
  productImage: string | null;
  unitPrice: number;
  quantity: number;
  subtotal: number;
}

export interface IOrderView {
  id: string;
  orderNumber: string;
  status: OrderStatusValue;
  subtotal: number;
  shippingFee: number;
  total: number;
  paidAt: string | null;
  shippedAt: string | null;
  deliveredAt: string | null;
  cancelledAt: string | null;
  trackingNumber: string | null;
  courier: string | null;
  recipientName: string;
  addressLine: string;
  rtRw: string | null;
  kelurahan: string;
  kecamatan: string;
  city: string;
  province: string;
  postalCode: string;
  notes: string | null;
  guestEmail: string | null;
  guestPhone: string | null;
  items: IOrderItemView[];
  createdAt: string;
}

export interface IShippingRate {
  id: string;
  province: string;
  fee: number;
  estimatedDays: string | null;
  isActive: boolean;
}

export interface ISnapTransactionResponse {
  token: string;
  redirect_url: string;
}

export interface IMidtransNotification {
  transaction_time: string;
  transaction_status: string;
  transaction_id: string;
  status_message: string;
  status_code: string;
  signature_key: string;
  payment_type: string;
  order_id: string;
  merchant_id: string;
  gross_amount: string;
  fraud_status?: string;
  currency?: string;
}

export interface IApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}
