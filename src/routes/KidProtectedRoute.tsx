import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAppSelector } from "../store/hooks";

/** Only a logged-in child may see the kid screens; anyone else goes to the child login. */
const KidProtectedRoute = () => {
  const { currentKid, loading } = useAppSelector((state) => state.kid);
  const location = useLocation();
  const hasToken = !!localStorage.getItem("kid_accessToken");

  // still restoring the session after a page refresh
  if (loading || (!currentKid && hasToken)) return null;

  if (!currentKid) return <Navigate to="/kid/login" state={{ from: location }} replace />;
  return <Outlet />;
};

export default KidProtectedRoute;
