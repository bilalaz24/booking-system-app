"use client"

import * as React from "react"
import {
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "lucide-react"
import {
  DayPicker,
  getDefaultClassNames,
  type DayButton,
  type Locale,
} from "react-day-picker"

import { cn } from "@/lib/utils"
import { Button, buttonVariants } from "@/components/ui/button"

// -------------------- SIZE CONFIG --------------------
const sizeConfigs = {
  sm: {
    containerPadding: "p-3",
    navButton: "h-8 w-8",
    captionText: "text-xs tracking-wider",
    weekdayText: "text-[0.7rem] tracking-widest",
    dayCell: "h-8 w-8 text-xs",
  },
  lg: {
    containerPadding: "p-6",
    navButton: "h-12 w-12",
    captionText: "text-base tracking-widest",
    weekdayText: "text-xs tracking-widest pb-2",
    dayCell: "h-14 w-14 text-sm font-bold",
  },
}

type CalendarProps = React.ComponentProps<typeof DayPicker> & {
  buttonVariant?: React.ComponentProps<typeof Button>["variant"]
  size?: "sm" | "lg"
}

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  captionLayout = "label",
  buttonVariant = "ghost",
  locale,
  formatters,
  components,
  size = "sm",
  ...props
}: CalendarProps) {
  const defaultClassNames = getDefaultClassNames()
  const s = sizeConfigs[size]

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn(
        "group/calendar bg-card border border-border",
        s.containerPadding,
        className
      )}
      captionLayout={captionLayout}
      locale={locale}
      formatters={{
        formatMonthDropdown: (date) =>
          date.toLocaleString(locale?.code, { month: "short" }),
        ...formatters,
      }}
      classNames={{
        root: cn("w-full", defaultClassNames.root),

        months: cn(
          "flex flex-col gap-4",
          defaultClassNames.months
        ),

        month: cn(
          "flex w-full flex-col gap-4",
          defaultClassNames.month
        ),

        // ✅ FIXED GRID (THIS WAS THE BIG ISSUE)
        month_grid: "w-full border-collapse",

        weekdays: cn("grid grid-cols-7 mt-2", defaultClassNames.weekdays),

        weekday: cn(
          "text-center font-bold text-muted-foreground uppercase select-none",
          s.weekdayText
        ),

        // ✅ FIXED GRID (NO FLEX)
        week: cn(
          "grid grid-cols-7 w-full",
          defaultClassNames.week
        ),

        day: cn(
          "flex items-center justify-center select-none p-0",
          defaultClassNames.day
        ),

        nav: cn(
          "flex items-center justify-between w-full",
          defaultClassNames.nav
        ),

        button_previous: cn(
          buttonVariants({ variant: buttonVariant }),
          "border border-border hover:bg-secondary",
          s.navButton
        ),

        button_next: cn(
          buttonVariants({ variant: buttonVariant }),
          "border border-border hover:bg-secondary",
          s.navButton
        ),

        month_caption: cn(
          "flex justify-center font-bold uppercase",
          s.captionText
        ),

        caption_label: cn(
          "font-bold uppercase tracking-wider"
        ),

        today: cn(
          "relative text-foreground font-semibold",
          "after:absolute after:bottom-1 after:left-1/2 after:-translate-x-1/2",
          "after:h-1 after:w-1 after:rounded-full after:bg-barber-blue"
        ),

        outside: "text-muted-foreground/30",
        disabled: "text-muted-foreground/20 line-through opacity-50",
        hidden: "invisible",

        ...classNames,
      }}
      components={{
        Chevron: ({ orientation, className, ...props }) => {
          const iconClass = size === "lg" ? "size-5" : "size-4"

          if (orientation === "left") {
            return (
              <ChevronLeftIcon
                className={cn(iconClass, className)}
                {...props}
              />
            )
          }

          if (orientation === "right") {
            return (
              <ChevronRightIcon
                className={cn(iconClass, className)}
                {...props}
              />
            )
          }

          return (
            <ChevronDownIcon
              className={cn(iconClass, className)}
              {...props}
            />
          )
        },

        DayButton: (props) => (
          <CalendarDayButton
            {...props}
            locale={locale}
            dayCellClass={s.dayCell}
          />
        ),

        ...components,
      }}
      {...props}
    />
  )
}

// -------------------- DAY BUTTON FIX --------------------
function CalendarDayButton({
  className,
  day,
  modifiers,
  locale,
  dayCellClass,
  ...props
}: React.ComponentProps<typeof DayButton> & {
  locale?: Partial<Locale>
  dayCellClass: string
}) {
  const ref = React.useRef<HTMLButtonElement>(null)

  React.useEffect(() => {
    if (modifiers.focused) ref.current?.focus()
  }, [modifiers.focused])

  return (
    <Button
      ref={ref}
      variant="ghost"
      data-selected={modifiers.selected}
      className={cn(
        // base
        "w-full h-full flex items-center justify-center rounded-none font-medium transition-all",

        // hover
        "hover:bg-secondary hover:text-white",

        // selected (FULL override, no shrinking)
        "data-[selected=true]:bg-barber-red data-[selected=true]:text-white data-[selected=true]:font-bold",

        // important: no rings causing size mismatch
        "data-[selected=true]:hover:bg-barber-red",

        dayCellClass,
        className
      )}
      {...props}
    />
  )
}

export { Calendar, CalendarDayButton }