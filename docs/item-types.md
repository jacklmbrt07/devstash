# Item Types

DevStash stores every saved resource as an `Item` with one system `ItemType`. The type sets the icon, color, route, and which payload fields matter. The storage shape is the `ContentType` enum on the item: `TEXT`, `FILE`, or `URL`.

System types are seeded with `isSystem: true` and `userId: null`. The unique key is `(name, userId)`, so each system name exists once. Custom types are allowed by the schema (`userId` set, `isSystem` false) and are a planned Pro feature. They are not seeded or shown in the sidebar.

Sources: `src/prisma/contract.prisma`, `src/lib/constants/item-types.ts`, `prisma/seed.ts`, `context/project-overview.md`.

## Classification

| Class | `ContentType` | Types | Payload fields |
| ----- | ------------- | ----- | -------------- |
| Text | `TEXT` | snippet, prompt, note, command | `content`, optional `language` |
| File | `FILE` | file, image | `fileUrl`, `fileName`, `fileSize` |
| URL | `URL` | link | `url` |

`content` is the body for text types. `language` is a syntax-highlighting hint (seeded as `typescript`, `yaml`, or `bash`). File fields are the Cloudflare R2 object: URL, original filename, and size in bytes. `url` is the saved address for links.

Seed data only creates text and URL items. `note`, `file`, and `image` exist as types, with no demo items. The seed `SeedItem` shape sets `content`, `url`, and `language`. It does not set `fileUrl`, `fileName`, or `fileSize`.

File and image are Pro-only (`PRO_ITEM_TYPES` in `src/lib/constants/item-types.ts`). The sidebar shows a `PRO` badge on those two. Free accounts are specified to keep snippet, prompt, command, note, and link. Pro gating is specified to stay off during development.

## Shared properties

Every item, regardless of type:

| Field | Role |
| ----- | ---- |
| `title` | Display name |
| `description` | Short summary under the title |
| `contentType` | `TEXT`, `FILE`, or `URL` |
| `isFavorite` | Star |
| `isPinned` | Pin above recent items |
| `language` | Optional; used by snippet and command |
| `createdAt`, `updatedAt` | Timestamps |
| `userId` | Owner |
| `itemTypeId` | Type row |
| tags | Many-to-many via `ItemTag` |
| collections | Many-to-many via `ItemCollection` |

Every type row:

| Field | Role |
| ----- | ---- |
| `name` | Lowercase key (`snippet`, `prompt`, …) |
| `icon` | Lucide component name (`Code`, `Sparkles`, …) |
| `color` | Hex accent, also mirrored in `ITEM_TYPE_COLORS` |
| `isSystem` | `true` for the seven built-in types |
| `userId` | `null` for system types |

Deleting a type is restricted while items still reference it (`onDelete: Restrict` on `Item.itemType`).

## Display

Icons resolve from `ITEM_TYPE_ICONS` by type name. Rendered color comes from the `item_types.color` column (the same hex values as `ITEM_TYPE_COLORS`).

Labels are the pluralized name with the first letter capitalized (`getItemTypeLabel`): Snippets, Prompts, Commands, Notes, Files, Images, Links. Routes are `/items/{name}s` (`getItemTypeHref`). Those list routes are not implemented yet; there is no `src/app` page under `/items`.

Current surfaces use one layout for every type:

- **Sidebar** (`dashboard-sidebar.tsx`), in this order: snippet, prompt, command, note, file, image, link. Each row is the Lucide icon in the type color, the plural label, the user’s count, and `PRO` on file and image.
- **Dashboard item rows** (`dashboard-main.tsx`): colored left border, tinted icon, title, description, tags, pin, and star. The row does not render `content`, `url`, or file fields.
- **Collection cards**: a small tinted icon for each type present in the collection.
- **Profile** (`profile.ts`): counts per system type, ordered snippet, prompt, note, command, link, file, image.

Specified, not built yet: a markdown editor for text types, syntax highlighting from `language`, file upload for file and image, and a distinct URL presentation for links. The project overview also lists CSS variables (`--color-snippet`, and the rest). Those variables are not in the app stylesheet; color is applied inline from the database value.

## Types

### Snippet

| | |
| --- | --- |
| Name | `snippet` |
| Icon | `Code` |
| Color | `#3b82f6` (blue) |
| Class | Text |
| Route | `/items/snippets` |
| Purpose | Reusable code: hooks, patterns, config, boilerplates |

Key fields: `content`, `language`. Seed examples use `typescript` and `yaml`.

### Prompt

| | |
| --- | --- |
| Name | `prompt` |
| Icon | `Sparkles` |
| Color | `#8b5cf6` (purple) |
| Class | Text |
| Route | `/items/prompts` |
| Purpose | Saved AI prompts: reviews, docs, refactors, system instructions |

Key field: `content`. Seed prompts do not set `language`. Pro AI features (auto-tag, explain, prompt optimizer) are specified to target this type and are not implemented in the item model.

### Note

| | |
| --- | --- |
| Name | `note` |
| Icon | `StickyNote` |
| Color | `#fde047` (yellow) |
| Class | Text |
| Route | `/items/notes` |
| Purpose | Markdown notes, explanations, and documentation that are not code |

Key field: `content`. No demo notes are seeded. The overview specifies the markdown editor for this type along with the other text types.

### Command

| | |
| --- | --- |
| Name | `command` |
| Icon | `Terminal` |
| Color | `#f97316` (orange) |
| Class | Text |
| Route | `/items/commands` |
| Purpose | Shell commands and short scripts kept out of shell history |

Key fields: `content`, `language`. Seed examples set `language` to `bash`, from one-liners (`git reset --soft HEAD~1`) to short scripts.

### File

| | |
| --- | --- |
| Name | `file` |
| Icon | `File` |
| Color | `#6b7280` (gray) |
| Class | File |
| Route | `/items/files` |
| Access | Pro |
| Purpose | Uploaded context files and other non-image documents |

Key fields: `fileUrl`, `fileName`, `fileSize`. Storage is specified as Cloudflare R2. No upload UI or seed items exist yet.

### Image

| | |
| --- | --- |
| Name | `image` |
| Icon | `Image` |
| Color | `#ec4899` (pink) |
| Class | File |
| Route | `/items/images` |
| Access | Pro |
| Purpose | Uploaded images (screenshots, diagrams, references) |

Key fields: `fileUrl`, `fileName`, `fileSize`, same as file. The type is separate so the sidebar, color, and future preview can differ from generic files. No upload UI or seed items exist yet.

### Link

| | |
| --- | --- |
| Name | `link` |
| Icon | `Link` |
| Color | `#10b981` (emerald) |
| Class | URL |
| Route | `/items/links` |
| Purpose | Bookmarks: docs, libraries, and references |

Key field: `url`. Seed examples point at Docker, GitHub Actions, Tailwind, shadcn/ui, Radix, and Lucide. `content` is left null.
