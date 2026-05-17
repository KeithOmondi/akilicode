// src/routes/KidProtectedRoute.tsx
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAppSelector } from "../store/hooks";

const KidProtectedRoute = () => {
  const { currentKid, loading } = useAppSelector((state) => state.kid);
  const location = useLocation();
  const hasToken = !!localStorage.getItem("kid_accessToken");

  console.log("🛡️ [KidProtectedRoute] render:", { 
    currentKid: currentKid ? currentKid.name : "NULL", 
    loading, 
    hasToken 
  });

  if (loading || (!currentKid && hasToken)) {
    console.log("⏳ [KidProtectedRoute] waiting...");
    return null;
  }

  if (!currentKid) {
    console.log("🚫 [KidProtectedRoute] no kid → redirecting to /kid/login");
    return <Navigate to="/kid/login" state={{ from: location }} replace />;
  }

  console.log("✅ [KidProtectedRoute] access granted");
  return <Outlet />;
};

export default KidProtectedRoute;