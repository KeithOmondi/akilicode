import { useEffect, useRef } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { useAppDispatch, useAppSelector } from "./store/hooks";
import { refreshSession } from "./store/slices/authSlice";

import AdminDashboard from "./pages/admin/AdminDashboard";
import ParentDashboard from "./pages/parent/ParentDashboard";
import ProtectedRoutes from "./routes/protectedRoutes";
import AdminLayout from "./components/admin/AdminLayout";
import ParentLayout from "./components/parent/ParentLayout";
import LoginPage from "./pages/auth/LoginPage";
import Unauthorized from "./pages/Unauthorized";
import MyKids from "./pages/parent/MyKids";
import ParentSettings from "./pages/parent/ParentSettings";
import ParentProgramsAndPayments from "./pages/parent/Parentprogramsandpayments ";
import AdminEnrollments from "./pages/admin/AdminEnrollments";
import AdminPayments from "./pages/admin/AdminPayments";
import AdminCourses from "./pages/admin/AdminCourses";
import ParentCourses from "./pages/parent/ParentCourses";
import RegisterPage from "./pages/auth/Register";
import ForgotPassword from "./components/auth/ForgotPassword";
import ResetPassword from "./components/auth/ResetPassword";
import VerifyEmail from "./components/auth/VerifyEmail";

const App = () => {
  const dispatch = useAppDispatch();
  const { loading } = useAppSelector((state) => state.auth);
  const sessionChecked = useRef(false);

  useEffect(() => {
    if (sessionChecked.current) return;
    sessionChecked.current = true;
    dispatch(refreshSession());
  }, [dispatch]);

  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: { fontFamily: "inherit", fontSize: "0.875rem" },
          success: { iconTheme: { primary: "#0d9488", secondary: "#fff" } },
          error: { iconTheme: { primary: "#dc2626", secondary: "#fff" } },
        }}
      />
      <Routes>
        {/* ── Public routes — always render, never blocked by loading ── */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/unauthorized" element={<Unauthorized />} />
        <Route path="/verify-email" element={<VerifyEmail />} />

        {/* ── Protected routes — show spinner while session loads ── */}
        {loading ? (
          <Route
            path="*"
            element={
              <div className="flex items-center justify-center h-screen bg-gray-50">
                <div className="flex flex-col items-center gap-3">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-600" />
                  <span className="text-gray-500 text-sm font-medium">
                    Loading session...
                  </span>
                </div>
              </div>
            }
          />
        ) : (
          <>
            <Route element={<ProtectedRoutes allowedRoles={["admin"]} />}>
              <Route element={<AdminLayout />}>
                <Route path="/admin/dashboard" element={<AdminDashboard />} />
                <Route path="/admin/enrollments" element={<AdminEnrollments />} />
                <Route path="/admin/payments" element={<AdminPayments />} />
                <Route path="/admin/courses" element={<AdminCourses />} />
              </Route>
            </Route>

            <Route element={<ProtectedRoutes allowedRoles={["parent"]} />}>
              <Route element={<ParentLayout />}>
                <Route path="/parent/dashboard" element={<ParentDashboard />} />
                <Route path="/parent/kids" element={<MyKids />} />
                <Route path="/parent/settings" element={<ParentSettings />} />
                <Route path="/parent/programs" element={<ParentProgramsAndPayments />} />
                <Route path="/parent/courses" element={<ParentCourses />} />
              </Route>
            </Route>

            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="*" element={<div className="p-10">404 - Not Found</div>} />
          </>
        )}
      </Routes>
    </>
  );
};

export default App;