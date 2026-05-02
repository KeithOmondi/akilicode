import React from "react";
import { X } from "lucide-react";

interface ModalOverlayProps {
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  gradient?: "purple" | "orange";
}

export const ModalOverlay = ({ 
  onClose, 
  title, 
  subtitle, 
  children,
  gradient = "purple" 
}: ModalOverlayProps) => {
  const gradientClass = gradient === "purple" 
    ? "from-purple-700 to-purple-800" 
    : "from-orange-500 to-orange-600";

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-t-[28px] sm:rounded-[28px] shadow-2xl w-full max-w-md border border-slate-100 overflow-hidden animate-in fade-in slide-in-from-bottom-4 sm:zoom-in duration-200">
        {/* Header */}
        <div className={`px-6 py-5 border-b border-purple-50 flex items-center justify-between bg-gradient-to-r ${gradientClass}`}>
          <div>
            <h2 className="text-lg font-black text-white">{title}</h2>
            {subtitle && <p className="text-xs text-white/80 mt-0.5">{subtitle}</p>}
          </div>
          <button onClick={onClose} className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors">
            <X size={18} />
          </button>
        </div>
        {/* Content */}
        <div className="px-6 py-6 space-y-4 max-h-[70vh] overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
};