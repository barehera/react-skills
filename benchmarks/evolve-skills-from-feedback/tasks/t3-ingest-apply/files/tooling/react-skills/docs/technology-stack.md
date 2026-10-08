# Technology stack

Skills in this catalog assume React 19, TypeScript, shadcn/ui on Radix
primitives, Tailwind CSS v4, TanStack Query for server state, and scoped
Zustand stores for local shared state.

Consumer projects differ in build setup. Some enable React Compiler, others do
not; skills must not assume either unless they say so.

Every rule and example belongs to one layer:

- **primitive**: shadcn/Radix files and `cn`;
- **composable family**: a compound root and its parts;
- **feature adapter**: screens, queries, mutations, permissions, and copy.

Dependencies point downward only.
