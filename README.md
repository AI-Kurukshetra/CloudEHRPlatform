# MedFlow AI Starter

This workspace runs against Supabase for authentication, PostgreSQL persistence, and storage uploads.

## Product Name

**MedFlow AI - Cloud EHR Platform**

## What It Does

MedFlow AI is a cloud-native electronic health record platform for mid-size healthcare practices. It centralizes:

- patient records
- provider and staff access control
- appointment scheduling
- prescriptions with lightweight decision support
- structured clinical documentation
- laboratory management
- billing and claim management
- immunization tracking
- patient portal access
- analytics, reporting, and audit workflows

The current implementation includes Supabase-backed authentication, role-based access, live clinic data persistence, paginated search/filter workflows for list-heavy modules, React Hook Form and React Query powered must-have workflows, and rich-text past medical history editing on the patient chart.

## Alternative To

MedFlow AI is positioned as an alternative to **legacy and fragmented EHR systems** used by clinics to manage records, scheduling, prescriptions, labs, billing, and administrative workflows in separate or outdated tools.

## Included

- Supabase Auth-backed login, registration, logout, and SSR session handling
- Role-based route protection for `admin`, `doctor`, `staff`, and `patient`
- Supabase-backed patients, providers, appointments, prescriptions, encounters, labs, billing, immunizations, users, and audit log queries
- Paginated and filterable patient, appointment, prescription, and lab list views
- Structured encounter documentation with SOAP notes, diagnoses, procedures, and encounter detail/history pages
- Laboratory Management workflows with lab orders, reports, component results, and report detail pages
- Billing claim, invoice, and payment views with encounter-driven claim generation
- Patient portal dashboard, appointments, prescriptions, labs, records, and profile management
- Immunization timelines and reminder tracking
- Rich-text past medical history editing backed by Lexical and sanitized HTML persistence
- Storage upload integration for patient documents and prescription files
- A standalone current-schema migration in [supabase/migrations/0002_patient_search_and_history.sql](./supabase/migrations/0002_patient_search_and_history.sql)
- An additive must-have migration in [supabase/migrations/0003_must_have_features.sql](./supabase/migrations/0003_must_have_features.sql)
- An idempotent seed script in [scripts/seed-supabase.mjs](./scripts/seed-supabase.mjs)
- A reset SQL script in [scripts/reset-supabase.sql](./scripts/reset-supabase.sql) for dropping MedFlow tables and storage buckets before replaying migrations

## Runtime setup

1. Ensure `.env` contains valid `SUPABASE_URL`, `SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_KEY`
2. If you need a clean database before replaying migrations, run [scripts/reset-supabase.sql](./scripts/reset-supabase.sql) in the Supabase SQL editor
3. Run [supabase/migrations/0002_patient_search_and_history.sql](./supabase/migrations/0002_patient_search_and_history.sql) in the Supabase SQL editor to bootstrap the original schema
4. Run [supabase/migrations/0003_must_have_features.sql](./supabase/migrations/0003_must_have_features.sql) in the Supabase SQL editor to add the must-have workflow schema expansion
5. Seed the project with `npm run seed:supabase`
6. Start the app with `npm run dev`
7. Open `/login`

## Seed contents

The existing seed script creates or updates:

- 1 clinic: `clinic-northstar`
- 1 admin user
- 2 doctor users with linked provider records
- 1 staff user
- 3 patient auth users with linked patient charts
- 72 additional patient charts for search/filter testing
- 51 appointments
- 26 prescriptions
- 39 lab summary rows
- 20 medical records
- 2 audit log entries

All seeded auth users use password `Medflow123!`.

Note: the current seed script does **not yet** populate the newly added encounter, billing, immunization, or detailed laboratory workflow tables.

## Registration behavior

- Admin and staff accounts create auth users plus application user records
- Doctor accounts also create provider records
- Patient accounts also create linked patient charts
- Role and clinic context are stored in Supabase Auth app metadata for middleware and server rendering

## Current assumptions

- Apply `0002` and then `0003` for fresh Supabase environments
- Billing now has first-pass claims and payments, but advanced remittance workflows are still not implemented
- Storage buckets are expected to exist after the migrations are applied
- Existing Supabase projects can use `scripts/reset-supabase.sql` before replaying the migrations from scratch
- The app uses server-side Supabase access for repository reads and writes; direct browser-side querying is limited to app-owned APIs and React Query fetches