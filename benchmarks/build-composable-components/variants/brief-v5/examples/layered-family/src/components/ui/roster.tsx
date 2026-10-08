"use client"

import * as React from "react"
import { useStore, type StoreApi } from "zustand"
import { createStore } from "zustand/vanilla"

import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

type RosterSize = "sm" | "default" | "lg"

type RosterHighlightState = {
  highlightedValue: string | null
  highlight: (value: string | null) => void
}

type RosterContextValue = {
  value: string[]
  setValue: (next: string[]) => void
  size: RosterSize
  highlightStore: StoreApi<RosterHighlightState>
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

function createHighlightStore() {
  return createStore<RosterHighlightState>((set) => ({
    highlightedValue: null,
    highlight: (value) => set({ highlightedValue: value }),
  }))
}

type RosterProps = Omit<
  React.ComponentProps<"div">,
  "defaultValue" | "onChange"
> & {
  value?: string[]
  defaultValue?: string[]
  onValueChange?: (value: string[]) => void
  size?: RosterSize
}

function Roster(props: RosterProps) {
  const {
    value: valueProp,
    defaultValue,
    onValueChange,
    size = "default",
    className,
    ...rootProps
  } = props
  const [uncontrolledValue, setUncontrolledValue] = React.useState(
    defaultValue ?? []
  )
  const [highlightStore] = React.useState(createHighlightStore)
  const isControlled = "value" in props
  const value = isControlled ? (valueProp ?? []) : uncontrolledValue

  const setValue = (next: string[]) => {
    if (!isControlled) {
      setUncontrolledValue(next)
    }

    onValueChange?.(next)
  }

  return (
    <RosterContext.Provider value={{ value, setValue, size, highlightStore }}>
      <div
        role="group"
        {...rootProps}
        data-slot="roster"
        data-size={size}
        className={cn("group/roster flex flex-col gap-2", className)}
      />
    </RosterContext.Provider>
  )
}

function RosterList({ className, ...props }: React.ComponentProps<"ul">) {
  return (
    <ul
      {...props}
      data-slot="roster-list"
      className={cn(
        "flex flex-col",
        "gap-1 group-data-[size=sm]/roster:gap-0.5 group-data-[size=lg]/roster:gap-2",
        className
      )}
    />
  )
}

type RosterItemProps = React.ComponentProps<"li"> & {
  value: string
}

function RosterItem({
  value,
  className,
  onPointerEnter,
  onPointerLeave,
  ...props
}: RosterItemProps) {
  const roster = useRoster("RosterItem")
  const toggleId = React.useId()
  const selected = roster.value.includes(value)
  const highlighted = useStore(
    roster.highlightStore,
    (state) => state.highlightedValue === value
  )

  return (
    <RosterItemContext.Provider value={{ value, selected, toggleId }}>
      <li
        {...props}
        data-slot="roster-item"
        data-state={selected ? "checked" : "unchecked"}
        data-highlighted={highlighted || undefined}
        className={cn(
          "flex items-center rounded-md border",
          "gap-3 px-3 py-2 group-data-[size=sm]/roster:gap-2 group-data-[size=sm]/roster:px-2 group-data-[size=sm]/roster:py-1 group-data-[size=lg]/roster:gap-4 group-data-[size=lg]/roster:px-4 group-data-[size=lg]/roster:py-3",
          "data-[highlighted]:bg-accent data-[state=checked]:border-primary",
          className
        )}
        onPointerEnter={(event) => {
          onPointerEnter?.(event)
          roster.highlightStore.getState().highlight(value)
        }}
        onPointerLeave={(event) => {
          onPointerLeave?.(event)
          roster.highlightStore.getState().highlight(null)
        }}
      />
    </RosterItemContext.Provider>
  )
}

type RosterToggleProps = Omit<
  React.ComponentProps<typeof Checkbox>,
  "checked" | "defaultChecked" | "id"
>

function RosterToggle({ onCheckedChange, ...props }: RosterToggleProps) {
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
        roster.setValue(
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
        "font-medium",
        "text-sm group-data-[size=sm]/roster:text-xs group-data-[size=lg]/roster:text-base",
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
        "ml-auto text-muted-foreground",
        "text-xs group-data-[size=lg]/roster:text-sm",
        className
      )}
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
  useRoster,
  useRosterItem,
}
export type { RosterProps, RosterItemProps, RosterSize }
