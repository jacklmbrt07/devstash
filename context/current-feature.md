# Current Feature: Toast

## Status

In Progress

## Goals

- After registration, a toast tells the user they can now log in
- Use Sonner through the ShadCN toast component
- Only one toast appears when the user has just registered
- The toast is a simple text message, with no image

## Notes

- Spec: `context/features/toast.md`
- Registration already redirects to `/sign-in?registered=1`; the toast should fire on that success path

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

### Auth Setup - NextAuth + GitHub Provider

- NextAuth v5 (`next-auth@beta`) with `@auth/prisma-adapter` and the GitHub provider
- Split config: providers and JWT session in `src/auth.config.ts`, Prisma adapter in `src/auth.ts`
- `src/proxy.ts` redirects unauthenticated `/dashboard` visits to NextAuth's default sign-in page
- Session type includes `user.id`
- Prisma 8 bridge in `src/lib/auth-prisma.ts` so the adapter can use `db.orm`

### Auth Credentials - Email/Password Provider

- Registration hashes passwords with bcryptjs at 12 rounds, and sign-in checks them with `compare`
- `users.password` was already on the User model, so no migration was added
- `auth.config.ts` holds a Credentials provider with `authorize: () => null` for the edge proxy
- `auth.ts` overrides Credentials with bcrypt validation
- `POST /api/auth/register` accepts name, email, password, and confirmPassword
- Passwords must match, an existing email is rejected, and the response is success or error
- Email/password sign-in at `/api/auth/signin` redirects to `/dashboard`
- GitHub OAuth still works

### Auth UI - Sign In, Register & Sign Out

- Custom `/sign-in` page with email, password, a GitHub button, a link to register, and visible validation errors
- `/register` checks that passwords match and the email is valid, posts to `POST /api/auth/register`, and redirects to sign-in
- Sidebar shows the signed-in avatar, name, and email; the avatar goes to `/profile`, and the name opens a menu with Sign out
- `UserAvatar` uses the GitHub image when present, otherwise initials from the name
- Top bar avatar opens a Sign out menu, and sign out returns to `/sign-in`
- Unauthenticated visits to `/dashboard` and `/profile` redirect to `/sign-in`
