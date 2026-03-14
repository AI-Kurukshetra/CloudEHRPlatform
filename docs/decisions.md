# Decisions

## Architecture Decisions

### Next.js App Router

The application uses Next.js 15 App Router with server-rendered pages and route handlers. Server-side rendering is used heavily because auth state and data access are tied to Supabase sessions and server-side repository calls.

### Supabase as Primary Backend

Supabase is the source of truth for:

- authentication
- session management
- relational persistence
- storage uploads

The app is designed around Supabase Auth metadata plus a public schema linked to `auth.users`.

### Auth Metadata for Role Context

Role, clinic ID, and optional linked `provider_id` or `patient_id` are stored in Supabase Auth app metadata. Middleware and server components use that metadata to determine access scope.

### Server-Side Repository Pattern

Database access is concentrated in `lib/repositories.ts` instead of being spread across pages and route handlers. Route handlers and server components call repository functions rather than issuing raw queries inline.

### Service-Role Repository Access

The repository layer currently uses the Supabase service role on the server for operational simplicity. This is acceptable for the current server-only data access model, but should be revisited if more user-scoped querying moves into client-side or edge contexts.

### Auth-Linked Public Schema

The public `users` table references `auth.users(id)`. Doctor registration provisions both an auth user and a `providers` row. Patient registration provisions both an auth user and a linked `patients` row.

### RLS as Baseline Security Model

The SQL migration enables RLS on all domain tables and defines policies based on JWT metadata and linked patient ownership. This is the intended baseline authorization model even though much of the current data access is service-role-backed on the server.

### Seeded Demo Clinic Strategy

The repository includes an idempotent seed script that creates a reusable demo clinic with fixed emails, linked records, and stable IDs. This supports local development, demos, and quick environment setup.

### Documentation-Based Context System

The `/docs` directory is the project memory and must be updated after work is completed. Future agents should treat `/docs` as the single source of truth for project status, not ad hoc assumptions from older prompts.
