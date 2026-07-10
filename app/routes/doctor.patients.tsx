import type { Route } from "./+types/doctor.patients";
import PractitionerPatientsPage from "~/components/therapy/PractitionerPatientsPage";
import { DOCTOR_PORTAL } from "~/lib/portal";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Patients - Ealthiness Doctor Portal" },
    {
      name: "description",
      content: "Manage your patients on the Ealthiness platform",
    },
  ];
}

export default function DoctorPatientsPage() {
  return <PractitionerPatientsPage portal={DOCTOR_PORTAL} />;
}
