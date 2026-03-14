# Tasks

## Completed

- [x] Scaffold Next.js 15 App Router application with TypeScript and Tailwind CSS
- [x] Implement Supabase SSR and admin client helpers
- [x] Implement Supabase Auth-backed login, registration, and logout flows
- [x] Implement middleware-based role protection for dashboard, patients, appointments, prescriptions, labs, reports, and admin routes
- [x] Define core TypeScript domain models and Zod schemas
- [x] Implement Supabase-backed repository layer for clinics, users, patients, providers, appointments, prescriptions, lab results, medical records, and audit logs
- [x] Implement patient list and patient detail pages
- [x] Implement appointment page and appointment CRUD APIs
- [x] Implement prescription page and prescription create/read APIs
- [x] Implement lab results page
- [x] Implement admin overview page
- [x] Implement reporting pages and report APIs
- [x] Implement document upload API backed by Supabase Storage
- [x] Create Supabase SQL migration with auth-linked schema and RLS policies
- [x] Create idempotent Supabase seed script with clinic, auth users, providers, patients, appointments, prescriptions, labs, medical records, and audit logs
- [x] Verify application with `npm run typecheck`
- [x] Verify production build with `npm run build`
- [x] Update README with product overview, setup, and seeding instructions
- [x] Add paginated search and filtering for patients, appointments, prescriptions, and lab results
- [x] Add rich-text past medical history editing to the patient chart with backend persistence
- [x] Add a Supabase reset SQL script for dropping MedFlow tables and storage buckets before replaying migrations
- [x] Rewrite `0002_patient_search_and_history.sql` as a standalone full-schema bootstrap migration for clean databases
- [x] Rename Lab Results Integration to Laboratory Management in the UI and navigation
- [x] Rename Reports to Analytics & Reports in the UI and navigation
- [x] Implement structured clinical documentation with encounters, SOAP notes, diagnoses, procedures, and encounter pages
- [x] Implement full laboratory management with orders, reports, component-level results, detail pages, and CRUD API support
- [x] Implement billing and claim management with claim generation, billing items, payment tracking, and billing pages
- [x] Implement patient portal pages for dashboard, appointments, prescriptions, labs, records, and self-service profile updates
- [x] Implement immunization tracking with timelines, reminder status, and CRUD workflows
- [x] Implement lightweight clinical decision support for allergy conflicts, interaction alerts, and preventive reminders during prescribing and encounter review
- [x] Expand multi-provider support with provider roster pages, provider-aware route access, and provider-specific workflow filtering
- [x] Expand the audit trail system with entity metadata, dedicated audit APIs/pages, and broader activity logging hooks
- [x] Add React Query app providers and React Hook Form/Zod-powered modal workflows for new must-have modules
- [x] Add incremental migration `0003_must_have_features.sql` for must-have schema expansion and private lab report storage

## Pending

- [x] Extend the Supabase seed script to populate encounter, billing, immunization, and laboratory workflow demo records for the new modules
- [ ] Build a dedicated UI for document upload and document management
- [ ] Implement telehealth workflows and UI
- [ ] Add automated tests for auth flows, repositories, and route handlers
- [ ] Add observability, error monitoring, and deployment runbook documentation
- [ ] Add safe seed reset or environment-specific fixture strategies for non-demo environments

## Newly Identified Follow-up

- [ ] Decide whether to consolidate the current schema into a new standalone bootstrap migration after `0003_must_have_features.sql`
- [ ] Decide whether patient-facing lab report downloads should be served exclusively through signed URLs instead of stored file links
- [ ] Add stronger database-level scheduling constraints for appointments beyond repository overlap checks