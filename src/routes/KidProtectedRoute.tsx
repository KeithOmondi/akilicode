// src/components/KidProtectedRoute.tsx
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAppSelector } from "../store/hooks";
import { useEffect } from "react";
import { useAppDispatch } from "../store/hooks";
import { getKidMe } from "../store/slices/kidSlice";
import { setAccessToken } from "../api/api";

const KidProtectedRoute = () => {
  const { currentKid, loading } = useAppSelector((state) => state.kid);
  const location = useLocation();
  const dispatch = useAppDispatch();

  useEffect(() => {
    // If no kid in store but token exists, restore the session
    if (!currentKid && !loading) {
      const token = localStorage.getItem("accessToken");
      if (token) {
        setAccessToken(token);       // restore memory first
        dispatch(getKidMe());        // then validate + repopulate currentKid
      }
    }
  }, []);  // eslint-disable-line react-hooks/exhaustive-deps

  // Token exists but store hasn't rehydrated yet — wait, don't redirect
  const hasToken = !!localStorage.getItem("accessToken");

  if (loading || (!currentKid && hasToken)) return null; // or a loader

  if (!currentKid) {
    return <Navigate to="/kid/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
};

export default KidProtectedRoute;