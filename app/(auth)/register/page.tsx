import Link from "next/link";

export default async function RegisterPage({
  searchParams
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const error = typeof params.error === "string" ? params.error : null;

  return (
    <main className="mx-auto flex min-h-screen max-w-5xl items-center px-4 py-10 sm:px-6 lg:px-8">
      <div className="grid w-full gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <section className="surface bg-ink p-8 text-white lg:p-10">
          <p className="text-sm uppercase tracking-[0.32em] text-white/60">Onboarding</p>
          <h1 className="mt-4 text-4xl font-semibold">Create a role-scoped Supabase account</h1>
          <p className="mt-4 text-sm text-white/75">
            Registration provisions a real Supabase Auth user, writes the application record, and links doctor or patient profiles when the role requires them.
          </p>
          <ul className="mt-8 space-y-3 text-sm text-white/75">
            <li>Every account belongs to a clinic.</li>
            <li>Doctor accounts create provider records.</li>
            <li>Patient accounts create linked patient charts.</li>
          </ul>
        </section>
        <section className="surface p-8 lg:p-10">
          <p className="text-sm uppercase tracking-[0.32em] text-ink/45">Register</p>
          <h2 className="mt-4 text-3xl font-semibold text-ink">Provision a clinic user</h2>
          {error ? <p className="mt-4 rounded-2xl bg-coral/15 px-4 py-3 text-sm text-coral">{error}</p> : null}
          <form action="/api/auth/register" method="post" className="mt-6 grid gap-4 md:grid-cols-2">
            <label className="block text-sm text-ink/75 md:col-span-2">
              Full name
              <input name="fullName" defaultValue="Clinic User" required />
            </label>
            <label className="block text-sm text-ink/75">
              Email
              <input name="email" type="email" autoComplete="email" required />
            </label>
            <label className="block text-sm text-ink/75">
              Password
              <input name="password" type="password" autoComplete="new-password" minLength={8} required />
            </label>
            <label className="block text-sm text-ink/75">
              Clinic ID
              <input name="clinicId" defaultValue="clinic-northstar" required />
            </label>
            <label className="block text-sm text-ink/75">
              Role
              <select name="role" defaultValue="staff">
                <option value="admin">Admin</option>
                <option value="doctor">Doctor</option>
                <option value="staff">Staff</option>
                <option value="patient">Patient</option>
              </select>
            </label>
            <label className="block text-sm text-ink/75">
              Specialty
              <input name="specialty" placeholder="Required for doctor accounts" />
            </label>
            <label className="block text-sm text-ink/75">
              License number
              <input name="licenseNumber" placeholder="Required for doctor accounts" />
            </label>
            <label className="block text-sm text-ink/75">
              Date of birth
              <input name="dob" type="date" />
            </label>
            <label className="block text-sm text-ink/75">
              Gender
              <select name="gender" defaultValue="unknown">
                <option value="unknown">Unknown</option>
                <option value="female">Female</option>
                <option value="male">Male</option>
                <option value="other">Other</option>
              </select>
            </label>
            <label className="block text-sm text-ink/75">
              Phone
              <input name="phone" placeholder="Required for patient accounts" />
            </label>
            <label className="block text-sm text-ink/75">
              Insurance ID
              <input name="insuranceId" placeholder="Required for patient accounts" />
            </label>
            <div className="md:col-span-2">
              <button type="submit" className="w-full">Create account</button>
            </div>
          </form>
          <p className="mt-6 text-sm text-ink/70">
            Already have access? <Link href="/login" className="font-medium text-teal hover:text-ink">Return to sign in</Link>
          </p>
        </section>
      </div>
    </main>
  );
}
