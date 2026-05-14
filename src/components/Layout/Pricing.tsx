import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  CheckCircle, Zap, Gift, Heart, Shield, Clock,
  MessageCircle, Sparkles, X, User, Tag, Loader2,
  ChevronDown, AlertCircle, BadgeCheck,
} from "lucide-react";
import toast from "react-hot-toast";
import type { AppDispatch, RootState } from "../../store/store";
import { getMyKids } from "../../store/slices/kidSlice";
import { enrollKid } from "../../store/slices/enrollmentSlice";
import { initiateStkPush } from "../../store/slices/paymentSlice";
import api from "../../api/api";
import type { PublicPricingPlan } from "../../interfaces/pricing.interface";
import {
  clearCouponResult, fetchPublicPlans,
  setSelectedPlan, validateCoupon,
} from "../../store/slices/pricingSlice";

// ── Checkout Modal ────────────────────────────────────────────────────────────
interface CheckoutModalProps {
  plan:      PublicPricingPlan;
  onClose:   () => void;
  trialDays: number;
}

const CheckoutModal = ({ plan, onClose }: CheckoutModalProps) => {
  const dispatch = useDispatch<AppDispatch>();
  const { kids }                        = useSelector((s: RootState) => s.kid);
  const { user }                        = useSelector((s: RootState) => s.auth);
  const { couponResult, couponLoading } = useSelector((s: RootState) => s.pricing);

  const [selectedKidId, setSelectedKidId] = useState("");
  const [phone,         setPhone]         = useState(user?.phone ?? "");
  const [couponCode,    setCouponCode]     = useState("");
  const [step,          setStep]          = useState<"details" | "polling">("details");
  const [enrollmentId,  setEnrollmentId]  = useState<string | null>(null);
  const [pollCount,     setPollCount]     = useState(0);

  const finalPrice   = couponResult?.valid ? (couponResult.final_price ?? plan.price) : plan.price;
  const billingCycle = plan.duration_months === 1 ? "monthly" : "termly";

  // ── Poll for payment confirmation ─────────────────────────────────────────
  useEffect(() => {
    if (step !== "polling" || !enrollmentId) return;

    const interval = setInterval(async () => {
      setPollCount((c) => c + 1);
      try {
        const res = await api.get(`/mpesa/status/${enrollmentId}`);
        const { payment_status, enrollment_status } = res.data.data;

        if (payment_status === "completed" && enrollment_status === "active") {
          clearInterval(interval);
          toast.success("🎉 Payment confirmed! Enrollment is now active.");
          onClose();
        } else if (payment_status === "failed") {
          clearInterval(interval);
          toast.error("Payment failed or was cancelled.");
          setStep("details");
        }
      } catch {
        clearInterval(interval);
        setStep("details");
      }
    }, 4000);

    const timeout = setTimeout(() => {
      clearInterval(interval);
      if (step === "polling") {
        toast("Payment not confirmed yet — it will activate automatically.", { icon: "⏳" });
        onClose();
      }
    }, 60000);

    return () => { clearInterval(interval); clearTimeout(timeout); };
  }, [step, enrollmentId, onClose]);

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleApplyCoupon = () => {
    if (!couponCode.trim()) return;
    dispatch(validateCoupon({
      code:          couponCode,
      billing_cycle: billingCycle,
      plan_id:       plan.id,
    }));
  };

  const handlePay = async () => {
    if (!selectedKidId) {
      toast.error("Please select a student");
      return;
    }
    if (!phone || !/^254\d{9}$/.test(phone)) {
      toast.error("Enter a valid M-Pesa number (254...)");
      return;
    }

    try {
      // 1. Create enrollment
      const enrollment = await dispatch(enrollKid({
        kid_id:        selectedKidId,
        course_name:   plan.name,
        fee_amount:    finalPrice,
        billing_cycle: billingCycle,
      })).unwrap();

      setEnrollmentId(enrollment.id);

      // 2. Initiate STK push
      await dispatch(initiateStkPush({
        enrollment_id: enrollment.id,
        phone,
        amount:        finalPrice,
      })).unwrap();

      // 3. Increment coupon uses if applied
      if (couponResult?.valid && couponResult.coupon) {
        await api.post(`/pricing/coupons/${couponResult.coupon.id}/use`).catch(() => {});
      }

      toast.success("M-Pesa prompt sent! Complete payment on your phone.");
      setStep("polling");

    } catch (err: unknown) {
      const msg = err && typeof err === "object" && "message" in err
        ? (err as { message: string }).message
        : "Something went wrong";
      toast.error(msg);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-t-[28px] sm:rounded-[28px] shadow-2xl w-full max-w-md border border-slate-100 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200">

        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-purple-700 to-purple-800 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-black text-white">{plan.name}</h2>
            <p className="text-xs text-purple-200 mt-0.5">
              KES {finalPrice.toLocaleString()} · {billingCycle}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="px-6 py-6 space-y-5 max-h-[70vh] overflow-y-auto">
          {step === "polling" ? (

            // ── Polling state ────────────────────────────────────────────────
            <div className="text-center py-8 space-y-4">
              <Loader2 size={48} className="mx-auto text-purple-600 animate-spin" />
              <div>
                <p className="font-bold text-purple-900">Waiting for M-Pesa confirmation...</p>
                <p className="text-sm text-gray-500 mt-1">Complete the payment prompt on your phone.</p>
                <p className="text-xs text-gray-400 mt-3">Checking... ({pollCount * 4}s elapsed)</p>
              </div>
              <button
                onClick={() => setStep("details")}
                className="text-xs text-purple-600 underline"
              >
                Go back
              </button>
            </div>

          ) : (
            <>
              {/* ── Kid Picker ── */}
              <div>
                <label className="block text-[11px] font-black text-purple-900 uppercase tracking-wider mb-1.5">
                  Select Student
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-3 text-purple-300" size={16} />
                  <ChevronDown className="absolute right-3 top-3 text-purple-300 pointer-events-none" size={16} />
                  <select
                    value={selectedKidId}
                    onChange={(e) => setSelectedKidId(e.target.value)}
                    className="w-full bg-purple-50/50 border-2 border-transparent rounded-xl pl-10 pr-10 py-3 focus:bg-white focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 outline-none appearance-none text-sm font-medium text-gray-800"
                  >
                    <option value="">Choose a student...</option>
                    {kids.map((k) => (
                      <option key={k.id} value={k.id}>{k.name}</option>
                    ))}
                  </select>
                </div>
                {kids.length === 0 && (
                  <p className="text-xs text-amber-600 mt-1.5 flex items-center gap-1">
                    <AlertCircle size={12} />
                    No students found.
                    <a href="/parent/kids" className="underline font-semibold">Add a student first.</a>
                  </p>
                )}
              </div>

              {/* ── Plan Summary ── */}
              <div className="bg-purple-50 rounded-2xl p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Plan</span>
                  <span className="font-bold text-purple-900">{plan.name}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Billing</span>
                  <span className="font-semibold text-gray-700 capitalize">{billingCycle}</span>
                </div>
                {plan.original_price && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Original price</span>
                    <span className="text-gray-400 line-through">
                      KES {plan.original_price.toLocaleString()}
                    </span>
                  </div>
                )}
                {couponResult?.valid && couponResult.discount_amount && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Coupon discount</span>
                    <span className="font-bold">− KES {couponResult.discount_amount.toLocaleString()}</span>
                  </div>
                )}
                <div className="border-t border-purple-100 pt-2 flex justify-between">
                  <span className="font-black text-purple-900">Total</span>
                  <span className="font-black text-purple-900 text-lg">
                    KES {finalPrice.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* ── Coupon Code ── */}
              <div>
                <label className="block text-[11px] font-black text-purple-900 uppercase tracking-wider mb-1.5">
                  Coupon Code{" "}
                  <span className="text-gray-400 font-normal normal-case">(optional)</span>
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Tag className="absolute left-3 top-3 text-purple-300" size={16} />
                    <input
                      type="text"
                      placeholder="e.g. AKILI10"
                      value={couponCode}
                      onChange={(e) => {
                        setCouponCode(e.target.value.toUpperCase());
                        dispatch(clearCouponResult());
                      }}
                      className="w-full bg-purple-50/50 border-2 border-transparent rounded-xl pl-10 pr-4 py-3 focus:bg-white focus:border-orange-500 outline-none text-sm font-medium text-gray-800 uppercase placeholder:normal-case placeholder:text-gray-400"
                    />
                  </div>
                  <button
                    onClick={handleApplyCoupon}
                    disabled={couponLoading || !couponCode.trim()}
                    className="px-4 py-3 bg-purple-100 text-purple-700 font-bold rounded-xl hover:bg-purple-200 transition disabled:opacity-50 text-sm"
                  >
                    {couponLoading
                      ? <Loader2 size={16} className="animate-spin" />
                      : "Apply"
                    }
                  </button>
                </div>

                {couponResult && (
                  <div className={`mt-2 flex items-center gap-2 text-xs font-semibold px-3 py-2 rounded-lg
                    ${couponResult.valid ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"}`}
                  >
                    {couponResult.valid
                      ? <BadgeCheck size={14} />
                      : <AlertCircle size={14} />
                    }
                    {couponResult.message}
                  </div>
                )}
              </div>

              {/* ── M-Pesa Number ── */}
              <div>
                <label className="block text-[11px] font-black text-purple-900 uppercase tracking-wider mb-1.5">
                  M-Pesa Number
                </label>
                <div className="bg-orange-50 p-4 rounded-2xl border border-orange-100">
                  <input
                    type="tel"
                    placeholder="2547XXXXXXXX"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-white border-2 border-orange-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-orange-500 transition-all font-medium"
                  />
                  <p className="text-[10px] text-orange-600/70 mt-2 italic">
                    A payment prompt will be sent to this number.
                  </p>
                </div>
              </div>

              {/* ── Pay Button ── */}
              <button
                onClick={handlePay}
                disabled={!selectedKidId || !phone}
                className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-black py-4 rounded-2xl shadow-xl shadow-orange-200 transition-all flex items-center justify-center gap-2 text-sm"
              >
                <Zap size={16} />
                Pay KES {finalPrice.toLocaleString()} via M-Pesa
              </button>

              <p className="text-center text-xs text-gray-400">
                By proceeding you agree to our terms. Cancel anytime.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// ── Main Pricing Component ────────────────────────────────────────────────────
const Pricing = () => {
  const dispatch = useDispatch<AppDispatch>();

  const { plans, trialDays, hasTrial, loading } = useSelector((s: RootState) => s.pricing);
  const { isAuthenticated }                     = useSelector((s: RootState) => s.auth);
  const { selectedPlan }                        = useSelector((s: RootState) => s.pricing);

  const [showCheckout, setShowCheckout] = useState(false);

  useEffect(() => {
    dispatch(fetchPublicPlans());
    if (isAuthenticated) dispatch(getMyKids());
  }, [dispatch, isAuthenticated]);

  const handleSelectPlan = (plan: PublicPricingPlan) => {
    if (!isAuthenticated) {
      toast("Please log in or register first to enroll.", { icon: "🔒" });
      window.location.href = "/register";
      return;
    }
    dispatch(setSelectedPlan(plan));
    setShowCheckout(true);
  };

  const handleStartTrial = () => {
    if (!isAuthenticated) {
      window.location.href = "/register";
      return;
    }
    window.location.href = "/parent/enrollments";
  };

  const monthlyPlan = plans.find(
    (p) => p.billing_cycle === "monthly" && p.duration_months === 1
  );
  const otherPlans = plans.filter(
    (p) => !(p.billing_cycle === "monthly" && p.duration_months === 1)
  );

  const whatKidsGet = [
    { emoji: "🎮", text: "Fun coding games"  },
    { emoji: "🤖", text: "Robot challenges"  },
    { emoji: "🎨", text: "Creative projects" },
    { emoji: "🏅", text: "Cool badges"       },
    { emoji: "📜", text: "Certificate"       },
    { emoji: "🎁", text: "Surprise rewards"  },
  ];

  return (
    <section id="pricing" className="py-20 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-white via-purple-50/30 to-white -z-10" />
      <div className="absolute top-20 left-10 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse -z-10" />
      <div className="absolute bottom-20 right-10 w-72 h-72 bg-orange-300 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse -z-10" />
      <div className="absolute top-1/4 left-5 text-3xl animate-bounce">💰</div>
      <div className="absolute bottom-1/4 right-5 text-3xl animate-bounce" style={{ animationDelay: "1s" }}>🎁</div>

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
          {hasTrial && (
            <div className="mt-3 inline-flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-full text-sm font-semibold border border-green-200">
              <Sparkles size={14} />
              {trialDays}-day free trial available — no card needed
            </div>
          )}
        </div>

        {/* Loading */}
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 size={36} className="animate-spin text-purple-500" />
          </div>
        ) : (
          <>
            {/* Monthly Plan Card */}
            {monthlyPlan && (
              <div className="max-w-md mx-auto mb-16">
                <div className="relative group">
                  <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-orange-500 rounded-2xl blur opacity-25 group-hover:opacity-75 transition duration-300" />
                  <div className="relative bg-white rounded-2xl shadow-xl overflow-hidden">
                    <div className="absolute top-0 right-0">
                      <div className="bg-gradient-to-r from-orange-500 to-pink-500 text-white px-6 py-1 rounded-bl-2xl text-sm font-bold">
                        {monthlyPlan.badge ?? "MOST POPULAR"}
                      </div>
                    </div>
                    <div className="p-8">
                      <div className="text-center mb-6">
                        <div className="text-5xl mb-3">🚀</div>
                        <h3 className="text-2xl font-black text-gray-800 mb-2">{monthlyPlan.name}</h3>
                        <p className="text-gray-500">Perfect for beginners</p>
                      </div>
                      <div className="text-center mb-6">
                        <div className="text-5xl font-black text-purple-700">
                          KES {monthlyPlan.price.toLocaleString()}
                        </div>
                        <div className="text-gray-500 mt-2">per month</div>
                        <div className="text-sm text-green-600 mt-2 flex items-center justify-center gap-1">
                          <Clock size={14} />
                          <span>Billed monthly · Cancel anytime</span>
                        </div>
                      </div>
                      <div className="flex flex-col gap-3 mb-6">
                        <button
                          onClick={() => handleSelectPlan(monthlyPlan)}
                          className="w-full py-3 px-6 bg-gradient-to-r from-purple-600 to-orange-500 text-white font-black rounded-full hover:scale-105 transition-all shadow-lg flex items-center justify-center gap-2"
                        >
                          Choose Plan <Zap size={16} />
                        </button>
                        {hasTrial && (
                          <button
                            onClick={handleStartTrial}
                            className="w-full py-3 px-6 border-2 border-purple-200 text-purple-700 font-bold rounded-full hover:bg-purple-50 transition-all flex items-center justify-center gap-2"
                          >
                            <Sparkles size={16} />
                            Start {trialDays}-Day Free Trial
                          </button>
                        )}
                      </div>
                      <div className="space-y-3">
                        {monthlyPlan.features.map((feature, idx) => (
                          <div key={idx} className="flex items-center gap-3">
                            <CheckCircle size={18} className="text-green-500 flex-shrink-0" />
                            <span className="text-sm text-gray-700">{feature}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* What Kids Get */}
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

            {/* Other Plans */}
            {otherPlans.length > 0 && (
              <div className="mb-16">
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">
                    Save More with Longer Plans 💰
                  </h3>
                  <p className="text-gray-600">Perfect for committed young coders!</p>
                </div>
                <div className="grid md:grid-cols-3 gap-6">
                  {otherPlans.map((plan) => (
                    <div
                      key={plan.id}
                      className={`relative bg-white rounded-2xl p-6 shadow-md border-2 transition-all hover:-translate-y-2 hover:shadow-xl
                        ${plan.badge === "Best Value"
                          ? "border-orange-400 shadow-lg"
                          : "border-purple-100"
                        }`}
                    >
                      {plan.badge && (
                        <div className={`absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-xs font-bold text-white
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
                          {plan.duration_months === 3  && "📅"}
                          {plan.duration_months === 6  && "🎯"}
                          {plan.duration_months === 12 && "🌟"}
                        </div>
                        <h4 className="text-xl font-bold text-gray-800">{plan.name}</h4>
                        {plan.savings_percent && (
                          <div className="text-sm text-green-600 font-semibold mt-1">
                            Save {plan.savings_percent}%!
                          </div>
                        )}
                      </div>
                      <div className="text-center mb-4">
                        <div className="text-2xl font-black text-purple-700">
                          KES {plan.price.toLocaleString()}
                        </div>
                        {plan.original_price && (
                          <div className="text-sm text-gray-400 line-through">
                            KES {plan.original_price.toLocaleString()}
                          </div>
                        )}
                        <div className="text-xs text-gray-500 mt-1">
                          Just KES {Math.round(plan.price / plan.duration_months).toLocaleString()}/month
                        </div>
                      </div>
                      <button
                        onClick={() => handleSelectPlan(plan)}
                        className="w-full py-2 px-4 bg-purple-100 text-purple-700 font-bold rounded-full hover:bg-purple-200 transition-all"
                      >
                        Choose Plan
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Special Offer Banner */}
            <div className="bg-gradient-to-r from-purple-600 to-orange-500 rounded-2xl p-6 mb-16 overflow-hidden relative">
              <div className="absolute top-0 right-0 text-8xl opacity-10">🎉</div>
              <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="text-4xl">🎁</div>
                  <div>
                    <h4 className="text-white font-bold text-lg">Special Offer!</h4>
                    <p className="text-purple-100 text-sm">
                      Use code{" "}
                      <span className="font-black text-white bg-white/20 px-2 py-0.5 rounded-lg">
                        AKILI10
                      </span>{" "}
                      for 10% off your first month
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => monthlyPlan && handleSelectPlan(monthlyPlan)}
                  className="px-6 py-2 bg-white text-purple-700 font-bold rounded-full hover:scale-105 transition-all whitespace-nowrap"
                >
                  Claim Offer →
                </button>
              </div>
            </div>

            {/* Trust Indicators */}
            <div className="text-center">
              <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-6">
                <div className="flex items-center gap-2">
                  <Heart size={18} className="text-red-500 fill-red-500" />
                  <span className="text-sm text-gray-600">Love it or get a refund</span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield size={18} className="text-green-500" />
                  <span className="text-sm text-gray-600">Secure M-Pesa payments</span>
                </div>
                <div className="flex items-center gap-2">
                  <MessageCircle size={18} className="text-blue-500" />
                  <span className="text-sm text-gray-600">24/7 parent support</span>
                </div>
              </div>
              <p className="text-sm text-gray-500">
                Have questions? Check our{" "}
                <a href="#faq" className="text-purple-600 font-semibold hover:underline">FAQ</a>
                {" "}or contact our team 💬
              </p>
            </div>
          </>
        )}
      </div>

      {/* Checkout Modal */}
      {showCheckout && selectedPlan && (
        <CheckoutModal
          plan={selectedPlan}
          trialDays={trialDays}
          onClose={() => {
            setShowCheckout(false);
            dispatch(setSelectedPlan(null));
            dispatch(clearCouponResult());
          }}
        />
      )}
    </section>
  );
};

export default Pricing;