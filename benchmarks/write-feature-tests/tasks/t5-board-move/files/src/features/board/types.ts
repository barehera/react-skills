export type BoardColumnId = "todo" | "in_progress" | "review" | "done"

export type BoardCard = {
  id: string
  title: string
  blocked: boolean
}

export type BoardColumn = {
  id: BoardColumnId
  /** Maximum number of cards the column accepts, or null for no limit. */
  wipLimit: number | null
  cardIds: string[]
}

export type BoardState = {
  columns: Record<BoardColumnId, BoardColumn>
  cards: Record<string, BoardCard>
}

/** A drag-and-drop result: drop `cardId` from column `from` at position `index` of column `to`. */
export type CardMove = {
  cardId: string
  from: BoardColumnId
  to: BoardColumnId
  index: number
}
