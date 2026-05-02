import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { register, resetAuthState } from "../../store/slices/authSlice";
import toast from "react-hot-toast";
import { User, Mail, Phone, Lock, UserPlus, Loader2 } from "lucide-react";

const Register = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });

  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { loading, error, message } = useAppSelector((state) => state.auth);

  const inputCls = "w-full pl-12 pr-4 py-3.5 rounded-2xl border-2 border-purple-50 bg-purple-50/30 focus:bg-white focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 outline-none transition-all font-medium text-slate-700 placeholder:text-slate-400";
  const labelCls = "block text-[11px] font-black text-purple-900 uppercase tracking-wider mb-1.5 ml-1";

  useEffect(() => {
    if (message) {
      toast.success(`${message}. Redirecting to login...`);
      const timer = setTimeout(() => navigate("/login"), 2000);
      return () => clearTimeout(timer);
    }
    if (error) {
      const errMsg = typeof error === "string" ? error : "Registration failed";
      toast.error(errMsg);
      dispatch(resetAuthState());
    }
  }, [message, error, navigate, dispatch]);

  useEffect(() => {
    return () => { dispatch(resetAuthState()); };
  }, [dispatch]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(register(formData));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FDFCFE] px-4 py-12">
      {/* Increased max-width to 2xl to accommodate side-by-side columns */}
      <div className="max-w-2xl w-full bg-white rounded-[0.5rem] shadow-xl shadow-purple-100/50 p-8 sm:p-12 border border-purple-50 transition-all">
        
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <UserPlus className="text-orange-600" size={32} />
          </div>
          <h1 className="text-3xl font-black text-purple-900 font-serif tracking-tight">Create Account</h1>
          <p className="text-slate-500 font-serif mt-2 font-medium">Join the Akili Code community</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Side-by-Side Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Full Name */}
            <div className="space-y-1">
              <label className={labelCls}>Full Name</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-purple-300" size={18} />
                <input
                  type="text"
                  required
                  placeholder="John Doe"
                  className={inputCls}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
            </div>

            {/* Email Address */}
            <div className="space-y-1">
              <label className={labelCls}>Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-purple-300" size={18} />
                <input
                  type="email"
                  required
                  placeholder="john@example.com"
                  className={inputCls}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </div>

            {/* Phone Number */}
            <div className="space-y-1">
              <label className={labelCls}>Phone Number</label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-purple-300" size={18} />
                <input
                  type="tel"
                  required
                  placeholder="2547XXXXXXXX"
                  className={inputCls}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1">
              <label className={labelCls}>Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-purple-300" size={18} />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  className={inputCls}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-purple-700 hover:bg-purple-800 text-white font-black py-4 rounded-2xl shadow-lg shadow-purple-200 transition-all flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                "Create Account"
              )}
            </button>
          </div>
        </form>

        <div className="mt-10 text-center">
          <p className="text-slate-500 font-medium text-sm">
            Already have an account?{" "}
            <Link to="/login" className="text-purple-700 font-black hover:underline underline-offset-4">
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;