export type Theme = "light" | "dark" | "eco";

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  wholesalePrice: number; // Cost from supplier for margin tracking
  image: string;
  inventory: number; // Integrated tracking
  category: string;
  createdAt: string;
  createdBy: string;
}

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

export interface Order {
  id: string;
  userId: string;
  customerName: string;
  customerEmail: string;
  shippingAddress: string;
  items: OrderItem[];
  totalAmount: number;
  status: "pending" | "processing" | "shipped" | "out_for_delivery" | "delivered";
  trackingNumber?: string;
  paymentId?: string;
  createdAt: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  address?: string;
  role: "user" | "admin";
  createdAt: string;
}
