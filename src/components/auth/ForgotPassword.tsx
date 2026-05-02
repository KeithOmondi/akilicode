import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { forgotPassword, resetAuthState } from "../../store/slices/authSlice";
import toast from "react-hot-toast";
import { Mail, ArrowLeft, Loader2, KeyRound, CheckCircle2 } from "lucide-react";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const dispatch = useAppDispatch();
  const { loading } = useAppSelector((state) => state.auth);

  // ── Cleanup on unmount only ────────────────────────────────────────────
  useEffect(() => {
    return () => {
      dispatch(resetAuthState());
    };
  }, [dispatch]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const result = await dispatch(forgotPassword({ email })).unwrap();
      toast.success(result.message || "Reset link sent to your email!");
      setSent(true);
      setEmail("");
    } catch (err) {
      toast.error(typeof err === "string" ? err : "Failed to send reset link");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FDFCFE] px-4">
      <div className="max-w-md w-full bg-white rounded-[0.5rem] shadow-xl shadow-purple-100/50 p-8 border border-purple-50">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <KeyRound className="text-purple-600" size={32} />
          </div>
          <h1 className="text-3xl font-black text-purple-900 tracking-tight">Forgot Password?</h1>
          <p className="text-slate-500 mt-2 font-medium">
            Enter your registered email address to receive a reset link.
          </p>
        </div>

        {/* Success state */}
        {sent ? (
          <div className="text-center space-y-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="text-green-600" size={32} />
            </div>
            <div>
              <p className="text-slate-600 font-medium">Reset link sent!</p>
              <p className="text-sm text-slate-400 mt-2">
                Check your inbox and click the link to reset your password.
              </p>
            </div>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 text-sm font-black text-purple-700 hover:underline underline-offset-4"
            >
              <ArrowLeft size={16} />
              Back to Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-[11px] font-black text-purple-900 uppercase tracking-wider mb-1.5 ml-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-purple-300" size={18} />
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  className="w-full pl-12 pr-4 py-3.5 rounded-2xl border-2 border-purple-50 bg-purple-50/30 focus:bg-white focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 outline-none transition-all font-medium text-slate-700"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-purple-700 hover:bg-purple-800 text-white font-black py-4 rounded-2xl shadow-lg shadow-purple-200 transition-all flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                "Send Reset Link"
              )}
            </button>

            <div className="text-center">
              <Link
                to="/login"
                className="inline-flex items-center gap-2 text-sm font-black text-slate-500 hover:text-purple-700 transition-colors"
              >
                <ArrowLeft size={16} />
                Back to Login
              </Link>
            </div>
          </form>
        )}

      </div>
    </div>
  );
};

export default ForgotPassword;
