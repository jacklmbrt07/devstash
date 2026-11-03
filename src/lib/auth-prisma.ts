import { db } from "@/prisma/db";

interface AuthUserRow {
  id: string;
  email: string;
  emailVerified: string | null;
  name: string | null;
  image: string | null;
}

interface AuthAccountRow {
  user?: AuthUserRow | null;
}

function toTimestamp(value: unknown): string | null {
  if (value == null) return null;
  const date = value instanceof Date ? value : new Date(String(value));
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString().replace(/Z$/, "");
}

function toDate(value: string | null): Date | null {
  if (!value) return null;
  const hasZone = value.endsWith("Z") || /[+-]\d{2}:?\d{2}$/.test(value);
  const normalized = hasZone
    ? value
    : `${value.includes("T") ? value : value.replace(" ", "T")}Z`;
  return new Date(normalized);
}

function toAdapterUser(row: AuthUserRow) {
  return {
    id: row.id,
    email: row.email,
    emailVerified: toDate(row.emailVerified),
    name: row.name,
    image: row.image,
  };
}

function optionalString(value: unknown): string | null {
  return typeof value === "string" ? value : null;
}

function requireString(value: unknown, field: string): string {
  if (typeof value !== "string" || value.length === 0) {
    throw new Error(`Auth account is missing ${field}`);
  }
  return value;
}

function userWriteData(data: Record<string, unknown>) {
  return {
    ...(typeof data.email === "string" ? { email: data.email } : {}),
    ...("name" in data ? { name: optionalString(data.name) } : {}),
    ...("image" in data ? { image: optionalString(data.image) } : {}),
    ...("emailVerified" in data
      ? { emailVerified: toTimestamp(data.emailVerified) }
      : {}),
  };
}

function accountWriteData(data: Record<string, unknown>) {
  return {
    userId: requireString(data.userId, "userId"),
    type: requireString(data.type, "type"),
    provider: requireString(data.provider, "provider"),
    providerAccountId: requireString(
      data.providerAccountId,
      "providerAccountId",
    ),
    refreshToken: optionalString(data.refresh_token),
    accessToken: optionalString(data.access_token),
    expiresAt: typeof data.expires_at === "number" ? data.expires_at : null,
    tokenType: optionalString(data.token_type),
    scope: optionalString(data.scope),
    idToken: optionalString(data.id_token),
    sessionState: optionalString(data.session_state),
  };
}

async function findUser(where: Record<string, unknown>) {
  if (typeof where.id === "string") {
    return db.orm.public.User.where({ id: where.id }).first();
  }
  if (typeof where.email === "string") {
    return db.orm.public.User.where({ email: where.email }).first();
  }
  return null;
}

function unsupported(method: string): Promise<never> {
  return Promise.reject(
    new Error(`${method} is not used with the JWT session strategy`),
  );
}

export const authPrisma = {
  user: {
    async create({ data }: { data: Record<string, unknown> }) {
      const email = requireString(data.email, "email");
      const row = await db.orm.public.User.create({
        email,
        name: optionalString(data.name),
        image: optionalString(data.image),
        emailVerified: toTimestamp(data.emailVerified),
      });
      return toAdapterUser(row);
    },
    async findUnique({ where }: { where: Record<string, unknown> }) {
      const row = await findUser(where);
      return row ? toAdapterUser(row) : null;
    },
    async update({
      where,
      data,
    }: {
      where: Record<string, unknown>;
      data: Record<string, unknown>;
    }) {
      const id = requireString(where.id, "id");
      const changes = userWriteData(data);
      if (Object.keys(changes).length > 0) {
        await db.orm.public.User.where({ id }).update(changes);
      }
      const row = await db.orm.public.User.where({ id }).first();
      if (!row) throw new Error("User not found");
      return toAdapterUser(row);
    },
    async delete({ where }: { where: Record<string, unknown> }) {
      const id = requireString(where.id, "id");
      const row = await db.orm.public.User.where({ id }).first();
      if (!row) throw new Error("User not found");
      await db.orm.public.User.where({ id }).delete();
      return toAdapterUser(row);
    },
  },
  account: {
    async create({ data }: { data: Record<string, unknown> }) {
      return db.orm.public.Account.create(accountWriteData(data));
    },
    async findUnique({
      where,
      include,
    }: {
      where: Record<string, unknown>;
      include?: { user?: boolean };
    }) {
      const compound = where.provider_providerAccountId;
      const provider =
        compound && typeof compound === "object" && "provider" in compound
          ? requireString(compound.provider, "provider")
          : requireString(where.provider, "provider");
      const providerAccountId =
        compound &&
        typeof compound === "object" &&
        "providerAccountId" in compound
          ? requireString(compound.providerAccountId, "providerAccountId")
          : requireString(where.providerAccountId, "providerAccountId");

      const account = await db.orm.public.Account.where({
        provider,
        providerAccountId,
      })
        .include("user", (user) => user)
        .first();

      if (!account) return null;
      if (!include?.user) return account;

      const row = account as AuthAccountRow;
      return {
        ...account,
        user: row.user ? toAdapterUser(row.user) : null,
      };
    },
    async findFirst({ where }: { where: Record<string, unknown> }) {
      const provider = requireString(where.provider, "provider");
      const providerAccountId = requireString(
        where.providerAccountId,
        "providerAccountId",
      );
      return db.orm.public.Account.where({
        provider,
        providerAccountId,
      }).first();
    },
    async delete({ where }: { where: Record<string, unknown> }) {
      const compound = where.provider_providerAccountId;
      if (!compound || typeof compound !== "object") {
        throw new Error("Auth account delete is missing its provider key");
      }
      const provider = requireString(
        "provider" in compound ? compound.provider : undefined,
        "provider",
      );
      const providerAccountId = requireString(
        "providerAccountId" in compound
          ? compound.providerAccountId
          : undefined,
        "providerAccountId",
      );
      const account = await db.orm.public.Account.where({
        provider,
        providerAccountId,
      }).first();
      await db.orm.public.Account.where({
        provider,
        providerAccountId,
      }).delete();
      return account;
    },
  },
  session: {
    async create({ data }: { data: Record<string, unknown> }) {
      const expires = toTimestamp(data.expires);
      if (!expires) throw new Error("Session is missing expires");
      return db.orm.public.Session.create({
        sessionToken: requireString(data.sessionToken, "sessionToken"),
        userId: requireString(data.userId, "userId"),
        expires,
      });
    },
    async findUnique({
      where,
      include,
    }: {
      where: Record<string, unknown>;
      include?: { user?: boolean };
    }) {
      const sessionToken = requireString(where.sessionToken, "sessionToken");
      const session = await db.orm.public.Session.where({ sessionToken })
        .include("user", (user) => user)
        .first();
      if (!session || !include?.user) return session;
      const row = session as { user?: AuthUserRow | null };
      return {
        ...session,
        user: row.user ? toAdapterUser(row.user) : null,
      };
    },
    async update({
      where,
      data,
    }: {
      where: Record<string, unknown>;
      data: Record<string, unknown>;
    }) {
      const sessionToken = requireString(where.sessionToken, "sessionToken");
      const expires = toTimestamp(data.expires);
      if (expires) {
        await db.orm.public.Session.where({ sessionToken }).update({
          expires,
        });
      }
      return db.orm.public.Session.where({ sessionToken }).first();
    },
    async delete({ where }: { where: Record<string, unknown> }) {
      const sessionToken = requireString(where.sessionToken, "sessionToken");
      const session = await db.orm.public.Session.where({
        sessionToken,
      }).first();
      await db.orm.public.Session.where({ sessionToken }).delete();
      return session;
    },
  },
  verificationToken: {
    async create({ data }: { data: Record<string, unknown> }) {
      const expires = toTimestamp(data.expires);
      if (!expires) throw new Error("Verification token is missing expires");
      const created = await db.orm.public.VerificationToken.create({
        identifier: requireString(data.identifier, "identifier"),
        token: requireString(data.token, "token"),
        expires,
      });
      return {
        identifier: created.identifier,
        token: created.token,
        expires: toDate(created.expires),
      };
    },
    async delete({ where }: { where: Record<string, unknown> }) {
      const compound = where.identifier_token;
      if (!compound || typeof compound !== "object") {
        throw new Error("Verification token delete is missing its key");
      }
      const identifier = requireString(
        "identifier" in compound ? compound.identifier : undefined,
        "identifier",
      );
      const token = requireString(
        "token" in compound ? compound.token : undefined,
        "token",
      );
      const existing = await db.orm.public.VerificationToken.where({
        identifier,
        token,
      }).first();
      if (!existing) {
        const missing = new Error("Verification token not found");
        Object.assign(missing, { code: "P2025" });
        throw missing;
      }
      await db.orm.public.VerificationToken.where({
        identifier,
        token,
      }).delete();
      return {
        identifier: existing.identifier,
        token: existing.token,
        expires: toDate(existing.expires),
      };
    },
  },
  authenticator: {
    create: () => unsupported("createAuthenticator"),
    findUnique: () => unsupported("getAuthenticator"),
    findMany: () => unsupported("listAuthenticatorsByUserId"),
    update: () => unsupported("updateAuthenticatorCounter"),
  },
};
