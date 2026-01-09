import { cn } from '@/lib/utils';

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-100 via-slate-50 to-slate-100 text-transparent',
        'before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_1.4s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/80 before:to-transparent',
        className
      )}
    />
  );
}

export function SkeletonTableRows({
  rows = 4,
  columns = 4,
}: {
  rows?: number;
  columns?: number;
}) {
  return (
    <>
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <tr key={`skeleton-row-${rowIndex}`}>
          {Array.from({ length: columns }).map((__, columnIndex) => (
            <td key={`skeleton-cell-${rowIndex}-${columnIndex}`} className="px-6 py-4">
              <Skeleton className="h-5 w-full" />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}
