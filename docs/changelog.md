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
