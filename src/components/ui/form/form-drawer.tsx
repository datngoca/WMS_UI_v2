import * as React from "react";

import { useDisclosure } from "@/hooks/use-disclosure";
import { cn } from "@/utils/cn";

import { Button } from "../button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTrigger,
  DrawerTitle,
  DrawerDescription,
} from "../drawer";

export type FormDrawerProps = {
  isDone?: boolean;
  triggerButton?: React.ReactElement;
  submitButton?: React.ReactElement;
  title: string;
  description?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  closeButtonText?: string;
  footerContent?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  preventCloseOnOutsideClick?: boolean;
};

const sizeClasses: Record<NonNullable<FormDrawerProps["size"]>, string> = {
  sm: "sm:max-w-md",
  md: "sm:max-w-lg",
  lg: "sm:max-w-xl md:max-w-2xl",
  xl: "sm:max-w-2xl md:max-w-3xl",
};

export const FormDrawer = ({
  title,
  description,
  icon,
  children,
  isDone,
  triggerButton,
  submitButton,
  size = "lg",
  className,
  closeButtonText = "Hủy bỏ",
  footerContent,
  open: controlledOpen,
  onOpenChange: setControlledOpen,
  preventCloseOnOutsideClick = true,
}: FormDrawerProps) => {
  const disclosure = useDisclosure();
  const isControlled = controlledOpen !== undefined;
  const isOpen = isControlled ? controlledOpen : disclosure.isOpen;

  const handleOpenChange = (openState: boolean) => {
    if (isControlled) {
      setControlledOpen?.(openState);
    } else {
      if (openState) disclosure.open();
      else disclosure.close();
    }
  };

  React.useEffect(() => {
    if (isDone) {
      if (isControlled) {
        setControlledOpen?.(false);
      } else {
        disclosure.close();
      }
    }
  }, [isDone, isControlled, setControlledOpen, disclosure]);

  return (
    <Drawer open={isOpen} onOpenChange={handleOpenChange}>
      {triggerButton && <DrawerTrigger asChild>{triggerButton}</DrawerTrigger>}
      <DrawerContent
        onPointerDownOutside={(e) => {
          if (preventCloseOnOutsideClick) {
            e.preventDefault();
          }
        }}
        onInteractOutside={(e) => {
          if (preventCloseOnOutsideClick) {
            e.preventDefault();
          }
        }}
        className={cn(
          "h-full w-full max-w-full p-0 flex flex-col bg-background shadow-2xl border-l border-border/80 outline-none",
          sizeClasses[size],
          className,
        )}
      >
        {/* Sticky Mobile-Friendly Header */}
        <DrawerHeader className="px-4 py-3.5 sm:px-6 sm:py-4 pr-12 sm:pr-14 border-b border-border/80 bg-background/95 backdrop-blur-md flex-shrink-0 flex items-center justify-between gap-3 text-left">
          <div className="flex items-center gap-2.5 min-w-0">
            {icon && (
              <div className="flex size-9 sm:size-10 items-center justify-center rounded-xl bg-primary/10 text-primary flex-shrink-0 shadow-2xs">
                {icon}
              </div>
            )}
            <div className="flex flex-col min-w-0">
              <DrawerTitle className="text-sm sm:text-base font-semibold text-foreground truncate">
                {title}
              </DrawerTitle>
              {description && (
                <DrawerDescription className="text-[11px] text-muted-foreground truncate mt-0.5">
                  {description}
                </DrawerDescription>
              )}
            </div>
          </div>
        </DrawerHeader>

        {/* Scrollable Body Container */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">{children}</div>

        {/* Mobile Sticky Footer */}
        <DrawerFooter className="p-3 sm:p-4 border-t border-border/80 bg-muted/20 flex-shrink-0 flex items-center justify-between gap-2">
          {footerContent ? (
            <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
              {footerContent}
            </div>
          ) : (
            <DrawerClose asChild>
              <Button
                variant="outline"
                size="sm"
                type="button"
                className="cursor-pointer"
              >
                {closeButtonText}
              </Button>
            </DrawerClose>
          )}

          <div className="flex items-center gap-2">
            {footerContent && (
              <DrawerClose asChild>
                <Button
                  variant="outline"
                  size="sm"
                  type="button"
                  className="cursor-pointer"
                >
                  {closeButtonText}
                </Button>
              </DrawerClose>
            )}
            {submitButton}
          </div>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};
