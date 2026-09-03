import type { Route } from "./+types/psychologist.patients";
import PractitionerPatientsPage from "~/components/therapy/PractitionerPatientsPage";
import { PSYCHOLOGIST_PORTAL } from "~/lib/portal";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Patients - Ealthiness Psychologist Portal" },
    {
      name: "description",
      content: "Manage your patients on the Ealthiness platform",
    },
  ];
}

export default function PsychologistPatientsPage() {
  return <PractitionerPatientsPage portal={PSYCHOLOGIST_PORTAL} />;
}
