import type { Route } from "./+types/psychologist.session.$id";
import PractitionerSessionDetailPage from "~/components/therapy/PractitionerSessionDetailPage";
import { PSYCHOLOGIST_PORTAL } from "~/lib/portal";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Session Details - Ealthiness Psychologist Portal" },
    {
      name: "description",
      content: "View therapy session details on the Ealthiness platform",
    },
  ];
}

export default function PsychologistSessionDetailPage() {
  return <PractitionerSessionDetailPage portal={PSYCHOLOGIST_PORTAL} />;
}
