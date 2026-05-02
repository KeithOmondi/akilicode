import {
  Users,
  BookOpen,
  CreditCard,
  ArrowUpRight,
  CalendarClock,
  ChevronRight,
  PlusCircle,
  AlertTriangle,
  BadgeCheck,
  Infinity as InfinityIcon,
  Clock,
} from "lucide-react";
import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import type { AppDispatch, RootState } from "../../store/store";
import { getMyEnrollments } from "../../store/slices/enrollmentSlice";
import { getMyKids } from "../../store/slices/kidSlice";
import type { Enrollment } from "../../interfaces/enrollment.interface";

// ─── Helpers ──────────────────────────────────────────────────────────────────
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

// ─── Next Payment Card ────────────────────────────────────────────────────────
const NextPaymentCard = ({ enrollments }: { enrollments: Enrollment[] }) => {
  const activeEnrollments = enrollments.filter(
    (e) => e.status === "active" || e.status === "completed"
  );

  // Find the most urgent upcoming payment
  const overdueEnrollments = activeEnrollments.filter(
    (e) => e.payment_status === "overdue"
  );
  const dueSoonEnrollments = activeEnrollments.filter(
    (e) => e.payment_status === "due_soon"
  );
  const upcomingEnrollments = activeEnrollments.filter(
    (e) => e.payment_status === "paid" && e.next_payment_date
  );
  const onceOffEnrollments = activeEnrollments.filter(
    (e) => e.payment_status === "once-off"
  );

  // Priority: overdue → due soon → upcoming → once-off → nothing active
  const urgent = overdueEnrollments[0] || dueSoonEnrollments[0];
  const upcoming = upcomingEnrollments.sort((a, b) =>
    new Date(a.next_payment_date!).getTime() - new Date(b.next_payment_date!).getTime()
  )[0];

  const featured = urgent || upcoming;

  // Total amount due right now
  const amountDue = [...overdueEnrollments, ...dueSoonEnrollments].reduce(
    (acc, e) => acc + Number(e.fee_amount),
    0
  );

  if (activeEnrollments.length === 0) {
    return (
      <div className="bg-slate-900 rounded-[0.5rem] p-10 text-white relative overflow-hidden shadow-2xl shadow-slate-300">
        <div className="relative z-10">
          <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mb-8">
            <CalendarClock className="text-orange-500" size={24} />
          </div>
          <h3 className="text-2xl font-serif font-black mb-2">Next Billing</h3>
          <p className="text-slate-400 text-sm leading-relaxed font-medium">
            No active enrollments yet. Enroll a student to get started.
          </p>
        </div>
        <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 rounded-full blur-3xl -mr-10 -mt-10" />
      </div>
    );
  }

  // All once-off, nothing more to pay
  if (!featured && onceOffEnrollments.length > 0) {
    return (
      <div className="bg-slate-900 rounded-[0.5rem] p-10 text-white relative overflow-hidden shadow-2xl shadow-slate-300">
        <div className="relative z-10">
          <div className="w-12 h-12 bg-green-500/20 rounded-2xl flex items-center justify-center mb-8">
            <InfinityIcon className="text-green-400" size={24} />
          </div>
          <h3 className="text-2xl font-serif font-black mb-2">All Paid Up</h3>
          <p className="text-slate-400 text-sm leading-relaxed font-medium">
            All enrollments are once-off payments. No further payments due.
          </p>
          <div className="mt-6 p-4 bg-green-500/10 rounded-2xl border border-green-500/20">
            <p className="text-green-400 text-xs font-bold uppercase tracking-widest">
              ✓ No upcoming payments
            </p>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 rounded-full blur-3xl -mr-10 -mt-10" />
      </div>
    );
  }

  // Overdue or due soon
  if (urgent) {
    const isOverdue = urgent.payment_status === "overdue";
    const days = urgent.next_payment_date ? getDaysUntil(urgent.next_payment_date) : null;

    return (
      <div className={`rounded-[0.5rem] p-10 text-white relative overflow-hidden shadow-2xl ${
        isOverdue ? "bg-red-900 shadow-red-300" : "bg-amber-900 shadow-amber-300"
      }`}>
        <div className="relative z-10">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-8 ${
            isOverdue ? "bg-red-500/20" : "bg-amber-500/20"
          }`}>
            <AlertTriangle className={isOverdue ? "text-red-400" : "text-amber-400"} size={24} />
          </div>

          <h3 className="text-2xl font-serif font-black mb-1">
            {isOverdue ? "Payment Overdue" : "Payment Due Soon"}
          </h3>

          <p className={`text-sm font-bold mb-6 ${isOverdue ? "text-red-300" : "text-amber-300"}`}>
            {isOverdue
              ? `Overdue since ${urgent.next_payment_date ? formatDate(urgent.next_payment_date) : "—"}`
              : days === 0
              ? "Due today!"
              : `Due in ${days} day${days === 1 ? "" : "s"} — ${urgent.next_payment_date ? formatDate(urgent.next_payment_date) : "—"}`
            }
          </p>

          {/* Affected enrollments */}
          <div className="space-y-2 mb-6">
            {[...overdueEnrollments, ...dueSoonEnrollments].map((e) => (
              <div key={e.id} className="flex justify-between items-center p-3 bg-white/10 rounded-xl">
                <div>
                  <p className="text-xs font-bold text-white">{e.course_name}</p>
                  <p className="text-[10px] text-white/60">{e.kid_name}</p>
                </div>
                <span className="text-xs font-black text-white">
                  KES {Number(e.fee_amount).toLocaleString()}
                </span>
              </div>
            ))}
          </div>

          <Link
            to="/parent/programs"
            className={`w-full flex items-center justify-center font-black uppercase tracking-widest text-xs py-4 rounded-2xl transition-all shadow-lg active:scale-95 ${
              isOverdue
                ? "bg-red-500 hover:bg-red-400 shadow-red-500/30"
                : "bg-amber-500 hover:bg-amber-400 shadow-amber-500/30"
            } text-white`}
          >
            Pay KES {amountDue.toLocaleString(undefined, { minimumFractionDigits: 2 })} Now
          </Link>
        </div>
        <div className={`absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl -mr-10 -mt-10 ${
          isOverdue ? "bg-red-500/10" : "bg-amber-500/10"
        }`} />
      </div>
    );
  }

  // Upcoming payment
  if (upcoming && upcoming.next_payment_date) {
    const days = getDaysUntil(upcoming.next_payment_date);

    return (
      <div className="bg-slate-900 rounded-[0.5rem] p-10 text-white relative overflow-hidden shadow-2xl shadow-slate-300">
        <div className="relative z-10">
          <div className="w-12 h-12 bg-purple-500/20 rounded-2xl flex items-center justify-center mb-8">
            <CalendarClock className="text-purple-400" size={24} />
          </div>

          <h3 className="text-2xl font-serif font-black mb-1">Next Payment</h3>
          <p className="text-slate-400 text-sm font-medium mb-6">
            {formatDate(upcoming.next_payment_date)} · in {days} day{days === 1 ? "" : "s"}
          </p>

          {/* Next payment details */}
          <div className="p-4 bg-white/5 rounded-2xl border border-white/10 mb-6">
            <div className="flex justify-between items-center mb-2">
              <div>
                <p className="text-sm font-bold text-white">{upcoming.course_name}</p>
                <p className="text-[10px] text-slate-400">{upcoming.kid_name} · {upcoming.billing_cycle}</p>
              </div>
              <span className="text-lg font-black text-orange-400">
                KES {Number(upcoming.fee_amount).toLocaleString()}
              </span>
            </div>
          </div>

          {/* Other upcoming payments count */}
          {upcomingEnrollments.length > 1 && (
            <p className="text-xs text-slate-500 mb-6">
              +{upcomingEnrollments.length - 1} more upcoming payment{upcomingEnrollments.length - 1 > 1 ? "s" : ""}
            </p>
          )}

          <Link
            to="/parent/programs"
            className="w-full flex items-center justify-center bg-orange-500 hover:bg-orange-600 text-white font-black uppercase tracking-widest text-xs py-4 rounded-2xl transition-all shadow-lg shadow-orange-500/30 active:scale-95"
          >
            View All Payments
          </Link>
        </div>
        <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl -mr-10 -mt-10" />
      </div>
    );
  }

  return null;
};

// ─── Main Component ───────────────────────────────────────────────────────────
const ParentDashboard = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { enrollments } = useSelector((s: RootState) => s.enrollment);
  const { kids } = useSelector((s: RootState) => s.kid);

  useEffect(() => {
    dispatch(getMyEnrollments());
    dispatch(getMyKids());
  }, [dispatch]);

  const totalFees = enrollments
    .filter((e) => e.status === "active")
    .reduce((acc, curr) => {
      const amount = typeof curr.fee_amount === "string"
        ? parseFloat(curr.fee_amount)
        : curr.fee_amount;
      return acc + (amount || 0);
    }, 0);

  const activeCourses = enrollments.filter((e) => e.status === "active").length;

  const overdueCount = enrollments.filter(
    (e) => e.payment_status === "overdue"
  ).length;

  const stats = [
    {
      label: "Registered Students",
      value: kids.length,
      icon: Users,
      accent: "text-blue-600",
      bg: "bg-blue-50/50",
    },
    {
      label: "Active Courses",
      value: activeCourses,
      icon: BookOpen,
      accent: "text-purple-600",
      bg: "bg-purple-50/50",
    },
    {
      label: "Monthly Fees",
      value: `KES ${totalFees.toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
      icon: CreditCard,
      accent: "text-orange-600",
      bg: "bg-orange-50/50",
    },
  ];

  return (
    <div className="min-h-screen bg-transparent text-slate-900 p-6 lg:p-12">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <header className="relative mb-12 py-8 border-b border-slate-100 flex flex-col md:flex-row justify-between items-end gap-6">
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-4">
              <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
              <span className="text-orange-600 text-xs font-bold uppercase tracking-widest">Parent Portal</span>
            </div>
            <h1 className="text-4xl lg:text-3xl font-serif font-black text-slate-900 tracking-tight leading-none">
              Dashboard <span className="text-orange-500">Overview.</span>
            </h1>
            <p className="max-w-xl text-slate-500 font-serif text-lg mt-3">
              Manage your children's learning path and track their progress.
            </p>
          </div>
          <Link
            to="/parent/courses"
            className="flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-2xl font-bold text-sm hover:bg-slate-800 transition-all shadow-lg shadow-slate-200"
          >
            <PlusCircle size={18} />
            Explore Courses
          </Link>
        </header>

        {/* Overdue alert banner */}
        {overdueCount > 0 && (
          <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-3">
            <AlertTriangle className="text-red-500 shrink-0" size={20} />
            <p className="text-sm font-bold text-red-700">
              You have {overdueCount} overdue payment{overdueCount > 1 ? "s" : ""}.
              Please settle them to keep your enrollments active.
            </p>
            <Link
              to="/parent/programs"
              className="ml-auto text-xs font-black text-red-600 underline underline-offset-4 shrink-0"
            >
              Pay Now
            </Link>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {stats.map((stat, i) => (
            <div
              key={i}
              className="bg-white border border-slate-100 p-8 rounded-[0.5rem] hover:border-slate-200 transition-all group"
            >
              <div className={`w-12 h-12 ${stat.bg} rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110`}>
                <stat.icon className={stat.accent} size={24} />
              </div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">
                {stat.label}
              </p>
              <p className="text-3xl font-black text-slate-900 font-serif">{stat.value}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

          {/* Enrollments list */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white border border-slate-100 rounded-[0.5rem] p-8 lg:p-10 transition-all">
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h3 className="text-2xl font-serif font-black text-slate-900">Active Enrollments</h3>
                  <p className="text-sm text-slate-400 font-medium">Recently joined programs</p>
                </div>
                <Link
                  to="/parent/programs"
                  className="p-2 bg-slate-50 rounded-full hover:bg-slate-100 transition-colors text-slate-600"
                >
                  <ArrowUpRight size={20} />
                </Link>
              </div>

              {enrollments.length > 0 ? (
                <div className="space-y-3">
                  {enrollments.slice(0, 4).map((e) => (
                    <div
                      key={e.id}
                      className={`flex items-center justify-between p-5 rounded-[24px] border transition-all group hover:bg-white ${
                        e.payment_status === "overdue"
                          ? "bg-red-50/50 border-red-100"
                          : e.payment_status === "due_soon"
                          ? "bg-amber-50/50 border-amber-100"
                          : "bg-slate-50/30 border-transparent hover:border-slate-200"
                      }`}
                    >
                      <div className="flex items-center gap-5">
                        <div className="w-12 h-12 bg-white border border-slate-100 rounded-2xl flex items-center justify-center font-black text-slate-900 shadow-sm group-hover:bg-slate-900 group-hover:text-white transition-colors">
                          {e.course_name[0]}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 font-serif text-lg">{e.course_name}</p>
                          <p className="text-xs text-slate-400 font-medium tracking-wide">
                            Student: <span className="text-slate-600">{e.kid_name}</span>
                          </p>
                          {/* Payment status hint */}
                          {e.payment_status === "overdue" && (
                            <p className="text-[10px] font-bold text-red-500 flex items-center gap-1 mt-0.5">
                              <AlertTriangle size={10} /> Payment overdue
                            </p>
                          )}
                          {e.payment_status === "due_soon" && e.next_payment_date && (
                            <p className="text-[10px] font-bold text-amber-600 flex items-center gap-1 mt-0.5">
                              <Clock size={10} /> Due {formatDate(e.next_payment_date)}
                            </p>
                          )}
                          {e.payment_status === "paid" && e.next_payment_date && (
                            <p className="text-[10px] font-bold text-green-600 flex items-center gap-1 mt-0.5">
                              <BadgeCheck size={10} /> Next: {formatDate(e.next_payment_date)}
                            </p>
                          )}
                          {e.payment_status === "once-off" && (
                            <p className="text-[10px] font-bold text-purple-500 flex items-center gap-1 mt-0.5">
                              <InfinityIcon size={10} /> Fully paid
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                          e.status === "active"
                            ? "bg-green-100 text-green-700"
                            : e.status === "completed"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-orange-100 text-orange-700"
                        }`}>
                          {e.status}
                        </span>
                        <ChevronRight
                          size={18}
                          className="text-slate-300 group-hover:text-slate-900 transition-colors"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <BookOpen className="mx-auto text-slate-200 mb-4" size={48} />
                  <p className="text-slate-400 font-medium italic">No active enrollments found.</p>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <NextPaymentCard enrollments={enrollments} />

            <div className="bg-white border border-slate-100 rounded-[32px] p-6 text-center">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Need Help?</p>
              <button className="text-sm font-black text-slate-900 underline decoration-orange-500 decoration-2 underline-offset-4">
                Contact Academic Advisor
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ParentDashboard;