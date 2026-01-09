import { cn } from '@/lib/utils';
import type { ReferralStatus, PartnerStatus, PayoutStatus } from '@/lib/db/types';

interface StatusBadgeProps {
  status: ReferralStatus | PartnerStatus | PayoutStatus;
  className?: string;
}

const base =
  'inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold';

const tones = {
  success: {
    badge: 'border-state-success/30 bg-state-success/10 text-state-success',
    dot: 'bg-state-success',
  },
  warning: {
    badge: 'border-state-warning/30 bg-state-warning/10 text-state-warning',
    dot: 'bg-state-warning',
  },
  info: {
    badge: 'border-brand/30 bg-brand-soft text-brand',
    dot: 'bg-brand',
  },
  neutral: {
    badge: 'border-surface-border bg-surface-bg text-text-secondary',
    dot: 'bg-text-secondary',
  },
  danger: {
    badge: 'border-state-error/30 bg-state-error/10 text-state-error',
    dot: 'bg-state-error',
  },
};

const statusConfig: Record<
  string,
  { label: string; tone: keyof typeof tones }
> = {
  PENDING: { label: 'Pendiente', tone: 'warning' },
  ACTIVE: { label: 'Activo', tone: 'success' },
  SUSPENDED: { label: 'Suspendido', tone: 'danger' },

  LINK_CREATED: { label: 'Link creado', tone: 'info' },
  INTAKE_SUBMITTED: { label: 'Información enviada', tone: 'info' },
  IN_REVIEW: { label: 'En revisión', tone: 'warning' },
  ACCEPTED: { label: 'Aceptado', tone: 'success' },
  REJECTED: { label: 'Rechazado', tone: 'danger' },
  PROPOSAL_SENT: { label: 'Propuesta enviada', tone: 'info' },
  NEGOTIATION: { label: 'Negociación', tone: 'warning' },
  WON: { label: 'Ganado', tone: 'success' },
  LOST: { label: 'Perdido', tone: 'danger' },
  PAYMENT_RECEIVED: { label: 'Pago recibido', tone: 'success' },
  COMMISSION_PENDING: { label: 'Comisión pendiente', tone: 'warning' },
  COMMISSION_PARTIALLY_PAID: {
    label: 'Pago parcial',
    tone: 'info',
  },
  COMMISSION_PAID: { label: 'Pagado', tone: 'success' },

  SCHEDULED: { label: 'Programado', tone: 'info' },
  PAID: { label: 'Pagado', tone: 'success' },
  FAILED: { label: 'Fallido', tone: 'danger' },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config =
    statusConfig[status] || {
      label: status,
      tone: 'neutral',
    };

  const toneClasses = tones[config.tone];

  return (
    <span className={cn(base, toneClasses.badge, className)}>
      <span className={cn('h-2 w-2 rounded-full', toneClasses.dot)} />
      {config.label}
    </span>
  );
}
