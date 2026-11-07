import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import { GraduationCap, Users, Ban } from "lucide-react";
import type { AppDispatch, RootState } from "../../store/store";
import { getAllEnrollments, cancelEnrollment, resetEnrollmentState } from "../../store/slices/enrollmentSlice";
import type { Enrollment } from "../../interfaces/enrollment.interface";
import { PageHeader, StatCard, StatusBadge, SearchBox, TableSkeleton, EmptyState } from "../../components/admin/ui";
import { money, dateShort } from "../../components/admin/format";

const CYCLE: Record<string, string> = { monthly: "Monthly", termly: "Termly", "once-off": "One-time" };
const PAY: Record<string, string> = { paid: "Paid", unpaid: "Unpaid", due_soon: "Due soon", overdue: "Overdue", "once-off": "One-time", cancelled: "Cancelled" };

const AdminEnrollments = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { enrollments, loading, error, message } = useSelector((s: RootState) => s.enrollment);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");

  useEffect(() => {
    dispatch(getAllEnrollments());
    return () => { dispatch(resetEnrollmentState()); };
  }, [dispatch]);

  useEffect(() => {
    if (error) toast.error(error);
    if (message) toast.success(message);
  }, [error, message]);

  const rows = enrollments.filter((e: Enrollment) => {
    const q = search.trim().toLowerCase();
    const hit = !q || e.kid_name?.toLowerCase().includes(q) || e.course_name.toLowerCase().includes(q);
    return hit && (status === "all" || e.status === status);
  });
  const active = enrollments.filter((e: Enrollment) => e.status === "active").length;
  const cancelled = enrollments.filter((e: Enrollment) => e.status === "cancelled").length;

  const handleCancel = (e: Enrollment) => {
    if (window.confirm(`Cancel the enrollment for ${e.kid_name || "this child"} in ${e.course_name}?`)) dispatch(cancelEnrollment(e.id));
  };

  return (
    <>
      <PageHeader title="Enrollments" subtitle="Which child is on which course, and whether they are paid up." />
      <div className="grid sm:grid-cols-3 gap-4 mb-6">
        <StatCard label="Active" value={active} icon={<GraduationCap size={20} />} tone="ok" />
        <StatCard label="Cancelled" value={cancelled} icon={<Ban size={20} />} tone="warn" />
        <StatCard label="All enrollments" value={enrollments.length} icon={<Users size={20} />} />
      </div>

      <div className="adm-card">
        <div className="p-4 flex flex-col sm:flex-row gap-3 border-b border-ink-200">
          <SearchBox value={search} onChange={setSearch} placeholder="Search child or course…" />
          <select className="adm-input" value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Filter by status">
            <option value="all">All statuses</option>
            <option value="active">Active</option>
            <option value="pending">Pending</option>
            <option value="cancelled">Cancelled</option>
            <option value="completed">Completed</option>
          </select>
        </div>
        <div className="adm-table-wrap">
          <table className="adm-table">
            <thead><tr><th>Child</th><th>Course</th><th>Fee</th><th>Started</th><th>Next payment</th><th>Status</th><th><span className="sr-only-text">Actions</span></th></tr></thead>
            {loading && enrollments.length === 0 ? <TableSkeleton cols={7} /> : (
              <tbody>
                {rows.map((e: Enrollment) => (
                  <tr key={e.id}>
                    <td className="font-semibold">{e.kid_name ?? "—"}</td>
                    <td>{e.course_name}</td>
                    <td className="whitespace-nowrap"><p className="font-semibold">{money(e.fee_amount)}</p><p className="text-xs text-ink-500">{CYCLE[e.billing_cycle] ?? e.billing_cycle}</p></td>
                    <td className="whitespace-nowrap">{dateShort(e.start_date)}</td>
                    <td className="whitespace-nowrap">{e.payment_status ? <><StatusBadge status={e.payment_status === "paid" || e.payment_status === "once-off" ? "paid" : e.payment_status === "unpaid" || e.payment_status === "due_soon" ? "pending" : "failed"} label={PAY[e.payment_status]} /><p className="text-xs text-ink-500 mt-0.5">{dateShort(e.next_payment_date)}</p></> : "—"}</td>
                    <td><StatusBadge status={e.status} /></td>
                    <td className="text-right">{e.status === "active" && <button className="ds-btn ds-btn-ghost ds-btn-sm text-red-700" onClick={() => handleCancel(e)}>Cancel</button>}</td>
                  </tr>
                ))}
              </tbody>
            )}
          </table>
          {!loading && rows.length === 0 && <EmptyState icon={<GraduationCap size={22} />} title="No enrollments found" text={enrollments.length ? "Try a different search or filter." : "Enrollments will appear here when parents sign their children up."} />}
        </div>
      </div>
    </>
  );
};

export default AdminEnrollments;
