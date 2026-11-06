import { Delete } from "lucide-react";

/**
 * Big-button PIN entry for children. Every digit has a picture, so a child who cannot read yet
 * can use a "picture password" ("dog, fish, cat, star") — it is still the same 4 digits underneath.
 */
const PICTURES = ["⭐", "🐶", "🐱", "🐟", "🐦", "🐢", "🦁", "🐸", "🐼", "🦄"]; // index = digit

interface Props {
  value: string;
  onChange: (v: string) => void;
  /** Called once when the 4th digit is entered. */
  onComplete?: (v: string) => void;
  disabled?: boolean;
  /** Show the picture above each number (recommended for ages 4–7). */
  pictures?: boolean;
}

const PinPad = ({ value, onChange, onComplete, disabled, pictures = true }: Props) => {
  const press = (d: string) => {
    if (disabled || value.length >= 4) return;
    const next = value + d;
    onChange(next);
    if (next.length === 4) onComplete?.(next);
  };

  return (
    <div className="select-none">
      {/* what has been typed so far: 4 dots, shown as pictures when pictures are on */}
      <div className="flex justify-center gap-3 mb-5" role="img" aria-label={`${value.length} of 4 digits entered`}>
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={`w-14 h-14 rounded-2xl border-4 flex items-center justify-center text-3xl transition-all ${
              i < value.length ? "border-orange-400 bg-orange-50" : "border-purple-100 bg-white"
            }`}
          >
            {i < value.length ? (pictures ? PICTURES[Number(value[i])] : "●") : ""}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-3 max-w-xs mx-auto">
        {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((d) => (
          <Key key={d} digit={d} pictures={pictures} disabled={disabled} onPress={press} />
        ))}
        <span />
        <Key digit="0" pictures={pictures} disabled={disabled} onPress={press} />
        <button
          type="button"
          disabled={disabled || value.length === 0}
          onClick={() => onChange(value.slice(0, -1))}
          aria-label="Delete last digit"
          className="h-20 rounded-2xl bg-slate-100 text-slate-600 flex items-center justify-center active:scale-95 disabled:opacity-40"
        >
          <Delete size={28} />
        </button>
      </div>
    </div>
  );
};

const Key = ({ digit, pictures, disabled, onPress }: { digit: string; pictures: boolean; disabled?: boolean; onPress: (d: string) => void }) => (
  <button
    type="button"
    disabled={disabled}
    onClick={() => onPress(digit)}
    aria-label={`Number ${digit}`}
    className="h-20 rounded-2xl bg-white border-2 border-purple-100 shadow-sm hover:border-orange-300 active:scale-95 transition-all flex flex-col items-center justify-center disabled:opacity-50"
  >
    {pictures && <span className="text-2xl leading-none" aria-hidden="true">{PICTURES[Number(digit)]}</span>}
    <span className="text-xl font-black text-purple-800 leading-none mt-1">{digit}</span>
  </button>
);

export default PinPad;
