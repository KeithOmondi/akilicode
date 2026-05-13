import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { kidLogin, resetKidState } from "../../store/slices/kidSlice";
import toast from "react-hot-toast";
import { User, Lock, Loader2, Eye, EyeOff, Sparkles, Gamepad2, Rocket } from "lucide-react";

const KidLogin = () => {
  const [username, setUsername] = useState("");
  const [pin, setPin] = useState("");
  const [showPin, setShowPin] = useState(false);

  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const { loading, error, currentKid, message } = useAppSelector((state) => state.kid);

  // ── Success Navigation & Message ─────────────────────────────────────
  useEffect(() => {
    if (currentKid) {
      // The slice now provides a custom "Welcome back, {name}" message
      // We display it and then navigate.
      if (message) {
        toast.success(message);
        dispatch(resetKidState());
      }
      
      const from = (location.state as { from?: { pathname: string } })?.from?.pathname;
      navigate(from || "/kid/dashboard", { replace: true });
    }
  }, [currentKid, message, navigate, location.state, dispatch]);

  // ── Error Handling ───────────────────────────────────────────────────
  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(resetKidState());
    }
  }, [error, dispatch]);

  // ── Cleanup on unmount ──────────────────────────────────────────────
  useEffect(() => {
    return () => {
      // Only reset non-persistent state like error/message
      dispatch(resetKidState());
    };
  }, [dispatch]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // UI Validation before dispatching
    if (username.length < 3) {
      toast.error("Username must be at least 3 characters");
      return;
    }
    if (pin.length !== 4) {
      toast.error("PIN must be exactly 4 digits");
      return;
    }
    
    dispatch(kidLogin({ username, pin }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-100 via-purple-50 to-orange-100 px-4 overflow-hidden relative">
      {/* Animated Background Blobs */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-orange-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000" />
      </div>

      {/* Floating Decorative Emojis */}
      <div className="absolute top-20 left-10 text-4xl animate-float pointer-events-none">🎮</div>
      <div className="absolute bottom-20 right-10 text-4xl animate-float animation-delay-2000 pointer-events-none">🚀</div>
      <div className="absolute top-1/3 right-20 text-3xl animate-float animation-delay-3000 pointer-events-none">⭐</div>
      <div className="absolute bottom-1/3 left-20 text-3xl animate-float animation-delay-4000 pointer-events-none">🎨</div>

      <div className="max-w-md w-full relative z-10">
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border-2 border-purple-100">
          {/* Logo Area */}
          <div className="text-center mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-purple-600 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg animate-bounce-slow">
              <Gamepad2 className="text-white" size={40} />
            </div>
            <h1 className="text-3xl font-black bg-gradient-to-r from-purple-600 to-orange-500 bg-clip-text text-transparent">
              Kid's Portal
            </h1>
            <p className="text-gray-500 mt-2 font-medium flex items-center justify-center gap-1">
              <Sparkles size={14} className="text-orange-500" />
              Let's start coding!
              <Sparkles size={14} className="text-purple-500" />
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Username Field */}
            <div>
              <label className="block text-xs font-black text-purple-800 uppercase tracking-wider mb-1.5 ml-1">
                Your Username
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-purple-400" size={18} />
                <input
                  type="text"
                  required
                  disabled={loading}
                  placeholder="e.g., alex123"
                  className="w-full pl-12 pr-4 py-3.5 rounded-2xl border-2 border-purple-100 bg-purple-50/30 focus:bg-white focus:border-orange-400 focus:ring-4 focus:ring-orange-500/10 outline-none transition-all font-medium text-gray-700 disabled:opacity-50"
                  value={username}
                  onChange={(e) => setUsername(e.target.value.toLowerCase().trim())}
                  autoCapitalize="none"
                  autoCorrect="off"
                />
              </div>
            </div>

            {/* PIN Field */}
            <div>
              <label className="block text-xs font-black text-purple-800 uppercase tracking-wider mb-1.5 ml-1">
                Secret PIN
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-purple-400" size={18} />
                <input
                  type={showPin ? "text" : "password"}
                  required
                  disabled={loading}
                  placeholder="••••"
                  maxLength={4}
                  className="w-full pl-12 pr-12 py-3.5 rounded-2xl border-2 border-purple-100 bg-purple-50/30 focus:bg-white focus:border-orange-400 focus:ring-4 focus:ring-orange-500/10 outline-none transition-all font-mono font-bold text-gray-700 text-center tracking-[0.5em] text-xl disabled:opacity-50"
                  value={pin}
                  onChange={(e) => setPin(e.target.value.replace(/[^0-9]/g, ''))}
                  inputMode="numeric"
                />
                <button
                  type="button"
                  onClick={() => setShowPin(!showPin)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-purple-400 hover:text-purple-600 transition-colors"
                >
                  {showPin ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <p className="text-xs text-gray-400 mt-2 ml-1">
                Enter your 4-digit secret PIN
              </p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-purple-600 to-orange-500 hover:from-purple-700 hover:to-orange-600 text-white font-black py-4 rounded-2xl shadow-lg shadow-purple-200 transition-all flex items-center justify-center gap-2 disabled:opacity-70 mt-4 transform hover:scale-[1.02] active:scale-95"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <>
                  <Rocket size={18} />
                  Start Coding!
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      <style>{`
        @keyframes blob {
          0%, 100% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .animate-blob { animation: blob 7s infinite; }
        .animate-float { animation: float 6s ease-in-out infinite; }
        .animate-bounce-slow { animation: bounce-slow 3s ease-in-out infinite; }
        .animation-delay-2000 { animation-delay: 2s; }
        .animation-delay-3000 { animation-delay: 3s; }
        .animation-delay-4000 { animation-delay: 4s; }
      `}</style>
    </div>
  );
};

export default KidLogin;