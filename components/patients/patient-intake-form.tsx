export function PatientIntakeForm({ clinicId }: { clinicId: string }) {
  return (
    <form action="/api/patients" method="post" className="grid gap-4 md:grid-cols-2">
      <input type="hidden" name="clinicId" value={clinicId} />
      <input type="hidden" name="redirectTo" value="/patients" />
      <label className="block text-sm text-ink/75">
        First name
        <input name="firstName" required />
      </label>
      <label className="block text-sm text-ink/75">
        Last name
        <input name="lastName" required />
      </label>
      <label className="block text-sm text-ink/75">
        Date of birth
        <input name="dob" type="date" required />
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
      <label className="block text-sm text-ink/75 md:col-span-2">
        Parent or guardian name
        <input name="guardianName" placeholder="Optional for adults" />
      </label>
      <label className="block text-sm text-ink/75">
        Phone
        <input name="phone" required />
      </label>
      <label className="block text-sm text-ink/75">
        Email
        <input name="email" type="email" required />
      </label>
      <label className="block text-sm text-ink/75">
        Insurance ID
        <input name="insuranceId" required />
      </label>
      <label className="block text-sm text-ink/75 md:col-span-2">
        Allergies
        <input name="allergies" placeholder="Comma-separated values" />
      </label>
      <label className="block text-sm text-ink/75 md:col-span-2">
        Medications
        <input name="medications" placeholder="Comma-separated values" />
      </label>
      <label className="block text-sm text-ink/75 md:col-span-2">
        Diagnoses
        <input name="diagnoses" placeholder="Comma-separated values" />
      </label>
      <div className="md:col-span-2">
        <button type="submit">Create patient profile</button>
      </div>
    </form>
  );
}

