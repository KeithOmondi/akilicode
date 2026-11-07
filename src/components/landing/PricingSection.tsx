import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Check } from "lucide-react";
import { pricingService } from "../../components/service/pricingService";
import type { PublicPricingPlan } from "../../interfaces/pricing.interface";
import { SectionHead } from "./Sections";

/**
 * Prices come straight from the admin panel (Prices & Coupons), so this page can never disagree with
 * what a parent is charged. If no plan has been published yet, it says so honestly instead of showing a made-up price.
 */
const CYCLE: Record<string, string> = { monthly: "per month", termly: "per term", "once-off": "one-time" };

const PricingSection = () => {
  const [plans, setPlans] = useState<PublicPricingPlan[] | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let alive = true;
    pricingService
      .getPublicPlans()
      .then((d) => alive && setPlans([...d.plans].sort((a, b) => a.price - b.price)))
      .catch(() => alive && setFailed(true));
    return () => {
      alive = false;
    };
  }, []);

  return (
    <section id="pricing" aria-labelledby="pricing-title" className="bg-canvas py-16 sm:py-24 scroll-mt-16">
      <div className="ds-page">
        <SectionHead id="pricing-title" label="Pricing" title="Simple prices in Kenya shillings" lead="Start free. Choose a plan when you are ready." />

        {plans === null && !failed ? (
          <div className="grid md:grid-cols-3 gap-6" role="status" aria-label="Loading prices">
            {[0, 1, 2].map((i) => <div key={i} className="h-72 rounded-3xl bg-brand-100/60 animate-pulse" />)}
          </div>
        ) : failed || !plans || plans.length === 0 ? (
          <div className="max-w-xl mx-auto text-center rounded-3xl bg-white border border-ink-200 p-10">
            <p className="text-xl font-extrabold text-ink-900">{failed ? "We could not load the prices just now." : "Plans are coming soon."}</p>
            <p className="mt-2 text-ink-700">You can create your free account today and see the prices inside.</p>
            <Link to="/register" className="ds-btn ds-btn-primary mt-6">Start free</Link>
          </div>
        ) : (
          <ul className={`grid gap-6 ${plans.length >= 3 ? "md:grid-cols-3" : "md:grid-cols-2 max-w-3xl mx-auto"}`}>
            {plans.map((p) => (
              <li key={p.id} className={`relative rounded-3xl bg-white p-7 flex flex-col ${p.badge ? "border-2 border-brand-600 shadow-xl" : "border border-ink-200 shadow-sm"}`}>
                {p.badge && <span className="absolute -top-3.5 left-7 rounded-full bg-brand-600 text-white text-xs font-extrabold uppercase tracking-wider px-3 py-1">{p.badge}</span>}
                <h3 className="text-xl font-extrabold text-ink-900">{p.name}</h3>
                <p className="mt-4 flex items-end gap-2">
                  <span className="text-4xl font-extrabold text-ink-900">KES {Number(p.price).toLocaleString()}</span>
                  <span className="pb-1 text-ink-500 font-semibold">{CYCLE[p.billing_cycle] ?? ""}</span>
                </p>
                {p.original_price && <p className="text-sm text-ink-500 line-through">KES {Number(p.original_price).toLocaleString()}</p>}
                {p.duration_months > 1 && (
                  <p className="mt-1 text-sm font-semibold text-emerald-700">about KES {Math.round(Number(p.price) / p.duration_months).toLocaleString()} a month</p>
                )}
                <ul className="mt-5 space-y-2 flex-1">
                  {(p.features ?? []).map((f) => (
                    <li key={f} className="flex gap-2 text-ink-700 text-[15px]"><Check size={18} className="mt-0.5 shrink-0 text-emerald-600" aria-hidden="true" />{f}</li>
                  ))}
                </ul>
                <Link to="/register" className={`ds-btn mt-7 w-full ${p.badge ? "ds-btn-primary" : "ds-btn-secondary"}`}>Start free</Link>
              </li>
            ))}
          </ul>
        )}
        <p className="mt-8 text-center text-sm text-ink-500">Pay with M-Pesa. You will always see the amount before you approve.</p>
      </div>
    </section>
  );
};

export default PricingSection;
