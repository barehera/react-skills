"use client"

import { useQuery } from "@tanstack/react-query"

import type { ShiftCrewDetailInput } from "../types"
import { shiftCrewDetailOptions } from "./options"

export function useShiftCrewQuery(
  input: Omit<ShiftCrewDetailInput, "signal">
) {
  return useQuery(shiftCrewDetailOptions(input))
}
