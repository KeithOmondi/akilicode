import { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import {
  BookOpen, Plus, CreditCard, User, X,
  Clock, GraduationCap, Wallet, CheckCircle2,
  AlertTriangle, CalendarClock, BadgeCheck,
  InfinityIcon,
} from "lucide-react";
import { getMyEnrollments, enrollKid } from "../../store/slices/enrollmentSlice";
import { getMyKids } from "../../store/slices/kidSlice";
import { getAllCourses } from "../../store/slices/courseSlice";
import { initiateStkPush, clearCheckoutRequest } from "../../store/slices/paymentSlice";
import type { AppDispatch, RootState } from "../../store/store";
import api from "../../api/api";
import { errorMessage, fetchPaystackEnabled, startPaystack, verifyPaystack } from "../../lib/paystackApi";
import { paystackReferenceFromSearch } from "../../lib/paystackUrl";

// ─── Types ───────────────────────────────────────────────────────────────────
type BillingCycle = "monthly" | "termly" | "once-off";
type PayMethod = "mpesa" | "card";

interface EnrollWithPaymentPayload {
  kid_id:        string;
  course_id:     string;
  fee_amount:    number;
  billing_cycle: BillingCycle; // ← fixed: was `string`
  start_date?:   string;
  payNow?:       boolean;
  phone?:        string;
  /** How the parent pays: an M-Pesa prompt on their phone, or a card payment page from Paystack. */
  method?:       PayMethod;
}

interface BackendError {
  message?: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
const formatDate = (dateStr: string) =>
  new Date(dateStr).toLocaleDateString("en-KE", {
    year: "numeric", month: "short", day: "numeric",
  });

const getDaysUntil = (dateStr: string): number => {
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const due   = new Date(dateStr); due.setHours(0, 0, 0, 0);
  return Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
};

// ─── Payment Status Banner ────────────────────────────────────────────────────
const PaymentStatusBanner = ({
  payment_status, next_payment_date, billing_cycle,
}: {
  payment_status?: string;
  next_payment_date?: string | null;
  billing_cycle: string;
}) => {
  if (!payment_status || payment_status === "unpaid" || payment_status === "cancelled") return null;

  if (payment_status === "once-off") return (
    <div className="mt-3 p-3 bg-green-50 rounded-xl flex items-center gap-2 text-[10px] font-bold text-green-700 uppercase tracking-tighter border border-green-100">
      <InfinityIcon size={13} /> Fully Paid — No Further Payments Due
    </div>
  );

  if (payment_status === "overdue") return (
    <div className="mt-3 p-3 bg-red-50 rounded-xl border border-red-100">
      <div className="flex items-center gap-2 text-[10px] font-bold text-red-700 uppercase tracking-tighter mb-1">
        <AlertTriangle size={13} /> Payment Overdue
      </div>
      {next_payment_date && <p className="text-[10px] text-red-500">Was due {formatDate(next_payment_date)}</p>}
    </div>
  );

  if (payment_status === "due_soon") {
    const days = next_payment_date ? getDaysUntil(next_payment_date) : null;
    return (
      <div className="mt-3 p-3 bg-amber-50 rounded-xl border border-amber-100">
        <div className="flex items-center gap-2 text-[10px] font-bold text-amber-700 uppercase tracking-tighter mb-1">
          <CalendarClock size={13} />
          {days === 0 ? "Payment Due Today!" : `Payment Due in ${days} Day${days === 1 ? "" : "s"}`}
        </div>
        {next_payment_date && <p className="text-[10px] text-amber-600">{formatDate(next_payment_date)} · KES</p>}
      </div>
    );
  }

  if (payment_status === "paid" && next_payment_date) return (
    <div className="mt-3 p-3 bg-purple-50 rounded-xl border border-purple-100">
      <div className="flex items-center gap-2 text-[10px] font-bold text-purple-700 uppercase tracking-tighter mb-1">
        <BadgeCheck size={13} /> Next Payment
      </div>
      <p className="text-[10px] text-purple-500">{formatDate(next_payment_date)} · {billing_cycle}</p>
    </div>
  );

  return null;
};

// ─── Status Badge ─────────────────────────────────────────────────────────────
const StatusBadge = ({ status }: { status: string }) => {
  const map: Record<string, string> = {
    completed: "bg-green-50 text-green-700 border-green-200",
    active:    "bg-green-50 text-green-700 border-green-200",
    pending:   "bg-amber-50 text-amber-700 border-amber-200",
    cancelled: "bg-red-50 text-red-700 border-red-200",
  };
  return (
    <span className={`inline-block px-3 py-1 rounded-lg text-[10px] font-black border uppercase tracking-widest ${map[status] ?? map.pending}`}>
      {status === "pending" ? "Unpaid" : status}
    </span>
  );
};

// ─── Modal Overlay ────────────────────────────────────────────────────────────
const ModalOverlay = ({ onClose, children }: { onClose: () => void; children: React.ReactNode }) => (
  <div
    className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-sm"
    onClick={(e) => e.target === e.currentTarget && onClose()}
  >
    <div className="bg-white rounded-t-[28px] sm:rounded-[28px] shadow-2xl w-full max-w-md border border-slate-100 overflow-hidden animate-in fade-in slide-in-from-bottom-4 sm:zoom-in duration-200">
      {children}
    </div>
  </div>
);

// ─── Choose how to pay ────────────────────────────────────────────────────────
const MethodSwitch = ({ value, onChange }: { value: PayMethod; onChange: (m: PayMethod) => void }) => {
  const option = (m: PayMethod, title: string, hint: string) => (
    <button
      type="button"
      onClick={() => onChange(m)}
      aria-pressed={value === m}
      className={`flex-1 text-left rounded-2xl border-2 px-4 py-3 transition-all ${value === m ? "border-orange-500 bg-orange-50" : "border-purple-100 bg-white hover:border-purple-200"}`}
    >
      <span className="block text-sm font-black text-purple-900">{title}</span>
      <span className="block text-[11px] text-gray-500 mt-0.5">{hint}</span>
    </button>
  );
  return (
    <div className="flex gap-3" role="group" aria-label="How do you want to pay?">
      {option("mpesa", "M-Pesa", "A prompt on your phone")}
      {option("card", "Card", "Visa or Mastercard, secure page")}
    </div>
  );
};

// ─── Pay for an enrollment that is still unpaid ──────────────────────────────
interface PayDialogProps {
  course: string;
  kid: string;
  amount: number;
  paystackOn: boolean;
  busy: boolean;
  onClose: () => void;
  onMpesa: (phone: string) => void;
  onCard: () => void;
}
const PayDialog = ({ course, kid, amount, paystackOn, busy, onClose, onMpesa, onCard }: PayDialogProps) => {
  const [method, setMethod] = useState<PayMethod>("mpesa");
  const [phone, setPhone] = useState("");
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (method === "card") return onCard();
    if (!/^254\d{9}$/.test(phone)) return void toast.error("Enter a valid M-Pesa number (254...)");
    onMpesa(phone);
  };
  return (
    <ModalOverlay onClose={onClose}>
      <div className="px-6 py-5 border-b border-purple-50 flex items-center justify-between bg-gradient-to-r from-purple-700 to-purple-800">
        <div>
          <h2 className="text-lg font-black text-white">Pay KES {amount.toLocaleString()}</h2>
          <p className="text-xs text-purple-200 mt-0.5">{kid} · {course}</p>
        </div>
        <button onClick={onClose} className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors" aria-label="Close">
          <X size={18} />
        </button>
      </div>
      <form onSubmit={submit} className="px-6 py-6 space-y-4">
        {paystackOn && <MethodSwitch value={method} onChange={setMethod} />}
        {method === "mpesa" ? (
          <div className="bg-orange-50 p-4 rounded-2xl border border-orange-100">
            <div className="flex items-center gap-3 mb-3">
              <Wallet className="text-orange-500" size={20} />
              <span className="text-sm font-bold text-orange-900">M-Pesa number</span>
            </div>
            <input
              type="tel" required placeholder="2547XXXXXXXX" value={phone} onChange={(e) => setPhone(e.target.value)}
              className="w-full bg-white border-2 border-orange-200 rounded-xl px-4 py-2 text-sm outline-none focus:border-orange-500 transition-all"
            />
            <p className="text-[10px] text-orange-600/70 mt-2 italic">A prompt will be sent to this phone.</p>
          </div>
        ) : (
          <div className="bg-purple-50 p-4 rounded-2xl border border-purple-100 text-sm text-purple-900">
            <div className="flex items-center gap-3 mb-2">
              <CreditCard className="text-purple-500" size={20} />
              <span className="font-bold">Pay on Paystack's secure page</span>
            </div>
            <p className="text-xs text-purple-700/80">You will enter your card there, and come straight back here when you are done. We never see your card details. To pay with M-Pesa, choose M-Pesa instead.</p>
          </div>
        )}
        <button type="submit" disabled={busy} className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-black py-4 rounded-2xl shadow-xl shadow-orange-200 transition-all">
          {busy ? "One moment…" : method === "card" ? "Continue to secure payment" : "Send M-Pesa prompt"}
        </button>
      </form>
    </ModalOverlay>
  );
};

// ─── Enroll Modal ─────────────────────────────────────────────────────────────
interface EnrollModalProps {
  onClose:  () => void;
  kids:     RootState["kid"]["kids"];
  courses:  RootState["course"]["courses"];
  loading:  boolean;
  paystackOn: boolean;
  onSubmit: (payload: EnrollWithPaymentPayload) => Promise<void>;
}

import { groupLabel, isForGroup } from "../../lib/ageGroups";

const EnrollModal = ({ onClose, kids, courses, loading, paystackOn, onSubmit }: EnrollModalProps) => {
  const kidGroup = (kidIdValue: string) => kids.find((k) => k.id === kidIdValue)?.age_group ?? null;
  const [kidId,        setKidId]        = useState("");
  const [courseId,     setCourseId]     = useState("");
  const [feeAmount,    setFeeAmount]    = useState("");
  const [billingCycle, setBillingCycle] = useState<BillingCycle>("monthly");
  const [phone,        setPhone]        = useState("");
  const [method,       setMethod]       = useState<PayMethod>("mpesa");

  const inputCls = "w-full bg-purple-50/50 border-2 border-transparent rounded-xl pl-11 pr-4 py-3 focus:bg-white focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 outline-none appearance-none transition-all text-sm font-medium text-gray-800 placeholder:text-gray-400";
  const labelCls = "block text-[11px] font-black text-purple-900 uppercase tracking-wider mb-1.5";

  const handleCourseChange = (selectedId: string) => {
    setCourseId(selectedId);
    const found = courses.find((c) => c.id === selectedId);
    setFeeAmount(found ? String(found.price) : "");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!kidId) { toast.error("Please select a student"); return; }
    if (!courseId) { toast.error("Please select a course"); return; }
    if (method === "mpesa" && (!phone || !/^254\d{9}$/.test(phone))) {
      toast.error("Enter a valid M-Pesa number (254...)");
      return;
    }
    await onSubmit({
      kid_id:        kidId,
      course_id:     courseId,
      fee_amount:    Number(feeAmount),
      billing_cycle: billingCycle, // already BillingCycle — no cast needed
      payNow:        true,
      phone:         method === "mpesa" ? phone : undefined,
      method,
    });
  };

  return (
    <ModalOverlay onClose={onClose}>
      <div className="px-6 py-5 border-b border-purple-50 flex items-center justify-between bg-gradient-to-r from-purple-700 to-purple-800">
        <div>
          <h2 className="text-lg font-black text-white">New Enrollment</h2>
          <p className="text-xs text-purple-200 mt-0.5">Activation requires payment</p>
        </div>
        <button onClick={onClose} className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors">
          <X size={18} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="px-6 py-6 space-y-4 max-h-[70vh] overflow-y-auto">
        <div className="grid grid-cols-1 gap-4">

          {/* Student */}
          <div>
            <label className={labelCls}>Student</label>
            <div className="relative">
              <User className="absolute left-3 top-3 text-purple-300" size={16} />
              <select required value={kidId} onChange={(e) => setKidId(e.target.value)} className={inputCls}>
                <option value="">Select a student</option>
                {kids.map((k) => <option key={k.id} value={k.id}>{k.name}</option>)}
              </select>
            </div>
          </div>

          {/* Course */}
          <div>
            <label className={labelCls}>Course</label>
            <div className="relative">
              <BookOpen className="absolute left-3 top-3 text-purple-300" size={16} />
              <select required value={courseId} onChange={(e) => handleCourseChange(e.target.value)} className={inputCls}>
                <option value="">Select a course</option>
                {(() => {
                  const active = courses.filter((c) => c.is_active).sort((a, b) => (a.path_order ?? 0) - (b.path_order ?? 0) || a.title.localeCompare(b.title));
                  const group = kidGroup(kidId);
                  const mine = active.filter((c) => isForGroup(c.age_groups, group));
                  const others = active.filter((c) => !isForGroup(c.age_groups, group));
                  const opt = (c: (typeof active)[number]) => <option key={c.id} value={c.id}>{c.path_order ? `${c.path_order}. ` : ""}{c.title}</option>;
                  return group ? (
                    <>
                      <optgroup label={`Best for ${groupLabel(group)}`}>{mine.map(opt)}</optgroup>
                      {others.length > 0 && <optgroup label="For other ages">{others.map(opt)}</optgroup>}
                    </>
                  ) : active.map(opt);
                })()}
              </select>
            </div>
          </div>

          {/* Fee & Cycle */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Fee (KES)</label>
              <div className="relative">
                <CreditCard className="absolute left-3 top-3 text-purple-300" size={16} />
                <input type="text" readOnly value={feeAmount} className={inputCls} placeholder="0.00" />
              </div>
            </div>
            <div>
              <label className={labelCls}>Cycle</label>
              <select
                value={billingCycle}
                onChange={(e) => setBillingCycle(e.target.value as BillingCycle)}
                className={inputCls}
              >
                <option value="monthly">Monthly</option>
                <option value="termly">Termly</option>
                <option value="once-off">Once-off</option>
              </select>
            </div>
          </div>

          {/* How to pay */}
          {paystackOn && <MethodSwitch value={method} onChange={setMethod} />}
          {method === "mpesa" ? (
            <div className="bg-orange-50 p-4 rounded-2xl border border-orange-100">
              <div className="flex items-center gap-3 mb-3">
                <Wallet className="text-orange-500" size={20} />
                <span className="text-sm font-bold text-orange-900">M-Pesa Activation</span>
              </div>
              <input
                type="tel"
                required
                placeholder="2547XXXXXXXX"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-white border-2 border-orange-200 rounded-xl px-4 py-2 text-sm outline-none focus:border-orange-500 transition-all"
              />
              <p className="text-[10px] text-orange-600/70 mt-2 italic">
                A prompt will be sent to this phone to activate the enrollment.
              </p>
            </div>
          ) : (
            <div className="bg-purple-50 p-4 rounded-2xl border border-purple-100">
              <div className="flex items-center gap-3 mb-2">
                <CreditCard className="text-purple-500" size={20} />
                <span className="text-sm font-bold text-purple-900">Pay by card (Paystack)</span>
              </div>
              <p className="text-[11px] text-purple-700/80">After you press the button you will pay on Paystack's secure page, then come back here.</p>
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-black py-4 rounded-2xl shadow-xl shadow-orange-200 transition-all flex items-center justify-center gap-2"
        >
          {loading ? "Processing..." : method === "card" ? "Enroll & Continue to Payment" : "Enroll & Pay Now"}
        </button>
      </form>
    </ModalOverlay>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────
const ParentEnrollments = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { enrollments, loading: enrollLoading } = useSelector((s: RootState) => s.enrollment);
  const { kids }                                = useSelector((s: RootState) => s.kid);
  const { courses, loading: courseLoading }     = useSelector((s: RootState) => s.course);
  const { loading: payLoading, checkoutRequestId } = useSelector((s: RootState) => s.payment);

  const [showEnrollModal, setShowEnrollModal] = useState(false);
  const [paystackOn, setPaystackOn] = useState(false);
  const [payFor, setPayFor] = useState<null | { id: string; course: string; kid: string; amount: number }>(null);
  const [payBusy, setPayBusy] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const pollRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    dispatch(getMyEnrollments());
    dispatch(getMyKids());
    dispatch(getAllCourses());
    void fetchPaystackEnabled().then(setPaystackOn);
  }, [dispatch]);

  useEffect(() => {
    if (checkoutRequestId) {
      toast.loading("Complete M-Pesa payment on your phone...", { id: "stk-push", duration: 60000 });
    } else {
      toast.dismiss("stk-push");
    }
  }, [checkoutRequestId]);

  useEffect(() => {
    return () => { if (pollRef.current) clearTimeout(pollRef.current); };
  }, []);

  /**
   * Ask the server for the real state of a payment. The server checks with Safaricom itself, so this is
   * what flips an enrollment to "paid" the moment the money has arrived. Returns true when we can stop asking.
   */
  const checkPayment = async (enrollmentId: string): Promise<boolean> => {
    try {
      const res = await api.get(`/mpesa/status/${enrollmentId}`);
      const { payment_status, enrollment_status, reason } = res.data.data;

      if (payment_status === "completed" && (enrollment_status === "active" || enrollment_status === "completed")) {
        toast.dismiss("stk-push");
        toast.success("Payment received. Enrollment is now active.");
        dispatch(clearCheckoutRequest());
        dispatch(getMyEnrollments());
        return true;
      }
      if (payment_status === "review") {
        toast.dismiss("stk-push");
        toast("We received your payment and are checking it. This usually takes a short while.", { icon: "🔎", duration: 8000 });
        dispatch(clearCheckoutRequest());
        dispatch(getMyEnrollments());
        return true;
      }
      if (payment_status === "failed" || payment_status === "expired") {
        toast.dismiss("stk-push");
        toast.error(reason || "The payment did not go through. Please try again.", { duration: 7000 });
        dispatch(clearCheckoutRequest());
        dispatch(getMyEnrollments());
        return true;
      }
    } catch {
      /* network hiccup: the next check will try again */
    }
    return false;
  };

  const stopPolling = () => {
    if (pollRef.current) clearTimeout(pollRef.current);
    pollRef.current = null;
  };

  // Right after the prompt is sent: ask every 4 seconds for a minute, then every 10 seconds for two more minutes.
  // (Each question makes the server ask Safaricom, which limits how often that is allowed.)
  const startPolling = (enrollmentId: string) => {
    stopPolling();
    let attempts = 0;
    const MAX_ATTEMPTS = 15 + 12;
    const next = () => {
      pollRef.current = setTimeout(async () => {
        attempts++;
        const done = await checkPayment(enrollmentId);
        if (done) return stopPolling();
        if (attempts >= MAX_ATTEMPTS) {
          stopPolling();
          toast.dismiss("stk-push");
          dispatch(clearCheckoutRequest());
          toast("Not confirmed yet. If you have paid, press “Check payment” on the card.", { icon: "⏳", duration: 8000 });
          return;
        }
        next();
      }, attempts < 15 ? 4000 : 10000);
    };
    next();
  };

  /** Send the parent to Paystack's secure page for this enrollment. */
  const goToPaystack = async (enrollmentId: string) => {
    toast.loading("Opening the secure payment page…", { id: "ps-open" });
    try {
      const url = await startPaystack(enrollmentId);
      window.location.assign(url); // the page is replaced: no need to dismiss the message
    } catch (err) {
      toast.dismiss("ps-open");
      toast.error(errorMessage(err, "Could not open the payment page. Please try again."), { duration: 7000 });
      setPayBusy(false);
    }
  };

  /** Back from Paystack (?reference=...): ask the server what really happened, a few times, then tell the parent. */
  const returnHandled = useRef(false);
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; };
  }, []);
  useEffect(() => {
    const reference = paystackReferenceFromSearch(location.search);
    if (!reference || returnHandled.current) return;
    returnHandled.current = true;
    navigate("/parent/programs", { replace: true }); // tidy the address bar
    toast.loading("Confirming your payment…", { id: "ps-verify" });
    (async () => {
      for (let attempt = 0; attempt < 6 && mounted.current; attempt++) {
        try {
          const r = await verifyPaystack(reference);
          if (r.payment_status === "completed") {
            toast.success("Payment received. Enrollment is now active.", { id: "ps-verify" });
            dispatch(getMyEnrollments());
            return;
          }
          if (r.payment_status === "review") {
            toast("We received your payment and are checking it. This usually takes a short while.", { id: "ps-verify", icon: "🔎", duration: 8000 });
            dispatch(getMyEnrollments());
            return;
          }
          if (r.payment_status === "failed" || r.payment_status === "expired") {
            toast.error(r.reason || "The payment did not go through. Please try again.", { id: "ps-verify", duration: 7000 });
            dispatch(getMyEnrollments());
            return;
          }
        } catch {
          /* a hiccup: try again */
        }
        await new Promise((resolve) => setTimeout(resolve, 3000));
      }
      if (mounted.current) toast("Not confirmed yet. If you have paid, press “Check payment” on the card in a moment.", { id: "ps-verify", icon: "⏳", duration: 9000 });
      dispatch(getMyEnrollments());
    })();
  }, [location.search, navigate, dispatch]);

  const [checking, setChecking] = useState<string | null>(null);
  const checkNow = async (enrollmentId: string) => {
    setChecking(enrollmentId);
    const done = await checkPayment(enrollmentId);
    setChecking(null);
    if (!done) toast("Still waiting for the payment to be confirmed. If you are paying by M-Pesa, finish the prompt on your phone, then check again.", { icon: "⏳" });
  };

  // When the page opens, quietly settle any enrollment that was paid while we were away.
  const settledOnce = useRef(false);
  useEffect(() => {
    if (settledOnce.current || enrollments.length === 0) return;
    settledOnce.current = true;
    enrollments.filter((en) => en.status === "pending").forEach((en) => { void checkPayment(en.id); });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enrollments]);

  const payExistingMpesa = async (enrollmentId: string, phone: string, amount: number) => {
    setPayBusy(true);
    try {
      await dispatch(initiateStkPush({ enrollment_id: enrollmentId, phone, amount })).unwrap();
      toast.success("M-Pesa prompt sent! Complete payment on your phone.");
      setPayFor(null);
      startPolling(enrollmentId);
    } catch (payErr: unknown) {
      let msg = "Payment failed to initialize";
      if (typeof payErr === "string") msg = payErr;
      else if (payErr && typeof payErr === "object" && "message" in payErr) msg = (payErr as BackendError).message || msg;
      toast.error(msg);
    } finally {
      setPayBusy(false);
    }
  };

  const handleEnroll = async (payload: EnrollWithPaymentPayload) => {
    try {
      const enrollment = await dispatch(enrollKid({
        kid_id:        payload.kid_id,
        course_id:     payload.course_id,
        fee_amount:    payload.fee_amount,
        billing_cycle: payload.billing_cycle, // ← now BillingCycle, not string
        start_date:    payload.start_date,
      })).unwrap();

      dispatch(getMyEnrollments());

      if (payload.method === "card") {
        setShowEnrollModal(false);
        await goToPaystack(enrollment.id);
        return;
      }

      if (payload.phone) {
        try {
          await dispatch(initiateStkPush({
            enrollment_id: enrollment.id,
            phone:         payload.phone,
            amount:        payload.fee_amount,
          })).unwrap();

          toast.success("M-Pesa prompt sent! Complete payment on your phone.");
          setShowEnrollModal(false);
          startPolling(enrollment.id);
        } catch (payErr: unknown) {
          let msg = "Payment failed to initialize";
          if (typeof payErr === "string") msg = payErr;
          else if (payErr && typeof payErr === "object" && "message" in payErr)
            msg = (payErr as BackendError).message || msg;
          toast.error(`Enrollment saved, but: ${msg}`);
        }
      }
    } catch (err: unknown) {
      let msg = "Failed to create enrollment";
      if (typeof err === "string") msg = err;
      else if (err && typeof err === "object" && "message" in err)
        msg = (err as BackendError).message || msg;
      toast.error(msg);
    }
  };

  const isLoading = enrollLoading || courseLoading || payLoading;

  return (
    <div className="min-h-screen bg-[#FDFCFE] pb-20">
      <div className="max-w-6xl mx-auto px-4 pt-10">

        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10">
          <div>
            <h1 className="text-4xl font-extrabold font-serif text-purple-900 tracking-tight">
              My <span className="text-orange-500">Enrollments</span>
            </h1>
            <p className="text-gray-500 mt-1 font-serif">
              Enrollments become active upon payment confirmation.
            </p>
          </div>
          <button
            onClick={() => setShowEnrollModal(true)}
            className="bg-purple-700 hover:bg-purple-800 text-white font-bold py-3 px-8 rounded-full shadow-lg shadow-purple-100 transition-all flex items-center gap-2"
          >
            <Plus size={20} /> New Enrollment
          </button>
        </div>

        {/* Empty state */}
        {enrollments.length === 0 && !isLoading ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-purple-200">
            <GraduationCap size={48} className="mx-auto text-purple-100 mb-4" />
            <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">No programs found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {enrollments.map((e) => (
              <div
                key={e.id}
                className={`bg-white p-6 rounded-[2rem] border shadow-sm hover:shadow-md transition-all group
                  ${e.payment_status === "overdue"  ? "border-red-200"   : ""}
                  ${e.payment_status === "due_soon" ? "border-amber-200" : ""}
                  ${e.payment_status !== "overdue" && e.payment_status !== "due_soon" ? "border-purple-50" : ""}
                `}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="w-12 h-12 bg-orange-100 rounded-2xl flex items-center justify-center text-orange-600 font-black text-lg">
                    {(e.kid_name ?? "U")[0]}
                  </div>
                  <StatusBadge status={e.status} />
                </div>

                <h3 className="text-lg font-black text-purple-900 mb-1">{e.course_name}</h3>
                <p className="text-sm text-gray-500 mb-4 flex items-center gap-1">
                  <User size={14} className="text-purple-300" /> {e.kid_name}
                </p>

                <div className="space-y-2 border-t border-purple-50 pt-4">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-400 flex items-center gap-1">
                      <Clock size={12} /> {e.billing_cycle}
                    </span>
                    <span className="font-black text-purple-900">
                      KES {Number(e.fee_amount).toLocaleString()}
                    </span>
                  </div>

                  {e.last_payment_date && (
                    <div className="flex justify-between text-xs text-gray-400">
                      <span>Last paid</span>
                      <span>{formatDate(e.last_payment_date)}</span>
                    </div>
                  )}

                  {e.status === "pending" && (
                    <div className="mt-3 p-3 bg-amber-50 rounded-xl flex flex-wrap items-center gap-2 text-[10px] font-bold text-amber-700 uppercase tracking-tighter">
                      <CheckCircle2 size={14} /> Not paid yet
                      <div className="ml-auto flex gap-2">
                        <button
                          onClick={() => setPayFor({ id: e.id, course: e.course_name, kid: e.kid_name ?? "", amount: Number(e.fee_amount) })}
                          className="px-3 py-1.5 rounded-lg bg-orange-500 hover:bg-orange-600 text-white normal-case tracking-normal text-xs font-black whitespace-nowrap"
                        >
                          Pay now
                        </button>
                        <button
                          onClick={() => checkNow(e.id)}
                          disabled={checking === e.id}
                          className="px-3 py-1.5 rounded-lg bg-white border border-amber-200 text-amber-800 normal-case tracking-normal text-xs font-bold disabled:opacity-60 whitespace-nowrap"
                        >
                          {checking === e.id ? "Checking…" : "Check payment"}
                        </button>
                      </div>
                    </div>
                  )}

                  {e.status !== "pending" && e.status !== "cancelled" && (
                    <PaymentStatusBanner
                      payment_status={e.payment_status}
                      next_payment_date={e.next_payment_date}
                      billing_cycle={e.billing_cycle}
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showEnrollModal && (
        <EnrollModal
          onClose={() => setShowEnrollModal(false)}
          kids={kids}
          courses={courses}
          loading={isLoading}
          paystackOn={paystackOn}
          onSubmit={handleEnroll}
        />
      )}

      {payFor && (
        <PayDialog
          course={payFor.course}
          kid={payFor.kid}
          amount={payFor.amount}
          paystackOn={paystackOn}
          busy={payBusy}
          onClose={() => setPayFor(null)}
          onMpesa={(phone) => void payExistingMpesa(payFor.id, phone, payFor.amount)}
          onCard={() => { setPayBusy(true); void goToPaystack(payFor.id); }}
        />
      )}
    </div>
  );
};

export default ParentEnrollments;