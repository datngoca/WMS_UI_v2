import { Info } from 'lucide-react';
import * as React from 'react';
import { type FieldError } from 'react-hook-form';

import { cn } from '@/utils/cn';
import { Popover, PopoverContent, PopoverTrigger } from '../popover';
import { Error } from './error';
import { Label } from './label';

export type FieldWrapperProps = {
  label?: string;
  className?: string;
  children: React.ReactNode;
  error?: FieldError | undefined;
  description?: React.ReactNode;
  info?: React.ReactNode;
};

export type FieldWrapperPassThroughProps = Omit<
  FieldWrapperProps,
  'className' | 'children'
>;

export const FieldWrapper = (props: FieldWrapperProps) => {
  const { label, error, description, info, className, children } = props;
  const tooltipContent = info || description;

  return (
    <div className={cn('space-y-1.5 w-full', className)}>
      {label && (
        <div className="flex items-center justify-between">
          <Label className="flex items-center gap-1.5">
            <span>{label}</span>
            {tooltipContent && (
              <Popover>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    className="inline-flex cursor-pointer text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none"
                    aria-label="Field information"
                  >
                    <Info className="size-3.5" />
                  </button>
                </PopoverTrigger>
                <PopoverContent
                  side="top"
                  align="start"
                  className="w-auto max-w-xs p-2 text-xs shadow-md"
                >
                  {tooltipContent}
                </PopoverContent>
              </Popover>
            )}
          </Label>
        </div>
      )}
      <div>{children}</div>
      <Error errorMessage={error?.message} />
    </div>
  );
};

