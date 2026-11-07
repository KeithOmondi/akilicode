import { NavLink, useNavigate } from "react-router-dom";
import { LayoutDashboard, BookOpen, GraduationCap, CreditCard, Tag, Users, Code2, Newspaper, MessageSquareQuote, LogOut, X } from "lucide-react";
import type { ReactNode } from "react";
import { useAppDispatch } from "../../store/hooks";
import { logout } from "../../store/slices/authSlice";
import akiliLogo from "../../assets/akili.jpeg";

/** Only real pages are listed here. Add a link only when its route exists in App.tsx. */
const ADMIN_NAV: { group: string; items: { name: string; path: string; icon: ReactNode }[] }[] = [
  { group: "Overview", items: [{ name: "Dashboard", path: "/admin/dashboard", icon: <LayoutDashboard size={18} /> }] },
  {
    group: "Learning",
    items: [
      { name: "Courses", path: "/admin/courses", icon: <BookOpen size={18} /> },
      { name: "Handed-in work", path: "/admin/projects", icon: <Code2 size={18} /> },
      { name: "Blog", path: "/admin/blog", icon: <Newspaper size={18} /> },
      { name: "Testimonials", path: "/admin/testimonials", icon: <MessageSquareQuote size={18} /> },
    ],
  },
  {
    group: "People and money",
    items: [
      { name: "Users", path: "/admin/users", icon: <Users size={18} /> },
      { name: "Enrollments", path: "/admin/enrollments", icon: <GraduationCap size={18} /> },
      { name: "Payments", path: "/admin/payments", icon: <CreditCard size={18} /> },
      { name: "Prices and coupons", path: "/admin/pricing", icon: <Tag size={18} /> },
    ],
  },
];

const AdminSidebar = ({ open, onClose }: { open: boolean; onClose: () => void }) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await dispatch(logout());
    navigate("/", { replace: true });
  };

  return (
    <aside
      aria-label="Admin navigation"
      className={`fixed lg:sticky top-0 left-0 z-40 w-64 h-screen bg-white border-r border-ink-200 flex flex-col transition-transform duration-200 ${open ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}
    >
      <div className="h-16 px-5 flex items-center justify-between border-b border-ink-200">
        <div className="flex items-center gap-3">
          <img src={akiliLogo} alt="" className="w-9 h-9 rounded-lg object-cover" />
          <div className="leading-tight">
            <p className="font-extrabold text-ink-900">AkiliCode</p>
            <p className="text-xs font-semibold text-ink-500">Admin</p>
          </div>
        </div>
        <button onClick={onClose} className="lg:hidden p-2 rounded-lg text-ink-500 hover:bg-ink-100" aria-label="Close menu"><X size={20} /></button>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
        {ADMIN_NAV.map((g) => (
          <div key={g.group}>
            <p className="px-3 mb-1.5 text-xs font-bold uppercase tracking-wider text-ink-500">{g.group}</p>
            <ul className="space-y-0.5">
              {g.items.map((item) => (
                <li key={item.path}>
                  <NavLink
                    to={item.path}
                    onClick={onClose}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2.5 rounded-lg text-[15px] font-semibold transition-colors ${isActive ? "bg-brand-100 text-brand-700" : "text-ink-700 hover:bg-ink-100"}`
                    }
                  >
                    {item.icon}
                    {item.name}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      <div className="p-3 border-t border-ink-200">
        <button onClick={handleLogout} className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-[15px] font-semibold text-ink-700 hover:bg-red-50 hover:text-red-700">
          <LogOut size={18} /> Sign out
        </button>
      </div>
    </aside>
  );
};

export default AdminSidebar;
