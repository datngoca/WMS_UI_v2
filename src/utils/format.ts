/**
 * Định dạng số tiền thành chuỗi tiền tệ (mặc định VND, locale vi-VN).
 *
 * @param amount - Số tiền cần định dạng
 * @param currency - Mã tiền tệ (mặc định "VND")
 * @param locale - Locale (mặc định "vi-VN")
 * @returns Chuỗi tiền tệ đã định dạng hoặc "—" nếu không hợp lệ
 */
export const formatCurrency = (
  amount?: number | null,
  currency: string = "VND",
  locale: string = "vi-VN",
): string => {
  if (typeof amount !== "number" || isNaN(amount)) return "—";
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
  }).format(amount);
};

/**
 * Định dạng chuỗi ngày tháng theo định dạng locale (mặc định dd/MM/yyyy).
 *
 * @param dateInput - Ngày cần định dạng (chuỗi ISO, timestamp hoặc Date object)
 * @param locale - Locale (mặc định "vi-VN")
 * @returns Chuỗi ngày đã định dạng hoặc "—" nếu không hợp lệ
 */
export const formatDate = (
  dateInput?: string | number | Date | null,
  locale: string = "vi-VN",
): string => {
  if (!dateInput) return "—";
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return "—";
  return date.toLocaleDateString(locale, {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
};

/**
 * Loại bỏ hoàn toàn các thẻ HTML, chỉ giữ lại văn bản thuần trên 1 dòng.
 * Thích hợp để hiển thị tóm tắt trong ô bảng danh sách (Table View).
 */
export const stripHtml = (html?: string | null): string => {
  if (!html) return "";
  return html
    .replace(/<[^>]*>?/gm, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\s+/g, " ")
    .trim();
};

/**
 * Chuyển đổi mã HTML thành văn bản thuần có cấu trúc đẹp mắt:
 * - Giữ các đoạn văn xuống dòng (\n\n)
 * - Đổi thẻ danh sách <li> thành gạch đầu dòng (• )
 * - Loại bỏ các link và thẻ HTML còn lại
 * Thích hợp cho ô <textarea> hoặc in phiếu kho/POS.
 */
export const cleanHtmlToText = (html?: string | null): string => {
  if (!html) return "";
  let text = html;

  // Loại bỏ các đoạn quảng cáo / footer FAQ đối thủ nếu có
  text = text.replace(/<p[^>]*>\s*<strong>\s*Thông tin từ LOTTE MART:[\s\S]*$/gi, "");
  text = text.replace(/<strong>\s*Thông tin từ LOTTE MART:[\s\S]*$/gi, "");
  text = text.replace(/https?:\/\/(?:www\.)?lottemart\.vn[^\s<"]*/gi, "");

  // Thay thẻ <br>, <p>, </div> thành xuống dòng
  text = text.replace(/<br\s*\/?>/gi, "\n");
  text = text.replace(/<\/p>/gi, "\n\n");
  text = text.replace(/<\/div>/gi, "\n");

  // Thay thẻ <li> thành bullet •
  text = text.replace(/<li[^>]*>/gi, "• ");
  text = text.replace(/<\/li>/gi, "\n");

  // Loại bỏ toàn bộ thẻ HTML còn lại
  text = text.replace(/<[^>]+>/g, "");

  // Giải mã HTML entities
  text = text
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'");

  // Chuẩn hóa dòng trống liên tiếp
  const lines = text.split("\n").map((l) => l.trim());
  const cleaned: string[] = [];
  let prevBlank = false;
  for (const line of lines) {
    if (line) {
      cleaned.push(line);
      prevBlank = false;
    } else if (!prevBlank) {
      cleaned.push("");
      prevBlank = true;
    }
  }

  return cleaned.join("\n").trim();
};

/**
 * Định dạng số nguyên có dấu chấm ngăn cách hàng nghìn (chuẩn Việt Nam vi-VN).
 * Thích hợp cho các ô nhập số tiền tệ (e.g. 200000 -> 200.000).
 */
export const formatNumberWithDots = (val?: number | string | null): string => {
  if (val === undefined || val === null || val === "") return "";
  const str = String(val).replace(/\D/g, "");
  if (!str) return "";
  const num = Number(str);
  if (isNaN(num)) return "";
  return new Intl.NumberFormat("vi-VN").format(num);
};

/**
 * Chuyển đổi chuỗi số có dấu chấm/ngăn cách thành số nguyên number thuần.
 * e.g. "200.000" -> 200000
 */
export const parseFormattedNumber = (val?: string | number | null): number => {
  if (typeof val === "number") return isNaN(val) ? 0 : val;
  if (!val) return 0;
  const digits = String(val).replace(/\D/g, "");
  return digits ? parseInt(digits, 10) : 0;
};
