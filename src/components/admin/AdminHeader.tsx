// AdminHeader.tsx
import React from "react";
import { useLocation } from "react-router-dom";
import {
  Bell,
  Search,
  Settings,
  User as UserIcon,
  ChevronRight,
  Menu,
} from "lucide-react";
import { useAppSelector } from "../../store/hooks";

interface AdminHeaderProps {
  onMenuClick: () => void;
}

const AdminHeader = ({ onMenuClick }: AdminHeaderProps) => {
  const { user } = useAppSelector((state) => state.auth);
  const location = useLocation();

  const pathnames = location.pathname.split("/").filter((x) => x);
  const currentPage = pathnames[pathnames.length - 1]?.replace(/-/g, " ") || "Dashboard";

  return (
    <header className="h-16 sm:h-20 bg-white border-b border-slate-200 px-4 sm:px-8 flex items-center justify-between sticky top-0 z-20">

      {/* Left: Hamburger + Breadcrumbs */}
      <div className="flex items-center gap-3 min-w-0">
        {/* Hamburger — mobile only */}
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors shrink-0"
          aria-label="Open menu"
        >
          <Menu size={20} />
        </button>

        <div className="flex flex-col min-w-0">
          {/* Breadcrumb — hidden on small screens */}
          <div className="hidden sm:flex items-center text-xs text-slate-400 uppercase tracking-widest font-semibold">
            <span className="hover:text-indigo-600 cursor-pointer transition-colors shrink-0">Console</span>
            {pathnames.map((name, index) => (
              <React.Fragment key={index}>
                <ChevronRight size={12} className="mx-2 shrink-0" />
                <span className={`truncate ${index === pathnames.length - 1 ? "text-slate-900" : ""}`}>
                  {name.replace(/-/g, " ")}
                </span>
              </React.Fragment>
            ))}
          </div>
          <h2 className="text-base sm:text-lg font-bold text-slate-800 capitalize truncate">
            {currentPage}
          </h2>
        </div>
      </div>

      {/* Right: Actions & Profile */}
      <div className="flex items-center gap-2 sm:gap-4 shrink-0">

        {/* Search — md+ only */}
        <div className="hidden md:flex items-center bg-slate-100 px-3 py-2 rounded-lg border border-slate-200 focus-within:border-indigo-400 focus-within:bg-white transition-all">
          <Search size={16} className="text-slate-400 shrink-0" />
          <input
            type="text"
            placeholder="Search records..."
            className="bg-transparent border-none outline-none text-sm ml-2 w-40 lg:w-48 text-slate-600"
          />
        </div>

        {/* Icon buttons */}
        <div className="flex items-center gap-1">
          <button className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-all relative">
            <Bell size={20} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-indigo-600 rounded-full ring-2 ring-white" />
          </button>
          <button className="hidden sm:flex p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-all">
            <Settings size={20} />
          </button>
        </div>

        {/* Profile */}
        <div className="flex items-center gap-3 pl-3 sm:pl-6 ml-1 sm:ml-2 border-l border-slate-200">
          <div className="hidden sm:block text-right">
            <p className="text-sm font-bold text-slate-900 leading-none">{user?.name}</p>
            <p className="text-[10px] text-indigo-600 font-black uppercase mt-1">Super Admin</p>
          </div>
          <div className="w-9 h-9 sm:w-10 sm:h-10 bg-indigo-600 text-white rounded-xl shadow-lg shadow-indigo-200 flex items-center justify-center font-bold text-sm shrink-0">
            {user?.name?.charAt(0).toUpperCase() || <UserIcon size={18} />}
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;