# MedFlow AI Starter

This workspace now runs against Supabase for authentication, data persistence, and storage uploads.

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

The current implementation includes Supabase-backed authentication, role-based access, live clinic data persistence, and seeded healthcare workflow data for local development and demo use.

## Alternative To

MedFlow AI is positioned as an alternative to **legacy and fragmented EHR systems** used by clinics to manage records, scheduling, prescriptions, and administrative workflows in separate or outdated tools.

## Included

- Supabase Auth-backed login, registration, logout, and SSR session handling
- Role-based route protection for `admin`, `doctor`, `staff`, and `patient`
- Supabase-backed patients, providers, appointments, prescriptions, labs, users, and audit log queries
- Storage upload integration for patient documents and prescription files
- An auth-linked PostgreSQL schema in [supabase/migrations/0001_initial_schema.sql](./supabase/migrations/0001_initial_schema.sql)
- An idempotent seed script in [scripts/seed-supabase.mjs](./scripts/seed-supabase.mjs)

## Runtime setup

1. Ensure `.env` contains valid `SUPABASE_URL`, `SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_KEY`
2. If the project is new, apply the SQL migration in the Supabase dashboard
3. Seed the project with `npm run seed:supabase`
4. Start the app with `npm run dev`
5. Open `/login`

## Seed contents

The seed script creates or updates:

- 1 clinic: `clinic-northstar`
- 1 admin user
- 2 doctor users with linked provider records
- 1 staff user
- 3 patient users with linked patient charts
- 3 appointments
- 2 prescriptions
- 3 lab results
- 2 medical records
- 2 audit log entries

All seeded users use password `Medflow123!`.

## Registration behavior

- Admin and staff accounts create auth users plus application user records
- Doctor accounts also create provider records
- Patient accounts also create linked patient charts
- Role and clinic context are stored in Supabase Auth app metadata for middleware and server rendering

## Current assumptions

- Billing and revenue are still lightweight placeholders because no billing tables exist yet
- Storage buckets are expected to exist after the SQL migration is applied
- The app uses server-side Supabase access for repository reads and writes; direct browser-side querying is not implemented yet
