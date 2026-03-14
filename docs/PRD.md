# Product Requirements Document

## Product Name

MedFlow AI - Cloud EHR Platform

## Product Summary

MedFlow AI is a cloud-native electronic health record platform for mid-size healthcare practices. The repository now implements a Supabase-backed application that combines authentication, patient records, scheduling, prescriptions, structured clinical documentation, laboratory workflow, billing, immunization tracking, patient portal access, reporting, provider operations, and audit-aware persistence.

## Problem Statement

Mid-size clinics often rely on fragmented or outdated EHR tooling for patient records, appointments, prescriptions, labs, billing, immunizations, reporting, and administrative operations. MedFlow AI aims to consolidate these workflows into a modern web application with role-based access and audit-aware persistence.

## Current Scope Implemented

### Authentication and Access Control

- Supabase Auth email/password login
- Supabase-backed registration for `admin`, `doctor`, `staff`, and `patient`
- SSR session handling using `@supabase/ssr`
- Middleware-protected routes based on role metadata in Supabase Auth
- Role-aware navigation and page access

### Core Modules Implemented

- Dashboard
- Patient management list and patient detail views with paginated search/filter controls and rich-text past medical history editing
- Appointment listing, creation, update, and deletion APIs with paginated filtering support
- Prescription listing and creation APIs with paginated filtering support and decision support warnings
- Clinical documentation with encounters, SOAP notes, diagnoses, procedures, and patient encounter history pages
- Laboratory Management with lab orders, reports, component results, report detail pages, and patient lab views
- Billing & Claim Management with claim generation, invoice-style summaries, and payment views
- Immunization tracking with patient timelines and reminder status
- Patient portal dashboard plus appointments, prescriptions, labs, records, and profile management pages
- Provider roster and expanded multi-provider clinic operations
- Admin overview plus dedicated audit trail page
- Analytics & Reports for appointment trends and operational follow-up indicators
- Document upload API backed by Supabase Storage

### Database and Storage Implemented

- Auth-linked `users` table in public schema
- `clinics`, `patients`, `providers`, `appointments`, `prescriptions`, `medical_records`, `documents`, and `audit_logs`
- Must-have expansion tables for `encounters`, `clinical_notes`, `diagnoses`, `procedures`, `lab_orders`, `lab_reports`, `billing_claims`, `billing_items`, `payments`, and `immunizations`
- RLS policies based on Supabase JWT metadata
- Storage buckets for medical records, prescriptions, patient documents, doctor certifications, and private lab reports
- Seed script for demo clinic data and linked auth users

## User Roles

### Admin

Can access dashboard, patients, appointments, encounters, prescriptions, laboratory management, immunizations, billing, analytics & reports, providers, audit, and admin views.

### Doctor

Can access dashboard, patients, appointments, encounters, prescriptions, laboratory management, immunizations, billing views, and provider roster pages. Doctor workflows are filtered to their linked provider profile where appropriate.

### Staff

Can access dashboard, patients, appointments, billing, and provider roster pages.

### Patient

Can access dashboard, appointments, prescriptions, laboratory management, immunizations, and the dedicated patient portal. Patient reads are constrained to their linked chart.

## Functional Requirements Reflected by Current Implementation

### Auth

- Users authenticate through Supabase Auth
- Role and clinic context are stored in auth app metadata
- Session-aware server rendering is required for protected pages

### Patients

- Staff and admins can create patients
- Staff and admins can update patients through API
- Doctors and admins can document rich-text past medical history on the patient chart
- Patient directory queries support server-side pagination and indexed search/filter workflows
- Doctors and staff can view patient charts
- Patients are linked to auth users through `patients.auth_user_id`
- Patient portal users can update a limited self-service profile surface for their own chart

### Appointments

- Staff, admins, doctors, and linked patients can create appointments
- Double booking protection is enforced in the repository layer by overlap checks per provider
- Appointment CRUD APIs exist
- Appointment list views support server-side pagination and filtering

### Prescriptions and CDS

- Doctors can create prescriptions
- Admins, doctors, and linked patients can view prescriptions in role scope
- Prescription list views support server-side pagination and filtering
- Lightweight rule-based decision support warns on selected allergy and interaction patterns during prescribing

### Clinical Documentation

- Doctors and admins can create encounters
- SOAP notes, diagnoses, and procedures are attached to encounters
- Encounter detail pages show visit summaries plus decision support context
- Patients can review visit summaries through the portal and encounter history views

### Laboratory Management

- Lab orders, reports, and component-level results are implemented
- Labs page shows lab ID, patient, test, status, and ordered date
- Detailed report pages show component values, reference ranges, abnormal markers, and report file links
- Patients can review their own lab workflow and report availability through the portal

### Billing

- Claims can be generated from encounters
- Billing items capture CPT-coded line items
- Payment tracking is available on dedicated billing pages
- Claim generation derives billing items from encounter procedures when custom items are not provided

### Immunizations

- Clinicians can record vaccines, doses, lot numbers, and due dates
- Immunization timeline and reminder status are visible in clinic and patient-specific views
- Preventive reminders are surfaced through decision support when due dates are approaching or overdue

### Audit Trail

- The platform records audit events with entity metadata and timestamps
- Dedicated audit APIs and pages exist for review and administration
- Existing route handlers continue to log major create/update/delete actions

## Known Gaps Relative to Broader Vision

The repository does not currently implement:

- telehealth
- inventory or facility management
- OAuth providers
- AI-assisted note generation
- dedicated document management UI
- automated tests
- complete seed coverage for the newly added must-have tables

## Alternative Positioning

MedFlow AI is positioned as an alternative to legacy or fragmented EHR systems that split scheduling, records, documentation, lab management, billing, and clinic operations across separate tools.