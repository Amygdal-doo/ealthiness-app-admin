import type { Route } from "./+types/doctor.sessions";
import PractitionerSessionsPage from "~/components/therapy/PractitionerSessionsPage";
import { DOCTOR_PORTAL } from "~/lib/portal";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Sessions - Ealthiness Doctor Portal" },
    {
      name: "description",
      content: "Manage your therapy sessions on the Ealthiness platform",
    },
  ];
}

export default function DoctorSessionsPage() {
  return <PractitionerSessionsPage portal={DOCTOR_PORTAL} />;
}
