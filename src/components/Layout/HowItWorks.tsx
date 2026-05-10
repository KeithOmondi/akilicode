import { 
  UserPlus, 
  Gamepad, 
  Code, 
  Trophy, 
  Rocket,
  CheckCircle,
  Sparkles,
  Heart,
  Zap
} from "lucide-react";

const HowItWorks = () => {
  const steps = [
    {
      number: "01",
      icon: <UserPlus size={36} />,
      title: "Sign Up Free",
      description: "Create your free account in just 1 minute! No credit card needed.",
      color: "purple",
      emoji: "🎉",
      detail: "Parents can join too!"
    },
    {
      number: "02",
      icon: <Gamepad size={36} />,
      title: "Pick Your Adventure",
      description: "Choose from fun coding games, puzzles, or creative projects.",
      color: "blue",
      emoji: "🎮",
      detail: "Beginner friendly!"
    },
    {
      number: "03",
      icon: <Code size={36} />,
      title: "Learn & Play",
      description: "Follow along with cute characters and solve exciting challenges.",
      color: "green",
      emoji: "🤖",
      detail: "Step-by-step guidance"
    },
    {
      number: "04",
      icon: <Trophy size={36} />,
      title: "Earn Rewards",
      description: "Collect badges, stars, and unlock new levels as you learn!",
      color: "orange",
      emoji: "🏆",
      detail: "Share with friends!"
    }
  ];

  const getColorClasses = (color: string) => {
    const colors = {
      purple: {
        bg: "bg-purple-100",
        text: "text-purple-700",
        border: "border-purple-200",
        gradient: "from-purple-500 to-purple-600",
        light: "bg-purple-50",
        badge: "bg-purple-200 text-purple-800",
        shadow: "shadow-purple-200"
      },
      blue: {
        bg: "bg-blue-100",
        text: "text-blue-700",
        border: "border-blue-200",
        gradient: "from-blue-500 to-blue-600",
        light: "bg-blue-50",
        badge: "bg-blue-200 text-blue-800",
        shadow: "shadow-blue-200"
      },
      green: {
        bg: "bg-green-100",
        text: "text-green-700",
        border: "border-green-200",
        gradient: "from-green-500 to-green-600",
        light: "bg-green-50",
        badge: "bg-green-200 text-green-800",
        shadow: "shadow-green-200"
      },
      orange: {
        bg: "bg-orange-100",
        text: "text-orange-700",
        border: "border-orange-200",
        gradient: "from-orange-500 to-orange-600",
        light: "bg-orange-50",
        badge: "bg-orange-200 text-orange-800",
        shadow: "shadow-orange-200"
      }
    };
    return colors[color as keyof typeof colors] || colors.purple;
  };

  return (
    <section id="how" className="py-20 relative overflow-hidden">
      {/* Fun Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-white via-purple-50/20 to-white -z-10" />
      
      {/* Animated Shapes */}
      <div className="absolute top-20 right-10 w-40 h-40 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse -z-10" />
      <div className="absolute bottom-20 left-10 w-40 h-40 bg-orange-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse animation-delay-2000 -z-10" />
      
      {/* Floating Elements */}
      <div className="absolute top-1/3 left-5 text-3xl animate-float">✨</div>
      <div className="absolute bottom-1/3 right-5 text-3xl animate-float animation-delay-3000">⭐</div>
      <div className="absolute top-1/2 left-10 text-2xl animate-bounce">🎯</div>

      <div className="max-w-6xl mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-purple-200 via-pink-200 to-orange-200 text-purple-800 text-sm font-bold mb-4">
            <Rocket size={16} />
            <span>🚀 Start Your Coding Journey!</span>
            <Sparkles size={16} />
          </div>
          
          <h2 className="text-4xl lg:text-5xl font-black mb-4">
            <span className="bg-gradient-to-r from-purple-600 via-pink-500 to-orange-500 bg-clip-text text-transparent">
              How It Works
            </span>
          </h2>
          
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Four simple steps to become a coding superstar! 🌟
          </p>
        </div>

        {/* Steps - Desktop Timeline */}
        <div className="hidden lg:block relative mb-20">
          {/* Connecting Line */}
          <div className="absolute top-1/2 left-0 right-0 h-1 bg-gradient-to-r from-purple-200 via-orange-200 to-purple-200 transform -translate-y-1/2 rounded-full" />
          
          <div className="relative grid grid-cols-4 gap-8">
            {steps.map((step, idx) => {
              const colors = getColorClasses(step.color);
              return (
                <div key={idx} className="text-center relative">
                  {/* Step Number Circle */}
                  <div className="relative z-10 mb-6">
                    <div className={`w-20 h-20 mx-auto rounded-full ${colors.bg} border-4 border-white shadow-lg flex items-center justify-center relative`}>
                      <span className={`text-2xl font-black ${colors.text}`}>{step.number}</span>
                      <div className={`absolute -top-2 -right-2 w-8 h-8 rounded-full ${colors.bg} flex items-center justify-center text-lg animate-bounce`}>
                        {step.emoji}
                      </div>
                    </div>
                  </div>
                  
                  {/* Icon */}
                  <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl ${colors.bg} ${colors.text} mb-4`}>
                    {step.icon}
                  </div>
                  
                  {/* Content */}
                  <h3 className="text-xl font-bold text-gray-800 mb-2">{step.title}</h3>
                  <p className="text-gray-600 mb-2">{step.description}</p>
                  <div className={`inline-block px-3 py-1 rounded-full ${colors.badge} text-xs font-semibold`}>
                    {step.detail}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Steps - Mobile/Tablet Cards */}
        <div className="lg:hidden space-y-6 mb-16">
          {steps.map((step, idx) => {
            const colors = getColorClasses(step.color);
            return (
              <div
                key={idx}
                className={`group bg-white rounded-2xl p-6 border-2 ${colors.border} shadow-md hover:shadow-xl transition-all hover:-translate-x-1`}
              >
                <div className="flex items-start gap-4">
                  {/* Step Number */}
                  <div className={`w-16 h-16 rounded-xl ${colors.bg} flex flex-col items-center justify-center relative flex-shrink-0`}>
                    <span className={`text-xl font-black ${colors.text}`}>{step.number}</span>
                    <div className="absolute -top-2 -right-2 text-xl">{step.emoji}</div>
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <div className={`${colors.text}`}>{step.icon}</div>
                      <h3 className="text-lg font-bold text-gray-800">{step.title}</h3>
                    </div>
                    <p className="text-gray-600 text-sm mb-2">{step.description}</p>
                    <div className={`inline-block px-2 py-1 rounded-full ${colors.badge} text-xs font-semibold`}>
                      {step.detail}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Visual Timeline Alternative - For better engagement */}
        <div className="bg-gradient-to-r from-purple-100 via-pink-100 to-orange-100 rounded-3xl p-8 mb-16">
          <div className="text-center mb-6">
            <h3 className="text-2xl font-bold text-purple-900 mb-2">
              Watch Your Progress Grow! 📈
            </h3>
            <p className="text-gray-700">Each lesson brings you closer to becoming a coding hero!</p>
          </div>
          
          <div className="relative pt-8">
            {/* Progress Bar */}
            <div className="h-4 bg-white rounded-full overflow-hidden mb-8">
              <div className="h-full w-3/4 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 rounded-full animate-shimmer" />
            </div>
            
            {/* Milestones */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { stage: "Beginner", reward: "🎁", color: "purple", lessons: "5 lessons" },
                { stage: "Explorer", reward: "🔓", color: "blue", lessons: "15 lessons" },
                { stage: "Creator", reward: "🎨", color: "green", lessons: "30 lessons" },
                { stage: "Master", reward: "🏆", color: "orange", lessons: "50+ lessons" }
              ].map((milestone, idx) => {
                const colors = getColorClasses(milestone.color);
                return (
                  <div key={idx} className="text-center">
                    <div className={`w-12 h-12 rounded-full ${colors.bg} flex items-center justify-center text-2xl mx-auto mb-2`}>
                      {milestone.reward}
                    </div>
                    <div className="font-bold text-gray-800 text-sm">{milestone.stage}</div>
                    <div className="text-xs text-gray-500">{milestone.lessons}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Sample Schedule Box */}
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          <div className="bg-white rounded-2xl p-6 text-center shadow-md border border-purple-100 hover:shadow-lg transition">
            <div className="text-4xl mb-3">⏰</div>
            <h4 className="font-bold text-gray-800 mb-1">Just 20-30 minutes</h4>
            <p className="text-sm text-gray-600">Perfect for after school!</p>
          </div>
          <div className="bg-white rounded-2xl p-6 text-center shadow-md border border-purple-100 hover:shadow-lg transition">
            <div className="text-4xl mb-3">💻</div>
            <h4 className="font-bold text-gray-800 mb-1">Any device works</h4>
            <p className="text-sm text-gray-600">Tablet, laptop, or computer</p>
          </div>
          <div className="bg-white rounded-2xl p-6 text-center shadow-md border border-purple-100 hover:shadow-lg transition">
            <div className="text-4xl mb-3">👨‍👩‍👧</div>
            <h4 className="font-bold text-gray-800 mb-1">Parent dashboard included</h4>
            <p className="text-sm text-gray-600">Track your child's progress</p>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <div className="inline-flex flex-col sm:flex-row items-center gap-4 bg-white rounded-full shadow-xl border-2 border-purple-200 p-2">
            <div className="flex items-center gap-2 px-4 py-2">
              <Heart size={20} className="text-red-500 fill-red-500" />
              <span className="font-bold text-gray-800">Join 10,000+ happy kids!</span>
            </div>
            <a
              href="/register"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-orange-500 text-white font-bold rounded-full hover:scale-105 transition-all shadow-lg"
            >
              Start Your Free Trial
              <Zap size={16} />
            </a>
          </div>
          
          {/* No credit card note */}
          <div className="flex items-center justify-center gap-2 mt-4 text-sm text-gray-500">
            <CheckCircle size={14} className="text-green-500" />
            <span>No credit card required</span>
            <span className="mx-2">•</span>
            <CheckCircle size={14} className="text-green-500" />
            <span>Cancel anytime</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;