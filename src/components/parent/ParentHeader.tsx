// ParentHeader.tsx
import { Bell, User as UserIcon, Menu, Search } from "lucide-react";
import { useAppSelector } from "../../store/hooks";

interface ParentHeaderProps {
  onMenuClick: () => void;
}

const ParentHeader = ({ onMenuClick }: ParentHeaderProps) => {
  const { user } = useAppSelector((state) => state.auth);

  return (
    <header className="h-20 bg-white/80 backdrop-blur-md border-b border-purple-50 px-4 sm:px-10 flex items-center justify-between sticky top-0 z-30">
      
      {/* Left Section: Menu & Welcome */}
      <div className="flex items-center gap-6">
        {/* Hamburger — mobile only */}
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2.5 rounded-xl text-purple-900 bg-purple-50 hover:bg-purple-100 transition-all active:scale-95"
          aria-label="Open menu"
        >
          <Menu size={22} />
        </button>

        <div className="hidden md:flex flex-col">
          <h2 className="text-sm font-medium text-gray-500">
            Welcome back,
          </h2>
          <span className="text-lg font-black bg-gradient-to-r from-purple-900 to-purple-600 bg-clip-text text-transparent leading-tight">
            {user?.name} 👋
          </span>
        </div>
      </div>

      {/* Right Section: Actions & Profile */}
      <div className="flex items-center gap-3 sm:gap-6">
        
        {/* Search Bar - Subtle addition */}
        <div className="hidden lg:flex items-center relative group">
          <Search className="absolute left-3 text-gray-400 group-focus-within:text-orange-500 transition-colors" size={18} />
          <input 
            type="text" 
            placeholder="Search courses..." 
            className="bg-gray-50 border-none rounded-full pl-10 pr-4 py-2 text-sm w-48 focus:w-64 focus:ring-2 focus:ring-orange-100 transition-all outline-none"
          />
        </div>

        {/* Notifications */}
        <button className="p-2.5 rounded-xl text-gray-400 hover:text-purple-700 hover:bg-purple-50 transition-all relative group">
          <Bell size={22} />
          <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-orange-500 rounded-full border-2 border-white ring-2 ring-orange-100 animate-pulse"></span>
        </button>

        {/* User Profile Area */}
        <div className="flex items-center gap-4 pl-4 sm:pl-6 border-l border-purple-100">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-black text-purple-900 leading-none">
              {user?.name}
            </p>
            <div className="flex items-center justify-end gap-1 mt-1">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                {user?.role || "Parent"}
              </p>
            </div>
          </div>

          <button className="relative group">
            <div className="w-11 h-11 bg-gradient-to-br from-purple-100 to-orange-50 text-purple-700 rounded-2xl flex items-center justify-center shrink-0 border-2 border-white shadow-sm group-hover:shadow-md group-hover:scale-105 transition-all">
              <UserIcon size={22} className="group-hover:text-orange-500 transition-colors" />
            </div>
            {/* Status ring */}
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-white rounded-full flex items-center justify-center shadow-sm">
               <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            </div>
          </button>
        </div>

      </div>
    </header>
  );
};

export default ParentHeader;