// src/components/KidProtectedRoute.tsx
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAppSelector } from "../store/hooks";

const KidProtectedRoute = () => {
  const { currentKid, loading } = useAppSelector((state) => state.kid);
  const location = useLocation();

  if (loading) return null; // Or a specific kid-themed loader

  if (!currentKid) {
    // If not logged in as a kid, go specifically to the kid login
    return <Navigate to="/kid/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
};

export default KidProtectedRoute;