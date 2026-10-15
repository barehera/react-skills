"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

type RosterContextValue = {
  value: string[]
  onValueChange: (value: string[]) => void
}

const RosterContext = React.createContext<RosterContextValue | null>(null)

function useRoster(part: string) {
  const context = React.useContext(RosterContext)

  if (!context) {
    throw new Error(`${part} must be rendered inside Roster.`)
  }

  return context
}

type RosterItemContextValue = {
  value: string
  selected: boolean
  toggleId: string
}

const RosterItemContext = React.createContext<RosterItemContextValue | null>(
  null
)

function useRosterItem(part: string) {
  const context = React.useContext(RosterItemContext)

  if (!context) {
    throw new Error(`${part} must be rendered inside RosterItem.`)
  }

  return context
}

function Roster({
  value,
  onValueChange,
  children,
}: RosterContextValue & { children?: React.ReactNode }) {
  return <RosterContext value={{ value, onValueChange }}>{children}</RosterContext>
}

const rosterListVariants = cva("group/roster-list flex flex-col gap-1", {
  variants: {
    size: { sm: "gap-0.5", default: "", lg: "gap-2" },
  },
  defaultVariants: { size: "default" },
})

function RosterList({
  size = "default",
  className,
  ...props
}: React.ComponentProps<"ul"> & VariantProps<typeof rosterListVariants>) {
  return (
    <ul
      {...props}
      data-slot="roster-list"
      data-size={size}
      className={cn(rosterListVariants({ size }), className)}
    />
  )
}

const rosterRowClassName = cn(
  "flex items-center gap-3 px-3 py-2 text-sm",
  "group-data-[size=sm]/roster-list:gap-2 group-data-[size=sm]/roster-list:px-2 group-data-[size=sm]/roster-list:py-1",
  "group-data-[size=lg]/roster-list:gap-4 group-data-[size=lg]/roster-list:px-4 group-data-[size=lg]/roster-list:py-3"
)

function RosterItem({
  value,
  className,
  ...props
}: React.ComponentProps<"li"> & { value: string }) {
  const roster = useRoster("RosterItem")
  const toggleId = React.useId()
  const selected = roster.value.includes(value)

  return (
    <RosterItemContext value={{ value, selected, toggleId }}>
      <li
        {...props}
        data-slot="roster-item"
        data-state={selected ? "checked" : "unchecked"}
        className={cn(
          rosterRowClassName,
          "rounded-md border hover:bg-accent data-[state=checked]:border-primary",
          className
        )}
      />
    </RosterItemContext>
  )
}

function RosterToggle({
  onCheckedChange,
  ...props
}: Omit<
  React.ComponentProps<typeof Checkbox>,
  "checked" | "defaultChecked" | "id"
>) {
  const roster = useRoster("RosterToggle")
  const item = useRosterItem("RosterToggle")

  return (
    <Checkbox
      {...props}
      data-slot="roster-toggle"
      id={item.toggleId}
      checked={item.selected}
      onCheckedChange={(checked) => {
        onCheckedChange?.(checked)
        roster.onValueChange(
          checked === true
            ? [...roster.value, item.value]
            : roster.value.filter((selectedValue) => selectedValue !== item.value)
        )
      }}
    />
  )
}

function RosterLabel({
  className,
  ...props
}: React.ComponentProps<typeof Label>) {
  const item = useRosterItem("RosterLabel")

  return (
    <Label
      {...props}
      data-slot="roster-label"
      htmlFor={item.toggleId}
      className={cn(
        "font-medium group-data-[size=sm]/roster-list:text-xs group-data-[size=lg]/roster-list:text-base",
        className
      )}
    />
  )
}

function RosterMeta({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <p
      {...props}
      data-slot="roster-meta"
      className={cn(
        "ml-auto text-xs text-muted-foreground group-data-[size=lg]/roster-list:text-sm",
        className
      )}
    />
  )
}

function RosterLoading({ className, ...props }: React.ComponentProps<"li">) {
  return (
    <li
      role="status"
      {...props}
      data-slot="roster-loading"
      className={cn(rosterRowClassName, "text-muted-foreground", className)}
    />
  )
}

function RosterError({ className, ...props }: React.ComponentProps<"li">) {
  return (
    <li
      role="alert"
      {...props}
      data-slot="roster-error"
      className={cn(rosterRowClassName, "text-destructive", className)}
    />
  )
}

function RosterEmpty({ className, ...props }: React.ComponentProps<"li">) {
  return (
    <li
      {...props}
      data-slot="roster-empty"
      className={cn(rosterRowClassName, "text-muted-foreground", className)}
    />
  )
}

export {
  Roster,
  RosterList,
  RosterItem,
  RosterToggle,
  RosterLabel,
  RosterMeta,
  RosterLoading,
  RosterError,
  RosterEmpty,
}
