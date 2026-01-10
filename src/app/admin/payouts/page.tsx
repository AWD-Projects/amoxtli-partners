'use client';

import { useEffect, useState } from 'react';
import {
  getAllPayouts,
  getAllProjects,
  getAllCommissions,
  schedulePayout,
  markPayoutPaid,
} from '@/actions/admin';
import { SidebarLayout } from '@/components/sidebar-layout';
import { StatusBadge } from '@/components/status-badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { formatCurrency, formatDate } from '@/lib/utils';
import { toast } from '@/components/ui/use-toast';
import type { CommissionPayout, Project, PartnerCommission } from '@/lib/db/types';
import { Skeleton, SkeletonTableRows } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/empty-state';

export default function AdminPayoutsPage() {
  const [payouts, setPayouts] = useState<CommissionPayout[]>([]);
  const [allProjects, setAllProjects] = useState<Project[]>([]);
  const [eligibleProjects, setEligibleProjects] = useState<Project[]>([]);
  const [commissions, setCommissions] = useState<PartnerCommission[]>([]);
  const [loading, setLoading] = useState(true);
  const [showScheduleDialog, setShowScheduleDialog] = useState(false);

  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [selectedPart, setSelectedPart] = useState<'1' | '2'>('1');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [payoutsData, projectsData, commissionsData] = await Promise.all([
        getAllPayouts(),
        getAllProjects(),
        getAllCommissions(),
      ]);
      setPayouts(payoutsData);
      setCommissions(commissionsData);
      setAllProjects(projectsData);

      // Only show projects in selector that:
      // 1. Have commission configured
      // 2. Are in WON or payment-related statuses
      const projectIdsWithCommission = new Set(
        commissionsData.map((c) => c.projectId.toString())
      );

      const eligibleStatuses = [
        'WON',
        'PAYMENT_RECEIVED',
        'COMMISSION_PENDING',
        'COMMISSION_PARTIALLY_PAID',
      ];

      const projectsWithCommission = projectsData.filter((p) =>
        projectIdsWithCommission.has(p._id.toString()) &&
        eligibleStatuses.includes(p.status)
      );

      setEligibleProjects(projectsWithCommission);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No pudimos cargar la información.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSchedulePayout = async () => {
    if (!selectedProjectId) {
      toast({
        title: 'Error',
        description: 'Please select a project',
        variant: 'destructive',
      });
      return;
    }

    try {
      await schedulePayout({
        projectId: selectedProjectId,
        part: parseInt(selectedPart) as 1 | 2,
      });

      toast({
        title: 'Payout programado',
        description: `Se agendó la parte ${selectedPart} del pago.`,
        variant: 'success',
      });

      setShowScheduleDialog(false);
      setSelectedProjectId('');
      setSelectedPart('1');
      loadData();
    } catch (error) {
      toast({
        title: 'Error',
        description:
          error instanceof Error
            ? error.message
            : 'No pudimos programar el payout.',
        variant: 'destructive',
      });
    }
  };

  const handleMarkPaid = async (payoutId: string) => {
    try {
      await markPayoutPaid({ payoutId });

      toast({
        title: 'Pago liberado',
        description: 'Marcaste el payout como pagado.',
        variant: 'success',
      });

      loadData();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No pudimos marcar el payout como pagado.',
        variant: 'destructive',
      });
    }
  };

  // Create a map for quick project lookup
  const projectMap = new Map(
    allProjects.map((project) => [project._id.toString(), project])
  );

  const getProjectName = (projectId: string) => {
    const project = projectMap.get(projectId);
    if (!project) return `Proyecto #${projectId.slice(-6)}`;
    return `${project.publicAlias} — ${project.internalName}`;
  };

  const scheduledCount = payouts.filter(
    (payout) => payout.status === 'SCHEDULED'
  ).length;
  const scheduledTotal = payouts
    .filter((payout) => payout.status === 'SCHEDULED')
    .reduce((acc, payout) => acc + payout.amountMxn, 0);
  const paidTotal = payouts
    .filter((payout) => payout.status === 'PAID')
    .reduce((acc, payout) => acc + payout.amountMxn, 0);

  if (loading) {
    return (
      <SidebarLayout role="admin">
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            {[0, 1, 2].map((index) => (
              <Skeleton key={index} className="h-32 w-full" />
            ))}
          </div>
          <div className="rounded-2xl border border-surface-border bg-surface-card">
            <table className="w-full">
              <thead>
                <tr>
                  {Array.from({ length: 7 }).map((_, index) => (
                    <th key={index} className="px-6 py-4">
                      <Skeleton className="h-4 w-32" />
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <SkeletonTableRows rows={5} columns={7} />
              </tbody>
            </table>
          </div>
        </div>
      </SidebarLayout>
    );
  }

  return (
    <SidebarLayout role="admin">
      <section className="space-y-8">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-3">
            <h1 className="text-3xl font-semibold text-text-primary">
              Payouts y liquidaciones
            </h1>
            <p className="max-w-2xl text-text-secondary">
              Programa, revisa y libera los pagos de comisión sin fricción.
            </p>
          </div>
          <Button onClick={() => setShowScheduleDialog(true)}>
            Programar payout
          </Button>
        </header>

        <div className="grid gap-4 md:grid-cols-3">
          <PayoutStat
            label="Programados"
            value={scheduledCount}
            helper={`Equivalente a ${formatCurrency(scheduledTotal)}`}
          />
          <PayoutStat
            label="Pagados"
            value={payouts.filter((payout) => payout.status === 'PAID').length}
            helper={`Total ${formatCurrency(paidTotal)}`}
          />
          <PayoutStat
            label="Elegibles"
            value={eligibleProjects.length}
            helper="Proyectos disponibles para payout"
          />
        </div>

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
                <th className="px-6 py-4">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border">
              {payouts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8">
                    <EmptyState
                      title="Sin payouts programados"
                      description="Cuando programes pagos de comisión aparecerán en este listado."
                    />
                  </td>
                </tr>
              ) : (
                payouts.map((payout) => (
                  <tr key={payout._id.toString()} className="text-sm">
                    <td className="px-6 py-4 text-text-primary">
                      {getProjectName(payout.projectId.toString())}
                    </td>
                    <td className="px-6 py-4">Parte {payout.part}</td>
                    <td className="px-6 py-4 font-semibold text-text-primary">
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
                    <td className="px-6 py-4">
                      {payout.status === 'SCHEDULED' && (
                        <Button
                          onClick={() => handleMarkPaid(payout._id.toString())}
                          size="sm"
                        >
                          Marcar pagado
                        </Button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <Dialog open={showScheduleDialog} onOpenChange={setShowScheduleDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Programar payout</DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <Label>Proyecto</Label>
                <Select
                  value={selectedProjectId}
                  onValueChange={setSelectedProjectId}
                  disabled={eligibleProjects.length === 0}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={
                      eligibleProjects.length === 0
                        ? "No hay proyectos elegibles"
                        : "Selecciona un proyecto"
                    } />
                  </SelectTrigger>
                  <SelectContent>
                    {eligibleProjects.length === 0 ? (
                      <div className="px-2 py-3 text-sm text-text-muted">
                        No hay proyectos con comisión configurada
                      </div>
                    ) : (
                      eligibleProjects.map((project) => (
                        <SelectItem
                          key={project._id.toString()}
                          value={project._id.toString()}
                        >
                          {project.publicAlias} — {project.internalName}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                {eligibleProjects.length === 0 && (
                  <p className="mt-1 text-xs text-text-secondary">
                    Los proyectos deben estar en status WON y tener finanzas configuradas.
                  </p>
                )}
              </div>

              <div>
                <Label>Parte del payout</Label>
                <Select
                  value={selectedPart}
                  onValueChange={(v) => setSelectedPart(v as '1' | '2')}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Parte 1 (50%)</SelectItem>
                    <SelectItem value="2">Parte 2 (50%)</SelectItem>
                  </SelectContent>
                </Select>
                <p className="mt-1 text-xs text-text-secondary">
                  Parte 1: después del primer pago del cliente · Parte 2:
                  contra entrega final.
                </p>
              </div>

              <Button onClick={handleSchedulePayout} className="w-full">
                Programar payout
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </section>
    </SidebarLayout>
  );
}

function PayoutStat({
  label,
  value,
  helper,
}: {
  label: string;
  value: number;
  helper: string;
}) {
  return (
    <div className="rounded-2xl border border-surface-border bg-surface-card p-5 shadow-subtle">
      <p className="text-sm font-medium text-text-secondary">{label}</p>
      <p className="mt-3 text-3xl font-semibold text-text-primary">{value}</p>
      <p className="text-xs text-text-secondary">{helper}</p>
    </div>
  );
}
