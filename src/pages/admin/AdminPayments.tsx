import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import { Download, Receipt as ReceiptIcon, Wallet, Clock, CreditCard, X } from "lucide-react";
import type { AppDispatch, RootState } from "../../store/store";
import { getAllPayments, getReceipt, clearReceipt, resetPaymentState } from "../../store/slices/paymentSlice";
import type { Payment } from "../../interfaces/payment.interface";
import { PageHeader, StatCard, StatusBadge, SearchBox, TableSkeleton, EmptyState } from "../../components/admin/ui";
import { money, dateShort } from "../../components/admin/format";

const AdminPayments = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { payments, receipt, loading, error } = useSelector((s: RootState) => s.payment);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [method, setMethod] = useState("all");

  useEffect(() => {
    dispatch(getAllPayments());
    return () => {
      dispatch(resetPaymentState());
      dispatch(clearReceipt());
    };
  }, [dispatch]);

  useEffect(() => {
    if (error) toast.error(error);
  }, [error]);

  const methods = useMemo(() => Array.from(new Set(payments.map((p: Payment) => p.method))).filter(Boolean), [payments]);

  const rows = payments.filter((p: Payment) => {
    const q = search.trim().toLowerCase();
    const hit = !q || [p.parent_name, p.kid_name, p.receipt_number, p.course_name].some((v) => v?.toLowerCase().includes(q));
    return hit && (status === "all" || p.status === status) && (method === "all" || p.method === method);
  });

  const completed = payments.filter((p: Payment) => p.status === "completed");
  const pending = payments.filter((p: Payment) => p.status === "pending");
  const revenue = completed.reduce((sum: number, p: Payment) => sum + Number(p.amount), 0);

  const exportCsv = () => {
    const esc = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
    const header = ["Receipt", "Date", "Parent", "Child", "Course", "Amount", "Method", "Status"];
    const lines = rows.map((p: Payment) => [p.receipt_number, p.date, p.parent_name, p.kid_name, p.course_name, p.amount, p.method, p.status].map(esc).join(","));
    const blob = new Blob([[header.join(","), ...lines].join("\n")], { type: "text/csv;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `payments-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  return (
    <>
      <PageHeader
        title="Payments"
        subtitle="Every payment received, with its receipt."
        actions={<button className="ds-btn ds-btn-secondary ds-btn-sm" onClick={exportCsv} disabled={rows.length === 0}><Download size={16} /> Export CSV</button>}
      />

      <div className="grid sm:grid-cols-3 gap-4 mb-6">
        <StatCard label="Revenue (completed)" value={money(revenue)} icon={<Wallet size={20} />} tone="ok" hint={`${completed.length} payments`} />
        <StatCard label="Waiting for payment" value={pending.length} icon={<Clock size={20} />} tone="warn" hint="Started but not yet confirmed" />
        <StatCard label="All transactions" value={payments.length} icon={<CreditCard size={20} />} />
      </div>

      <div className="adm-card">
        <div className="p-4 flex flex-col lg:flex-row gap-3 border-b border-ink-200">
          <SearchBox value={search} onChange={setSearch} placeholder="Search parent, child, receipt…" />
          <select className="adm-input" value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Filter by status">
            <option value="all">All statuses</option>
            <option value="completed">Completed</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
          </select>
          <select className="adm-input" value={method} onChange={(e) => setMethod(e.target.value)} aria-label="Filter by method">
            <option value="all">All methods</option>
            {methods.map((m) => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>

        <div className="adm-table-wrap">
          <table className="adm-table">
            <thead>
              <tr><th>Receipt</th><th>Parent</th><th>Child and course</th><th>Amount</th><th>Method</th><th>Status</th><th><span className="sr-only-text">Actions</span></th></tr>
            </thead>
            {loading && payments.length === 0 ? (
              <TableSkeleton cols={7} />
            ) : (
              <tbody>
                {rows.map((p: Payment) => (
                  <tr key={p.id}>
                    <td><p className="font-semibold">{p.receipt_number}</p><p className="text-xs text-ink-500">{dateShort(p.date)}</p></td>
                    <td>{p.parent_name ?? "—"}</td>
                    <td><p className="font-semibold">{p.kid_name ?? "—"}</p><p className="text-xs text-ink-500">{p.course_name}</p></td>
                    <td className="font-semibold whitespace-nowrap">{money(p.amount)}</td>
                    <td>{p.method}</td>
                    <td><StatusBadge status={p.status} /></td>
                    <td className="text-right">
                      <button className="ds-btn ds-btn-ghost ds-btn-sm" onClick={() => dispatch(getReceipt(p.id))}><ReceiptIcon size={15} /> Receipt</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            )}
          </table>
          {!loading && rows.length === 0 && <EmptyState icon={<CreditCard size={22} />} title="No payments found" text={payments.length ? "Try a different search or filter." : "Payments will appear here as soon as parents pay."} />}
        </div>
      </div>

      {receipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-900/50" role="dialog" aria-modal="true" aria-label="Receipt" onClick={() => dispatch(clearReceipt())}>
          <div className="adm-card adm-card-pad w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between">
              <div><p className="text-xs font-bold uppercase tracking-wider text-ink-500">Receipt</p><p className="text-xl font-extrabold">{receipt.receipt_number}</p></div>
              <button className="p-1.5 rounded-lg hover:bg-ink-100" onClick={() => dispatch(clearReceipt())} aria-label="Close"><X size={18} /></button>
            </div>
            <dl className="mt-4 divide-y divide-ink-100 text-sm">
              {[["Date", dateShort(receipt.date)], ["Parent", receipt.parent_name], ["Child", receipt.kid_name], ["Course", receipt.course_name], ["Method", receipt.method], ["Reference", receipt.reference ?? "—"]].map(([k, v]) => (
                <div key={k} className="flex justify-between gap-4 py-2"><dt className="text-ink-500">{k}</dt><dd className="font-semibold text-right">{v}</dd></div>
              ))}
              <div className="flex justify-between gap-4 py-3"><dt className="font-bold">Amount</dt><dd className="text-lg font-extrabold">{money(receipt.amount)}</dd></div>
            </dl>
            <div className="mt-2 flex items-center justify-between">
              <StatusBadge status={receipt.status} />
              <button className="ds-btn ds-btn-secondary ds-btn-sm" onClick={() => window.print()}>Print</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminPayments;
