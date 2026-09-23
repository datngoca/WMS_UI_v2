import type { BaseEntity } from "@/types/api";

export type InventoryItem = BaseEntity & {
  productId: number;
  productName: string;
  productSku: string;
  productImageUrl?: string | null;
  quantity: number;
  updatedAt: string;
};

export type InventoryActionRequest = {
  productId: number;
  quantity: number;
  reason?: string;
};
