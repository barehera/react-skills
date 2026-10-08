import { create } from "zustand"

import type { BoardColumn, BoardColumnId, BoardState, CardMove } from "../types"

type BoardStore = BoardState & {
  setBoard: (board: BoardState) => void
  moveCard: (move: CardMove) => void
}

function emptyColumn(id: BoardColumnId, wipLimit: number | null): BoardColumn {
  return { id, wipLimit, cardIds: [] }
}

export const useBoardStore = create<BoardStore>()((set) => ({
  columns: {
    todo: emptyColumn("todo", null),
    in_progress: emptyColumn("in_progress", 3),
    review: emptyColumn("review", 2),
    done: emptyColumn("done", null),
  },
  cards: {},

  setBoard: (board) => set(board),

  // Business Logic: A card dropped into a column that is already at its WIP limit stays where it was; reordering inside a full column is allowed. A card that reaches Done is no longer blocked.
  // Why: WIP limits keep reviewers from drowning, and a finished card still flagged as blocked kept showing up in the blocked-work report.
  // Rule: Never let a move from another column push a column past its WIP limit.
  moveCard: (move) =>
    set((state) => {
      const source = state.columns[move.from]
      const target = state.columns[move.to]
      if (!source.cardIds.includes(move.cardId)) return state

      const sameColumn = move.from === move.to
      if (!sameColumn && target.wipLimit !== null && target.cardIds.length >= target.wipLimit) return state

      const remaining = source.cardIds.filter((id) => id !== move.cardId)
      const targetIds = sameColumn ? remaining : [...target.cardIds]
      const index = Math.min(Math.max(0, move.index), targetIds.length)
      targetIds.splice(index, 0, move.cardId)

      const card = state.cards[move.cardId]
      const unblock = move.to === "done" && card !== undefined && card.blocked

      return {
        columns: {
          ...state.columns,
          [move.from]: { ...source, cardIds: remaining },
          [move.to]: { ...target, cardIds: targetIds },
        },
        cards: unblock ? { ...state.cards, [move.cardId]: { ...card, blocked: false } } : state.cards,
      }
    }),
}))
