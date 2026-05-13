import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  BookOpen,
  Trophy,
  Gamepad2,
  Users,
  Award,
  Calendar,
  HelpCircle,
  Settings,
  Sparkles,
  Rocket,
  Code2
} from "lucide-react";

interface KidsSidebarProps {
  isOpen: boolean;
  onClose?: () => void;
}

// Move SidebarContent outside of the main component
interface SidebarContentProps {
  onClose?: () => void;
}

const navItems = [
  { path: "/kid/dashboard", label: "Dashboard", icon: <LayoutDashboard size={18} />, color: "purple" },
  { path: "/kid/my-courses", label: "My Courses", icon: <BookOpen size={18} />, color: "blue" },
  { path: "/kid/playground", label: "Code Playground", icon: <Code2 size={18} />, color: "orange" },
  { path: "/kid/games", label: "Coding Games", icon: <Gamepad2 size={18} />, color: "green" },
  { path: "/kid/achievements", label: "Achievements", icon: <Trophy size={18} />, color: "yellow" },
  { path: "/kid/leaderboard", label: "Leaderboard", icon: <Users size={18} />, color: "pink" },
  { path: "/kid/badges", label: "My Badges", icon: <Award size={18} />, color: "indigo" },
  { path: "/kid/calendar", label: "Learning Calendar", icon: <Calendar size={18} />, color: "teal" },
];

const bottomNavItems = [
  { path: "/kid/help", label: "Help & Tips", icon: <HelpCircle size={18} />, color: "gray" },
  { path: "/kid/settings", label: "Settings", icon: <Settings size={18} />, color: "gray" },
];

const getColorClass = (color: string, isActive: boolean) => {
  const colors: Record<string, { active: string; inactive: string; bg: string }> = {
    purple: { active: "text-purple-700", inactive: "text-gray-500", bg: "bg-purple-50" },
    blue: { active: "text-blue-700", inactive: "text-gray-500", bg: "bg-blue-50" },
    orange: { active: "text-orange-600", inactive: "text-gray-500", bg: "bg-orange-50" },
    green: { active: "text-green-700", inactive: "text-gray-500", bg: "bg-green-50" },
    yellow: { active: "text-yellow-700", inactive: "text-gray-500", bg: "bg-yellow-50" },
    pink: { active: "text-pink-600", inactive: "text-gray-500", bg: "bg-pink-50" },
    indigo: { active: "text-indigo-700", inactive: "text-gray-500", bg: "bg-indigo-50" },
    teal: { active: "text-teal-700", inactive: "text-gray-500", bg: "bg-teal-50" },
    gray: { active: "text-gray-700", inactive: "text-gray-500", bg: "bg-gray-50" },
  };
  const c = colors[color] || colors.purple;
  return isActive ? c.active : c.inactive;
};

const SidebarContent = ({ onClose }: SidebarContentProps) => (
  <div className="flex flex-col h-full">
    {/* Sidebar Header */}
    <div className="p-4 border-b border-purple-100">
      <div className="flex items-center gap-2">
        <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-orange-500 rounded-xl flex items-center justify-center">
          <Rocket size={20} className="text-white" />
        </div>
        <div>
          <span className="font-black text-purple-900 text-lg">AkiliCode</span>
          <p className="text-[10px] text-orange-500 font-bold">Kid's Portal</p>
        </div>
      </div>
    </div>

    {/* Daily Streak */}
    <div className="m-4 p-3 bg-gradient-to-r from-purple-100 to-orange-100 rounded-xl">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-bold text-purple-800">Daily Streak</span>
        <span className="text-xs font-black text-orange-600">5 days 🔥</span>
      </div>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((day) => (
          <div
            key={day}
            className="flex-1 h-1.5 bg-white rounded-full overflow-hidden"
          >
            <div className="h-full bg-gradient-to-r from-purple-500 to-orange-500 rounded-full" style={{ width: day <= 5 ? "100%" : "0%" }} />
          </div>
        ))}
      </div>
    </div>

    {/* Navigation */}
    <nav className="flex-1 px-3 space-y-1">
      {navItems.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          onClick={onClose}
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 ${
              isActive
                ? "bg-gradient-to-r from-purple-50 to-orange-50 shadow-sm"
                : "hover:bg-purple-50/50"
            }`
          }
        >
          {({ isActive }) => (
            <>
              <span className={getColorClass(item.color, isActive)}>
                {item.icon}
              </span>
              <span className={`text-sm font-medium ${isActive ? "text-gray-800" : "text-gray-600"}`}>
                {item.label}
              </span>
              {isActive && (
                <span className="ml-auto w-1 h-6 bg-orange-500 rounded-full"></span>
              )}
            </>
          )}
        </NavLink>
      ))}
    </nav>

    {/* Bottom Navigation */}
    <div className="border-t border-purple-100 pt-3 pb-4 px-3 space-y-1">
      {bottomNavItems.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          onClick={onClose}
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2 rounded-xl transition-all duration-200 ${
              isActive
                ? "bg-gray-100"
                : "hover:bg-gray-50"
            }`
          }
        >
          {({ isActive }) => (
            <>
              <span className={getColorClass(item.color, isActive)}>
                {item.icon}
              </span>
              <span className={`text-sm font-medium ${isActive ? "text-gray-800" : "text-gray-600"}`}>
                {item.label}
              </span>
            </>
          )}
        </NavLink>
      ))}
    </div>

    {/* Fun Fact */}
    <div className="m-3 p-3 bg-purple-50 rounded-xl">
      <div className="flex items-center gap-2 mb-1">
        <Sparkles size={12} className="text-orange-500" />
        <span className="text-[10px] font-bold text-purple-700">Did you know?</span>
      </div>
      <p className="text-[10px] text-gray-600 leading-relaxed">
        Coding helps you think better and solve problems faster! 🧠💡
      </p>
    </div>
  </div>
);

const KidsSidebar = ({ isOpen, onClose }: KidsSidebarProps) => {
  return (
    <>
      {/* Desktop Sidebar - Always visible on large screens */}
      <aside className="hidden lg:block fixed left-0 top-0 bottom-0 w-64 bg-white border-r border-purple-100 z-30 shadow-sm">
        <div className="pt-16 h-full overflow-y-auto">
          <SidebarContent onClose={onClose} />
        </div>
      </aside>

      {/* Mobile Sidebar - Slide out */}
      <div
        className={`fixed inset-0 z-50 lg:hidden transition-all duration-300 ${
          isOpen ? "visible" : "invisible"
        }`}
      >
        {/* Backdrop */}
        <div
          className={`absolute inset-0 bg-black/50 transition-opacity duration-300 ${
            isOpen ? "opacity-100" : "opacity-0"
          }`}
          onClick={onClose}
        />
        
        {/* Sidebar Panel */}
        <div
          className={`absolute left-0 top-0 bottom-0 w-80 bg-white shadow-2xl transition-transform duration-300 transform ${
            isOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="h-full overflow-y-auto">
            <SidebarContent onClose={onClose} />
          </div>
        </div>
      </div>
    </>
  );
};

export default KidsSidebar;