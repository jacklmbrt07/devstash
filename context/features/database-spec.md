# Prisma + Neon PostgreSQL Setup

## Overview

Set up Prisma ORM with Neon PostgreSQL database.

## Requirements

- Use Neon PostgreSQL (serverless)
- Create initial schema based on data models in project-overview.md (this will evolve)
- Include NextAuth models (Account, Session, VerificationToken)
- Add appropriate indexes and cascade deletes

## References

- Initial data models: `@context/project-overview.md`
- Database standards: `@context/coding-standards.md`
- Prisma docs: https://prisma.io/docs (Prisma 8 has breaking changes — fetch latest)
- Prisma 8 from 7: https://www.prisma.io/docs/orm/coming-from-prisma-orm-7
- Prisma 8 PostgreSQL migration guide: https://www.prisma.io/docs/guides/upgrade-prisma-orm/postgresql

## Notes

We will have a development branch that we work on that will be in DATABASE_URL and then we will have a production branch. So we ALWAYS create migrations and never push directly unless specified.

IMPORTANT! Use **Prisma 8** (`prisma` CLI + `@prisma/orm-postgres`). Key differences from Prisma 7:

- Schema file is `src/prisma/contract.prisma` (must start with `// use prisma-8`)
- Generate → `prisma contract emit` (writes `contract.json` + `contract.d.ts`; commit both)
- Client → `db` from `src/prisma/db.ts` (`@prisma/orm-postgres/runtime`), not `PrismaClient`
- Migrations → `prisma migration plan` then `prisma db migrate --advance-ref db` (never `db push` / `db update` for shared environments unless specified)
- Config → `prisma.config.ts` with `definePrismaConfig` + `@prisma/orm-postgres/config`
