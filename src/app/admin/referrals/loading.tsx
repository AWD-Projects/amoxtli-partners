import { SidebarLayout } from '@/components/sidebar-layout';
import { Skeleton, SkeletonTableRows } from '@/components/ui/skeleton';

export default function AdminReferralsLoading() {
  return (
    <SidebarLayout role="admin">
      <section className="space-y-8">
        <div className="space-y-3">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-3/5" />
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {[0, 1, 2].map((card) => (
            <Skeleton key={card} className="h-28 w-full rounded-2xl" />
          ))}
        </div>

        <div className="rounded-3xl border border-surface-border bg-surface-card shadow-subtle">
          <table className="w-full">
            <thead>
              <tr>
                {Array.from({ length: 5 }).map((_, index) => (
                  <th key={index} className="px-6 py-4">
                    <Skeleton className="h-4 w-24" />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <SkeletonTableRows rows={5} columns={5} />
            </tbody>
          </table>
        </div>
      </section>
    </SidebarLayout>
  );
}
