# MedFlow AI Starter

This workspace runs against Supabase for authentication, PostgreSQL persistence, and storage uploads.

## Product Name

**MedFlow AI - Cloud EHR Platform**

## What It Does

MedFlow AI is a cloud-native electronic health record platform for mid-size healthcare practices. It centralizes:

- patient records
- provider and staff access control
- appointment scheduling
- prescriptions
- lab results
- clinical documentation storage
- audit-ready operational workflows

The current implementation includes Supabase-backed authentication, role-based access, live clinic data persistence, paginated search/filter workflows for list-heavy modules, and rich-text past medical history editing on the patient chart.

## Alternative To

MedFlow AI is positioned as an alternative to **legacy and fragmented EHR systems** used by clinics to manage records, scheduling, prescriptions, and administrative workflows in separate or outdated tools.

## Included

- Supabase Auth-backed login, registration, logout, and SSR session handling
- Role-based route protection for `admin`, `doctor`, `staff`, and `patient`
- Supabase-backed patients, providers, appointments, prescriptions, labs, users, and audit log queries
- Paginated and filterable patient, appointment, prescription, and lab list views
- Rich-text past medical history editing backed by Lexical and sanitized HTML persistence
- Storage upload integration for patient documents and prescription files
- A standalone current-schema migration in [supabase/migrations/0002_patient_search_and_history.sql](./supabase/migrations/0002_patient_search_and_history.sql)
- An idempotent seed script in [scripts/seed-supabase.mjs](./scripts/seed-supabase.mjs)
- A reset SQL script in [scripts/reset-supabase.sql](./scripts/reset-supabase.sql) for dropping MedFlow tables and storage buckets before replaying migrations

## Runtime setup

1. Ensure `.env` contains valid `SUPABASE_URL`, `SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_KEY`
2. If you need a clean database before replaying migrations, run [scripts/reset-supabase.sql](./scripts/reset-supabase.sql) in the Supabase SQL editor
3. Run [supabase/migrations/0002_patient_search_and_history.sql](./supabase/migrations/0002_patient_search_and_history.sql) in the Supabase SQL editor to bootstrap the current schema from scratch
4. Seed the project with `npm run seed:supabase`
5. Start the app with `npm run dev`
6. Open `/login`

## Seed contents

The seed script creates or updates:

- 1 clinic: `clinic-northstar`
- 1 admin user
- 2 doctor users with linked provider records
- 1 staff user
- 3 patient auth users with linked patient charts
- 72 additional patient charts for search/filter testing
- 51 appointments
- 26 prescriptions
- 39 lab results
- 20 medical records
- 2 audit log entries

All seeded auth users use password `Medflow123!`.

## Registration behavior

- Admin and staff accounts create auth users plus application user records
- Doctor accounts also create provider records
- Patient accounts also create linked patient charts
- Role and clinic context are stored in Supabase Auth app metadata for middleware and server rendering

## Current assumptions

- Billing and revenue are still lightweight placeholders because no billing tables exist yet
- Storage buckets are expected to exist after the bootstrap migration is applied
- Existing Supabase projects can use `scripts/reset-supabase.sql` before replaying the standalone migration from scratch
- The app uses server-side Supabase access for repository reads and writes; direct browser-side querying is not implemented yet
