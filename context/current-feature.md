# Current Feature

## Status

Not Started

## Goals

<!-- Feature goals -->

## Notes

<!-- Spec notes / constraints -->

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

### Toast

- After registration, one Sonner toast says "You can now log in"
- The ShadCN toaster is mounted in the root layout and uses the app's dark theme
- The sign-in page shows that toast when `registered=1`, using a stable id so it appears once
- The message is text only, with no image

### Email verification on register (Resend)

- Registration creates a `VerificationToken` and emails a `/verify-email?token=…` link via Resend (`RESEND_API_KEY`, optional `EMAIL_FROM`)
- Verify page sets `User.emailVerified`, consumes the token, and shows success / already verified / expired / invalid states
- Credentials sign-in blocks unverified users with a clear message; GitHub OAuth is unchanged
- Post-register toast asks users to check their email
- Development-only `npm run db:cleanup-users` deletes all non-demo users and their content (`NEON_BRANCH=development` required)

### Toggle email verification

- `EMAIL_VERIFICATION_ENABLED=false` skips the verification token and Resend send, marks the new account verified, and lets unverified accounts sign in
- Any other value keeps the Resend flow: email the link, roll the account back if the send fails, and block unverified credentials sign-in
- The post-register toast follows the flag: "Check your email to verify your account" when on, "You can now log in" when off
- Local `.env` sets the flag to `false` until a domain is linked to Resend
- Verification token rows are deleted with SQL because `verification_tokens` has no primary key

### Forgot password

- Sign-in links to `/forgot-password`, which always shows the same confirmation
- A credentials account gets a `VerificationToken` with identifier `reset:<email>` and a Resend link to `/reset-password?token=…` that expires in 1 hour
- `/reset-password` rejects invalid, expired, and used links, hashes the new password with bcryptjs at 12 rounds, and deletes the token
- Unknown emails and accounts with no password get the same confirmation and no email
- A successful reset returns to `/sign-in` with a one-time success toast
- Email verification still uses a 24-hour token and ignores reset identifiers

### Profile Page

- `/profile` is protected and rendered in the dashboard shell for the signed-in user
- The page shows name, GitHub avatar or initials, and a card labeled Email and Member since
- Usage stats include total items, total collections, and a count for every system item type
- Email accounts can change their password after confirming the current one; GitHub-only accounts do not see that action
- Delete account asks for confirmation, removes the user, and signs out
- The top-right avatar links to `/profile`; sign out stays on the sidebar name

### Rate Limiting for Auth

- Sliding-window limits use Upstash Redis in `src/lib/rate-limit.ts` and fail open when Redis is unavailable
- Login is 5 attempts per 15 minutes by IP + email; register and forgot password are 3 per hour by IP; reset password is 5 per 15 minutes by IP; resend verification is 3 per 15 minutes by IP + email
- The client IP is the last `x-forwarded-for` address, which is the one Vercel appends
- Over-limit API responses are 429 with `Retry-After` and a toast on the auth forms
- Sign-in can resend the verification email when the account is unverified

### Items List View

- `/items/[type]` lists the demo user's items for that type inside the dashboard shell
- Sidebar links such as `/items/snippets` and `/items/notes` open the page; an unknown slug returns 404
- Item cards sit in one column by default and two columns from the medium breakpoint up
- Each card's left border uses the item type color
- Signed-out visits redirect to `/sign-in`; a type with no items shows an empty state

### Item Drawer

- A right-side sheet opens from a dashboard row or an items-list card, with no separate item page
- Full item detail loads on click from `GET /api/items/[id]` after an auth check; the query is `getItemById` in `src/lib/db/items.ts`
- The drawer shows a skeleton while that request runs, then type, language, title, description, collections, content, file name, and URL
- The action bar is Favorite (yellow star when already favorited), Pin, Copy, Delete, and Edit
- Copy writes the content, URL, or title to the clipboard; favorite, pin, edit, and delete stay visual until a later pass

### Item Drawer — Edit Mode

- Edit in the open drawer switches to inline fields; Save and Cancel replace the action bar
- Save runs `updateItem` in `src/actions/items.ts`, which checks the session, confirms ownership, and validates with Zod
- The database update in `src/lib/db/items.ts` saves the fields, removes existing tag links, and connects or creates the new tags
- Title, description, and tags are editable on every type; content, language, and URL appear only for the types that use them
- The type, collections, and dates stay read-only; Save is disabled while the title is empty
- A successful save refreshes the drawer from the returned item, shows a toast, and calls `router.refresh()` so the card list updates

### Delete Item

- The drawer Delete button opens a shadcn AlertDialog and nothing is removed until the user confirms
- Confirming runs `deleteItem` in `src/actions/items.ts`, which checks the session, confirms ownership, and deletes through `src/lib/db/items.ts`
- A success toast appears after the item is deleted, the drawer closes, and `router.refresh()` updates the dashboard and items list
- A failed delete shows an error toast and leaves the item in place

### Item Create

- The top-bar New item button opens a shadcn Dialog
- The type selector covers snippet, prompt, command, note, and link
- Title, description, and tags show for every type; snippet and command also show content and language; prompt and note show content; link requires a URL
- `createItem` in `src/actions/items.ts` checks the session and validates with Zod
- The query in `src/lib/db/items.ts` creates the item for the signed-in user and links tags
- A success toast closes the dialog and `router.refresh()` updates the list

### Code Editor

- Snippets and commands use a Monaco `CodeEditor` with a dark theme in create, drawer view, and drawer edit
- Notes, prompts, and other non-code types keep the existing textarea or plain content display
- The editor chrome includes macOS window dots, the language label, and a quick copy button
- Height grows with content up to 400px, with a theme-matching scrollbar for overflow
- Helpers live in `src/lib/items/code-editor.ts` with Vitest coverage for type checks, language aliases, and height

### Markdown Editor

- Notes and prompts use a `MarkdownEditor` with Write/Preview tabs in create, drawer view, and drawer edit
- `react-markdown` + `remark-gfm` render GitHub Flavored Markdown; preview styles live under `.markdown-preview`
- Editor chrome matches the code editor (dark theme, copy button, fluid height up to 400px)
- Readonly mode shows Preview only; edit mode defaults to Write
- Snippets and commands stay on `CodeEditor`; Field wrappers no longer use `<label>` around editors so clicks type instead of copying
- `/collections` and `/collections/[id]` pages list collections and their items so dashboard and sidebar links no longer 404

### File Upload with Cloudflare R2

- Upload API stores objects in R2 and returns `fileUrl`, `fileName`, and `fileSize`
- Download proxy streams files for the signed-in owner to avoid CORS issues
- `FileUpload` supports drag-and-drop, progress, image preview, and file info
- Create dialog adds file and image types with the shared upload component
- Deleting an item also removes its R2 object; the drawer shows a download action for file types
- DB writes stay in `src/lib/db/items.ts`; validation helpers live in `src/lib/items/file-upload.ts`

### File List View

- `/items/files` and `/items/images` use a single-column list instead of the card grid
- Each row shows an extension-based icon, file name, size, upload date, and download button
- Row click opens ItemDrawer; download stops propagation and hits `/api/download/[id]`
- Mobile stacks name, size, and date vertically; other item types keep the card grid
- Helpers live in `src/lib/items/file-display.ts` with Vitest coverage; `DashboardItem` includes file metadata

### Image Gallery View

- `/items/images` uses a thumbnail gallery instead of the file list or item cards
- `ImageThumbnailCard` shows a 16:9 (`aspect-video`) preview with `object-cover` and a 5% hover zoom (300ms)
- Gallery is one column on small screens, two from `md`, three from `lg`
- Click opens ItemDrawer; `/items/files` stays on the Drive-style list
- `DashboardItem` includes `fileUrl` so list queries can render R2 thumbnails

### Audit Fixes Pack

- Shared `BCRYPT_ROUNDS` in `src/lib/auth/bcrypt.ts` for register, reset, profile, and seed
- `debounce` utility with Vitest coverage for upcoming interactive search
- Link and file URLs require http(s) via Zod; the drawer only renders safe external `href`s
- `next/image` is configured for the R2 public host; gallery, drawer, and upload use `RemoteImage`
- `POST /api/upload` is rate-limited to 30 requests per hour per authenticated user

### Collection Create

- Top-bar New collection button opens a shadcn Dialog with name and optional description
- `createCollection` in `src/actions/collections.ts` checks the session and validates with Zod
- The query in `src/lib/db/collections.ts` creates the collection for the signed-in user
- Collection list, detail, sidebar, and stats helpers take `userId` from the session (no demo-user stand-in)
- A success toast closes the dialog and `router.refresh()` updates the UI

### Add Items To Collections

- New and edit item forms include a collection multi-select (zero, one, or many)
- `collectionIds` is validated in create/update Zod schemas and written via `replaceItemCollections`
- Options load through `listCollectionOptions` for the signed-in user
- Collection pages were left unchanged
