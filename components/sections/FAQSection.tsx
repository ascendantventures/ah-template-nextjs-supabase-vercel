'use client';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { FAQ_ITEMS } from '@/lib/copy';

export default function FAQSection() {
  return (
    <section
      id="faq"
      className="py-24 px-6 bg-[#0E0D0B]"
      aria-labelledby="faq-heading"
    >
      <div className="max-w-3xl mx-auto">
        {/* Section header */}
        <div className="text-center mb-12">
          <span className="inline-block text-xs font-semibold uppercase tracking-widest text-indigo-400 mb-4">
            Support
          </span>
          <h2
            id="faq-heading"
            className="font-bold text-white tracking-tight"
            style={{
              fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
              letterSpacing: '-0.02em',
            }}
          >
            Frequently Asked Questions
          </h2>
        </div>

        {/* Accordion */}
        <Accordion
          type="single"
          collapsible
          defaultValue="item-1"
          className="w-full"
        >
          {FAQ_ITEMS.map((item, i) => (
            <AccordionItem key={i} value={`item-${i + 1}`}>
              <AccordionTrigger className="text-base text-left pr-4">
                {item.question}
              </AccordionTrigger>
              <AccordionContent>
                {item.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
