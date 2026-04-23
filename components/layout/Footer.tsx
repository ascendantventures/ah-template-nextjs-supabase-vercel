import { Feather, Twitter, Github, Linkedin } from 'lucide-react';

export default function Footer() {
  const footerLinks = {
    Product: [
      { label: 'Features', href: '#features' },
      { label: 'Pricing', href: '#pricing' },
      { label: 'FAQ', href: '#faq' },
      { label: 'Changelog', href: '#' },
    ],
    Company: [
      { label: 'About', href: '#' },
      { label: 'Blog', href: '#' },
      { label: 'Careers', href: '#' },
      { label: 'Contact', href: '#' },
    ],
    Legal: [
      { label: 'Privacy Policy', href: '#' },
      { label: 'Terms of Service', href: '#' },
      { label: 'Cookie Policy', href: '#' },
    ],
  };

  return (
    <footer
      className="border-t border-white/10 bg-[#0E0D0B]"
      role="contentinfo"
    >
      <div className="max-w-6xl mx-auto px-6 py-16">
        {/* Top row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div className="md:col-span-1">
            <a
              href="/"
              className="flex items-center gap-2 text-white hover:opacity-80 transition-opacity duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50 rounded-sm w-fit"
              aria-label="Quill home"
            >
              <Feather className="w-5 h-5 text-indigo-400" aria-hidden="true" />
              <span className="text-lg font-bold tracking-tight">Quill</span>
            </a>
            <p className="mt-3 text-sm text-white/50 leading-relaxed font-editorial">
              Write smarter. Publish faster. AI-powered writing for everyone.
            </p>
            {/* Social links */}
            <div className="flex gap-3 mt-5">
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 text-white/40 hover:text-white rounded-lg hover:bg-white/5 transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50 min-h-[44px] min-w-[44px] flex items-center justify-center"
                aria-label="Quill on Twitter"
              >
                <Twitter className="w-4 h-4" aria-hidden="true" />
              </a>
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 text-white/40 hover:text-white rounded-lg hover:bg-white/5 transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50 min-h-[44px] min-w-[44px] flex items-center justify-center"
                aria-label="Quill on GitHub"
              >
                <Github className="w-4 h-4" aria-hidden="true" />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 text-white/40 hover:text-white rounded-lg hover:bg-white/5 transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50 min-h-[44px] min-w-[44px] flex items-center justify-center"
                aria-label="Quill on LinkedIn"
              >
                <Linkedin className="w-4 h-4" aria-hidden="true" />
              </a>
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h3 className="text-xs font-semibold uppercase tracking-widest text-white/40 mb-4">
                {category}
              </h3>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-sm text-white/60 hover:text-white transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50 rounded-sm"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom row */}
        <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-white/40">
            &copy; 2026 Quill. All rights reserved.
          </p>
          <p className="text-sm text-white/30">
            Built with care for writers everywhere.
          </p>
        </div>
      </div>
    </footer>
  );
}
