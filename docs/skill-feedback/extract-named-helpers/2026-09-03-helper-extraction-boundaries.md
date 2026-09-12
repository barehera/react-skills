---
feedback_version: 1
target_skill: extract-named-helpers
target_skill_version: unversioned
source_project: genie-website
captured_at: 2026-09-03
status: ready
---

# Skill Feedback: extract-named-helpers

## Executive Summary

While fixing a multi-stage streaming flow (resume after refresh, cancel and regenerate, rate-limit rendering, delayed final report), the agent produced a set of small changes the user explicitly approved for readability: inline derivations were replaced by named predicates and getters, duplicated detection logic collapsed into shared predicates, inline callback bodies became named transforms, and React hooks kept state and effects while pure helpers moved to module scope. The user also approved what was *not* extracted: short boolean compositions, single-use branches, and one-line fallbacks stayed inline.

No installed React Skills workflow owns this decision today. `build-composable-components`, `manage-server-state`, and `document-business-logic` (React Skills v1.8.0) each touch naming or comments, but none states when to extract a helper, where it lives, how it is named, or how it relates to a hook. This report proposes a new skill, `extract-named-helpers`, and records the rules, boundaries, portable examples, and acceptance tests observed in the accepted implementation. It is a proposal for the skill catalog, not an instruction to revise the originating chat feature.

## Project Context

- Task: fix deep-research stream resume, cancel and regenerate state, HTTP rate-limit card, and report-pending loader in a Next.js 15 / React 19 chat app with TanStack Query, Zustand, Zod, and React Compiler enabled.
- Stack and conventions: repository rule forbids `useMemo`/`useCallback` (React Compiler); repository rule limits comments to one `Business Logic / Why / Rule` block per owning declaration; feature-colocated `utils/`, `hooks/`, `server-state/` folders; Prettier + ESLint + `tsc --noEmit` as validation.
- Skill invocation: `build-composable-components`, `manage-server-state`, and `document-business-logic` were read for the final review pass. No helper-extraction skill exists, so the agent applied its own judgement, which the user then approved as the desired standard.
- Evidence reviewed: commit `f575ce87` (13 files, +218/-69), the pre-review diff in the same session, and the user's explicit approval: "I really liked the way you did all the helpers ... you are doing it only if necessary not making everything helpers and if something is easy to do with hooks etc you are separating them with hooks and inside the hooks you are generating necessary helpers and using it everywhere needed."

## Findings

### F-001: Extract a helper when a derivation is a multi-step chain, duplicated, or an inline callback with branching

- Category: missing-rule
- Severity: high
- Recurrence: structural
- Confidence: high

#### Scenario

A component needed a boolean "all checklist items done" derived from a widget array; a utility module tested the same error condition in two exported functions; a mutation passed a multi-branch updater callback inline to a cache action.

#### Evidence

origin (do not ingest):

`features/chat/components/assistant.message.tsx` before review:

```tsx
const researchPlanSpec = message.widgets
  ?.filter(isResearchPlanWidget)
  .map((widget) => parseResearchPlanWidgetData(widget.data))
  .find((spec) => spec !== null);
const isResearchReportPending =
  isResearchPlanProgressSurface &&
  isBusy &&
  isLastMessage &&
  !!researchPlanSpec &&
  researchPlanSpec.topics.length > 0 &&
  getResearchPlanCompletedCount(researchPlanSpec) >= researchPlanSpec.topics.length;
```

after (commit `f575ce87`):

```tsx
const isResearchReportPending =
  isResearchPlanProgressSurface && isBusy && isLastMessage && hasCompletedResearchPlan(message.widgets);
```

`utils/completion-error.ts` before review repeated `getApiCode(error) === RATE_LIMITED || === RATE_LIMIT_EXCEEDED` and `error instanceof AxiosError && error.status === 429` in both `handleChatCompletionError` and `isRateLimitCompletionError`; after, both compose `hasRateLimitApiCode` and `isTooManyRequestsResponse`.

`features/chat/server-state/mutations/use-resume-stream-mutation.tsx` before review passed a 12-line `message: (prev) => { ... }` updater inline; after, `message: (prev) => resetMessageForResume(prev, kind)` with the body as a module-level function.

#### Current behavior

Without a rule, the agent's first pass left a filter/map/find chain plus a six-clause boolean inside a component body, duplicated a predicate across two exports, and embedded a branching updater inline. The user accepted the behavior but the review pass had to extract all three.

#### Preferred behavior

Extract a named helper when at least one trigger is present:

1. a derivation chains two or more array or object operations before producing the value the caller actually uses;
2. the same predicate or transform appears in two places in one module or across sibling modules;
3. an inline callback body contains a branch (`if`, ternary, early return) or spans more than about three lines.

The helper carries the intent in its name so the call site reads as a sentence.

skill example (ingest this):

```tsx
// Previous: the component derives the answer inline.
const checklist = item.sections?.filter(isChecklist).map(parseChecklist).find(Boolean);
const isReadyToPublish =
  isDraft && isOwner && !!checklist && checklist.steps.length > 0 && countDone(checklist) >= checklist.steps.length;

// Improved: a named predicate owns the chain; the component composes flags.
const isReadyToPublish = isDraft && isOwner && hasCompletedChecklist(item.sections);
```

```ts
// Previous: two exports repeat the same detection.
export const toErrorMessage = (error) => {
  if (getCode(error) === 'LIMIT' || getCode(error) === 'LIMIT_EXCEEDED') { ... }
  if (error instanceof HttpError && error.status === 429) { ... }
};
export const isLimitError = (error) =>
  getCode(error) === 'LIMIT' || getCode(error) === 'LIMIT_EXCEEDED' || (error instanceof HttpError && error.status === 429);

// Improved: private predicates, composed by both exports.
const hasLimitCode = (error) => ['LIMIT', 'LIMIT_EXCEEDED'].includes(getCode(error));
const isTooManyRequests = (error) => error instanceof HttpError && error.status === 429;
export const isLimitError = (error) => hasLimitCode(error) || isTooManyRequests(error);
```

#### Proposed skill change

Add an "Extraction triggers" contract to the new skill's `SKILL.md` listing the three triggers above, with the previous-versus-improved snippets in `references/extraction-triggers.md`.

#### Generalization test

Applies to any React or TypeScript module where a value is derived from domain data before use: components, hooks, mutations, utilities. Does not apply to a single `.filter` or `.map` whose callback is a one-line expression, nor to a one-off `??` fallback (see F-002). Counterexample: `const label = currentText ?? t('fallback')` stays inline.

#### Acceptance criteria

- The skill states the three extraction triggers as a numbered list in `SKILL.md`.
- On a fresh task, an agent following the skill replaces a filter/map/find chain feeding a boolean with one `has*`/`is*` helper and leaves the surrounding boolean composition in the component.
- On a fresh task, a predicate repeated in two exports of the same module becomes one private helper both exports call.

### F-002: Keep short compositions, single-use branches, and one-line fallbacks inline

- Category: missing-rule
- Severity: high
- Recurrence: structural
- Confidence: high

#### Scenario

The same review pass consciously left several pieces of logic inline. The user named this as part of what they liked: "doing it only if necessary, not making everything helpers."

#### Evidence

origin (do not ingest), all in commit `f575ce87`:

- `features/chat/components/assistant.message.tsx`: `isResearchReportPending = isResearchPlanProgressSurface && isBusy && isLastMessage && hasCompletedResearchPlan(...)` stays a local const, not a `getIsResearchReportPending()` helper.
- `features/chat/hooks/use-resume-pending-stream.ts`: `const resumeMessageId = activeStreamId ?? pendingStreamMessageId;` and `const hasNothingToResume = !pendingId && processingIds.size === 0;` stay local consts.
- `features/chat/server-state/mutations/use-approve-completion-mutation.tsx` `onError`: the ten-line rate-limit branch that calls `updateMessage` and returns stays inline because it has one caller and no chain.
- `features/chat/server-state/mutations/use-stream-mutation.tsx`: two duplicated `setPendingStreamMessageId(tempChatId, null)` calls were merged into one call placed before the branch, not wrapped in a helper.

#### Current behavior

The agent avoided over-extraction, but only by judgement. There is no written boundary, so a different session could wrap every boolean in a function and make the code harder to follow.

#### Preferred behavior

Do not extract when all of these hold: the expression is a flat composition of already-named values (`a && b && !c`, `x ?? y`), it has exactly one caller, and it contains no chain and no branch. Prefer a well-named local `const` for readability. When two call sites run the same side effect, first try to move the call to the shared decision point; extract a helper only if the call still needs to appear in more than one place.

skill example (ingest this):

```tsx
// Keep inline: flat composition of named flags, one caller.
const canSubmit = isValid && !isSaving && hasChanges;

// Keep inline: one-line fallback.
const targetId = serverId ?? localId;

// Do not do this: the wrapper adds indirection without adding a name the call site lacked.
const canSubmit = getCanSubmit({ isValid, isSaving, hasChanges });
```

```ts
// Previous: the same reset in two branches.
if (isPaywallError(error)) { clearPending(); removeDraft(); return; }
clearPending(); showError();

// Improved: hoist to the decision point instead of extracting a helper.
clearPending();
if (isPaywallError(error)) { removeDraft(); return; }
showError();
```

#### Proposed skill change

Add a "Do not extract" contract next to the triggers in `SKILL.md`, and a "hoist before you extract" note with the side-effect example in `references/extraction-triggers.md`.

#### Generalization test

Applies to booleans, fallbacks, and side-effect ordering in any TypeScript module. Does not override F-001: a flat composition that appears in two components is a duplication trigger and should be extracted. Counterexample: `isValid && !isSaving && hasChanges` duplicated in a form footer and a keyboard handler becomes `canSubmitForm(state)`.

#### Acceptance criteria

- The skill lists the three "keep inline" conditions and the "hoist before you extract" rule.
- On a fresh task, an agent following the skill leaves a single-caller `a && b && !c` composition as a local const and does not introduce a `get*` wrapper for it.
- On a fresh task, duplicated side effects at two branch ends are moved to the shared decision point rather than wrapped.

### F-003: Place a helper by consumer count, export only when a second consumer exists

- Category: missing-rule
- Severity: medium
- Recurrence: structural
- Confidence: high

#### Scenario

Some new helpers were reused by a component, a widget, and another utility; others had exactly one caller in the file that defined them.

#### Evidence

origin (do not ingest), commit `f575ce87`:

- Exported from the feature utility module `features/chat/utils/message-widgets.ts` beside its sibling widget helpers: `hasResearchOutput` (used by `assistant.message.tsx`, `chat-research-plan-widget.tsx`, and `hasInteractiveWaitWidget` in the same module), `hasCompletedResearchPlan`, `getResearchPlanWidgetData`.
- Module-private in the consuming file: `getUniqueIconTools` in `assistant-connection-tool-loading.tsx`; `resetMessageForResume` in `use-resume-stream-mutation.tsx`; `isStaleBusyStatus` and `STALE_BUSY_STATUSES` in `use-resume-pending-stream.ts`; `hasRateLimitApiCode`, `isTooManyRequestsResponse`, `getApiErrorMessage` in `utils/completion-error.ts`.

#### Current behavior

Placement was decided by the agent case by case. Nothing in the installed skills says where a new helper belongs or when it earns an export.

#### Preferred behavior

Place the helper as close to its only consumer as possible: a module-level `const` or `function` in the same file when there is one consumer. Move it to the feature's shared utility module that already owns that domain vocabulary when a second consumer appears, and export it from there. Do not create a new utility file for one helper, and do not export a helper speculatively. Public helpers sit next to sibling helpers of the same domain so the module reads as one vocabulary.

skill example (ingest this):

```text
Single consumer  -> module-private helper above the consumer in the same file.
Two+ consumers   -> exported from the feature utility module that owns the domain
                    (e.g. `utils/order-lines.ts` next to `isOrderLine`, `getOrderTotal`).
Never            -> a new `helpers.ts` holding one function, or an export with no second caller.
```

#### Proposed skill change

Add a "Placement" section to `SKILL.md` with the three-row table, and a longer reference `references/placement.md` describing how to find the existing domain utility module before creating a new one.

#### Generalization test

Applies to feature-colocated and layer-oriented repositories alike; the "owning utility module" is whatever the repository already uses for that domain. Does not apply to helpers that must be shared across features, which belong in the repository's shared utils per its existing convention. Counterexample: a helper used by two features does not go into either feature's `utils`.

#### Acceptance criteria

- The skill contains the placement table with single-consumer, multi-consumer, and never rows.
- On a fresh task, a helper with one caller is defined in the consumer's file without `export`.
- On a fresh task, a helper reused by a component and a utility is exported from the existing domain utility module, not from a new file.

### F-004: A helper takes the domain object, typed by the minimal shape it reads

- Category: missing-rule
- Severity: medium
- Recurrence: repeated
- Confidence: high

#### Scenario

A widget predicate needed both the widget list and a sibling field on the same message. The first pass passed both separately; the review pass changed the signature to accept the message.

#### Evidence

origin (do not ingest):

`features/chat/utils/message-widgets.ts` before review:

```ts
export function hasInteractiveWaitWidget(
  widgets: ChatMessageWidget[] | null | undefined,
  message?: ResearchOutputSource | null
): boolean {
  ...
  const researchAlreadyRan = hasResearchOutput({ widgets, searchedUrls: message?.searchedUrls });
```

Callers: `hasInteractiveWaitWidget(message.widgets, message)` and `hasInteractiveWaitWidget(message?.widgets, message)`.

After (commit `f575ce87`):

```ts
type WidgetMessage = {
  searchedUrls?: unknown[] | null;
  widgets?: ChatMessageWidget[] | null;
};

export function hasInteractiveWaitWidget(message: WidgetMessage | null | undefined): boolean {
  const widgets = message?.widgets;
  ...
  const researchAlreadyRan = hasResearchOutput(message);
```

Callers became `hasInteractiveWaitWidget(message)`. `shouldAwaitCompletion` in `features/chat/utils/tool-approval.ts` only had to add `searchedUrls?: unknown[] | null` to its structural parameter type to stay compatible.

#### Current behavior

The first signature forced callers to destructure an object they already held and forced the helper to rebuild that object internally. The review pass corrected it.

#### Preferred behavior

When a helper reads two or more fields of the same object, accept the object. Type the parameter with a small structural type naming only the fields read (a local `type X = Pick<...>` or an inline shape), so utilities, hooks, and tests that hold partial objects can still call it. Keep helpers that read one field taking that field.

skill example (ingest this):

```ts
// Previous: caller destructures, helper rebuilds.
hasBlockingSection(item.sections, item);
export function hasBlockingSection(sections, item) {
  const done = isAlreadyDone({ sections, completedAt: item?.completedAt });
}

// Improved: minimal structural type, object passed through.
type SectionSource = { sections?: Section[] | null; completedAt?: number | null };
export function hasBlockingSection(item: SectionSource | null | undefined): boolean {
  const done = isAlreadyDone(item);
}
```

#### Proposed skill change

Add a "Signature" rule to `SKILL.md`: two or more fields from one object means pass the object with a minimal structural type. Include the snippet in `references/signatures-and-naming.md`.

#### Generalization test

Applies to pure helpers over domain objects in components, hooks, and utilities. Does not apply when the helper is genuinely about a single value (`isStaleBusyStatus(status)`), where the field is the correct parameter. Counterexample: a helper that only reads `tools` keeps `(tools)` as its parameter.

#### Acceptance criteria

- The skill states the two-or-more-fields rule and shows a minimal structural type.
- On a fresh task, an agent following the skill does not produce a signature of the form `helper(obj.field, obj)`.

### F-005: Helper names encode the return contract; rename verbs that lie

- Category: missing-rule
- Severity: medium
- Recurrence: repeated
- Confidence: high

#### Scenario

Existing helpers named `handle*` only built and returned a value; new helpers needed names that told the caller what came back without reading the body.

#### Evidence

origin (do not ingest), `utils/completion-error.ts` in commit `f575ce87`:

- `handleRateLimitError` → `createRateLimitMessage`; `handleUnexpectedError` → `createUnexpectedErrorMessage` (both return a message object and do not handle anything).
- New predicates: `hasRateLimitApiCode`, `isTooManyRequestsResponse`, `isRateLimitCompletionError`.
- New getter returning `string | undefined`: `getApiErrorMessage`.

Elsewhere in the same commit: `getResearchPlanWidgetData` returns data or `null`; `hasCompletedResearchPlan`, `hasResearchOutput`, `isStaleBusyStatus` return `boolean`; `resetMessageForResume` returns a transformed copy; `getUniqueIconTools` returns a filtered array.

#### Current behavior

Verb prefixes were applied consistently in the accepted result, but a legacy `handle*` prefix had to be corrected because it hid that the function was a pure factory.

#### Preferred behavior

Use a small verb vocabulary and keep it consistent within a module:

- `is*` / `has*` / `can*` / `should*` → `boolean`, no side effects;
- `get*` → a value, or `null`/`undefined` when absent;
- `create*` / `build*` → a new object;
- `reset*` / `begin*` / `to*` / `with*` → a transformed copy of the input;
- `handle*` → performs a side effect in response to an event; never for a pure factory.

Rename an existing helper in scope when its verb contradicts its behavior, but do not launch a repository-wide rename.

skill example (ingest this):

```ts
// Previous: "handle" implies a side effect, but the function only builds a value.
const handleLimitError = (slug, content) => ({ type: 'LIMIT', content });

// Improved: the verb matches the contract.
const createLimitMessage = (slug, content) => ({ type: 'LIMIT', content });
```

#### Proposed skill change

Add the verb table to `SKILL.md` as a compact contract and expand it with examples and the "rename in scope only" boundary in `references/signatures-and-naming.md`.

#### Generalization test

Applies to pure helpers in any TypeScript module. Does not mandate renaming framework-facing handlers such as `onClick={handleClick}`, which are correct uses of `handle*`. Counterexample: an `onError` callback that shows a toast is correctly a handler.

#### Acceptance criteria

- The skill publishes the verb table with a return contract per prefix.
- On a fresh task, every new boolean helper starts with `is`, `has`, `can`, or `should`, and no pure factory is named `handle*`.

### F-006: Hooks own React state and effects; helpers are pure, module-level, and composed by the hook

- Category: missing-rule
- Severity: high
- Recurrence: structural
- Confidence: high

#### Scenario

A resume hook needed to decide whether a persisted status was stale; a loading component needed store-selected steps plus a de-duplicated icon list. React Compiler is enabled, so manual memoization is forbidden.

#### Evidence

origin (do not ingest), commit `f575ce87`:

`features/chat/hooks/use-resume-pending-stream.ts`:

```ts
const STALE_BUSY_STATUSES: ReadonlyArray<ChatStatus> = ['loading', 'completion-started', 'thinking', 'searching', 'streaming', 'tool-calling'];

const isStaleBusyStatus = (status: ChatStatus) => STALE_BUSY_STATUSES.includes(status);

export function useResumePendingStream() {
  ...
  useEffect(() => {
    ...
    if (hasNothingToResume && isStaleBusyStatus(status)) { setStatus(chatId, 'idle'); return; }
```

`features/chat/components/assistant-connection-tool-loading.tsx`:

```tsx
const getUniqueIconTools = (tools: AgentStatusStepData['tools']) => tools.filter(...);

export const useAgentStatusSteps = () => {
  const { chatId } = useMessage();
  return useChatStore((state) => state.getAgentStatusSteps(chatId));
};

const ConnectionStepRow = ({ step, isCurrent }) => {
  const iconTools = getUniqueIconTools(step.tools);
```

User feedback: "if something is easy to do with hooks etc you are separating them with hooks and inside the hooks you are generating necessary helpers and using it everywhere needed."

#### Current behavior

The accepted result split responsibilities: the hook reads store and query state and runs effects; pure decisions live in module-level helpers the hook calls; the component consumes one hook result plus one helper. This split was not prescribed by any installed skill.

#### Preferred behavior

- A hook owns subscriptions, effects, refs, and store or query access. It returns named values, not raw store slices the component must interpret.
- Any decision the hook makes that needs no React state becomes a pure module-level helper defined above the hook (or in the domain utility module per F-003), never a function declared inside the hook body.
- Components call the hook and, when they need a further pure derivation, call a helper, so the JSX branches on named booleans.
- With React Compiler enabled, do not wrap the helper or its result in `useMemo`/`useCallback`; the pure function at module scope is the memoization boundary.

skill example (ingest this):

```tsx
// Previous: decision logic lives inside the effect and inside the component.
export function useSyncDraft() {
  useEffect(() => {
    if (['saving', 'syncing', 'uploading'].includes(status) && !pendingId) setStatus('idle');
  }, [...]);
}

// Improved: pure helper at module scope, hook composes it.
const STALE_STATUSES: ReadonlyArray<Status> = ['saving', 'syncing', 'uploading'];
const isStaleStatus = (status: Status) => STALE_STATUSES.includes(status);

export function useSyncDraft() {
  useEffect(() => {
    if (!pendingId && isStaleStatus(status)) setStatus('idle');
  }, [...]);
}
```

#### Proposed skill change

Add a "Hooks and helpers" contract to `SKILL.md` with the four bullets above and the example in `references/hooks-and-helpers.md`. Cross-reference the React Compiler rule already in `build-composable-components` instead of restating it.

#### Generalization test

Applies to any custom hook or component in a React Compiler project; in a non-compiler project the same split applies, but the memoization sentence should be conditional. Does not apply to helpers that need a hook result (they stay inside the hook as ordinary code or become a second hook). Counterexample: a helper that must read `useTranslations()` output is not pure and should receive `t` as an argument or remain hook code.

#### Acceptance criteria

- The skill states that pure decisions used by a hook are module-level helpers, not functions declared inside the hook body.
- On a fresh task, an agent following the skill produces no `useMemo`/`useCallback` around a helper and no `const helper = () => ...` inside a hook body for a pure computation.
- On a fresh task, the component's JSX branches on named booleans returned by the hook or computed by a helper, not on inline array or object chains.

### F-007: A helper name replaces the inline comment that explained the code

- Category: missing-rule
- Severity: low
- Recurrence: repeated
- Confidence: high

#### Scenario

An inline comment narrated why a message was reset before replay; the extracted helper's name carried the same information.

#### Evidence

origin (do not ingest), `features/chat/server-state/mutations/use-resume-stream-mutation.tsx`:

before:

```ts
// GET catch-up includes all prior tokens — clear any stale partial content
updateMessage({ ..., message: resetMessageForStreamReplay });
```

after (commit `f575ce87`):

```ts
updateMessage({ ..., message: (prev) => resetMessageForResume(prev, kind) });
```

The repository's `document-business-logic` skill already forbids narration comments; the extraction made the comment redundant rather than merely forbidden.

#### Current behavior

Both a narration comment and an unnamed inline body existed. The review removed the comment once the helper existed.

#### Preferred behavior

When extracting, spend the naming effort on the helper and delete the inline comment it makes redundant. If a product rule remains that the name cannot carry, place the repository's single business-logic block at the helper's declaration, not at the call site.

skill example (ingest this):

```ts
// Previous
// Server replay resends all tokens, so wipe partial local content first.
update((prev) => ({ ...prev, content: '', widgets: null }));

// Improved
update((prev) => resetForReplay(prev));
```

#### Proposed skill change

Add one sentence to the "Extraction triggers" section: "Delete the narration comment the helper name replaces; route surviving product rules to the documentation skill's block at the helper declaration." Link to `document-business-logic` rather than duplicating its contract.

#### Generalization test

Applies whenever a helper is extracted from commented code. Does not apply to required technical comments (lint suppressions, license, generated-file banners), which stay. Counterexample: `// eslint-disable-next-line` above a helper call remains.

#### Acceptance criteria

- The skill instructs removal of the narration comment made redundant by a new helper name and defers product rules to the documentation skill.
- On a fresh task, the call site of a newly extracted helper has no inline comment restating the helper's name.

## Cross-Cutting Decisions

- Target is a new React Skills workflow, proposed name `extract-named-helpers`, sitting beside `build-composable-components`, `build-forms`, `manage-server-state`, and `document-business-logic`. It owns *when*, *where*, *how named*, and *hook-versus-helper*; it does not own component anatomy, server-state layout, or comments.
- Ownership vocabulary used across findings: **trigger** (chain, duplication, branching callback), **boundary** (flat composition, single caller, one-line fallback stay inline), **placement** (single consumer private, multi-consumer exported from the domain utility module), **contract verb** (`is/has/can/should`, `get`, `create/build`, `reset/begin/to/with`, `handle`), **hook/helper split** (hook owns React state and effects; helper is pure and module-level).
- Order of operations the user approved: hoist duplicated side effects to the decision point first; extract a helper only if duplication survives.
- The review that produced these changes was a second pass. The skill should make the first pass produce them, which is why the triggers and boundaries are proposed as `SKILL.md` contracts rather than reference-only guidance.
- Repository specifics that are *not* part of the proposal: the feature folder names, the `WidgetMessage` type, the store status values, and the rate-limit codes. They are evidence only.

## Validation Requested

- Create `.agents/skills/extract-named-helpers/SKILL.md` with sections: Extraction triggers (F-001), Do not extract (F-002), Placement (F-003), Signature and naming (F-004, F-005), Hooks and helpers (F-006), and one sentence on comments (F-007). Add `references/extraction-triggers.md`, `references/placement.md`, `references/signatures-and-naming.md`, `references/hooks-and-helpers.md` with the skill examples above. Register the skill in the React Skills catalog and bump the shared `VERSION`.
- Cross-link: `build-composable-components` and `manage-server-state` should route "extract a helper" decisions to the new skill instead of adding their own rules.
- Fresh-task prompt (does not name the originating feature): "In a React 19 project with React Compiler and TanStack Query, a `useOrderSync` hook currently checks `['saving', 'syncing', 'uploading'].includes(status)` inside an effect, an `OrderSummary` component computes `order.lines.filter(isTaxable).map(getTax).reduce(...) > 0` inline before rendering a badge, and `utils/order-errors.ts` repeats the same 'is this a stock error' check in two exported functions. Apply `extract-named-helpers`." Expected: one module-level `isSyncingStatus` above the hook; one `hasTaxableLines(order.lines)` helper in the existing order utility module; two private predicates in `order-errors.ts` composed by both exports; no `useMemo`/`useCallback`; `order.lines` not passed alongside `order`; a flat `canSubmit = a && b` left inline; no new `helpers.ts` file.
- Run `node .agents/skills/evolve-skills-from-feedback/scripts/validate-feedback.mjs` on this report, then the repository's skill folder validation once the skill exists.
