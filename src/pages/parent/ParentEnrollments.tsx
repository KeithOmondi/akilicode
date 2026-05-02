import { useEffect, useState, useRef } from "react";
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
import { initiateStkPush } from "../../store/slices/paymentSlice";
import type { AppDispatch, RootState } from "../../store/store";
import type { EnrollKidPayload } from "../../interfaces/enrollment.interface";
import api from "../../api/api";

// ─── Types ───────────────────────────────────────────────────────────────────
type BillingCycle = "monthly" | "termly" | "once-off";

interface EnrollWithPaymentPayload extends EnrollKidPayload {
  payNow?: boolean;
  phone?: string;
}

interface BackendError {
  message?: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
const formatDate = (dateStr: string) =>
  new Date(dateStr).toLocaleDateString("en-KE", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

const getDaysUntil = (dateStr: string): number => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dateStr);
  due.setHours(0, 0, 0, 0);
  return Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
};

// ─── Payment Status Banner ────────────────────────────────────────────────────
const PaymentStatusBanner = ({
  payment_status,
  next_payment_date,
  billing_cycle,
}: {
  payment_status?: string;
  next_payment_date?: string | null;
  billing_cycle: string;
}) => {
  if (!payment_status || payment_status === "unpaid" || payment_status === "cancelled") return null;

  if (payment_status === "once-off") {
    return (
      <div className="mt-3 p-3 bg-green-50 rounded-xl flex items-center gap-2 text-[10px] font-bold text-green-700 uppercase tracking-tighter border border-green-100">
        <InfinityIcon size={13} /> Fully Paid — No Further Payments Due
      </div>
    );
  }

  if (payment_status === "overdue") {
    return (
      <div className="mt-3 p-3 bg-red-50 rounded-xl border border-red-100">
        <div className="flex items-center gap-2 text-[10px] font-bold text-red-700 uppercase tracking-tighter mb-1">
          <AlertTriangle size={13} /> Payment Overdue
        </div>
        {next_payment_date && (
          <p className="text-[10px] text-red-500">
            Was due {formatDate(next_payment_date)}
          </p>
        )}
      </div>
    );
  }

  if (payment_status === "due_soon") {
    const days = next_payment_date ? getDaysUntil(next_payment_date) : null;
    return (
      <div className="mt-3 p-3 bg-amber-50 rounded-xl border border-amber-100">
        <div className="flex items-center gap-2 text-[10px] font-bold text-amber-700 uppercase tracking-tighter mb-1">
          <CalendarClock size={13} />
          {days === 0 ? "Payment Due Today!" : `Payment Due in ${days} Day${days === 1 ? "" : "s"}`}
        </div>
        {next_payment_date && (
          <p className="text-[10px] text-amber-600">
            {formatDate(next_payment_date)} · KES
          </p>
        )}
      </div>
    );
  }

  if (payment_status === "paid" && next_payment_date) {
    return (
      <div className="mt-3 p-3 bg-purple-50 rounded-xl border border-purple-100">
        <div className="flex items-center gap-2 text-[10px] font-bold text-purple-700 uppercase tracking-tighter mb-1">
          <BadgeCheck size={13} /> Next Payment
        </div>
        <p className="text-[10px] text-purple-500">
          {formatDate(next_payment_date)} · {billing_cycle}
        </p>
      </div>
    );
  }

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

// ─── Enroll Modal ─────────────────────────────────────────────────────────────
interface EnrollModalProps {
  onClose: () => void;
  kids: RootState["kid"]["kids"];
  courses: RootState["course"]["courses"];
  loading: boolean;
  onSubmit: (payload: EnrollWithPaymentPayload) => Promise<void>;
}

const EnrollModal = ({ onClose, kids, courses, loading, onSubmit }: EnrollModalProps) => {
  const [kidId, setKidId] = useState("");
  const [courseName, setCourseName] = useState("");
  const [feeAmount, setFeeAmount] = useState("");
  const [billingCycle, setBillingCycle] = useState<BillingCycle>("monthly");
  const [phone, setPhone] = useState("");

  const inputCls = "w-full bg-purple-50/50 border-2 border-transparent rounded-xl pl-11 pr-4 py-3 focus:bg-white focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 outline-none appearance-none transition-all text-sm font-medium text-gray-800 placeholder:text-gray-400";
  const labelCls = "block text-[11px] font-black text-purple-900 uppercase tracking-wider mb-1.5";

  const handleCourseChange = (selectedTitle: string) => {
    setCourseName(selectedTitle);
    const found = courses.find((c) => c.title === selectedTitle);
    setFeeAmount(found ? String(found.price) : "");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || !/^254\d{9}$/.test(phone)) {
      toast.error("Enter a valid M-Pesa number (254...)");
      return;
    }
    await onSubmit({
      kid_id: kidId,
      course_name: courseName,
      fee_amount: Number(feeAmount),
      billing_cycle: billingCycle,
      payNow: true,
      phone,
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

          <div>
            <label className={labelCls}>Course</label>
            <div className="relative">
              <BookOpen className="absolute left-3 top-3 text-purple-300" size={16} />
              <select required value={courseName} onChange={(e) => handleCourseChange(e.target.value)} className={inputCls}>
                <option value="">Select a course</option>
                {courses.filter((c) => c.is_active).map((c) => (
                  <option key={c.id} value={c.title}>{c.title}</option>
                ))}
              </select>
            </div>
          </div>

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
              <select value={billingCycle} onChange={(e) => setBillingCycle(e.target.value as BillingCycle)} className={inputCls}>
                <option value="monthly">Monthly</option>
                <option value="termly">Termly</option>
                <option value="once-off">Once-off</option>
              </select>
            </div>
          </div>

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
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-black py-4 rounded-2xl shadow-xl shadow-orange-200 transition-all flex items-center justify-center gap-2"
        >
          {loading ? "Processing..." : "Enroll & Pay Now"}
        </button>
      </form>
    </ModalOverlay>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────
const ParentEnrollments = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { enrollments, loading: enrollLoading } = useSelector((s: RootState) => s.enrollment);
  const { kids } = useSelector((s: RootState) => s.kid);
  const { courses, loading: courseLoading } = useSelector((s: RootState) => s.course);
  const { loading: payLoading, checkoutRequestId } = useSelector((s: RootState) => s.payment);

  const [showEnrollModal, setShowEnrollModal] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    dispatch(getMyEnrollments());
    dispatch(getMyKids());
    dispatch(getAllCourses());
  }, [dispatch]);

  useEffect(() => {
    if (checkoutRequestId) {
      toast.loading("Complete M-Pesa payment on your phone...", { id: "stk-push", duration: 60000 });
    } else {
      toast.dismiss("stk-push");
    }
  }, [checkoutRequestId]);

  useEffect(() => {
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);

  const startPolling = (enrollmentId: string) => {
    if (pollRef.current) clearInterval(pollRef.current);
    let attempts = 0;
    const maxAttempts = 15;

    pollRef.current = setInterval(async () => {
      attempts++;
      try {
        const res = await api.get(`/mpesa/status/${enrollmentId}`);
        const { payment_status, enrollment_status } = res.data.data;

        if (payment_status === "completed" && (enrollment_status === "active" || enrollment_status === "completed")) {
          clearInterval(pollRef.current!);
          pollRef.current = null;
          toast.dismiss("stk-push");
          toast.success("🎉 Payment confirmed! Enrollment is now active.");
          dispatch(getMyEnrollments());
        } else if (payment_status === "failed") {
          clearInterval(pollRef.current!);
          pollRef.current = null;
          toast.dismiss("stk-push");
          toast.error("Payment was cancelled or failed. Please try again.");
          dispatch(getMyEnrollments());
        } else if (attempts >= maxAttempts) {
          clearInterval(pollRef.current!);
          pollRef.current = null;
          toast.dismiss("stk-push");
          toast("Payment not confirmed yet. It will update automatically once M-Pesa confirms.", {
            icon: "⏳",
            duration: 6000,
          });
        }
      } catch {
        clearInterval(pollRef.current!);
        pollRef.current = null;
      }
    }, 4000);
  };

  const handleEnroll = async (payload: EnrollWithPaymentPayload) => {
    try {
      const enrollment = await dispatch(enrollKid({
        kid_id: payload.kid_id,
        course_name: payload.course_name,
        fee_amount: payload.fee_amount,
        billing_cycle: payload.billing_cycle,
        start_date: payload.start_date,
      })).unwrap();

      dispatch(getMyEnrollments());

      if (payload.phone) {
        try {
          await dispatch(initiateStkPush({
            enrollment_id: enrollment.id,
            phone: payload.phone,
            amount: payload.fee_amount,
          })).unwrap();

          toast.success("M-Pesa prompt sent! Complete payment on your phone.");
          setShowEnrollModal(false);
          startPolling(enrollment.id);
        } catch (payErr: unknown) {
          let errorMessage = "Payment failed to initialize";
          if (typeof payErr === "string") errorMessage = payErr;
          else if (payErr && typeof payErr === "object" && "message" in payErr)
            errorMessage = (payErr as BackendError).message || errorMessage;
          toast.error(`Enrollment saved, but: ${errorMessage}`);
        }
      }
    } catch (err: unknown) {
      let errorMessage = "Failed to create enrollment";
      if (typeof err === "string") errorMessage = err;
      else if (err && typeof err === "object" && "message" in err)
        errorMessage = (err as BackendError).message || errorMessage;
      toast.error(errorMessage);
    }
  };

  const isLoading = enrollLoading || courseLoading || payLoading;

  return (
    <div className="min-h-screen bg-[#FDFCFE] pb-20">
      <div className="max-w-6xl mx-auto px-4 pt-10">
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

        {enrollments.length === 0 && !isLoading ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-purple-200">
            <GraduationCap size={48} className="mx-auto text-purple-100 mb-4" />
            <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">
              No programs found
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {enrollments.map((e) => (
              <div
                key={e.id}
                className={`bg-white p-6 rounded-[2rem] border shadow-sm hover:shadow-md transition-all group ${
                  e.payment_status === "overdue"
                    ? "border-red-200"
                    : e.payment_status === "due_soon"
                    ? "border-amber-200"
                    : "border-purple-50"
                }`}
              >
                {/* Card header */}
                <div className="flex justify-between items-start mb-4">
                  <div className="w-12 h-12 bg-orange-100 rounded-2xl flex items-center justify-center text-orange-600 font-black text-lg">
                    {(e.kid_name ?? "U")[0]}
                  </div>
                  <StatusBadge status={e.status} />
                </div>

                {/* Course & student */}
                <h3 className="text-lg font-black text-purple-900 mb-1">{e.course_name}</h3>
                <p className="text-sm text-gray-500 mb-4 flex items-center gap-1">
                  <User size={14} className="text-purple-300" /> {e.kid_name}
                </p>

                {/* Billing info */}
                <div className="space-y-2 border-t border-purple-50 pt-4">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-400 flex items-center gap-1">
                      <Clock size={12} /> {e.billing_cycle}
                    </span>
                    <span className="font-black text-purple-900">
                      KES {Number(e.fee_amount).toLocaleString()}
                    </span>
                  </div>

                  {/* Last payment date */}
                  {e.last_payment_date && (
                    <div className="flex justify-between text-xs text-gray-400">
                      <span>Last paid</span>
                      <span>{formatDate(e.last_payment_date)}</span>
                    </div>
                  )}

                  {/* Pending M-Pesa confirmation */}
                  {e.status === "pending" && (
                    <div className="mt-3 p-3 bg-amber-50 rounded-xl flex items-center gap-2 text-[10px] font-bold text-amber-700 uppercase tracking-tighter">
                      <CheckCircle2 size={14} /> Waiting for M-Pesa Confirmation
                    </div>
                  )}

                  {/* Payment status banner */}
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
          onSubmit={handleEnroll}
        />
      )}
    </div>
  );
};

export default ParentEnrollments;