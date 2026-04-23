'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { FEATURES } from '@/lib/copy';

export default function FeaturesGrid() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section
      id="features"
      className="py-24 px-6 bg-[#0E0D0B]"
      aria-labelledby="features-heading"
    >
      <div className="max-w-6xl mx-auto">
        {/* Section header */}
        <div className="text-center mb-16">
          <span className="inline-block text-xs font-semibold uppercase tracking-widest text-indigo-400 mb-4">
            Features
          </span>
          <h2
            id="features-heading"
            className="font-bold text-white tracking-tight mb-4"
            style={{
              fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
              letterSpacing: '-0.02em',
            }}
          >
            Everything you need to write at scale
          </h2>
          <p
            className="text-white/60 max-w-xl mx-auto text-lg leading-relaxed font-editorial"
            style={{ fontFamily: "'Newsreader', 'Georgia', serif" }}
          >
            Quill combines cutting-edge AI with the tools professional writers need to produce great content, fast.
          </p>
        </div>

        {/* Grid */}
        <div
          ref={ref}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {FEATURES.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 24 }}
                animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
                transition={{
                  duration: 0.5,
                  delay: index * 0.08,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className="group rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-6 hover:bg-white/[0.08] hover:border-white/20 transition-all duration-200"
              >
                {/* Icon */}
                <div
                  className="w-10 h-10 rounded-lg bg-indigo-500/20 flex items-center justify-center mb-4 group-hover:bg-indigo-500/30 transition-colors duration-200"
                  aria-hidden="true"
                >
                  <Icon className="w-5 h-5 text-indigo-400" aria-hidden="true" />
                </div>

                {/* Title */}
                <h3 className="text-lg font-semibold text-white mb-2 tracking-tight">
                  {feature.title}
                </h3>

                {/* Description */}
                <p className="text-sm text-white/60 leading-relaxed font-editorial"
                  style={{ fontFamily: "'Newsreader', 'Georgia', serif" }}>
                  {feature.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
