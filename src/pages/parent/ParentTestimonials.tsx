import { useEffect, useState, useRef } from "react";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { getMyKids } from "../../store/slices/kidSlice";
import { getMyEnrollments } from "../../store/slices/enrollmentSlice";
import { Star, Plus, Edit, CheckCircle, XCircle, Clock, Sparkles, Heart, MessageCircle, AlertCircle, X } from "lucide-react";
import { testimonialService } from "../../components/service/testimonialService";
import toast from "react-hot-toast";
import type { Testimonial } from "../../interfaces/testimonial.interface";

// Extend Testimonial type to include admin_note
interface TestimonialWithAdminNote extends Testimonial {
  admin_note?: string;
}

const ParentTestimonials = () => {
  const dispatch = useAppDispatch();
  const { kids } = useAppSelector((state) => state.kid);
  const [testimonials, setTestimonials] = useState<TestimonialWithAdminNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTestimonial, setEditingTestimonial] = useState<TestimonialWithAdminNote | null>(null);
  const [selectedKidId, setSelectedKidId] = useState("");
  const [checkingEligibility, setCheckingEligibility] = useState(false);
  const [eligibility, setEligibility] = useState<{ canLeave: boolean; reason?: string; enrollmentId?: string } | null>(null);

  // Form state
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [childName, setChildName] = useState("");
  const [childAge, setChildAge] = useState("");
  const [achievement, setAchievement] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Stable ref lets handleSubmit trigger a refetch without
  // calling setState synchronously inside an effect body.
  const refetchRef = useRef<() => void>(() => {});

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        await dispatch(getMyKids());
        await dispatch(getMyEnrollments());
        const data = await testimonialService.getMyTestimonials();
        setTestimonials(data);
      } catch (error) {
        console.error("Error loading data:", error);
        toast.error("Failed to load testimonials");
      } finally {
        setLoading(false);
      }
    };

    refetchRef.current = loadData;
    loadData();
  }, [dispatch]);

  const checkEligibilityForKid = async (kidId: string) => {
    setCheckingEligibility(true);
    try {
      const result = await testimonialService.canLeaveTestimonial(kidId);
      setEligibility(result);
      return result;
    } catch (error) {
      console.error("Error checking eligibility:", error);
      toast.error("Failed to check eligibility");
      return null;
    } finally {
      setCheckingEligibility(false);
    }
  };

  const handleKidSelect = async (kidId: string) => {
    setSelectedKidId(kidId);
    const kid = kids.find((k) => k.id === kidId);
    if (kid) {
      setChildName(kid.name);
      setChildAge(kid.age?.toString() || "");
    }
    await checkEligibilityForKid(kidId);
  };

  const handleOpenModal = () => {
    setEditingTestimonial(null);
    setRating(5);
    setTitle("");
    setContent("");
    setAchievement("");
    setSelectedKidId("");
    setEligibility(null);
    setShowModal(true);
  };

  const handleEdit = (testimonial: TestimonialWithAdminNote) => {
    if (testimonial.status !== "pending") {
      toast.error("Cannot edit approved or rejected testimonials");
      return;
    }
    setEditingTestimonial(testimonial);
    setRating(testimonial.rating);
    setTitle(testimonial.title || "");
    setContent(testimonial.content);
    setAchievement(testimonial.achievement || "");
    setSelectedKidId(testimonial.kid_id);
    setChildName(testimonial.child_name || "");
    setShowModal(true);
  };

  const handleSubmit = async () => {
    if (!selectedKidId) {
      toast.error("Please select a child");
      return;
    }

    if (!content.trim() || content.trim().length < 10) {
      toast.error("Please write a testimonial of at least 10 characters");
      return;
    }

    setSubmitting(true);
    try {
      if (editingTestimonial) {
        await testimonialService.updateTestimonial(editingTestimonial.id, {
          rating,
          title: title || undefined,
          content,
          achievement: achievement || undefined,
        });
        toast.success("Testimonial updated successfully");
      } else {
        await testimonialService.createTestimonial({
          kid_id: selectedKidId,
          rating,
          title: title || undefined,
          content,
          child_name: childName,
          child_age: childAge ? parseInt(childAge) : undefined,
          achievement: achievement || undefined,
        });
        toast.success("Testimonial submitted successfully! It will appear after admin approval.");
      }
      setShowModal(false);
      refetchRef.current();
    } catch (error) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || "Failed to save testimonial");
    } finally {
      setSubmitting(false);
    }
  };

  // Derived boolean to avoid type-mixing in JSX disabled prop
  const isSubmitDisabled =
    submitting ||
    (!!selectedKidId && !!eligibility && !eligibility.canLeave) ||
    !content.trim() ||
    content.length < 10;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return (
          <span className="flex items-center gap-1 text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
            <CheckCircle size={12} /> Approved
          </span>
        );
      case "pending":
        return (
          <span className="flex items-center gap-1 text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full">
            <Clock size={12} /> Pending Review
          </span>
        );
      case "rejected":
        return (
          <span className="flex items-center gap-1 text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full">
            <XCircle size={12} /> Rejected
          </span>
        );
      default:
        return null;
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-orange-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-black text-purple-900">My Testimonials</h1>
            <p className="text-gray-500 mt-1">
              Share your experience and help other parents make informed decisions
            </p>
          </div>
          <button
            onClick={handleOpenModal}
            className="flex items-center gap-2 px-5 py-2.5 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700 transition shadow-md"
          >
            <Plus size={18} />
            Write a Testimonial
          </button>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-2xl p-4 text-center shadow-md border border-purple-100">
            <MessageCircle size={20} className="text-purple-600 mx-auto mb-2" />
            <div className="text-2xl font-black text-gray-800">{testimonials.length}</div>
            <div className="text-xs text-gray-500">Total Submitted</div>
          </div>
          <div className="bg-white rounded-2xl p-4 text-center shadow-md border border-purple-100">
            <CheckCircle size={20} className="text-green-600 mx-auto mb-2" />
            <div className="text-2xl font-black text-gray-800">
              {testimonials.filter((t) => t.status === "approved").length}
            </div>
            <div className="text-xs text-gray-500">Approved</div>
          </div>
          <div className="bg-white rounded-2xl p-4 text-center shadow-md border border-purple-100">
            <Clock size={20} className="text-yellow-600 mx-auto mb-2" />
            <div className="text-2xl font-black text-gray-800">
              {testimonials.filter((t) => t.status === "pending").length}
            </div>
            <div className="text-xs text-gray-500">Pending Review</div>
          </div>
          <div className="bg-white rounded-2xl p-4 text-center shadow-md border border-purple-100">
            <Heart size={20} className="text-red-500 mx-auto mb-2" />
            <div className="text-2xl font-black text-gray-800">
              {testimonials.length > 0
                ? (testimonials.reduce((acc, t) => acc + t.rating, 0) / testimonials.length).toFixed(1)
                : "0"}
            </div>
            <div className="text-xs text-gray-500">Average Rating</div>
          </div>
        </div>

        {/* Testimonials List */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin" />
          </div>
        ) : testimonials.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-purple-100">
            <MessageCircle size={48} className="text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-gray-800 mb-2">No Testimonials Yet</h3>
            <p className="text-gray-500 mb-4">
              Share your experience with our community. Your feedback helps other parents!
            </p>
            <button
              onClick={handleOpenModal}
              className="px-5 py-2.5 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700 transition"
            >
              Write Your First Testimonial
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {testimonials.map((testimonial) => (
              <div
                key={testimonial.id}
                className="bg-white rounded-2xl p-6 shadow-md border border-purple-100 hover:shadow-lg transition"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-100 to-orange-100 flex items-center justify-center text-xl">
                      {testimonial.child_name?.[0] || "👧"}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-800">{testimonial.child_name}</h3>
                      <div className="flex items-center gap-1 mt-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            size={14}
                            className={
                              i < testimonial.rating
                                ? "fill-yellow-500 text-yellow-500"
                                : "text-gray-300"
                            }
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                  {getStatusBadge(testimonial.status)}
                </div>

                {testimonial.title && (
                  <h4 className="font-semibold text-gray-800 mb-2">{testimonial.title}</h4>
                )}

                <p className="text-gray-600 text-sm leading-relaxed mb-3">
                  "{testimonial.content}"
                </p>

                {testimonial.achievement && (
                  <div className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 rounded-full text-xs font-semibold text-purple-700 mb-3">
                    <Sparkles size={10} />
                    {testimonial.achievement}
                  </div>
                )}

                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <div className="text-xs text-gray-400">
                    Submitted: {formatDate(testimonial.created_at)}
                  </div>
                  {testimonial.status === "pending" && (
                    <button
                      onClick={() => handleEdit(testimonial)}
                      className="flex items-center gap-1 text-sm text-purple-600 hover:text-purple-700 transition"
                    >
                      <Edit size={14} />
                      Edit
                    </button>
                  )}
                </div>

                {testimonial.status === "rejected" && testimonial.admin_note && (
                  <div className="mt-3 p-3 bg-red-50 rounded-xl border border-red-100">
                    <div className="flex items-center gap-1 text-xs text-red-600 font-semibold mb-1">
                      <AlertCircle size={12} />
                      Admin Note:
                    </div>
                    <p className="text-xs text-red-600/80">{testimonial.admin_note}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Testimonial Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-purple-100 px-6 py-4 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-gray-800">
                  {editingTestimonial ? "Edit Testimonial" : "Share Your Experience"}
                </h2>
                <p className="text-sm text-gray-500">
                  Help other parents discover the magic of coding!
                </p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition"
              >
                <X size={20} className="text-gray-400" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* Select Child */}
              {!editingTestimonial && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Select Your Child *
                  </label>
                  <select
                    value={selectedKidId}
                    onChange={(e) => handleKidSelect(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none"
                  >
                    <option value="">Choose a child...</option>
                    {kids.map((kid) => (
                      <option key={kid.id} value={kid.id}>
                        {kid.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Eligibility Check */}
              {selectedKidId && checkingEligibility && (
                <div className="flex items-center gap-2 text-gray-500">
                  <div className="w-4 h-4 border-2 border-purple-200 border-t-purple-600 rounded-full animate-spin" />
                  <span className="text-sm">Checking eligibility...</span>
                </div>
              )}

              {selectedKidId && eligibility && !eligibility.canLeave && (
                <div className="p-4 bg-yellow-50 rounded-xl border border-yellow-200">
                  <div className="flex items-center gap-2 text-yellow-700">
                    <AlertCircle size={18} />
                    <span className="text-sm font-semibold">Cannot Submit Testimonial</span>
                  </div>
                  <p className="text-sm text-yellow-600 mt-1">{eligibility.reason}</p>
                </div>
              )}

              {/* Rating */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Rating *</label>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="focus:outline-none transition-transform hover:scale-110"
                    >
                      <Star
                        size={28}
                        className={
                          (hoverRating || rating) >= star
                            ? "fill-yellow-500 text-yellow-500"
                            : "text-gray-300"
                        }
                      />
                    </button>
                  ))}
                  <span className="ml-2 text-sm text-gray-500">
                    {rating === 5
                      ? "Excellent!"
                      : rating === 4
                      ? "Very Good"
                      : rating === 3
                      ? "Good"
                      : rating === 2
                      ? "Fair"
                      : "Poor"}
                  </span>
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Title (Optional)
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Amazing experience!"
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none"
                />
              </div>

              {/* Content */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Your Story *
                </label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Share your experience with AkiliCode... (minimum 10 characters)"
                  rows={5}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none resize-none"
                />
                <p className="text-xs text-gray-400 mt-1">
                  {content.length}/500 characters (minimum 10)
                </p>
              </div>

              {/* Achievement */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Child's Achievement (Optional)
                </label>
                <input
                  type="text"
                  value={achievement}
                  onChange={(e) => setAchievement(e.target.value)}
                  placeholder="e.g., Completed 20+ challenges, Built first game, etc."
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none"
                />
              </div>

              {/* Child Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Child's Name (Optional)
                  </label>
                  <input
                    type="text"
                    value={childName}
                    onChange={(e) => setChildName(e.target.value)}
                    placeholder="First name only"
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Child's Age (Optional)
                  </label>
                  <input
                    type="number"
                    value={childAge}
                    onChange={(e) => setChildAge(e.target.value)}
                    placeholder="Age"
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none"
                  />
                </div>
              </div>

              {/* Review Note */}
              <div className="p-3 bg-purple-50 rounded-xl border border-purple-100">
                <p className="text-xs text-purple-600">
                  <Sparkles size={10} className="inline mr-1" />
                  All testimonials are reviewed by our team before being published to ensure quality
                  and authenticity.
                </p>
              </div>
            </div>

            <div className="sticky bottom-0 bg-white border-t border-purple-100 px-6 py-4 flex gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 px-4 py-2 border border-gray-200 text-gray-600 rounded-xl font-semibold hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={isSubmitDisabled}
                className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting
                  ? "Submitting..."
                  : editingTestimonial
                  ? "Update Testimonial"
                  : "Submit Testimonial"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ParentTestimonials;