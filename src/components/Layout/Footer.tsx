import { 
  Code2, 
  Heart, 
  Mail,
  Phone,
  MapPin,
  Clock,
  Award,
  Shield,
  Sparkles
} from "lucide-react";
import { FaFacebook, FaInstagram, FaYoutube } from "react-icons/fa";
import { FaTwitter } from "react-icons/fa6";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const quickLinks = [
    { label: "What We Offer", href: "#offer" },
    { label: "How It Works", href: "#how" },
    { label: "Pricing", href: "#pricing" },
    { label: "Testimonials", href: "#testimonials" },
    { label: "FAQ", href: "#faq" }
  ];

  const resources = [
    { label: "Parent Guide", href: "/parent-guide" },
    { label: "Kid Safety Tips", href: "/safety" },
    { label: "Coding Blog", href: "/blog" },
    { label: "Free Games", href: "/games" },
    { label: "Support Center", href: "/support" }
  ];

  const contactInfo = [
    { icon: <Mail size={16} />, text: "hello@akilicode.com", href: "mailto:hello@akilicode.com" },
    { icon: <Phone size={16} />, text: "+254 700 123 456", href: "tel:+254700123456" },
    { icon: <MapPin size={16} />, text: "Nairobi, Kenya", href: "#" },
    { icon: <Clock size={16} />, text: "Mon-Fri: 9am - 6pm", href: "#" }
  ];

  const socialLinks = [
    { icon: <FaFacebook size={18} />, href: "https://facebook.com", label: "Facebook", color: "hover:bg-blue-600" },
    { icon: <FaTwitter size={18} />, href: "https://twitter.com", label: "Twitter", color: "hover:bg-sky-500" },
    { icon: <FaInstagram size={18} />, href: "https://instagram.com", label: "Instagram", color: "hover:bg-pink-600" },
    { icon: <FaYoutube size={18} />, href: "https://youtube.com", label: "YouTube", color: "hover:bg-red-600" }
  ];

  const badges = [
    { icon: <Award size={20} />, text: "Best Coding for Kids 2024", color: "bg-yellow-100 text-yellow-700" },
    { icon: <Shield size={20} />, text: "COPPA Certified", color: "bg-green-100 text-green-700" },
    { icon: <Sparkles size={20} />, text: "10,000+ Happy Kids", color: "bg-purple-100 text-purple-700" }
  ];

  return (
    <footer className="relative bg-gradient-to-b from-purple-900 to-purple-950 text-white overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-purple-800 rounded-full mix-blend-multiply filter blur-3xl opacity-20 -z-10" />
      <div className="absolute bottom-0 right-0 w-64 h-64 bg-orange-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 -z-10" />
      
      {/* Floating Emojis */}
      <div className="absolute top-20 left-10 text-4xl opacity-10 animate-float">🚀</div>
      <div className="absolute bottom-20 right-10 text-4xl opacity-10 animate-float animation-delay-2000">⭐</div>

      <div className="max-w-6xl mx-auto px-4 pt-16 pb-8">
        {/* Main Footer Content */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          
          {/* Column 1 - Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-purple-700 rounded-xl flex items-center justify-center">
                <Code2 size={20} className="text-white" />
              </div>
              <span className="text-xl font-black tracking-tight">
                Akili<span className="text-orange-400">&lt;&gt;</span>Code
              </span>
            </div>
            
            <p className="text-purple-200 text-sm mb-4 leading-relaxed">
              Making coding fun and accessible for kids ages 6-12. Building future creators, one line of code at a time.
            </p>
            
            {/* Trust Badges */}
            <div className="space-y-2">
              {badges.map((badge, idx) => (
                <div key={idx} className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold ${badge.color} mr-2 mb-2`}>
                  {badge.icon}
                  <span>{badge.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Column 2 - Quick Links */}
          <div>
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <span className="text-orange-400">✨</span>
              Quick Links
            </h3>
            <ul className="space-y-2">
              {quickLinks.map((link, idx) => (
                <li key={idx}>
                  <a 
                    href={link.href}
                    className="text-purple-200 hover:text-orange-400 transition-colors text-sm flex items-center gap-2"
                  >
                    <span className="text-orange-400">▸</span>
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3 - Resources */}
          <div>
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <span className="text-orange-400">📚</span>
              Resources
            </h3>
            <ul className="space-y-2">
              {resources.map((resource, idx) => (
                <li key={idx}>
                  <a 
                    href={resource.href}
                    className="text-purple-200 hover:text-orange-400 transition-colors text-sm flex items-center gap-2"
                  >
                    <span className="text-orange-400">•</span>
                    {resource.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4 - Contact & Social */}
          <div>
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <span className="text-orange-400">📞</span>
              Get in Touch
            </h3>
            
            {/* Contact Info */}
            <div className="space-y-2 mb-4">
              {contactInfo.map((info, idx) => (
                <a
                  key={idx}
                  href={info.href}
                  className="flex items-center gap-2 text-purple-200 hover:text-orange-400 transition-colors text-sm"
                >
                  {info.icon}
                  <span>{info.text}</span>
                </a>
              ))}
            </div>

            {/* Social Links */}
            <div>
              <h4 className="text-sm font-semibold mb-2 text-purple-300">Follow the fun!</h4>
              <div className="flex gap-2">
                {socialLinks.map((social, idx) => (
                  <a
                    key={idx}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`w-9 h-9 rounded-full bg-purple-800 flex items-center justify-center hover:scale-110 transition-all duration-300 ${social.color}`}
                    aria-label={social.label}
                  >
                    {social.icon}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Newsletter Section */}
        <div className="border-t border-purple-800 pt-8 mb-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="text-3xl">🎁</div>
              <div>
                <h3 className="font-bold text-white">Get Free Coding Tips!</h3>
                <p className="text-purple-200 text-sm">Monthly newsletter for parents</p>
              </div>
            </div>
            
            <form className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              <input
                type="email"
                placeholder="Your email address"
                className="px-4 py-2 rounded-full bg-purple-800 border border-purple-700 text-white placeholder-purple-300 focus:outline-none focus:border-orange-400 transition-colors w-full sm:w-64"
              />
              <button
                type="submit"
                className="px-6 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold rounded-full hover:scale-105 transition-all"
              >
                Subscribe 🎉
              </button>
            </form>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-purple-800 pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-purple-300 text-xs">
              © {currentYear} AkiliCode. All rights reserved. Made with <Heart size={12} className="inline text-red-400 fill-red-400" /> in Kenya
            </div>
            
            <div className="flex flex-wrap gap-4 text-xs">
              <a href="/privacy" className="text-purple-300 hover:text-orange-400 transition-colors">
                Privacy Policy
              </a>
              <span className="text-purple-600">|</span>
              <a href="/terms" className="text-purple-300 hover:text-orange-400 transition-colors">
                Terms of Service
              </a>
              <span className="text-purple-600">|</span>
              <a href="/cookies" className="text-purple-300 hover:text-orange-400 transition-colors">
                Cookie Policy
              </a>
              <span className="text-purple-600">|</span>
              <a href="/sitemap" className="text-purple-300 hover:text-orange-400 transition-colors">
                Sitemap
              </a>
            </div>
          </div>
          
          {/* Kids Safe Message */}
          <div className="text-center mt-4">
            <p className="text-purple-400 text-xs flex items-center justify-center gap-1">
              <Shield size={12} />
              <span>100% Kid-Safe Platform • COPPA Compliant • No Ads • Parent Approved</span>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;