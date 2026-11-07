import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { useAppDispatch } from "./store/hooks";
import { refreshSession } from "./store/slices/authSlice";
import { getKidMe } from "./store/slices/kidSlice";
import { setAccessToken } from "./api/api";

// --- GUARDS ---
import ProtectedRoute from "./routes/protectedRoutes";
import KidProtectedRoute from "./routes/KidProtectedRoute";

// --- LAYOUTS ---
import AdminLayout from "./components/admin/AdminLayout";
import ParentLayout from "./components/parent/ParentLayout";
import KidsLayout from "./components/kids/KidsLayout";
import PublicLayout from "./components/Layout/PublicLayout";

// --- AUTH & PUBLIC PAGES ---
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/Register";
import ForgotPassword from "./components/auth/ForgotPassword";
import ResetPassword from "./components/auth/ResetPassword";
import VerifyEmail from "./components/auth/VerifyEmail";
import Unauthorized from "./pages/Unauthorized";
const KidLogin = lazy(() => import("./components/auth/KidLogin"));

// --- ADMIN PAGES ---
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const AdminUsers = lazy(() => import("./pages/admin/AdminUsers"));
const AdminEnrollments = lazy(() => import("./pages/admin/AdminEnrollments"));
const AdminPayments = lazy(() => import("./pages/admin/AdminPayments"));
const AdminCourses = lazy(() => import("./pages/admin/AdminCourses"));
const AdminCourseDetail = lazy(() => import("./pages/admin/Admincoursedetail"));
const AdminModuleDetail = lazy(() => import("./pages/admin/Adminmoduledetail"));
const AdminLessonEditor = lazy(() => import("./pages/admin/Adminlessoneditor"));
const AdminBlog = lazy(() => import("./pages/admin/AdminBlog"));
const AdminBlogEditor = lazy(() => import("./pages/admin/AdminBlogEditor"));
const AdminTestimonials = lazy(() => import("./pages/admin/AdminTestimonials"));
const AdminPricing = lazy(() => import("./pages/admin/AdminPricing"));

// --- PARENT PAGES ---
const ParentDashboard = lazy(() => import("./pages/parent/ParentDashboard"));
const MyKids = lazy(() => import("./pages/parent/MyKids"));
const ParentSettings = lazy(() => import("./pages/parent/ParentSettings"));
const ParentProgramsAndPayments = lazy(() => import("./pages/parent/ParentProgramsAndPayments"));
const ParentCourses = lazy(() => import("./pages/parent/ParentCourses"));
const ParentTestimonials = lazy(() => import("./pages/parent/ParentTestimonials"));

// --- KID PAGES ---
const KidDashboard = lazy(() => import("./pages/kids/KidDashboard"));

// --- OTHER PAGES ---
const BlogList = lazy(() => import("./pages/BlogList"));
const BlogPost = lazy(() => import("./pages/BlogPost"));
const LegalPage = lazy(() => import("./pages/LegalPage"));
const KidCourseView = lazy(() => import("./pages/kids/KidCourseView"));
const KidMyCourses = lazy(() => import("./pages/kids/KidMyCourses"));
const KidLeaderboard = lazy(() => import("./pages/kids/Kidleaderboard"));
const KidBadges = lazy(() => import("./pages/kids/KidBadges"));
const KidCalendar = lazy(() => import("./pages/kids/KidCalendar"));
const ParentGuide = lazy(() => import("./pages/ParentGuide"));
import ParentGateDialog from "./components/shared/ParentGateDialog";
import NotFound from "./pages/NotFound";
// Dev-only style guide: not imported at all in production builds, so it is not in the bundle.
const DesignSystem = import.meta.env.DEV ? lazy(() => import("./pages/DesignSystem")) : null;

/** Shown for a moment while a page's code downloads. */
const PageLoading = () => (
  <div className="min-h-screen flex items-center justify-center bg-canvas" role="status" aria-label="Loading">
    <div className="w-10 h-10 rounded-full border-4 border-brand-200 border-t-brand-600 animate-spin" />
  </div>
);

const App = () => {
  const dispatch = useAppDispatch();
  const [isInitializing, setIsInitializing] = useState(true);
  const sessionChecked = useRef(false);

  useEffect(() => {
    // Only run this logic once on mount
    if (sessionChecked.current) return;

    const initializeAuth = async () => {
      const path = window.location.pathname;
      const isKidPath = path.startsWith("/kid");
      const isLoginPage = path === "/login" || path === "/kid/login";

      try {
        if (isKidPath) {
          const kidToken = localStorage.getItem("kid_accessToken");
          if (kidToken && !isLoginPage) {
            setAccessToken(kidToken);
            await dispatch(getKidMe()).unwrap();
          }
        } else {
          if (!isLoginPage) {
            await dispatch(refreshSession()).unwrap();
          }
        }
      } catch {
        setAccessToken(null);
      } finally {
        sessionChecked.current = true;
        setIsInitializing(false);
      }
    };

    initializeAuth();
  }, [dispatch]);

  // Prevent ProtectedRoutes from redirecting before session check finishes
  if (isInitializing) {
    // Return null or a subtle loading indicator to prevent layout shift
    return null;
  }

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
      <ParentGateDialog />
      <Suspense fallback={<PageLoading />}>
      <Routes>
        {/* ── Public Routes ── */}
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/unauthorized" element={<Unauthorized />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/kid/login" element={<KidLogin />} />
        <Route path="/parent-guide" element={<ParentGuide />} />
        {DesignSystem && <Route path="/design-system" element={<Suspense fallback={null}><DesignSystem /></Suspense>} />}

        <Route element={<PublicLayout />}>
          <Route path="/blog" element={<BlogList />} />
          <Route path="/blog/:slug" element={<BlogPost />} />
          <Route path="/legal" element={<LegalPage />} />
        </Route>

        {/* ── Admin Routes ── */}
        <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
          <Route element={<AdminLayout />}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/users" element={<AdminUsers />} />
            <Route path="/admin/enrollments" element={<AdminEnrollments />} />
            <Route path="/admin/payments" element={<AdminPayments />} />
            <Route path="/admin/courses" element={<AdminCourses />} />
            <Route
              path="/admin/courses/:courseId"
              element={<AdminCourseDetail />}
            />
            <Route
              path="/admin/courses/:courseId/modules/:moduleId"
              element={<AdminModuleDetail />}
            />
            <Route
              path="/admin/courses/:courseId/modules/:moduleId/lessons/:lessonId"
              element={<AdminLessonEditor />}
            />
            <Route path="/admin/pricing" element={<AdminPricing />} />
            <Route path="/admin/blog" element={<AdminBlog />} />
            <Route path="/admin/blog/new" element={<AdminBlogEditor />} />
            <Route
              path="/admin/blog/edit/:postId"
              element={<AdminBlogEditor />}
            />
            <Route path="/admin/testimonials" element={<AdminTestimonials />} />
          </Route>
        </Route>

        {/* ── Parent Routes ── */}
        <Route element={<ProtectedRoute allowedRoles={["parent"]} />}>
          <Route element={<ParentLayout />}>
            <Route path="/parent/dashboard" element={<ParentDashboard />} />
            <Route path="/parent/kids" element={<MyKids />} />
            <Route path="/parent/settings" element={<ParentSettings />} />
            <Route
              path="/parent/programs"
              element={<ParentProgramsAndPayments />}
            />
            <Route path="/parent/courses" element={<ParentCourses />} />
            <Route
              path="/parent/testimonials"
              element={<ParentTestimonials />}
            />
          </Route>
        </Route>

        {/* ── Kid Protected Routes ── */}
        <Route element={<KidProtectedRoute />}>
          <Route element={<KidsLayout />}>
            <Route path="/kid/dashboard" element={<KidDashboard />} />

            <Route path="/kid/my-courses" element={<KidMyCourses />} />
            <Route
              path="/kid/course/:enrollmentId"
              element={<KidCourseView />}
            />
            <Route path="/kid/games" element={<Navigate to="/kid/dashboard" replace />} />
            <Route path="/kid/achievements" element={<Navigate to="/kid/badges" replace />} />
            <Route path="/kid/leaderboard" element={<KidLeaderboard />} />
            <Route path="/kid/badges" element={<KidBadges />} />
            <Route path="/kid/calendar" element={<KidCalendar />} />
          </Route>
        </Route>

        {/* ── Fallback ── */}
        <Route path="*" element={<NotFound />} />
      </Routes>
      </Suspense>
    </>
  );
};

export default App;
