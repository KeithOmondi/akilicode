import { Users, Target, Heart, Award, Code, Rocket, BookOpen, Sparkles } from "lucide-react";

const AboutUs = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FDFCFE] to-purple-50/30">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-purple-900 text-white">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-orange-500 rounded-full filter blur-3xl opacity-20 -translate-y-1/2 translate-x-1/2"></div>
        <div className="max-w-6xl mx-auto px-4 py-24 md:py-32 relative z-10">
          <div className="flex flex-col items-center text-center">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-1.5 mb-6">
              <Sparkles size={16} className="text-orange-400" />
              <span className="text-sm font-medium">Empowering young minds since 2020</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-extrabold font-serif mb-6">
              We're on a mission to 
              <span className="text-orange-400 block mt-2">inspire the next generation</span>
            </h1>
            <p className="text-lg md:text-xl text-purple-100 max-w-2xl">
              Every child is born creative. We give them the tools, confidence, and community to turn their ideas into reality through code.
            </p>
          </div>
        </div>
      </div>

      {/* Mission & Vision Cards */}
      <div className="max-w-6xl mx-auto px-4 -mt-16 relative z-20">
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl shadow-xl p-8 border-l-4 border-orange-500">
            <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mb-5">
              <Target className="text-orange-600" size={24} />
            </div>
            <h3 className="text-xl font-bold text-purple-900 mb-3">Our Mission</h3>
            <p className="text-gray-600 leading-relaxed">
              To democratize coding education for kids aged 5–18, making it accessible, joyful, and career‑ready. We believe every child deserves to be a creator, not just a consumer, of technology.
            </p>
          </div>
          <div className="bg-white rounded-2xl shadow-xl p-8 border-l-4 border-purple-600">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-5">
              <Heart className="text-purple-700" size={24} />
            </div>
            <h3 className="text-xl font-bold text-purple-900 mb-3">Our Vision</h3>
            <p className="text-gray-600 leading-relaxed">
              A world where every child, regardless of background, has the superpower of computational thinking and the courage to build anything they imagine.
            </p>
          </div>
        </div>
      </div>

      {/* Our Story */}
<div className="max-w-6xl mx-auto px-4 py-20">
  <div className="flex flex-col md:flex-row gap-12 items-center">
    <div className="flex-1 animate-fade-in-up">
      <div className="inline-block px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-semibold mb-4">
        Our Journey
      </div>
      <h2 className="text-3xl md:text-4xl font-bold font-serif text-purple-900 mb-6">
        Born from a <span className="text-orange-500">simple idea</span>
      </h2>
      <div className="space-y-4 text-gray-600">
        <p>
          In 2020, our founder — a former software engineer and mother of two — realised that while kids love playing games, very few understand the magic behind them. She started teaching a small group of neighbourhood children basic coding, and the excitement was contagious.
        </p>
        <p>
          Today, we've grown into a vibrant community of over 10,000 young explorers, 50+ expert instructors, and hundreds of creative projects. From Scratch to Python, from game development to AI basics — we make learning feel like play.
        </p>
        <p>
          Our approach is project‑based, collaborative, and endlessly fun. No boring lectures, just real‑world challenges and the thrill of seeing your own creation come to life.
        </p>
      </div>
    </div>

    <div className="flex-1 flex justify-center">
      <div className="relative">
        {/* Animated blob container */}
        <div className="blob-container w-64 h-64 md:w-80 md:h-80">
          <div className="blob-shape w-full h-full bg-gradient-to-br from-purple-200 to-orange-200 shadow-xl">
            <div className="absolute inset-0 flex items-center justify-center">
              <Code size={80} className="text-purple-700 opacity-80" />
            </div>
          </div>
        </div>
        {/* Floating rocket badge */}
        <div className="absolute -bottom-4 -right-4 bg-white rounded-full p-3 shadow-lg animate-float-slow">
          <Rocket size={32} className="text-orange-500" />
        </div>
      </div>
    </div>
  </div>
</div>



      {/* Values Section */}
      <div className="bg-white py-20">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold font-serif text-purple-900 mb-4">
              What <span className="text-orange-500">drives us</span>
            </h2>
            <p className="text-gray-500 max-w-xl mx-auto">
              Core values that shape every decision, every class, every high‑five.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: <Users />, title: "Community First", desc: "We celebrate curiosity, support each other, and grow together." },
              { icon: <Award />, title: "Excellence", desc: "High‑quality curriculum designed by industry experts." },
              { icon: <BookOpen />, title: "Joyful Learning", desc: "Lessons that spark laughter, wonder, and 'aha!' moments." },
              { icon: <Heart />, title: "Inclusion", desc: "Every kid belongs. We champion diversity in tech." }
            ].map((value, idx) => (
              <div key={idx} className="text-center p-6 rounded-2xl hover:shadow-lg transition-all duration-300 group">
                <div className="w-16 h-16 bg-purple-100 text-purple-700 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-purple-700 group-hover:text-white transition-colors">
                  {value.icon}
                </div>
                <h3 className="text-xl font-bold text-purple-900 mb-2">{value.title}</h3>
                <p className="text-gray-500 text-sm">{value.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Stats / Impact */}
      <div className="py-16 bg-gradient-to-r from-purple-50 to-orange-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { number: "10,000+", label: "Happy Explorers" },
              { number: "200+", label: "Interactive Projects" },
              { number: "50+", label: "Expert Mentors" },
              { number: "98%", label: "Parent Satisfaction" }
            ].map((stat, i) => (
              <div key={i}>
                <div className="text-3xl md:text-4xl font-extrabold text-purple-900">{stat.number}</div>
                <div className="text-sm text-gray-500 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA / Join */}
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="bg-white rounded-3xl shadow-xl p-8 md:p-12 border border-purple-100">
          <h2 className="text-2xl md:text-3xl font-bold font-serif text-purple-900 mb-4">
            Ready to start the adventure?
          </h2>
          <p className="text-gray-500 mb-8 max-w-md mx-auto">
            Join thousands of families already coding the future, one project at a time.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/parent/programs"
              className="inline-flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-8 rounded-xl shadow-md transition-all transform hover:scale-105"
            >
              Explore Programs
              <Rocket size={18} />
            </a>
            <button className="inline-flex items-center justify-center gap-2 border-2 border-purple-200 hover:border-purple-400 text-purple-700 font-bold py-3 px-8 rounded-xl transition-all">
              Contact Us
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutUs;