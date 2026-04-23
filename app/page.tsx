import type { Metadata } from 'next';
import NavBar from '@/components/layout/NavBar';
import Footer from '@/components/layout/Footer';
import HeroSection from '@/components/sections/HeroSection';
import FeaturesGrid from '@/components/sections/FeaturesGrid';
import PricingSection from '@/components/sections/PricingSection';
import TestimonialsSection from '@/components/sections/TestimonialsSection';
import FAQSection from '@/components/sections/FAQSection';
import CTASection from '@/components/sections/CTASection';

// AC-009.1: metadata export in page.tsx (RSC — no 'use client')
export const metadata: Metadata = {
  title: 'Quill — AI Writing Assistant | Write Smarter, Publish Faster',
  description:
    'Quill is an AI-powered writing assistant that helps you draft, rewrite, and polish content in seconds. Join 12,000+ writers. Start free — no credit card required.',
};

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#0E0D0B] text-[#F2EDE4]">
      <NavBar />
      <main id="main-content">
        <HeroSection />
        <FeaturesGrid />
        <PricingSection />
        <TestimonialsSection />
        <FAQSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}
