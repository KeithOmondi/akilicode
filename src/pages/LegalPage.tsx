import { useState, useEffect } from "react";
import { Shield, FileText, Mail, Phone, MapPin, CheckCircle } from "lucide-react";

const LegalPage = () => {
  const [activeTab, setActiveTab] = useState<"terms" | "privacy">("terms");
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const topPad = scrolled ? "pt-[72px]" : "pt-[112px]";

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-orange-50">

      {/* Hero Section */}
      <div
        className={`relative overflow-hidden bg-white pb-10 transition-[padding-top] duration-300 ${topPad}`}
      >
        {/* Decorative blobs */}
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-orange-500/20 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 -left-16 w-72 h-72 rounded-full bg-purple-500/20 blur-2xl pointer-events-none" />

        <div className="relative max-w-4xl mx-auto px-4 pt-10 text-center">
          <div className="flex justify-center mb-4">
            {activeTab === "terms" ? (
              <FileText size={48} className="text-purple-700" />
            ) : (
              <Shield size={48} className="text-purple-700" />
            )}
          </div>
          <h1 className="text-4xl md:text-5xl font-serif font-black text-purple-900 mb-4">
            {activeTab === "terms" ? "Terms of Service" : "Privacy Policy"}
          </h1>
          <p className="text-lg font-serif text-purple-700">
            Last updated:{" "}
            {new Date().toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="max-w-4xl mx-auto px-4 -mt-6">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-purple-100">
          <div className="flex font-serif border-b border-purple-100">
            <button
              onClick={() => setActiveTab("terms")}
              className={`flex-1 px-6 py-4 text-center font-bold transition-all ${
                activeTab === "terms"
                  ? "text-purple-600 border-b-2 border-purple-600 bg-purple-50/50"
                  : "text-gray-500 hover:text-purple-600"
              }`}
            >
              <FileText size={18} className="inline mr-2" />
              <div className="font-serif">Terms of Service</div>
            </button>
            <button
              onClick={() => setActiveTab("privacy")}
              className={`flex-1 px-6 py-4 text-center font-bold transition-all ${
                activeTab === "privacy"
                  ? "text-purple-600 border-b-2 border-purple-600 bg-purple-50/50"
                  : "text-gray-500 hover:text-purple-600"
              }`}
            >
              <Shield size={18} className="inline mr-2" />
              <div className="font-serif">Privacy Policy</div>
            </button>
          </div>

          <div className="p-6 md:p-8">
            {activeTab === "terms" ? <TermsContent /> : <PrivacyContent />}
          </div>
        </div>
      </div>

      {/* Contact Footer */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white rounded-2xl p-6 shadow-md border border-purple-100 text-center">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Have Questions?</h3>
          <p className="text-gray-600 mb-4">
            If you have any questions about our terms or privacy practices, please contact us.
          </p>
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            <a href="mailto:legal@akilicode.com" className="flex items-center gap-2 text-purple-600 hover:text-purple-700">
              <Mail size={16} />
              legal@akilicode.com
            </a>
            <a href="tel:+254705806889" className="flex items-center gap-2 text-purple-600 hover:text-purple-700">
              <Phone size={16} />
              +254 705 806 889
            </a>
            <span className="flex items-center gap-2 text-gray-500">
              <MapPin size={16} />
              Nairobi, Kenya
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Terms of Service Content
const TermsContent = () => {
  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-xl font-bold font-serif text-gray-800 mb-3">1. Acceptance of Terms</h2>
        <p className="text-gray-600 leading-relaxed">
          By accessing or using AkiliCode's website, mobile application, or services ("Services"),
          you agree to be bound by these Terms of Service ("Terms"). If you disagree with any part
          of these Terms, you may not access our Services.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-bold font-serif text-gray-800 mb-3">2. Description of Services</h2>
        <p className="text-gray-600 leading-relaxed">
          AkiliCode provides online coding courses, interactive lessons, coding challenges, and
          educational content for children ages 6-12 ("Services"). We offer free trial periods
          and paid subscription plans for continued access.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-bold font-serif text-gray-800 mb-3">3. Account Registration</h2>
        <p className="text-gray-600 leading-relaxed">
          To use our Services, parents/guardians must create an account and provide accurate,
          complete, and current information. You are responsible for maintaining the confidentiality
          of your account credentials and for all activities that occur under your account.
        </p>
        <ul className="list-disc list-inside text-gray-600 leading-relaxed mt-2 space-y-1">
          <li>You must be at least 18 years old to create a parent account</li>
          <li>Children will have separate kid accounts with unique usernames and PINs</li>
          <li>You are responsible for all activity under your account</li>
          <li>Notify us immediately of any unauthorized use of your account</li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-bold font-serif text-gray-800 mb-3">4. Payments and Subscriptions</h2>
        <p className="text-gray-600 leading-relaxed">
          Our Services are offered on a subscription basis with monthly, termly, or annual payment options.
        </p>
        <ul className="list-disc list-inside text-gray-600 leading-relaxed mt-2 space-y-1">
          <li><strong>Pricing:</strong> Monthly subscription is KES 4,000 per student</li>
          <li><strong>Free Trial:</strong> 3-5 day free trial available for new students</li>
          <li><strong>Billing:</strong> Payments are processed securely via M-Pesa</li>
          <li><strong>Cancellation:</strong> You may cancel anytime from your parent dashboard</li>
          <li><strong>Refunds:</strong> 30-day money-back guarantee if you're not satisfied</li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-bold font-serif text-gray-800 mb-3">5. Kid Safety and COPPA Compliance</h2>
        <p className="text-gray-600 leading-relaxed">
          AkiliCode is committed to protecting children's privacy and complies with the Children's
          Online Privacy Protection Act (COPPA). We do not collect personal information from children
          without parental consent.
        </p>
        <div className="bg-green-50 rounded-xl p-4 mt-3 border border-green-100">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle size={18} className="text-green-600" />
            <h4 className="font-semibold text-green-800">Our Safety Commitment:</h4>
          </div>
          <ul className="space-y-1 text-sm text-green-700">
            <li>✓ No personal information collected without parental consent</li>
            <li>✓ No chat rooms or direct messaging between children</li>
            <li>✓ No third-party advertising</li>
            <li>✓ All content is child-appropriate and reviewed</li>
          </ul>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-bold font-serif text-gray-800 mb-3">6. User Conduct</h2>
        <p className="text-gray-600 leading-relaxed">
          You agree to use our Services only for lawful purposes and in accordance with these Terms.
        </p>
        <p className="text-gray-600 leading-relaxed mt-2">You agree NOT to:</p>
        <ul className="list-disc list-inside text-gray-600 leading-relaxed mt-2 space-y-1">
          <li>Share account credentials with unauthorized users</li>
          <li>Attempt to bypass any security features</li>
          <li>Reproduce, duplicate, or resell any part of our Services</li>
          <li>Use the Services to transmit harmful code or malware</li>
          <li>Harass, bully, or intimidate other users</li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-bold font-serif text-gray-800 mb-3">7. Intellectual Property</h2>
        <p className="text-gray-600 leading-relaxed">
          All content, features, and functionality of our Services, including but not limited to
          text, graphics, logos, images, and software, are owned by AkiliCode and are protected
          by copyright, trademark, and other intellectual property laws.
        </p>
        <p className="text-gray-600 leading-relaxed mt-2">
          Students retain ownership of the code they write and projects they create using our platform.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-bold font-serif text-gray-800 mb-3">8. Termination</h2>
        <p className="text-gray-600 leading-relaxed">
          We may terminate or suspend your account immediately, without prior notice, for conduct
          that violates these Terms or is harmful to other users. Upon termination, your right to
          use the Services will cease immediately.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-bold font-serif text-gray-800 mb-3">9. Limitation of Liability</h2>
        <p className="text-gray-600 leading-relaxed">
          To the fullest extent permitted by law, AkiliCode shall not be liable for any indirect,
          incidental, special, consequential, or punitive damages arising from your use of our Services.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-bold text-gray-800 mb-3">10. Changes to Terms</h2>
        <p className="text-gray-600 leading-relaxed">
          We reserve the right to modify these Terms at any time. We will notify you of any changes
          by posting the new Terms on this page and updating the "Last updated" date.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-bold font-serif text-gray-800 mb-3">11. Governing Law</h2>
        <p className="text-gray-600 leading-relaxed">
          These Terms shall be governed by and construed in accordance with the laws of Kenya,
          without regard to its conflict of law provisions.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-bold text-gray-800 mb-3">12. Contact Us</h2>
        <p className="text-gray-600 leading-relaxed">
          If you have any questions about these Terms, please contact us at:
        </p>
        <div className="mt-2 text-gray-600">
          <p>Email: legal@akilicode.com</p>
          <p>Phone: +254 705 806 889</p>
          <p>Address: Nairobi, Kenya</p>
        </div>
      </section>
    </div>
  );
};

// Privacy Policy Content
const PrivacyContent = () => {
  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-xl font-bold font-serif text-gray-800 mb-3">1. Introduction</h2>
        <p className="text-gray-600 leading-relaxed">
          AkiliCode ("we," "our," or "us") is committed to protecting the privacy of children and
          their families. This Privacy Policy explains how we collect, use, disclose, and safeguard
          your information when you use our website, mobile application, and services.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-bold font-serif text-gray-800 mb-3">2. Information We Collect</h2>

        <h3 className="text-lg font-semibold text-gray-700 mt-4 mb-2">Parent Information:</h3>
        <ul className="list-disc list-inside text-gray-600 leading-relaxed space-y-1">
          <li>Name and email address</li>
          <li>Phone number (for M-Pesa payments)</li>
          <li>Billing information</li>
          <li>Account credentials (hashed password)</li>
        </ul>

        <h3 className="text-lg font-semibold text-gray-700 mt-4 mb-2">Child Information:</h3>
        <ul className="list-disc list-inside text-gray-600 leading-relaxed space-y-1">
          <li>Child's name (first name only, or nickname)</li>
          <li>Age or grade level (to personalize learning)</li>
          <li>Username and PIN (for kid login - stored securely)</li>
          <li>Learning progress, completed lessons, and achievements</li>
          <li>Code submissions and project work</li>
        </ul>

        <h3 className="text-lg font-semibold text-gray-700 mt-4 mb-2">Usage Data:</h3>
        <ul className="list-disc list-inside text-gray-600 leading-relaxed space-y-1">
          <li>Course enrollment and completion data</li>
          <li>Lesson progress and quiz scores</li>
          <li>Time spent on activities</li>
          <li>Device information (browser type, OS)</li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-bold font-serif text-gray-800 mb-3">3. How We Use Information</h2>
        <p className="text-gray-600 leading-relaxed">We use collected information to:</p>
        <ul className="list-disc list-inside text-gray-600 leading-relaxed mt-2 space-y-1">
          <li>Provide, maintain, and improve our Services</li>
          <li>Process payments and manage subscriptions</li>
          <li>Track learning progress and generate reports</li>
          <li>Communicate with parents about account activity</li>
          <li>Respond to support requests</li>
          <li>Detect and prevent fraud or security issues</li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-bold font-serif text-gray-800 mb-3">4. COPPA Compliance</h2>
        <p className="text-gray-600 leading-relaxed">
          We comply with the Children's Online Privacy Protection Act (COPPA). We do not collect
          personal information from children under 13 without verifiable parental consent.
        </p>
        <div className="bg-purple-50 rounded-xl p-4 mt-3 border border-purple-100">
          <h4 className="font-semibold text-purple-800 mb-2">Parental Rights:</h4>
          <ul className="space-y-1 text-sm text-purple-700">
            <li>✓ Review your child's personal information</li>
            <li>✓ Request deletion of your child's information</li>
            <li>✓ Refuse further collection of information</li>
            <li>✓ Terminate your child's account anytime</li>
          </ul>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-bold font-serif text-gray-800 mb-3">5. Data Sharing and Disclosure</h2>
        <p className="text-gray-600 leading-relaxed">
          We do not sell, trade, or rent your personal information to third parties. We may share
          information only in the following circumstances:
        </p>
        <ul className="list-disc list-inside text-gray-600 leading-relaxed mt-2 space-y-1">
          <li><strong>Service Providers:</strong> With third parties who help us operate our Services (payment processing, hosting)</li>
          <li><strong>Legal Requirements:</strong> When required by law or to protect our rights</li>
          <li><strong>Business Transfers:</strong> In connection with a merger or acquisition</li>
          <li><strong>With Parental Consent:</strong> Any other sharing with explicit parent permission</li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-bold font-serif text-gray-800 mb-3">6. Data Security</h2>
        <p className="text-gray-600 leading-relaxed">
          We implement appropriate technical and organizational measures to protect your information:
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <CheckCircle size={16} className="text-green-500" />
            Encryption of sensitive data
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <CheckCircle size={16} className="text-green-500" />
            Secure payment processing
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <CheckCircle size={16} className="text-green-500" />
            Regular security audits
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <CheckCircle size={16} className="text-green-500" />
            Access controls and authentication
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-bold font-serif text-gray-800 mb-3">7. Data Retention</h2>
        <p className="text-gray-600 leading-relaxed">
          We retain personal information for as long as your account is active or as needed to
          provide Services. You may request deletion of your account and associated data at any time.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-bold text-gray-800 mb-3">8. Your Rights</h2>
        <p className="text-gray-600 leading-relaxed">Depending on your location, you may have the right to:</p>
        <ul className="list-disc list-inside text-gray-600 leading-relaxed mt-2 space-y-1">
          <li>Access the personal information we hold about you</li>
          <li>Request correction of inaccurate information</li>
          <li>Request deletion of your information</li>
          <li>Opt-out of marketing communications</li>
          <li>Data portability</li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-bold font-serif text-gray-800 mb-3">9. Cookies and Tracking</h2>
        <p className="text-gray-600 leading-relaxed">
          We use cookies and similar tracking technologies to improve user experience, analyze
          usage, and remember preferences. You can control cookie settings through your browser.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-bold font-serif text-gray-800 mb-3">10. Third-Party Links</h2>
        <p className="text-gray-600 leading-relaxed">
          Our Services may contain links to third-party websites. We are not responsible for the
          privacy practices of these sites. We encourage you to review their privacy policies.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-bold text-gray-800 mb-3">11. Changes to This Privacy Policy</h2>
        <p className="text-gray-600 leading-relaxed">
          We may update this Privacy Policy periodically. We will notify parents of any material
          changes by email or through our website before changes become effective.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-bold font-serif text-gray-800 mb-3">12. Contact Information</h2>
        <p className="text-gray-600 leading-relaxed">
          If you have questions about this Privacy Policy or our privacy practices, please contact:
        </p>
        <div className="mt-3 p-4 bg-gray-50 rounded-xl">
          <p className="font-semibold text-gray-800">AkiliCode Privacy Team</p>
          <p className="text-gray-600">Email: privacy@akilicode.com</p>
          <p className="text-gray-600">Phone: +254 705 806 889</p>
          <p className="text-gray-600">Address: Nairobi, Kenya</p>
        </div>
      </section>
    </div>
  );
};

export default LegalPage;