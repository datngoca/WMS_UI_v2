import * as React from "react";
import {
  Search,
  ScanBarcode,
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  Receipt,
  Package,
  Layers,
  PauseCircle,
  Store,
  ArrowRight,
  Coins,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { useNotifications } from "@/components/ui/notifications";
import { useProducts } from "@/features/products/api/get-products";
import { useCategories } from "@/features/categories/api/get-categories";
import { formatCurrency, formatNumberWithDots } from "@/utils/format";
import { cn } from "@/utils/cn";
import type { Product } from "@/types/api";

import type { PosCartItem, PaymentMethod, PosOrder } from "../types";
import { PosScannerModal } from "./pos-scanner-modal";
import { PosReceiptModal } from "./pos-receipt-modal";

export const PosView = () => {
  const { addNotification } = useNotifications();

  // Queries
  const productsQuery = useProducts({ page: 1, size: 200 });
  const categoriesQuery = useCategories({});

  // States
  const [cart, setCart] = React.useState<PosCartItem[]>([]);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [barcodeInput, setBarcodeInput] = React.useState("");
  const [selectedCategoryId, setSelectedCategoryId] = React.useState<number | null>(null);

  const [discountType, setDiscountType] = React.useState<"percent" | "fixed">("percent");
  const [discountValue, setDiscountValue] = React.useState<number>(0);
  const [taxRate] = React.useState<number>(0); // 0%, 8%, 10%

  const [paymentMethod] = React.useState<PaymentMethod>("cash");
  const [customerMoneyInput, setCustomerMoneyInput] = React.useState<string>("");
  const [isCustomCustomerMoney, setIsCustomCustomerMoney] = React.useState<boolean>(false);
  const customerMoneyInputRef = React.useRef<HTMLInputElement>(null);

  const [isScannerOpen, setIsScannerOpen] = React.useState(false);
  const [completedOrder, setCompletedOrder] = React.useState<PosOrder | null>(null);
  const [heldOrders, setHeldOrders] = React.useState<{ id: string; time: string; cart: PosCartItem[] }[]>([]);

  // Mobile navigation tab between catalog & cart
  const [mobileTab, setMobileTab] = React.useState<"catalog" | "cart">("catalog");

  const allProducts = productsQuery.data?.data || [];
  const categories = categoriesQuery.data?.data || [];

  // Filter products by search and category
  const filteredProducts = React.useMemo(() => {
    return allProducts.filter((p) => {
      const matchSearch =
        !searchQuery.trim() ||
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.productUnits?.some(
          (u) =>
            u.sku?.toLowerCase().includes(searchQuery.toLowerCase())
        );

      const matchCategory =
        selectedCategoryId === null ||
        p.categories?.some((c) => c.id === selectedCategoryId);

      return matchSearch && matchCategory;
    });
  }, [allProducts, searchQuery, selectedCategoryId]);

  // Audio Beep
  const playBeep = () => {
    try {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(900, ctx.currentTime);
      gain.gain.setValueAtTime(0.18, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.12);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.12);
    } catch {
      // safe to ignore
    }
  };

  // Add Product to Cart
  const addToCart = React.useCallback(
    (product: Product, specificUnitId?: number) => {
      // Find default unit (base unit, or specified unit)
      const availableUnits = product.productUnits || [];
      const unit =
        specificUnitId !== undefined
          ? availableUnits.find((u) => u.unit?.id === specificUnitId || u.id === specificUnitId)
          : availableUnits.find((u) => u.isBaseUnit) || availableUnits[0];

      const unitId = unit?.unit?.id || unit?.id || 1;
      const unitName = unit?.unit?.name || "Mặc định";
      const unitPrice = unit?.price ?? 0;
      const unitSku = unit?.sku || product.sku;

      const cartLineId = `${product.id}-${unitId}`;

      setCart((prev) => {
        const existingIndex = prev.findIndex((item) => item.id === cartLineId);
        if (existingIndex > -1) {
          const updated = [...prev];
          updated[existingIndex] = {
            ...updated[existingIndex],
            quantity: updated[existingIndex].quantity + 1,
          };
          return updated;
        }

        return [
          ...prev,
          {
            id: cartLineId,
            productId: product.id,
            product,
            unitId,
            unitName,
            price: unitPrice,
            quantity: 1,
            sku: unitSku,
          },
        ];
      });

      playBeep();
    },
    [],
  );

  // Switch Unit for item already in Cart
  const changeCartItemUnit = (cartItemId: string, newUnitId: number) => {
    setCart((prev) => {
      const item = prev.find((i) => i.id === cartItemId);
      if (!item) return prev;

      const product = item.product;
      const newUnit = product.productUnits?.find(
        (u) => (u.unit?.id || u.id) === newUnitId,
      );
      if (!newUnit) return prev;

      const newUnitName = newUnit.unit?.name || "Mặc định";
      const newUnitPrice = newUnit.price ?? 0;
      const newUnitSku = newUnit.sku || product.sku;
      const newCartLineId = `${product.id}-${newUnitId}`;

      // If item with new unit already exists, merge quantities
      const existingNewIndex = prev.findIndex(
        (i) => i.id === newCartLineId && i.id !== cartItemId,
      );

      if (existingNewIndex > -1) {
        return prev
          .filter((i) => i.id !== cartItemId)
          .map((i, idx) =>
            idx === existingNewIndex
              ? { ...i, quantity: i.quantity + item.quantity }
              : i,
          );
      }

      // Otherwise update this item
      return prev.map((i) =>
        i.id === cartItemId
          ? {
            ...i,
            id: newCartLineId,
            unitId: newUnitId,
            unitName: newUnitName,
            price: newUnitPrice,
            sku: newUnitSku,
          }
          : i,
      );
    });
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart((prev) => {
      const next = prev
        .map((item) => {
          if (item.id === id) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as PosCartItem[];
      if (next.length === 0) {
        setIsCustomCustomerMoney(false);
        setCustomerMoneyInput("");
      }
      return next;
    });
  };

  const setExactQuantity = (id: string, qty: number) => {
    if (isNaN(qty) || qty <= 0) return;
    setCart((prev) =>
      prev.map((item) => (item.id === id ? { ...item, quantity: qty } : item)),
    );
  };

  const removeFromCart = (id: string) => {
    setCart((prev) => {
      const next = prev.filter((item) => item.id !== id);
      if (next.length === 0) {
        setIsCustomCustomerMoney(false);
        setCustomerMoneyInput("");
      }
      return next;
    });
  };

  const clearCart = () => {
    if (cart.length === 0) return;
    if (window.confirm("Bạn có chắc muốn xóa toàn bộ sản phẩm trong đơn hàng?")) {
      setCart([]);
      setIsCustomCustomerMoney(false);
      setCustomerMoneyInput("");
    }
  };

  // Hold current order
  const holdOrder = () => {
    if (cart.length === 0) return;
    const newHold = {
      id: `DH-${Date.now().toString().slice(-4)}`,
      time: new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }),
      cart: [...cart],
    };
    setHeldOrders((prev) => [...prev, newHold]);
    setCart([]);
    setIsCustomCustomerMoney(false);
    setCustomerMoneyInput("");
    addNotification({
      type: "info",
      title: `Đã lưu tạm ${newHold.id}`,
    });
  };

  const resumeHoldOrder = (holdId: string) => {
    const order = heldOrders.find((o) => o.id === holdId);
    if (!order) return;
    setCart(order.cart);
    setHeldOrders((prev) => prev.filter((o) => o.id !== holdId));
    setMobileTab("cart");
  };

  // Barcode / SKU auto-lookup
  const handleBarcodeLookup = (code: string) => {
    const trimmed = code.trim().toLowerCase();
    if (!trimmed) return;

    // Search product by sku or product unit barcode
    let foundProduct: Product | undefined;
    let foundUnitId: number | undefined;

    for (const p of allProducts) {
      if (p.sku.toLowerCase() === trimmed) {
        foundProduct = p;
        break;
      }
      const matchingUnit = p.productUnits?.find(
        (u) =>
          u.sku?.toLowerCase() === trimmed);
      if (matchingUnit) {
        foundProduct = p;
        foundUnitId = matchingUnit.unit?.id || matchingUnit.id;
        break;
      }
    }

    if (foundProduct) {
      addToCart(foundProduct, foundUnitId);
      addNotification({
        type: "success",
        title: `Đã thêm: ${foundProduct.name}`,
      });
    } else {
      addNotification({
        type: "warning",
        title: "Không tìm thấy",
        message: `Mã "${code}" chưa khớp với sản phẩm nào trong kho`,
      });
    }
  };

  const handleBarcodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!barcodeInput.trim()) return;
    handleBarcodeLookup(barcodeInput);
    setBarcodeInput("");
  };

  // Calculations
  const subtotal = React.useMemo(() => {
    return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }, [cart]);

  const discountAmount = React.useMemo(() => {
    if (discountType === "percent") {
      return (subtotal * Math.min(100, Math.max(0, discountValue))) / 100;
    }
    return Math.min(subtotal, Math.max(0, discountValue));
  }, [subtotal, discountType, discountValue]);

  const taxAmount = React.useMemo(() => {
    return ((subtotal - discountAmount) * taxRate) / 100;
  }, [subtotal, discountAmount, taxRate]);

  const total = React.useMemo(() => {
    return Math.max(0, subtotal - discountAmount + taxAmount);
  }, [subtotal, discountAmount, taxAmount]);

  const effectiveCustomerMoney = React.useMemo(() => {
    if (cart.length === 0 || paymentMethod !== "cash") return total;
    if (isCustomCustomerMoney) {
      if (!customerMoneyInput) return 0;
      const num = Number(customerMoneyInput);
      return isNaN(num) ? 0 : num;
    }
    return total;
  }, [cart.length, paymentMethod, isCustomCustomerMoney, customerMoneyInput, total]);

  const changeMoney = React.useMemo(() => {
    if (paymentMethod !== "cash") return 0;
    return Math.max(0, effectiveCustomerMoney - total);
  }, [paymentMethod, effectiveCustomerMoney, total]);

  // Dynamic cash suggestions based on total
  const cashSuggestions = React.useMemo(() => {
    if (total <= 0) return [];
    const suggestions = new Set<number>();
    const denominations = [20000, 50000, 100000, 200000, 500000];
    for (const denom of denominations) {
      if (denom > total) suggestions.add(denom);
    }
    const round10k = Math.ceil(total / 10000) * 10000;
    if (round10k > total) suggestions.add(round10k);
    const round50k = Math.ceil(total / 50000) * 50000;
    if (round50k > total) suggestions.add(round50k);
    const round100k = Math.ceil(total / 100000) * 100000;
    if (round100k > total) suggestions.add(round100k);
    const round500k = Math.ceil(total / 500000) * 500000;
    if (round500k > total) suggestions.add(round500k);
    if (total >= 500000) {
      const roundMillion = Math.ceil(total / 1000000) * 1000000;
      if (roundMillion > total) suggestions.add(roundMillion);
      suggestions.add(roundMillion + 500000);
    }
    return Array.from(suggestions)
      .filter((amt) => amt > total)
      .sort((a, b) => a - b)
      .slice(0, 4);
  }, [total]);

  // Display value for customer money input
  const displayCustomerMoney = React.useMemo(() => {
    if (cart.length === 0) return "";
    if (isCustomCustomerMoney) {
      return formatNumberWithDots(customerMoneyInput);
    }
    return total > 0 ? formatNumberWithDots(total) : "";
  }, [cart.length, isCustomCustomerMoney, customerMoneyInput, total]);

  const handleCustomerMoneyFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    if (!isCustomCustomerMoney) {
      setCustomerMoneyInput(total > 0 ? String(total) : "");
      setIsCustomCustomerMoney(true);
    }
    setTimeout(() => {
      e.target.select();
    }, 0);
  };

  const handleCustomerMoneyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsCustomCustomerMoney(true);
    const inputEl = e.target;
    const rawValue = inputEl.value;
    const cursorPosition = inputEl.selectionStart || 0;
    const digitsBeforeCursor = rawValue.slice(0, cursorPosition).replace(/\D/g, "").length;

    const rawDigits = rawValue.replace(/\D/g, "");
    if (rawDigits.length > 12) return; // Limit to 999 billion VND

    setCustomerMoneyInput(rawDigits);

    requestAnimationFrame(() => {
      if (!customerMoneyInputRef.current) return;
      const formatted = formatNumberWithDots(rawDigits);
      let newPos = formatted.length;
      let digitCount = 0;
      for (let i = 0; i < formatted.length; i++) {
        if (/\d/.test(formatted[i])) {
          digitCount++;
        }
        if (digitCount === digitsBeforeCursor) {
          newPos = i + 1;
          break;
        }
      }
      customerMoneyInputRef.current.setSelectionRange(newPos, newPos);
    });
  };

  const handleClearCustomerMoney = () => {
    setIsCustomCustomerMoney(true);
    setCustomerMoneyInput("");
    customerMoneyInputRef.current?.focus();
  };

  const handleSetExactMoney = () => {
    setIsCustomCustomerMoney(false);
    setCustomerMoneyInput("");
  };

  const handleSelectCashSuggestion = (amt: number) => {
    setIsCustomCustomerMoney(true);
    setCustomerMoneyInput(String(amt));
  };

  // Execute Checkout
  const handleCheckout = () => {
    if (cart.length === 0) return;

    if (paymentMethod === "cash" && effectiveCustomerMoney < total) {
      addNotification({
        type: "error",
        title: "Tiền khách đưa chưa đủ",
        message: `Thiếu ${formatCurrency(total - effectiveCustomerMoney)}`,
      });
      return;
    }

    const orderNumber = `HD-${Date.now().toString().slice(-6)}`;
    const newOrder: PosOrder = {
      orderCode: orderNumber,
      createdAt: new Date(),
      items: [...cart],
      subtotal,
      discountType,
      discountValue,
      discountAmount,
      taxRate,
      taxAmount,
      total,
      paymentMethod,
      customerMoney: paymentMethod === "cash" ? effectiveCustomerMoney : total,
      changeMoney,
      cashierName: "Admin Harry Ngoc",
    };

    setCompletedOrder(newOrder);
    setCart([]);
    setIsCustomCustomerMoney(false);
    setCustomerMoneyInput("");
    setDiscountValue(0);
    addNotification({
      type: "success",
      title: "Thanh toán thành công!",
      message: `Đơn hàng ${orderNumber} đã hoàn tất`,
    });
  };

  const handleStartNewOrder = () => {
    setCompletedOrder(null);
    setCart([]);
    setIsCustomCustomerMoney(false);
    setCustomerMoneyInput("");
    setDiscountValue(0);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-2 sm:gap-4 h-full flex-1 min-h-0 overflow-hidden">
      {/* Mobile Top Navigation Tabs */}
      <div className="lg:hidden flex items-center justify-between p-1 bg-slate-200/80 rounded-xl flex-shrink-0">
        <button
          type="button"
          onClick={() => setMobileTab("catalog")}
          className={cn(
            "flex-1 py-1.5 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all",
            mobileTab === "catalog"
              ? "bg-white text-primary shadow-xs"
              : "text-muted-foreground",
          )}
        >
          <Store className="size-3.5" />
          <span>Chọn hàng ({filteredProducts.length})</span>
        </button>
        <button
          type="button"
          onClick={() => setMobileTab("cart")}
          className={cn(
            "flex-1 py-1.5 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all relative",
            mobileTab === "cart"
              ? "bg-white text-primary shadow-xs"
              : "text-muted-foreground",
          )}
        >
          <ShoppingBag className="size-3.5" />
          <span>Giỏ hàng</span>
          {cart.length > 0 && (
            <span className="size-4.5 min-w-4.5 px-1 rounded-full bg-primary text-white text-[10px] flex items-center justify-center font-bold">
              {cart.reduce((s, i) => s + i.quantity, 0)}
            </span>
          )}
        </button>
      </div>

      {/* ========================================================================= */}
      {/* LEFT COLUMN: PRODUCT CATALOG (Hidden on mobile if cart tab is active)     */}
      {/* ========================================================================= */}
      <div
        className={cn(
          "flex-1 flex-col bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden flex min-h-0 lg:h-full",
          mobileTab === "cart" && "hidden lg:flex",
        )}
      >
        {/* Top Controls Bar */}
        <div className="p-2.5 sm:p-3.5 border-b border-slate-100 space-y-2 sm:space-y-3 bg-slate-50/40 flex-shrink-0">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-2.5">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/60" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm tên, mã SKU hoặc phân loại..."
                className="h-9 sm:h-10 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-xs shadow-2xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
              />
            </div>

            {/* Quick Barcode Scanner Input */}
            <form
              onSubmit={handleBarcodeSubmit}
              className="flex items-center gap-1.5 flex-shrink-0"
            >
              <div className="relative flex-1 sm:flex-initial">
                <ScanBarcode className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/60" />
                <input
                  type="text"
                  value={barcodeInput}
                  onChange={(e) => setBarcodeInput(e.target.value)}
                  placeholder="Quét mã vạch USB..."
                  className="h-9 sm:h-10 w-full sm:w-48 rounded-xl border border-slate-200 bg-white pl-8 pr-2.5 text-xs shadow-2xs font-mono placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                />
              </div>

              {/* Camera Scanner Button */}
              <Button
                type="button"
                onClick={() => setIsScannerOpen(true)}
                className="h-9 sm:h-10 px-3 rounded-xl bg-primary text-white hover:bg-primary/90 flex items-center gap-1.5 text-xs font-medium cursor-pointer shadow-2xs flex-shrink-0"
                title="Mở Camera quét mã vạch / QR"
              >
                <ScanBarcode className="size-4" />
                <span className="hidden sm:inline">Camera</span>
              </Button>
            </form>
          </div>

          {/* Category Chips Bar */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-none flex-shrink-0">
            <button
              type="button"
              onClick={() => setSelectedCategoryId(null)}
              className={cn(
                "px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all cursor-pointer",
                selectedCategoryId === null
                  ? "bg-slate-900 text-white shadow-xs"
                  : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80",
              )}
            >
              Tất cả ({allProducts.length})
            </button>

            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategoryId(cat.id)}
                className={cn(
                  "px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all cursor-pointer",
                  selectedCategoryId === cat.id
                    ? "bg-primary text-white shadow-xs"
                    : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80",
                )}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Products Grid */}
        <div className="flex-1 p-2.5 sm:p-3.5 overflow-y-auto bg-slate-50/20 min-h-0">
          {productsQuery.isLoading ? (
            <div className="flex flex-col items-center justify-center h-64 gap-2 text-muted-foreground">
              <Spinner size="lg" />
              <span className="text-xs">Đang tải danh mục sản phẩm...</span>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center p-6 bg-white rounded-xl border border-dashed border-slate-200">
              <Package className="size-12 text-slate-300 mb-2" />
              <p className="text-sm font-semibold text-slate-700">
                Không tìm thấy sản phẩm
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Thử đổi từ khóa tìm kiếm hoặc chọn danh mục khác
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-3">
              {filteredProducts.map((product) => {
                const baseUnit =
                  product.productUnits?.find((u) => u.isBaseUnit) ||
                  product.productUnits?.[0];
                const price = baseUnit?.price ?? 0;
                const unitName = baseUnit?.unit?.name || "Đơn vị";
                const totalUnits = product.productUnits?.length || 0;

                // Check if this product is already in cart
                const cartQty = cart
                  .filter((i) => i.productId === product.id)
                  .reduce((s, i) => s + i.quantity, 0);

                return (
                  <div
                    key={product.id}
                    onClick={() => addToCart(product)}
                    className={cn(
                      "group relative flex flex-col justify-between p-2.5 sm:p-3 rounded-xl border bg-white shadow-2xs hover:shadow-md transition-all cursor-pointer select-none",
                      cartQty > 0
                        ? "border-primary/60 ring-1 ring-primary/20 bg-primary/2"
                        : "border-slate-200/90 hover:border-primary/40",
                    )}
                  >
                    {/* Badge showing items in cart */}
                    {cartQty > 0 && (
                      <div className="absolute -top-1.5 -right-1.5 size-5 rounded-full bg-primary text-white text-[10px] font-bold flex items-center justify-center shadow-xs animate-in zoom-in-75">
                        {cartQty}
                      </div>
                    )}

                    <div className="space-y-1.5">
                      {/* Product Thumbnail / Icon */}
                      <div className="flex items-center justify-between gap-1">
                        <div className="size-7 sm:size-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                          <Package className="size-3.5 sm:size-4" />
                        </div>
                        {totalUnits > 1 && (
                          <Badge
                            variant="secondary"
                            className="text-[9px] px-1.5 py-0 h-4 bg-slate-100 text-slate-600 gap-0.5"
                          >
                            <Layers className="size-2.5" />
                            {totalUnits} ĐV
                          </Badge>
                        )}
                      </div>

                      {/* Product Title & SKU */}
                      <div>
                        <h4 className="font-semibold text-xs text-slate-900 line-clamp-2 leading-snug group-hover:text-primary transition-colors">
                          {product.name}
                        </h4>
                        <span className="font-mono text-[10px] text-muted-foreground bg-slate-100 px-1 py-0.2 rounded mt-0.5 inline-block">
                          {product.sku}
                        </span>
                      </div>
                    </div>

                    {/* Price & Unit Footer */}
                    <div className="pt-2 sm:pt-2.5 mt-1.5 sm:mt-2 border-t border-slate-100 flex items-baseline justify-between">
                      <span className="font-bold text-xs text-primary">
                        {formatCurrency(price)}
                      </span>
                      <span className="text-[10px] text-muted-foreground font-medium">
                        /{unitName}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Quick mobile bottom cart summary bar when items exist */}
        {cart.length > 0 && (
          <div className="lg:hidden p-2 px-3 bg-white border-t border-slate-200 flex items-center justify-between gap-2 shadow-xs flex-shrink-0 animate-in slide-in-from-bottom-2">
            <div className="flex items-center gap-2">
              <div className="size-7 rounded-full bg-primary text-white flex items-center justify-center font-bold text-xs">
                {cart.reduce((s, i) => s + i.quantity, 0)}
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] text-muted-foreground leading-tight">
                  Tổng cộng:
                </span>
                <span className="text-xs font-bold text-primary leading-tight">
                  {formatCurrency(total)}
                </span>
              </div>
            </div>
            <Button
              type="button"
              size="sm"
              onClick={() => setMobileTab("cart")}
              className="h-8 px-3 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <span>Xem giỏ hàng</span>
              <ArrowRight className="size-3.5" />
            </Button>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* RIGHT COLUMN: CART & CHECKOUT (Hidden on mobile if catalog tab is active) */}
      {/* ========================================================================= */}
      <div
        className={cn(
          "flex-1 lg:flex-initial w-full lg:w-[410px] xl:w-[440px] flex-col bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden flex min-h-0 lg:h-full",
          mobileTab === "catalog" && "hidden lg:flex",
        )}
      >
        {/* Cart Header */}
        <div className="p-2.5 sm:p-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="size-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <ShoppingBag className="size-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                <span>Đơn hàng</span>
                {cart.length > 0 && (
                  <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4">
                    {cart.reduce((s, i) => s + i.quantity, 0)} món
                  </Badge>
                )}
              </h3>
              <p className="text-[10px] text-muted-foreground">
                Thu ngân: Harry Ngoc
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {/* Hold Order Button */}
            {cart.length > 0 && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={holdOrder}
                className="h-8 px-2 text-xs text-slate-600 hover:text-amber-700 hover:bg-amber-50 cursor-pointer"
                title="Lưu tạm đơn này"
              >
                <PauseCircle className="size-3.5 mr-1" />
                Lưu tạm
              </Button>
            )}

            {/* Clear Cart Button */}
            {cart.length > 0 && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={clearCart}
                className="h-8 px-2 text-xs text-destructive hover:bg-destructive/10 cursor-pointer"
                title="Xóa giỏ hàng"
              >
                <Trash2 className="size-3.5" />
              </Button>
            )}
          </div>
        </div>

        {/* Held Orders quick bar (if any exist) */}
        {heldOrders.length > 0 && (
          <div className="px-3 py-1.5 bg-amber-50/90 border-b border-amber-200/60 flex items-center gap-2 overflow-x-auto">
            <span className="text-[11px] font-semibold text-amber-800 whitespace-nowrap">
              Đơn tạm ({heldOrders.length}):
            </span>
            <div className="flex gap-1.5">
              {heldOrders.map((ho) => (
                <button
                  key={ho.id}
                  type="button"
                  onClick={() => resumeHoldOrder(ho.id)}
                  className="px-2 py-0.5 rounded bg-white text-amber-900 border border-amber-300 text-[10px] font-medium hover:bg-amber-100 whitespace-nowrap cursor-pointer"
                >
                  {ho.id} ({ho.time})
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Cart Items List */}
        <div className="flex-1 overflow-y-auto p-2.5 sm:p-3 space-y-2 sm:space-y-2.5 divide-y divide-slate-100 min-h-0">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full py-12 text-center text-muted-foreground space-y-2">
              <ShoppingBag className="size-12 text-slate-200" />
              <p className="text-xs font-medium">Chưa có sản phẩm nào trong đơn</p>
              <p className="text-[11px] text-slate-400 max-w-[200px]">
                Chọn sản phẩm từ danh mục bên trái hoặc quét mã vạch để thêm
              </p>
            </div>
          ) : (
            cart.map((item) => {
              const product = item.product;
              const units = product.productUnits || [];

              return (
                <div key={item.id} className="pt-2 first:pt-0 space-y-1.5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-xs text-slate-900 truncate">
                        {product.name}
                      </h4>
                      <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground mt-0.5">
                        <span className="font-mono">{item.sku}</span>
                        <span>•</span>
                        <span className="font-semibold text-slate-700">
                          {formatCurrency(item.price)}
                        </span>
                      </div>
                    </div>

                    {/* Remove Item Button */}
                    <button
                      type="button"
                      onClick={() => removeFromCart(item.id)}
                      className="p-1 rounded text-slate-400 hover:text-destructive hover:bg-destructive/10 transition-colors"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>

                  {/* Unit Selector & Quantity Controls */}
                  <div className="flex items-center justify-between gap-2 pt-0.5">
                    {/* Unit Dropdown */}
                    {units.length > 1 ? (
                      <select
                        value={item.unitId}
                        onChange={(e) =>
                          changeCartItemUnit(item.id, Number(e.target.value))
                        }
                        className="h-7 text-[11px] font-medium rounded-md border border-slate-200 bg-slate-50 px-1.5 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary cursor-pointer"
                      >
                        {units.map((u) => {
                          const uId = u.unit?.id || u.id;
                          return (
                            <option key={uId} value={uId}>
                              {u.unit?.name || "ĐV"} ({formatCurrency(u.price)})
                            </option>
                          );
                        })}
                      </select>
                    ) : (
                      <span className="text-[11px] font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                        {item.unitName}
                      </span>
                    )}

                    {/* Quantity Adjustment */}
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.id, -1)}
                        className="size-7 rounded-md border border-slate-200 bg-white flex items-center justify-center hover:bg-slate-100 active:scale-95 transition-all cursor-pointer"
                      >
                        <Minus className="size-3 text-slate-700" />
                      </button>
                      <input
                        type="number"
                        min={1}
                        value={item.quantity}
                        onChange={(e) =>
                          setExactQuantity(item.id, parseInt(e.target.value, 10))
                        }
                        onFocus={(e) => e.target.select()}
                        className="h-7 w-10 text-center font-bold text-xs rounded-md border border-slate-200 bg-white focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                      />
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.id, 1)}
                        className="size-7 rounded-md border border-slate-200 bg-white flex items-center justify-center hover:bg-slate-100 active:scale-95 transition-all cursor-pointer"
                      >
                        <Plus className="size-3 text-slate-700" />
                      </button>
                    </div>

                    {/* Item Line Total */}
                    <span className="font-bold text-xs text-slate-900 min-w-[70px] text-right">
                      {formatCurrency(item.price * item.quantity)}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Order Calculations & Discounts */}
        <div className="p-2.5 sm:p-3.5 bg-slate-50/70 border-t border-slate-200/80 space-y-1.5 sm:space-y-2 text-xs flex-shrink-0">
          {/* Subtotal */}
          <div className="flex justify-between text-muted-foreground">
            <span>Tạm tính ({cart.reduce((s, i) => s + i.quantity, 0)} món):</span>
            <span className="font-semibold text-slate-800">
              {formatCurrency(subtotal)}
            </span>
          </div>

          {/* Discount Field */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1">
              <span className="text-muted-foreground">Giảm giá:</span>
              <button
                type="button"
                onClick={() =>
                  setDiscountType((t) => (t === "percent" ? "fixed" : "percent"))
                }
                className="text-[10px] text-primary hover:underline font-semibold"
              >
                ({discountType === "percent" ? "%" : "VND"})
              </button>
            </div>
            <div className="flex items-center gap-1">
              <input
                type="number"
                min={0}
                max={discountType === "percent" ? 100 : subtotal}
                value={discountValue || ""}
                onChange={(e) => setDiscountValue(Number(e.target.value))}
                onFocus={(e) => e.target.select()}
                placeholder="0"
                className="h-6 w-16 text-right px-1.5 text-xs rounded border border-slate-200 bg-white focus-visible:outline-none"
              />
              <span className="text-[11px] font-medium text-emerald-700">
                -{formatCurrency(discountAmount)}
              </span>
            </div>
          </div>

          {/* Grand Total */}
          <div className="flex items-baseline justify-between pt-1.5 border-t border-slate-200">
            <span className="font-bold text-sm text-slate-900">
              KHÁCH PHẢI TRẢ:
            </span>
            <span className="text-lg font-extrabold text-primary">
              {formatCurrency(total)}
            </span>
          </div>


          {/* Cash Payment Details */}
          {paymentMethod === "cash" && (
            <div className="space-y-2 pt-2 border-t border-slate-200/80 animate-in fade-in">
              <div className="flex items-center justify-between gap-2">
                <label
                  htmlFor="pos-customer-money-input"
                  className="text-[11px] font-semibold text-slate-700 flex items-center gap-1.5 cursor-pointer"
                >
                  <Coins className="size-3.5 text-amber-500" />
                  <span>Tiền khách đưa:</span>
                </label>

                {/* Input container */}
                <div className="relative flex items-center">
                  <input
                    id="pos-customer-money-input"
                    ref={customerMoneyInputRef}
                    type="text"
                    inputMode="numeric"
                    value={displayCustomerMoney}
                    onChange={handleCustomerMoneyChange}
                    onFocus={handleCustomerMoneyFocus}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleCheckout();
                      } else if (e.key === "Escape") {
                        e.preventDefault();
                        handleSetExactMoney();
                      }
                    }}
                    placeholder="0"
                    className="h-8 w-36 text-right font-bold text-xs pl-2 pr-7 rounded-lg border border-slate-300 bg-white shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary transition-all"
                  />
                  <span className="absolute right-2 text-[11px] font-medium text-slate-400 pointer-events-none select-none">
                    ₫
                  </span>
                  {isCustomCustomerMoney && customerMoneyInput !== "" && (
                    <button
                      type="button"
                      onClick={handleClearCustomerMoney}
                      className="absolute right-5 p-0.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                      title="Xóa nhanh (để nhập lại)"
                    >
                      <X className="size-3" />
                    </button>
                  )}
                </div>
              </div>

              {/* Quick Cash Suggestion Chips */}
              {total > 0 && (
                <div className="flex items-center gap-1 flex-wrap pt-0.5">
                  <button
                    type="button"
                    onClick={handleSetExactMoney}
                    className={cn(
                      "px-2 py-0.5 text-[10px] font-semibold rounded-md border transition-all cursor-pointer",
                      !isCustomCustomerMoney || effectiveCustomerMoney === total
                        ? "bg-emerald-50 text-emerald-700 border-emerald-300 shadow-2xs"
                        : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:border-slate-300",
                    )}
                    title="Khách đưa vừa đúng số tiền"
                  >
                    Đủ tiền
                  </button>

                  {cashSuggestions.map((amt) => {
                    const isSelected =
                      isCustomCustomerMoney && effectiveCustomerMoney === amt;
                    return (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => handleSelectCashSuggestion(amt)}
                        className={cn(
                          "px-2 py-0.5 text-[10px] font-semibold rounded-md border transition-all cursor-pointer",
                          isSelected
                            ? "bg-primary text-primary-foreground border-primary shadow-2xs"
                            : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:border-slate-300",
                        )}
                        title={`Khách đưa ${formatCurrency(amt)}`}
                      >
                        {formatNumberWithDots(amt)}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Change calculation */}
              <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-200/60 font-semibold">
                <span>
                  {effectiveCustomerMoney >= total
                    ? "Tiền thừa trả khách:"
                    : "Còn thiếu:"}
                </span>
                <span
                  className={
                    effectiveCustomerMoney >= total
                      ? "text-emerald-700 font-bold text-sm"
                      : "text-rose-600 font-semibold text-xs"
                  }
                >
                  {effectiveCustomerMoney >= total
                    ? formatCurrency(changeMoney)
                    : `-${formatCurrency(total - effectiveCustomerMoney)}`}
                </span>
              </div>
            </div>
          )}



          {/* Big Checkout Button */}
          <Button
            type="button"
            size="lg"
            disabled={cart.length === 0}
            onClick={handleCheckout}
            className="w-full h-11 rounded-xl text-sm font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Receipt className="size-4.5" />
            <span>THANH TOÁN ({formatCurrency(total)})</span>
            <ArrowRight className="size-4" />
          </Button>
        </div>
      </div>

      {/* Barcode Camera & WebSocket Scanner Modal */}
      <PosScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        title="Quét mã bán hàng (POS)"
        description="Quét mã vạch hoặc mã QR để thêm sản phẩm vào đơn hàng"
        preventCloseOnOutsideClick={true}
        onScanSuccess={(code) => handleBarcodeLookup(code)}
      />

      {/* Receipt Modal (Appears after checkout) */}
      <PosReceiptModal
        order={completedOrder}
        isOpen={Boolean(completedOrder)}
        onClose={() => setCompletedOrder(null)}
        onNewOrder={handleStartNewOrder}
      />
    </div>
  );
};
