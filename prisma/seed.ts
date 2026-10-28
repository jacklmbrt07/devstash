import { hash } from "bcryptjs";
import { config } from "dotenv";

import type { Db } from "../src/prisma/db";

config({ path: ".env.local" });
config({ path: ".env", override: true });

const DEMO_USER = {
  email: "demo@devstash.io",
  name: "Demo User",
  password: "12345678",
  isPro: false,
} as const;

const systemItemTypes = [
  { name: "snippet", icon: "Code", color: "#3b82f6", isSystem: true as const },
  { name: "prompt", icon: "Sparkles", color: "#8b5cf6", isSystem: true as const },
  { name: "command", icon: "Terminal", color: "#f97316", isSystem: true as const },
  { name: "note", icon: "StickyNote", color: "#fde047", isSystem: true as const },
  { name: "file", icon: "File", color: "#6b7280", isSystem: true as const },
  { name: "image", icon: "Image", color: "#ec4899", isSystem: true as const },
  { name: "link", icon: "Link", color: "#10b981", isSystem: true as const },
];

type ContentType = "TEXT" | "FILE" | "URL";
type ItemTypeName = (typeof systemItemTypes)[number]["name"];

interface SeedItem {
  title: string;
  description: string;
  type: ItemTypeName;
  contentType: ContentType;
  content?: string;
  url?: string;
  language?: string;
  isFavorite?: boolean;
  isPinned?: boolean;
}

interface SeedCollection {
  name: string;
  description: string;
  isFavorite?: boolean;
  items: SeedItem[];
}

const seedCollections: SeedCollection[] = [
  {
    name: "React Patterns",
    description: "Reusable React patterns and hooks",
    isFavorite: true,
    items: [
      {
        title: "useDebounce & useLocalStorage hooks",
        description: "Custom hooks for debounced values and persisted local state.",
        type: "snippet",
        contentType: "TEXT",
        language: "typescript",
        isPinned: true,
        isFavorite: true,
        content: `import { useEffect, useState } from "react";

export function useDebounce<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);

  return debounced;
}

export function useLocalStorage<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(() => {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : initial;
  });

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue] as const;
}`,
      },
      {
        title: "Compound component + Context provider",
        description: "Pattern for flexible compound components with shared context.",
        type: "snippet",
        contentType: "TEXT",
        language: "typescript",
        content: `import { createContext, useContext, type ReactNode } from "react";

type TabsContextValue = { active: string; setActive: (id: string) => void };

const TabsContext = createContext<TabsContextValue | null>(null);

function useTabs() {
  const ctx = useContext(TabsContext);
  if (!ctx) throw new Error("Tabs.* must be used within <Tabs>");
  return ctx;
}

export function Tabs({
  value,
  onChange,
  children,
}: {
  value: string;
  onChange: (id: string) => void;
  children: ReactNode;
}) {
  return (
    <TabsContext.Provider value={{ active: value, setActive: onChange }}>
      {children}
    </TabsContext.Provider>
  );
}

Tabs.List = function TabsList({ children }: { children: ReactNode }) {
  return <div role="tablist">{children}</div>;
};

Tabs.Tab = function TabsTab({ id, children }: { id: string; children: ReactNode }) {
  const { active, setActive } = useTabs();
  return (
    <button role="tab" aria-selected={active === id} onClick={() => setActive(id)}>
      {children}
    </button>
  );
};`,
      },
      {
        title: "Typed debounce utility",
        description: "Generic debounce helper with cancel support.",
        type: "snippet",
        contentType: "TEXT",
        language: "typescript",
        content: `export function debounce<T extends (...args: unknown[]) => void>(
  fn: T,
  delay: number
) {
  let timer: ReturnType<typeof setTimeout> | null = null;

  const debounced = (...args: Parameters<T>) => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };

  debounced.cancel = () => {
    if (timer) clearTimeout(timer);
  };

  return debounced;
}`,
      },
    ],
  },
  {
    name: "AI Workflows",
    description: "AI prompts and workflow automations",
    items: [
      {
        title: "Code review prompt",
        description: "Structured review checklist for pull requests.",
        type: "prompt",
        contentType: "TEXT",
        isFavorite: true,
        isPinned: true,
        content: `Review this PR for correctness, edge cases, naming, and missing tests.

Output format:
1. Summary (2 sentences)
2. Risks (ordered by severity)
3. Suggested fixes (concrete patches when possible)
4. Test gaps`,
      },
      {
        title: "Documentation generation",
        description: "Prompt to turn code into clear API docs.",
        type: "prompt",
        contentType: "TEXT",
        content: `Write documentation for the following code.

Include:
- One-sentence purpose
- Public API (params, return, throws)
- Usage example
- Edge cases and limitations

Keep the tone concise and developer-facing.`,
      },
      {
        title: "Refactoring assistance",
        description: "Prompt for safe incremental refactors.",
        type: "prompt",
        contentType: "TEXT",
        content: `Propose a refactor for this code.

Constraints:
- Preserve behavior
- Prefer small, reviewable steps
- Call out any risk of breaking changes
- Suggest tests to lock current behavior before refactoring`,
      },
    ],
  },
  {
    name: "DevOps",
    description: "Infrastructure and deployment resources",
    isFavorite: true,
    items: [
      {
        title: "Dockerfile + CI workflow",
        description: "Minimal Node Dockerfile and GitHub Actions deploy job.",
        type: "snippet",
        contentType: "TEXT",
        language: "yaml",
        content: `# Dockerfile
FROM node:22-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

FROM node:22-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
EXPOSE 3000
CMD ["npm", "start"]

# .github/workflows/deploy.yml
name: Deploy
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm
      - run: npm ci
      - run: npm run build
      - run: npm run db:migrate:apply`,
      },
      {
        title: "Blue-green deploy script",
        description: "Simple deployment switch between blue and green slots.",
        type: "command",
        contentType: "TEXT",
        language: "bash",
        content: `#!/usr/bin/env bash
set -euo pipefail

ACTIVE=$(cat /var/www/active)
TARGET=$([ "$ACTIVE" = "blue" ] && echo green || echo blue)

rsync -a --delete ./dist/ "/var/www/$TARGET/"
ln -sfn "/var/www/$TARGET" /var/www/current
echo "$TARGET" > /var/www/active
systemctl reload nginx`,
      },
      {
        title: "Docker Docs — Compose",
        description: "Official Docker Compose documentation.",
        type: "link",
        contentType: "URL",
        url: "https://docs.docker.com/compose/",
      },
      {
        title: "GitHub Actions Docs",
        description: "Workflow syntax and deployment guides.",
        type: "link",
        contentType: "URL",
        url: "https://docs.github.com/en/actions",
      },
    ],
  },
  {
    name: "Terminal Commands",
    description: "Useful shell commands for everyday development",
    items: [
      {
        title: "Undo last commit (keep changes)",
        description: "Soft reset the last commit while keeping changes staged.",
        type: "command",
        contentType: "TEXT",
        language: "bash",
        isPinned: true,
        content: "git reset --soft HEAD~1",
      },
      {
        title: "Docker cleanup",
        description: "Prune unused images, containers, and volumes.",
        type: "command",
        contentType: "TEXT",
        language: "bash",
        isFavorite: true,
        content: "docker system prune -af --volumes",
      },
      {
        title: "Kill process on port",
        description: "Find and kill whatever is listening on a given port.",
        type: "command",
        contentType: "TEXT",
        language: "bash",
        content: "lsof -ti:3000 | xargs kill -9",
      },
      {
        title: "Reinstall node_modules cleanly",
        description: "Remove lock-adjacent install artifacts and reinstall.",
        type: "command",
        contentType: "TEXT",
        language: "bash",
        content: "rm -rf node_modules && npm ci",
      },
    ],
  },
  {
    name: "Design Resources",
    description: "UI/UX resources and references",
    items: [
      {
        title: "Tailwind CSS Docs",
        description: "Utility-first CSS framework reference.",
        type: "link",
        contentType: "URL",
        url: "https://tailwindcss.com/docs",
        isFavorite: true,
      },
      {
        title: "shadcn/ui",
        description: "Copy-paste component library for React.",
        type: "link",
        contentType: "URL",
        url: "https://ui.shadcn.com/",
      },
      {
        title: "Radix Themes",
        description: "Design system primitives and theming.",
        type: "link",
        contentType: "URL",
        url: "https://www.radix-ui.com/themes/docs/overview/getting-started",
      },
      {
        title: "Lucide Icons",
        description: "Open-source icon library used across the app.",
        type: "link",
        contentType: "URL",
        url: "https://lucide.dev/icons/",
      },
    ],
  },
];

async function seedDemoUser(db: Db) {
  console.log("Seeding demo user...");

  const passwordHash = await hash(DEMO_USER.password, 12);
  const emailVerified = new Date().toISOString().replace(/Z$/, "");

  const existing = await db.orm.public.User.where({
    email: DEMO_USER.email,
  }).first();

  if (existing) {
    await db.orm.public.User.where({ id: existing.id }).update({
      name: DEMO_USER.name,
      password: passwordHash,
      isPro: DEMO_USER.isPro,
      emailVerified,
    });
    console.log(`Updated demo user: ${DEMO_USER.email}`);
    return existing.id;
  }

  const created = await db.orm.public.User.create({
    email: DEMO_USER.email,
    name: DEMO_USER.name,
    password: passwordHash,
    isPro: DEMO_USER.isPro,
    emailVerified,
  });
  console.log(`Created demo user: ${DEMO_USER.email}`);
  return created.id;
}

async function seedSystemItemTypes(db: Db) {
  console.log("Seeding system item types...");

  for (const type of systemItemTypes) {
    const existing = await db.orm.public.ItemType.where({
      name: type.name,
      isSystem: true,
    })
      .where((row) => row.userId.isNull())
      .first();

    if (existing) {
      await db.orm.public.ItemType.where({ id: existing.id }).update({
        icon: type.icon,
        color: type.color,
        isSystem: true,
      });
      continue;
    }

    await db.orm.public.ItemType.create({
      name: type.name,
      icon: type.icon,
      color: type.color,
      isSystem: true,
      userId: null,
    });
  }
}

async function getSystemItemTypeIds(db: Db): Promise<Record<ItemTypeName, string>> {
  const types = await db.orm.public.ItemType.where({ isSystem: true })
    .where((row) => row.userId.isNull())
    .all();

  const byName = Object.fromEntries(types.map((t) => [t.name, t.id])) as Partial<
    Record<ItemTypeName, string>
  >;

  for (const type of systemItemTypes) {
    if (!byName[type.name]) {
      throw new Error(`Missing system item type: ${type.name}`);
    }
  }

  return byName as Record<ItemTypeName, string>;
}

async function seedCollectionsAndItems(
  db: Db,
  userId: string,
  typeIds: Record<ItemTypeName, string>
) {
  console.log("Seeding collections and items...");

  let collectionsCreated = 0;
  let itemsCreated = 0;

  for (const collection of seedCollections) {
    const existing = await db.orm.public.Collection.where({
      userId,
      name: collection.name,
    }).first();

    if (existing) {
      console.log(`Skipping existing collection: ${collection.name}`);
      continue;
    }

    const createdCollection = await db.orm.public.Collection.create({
      name: collection.name,
      description: collection.description,
      isFavorite: collection.isFavorite ?? false,
      userId,
    });
    collectionsCreated += 1;

    for (const item of collection.items) {
      const createdItem = await db.orm.public.Item.create({
        title: item.title,
        description: item.description,
        contentType: item.contentType,
        content: item.content ?? null,
        url: item.url ?? null,
        language: item.language ?? null,
        isFavorite: item.isFavorite ?? false,
        isPinned: item.isPinned ?? false,
        userId,
        itemTypeId: typeIds[item.type],
      });

      await db.orm.public.ItemCollection.create({
        itemId: createdItem.id,
        collectionId: createdCollection.id,
      });

      itemsCreated += 1;
    }

    console.log(
      `Created collection "${collection.name}" with ${collection.items.length} items`
    );
  }

  return { collectionsCreated, itemsCreated };
}

async function main() {
  const { db } = await import("../src/prisma/db");

  const userId = await seedDemoUser(db);
  await seedSystemItemTypes(db);
  const typeIds = await getSystemItemTypeIds(db);
  const { collectionsCreated, itemsCreated } = await seedCollectionsAndItems(
    db,
    userId,
    typeIds
  );

  const { total: itemTypeCount } = await db.orm.public.ItemType.where({
    isSystem: true,
  }).aggregate((agg) => ({ total: agg.count() }));

  console.log(
    `Seeding complete! System item types: ${itemTypeCount}, collections created: ${collectionsCreated}, items created: ${itemsCreated}`
  );
  await db.close();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
