import { Link } from "react-router-dom";
import { Menu, ExternalLink } from "lucide-react";
import { useAppSelector } from "../../store/hooks";

/** Slim top bar: menu button on phones, a link to the public site, and who is signed in. */
const AdminHeader = ({ onMenuClick }: { onMenuClick: () => void }) => {
  const { user } = useAppSelector((s) => s.auth);
  return (
    <header className="h-16 bg-white/90 backdrop-blur border-b border-ink-200 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-20">
      <button onClick={onMenuClick} className="lg:hidden p-2 -ml-2 rounded-lg text-ink-700 hover:bg-ink-100" aria-label="Open menu">
        <Menu size={22} />
      </button>
      <span className="hidden lg:block" />
      <div className="flex items-center gap-4">
        <Link to="/" target="_blank" className="hidden sm:inline-flex items-center gap-1.5 text-sm font-semibold text-ink-700 hover:text-brand-700">
          View site <ExternalLink size={14} aria-hidden="true" />
        </Link>
        <div className="flex items-center gap-3 pl-4 border-l border-ink-200">
          <span className="w-9 h-9 rounded-full bg-brand-600 text-white font-bold flex items-center justify-center" aria-hidden="true">
            {user?.name?.charAt(0).toUpperCase() || "A"}
          </span>
          <div className="hidden sm:block leading-tight">
            <p className="text-sm font-bold text-ink-900">{user?.name}</p>
            <p className="text-xs text-ink-500">Administrator</p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
