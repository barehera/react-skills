# Canonical Next.js App Router architecture

This example shows a complete placement model for an expense-review workflow.
It demonstrates ownership and import paths, not production backend contracts or
UI implementation. Create only the directories required by the real project.

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
            ├── button/
            │   └── button.tsx
            └── dialog/
                └── dialog.tsx
```

## Composition flow

The framework route imports and renders the page implementation. It does not
re-export the page and does not implement the workflow:

```tsx
import { ExpenseReviewPage } from "@/_pages/expense-review/expense-review-page";

interface ExpenseRouteProps {
  params: Promise<{ expenseId: string }>;
}

export default async function ExpenseRoute({ params }: ExpenseRouteProps) {
  const { expenseId } = await params;

  return <ExpenseReviewPage expenseId={expenseId} />;
}
```

The page composes a widget through its real stable implementation path:

```tsx
import { ExpenseReviewPanel } from "@/widgets/expense-review-panel/expense-review-panel";

export interface ExpenseReviewPageProps {
  expenseId: string;
}

export function ExpenseReviewPage({ expenseId }: ExpenseReviewPageProps) {
  return <ExpenseReviewPanel expenseId={expenseId} />;
}
```

The widget may compose sibling features because it sits above the Features
layer:

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

The two features do not import each other. Each feature may import the Expense
entity and Shared foundations. The Expense entity may import only Shared.

## Server and remote-state decisions

- `approve-expense.server.ts` owns the Server Action and validates its input.
- `use-approve-expense-mutation.ts` owns TanStack Query mutation lifecycle and
  targeted Expense cache effects. Read `$manage-server-state` before
  implementing it.
- Entity query options own stable Expense reads shared by both features.
- Root QueryClient composition lives in `_app/providers/query-provider.tsx`.
- The webhook route stays at `app/api/**/route.ts`, while handler composition
  lives in `_app/api-routes`. If webhook business logic grows into a backend
  service, move it to a separate package.

## Public path decisions

These direct paths form the deliberate external contract:

```text
@/_pages/expense-review/expense-review-page
@/widgets/expense-review-panel/expense-review-panel
@/features/approve-expense/approve-expense-button
@/features/add-expense-note/add-expense-note-form
@/entities/expense/expense
@/entities/expense/expense-summary
@/shared/ui/button/button
@/shared/integrations/firebase/client/get-remote-config
@/shared/integrations/firebase/server/get-admin-auth
```

There are no re-export-only `index.ts` files. Supporting feature modules remain
private unless a real external consumer requires a stable path.

## Why the original flat folders disappeared

| Flat root | Result |
| --- | --- |
| `components` | split between owner `ui` and `shared/ui` |
| `hooks` | remote hooks moved to owner `server-state`; other hooks follow their purpose |
| `schemas`, `types`, `constants` | moved beside the feature/entity/config contract they govern |
| `libs` | split into focused `shared/lib` and vendor `shared/integrations` |
| `providers` | moved to `_app/providers` |
| `server-state` | resource state moved to feature/entity owners; QueryClient stays in App |
| `store` | app composition stays in App; slice stores stay in owner `model` |
| `utils` | replaced by named libraries such as `shared/lib/currency` |

This tree remains a target model, not a command to move a coherent existing
repository in one pass.
