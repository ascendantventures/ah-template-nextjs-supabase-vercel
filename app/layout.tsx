import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Quill — AI Writing Assistant | Write Smarter, Publish Faster',
  description:
    'Quill is an AI-powered writing assistant that helps you draft, rewrite, and polish content in seconds. Join 12,000+ writers. Start free — no credit card required.',
  keywords: ['AI writing assistant', 'content writing', 'AI copywriter', 'writing tool', 'Quill'],
  openGraph: {
    title: 'Quill — AI Writing Assistant',
    description: 'Write smarter. Publish faster. Join 12,000+ writers using Quill.',
    type: 'website',
    url: process.env.NEXT_PUBLIC_APP_URL ?? 'https://quill.ai',
    images: [
      {
        url: `${process.env.NEXT_PUBLIC_APP_URL ?? 'https://quill.ai'}/og-image.png`,
        width: 1200,
        height: 630,
        alt: 'Quill — AI Writing Assistant',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Quill — AI Writing Assistant',
    description: 'Write smarter. Publish faster. Join 12,000+ writers using Quill.',
    images: [`${process.env.NEXT_PUBLIC_APP_URL ?? 'https://quill.ai'}/og-image.png`],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,200..800;1,200..800&family=Newsreader:ital,opsz,wght@0,6..72,200..800;1,6..72,200..800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased bg-[#0E0D0B] text-[#F2EDE4]">
        {children}
      </body>
    </html>
  );
}
