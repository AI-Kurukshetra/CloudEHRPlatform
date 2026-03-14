create extension if not exists pgcrypto;

create type public.user_role as enum ('admin', 'doctor', 'staff', 'patient');
create type public.appointment_status as enum ('scheduled', 'checked_in', 'completed', 'cancelled');

create or replace function public.current_user_role()
returns text
language sql
stable
as $$
  select coalesce(auth.jwt() -> 'app_metadata' ->> 'role', auth.jwt() -> 'user_metadata' ->> 'role');
$$;

create or replace function public.current_clinic_id()
returns text
language sql
stable
as $$
  select coalesce(auth.jwt() -> 'app_metadata' ->> 'clinic_id', auth.jwt() -> 'user_metadata' ->> 'clinic_id');
$$;

create table if not exists public.clinics (
  id text primary key,
  name text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  full_name text not null,
  role public.user_role not null,
  clinic_id text not null references public.clinics(id) on delete restrict,
  created_at timestamptz not null default now()
);

create table if not exists public.patients (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid unique references auth.users(id) on delete set null,
  clinic_id text not null references public.clinics(id) on delete cascade,
  first_name text not null,
  last_name text not null,
  dob date not null,
  gender text not null,
  phone text not null,
  email text not null,
  insurance_id text not null,
  allergies text[] not null default '{}',
  medications text[] not null default '{}',
  diagnoses text[] not null default '{}',
  created_at timestamptz not null default now()
);

create table if not exists public.providers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.users(id) on delete cascade,
  clinic_id text not null references public.clinics(id) on delete cascade,
  full_name text not null,
  specialty text not null,
  license_number text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.appointments (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.patients(id) on delete cascade,
  provider_id uuid not null references public.providers(id) on delete cascade,
  clinic_id text not null references public.clinics(id) on delete cascade,
  appointment_time timestamptz not null,
  duration_minutes integer not null check (duration_minutes between 15 and 180),
  status public.appointment_status not null default 'scheduled',
  reason text not null,
  notes text not null default '',
  created_at timestamptz not null default now()
);

create table if not exists public.prescriptions (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.patients(id) on delete cascade,
  provider_id uuid not null references public.providers(id) on delete cascade,
  clinic_id text not null references public.clinics(id) on delete cascade,
  drug_name text not null,
  dosage text not null,
  frequency text not null,
  duration text not null,
  issued_at timestamptz not null default now()
);

create table if not exists public.medical_records (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.patients(id) on delete cascade,
  visit_id uuid,
  clinic_id text not null references public.clinics(id) on delete cascade,
  record_type text not null,
  data jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create table if not exists public.lab_results (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.patients(id) on delete cascade,
  clinic_id text not null references public.clinics(id) on delete cascade,
  test_name text not null,
  result text not null,
  flag text not null,
  collected_at timestamptz not null default now()
);

create table if not exists public.documents (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.patients(id) on delete cascade,
  clinic_id text not null references public.clinics(id) on delete cascade,
  file_url text not null,
  file_type text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  action text not null,
  timestamp timestamptz not null default now()
);

create index if not exists appointments_provider_time_idx on public.appointments(provider_id, appointment_time);
create index if not exists appointments_patient_idx on public.appointments(patient_id);
create index if not exists patients_clinic_idx on public.patients(clinic_id);
create index if not exists prescriptions_patient_idx on public.prescriptions(patient_id);
create index if not exists lab_results_patient_idx on public.lab_results(patient_id);

alter table public.clinics enable row level security;
alter table public.users enable row level security;
alter table public.patients enable row level security;
alter table public.providers enable row level security;
alter table public.appointments enable row level security;
alter table public.prescriptions enable row level security;
alter table public.medical_records enable row level security;
alter table public.lab_results enable row level security;
alter table public.documents enable row level security;
alter table public.audit_logs enable row level security;

drop policy if exists "clinic members can read clinics" on public.clinics;
create policy "clinic members can read clinics"
on public.clinics
for select
using (id = public.current_clinic_id());

drop policy if exists "users can read own clinic users" on public.users;
create policy "users can read own clinic users"
on public.users
for select
using (
  clinic_id = public.current_clinic_id()
  and public.current_user_role() in ('admin', 'doctor', 'staff')
  or id = auth.uid()
);

drop policy if exists "staff can manage clinic users" on public.users;
create policy "staff can manage clinic users"
on public.users
for all
using (clinic_id = public.current_clinic_id() and public.current_user_role() = 'admin')
with check (clinic_id = public.current_clinic_id() and public.current_user_role() = 'admin');

drop policy if exists "clinic users can read patients" on public.patients;
create policy "clinic users can read patients"
on public.patients
for select
using (
  (clinic_id = public.current_clinic_id() and public.current_user_role() in ('admin', 'doctor', 'staff'))
  or auth_user_id = auth.uid()
);

drop policy if exists "staff can manage patients" on public.patients;
create policy "staff can manage patients"
on public.patients
for all
using (clinic_id = public.current_clinic_id() and public.current_user_role() in ('admin', 'staff'))
with check (clinic_id = public.current_clinic_id() and public.current_user_role() in ('admin', 'staff'));

drop policy if exists "clinic users can read providers" on public.providers;
create policy "clinic users can read providers"
on public.providers
for select
using (clinic_id = public.current_clinic_id());

drop policy if exists "admins can manage providers" on public.providers;
create policy "admins can manage providers"
on public.providers
for all
using (clinic_id = public.current_clinic_id() and public.current_user_role() = 'admin')
with check (clinic_id = public.current_clinic_id() and public.current_user_role() = 'admin');

drop policy if exists "clinic users can read appointments" on public.appointments;
create policy "clinic users can read appointments"
on public.appointments
for select
using (
  (clinic_id = public.current_clinic_id() and public.current_user_role() in ('admin', 'doctor', 'staff'))
  or exists (
    select 1
    from public.patients
    where public.patients.id = public.appointments.patient_id
      and public.patients.auth_user_id = auth.uid()
  )
);

drop policy if exists "clinic users can manage appointments" on public.appointments;
create policy "clinic users can manage appointments"
on public.appointments
for all
using (
  (clinic_id = public.current_clinic_id() and public.current_user_role() in ('admin', 'doctor', 'staff'))
  or (
    public.current_user_role() = 'patient'
    and exists (
      select 1
      from public.patients
      where public.patients.id = public.appointments.patient_id
        and public.patients.auth_user_id = auth.uid()
    )
  )
)
with check (
  (clinic_id = public.current_clinic_id() and public.current_user_role() in ('admin', 'doctor', 'staff'))
  or (
    public.current_user_role() = 'patient'
    and exists (
      select 1
      from public.patients
      where public.patients.id = public.appointments.patient_id
        and public.patients.auth_user_id = auth.uid()
    )
  )
);

drop policy if exists "clinic users can read prescriptions" on public.prescriptions;
create policy "clinic users can read prescriptions"
on public.prescriptions
for select
using (
  (clinic_id = public.current_clinic_id() and public.current_user_role() in ('admin', 'doctor'))
  or exists (
    select 1
    from public.patients
    where public.patients.id = public.prescriptions.patient_id
      and public.patients.auth_user_id = auth.uid()
  )
);

drop policy if exists "doctors can manage prescriptions" on public.prescriptions;
create policy "doctors can manage prescriptions"
on public.prescriptions
for all
using (clinic_id = public.current_clinic_id() and public.current_user_role() = 'doctor')
with check (clinic_id = public.current_clinic_id() and public.current_user_role() = 'doctor');

drop policy if exists "clinic users can read lab results" on public.lab_results;
create policy "clinic users can read lab results"
on public.lab_results
for select
using (
  (clinic_id = public.current_clinic_id() and public.current_user_role() in ('admin', 'doctor'))
  or exists (
    select 1
    from public.patients
    where public.patients.id = public.lab_results.patient_id
      and public.patients.auth_user_id = auth.uid()
  )
);

drop policy if exists "doctors can manage lab results" on public.lab_results;
create policy "doctors can manage lab results"
on public.lab_results
for all
using (clinic_id = public.current_clinic_id() and public.current_user_role() in ('admin', 'doctor'))
with check (clinic_id = public.current_clinic_id() and public.current_user_role() in ('admin', 'doctor'));

drop policy if exists "clinic users can read documents" on public.documents;
create policy "clinic users can read documents"
on public.documents
for select
using (
  (clinic_id = public.current_clinic_id() and public.current_user_role() in ('admin', 'doctor', 'staff'))
  or exists (
    select 1
    from public.patients
    where public.patients.id = public.documents.patient_id
      and public.patients.auth_user_id = auth.uid()
  )
);

drop policy if exists "clinic staff can manage documents" on public.documents;
create policy "clinic staff can manage documents"
on public.documents
for all
using (clinic_id = public.current_clinic_id() and public.current_user_role() in ('admin', 'doctor', 'staff'))
with check (clinic_id = public.current_clinic_id() and public.current_user_role() in ('admin', 'doctor', 'staff'));

drop policy if exists "admins can read audit logs" on public.audit_logs;
create policy "admins can read audit logs"
on public.audit_logs
for select
using (public.current_user_role() = 'admin');

drop policy if exists "system can write audit logs" on public.audit_logs;
create policy "system can write audit logs"
on public.audit_logs
for insert
with check (auth.uid() = user_id or public.current_user_role() = 'admin');

insert into storage.buckets (id, name, public)
values
  ('medical-records', 'medical-records', false),
  ('prescriptions', 'prescriptions', false),
  ('patient-documents', 'patient-documents', false),
  ('doctor-certifications', 'doctor-certifications', false)
on conflict (id) do nothing;
