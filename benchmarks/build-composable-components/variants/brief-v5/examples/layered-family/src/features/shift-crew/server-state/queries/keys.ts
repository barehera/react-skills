export const shiftCrewKeys = {
  all: ["shift-crew"] as const,
  detail: (shiftId: string) =>
    [...shiftCrewKeys.all, "detail", shiftId] as const,
}
