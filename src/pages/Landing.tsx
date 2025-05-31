
import { Header } from '@/components/landing/Header';
import { Hero } from '@/components/landing/Hero';
import { Services } from '@/components/landing/Services';
import { CTA } from '@/components/landing/CTA';
import { Testimonials } from '@/components/landing/Testimonials';
import { FAQ } from '@/components/landing/FAQ';
import { Sponsors } from '@/components/landing/Sponsors';
import { Footer } from '@/components/landing/Footer';

export default function Landing() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <Hero />
      <Services />
      <CTA />
      <Testimonials />
      <FAQ />
      <Sponsors />
      <Footer />
    </div>
  );
}
