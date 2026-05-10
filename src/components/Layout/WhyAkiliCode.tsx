import { 
  Heart, 
  Shield, 
  Users, 
  BookOpen, 
  Award, 
  MessageCircle,
  Sparkles,
  Coffee,
  Globe,
  Trophy,
  Smile,
  Zap,
  CheckCircle
} from "lucide-react";

const WhyAkiliCode = () => {
  const reasons = [
    {
      icon: <Heart size={32} />,
      title: "Made with Love for Kids",
      description: "Every lesson is designed to be fun, engaging, and age-appropriate for young minds.",
      color: "pink",
      emoji: "💝"
    },
    {
      icon: <Shield size={32} />,
      title: "100% Safe Environment",
      description: "COPPA compliant with no ads, no chat rooms, and parent-approved content.",
      color: "green",
      emoji: "🛡️"
    },
    {
      icon: <Users size={32} />,
      title: "Small Class Sizes",
      description: "Maximum 6 students per live session for personalized attention.",
      color: "blue",
      emoji: "👥"
    },
    {
      icon: <BookOpen size={32} />,
      title: "Structured Curriculum",
      description: "Progressive learning path from beginner to advanced young coder.",
      color: "purple",
      emoji: "📚"
    },
    {
      icon: <Award size={32} />,
      title: "Recognized Certificates",
      description: "Earn official certificates that celebrate your child's achievements.",
      color: "orange",
      emoji: "🏅"
    },
    {
      icon: <MessageCircle size={32} />,
      title: "24/7 Support",
      description: "Questions? Our friendly support team is always here to help.",
      color: "teal",
      emoji: "💬"
    }
  ];

  const features = [
    { icon: <Coffee size={20} />, text: "Parent-friendly dashboard" },
    { icon: <Globe size={20} />, text: "Learn from anywhere" },
    { icon: <Trophy size={20} />, text: "Weekly progress reports" },
    { icon: <Smile size={20} />, text: "Diverse learning styles" },
    { icon: <Zap size={20} />, text: "Instant feedback" },
    { icon: <Sparkles size={20} />, text: "Creative projects" }
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      childName: "Emily, age 9",
      text: "My daughter used to think coding was boring. Now she asks to do AkiliCode every day!",
      rating: 5,
      role: "Mother of 2"
    },
    {
      name: "Michael Chen",
      childName: "Leo, age 11",
      text: "The progress I've seen in my son's problem-solving skills is amazing. Best decision we made!",
      rating: 5,
      role: "Father & Software Engineer"
    },
    {
      name: "David Williams",
      childName: "Sophia, age 8",
      text: "Finally, a coding platform that's actually fun and educational. Sophia loves her coding adventures!",
      rating: 5,
      role: "Parent"
    }
  ];

  const getColorClasses = (color: string) => {
    const colors = {
      pink: {
        bg: "bg-pink-100",
        text: "text-pink-700",
        border: "border-pink-200",
        iconBg: "bg-pink-200",
        gradient: "from-pink-100 to-pink-200",
        hover: "hover:border-pink-300"
      },
      green: {
        bg: "bg-green-100",
        text: "text-green-700",
        border: "border-green-200",
        iconBg: "bg-green-200",
        gradient: "from-green-100 to-green-200",
        hover: "hover:border-green-300"
      },
      blue: {
        bg: "bg-blue-100",
        text: "text-blue-700",
        border: "border-blue-200",
        iconBg: "bg-blue-200",
        gradient: "from-blue-100 to-blue-200",
        hover: "hover:border-blue-300"
      },
      purple: {
        bg: "bg-purple-100",
        text: "text-purple-700",
        border: "border-purple-200",
        iconBg: "bg-purple-200",
        gradient: "from-purple-100 to-purple-200",
        hover: "hover:border-purple-300"
      },
      orange: {
        bg: "bg-orange-100",
        text: "text-orange-700",
        border: "border-orange-200",
        iconBg: "bg-orange-200",
        gradient: "from-orange-100 to-orange-200",
        hover: "hover:border-orange-300"
      },
      teal: {
        bg: "bg-teal-100",
        text: "text-teal-700",
        border: "border-teal-200",
        iconBg: "bg-teal-200",
        gradient: "from-teal-100 to-teal-200",
        hover: "hover:border-teal-300"
      }
    };
    return colors[color as keyof typeof colors] || colors.purple;
  };

  return (
    <section className="py-20 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-white to-orange-50 -z-10" />
      
      {/* Decorative Elements */}
      <div className="absolute top-0 left-1/2 w-96 h-96 bg-gradient-to-r from-purple-300 to-orange-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 -translate-x-1/2 -z-10" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-pink-300 rounded-full filter blur-3xl opacity-20 -z-10" />
      <div className="absolute top-1/2 right-0 w-64 h-64 bg-blue-300 rounded-full filter blur-3xl opacity-20 -z-10" />
      
      {/* Floating Elements */}
      <div className="absolute top-20 left-10 text-4xl animate-float">⭐</div>
      <div className="absolute bottom-20 right-10 text-4xl animate-float animation-delay-2000">🌟</div>

      <div className="max-w-6xl mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-purple-200 to-orange-200 text-purple-800 text-sm font-bold mb-4">
            <Heart size={16} className="fill-purple-800" />
            <span>Why Parents & Kids Love Us</span>
            <Sparkles size={16} />
          </div>
          
          <h2 className="text-4xl lg:text-5xl font-black mb-4">
            <span className="bg-gradient-to-r from-purple-600 via-pink-500 to-orange-500 bg-clip-text text-transparent">
              Why Choose AkiliCode?
            </span>
          </h2>
          
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            We're not just teaching code — we're building future creators!
          </p>
        </div>

        {/* Main Reasons Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {reasons.map((reason, idx) => {
            const colors = getColorClasses(reason.color);
            return (
              <div
                key={idx}
                className={`group bg-white rounded-2xl p-6 border-2 ${colors.border} ${colors.hover} shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-2`}
              >
                <div className="flex items-start gap-4">
                  {/* Icon with Emoji */}
                  <div>
                    <div className={`w-14 h-14 rounded-xl ${colors.iconBg} ${colors.text} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                      {reason.icon}
                    </div>
                    <div className="text-2xl text-center">{reason.emoji}</div>
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-800 mb-2">{reason.title}</h3>
                    <p className="text-gray-600 text-sm leading-relaxed">{reason.description}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Feature Highlights */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          {/* Left Column - Features List */}
          <div className="bg-gradient-to-br from-purple-50 to-orange-50 rounded-3xl p-8">
            <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <Sparkles size={24} className="text-purple-600" />
              What Makes Us Special
            </h3>
            <div className="grid grid-cols-2 gap-4">
              {features.map((feature, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center text-purple-600">
                    {feature.icon}
                  </div>
                  <span className="text-sm font-medium text-gray-700">{feature.text}</span>
                </div>
              ))}
            </div>
            
            {/* Bonus Points */}
            <div className="mt-8 p-4 bg-white rounded-xl border border-purple-100">
              <div className="flex items-center gap-2 mb-3">
                <div className="text-2xl">🎁</div>
                <span className="font-bold text-gray-800">Bonus Features</span>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <CheckCircle size={14} className="text-green-500" />
                  <span>Free trial for new students</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <CheckCircle size={14} className="text-green-500" />
                  <span>Monthly parent webinars</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <CheckCircle size={14} className="text-green-500" />
                  <span>Community events & hackathons</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Testimonials */}
          <div>
            <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <MessageCircle size={24} className="text-orange-500" />
              Happy Parents Say
            </h3>
            <div className="space-y-4">
              {testimonials.map((testimonial, idx) => (
                <div key={idx} className="bg-white rounded-2xl p-5 shadow-md border border-purple-100 hover:shadow-lg transition">
                  <div className="flex items-center gap-1 mb-3">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="fill-yellow-500 text-yellow-500" />
                    ))}
                  </div>
                  <p className="text-gray-700 text-sm italic mb-3">"{testimonial.text}"</p>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-bold text-gray-800 text-sm">{testimonial.name}</div>
                      <div className="text-xs text-gray-500">{testimonial.childName}</div>
                    </div>
                    <div className="text-xs text-purple-600 font-semibold">{testimonial.role}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Comparison Table Highlight */}
        <div className="bg-white rounded-3xl p-8 shadow-xl border-2 border-purple-100 mb-16">
          <h3 className="text-2xl font-bold text-center text-gray-800 mb-8">
            How We Compare 📊
          </h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center p-4">
              <div className="text-4xl mb-3">🎮</div>
              <div className="font-bold text-purple-700 mb-2">Game-Based Learning</div>
              <div className="text-sm text-gray-600">Fun, engaging, and educational</div>
            </div>
            <div className="text-center p-4 border-x border-purple-100">
              <div className="text-4xl mb-3">👥</div>
              <div className="font-bold text-purple-700 mb-2">Small Class Sizes</div>
              <div className="text-sm text-gray-600">Max 6 students per session</div>
            </div>
            <div className="text-center p-4">
              <div className="text-4xl mb-3">💝</div>
              <div className="font-bold text-purple-700 mb-2">Parent Peace of Mind</div>
              <div className="text-sm text-gray-600">Safe, tracked, and supported</div>
            </div>
          </div>
        </div>

        {/* Final CTA */}
        <div className="text-center">
          <div className="bg-gradient-to-r from-purple-600 to-orange-500 rounded-3xl p-8 text-white">
            <h3 className="text-2xl font-bold mb-3">
              Ready to Start Your Child's Coding Journey?
            </h3>
            <p className="text-purple-100 mb-6">
              Join thousands of happy families already coding with AkiliCode
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/register"
                className="inline-flex items-center gap-2 px-8 py-3 bg-white text-purple-700 font-bold rounded-full hover:scale-105 transition-all shadow-lg"
              >
                Start Free Trial
                <Zap size={18} />
              </a>
              <a
                href="/demo"
                className="inline-flex items-center gap-2 px-8 py-3 bg-purple-800 text-white font-bold rounded-full hover:bg-purple-900 transition-all"
              >
                Watch Parent Demo
                <Heart size={18} />
              </a>
            </div>
            <p className="text-purple-200 text-sm mt-4">
              No credit card required • Cancel anytime • 30-day money-back guarantee
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

// Star component for rating
const Star = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
  </svg>
);

export default WhyAkiliCode;