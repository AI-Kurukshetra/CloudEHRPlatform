import type { ClinicalAlert, EncounterDiagnosis, Immunization, Patient } from "@/lib/types";

function getReminderState(nextDueDate: string | null) {
  if (!nextDueDate) {
    return "up_to_date";
  }

  const due = new Date(nextDueDate).getTime();
  const diffDays = Math.round((due - Date.now()) / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return "overdue";
  }

  if (diffDays <= 30) {
    return "due_soon";
  }

  return "up_to_date";
}

export function getClinicalDecisionSupport(input: {
  patient: Patient;
  medicationName?: string;
  diagnoses?: EncounterDiagnosis[];
  immunizations?: Immunization[];
}): ClinicalAlert[] {
  const alerts: ClinicalAlert[] = [];
  const medicationName = input.medicationName?.toLowerCase() ?? "";
  const allergies = input.patient.allergies.map((item) => item.toLowerCase());
  const activeMedications = input.patient.medications.map((item) => item.toLowerCase());

  if (medicationName && allergies.some((item) => item.includes("penicillin")) && medicationName.includes("amoxicillin")) {
    alerts.push({
      type: "allergy",
      severity: "critical",
      title: "Drug allergy conflict",
      message: "Patient allergic to penicillin. Review before prescribing amoxicillin."
    });
  }

  if (medicationName.includes("warfarin") && activeMedications.some((item) => item.includes("ibuprofen"))) {
    alerts.push({
      type: "interaction",
      severity: "warning",
      title: "Potential drug interaction",
      message: "Ibuprofen and warfarin together may increase bleeding risk."
    });
  }

  const dueImmunization = input.immunizations?.find((item) => getReminderState(item.nextDueDate) !== "up_to_date");
  if (dueImmunization) {
    alerts.push({
      type: "preventive",
      severity: getReminderState(dueImmunization.nextDueDate) === "overdue" ? "warning" : "info",
      title: "Preventive care reminder",
      message: `${dueImmunization.vaccineName} follow-up is ${getReminderState(dueImmunization.nextDueDate) === "overdue" ? "overdue" : "due within 30 days"}.`
    });
  }

  return alerts;
}

export function getImmunizationReminderStatus(nextDueDate: string | null) {
  return getReminderState(nextDueDate);
}