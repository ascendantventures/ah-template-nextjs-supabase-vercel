'use client';

import Image from 'next/image';
import { Coins } from 'lucide-react';
import { useState } from 'react';

interface Props {
  src: string | null | undefined;
  alt: string;
  size?: number;
}

export function CoinIcon({ src, alt, size = 32 }: Props) {
  const [error, setError] = useState(false);

  if (!src || error) {
    return (
      <span
        style={{
          width: size,
          height: size,
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#1e293b',
          borderRadius: '50%',
          flexShrink: 0,
        }}
        aria-label={alt}
      >
        <Coins size={size * 0.55} color="#94a3b8" />
      </span>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={size}
      height={size}
      style={{ borderRadius: '50%', objectFit: 'contain', flexShrink: 0 }}
      onError={() => setError(true)}
      unoptimized
    />
  );
}
