import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { ShieldCheck } from "lucide-react";
import api from "../../api/api";

export interface ConsentValue {
  accepted: true;
  is_guardian: true;
  version: string;
}

interface ConsentDoc {
  version: string;
  title: string;
  items: { key: string; text: string }[];
  draft: boolean;
}

/**
 * Shows exactly what the parent is agreeing to (text comes from the server, one editable file,
 * versioned) and reports `ConsentValue` once they have ticked the box. Reports null while unticked.
 */
const ConsentPanel = ({ onChange }: { onChange: (v: ConsentValue | null) => void }) => {
  const { t } = useTranslation();
  const [doc, setDoc] = useState<ConsentDoc | null>(null);
  const [ticked, setTicked] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    api
      .get<{ data: ConsentDoc }>("/kids/consent-document")
      .then((r) => setDoc(r.data.data))
      .catch(() => setFailed(true));
  }, []);

  useEffect(() => {
    onChange(doc && ticked ? { accepted: true, is_guardian: true, version: doc.version } : null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [doc, ticked]);

  if (failed) return <p role="alert" className="text-sm text-red-600 font-bold">{t("consent.loadFailed")}</p>;
  if (!doc) return <p className="text-sm text-slate-500">{t("common.loading")}</p>;

  return (
    <fieldset className="border-2 border-purple-100 rounded-2xl p-4 bg-purple-50/40">
      <legend className="px-2 flex items-center gap-2 font-black text-purple-900">
        <ShieldCheck size={18} aria-hidden="true" /> {doc.title}
      </legend>
      <ul className="space-y-2 text-sm text-slate-700 list-disc pl-5">
        {doc.items.map((i) => <li key={i.key}>{i.text}</li>)}
      </ul>
      <label className="flex items-start gap-3 mt-4 font-bold text-purple-900 text-sm">
        <input type="checkbox" className="mt-0.5 h-5 w-5 shrink-0" checked={ticked} onChange={(e) => setTicked(e.target.checked)} />
        <span>{t("consent.agree")}</span>
      </label>
      <p className="text-[11px] text-slate-400 mt-2">
        {t("consent.version", { v: doc.version })}{doc.draft ? ` · ${t("consent.draft")}` : ""}
      </p>
    </fieldset>
  );
};

export default ConsentPanel;
