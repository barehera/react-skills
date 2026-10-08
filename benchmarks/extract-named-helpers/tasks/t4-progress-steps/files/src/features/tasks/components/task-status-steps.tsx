import {
  ProgressStep,
  ProgressStepConnector,
  ProgressStepIndicator,
  ProgressSteps,
} from "@/components/progress-steps"

import type { Task } from "../types"

const stepLabels = ["To do", "In progress", "Done"]

export function TaskStatusSteps({ task }: { task: Pick<Task, "status"> }) {
  let currentStep: number
  if (task.status === "todo") {
    currentStep = 0
  } else if (task.status === "in_progress") {
    currentStep = 1
  } else {
    // A done task has every step complete, so point past the last step.
    currentStep = stepLabels.length
  }

  return (
    <ProgressSteps currentStep={currentStep} stepCount={stepLabels.length}>
      {stepLabels.map((label, step) => (
        <ProgressStep key={label} step={step}>
          <ProgressStepIndicator />
          <span>{label}</span>
          <ProgressStepConnector />
        </ProgressStep>
      ))}
    </ProgressSteps>
  )
}
