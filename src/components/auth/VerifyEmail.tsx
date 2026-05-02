import { useEffect, useRef } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { verifyEmail, resetAuthState } from "../../store/slices/authSlice";
import toast from "react-hot-toast";
import { ShieldCheck, Loader2, XCircle, ArrowRight } from "lucide-react";

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const hasCalled = useRef(false);

  const { loading, error, message } = useAppSelector((state) => state.auth);
  const token = searchParams.get("token");

  // ── Fire verification once, never again ───────────────────────────────
  useEffect(() => {
    if (!token || hasCalled.current) return;
    hasCalled.current = true;

    dispatch(verifyEmail(token))
      .unwrap()
      .then((result) => {
        toast.success(result.message || "Email verified successfully!");
        setTimeout(() => navigate("/parent/dashboard"), 2500);
      })
      .catch((err) => {
        toast.error(typeof err === "string" ? err : "Verification failed.");
      });
  }, [token, dispatch, navigate]);

  // ── Cleanup on unmount — separate effect ──────────────────────────────
  useEffect(() => {
    return () => {
      dispatch(resetAuthState());
    };
  }, [dispatch]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FDFCFE] px-4">
      <div className="max-w-md w-full bg-white rounded-[0.5rem] shadow-xl shadow-purple-100/50 p-10 border border-purple-50 text-center">

        {/* LOADING STATE */}
        {loading && (
          <div className="space-y-4">
            <Loader2 className="mx-auto text-purple-600 animate-spin" size={48} />
            <h2 className="text-2xl font-black text-purple-900">Verifying...</h2>
            <p className="text-slate-500 font-medium">
              We are securing your account, please wait.
            </p>
          </div>
        )}

        {/* SUCCESS STATE */}
        {!loading && message && (
          <div className="space-y-6">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <ShieldCheck className="text-green-600" size={40} />
            </div>
            <div>
              <h2 className="text-2xl font-black text-purple-900">Email Verified!</h2>
              <p className="text-slate-500 mt-2 font-medium">
                Your account is now active. Redirecting you to your dashboard...
              </p>
            </div>
            <Link
              to="/parent/dashboard"
              className="inline-flex items-center gap-2 bg-purple-700 text-white font-black px-8 py-3 rounded-2xl hover:bg-purple-800 transition-all shadow-lg shadow-purple-200"
            >
              Go to Dashboard <ArrowRight size={18} />
            </Link>
          </div>
        )}

        {/* ERROR STATE */}
        {!loading && error && (
          <div className="space-y-6">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto">
              <XCircle className="text-red-600" size={40} />
            </div>
            <div>
              <h2 className="text-2xl font-black text-purple-900">Verification Failed</h2>
              <p className="text-slate-500 mt-2 font-medium">{error}</p>
            </div>
            <div className="flex flex-col gap-3">
              <Link
                to="/register"
                className="text-purple-700 font-black hover:underline underline-offset-4"
              >
                Try Registering Again
              </Link>
              <Link to="/login" className="text-slate-400 text-sm font-bold">
                Back to Login
              </Link>
            </div>
          </div>
        )}

        {/* NO TOKEN STATE */}
        {!token && !loading && !message && !error && (
          <div className="space-y-4">
            <XCircle className="mx-auto text-slate-300" size={48} />
            <p className="text-slate-500 font-bold">No verification token found.</p>
            <Link to="/login" className="text-purple-700 font-black">Go to Login</Link>
          </div>
        )}

      </div>
    </div>
  );
};

export default VerifyEmail;