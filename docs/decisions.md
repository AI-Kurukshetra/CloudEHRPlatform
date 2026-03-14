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

### Auth Metadata For Role Context

Role, clinic ID, and optional linked `provider_id` or `patient_id` are stored in Supabase Auth app metadata. Middleware and server components use that metadata to determine access scope.

### Server-Side Repository Pattern

Database access is concentrated in `lib/repositories.ts` instead of being spread across pages and route handlers. Route handlers and server components call repository functions rather than issuing raw queries inline.

### Service-Role Repository Access

The repository layer currently uses the Supabase service role on the server for operational simplicity. This is acceptable for the current server-only data access model, but should be revisited if more user-scoped querying moves into client-side or edge contexts.

### Auth-Linked Public Schema

The public `users` table references `auth.users(id)`. Doctor registration provisions both an auth user and a `providers` row. Patient registration provisions both an auth user and a linked `patients` row.

### RLS As Baseline Security Model

The SQL migration enables RLS on all domain tables and defines policies based on JWT metadata and linked patient ownership. This is the intended baseline authorization model even though much of the current data access is service-role-backed on the server.

### Standalone Bootstrap Migration

`supabase/migrations/0002_patient_search_and_history.sql` remains the current standalone bootstrap for the original MedFlow schema. `supabase/migrations/0003_must_have_features.sql` is now the additive migration that expands the schema to cover must-have workflows.

### Trigger-Maintained Patient Search Fields

Patient search text and allergy search text are stored in regular columns maintained by a `before insert or update` trigger. This preserves indexed search behavior while avoiding PostgreSQL generated-column immutability limits on array-to-text transformations.

### Seeded Demo Clinic Strategy

The repository includes an idempotent seed script that creates a reusable demo clinic with fixed emails, linked records, and stable IDs. This supports local development, demos, and quick environment setup.

### Documentation-Based Context System

The `/docs` directory is the project memory and must be updated after work is completed. Future agents should treat `/docs` as the single source of truth for project status, not ad hoc assumptions from older prompts.

### Dedicated Paginated Query Module

List-heavy screens use `lib/query-repositories.ts` for paginated, filterable queries rather than overloading the CRUD-oriented repository file. This keeps server-side search contracts explicit and avoids hydrating full clinic datasets into UI pages.

### Lexical For Medical History Editing

Patient past medical history editing uses Lexical in the React client with sanitized HTML persisted to the database. This keeps the editor lightweight while supporting structured formatting for clinical history notes.

### Explicit Reset Script Instead Of Dropping The Entire Public Schema

The repository uses `scripts/reset-supabase.sql` to explicitly remove MedFlow-owned tables, helper database objects, and storage buckets while preserving Supabase-managed schemas and auth users. This is safer than dropping the entire `public` schema in a shared Supabase project.

### Domain-Specific Repository Modules For Must-Have Features

The must-have expansion adds focused repository modules for encounters, laboratory workflow, billing, immunizations, providers, audit detail, and decision support. This keeps the legacy repository intact while preventing a single monolithic file from becoming unmaintainable.

### Rule-Based Clinical Decision Support For Initial Coverage

Clinical decision support is implemented as a lightweight, deterministic rules layer for allergy conflicts, medication interactions, and preventive reminders. This keeps the feature auditable and easy to evolve without introducing opaque scoring or external dependencies.

### Private Lab Report Storage Bucket

Laboratory report files are intended to live in a dedicated private `lab-reports` storage bucket. This keeps sensitive diagnostic files aligned with the platform's existing private-bucket posture.