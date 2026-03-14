# Changelog

## 2026-03-14

- Created the initial Next.js 15 App Router application shell for MedFlow AI.
- Added Tailwind styling, shared layout components, and role-aware navigation.
- Implemented Supabase SSR, admin, and middleware client helpers.
- Replaced demo cookie auth with Supabase Auth-backed login, logout, and registration flows.
- Added role-based route protection using middleware and auth metadata.
- Implemented Supabase-backed repository functions for clinics, users, patients, providers, appointments, prescriptions, lab results, medical records, and audit logs.
- Added patient, appointment, prescription, lab, reports, dashboard, and admin pages.
- Added REST-style App Router API handlers for auth, patients, appointments, prescriptions, reports, and document uploads.
- Added Supabase SQL migration defining schema, RLS policies, and storage buckets.
- Added idempotent seed script to create clinic demo data and linked Supabase Auth users.
- Updated README with product positioning, runtime setup, and seed instructions.
- Added `/docs` context management files and repository-level agent instructions.
- Added indexed, paginated patient search and filtering across patients, appointments, prescriptions, and lab result list views.
- Added patient guardian name and rich-text past medical history storage with a doctor/admin editing experience on the chart page.
- Added a new patient search/history migration and expanded the Supabase seed dataset to more than 70 patient charts with varied histories, allergies, labs, appointments, and prescriptions.
- Added `scripts/reset-supabase.sql` to drop MedFlow tables, helper database objects, and app storage buckets before replaying migrations.
- Rewrote `supabase/migrations/0002_patient_search_and_history.sql` as a standalone current-schema bootstrap migration that can initialize a clean Supabase database by itself.
- Replaced generated patient search columns in the standalone bootstrap migration with trigger-maintained columns so the schema works on clean PostgreSQL/Supabase databases.
