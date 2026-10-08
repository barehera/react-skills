import {
  ProgressStep,
  ProgressStepConnector,
  ProgressStepIndicator,
  ProgressSteps,
} from "@/components/progress-steps"

export type OnboardingItem = {
  id: string
  label: string
  done: boolean
  skipped: boolean
}

export function OnboardingProgress({ items }: { items: OnboardingItem[] }) {
  const firstOpenIndex = items.findIndex((item) => !item.done && !item.skipped)
  const currentStep = firstOpenIndex === -1 ? items.length : firstOpenIndex

  return (
    <ProgressSteps
      aria-label="Onboarding progress"
      currentStep={currentStep}
      stepCount={items.length}
    >
      {items.map((item, step) => (
        <ProgressStep key={item.id} step={step}>
          <ProgressStepIndicator />
          <span>{item.label}</span>
          <ProgressStepConnector />
        </ProgressStep>
      ))}
    </ProgressSteps>
  )
}
