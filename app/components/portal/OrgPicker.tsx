import { useEffect } from "react";
import { inputClass } from "./PortalPage";

/* Choose which organisation (gym, hospital, company) the page works on.
 * Auto-selects the first one; hidden when there is only one. */

interface OrgPickerProps {
  orgs: { id: string; name: string }[];
  value: string | null;
  onChange: (id: string) => void;
  label: string;
}

export function OrgPicker({ orgs, value, onChange, label }: OrgPickerProps) {
  useEffect(() => {
    if (orgs.length && (!value || !orgs.some((o) => o.id === value))) {
      onChange(orgs[0].id);
    }
  }, [orgs, value, onChange]);

  if (orgs.length <= 1) return null;
  return (
    <div className="mb-4 max-w-sm">
      <label className="block text-xs font-bold text-[#60646C] uppercase tracking-wider mb-1.5">{label}</label>
      <select className={inputClass} value={value ?? ""} onChange={(e) => onChange(e.target.value)}>
        {orgs.map((o) => (
          <option key={o.id} value={o.id}>
            {o.name}
          </option>
        ))}
      </select>
    </div>
  );
}
