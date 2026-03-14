begin;

alter table if exists public.clinics
  add column if not exists address text not null default '',
  add column if not exists phone text not null default '';

create table if not exists public.encounters (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.patients(id) on delete cascade,
  provider_id uuid not null references public.providers(id) on delete cascade,
  clinic_id text not null references public.clinics(id) on delete cascade,
  appointment_id uuid references public.appointments(id) on delete set null,
  visit_reason text not null,
  status text not null default 'draft',
  created_at timestamptz not null default now(),
  constraint encounters_status_check check (status in ('draft', 'in_progress', 'completed'))
);

create table if not exists public.clinical_notes (
  id uuid primary key default gen_random_uuid(),
  encounter_id uuid not null unique references public.encounters(id) on delete cascade,
  subjective text not null default '',
  objective text not null default '',
  assessment text not null default '',
  plan text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.diagnoses (
  id uuid primary key default gen_random_uuid(),
  encounter_id uuid not null references public.encounters(id) on delete cascade,
  icd10_code text not null,
  diagnosis_name text not null,
  notes text not null default ''
);

create table if not exists public.procedures (
  id uuid primary key default gen_random_uuid(),
  encounter_id uuid not null references public.encounters(id) on delete cascade,
  cpt_code text not null,
  procedure_name text not null,
  notes text not null default ''
);

create table if not exists public.lab_orders (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.patients(id) on delete cascade,
  provider_id uuid not null references public.providers(id) on delete cascade,
  clinic_id text not null references public.clinics(id) on delete cascade,
  encounter_id uuid references public.encounters(id) on delete set null,
  test_name text not null,
  lab_name text not null,
  status text not null default 'ordered',
  ordered_at timestamptz not null default now(),
  constraint lab_orders_status_check check (status in ('ordered', 'collected', 'reported', 'reviewed', 'cancelled'))
);

create table if not exists public.lab_reports (
  id uuid primary key default gen_random_uuid(),
  lab_order_id uuid not null unique references public.lab_orders(id) on delete cascade,
  report_number text not null,
  report_date timestamptz not null default now(),
  result_summary text not null,
  abnormal_flag boolean not null default false,
  file_url text not null default ''
);

alter table if exists public.lab_results
  add column if not exists report_id uuid references public.lab_reports(id) on delete cascade,
  add column if not exists test_component text not null default '',
  add column if not exists value text not null default '',
  add column if not exists reference_range text not null default '',
  add column if not exists unit text not null default '';

alter table if exists public.lab_results
  alter column patient_id drop not null,
  alter column clinic_id drop not null,
  alter column test_name drop not null,
  alter column result drop not null;

create table if not exists public.billing_claims (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.patients(id) on delete cascade,
  encounter_id uuid not null references public.encounters(id) on delete cascade,
  provider_id uuid not null references public.providers(id) on delete cascade,
  clinic_id text not null references public.clinics(id) on delete cascade,
  claim_number text not null unique,
  status text not null default 'draft',
  total_amount numeric(12,2) not null default 0,
  submitted_at timestamptz,
  created_at timestamptz not null default now(),
  constraint billing_claims_status_check check (status in ('draft', 'submitted', 'paid', 'partially_paid', 'denied'))
);

create table if not exists public.billing_items (
  id uuid primary key default gen_random_uuid(),
  claim_id uuid not null references public.billing_claims(id) on delete cascade,
  cpt_code text not null,
  description text not null,
  amount numeric(12,2) not null default 0
);

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  claim_id uuid not null references public.billing_claims(id) on delete cascade,
  payment_method text not null,
  amount numeric(12,2) not null default 0,
  payment_date timestamptz not null default now(),
  constraint payments_method_check check (payment_method in ('insurance', 'card', 'cash', 'bank_transfer', 'check'))
);

create table if not exists public.immunizations (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.patients(id) on delete cascade,
  clinic_id text not null references public.clinics(id) on delete cascade,
  vaccine_name text not null,
  dose_number integer not null,
  date_administered date not null,
  provider_id uuid not null references public.providers(id) on delete cascade,
  lot_number text not null,
  notes text not null default '',
  next_due_date date
);

alter table if exists public.audit_logs
  add column if not exists clinic_id text references public.clinics(id) on delete cascade,
  add column if not exists entity_type text not null default 'system',
  add column if not exists entity_id uuid not null default gen_random_uuid(),
  add column if not exists changes jsonb,
  add column if not exists created_at timestamptz not null default now();

update public.audit_logs
set created_at = coalesce(public.audit_logs.created_at, public.audit_logs.timestamp),
    clinic_id = coalesce(public.audit_logs.clinic_id, public.users.clinic_id)
from public.users
where public.users.id = public.audit_logs.user_id;

create index if not exists encounters_clinic_created_at_idx on public.encounters(clinic_id, created_at desc);
create index if not exists encounters_patient_idx on public.encounters(patient_id);
create index if not exists encounters_provider_idx on public.encounters(provider_id);
create index if not exists diagnoses_encounter_idx on public.diagnoses(encounter_id);
create index if not exists procedures_encounter_idx on public.procedures(encounter_id);
create index if not exists lab_orders_clinic_ordered_at_idx on public.lab_orders(clinic_id, ordered_at desc);
create index if not exists lab_orders_patient_idx on public.lab_orders(patient_id);
create index if not exists lab_reports_lab_order_idx on public.lab_reports(lab_order_id);
create index if not exists lab_results_report_idx on public.lab_results(report_id);
create index if not exists billing_claims_clinic_created_at_idx on public.billing_claims(clinic_id, created_at desc);
create index if not exists billing_claims_patient_idx on public.billing_claims(patient_id);
create index if not exists billing_items_claim_idx on public.billing_items(claim_id);
create index if not exists payments_claim_idx on public.payments(claim_id);
create index if not exists immunizations_patient_date_idx on public.immunizations(patient_id, date_administered desc);
create index if not exists audit_logs_clinic_created_at_idx on public.audit_logs(clinic_id, created_at desc);

alter table public.encounters enable row level security;
alter table public.clinical_notes enable row level security;
alter table public.diagnoses enable row level security;
alter table public.procedures enable row level security;
alter table public.lab_orders enable row level security;
alter table public.lab_reports enable row level security;
alter table public.billing_claims enable row level security;
alter table public.billing_items enable row level security;
alter table public.payments enable row level security;
alter table public.immunizations enable row level security;

drop policy if exists "clinic users can read encounters" on public.encounters;
create policy "clinic users can read encounters"
on public.encounters
for select
using (
  (
    clinic_id = public.current_clinic_id()
    and public.current_user_role() in ('admin', 'doctor', 'staff')
  )
  or exists (
    select 1 from public.patients
    where public.patients.id = public.encounters.patient_id
      and public.patients.auth_user_id = auth.uid()
  )
);

drop policy if exists "clinicians can manage encounters" on public.encounters;
create policy "clinicians can manage encounters"
on public.encounters
for all
using (clinic_id = public.current_clinic_id() and public.current_user_role() in ('admin', 'doctor'))
with check (clinic_id = public.current_clinic_id() and public.current_user_role() in ('admin', 'doctor'));

drop policy if exists "clinic users can read clinical notes" on public.clinical_notes;
create policy "clinic users can read clinical notes"
on public.clinical_notes
for select
using (
  exists (
    select 1 from public.encounters
    where public.encounters.id = public.clinical_notes.encounter_id
      and (
        (public.encounters.clinic_id = public.current_clinic_id() and public.current_user_role() in ('admin', 'doctor', 'staff'))
        or exists (
          select 1 from public.patients
          where public.patients.id = public.encounters.patient_id
            and public.patients.auth_user_id = auth.uid()
        )
      )
  )
);

drop policy if exists "clinicians can manage clinical notes" on public.clinical_notes;
create policy "clinicians can manage clinical notes"
on public.clinical_notes
for all
using (
  exists (
    select 1 from public.encounters
    where public.encounters.id = public.clinical_notes.encounter_id
      and public.encounters.clinic_id = public.current_clinic_id()
      and public.current_user_role() in ('admin', 'doctor')
  )
)
with check (
  exists (
    select 1 from public.encounters
    where public.encounters.id = public.clinical_notes.encounter_id
      and public.encounters.clinic_id = public.current_clinic_id()
      and public.current_user_role() in ('admin', 'doctor')
  )
);

drop policy if exists "clinic users can read diagnoses" on public.diagnoses;
create policy "clinic users can read diagnoses"
on public.diagnoses
for select
using (
  exists (
    select 1 from public.encounters
    where public.encounters.id = public.diagnoses.encounter_id
      and (
        (public.encounters.clinic_id = public.current_clinic_id() and public.current_user_role() in ('admin', 'doctor', 'staff'))
        or exists (
          select 1 from public.patients
          where public.patients.id = public.encounters.patient_id
            and public.patients.auth_user_id = auth.uid()
        )
      )
  )
);

drop policy if exists "clinicians can manage diagnoses" on public.diagnoses;
create policy "clinicians can manage diagnoses"
on public.diagnoses
for all
using (
  exists (
    select 1 from public.encounters
    where public.encounters.id = public.diagnoses.encounter_id
      and public.encounters.clinic_id = public.current_clinic_id()
      and public.current_user_role() in ('admin', 'doctor')
  )
)
with check (
  exists (
    select 1 from public.encounters
    where public.encounters.id = public.diagnoses.encounter_id
      and public.encounters.clinic_id = public.current_clinic_id()
      and public.current_user_role() in ('admin', 'doctor')
  )
);

drop policy if exists "clinic users can read procedures" on public.procedures;
create policy "clinic users can read procedures"
on public.procedures
for select
using (
  exists (
    select 1 from public.encounters
    where public.encounters.id = public.procedures.encounter_id
      and (
        (public.encounters.clinic_id = public.current_clinic_id() and public.current_user_role() in ('admin', 'doctor', 'staff'))
        or exists (
          select 1 from public.patients
          where public.patients.id = public.encounters.patient_id
            and public.patients.auth_user_id = auth.uid()
        )
      )
  )
);

drop policy if exists "clinicians can manage procedures" on public.procedures;
create policy "clinicians can manage procedures"
on public.procedures
for all
using (
  exists (
    select 1 from public.encounters
    where public.encounters.id = public.procedures.encounter_id
      and public.encounters.clinic_id = public.current_clinic_id()
      and public.current_user_role() in ('admin', 'doctor')
  )
)
with check (
  exists (
    select 1 from public.encounters
    where public.encounters.id = public.procedures.encounter_id
      and public.encounters.clinic_id = public.current_clinic_id()
      and public.current_user_role() in ('admin', 'doctor')
  )
);

drop policy if exists "clinic users can read lab orders" on public.lab_orders;
create policy "clinic users can read lab orders"
on public.lab_orders
for select
using (
  (
    clinic_id = public.current_clinic_id()
    and public.current_user_role() in ('admin', 'doctor')
  )
  or exists (
    select 1 from public.patients
    where public.patients.id = public.lab_orders.patient_id
      and public.patients.auth_user_id = auth.uid()
  )
);

drop policy if exists "clinicians can manage lab orders" on public.lab_orders;
create policy "clinicians can manage lab orders"
on public.lab_orders
for all
using (clinic_id = public.current_clinic_id() and public.current_user_role() in ('admin', 'doctor'))
with check (clinic_id = public.current_clinic_id() and public.current_user_role() in ('admin', 'doctor'));

drop policy if exists "clinic users can read lab reports" on public.lab_reports;
create policy "clinic users can read lab reports"
on public.lab_reports
for select
using (
  exists (
    select 1 from public.lab_orders
    where public.lab_orders.id = public.lab_reports.lab_order_id
      and (
        (public.lab_orders.clinic_id = public.current_clinic_id() and public.current_user_role() in ('admin', 'doctor'))
        or exists (
          select 1 from public.patients
          where public.patients.id = public.lab_orders.patient_id
            and public.patients.auth_user_id = auth.uid()
        )
      )
  )
);

drop policy if exists "clinicians can manage lab reports" on public.lab_reports;
create policy "clinicians can manage lab reports"
on public.lab_reports
for all
using (
  exists (
    select 1 from public.lab_orders
    where public.lab_orders.id = public.lab_reports.lab_order_id
      and public.lab_orders.clinic_id = public.current_clinic_id()
      and public.current_user_role() in ('admin', 'doctor')
  )
)
with check (
  exists (
    select 1 from public.lab_orders
    where public.lab_orders.id = public.lab_reports.lab_order_id
      and public.lab_orders.clinic_id = public.current_clinic_id()
      and public.current_user_role() in ('admin', 'doctor')
  )
);

drop policy if exists "clinic users can read billing claims" on public.billing_claims;
create policy "clinic users can read billing claims"
on public.billing_claims
for select
using (clinic_id = public.current_clinic_id() and public.current_user_role() in ('admin', 'doctor', 'staff'));

drop policy if exists "staff can manage billing claims" on public.billing_claims;
create policy "staff can manage billing claims"
on public.billing_claims
for all
using (clinic_id = public.current_clinic_id() and public.current_user_role() in ('admin', 'staff'))
with check (clinic_id = public.current_clinic_id() and public.current_user_role() in ('admin', 'staff'));

drop policy if exists "clinic users can read billing items" on public.billing_items;
create policy "clinic users can read billing items"
on public.billing_items
for select
using (
  exists (
    select 1 from public.billing_claims
    where public.billing_claims.id = public.billing_items.claim_id
      and public.billing_claims.clinic_id = public.current_clinic_id()
      and public.current_user_role() in ('admin', 'doctor', 'staff')
  )
);

drop policy if exists "staff can manage billing items" on public.billing_items;
create policy "staff can manage billing items"
on public.billing_items
for all
using (
  exists (
    select 1 from public.billing_claims
    where public.billing_claims.id = public.billing_items.claim_id
      and public.billing_claims.clinic_id = public.current_clinic_id()
      and public.current_user_role() in ('admin', 'staff')
  )
)
with check (
  exists (
    select 1 from public.billing_claims
    where public.billing_claims.id = public.billing_items.claim_id
      and public.billing_claims.clinic_id = public.current_clinic_id()
      and public.current_user_role() in ('admin', 'staff')
  )
);

drop policy if exists "clinic users can read payments" on public.payments;
create policy "clinic users can read payments"
on public.payments
for select
using (
  exists (
    select 1 from public.billing_claims
    where public.billing_claims.id = public.payments.claim_id
      and public.billing_claims.clinic_id = public.current_clinic_id()
      and public.current_user_role() in ('admin', 'doctor', 'staff')
  )
);

drop policy if exists "staff can manage payments" on public.payments;
create policy "staff can manage payments"
on public.payments
for all
using (
  exists (
    select 1 from public.billing_claims
    where public.billing_claims.id = public.payments.claim_id
      and public.billing_claims.clinic_id = public.current_clinic_id()
      and public.current_user_role() in ('admin', 'staff')
  )
)
with check (
  exists (
    select 1 from public.billing_claims
    where public.billing_claims.id = public.payments.claim_id
      and public.billing_claims.clinic_id = public.current_clinic_id()
      and public.current_user_role() in ('admin', 'staff')
  )
);

drop policy if exists "clinic users can read immunizations" on public.immunizations;
create policy "clinic users can read immunizations"
on public.immunizations
for select
using (
  (
    clinic_id = public.current_clinic_id()
    and public.current_user_role() in ('admin', 'doctor')
  )
  or exists (
    select 1 from public.patients
    where public.patients.id = public.immunizations.patient_id
      and public.patients.auth_user_id = auth.uid()
  )
);

drop policy if exists "clinicians can manage immunizations" on public.immunizations;
create policy "clinicians can manage immunizations"
on public.immunizations
for all
using (clinic_id = public.current_clinic_id() and public.current_user_role() in ('admin', 'doctor'))
with check (clinic_id = public.current_clinic_id() and public.current_user_role() in ('admin', 'doctor'));

insert into storage.buckets (id, name, public)
values ('lab-reports', 'lab-reports', false)
on conflict (id) do nothing;

commit;