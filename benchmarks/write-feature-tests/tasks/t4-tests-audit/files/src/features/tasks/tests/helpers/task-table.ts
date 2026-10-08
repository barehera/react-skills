import { describe, expect, it } from "vitest"

import type { Task, Viewer } from "../../types"

export function makeTask(overrides: Partial<Task> = {}): Task {
  return {
    id: "task-1",
    projectId: "project-1",
    title: "Write the release notes",
    status: "done",
    assigneeId: "user-2",
    createdById: "user-3",
    dueDate: "2026-03-01",
    archivedAt: null,
    ...overrides,
  }
}

export function makeViewer(overrides: Partial<Viewer> = {}): Viewer {
  return { id: "user-1", role: "editor", ...overrides }
}

type TaskCase<Result> = {
  name: string
  task: Task
  viewer: Viewer
  expected: Result
}

/** Table runner for task rules that need a task and a viewer. */
export function runTaskTable<Result>(
  suiteName: string,
  decide: (task: Task, viewer: Viewer) => Result,
  cases: TaskCase<Result>[],
): void {
  describe(suiteName, () => {
    for (const { name, task, viewer, expected } of cases) {
      it(name, () => {
        expect(decide(task, viewer)).toEqual(expected)
      })
    }
  })
}
