import { requireAdmin } from '@/lib/auth';
import { getAllReferrals } from '@/actions/admin';
import { SidebarLayout } from '@/components/sidebar-layout';
import { StatusBadge } from '@/components/status-badge';
import { Button } from '@/components/ui/button';
import { cn, formatDate } from '@/lib/utils';
import Link from 'next/link';
import { EmptyState } from '@/components/empty-state';

export const dynamic = 'force-dynamic';

export default async function AdminReferralsPage() {
  await requireAdmin();
  const referrals = await getAllReferrals();

  const reviewCount = referrals.filter(
    (r) => r.status === 'IN_REVIEW'
  ).length;
  const negotiationCount = referrals.filter(
    (r) => r.status === 'NEGOTIATION'
  ).length;
  const wonCount = referrals.filter((r) => r.status === 'WON').length;

  return (
    <SidebarLayout role="admin">
      <section className="space-y-8">
        <header className="space-y-3">
          <h1 className="text-3xl font-semibold text-text-primary">
            Referidos y oportunidades
          </h1>
          <p className="max-w-3xl text-text-secondary">
            Monitorea cada lead y mantén un seguimiento impecable del funnel.
          </p>
        </header>

        <div className="grid gap-4 md:grid-cols-3">
          <PipelineTile label="En revisión" value={reviewCount} />
          <PipelineTile label="En negociación" value={negotiationCount} />
          <PipelineTile label="Ganados" value={wonCount} highlight />
        </div>

        <div className="rounded-3xl border border-surface-border bg-surface-card shadow-subtle">
          <table className="w-full text-sm">
            <thead className="bg-surface-bg/60 text-left text-xs font-medium text-text-secondary">
              <tr>
                <th className="px-6 py-4">Código</th>
                <th className="px-6 py-4">Estado</th>
                <th className="px-6 py-4">Creado</th>
                <th className="px-6 py-4">Actualizado</th>
                <th className="px-6 py-4">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border">
              {referrals.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10">
                    <EmptyState
                      title="Sin referidos aún"
                      description="Cuando tu red envíe nuevos leads los verás organizados aquí."
                    />
                  </td>
                </tr>
              ) : (
                referrals.map((referral) => (
                  <tr key={referral._id.toString()} className="text-sm">
                    <td className="px-6 py-4 font-mono text-base text-text-primary">
                      {referral.referralCode}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={referral.status} />
                    </td>
                    <td className="px-6 py-4 text-text-secondary">
                      {formatDate(referral.createdAt)}
                    </td>
                    <td className="px-6 py-4 text-text-secondary">
                      {formatDate(referral.lastUpdatedAt)}
                    </td>
                    <td className="px-6 py-4">
                      <Link href={`/admin/referrals/${referral._id.toString()}`}>
                        <Button variant="outline" size="sm">
                          Gestionar
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </SidebarLayout>
  );
}

function PipelineTile({
  label,
  value,
  highlight,
}: {
  label: string;
  value: number;
  highlight?: boolean;
}) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-surface-border bg-surface-card p-5 shadow-subtle',
        highlight && 'border-brand bg-brand-soft'
      )}
    >
      <p
        className={cn(
          'text-sm font-medium text-text-secondary',
          highlight && 'text-brand'
        )}
      >
        {label}
      </p>
      <p className="mt-3 text-3xl font-semibold text-text-primary">{value}</p>
    </div>
  );
}
