# Item CRUD Architecture

One create, update, and delete path covers all seven item types. The server action writes a single `Item` row. The page reads through `src/lib/db`. The route is one dynamic segment, and the form body changes by content class.

Nothing under `src/app/items` exists yet. Sidebar links already call `getItemTypeHref`, which returns `/items/${name}s`.

`docs/content-types.md` and `prisma/schema.prisma` are not in the repo. Type behavior is in `docs/item-types.md`. The live schema is `src/prisma/contract.prisma`. Icons, colors, Pro types, and hrefs are in `src/lib/constants/item-types.ts`.

## Split of responsibility

| Layer | Owns | Does not own |
| ----- | ---- | ------------ |
| `src/actions/items.ts` | Auth, ownership, one write shape, clearing unused columns | Editors, previews, language pickers, file vs image chrome |
| `src/lib/db/items.ts` | Reads for the signed-in user | Mutations |
| `src/app/items/[type]/page.tsx` | Auth redirect, slug check, fetch, shell | Field widgets |
| `src/components/items/` | List, drawer, and the body that changes by type | Database writes |
| `src/lib/constants/item-types.ts` | Slug, label, icon, color, Pro set, type → `ContentType` | Persistence |

Type-specific behavior stays in components. The action does not branch into seven create functions. It looks up the content class from a shared map and writes the columns for that class.

```ts
const ITEM_CONTENT_CLASS = {
  snippet: "TEXT",
  prompt: "TEXT",
  note: "TEXT",
  command: "TEXT",
  file: "FILE",
  image: "FILE",
  link: "URL",
} as const;
```

The client sends `type` (the singular name). The action sets `contentType` from this map. A tampered form cannot store a snippet as `FILE` or keep a stale `url` on a note. Columns outside the class are saved as `null`.

| Class | Written | Cleared |
| ----- | ------- | ------- |
| `TEXT` | `content`, `language` | `fileUrl`, `fileName`, `fileSize`, `url` |
| `FILE` | `fileUrl`, `fileName`, `fileSize` | `content`, `language`, `url` |
| `URL` | `url` | `content`, `language`, `fileUrl`, `fileName`, `fileSize` |

`language` is optional. The text body shows the language field only for `snippet` and `command`. The action still accepts it on any text type and ignores it for file and link.

## File structure

```
src/actions/items.ts
src/lib/db/items.ts
src/lib/constants/item-types.ts
src/app/items/[type]/page.tsx
src/app/api/upload/route.ts
src/components/items/item-list.tsx
src/components/items/item-drawer.tsx
src/components/items/item-body.tsx
src/components/items/text-body.tsx
src/components/items/file-body.tsx
src/components/items/link-body.tsx
```

`src/lib/db/items.ts` already loads the dashboard (pinned, recent, sidebar counts, stats) for the demo user. New reads take the session user id from the page. They do not call the demo-user helper.

File bytes do not go through the item action. Coding standards put uploads on an API route. `POST /api/upload` stores the object and returns `fileUrl`, `fileName`, and `fileSize`. The drawer puts those values in the form. `createItem` and `updateItem` only persist them.

## Routing

`src/app/items/[type]/page.tsx` is the only item route. `[type]` is the plural slug the sidebar already builds:

| Slug | Type name |
| ---- | --------- |
| `snippets` | `snippet` |
| `prompts` | `prompt` |
| `commands` | `command` |
| `notes` | `note` |
| `files` | `file` |
| `images` | `image` |
| `links` | `link` |

Resolve with a helper next to `getItemTypeHref`: drop the trailing `s`, then require the name to be a key of `ITEM_TYPE_ICONS`. Anything else calls `notFound()`.

This page sits outside `src/app/dashboard/layout.tsx`. Wrap it in `DashboardShell` the same way `src/app/profile/page.tsx` does: `auth()`, redirect to `/sign-in` when there is no user id, then load sidebar types and collections in parallel with the item query.

The open item is a search param on the same route, so the server component can load it:

| URL | What the page renders |
| --- | --------------------- |
| `/items/snippets` | List only |
| `/items/snippets?item=new` | List plus an empty drawer |
| `/items/snippets?item=<id>` | List plus the drawer for that id |

`getItemForUser(userId, id)` must match both `userId` and the type in the slug. A mismatched or missing id is a closed drawer, not another user's item.

Closing the drawer navigates back to `/items/[type]` with the search param removed. Create and edit do not get their own segments.

## Queries

Called from the page, not from the action file:

| Function | Returns |
| -------- | ------- |
| `getItemsByType(userId, typeName)` | Rows for the list: id, title, description, favorite, pin, updatedAt, tags, type name, type color. Ordered pinned first, then `updatedAt` desc. |
| `getItemForUser(userId, id)` | The drawer payload, including `content`, `language`, `url`, `fileUrl`, `fileName`, `fileSize`, tag names, and collection ids. |
| `getItemFormOptions(userId)` | The user's collections, for the drawer multi-select. |

List rows stay light. The full body loads only when `item` is set.

## Mutations

`src/actions/items.ts` exports three actions. Each follows the profile actions: `"use server"`, `auth()` for the user id, `try/catch`, and `{ success: boolean; error?: string }`.

| Action | Effect |
| ------ | ------ |
| `createItem` | Insert one `Item` for the session user and the resolved system type. Attach tags and collections. |
| `updateItem` | Same write, scoped with `where: { id, userId }`. Replace tag and collection links. |
| `deleteItem` | Delete scoped with `where: { id, userId }`. `ItemCollection` and `ItemTag` cascade. |

Shared form fields: `title`, `description`, `isFavorite`, `isPinned`, `type`, collection ids, tag names. Payload fields depend on the class table above. Title is required. The system type is the row with that name, `isSystem: true`, and `userId: null`.

Favorite and pin are fields on update, not separate actions.

When Pro gating is turned on, `createItem` and `updateItem` reject `file` and `image` unless `user.isPro` is true. Until then they stay open, matching the product note that gating is off in development. The sidebar badge already uses `PRO_ITEM_TYPES`; the action should use that same set.

After a successful write, revalidate `/items/[type]`, `/dashboard`, and `/profile`. Those three surfaces read item counts or lists.

The drawer submits with `useActionState`, shows `state.error`, and toasts on `state.success`, same as `change-password-dialog.tsx`. Zod is the validation standard in `context/coding-standards.md` and is not a dependency yet. Keep the manual checks used by the profile actions until Zod is added. Validate on the server either way.

## Components

| Component | Responsibility |
| --------- | -------------- |
| Page | Session gate, slug → type, parallel fetch, `DashboardShell`, heading from `getItemTypeLabel` and `ITEM_TYPE_ICONS`. "New" links to `?item=new`. |
| `item-list.tsx` | One row per item: color bar, icon, title, description, tags, pin, star. Row links to `?item=<id>`. Empty state for a type with no rows. |
| `item-drawer.tsx` | Shared fields: title, description, collections, tags, favorite, pin, save, delete. Renders `item-body`. Delete uses a confirm dialog, then `deleteItem`. No type switcher; the slug fixes the type. |
| `item-body.tsx` | Picks `text-body`, `file-body`, or `link-body` from `ITEM_CONTENT_CLASS`. |
| `text-body.tsx` | Markdown or code editor bound to `content`. Language control only when the type is `snippet` or `command`. |
| `file-body.tsx` | Calls `/api/upload`, then fills `fileUrl`, `fileName`, and `fileSize`. `image` accepts images and shows a preview. `file` accepts other documents and shows the filename and size. |
| `link-body.tsx` | Single `url` field. |

`prompt` and `note` share `text-body` with no language field. `file` and `image` share `file-body` and differ by the `accept` filter and whether a preview is shown. That is the whole type split.
