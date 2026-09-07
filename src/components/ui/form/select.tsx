import { Check, ChevronsUpDown } from 'lucide-react';
import * as React from 'react';
import { type UseFormRegisterReturn } from 'react-hook-form';

import { cn } from '@/utils/cn';
import { Popover, PopoverContent, PopoverTrigger } from '../popover';
import { FieldWrapper, type FieldWrapperPassThroughProps } from './field-wrapper';

export type Option = {
  label: React.ReactNode;
  value: string | number;
  disabled?: boolean;
};

export type SelectFieldProps = FieldWrapperPassThroughProps & {
  options: Option[];
  className?: string;
  triggerClassName?: string;
  defaultValue?: string | number;
  value?: string | number;
  onChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  registration?: Partial<UseFormRegisterReturn>;
};

export const Select = (props: SelectFieldProps) => {
  const {
    label,
    options = [],
    error,
    className,
    triggerClassName,
    defaultValue,
    value: controlledValue,
    onChange,
    placeholder = 'Select an option',
    disabled = false,
    registration,
    info,
    description,
  } = props;

  const [open, setOpen] = React.useState(false);
  const [internalValue, setInternalValue] = React.useState<string | number | undefined>(
    controlledValue ?? defaultValue ?? '',
  );

  React.useEffect(() => {
    if (controlledValue !== undefined) {
      setInternalValue(controlledValue);
    }
  }, [controlledValue]);

  const selectedValue = controlledValue !== undefined ? controlledValue : internalValue;
  const selectedOption = options.find(
    (option) => String(option.value) === String(selectedValue) && option.value !== '',
  );

  const handleSelect = (optionValue: string | number) => {
    if (controlledValue === undefined) {
      setInternalValue(optionValue);
    }
    onChange?.(String(optionValue));

    if (registration?.onChange) {
      registration.onChange({
        target: {
          name: registration.name || '',
          value: optionValue,
        },
        type: 'change',
      });
    }

    setOpen(false);
  };

  return (
    <FieldWrapper
      label={label}
      error={error}
      info={info}
      description={description}
      className={className}
    >
      <input
        type="hidden"
        name={registration?.name}
        ref={registration?.ref}
        value={selectedValue !== undefined ? String(selectedValue) : ''}
      />
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            role="combobox"
            aria-expanded={open}
            disabled={disabled}
            className={cn(
              'flex h-9 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50',
              error && 'border-destructive focus:ring-destructive',
              !selectedOption && 'text-muted-foreground',
              triggerClassName,
            )}
            onBlur={registration?.onBlur}
          >
            <span className="truncate">
              {selectedOption ? selectedOption.label : placeholder}
            </span>
            <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
          </button>
        </PopoverTrigger>
        <PopoverContent
          className="w-[var(--radix-popover-trigger-width)] p-1 shadow-md"
          style={{ width: 'var(--radix-popover-trigger-width)' }}
          align="start"
        >
          <div className="max-h-60 overflow-y-auto space-y-0.5">
            {options.map((option) => {
              const isSelected =
                String(option.value) === String(selectedValue);
              return (
                <button
                  key={String(option.value)}
                  type="button"
                  disabled={option.disabled}
                  onClick={() => handleSelect(option.value)}
                  className={cn(
                    'relative flex w-full cursor-pointer select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground disabled:pointer-events-none disabled:opacity-50 text-left',
                    isSelected && 'bg-accent font-medium text-accent-foreground',
                  )}
                >
                  <span className="absolute left-2 flex size-3.5 items-center justify-center">
                    {isSelected && <Check className="size-4" />}
                  </span>
                  <span className="truncate">{option.label}</span>
                </button>
              );
            })}
          </div>
        </PopoverContent>
      </Popover>
    </FieldWrapper>
  );
};

