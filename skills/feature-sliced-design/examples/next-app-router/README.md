# Canonical Next.js App Router architecture

Placement model for an expense-review workflow: ownership and import paths,
not backend contracts or UI implementation.

## Project tree

```text
project/
├── app/
│   ├── (workspace)/
│   │   └── expenses/
│   │       └── [expenseId]/
│   │           ├── loading.tsx
│   │           ├── error.tsx
│   │           └── page.tsx
│   └── api/
│       └── expense-webhook/
│           └── route.ts
├── public/
│   └── brand/
│       └── wordmark.svg
├── scripts/
│   └── verify-environment.mjs
└── src/
    ├── _app/
    │   ├── providers/
    │   │   ├── app-providers.tsx
    │   │   └── query-provider.tsx
    │   ├── analytics/
    │   │   └── start-page-tracking.ts
    │   └── api-routes/
    │       └── receive-expense-webhook.ts
    ├── _pages/
    │   └── expense-review/
    │       └── expense-review-page.tsx
    ├── widgets/
    │   └── expense-review-panel/
    │       └── expense-review-panel.tsx
    ├── features/
    │   ├── approve-expense/
    │   │   ├── approve-expense-button.tsx
    │   │   ├── api/
    │   │   │   └── approve-expense.server.ts
    │   │   ├── model/
    │   │   │   └── approval-schema.ts
    │   │   ├── server-state/
    │   │   │   └── use-approve-expense-mutation.ts
    │   │   └── ui/
    │   │       └── approval-confirmation-dialog.tsx
    │   └── add-expense-note/
    │       ├── add-expense-note-form.tsx
    │       ├── api/
    │       ├── model/
    │       └── ui/
    ├── entities/
    │   ├── expense/
    │   │   ├── expense.ts
    │   │   ├── expense-summary.tsx
    │   │   ├── model/
    │   │   │   └── expense-schema.ts
    │   │   └── server-state/
    │   │       ├── expense-queries.ts
    │   │       └── use-expense-detail-query.ts
    │   └── employee/
    │       ├── employee.ts
    │       └── employee-name.tsx
    └── shared/
        ├── api/
        │   ├── http-client.ts
        │   └── normalize-api-error.ts
        ├── assets/
        │   └── receipt-placeholder.svg
        ├── config/
        │   └── env/
        │       ├── client-env.ts
        │       └── server-env.ts
        ├── i18n/
        │   └── create-i18n.ts
        ├── integrations/
        │   └── firebase/
        │       ├── client/
        │       │   ├── client-app.ts
        │       │   └── get-remote-config.ts
        │       ├── server/
        │       │   ├── server-app.ts
        │       │   └── get-admin-auth.ts
        │       └── config/
        │           └── remote-config-default.json
        ├── lib/
        │   └── currency/
        │       └── format-money.ts
        └── ui/
            ├── button.tsx
            └── dialog.tsx
```

## Composition flow

The framework route `page.tsx` awaits `params` and renders
`<ExpenseReviewPage expenseId={expenseId} />` from
`@/_pages/expense-review/expense-review-page`; it neither re-exports the page
nor implements the workflow. The page renders `ExpenseReviewPanel` the same
way. The widget may compose sibling features because it sits above the
Features layer:

```tsx
import { AddExpenseNoteForm } from "@/features/add-expense-note/add-expense-note-form";
import { ApproveExpenseButton } from "@/features/approve-expense/approve-expense-button";
import { ExpenseSummary } from "@/entities/expense/expense-summary";

export interface ExpenseReviewPanelProps {
  expenseId: string;
}

export function ExpenseReviewPanel({ expenseId }: ExpenseReviewPanelProps) {
  return (
    <section aria-labelledby="expense-review-title">
      <h1 id="expense-review-title">Review expense</h1>
      <ExpenseSummary expenseId={expenseId} />
      <AddExpenseNoteForm expenseId={expenseId} />
      <ApproveExpenseButton expenseId={expenseId} />
    </section>
  );
}
```

The two features never import each other; each may import the Expense entity
and Shared. The Expense entity imports only Shared.

## Server and remote-state decisions

- `approve-expense.server.ts` owns the Server Action and validates its input.
- `use-approve-expense-mutation.ts` owns the TanStack Query mutation lifecycle
  and targeted Expense cache effects; implement it with `$manage-server-state`.
- Entity query options own stable Expense reads shared by both features.

## Public path decisions

These direct paths form the deliberate external contract; there are no
re-export-only `index.ts` files, and supporting feature modules stay private:

```text
@/_pages/expense-review/expense-review-page
@/widgets/expense-review-panel/expense-review-panel
@/features/approve-expense/approve-expense-button
@/features/add-expense-note/add-expense-note-form
@/entities/expense/expense
@/entities/expense/expense-summary
@/shared/ui/button
@/shared/integrations/firebase/client/get-remote-config
@/shared/integrations/firebase/server/get-admin-auth
```
