import type { Route } from "./+types/doctor.session.$id";
import PractitionerSessionDetailPage from "~/components/therapy/PractitionerSessionDetailPage";
import { DOCTOR_PORTAL } from "~/lib/portal";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Session Details - Ealthiness Doctor Portal" },
    {
      name: "description",
      content: "View therapy session details on the Ealthiness platform",
    },
  ];
}

export default function DoctorSessionDetailPage() {
  return <PractitionerSessionDetailPage portal={DOCTOR_PORTAL} />;
}
