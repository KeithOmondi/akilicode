import { useState, useEffect } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { resetPassword, resetAuthState } from "../../store/slices/authSlice";
import toast from "react-hot-toast";
import { Lock, Loader2, CheckCircle2, XCircle } from "lucide-react";

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const { loading, error, message } = useAppSelector((state) => state.auth);
  const token = searchParams.get("token");

  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const inputCls = "w-full pl-12 pr-4 py-3.5 rounded-2xl border-2 border-purple-50 bg-purple-50/30 focus:bg-white focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 outline-none transition-all font-medium text-slate-700 placeholder:text-slate-400";
  const labelCls = "block text-[11px] font-black text-purple-900 uppercase tracking-wider mb-1.5 ml-1";

  useEffect(() => {
    if (message) {
      toast.success(message);
      setTimeout(() => navigate("/login"), 2500);
    }
    if (error) {
      toast.error(error);
      dispatch(resetAuthState());
    }
  }, [message, error, navigate, dispatch]);

  useEffect(() => {
    return () => { dispatch(resetAuthState()); };
  }, [dispatch]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) {
      toast.error("Invalid or missing reset token.");
      return;
    }
    if (newPassword !== confirm) {
      toast.error("Passwords do not match.");
      return;
    }
    if (newPassword.length < 8) {
      toast.error("Password must be at least 8 characters.");
      return;
    }

    dispatch(resetPassword({ token, newPassword }));
  };

  // No token in URL
  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FDFCFE] px-4">
        <div className="max-w-md w-full bg-white rounded-[0.5rem] shadow-xl shadow-purple-100/50 p-10 border border-purple-50 text-center space-y-4">
          <XCircle className="mx-auto text-red-400" size={48} />
          <h2 className="text-2xl font-black text-purple-900">Invalid Link</h2>
          <p className="text-slate-500">This reset link is invalid or has expired.</p>
          <Link to="/forgot-password" className="text-purple-700 font-black hover:underline">
            Request a new link
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FDFCFE] px-4">
      <div className="max-w-md w-full bg-white rounded-[2rem] shadow-xl shadow-purple-100/50 p-10 border border-purple-50">

        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Lock className="text-purple-600" size={32} />
          </div>
          <h1 className="text-3xl font-black text-purple-900 font-serif">New Password</h1>
          <p className="text-slate-500 mt-2 font-medium">Choose a strong password for your account.</p>
        </div>

        {/* Success state */}
        {message && (
          <div className="text-center space-y-4">
            <CheckCircle2 className="mx-auto text-green-500" size={48} />
            <p className="text-slate-600 font-medium">{message}</p>
            <p className="text-sm text-slate-400">Redirecting to login...</p>
          </div>
        )}

        {/* Form */}
        {!message && (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className={labelCls}>New Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-purple-300" size={18} />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className={inputCls}
                />
              </div>
            </div>

            <div>
              <label className={labelCls}>Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-purple-300" size={18} />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  className={inputCls}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-purple-700 hover:bg-purple-800 text-white font-black py-4 rounded-2xl shadow-lg shadow-purple-200 transition-all flex items-center justify-center gap-2 disabled:opacity-70 mt-4"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : "Reset Password"}
            </button>

            <p className="text-center text-sm text-slate-400 mt-2">
              Remembered it?{" "}
              <Link to="/login" className="text-purple-700 font-black hover:underline">
                Back to Login
              </Link>
            </p>
          </form>
        )}

      </div>
    </div>
  );
};

export default ResetPassword;