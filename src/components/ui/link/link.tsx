import { Link as RouterLink, type LinkProps } from "react-router-dom";

import { cn } from "@/utils/cn";

export const Link = ({ className, children, ...props }: LinkProps) => {
  return (
    <RouterLink
      className={cn("font-mono cursor-pointer", className)}
      {...props}
    >
      {children}
    </RouterLink>
  );
};
