"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isToday,
  addMonths,
  subMonths,
  format,
} from "date-fns"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

export type CalendarProps = {
  mode?: "single" | "range" | "multiple";
  selected?: Date;
  onSelect?: (date?: Date) => void;
  month?: Date;
  onMonthChange?: (month: Date) => void;
  className?: string;
  classNames?: any;
  showOutsideDays?: boolean;
  initialFocus?: boolean;
};

function Calendar({
  className,
  selected,
  onSelect,
  month: controlledMonth,
  onMonthChange,
  showOutsideDays = true,
}: CalendarProps) {
  const [internalMonth, setInternalMonth] = React.useState<Date>(() => selected || new Date());
  const currentMonth = controlledMonth || internalMonth;

  const handleMonthChange = (newMonth: Date) => {
    if (onMonthChange) {
      onMonthChange(newMonth);
    } else {
      setInternalMonth(newMonth);
    }
  };

  const handlePrevMonth = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    handleMonthChange(subMonths(currentMonth, 1));
  };

  const handleNextMonth = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    handleMonthChange(addMonths(currentMonth, 1));
  };

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 0 });
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 0 });

  const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });
  const weekDayNames = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

  return (
    <div className={cn("p-3 select-none", className)}>
      {/* Month Header / Nav */}
      <div className="flex items-center justify-between pt-1 relative pb-3">
        <button
          type="button"
          onClick={handlePrevMonth}
          className={cn(
            buttonVariants({ variant: "outline" }),
            "h-7 w-7 bg-transparent p-0 opacity-70 hover:opacity-100 cursor-pointer"
          )}
          aria-label="Previous month"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <span className="text-sm font-semibold text-foreground">
          {format(currentMonth, "MMMM yyyy")}
        </span>
        <button
          type="button"
          onClick={handleNextMonth}
          className={cn(
            buttonVariants({ variant: "outline" }),
            "h-7 w-7 bg-transparent p-0 opacity-70 hover:opacity-100 cursor-pointer"
          )}
          aria-label="Next month"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* Weekday Row */}
      <div className="grid grid-cols-7 gap-1 text-center mb-1">
        {weekDayNames.map((day) => (
          <div
            key={day}
            className="text-muted-foreground text-[0.8rem] font-medium h-8 flex items-center justify-center"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map((day, idx) => {
          const isSelected = selected ? isSameDay(day, selected) : false;
          const isCurrentMonth = isSameMonth(day, currentMonth);
          const isCurrentToday = isToday(day);

          if (!isCurrentMonth && !showOutsideDays) {
            return <div key={idx} className="h-9 w-9" />;
          }

          return (
            <button
              key={idx}
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onSelect?.(isSelected ? undefined : day);
              }}
              className={cn(
                "h-9 w-9 p-0 font-normal rounded-md text-sm flex items-center justify-center transition-all cursor-pointer",
                buttonVariants({ variant: "ghost" }),
                !isCurrentMonth && "text-muted-foreground opacity-30 hover:opacity-60",
                isCurrentToday && !isSelected && "bg-accent font-bold text-accent-foreground border border-border/80",
                isSelected &&
                  "bg-primary text-primary-foreground font-semibold hover:bg-primary hover:text-primary-foreground shadow-xs",
                !isSelected && isCurrentMonth && "hover:bg-muted"
              )}
              aria-selected={isSelected}
            >
              {format(day, "d")}
            </button>
          );
        })}
      </div>
    </div>
  );
}
Calendar.displayName = "Calendar"

export { Calendar }
