import * as React from "react";
import { Head } from "../seo";
import { cn } from "@/utils/cn";

type ContentLayoutProps = {
  children: React.ReactNode;
  title: string;
  hideTitleOnMobile?: boolean;
  noPadding?: boolean;
  className?: string;
};

export const ContentLayout = ({
  children,
  title,
  hideTitleOnMobile = false,
  noPadding = false,
  className,
}: ContentLayoutProps) => {
  return (
    <div className="flex-1 flex flex-col min-h-0 w-full overflow-hidden">
      <Head title={title} />
      <div
        className={cn(
          "w-full mb-1.5 sm:mb-4 shrink-0",
          hideTitleOnMobile && "hidden sm:block",
        )}
      >
        <h1 className="text-base sm:text-2xl font-bold tracking-tight text-slate-900">
          {title}
        </h1>
      </div>
      <div
        className={cn(
          "w-full flex-1 flex flex-col min-h-0 overflow-hidden",
          noPadding ? "p-0" : "px-0 sm:px-2 py-0 sm:py-2",
          className,
        )}
      >
        {children}
      </div>
    </div>
  );
};
