import { SidebarLayout } from '@/components/sidebar-layout';
import { Skeleton, SkeletonTableRows } from '@/components/ui/skeleton';

export default function AdminDashboardLoading() {
  return (
    <SidebarLayout role="admin">
      <section className="space-y-8">
        <div className="rounded-3xl border border-surface-border bg-surface-card p-8 shadow-subtle">
          <Skeleton className="h-6 w-28" />
          <Skeleton className="mt-4 h-10 w-3/4" />
          <Skeleton className="mt-2 h-5 w-1/2" />
          <div className="mt-6 flex flex-wrap gap-3">
            {[0, 1, 2].map((item) => (
              <Skeleton key={item} className="h-10 w-40 rounded-full" />
            ))}
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[0, 1, 2, 3].map((card) => (
            <Skeleton key={card} className="h-32 w-full rounded-2xl" />
          ))}
        </div>

        <div className="rounded-3xl border border-surface-border bg-surface-card shadow-subtle">
          <table className="w-full">
            <thead>
              <tr>
                {Array.from({ length: 5 }).map((_, index) => (
                  <th key={index} className="px-6 py-4">
                    <Skeleton className="h-4 w-20" />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <SkeletonTableRows rows={4} columns={5} />
            </tbody>
          </table>
        </div>
      </section>
    </SidebarLayout>
  );
}
