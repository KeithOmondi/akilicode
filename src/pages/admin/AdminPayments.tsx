import { useEffect, useState, type ChangeEvent } from "react";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import { 
  Search, 
  Download, 
  CreditCard, 
  User, 
  BookOpen, 
  Filter,
  CheckCircle2,
  Clock,
  XCircle,
  TrendingUp,
  Mail
} from "lucide-react";
import type { AppDispatch, RootState } from "../../store/store";
import { getAllPayments, resetPaymentState } from "../../store/slices/paymentSlice";
import type { Payment } from "../../interfaces/payment.interface";

const AdminPayments = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { payments, loading, error } = useSelector((s: RootState) => s.payment);
  
  const [searchTerm, setSearchTerm] = useState("");
  const [methodFilter, setMethodFilter] = useState("all");

  useEffect(() => {
    dispatch(getAllPayments());
    return () => { dispatch(resetPaymentState()); };
  }, [dispatch]);

  useEffect(() => {
    if (error) toast.error(error);
  }, [error]);

  const filteredPayments = payments.filter((p: Payment) => {
    const matchesSearch = 
      p.parent_name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      p.receipt_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.kid_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesMethod = methodFilter === "all" || p.method === methodFilter;
    return matchesSearch && matchesMethod;
  });

  const totalRevenue = payments
    .filter(p => p.status === 'completed')
    .reduce((acc, curr) => acc + Number(curr.amount), 0);

  return (
    <div className="min-h-screen bg-[#0a0214] p-6 lg:p-10">
      {/* Header & Stats Dashboard */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">
            Revenue <span className="text-orange-500">Analytics</span>
          </h1>
          <p className="text-purple-400/60 text-sm font-medium mt-1">
            Global payment ledger and financial status monitoring.
          </p>
        </div>

        <div className="flex flex-wrap gap-4">
          <div className="bg-purple-900/20 border border-purple-800/30 p-4 rounded-2xl min-w-[180px]">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp size={14} className="text-green-400" />
              <span className="text-[10px] font-black text-purple-500 uppercase">Total Revenue</span>
            </div>
            <p className="text-2xl font-black text-white">
              <span className="text-sm text-purple-400 mr-1">KES</span>
              {totalRevenue.toLocaleString()}
            </p>
          </div>
          <div className="bg-purple-900/20 border border-purple-800/30 p-4 rounded-2xl min-w-[150px]">
            <div className="flex items-center gap-2 mb-1">
              <CreditCard size={14} className="text-orange-400" />
              <span className="text-[10px] font-black text-purple-500 uppercase">Transactions</span>
            </div>
            <p className="text-2xl font-black text-white">{payments.length}</p>
          </div>
        </div>
      </div>

      {/* Control Bar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mb-6">
        <div className="lg:col-span-7 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-purple-500" size={18} />
          <input 
            type="text" 
            placeholder="Search by Parent, Student, or Receipt #..."
            value={searchTerm}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
            className="w-full bg-purple-950/10 border border-purple-800/30 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-purple-700 outline-none focus:border-orange-500/50 transition-all"
          />
        </div>
        <div className="lg:col-span-3">
          <div className="relative h-full">
            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-purple-500" size={18} />
            <select 
              value={methodFilter}
              onChange={(e) => setMethodFilter(e.target.value)}
              className="w-full h-full bg-purple-950/10 border border-purple-800/30 rounded-2xl pl-12 pr-4 text-purple-300 outline-none focus:border-orange-500/50 appearance-none cursor-pointer"
            >
              <option value="all">All Methods</option>
              <option value="M-Pesa">M-Pesa</option>
              <option value="Cash">Cash</option>
              <option value="Bank Transfer">Bank Transfer</option>
            </select>
          </div>
        </div>
        <button className="lg:col-span-2 bg-orange-500 hover:bg-orange-600 text-white font-black rounded-2xl flex items-center justify-center gap-2 transition-all py-4">
          <Download size={20} />
          <span>EXPORT</span>
        </button>
      </div>

      {/* Data Table */}
      <div className="bg-purple-950/5 border border-purple-900/20 rounded-[32px] overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-purple-900/30 bg-purple-900/10">
                <th className="px-6 py-5 text-[11px] font-black text-purple-500 uppercase tracking-widest">Transaction Info</th>
                <th className="px-6 py-5 text-[11px] font-black text-purple-500 uppercase tracking-widest">Parent Details</th>
                <th className="px-6 py-5 text-[11px] font-black text-purple-500 uppercase tracking-widest">Amount</th>
                <th className="px-6 py-5 text-[11px] font-black text-purple-500 uppercase tracking-widest">Method</th>
                <th className="px-6 py-5 text-[11px] font-black text-purple-500 uppercase tracking-widest">Status</th>
                <th className="px-6 py-5 text-[11px] font-black text-purple-500 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-purple-900/10">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-20 text-center text-purple-500 font-bold animate-pulse uppercase tracking-widest text-xs">
                    Decrypting Ledger Records...
                  </td>
                </tr>
              ) : filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-20 text-center text-purple-700 font-bold">
                    No payment records found matching your filters.
                  </td>
                </tr>
              ) : (
                filteredPayments.map((payment: Payment) => (
                  <tr key={payment.id} className="hover:bg-purple-800/5 transition-colors group">
                    <td className="px-6 py-5">
                      <p className="text-[10px] font-black text-orange-500 tracking-tighter mb-1 uppercase">
                        {payment.receipt_number}
                      </p>
                      <div className="flex items-center gap-4">
                        <div>
                          <p className="text-sm font-bold text-white">{payment.kid_name}</p>
                          <div className="flex items-center gap-1.5 mt-0.5 text-purple-500">
                            <BookOpen size={12} />
                            <p className="text-[11px] font-medium">{payment.course_name}</p>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2">
                        <User size={14} className="text-purple-600" />
                        <p className="text-sm font-bold text-purple-200">{payment.parent_name}</p>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <Mail size={12} className="text-purple-800" />
                        <p className="text-xs text-purple-600 italic">Global Record</p>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <p className="text-sm font-black text-white">
                        KES {Number(payment.amount).toLocaleString()}
                      </p>
                      <p className="text-[10px] text-purple-500 font-bold uppercase mt-0.5 tracking-tighter">
                        {new Date(payment.date).toLocaleDateString()}
                      </p>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2 text-purple-300">
                        <div className="w-8 h-8 rounded-lg bg-purple-900/30 flex items-center justify-center border border-purple-800/30">
                          <CreditCard size={14} className="text-orange-500" />
                        </div>
                        <span className="text-xs font-bold uppercase tracking-wide">
                          {payment.method}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        payment.status === 'completed' 
                        ? 'bg-green-500/10 text-green-400 border border-green-500/20' 
                        : payment.status === 'pending'
                        ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20'
                        : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                      }`}>
                        {payment.status === 'completed' ? <CheckCircle2 size={10} /> : 
                         payment.status === 'pending' ? <Clock size={10} /> : <XCircle size={10} />}
                        {payment.status}
                      </div>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <button 
                        className="p-2 text-purple-500 hover:text-white hover:bg-purple-800/30 rounded-lg transition-all"
                        title="View Full Receipt"
                      >
                        <Download size={18} />
                      </button>
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

export default AdminPayments;