import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { logoutKid } from "../../store/slices/kidSlice"; // Updated import
import { 
  Menu, 
  X, 
  Gamepad2, 
  Star, 
  Trophy, 
  LogOut, 
  User, 
  Settings,
  Bell,
  Sparkles
} from "lucide-react";

interface KidsHeaderProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

const KidsHeader = ({ sidebarOpen, setSidebarOpen }: KidsHeaderProps) => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { currentKid } = useAppSelector((state) => state.kid);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const handleLogout = () => {
    // 1. Closes the menu
    setShowProfileMenu(false);
    // 2. Clear Redux + localStorage in one go
    dispatch(logoutKid());
    // 3. Send them home
    navigate("/kid/login");
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-white/90 backdrop-blur-md border-b border-purple-100 shadow-sm">
      <div className="flex items-center justify-between px-4 h-16">
        {/* Left section - Menu button and Logo */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-xl hover:bg-purple-50 text-purple-600 transition-colors lg:hidden"
            aria-label="Toggle Menu"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          
          <div 
            className="flex items-center gap-2 cursor-pointer" 
            onClick={() => navigate("/kid/dashboard")}
          >
            <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-orange-500 rounded-xl flex items-center justify-center shadow-sm">
              <Gamepad2 size={16} className="text-white" />
            </div>
            <span className="font-black text-purple-900 hidden sm:inline tracking-tight">
              Akili<span className="text-orange-500">Code</span>
            </span>
          </div>
        </div>

        {/* Center section - Motivation */}
        <div className="hidden md:flex items-center gap-2 px-4 py-1.5 bg-purple-50 rounded-full border border-purple-100">
          <Sparkles size={14} className="text-orange-500 animate-pulse" />
          <span className="text-xs font-bold text-purple-700">
            Keep coding! You're doing great! 🚀
          </span>
        </div>

        {/* Right section - Stats and Profile */}
        <div className="flex items-center gap-2">
          {/* Points Display */}
          <div className="hidden sm:flex items-center gap-2 bg-yellow-50 px-3 py-1.5 rounded-full border border-yellow-100">
            <Star size={14} className="text-yellow-500 fill-yellow-500" />
            <span className="text-xs font-bold text-yellow-700">1,250 pts</span>
          </div>

          {/* Level Display */}
          <div className="hidden md:flex items-center gap-2 bg-purple-50 px-3 py-1.5 rounded-full border border-purple-100">
            <Trophy size={14} className="text-purple-600" />
            <span className="text-xs font-bold text-purple-700">Level 5</span>
          </div>

          {/* Notifications */}
          <button className="p-2 rounded-xl hover:bg-purple-50 text-purple-600 transition-colors relative group">
            <Bell size={18} className="group-hover:rotate-12 transition-transform" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-orange-500 rounded-full border-2 border-white"></span>
          </button>

          {/* Profile Menu */}
          <div className="relative ml-1">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-2 p-1 rounded-xl hover:bg-purple-50 transition-all border border-transparent hover:border-purple-100"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-orange-500 rounded-lg flex items-center justify-center text-white font-bold shadow-sm">
                {currentKid?.name?.[0]?.toUpperCase() || "K"}
              </div>
              <span className="hidden md:block text-sm font-bold text-gray-700 pr-1">
                {currentKid?.name || "Coder"}
              </span>
            </button>

            {/* Dropdown Menu */}
            {showProfileMenu && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowProfileMenu(false)}
                />
                <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-2xl shadow-xl border border-purple-100 overflow-hidden z-50 animate-in fade-in zoom-in duration-200">
                  <div className="p-4 bg-gradient-to-br from-purple-50 to-white border-b border-purple-50">
                    <p className="text-sm font-black text-purple-900">{currentKid?.name}</p>
                    <p className="text-[10px] uppercase tracking-wider font-bold text-purple-400">Junior Developer</p>
                  </div>
                  
                  <div className="p-2">
                    <button
                      onClick={() => {
                        setShowProfileMenu(false);
                        navigate("/kid/profile");
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-gray-600 hover:bg-purple-50 hover:text-purple-700 rounded-lg transition-colors"
                    >
                      <User size={16} />
                      My Profile
                    </button>
                    <button
                      onClick={() => {
                        setShowProfileMenu(false);
                        navigate("/kid/settings");
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-gray-600 hover:bg-purple-50 hover:text-purple-700 rounded-lg transition-colors"
                    >
                      <Settings size={16} />
                      Settings
                    </button>
                  </div>

                  <div className="p-2 bg-gray-50/50">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-bold text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <LogOut size={16} />
                      Logout
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default KidsHeader;