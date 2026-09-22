import * as React from "react";
import {
  ArchiveX,
  LayoutList,
  TableProperties,
  ArrowLeftRight,
} from "lucide-react";

import { cn } from "@/utils/cn";

import { type BaseEntity } from "@/types/api";

import { TablePagination, type TablePaginationProps } from "./pagination";

const TableElement = ({
  className,
  ref,
  ...props
}: React.ComponentPropsWithRef<"table">) => (
  <div className="relative w-full overflow-x-auto touch-pan-x [-webkit-overflow-scrolling:touch]">
    <table
      ref={ref}
      className={cn("w-full caption-bottom text-sm", className)}
      {...props}
    />
  </div>
);

TableElement.displayName = "Table";

const TableHeader = ({
  className,
  ref,
  ...props
}: React.ComponentPropsWithRef<"thead">) => (
  <thead ref={ref} className={cn("[&_tr]:border-b bg-slate-50/60", className)} {...props} />
);
TableHeader.displayName = "TableHeader";

const TableBody = ({
  className,
  ref,
  ...props
}: React.ComponentPropsWithRef<"tbody">) => (
  <tbody
    ref={ref}
    className={cn("[&_tr:last-child]:border-0 divide-y divide-slate-100", className)}
    {...props}
  />
);

TableBody.displayName = "TableBody";

const TableFooter = ({
  className,
  ref,
  ...props
}: React.ComponentPropsWithRef<"tfoot">) => (
  <tfoot
    ref={ref}
    className={cn(
      "border-t bg-muted/50 font-medium [&>tr]:last:border-b-0",
      className,
    )}
    {...props}
  />
);
TableFooter.displayName = "TableFooter";

const TableRow = ({
  className,
  ref,
  ...props
}: React.ComponentPropsWithRef<"tr">) => (
  <tr
    ref={ref}
    className={cn(
      "border-b transition-colors hover:bg-slate-50/80 data-[state=selected]:bg-muted",
      className,
    )}
    {...props}
  />
);
TableRow.displayName = "TableRow";

const TableHead = ({
  className,
  ref,
  ...props
}: React.ComponentPropsWithRef<"th">) => (
  <th
    ref={ref}
    className={cn(
      "h-10 px-2.5 sm:px-3 text-left align-middle font-semibold text-xs text-muted-foreground whitespace-nowrap has-[[role=checkbox]]:pr-0 *:[[role=checkbox]]:translate-y-0.5",
      className,
    )}
    {...props}
  />
);
TableHead.displayName = "TableHead";

const TableCell = ({
  className,
  ref,
  ...props
}: React.ComponentPropsWithRef<"td">) => (
  <td
    ref={ref}
    className={cn(
      "p-2.5 sm:p-3 align-middle text-xs has-[role=checkbox]:pr-0 *:[[role=checkbox]]:translate-y-0.5",
      className,
    )}
    {...props}
  />
);
TableCell.displayName = "TableCell";

const TableCaption = ({
  className,
  ref,
  ...props
}: React.ComponentPropsWithRef<"caption">) => (
  <caption
    ref={ref}
    className={cn("mt-4 text-sm text-muted-foreground", className)}
    {...props}
  />
);

TableCaption.displayName = "TableCaption";

export type TableColumn<Entry> = {
  title: string;
  field: keyof Entry;
  Cell?({ entry }: { entry: Entry }): React.ReactElement;
  className?: string;
  hideOnMobile?: boolean;
  isActionColumn?: boolean;
};

export type TableProps<Entry> = {
  data: Entry[];
  columns: TableColumn<Entry>[];
  pagination?: TablePaginationProps;
  renderMobileCard?: (entry: Entry, index: number) => React.ReactNode;
  defaultMobileView?: "card" | "table";
  showMobileViewToggle?: boolean;
  emptyMessage?: string;
};

export const Table = <Entry extends BaseEntity>({
  data,
  columns,
  pagination,
  renderMobileCard,
  defaultMobileView = "card",
  showMobileViewToggle = true,
  emptyMessage = "Không có dữ liệu",
}: TableProps<Entry>) => {
  const [mobileView, setMobileView] = React.useState<"card" | "table">(
    defaultMobileView,
  );

  if (!data.length) {
    return (
      <div className="flex h-72 flex-col items-center justify-center bg-white text-muted-foreground p-6 rounded-xl border border-slate-200/80">
        <ArchiveX className="size-12 text-muted-foreground/40 mb-2" />
        <h4 className="text-sm font-medium">{emptyMessage}</h4>
      </div>
    );
  }

  const primaryCol = columns[0];
  const actionCol = columns.find(
    (c) => c.isActionColumn || /action|thao tác|hành động/i.test(c.title),
  );
  const detailColumns = columns.filter(
    (c) => c !== primaryCol && c !== actionCol,
  );

  return (
    <div className="w-full">
      {/* Mobile view switcher bar */}
      {showMobileViewToggle && (
        <div className="md:hidden flex items-center justify-between px-3.5 py-2 bg-slate-50/90 border-b border-slate-200/70 text-xs">
          <span className="text-[11px] font-medium text-muted-foreground">
            {data.length} mục
          </span>
          <div className="flex items-center gap-1 bg-slate-200/60 p-0.5 rounded-lg">
            <button
              type="button"
              onClick={() => setMobileView("card")}
              className={cn(
                "px-2.5 py-1 rounded-md text-[11px] font-medium flex items-center gap-1 transition-all cursor-pointer",
                mobileView === "card"
                  ? "bg-white text-primary shadow-xs font-semibold"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <LayoutList className="size-3.5" />
              <span>Dạng thẻ</span>
            </button>
            <button
              type="button"
              onClick={() => setMobileView("table")}
              className={cn(
                "px-2.5 py-1 rounded-md text-[11px] font-medium flex items-center gap-1 transition-all cursor-pointer",
                mobileView === "table"
                  ? "bg-white text-primary shadow-xs font-semibold"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <TableProperties className="size-3.5" />
              <span>Dạng bảng</span>
            </button>
          </div>
        </div>
      )}

      {/* Mobile Card View */}
      {mobileView === "card" ? (
        <div className="md:hidden p-3 space-y-3 bg-slate-50/50">
          {data.map((entry, entryIndex) => {
            if (renderMobileCard) {
              return (
                <div key={entry?.id || entryIndex}>
                  {renderMobileCard(entry, entryIndex)}
                </div>
              );
            }

            return (
              <div
                key={entry?.id || entryIndex}
                className="rounded-xl border border-slate-200/80 bg-white p-3.5 shadow-2xs space-y-2.5 transition-all hover:border-primary/40 hover:shadow-xs"
              >
                {/* Card Header: Cột chính + Cột Thao tác */}
                <div className="flex items-start justify-between gap-2.5">
                  <div className="flex-1 min-w-0">
                    {primaryCol && (
                      <div>
                        {primaryCol.Cell ? (
                          <primaryCol.Cell entry={entry} />
                        ) : (
                          <span className="font-semibold text-xs text-slate-900 line-clamp-2">
                            {String(entry[primaryCol.field] ?? "")}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {actionCol && (
                    <div className="shrink-0 pt-0.5">
                      {actionCol.Cell ? (
                        <actionCol.Cell entry={entry} />
                      ) : (
                        String(entry[actionCol.field] ?? "")
                      )}
                    </div>
                  )}
                </div>

                {/* Các trường thông tin chi tiết */}
                {detailColumns.length > 0 && (
                  <div className="grid grid-cols-1 gap-1.5 pt-2 border-t border-slate-100 text-xs">
                    {detailColumns.map(({ Cell, field, title }, colIdx) => (
                      <div
                        key={title + colIdx}
                        className="flex items-center justify-between gap-3 py-0.5"
                      >
                        <span className="text-[11px] font-medium text-muted-foreground shrink-0">
                          {title}:
                        </span>
                        <div className="text-right text-slate-800 text-xs max-w-[65%] truncate">
                          {Cell ? <Cell entry={entry} /> : String(entry[field] ?? "—")}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : null}

      {/* Table Element (Always on desktop, and on mobile if mobileView === 'table') */}
      <div className={cn(mobileView === "card" && "hidden md:block")}>
        {mobileView === "table" && (
          <div className="md:hidden flex items-center justify-center gap-1.5 text-[11px] text-amber-800 bg-amber-50/80 py-1.5 px-3 border-b border-amber-200/50">
            <ArrowLeftRight className="size-3 text-amber-600" />
            <span>Vuốt ngang để xem đủ các cột</span>
          </div>
        )}

        <TableElement>
          <TableHeader>
            <TableRow>
              {columns.map((column, index) => (
                <TableHead
                  key={column.title + index}
                  className={cn(
                    column.className,
                    column.hideOnMobile && "hidden md:table-cell",
                  )}
                >
                  {column.title}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((entry, entryIndex) => (
              <TableRow key={entry?.id || entryIndex}>
                {columns.map(
                  (
                    { Cell, field, title, className, hideOnMobile },
                    columnIndex,
                  ) => (
                    <TableCell
                      key={title + columnIndex}
                      className={cn(
                        className,
                        hideOnMobile && "hidden md:table-cell",
                      )}
                    >
                      {Cell ? <Cell entry={entry} /> : `${entry[field]}`}
                    </TableCell>
                  ),
                )}
              </TableRow>
            ))}
          </TableBody>
        </TableElement>
      </div>

      {pagination && <TablePagination {...pagination} />}
    </div>
  );
};
