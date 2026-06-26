import * as React from "react";
import { Select as RadixSelect } from "radix-ui";
import { Check, ChevronDown } from "lucide-react";

import { cn } from "~/lib/utils";

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps {
  value?: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  options: SelectOption[];
  placeholder?: string;
  id?: string;
  disabled?: boolean;
  invalid?: boolean;
}

export function Select({
  value,
  onChange,
  onBlur,
  options,
  placeholder = "Select…",
  id,
  disabled,
  invalid,
}: SelectProps) {
  return (
    <RadixSelect.Root
      value={value || undefined}
      onValueChange={onChange}
      disabled={disabled}
    >
      <RadixSelect.Trigger
        id={id}
        onBlur={onBlur}
        aria-invalid={invalid || undefined}
        className={cn(
          "flex h-8 w-full items-center justify-between gap-2 rounded-lg border bg-transparent px-2.5 py-1 text-sm transition-colors outline-none",
          "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
          "disabled:pointer-events-none disabled:opacity-50",
          "data-[placeholder]:text-muted-foreground",
          invalid
            ? "border-red-500 ring-3 ring-destructive/20"
            : "border-input hover:border-[#5850DE]",
        )}
      >
        <RadixSelect.Value placeholder={placeholder} />
        <RadixSelect.Icon>
          <ChevronDown size={15} className="shrink-0 text-[#8E8E93]" />
        </RadixSelect.Icon>
      </RadixSelect.Trigger>

      <RadixSelect.Portal>
        <RadixSelect.Content
          position="popper"
          sideOffset={6}
          className="z-[70] max-h-72 min-w-[var(--radix-select-trigger-width)] overflow-hidden rounded-xl border border-[#E0E1E6] bg-white shadow-xl animate-in fade-in zoom-in-95 duration-150"
        >
          <RadixSelect.Viewport className="p-1">
            {options.map((option) => (
              <RadixSelect.Item
                key={option.value}
                value={option.value}
                className={cn(
                  "relative flex cursor-pointer select-none items-center justify-between rounded-lg px-2.5 py-2 text-sm font-medium text-[#1B173A] outline-none",
                  "data-[highlighted]:bg-[#E8E6FC] data-[highlighted]:text-[#5850DE]",
                  "data-[state=checked]:text-[#5850DE]",
                )}
              >
                <RadixSelect.ItemText>{option.label}</RadixSelect.ItemText>
                <RadixSelect.ItemIndicator>
                  <Check size={15} className="text-[#5850DE]" />
                </RadixSelect.ItemIndicator>
              </RadixSelect.Item>
            ))}
          </RadixSelect.Viewport>
        </RadixSelect.Content>
      </RadixSelect.Portal>
    </RadixSelect.Root>
  );
}
