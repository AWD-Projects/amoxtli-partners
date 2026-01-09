import { cn } from '@/lib/utils';
import { Inbox } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: React.ComponentType<{ className?: string }>;
  className?: string;
}

export function EmptyState({
  title,
  description,
  icon: Icon = Inbox,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-2 rounded-2xl border border-surface-border bg-surface-card px-6 py-10 text-center',
        className
      )}
    >
      <span className="flex h-12 w-12 items-center justify-center rounded-full border border-surface-border bg-surface-bg text-brand">
        <Icon className="h-5 w-5" />
      </span>
      <p className="text-base font-semibold text-text-primary">{title}</p>
      <p className="max-w-sm text-sm text-text-secondary">{description}</p>
    </div>
  );
}
