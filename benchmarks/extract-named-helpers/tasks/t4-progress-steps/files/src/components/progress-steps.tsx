import * as React from "react"
import { CheckIcon } from "lucide-react"

import { cn } from "@/lib/utils"

type ProgressStepsContextValue = {
  currentStep: number
  stepCount: number
}

const ProgressStepsContext =
  React.createContext<ProgressStepsContextValue | null>(null)

function useProgressSteps() {
  const context = React.useContext(ProgressStepsContext)
  if (!context) {
    throw new Error("ProgressSteps parts must be used inside <ProgressSteps>.")
  }
  return context
}

const ProgressStepContext = React.createContext<number | null>(null)

function useProgressStep() {
  const step = React.useContext(ProgressStepContext)
  if (step === null) {
    throw new Error("Step parts must be used inside <ProgressStep>.")
  }
  return step
}

function ProgressSteps({
  currentStep,
  stepCount,
  className,
  ...props
}: React.ComponentProps<"ol"> & ProgressStepsContextValue) {
  return (
    <ProgressStepsContext.Provider value={{ currentStep, stepCount }}>
      <ol
        data-slot="progress-steps"
        className={cn("flex items-center gap-2", className)}
        {...props}
      />
    </ProgressStepsContext.Provider>
  )
}

function ProgressStep({
  step,
  className,
  ...props
}: React.ComponentProps<"li"> & { step: number }) {
  const { currentStep } = useProgressSteps()

  return (
    <ProgressStepContext.Provider value={step}>
      <li
        data-slot="progress-step"
        data-state={
          step < currentStep
            ? "complete"
            : step === currentStep
              ? "current"
              : "upcoming"
        }
        aria-current={step === currentStep ? "step" : undefined}
        className={cn("flex items-center gap-2 text-sm", className)}
        {...props}
      />
    </ProgressStepContext.Provider>
  )
}

function ProgressStepIndicator({
  className,
  ...props
}: React.ComponentProps<"span">) {
  const { currentStep } = useProgressSteps()
  const step = useProgressStep()

  return (
    <span
      data-slot="progress-step-indicator"
      className={cn(
        "flex size-6 shrink-0 items-center justify-center rounded-full border text-xs font-medium",
        step < currentStep && "border-primary bg-primary text-primary-foreground",
        step === currentStep && "border-primary text-primary",
        step > currentStep && "text-muted-foreground",
        className
      )}
      {...props}
    >
      {step < currentStep ? <CheckIcon className="size-3.5" /> : step + 1}
    </span>
  )
}

function ProgressStepConnector({
  className,
  ...props
}: React.ComponentProps<"span">) {
  const { currentStep, stepCount } = useProgressSteps()
  const step = useProgressStep()

  if (step === stepCount - 1) return null

  return (
    <span
      aria-hidden
      data-slot="progress-step-connector"
      className={cn(
        "h-px w-8 bg-border",
        step < currentStep && "bg-primary",
        className
      )}
      {...props}
    />
  )
}

export {
  ProgressStep,
  ProgressStepConnector,
  ProgressStepIndicator,
  ProgressSteps,
}
