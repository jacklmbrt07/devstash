export type ContentType = "TEXT" | "FILE" | "URL";

export interface User {
  id: string;
  name: string;
  email: string;
  isPro: boolean;
}

export interface ItemType {
  id: string;
  name: string;
  icon: string;
  color: string;
  isSystem: boolean;
}

export interface Collection {
  id: string;
  name: string;
  description: string;
  isFavorite: boolean;
  updatedAt: string;
}

export interface Item {
  id: string;
  title: string;
  description: string;
  contentType: ContentType;
  content: string | null;
  url: string | null;
  language: string | null;
  tags: string[];
  isFavorite: boolean;
  isPinned: boolean;
  itemTypeId: string;
  collectionIds: string[];
  updatedAt: string;
}

export const currentUser: User = {
  id: "user_1",
  name: "Jack Lambert",
  email: "jack@devstash.io",
  isPro: false,
};

export const itemTypes: ItemType[] = [
  { id: "type_snippet", name: "snippet", icon: "Code", color: "#3b82f6", isSystem: true },
  { id: "type_prompt", name: "prompt", icon: "Sparkles", color: "#8b5cf6", isSystem: true },
  { id: "type_command", name: "command", icon: "Terminal", color: "#f97316", isSystem: true },
  { id: "type_note", name: "note", icon: "StickyNote", color: "#fde047", isSystem: true },
  { id: "type_file", name: "file", icon: "File", color: "#6b7280", isSystem: true },
  { id: "type_image", name: "image", icon: "Image", color: "#ec4899", isSystem: true },
  { id: "type_link", name: "link", icon: "Link", color: "#10b981", isSystem: true },
];

export const collections: Collection[] = [
  {
    id: "col_react",
    name: "React Patterns",
    description: "Hooks, context patterns and component recipes I reuse across projects.",
    isFavorite: true,
    updatedAt: "2025-10-27T13:00:00.000Z",
  },
  {
    id: "col_python",
    name: "Python Snippets",
    description: "Data wrangling helpers, CLI scaffolds and async utilities.",
    isFavorite: false,
    updatedAt: "2025-10-26T18:00:00.000Z",
  },
  {
    id: "col_context",
    name: "Context Files",
    description: "AGENTS.md, cursor rules and system context for AI coding agents.",
    isFavorite: true,
    updatedAt: "2025-10-24T12:00:00.000Z",
  },
  {
    id: "col_interview",
    name: "Interview Prep",
    description: "System design notes, algorithm templates and behavioral answers.",
    isFavorite: false,
    updatedAt: "2025-10-20T09:00:00.000Z",
  },
  {
    id: "col_devops",
    name: "DevOps Cheats",
    description: "Docker, CI and deploy commands I reach for weekly.",
    isFavorite: true,
    updatedAt: "2025-10-22T16:00:00.000Z",
  },
  {
    id: "col_ai",
    name: "AI Prompts",
    description: "Reusable prompts for reviews, refactors and agent workflows.",
    isFavorite: false,
    updatedAt: "2025-10-25T10:00:00.000Z",
  },
];

export const items: Item[] = [
  {
    id: "item_1",
    title: "useAuth hook",
    description: "Custom authentication hook with session management.",
    contentType: "TEXT",
    content: `export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  // session management...
  return { user, signIn, signOut };
}`,
    url: null,
    language: "typescript",
    tags: ["react", "auth", "hooks"],
    isFavorite: true,
    isPinned: true,
    itemTypeId: "type_snippet",
    collectionIds: ["col_react"],
    updatedAt: "2025-10-27T14:00:00.000Z",
  },
  {
    id: "item_2",
    title: "Undo last commit (keep changes)",
    description: "Soft reset the last commit while keeping changes staged.",
    contentType: "TEXT",
    content: "git reset --soft HEAD~1",
    url: null,
    language: "bash",
    tags: ["git", "undo"],
    isFavorite: false,
    isPinned: true,
    itemTypeId: "type_command",
    collectionIds: ["col_devops"],
    updatedAt: "2025-10-27T12:30:00.000Z",
  },
  {
    id: "item_3",
    title: "Typed debounce utility",
    description: "Generic debounce with cancel support.",
    contentType: "TEXT",
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
    url: null,
    language: "typescript",
    tags: ["utils", "typescript"],
    isFavorite: false,
    isPinned: false,
    itemTypeId: "type_snippet",
    collectionIds: ["col_react"],
    updatedAt: "2025-10-27T11:00:00.000Z",
  },
  {
    id: "item_4",
    title: "Docker cleanup",
    description: "Prune unused images, containers and volumes.",
    contentType: "TEXT",
    content: "docker system prune -af --volumes",
    url: null,
    language: "bash",
    tags: ["docker", "cleanup"],
    isFavorite: true,
    isPinned: false,
    itemTypeId: "type_command",
    collectionIds: ["col_devops"],
    updatedAt: "2025-10-27T09:00:00.000Z",
  },
  {
    id: "item_5",
    title: "Rate limiter design notes",
    description: "Token bucket vs sliding window tradeoffs for API limits.",
    contentType: "TEXT",
    content: "## Rate limiting\n\n- Token bucket: burst-friendly\n- Sliding window: smoother fairness\n",
    url: null,
    language: null,
    tags: ["system-design", "apis"],
    isFavorite: false,
    isPinned: false,
    itemTypeId: "type_note",
    collectionIds: ["col_interview"],
    updatedAt: "2025-10-26T20:00:00.000Z",
  },
  {
    id: "item_6",
    title: "TanStack Query — Optimistic Updates",
    description: "Official docs for optimistic UI patterns.",
    contentType: "URL",
    content: null,
    url: "https://tanstack.com/query/latest/docs/framework/react/guides/optimistic-updates",
    language: null,
    tags: ["react", "tanstack"],
    isFavorite: false,
    isPinned: false,
    itemTypeId: "type_link",
    collectionIds: ["col_react"],
    updatedAt: "2025-10-26T16:00:00.000Z",
  },
  {
    id: "item_7",
    title: "Code review prompt",
    description: "Structured review checklist for PRs.",
    contentType: "TEXT",
    content:
      "Review this PR for correctness, edge cases, naming, and missing tests. List risks first.",
    url: null,
    language: null,
    tags: ["review", "ai"],
    isFavorite: true,
    isPinned: true,
    itemTypeId: "type_prompt",
    collectionIds: ["col_ai"],
    updatedAt: "2025-10-26T14:00:00.000Z",
  },
  {
    id: "item_8",
    title: "pandas groupby cheat sheet",
    description: "Common aggregations I forget under pressure.",
    contentType: "TEXT",
    content: "df.groupby('col').agg({'a': 'sum', 'b': 'mean'})",
    url: null,
    language: "python",
    tags: ["python", "pandas"],
    isFavorite: false,
    isPinned: false,
    itemTypeId: "type_snippet",
    collectionIds: ["col_python"],
    updatedAt: "2025-10-25T18:00:00.000Z",
  },
  {
    id: "item_9",
    title: "AGENTS.md template",
    description: "Base agent context file for new repos.",
    contentType: "FILE",
    content: null,
    url: null,
    language: "markdown",
    tags: ["agents", "context"],
    isFavorite: true,
    isPinned: false,
    itemTypeId: "type_file",
    collectionIds: ["col_context"],
    updatedAt: "2025-10-24T11:00:00.000Z",
  },
  {
    id: "item_10",
    title: "Dashboard wireframe",
    description: "Early layout sketch for the main dashboard.",
    contentType: "FILE",
    content: null,
    url: null,
    language: null,
    tags: ["design", "ui"],
    isFavorite: false,
    isPinned: false,
    itemTypeId: "type_image",
    collectionIds: ["col_context"],
    updatedAt: "2025-10-23T15:00:00.000Z",
  },
  {
    id: "item_11",
    title: "Explain this algorithm",
    description: "Prompt for walking through Big-O and tradeoffs.",
    contentType: "TEXT",
    content:
      "Explain this algorithm step by step. Cover time/space complexity and when not to use it.",
    url: null,
    language: null,
    tags: ["interview", "ai"],
    isFavorite: false,
    isPinned: false,
    itemTypeId: "type_prompt",
    collectionIds: ["col_interview", "col_ai"],
    updatedAt: "2025-10-22T13:00:00.000Z",
  },
  {
    id: "item_12",
    title: "asyncio gather pattern",
    description: "Run coroutines concurrently and gather results.",
    contentType: "TEXT",
    content: "results = await asyncio.gather(*tasks)",
    url: null,
    language: "python",
    tags: ["python", "async"],
    isFavorite: true,
    isPinned: false,
    itemTypeId: "type_snippet",
    collectionIds: ["col_python"],
    updatedAt: "2025-10-21T17:00:00.000Z",
  },
];
