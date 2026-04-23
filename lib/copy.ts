import { Zap, Wand2, Globe, ShieldCheck, LineChart, Users } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

// ─── Features ───────────────────────────────────────────────────────────────

export interface Feature {
  icon: LucideIcon;
  title: string;
  description: string;
}

export const FEATURES: Feature[] = [
  {
    icon: Zap,
    title: 'Instant Drafts',
    description: 'Generate polished first drafts from a single sentence prompt in under 3 seconds.',
  },
  {
    icon: Wand2,
    title: 'Smart Rewrite',
    description: 'Rewrite any paragraph for tone, clarity, or length while preserving your original voice.',
  },
  {
    icon: Globe,
    title: '40+ Languages',
    description: 'Write and translate content across 40+ languages with native-level fluency.',
  },
  {
    icon: ShieldCheck,
    title: 'Plagiarism Safe',
    description: 'Every output is 100% original and passes major plagiarism detection tools.',
  },
  {
    icon: LineChart,
    title: 'SEO Optimizer',
    description: "Built-in keyword analysis boosts your content's search ranking automatically.",
  },
  {
    icon: Users,
    title: 'Team Collaboration',
    description: 'Share documents, leave comments, and co-edit in real time with your whole team.',
  },
];

// ─── Pricing ─────────────────────────────────────────────────────────────────

export interface PricingFeature {
  text: string;
  included: boolean;
}

export interface PricingTier {
  name: string;
  monthlyPrice: number;
  annualPrice: number;
  description: string;
  features: PricingFeature[];
  cta: string;
  highlighted: boolean;
  badge?: string;
}

export const PRICING_TIERS: PricingTier[] = [
  {
    name: 'Starter',
    monthlyPrice: 0,
    annualPrice: 0,
    description: 'Perfect for writers just getting started with AI.',
    features: [
      { text: '5,000 words / month', included: true },
      { text: '1 user', included: true },
      { text: '3 languages', included: true },
      { text: 'Email support', included: true },
      { text: 'All 40+ languages', included: false },
      { text: 'SEO tools', included: false },
      { text: 'API access', included: false },
      { text: 'Priority support', included: false },
    ],
    cta: 'Get Started',
    highlighted: false,
  },
  {
    name: 'Pro',
    monthlyPrice: 19,
    annualPrice: 15,
    description: 'For professional writers who need more power.',
    features: [
      { text: '100,000 words / month', included: true },
      { text: '1 user', included: true },
      { text: 'All 40+ languages', included: true },
      { text: 'Priority support', included: true },
      { text: 'SEO tools', included: true },
      { text: 'API access', included: true },
      { text: 'Team collaboration', included: false },
      { text: 'SSO / Custom templates', included: false },
    ],
    cta: 'Start Free Trial',
    highlighted: true,
    badge: 'Most Popular',
  },
  {
    name: 'Team',
    monthlyPrice: 49,
    annualPrice: 39,
    description: 'Scale content production across your entire team.',
    features: [
      { text: 'Unlimited words', included: true },
      { text: '10 users', included: true },
      { text: 'All features included', included: true },
      { text: 'Dedicated support', included: true },
      { text: 'SSO', included: true },
      { text: 'Custom templates', included: true },
      { text: 'API access', included: true },
      { text: 'Priority support', included: true },
    ],
    cta: 'Contact Sales',
    highlighted: false,
  },
];

// ─── Testimonials ─────────────────────────────────────────────────────────────

export interface Testimonial {
  name: string;
  role: string;
  company: string;
  stars: number;
  quote: string;
}

export const TESTIMONIALS: Testimonial[] = [
  {
    name: 'Sarah K.',
    role: 'Content Lead',
    company: 'TechCorp',
    stars: 5,
    quote: "Quill cut my content production time in half. I can't imagine working without it.",
  },
  {
    name: 'Marcus R.',
    role: 'Freelance Writer',
    company: '',
    stars: 5,
    quote: 'The rewrite feature alone is worth the subscription. Absolutely game-changing.',
  },
  {
    name: 'Priya M.',
    role: 'Marketing Director',
    company: 'StartupXYZ',
    stars: 5,
    quote: 'Our blog traffic increased 40% in 3 months after switching to Quill for SEO content.',
  },
  {
    name: 'James T.',
    role: 'Indie Blogger',
    company: '',
    stars: 4,
    quote: 'Clean UI, fast results, and the multilingual support is surprisingly accurate.',
  },
  {
    name: 'Aisha L.',
    role: 'Copywriter',
    company: 'AgencyBlue',
    stars: 5,
    quote: 'I recommend Quill to every client who needs to scale content. Zero regrets.',
  },
  {
    name: 'David C.',
    role: 'Product Manager',
    company: 'BuildCo',
    stars: 5,
    quote: 'The Team plan pays for itself in hours saved every single week.',
  },
];

// ─── FAQ ─────────────────────────────────────────────────────────────────────

export interface FaqItem {
  question: string;
  answer: string;
}

export const FAQ_ITEMS: FaqItem[] = [
  {
    question: 'What is Quill?',
    answer:
      'Quill is an AI writing assistant that helps you draft, rewrite, and polish content in seconds — from blog posts to emails to ad copy.',
  },
  {
    question: 'How does the free plan work?',
    answer:
      'The Starter plan is completely free, forever. You get 5,000 words per month with no credit card required.',
  },
  {
    question: 'Can I change my plan later?',
    answer:
      'Yes. You can upgrade, downgrade, or cancel at any time from your account settings. Changes take effect on your next billing cycle.',
  },
  {
    question: 'Is my data private?',
    answer:
      'Absolutely. We do not train our models on your content. All data is encrypted at rest and in transit.',
  },
  {
    question: 'What languages does Quill support?',
    answer:
      'Quill supports 40+ languages including English, Spanish, French, German, Mandarin, Japanese, Arabic, and more.',
  },
  {
    question: 'Does Quill offer an API?',
    answer:
      'Yes. Pro and Team plans include full API access with comprehensive documentation and SDKs for JavaScript and Python.',
  },
  {
    question: 'What payment methods do you accept?',
    answer:
      'We accept all major credit cards (Visa, Mastercard, Amex), PayPal, and bank transfers for annual Team plans.',
  },
  {
    question: 'Can I get a refund?',
    answer:
      'We offer a 14-day money-back guarantee on all paid plans. No questions asked.',
  },
];
