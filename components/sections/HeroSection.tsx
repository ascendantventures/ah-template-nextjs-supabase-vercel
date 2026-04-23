'use client';

import { PlayCircle } from 'lucide-react';

export default function HeroSection() {
  return (
    <section
      className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#0E0D0B]"
      aria-label="Hero section"
    >
      {/* Animated gradient mesh background */}
      <div className="gradient-mesh" aria-hidden="true" />

      {/* Bottom fade to page background */}
      <div
        className="absolute bottom-0 left-0 right-0 h-40 pointer-events-none"
        style={{
          background: 'linear-gradient(to bottom, transparent, #0E0D0B)',
        }}
        aria-hidden="true"
      />

      {/* Content */}
      <div className="relative z-10 text-center max-w-4xl mx-auto px-6 py-24">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 mb-8 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 text-sm font-medium">
          <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" aria-hidden="true" />
          Now in Public Beta
        </div>

        {/* Headline */}
        <h1
          className="font-bold text-white tracking-tight leading-[1.08] mb-6"
          style={{
            fontSize: 'clamp(2.5rem, 5vw, 4.5rem)',
            letterSpacing: '-0.03em',
          }}
        >
          Write Smarter.
          <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-violet-400 to-cyan-400">
            Publish Faster.
          </span>
        </h1>

        {/* Sub-headline */}
        <p
          className="text-lg md:text-xl text-white/60 mb-10 max-w-2xl mx-auto leading-relaxed font-editorial"
          style={{ fontFamily: "'Newsreader', 'Georgia', serif" }}
        >
          Quill turns a single sentence into polished, publish-ready content in seconds.
          Draft blog posts, emails, ad copy, and more — powered by advanced AI.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-center mb-8">
          <a
            href="#signup"
            className="inline-flex items-center justify-center px-8 py-4 text-base font-semibold text-white bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 rounded-xl transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0E0D0B] min-h-[52px] min-w-[200px] shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40"
            style={{ scrollBehavior: 'smooth' }}
          >
            Start for Free
          </a>
          <button
            type="button"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-semibold text-white/80 hover:text-white border border-white/20 hover:border-white/40 rounded-xl transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0E0D0B] min-h-[52px] bg-white/5 hover:bg-white/10"
            onClick={() => {
              /* Phase 2: Watch Demo */
            }}
            aria-label="Watch product demo (coming soon)"
          >
            <PlayCircle className="w-5 h-5" aria-hidden="true" />
            Watch Demo
          </button>
        </div>

        {/* Social proof */}
        <p className="text-sm text-white/40">
          Join 12,000+ writers &nbsp;·&nbsp; No credit card required
        </p>
      </div>
    </section>
  );
}
