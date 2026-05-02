import { useEffect, useState, type ChangeEvent } from "react";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import { 
  Search, 
  XCircle, 
  CheckCircle2, 
  Calendar,
  User,
  BookOpen,
  ArrowUpDown
} from "lucide-react";
import type { AppDispatch, RootState } from "../../store/store";
import { 
  getAllEnrollments, // Switched from getMyEnrollments
  cancelEnrollment, 
  resetEnrollmentState 
} from "../../store/slices/enrollmentSlice";
import type { Enrollment } from "../../interfaces/enrollment.interface";

const AdminEnrollments = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { enrollments, loading, error, message } = useSelector((s: RootState) => s.enrollment);
  
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "cancelled">("all");

  useEffect(() => {
    // Now fetching the global enrollment list for admin oversight
    dispatch(getAllEnrollments()); 
    
    return () => { dispatch(resetEnrollmentState()); };
  }, [dispatch]);

  useEffect(() => {
    if (error) toast.error(error);
    if (message) toast.success(message);
  }, [error, message]);

  const handleCancel = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to cancel the enrollment for ${name}?`)) {
      dispatch(cancelEnrollment(id));
    }
  };

  const handleStatusChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setStatusFilter(e.target.value as "all" | "active" | "cancelled");
  };

  const filteredEnrollments = enrollments.filter((e: Enrollment) => {
    const matchesSearch = 
      e.kid_name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      e.course_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || e.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-[#0a0214] p-6 lg:p-10">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">
            Enrollment <span className="text-orange-500">Registry</span>
          </h1>
          <p className="text-purple-400/60 text-sm font-medium mt-1">
            Global view of all student subscriptions and program access.
          </p>
        </div>
        
        <div className="flex items-center gap-3 bg-purple-900/20 p-1.5 rounded-2xl border border-purple-800/30">
          <div className="px-4 py-2 text-center">
            <p className="text-[10px] font-black text-purple-500 uppercase">Total Active</p>
            <p className="text-xl font-black text-white">
              {enrollments.filter((e: Enrollment) => e.status === 'active').length}
            </p>
          </div>
          <div className="w-px h-8 bg-purple-800/50" />
          <div className="px-4 py-2 text-center">
            <p className="text-[10px] font-black text-purple-500 uppercase">Cancelled</p>
            <p className="text-xl font-black text-orange-500">
              {enrollments.filter((e: Enrollment) => e.status === 'cancelled').length}
            </p>
          </div>
        </div>
      </div>

      {/* Control Bar */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-6">
        <div className="md:col-span-8 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-purple-500" size={18} />
          <input 
            type="text" 
            placeholder="Search by student name or course..."
            value={searchTerm}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
            className="w-full bg-purple-950/10 border border-purple-800/30 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-purple-700 outline-none focus:border-orange-500/50 transition-all"
          />
        </div>
        <div className="md:col-span-4 flex gap-2">
          <select 
            value={statusFilter}
            onChange={handleStatusChange}
            className="flex-1 bg-purple-950/10 border border-purple-800/30 rounded-2xl px-4 text-purple-300 outline-none focus:border-orange-500/50 appearance-none cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active Only</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <button className="p-4 bg-purple-800/20 border border-purple-800/30 rounded-2xl text-purple-400 hover:text-white transition-all">
            <ArrowUpDown size={20} />
          </button>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-purple-950/5 border border-purple-900/20 rounded-[32px] overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-purple-900/30 bg-purple-900/10">
                <th className="px-6 py-5 text-[11px] font-black text-purple-500 uppercase tracking-widest">Student / Program</th>
                <th className="px-6 py-5 text-[11px] font-black text-purple-500 uppercase tracking-widest">Billing Plan</th>
                <th className="px-6 py-5 text-[11px] font-black text-purple-500 uppercase tracking-widest">Enrollment Date</th>
                <th className="px-6 py-5 text-[11px] font-black text-purple-500 uppercase tracking-widest">Status</th>
                <th className="px-6 py-5 text-[11px] font-black text-purple-500 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-purple-900/10">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-20 text-center text-purple-500 font-bold animate-pulse uppercase tracking-widest text-xs">
                    Accessing Secure Database...
                  </td>
                </tr>
              ) : filteredEnrollments.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-20 text-center text-purple-700 font-bold">
                    No matching enrollment records found.
                  </td>
                </tr>
              ) : (
                filteredEnrollments.map((enrollment: Enrollment) => (
                  <tr key={enrollment.id} className="hover:bg-purple-800/5 transition-colors group">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-purple-900/30 flex items-center justify-center text-orange-500 border border-purple-800/30">
                          <User size={18} />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-white">{enrollment.kid_name || "Unknown Student"}</p>
                          <div className="flex items-center gap-1.5 mt-0.5 text-purple-500">
                            <BookOpen size={12} />
                            <p className="text-[11px] font-medium">{enrollment.course_name}</p>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <p className="text-sm font-black text-purple-200">
                        KES {enrollment.fee_amount.toLocaleString()}
                      </p>
                      <p className="text-[10px] text-purple-500 font-bold uppercase mt-0.5 tracking-tighter">
                        {enrollment.billing_cycle}
                      </p>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2 text-purple-300">
                        <Calendar size={14} className="text-purple-600" />
                        <span className="text-xs font-medium">
                          {new Date(enrollment.start_date).toLocaleDateString()}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        enrollment.status === 'active' 
                        ? 'bg-green-500/10 text-green-400 border border-green-500/20' 
                        : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                      }`}>
                        <div className={`w-1 h-1 rounded-full ${enrollment.status === 'active' ? 'bg-green-400' : 'bg-rose-400'}`} />
                        {enrollment.status}
                      </div>
                    </td>
                    <td className="px-6 py-5 text-right">
                      {enrollment.status === 'active' ? (
                        <button 
                          onClick={() => handleCancel(enrollment.id, enrollment.kid_name || "Student")}
                          className="p-2 text-purple-500 hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-all"
                          title="Cancel Enrollment"
                        >
                          <XCircle size={18} />
                        </button>
                      ) : (
                        <CheckCircle2 size={18} className="text-purple-800 ml-auto mr-2" />
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminEnrollments;