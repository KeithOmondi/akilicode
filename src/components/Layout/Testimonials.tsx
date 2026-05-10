import { Star, Heart, Sparkles, Users, Calendar, MessageCircle } from "lucide-react";

const Testimonials = () => {
  const testimonials = [
    {
      id: 1,
      name: "Sarah Johnson",
      childName: "Emily, age 9",
      childImage: "👧",
      text: "My daughter used to think coding was boring. Now she asks to do AkiliCode every day! Her problem-solving skills have improved so much.",
      rating: 5,
      role: "Mother of 2",
      location: "Nairobi",
      achievement: "Completed 20+ challenges"
    },
    {
      id: 2,
      name: "Michael Chen",
      childName: "Leo, age 11",
      childImage: "👦",
      text: "The progress I've seen in my son's logical thinking is amazing. He's now teaching his little sister basic coding concepts! Best decision we made.",
      rating: 5,
      role: "Father & Software Engineer",
      location: "Mombasa",
      achievement: "Built 3 games"
    },
    {
      id: 3,
      name: "David Williams",
      childName: "Sophia, age 8",
      childImage: "👧",
      text: "Finally, a coding platform that's actually fun AND educational. Sophia loves her coding adventures and looks forward to every class.",
      rating: 5,
      role: "Parent",
      location: "Kisumu",
      achievement: "Perfect attendance"
    },
    {
      id: 4,
      name: "Grace Mwangi",
      childName: "Kevin, age 10",
      childImage: "👦",
      text: "Kevin struggled with math before. After 3 months of coding, his grades have improved dramatically! The teachers are amazing.",
      rating: 5,
      role: "Mother",
      location: "Nakuru",
      achievement: "Top of class"
    }
  ];

  const stats = [
    { icon: <Users size={20} />, value: "10,000+", label: "Happy Kids" },
    { icon: <Star size={20} />, value: "4.9/5", label: "Parent Rating" },
    { icon: <Calendar size={20} />, value: "50,000+", label: "Classes Taught" },
    { icon: <MessageCircle size={20} />, value: "98%", label: "Would Recommend" }
  ];

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
            <span className="bg-gradient-to-r from-purple-600 via-pink-500 to-orange-500 bg-clip-text text-transparent">
              What Parents Say
            </span>
          </h2>
          
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Join thousands of happy families watching their kids fall in love with coding
          </p>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
          {stats.map((stat, idx) => (
            <div key={idx} className="bg-white rounded-2xl p-4 text-center shadow-md border border-purple-100">
              <div className="text-purple-600 flex justify-center mb-2">{stat.icon}</div>
              <div className="text-2xl font-black text-gray-800">{stat.value}</div>
              <div className="text-xs text-gray-500">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.id}
              className="group bg-white rounded-2xl p-6 shadow-md border-2 border-purple-100 hover:shadow-xl transition-all hover:-translate-y-1"
            >
              {/* Quote Icon */}
              <div className="text-4xl text-purple-200 mb-3">"</div>
              
              {/* Rating Stars */}
              <div className="flex items-center gap-1 mb-3">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} size={16} className="fill-yellow-500 text-yellow-500" />
                ))}
              </div>
              
              {/* Testimonial Text */}
              <p className="text-gray-700 mb-4 leading-relaxed">
                {testimonial.text}
              </p>
              
              {/* Child Achievement Badge */}
              <div className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 rounded-full text-xs font-semibold text-purple-700 mb-3">
                <Sparkles size={10} />
                <span>{testimonial.achievement}</span>
              </div>
              
              {/* Parent Info */}
              <div className="flex items-center justify-between pt-3 border-t border-purple-100">
                <div className="flex items-center gap-3">
                  <div className="text-3xl">{testimonial.childImage}</div>
                  <div>
                    <div className="font-bold text-gray-800 text-sm">{testimonial.name}</div>
                    <div className="text-xs text-gray-500">{testimonial.childName} • {testimonial.location}</div>
                  </div>
                </div>
                <div className="text-xs text-purple-600 font-semibold">{testimonial.role}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Video Testimonial Placeholder */}
        <div className="bg-gradient-to-r from-purple-600 to-orange-500 rounded-3xl p-8 mb-12">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="flex-1 text-white">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-2xl">
                  🎥
                </div>
                <div>
                  <div className="font-bold">Watch Parent Stories</div>
                  <div className="text-purple-200 text-sm">2-minute video</div>
                </div>
              </div>
              <h3 className="text-2xl font-bold mb-2">See Why Families Love Us</h3>
              <p className="text-purple-100">Hear directly from parents about their child's journey</p>
            </div>
            <a
              href="#video"
              className="px-8 py-3 bg-white text-purple-700 font-bold rounded-full hover:scale-105 transition-all inline-flex items-center gap-2"
            >
              <span>▶</span>
              Watch Now
            </a>
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="text-center">
          <div className="inline-flex flex-wrap items-center justify-center gap-6">
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 border-2 border-white flex items-center justify-center text-white text-xs font-bold">
                    {String.fromCharCode(64 + i)}
                  </div>
                ))}
              </div>
              <span className="text-sm text-gray-600">Join 10,000+ families</span>
            </div>
            <div className="w-px h-8 bg-purple-200 hidden sm:block" />
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={16} className="fill-yellow-500 text-yellow-500" />
                ))}
              </div>
              <span className="text-sm text-gray-600">4.9 out of 5 stars</span>
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