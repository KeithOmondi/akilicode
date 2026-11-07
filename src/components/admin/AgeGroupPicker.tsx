import { AGE_GROUPS } from "../../lib/ageGroups";

interface Props {
  value: string[];
  onChange: (next: string[]) => void;
  label?: string;
}

/** Tick the age groups something is for. Nothing ticked means it is for everyone. */
const AgeGroupPicker = ({ value, onChange, label = "Who is this for?" }: Props) => {
  const toggle = (id: string) => onChange(value.includes(id) ? value.filter((v) => v !== id) : [...value, id]);
  return (
    <fieldset>
      <legend className="text-sm font-semibold text-ink-700 mb-2">{label}</legend>
      <div className="flex flex-wrap gap-2">
        {AGE_GROUPS.map((g) => {
          const on = value.includes(g.id);
          return (
            <label key={g.id} className={`cursor-pointer select-none rounded-xl border px-3 py-2 text-sm font-semibold flex items-center gap-2 ${on ? "bg-brand-100 border-brand-500 text-brand-700" : "bg-white border-ink-200 text-ink-700 hover:bg-ink-100"}`}>
              <input type="checkbox" className="sr-only" checked={on} onChange={() => toggle(g.id)} />
              <span aria-hidden="true">{g.emoji}</span> {g.range} <span className="font-normal text-ink-500">{g.name}</span>
            </label>
          );
        })}
      </div>
      <p className="mt-2 text-xs text-ink-500">{value.length === 0 ? "Nothing ticked: every age group sees it." : "Only the ticked groups see it."}</p>
    </fieldset>
  );
};

export default AgeGroupPicker;
