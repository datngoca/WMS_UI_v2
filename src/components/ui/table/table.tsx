import { ArchiveX } from "lucide-react";

import { cn } from "@/utils/cn";

import { type BaseEntity } from "@/types/api";

import { TablePagination, type TablePaginationProps } from "./pagination";

const TableElement = ({
  className,
  ref,
  ...props
}: React.ComponentPropsWithRef<"table">) => (
  <div className="relative w-full overflow-auto">
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
  <thead ref={ref} className={cn("[&_tr]:border-b", className)} {...props} />
);
TableHeader.displayName = "TableHeader";

const TableBody = ({
  className,
  ref,
  ...props
}: React.ComponentPropsWithRef<"tbody">) => (
  <tbody
    ref={ref}
    className={cn("[&_tr:last-child]:border-0", className)}
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
      "border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted",
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
      "h-10 px-2 text-left align-middle font-medium text-muted-foreground has-[[role=checkbox]]:pr-0 *:[[role=checkbox]]:translate-y-0.5",
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
      "p-2 align-middle has-[role=checkbox]:pr-0 *:[[role=checkbox]]:translate-y-0.5",
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
};

export type TableProps<Entry> = {
  data: Entry[];
  columns: TableColumn<Entry>[];
  pagination?: TablePaginationProps;
};

export const Table = <Entry extends BaseEntity>({
  data,
  columns,
  pagination,
}: TableProps<Entry>) => {
  if (!data.length) {
    return (
      <div className="flex h-80 flex-col items-center justify-center bg-white text-gray-500">
        <ArchiveX className="size-16" />
        <h4>No Entries Found</h4>
      </div>
    );
  }
  return (
    <>
      <TableElement>
        <TableHeader>
          <TableRow>
            {columns.map((column, index) => (
              <TableHead key={column.title + index}>{column.title}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((entry, entryIndex) => (
            <TableRow key={entry?.id || entryIndex}>
              {columns.map(({ Cell, field, title }, columnIndex) => (
                <TableCell key={title + columnIndex}>
                  {Cell ? <Cell entry={entry} /> : `${entry[field]}`}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </TableElement>

      {pagination && <TablePagination {...pagination} />}
    </>
  );
};
