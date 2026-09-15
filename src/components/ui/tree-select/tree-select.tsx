import * as React from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/utils/cn";

import { ChevronDown, Search, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { getTreeValueLabelMap } from "./tree-utils";
import { TreeView } from "./tree-view";
import type { TreeSelectProps } from "./types";

export type TreeSelectComponentProps = TreeSelectProps & {
  className?: string;
  loading?: boolean;
  "aria-invalid"?: boolean | "grammar" | "spelling";
};

export const TreeSelect = ({
  value = [],
  onValueChange,
  data,
  className,
  loading,
  placeholder,
  disabled,
  multiple = true,
  "aria-invalid": invalid,
}: TreeSelectComponentProps) => {
  const safeValue = Array.isArray(value) ? value : [];
  const ref = React.useRef<HTMLButtonElement>(null);
  const [search, setSearch] = React.useState<string | undefined>("");
  const deferredSearch = React.useDeferredValue(search);

  const valueLabelMap = React.useMemo(() => {
    return getTreeValueLabelMap(data);
  }, [data]);

  return (
    <Popover modal>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          disabled={disabled}
          className={cn(
            "flex w-full h-fit min-h-9 items-center justify-between py-1.5 pl-2.5 pr-0 hover:bg-background",
            invalid && "border-destructive focus-visible:ring-destructive",
            className,
            safeValue.length > 1 && "h-auto"
          )}
          ref={ref}
          aria-invalid={invalid}
        >
          <div className="relative flex grow flex-wrap items-center gap-[6px] overflow-hidden">
            {safeValue.length > 0 ? (
              safeValue.map((v) => (
                <Badge
                  key={v}
                  variant="secondary"
                  className={cn(
                    "text-wrap rounded-sm px-1.5 py-0.5 text-left font-semibold hover:bg-indigo-50 hover:text-primary",
                    multiple && "gap-1.5"
                  )}
                >
                  {valueLabelMap.get(v) ?? v}
                  {multiple && (
                    <div
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        onValueChange(safeValue.filter((value) => value !== v));
                      }}
                      onKeyDown={(e) => {
                        if (e.key === " " || e.key === "Enter") {
                          onValueChange(safeValue.filter((value) => value !== v));
                          ref.current?.focus();
                        }
                      }}
                      role="button"
                      tabIndex={0}
                    >
                      <X size={14} />
                    </div>
                  )}
                </Badge>
              ))
            ) : (
              <span className="ml-1 text-sm text-muted-foreground">
                {placeholder ?? "Select options..."}
              </span>
            )}
          </div>

          {safeValue.length > 0 && (
            <div
              className={cn(
                buttonVariants({ size: "sm", variant: "ghost" }),
                "flex h-auto rounded-sm border-none px-2 py-0 text-gray-500 transition-colors hover:bg-transparent hover:text-primary"
              )}
              onClick={(e) => {
                e.preventDefault();
                onValueChange([]);
              }}
              onKeyDown={(e) => {
                if (e.key === " " || e.key === "Enter") {
                  onValueChange([]);
                  ref.current?.focus();
                }
              }}
              role="button"
              tabIndex={0}
            >
              <X className="size-4" />
            </div>
          )}
          <span className="w-px self-stretch bg-border" />
          <div className="flex items-center px-2 hover:text-muted-foreground">
            <ChevronDown size={16} />
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[var(--radix-popover-trigger-width)] p-0"
        align="start"
      >
        <div className="flex items-center border-b px-3" cmdk-input-wrapper="">
          <Search className="mr-2 size-4 shrink-0 opacity-50" />
          <input
            value={search ?? ""}
            onChange={(e) => {
              setSearch(e.target.value);
            }}
            className="flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
          />
        </div>
        <div className="max-h-56 overflow-y-auto p-2">
          {loading && (
            <div className="p-8 text-center text-sm text-gray-400">
              Loading...
            </div>
          )}
          {!loading && data.length === 0 && (
            <div className="p-8 text-center text-sm">No results</div>
          )}
          {!loading && data.length > 0 && (
            <TreeView
              value={safeValue}
              onValueChange={onValueChange}
              data={data}
              multiple={multiple}
              searchValue={deferredSearch}
            />
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};