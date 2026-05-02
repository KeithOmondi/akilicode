import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Settings,
  LogOut,
  X,
  LayoutList,
  Loader2,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { logout } from "../../store/slices/authSlice";
import akili from "../../assets/akili.jpeg";

interface ParentSidebarProps {
  open: boolean;
  onClose: () => void;
}

const ParentSidebar = ({ open, onClose }: ParentSidebarProps) => {
  const location = useLocation();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  
  // Get loading state to disable button during logout
  const { loading } = useAppSelector((state) => state.auth);

  const menuItems = [
    {
      name: "Dashboard",
      path: "/parent/dashboard",
      icon: <LayoutDashboard size={20} />,
    },
    {
      name: "My Kids",
      path: "/parent/kids",
      icon: <Users size={20} />,
    },
    {
      name: "Courses",
      path: "/parent/courses",
      icon: <Users size={20} />,
    },
    {
      name: "Programs & Payments",
      path: "/parent/programs",
      icon: <LayoutList size={20} />,
    },
    {
      name: "Settings",
      path: "/parent/settings",
      icon: <Settings size={20} />,
    },
  ];

  const isActive = (path: string) => location.pathname === path;

  /**
   * ACTION: Handle Logout
   * We use .unwrap() to ensure we wait for the action to succeed 
   * before redirecting, or handle the transition safely.
   */
  const handleLogout = async () => {
    try {
      await dispatch(logout()).unwrap();
      navigate("/login", { replace: true });
    } catch (error) {
      // Even if the server-side logout fails, we usually want to 
      // clear the local session and redirect the user.
      console.error("Logout failed:", error);
      navigate("/login", { replace: true });
    }
  };

  const handleNavClick = () => {
    onClose();
  };

  return (
    <aside
      className={`
        fixed lg:sticky top-0 left-0 z-40
        w-72 bg-white h-screen border-r border-purple-50
        flex flex-col shadow-sm
        transition-transform duration-300 ease-in-out
        ${open ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0
      `}
    >
      {/* Logo Section */}
      <div className="p-8 pb-4 flex items-center justify-between">
        <img
          src={akili}
          alt="AkiliCode Logo"
          className="w-50 h-50 object-contain"
        />
        <button
          onClick={onClose}
          className="lg:hidden p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          aria-label="Close menu"
        >
          <X size={20} />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 space-y-1.5 mt-2 overflow-y-auto">
        {menuItems.map((item) => {
          const active = isActive(item.path);
          return (
            <Link
              key={item.name}
              to={item.path}
              onClick={handleNavClick}
              className={`flex items-center gap-3 px-5 py-3.5 rounded-xl transition-all group ${
                active
                  ? "bg-purple-700 text-white font-bold shadow-lg shadow-purple-200"
                  : "text-gray-500 hover:bg-purple-50 hover:text-purple-700 font-medium"
              }`}
            >
              <span
                className={`${
                  active
                    ? "text-orange-400"
                    : "text-gray-400 group-hover:text-purple-600"
                } transition-colors`}
              >
                {item.icon}
              </span>
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Footer / Logout */}
      <div className="p-4 mt-auto border-t border-purple-50 bg-gray-50/50">
        <button
          onClick={handleLogout}
          disabled={loading}
          className={`flex items-center gap-3 px-5 py-3.5 w-full rounded-xl transition-all font-bold group 
            ${loading 
              ? "bg-gray-100 text-gray-400 cursor-not-allowed" 
              : "text-red-500 hover:bg-red-50"
            }`}
        >
          {loading ? (
            <Loader2 size={20} className="animate-spin" />
          ) : (
            <LogOut
              size={20}
              className="group-hover:-translate-x-1 transition-transform"
            />
          )}
          <span>{loading ? "Signing Out..." : "Sign Out"}</span>
        </button>
      </div>
    </aside>
  );
};

export default ParentSidebar;