'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  getAllProjects,
  getProjectFinancials,
  updateProjectFinancials,
} from '@/actions/admin';
import { SidebarLayout } from '@/components/sidebar-layout';
import { StatusBadge } from '@/components/status-badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { formatCurrency, formatDate } from '@/lib/utils';
import { toast } from '@/components/ui/use-toast';
import type { Project, ProjectFinancials } from '@/lib/db/types';
import { Skeleton, SkeletonTableRows } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/empty-state';

export default function AdminProjectsPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [financials, setFinancials] = useState<ProjectFinancials | null>(null);

  const [amountCharged, setAmountCharged] = useState('');
  const [directCosts, setDirectCosts] = useState('');
  const [commissionRate, setCommissionRate] = useState('10');

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      const data = await getAllProjects();
      setProjects(data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Error al cargar proyectos',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenFinancials = async (projectId: string) => {
    setSelectedProject(projectId);

    try {
      const data = await getProjectFinancials(projectId);
      setFinancials(data);

      if (data) {
        setAmountCharged(data.amountChargedMxn.toString());
        setDirectCosts(data.directCostsMxn.toString());
        setCommissionRate(data.commissionRate.toString());
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Error al cargar datos financieros',
        variant: 'destructive',
      });
    }
  };

  const handleSaveFinancials = async () => {
    if (!selectedProject) return;

    try {
      const result = await updateProjectFinancials({
        projectId: selectedProject,
        amountChargedMxn: parseFloat(amountCharged),
        directCostsMxn: parseFloat(directCosts),
        commissionRate: parseFloat(commissionRate),
      });

      toast({
        title: 'Éxito',
        description: `Datos financieros guardados. Comisión: ${formatCurrency(
          result.commissionAmountMxn
        )}`,
        variant: 'success',
      });

      setSelectedProject(null);
      loadProjects();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Error al guardar datos financieros',
        variant: 'destructive',
      });
    }
  };

  const wonCount = projects.filter((project) => project.status === 'WON').length;
  const inReviewCount = projects.filter(
    (project) => project.status === 'IN_REVIEW'
  ).length;
  const negotiationCount = projects.filter(
    (project) => project.status === 'NEGOTIATION'
  ).length;

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
                  {Array.from({ length: 5 }).map((_, index) => (
                    <th key={index} className="px-6 py-4">
                      <Skeleton className="h-4 w-32" />
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <SkeletonTableRows rows={5} columns={5} />
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
        <header className="space-y-3">
          <h1 className="text-3xl font-semibold text-text-primary">
            Gestión de proyectos
          </h1>
          <p className="max-w-3xl text-text-secondary">
            Administra estados, márgenes y comisiones desde un solo panel.
          </p>
        </header>

        <div className="grid gap-4 md:grid-cols-3">
          <ProjectStat label="Ganados" value={wonCount} helper="Listos para facturar" />
          <ProjectStat
            label="En revisión"
            value={inReviewCount}
            helper="Validando alcance"
          />
          <ProjectStat
            label="En negociación"
            value={negotiationCount}
            helper="Seguimiento comercial"
          />
        </div>

        <div className="rounded-3xl border border-surface-border bg-surface-card shadow-subtle">
          <table className="w-full text-sm">
            <thead className="bg-surface-bg/60 text-left text-xs font-medium text-text-secondary">
              <tr>
                <th className="px-6 py-4">Alias público</th>
                <th className="px-6 py-4">Nombre interno</th>
                <th className="px-6 py-4">Estado</th>
                <th className="px-6 py-4">Creado</th>
                <th className="px-6 py-4">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border">
              {projects.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10">
                    <EmptyState
                      title="Sin proyectos activos"
                      description="Una vez que cierres un referido como proyecto, lo verás en este panel."
                    />
                  </td>
                </tr>
              ) : (
                projects.map((project) => (
                  <tr key={project._id.toString()} className="text-sm">
                    <td className="px-6 py-4 font-semibold text-text-primary">
                      {project.publicAlias}
                    </td>
                    <td className="px-6 py-4 text-text-secondary">
                      {project.internalName || '—'}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={project.status} />
                    </td>
                    <td className="px-6 py-4 text-text-secondary">
                      {formatDate(project.createdAt)}
                    </td>
                    <td className="px-6 py-4">
                      <Button
                        onClick={() =>
                          handleOpenFinancials(project._id.toString())
                        }
                        variant="outline"
                        size="sm"
                      >
                        Finanzas
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <Dialog
          open={!!selectedProject}
          onOpenChange={() => setSelectedProject(null)}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Datos Financieros del Proyecto</DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label>Monto Cobrado (MXN)</Label>
                  <Input
                    type="number"
                    value={amountCharged}
                    onChange={(e) => setAmountCharged(e.target.value)}
                    placeholder="100000"
                  />
                </div>
                <div>
                  <Label>Costos Directos (MXN)</Label>
                  <Input
                    type="number"
                    value={directCosts}
                    onChange={(e) => setDirectCosts(e.target.value)}
                    placeholder="50000"
                  />
                </div>
              </div>

              <div>
                <Label>Tasa de Comisión (%)</Label>
                <Input
                  type="number"
                  max="10"
                  value={commissionRate}
                  onChange={(e) => setCommissionRate(e.target.value)}
                  placeholder="10"
                />
                <p className="text-xs text-text-secondary mt-1">
                  Máx 10%. Comisión limitada a 25,000 MXN por proyecto.
                </p>
              </div>

              {amountCharged && directCosts && (
                <div className="rounded-2xl border border-surface-border bg-surface-bg p-4 text-sm">
                  <div className="flex justify-between">
                    <span>Ganancia:</span>
                    <span className="font-semibold">
                      {formatCurrency(
                        parseFloat(amountCharged) - parseFloat(directCosts)
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Comisión ({commissionRate}%):</span>
                    <span className="font-semibold">
                      {formatCurrency(
                        Math.min(
                          (parseFloat(amountCharged) - parseFloat(directCosts)) *
                            (parseFloat(commissionRate) / 100),
                          25000
                        )
                      )}
                    </span>
                  </div>
                </div>
              )}

              <Button onClick={handleSaveFinancials} className="w-full">
                Guardar Datos Financieros
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </section>
    </SidebarLayout>
  );
}

function ProjectStat({
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
