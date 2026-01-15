// types/index.ts

export interface OrderItem {
  _id: string; // Added _id to match usage
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

export interface IOrder {
  _id: string;
  telegramUserId: number;
  telegramUserName?: string;
  items: OrderItem[];
  totalAmount: number;
  status:
    | "pending"
    | "pending_proof"
    | "under_review"
    | "paid"
    | "shipped"
    | "completed"
    | "cancelled";
  createdAt: string;
  shippingAddress?: {
    fullName: string;
    address: string;
    city: string;
    country: string;
    zipCode: string;
    phone: string;
  };
  shippingMethod?: {
    name: string;
    price: number;
  };
  paymentMethod?: {
    name: string;
    network?: string;
    walletAddress?: string;
  };
  paymentProof?: string;
}

export interface ICategory {
  _id: string;
  name: string;
  slug: string;
  icon?: string;
}

export interface ProductVariant {
  weight: string;
  price: number;
  available: boolean;
}

export interface IProduct {
  _id: string;
  name: string;
  price: number;
  image?: string;
  description?: string;
  isVisible: boolean;

  // New fields
  categoryId?: string; // or Populated ICategory
  category?: ICategory;
  images?: string[];
  variants?: ProductVariant[];
}
