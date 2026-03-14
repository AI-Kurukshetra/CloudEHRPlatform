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

## Pending

- [ ] Build a dedicated UI for document upload and document management
- [ ] Build create/import workflows for lab results instead of read-only display
- [ ] Replace placeholder revenue reporting with billing-backed analytics and real billing tables
- [ ] Implement billing and insurance modules from the broader product vision
- [ ] Implement telehealth workflows and UI
- [ ] Implement clinical documentation authoring UI for medical records
- [ ] Add automated tests for auth flows, repositories, and route handlers
- [ ] Add observability, error monitoring, and deployment runbook documentation
- [ ] Add safe seed reset or environment-specific fixture strategies for non-demo environments

## Newly Identified Follow-up

- [ ] Decide whether admin users should be allowed to create prescriptions or remain read-only in prescribing workflows
- [ ] Decide whether storage objects should remain private-only with signed URL access rather than exposing public URLs from the upload route
- [ ] Add stronger uniqueness and scheduling constraints at the database level for appointments
