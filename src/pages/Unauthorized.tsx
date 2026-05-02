
import { useNavigate } from "react-router-dom";
import { ShieldAlert, ArrowLeft } from "lucide-react";
import { useAppSelector } from "../store/hooks";

const Unauthorized = () => {
  const navigate = useNavigate();
  const { user } = useAppSelector((state) => state.auth);

 const goBack = () => {
  if (user?.role === "admin") {
    navigate("/admin/dashboard");
  } else if (user?.role === "parent") { // ← was "user"
    navigate("/parent/dashboard");
  } else {
    navigate("/login");
  }
};

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-6 flex justify-center">
          <div className="p-6 bg-red-100 rounded-full text-red-600 shadow-sm">
            <ShieldAlert size={48} />
          </div>
        </div>

        <h1 className="text-4xl font-black text-slate-900 mb-2">Access Denied</h1>
        <p className="text-slate-500 mb-8">
          Sorry, you don't have the required permissions to view this page.
        </p>

        <button
          onClick={goBack}
          className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 px-8 rounded-xl transition-all shadow-lg hover:shadow-xl active:scale-95"
        >
          <ArrowLeft size={18} />
          Return to Dashboard
        </button>
      </div>
    </div>
  );
};

export default Unauthorized;