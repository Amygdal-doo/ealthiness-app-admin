import type { Route } from "./+types/doctor.patient.$id";
import PractitionerPatientDetailPage from "~/components/therapy/PractitionerPatientDetailPage";
import { DOCTOR_PORTAL } from "~/lib/portal";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Patient Details - Ealthiness Doctor Portal" },
    {
      name: "description",
      content: "View patient details on the Ealthiness platform",
    },
  ];
}

export default function DoctorPatientDetailPage() {
  return <PractitionerPatientDetailPage portal={DOCTOR_PORTAL} />;
}
