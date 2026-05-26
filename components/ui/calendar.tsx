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

// 1. Define sizing configurations
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
    dayCell: "h-14 w-14 text-sm font-bold", // Aggressive, large interactive tap-targets
  }
}

type CalendarProps = React.ComponentProps<typeof DayPicker> & {
  buttonVariant?: React.ComponentProps<typeof Button>["variant"]
  size?: "sm" | "lg" // 2. Add the custom size variant prop
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
  size = "sm", // Default to small size mapping
  ...props
}: CalendarProps) {
  const defaultClassNames = getDefaultClassNames()
  const s = sizeConfigs[size] // Extract current size styles

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn(
        "group/calendar bg-card border border-border",
        s.containerPadding,
        String.raw`rtl:**:[.rdp-button\_next>svg]:rotate-180`,
        String.raw`rtl:**:[.rdp-button\_previous>svg]:rotate-180`,
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
        root: cn("w-fit", defaultClassNames.root),
        months: cn(
          "relative flex flex-col gap-4 md:flex-row",
          defaultClassNames.months
        ),
        month: cn("flex w-full flex-col gap-4", defaultClassNames.month),
        nav: cn(
          "absolute inset-x-0 top-0 flex w-full items-center justify-between gap-1",
          defaultClassNames.nav
        ),
        button_previous: cn(
          buttonVariants({ variant: buttonVariant }),
          "p-0 select-none rounded-none border border-border hover:bg-secondary hover:text-foreground",
          s.navButton,
          defaultClassNames.button_previous
        ),
        button_next: cn(
          buttonVariants({ variant: buttonVariant }),
          "p-0 select-none rounded-none border border-border hover:bg-secondary hover:text-foreground",
          s.navButton,
          defaultClassNames.button_next
        ),
        month_caption: cn(
          "flex w-full items-center justify-center font-bold text-foreground uppercase",
          size === "lg" ? "h-12" : "h-8",
          s.captionText,
          defaultClassNames.month_caption
        ),
        dropdowns: cn(
          "flex w-full items-center justify-center gap-1.5 text-sm font-medium",
          size === "lg" ? "h-12" : "h-8",
          defaultClassNames.dropdowns
        ),
        dropdown_root: cn(
          "cn-calendar-dropdown-root relative rounded-none",
          defaultClassNames.dropdown_root
        ),
        dropdown: cn(
          "absolute inset-0 bg-popover opacity-0",
          defaultClassNames.dropdown
        ),
        caption_label: cn(
          "font-bold select-none text-foreground uppercase tracking-wider",
          s.captionText,
          defaultClassNames.caption_label
        ),
        month_grid: "w-full border-collapse",
        weekdays: cn("flex mt-2", defaultClassNames.weekdays),
        weekday: cn(
          "flex-1 font-bold text-muted-foreground uppercase text-center select-none",
          s.weekdayText,
          defaultClassNames.weekday
        ),
        week: cn("mt-1 flex w-full", defaultClassNames.week),
        day: cn(
          "group/day relative aspect-square h-full w-full p-0 text-center select-none rounded-none",
          defaultClassNames.day
        ),
        today: cn(
          "bg-secondary/60 text-foreground font-black border border-barber-blue/40",
          defaultClassNames.today
        ),
        outside: cn(
          "text-muted-foreground/30",
          defaultClassNames.outside
        ),
        disabled: cn(
          "text-muted-foreground/20 line-through opacity-50",
          defaultClassNames.disabled
        ),
        hidden: cn("invisible", defaultClassNames.hidden),
        ...classNames,
      }}
      components={{
        Root: ({ className, rootRef, ...props }) => {
          return (
            <div
              data-slot="calendar"
              ref={rootRef}
              className={cn(className)}
              {...props}
            />
          )
        },
        Chevron: ({ className, orientation, ...props }) => {
          const chevronClass = size === "lg" ? "size-5" : "size-4"
          if (orientation === "left") {
            return (
              <ChevronLeftIcon
                className={cn("text-foreground", chevronClass, className)}
                {...props}
              />
            )
          }

          if (orientation === "right") {
            return (
              <ChevronRightIcon
                className={cn("text-foreground", chevronClass, className)}
                {...props}
              />
            )
          }

          return (
            <ChevronDownIcon className={cn("text-foreground", chevronClass, className)} {...props} />
          )
        },
        DayButton: ({ ...props }) => (
          // Pass the dynamic class configurations down to the interactive buttons
          <CalendarDayButton locale={locale} dayCellClass={s.dayCell} {...props} />
        ),
        ...components,
      }}
      {...props}
    />
  )
}

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
  const defaultClassNames = getDefaultClassNames()

  const ref = React.useRef<HTMLButtonElement>(null)
  React.useEffect(() => {
    if (modifiers.focused) ref.current?.focus()
  }, [modifiers.focused])

  return (
    <Button
      ref={ref}
      variant="ghost"
      size="icon"
      data-day={day.date.toLocaleDateString(locale?.code)}
      data-selected-single={modifiers.selected}
      className={cn(
        "relative flex aspect-square items-center justify-center border-0 leading-none font-medium transition-all text-foreground rounded-none bg-transparent",
        "hover:bg-secondary hover:text-white hover:ring-1 hover:ring-barber-blue",
        "data-[selected-single=true]:bg-barber-red data-[selected-single=true]:text-white data-[selected-single=true]:font-bold data-[selected-single=true]:hover:bg-barber-red",
        dayCellClass, // Dynamically injection of structural sizing properties
        className
      )}
      {...props}
    />
  )
}

export { Calendar, CalendarDayButton }