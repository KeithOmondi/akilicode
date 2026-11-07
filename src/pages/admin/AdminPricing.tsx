import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Loader2, Plus, Save, Tag, Ticket, BookOpen, Trash2 } from "lucide-react";
import api from "../../api/api";
import type { IPricingPlan, ICoupon, BillingCycle, DiscountType } from "../../interfaces/pricing.interface";

/**
 * Admin: set prices without touching code.
 *   1. Course prices        — what a parent is charged for one course (monthly / once-off)
 *   2. Plans                — the packages shown on the pricing page (monthly, 3-month, annual …)
 *   3. Coupons              — discount codes
 * All amounts are in Kenya shillings (KES). The server rejects anything that is not a real price.
 */
interface Course { id: string; title: string; price: string | number; is_active: boolean }

const errMsg = (e: unknown) => (e as { response?: { data?: { message?: string } } }).response?.data?.message ?? "Something went wrong";
const input = "border-2 border-brand-100 rounded-xl px-3 py-2 outline-none focus:border-orange-400 bg-white w-full";
const btnPrimary = "bg-brand-700 hover:bg-brand-700 text-white font-bold px-4 py-2 rounded-xl text-sm flex items-center gap-2 disabled:opacity-50";
const card = "bg-white rounded-2xl border border-brand-100 p-5 mb-8 shadow-sm";
const h2 = "text-lg font-black text-ink-900 flex items-center gap-2 mb-1";

const blankPlan = { name: "", billing_cycle: "monthly" as BillingCycle, price: "", original_price: "", duration_months: "1", badge: "", features: "", is_active: true, sort_order: "0" };
const blankCoupon = { code: "", description: "", discount_type: "percentage" as DiscountType, discount_value: "", applies_to: "first_month", max_uses: "", valid_until: "", is_active: true };

const AdminPricing = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [plans, setPlans] = useState<IPricingPlan[]>([]);
  const [coupons, setCoupons] = useState<ICoupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [edits, setEdits] = useState<Record<string, string>>({});
  const [planForm, setPlanForm] = useState(blankPlan);
  const [couponForm, setCouponForm] = useState(blankCoupon);

  const load = useCallback(async () => {
    try {
      const [c, p, k] = await Promise.all([
        api.get("/courses"),
        api.get("/pricing/admin/plans"),
        api.get("/pricing/admin/coupons"),
      ]);
      setCourses(c.data.data.courses);
      setPlans(p.data.data.plans);
      setCoupons(k.data.data.coupons);
    } catch (e) {
      toast.error(errMsg(e));
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    let alive = true;
    Promise.all([api.get("/courses"), api.get("/pricing/admin/plans"), api.get("/pricing/admin/coupons")])
      .then(([c, p, k]) => {
        if (!alive) return;
        setCourses(c.data.data.courses);
        setPlans(p.data.data.plans);
        setCoupons(k.data.data.coupons);
      })
      .catch((e) => toast.error(errMsg(e)))
      .finally(() => alive && setLoading(false));
    return () => { alive = false; };
  }, []);

  const act = async (key: string, fn: () => Promise<void>, ok: string) => {
    setBusy(key);
    try { await fn(); toast.success(ok); await load(); } catch (e) { toast.error(errMsg(e)); } finally { setBusy(null); }
  };

  const saveCoursePrice = (c: Course) =>
    act(`course-${c.id}`, async () => {
      await api.patch(`/courses/${c.id}`, { price: Number(edits[`course-${c.id}`]) });
      setEdits((e) => { const n = { ...e }; delete n[`course-${c.id}`]; return n; });
    }, "Course price saved");

  const savePlanPrice = (p: IPricingPlan) =>
    act(`plan-${p.id}`, async () => {
      await api.put(`/pricing/admin/plans/${p.id}`, { price: Number(edits[`plan-${p.id}`]) });
      setEdits((e) => { const n = { ...e }; delete n[`plan-${p.id}`]; return n; });
    }, "Plan price saved");

  const addPlan = (e: React.FormEvent) => {
    e.preventDefault();
    return act("new-plan", async () => {
      await api.post("/pricing/admin/plans", {
        name: planForm.name,
        billing_cycle: planForm.billing_cycle,
        price: Number(planForm.price),
        ...(planForm.original_price ? { original_price: Number(planForm.original_price) } : {}),
        duration_months: Number(planForm.duration_months),
        ...(planForm.badge ? { badge: planForm.badge } : {}),
        features: planForm.features.split("\n").map((f) => f.trim()).filter(Boolean),
        is_active: planForm.is_active,
        sort_order: Number(planForm.sort_order),
      });
      setPlanForm(blankPlan);
    }, "Plan added");
  };

  const addCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    return act("new-coupon", async () => {
      await api.post("/pricing/admin/coupons", {
        code: couponForm.code,
        ...(couponForm.description ? { description: couponForm.description } : {}),
        discount_type: couponForm.discount_type,
        discount_value: Number(couponForm.discount_value),
        applies_to: couponForm.applies_to,
        ...(couponForm.max_uses ? { max_uses: Number(couponForm.max_uses) } : {}),
        ...(couponForm.valid_until ? { valid_until: couponForm.valid_until } : {}),
        is_active: couponForm.is_active,
      });
      setCouponForm(blankCoupon);
    }, "Coupon added");
  };

  if (loading) return <div className="flex justify-center py-20" role="status"><Loader2 className="animate-spin text-brand-600" size={32} /></div>;

  const PriceCell = ({ k, current, onSave }: { k: string; current: string | number; onSave: () => void }) => (
    <div className="flex items-center gap-2">
      <span className="text-ink-500 text-sm">KES</span>
      <input
        aria-label="Price in KES" type="number" min={0} className={`${input} w-32`}
        value={edits[k] ?? String(Number(current))}
        onChange={(e) => setEdits((s) => ({ ...s, [k]: e.target.value }))}
      />
      {edits[k] !== undefined && Number(edits[k]) !== Number(current) && (
        <button className={btnPrimary} disabled={busy === k} onClick={onSave}>
          {busy === k ? <Loader2 className="animate-spin" size={14} /> : <Save size={14} />} Save
        </button>
      )}
    </div>
  );

  return (
    <div>
      <h1 className="text-3xl font-black  text-ink-900 mb-1">Prices &amp; <span className="text-brand-600">Coupons</span></h1>
      <p className="text-ink-500 mb-8">Change what families pay. New prices apply to new payments straight away. Amounts are in KES.</p>

      {/* ── Courses ── */}
      <section className={card} aria-labelledby="pc-courses">
        <h2 id="pc-courses" className={h2}><BookOpen size={20} /> Course prices</h2>
        <p className="text-sm text-ink-500 mb-4">What a parent pays for one course per month (or once, for once-off courses).</p>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead><tr className="text-xs uppercase tracking-wider text-ink-500"><th className="py-2">Course</th><th>Price</th></tr></thead>
            <tbody className="divide-y divide-brand-50">
              {courses.map((c) => (
                <tr key={c.id}>
                  <td className="py-3 font-bold text-ink-900 pr-4">{c.title}{!c.is_active && <span className="ml-2 text-xs text-ink-500">(hidden)</span>}</td>
                  <td><PriceCell k={`course-${c.id}`} current={c.price} onSave={() => saveCoursePrice(c)} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ── Plans ── */}
      <section className={card} aria-labelledby="pc-plans">
        <h2 id="pc-plans" className={h2}><Tag size={20} /> Plans</h2>
        <p className="text-sm text-ink-500 mb-4">The packages shown on the pricing page.</p>
        <div className="overflow-x-auto mb-6">
          <table className="w-full text-left">
            <thead><tr className="text-xs uppercase tracking-wider text-ink-500"><th className="py-2">Plan</th><th>Billing</th><th>Price</th><th>Shown</th><th /></tr></thead>
            <tbody className="divide-y divide-brand-50">
              {plans.map((p) => (
                <tr key={p.id}>
                  <td className="py-3 font-bold text-ink-900 pr-4">{p.name}{p.badge && <span className="ml-2 text-xs bg-orange-100 text-orange-700 rounded-full px-2 py-0.5">{p.badge}</span>}</td>
                  <td className="pr-4 text-ink-700">{p.billing_cycle} · {p.duration_months} mo</td>
                  <td className="pr-4"><PriceCell k={`plan-${p.id}`} current={p.price} onSave={() => savePlanPrice(p)} /></td>
                  <td>
                    <label className="flex items-center gap-2 text-sm">
                      <input type="checkbox" className="h-4 w-4" checked={p.is_active} onChange={(e) => act(`vis-${p.id}`, () => api.put(`/pricing/admin/plans/${p.id}`, { is_active: e.target.checked }).then(() => undefined), "Saved")} />
                      {p.is_active ? "Yes" : "Hidden"}
                    </label>
                  </td>
                  <td className="text-right">
                    <button aria-label={`Delete plan ${p.name}`} className="text-red-500 hover:bg-red-50 p-2 rounded-lg"
                      onClick={() => window.confirm(`Delete the plan "${p.name}"?`) && act(`del-${p.id}`, () => api.delete(`/pricing/admin/plans/${p.id}`).then(() => undefined), "Plan deleted")}>
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <form onSubmit={addPlan} className="grid grid-cols-1 md:grid-cols-4 gap-3 border-t border-brand-50 pt-4">
          <h3 className="md:col-span-4 font-black text-ink-900 text-sm uppercase tracking-wider">Add a plan</h3>
          <label className="text-sm font-bold">Name<input required className={input} value={planForm.name} onChange={(e) => setPlanForm({ ...planForm, name: e.target.value })} /></label>
          <label className="text-sm font-bold">Billing
            <select className={input} value={planForm.billing_cycle} onChange={(e) => setPlanForm({ ...planForm, billing_cycle: e.target.value as BillingCycle })}>
              <option value="monthly">monthly</option><option value="termly">termly</option><option value="once-off">once-off</option>
            </select></label>
          <label className="text-sm font-bold">Price (KES)<input required type="number" min={1} className={input} value={planForm.price} onChange={(e) => setPlanForm({ ...planForm, price: e.target.value })} /></label>
          <label className="text-sm font-bold">Months<input required type="number" min={0} max={36} className={input} value={planForm.duration_months} onChange={(e) => setPlanForm({ ...planForm, duration_months: e.target.value })} /></label>
          <label className="text-sm font-bold">Old price (crossed out)<input type="number" min={1} className={input} value={planForm.original_price} onChange={(e) => setPlanForm({ ...planForm, original_price: e.target.value })} /></label>
          <label className="text-sm font-bold">Badge (e.g. Popular)<input maxLength={50} className={input} value={planForm.badge} onChange={(e) => setPlanForm({ ...planForm, badge: e.target.value })} /></label>
          <label className="text-sm font-bold md:col-span-2">What is included (one per line)<textarea rows={3} className={input} value={planForm.features} onChange={(e) => setPlanForm({ ...planForm, features: e.target.value })} /></label>
          <div className="md:col-span-4"><button className={btnPrimary} disabled={busy === "new-plan"}><Plus size={14} /> Add plan</button></div>
        </form>
      </section>

      {/* ── Coupons ── */}
      <section className={card} aria-labelledby="pc-coupons">
        <h2 id="pc-coupons" className={h2}><Ticket size={20} /> Coupons</h2>
        <div className="overflow-x-auto mb-6">
          <table className="w-full text-left">
            <thead><tr className="text-xs uppercase tracking-wider text-ink-500"><th className="py-2">Code</th><th>Discount</th><th>Used</th><th>Active</th><th /></tr></thead>
            <tbody className="divide-y divide-brand-50">
              {coupons.length === 0 && <tr><td colSpan={5} className="py-4 text-ink-500 text-sm">No coupons yet.</td></tr>}
              {coupons.map((c) => (
                <tr key={c.id}>
                  <td className="py-3 font-mono font-bold text-ink-900">{c.code}</td>
                  <td className="pr-4 text-ink-700">{c.discount_type === "percentage" ? `${Number(c.discount_value)}%` : `KES ${Number(c.discount_value)}`} · {c.applies_to.replace("_", " ")}</td>
                  <td className="pr-4 text-ink-700">{c.uses_count}{c.max_uses ? ` / ${c.max_uses}` : ""}</td>
                  <td><label className="flex items-center gap-2 text-sm"><input type="checkbox" className="h-4 w-4" checked={c.is_active}
                    onChange={() => act(`tg-${c.id}`, () => api.post(`/pricing/admin/coupons/${c.id}/toggle`).then(() => undefined), "Saved")} />{c.is_active ? "On" : "Off"}</label></td>
                  <td className="text-right"><button aria-label={`Delete coupon ${c.code}`} className="text-red-500 hover:bg-red-50 p-2 rounded-lg"
                    onClick={() => window.confirm(`Delete coupon ${c.code}?`) && act(`dc-${c.id}`, () => api.delete(`/pricing/admin/coupons/${c.id}`).then(() => undefined), "Coupon deleted")}><Trash2 size={16} /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <form onSubmit={addCoupon} className="grid grid-cols-1 md:grid-cols-4 gap-3 border-t border-brand-50 pt-4">
          <h3 className="md:col-span-4 font-black text-ink-900 text-sm uppercase tracking-wider">Add a coupon</h3>
          <label className="text-sm font-bold">Code<input required minLength={3} maxLength={50} pattern="[A-Za-z0-9_\-]+" className={`${input} uppercase`} value={couponForm.code} onChange={(e) => setCouponForm({ ...couponForm, code: e.target.value.toUpperCase() })} /></label>
          <label className="text-sm font-bold">Type
            <select className={input} value={couponForm.discount_type} onChange={(e) => setCouponForm({ ...couponForm, discount_type: e.target.value as DiscountType })}>
              <option value="percentage">percentage off</option><option value="fixed">fixed KES off</option>
            </select></label>
          <label className="text-sm font-bold">{couponForm.discount_type === "percentage" ? "Percent (1–100)" : "Amount (KES)"}
            <input required type="number" min={1} max={couponForm.discount_type === "percentage" ? 100 : undefined} className={input} value={couponForm.discount_value} onChange={(e) => setCouponForm({ ...couponForm, discount_value: e.target.value })} /></label>
          <label className="text-sm font-bold">Applies to
            <select className={input} value={couponForm.applies_to} onChange={(e) => setCouponForm({ ...couponForm, applies_to: e.target.value })}>
              <option value="first_month">first month</option><option value="all_months">all months</option><option value="once">once</option>
            </select></label>
          <label className="text-sm font-bold">Max uses (optional)<input type="number" min={1} className={input} value={couponForm.max_uses} onChange={(e) => setCouponForm({ ...couponForm, max_uses: e.target.value })} /></label>
          <label className="text-sm font-bold">Valid until (optional)<input type="date" className={input} value={couponForm.valid_until} onChange={(e) => setCouponForm({ ...couponForm, valid_until: e.target.value })} /></label>
          <label className="text-sm font-bold md:col-span-2">Note (optional)<input maxLength={300} className={input} value={couponForm.description} onChange={(e) => setCouponForm({ ...couponForm, description: e.target.value })} /></label>
          <div className="md:col-span-4"><button className={btnPrimary} disabled={busy === "new-coupon"}><Plus size={14} /> Add coupon</button></div>
        </form>
      </section>
    </div>
  );
};

export default AdminPricing;
