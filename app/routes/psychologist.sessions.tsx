import type { Route } from "./+types/psychologist.sessions";
import PractitionerSessionsPage from "~/components/therapy/PractitionerSessionsPage";
import { PSYCHOLOGIST_PORTAL } from "~/lib/portal";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Sessions - Ealthiness Psychologist Portal" },
    {
      name: "description",
      content: "Manage your therapy sessions on the Ealthiness platform",
    },
  ];
}

export default function PsychologistSessionsPage() {
  return <PractitionerSessionsPage portal={PSYCHOLOGIST_PORTAL} />;
}
