'use client';

import * as React from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { Input, type InputProps } from '@/components/ui/input';
import { cn } from '@/lib/utils';

type PasswordInputProps = InputProps & {
  containerClassName?: string;
};

export const PasswordInput = React.forwardRef<
  HTMLInputElement,
  PasswordInputProps
>(({ className, containerClassName, ...props }, ref) => {
  const [visible, setVisible] = React.useState(false);

    return (
      <div className={cn('relative', containerClassName)}>
        <Input
          {...props}
          type={visible ? 'text' : 'password'}
          className={cn('pr-12', className)}
          ref={ref}
        />
        <button
          type="button"
          aria-label={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
          onClick={() => setVisible((prev) => !prev)}
          className="absolute inset-y-0 right-3 flex items-center text-text-secondary transition hover:text-text-primary focus-visible:outline-none"
        >
          {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
    );
  }
);

PasswordInput.displayName = 'PasswordInput';
