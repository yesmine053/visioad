// app/page.tsx
import Header from '@/components/Header/Header';
import HeroSection from '@/components/Hero/HeroSection';
import AboutSection from '@/components/About/AboutSection';
import ServicesSection from '@/components/Services/ServicesSection';
import TestimonialsSection from '@/components/Testimonials/TestimonialsSection';
import PartnersSection from '@/components/Partners/PartnersSection';
import FAQSection from '@/components/FAQ/FAQSection';
import ContactSection from '@/components/Contact/ContactSection';
import Footer from '@/components/Footer/Footer';

export default function Home() {
  return (
    <>
      <Header />
      <HeroSection />
      <AboutSection />
      <ServicesSection />
      <TestimonialsSection />
      <PartnersSection />
      <FAQSection />
      <ContactSection />
      <Footer />
    </>
  );
}