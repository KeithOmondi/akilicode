import { useState, useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { useAppSelector } from "../../store/hooks";
import KidsHeader from "./KidsHeader";
import KidsSidebar from "./KidsSidebar";

interface KidsLayoutProps {
  children?: React.ReactNode;
}

const KidsLayout = ({ children }: KidsLayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const { currentKid, loading } = useAppSelector((state) => state.kid);

  // Check if kid is logged in
  useEffect(() => {
    if (!loading && !currentKid) {
      navigate("/kid/login");
    }
  }, [currentKid, loading, navigate]);

  // Close sidebar on route change on mobile
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setSidebarOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-100 to-orange-100">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-200 border-t-orange-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-purple-600 font-bold">Loading your adventure...</p>
        </div>
      </div>
    );
  }

  if (!currentKid) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-orange-50">
      <KidsHeader sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <KidsSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      {/* Main Content Area */}
      <main className="lg:pl-64 pt-16">
        <div className="p-4 md:p-6 max-w-7xl mx-auto">
          {children || <Outlet />}
        </div>
      </main>

      {/* Floating Help Button */}
      <button className="fixed bottom-6 right-6 w-12 h-12 bg-gradient-to-r from-purple-600 to-orange-500 rounded-full shadow-lg flex items-center justify-center text-white hover:scale-110 transition-all z-40">
        <span className="text-xl">🤖</span>
      </button>
    </div>
  );
};

export default KidsLayout;