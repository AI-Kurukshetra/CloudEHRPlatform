# Blockers

## Current Blockers

No active technical blockers are currently preventing feature work.

## Open Risks and Constraints

- Billing and revenue reporting are still placeholders because no billing schema or billing workflows exist yet.
- The document upload route currently returns a public URL from Supabase Storage; privacy and signed URL strategy should be reviewed before production use.
- Appointment overlap protection is enforced in application logic but not yet reinforced by a database constraint or scheduling-specific server function.
- The repository relies on service-role-backed server access for most reads and writes; if this changes, RLS-compatible client/server patterns will need to be revisited.
- `scripts/reset-supabase.sql` is destructive and must only be run against environments you intend to rebuild.
- The reset script preserves `auth.users`; replaying the standalone migration and reseeding will reuse or update existing auth users rather than deleting them.
