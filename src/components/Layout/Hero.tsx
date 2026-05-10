import { ArrowRight, Play, CheckCircle, Sparkles } from "lucide-react";

// Define the props type for Star component
interface StarProps {
  className?: string;
}

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center pt-32 pb-20 overflow-hidden">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-white to-orange-50/30 -z-10" />
      
      {/* Animated Blobs */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob -z-10" />
      <div className="absolute top-40 right-10 w-72 h-72 bg-orange-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000 -z-10" />
      <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000 -z-10" />

      <div className="max-w-6xl mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          
          {/* Left Column - Content */}
          <div className="space-y-8">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-100 text-orange-700 text-sm font-semibold">
              <Sparkles size={16} className="fill-orange-500" />
              <span>Join 10,000+ Happy Learners</span>
            </div>

            {/* Main Heading */}
            <h1 className="text-5xl font-serif lg:text-6xl font-black leading-tight">
              <span className="bg-gradient-to-r from-purple-900 to-purple-600 bg-clip-text text-transparent">
                Master Coding
              </span>
              <br />
              <span className="text-gray-900">
                With{" "}
                <span className="relative inline-block">
                  <span className="relative z-10">Interactive</span>
                  <span className="absolute bottom-2 left-0 w-full h-3 bg-orange-200 -z-0"></span>
                </span>
              </span>
              <br />
              <span className="bg-gradient-to-r from-orange-500 to-purple-600 bg-clip-text text-transparent">
                Challenges
              </span>
            </h1>

            {/* Description */}
            <p className="text-lg text-gray-600 leading-relaxed max-w-lg">
              Learn programming the fun way! Solve real-world coding challenges, 
              build projects, and earn certificates. Perfect for beginners and pros alike.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <a
                href="/register"
                className="group inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-purple-700 to-purple-600 hover:from-purple-800 hover:to-purple-700 text-white font-bold rounded-full shadow-lg shadow-purple-200 transition-all hover:scale-105 active:scale-95"
              >
                Start Free Trial
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </a>
              <a
                href="#demo"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white hover:bg-gray-50 text-purple-800 font-bold rounded-full shadow-md border border-purple-100 transition-all hover:scale-105 active:scale-95"
              >
                <Play size={18} className="fill-purple-800" />
                Watch Demo
              </a>
            </div>

            {/* Trust Indicators */}
            <div className="flex items-center gap-6 pt-4">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 border-2 border-white flex items-center justify-center text-white text-xs font-bold"
                  >
                    {String.fromCharCode(64 + i)}
                  </div>
                ))}
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                  <span className="text-sm font-semibold text-gray-700 ml-2">4.9/5</span>
                </div>
                <p className="text-xs text-gray-500">from 2,500+ reviews</p>
              </div>
            </div>

            {/* Feature List */}
            <div className="flex flex-wrap gap-4 pt-2">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <CheckCircle size={16} className="text-green-500" />
                <span>100+ coding challenges</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <CheckCircle size={16} className="text-green-500" />
                <span>Real-time feedback</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <CheckCircle size={16} className="text-green-500" />
                <span>Certificate upon completion</span>
              </div>
            </div>
          </div>

          {/* Right Column - Illustration/Code Preview */}
          <div className="relative">
            <div className="relative bg-gradient-to-br from-purple-900 to-purple-700 rounded-2xl shadow-2xl overflow-hidden border border-purple-400/20">
              {/* Code Editor Mock */}
              <div className="bg-gray-900/90 p-4">
                {/* Window Controls */}
                <div className="flex gap-2 mb-4">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500" />
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                  <span className="text-gray-400 text-xs ml-2">solution.js</span>
                </div>
                
                {/* Code Lines */}
                <div className="space-y-2 font-mono text-sm">
                  <div className="text-purple-400">
                    <span className="text-gray-500">1</span> function reverseString(str) {'{'}
                  </div>
                  <div className="ml-4 text-yellow-300">
                    <span className="text-gray-500">2</span>   return str.split('').reverse().join('');
                  </div>
                  <div className="text-purple-400">
                    <span className="text-gray-500">3</span> {'}'}
                  </div>
                  <div className="h-px bg-gray-700 my-2"></div>
                  <div className="text-green-400">
                    <span className="text-gray-500">5</span> // Test your solution
                  </div>
                  <div className="text-blue-400">
                    <span className="text-gray-500">6</span> console.log(reverseString("hello"));
                  </div>
                  <div className="text-white">
                    <span className="text-gray-500">7</span> {'// Output: "olleh"'}
                  </div>
                </div>

                {/* Run Button */}
                <div className="mt-4 flex justify-end">
                  <div className="px-3 py-1 bg-green-500/20 text-green-400 rounded text-xs font-mono">
                    ✓ Solution Accepted
                  </div>
                </div>
              </div>

              {/* Decorative Elements */}
              <div className="absolute -top-5 -right-5 w-20 h-20 bg-orange-500 rounded-full opacity-20 blur-2xl" />
              <div className="absolute -bottom-5 -left-5 w-20 h-20 bg-purple-500 rounded-full opacity-20 blur-2xl" />
            </div>

            {/* Floating Stats */}
            <div className="absolute -bottom-6 -left-6 bg-white rounded-xl shadow-lg p-3 flex items-center gap-3 animate-float">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-ping" />
              </div>
              <div>
                <div className="text-xs text-gray-500">Active Now</div>
                <div className="font-bold text-gray-900">1,234 learners</div>
              </div>
            </div>

            <div className="absolute -top-6 -right-6 bg-white rounded-xl shadow-lg p-3 animate-float animation-delay-2000">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🏆</span>
                <div>
                  <div className="text-xs text-gray-500">Success Rate</div>
                  <div className="font-bold text-gray-900">94%</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-gray-400 rounded-full flex justify-center">
          <div className="w-1 h-2 bg-gray-400 rounded-full mt-2 animate-scroll" />
        </div>
      </div>
    </section>
  );
};

// Star component for rating with proper TypeScript typing
const Star: React.FC<StarProps> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
  </svg>
);

export default Hero;