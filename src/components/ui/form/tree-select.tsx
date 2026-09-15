import * as React from "react";
import { type UseFormRegisterReturn, useFormContext } from "react-hook-form";

import {
  FieldWrapper,
  type FieldWrapperPassThroughProps,
} from "./field-wrapper";
import {
  TreeSelect as BaseTreeSelect,
  type TreeNodeData,
} from "../tree-select";

import { cn } from "@/utils/cn";

export type TreeSelectFieldProps = FieldWrapperPassThroughProps & {
  data: TreeNodeData[];
  className?: string;
  triggerClassName?: string;
  defaultValue?: string[] | string | number | null;
  value?: string[] | string | number | null;
  onChange?: (value: string[] | string | null) => void;
  placeholder?: string;
  disabled?: boolean;
  loading?: boolean;
  multiple?: boolean;
  registration?: Partial<UseFormRegisterReturn>;
};

export const TreeSelect = ({
  label,
  error,
  info,
  description,
  className,
  triggerClassName,
  data = [],
  defaultValue,
  value: controlledValue,
  onChange,
  placeholder = "Select an option",
  disabled = false,
  loading = false,
  multiple,
  registration,
}: TreeSelectFieldProps) => {
  const formContext = useFormContext();
  const formValue =
    registration?.name && formContext
      ? formContext.watch(registration.name)
      : undefined;

  // Determine whether it operates in multiple or single select mode
  const isMultiple =
    multiple !== undefined
      ? multiple
      : Array.isArray(controlledValue) ||
        Array.isArray(defaultValue) ||
        Array.isArray(formValue);

  const normalizeToArray = React.useCallback(
    (val: string[] | string | number | null | undefined): string[] => {
      if (val === undefined || val === null || val === "") return [];
      if (Array.isArray(val)) return val.map(String);
      return [String(val)];
    },
    [],
  );

  const [internalValue, setInternalValue] = React.useState<string[]>(() =>
    normalizeToArray(controlledValue ?? formValue ?? defaultValue ?? []),
  );

  React.useEffect(() => {
    if (controlledValue !== undefined) {
      setInternalValue(normalizeToArray(controlledValue));
    }
  }, [controlledValue, normalizeToArray]);

  React.useEffect(() => {
    if (controlledValue === undefined && formValue !== undefined) {
      setInternalValue(normalizeToArray(formValue));
    }
  }, [controlledValue, formValue, normalizeToArray]);

  const selectedArray =
    controlledValue !== undefined
      ? normalizeToArray(controlledValue)
      : formValue !== undefined
        ? normalizeToArray(formValue)
        : internalValue;

  const handleValueChange = (newValues: string[]) => {
    let nextArray: string[] = newValues;

    if (!isMultiple && newValues.length > 1) {
      // In single mode, take the most recently selected item
      const newlyAdded = newValues.find((v) => !selectedArray.includes(v));
      nextArray = newlyAdded ? [newlyAdded] : [newValues[newValues.length - 1]];
    }

    if (controlledValue === undefined) {
      setInternalValue(nextArray);
    }

    const emittedValue = isMultiple
      ? nextArray
      : nextArray.length > 0
        ? nextArray[0]
        : "";

    onChange?.(emittedValue);

    if (registration?.name && formContext) {
      formContext.setValue(registration.name, emittedValue, {
        shouldValidate: true,
        shouldDirty: true,
      });
    }

    if (registration?.onChange) {
      registration.onChange({
        target: {
          name: registration.name || "",
          value: emittedValue,
        },
        type: "change",
      });
    }
  };

  const hiddenInputValue = isMultiple
    ? JSON.stringify(selectedArray)
    : (selectedArray[0] ?? "");

  return (
    <FieldWrapper
      label={label}
      error={error}
      info={info}
      description={description}
      className={cn("w-full", className)}
    >
      <input
        type="hidden"
        name={registration?.name}
        ref={registration?.ref}
        value={hiddenInputValue}
      />
      <BaseTreeSelect
        data={data}
        value={selectedArray}
        onValueChange={handleValueChange}
        placeholder={placeholder}
        disabled={disabled}
        loading={loading}
        multiple={isMultiple}
        aria-invalid={!!error}
        className={cn("w-full", triggerClassName)}
      />
    </FieldWrapper>
  );
};
