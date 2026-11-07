import { useEffect } from "react";
import Header from "../components/Layout/Header";
import Footer from "../components/Layout/Footer";
import Hero from "../components/landing/Hero";
import { HowItWorks, Ages, Safety, FinalCta } from "../components/landing/Sections";
import PricingSection from "../components/landing/PricingSection";
import { Testimonials, Faq } from "../components/landing/TestimonialsFaq";

/** The public front page. Order = the questions a parent asks, in the order they ask them. */
const HomePage = () => {
  useEffect(() => {
    document.title = "AkiliCode | Coding adventures for children aged 4 to 18";
  }, []);

  return (
    <>
      <a href="#main" className="skip-link">Skip to main content</a>
      <Header />
      <main id="main">
        <Hero />
        <HowItWorks />
        <Ages />
        <Safety />
        <PricingSection />
        <Testimonials />
        <Faq />
        <FinalCta />
      </main>
      <Footer />
    </>
  );
};

export default HomePage;
