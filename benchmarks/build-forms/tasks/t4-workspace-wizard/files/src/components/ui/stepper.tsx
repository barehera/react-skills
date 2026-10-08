import * as React from "react"

import { cn } from "@/lib/utils"

type StepperContextValue = {
  steps: readonly string[]
  value: string
  setValue: (value: string) => void
}

const StepperContext = React.createContext<StepperContextValue | null>(null)
const StepperItemContext = React.createContext<string | null>(null)

function useStepperContext(part: string) {
  const context = React.useContext(StepperContext)

  if (!context) {
    throw new Error(`${part} must be rendered inside Stepper.`)
  }

  return context
}

/** Navigation state for the nearest Stepper. */
function useStepper() {
  const { steps, value, setValue } = useStepperContext("useStepper")
  const index = steps.indexOf(value)

  return {
    value,
    index,
    count: steps.length,
    isFirst: index === 0,
    isLast: index === steps.length - 1,
    goTo: setValue,
    next: () => {
      const next = steps[index + 1]
      if (next !== undefined) setValue(next)
    },
    previous: () => {
      const previous = steps[index - 1]
      if (previous !== undefined) setValue(previous)
    },
  }
}

type StepperProps = Omit<React.ComponentProps<"div">, "defaultValue"> & {
  /** Ordered step values. */
  steps: readonly string[]
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
}

function Stepper({
  steps,
  value: valueProp,
  defaultValue,
  onValueChange,
  className,
  ...props
}: StepperProps) {
  const [uncontrolledValue, setUncontrolledValue] = React.useState(
    defaultValue ?? steps[0] ?? ""
  )
  const isControlled = valueProp !== undefined
  const value = isControlled ? valueProp : uncontrolledValue

  function setValue(next: string) {
    if (!isControlled) setUncontrolledValue(next)
    onValueChange?.(next)
  }

  return (
    <StepperContext.Provider value={{ steps, value, setValue }}>
      <div
        data-slot="stepper"
        className={cn("flex flex-col gap-6", className)}
        {...props}
      />
    </StepperContext.Provider>
  )
}

function StepperList({ className, ...props }: React.ComponentProps<"ol">) {
  return (
    <ol
      data-slot="stepper-list"
      className={cn("flex items-center gap-4", className)}
      {...props}
    />
  )
}

function StepperItem({
  value,
  className,
  ...props
}: React.ComponentProps<"li"> & { value: string }) {
  const stepper = useStepperContext("StepperItem")
  const index = stepper.steps.indexOf(value)
  const activeIndex = stepper.steps.indexOf(stepper.value)
  const state =
    index === activeIndex
      ? "active"
      : index < activeIndex
        ? "complete"
        : "inactive"

  return (
    <StepperItemContext.Provider value={value}>
      <li
        data-slot="stepper-item"
        data-state={state}
        aria-current={state === "active" ? "step" : undefined}
        className={cn("group/stepper-item flex items-center gap-2", className)}
        {...props}
      />
    </StepperItemContext.Provider>
  )
}

function StepperIndicator({
  className,
  ...props
}: React.ComponentProps<"span">) {
  const stepper = useStepperContext("StepperIndicator")
  const value = React.useContext(StepperItemContext)

  if (value === null) {
    throw new Error("StepperIndicator must be rendered inside StepperItem.")
  }

  return (
    <span
      data-slot="stepper-indicator"
      aria-hidden="true"
      className={cn(
        "flex size-6 items-center justify-center rounded-full border text-xs font-medium",
        "group-data-[state=active]/stepper-item:border-primary group-data-[state=active]/stepper-item:bg-primary group-data-[state=active]/stepper-item:text-primary-foreground",
        "group-data-[state=complete]/stepper-item:border-primary group-data-[state=complete]/stepper-item:text-primary",
        className
      )}
      {...props}
    >
      {stepper.steps.indexOf(value) + 1}
    </span>
  )
}

function StepperTitle({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="stepper-title"
      className={cn(
        "text-sm font-medium text-muted-foreground group-data-[state=active]/stepper-item:text-foreground",
        className
      )}
      {...props}
    />
  )
}

/** Renders its children only while its step is active. */
function StepperContent({
  value,
  className,
  ...props
}: React.ComponentProps<"div"> & { value: string }) {
  const stepper = useStepperContext("StepperContent")

  if (stepper.value !== value) return null

  return (
    <div
      data-slot="stepper-content"
      className={cn("flex flex-col gap-6", className)}
      {...props}
    />
  )
}

export {
  Stepper,
  StepperContent,
  StepperIndicator,
  StepperItem,
  StepperList,
  StepperTitle,
  useStepper,
}
