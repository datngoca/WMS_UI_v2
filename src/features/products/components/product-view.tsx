import * as React from "react";
import {
    Package,
    Layers,
    FileText,
    SlidersHorizontal,
    Tag,
    DollarSign,
    ArrowRight,
    Clock,
    Copy,
    Check,
    CheckCircle2,
    Info,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { FormDrawer } from "@/components/ui/form";
import { cn } from "@/utils/cn";
import { formatCurrency, formatDate } from "@/utils/format";
import type { Product } from "@/types/api";

import { useProduct } from "../api/get-product";

type ViewTabKey = "overview" | "units" | "specs" | "options";

export type ProductViewProps = {
    productId?: number;
    product?: Product;
    triggerButton?: React.ReactElement;
    isOpen?: boolean;
    onOpenChange?: (open: boolean) => void;
};

export const ProductView = ({
    productId,
    product: initialProduct,
    triggerButton,
    isOpen: controlledIsOpen,
    onOpenChange: setControlledIsOpen,
}: ProductViewProps) => {
    const [internalIsOpen, setInternalIsOpen] = React.useState(false);

    const isControlled = controlledIsOpen !== undefined;
    const isOpen = isControlled ? controlledIsOpen : internalIsOpen;
    const setIsOpen = isControlled
        ? setControlledIsOpen ?? (() => { })
        : setInternalIsOpen;

    // Query only if product wasn't provided directly and drawer is open
    const productQuery = useProduct({
        productId: productId || 0,
        queryConfig: {
            enabled: isOpen && !initialProduct && Boolean(productId),
        },
    });

    const product = initialProduct || productQuery.data?.data;
    const isLoading = !initialProduct && productQuery.isLoading;

    return (
        <FormDrawer
            open={isOpen}
            onOpenChange={setIsOpen}
            triggerButton={triggerButton}
            title={product ? product.name : "Chi tiết sản phẩm"}
            description={product?.sku ? `SKU: ${product.sku}` : undefined}
            icon={<Package className="size-4 sm:size-5" />}
            closeButtonText="Đóng"
            footerContent={
                product?.createdAt
                    ? `Tạo: ${formatDate(product.createdAt)}`
                    : "WMS Products"
            }
        >
            {isLoading ? (
                <div className="flex h-80 flex-col items-center justify-center gap-3">
                    <Spinner size="lg" />
                    <p className="text-xs text-muted-foreground animate-pulse">
                        Đang tải thông tin sản phẩm...
                    </p>
                </div>
            ) : !product ? (
                <div className="flex h-80 flex-col items-center justify-center gap-2 p-6 text-center">
                    <Info className="size-8 text-muted-foreground/60" />
                    <p className="text-sm font-medium text-foreground">
                        Không tìm thấy dữ liệu sản phẩm
                    </p>
                    <p className="text-xs text-muted-foreground max-w-xs">
                        Sản phẩm có thể đã bị xóa hoặc đường dẫn không hợp lệ.
                    </p>
                </div>
            ) : (
                <ProductDetailContent product={product} />
            )}
        </FormDrawer>
    );
};

export const ProductDetailContent = ({ product }: { product: Product }) => {
    const [activeTab, setActiveTab] = React.useState<ViewTabKey>("overview");
    const [copiedSku, setCopiedSku] = React.useState(false);

    const baseUnit =
        product.productUnits?.find((u) => u.isBaseUnit) || product.productUnits?.[0];
    const exchangeUnits =
        product.productUnits?.filter((u) => !u.isBaseUnit) || [];

    const handleCopySku = () => {
        if (!product.sku) return;
        navigator.clipboard.writeText(product.sku);
        setCopiedSku(true);
        setTimeout(() => setCopiedSku(false), 2000);
    };

    const tabs = [
        {
            key: "overview" as ViewTabKey,
            label: "Tổng quan",
            icon: Package,
        },
        {
            key: "units" as ViewTabKey,
            label: "Đơn vị & Giá",
            icon: Layers,
            count: product.productUnits?.length || 0,
        },
        {
            key: "specs" as ViewTabKey,
            label: "Thông số",
            icon: FileText,
            count:
                (product.specs?.length || 0) + (product.detailedSpecs?.length || 0),
        },
        {
            key: "options" as ViewTabKey,
            label: "Biến thể",
            icon: SlidersHorizontal,
            count: product.options?.length || 0,
        },
    ];

    return (
        <div className="space-y-4">
            {/* Quick Stats Metric Grid (Optimized for mobile 2 cols, sm: 4 cols) */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="p-3 rounded-xl border border-border/80 bg-card/60 shadow-2xs">
                    <div className="flex items-center gap-1.5 text-muted-foreground text-[11px]">
                        <DollarSign className="size-3.5 text-emerald-600" />
                        <span>Giá cơ bản</span>
                    </div>
                    <p className="mt-1 font-bold text-sm sm:text-base text-foreground truncate">
                        {baseUnit ? formatCurrency(baseUnit.price) : "Chưa đặt"}
                    </p>
                    <span className="text-[10px] text-muted-foreground">
                        ĐV: {baseUnit?.unit?.name || "Mặc định"}
                    </span>
                </div>

                <div className="p-3 rounded-xl border border-border/80 bg-card/60 shadow-2xs">
                    <div className="flex items-center gap-1.5 text-muted-foreground text-[11px]">
                        <Layers className="size-3.5 text-blue-600" />
                        <span>Đơn vị tính</span>
                    </div>
                    <p className="mt-1 font-bold text-sm sm:text-base text-foreground">
                        {product.productUnits?.length || 0}
                    </p>
                    <span className="text-[10px] text-muted-foreground">
                        {exchangeUnits.length} đơn vị quy đổi
                    </span>
                </div>

                <div className="p-3 rounded-xl border border-border/80 bg-card/60 shadow-2xs">
                    <div className="flex items-center gap-1.5 text-muted-foreground text-[11px]">
                        <FileText className="size-3.5 text-indigo-600" />
                        <span>Thông số</span>
                    </div>
                    <p className="mt-1 font-bold text-sm sm:text-base text-foreground">
                        {product.specs?.length || 0}
                    </p>
                    <span className="text-[10px] text-muted-foreground">Thuộc tính</span>
                </div>

                <div className="p-3 rounded-xl border border-border/80 bg-card/60 shadow-2xs">
                    <div className="flex items-center gap-1.5 text-muted-foreground text-[11px]">
                        <SlidersHorizontal className="size-3.5 text-amber-600" />
                        <span>Tùy chọn</span>
                    </div>
                    <p className="mt-1 font-bold text-sm sm:text-base text-foreground">
                        {product.options?.length || 0}
                    </p>
                    <span className="text-[10px] text-muted-foreground">Nhóm biến thể</span>
                </div>
            </div>

            {/* Segmented Tab Bar */}
            <div className="flex items-center p-1 bg-muted/60 rounded-xl border border-border/60 gap-1 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                {tabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.key;
                    return (
                        <button
                            key={tab.key}
                            type="button"
                            onClick={() => setActiveTab(tab.key)}
                            className={cn(
                                "flex-1 min-w-fit flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg transition-all whitespace-nowrap cursor-pointer select-none",
                                isActive
                                    ? "bg-background text-primary shadow-xs font-semibold border border-border/40"
                                    : "text-muted-foreground hover:text-foreground hover:bg-background/40",
                            )}
                        >
                            <Icon className="size-3.5 shrink-0" />
                            <span>{tab.label}</span>
                            {typeof tab.count === "number" && tab.count > 0 && (
                                <Badge
                                    variant={isActive ? "default" : "secondary"}
                                    className="px-1.5 py-0 text-[10px] h-3.5 shrink-0 font-normal"
                                >
                                    {tab.count}
                                </Badge>
                            )}
                        </button>
                    );
                })}
            </div>

            {/* Tab 1: Tổng quan (Overview) */}
            {activeTab === "overview" && (
                <div className="space-y-4 animate-in fade-in-50 duration-200">
                    {/* Main Info Card */}
                    <div className="p-4 rounded-xl border border-border/80 bg-card/60 space-y-3 shadow-2xs">
                        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                            Thông tin sản phẩm
                        </h3>
                        <div className="space-y-2">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pb-2 border-b border-border/60">
                                <span className="text-xs text-muted-foreground">Tên đầy đủ:</span>
                                <span className="text-xs font-semibold text-foreground sm:text-right">
                                    {product.name}
                                </span>
                            </div>

                            <div className="flex items-center justify-between pb-2 border-b border-border/60">
                                <span className="text-xs text-muted-foreground">Mã SKU:</span>
                                <div className="flex items-center gap-1.5">
                                    <span className="font-mono text-xs font-medium text-foreground bg-muted/60 px-2 py-0.5 rounded">
                                        {product.sku || "—"}
                                    </span>
                                    {product.sku && (
                                        <button
                                            type="button"
                                            onClick={handleCopySku}
                                            className="text-muted-foreground hover:text-primary transition-colors cursor-pointer p-0.5"
                                            title="Sao chép SKU"
                                        >
                                            {copiedSku ? (
                                                <Check className="size-3.5 text-emerald-600" />
                                            ) : (
                                                <Copy className="size-3.5" />
                                            )}
                                        </button>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-center justify-between pb-2 border-b border-border/60">
                                <span className="text-xs text-muted-foreground">Mã hệ thống (ID):</span>
                                <span className="text-xs font-mono text-muted-foreground">
                                    #{product.id}
                                </span>
                            </div>

                            {/* Categories */}
                            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 pt-1">
                                <span className="text-xs text-muted-foreground flex-shrink-0">
                                    Danh mục:
                                </span>
                                <div className="flex flex-wrap gap-1 sm:justify-end">
                                    {product.categories && product.categories.length > 0 ? (
                                        product.categories.map((cat) => (
                                            <Badge
                                                key={cat.id}
                                                variant="secondary"
                                                className="text-[11px] font-normal px-2 py-0.5 bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                                            >
                                                <Tag className="size-2.5 mr-1 text-slate-400" />
                                                {cat.name}
                                            </Badge>
                                        ))
                                    ) : (
                                        <span className="text-xs text-muted-foreground/60 italic">
                                            Chưa phân loại
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Description Card */}
                    <div className="p-4 rounded-xl border border-border/80 bg-card/60 space-y-2 shadow-2xs">
                        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                            Mô tả chi tiết
                        </h3>
                        {product.description ? (
                            /<[a-z][\s\S]*>/i.test(product.description) ? (
                                <div
                                    className="text-xs text-foreground/90 leading-relaxed [&_p]:mb-1.5 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:my-1.5 [&_li]:mb-1 [&_strong]:font-semibold [&_a]:text-primary [&_a]:underline break-words"
                                    dangerouslySetInnerHTML={{ __html: product.description }}
                                />
                            ) : (
                                <p className="text-xs text-foreground/90 whitespace-pre-line leading-relaxed">
                                    {product.description}
                                </p>
                            )
                        ) : (
                            <p className="text-xs text-muted-foreground/60 italic">
                                Chưa có mô tả cho sản phẩm này.
                            </p>
                        )}
                    </div>

                    {/* Timestamps */}
                    <div className="flex items-center justify-between px-1 text-[11px] text-muted-foreground">
                        <div className="flex items-center gap-1">
                            <Clock className="size-3 text-muted-foreground/60" />
                            <span>Tạo: {formatDate(product.createdAt)}</span>
                        </div>
                        {product.updateAt && (
                            <div className="flex items-center gap-1">
                                <span>Cập nhật: {formatDate(product.updateAt)}</span>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Tab 2: Đơn vị & Bảng giá (Units & Prices) */}
            {activeTab === "units" && (
                <div className="space-y-3 animate-in fade-in-50 duration-200">
                    <div className="flex items-center justify-between pb-1">
                        <p className="text-xs text-muted-foreground">
                            Cấu hình đơn vị cơ bản và tỉ lệ quy đổi giá bán
                        </p>
                        <Badge variant="outline" className="text-[10px]">
                            {product.productUnits?.length || 0} đơn vị
                        </Badge>
                    </div>

                    {(!product.productUnits || product.productUnits.length === 0) ? (
                        <div className="flex flex-col items-center justify-center p-8 border border-dashed rounded-xl text-center bg-muted/20">
                            <Layers className="size-8 text-muted-foreground/40 mb-2" />
                            <p className="text-sm font-medium text-muted-foreground">
                                Chưa có đơn vị tính nào
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {/* Base Unit Prominent Card */}
                            {baseUnit && (
                                <div className="p-3.5 rounded-xl border-2 border-primary/30 bg-primary/5 shadow-2xs space-y-2 relative">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-1.5">
                                            <Badge className="bg-primary text-primary-foreground text-[10px] px-2 py-0.5 flex items-center gap-1">
                                                <CheckCircle2 className="size-3" />
                                                Đơn vị cơ bản (Base)
                                            </Badge>
                                            <span className="font-semibold text-sm text-foreground">
                                                {baseUnit.unit?.name || "Cơ bản"}
                                            </span>
                                            {baseUnit.unit?.code && (
                                                <span className="text-xs text-muted-foreground">
                                                    ({baseUnit.unit.code})
                                                </span>
                                            )}
                                        </div>
                                        <span className="text-sm font-bold text-primary">
                                            {formatCurrency(baseUnit.price)}
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-primary/10">
                                        <div>
                                            <span className="text-muted-foreground text-[11px]">
                                                Tỉ lệ quy đổi:
                                            </span>
                                            <p className="font-medium text-foreground">1 (Chuẩn)</p>
                                        </div>
                                        <div>
                                            <span className="text-muted-foreground text-[11px]">
                                                Mã đơn vị:
                                            </span>
                                            <p className="font-mono text-foreground">
                                                {baseUnit.unit?.code || `#${baseUnit.unit?.id || "1"}`}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Exchange Units */}
                            {exchangeUnits.length > 0 && (
                                <div className="space-y-2 pt-1">
                                    <span className="text-xs font-medium text-muted-foreground">
                                        Đơn vị quy đổi ({exchangeUnits.length})
                                    </span>
                                    {exchangeUnits.map((u, idx) => (
                                        <div
                                            key={u.id || idx}
                                            className="p-3 rounded-xl border border-border/80 bg-card/60 shadow-2xs space-y-2 hover:border-primary/40 transition-all"
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs font-semibold text-foreground">
                                                        {u.unit?.name || `Đơn vị #${idx + 1}`}
                                                    </span>
                                                    {u.unit?.code && (
                                                        <span className="text-[11px] text-muted-foreground font-mono">
                                                            ({u.unit.code})
                                                        </span>
                                                    )}
                                                </div>
                                                <span className="text-xs font-bold text-foreground">
                                                    {formatCurrency(u.price)}
                                                </span>
                                            </div>

                                            <div className="flex items-center justify-between text-xs pt-1 border-t border-border/60">
                                                <div className="flex items-center gap-1.5 text-muted-foreground">
                                                    <ArrowRight className="size-3 text-primary" />
                                                    <span>
                                                        1 {u.unit?.name || "đơn vị"} ={" "}
                                                        <strong className="text-foreground">
                                                            {u.exchangeValue}
                                                        </strong>{" "}
                                                        {baseUnit?.unit?.name || "đơn vị cơ bản"}
                                                    </span>
                                                </div>
                                                <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                                                    Quy đổi
                                                </Badge>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* Tab 3: Thông số kỹ thuật (Specifications) */}
            {activeTab === "specs" && (
                <div className="space-y-3 animate-in fade-in-50 duration-200">
                    <p className="text-xs text-muted-foreground pb-1">
                        Các thuộc tính đặc thù và thông số kỹ thuật của sản phẩm
                    </p>

                    {(!product.specs || product.specs.length === 0) &&
                        (!product.detailedSpecs || product.detailedSpecs.length === 0) ? (
                        <div className="flex flex-col items-center justify-center p-8 border border-dashed rounded-xl text-center bg-muted/20">
                            <FileText className="size-8 text-muted-foreground/40 mb-2" />
                            <p className="text-sm font-medium text-muted-foreground">
                                Chưa có thông số kỹ thuật nào
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {/* Flat Specs */}
                            {product.specs && product.specs.length > 0 && (
                                <div className="rounded-xl border border-border/80 bg-card/60 divide-y divide-border/60 shadow-2xs overflow-hidden">
                                    {product.specs.map((spec, i) => (
                                        <div
                                            key={i}
                                            className="flex items-center justify-between p-3 text-xs hover:bg-muted/30 transition-colors"
                                        >
                                            <span className="font-medium text-muted-foreground">
                                                {spec.label}
                                            </span>
                                            <span className="font-semibold text-foreground text-right">
                                                {spec.value}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Grouped Detailed Specs */}
                            {product.detailedSpecs &&
                                product.detailedSpecs.map((group, groupIdx) => (
                                    <div
                                        key={groupIdx}
                                        className="rounded-xl border border-border/80 bg-card/60 shadow-2xs overflow-hidden"
                                    >
                                        <div className="px-3.5 py-2 bg-muted/40 border-b border-border/60 font-semibold text-xs text-foreground">
                                            {group.groupName}
                                        </div>
                                        <div className="divide-y divide-border/60">
                                            {group.items?.map((item, itemIdx) => (
                                                <div
                                                    key={itemIdx}
                                                    className="flex items-center justify-between p-3 text-xs hover:bg-muted/30 transition-colors"
                                                >
                                                    <span className="font-medium text-muted-foreground">
                                                        {item.label}
                                                    </span>
                                                    <span className="font-semibold text-foreground text-right">
                                                        {item.value}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                        </div>
                    )}
                </div>
            )}

            {/* Tab 4: Tùy chọn biến thể (Options & Variants) */}
            {activeTab === "options" && (
                <div className="space-y-3 animate-in fade-in-50 duration-200">
                    <p className="text-xs text-muted-foreground pb-1">
                        Các nhóm tùy chọn và giá trị biến thể của sản phẩm
                    </p>

                    {(!product.options || product.options.length === 0) ? (
                        <div className="flex flex-col items-center justify-center p-8 border border-dashed rounded-xl text-center bg-muted/20">
                            <SlidersHorizontal className="size-8 text-muted-foreground/40 mb-2" />
                            <p className="text-sm font-medium text-muted-foreground">
                                Chưa có tùy chọn biến thể nào
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {product.options.map((opt, optIndex) => (
                                <div
                                    key={optIndex}
                                    className="p-3.5 rounded-xl border border-border/80 bg-card/60 shadow-2xs space-y-2.5"
                                >
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-semibold text-foreground">
                                            {opt.name}
                                        </span>
                                        <Badge
                                            variant="secondary"
                                            className="text-[10px] font-normal uppercase"
                                        >
                                            {opt.type || "select"}
                                        </Badge>
                                    </div>

                                    <div className="flex flex-wrap gap-1.5 pt-1">
                                        {opt.values && opt.values.length > 0 ? (
                                            opt.values.map((val, valIndex) => (
                                                <div
                                                    key={valIndex}
                                                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-muted/50 border border-border/60 text-xs text-foreground"
                                                >
                                                    <span className="font-medium">{val.label}</span>
                                                    {val.value && val.value !== val.label && (
                                                        <span className="text-[10px] text-muted-foreground font-mono">
                                                            ({val.value})
                                                        </span>
                                                    )}
                                                </div>
                                            ))
                                        ) : (
                                            <span className="text-xs text-muted-foreground/60 italic">
                                                Chưa có giá trị
                                            </span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
