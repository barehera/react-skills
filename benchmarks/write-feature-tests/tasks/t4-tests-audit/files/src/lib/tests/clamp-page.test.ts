import { testRule } from "@/tests/rule-cases"

import { clampPage } from "../pagination"

testRule(clampPage, [
  { case: "keeps a page inside the range", input: { page: 3, pageCount: 5 }, expected: 3 },
  { case: "moves a page past the end back to the last page", input: { page: 9, pageCount: 5 }, expected: 5 },
  { case: "moves a page before the start to the first page", input: { page: 0, pageCount: 5 }, expected: 1 },
  { case: "shows the first page of an empty list", input: { page: 2, pageCount: 0 }, expected: 1 },
])
