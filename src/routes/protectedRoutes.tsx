import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAppSelector } from "../store/hooks";
import { Loader2 } from "lucide-react";

type Role = "admin" | "parent";

interface ParentProtectedRouteProps {
  allowedRoles?: Role[];
}

// Inside ProtectedRoute.tsx (The Parent/Admin one)
const ProtectedRoute: React.FC<ParentProtectedRouteProps> = ({ allowedRoles }) => {
  const location = useLocation();
  // Get both states to check who is actually here
  const { user, loading: authLoading } = useAppSelector((state) => state.auth);
  const { currentKid } = useAppSelector((state) => state.kid);

  const isKidPath = location.pathname.startsWith("/kid");

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-purple-600" size={40} />
      </div>
    );
  }

  // logic: If there's no parent user...
  if (!user) {
    // ...BUT there is a kid logged in OR we are on a kid route, 
    // do NOT redirect to /login. Just let the route render.
    if (isKidPath || currentKid) {
      return <Outlet />;
    }
    
    // Otherwise, it's a stranger trying to access parent/admin pages
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Authorization for Admin/Parent
  if (allowedRoles && !allowedRoles.includes(user.role as Role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;