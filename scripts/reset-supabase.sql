-- MedFlow AI Supabase reset script
-- Run this in the Supabase SQL editor before reapplying migrations.
-- It removes MedFlow public-schema tables, helper functions/types, and app storage buckets.
-- Auth users are intentionally preserved.

begin;

-- Remove bucket contents before dropping bucket definitions.
delete from storage.objects
where bucket_id in (
  'medical-records',
  'prescriptions',
  'patient-documents',
  'doctor-certifications',
  'lab-reports'
);

delete from storage.buckets
where id in (
  'medical-records',
  'prescriptions',
  'patient-documents',
  'doctor-certifications',
  'lab-reports'
);

-- Drop application tables from leaf dependencies upward.
drop table if exists public.payments cascade;
drop table if exists public.billing_items cascade;
drop table if exists public.billing_claims cascade;
drop table if exists public.immunizations cascade;
drop table if exists public.lab_reports cascade;
drop table if exists public.lab_orders cascade;
drop table if exists public.procedures cascade;
drop table if exists public.diagnoses cascade;
drop table if exists public.clinical_notes cascade;
drop table if exists public.encounters cascade;
drop table if exists public.audit_logs cascade;
drop table if exists public.documents cascade;
drop table if exists public.lab_results cascade;
drop table if exists public.medical_records cascade;
drop table if exists public.prescriptions cascade;
drop table if exists public.appointments cascade;
drop table if exists public.providers cascade;
drop table if exists public.patients cascade;
drop table if exists public.users cascade;
drop table if exists public.clinics cascade;

-- Drop helper functions and enums created by MedFlow migrations.
drop function if exists public.refresh_patient_search_fields();
drop function if exists public.current_user_role();
drop function if exists public.current_clinic_id();
drop type if exists public.appointment_status cascade;
drop type if exists public.user_role cascade;

commit;