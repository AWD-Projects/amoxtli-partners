'use client';

import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from '@/components/ui/toast';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';
import {
  CheckCircle2,
  Info,
  LucideIcon,
  ShieldAlert,
  Sparkles,
} from 'lucide-react';

export function Toaster() {
  const { toasts } = useToast();

  const toneMap: Record<
    string,
    { icon: LucideIcon; iconBg: string; accentBar: string }
  > = {
    default: {
      icon: Sparkles,
      iconBg: 'bg-brand-soft text-brand',
      accentBar: 'bg-brand-soft',
    },
    success: {
      icon: CheckCircle2,
      iconBg: 'bg-state-success/10 text-state-success',
      accentBar: 'bg-state-success/30',
    },
    info: {
      icon: Info,
      iconBg: 'bg-state-info/10 text-state-info',
      accentBar: 'bg-state-info/30',
    },
    warning: {
      icon: ShieldAlert,
      iconBg: 'bg-state-warning/10 text-state-warning',
      accentBar: 'bg-state-warning/30',
    },
    destructive: {
      icon: ShieldAlert,
      iconBg: 'bg-state-error/10 text-state-error',
      accentBar: 'bg-state-error/30',
    },
  };

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, ...props }) {
        const variant = props.variant ?? 'default';
        const tone = toneMap[variant] ?? toneMap.default;
        const Icon = tone.icon;

        return (
          <Toast key={id} {...props} variant={variant}>
            <span
              className={cn(
                'absolute inset-y-3 left-0 w-1 rounded-full',
                tone.accentBar
              )}
              aria-hidden
            />

            <div className="flex flex-1 items-start gap-3 pl-3">
              <div
                className={cn(
                  'mt-1 flex h-9 w-9 items-center justify-center rounded-full',
                  tone.iconBg
                )}
              >
                <Icon className="h-4 w-4" />
              </div>
              <div className="grid flex-1 gap-1">
                {title && <ToastTitle>{title}</ToastTitle>}
                {description && (
                  <ToastDescription>{description}</ToastDescription>
                )}
              </div>
              {action}
            </div>

            <ToastClose />
          </Toast>
        );
      })}
      <ToastViewport />
    </ToastProvider>
  );
}
