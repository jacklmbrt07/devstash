# Devstash
A project that allows a coder to save snippets.

## Context
read the context to get the full project.

- @context/project-overview.md
- @context/coding-standards.md
- @context/ai-interaction.md
- @context/interactive-feature.md

## Next.js CLI commands

Run via `npx next <command>` or `npm run <script>` where a script exists.

| Command | Description |
| --- | --- |
| `next dev` | Start development mode with hot reload |
| `next build` | Create an optimized production build |
| `next start` | Start the production server (run `next build` first) |
| `next analyze` | Analyze production bundle output (Turbopack only) |
| `next info` | Print system details for bug reports |
| `next typegen` | Generate TypeScript route/page/layout types without a full build |
| `next upgrade` | Upgrade the Next.js app to a desired version |
| `next telemetry` | Enable or disable anonymous telemetry |
| `next experimental-test` | Run `next/experimental/testmode` tests (default runner: Playwright) |
| `next experimental-request-insights` | Inspect Request Insights from a running dev server |
| `next internal` | Internal debugging commands (use with caution) |

Global flags: `-v` / `--version`, `-h` / `--help`.

<!-- BEGIN:nextjs-agent-rules -->


## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Neon

This repo is the Devstash Neon project. For every Neon MCP call, use only this project and the `development` branch unless the user explicitly names a different branch in the current request.

| | |
| --- | --- |
| Org | `org-sparkling-mode-45665111` |
| Project | `hidden-shadow-69551931` |
| Branch name | `development` |
| Branch ID | `br-tiny-rain-arnsmyvi` |
| Database | `neondb` |

Rules:

- Pass `project_id` `hidden-shadow-69551931` on every tool that accepts it. Do not search for, create, describe, or modify any other Neon project.
- Pass `branch_id` `br-tiny-rain-arnsmyvi` and `database_name` `neondb` on every tool that accepts them. Omitting `branch_id` selects the project default branch. Treat that default branch as production and do not use it.
- Before the first Neon MCP call in a session, call `list_branches` for this project and confirm the branch named `development` still has id `br-tiny-rain-arnsmyvi`. If the id changed, use the id returned for the branch named `development`. If that name is missing, stop and ask. Do not fall back to the default branch.
- Production, `main`, and any branch other than `development` are off limits. Do not query, compare, reset, restore, snapshot, delete, or fetch a connection string for them. Do not parent a new branch from them. Do not call `set_default_branch`.
- A new branch is allowed only when the user asks for one. Set `parent_id` to the `development` branch id.
- `prepare_database_migration` and `complete_database_migration` apply through `parent_branch_id`. That parent must be the `development` branch id. For schema changes, prefer this repo's Prisma migration flow against the development `DATABASE_URL`.
- The only exception is an explicit request in the current message that names production or another branch. Words like "the database", "the default branch", or "this project" mean `development`.