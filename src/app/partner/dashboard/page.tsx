import { requireActivePartner } from '@/lib/auth';
import { getPartnerDashboardStats } from '@/actions/partner';
import { SidebarLayout } from '@/components/sidebar-layout';
import { formatCurrency } from '@/lib/utils';
import { Link2, DollarSign, Briefcase, TrendingUp } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function PartnerDashboardPage() {
  const { partner } = await requireActivePartner();
  const stats = await getPartnerDashboardStats();

  return (
    <SidebarLayout role="partner">
      <section className="space-y-8">
        <div className="rounded-3xl border border-surface-border bg-surface-card p-8 shadow-subtle">
          <h1 className="text-3xl font-semibold text-text-primary">
            Bienvenido de vuelta, {partner.displayName}
          </h1>
          <p className="mt-2 max-w-2xl text-text-secondary">
            Aquí tienes un resumen claro de tu actividad y próximos pasos.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total de referidos"
            value={stats.totalReferrals.toString()}
            icon={Link2}
          />
          <StatCard
            title="Referidos activos"
            value={stats.activeReferrals.toString()}
            icon={TrendingUp}
          />
          <StatCard
            title="Proyectos ganados"
            value={stats.wonProjects.toString()}
            icon={Briefcase}
          />
          <StatCard
            title="Ganancias pagadas"
            value={formatCurrency(stats.totalPaid)}
            icon={DollarSign}
          />
        </div>

        <div className="rounded-3xl border border-surface-border bg-surface-card p-6 shadow-subtle">
          <h2 className="text-lg font-semibold text-text-primary">
            Acciones rápidas
          </h2>
          <div className="mt-4 space-y-3">
            <Link
              href="/partner/referrals/new"
              className="flex items-center justify-between rounded-2xl border border-surface-border px-4 py-3 transition hover:border-brand hover:bg-surface-bg"
            >
              <div>
                <p className="font-semibold text-text-primary">
                  Crear nuevo link
                </p>
                <p className="text-sm text-text-secondary">
                  Genera un link único para compartir
                </p>
              </div>
              <Link2 className="h-4 w-4 text-brand" />
            </Link>
            <Link
              href="/partner/commissions"
              className="flex items-center justify-between rounded-2xl border border-surface-border px-4 py-3 transition hover:border-brand hover:bg-surface-bg"
            >
              <div>
                <p className="font-semibold text-text-primary">
                  Revisar comisiones
                </p>
                <p className="text-sm text-text-secondary">
                  Estado de pagos y liquidaciones
                </p>
              </div>
              <DollarSign className="h-4 w-4 text-brand" />
            </Link>
          </div>
        </div>
      </section>
    </SidebarLayout>
  );
}

function StatCard({
  title,
  value,
  icon: Icon,
}: {
  title: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="rounded-2xl border border-surface-border bg-surface-card p-5 shadow-subtle">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-text-secondary">{title}</p>
          <p className="mt-2 text-2xl font-semibold text-text-primary">
            {value}
          </p>
        </div>
        <Icon className="h-5 w-5 text-brand" />
      </div>
    </div>
  );
}
