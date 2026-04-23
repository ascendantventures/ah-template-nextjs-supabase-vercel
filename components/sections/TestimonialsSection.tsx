'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Star } from 'lucide-react';
import { TESTIMONIALS } from '@/lib/copy';
import { getAvatarColor, getInitials } from '@/lib/utils';

export default function TestimonialsSection() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section
      className="py-24 px-6 bg-[#0E0D0B]"
      aria-labelledby="testimonials-heading"
    >
      <div className="max-w-6xl mx-auto">
        {/* Section header */}
        <div className="text-center mb-16">
          <span className="inline-block text-xs font-semibold uppercase tracking-widest text-indigo-400 mb-4">
            Testimonials
          </span>
          <h2
            id="testimonials-heading"
            className="font-bold text-white tracking-tight"
            style={{
              fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
              letterSpacing: '-0.02em',
            }}
          >
            Trusted by{' '}
            <span className="text-gradient-amber">12,000+</span>
            {' '}writers worldwide
          </h2>
        </div>

        {/* Cards grid */}
        <div
          ref={ref}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {TESTIMONIALS.map((testimonial, index) => (
            <motion.article
              key={testimonial.name}
              initial={{ opacity: 0, y: 24 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
              transition={{
                duration: 0.5,
                delay: index * 0.08,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-6 hover:bg-white/[0.08] hover:border-white/20 transition-all duration-200"
              aria-label={`Testimonial from ${testimonial.name}`}
            >
              {/* Stars */}
              <div className="flex gap-1 mb-4" aria-label={`${testimonial.stars} out of 5 stars`}>
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${i < testimonial.stars ? 'text-amber-400' : 'text-white/20'}`}
                    fill={i < testimonial.stars ? 'currentColor' : 'none'}
                    aria-hidden="true"
                  />
                ))}
              </div>

              {/* Quote */}
              <blockquote
                className="text-white/70 text-sm leading-relaxed mb-6 font-editorial"
                style={{ fontFamily: "'Newsreader', 'Georgia', serif", fontSize: '1rem', lineHeight: '1.65' }}
              >
                &ldquo;{testimonial.quote}&rdquo;
              </blockquote>

              {/* Author */}
              <div className="flex items-center gap-3">
                {/* Avatar — initials-based colored circle */}
                <div
                  className={`w-10 h-10 rounded-full ${getAvatarColor(testimonial.name)} flex items-center justify-center text-white text-sm font-bold shrink-0`}
                  aria-hidden="true"
                >
                  {getInitials(testimonial.name)}
                </div>
                <div>
                  <div className="text-sm font-semibold text-white">
                    {testimonial.name}
                  </div>
                  <div className="text-xs text-white/50">
                    {testimonial.role}
                    {testimonial.company ? ` · ${testimonial.company}` : ''}
                  </div>
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
