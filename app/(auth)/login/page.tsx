import Link from "next/link";

const errorMessages: Record<string, string> = {
  "invalid-credentials": "The email or password was not accepted by Supabase Auth.",
  "invalid-login-payload": "Enter a valid email address and password.",
  "profile-incomplete": "This auth user is missing MedFlow role metadata. Complete registration or repair the user metadata."
};

export default async function LoginPage({
  searchParams
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const next = typeof params.next === "string" ? params.next : "/dashboard";
  const denied = params.denied === "1";
  const registered = params.registered === "1";
  const errorKey = typeof params.error === "string" ? params.error : null;
  const error = errorKey ? errorMessages[errorKey] ?? errorKey : null;

  return (
    <main className="mx-auto flex min-h-screen max-w-6xl items-center px-4 py-10 sm:px-6 lg:px-8">
      <div className="grid w-full gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="surface overflow-hidden p-8 lg:p-10">
          <p className="text-sm uppercase tracking-[0.32em] text-ink/45">Cloud EHR Platform</p>
          <h1 className="mt-4 max-w-xl text-4xl font-semibold text-ink">MedFlow AI centralizes clinical, operational, and patient-facing workflows.</h1>
          <p className="mt-4 max-w-2xl text-base text-ink/70">
            Authentication now runs through Supabase Auth and the application reads and writes live clinic data from your configured project.
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <article className="rounded-[1.3rem] bg-teal px-5 py-5 text-white">
              <p className="text-sm uppercase tracking-[0.18em] text-white/65">Modules</p>
              <p className="mt-3 text-2xl font-semibold">7 primary workspaces</p>
              <p className="mt-2 text-sm text-white/80">Dashboard, patients, appointments, prescriptions, labs, reports, admin.</p>
            </article>
            <article className="rounded-[1.3rem] bg-ink px-5 py-5 text-white">
              <p className="text-sm uppercase tracking-[0.18em] text-white/65">Provisioning</p>
              <p className="mt-3 text-2xl font-semibold">Supabase-backed accounts</p>
              <p className="mt-2 text-sm text-white/80">Role, clinic, and provider or patient linkage are stored in Auth metadata and public tables.</p>
            </article>
          </div>
        </section>
        <section className="surface p-8 lg:p-10">
          <div className="max-w-md">
            <p className="text-sm uppercase tracking-[0.32em] text-ink/45">Sign In</p>
            <h2 className="mt-4 text-3xl font-semibold text-ink">Access your clinic workspace</h2>
            <p className="mt-3 text-sm text-ink/70">Use the Supabase account you created through registration.</p>
            {denied ? <p className="mt-4 rounded-2xl bg-coral/15 px-4 py-3 text-sm text-coral">Your role cannot access that page.</p> : null}
            {registered ? <p className="mt-4 rounded-2xl bg-teal-soft px-4 py-3 text-sm text-teal">Account created. Sign in with your email and password.</p> : null}
            {error ? <p className="mt-4 rounded-2xl bg-coral/15 px-4 py-3 text-sm text-coral">{error}</p> : null}
            <form action="/api/auth/login" method="post" className="mt-6 space-y-4">
              <input type="hidden" name="next" value={next} />
              <label className="block text-sm text-ink/75">
                Email
                <input name="email" type="email" autoComplete="email" required />
              </label>
              <label className="block text-sm text-ink/75">
                Password
                <input name="password" type="password" autoComplete="current-password" minLength={8} required />
              </label>
              <button type="submit" className="w-full">Sign in</button>
            </form>
            <p className="mt-6 text-sm text-ink/70">
              Need a new account? <Link href="/register" className="font-medium text-teal hover:text-ink">Register a clinic user</Link>
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
