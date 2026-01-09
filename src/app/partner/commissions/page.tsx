import { requireActivePartner } from '@/lib/auth';
import { getMyCommissions, getMyPayouts } from '@/actions/partner';
import { SidebarLayout } from '@/components/sidebar-layout';
import { StatusBadge } from '@/components/status-badge';
import { formatCurrency, formatDate } from '@/lib/utils';
import { EmptyState } from '@/components/empty-state';

export const dynamic = 'force-dynamic';

export default async function CommissionsPage() {
  await requireActivePartner();
  const commissions = await getMyCommissions();
  const payouts = await getMyPayouts();

  const totalEarned = commissions.reduce(
    (sum, c) => sum + c.commissionAmountMxn,
    0
  );
  const totalPaid = payouts
    .filter((p) => p.status === 'PAID')
    .reduce((sum, p) => sum + p.amountMxn, 0);

  return (
    <SidebarLayout role="partner">
      <div>
        <h1 className="mb-2 text-3xl font-semibold text-text-primary">
          Comisiones y pagos
        </h1>
        <p className="mb-8 text-text-secondary">
          Rastrea tus ganancias y calendario de pagos.
        </p>

        <div className="mb-8 grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl border border-surface-border bg-surface-card p-6 shadow-subtle">
            <p className="text-sm text-text-secondary">Total ganado</p>
            <p className="mt-2 text-3xl font-semibold text-text-primary">
              {formatCurrency(totalEarned)}
            </p>
          </div>
          <div className="rounded-2xl border border-surface-border bg-surface-card p-6 shadow-subtle">
            <p className="text-sm text-text-secondary">Total pagado</p>
            <p className="mt-2 text-3xl font-semibold text-state-success">
              {formatCurrency(totalPaid)}
            </p>
          </div>
        </div>

        <div className="space-y-8">
          <section>
            <h2 className="mb-4 text-xl font-semibold text-text-primary">
              Comisiones
            </h2>
            <div className="rounded-3xl border border-surface-border bg-surface-card shadow-subtle">
              <table className="w-full text-sm">
                <thead className="bg-surface-bg/60 text-left text-xs font-medium text-text-secondary">
                  <tr>
                    <th className="px-6 py-4">Proyecto</th>
                    <th className="px-6 py-4">Monto</th>
                    <th className="px-6 py-4">Estado</th>
                    <th className="px-6 py-4">Fecha</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-border">
                  {commissions.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-8">
                        <EmptyState
                          title="Sin comisiones registradas"
                          description="Cuando cierres proyectos y se calcule tu comisión aparecerá aquí."
                        />
                      </td>
                    </tr>
                  ) : (
                    commissions.map((commission) => (
                      <tr key={commission._id.toString()}>
                        <td className="px-6 py-4 whitespace-nowrap text-text-primary">
                          Proyecto #{commission.projectId.toString().slice(-6)}
                        </td>
                        <td className="px-6 py-4 font-medium text-text-primary">
                          {formatCurrency(commission.commissionAmountMxn)}
                        </td>
                        <td className="px-6 py-4">
                          <StatusBadge status={commission.status} />
                        </td>
                        <td className="px-6 py-4 text-text-secondary">
                          {formatDate(commission.createdAt)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2 className="mb-4 text-xl font-semibold text-text-primary">
              Pagos
            </h2>
            <div className="rounded-3xl border border-surface-border bg-surface-card shadow-subtle">
              <table className="w-full text-sm">
                <thead className="bg-surface-bg/60 text-left text-xs font-medium text-text-secondary">
                  <tr>
                    <th className="px-6 py-4">Proyecto</th>
                    <th className="px-6 py-4">Parte</th>
                    <th className="px-6 py-4">Monto</th>
                    <th className="px-6 py-4">Estado</th>
                    <th className="px-6 py-4">Programado</th>
                    <th className="px-6 py-4">Pagado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-border">
                  {payouts.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-8">
                        <EmptyState
                          title="Aún no hay pagos programados"
                          description="Cuando se libere tu comisión verás el calendario aquí."
                        />
                      </td>
                    </tr>
                  ) : (
                    payouts.map((payout) => (
                      <tr key={payout._id.toString()}>
                        <td className="px-6 py-4 whitespace-nowrap text-text-primary">
                          Proyecto #{payout.projectId.toString().slice(-6)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          Parte {payout.part}
                        </td>
                        <td className="px-6 py-4 font-medium text-text-primary">
                          {formatCurrency(payout.amountMxn)}
                        </td>
                        <td className="px-6 py-4">
                          <StatusBadge status={payout.status} />
                        </td>
                        <td className="px-6 py-4 text-text-secondary">
                          {formatDate(payout.scheduledAt)}
                        </td>
                        <td className="px-6 py-4 text-text-secondary">
                          {payout.paidAt ? formatDate(payout.paidAt) : '—'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </div>
    </SidebarLayout>
  );
}
