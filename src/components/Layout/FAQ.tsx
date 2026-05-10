import { useState } from "react";
import { 
  ChevronDown, 
  ChevronUp, 
  Heart, 
  CreditCard, 
  Clock, 
  Computer,
  Award,
  Users,
  Shield,
  MessageCircle,
  Sparkles
} from "lucide-react";

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleQuestion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const faqs = [
    {
      category: "For Parents",
      icon: <Heart size={20} />,
      questions: [
        {
          q: "What age group is AkiliCode for?",
          a: "AkiliCode is designed for kids ages 6-12! We have different levels for beginners (ages 6-8), intermediate (ages 9-10), and advanced (ages 11-12). Every child starts at the right level for them.",
          emoji: "🎂"
        },
        {
          q: "Does my child need any coding experience?",
          a: "Not at all! We start from absolute zero. Our platform is designed for complete beginners. Kids learn through fun games and puzzles, so they don't need any prior knowledge.",
          emoji: "🌟"
        },
        {
          q: "How do I track my child's progress?",
          a: "Parents get access to a special dashboard where you can see your child's completed lessons, earned badges, and overall progress. We also send weekly email reports directly to you!",
          emoji: "📊"
        },
        {
          q: "Is AkiliCode safe for my child?",
          a: "Absolutely! We're COPPA compliant with no ads, no chat rooms, and all content is parent-approved. Your child's safety is our #1 priority.",
          emoji: "🛡️"
        }
      ]
    },
    {
      category: "For Kids",
      icon: <Sparkles size={20} />,
      questions: [
        {
          q: "Will I get to make my own games?",
          a: "Yes! You'll learn to create your own video games, animations, and stories. By the end of your first month, you'll have built something awesome to share with friends!",
          emoji: "🎮"
        },
        {
          q: "What if I get stuck?",
          a: "Don't worry! We have friendly teachers and helpers available to assist you. You can also ask questions in our safe learning environment, and we'll help you figure it out together!",
          emoji: "🤝"
        },
        {
          q: "Do I get prizes for completing lessons?",
          a: "Yes! You'll earn cool badges, stars, and certificates for each milestone. Complete enough challenges and you might even become a Coding Master!",
          emoji: "🏆"
        },
        {
          q: "How much time do I need each week?",
          a: "Just 20-30 minutes per day, 3-4 times a week is perfect! You can learn at your own pace, whenever it fits your schedule.",
          emoji: "⏰"
        }
      ]
    },
    {
      category: "Practical Info",
      icon: <CreditCard size={20} />,
      questions: [
        {
          q: "How much does AkiliCode cost?",
          a: "Only 4,000 KES per month! That's less than a pizza dinner. Plus, we have discounts when you pay for multiple months. And there's a free trial so you can try before you buy!",
          emoji: "💰"
        },
        {
          q: "What device do we need?",
          a: "Any computer, laptop, or tablet with internet works great! Most lessons also work on iPads and Android tablets. No special equipment needed.",
          emoji: "💻"
        },
        {
          q: "Can I cancel anytime?",
          a: "Yes! No contracts, no hidden fees. You can cancel your subscription anytime from your parent dashboard. We'll miss you, but you can always come back!",
          emoji: "🔄"
        },
        {
          q: "Do you offer refunds?",
          a: "We offer a 30-day money-back guarantee. If you're not happy for any reason, just let us know and we'll give you a full refund - no questions asked!",
          emoji: "✅"
        }
      ]
    }
  ];

  const quickAnswers = [
    { icon: <Clock size={16} />, label: "20-30 min lessons", color: "purple" },
    { icon: <Computer size={16} />, label: "Works on any device", color: "blue" },
    { icon: <Award size={16} />, label: "Certificates included", color: "green" },
    { icon: <Users size={16} />, label: "Small class sizes", color: "orange" },
    { icon: <Shield size={16} />, label: "100% safe", color: "pink" },
    { icon: <MessageCircle size={16} />, label: "24/7 support", color: "teal" }
  ];

  const getColorClasses = (color: string) => {
    const colors = {
      purple: "bg-purple-100 text-purple-700",
      blue: "bg-blue-100 text-blue-700",
      green: "bg-green-100 text-green-700",
      orange: "bg-orange-100 text-orange-700",
      pink: "bg-pink-100 text-pink-700",
      teal: "bg-teal-100 text-teal-700"
    };
    return colors[color as keyof typeof colors] || colors.purple;
  };

  return (
    <section id="faq" className="py-20 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-white via-purple-50/20 to-white -z-10" />
      
      {/* Decorative Elements */}
      <div className="absolute top-20 left-10 w-64 h-64 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse -z-10" />
      <div className="absolute bottom-20 right-10 w-64 h-64 bg-orange-300 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse animation-delay-2000 -z-10" />
      
      {/* Floating Question Mark */}
      <div className="absolute top-1/3 right-5 text-5xl opacity-5 animate-float">?</div>
      <div className="absolute bottom-1/3 left-5 text-5xl opacity-5 animate-float animation-delay-3000">?</div>

      <div className="max-w-6xl mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-purple-200 to-orange-200 text-purple-800 text-sm font-bold mb-4">
            <Heart size={16} />
            <span>❓ Got Questions? We've Got Answers!</span>
            <Sparkles size={16} />
          </div>
          
          <h2 className="text-4xl lg:text-5xl font-black mb-4">
            <span className="bg-gradient-to-r font-serif from-purple-600 via-pink-500 to-orange-500 bg-clip-text text-transparent">
              Frequently Asked Questions
            </span>
          </h2>
          
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Everything you need to know about AkiliCode
          </p>
        </div>

        {/* Quick Answers Strip */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {quickAnswers.map((item, idx) => (
            <div
              key={idx}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${getColorClasses(item.color)} text-sm font-semibold shadow-sm`}
            >
              {item.icon}
              <span>{item.label}</span>
            </div>
          ))}
        </div>

        {/* FAQ Categories */}
        <div className="space-y-8">
          {faqs.map((category, catIdx) => (
            <div key={catIdx}>
              {/* Category Header */}
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">
                  {category.icon}
                </div>
                <h3 className="text-2xl font-bold text-gray-800">{category.category}</h3>
              </div>

              {/* Questions */}
              <div className="space-y-3">
                {category.questions.map((faq, idx) => {
                  const globalIdx = catIdx * 100 + idx;
                  const isOpen = openIndex === globalIdx;
                  
                  return (
                    <div
                      key={idx}
                      className="bg-white rounded-2xl border border-purple-100 overflow-hidden shadow-sm hover:shadow-md transition-all"
                    >
                      <button
                        onClick={() => toggleQuestion(globalIdx)}
                        className="w-full px-6 py-4 text-left flex items-center justify-between gap-4 hover:bg-purple-50 transition-colors"
                      >
                        <div className="flex items-center gap-3 flex-1">
                          <span className="text-2xl">{faq.emoji}</span>
                          <span className="font-bold text-gray-800">{faq.q}</span>
                        </div>
                        {isOpen ? (
                          <ChevronUp size={20} className="text-purple-600 flex-shrink-0" />
                        ) : (
                          <ChevronDown size={20} className="text-purple-600 flex-shrink-0" />
                        )}
                      </button>
                      
                      {isOpen && (
                        <div className="px-6 pb-4 pt-0">
                          <div className="pl-9 text-gray-600 leading-relaxed">
                            {faq.a}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Still Have Questions? */}
        <div className="mt-12 bg-gradient-to-r from-purple-100 to-orange-100 rounded-3xl p-8 text-center">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex-1">
              <div className="text-4xl mb-3">💬</div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                Still have questions?
              </h3>
              <p className="text-gray-600">
                Our friendly team is here to help you 24/7!
              </p>
            </div>
            <div className="flex gap-3">
              <a
                href="mailto:support@akilicode.com"
                className="px-6 py-3 bg-white text-purple-700 font-bold rounded-full hover:scale-105 transition-all shadow-md"
              >
                Email Us
              </a>
              <a
                href="/contact"
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-orange-500 text-white font-bold rounded-full hover:scale-105 transition-all shadow-md"
              >
                Live Chat 💬
              </a>
            </div>
          </div>
        </div>

        {/* Trust Badge */}
        <div className="text-center mt-8">
          <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
            <Heart size={14} className="text-red-500 fill-red-500" />
            <span>Join 10,000+ happy families already coding with us!</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FAQ;