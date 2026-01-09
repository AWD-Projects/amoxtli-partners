'use client';

import { useRef } from 'react';
import { cn } from '@/lib/utils';

interface OtpInputProps {
  value: string;
  onChange: (value: string) => void;
  length?: number;
  autoFocus?: boolean;
  className?: string;
}

export function OtpInput({
  value,
  onChange,
  length = 6,
  autoFocus,
  className,
}: OtpInputProps) {
  const inputs = useRef<Array<HTMLInputElement | null>>([]);

  const writeDigits = (startIndex: number, digits: string) => {
    const sanitized = digits.replace(/\D/g, '');
    const chars = value.split('');

    while (chars.length < length) {
      chars.push('');
    }

    let lastIndex = startIndex;

    if (!sanitized) {
      chars[startIndex] = '';
    } else {
      for (let i = 0; i < sanitized.length && startIndex + i < length; i++) {
        chars[startIndex + i] = sanitized[i];
        lastIndex = startIndex + i;
      }
    }

    onChange(chars.join('').slice(0, length));
    return { sanitized, lastIndex };
  };

  const handleChange = (index: number, digit: string) => {
    const { sanitized, lastIndex } = writeDigits(index, digit);

    if (sanitized && lastIndex < length - 1) {
      const nextIndex = Math.min(lastIndex + 1, length - 1);
      inputs.current[nextIndex]?.focus();
      inputs.current[nextIndex]?.select();
    }
  };

  const handlePaste = (
    index: number,
    event: React.ClipboardEvent<HTMLInputElement>
  ) => {
    event.preventDefault();
    const pasted = event.clipboardData.getData('text');
    const { sanitized, lastIndex } = writeDigits(index, pasted);

    if (sanitized && lastIndex < length) {
      const nextIndex = Math.min(lastIndex + 1, length - 1);
      inputs.current[nextIndex]?.focus();
      inputs.current[nextIndex]?.select();
    }
  };

  const handleKeyDown = (
    index: number,
    event: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (event.key === 'Backspace' && !value[index] && index > 0) {
      event.preventDefault();
      inputs.current[index - 1]?.focus();
      inputs.current[index - 1]?.select();
      writeDigits(index - 1, '');
      return;
    }

    if (event.key === 'ArrowLeft' && index > 0) {
      inputs.current[index - 1]?.focus();
      inputs.current[index - 1]?.select();
    }

    if (event.key === 'ArrowRight' && index < length - 1) {
      inputs.current[index + 1]?.focus();
      inputs.current[index + 1]?.select();
    }
  };

  return (
    <div className={cn('flex items-center justify-between gap-2', className)}>
      {Array.from({ length }).map((_, index) => (
        <input
          key={index}
          ref={(el) => {
            inputs.current[index] = el;
          }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          autoComplete="one-time-code"
          className="h-12 w-12 rounded-lg border border-surface-border bg-surface-card text-center text-lg font-semibold text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
          value={value[index] ?? ''}
          onChange={(event) => handleChange(index, event.target.value)}
          onKeyDown={(event) => handleKeyDown(index, event)}
          onPaste={(event) => handlePaste(index, event)}
          autoFocus={autoFocus && index === 0}
        />
      ))}
    </div>
  );
}
