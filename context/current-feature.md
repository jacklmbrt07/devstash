# Current Feature: Auth Setup - NextAuth + GitHub Provider

## Status

In Progress

## Goals

- Install NextAuth v5 (`next-auth@beta`) and `@auth/prisma-adapter`
- Set up the split auth config pattern for edge compatibility
- Add the GitHub OAuth provider
- Protect `/dashboard/*` routes using the Next.js 16 proxy
- Redirect unauthenticated users to sign-in

## Notes

Source: `context/features/auth-spec-files/auth-phase-1-spec.md`

Set up NextAuth v5 with the Prisma adapter and GitHub OAuth. Use NextAuth's default pages for testing.

### Files to create

1. `src/auth.config.ts` — Edge-compatible config (providers only, no adapter)
2. `src/auth.ts` — Full config with Prisma adapter and JWT strategy
3. `src/app/api/auth/[...nextauth]/route.ts` — Export handlers from `auth.ts`
4. `src/proxy.ts` — Route protection with redirect logic
5. `src/types/next-auth.d.ts` — Extend Session type with `user.id`

### Key gotchas

Use Context7 to verify the newest config and conventions.

- Use `next-auth@beta` (not `@latest`, which installs v4)
- Proxy file must be at `src/proxy.ts` (same level as `app/`)
- Use named export: `export const proxy = auth(...)`, not a default export
- Use `session: { strategy: 'jwt' }` with the split config pattern
- Don't set a custom `pages.signIn` — use NextAuth's default page

### Environment variables

```
AUTH_SECRET=
AUTH_GITHUB_ID=
AUTH_GITHUB_SECRET=
```

### Testing

1. Go to `/dashboard` — should redirect to sign-in
2. Click "Sign in with GitHub"
3. Verify redirect back to `/dashboard` after auth

### References

- Edge compatibility: https://authjs.dev/getting-started/installation#edge-compatibility
- Prisma adapter: https://authjs.dev/getting-started/adapters/prisma

## History

### Stats and sidebar

- Stats cards keep the current layout and read item, collection, and favorite counts from the database
- Sidebar system item types, icons, and counts load from Neon via `getSidebarItemTypes` in `src/lib/db/items.ts`
- Type links go to `/items/[type]` (for example `/items/snippets`)
- Favorite collections keep the star; recent collections show a colored circle from the most-used item type
- "View all collections" under the collections list goes to `/collections`
- Sidebar user area stays on mock data until authentication

### Dashboard items

- Pinned and recent items load from Neon via Prisma (`src/lib/db/items.ts`), fetched in the dashboard server component
- Pinned section is hidden when `demo@devstash.io` has no pinned items
- Up to 10 most recently updated items
- Icon, left border, and type label come from the item type; tags show when present
- Item and favorite-item stats come from the database
- Sidebar stays on mock data

### Dashboard collections

- Recent collection cards load from Neon via Prisma (`src/lib/db/collections.ts`), fetched in the dashboard server component
- Up to 6 most recently updated collections for `demo@devstash.io`
- Card border color from the most-used item type; icons for every type in the collection
- Collections and favorite-collections stats come from the database
- Pinned items, recent items, and the sidebar stay on mock data

### Seed data script

- Seed script at `prisma/seed.ts` (`npm run db:seed`)
- Demo user: `demo@devstash.io` / `12345678` (bcryptjs, 12 rounds)
- System item types: snippet, prompt, command, note, file, image, link
- 5 collections with 18 sample items (React Patterns, AI Workflows, DevOps, Terminal Commands, Design Resources)
- Idempotent: upserts user/types; skips existing collections by name

### Prisma + Neon PostgreSQL setup

- Use Neon PostgreSQL (serverless)
- Install and configure **Prisma 8** (`@prisma/orm-postgres` + `contract.prisma`)
- Create initial schema from data models in `@context/project-overview.md` (will evolve)
- Include NextAuth models (Account, Session, VerificationToken)
- Add appropriate indexes and cascade deletes
- Use a development Neon branch for `DATABASE_URL` and keep production separate
- Always create migrations (`prisma migration plan` / `prisma db migrate`); never `db push` unless specified
- Contract at `src/prisma/contract.prisma`; client at `src/prisma/db.ts`
- Baseline signed on Neon `development`; legacy Prisma 7 SQL kept under `prisma/legacy/`
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

### Add Pro badge to sidebar

- Files and Images in the sidebar show a ShadCN Badge labeled `PRO`
- The badge stays small, with a light amber outline so it reads as a marker
- Other sidebar types are unchanged
- The collapsed sidebar hides the badge along with the type label

### Low-risk audit fixes

- `GET /api/health/db` logs database failures on the server and responds with `{ ok: false }` only, with no driver error text or `NEON_BRANCH`
- `formatRelativeTime` says "Yesterday" only for the previous calendar day; other times in the 24–48 hour range use the day-count label
- Below 1024px, the sidebar button is named "Open navigation" or "Close navigation", and `aria-expanded` matches the sheet
