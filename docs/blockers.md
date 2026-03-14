# Blockers

## Current Blockers

No active technical blockers are currently preventing feature work.

## Open Risks and Constraints

- Fresh Supabase environments now require running `0002_patient_search_and_history.sql` followed by `0003_must_have_features.sql`; the repository does not yet have a single consolidated bootstrap migration for the expanded must-have schema.
- The seed script still targets the pre-must-have workflow set and does not populate encounters, billing claims, payments, immunizations, or detailed lab workflow data yet.
- The document upload route still returns a public URL for uploaded documents; patient-facing file access should move toward signed URL delivery before production use.
- The new laboratory detail workflow stores a report file URL/path but does not yet include a dedicated upload flow for lab PDFs.
- Appointment overlap protection remains enforced in application logic rather than a database-native scheduling constraint.
- The repository still relies on service-role-backed server access for most reads and writes; if this changes, the current client/server authorization patterns will need another pass.
- `scripts/reset-supabase.sql` remains destructive and must only be run against environments you intend to rebuild.