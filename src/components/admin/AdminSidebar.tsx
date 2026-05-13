// AdminSidebar.tsx
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Users,
  BarChart3,
  Settings,
  LogOut,
  X,
  LayoutDashboard,
  BookOpen,
  CreditCard,
  ShieldCheck,
  GraduationCap
} from "lucide-react";
import { useAppDispatch } from "../../store/hooks";
import { logout } from "../../store/slices/authSlice";
import akiliLogo from "../../assets/akili.jpeg";
import { FcRatings } from "react-icons/fc";

interface AdminSidebarProps {
  open: boolean;
  onClose: () => void;
}

const AdminSidebar = ({ open, onClose }: AdminSidebarProps) => {
  const location = useLocation();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const menuItems = [
    { 
      name: "Dashboard", 
      path: "/admin/dashboard",     
      icon: <LayoutDashboard size={20} /> 
    },
    { 
      name: "Course Manager", 
      path: "/admin/courses",       
      icon: <BookOpen size={20} /> 
    },
    { 
      name: "Enrollments", 
      path: "/admin/enrollments",   
      icon: <GraduationCap size={20} /> 
    },
    { 
      name: "Payment Records", 
      path: "/admin/payments",      
      icon: <CreditCard size={20} /> 
    },
    { 
      name: "User Directory", 
      path: "/admin/users",          
      icon: <Users size={20} /> 
    },
    { 
      name: "Staff Access",  
      path: "/admin/staff", 
      icon: <ShieldCheck size={20} /> 
    },
    { 
      name: "Blogs",  
      path: "/admin/blog", 
      icon: <ShieldCheck size={20} /> 
    },
    { 
      name: "Testimonials",  
      path: "/admin/testimonials", 
      icon: <FcRatings size={20} /> 
    },
    { 
      name: "Analytics",
      path: "/admin/reports",        
      icon: <BarChart3 size={20} /> 
    },
    { 
      name: "System Config", 
      path: "/admin/settings",       
      icon: <Settings size={20} /> 
    },
  ];

  const isActive = (path: string) => location.pathname === path;

  const handleLogout = async () => {
    await dispatch(logout());
    navigate("/", { replace: true });
  };

  return (
    <aside
      className={`
        fixed lg:sticky top-0 left-0 z-40
        w-72 bg-[#0f041d] h-screen border-r border-purple-900/30
        flex flex-col shadow-2xl
        transition-transform duration-300 ease-in-out
        ${open ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0
      `}
    >
      {/* Brand Section */}
      <div className="px-6 py-8 flex items-center justify-between border-b border-purple-900/20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-500 flex items-center justify-center shadow-lg shadow-orange-500/20">
             <img src={akiliLogo} alt="Logo" className="w-8 h-8 rounded-lg object-cover" />
          </div>
          <div>
            <h2 className="text-white font-black text-lg leading-none">AKILI</h2>
            <p className="text-[10px] text-purple-400 font-bold tracking-[0.2em] uppercase">Super Admin</p>
          </div>
        </div>

        <button onClick={onClose} className="lg:hidden p-2 text-purple-300">
          <X size={20} />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 space-y-1 mt-6 overflow-y-auto custom-scrollbar">
        {menuItems.map((item) => {
          const active = isActive(item.path);
          return (
            <Link
              key={item.name}
              to={item.path}
              onClick={onClose}
              className={`
                flex items-center gap-3 px-5 py-3 rounded-xl transition-all group
                ${active
                  ? "bg-purple-600/20 text-white border border-purple-500/30 shadow-inner"
                  : "text-purple-300/60 hover:bg-purple-800/20 hover:text-white"}
              `}
            >
              <span className={`${active ? "text-orange-500" : "text-purple-500 group-hover:text-orange-400"} transition-colors`}>
                {item.icon}
              </span>
              <span className="text-sm font-bold tracking-wide">{item.name}</span>
              {active && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-orange-500 shadow-[0_0_8px_#f97316]" />}
            </Link>
          );
        })}
      </nav>

      {/* System Health */}
      <div className="px-6 py-4 mx-4 mb-4 bg-purple-950/20 rounded-2xl border border-purple-800/20">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[9px] font-black text-purple-500 uppercase tracking-widest">Server Status</span>
          <span className="text-[9px] font-black text-green-400 uppercase">Live</span>
        </div>
        <div className="h-1 w-full bg-purple-900/50 rounded-full overflow-hidden">
          <div className="h-full bg-green-400 w-[98%] shadow-[0_0_8px_#4ade80]" />
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-purple-900/30 bg-[#0a0214]">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-5 py-3.5 w-full text-purple-400 hover:text-rose-400 hover:bg-rose-500/5 rounded-xl transition-all font-bold group"
        >
          <LogOut size={20} className="group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm">Terminate Session</span>
        </button>
      </div>
    </aside>
  );
};

export default AdminSidebar;