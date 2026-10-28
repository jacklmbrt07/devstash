# Current Feature

## Status

Completed

## Goals

## Notes

## History

### Prisma + Neon PostgreSQL setup

- Use Neon PostgreSQL (serverless)
- Install and configure Prisma 7 (breaking changes — follow upgrade/quickstart guides)
- Create initial schema from data models in `@context/project-overview.md` (will evolve)
- Include NextAuth models (Account, Session, VerificationToken)
- Add appropriate indexes and cascade deletes
- Use a development Neon branch for `DATABASE_URL` and keep production separate
- Always create migrations (`prisma migrate`); never `db push` unless specified
- Prisma 7.10.1 with `@prisma/adapter-neon`, `prisma.config.ts`, generated client at `src/generated/prisma`
- Initial migration `20261028040710_init` applied; system item types seeded
- Health check via `GET /api/health/db` and `npm run db:test`

### Dashboard UI Phase 3 — main area content

- The main area to the right
- Recent collections
- Pinned Items
- 10 Recent items
- 4 stats cards at the top for number of items, collections, favorite items and favorite collections (Not in screenshot)
- Use mock data from `@src/lib/mock-data.ts` (import directly until database)
- Match layout to `@context/screenshots/dashboard-ui-main.png`

### Dashboard UI Phase 2 — collapsible sidebar

- Collapsible sidebar
- Items/types with links to /items/TYPE (eg. /items/snippets)
- Favorite collections
- Most recent collections
- User avatar area at the bottom
- Drawer icon to open/close sidebar
- Always a drawer on mobile view
- Use mock data from `@src/lib/mock-data.ts` (import directly until database)
- Match layout to `@context/screenshots/dashboard-ui-main.png`

### Dashboard UI Phase 1 — layout shell

- ShadCN UI initialization and components
- ShadCN component installation
- Dashboard route at `/dashboard`
- Main dashboard layout and any global styles
- Dark mode by default
- Top bar with search and new item button (display only)
- Placeholder for sidebar and main area (`h2` with "Sidebar" and "Main" for now)
