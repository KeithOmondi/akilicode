import { useEffect, useState } from "react";
import { Star } from "lucide-react";
import { testimonialService } from "../service/testimonialService";
import type { Testimonial } from "../../interfaces/testimonial.interface";
import { SITE } from "../../config/site";
import { SectionHead } from "./Sections";

/**
 * Only REAL, approved parent testimonials are shown, and nothing appears at all when there are none.
 * We show the parent's first name and the child's age, never the child's name.
 */
export const Testimonials = () => {
  const [items, setItems] = useState<Testimonial[]>([]);

  useEffect(() => {
    let alive = true;
    testimonialService.getTestimonials({ limit: 3 }).then((t) => alive && setItems(t)).catch(() => undefined);
    return () => {
      alive = false;
    };
  }, []);

  if (items.length === 0) return null;

  return (
    <section aria-labelledby="love-title" className="bg-white py-16 sm:py-24">
      <div className="ds-page">
        <SectionHead id="love-title" label="Parents say" title="Hear from other families" />
        <ul className="grid md:grid-cols-3 gap-6">
          {items.map((t) => (
            <li key={t.id}>
              <figure className="h-full rounded-3xl border border-ink-200 bg-canvas p-7 flex flex-col">
                <div className="flex gap-0.5" role="img" aria-label={`${t.rating} out of 5 stars`}>
                  {[1, 2, 3, 4, 5].map((n) => <Star key={n} size={18} className={n <= t.rating ? "fill-yellow-400 text-yellow-500" : "text-ink-200"} />)}
                </div>
                <blockquote className="mt-4 text-ink-900 flex-1">“{t.content}”</blockquote>
                <figcaption className="mt-4 text-sm font-bold text-ink-700">
                  {t.parent_name?.split(" ")[0]}{t.child_age ? `, parent of a ${t.child_age}-year-old` : ""}
                </figcaption>
              </figure>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};

const QA: { q: string; a: string }[] = [
  { q: "Who is AkiliCode for?", a: "Children aged 4 to 18. Parents create the account, and children use a nickname, so we never need their full name." },
  { q: "Does my child need to know any coding?", a: "No. We suggest a starting point for their age, and the youngest children start with pictures and simple puzzles." },
  { q: "Is it free to start?", a: "Yes. Creating your account costs nothing, and you can look around before you choose a plan." },
  { q: "How do I pay?", a: "With M-Pesa. Enter your number, approve the prompt on your phone, and you are done. You see the amount first." },
  { q: "Is it safe for my child?", a: "There are no ads and children cannot chat with anyone. You set the daily screen time, and you can download or delete everything about your child at any time." },
  { q: "What do we need?", a: "A phone, tablet or computer with a web browser and an internet connection. There is nothing to install." },
];

export const Faq = () => (
  <section id="faq" aria-labelledby="faq-title" className="bg-brand-50/60 py-16 sm:py-24 scroll-mt-16">
    <div className="ds-page max-w-3xl">
      <SectionHead id="faq-title" label="Questions" title="Good questions, simple answers" />
      <div className="space-y-3">
        {QA.map((item) => (
          <details key={item.q} className="group rounded-2xl bg-white border border-brand-100 px-6 py-4 open:shadow-sm">
            <summary className="cursor-pointer list-none flex items-center justify-between gap-4 font-extrabold text-ink-900 text-lg">
              {item.q}
              <span aria-hidden="true" className="text-brand-600 text-2xl leading-none transition-transform group-open:rotate-45">+</span>
            </summary>
            <p className="mt-3 text-ink-700">{item.a}</p>
          </details>
        ))}
      </div>
      <p className="mt-8 text-center text-ink-700">
        Still wondering? <a className="font-bold text-brand-700 underline" href={SITE.whatsappHref}>Message us on WhatsApp</a>.
      </p>
    </div>
  </section>
);
