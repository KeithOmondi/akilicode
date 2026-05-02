
interface StatusBadgeProps {
  status: string;
}

export const StatusBadge = ({ status }: StatusBadgeProps) => {
  const map: Record<string, string> = {
    completed: "bg-green-50 text-green-700 border-green-200",
    active:    "bg-green-50 text-green-700 border-green-200",
    pending:   "bg-orange-50 text-orange-700 border-orange-200",
    failed:    "bg-red-50 text-red-700 border-red-200",
  };
  return (
    <span className={`inline-block px-3 py-1 rounded-lg text-[10px] font-black border uppercase tracking-widest ${map[status] ?? map.pending}`}>
      {status}
    </span>
  );
};