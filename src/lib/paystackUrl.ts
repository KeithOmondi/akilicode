/**
 * Small, dependency-free helpers for the Paystack redirect flow (kept apart from the API code so they can be tested).
 */

/** Paystack adds ?reference=...&trxref=... when it sends the parent back. Only a sane-looking reference is accepted. */
export const paystackReferenceFromSearch = (search: string): string | null => {
  const params = new URLSearchParams(search);
  const ref = params.get("reference") ?? params.get("trxref");
  return ref && /^[A-Za-z0-9._=-]{6,100}$/.test(ref) ? ref : null;
};

/** The page we send the parent to must be a secure Paystack address, whatever the server answered. */
export const isPaystackCheckoutUrl = (value: unknown): value is string => {
  if (typeof value !== "string") return false;
  try {
    const url = new URL(value);
    return url.protocol === "https:" && (url.hostname === "paystack.com" || url.hostname.endsWith(".paystack.com"));
  } catch {
    return false;
  }
};
