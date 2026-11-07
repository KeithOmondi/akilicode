import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Users, GraduationCap, Wallet, BookOpen, ArrowRight, Clock } from "lucide-react";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { getAllUsers } from "../../store/slices/userSlice";
import { getAllEnrollments } from "../../store/slices/enrollmentSlice";
import { getAllPayments } from "../../store/slices/paymentSlice";
import { getAllCourses } from "../../store/slices/courseSlice";
import type { Payment } from "../../interfaces/payment.interface";
import type { Enrollment } from "../../interfaces/enrollment.interface";
import { PageHeader, StatCard, StatusBadge, EmptyState } from "../../components/admin/ui";
import { money, dateShort } from "../../components/admin/format";

/** The overview: the numbers that matter today, and where to go next. Detail lives on the other pages. */
const AdminDashboard = () => {
  const dispatch = useAppDispatch();
  const { adminUsers } = useAppSelector((s) => s.user);
  const { enrollments } = useAppSelector((s) => s.enrollment);
  const { payments, loading: payLoading } = useAppSelector((s) => s.payment);
  const { courses } = useAppSelector((s) => s.course);
  const me = useAppSelector((s) => s.auth.user);

  useEffect(() => {
    dispatch(getAllUsers());
    dispatch(getAllEnrollments());
    dispatch(getAllPayments());
    dispatch(getAllCourses());
  }, [dispatch]);

  const completed = payments.filter((p: Payment) => p.status === "completed");
  const pending = payments.filter((p: Payment) => p.status === "pending");
  const revenue = completed.reduce((s: number, p: Payment) => s + Number(p.amount), 0);
  const monthStart = new Date(); monthStart.setDate(1); monthStart.setHours(0, 0, 0, 0);
  const thisMonth = completed.filter((p: Payment) => new Date(p.date) >= monthStart).reduce((s: number, p: Payment) => s + Number(p.amount), 0);
  const active = enrollments.filter((e: Enrollment) => e.status === "active").length;
  const overdue = enrollments.filter((e: Enrollment) => e.status === "active" && e.payment_status === "overdue");
  const recent = [...payments].sort((a: Payment, b: Payment) => +new Date(b.date) - +new Date(a.date)).slice(0, 6);

  return (
    <>
      <PageHeader title={`Welcome back${me?.name ? `, ${me.name.split(" ")[0]}` : ""}`} subtitle="Here is how AkiliCode is doing." />

      <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <StatCard label="Revenue this month" value={money(thisMonth)} icon={<Wallet size={20} />} tone="ok" hint={`${money(revenue)} all time`} />
        <StatCard label="Active enrollments" value={active} icon={<GraduationCap size={20} />} tone="info" hint={`${enrollments.length} in total`} />
        <StatCard label="Parent accounts" value={adminUsers.filter((u) => u.role === "parent").length} icon={<Users size={20} />} />
        <StatCard label="Courses" value={courses.length} icon={<BookOpen size={20} />} tone="warn" />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <section className="adm-card lg:col-span-2" aria-labelledby="recent-title">
          <div className="p-4 flex items-center justify-between border-b border-ink-200">
            <h2 id="recent-title" className="font-extrabold">Recent payments</h2>
            <Link to="/admin/payments" className="text-sm font-bold text-brand-700 inline-flex items-center gap-1">See all <ArrowRight size={14} aria-hidden="true" /></Link>
          </div>
          {recent.length === 0 ? (
            <EmptyState icon={<Wallet size={22} />} title={payLoading ? "Loading…" : "No payments yet"} text="They will show up here as parents pay." />
          ) : (
            <div className="adm-table-wrap">
              <table className="adm-table">
                <tbody>
                  {recent.map((p: Payment) => (
                    <tr key={p.id}>
                      <td><p className="font-semibold">{p.parent_name ?? "—"}</p><p className="text-xs text-ink-500">{p.kid_name} · {p.course_name}</p></td>
                      <td className="whitespace-nowrap font-semibold">{money(p.amount)}</td>
                      <td className="whitespace-nowrap text-ink-500">{dateShort(p.date)}</td>
                      <td><StatusBadge status={p.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="adm-card adm-card-pad" aria-labelledby="attention-title">
          <h2 id="attention-title" className="font-extrabold">Needs your attention</h2>
          <ul className="mt-4 space-y-3">
            <li className="flex items-start gap-3">
              <span className="w-9 h-9 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0" aria-hidden="true"><Clock size={18} /></span>
              <div className="text-sm"><p className="font-bold">{pending.length} payment{pending.length === 1 ? "" : "s"} waiting</p><p className="text-ink-500">Started, not yet confirmed by M-Pesa.</p></div>
            </li>
            <li className="flex items-start gap-3">
              <span className="w-9 h-9 rounded-lg bg-red-100 text-red-700 flex items-center justify-center shrink-0" aria-hidden="true"><GraduationCap size={18} /></span>
              <div className="text-sm"><p className="font-bold">{overdue.length} overdue enrollment{overdue.length === 1 ? "" : "s"}</p><p className="text-ink-500">Active, but the next payment is late.</p></div>
            </li>
          </ul>
          <div className="mt-6 pt-4 border-t border-ink-100 grid gap-2">
            <Link to="/admin/courses" className="ds-btn ds-btn-secondary ds-btn-sm justify-between">Manage courses <ArrowRight size={14} aria-hidden="true" /></Link>
            <Link to="/admin/pricing" className="ds-btn ds-btn-secondary ds-btn-sm justify-between">Prices and coupons <ArrowRight size={14} aria-hidden="true" /></Link>
            <Link to="/admin/testimonials" className="ds-btn ds-btn-secondary ds-btn-sm justify-between">Approve testimonials <ArrowRight size={14} aria-hidden="true" /></Link>
          </div>
        </section>
      </div>
    </>
  );
};

export default AdminDashboard;
