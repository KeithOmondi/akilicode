import { useEffect, useState } from "react";
import { Star, Heart, Sparkles, Users, Calendar, MessageCircle } from "lucide-react";
import type { Testimonial, TestimonialStats } from "../../interfaces/testimonial.interface";
import { testimonialService } from "../service/testimonialService";

const Testimonials = () => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [stats, setStats] = useState<TestimonialStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        // Fetch approved testimonials (not just featured)
        const [testimonialData, statsData] = await Promise.all([
          testimonialService.getTestimonials({ limit: 6 }), // Remove featured: true to get all approved testimonials
          testimonialService.getStats(),
        ]);
        setTestimonials(testimonialData);
        setStats(statsData);
      } catch (error) {
        console.error("Error loading testimonials data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const displayStats = [
    { icon: <Users size={20} />, value: stats?.total_testimonials?.toLocaleString() || "0", label: "Happy Families" },
    { icon: <Star size={20} />, value: stats?.average_rating ? `${stats.average_rating}/5` : "0/5", label: "Parent Rating" },
    { icon: <Calendar size={20} />, value: "50,000+", label: "Classes Taught" },
    { icon: <MessageCircle size={20} />, value: stats?.total_testimonials ? "98%" : "0%", label: "Would Recommend" },
  ];

  // Helper function to get rating stars
  const getRatingStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1 mb-3">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={16}
            className={star <= rating ? "fill-yellow-500 text-yellow-500" : "text-gray-300"}
          />
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <section className="py-20">
        <div className="flex justify-center">
          <div className="w-8 h-8 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin" />
        </div>
      </section>
    );
  }

  return (
    <section id="testimonials" className="py-20 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-purple-50 via-white to-orange-50 -z-10" />

      {/* Decorative Elements */}
      <div className="absolute top-20 right-20 text-6xl opacity-10 animate-float">⭐</div>
      <div className="absolute bottom-20 left-20 text-6xl opacity-10 animate-float animation-delay-2000">❤️</div>

      <div className="max-w-6xl mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-purple-200 to-orange-200 text-purple-800 text-sm font-bold mb-4">
            <Heart size={16} className="fill-purple-800" />
            <span>Real Stories, Real Families</span>
            <Sparkles size={16} />
          </div>

          <h2 className="text-4xl lg:text-5xl font-black mb-4">
            <span className="bg-gradient-to-r font-serif from-purple-600 via-pink-500 to-orange-500 bg-clip-text text-transparent">
              What Parents Say
            </span>
          </h2>

          <p className="text-lg text-gray-600 font-serif max-w-2xl mx-auto">
            Join thousands of happy families watching their kids fall in love with coding
          </p>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
          {displayStats.map((stat, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl p-4 text-center shadow-md border border-purple-100"
            >
              <div className="text-purple-600 flex justify-center mb-2">{stat.icon}</div>
              <div className="text-2xl font-black text-gray-800">{stat.value}</div>
              <div className="text-xs text-gray-500">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Testimonials Grid */}
        {testimonials.length === 0 ? (
          <div className="text-center py-12">
            <MessageCircle size={48} className="mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500">No testimonials yet. Be the first to share your experience!</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6 mb-12">
            {testimonials.map((testimonial) => (
              <div
                key={testimonial.id}
                className="group bg-white rounded-2xl p-6 shadow-md border-2 border-purple-100 hover:shadow-xl transition-all hover:-translate-y-1"
              >
                {/* Quote Icon */}
                <div className="text-4xl text-purple-200 mb-3">"</div>

                {/* Rating Stars */}
                {getRatingStars(testimonial.rating)}

                {/* Title if exists */}
                {testimonial.title && (
                  <h3 className="text-lg font-bold text-gray-800 mb-2">{testimonial.title}</h3>
                )}

                {/* Testimonial Text */}
                <p className="text-gray-700 mb-4 leading-relaxed line-clamp-4">
                  {testimonial.content}
                </p>

                {/* Child Achievement Badge */}
                {testimonial.achievement && (
                  <div className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 rounded-full text-xs font-semibold text-purple-700 mb-3">
                    <Sparkles size={10} />
                    <span>{testimonial.achievement}</span>
                  </div>
                )}

                {/* Parent Info */}
                <div className="flex items-center justify-between pt-3 border-t border-purple-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-100 to-orange-100 flex items-center justify-center text-lg font-bold text-purple-700">
                      {testimonial.child_name?.[0]?.toUpperCase() || "👧"}
                    </div>
                    <div>
                      <div className="font-bold text-gray-800 text-sm">{testimonial.parent_name}</div>
                      <div className="text-xs text-gray-500">
                        Parent of {testimonial.child_name || testimonial.kid_name}
                      </div>
                    </div>
                  </div>
                  {testimonial.is_verified && (
                    <div className="text-xs text-green-600 font-semibold flex items-center gap-1">
                      <Heart size={10} className="fill-green-600" />
                      Verified
                    </div>
                  )}
                </div>

                {/* Course Name (optional) */}
                {testimonial.course_name && (
                  <div className="mt-2 text-xs text-purple-500">
                    Course: {testimonial.course_name}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Trust Indicators */}
        <div className="text-center">
          <div className="inline-flex flex-wrap items-center justify-center gap-6">
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 border-2 border-white flex items-center justify-center text-white text-xs font-bold"
                  >
                    {String.fromCharCode(64 + i)}
                  </div>
                ))}
              </div>
              <span className="text-sm text-gray-600">
                Join {stats?.total_testimonials || 0}+ families
              </span>
            </div>
            <div className="w-px h-8 bg-purple-200 hidden sm:block" />
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={16} className="fill-yellow-500 text-yellow-500" />
                ))}
              </div>
              <span className="text-sm text-gray-600">
                {stats?.average_rating || 0} out of 5 stars
              </span>
            </div>
            <div className="w-px h-8 bg-purple-200 hidden sm:block" />
            <div className="flex items-center gap-2">
              <Heart size={18} className="text-red-500 fill-red-500" />
              <span className="text-sm text-gray-600">98% would recommend</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;