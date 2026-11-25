import { useState } from "react";
import { Link } from "react-router";
import { Building, Eye, Mail, Pencil, Plus, Trash2 } from "lucide-react";
import type { Route } from "./+types/gyms";
import { ConfirmDeleteModal } from "~/components/modals/ConfirmDeleteModal";
import { GymFormModal, InviteGymAdminModal } from "~/components/portal/GymFormModal";
import { EmptyState, Notice, Panel, PortalPage, Spinner, dangerBtn, primaryBtn, secondaryBtn, tdClass, thClass } from "~/components/portal/PortalPage";
import { useDeleteGym, useGyms } from "~/hooks/useOrgAdminApi";
import { formatDate } from "~/lib/portals/format";
import type { Gym } from "~/lib/portals/types";
import { getApiErrorMessage } from "~/lib/services/api";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Gyms - Ealthiness Admin Portal" }];
}

/* Super admin: gyms CRUD + invite a gym admin.
 * GET/POST /v1/gym, PUT/DELETE /v1/gym/:id, POST /v1/gym/:id/admins/invite */
export default function GymsPage() {
  const { data = [], isLoading, isError, error } = useGyms();
  const del = useDeleteGym();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Gym | null>(null);
  const [inviting, setInviting] = useState<Gym | null>(null);
  const [deleting, setDeleting] = useState<Gym | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const done = (m: string) => {
    setFormOpen(false);
    setEditing(null);
    setInviting(null);
    setMessage(m);
  };

  const confirmDelete = async () => {
    if (!deleting) return;
    try {
      await del.mutateAsync(deleting._id);
      setMessage(`Deleted ${deleting.name}.`);
      setDeleting(null);
    } catch {
      setDeleting(null);
    }
  };

  return (
    <PortalPage
      allowedRoles={["SUPER_ADMIN"]}
      icon={Building}
      title="Gyms"
      subtitle="Gyms on Ealthiness. Each gym's admins invite their own trainers and members."
      actions={
        <button className={primaryBtn} onClick={() => { setEditing(null); setFormOpen(true); }}>
          <Plus size={14} /> New gym
        </button>
      }
    >
      {message && <Notice tone="success">{message}</Notice>}
      {isError && <Notice tone="error">{getApiErrorMessage(error, "Couldn't load gyms.")}</Notice>}
      {del.isError && <Notice tone="error">{getApiErrorMessage(del.error, "Couldn't delete the gym. Only empty gyms can be deleted.")}</Notice>}

      <Panel>
        {isLoading ? (
          <Spinner label="Loading gyms..." />
        ) : data.length === 0 ? (
          <EmptyState icon={Building} title="No gyms yet" text="Create a gym, then invite the person who runs it." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-[#F8F9FB] border-b border-[#E0E1E6]">
                <tr>
                  <th className={thClass}>Gym</th>
                  <th className={`${thClass} hidden md:table-cell`}>Contact</th>
                  <th className={`${thClass} hidden lg:table-cell`}>Created</th>
                  <th className={`${thClass} text-right`}>Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E0E1E6]">
                {data.map((g) => (
                  <tr key={g._id} className="align-top">
                    <td className={tdClass}>
                      <span className="font-bold text-[#1B173A] block">{g.name}</span>
                      {g.address && <span className="text-xs text-[#8E8E93]">{g.address}</span>}
                    </td>
                    <td className={`${tdClass} hidden md:table-cell`}>
                      <span className="block break-all">{g.email || "—"}</span>
                      {g.contact && <span className="text-xs text-[#8E8E93]">{g.contact}</span>}
                    </td>
                    <td className={`${tdClass} hidden lg:table-cell whitespace-nowrap`}>{formatDate(g.createdAt)}</td>
                    <td className={tdClass}>
                      <div className="flex flex-wrap justify-end gap-2">
                        <Link to={`/gym?gym=${g._id}`} className={secondaryBtn}><Eye size={14} /> Overview</Link>
                        <button className={secondaryBtn} onClick={() => setInviting(g)}><Mail size={14} /> Invite admin</button>
                        <button className={secondaryBtn} onClick={() => { setEditing(g); setFormOpen(true); }}><Pencil size={14} /> Edit</button>
                        <button className={dangerBtn} onClick={() => setDeleting(g)}><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>

      <GymFormModal open={formOpen} gym={editing} onClose={() => setFormOpen(false)} onDone={done} />
      <InviteGymAdminModal gym={inviting} onClose={() => setInviting(null)} onDone={done} />
      <ConfirmDeleteModal
        isOpen={!!deleting}
        onClose={() => setDeleting(null)}
        onConfirm={confirmDelete}
        isDeleting={del.isPending}
        title="Delete gym"
        description={`Delete ${deleting?.name ?? "this gym"}? Only a gym with no people can be deleted.`}
      />
    </PortalPage>
  );
}
