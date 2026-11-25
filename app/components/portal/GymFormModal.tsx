import { useEffect, useState } from "react";
import { useInviteGymAdmin, useSaveGym } from "~/hooks/useOrgAdminApi";
import { isEmail } from "~/lib/portals/format";
import type { Gym } from "~/lib/portals/types";
import { getApiErrorMessage } from "~/lib/services/api";
import { Notice, inputClass, primaryBtn, secondaryBtn } from "./PortalPage";
import { Field, PortalModal } from "./PortalModal";

/* Create/edit a gym (POST/PUT /v1/gym) — super admin. */
export function GymFormModal({ open, gym, onClose, onDone }: {
  open: boolean;
  gym: Gym | null;
  onClose: () => void;
  onDone: (message: string) => void;
}) {
  const save = useSaveGym();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [contact, setContact] = useState("");

  useEffect(() => {
    if (!open) return;
    setName(gym?.name ?? "");
    setEmail(gym?.email ?? "");
    setAddress(gym?.address ?? "");
    setContact(gym?.contact ?? "");
    save.reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, gym?._id]);

  const valid = name.trim().length >= 2 && name.trim().length <= 60 && (!email.trim() || isEmail(email));

  const submit = async () => {
    if (!valid) return;
    try {
      await save.mutateAsync({
        id: gym?._id,
        data: {
          name: name.trim(),
          email: email.trim() || undefined,
          address: address.trim() || undefined,
          contact: contact.trim() || undefined,
        },
      });
      onDone(gym ? `Saved ${name.trim()}.` : `Created ${name.trim()}.`);
    } catch {
      /* shown below */
    }
  };

  return (
    <PortalModal
      open={open}
      title={gym ? "Edit gym" : "New gym"}
      busy={save.isPending}
      onClose={onClose}
      footer={
        <>
          <button className={secondaryBtn} onClick={onClose} disabled={save.isPending}>Cancel</button>
          <button className={primaryBtn} onClick={submit} disabled={!valid || save.isPending}>
            {save.isPending ? "Saving..." : gym ? "Save" : "Create gym"}
          </button>
        </>
      }
    >
      <Field label="Name">
        <input className={inputClass} maxLength={60} value={name} onChange={(e) => setName(e.target.value)} />
      </Field>
      <Field label="Email (optional)">
        <input className={inputClass} type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
      </Field>
      <Field label="Address (optional)">
        <input className={inputClass} value={address} onChange={(e) => setAddress(e.target.value)} />
      </Field>
      <Field label="Phone (optional)">
        <input className={inputClass} value={contact} onChange={(e) => setContact(e.target.value)} />
      </Field>
      {save.isError && <Notice tone="error">{getApiErrorMessage(save.error, "Couldn't save the gym.")}</Notice>}
    </PortalModal>
  );
}

/* Invite someone to run a gym (POST /v1/gym/:id/admins/invite) — emails a
 * link to /admin-registration?adminType=gym. */
export function InviteGymAdminModal({ gym, onClose, onDone }: {
  gym: Gym | null;
  onClose: () => void;
  onDone: (message: string) => void;
}) {
  const invite = useInviteGymAdmin();
  const [email, setEmail] = useState("");

  useEffect(() => {
    if (gym) {
      setEmail("");
      invite.reset();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gym?._id]);

  const submit = async () => {
    if (!gym || !isEmail(email)) return;
    try {
      await invite.mutateAsync({ id: gym._id, email });
      onDone(`Invite sent to ${email.trim()} to run ${gym.name}.`);
    } catch {
      /* shown below */
    }
  };

  return (
    <PortalModal
      open={!!gym}
      title="Invite gym admin"
      busy={invite.isPending}
      onClose={onClose}
      footer={
        <>
          <button className={secondaryBtn} onClick={onClose} disabled={invite.isPending}>Cancel</button>
          <button className={primaryBtn} onClick={submit} disabled={!isEmail(email) || invite.isPending}>
            {invite.isPending ? "Sending..." : "Send invite"}
          </button>
        </>
      }
    >
      <p className="text-sm text-[#60646C]">They get an email link; on accepting they become an admin of {gym?.name}.</p>
      <Field label="Email">
        <input className={inputClass} type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="manager@gym.com" />
      </Field>
      {invite.isError && <Notice tone="error">{getApiErrorMessage(invite.error, "Couldn't send the invite.")}</Notice>}
    </PortalModal>
  );
}
