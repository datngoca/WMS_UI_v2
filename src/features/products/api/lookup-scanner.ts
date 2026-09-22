export type LookupScannerResult = {
  status: "SUCCESS" | "NOT_FOUND" | "ERROR";
  message?: string;
  extractedSku?: string;
  product?: {
    sku: string;
    name: string;
    imageUrl?: string;
    images?: string[];
    thumbnailUrl?: string;
    categories: number[];
    description: string;
    productUnits: Array<{
      sku: string;
      barcode: string;
      imageUrl?: string;
      unitId: number;
      exchangeValue: number;
      price: number;
      isBaseUnit: boolean;
      unitName?: string;
      unitCode?: string;
    }>;
    specs: Array<{ label: string; value: string }>;
    detailedSpecs?: Array<{
      groupName: string;
      items: Array<{ label: string; value: string }>;
    }>;
    options: Array<{
      name: string;
      type: string;
      values: Array<{ label: string; value: string }>;
    }>;
  };
};

/**
 * Trích xuất mã SKU/Barcode thực tế từ chuỗi quét được.
 * Nếu mã QR chứa đường dẫn URL (ví dụ: https://maqr.vn/#/848140612516, https://icheck.vn/...),
 * hàm sẽ tự động bóc tách lấy mã số sản phẩm (848140612516).
 */
export function extractSkuFromText(raw: string): string {
  if (!raw) return "";
  const trimmed = raw.trim();
  if (
    trimmed.includes("http://") ||
    trimmed.includes("https://") ||
    trimmed.includes("/") ||
    trimmed.includes("#")
  ) {
    // 1. Ưu tiên tìm chuỗi số mã vạch chuẩn (8 - 14 chữ số như EAN-13, UPC-A, GTIN)
    const matches = trimmed.match(/\b\d{8,14}\b/g);
    if (matches && matches.length > 0) {
      return matches[matches.length - 1];
    }
    // 2. Lấy phần tử cuối cùng sau các dấu phân tách
    const parts = trimmed.split(/[/_#?&=]+/).filter(Boolean);
    if (parts.length > 0) {
      return parts[parts.length - 1];
    }
  }
  return trimmed;
}

/**
 * Tra cứu thông tin sản phẩm và quy cách từ Scanner Service (FastAPI / Lotte Mart Scraper).
 * Hỗ trợ tự động chuyển đổi URL giữa proxy Vite (/scanner-api) và gọi trực tiếp (http://)
 * để tương thích hoàn toàn trên cả Desktop và Mobile chạy HTTPS (tránh lỗi Mixed Content).
 */
export async function lookupProductBySku(sku: string): Promise<LookupScannerResult> {
  const cleanSku = extractSkuFromText(sku);
  if (!cleanSku) {
    throw new Error("Mã SKU không được để trống");
  }

  const encodedSku = encodeURIComponent(cleanSku);

  // Danh sách các URL thử theo thứ tự:
  // 1. /scanner-api (qua Vite proxy -> chạy trên cùng domain/port HTTPS, không bao giờ bị lỗi Mixed Content)
  // 2. Direct http://...:8000 (dành cho môi trường không có reverse proxy và không chạy HTTPS)
  const isHttps = typeof window !== "undefined" && window.location.protocol === "https:";
  const scannerHost =
    typeof window !== "undefined" &&
    window.location.hostname !== "localhost" &&
    window.location.hostname !== "127.0.0.1"
      ? window.location.hostname
      : "localhost";

  const urls: string[] = [`/scanner-api/api/products/lookup/${encodedSku}`];

  if (!isHttps) {
    urls.push(`http://${scannerHost}:8000/api/products/lookup/${encodedSku}`);
    urls.push(`http://localhost:8000/api/products/lookup/${encodedSku}`);
  }

  let lastError: any = null;
  for (const url of urls) {
    try {
      const response = await fetch(url);
      if (response.ok) {
        return (await response.json()) as LookupScannerResult;
      }
    } catch (err) {
      lastError = err;
    }
  }

  throw lastError || new Error("Không thể kết nối đến Scanner Service (FastAPI cổng 8000)");
}
