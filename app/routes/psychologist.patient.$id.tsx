import type { Route } from "./+types/psychologist.patient.$id";
import PractitionerPatientDetailPage from "~/components/therapy/PractitionerPatientDetailPage";
import { PSYCHOLOGIST_PORTAL } from "~/lib/portal";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Patient Details - Ealthiness Psychologist Portal" },
    {
      name: "description",
      content: "View patient details on the Ealthiness platform",
    },
  ];
}

export default function PsychologistPatientDetailPage() {
  return <PractitionerPatientDetailPage portal={PSYCHOLOGIST_PORTAL} />;
}
