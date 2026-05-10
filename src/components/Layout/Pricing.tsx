import { 
  CheckCircle, 
  Zap,
  Gift,
  Heart,
  Shield,
  Clock,
  MessageCircle,
  Sparkles
} from "lucide-react";

const Pricing = () => {
  const monthlyPrice = 4000; // KES
  
  const features = [
    { text: "4 live coding classes per month", included: true, icon: "🎮" },
    { text: "Access to all learning materials", included: true, icon: "📚" },
    { text: "Fun coding projects and games", included: true, icon: "🎨" },
    { text: "Progress reports for parents", included: true, icon: "📊" },
    { text: "Certificate upon completion", included: true, icon: "🏆" },
    { text: "24/7 support from our team", included: true, icon: "💬" },
    { text: "One-on-one teacher sessions", included: false, icon: "👩‍🏫" },
    { text: "Physical learning kit", included: false, icon: "📦" }
  ];

  const discounts = [
    { months: 3, savings: "10%", price: 10800, original: 12000, badge: "Popular" },
    { months: 6, savings: "15%", price: 20400, original: 24000, badge: "Best Value" },
    { months: 12, savings: "20%", price: 38400, original: 48000, badge: "Super Saver" }
  ];

  const whatKidsGet = [
    { emoji: "🎮", text: "Fun coding games" },
    { emoji: "🤖", text: "Robot challenges" },
    { emoji: "🎨", text: "Creative projects" },
    { emoji: "🏅", text: "Cool badges" },
    { emoji: "📜", text: "Certificate" },
    { emoji: "🎁", text: "Surprise rewards" }
  ];

  return (
    <section id="pricing" className="py-20 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-white via-purple-50/30 to-white -z-10" />
      
      {/* Animated Shapes */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse -z-10" />
      <div className="absolute bottom-20 right-10 w-72 h-72 bg-orange-300 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse animation-delay-2000 -z-10" />
      
      {/* Floating Emojis */}
      <div className="absolute top-1/4 left-5 text-3xl animate-float">💰</div>
      <div className="absolute bottom-1/4 right-5 text-3xl animate-float animation-delay-3000">🎁</div>

      <div className="max-w-6xl mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-purple-200 to-orange-200 text-purple-800 text-sm font-bold mb-4">
            <Gift size={16} />
            <span>🎯 Affordable & Fun!</span>
            <Sparkles size={16} />
          </div>
          
          <h2 className="text-4xl lg:text-5xl font-black mb-4">
            <span className="bg-gradient-to-r font-serif from-purple-600 via-pink-500 to-orange-500 bg-clip-text text-transparent">
              Simple Pricing
            </span>
          </h2>
          
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Start your coding adventure today! No hidden fees, cancel anytime.
          </p>
        </div>

        {/* Monthly Plan Card - Highlighted */}
        <div className="max-w-md mx-auto mb-16">
          <div className="relative group">
            {/* Glow Effect */}
            <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-orange-500 rounded-2xl blur opacity-25 group-hover:opacity-75 transition duration-300"></div>
            
            <div className="relative bg-white rounded-2xl shadow-xl overflow-hidden">
              {/* Popular Badge */}
              <div className="absolute top-0 right-0">
                <div className="bg-gradient-to-r from-orange-500 to-pink-500 text-white px-6 py-1 rounded-bl-2xl text-sm font-bold">
                  MOST POPULAR
                </div>
              </div>

              <div className="p-8">
                {/* Plan Name */}
                <div className="text-center mb-6">
                  <div className="text-5xl mb-3">🚀</div>
                  <h3 className="text-2xl font-black text-gray-800 mb-2">Monthly Adventure</h3>
                  <p className="text-gray-500">Perfect for beginners</p>
                </div>

                {/* Price */}
                <div className="text-center mb-6">
                  <div className="text-5xl font-black text-purple-700">
                    KES {monthlyPrice.toLocaleString()}
                  </div>
                  <div className="text-gray-500 mt-2">per month</div>
                  <div className="text-sm text-green-600 mt-2 flex items-center justify-center gap-1">
                    <Clock size={14} />
                    <span>Billed monthly • Cancel anytime</span>
                  </div>
                </div>

                {/* CTA Button */}
                <a
                  href="/register"
                  className="block text-center py-3 px-6 bg-gradient-to-r from-purple-600 to-orange-500 text-white font-bold rounded-full hover:scale-105 transition-all shadow-lg mb-6"
                >
                  Start Free Trial
                  <Zap size={16} className="inline ml-2" />
                </a>

                {/* Features List */}
                <div className="space-y-3">
                  {features.map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      {feature.included ? (
                        <CheckCircle size={18} className="text-green-500 flex-shrink-0" />
                      ) : (
                        <div className="w-4.5 h-4.5" /> // Placeholder for spacing
                      )}
                      <span className={`text-sm ${feature.included ? 'text-gray-700' : 'text-gray-400 line-through'}`}>
                        {feature.icon} {feature.text}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* What Kids Get - Fun Section */}
        <div className="bg-gradient-to-r from-purple-100 to-orange-100 rounded-3xl p-8 mb-16">
          <div className="text-center mb-6">
            <h3 className="text-2xl font-bold text-purple-900 mb-2">
              What Your Child Gets Every Month 🎁
            </h3>
            <p className="text-gray-700">Each month is packed with excitement and learning!</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {whatKidsGet.map((item, idx) => (
              <div key={idx} className="text-center group">
                <div className="text-4xl mb-2 transform group-hover:scale-110 transition-transform inline-block">
                  {item.emoji}
                </div>
                <div className="text-xs font-semibold text-gray-700">{item.text}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Discount Plans */}
        <div className="mb-16">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-gray-800 mb-2">
              Save More with Longer Plans 💰
            </h3>
            <p className="text-gray-600">Perfect for committed young coders!</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {discounts.map((plan, idx) => (
              <div
                key={idx}
                className={`relative bg-white rounded-2xl p-6 shadow-md border-2 transition-all hover:-translate-y-2 hover:shadow-xl
                  ${plan.badge === "Best Value" 
                    ? "border-orange-400 shadow-lg" 
                    : "border-purple-100"
                  }`}
              >
                {/* Badge */}
                {plan.badge && (
                  <div className={`absolute -top-3 left-1/2 transform -translate-x-1/2 px-3 py-1 rounded-full text-xs font-bold text-white
                    ${plan.badge === "Best Value" 
                      ? "bg-gradient-to-r from-orange-500 to-pink-500" 
                      : "bg-purple-600"
                    }`}
                  >
                    {plan.badge}
                  </div>
                )}

                <div className="text-center mb-4">
                  <div className="text-3xl mb-2">
                    {plan.months === 3 && "📅"}
                    {plan.months === 6 && "🎯"}
                    {plan.months === 12 && "🌟"}
                  </div>
                  <h4 className="text-xl font-bold text-gray-800">{plan.months} Months</h4>
                  <div className="text-sm text-green-600 font-semibold mt-1">
                    Save {plan.savings}!
                  </div>
                </div>

                <div className="text-center mb-4">
                  <div className="text-2xl font-black text-purple-700">
                    KES {plan.price.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-400 line-through">
                    KES {plan.original.toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Just KES {(plan.price / plan.months).toFixed(0)}/month
                  </div>
                </div>

                <a
                  href="/register"
                  className="block text-center py-2 px-4 bg-purple-100 text-purple-700 font-bold rounded-full hover:bg-purple-200 transition-all"
                >
                  Choose Plan
                </a>
              </div>
            ))}
          </div>
        </div>

        {/* Special Offer Banner */}
        <div className="bg-gradient-to-r from-purple-600 to-orange-500 rounded-2xl p-6 mb-16 overflow-hidden relative">
          <div className="absolute top-0 right-0 text-8xl opacity-10">🎉</div>
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="text-4xl">🎁</div>
              <div>
                <h4 className="text-white font-bold text-lg">Special Offer!</h4>
                <p className="text-purple-100 text-sm">First month 50% off for annual plan</p>
              </div>
            </div>
            <a
              href="/register"
              className="px-6 py-2 bg-white text-purple-700 font-bold rounded-full hover:scale-105 transition-all whitespace-nowrap"
            >
              Claim Offer →
            </a>
          </div>
        </div>

        {/* Risk-Free Guarantee */}
        <div className="text-center">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-6">
            <div className="flex items-center gap-2">
              <Heart size={18} className="text-red-500 fill-red-500" />
              <span className="text-sm text-gray-600">Love it or get a refund</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield size={18} className="text-green-500" />
              <span className="text-sm text-gray-600">Secure payments</span>
            </div>
            <div className="flex items-center gap-2">
              <MessageCircle size={18} className="text-blue-500" />
              <span className="text-sm text-gray-600">24/7 parent support</span>
            </div>
          </div>

          {/* FAQ Link */}
          <p className="text-sm text-gray-500">
            Have questions? Check out our <a href="#faq" className="text-purple-600 font-semibold hover:underline">FAQ</a> or contact our friendly team! 💬
          </p>
        </div>
      </div>
    </section>
  );
};

export default Pricing;