import { 
  Gamepad2, 
  Puzzle,  
  Users, 
  Clock, 
  Star,
  Sparkles,
  Rocket,
  Brain,
  Palette,
  Music,
  Trophy
} from "lucide-react";

const WhatWeOffer = () => {
  const offers = [
    {
      icon: <Gamepad2 size={32} />,
      title: "Fun Coding Games",
      description: "Learn programming by playing exciting games and solving puzzles!",
      color: "purple",
      emoji: "🎮",
      ageGroup: "Ages 6-8"
    },
    {
      icon: <Puzzle size={32} />,
      title: "Block-Based Coding",
      description: "Drag and drop colorful blocks to create animations and stories.",
      color: "orange",
      emoji: "🧩",
      ageGroup: "Ages 7-10"
    },
    {
      icon: <Rocket size={32} />,
      title: "Create Your Own Games",
      description: "Build your own video games and share them with friends!",
      color: "blue",
      emoji: "🚀",
      ageGroup: "Ages 9-12"
    },
    {
      icon: <Brain size={32} />,
      title: "Problem Solving",
      description: "Develop critical thinking skills through fun challenges.",
      color: "green",
      emoji: "🧠",
      ageGroup: "Ages 8-12"
    },
    {
      icon: <Palette size={32} />,
      title: "Creative Projects",
      description: "Design artwork, animations, and interactive stories.",
      color: "pink",
      emoji: "🎨",
      ageGroup: "Ages 6-10"
    },
    {
      icon: <Music size={32} />,
      title: "Code with Music",
      description: "Learn coding by creating your own songs and beats!",
      color: "yellow",
      emoji: "🎵",
      ageGroup: "Ages 7-11"
    }
  ];

  const achievements = [
    { icon: <Trophy size={24} />, label: "Fun Badges", value: "50+", color: "yellow" },
    { icon: <Star size={24} />, label: "Happy Kids", value: "10,000+", color: "purple" },
    { icon: <Sparkles size={24} />, label: "Awesome Projects", value: "500+", color: "orange" },
    { icon: <Users size={24} />, label: "Young Coders", value: "15k+", color: "blue" }
  ];

  const getColorClasses = (color: string) => {
    const colors = {
      purple: {
        bg: "bg-purple-100",
        text: "text-purple-700",
        border: "border-purple-200",
        hover: "hover:border-purple-300",
        iconBg: "bg-purple-200",
        gradient: "from-purple-50 to-purple-100",
        badge: "bg-purple-200 text-purple-800"
      },
      orange: {
        bg: "bg-orange-100",
        text: "text-orange-700",
        border: "border-orange-200",
        hover: "hover:border-orange-300",
        iconBg: "bg-orange-200",
        gradient: "from-orange-50 to-orange-100",
        badge: "bg-orange-200 text-orange-800"
      },
      blue: {
        bg: "bg-blue-100",
        text: "text-blue-700",
        border: "border-blue-200",
        hover: "hover:border-blue-300",
        iconBg: "bg-blue-200",
        gradient: "from-blue-50 to-blue-100",
        badge: "bg-blue-200 text-blue-800"
      },
      green: {
        bg: "bg-green-100",
        text: "text-green-700",
        border: "border-green-200",
        hover: "hover:border-green-300",
        iconBg: "bg-green-200",
        gradient: "from-green-50 to-green-100",
        badge: "bg-green-200 text-green-800"
      },
      pink: {
        bg: "bg-pink-100",
        text: "text-pink-700",
        border: "border-pink-200",
        hover: "hover:border-pink-300",
        iconBg: "bg-pink-200",
        gradient: "from-pink-50 to-pink-100",
        badge: "bg-pink-200 text-pink-800"
      },
      yellow: {
        bg: "bg-yellow-100",
        text: "text-yellow-700",
        border: "border-yellow-200",
        hover: "hover:border-yellow-300",
        iconBg: "bg-yellow-200",
        gradient: "from-yellow-50 to-yellow-100",
        badge: "bg-yellow-200 text-yellow-800"
      }
    };
    return colors[color as keyof typeof colors] || colors.purple;
  };

  return (
    <section id="offer" className="py-20 relative overflow-hidden">
      {/* Fun Background Decor */}
      <div className="absolute inset-0 bg-gradient-to-b from-purple-50 via-white to-orange-50 -z-10" />
      <div className="absolute top-20 left-10 w-64 h-64 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-bounce -z-10" />
      <div className="absolute bottom-20 right-10 w-64 h-64 bg-orange-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-bounce animation-delay-2000 -z-10" />
      
      {/* Floating Emojis */}
      <div className="absolute top-40 left-5 text-4xl animate-float">⭐</div>
      <div className="absolute bottom-40 right-5 text-4xl animate-float animation-delay-2000">🚀</div>
      <div className="absolute top-1/2 left-10 text-3xl animate-float animation-delay-4000">🎮</div>

      <div className="max-w-6xl mx-auto px-4">
        {/* Section Header - Kid Friendly */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-purple-200 to-orange-200 text-purple-800 text-sm font-bold mb-4">
            <Sparkles size={16} className="fill-purple-600" />
            <span>🌈 What Makes Learning Fun!</span>
            <Sparkles size={16} className="fill-purple-600" />
          </div>
          
          <h2 className="text-4xl lg:text-5xl font-black mb-4">
            <span className="bg-gradient-to-r font-serif from-purple-600 via-pink-500 to-orange-500 bg-clip-text text-transparent">
              Cool Things You'll Do!
            </span>
          </h2>
          
          <p className="text-lg font-serif text-gray-600 max-w-2xl mx-auto">
            Discover the amazing adventures waiting for you at AkiliCode
          </p>
        </div>

        {/* Fun Stats for Kids */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
          {achievements.map((stat, idx) => {
            const colors = getColorClasses(stat.color);
            return (
              <div
                key={idx}
                className={`bg-white rounded-2xl p-4 text-center shadow-md border-2 ${colors.border} hover:shadow-xl transition-all hover:-translate-y-1 cursor-pointer`}
              >
                <div className={`inline-flex items-center justify-center w-14 h-14 rounded-full ${colors.iconBg} ${colors.text} mb-2 mx-auto`}>
                  {stat.icon}
                </div>
                <div className="text-2xl font-black text-gray-800">{stat.value}</div>
                <div className="text-sm font-semibold text-gray-600">{stat.label}</div>
              </div>
            );
          })}
        </div>

        {/* Offers Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {offers.map((offer, idx) => {
            const colors = getColorClasses(offer.color);
            return (
              <div
                key={idx}
                className={`group relative bg-white rounded-2xl p-6 border-2 ${colors.border} ${colors.hover} shadow-md hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 cursor-pointer`}
              >
                {/* Emoji Background */}
                <div className="absolute top-4 right-4 text-4xl opacity-10 group-hover:opacity-20 transition-opacity">
                  {offer.emoji}
                </div>

                {/* Icon with Animation */}
                <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl ${colors.iconBg} ${colors.text} mb-4 group-hover:scale-110 transition-transform duration-300 group-hover:rotate-3`}>
                  {offer.icon}
                </div>

                {/* Content */}
                <h3 className="text-xl font-bold text-gray-800 mb-2">
                  {offer.title}
                </h3>
                
                <p className="text-gray-600 mb-4 leading-relaxed">
                  {offer.description}
                </p>

                {/* Age Group Badge */}
                <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full ${colors.badge} text-xs font-bold`}>
                  <Clock size={12} />
                  <span>{offer.ageGroup}</span>
                </div>

                {/* Hover Arrow */}
                <div className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
                  <div className={`w-8 h-8 rounded-full ${colors.iconBg} flex items-center justify-center ${colors.text}`}>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Parent Trust Message */}
        <div className="mt-16 bg-gradient-to-r from-purple-100 to-orange-100 rounded-3xl p-8 text-center">
          <h3 className="text-2xl font-bold text-purple-900 mb-3">
            👨‍👩‍👧‍👦 Trusted by Parents Worldwide
          </h3>
          <p className="text-gray-700 mb-4 max-w-2xl mx-auto">
            "My daughter absolutely loves AkiliCode! She's learning valuable skills while having so much fun!"
          </p>
          <div className="flex items-center justify-center gap-2">
            {[...Array(5)].map((_, i) => (
              <Star key={i} size={20} className="fill-yellow-500 text-yellow-500" />
            ))}
            <span className="font-bold text-purple-800 ml-2">Rated 4.9/5 by 2,500+ parents</span>
          </div>
        </div>

        {/* Call to Action for Kids */}
        <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-3 bg-white rounded-full px-6 py-3 shadow-lg border-2 border-purple-200">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🎯</span>
              <span className="font-bold text-gray-800">Ready for an adventure?</span>
            </div>
            <div className="w-px h-6 bg-purple-200"></div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">🎁</span>
              <span className="font-bold text-purple-700">First lesson FREE!</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhatWeOffer;