import Image from 'next/image';
import { cn } from '@/lib/utils';
import wordmark from '@/assets/wordmark.svg';
import icon from '@/assets/icon.svg';

type BrandLogoVariant = 'wordmark' | 'icon';

interface BrandLogoProps {
  variant?: BrandLogoVariant;
  className?: string;
  priority?: boolean;
  sizes?: string;
  ariaHidden?: boolean;
}

const BRAND_LABEL = 'Amoxtli Partners';

export function BrandLogo({
  variant = 'wordmark',
  className,
  priority,
  sizes = '100vw',
  ariaHidden,
}: BrandLogoProps) {
  const asset = variant === 'icon' ? icon : wordmark;
  const alt =
    variant === 'icon' ? `${BRAND_LABEL} icon` : `${BRAND_LABEL} wordmark`;

  return (
    <Image
      src={asset}
      alt={alt}
      priority={priority}
      sizes={sizes}
      className={cn('h-auto w-auto', className)}
      aria-hidden={ariaHidden}
    />
  );
}
