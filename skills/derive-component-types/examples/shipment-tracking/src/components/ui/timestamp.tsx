import type { ComponentProps } from "react"

import { cn } from "@/lib/utils"

type TimestampProps = Omit<ComponentProps<"time">, "dateTime" | "children"> & {
  value: Date | string
  format?: Intl.DateTimeFormatOptions
  locale?: Intl.LocalesArgument
}

function Timestamp({
  value,
  format = { dateStyle: "medium" },
  locale,
  className,
  ...props
}: TimestampProps) {
  const date = new Date(value)

  if (Number.isNaN(date.getTime())) return null

  return (
    <time
      dateTime={date.toISOString()}
      className={cn("tabular-nums", className)}
      {...props}
    >
      {new Intl.DateTimeFormat(locale, format).format(date)}
    </time>
  )
}

export { Timestamp }
