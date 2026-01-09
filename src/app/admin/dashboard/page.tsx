import { requireAdmin } from '@/lib/auth';
import {
  getAllPartners,
  getAllReferrals,
  getAllPayouts,
} from '@/actions/admin';
import { SidebarLayout } from '@/components/sidebar-layout';
import {
  Users,
  Link2,
  Briefcase,
  DollarSign,
  TrendingUp,
  ArrowUpRight,
} from 'lucide-react';
import Link from 'next/link';
import { cn, formatCurrency } from '@/lib/utils';
import { EmptyState } from '@/components/empty-state';

export const dynamic = 'force-dynamic';

export default async function AdminDashboardPage() {
  await requireAdmin();

  const [partners, referrals, payouts] = await Promise.all([
    getAllPartners(),
    getAllReferrals(),
    getAllPayouts(),
  ]);

  const activePartners = partners.filter((p) => p.status === 'ACTIVE').length;
  const pendingPartners = partners.filter((p) => p.status === 'PENDING').length;
  const activeReferrals = referrals.filter(
    (r) =>
      r.status === 'INTAKE_SUBMITTED' ||
      r.status === 'IN_REVIEW' ||
      r.status === 'ACCEPTED' ||
      r.status === 'PROPOSAL_SENT' ||
      r.status === 'NEGOTIATION'
  ).length;
  const scheduledPayouts = payouts.filter(
    (p) => p.status === 'SCHEDULED'
  ).length;
  const wonDeals = referrals.filter((r) => r.status === 'WON').length;
  const paidVolume = payouts
    .filter((p) => p.status === 'PAID')
    .reduce((acc, payout) => acc + (payout.amountMxn || 0), 0);
  const scheduledVolume = payouts
    .filter((p) => p.status === 'SCHEDULED')
    .reduce((acc, payout) => acc + (payout.amountMxn || 0), 0);

  const latestReferrals = referrals.slice(0, 5);
  const upcomingPayoutsList = payouts
    .filter((p) => p.status === 'SCHEDULED')
    .slice(0, 3);

  const pipeline = [
    {
      label: 'En revisión',
      value: referrals.filter((r) => r.status === 'IN_REVIEW').length,
    },
    {
      label: 'Negociación',
      value: referrals.filter((r) => r.status === 'NEGOTIATION').length,
    },
    {
      label: 'Propuesta',
      value: referrals.filter((r) => r.status === 'PROPOSAL_SENT').length,
    },
    { label: 'Ganados', value: wonDeals },
  ];

  return (
    <SidebarLayout role="admin">
      <section className="space-y-10">
        <div className="rounded-3xl border border-surface-border bg-surface-card p-8 text-text-primary shadow-subtle">
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div className="space-y-4">
              <span className="inline-flex items-center rounded-full bg-brand-soft px-4 py-1 text-xs font-semibold text-brand">
                Panel superadmin
              </span>
              <div>
                <h1 className="text-4xl font-semibold tracking-tight">
                  Visión general del programa
                </h1>
                <p className="mt-2 max-w-2xl text-text-secondary">
                  Monitorea la salud del funnel, libera pagos con certeza y coordina al equipo sin perder el tono premium.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <BadgePill label="Partners activos" value={activePartners} />
                <BadgePill
                  label="Referidos activos"
                  value={activeReferrals}
                />
                <BadgePill label="Pagos programados" value={scheduledPayouts} />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <MiniHighlight
                label="Volumen pagado"
                value={formatCurrency(paidVolume)}
              />
              <MiniHighlight
                label="Pagos en cola"
                value={formatCurrency(scheduledVolume)}
                tone="amber"
              />
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-4">
          <StatCard
            title="Socios activos"
            value={activePartners.toString()}
            subtitle={`${pendingPartners} pendientes por aprobar`}
            icon={Users}
          />
          <StatCard
            title="Referidos totales"
            value={referrals.length.toString()}
            subtitle={`${activeReferrals} en pipeline`}
            icon={Link2}
          />
          <StatCard
            title="Proyectos ganados"
            value={wonDeals.toString()}
            subtitle="Negocios listos para activar"
            icon={Briefcase}
          />
          <StatCard
            title="Pagos programados"
            value={scheduledPayouts.toString()}
            subtitle="Listos para liberar"
            icon={DollarSign}
          />
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="rounded-2xl border border-surface-border bg-surface-card p-6 shadow-subtle">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-text-primary">
                  Acciones clave
                </h2>
                <p className="text-sm text-text-secondary">
                  Mueve rápido las oportunidades críticas.
                </p>
              </div>
              <TrendingUp className="h-5 w-5 text-brand" />
            </div>
            <div className="mt-6 space-y-3">
              <QuickLink
                href="/admin/partners"
                title="Aprobar socios en cola"
                description={`${pendingPartners} solicitudes activas`}
              />
              <QuickLink
                href="/admin/referrals"
                title="Gestionar pipeline"
                description="Actualiza estatus y notas"
              />
              <QuickLink
                href="/admin/payouts"
                title="Liberar payouts"
                description={`${scheduledPayouts} pagos listos`}
              />
            </div>
          </div>

          <div className="rounded-2xl border border-surface-border bg-surface-card p-6 shadow-subtle">
            <h2 className="text-lg font-semibold text-text-primary">
              Pipeline activo
            </h2>
            <p className="text-sm text-text-secondary">
              Conversión durante los últimos 30 días.
            </p>
            <div className="mt-6 space-y-4">
              {pipeline.map((stage) => (
                <div key={stage.label} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-text-primary">
                      {stage.label}
                    </span>
                    <span className="text-text-secondary">{stage.value}</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-surface-bg">
                    <div
                      className="h-full rounded-full bg-brand"
                      style={{
                        width: `${
                          referrals.length
                            ? (stage.value / referrals.length) * 100
                            : 0
                        }%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-surface-border bg-surface-card p-6 shadow-subtle">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-text-primary">
                  Actividad reciente
                </h2>
                <p className="text-sm text-text-secondary">
                  Últimos referidos de la red.
                </p>
              </div>
              <ArrowUpRight className="h-5 w-5 text-brand" />
            </div>
            <div className="mt-6 space-y-4">
              {latestReferrals.length === 0 ? (
                <EmptyState
                  title="Sin movimientos"
                  description="Cuando entren nuevos referidos verás el histórico aquí."
                  className="border-0 bg-transparent"
                />
              ) : (
                latestReferrals.map((referral) => (
                  <div
                    key={referral._id.toString()}
                    className="flex items-center justify-between rounded-2xl border border-surface-border bg-surface-bg px-4 py-3"
                  >
                    <div>
                      <p className="font-semibold tracking-wide text-text-primary">
                        {referral.referralCode}
                      </p>
                      <p className="text-xs text-text-secondary">
                        {referral.status.replace(/_/g, ' ')}
                      </p>
                    </div>
                    <Link
                      href={`/admin/referrals/${referral._id.toString()}`}
                      className="text-sm font-semibold text-brand hover:underline"
                    >
                      Ver
                    </Link>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="rounded-2xl border border-surface-border bg-surface-card p-6 shadow-subtle lg:col-span-2">
            <h2 className="text-lg font-semibold text-text-primary">
              Próximos payouts
            </h2>
            <p className="text-sm text-text-secondary">
              Prioriza los pagos de comisión por liberar.
            </p>
            <div className="mt-6 space-y-4">
              {upcomingPayoutsList.length === 0 ? (
                <EmptyState
                  title="Sin pagos programados"
                  description="En cuanto programes un payout aparecerá aquí para liberarlo a tiempo."
                  className="border-0 bg-transparent"
                />
              ) : (
                upcomingPayoutsList.map((payout) => (
                  <div
                    key={payout._id.toString()}
                    className="flex items-center justify-between rounded-xl border border-surface-border bg-surface-bg px-4 py-3"
                  >
                    <div>
                      <p className="text-sm font-medium text-text-primary">
                        Proyecto #{payout.projectId.toString().slice(-6)}
                      </p>
                      <p className="text-xs text-text-secondary">
                        Parte {payout.part} · {payout.status}
                      </p>
                    </div>
                    <p className="text-sm font-semibold text-text-primary">
                      {formatCurrency(payout.amountMxn)}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
          <div className="rounded-2xl border border-surface-border bg-surface-card p-6 shadow-subtle">
            <h2 className="text-lg font-semibold text-text-primary">
              Insights rápidos
            </h2>
            <ul className="mt-6 space-y-4 text-sm text-text-secondary">
              <li>
                • {pendingPartners} socios pendientes por aprobar: responde en
                &lt;24h.
              </li>
              <li>• {activeReferrals} oportunidades requieren seguimiento.</li>
              <li>
                • {scheduledPayouts} payouts listos para liberar esta semana.
              </li>
            </ul>
          </div>
        </div>
      </section>
    </SidebarLayout>
  );
}

function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
}: {
  title: string;
  value: string;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="rounded-2xl border border-surface-border bg-surface-card p-5 shadow-subtle">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-text-secondary">{title}</p>
        <span className="rounded-xl border border-surface-border bg-surface-bg p-3">
          <Icon className="h-5 w-5 text-brand" />
        </span>
      </div>
      <p className="mt-4 text-3xl font-semibold text-text-primary">{value}</p>
      <p className="text-sm text-text-secondary">{subtitle}</p>
    </div>
  );
}

function QuickLink({
  href,
  title,
  description,
}: {
  href: string;
  title: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center justify-between rounded-xl border border-surface-border bg-surface-bg px-4 py-3 text-sm transition hover:border-brand hover:bg-surface-card"
    >
      <div>
        <p className="font-semibold text-text-primary">{title}</p>
        <p className="text-xs text-text-secondary">{description}</p>
      </div>
      <ArrowUpRight className="h-4 w-4 text-brand" />
    </Link>
  );
}

function BadgePill({ label, value }: { label: string; value: number }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full bg-brand-soft px-4 py-2 text-sm font-semibold text-brand">
      {value}
      <span className="text-text-secondary">{label}</span>
    </span>
  );
}

function MiniHighlight({
  label,
  value,
  tone = 'emerald',
}: {
  label: string;
  value: string;
  tone?: 'emerald' | 'amber';
}) {
  return (
    <div className="rounded-2xl border border-surface-border bg-surface-card p-4">
      <p className="text-xs font-medium text-text-secondary">
        {label}
      </p>
      <p
        className={cn(
          'mt-2 text-2xl font-semibold',
          tone === 'amber' ? 'text-state-warning' : 'text-brand'
        )}
      >
        {value}
      </p>
    </div>
  );
}
