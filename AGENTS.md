# Agent Instructions

This repository uses a documentation-based context system in `/docs`. That system is the persistent memory of the project and must be treated as the single source of truth for project status.

## Mandatory Workflow

When a new task is received, the agent must follow this sequence.

### 1. Context Initialization

Read the relevant files in `/docs` before making assumptions or changes.

At minimum, inspect:

- `docs/PRD.md`
- `docs/tasks.md`
- `docs/progress.md`
- `docs/blockers.md`
- `docs/changelog.md`
- `docs/decisions.md`

### 2. Task Validation

Before implementation:

- check whether the requested work already exists in `docs/tasks.md`
- confirm the current state in `docs/progress.md`
- check unresolved risks or blockers in `docs/blockers.md`
- use `docs/decisions.md` to stay aligned with the existing architecture

Do not duplicate completed work if the repository already implements it.

### 3. Implementation Rules

Follow the current repository architecture and conventions.

#### Application Architecture

- Framework: Next.js 15 App Router
- Styling: Tailwind CSS
- Auth and backend: Supabase Auth, Postgres, Storage
- Session handling: `@supabase/ssr`
- Access control: role metadata in Supabase Auth plus middleware enforcement
- Data access: centralized server-side repository layer in `lib/repositories.ts`
- Validation: Zod schemas in `lib/schemas.ts`

#### Current Product Scope

The repository currently implements:

- Supabase Auth-backed login, registration, and logout
- role-protected dashboard, patients, appointments, prescriptions, labs, reports, and admin pages
- Supabase-backed patients, providers, appointments, prescriptions, lab results, users, medical records, and audit logs
- document upload API backed by Supabase Storage
- SQL migration for schema, RLS, and storage buckets
- idempotent Supabase seed script

#### Conventions

- Prefer extending the existing repository and auth helpers instead of introducing duplicate data access patterns.
- Keep database access in `lib/repositories.ts` unless there is a strong reason to introduce a new boundary.
- Keep role and clinic-aware behavior consistent with middleware and auth metadata.
- If schema changes are needed, update the SQL migration or add the necessary migration file.
- If development setup or seeding behavior changes, update README and `/docs`.

### 4. Context Updates After Work

After completing any meaningful task, update the documentation system.

Required updates:

- update `docs/tasks.md`
- update `docs/progress.md`
- append a relevant entry to `docs/changelog.md`
- record any architectural decision in `docs/decisions.md`
- update `docs/blockers.md` if new blockers or risks appear
- update `docs/PRD.md` if implemented behavior changes the effective requirements

## Repository Notes

### Setup Commands

- `npm run dev`
- `npm run typecheck`
- `npm run build`
- `npm run seed:supabase`

### Important Files

- `lib/auth.ts`
- `lib/supabase.ts`
- `lib/repositories.ts`
- `lib/schemas.ts`
- `middleware.ts`
- `supabase/migrations/0001_initial_schema.sql`
- `scripts/seed-supabase.mjs`
- `README.md`

## Expected Agent Behavior

- Start with `/docs`, not assumptions.
- Validate whether the work is already done before editing.
- Implement changes in alignment with the current architecture.
- Synchronize `/docs` after the work is finished.

If `/docs` becomes stale, fixing it is part of the task, not optional cleanup.
