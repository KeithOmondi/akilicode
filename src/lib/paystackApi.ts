import api from "../api/api";
import { isPaystackCheckoutUrl } from "./paystackUrl";

/** Is card payment switched on? (When the server has no Paystack key, the option is hidden.) */
export const fetchPaystackEnabled = async (): Promise<boolean> => {
  try {
    const res = await api.get("/paystack/enabled");
    return Boolean(res.data?.data?.enabled);
  } catch {
    return false;
  }
};

/** Ask the server to start a card payment for this enrollment. The amount is decided by the server. Returns the page to open. */
export const startPaystack = async (enrollmentId: string): Promise<string> => {
  const res = await api.post("/paystack/initialize", { enrollment_id: enrollmentId });
  const url: unknown = res.data?.data?.authorization_url;
  if (!isPaystackCheckoutUrl(url)) throw new Error("The payment page could not be opened. Please try again.");
  return url;
};

export interface PaystackVerifyResult {
  payment_status: "pending" | "completed" | "failed" | "expired" | "review" | string;
  enrollment_id: string;
  enrollment_status?: string;
  reason?: string;
}

/** Ask the server what really happened to a payment (the server asks Paystack; the browser is never believed). */
export const verifyPaystack = async (reference: string): Promise<PaystackVerifyResult> => {
  const res = await api.get(`/paystack/verify/${encodeURIComponent(reference)}`);
  return res.data.data as PaystackVerifyResult;
};

/** The server's own message for a failed request, or a fallback. */
export const errorMessage = (err: unknown, fallback: string): string => {
  const e = err as { response?: { data?: { message?: string } }; message?: string };
  return e?.response?.data?.message || e?.message || fallback;
};
