# Blockers

## Current Blockers

No active technical blockers are currently preventing feature work.

## Open Risks and Constraints

- Billing and revenue reporting are still placeholders because no billing schema or billing workflows exist yet.
- The document upload route currently returns a public URL from Supabase Storage; privacy and signed URL strategy should be reviewed before production use.
- Appointment overlap protection is enforced in application logic but not yet reinforced by a database constraint or scheduling-specific server function.
- The repository relies on service-role-backed server access for most reads and writes; if this changes, RLS-compatible client/server patterns will need to be revisited.
