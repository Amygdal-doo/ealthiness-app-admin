import { useEffect, useMemo, useState } from "react";
import { Gift } from "lucide-react";
import { useCareWorkspace, useGiftPlan } from "~/hooks/useTrainerApi";
import { getApiErrorMessage } from "~/lib/services/api";
import { Notice, inputClass, primaryBtn, secondaryBtn } from "./PortalPage";
import { Field, PortalModal } from "./PortalModal";

/* Trainer gives one of their plans to one of their clients for free.
 * Clients come from GET /v1/care/workspace; POST /v1/trainer-plans/:id/gift */

export function GiftPlanModal({ plan, onClose, onDone }: {
  plan: { id: string; title: string } | null;
  onClose: () => void;
  onDone: (message: string) => void;
}) {
  const { data, isLoading } = useCareWorkspace(!!plan);
  const gift = useGiftPlan();
  const [client, setClient] = useState("");

  const clients = useMemo(() => {
    const seen = new Map<string, string>();
    for (const s of data?.sections ?? []) {
      for (const c of s.clients) if (!seen.has(c.userId)) seen.set(c.userId, c.name || "Unnamed");
    }
    return [...seen.entries()].map(([id, name]) => ({ id, name })).sort((a, b) => a.name.localeCompare(b.name));
  }, [data]);

  useEffect(() => {
    if (plan) {
      setClient("");
      gift.reset();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [plan?.id]);

  const submit = async () => {
    if (!plan || !client) return;
    try {
      const res = await gift.mutateAsync({ planId: plan.id, client });
      const name = clients.find((c) => c.id === client)?.name ?? "Your client";
      onDone(res.already ? `${name} already has “${plan.title}”.` : `Gifted “${plan.title}” to ${name}.`);
    } catch {
      /* shown below */
    }
  };

  return (
    <PortalModal
      open={!!plan}
      title="Gift plan to a client"
      busy={gift.isPending}
      onClose={onClose}
      footer={
        <>
          <button className={secondaryBtn} onClick={onClose} disabled={gift.isPending}>Cancel</button>
          <button className={primaryBtn} onClick={submit} disabled={!client || gift.isPending}>
            <Gift size={14} /> {gift.isPending ? "Gifting..." : "Gift plan"}
          </button>
        </>
      }
    >
      <p className="text-sm text-[#60646C]">
        Your client gets “{plan?.title}” for free. You earn nothing from a gift.
      </p>
      <Field label="Client">
        <select className={inputClass} value={client} onChange={(e) => setClient(e.target.value)} disabled={isLoading}>
          <option value="">{isLoading ? "Loading clients..." : clients.length ? "Choose a client" : "No clients yet"}</option>
          {clients.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </Field>
      {gift.isError && <Notice tone="error">{getApiErrorMessage(gift.error, "Couldn't gift the plan.")}</Notice>}
    </PortalModal>
  );
}
