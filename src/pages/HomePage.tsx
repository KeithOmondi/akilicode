import FAQ from "../components/Layout/FAQ"
import Footer from "../components/Layout/Footer"
import Header from "../components/Layout/Header"
import Hero from "../components/Layout/Hero"
import HowItWorks from "../components/Layout/HowItWorks"
import Pricing from "../components/Layout/Pricing"
import Testimonials from "../components/Layout/Testimonials"
import WhatWeOffer from "../components/Layout/WhatWeOffer"
import WhyAkiliCode from "../components/Layout/WhyAkiliCode"


const HomePage = () => {
  return (
    <div>
        <Header />
        <Hero />
        <WhatWeOffer />
        <HowItWorks />
        <WhyAkiliCode />
        <Pricing />
        <Testimonials />
        <FAQ />
        <Footer />
    </div>
  )
}

export default HomePage