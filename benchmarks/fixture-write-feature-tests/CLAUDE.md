# Acme Tasks

React 19 + TypeScript app with Zustand stores and Zod schemas. React Compiler
is enabled in the production build.

- Feature code lives in `src/features/<feature>`; shared code lives in
  `src/lib`, `src/hooks`, and `src/config`.
- Tests use Vitest in a Node environment (`npm test`).
- Validate with `npm run typecheck`; it also type-checks test files. Do not
  install packages.
