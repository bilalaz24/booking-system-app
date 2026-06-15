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
// Added gap configurations and clean rounding profiles
const sizeConfigs = {
  sm: {
    containerPadding: "p-4 rounded-xl",
    navButton: "h-8 w-8 rounded-lg",
    captionText: "text-sm tracking-wide",
    weekdayText: "text-[0.75rem] tracking-wider font-semibold pb-1",
    dayCell: "h-9 w-9 text-xs rounded-lg",
    gridGap: "gap-1",
  },
  lg: {
    containerPadding: "p-6 rounded-2xl",
    navButton: "h-11 w-11 rounded-xl",
    captionText: "text-lg tracking-wide",
    weekdayText: "text-xs tracking-wider font-semibold pb-3",
    dayCell: "h-12 w-12 text-sm font-bold rounded-xl",
    gridGap: "gap-2",
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
        "group/calendar bg-card border border-border shadow-sm w-fit relative",
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
        root: cn(defaultClassNames.root),

        months: cn("flex flex-col gap-4", defaultClassNames.months),

        month: cn("flex flex-col", defaultClassNames.month),

        month_grid: "w-full border-collapse",

        // Replaced custom grid arrays with native flex layouts that align with day picker specs
        weekdays: cn("flex w-full justify-between items-center", defaultClassNames.weekdays),

        weekday: cn(
          "text-center font-medium text-muted-foreground/70 uppercase select-none flex items-center justify-center",
          s.dayCell, // Matches widths perfectly to prevent shifts
          s.weekdayText
        ),

        // Handled spacing seamlessly using our configuration file gaps
        week: cn(
          "flex w-full justify-between items-center mt-1",
          s.gridGap,
          defaultClassNames.week
        ),

        day: cn(
          "flex items-center justify-center select-none p-0 relative focus-within:relative focus-within:z-20",
          defaultClassNames.day
        ),

        // Find these keys inside your classNames={{ ... }} block and replace them:

        nav: cn("absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none", defaultClassNames.nav),

        button_previous: cn(
          buttonVariants({ variant: buttonVariant }),
          "border border-border hover:bg-secondary transition-colors pointer-events-auto",
          s.navButton
        ),

        button_next: cn(
          buttonVariants({ variant: buttonVariant }),
          "border border-border hover:bg-secondary transition-colors pointer-events-auto",
          s.navButton
        ),

        month_caption: cn("flex justify-center font-semibold items-center h-9 mb-4", s.captionText),

        caption_label: cn("font-semibold tracking-wide text-foreground relative z-10"),

        /*nav: cn("flex items-center justify-between w-full mb-4", defaultClassNames.nav),

        button_previous: cn(
          buttonVariants({ variant: buttonVariant }),
          "border border-border hover:bg-secondary transition-colors",
          s.navButton
        ),

        button_next: cn(
          buttonVariants({ variant: buttonVariant }),
          "border border-border hover:bg-secondary transition-colors",
          s.navButton
        ),

        month_caption: cn("flex justify-center font-semibold items-center h-8", s.captionText),

        caption_label: cn("font-semibold tracking-wide text-foreground"),*/

        today: cn(
          "relative border border-primary/30 font-semibold bg-primary/5 text-primary",
          s.dayCell
        ),

        outside: "text-muted-foreground/30 opacity-40 pointer-events-none",
        disabled: "text-muted-foreground/20 line-through opacity-40 pointer-events-none",
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
        // Base structure setup matching size rules flawlessly
        "flex items-center justify-center font-medium transition-all duration-200 p-0 m-0",
        dayCellClass,

        // Hover styles setup
        "hover:bg-secondary hover:text-secondary-foreground",

        // Selected modifiers beautifully rounded according to config layout properties
        "data-[selected=true]:bg-accent data-[selected=true]:text-accent-foreground data-[selected=true]:font-semibold",
        "data-[selected=true]:hover:bg-accent data-[selected=true]:hover:text-accent-foreground",

        className
      )}
      {...props}
    />
  )
}

export { Calendar, CalendarDayButton }