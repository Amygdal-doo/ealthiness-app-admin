import * as React from "react";
import { Popover } from "radix-ui";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";

import { cn } from "~/lib/utils";

/* -------------------------------------------------------------------------- */
/*  Date helpers — all values are local "YYYY-MM-DD" strings (no timezone fuss) */
/* -------------------------------------------------------------------------- */

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const pad = (n: number) => String(n).padStart(2, "0");

const toISO = (d: Date) =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

/** Parse "YYYY-MM-DD" into a local Date (midnight), or null. */
const parseISO = (value?: string): Date | null => {
  if (!value) return null;
  const [y, m, d] = value.split("-").map(Number);
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d);
};

const isSameDay = (a: Date, b: Date) => toISO(a) === toISO(b);

/** Days (as Dates) to fill a 6-row calendar grid for the given month. */
const buildCalendarDays = (viewYear: number, viewMonth: number): Date[] => {
  const firstOfMonth = new Date(viewYear, viewMonth, 1);
  const start = new Date(firstOfMonth);
  start.setDate(1 - firstOfMonth.getDay()); // back up to the Sunday on/before the 1st

  return Array.from({ length: 42 }, (_, i) => {
    const day = new Date(start);
    day.setDate(start.getDate() + i);
    return day;
  });
};

/* -------------------------------------------------------------------------- */
/*  Calendar                                                                  */
/* -------------------------------------------------------------------------- */

interface CalendarProps {
  selected: Date | null;
  min: Date | null;
  onSelect: (date: Date) => void;
}

const Calendar: React.FC<CalendarProps> = ({ selected, min, onSelect }) => {
  const today = new Date();
  const initial = selected ?? min ?? today;
  const [view, setView] = React.useState({
    year: initial.getFullYear(),
    month: initial.getMonth(),
  });

  const goToMonth = (delta: number) =>
    setView(({ year, month }) => {
      const next = new Date(year, month + delta, 1);
      return { year: next.getFullYear(), month: next.getMonth() };
    });

  const days = buildCalendarDays(view.year, view.month);
  const minDay = min ? parseISO(toISO(min)) : null;

  return (
    <div className="w-[268px] p-3">
      {/* Month navigation */}
      <div className="flex items-center justify-between mb-3">
        <button
          type="button"
          onClick={() => goToMonth(-1)}
          className="w-7 h-7 rounded-lg flex items-center justify-center text-[#60646C] hover:bg-[#F0F0F3] hover:text-[#5850DE] transition-colors"
          aria-label="Previous month"
        >
          <ChevronLeft size={16} />
        </button>
        <span className="text-sm font-bold text-[#1B173A]">
          {MONTHS[view.month]} {view.year}
        </span>
        <button
          type="button"
          onClick={() => goToMonth(1)}
          className="w-7 h-7 rounded-lg flex items-center justify-center text-[#60646C] hover:bg-[#F0F0F3] hover:text-[#5850DE] transition-colors"
          aria-label="Next month"
        >
          <ChevronRight size={16} />
        </button>
      </div>

      {/* Weekday header */}
      <div className="grid grid-cols-7 mb-1">
        {WEEKDAYS.map((day) => (
          <div
            key={day}
            className="h-7 flex items-center justify-center text-[11px] font-bold text-[#8E8E93] uppercase"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Days */}
      <div className="grid grid-cols-7 gap-0.5">
        {days.map((day) => {
          const inMonth = day.getMonth() === view.month;
          const isSelected = selected && isSameDay(day, selected);
          const isToday = isSameDay(day, today);
          const isDisabled = minDay ? day < minDay : false;

          return (
            <button
              key={toISO(day)}
              type="button"
              disabled={isDisabled}
              onClick={() => onSelect(day)}
              className={cn(
                "h-8 w-full rounded-lg text-sm font-medium transition-colors",
                "disabled:opacity-30 disabled:cursor-not-allowed",
                !inMonth && "text-[#C7C7CC]",
                inMonth && !isSelected && "text-[#1B173A]",
                isSelected && "bg-[#5850DE] text-white hover:bg-[#5850DE]",
                !isSelected && !isDisabled && "hover:bg-[#E8E6FC] hover:text-[#5850DE]",
                isToday && !isSelected && "text-[#5850DE] font-bold",
              )}
            >
              {day.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/*  DatePicker                                                                */
/* -------------------------------------------------------------------------- */

export interface DatePickerProps {
  value?: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  id?: string;
  placeholder?: string;
  /** Earliest selectable date as "YYYY-MM-DD". */
  min?: string;
  disabled?: boolean;
  invalid?: boolean;
}

const DISPLAY_FORMAT: Intl.DateTimeFormatOptions = {
  weekday: "short",
  day: "numeric",
  month: "short",
  year: "numeric",
};

export function DatePicker({
  value,
  onChange,
  onBlur,
  id,
  placeholder = "Select a date",
  min,
  disabled,
  invalid,
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false);
  const selected = parseISO(value);

  const handleSelect = (date: Date) => {
    onChange(toISO(date));
    setOpen(false);
    onBlur?.();
  };

  return (
    <Popover.Root
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) onBlur?.();
      }}
    >
      <Popover.Trigger asChild>
        <button
          id={id}
          type="button"
          disabled={disabled}
          aria-invalid={invalid || undefined}
          className={cn(
            "flex h-8 w-full items-center justify-between gap-2 rounded-lg border bg-transparent px-2.5 py-1 text-sm transition-colors outline-none",
            "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
            "disabled:pointer-events-none disabled:opacity-50",
            invalid
              ? "border-red-500 ring-3 ring-destructive/20"
              : "border-input hover:border-[#5850DE]",
          )}
        >
          <span className={cn(selected ? "text-[#1B173A]" : "text-muted-foreground")}>
            {selected
              ? selected.toLocaleDateString(undefined, DISPLAY_FORMAT)
              : placeholder}
          </span>
          <CalendarIcon size={15} className="shrink-0 text-[#8E8E93]" />
        </button>
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Content
          align="start"
          sideOffset={6}
          className="z-[60] rounded-2xl border border-[#E0E1E6] bg-white shadow-xl outline-none animate-in fade-in zoom-in-95 duration-150"
        >
          <Calendar selected={selected} min={parseISO(min)} onSelect={handleSelect} />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
