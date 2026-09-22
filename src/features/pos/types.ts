import type { Product } from "@/types/api";

export type PosCartItem = {
  id: string; // e.g. `${productId}-${unitId}`
  productId: number;
  product: Product;
  unitId: number;
  unitName: string;
  price: number;
  quantity: number;
  sku: string;
};

export type PaymentMethod = "cash" | "qr" | "card";

export type PosOrder = {
  orderCode: string;
  createdAt: Date;
  items: PosCartItem[];
  subtotal: number;
  discountType: "percent" | "fixed";
  discountValue: number;
  discountAmount: number;
  taxRate: number;
  taxAmount: number;
  total: number;
  paymentMethod: PaymentMethod;
  customerMoney: number;
  changeMoney: number;
  cashierName: string;
};
