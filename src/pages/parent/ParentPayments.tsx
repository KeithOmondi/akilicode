import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import { X, Wallet } from "lucide-react";
import {
  getMyPayments,
  getReceipt,
  initiateStkPush,
  resetPaymentState,
  clearReceipt,
  clearCheckoutRequest,
} from "../../store/slices/paymentSlice";
import { getMyEnrollments } from "../../store/slices/enrollmentSlice";
import type { AppDispatch, RootState } from "../../store/store";
import type { StkPushPayload } from "../../interfaces/payment.interface";

// ─── Types ───────────────────────────────────────────────────────────────────
type StatusFilter = "All" | "pending" | "completed" | "failed";
interface MpesaFormState {
  enrollment_id: string;
  amount: string;
  phone: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
const getInitials = (name: string) => {
  if (!name) return "??";
  const parts = name.trim().split(" ");
  return parts.length >= 2
    ? `${parts[0][0]}${parts[1][0]}`.toUpperCase()
    : parts[0].slice(0, 2).toUpperCase();
};

// ─── Shared UI Components ────────────────────────────────────────────────────
const StatusBadge = ({ status }: { status: string }) => {
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

const ModalOverlay = ({
  onClose,
  children,
}: {
  onClose: () => void;
  children: React.ReactNode;
}) => (
  <div
    className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-sm"
    onClick={(e) => e.target === e.currentTarget && onClose()}
  >
    <div className="bg-white rounded-t-[28px] sm:rounded-[28px] shadow-2xl w-full max-w-md border border-slate-100 overflow-hidden animate-in fade-in slide-in-from-bottom-4 sm:zoom-in duration-200">
      {children}
    </div>
  </div>
);

// ─── M-Pesa Pay Modal ─────────────────────────────────────────────────────────
interface PayModalProps {
  onClose: () => void;
  enrollments: RootState["enrollment"]["enrollments"];
  loading: boolean;
  onSubmit: (data: StkPushPayload) => void;
}

const PayModal = ({ onClose, enrollments, loading, onSubmit }: PayModalProps) => {
  const [form, setForm] = useState<MpesaFormState>({ enrollment_id: "", amount: "", phone: "" });
  const set = <K extends keyof MpesaFormState>(key: K, val: MpesaFormState[K]) =>
    setForm((f) => ({ ...f, [key]: val }));

  const handleEnrollmentChange = (id: string) => {
    const found = enrollments.find((e) => e.id === id);
    set("enrollment_id", id);
    if (found) set("amount", String(found.fee_amount));
  };

  const canSubmit = !!form.enrollment_id && !!form.amount && Number(form.amount) > 0 && !!form.phone;
  const inputCls = "w-full px-4 py-3 rounded-xl border-2 border-transparent bg-purple-50/50 text-sm focus:outline-none focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 focus:bg-white transition-all font-medium text-gray-800 placeholder:text-gray-400";
  const labelCls = "block text-[11px] font-black text-purple-900 uppercase tracking-wider mb-1.5";

  return (
    <ModalOverlay onClose={onClose}>
      <div className="px-6 py-5 border-b border-purple-50 flex items-center justify-between bg-gradient-to-r from-purple-700 to-purple-800">
        <div>
          <h2 className="text-lg font-black text-white">M-Pesa Payment</h2>
          <p className="text-xs text-purple-200 mt-0.5">Lipa na M-Pesa Online</p>
        </div>
        <button onClick={onClose} className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors">
          <X size={18} />
        </button>
      </div>

      <div className="px-6 py-6 space-y-4 max-h-[70vh] overflow-y-auto">
        <div>
          <label className={labelCls}>Enrollment</label>
          <select value={form.enrollment_id} onChange={(e) => handleEnrollmentChange(e.target.value)} className={inputCls}>
            <option value="">Choose student...</option>
            {enrollments.filter((e) => e.status === "active").map((e) => (
              <option key={e.id} value={e.id}>{e.kid_name} — {e.course_name}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Amount (KES)</label>
            <input type="number" placeholder="0" value={form.amount} onChange={(e) => set("amount", e.target.value)} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Phone No.</label>
            <input type="tel" placeholder="2547XXXXXXXX" value={form.phone} onChange={(e) => set("phone", e.target.value)} className={inputCls} />
          </div>
        </div>

        <div className="bg-orange-50 p-4 rounded-xl border border-orange-100 flex items-start gap-3">
          <div className="w-5 h-5 rounded-full bg-orange-500 flex items-center justify-center shrink-0 mt-0.5">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4"><path d="M20 6L9 17l-5-5"/></svg>
          </div>
          <p className="text-[11px] text-orange-800 leading-relaxed font-medium">
            Keep your phone unlocked. You will receive a prompt to enter your M-Pesa PIN.
          </p>
        </div>

        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose} className="flex-1 py-3 rounded-xl font-bold text-gray-500 hover:bg-gray-100 transition-all text-sm border-2 border-gray-100">
            Cancel
          </button>
          <button
            onClick={() => canSubmit && onSubmit({ enrollment_id: form.enrollment_id, phone: form.phone, amount: Number(form.amount) })}
            disabled={loading || !canSubmit}
            className="flex-1 py-3 rounded-xl bg-purple-700 hover:bg-purple-800 disabled:bg-slate-200 disabled:text-slate-400 text-white font-black text-sm shadow-lg shadow-purple-200 transition-all"
          >
            {loading ? "Waiting for M-Pesa..." : "Send STK Push"}
          </button>
        </div>
      </div>
    </ModalOverlay>
  );
};

// ─── Receipt Modal ────────────────────────────────────────────────────────────
interface ReceiptModalProps {
  onClose: () => void;
  receipt: NonNullable<RootState["payment"]["receipt"]>;
}

const ReceiptModal = ({ onClose, receipt }: ReceiptModalProps) => (
  <ModalOverlay onClose={onClose}>
    <div className="p-8 text-center">
      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 text-green-600 shadow-md">
        <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
      </div>
      <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">Akili Code Receipt</h2>
      <p className="text-xs text-slate-400 mt-1 font-mono">ID: {receipt.receipt_number}</p>

      <div className="my-6 py-6 px-4 rounded-2xl bg-slate-50 border border-dashed border-slate-200 relative">
        <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-white rounded-full border border-slate-200" />
        <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-white rounded-full border border-slate-200" />
        <p className="text-[10px] font-black text-orange-500 uppercase tracking-widest mb-1">Total Paid</p>
        <p className="text-4xl font-black text-purple-900 tabular-nums">
          <span className="text-base font-medium text-slate-400 mr-1">KES</span>
          {receipt.amount.toLocaleString()}
        </p>
        <div className="mt-3"><StatusBadge status={receipt.status} /></div>
      </div>

      <div className="space-y-3 text-left mb-6">
        {[
          { l: "Student", v: receipt.kid_name },
          { l: "Program", v: receipt.course_name },
          { l: "Provider", v: "M-Pesa STK" },
          { l: "Issued On", v: new Date(receipt.date).toLocaleDateString() },
        ].map((row) => (
          <div key={row.l} className="flex justify-between border-b border-slate-100 pb-2">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-tight">{row.l}</span>
            <span className="text-sm font-bold text-slate-700">{row.v}</span>
          </div>
        ))}
      </div>

      <button onClick={onClose} className="w-full py-4 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-black text-sm shadow-lg shadow-orange-200 transition-all">
        Close Receipt
      </button>
    </div>
  </ModalOverlay>
);

// ─── Main Page Component ─────────────────────────────────────────────────────
const ParentPayments = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { payments, receipt, loading: payLoading, error, message } = useSelector((s: RootState) => s.payment);
  const { enrollments } = useSelector((s: RootState) => s.enrollment);

  const [showPayModal, setShowPayModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("All");
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  useEffect(() => {
    dispatch(getMyPayments());
    dispatch(getMyEnrollments());
    dispatch(clearCheckoutRequest()); // clear any stale STK state on mount
    return () => {
      dispatch(resetPaymentState());
      dispatch(clearCheckoutRequest()); // clear on unmount too
    };
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      toast.error(error, { id: "payment-error" });
      dispatch(resetPaymentState());
    }
    if (message) {
      toast.success(message, { id: "payment-success" });
      dispatch(resetPaymentState());
    }
  }, [error, message, dispatch]);

  const handlePay = (data: StkPushPayload) => {
    dispatch(initiateStkPush(data)).then(() => setShowPayModal(false));
  };

  const handleFetchReceipt = (id: string) => {
    toast.promise(dispatch(getReceipt(id)).unwrap(), {
      loading: "Fetching receipt...",
      success: "Receipt loaded!",
      error: "Could not find receipt.",
    });
  };

  const filteredPayments = payments.filter((p) => {
    if (statusFilter !== "All" && p.status !== statusFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        p.kid_name?.toLowerCase().includes(q) ||
        p.course_name?.toLowerCase().includes(q) ||
        p.receipt_number?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentPayments = filteredPayments.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredPayments.length / itemsPerPage);

  return (
    <div className="min-h-screen bg-[#FDFCFE] pb-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-6 sm:pt-10">

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-purple-900 font-serif tracking-tight">
              Payment <span className="text-orange-500">History</span>
            </h1>
            <p className="text-sm text-gray-500 font-serif mt-1">
              Track all your transactions and download receipts.
            </p>
          </div>
          <button
            onClick={() => setShowPayModal(true)}
            className="flex items-center justify-center gap-2 bg-purple-700 hover:bg-purple-800 text-white font-bold py-3 px-6 rounded-full shadow-lg shadow-purple-200 transition-all hover:scale-105 text-sm whitespace-nowrap self-start sm:self-auto"
          >
            <Wallet size={18} />
            Pay with M-Pesa
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-5">
          <div className="relative flex-1">
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
            <input
              type="text"
              placeholder="Search name, course or receipt..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
              className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-purple-500/10 shadow-sm"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1 sm:pb-0">
            {(["All", "completed", "pending", "failed"] as StatusFilter[]).map((s) => (
              <button
                key={s}
                onClick={() => { setStatusFilter(s); setCurrentPage(1); }}
                className={`px-4 py-2 rounded-xl text-xs font-black transition-all capitalize whitespace-nowrap border-2 ${
                  statusFilter === s
                    ? "bg-purple-800 border-purple-800 text-white"
                    : "bg-white text-slate-400 border-slate-100"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Payments Table/Cards */}
        <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">

          {/* Mobile Cards */}
          <div className="sm:hidden divide-y divide-slate-100">
            {payLoading && payments.length === 0 ? (
              <div className="p-10 text-center text-slate-400 text-xs font-bold uppercase tracking-widest animate-pulse">Syncing...</div>
            ) : currentPayments.length === 0 ? (
              <div className="p-16 text-center">
                <p className="text-slate-400 font-bold text-xs uppercase tracking-tight">No transactions found</p>
              </div>
            ) : currentPayments.map((p) => (
              <div key={p.id} className="p-4 hover:bg-purple-50/20 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-orange-50 rounded-xl flex items-center justify-center border border-orange-100">
                      <span className="text-[11px] font-black text-orange-600">{getInitials(p.kid_name ?? "")}</span>
                    </div>
                    <div>
                      <p className="font-black text-slate-900 text-sm">{p.kid_name || "Student"}</p>
                      <p className="text-[10px] font-bold text-purple-600 uppercase tracking-tight">{p.course_name}</p>
                    </div>
                  </div>
                  <StatusBadge status={p.status} />
                </div>
                <div className="flex items-center justify-between pl-12 mt-2">
                  <div>
                    <p className="font-black text-slate-900 text-sm">KES {p.amount.toLocaleString()}</p>
                    <p className="text-[10px] font-mono text-slate-400">{p.receipt_number}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <p className="text-xs text-slate-400">{new Date(p.date).toLocaleDateString()}</p>
                    <button
                      onClick={() => handleFetchReceipt(p.id)}
                      className="p-2 rounded-lg bg-slate-50 text-slate-400 hover:bg-purple-700 hover:text-white transition-all"
                    >
                      <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Table */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50">
                  {["", "Student", "Course", "Date", "Amount (KES)", "Receipt No", "Status", ""].map((h, i) => (
                    <th key={i} className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {payLoading && payments.length === 0 ? (
                  <tr><td colSpan={8} className="p-12 text-center text-slate-400 animate-pulse font-bold uppercase tracking-widest text-xs">Syncing Ledger...</td></tr>
                ) : currentPayments.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-20 text-center">
                      <p className="text-slate-400 font-bold text-xs uppercase tracking-tight">No Transactions Found</p>
                    </td>
                  </tr>
                ) : currentPayments.map((p) => (
                  <tr key={p.id} className="group hover:bg-purple-50/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="w-9 h-9 rounded-xl bg-orange-50 flex items-center justify-center border border-orange-100">
                        <span className="text-[11px] font-black text-orange-600">{getInitials(p.kid_name ?? "")}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-black text-slate-900 text-sm">{p.kid_name || "Student"}</td>
                    <td className="px-6 py-4 text-[11px] font-bold text-purple-600 uppercase tracking-tight">{p.course_name}</td>
                    <td className="px-6 py-4 text-xs font-medium text-slate-500">{new Date(p.date).toLocaleDateString()}</td>
                    <td className="px-6 py-4 font-black text-slate-900 tabular-nums">{p.amount.toLocaleString()}</td>
                    <td className="px-6 py-4 text-[10px] font-mono text-slate-400">{p.receipt_number}</td>
                    <td className="px-6 py-4"><StatusBadge status={p.status} /></td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleFetchReceipt(p.id)}
                        className="p-2.5 rounded-xl bg-slate-50 text-slate-400 hover:bg-purple-700 hover:text-white transition-all shadow-sm"
                      >
                        <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-4 sm:px-6 py-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/30">
              <p className="text-[10px] font-bold text-slate-400 uppercase hidden sm:block">
                {indexOfFirst + 1}–{Math.min(indexOfLast, filteredPayments.length)} of {filteredPayments.length}
              </p>
              <div className="flex gap-2 mx-auto sm:mx-0">
                <button disabled={currentPage === 1} onClick={() => setCurrentPage((p) => p - 1)} className="p-2 rounded-lg border border-slate-200 disabled:opacity-30 hover:bg-white transition-colors">
                  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7"/></svg>
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button key={page} onClick={() => setCurrentPage(page)} className={`w-8 h-8 rounded-lg text-[11px] font-black transition-all ${currentPage === page ? "bg-purple-700 text-white shadow-md" : "text-slate-400 hover:bg-white"}`}>
                    {page}
                  </button>
                ))}
                <button disabled={currentPage === totalPages} onClick={() => setCurrentPage((p) => p + 1)} className="p-2 rounded-lg border border-slate-200 disabled:opacity-30 hover:bg-white transition-colors">
                  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7"/></svg>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {showPayModal && (
        <PayModal
          onClose={() => setShowPayModal(false)}
          enrollments={enrollments}
          loading={payLoading}
          onSubmit={handlePay}
        />
      )}
      {receipt && (
        <ReceiptModal
          onClose={() => { dispatch(clearReceipt()); dispatch(resetPaymentState()); }}
          receipt={receipt}
        />
      )}
    </div>
  );
};

export default ParentPayments;