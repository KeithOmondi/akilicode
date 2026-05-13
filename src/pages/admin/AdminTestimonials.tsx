import { useEffect, useState } from "react";
import { 
  Star, CheckCircle, XCircle, Clock, Eye, MessageCircle,
  Search, ChevronLeft, ChevronRight, Sparkles, Trash2,
  Award, User, Calendar, ThumbsUp, ThumbsDown, AlertCircle, X
} from "lucide-react";
import toast from "react-hot-toast";
import type { Testimonial } from "../../interfaces/testimonial.interface";
import { testimonialService } from "../../components/service/testimonialService";

interface TestimonialParams {
  limit: number;
  offset: number;
  status?: string;
  rating?: number;
}

const AdminTestimonials = () => {
  const [testimonials, setTestimonials]               = useState<Testimonial[]>([]);
  const [loading, setLoading]                         = useState(true);
  const [selectedTestimonial, setSelectedTestimonial] = useState<Testimonial | null>(null);
  const [showModal, setShowModal]                     = useState(false);
  const [showRejectModal, setShowRejectModal]         = useState(false);
  const [rejectReason, setRejectReason]               = useState("");
  const [statusFilter, setStatusFilter]               = useState<string>("all");
  const [ratingFilter, setRatingFilter]               = useState<string>("all");
  const [searchTerm, setSearchTerm]                   = useState("");
  const [currentPage, setCurrentPage]                 = useState(1);
  const [totalPages, setTotalPages]                   = useState(1);
  const itemsPerPage = 10;

  // ── Load testimonials ───────────────────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const params: TestimonialParams = {
          limit: itemsPerPage,
          offset: (currentPage - 1) * itemsPerPage,
        };
        if (statusFilter !== "all") params.status = statusFilter;
        if (ratingFilter !== "all") params.rating = Number(ratingFilter);

        const data = await testimonialService.getAllTestimonials(params);
        setTestimonials(data.testimonials);
        setTotalPages(Math.ceil(data.pagination.total / itemsPerPage));
      } catch (err) {
        console.error("Error loading testimonials:", err);
        toast.error("Failed to load testimonials");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [statusFilter, ratingFilter, currentPage]);

  

  const handleApprove = async (testimonial: Testimonial) => {
    try {
      await testimonialService.approveTestimonial(testimonial.id);
      toast.success("Testimonial approved successfully!");
      setCurrentPage(1);
      setShowModal(false);
    } catch {
      toast.error("Failed to approve testimonial");
    }
  };

  const handleReject = async (testimonialId: string) => {
    if (!rejectReason.trim()) {
      toast.error("Please provide a reason for rejection");
      return;
    }
    try {
      await testimonialService.rejectTestimonial(testimonialId, rejectReason);
      toast.success("Testimonial rejected");
      setShowRejectModal(false);
      setRejectReason("");
      setShowModal(false);
      setCurrentPage(1);
    } catch {
      toast.error("Failed to reject testimonial");
    }
  };

  const handleToggleFeatured = async (testimonial: Testimonial) => {
    try {
      await testimonialService.toggleFeatured(testimonial.id);
      toast.success(testimonial.is_featured ? "Removed from featured" : "Added to featured");
      // Optimistic update in-place — no full reload needed
      setTestimonials((prev) =>
        prev.map((t) =>
          t.id === testimonial.id ? { ...t, is_featured: !t.is_featured } : t
        )
      );
    } catch {
      toast.error("Failed to update featured status");
    }
  };

  const handleDelete = async (testimonialId: string) => {
    if (!window.confirm("Are you sure you want to delete this testimonial? This action cannot be undone.")) return;
    try {
      await testimonialService.deleteTestimonial(testimonialId);
      toast.success("Testimonial deleted");
      setShowModal(false);
      setTestimonials((prev) => prev.filter((t) => t.id !== testimonialId));
    } catch {
      toast.error("Failed to delete testimonial");
    }
  };

  // ── Helpers ──────────────────────────────────────────────────────────────────
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved": return <span className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold"><CheckCircle size={12} /> Approved</span>;
      case "pending":  return <span className="flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-semibold"><Clock size={12} /> Pending</span>;
      case "rejected": return <span className="flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-semibold"><XCircle size={12} /> Rejected</span>;
      default: return null;
    }
  };

  const getRatingStars = (rating: number) => (
    <div className="flex items-center gap-0.5">
      {[...Array(5)].map((_, i) => (
        <Star key={i} size={14} className={i < rating ? "fill-yellow-500 text-yellow-500" : "text-gray-300"} />
      ))}
    </div>
  );

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric", month: "short", day: "numeric",
      hour: "2-digit", minute: "2-digit",
    });

  const filteredTestimonials = testimonials.filter((t) =>
    t.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.parent_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.kid_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.course_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <div className="p-6 min-h-screen bg-gray-50">

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Testimonials Management</h1>
        <p className="text-sm text-gray-500 mt-1">Review, approve, and manage parent testimonials</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total",    value: testimonials.length,                                        icon: <MessageCircle size={24} className="text-purple-500" />,  color: "text-gray-800"  },
          { label: "Approved", value: testimonials.filter(t => t.status === "approved").length,   icon: <CheckCircle   size={24} className="text-green-500"  />,  color: "text-green-600" },
          { label: "Pending",  value: testimonials.filter(t => t.status === "pending").length,    icon: <Clock         size={24} className="text-yellow-500" />,  color: "text-yellow-600"},
          { label: "Rejected", value: testimonials.filter(t => t.status === "rejected").length,   icon: <XCircle       size={24} className="text-red-500"    />,  color: "text-red-600"   },
        ].map(({ label, value, icon, color }) => (
          <div key={label} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 uppercase">{label}</p>
                <p className={`text-2xl font-bold ${color}`}>{value}</p>
              </div>
              {icon}
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search by parent, child, course or content..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none"
            />
          </div>
          <div className="flex gap-3">
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
              className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
            <select
              value={ratingFilter}
              onChange={(e) => { setRatingFilter(e.target.value); setCurrentPage(1); }}
              className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none"
            >
              <option value="all">All Ratings</option>
              <option value="5">5 Stars</option>
              <option value="4">4 Stars</option>
              <option value="3">3 Stars</option>
              <option value="2">2 Stars</option>
              <option value="1">1 Star</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin" />
          </div>
        ) : filteredTestimonials.length === 0 ? (
          <div className="text-center py-20">
            <MessageCircle size={48} className="mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500">No testimonials found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Parent / Child</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Review</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Rating</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Date</th>
                  <th className="text-center px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Featured</th>
                  <th className="text-right px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredTestimonials.map((testimonial) => (
                  <tr
                    key={testimonial.id}
                    className="hover:bg-gray-50 transition cursor-pointer"
                    onClick={() => { setSelectedTestimonial(testimonial); setShowModal(true); }}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <User size={14} className="text-gray-400" />
                        <span className="text-sm font-medium text-gray-800">{testimonial.parent_name}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <Sparkles size={12} className="text-purple-400" />
                        <span className="text-xs text-gray-500">{testimonial.kid_name}</span>
                      </div>
                      <div className="text-xs text-gray-400 mt-1">{testimonial.course_name || "N/A"}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="max-w-md">
                        <p className="text-sm text-gray-600 line-clamp-2">
                          "{testimonial.content.substring(0, 100)}..."
                        </p>
                        {testimonial.achievement && (
                          <div className="flex items-center gap-1 mt-1 text-xs text-purple-600">
                            <Award size={12} /> {testimonial.achievement}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">{getRatingStars(testimonial.rating)}</td>
                    <td className="px-6 py-4">{getStatusBadge(testimonial.status)}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Calendar size={12} /> {formatDate(testimonial.created_at)}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={(e) => { e.stopPropagation(); handleToggleFeatured(testimonial); }}
                        className={`p-1.5 rounded-lg transition ${testimonial.is_featured ? "text-yellow-500 bg-yellow-50" : "text-gray-300 hover:text-yellow-500"}`}
                      >
                        <Star size={18} className={testimonial.is_featured ? "fill-yellow-500" : ""} />
                      </button>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={(e) => { e.stopPropagation(); setSelectedTestimonial(testimonial); setShowModal(true); }}
                          className="p-2 text-gray-400 hover:text-blue-600 transition rounded-lg hover:bg-blue-50"
                        >
                          <Eye size={16} />
                        </button>
                        {testimonial.status === "pending" && (
                          <>
                            <button
                              onClick={(e) => { e.stopPropagation(); handleApprove(testimonial); }}
                              className="p-2 text-gray-400 hover:text-green-600 transition rounded-lg hover:bg-green-50"
                            >
                              <ThumbsUp size={16} />
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); setSelectedTestimonial(testimonial); setShowRejectModal(true); }}
                              className="p-2 text-gray-400 hover:text-red-600 transition rounded-lg hover:bg-red-50"
                            >
                              <ThumbsDown size={16} />
                            </button>
                          </>
                        )}
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDelete(testimonial.id); }}
                          className="p-2 text-gray-400 hover:text-red-600 transition rounded-lg hover:bg-red-50"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-lg border border-gray-200 disabled:opacity-50 hover:bg-gray-50 transition"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="text-sm text-gray-600">Page {currentPage} of {totalPages}</span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg border border-gray-200 disabled:opacity-50 hover:bg-gray-50 transition"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>

      {/* View Modal */}
      {showModal && selectedTestimonial && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <MessageCircle size={20} className="text-purple-600" />
                <h2 className="text-xl font-bold text-gray-800">Testimonial Details</h2>
              </div>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-full transition">
                <X size={20} className="text-gray-400" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-purple-50 rounded-xl">
                  <div className="flex items-center gap-2 text-purple-600 mb-2">
                    <User size={16} />
                    <span className="text-xs font-semibold uppercase">Parent</span>
                  </div>
                  <p className="font-medium text-gray-800">{selectedTestimonial.parent_name}</p>
                  {selectedTestimonial.parent_email && (
                    <p className="text-sm text-gray-500">{selectedTestimonial.parent_email}</p>
                  )}
                </div>
                <div className="p-4 bg-orange-50 rounded-xl">
                  <div className="flex items-center gap-2 text-orange-600 mb-2">
                    <Sparkles size={16} />
                    <span className="text-xs font-semibold uppercase">Child</span>
                  </div>
                  <p className="font-medium text-gray-800">{selectedTestimonial.kid_name}</p>
                  <p className="text-sm text-gray-500">{selectedTestimonial.course_name || "N/A"}</p>
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Star size={16} className="text-yellow-500" />
                  <span className="text-sm font-semibold text-gray-700">Rating</span>
                </div>
                <div className="flex items-center gap-2">
                  {getRatingStars(selectedTestimonial.rating)}
                  <span className="text-sm text-gray-600">{selectedTestimonial.rating}/5</span>
                </div>
              </div>

              {selectedTestimonial.title && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <MessageCircle size={16} className="text-purple-500" />
                    <span className="text-sm font-semibold text-gray-700">Title</span>
                  </div>
                  <p className="text-gray-800 font-medium">{selectedTestimonial.title}</p>
                </div>
              )}

              <div>
                <div className="flex items-center gap-2 mb-2">
                  <MessageCircle size={16} className="text-purple-500" />
                  <span className="text-sm font-semibold text-gray-700">Testimonial</span>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-gray-700 leading-relaxed">"{selectedTestimonial.content}"</p>
                </div>
              </div>

              {selectedTestimonial.achievement && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Award size={16} className="text-green-500" />
                    <span className="text-sm font-semibold text-gray-700">Achievement</span>
                  </div>
                  <p className="text-gray-700">{selectedTestimonial.achievement}</p>
                </div>
              )}

              {selectedTestimonial.admin_note && (
                <div className="p-4 bg-red-50 rounded-xl border border-red-100">
                  <div className="flex items-center gap-2 text-red-600 mb-2">
                    <AlertCircle size={16} />
                    <span className="text-sm font-semibold">Admin Note</span>
                  </div>
                  <p className="text-red-700 text-sm">{selectedTestimonial.admin_note}</p>
                </div>
              )}

              <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-gray-400 pt-4 border-t">
                <span>ID: {selectedTestimonial.id}</span>
                <span>Submitted: {formatDate(selectedTestimonial.created_at)}</span>
                {selectedTestimonial.updated_at && selectedTestimonial.updated_at !== selectedTestimonial.created_at && (
                  <span>Updated: {formatDate(selectedTestimonial.updated_at)}</span>
                )}
              </div>
            </div>

            <div className="sticky bottom-0 bg-white border-t border-gray-100 px-6 py-4 flex gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 px-4 py-2 border border-gray-200 rounded-xl text-gray-600 font-semibold hover:bg-gray-50 transition"
              >
                Close
              </button>
              {selectedTestimonial.status === "pending" && (
                <>
                  <button
                    onClick={() => handleApprove(selectedTestimonial)}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition flex items-center justify-center gap-2"
                  >
                    <ThumbsUp size={16} /> Approve
                  </button>
                  <button
                    onClick={() => { setShowModal(false); setShowRejectModal(true); }}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition flex items-center justify-center gap-2"
                  >
                    <ThumbsDown size={16} /> Reject
                  </button>
                </>
              )}
              {selectedTestimonial.status !== "pending" && (
                <button
                  onClick={() => handleDelete(selectedTestimonial.id)}
                  className="px-4 py-2 bg-gray-100 text-red-600 rounded-xl font-semibold hover:bg-red-50 transition flex items-center justify-center gap-2"
                >
                  <Trash2 size={16} /> Delete
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && selectedTestimonial && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setShowRejectModal(false)}>
          <div className="bg-white rounded-2xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-2 text-red-600 mb-4">
              <AlertCircle size={24} />
              <h2 className="text-xl font-bold">Reject Testimonial</h2>
            </div>
            <p className="text-gray-600 mb-4">
              Please provide a reason for rejecting this testimonial. This will be visible to the parent.
            </p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Reason for rejection..."
              rows={4}
              className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none resize-none mb-4"
            />
            <div className="flex gap-3">
              <button
                onClick={() => { setShowRejectModal(false); setRejectReason(""); }}
                className="flex-1 px-4 py-2 border border-gray-200 rounded-xl text-gray-600 font-semibold hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={() => handleReject(selectedTestimonial.id)}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition"
              >
                Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminTestimonials;