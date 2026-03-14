# Product Requirements Document

## Product Name

MedFlow AI - Cloud EHR Platform

## Product Summary

MedFlow AI is a cloud-native electronic health record platform for mid-size healthcare practices. The current repository implements a Supabase-backed application that combines authentication, patient records, scheduling, prescriptions, lab visibility, document upload APIs, reporting, and clinic administration workflows.

## Problem Statement

Mid-size clinics often rely on fragmented or outdated EHR tooling for patient records, appointments, prescriptions, reporting, and administrative operations. MedFlow AI aims to consolidate these workflows into a modern web application with role-based access and audit-aware persistence.

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
- Prescription listing and creation APIs with paginated filtering support
- Lab result viewing with paginated filtering support
- Admin user/provider/audit overview
- Reporting pages for appointment trends and lightweight revenue summaries
- Document upload API backed by Supabase Storage

### Database and Storage Implemented

- Auth-linked `users` table in public schema
- `clinics`, `patients`, `providers`, `appointments`, `prescriptions`, `medical_records`, `lab_results`, `documents`, and `audit_logs`
- RLS policies based on Supabase JWT metadata
- Storage buckets for medical records, prescriptions, patient documents, and doctor certifications
- Seed script for demo clinic data and linked auth users

## User Roles

### Admin

Can access dashboard, patients, appointments, prescriptions, labs, reports, and admin views.

### Doctor

Can access dashboard, patients, appointments, prescriptions, and labs. Registration creates a linked provider profile.

### Staff

Can access dashboard, patients, and appointments.

### Patient

Can access dashboard, appointments, prescriptions, and labs. Registration creates a linked patient chart.

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

### Appointments

- Staff, admins, doctors, and linked patients can create appointments
- Double booking protection is enforced in the repository layer by overlap checks per provider
- Appointment CRUD APIs exist
- Appointment list views support server-side pagination and filtering

### Prescriptions

- Doctors can create prescriptions
- Admins, doctors, and linked patients can view prescriptions in role scope
- Prescription list views support server-side pagination and filtering

### Labs

- Lab result viewing is implemented
- Lab list views support server-side pagination and filtering
- Lab creation/import workflows are not yet implemented in the app UI

### Documents

- Upload endpoint exists and stores files in Supabase Storage
- Metadata is recorded in the `documents` table
- There is not yet a dedicated document management UI

### Reporting

- Appointment trend reporting is implemented
- Revenue reporting is currently a placeholder derived from appointments rather than true billing data

## Known Gaps Relative to Broader Vision

The repository does not currently implement:

- billing and insurance workflows
- telehealth
- inventory or facility management
- OAuth providers
- AI-assisted note generation
- full clinical documentation authoring UI beyond patient past medical history
- document management UI
- production billing analytics

## Alternative Positioning

MedFlow AI is positioned as an alternative to legacy or fragmented EHR systems that split scheduling, records, prescriptions, and clinic operations across separate tools.
