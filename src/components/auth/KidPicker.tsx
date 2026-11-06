import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Loader2, ArrowLeft } from "lucide-react";
import api from "../../api/api";
import PinPad from "../kids/PinPad";
import { avatarOf } from "../../lib/avatars";

export interface PickerKid {
  id: string;
  name: string;
  avatar?: string | null;
  needs_new_pin: boolean;
}


/**
 * "Who's learning?" — shown on a browser a parent has set up as a family device.
 * Lists avatars and nicknames only; the child taps theirs and enters a 4-digit PIN.
 * Calls onUnavailable() when this browser has not been set up (the page then shows the username form).
 */
const KidPicker = ({
  onPick,
  onUnavailable,
  onUseUsername,
  busy,
}: {
  onPick: (kidId: string, pin: string) => void;
  onUnavailable: () => void;
  onUseUsername: () => void;
  busy: boolean;
}) => {
  const { t } = useTranslation();
  const [kids, setKids] = useState<PickerKid[] | null>(null);
  const [chosen, setChosen] = useState<PickerKid | null>(null);
  const [pin, setPin] = useState("");

  useEffect(() => {
    let alive = true;
    api
      .get<{ data: { kids: PickerKid[] } }>("/kids/picker")
      .then((r) => alive && (r.data.data.kids.length ? setKids(r.data.data.kids) : onUnavailable()))
      .catch(() => alive && onUnavailable());
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!kids) {
    return (
      <div className="flex justify-center py-10" role="status" aria-label={t("common.loading")}>
        <Loader2 className="animate-spin text-purple-500" size={32} />
      </div>
    );
  }

  if (chosen) {
    return (
      <div className="text-center">
        <button
          type="button"
          onClick={() => { setChosen(null); setPin(""); }}
          className="flex items-center gap-1 text-purple-700 font-bold mb-3"
        >
          <ArrowLeft size={18} /> {t("common.back")}
        </button>
        <div className="text-6xl mb-1" aria-hidden="true">{avatarOf(chosen, kids.indexOf(chosen))}</div>
        <h2 className="text-2xl font-black text-purple-900 mb-4">{t("kidPicker.hello", { name: chosen.name })}</h2>
        {chosen.needs_new_pin ? (
          <p className="bg-orange-50 border-2 border-orange-200 text-orange-800 rounded-2xl p-4 font-bold">
            {t("kidPicker.needsNewPin")}
          </p>
        ) : (
          <>
            <p className="text-slate-500 mb-4 font-medium">{t("kidPicker.enterPin")}</p>
            <PinPad
              value={pin}
              onChange={setPin}
              disabled={busy}
              onComplete={(p) => {
                onPick(chosen.id, p);
                setTimeout(() => setPin(""), 600); // clear so a wrong PIN can be retyped
              }}
            />
          </>
        )}
      </div>
    );
  }

  return (
    <div className="text-center">
      <h2 className="text-2xl font-black text-purple-900 mb-5">{t("kidPicker.whoIsLearning")}</h2>
      <div className="grid grid-cols-2 gap-4">
        {kids.map((k, i) => (
          <button
            key={k.id}
            type="button"
            onClick={() => setChosen(k)}
            className="rounded-3xl bg-white border-4 border-purple-100 hover:border-orange-300 active:scale-95 transition-all p-5 shadow-sm"
          >
            <div className="text-6xl" aria-hidden="true">{avatarOf(k, i)}</div>
            <div className="mt-2 text-lg font-black text-purple-900 truncate">{k.name}</div>
          </button>
        ))}
      </div>
      <button type="button" onClick={onUseUsername} className="mt-6 text-sm font-bold text-purple-700 underline underline-offset-4">
        {t("kidPicker.useUsername")}
      </button>
    </div>
  );
};

export default KidPicker;
