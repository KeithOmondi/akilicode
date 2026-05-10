import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import { 
  Plus, 
  User, 
  GraduationCap, 
  Calendar, 
  X, 
  Baby, 
  ChevronRight,
  MoreVertical,
  BookOpen,
  Lock,
  KeyRound
} from "lucide-react"; 
import { getMyKids, registerKid, setKidLogin } from "../../store/slices/kidSlice";
import type { AppDispatch, RootState } from "../../store/store";
import type { IKid } from "../../interfaces/kid.interface";

const MyKids = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { kids, loading } = useSelector((s: RootState) => s.kid);
  
  // Form States
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [grade, setGrade] = useState("");

  // Login Setup States
  const [setupKid, setSetupKid] = useState<IKid | null>(null);
  const [username, setUsername] = useState("");
  const [pin, setPin] = useState("");

  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);

  useEffect(() => {
    dispatch(getMyKids());
  }, [dispatch]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(registerKid({ name, age: Number(age), grade: grade || undefined }))
      .unwrap()
      .then(() => {
        toast.success("Great! Your explorer is registered.");
        setShowForm(false);
        setName(""); setAge(""); setGrade("");
      })
      .catch((err: string) => toast.error(err));
  };

  const handleSetLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!setupKid) return;

    dispatch(setKidLogin({ 
      kidId: setupKid.id, 
      data: { username, pin } 
    }))
      .unwrap()
      .then(() => {
        toast.success(`Login credentials set for ${setupKid.name}!`);
        setSetupKid(null);
        setUsername("");
        setPin("");
      })
      .catch((err: string) => toast.error(err));
  };

  const toggleDropdown = (kidId: string) => {
    setOpenDropdownId(openDropdownId === kidId ? null : kidId);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (openDropdownId && !(event.target as Element).closest('.dropdown-container')) {
        setOpenDropdownId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [openDropdownId]);

  return (
    <div className="min-h-screen bg-[#FDFCFE] p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
          <div>
            <h1 className="text-3xl font-extrabold font-serif text-purple-900 tracking-tight">
              My <span className="text-orange-500">Kids</span>
            </h1>
            <p className="text-gray-500 font-medium mt-1 font-serif italic">
              {kids.length === 0
                ? "Ready to start the coding journey?"
                : `Manage your ${kids.length} young creator${kids.length !== 1 ? "s" : ""}`}
            </p>
          </div>
          
          {!showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center justify-center gap-2 bg-purple-700 hover:bg-purple-800 text-white font-bold py-3 px-6 rounded-2xl shadow-lg transition-all transform hover:scale-105"
            >
              <Plus size={20} />
              Add Explorer
            </button>
          )}
        </div>

        {/* Registration Form */}
        {showForm && (
          <div className="bg-white border-2 border-purple-100 rounded-3xl p-6 md:p-8 mb-10 shadow-xl relative overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="absolute top-0 left-0 w-2 h-full bg-orange-500"></div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-purple-900">New Student Registration</h2>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-purple-900 ml-1">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 text-purple-300" size={18} />
                    <input
                      type="text" required placeholder="e.g. Amara"
                      value={name} onChange={(e) => setName(e.target.value)}
                      className="w-full bg-purple-50 border-none rounded-xl pl-10 pr-4 py-3 focus:ring-2 focus:ring-orange-500 transition-all outline-none"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-bold text-purple-900 ml-1">Age</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-3 text-purple-300" size={18} />
                    <input
                      type="number" required min={1} max={18}
                      value={age} onChange={(e) => setAge(e.target.value)}
                      className="w-full bg-purple-50 border-none rounded-xl pl-10 pr-4 py-3 focus:ring-2 focus:ring-orange-500 outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-purple-900 ml-1">Grade (Optional)</label>
                  <div className="relative">
                    <GraduationCap className="absolute left-3 top-3 text-purple-300" size={18} />
                    <input
                      type="text" placeholder="Grade 4"
                      value={grade} onChange={(e) => setGrade(e.target.value)}
                      className="w-full bg-purple-50 border-none rounded-xl pl-10 pr-4 py-3 focus:ring-2 focus:ring-orange-500 outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button" onClick={() => setShowForm(false)}
                  className="px-6 py-3 rounded-xl font-bold text-gray-500 hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit" disabled={loading}
                  className="bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-bold px-8 py-3 rounded-xl shadow-md transition-all active:scale-95"
                >
                  {loading ? "Processing..." : "Register Kid"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Setup Login Modal */}
        {setupKid && (
          <div className="fixed inset-0 bg-purple-900/20 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl border border-purple-100 animate-in zoom-in duration-200">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-100 text-orange-600 rounded-lg">
                    <Lock size={20} />
                  </div>
                  <h2 className="text-xl font-bold text-purple-900">Setup Login</h2>
                </div>
                <button onClick={() => setSetupKid(null)} className="text-gray-400 hover:text-gray-600">
                  <X size={24} />
                </button>
              </div>
              
              <p className="text-gray-500 mb-6 text-sm">
                Create credentials for <span className="font-bold text-purple-700">{setupKid.name}</span> to log in independently.
              </p>

              <form onSubmit={handleSetLogin} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase text-purple-900/50 ml-1">Username</label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 text-purple-300" size={18} />
                    <input
                      type="text" required placeholder="e.g. cool_explorer"
                      value={username} onChange={(e) => setUsername(e.target.value)}
                      className="w-full bg-purple-50 border-none rounded-xl pl-10 pr-4 py-3 focus:ring-2 focus:ring-orange-500 outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black uppercase text-purple-900/50 ml-1">4-Digit PIN</label>
                  <div className="relative">
                    <KeyRound className="absolute left-3 top-3 text-purple-300" size={18} />
                    <input
                      type="password" required maxLength={4} placeholder="1234"
                      value={pin} onChange={(e) => setPin(e.target.value)}
                      className="w-full bg-purple-50 border-none rounded-xl pl-10 pr-4 py-3 focus:ring-2 focus:ring-orange-500 outline-none tracking-widest"
                    />
                  </div>
                </div>

                <button
                  type="submit" disabled={loading}
                  className="w-full bg-purple-700 hover:bg-purple-800 disabled:opacity-50 text-white font-bold py-4 rounded-xl shadow-lg transition-all mt-4"
                >
                  {loading ? "Saving..." : "Enable Kid Login"}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && kids.length === 0 && !showForm && (
          <div className="bg-white rounded-3xl p-16 text-center border-2 border-dashed border-purple-100">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-orange-100 text-orange-500 rounded-full mb-6">
              <Baby size={40} />
            </div>
            <h3 className="text-xl font-bold text-purple-900 mb-2">Your roster is empty</h3>
            <p className="text-gray-500 max-w-xs mx-auto mb-8">
              Add your children to start enrolling them in our creative coding tracks!
            </p>
          </div>
        )}

        {/* Kids Table */}
        {kids.length > 0 && (
          <div className="bg-white rounded-[1rem] border border-purple-50 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-purple-50/50">
                    <th className="px-6 py-5 text-xs font-black uppercase tracking-widest text-purple-900/50">Explorer</th>
                    <th className="px-6 py-5 text-xs font-black uppercase tracking-widest text-purple-900/50">Age</th>
                    <th className="px-6 py-5 text-xs font-black uppercase tracking-widest text-purple-900/50">Access</th>
                    <th className="px-6 py-5 text-xs font-black uppercase tracking-widest text-purple-900/50 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-purple-50">
                  {kids.map((kid) => (
                    <tr 
                      key={kid.id} 
                      className="group hover:bg-orange-50/30 transition-colors cursor-default"
                    >
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-purple-100 text-purple-700 rounded-xl flex items-center justify-center font-black text-lg group-hover:bg-purple-700 group-hover:text-white transition-all shadow-sm">
                            {kid.name[0]}
                          </div>
                          <span className="font-bold text-purple-900 text-base">{kid.name}</span>
                        </div>
                       </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2 text-gray-600 font-medium">
                          <Calendar size={16} className="text-orange-400" />
                          {kid.age} Years
                        </div>
                       </td>
                      <td className="px-6 py-5">
                        {kid.username ? (
                          <div className="flex items-center gap-2 text-green-600 font-bold bg-green-50 w-fit px-3 py-1 rounded-lg text-sm">
                            <Lock size={14} />
                            Login Active
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 text-gray-400 font-medium text-sm italic">
                            No credentials set
                          </div>
                        )}
                       </td>
                      <td className="px-6 py-5 text-right">
                        <div className="flex items-center justify-end gap-2 relative dropdown-container">
                          <div className="relative">
                            <button 
                              onClick={() => toggleDropdown(kid.id)}
                              className="p-2 hover:bg-white rounded-lg text-gray-400 hover:text-purple-600 transition-all shadow-none hover:shadow-sm"
                            >
                              <MoreVertical size={18} />
                            </button>
                            
                            {/* Dropdown Menu */}
                            {openDropdownId === kid.id && (
                              <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-xl border border-purple-100 py-2 z-50 overflow-hidden">
                                <a
                                  href="/parent/programs"
                                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-700 transition-colors"
                                >
                                  <BookOpen size={16} className="text-purple-400" />
                                  View Programs
                                </a>
                                <button
                                  onClick={() => {
                                    setSetupKid(kid);
                                    setOpenDropdownId(null);
                                  }}
                                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-700 transition-colors"
                                >
                                  <KeyRound size={16} className="text-orange-400" />
                                  {kid.username ? "Update Login" : "Setup Login"}
                                </button>
                              </div>
                            )}
                          </div>
                          <ChevronRight size={18} className="text-gray-300 group-hover:text-orange-500 group-hover:translate-x-1 transition-all" />
                        </div>
                       </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyKids;