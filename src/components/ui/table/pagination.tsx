import { ChevronLeftIcon, ChevronRightIcon, EllipsisIcon } from "lucide-react";
import { type ButtonProps, buttonVariants } from "@/components/ui/button";
import { cn } from "@/utils/cn";

import { Link } from "../link";
import React from "react";

const Pagination = ({ className, ...props }: React.ComponentProps<"nav">) => (
  <nav
    role="navigation"
    aria-label="pagination"
    className={cn("mx-auto flex w-full justify-center", className)}
    {...props}
  />
);

Pagination.displayName = "Pagination";

const PaginationContent = ({
  className,
  ref,
  ...props
}: React.ComponentProps<"ul">) => (
  <ul
    ref={ref}
    className={cn("flex flex-row items-center gap-1", className)}
    {...props}
  />
);

PaginationContent.display = "PaginationContent";

const PaginationItem = ({
  className,
  ref,
  ...props
}: React.ComponentProps<"li">) => (
  <li ref={ref} className={cn("", className)} {...props} />
);

PaginationItem.displayName = "PaginationItem";

type PaginationLinkProps = {
  isActive?: boolean;
} & Pick<ButtonProps, "size"> &
  React.ComponentProps<"a">;

const PaginationLink = ({
  className,
  isActive,
  size = "icon",
  children,
  href,
  ...props
}: PaginationLinkProps) => (
  <Link
    to={href as string}
    aria-current={isActive ? "page" : undefined}
    className={cn(
      buttonVariants({ variant: isActive ? "outline" : "ghost", size }),
      "no-underline",
      className,
    )}
    {...props}
  >
    {children}
  </Link>
);

PaginationLink.displayName = "PaginationLink";

const PaginationPrevious = ({
  className,
  ...props
}: React.ComponentProps<typeof PaginationLink>) => (
  <PaginationLink
    aria-label="Go to previous page"
    size="default"
    className={cn("gap-1 px-2.5 sm:pl-2.5", className)}
    {...props}
  >
    <ChevronLeftIcon className="size-4" />
    <span className="hidden sm:inline">Trước</span>
  </PaginationLink>
);
PaginationPrevious.displayName = "PaginationPrevious";

const PaginationNext = ({
  className,
  ...props
}: React.ComponentProps<typeof PaginationLink>) => (
  <PaginationLink
    aria-label="Go to next page"
    size="default"
    className={cn("gap-1 px-2.5 sm:pr-2.5", className)}
    {...props}
  >
    <span className="hidden sm:inline">Sau</span>
    <ChevronRightIcon className="size-4" />
  </PaginationLink>
);

PaginationNext.displayName = "PaginationNext";

const PaginationEllipsis = ({
  className,
  ...props
}: React.ComponentProps<"span">) => (
  <span
    aria-hidden
    className={cn("flex h-9 w-9 items-center justify-center", className)}
    {...props}
  >
    <EllipsisIcon className="size-4" />
    <span className="sr-only">More pages</span>
  </span>
);
PaginationEllipsis.displayName = "PaginationEllipsis";

export {
  Pagination,
  PaginationContent,
  PaginationLink,
  PaginationItem,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
};

export type TablePaginationProps = {
  totalPages: number;
  currentPage: number;
  rootUrl: string;
};

export const TablePagination = ({
  totalPages,
  currentPage,
  rootUrl,
}: TablePaginationProps) => {
  const createHref = (page: number) => `${rootUrl}?page=${page}`;
  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 py-3 sm:py-4 px-3 sm:px-4 border-t border-slate-100">
      <div className="text-xs text-muted-foreground order-2 sm:order-1">
        Trang <span className="font-semibold text-slate-800">{currentPage}</span> / {totalPages}
      </div>

      <Pagination className="justify-center sm:justify-end order-1 sm:order-2 w-auto mx-0">
        <PaginationContent className="gap-1 sm:gap-1.5">
          {currentPage > 1 && (
            <PaginationItem>
              <PaginationPrevious href={createHref(currentPage - 1)} />
            </PaginationItem>
          )}

          {/* Desktop number links */}
          <div className="hidden sm:flex items-center gap-1">
            {currentPage > 2 && (
              <PaginationItem>
                <PaginationEllipsis />
              </PaginationItem>
            )}

            {currentPage > 1 && (
              <PaginationItem>
                <PaginationLink href={createHref(currentPage - 1)}>
                  {currentPage - 1}
                </PaginationLink>
              </PaginationItem>
            )}

            <PaginationItem>
              <PaginationLink href={createHref(currentPage)} isActive>
                {currentPage}
              </PaginationLink>
            </PaginationItem>

            {totalPages > currentPage && (
              <PaginationItem>
                <PaginationLink href={createHref(currentPage + 1)}>
                  {currentPage + 1}
                </PaginationLink>
              </PaginationItem>
            )}

            {totalPages > currentPage + 1 && (
              <PaginationItem>
                <PaginationEllipsis />
              </PaginationItem>
            )}
          </div>

          {totalPages > currentPage && (
            <PaginationItem>
              <PaginationNext href={createHref(currentPage + 1)} />
            </PaginationItem>
          )}
        </PaginationContent>
      </Pagination>
    </div>
  );
};
