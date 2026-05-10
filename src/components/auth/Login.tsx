import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { login, resetAuthState } from "../../store/slices/authSlice";
import toast from "react-hot-toast";
import { Mail, Lock, LogIn, Loader2, Eye, EyeOff } from "lucide-react";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const { loading, error, isAuthenticated, user } = useAppSelector(
    (state) => state.auth,
  );

  // ── Redirect after successful login ───────────────────────────────────
  useEffect(() => {
    if (isAuthenticated && user) {
      toast.success(`Welcome back, ${user.name || 'User'}!`);
      const from = (location.state as { from?: { pathname: string } })?.from?.pathname;
      const dashboardPath = user.role === "admin" ? "/admin/dashboard" : "/parent/dashboard";
      navigate(from || dashboardPath, { replace: true });
    }
  }, [isAuthenticated, user, navigate, location.state]);

  // ── Error Handling ─────────────────────────────────────────────────────
  useEffect(() => {
    if (error) {
      const message = typeof error === "string" ? error : "Login failed. Please try again.";
      toast.error(message);
    }
  }, [error]);

  // ── Cleanup on unmount only ────────────────────────────────────────────
  useEffect(() => {
    return () => {
      dispatch(resetAuthState());
    };
  }, [dispatch]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(login({ email, password }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FDFCFE] px-4">
      <div className="max-w-md w-full bg-white rounded-[0.5rem] shadow-xl shadow-purple-100/50 p-8 border border-purple-50">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <LogIn className="text-purple-600" size={32} />
          </div>
          <h1 className="text-3xl font-black text-purple-900 font-serif tracking-tight">Welcome Back</h1>
          <p className="text-slate-500 mt-2 font-medium">
            Please enter your details to sign in
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email Field */}
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

          {/* Password Field */}
          <div>
            <div className="flex justify-between items-center mb-1.5 ml-1">
              <label className="block text-[11px] font-black text-purple-900 uppercase tracking-wider">
                Password
              </label>
              <Link
                to="/forgot-password"
                className="text-[11px] font-bold text-orange-500 hover:text-orange-600 uppercase tracking-wider"
              >
                Forgot Password?
              </Link>
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-purple-300" size={18} />
              <input
                type={showPassword ? "text" : "password"}
                required
                placeholder="••••••••"
                className="w-full pl-12 pr-12 py-3.5 rounded-2xl border-2 border-purple-50 bg-purple-50/30 focus:bg-white focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 outline-none transition-all font-medium text-slate-700"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-purple-300 hover:text-purple-600 transition-colors"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-purple-700 hover:bg-purple-800 text-white font-black py-4 rounded-2xl shadow-lg shadow-purple-200 transition-all flex items-center justify-center gap-2 disabled:opacity-70 mt-2"
          >
            {loading ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              "Sign In"
            )}
          </button>
        </form>

        {/* Footer Link */}
        <div className="mt-8 text-center">
          <p className="text-slate-500 font-medium text-sm">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="text-purple-700 font-black hover:underline underline-offset-4"
            >
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;