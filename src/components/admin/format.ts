export const money = (n: number | string) => `KES ${Number(n || 0).toLocaleString()}`;
export const dateShort = (d?: string | Date | null) =>
  d ? new Date(d).toLocaleDateString("en-KE", { day: "numeric", month: "short", year: "numeric" }) : "—";
