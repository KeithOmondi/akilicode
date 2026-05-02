import { useState } from "react";
import { GraduationCap, Wallet } from "lucide-react";
import ParentEnrollments from "./ParentEnrollments";
import ParentPayments from "./ParentPayments";

type Tab = "enrollments" | "payments";

const ParentProgramsAndPayments = () => {
  const [activeTab, setActiveTab] = useState<Tab>("enrollments");

  return (
    <div className="min-h-screen bg-[#FDFCFE]">
      {/* Tab Navigation Header */}
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-purple-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex gap-1 py-3">
            <button
              onClick={() => setActiveTab("enrollments")}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all flex-1 sm:flex-none justify-center ${
                activeTab === "enrollments"
                  ? "bg-purple-700 text-white shadow-md"
                  : "text-purple-500 hover:text-purple-700"
              }`}
            >
              <GraduationCap size={15} />
              Enrollments
            </button>
            <button
              onClick={() => setActiveTab("payments")}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all flex-1 sm:flex-none justify-center ${
                activeTab === "payments"
                  ? "bg-purple-700 text-white shadow-md"
                  : "text-purple-500 hover:text-purple-700"
              }`}
            >
              <Wallet size={15} />
              Payments
            </button>
          </div>
        </div>
      </div>

      {/* Render Active Page */}
      {activeTab === "enrollments" ? <ParentEnrollments /> : <ParentPayments />}
    </div>
  );
};

export default ParentProgramsAndPayments;