/*
 * @description: Use for display loading spinner
 * @author: Harry Doan
 * @createdAt: 2026-08-30
 */

import { cn } from "@/utils/cn";

const sizes = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16'
}

export type SpinnerProps = {
    size?: keyof typeof sizes
    className?: string
};

export const Spinner = (props: SpinnerProps) => {
    const { size = 'md', className } = props
  return (
    <>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={cn(
          'animate-spin text-primary',
          sizes[size],
          className,
        )}
      >
        <path d="M21 12a9 9 0 1 1-6.219-8.56" />
      </svg>
      <span className="sr-only">Loading</span>
    </>
  );
};