import { Link } from "react-router-dom";
import {
  ChevronRight,
  BarChart3,
  HelpCircle,
  LogIn,
  BookOpen,
  Trophy,
  UserPlus,
  CreditCard,
  Users,
  GraduationCap,
  Sparkles,
  Rocket,
} from "lucide-react";

// Helper for icon background colors (since Tailwind doesn't allow dynamic classes)
const getIconBgColor = (color: string) => {
  switch (color) {
    case "blue": return "bg-blue-100 text-blue-600";
    case "purple": return "bg-purple-100 text-purple-600";
    case "green": return "bg-green-100 text-green-600";
    case "orange": return "bg-orange-100 text-orange-600";
    default: return "bg-gray-100 text-gray-600";
  }
};

const ParentGuide = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-orange-50/30">
      {/* Hero Section with SVG pattern (using inline style instead of Tailwind arbitrary) */}
      <section className="relative overflow-hidden bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white py-16 lg:py-20">
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
        <div className="relative max-w-5xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 bg-orange-500/20 text-orange-300 px-4 py-1.5 rounded-full text-sm font-bold mb-6 backdrop-blur-sm">
            <Sparkles size={16} className="text-orange-400" />
            Parent Resource Center
          </div>
          <h1 className="text-4xl font-serif lg:text-5xl font-extrabold tracking-tight mb-4 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
            Parent Guide
          </h1>
          <p className="text-xl font-serif text-gray-300 max-w-2xl mx-auto">
            Your complete walkthrough to set up, manage, and track your child's learning journey.
          </p>
        </div>
        {/* Decorative wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 32L48 37.3C96 43 192 53 288 58.7C384 64 480 64 576 58.7C672 53 768 43 864 42.7C960 43 1056 53 1152 58.7C1248 64 1344 64 1392 64L1440 64V120H1392C1344 120 1248 120 1152 120C1056 120 960 120 864 120C768 120 672 120 576 120C480 120 384 120 288 120C192 120 96 120 48 120H0V32Z" fill="url(#gradient)" />
            <defs>
              <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f9fafb" stopOpacity="1" />
                <stop offset="100%" stopColor="#f9fafb" stopOpacity="0" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 py-12 lg:py-16">
        {/* Quick Access Cards */}
        <div className="mb-16">
          <h2 className="text-2xl font-black text-gray-800 mb-6 flex items-center gap-2">
            <Rocket size={24} className="text-orange-500" /> Quick Access
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { to: "/parent/login", icon: LogIn, label: "Parent Login", color: "blue" },
              { to: "/parent/dashboard", icon: BarChart3, label: "Dashboard", color: "purple" },
              { to: "/parent/children/add", icon: UserPlus, label: "Add a Child", color: "green" },
              { to: "/courses", icon: BookOpen, label: "Browse Courses", color: "orange" },
            ].map((item) => (
              <Link
                key={item.label}
                to={item.to}
                className="group bg-white rounded-2xl p-5 shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-orange-200 flex flex-col items-center text-center"
              >
                <div className={`w-12 h-12 rounded-xl ${getIconBgColor(item.color)} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-200`}>
                  <item.icon size={22} />
                </div>
                <span className="font-bold text-gray-800 group-hover:text-orange-600 transition-colors">{item.label}</span>
                <ChevronRight size={14} className="text-gray-400 mt-1 opacity-0 group-hover:opacity-100 transition-all group-hover:translate-x-1" />
              </Link>
            ))}
          </div>
        </div>

        {/* Steps */}
        <div className="space-y-8">
          <h2 className="text-2xl font-black text-gray-800 mb-6 flex items-center gap-2">
            <Sparkles size={24} className="text-orange-500" /> How to Get Started
          </h2>

          {[
            {
              step: "1",
              title: "Create an Account or Log In",
              content: (
                <>
                  <p className="text-gray-700 mb-3">
                    If you're new, click <strong>“Sign Up”</strong> on the homepage to create an <strong>“Account”</strong>.
                    Already have an account? Use the <strong>“Login”</strong> button.
                  </p>
                  <div className="bg-gray-100 rounded-xl p-4 font-mono text-sm text-gray-700 border-l-4 border-orange-400">
                    Email: parent@example.com → Verify email → Set password
                  </div>
                </>
              ),
              icon: LogIn,
            },
            {
              step: "2",
              title: "Add Your Child's Profile",
              content: (
                <>
                  <p className="text-gray-700 mb-3">
                    After logging in, go to <strong>“My Kids”</strong> on the left-sidebar. Click <strong>“Add Exploer”</strong> and fill in:
                  </p>
                  <ul className="space-y-1 text-gray-600 list-disc list-inside ml-2">
                    <li>Child's Full Name</li>
                    <li>Age or grade (helps recommend courses)</li>
                    <li>Avatar (optional)</li>
                  </ul>
                  <p className="text-sm text-gray-500 mt-3">You can add up to <strong>3 children</strong> under one subscription.</p>
                </>
              ),
              icon: Users,
            },
            {
              step: "3",
              title: "Enroll Your Child in a Course",
              content: (
                <>
                  <p className="text-gray-700 mb-3">
                    From the parent dashboard, select a child, then click <strong>“Browse Courses”</strong>.
                    Pick a course and click <strong>“Enroll”</strong>. The child will see it immediately in their account.
                  </p>
                  <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 text-sm text-gray-700 flex gap-2 items-start">
                    <span className="text-orange-500 text-xl">💡</span>
                    <span><strong>Tip:</strong> Start with a beginner course like <strong>“Coding with Scratch”</strong> for young kids or <strong>“Python Basics”</strong> for older ones.</span>
                  </div>
                </>
              ),
              icon: GraduationCap,
            },
            {
              step: "4",
              title: "Child Logs In & Learns",
              content: (
                <>
                  <p className="text-gray-700 mb-3">
                    Share the login credentials (or let the child use the same device after you log out). The child can:
                  </p>
                  <ul className="space-y-1 text-gray-600 list-disc list-inside ml-2">
                    <li>See enrolled courses on their dashboard</li>
                    <li>Read lesson notes</li>
                    <li>Take quizzes to test knowledge</li>
                    <li>Earn points and badges</li>
                  </ul>
                </>
              ),
              icon: BookOpen,
            },
            {
              step: "5",
              title: "Track Progress",
              content: (
                <>
                  <p className="text-gray-700 mb-3">As a parent, you can see:</p>
                  <div className="grid sm:grid-cols-3 gap-3 mt-2">
                    <div className="flex items-center gap-2 bg-white rounded-xl p-3 shadow-sm border border-gray-100">
                      <BarChart3 size={20} className="text-orange-500" />
                      <span className="text-sm font-medium">Dashboard overview</span>
                    </div>
                    <div className="flex items-center gap-2 bg-white rounded-xl p-3 shadow-sm border border-gray-100">
                      <Trophy size={20} className="text-orange-500" />
                      <span className="text-sm font-medium">Points & levels</span>
                    </div>
                    <div className="flex items-center gap-2 bg-white rounded-xl p-3 shadow-sm border border-gray-100">
                      <BookOpen size={20} className="text-orange-500" />
                      <span className="text-sm font-medium">Lesson completion</span>
                    </div>
                  </div>
                </>
              ),
              icon: Trophy,
            },
            {
              step: "6",
              title: "Manage Subscription & Billing",
              content: (
                <>
                  <p className="text-gray-700 mb-3">
                    From the parent dashboard, go to <strong>“Settings”</strong> → <strong>“Subscription”</strong>. You can:
                  </p>
                  <ul className="space-y-1 text-gray-600 list-disc list-inside ml-2">
                    <li>Upgrade / downgrade plan</li>
                    <li>Update payment method</li>
                    <li>Cancel subscription</li>
                    <li>View invoices</li>
                  </ul>
                </>
              ),
              icon: CreditCard,
            },
          ].map((item) => (
            <div key={item.step} className="group relative bg-white rounded-2xl shadow-md hover:shadow-xl transition-shadow duration-300 border border-gray-100 overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-orange-400 to-orange-600 group-hover:w-2 transition-all duration-300" />
              <div className="p-6 pl-8">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-100 to-orange-200 text-orange-700 flex items-center justify-center font-black text-xl shadow-sm">
                    {item.step}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <item.icon size={20} className="text-orange-500" />
                      <h3 className="text-xl font-bold text-gray-800">{item.title}</h3>
                    </div>
                    <div className="text-gray-600 leading-relaxed">
                      {item.content}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Support Section */}
        <div className="mt-16 bg-gradient-to-r from-gray-800 to-gray-900 rounded-2xl p-8 text-white shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/10 rounded-full filter blur-3xl" />
          <div className="relative flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-orange-500/20 rounded-2xl flex items-center justify-center">
                <HelpCircle size={32} className="text-orange-400" />
              </div>
              <div>
                <h2 className="text-2xl font-black">Need Help?</h2>
                <p className="text-gray-300">Our support team is here for you 24/7.</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <a
                href="mailto:support@akilicode.com"
                className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg hover:shadow-orange-500/20"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                akilicode2@gmail.com
              </a>
              <Link
                to="/parent/faq"
                className="inline-flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-xl font-bold transition-all"
              >
                <HelpCircle size={16} /> Read FAQ
              </Link>
            </div>
          </div>
        </div>

        {/* Final CTA */}
        <div className="text-center mt-12">
          <Link
            to="/parent/dashboard"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-extrabold px-8 py-4 rounded-2xl transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1"
          >
            Go to Your Dashboard <ChevronRight size={20} />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ParentGuide;