import type { BaseEntity } from "@/types/api";

export type OrderStatus = "PENDING" | "CONFIRMED" | "CANCELLED";

export type OrderItem = {
  id: number;
  productId: number;
  productName: string;
  productSku: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
};

export type Order = BaseEntity & {
  orderCode: string;
  customerName?: string | null;
  customerPhone?: string | null;
  note?: string | null;
  status: OrderStatus;
  totalAmount: number;
  items: OrderItem[];
};

export type OrderItemRequest = {
  productId: number;
  quantity: number;
  unitPrice: number;
};

export type OrderCreateRequest = {
  customerName?: string;
  customerPhone?: string;
  note?: string;
  items: OrderItemRequest[];
};
