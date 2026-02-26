'use client';

import { useEffect, useState } from 'react';
import { getAllPartners, updatePartnerStatus } from '@/actions/admin';
import { SidebarLayout } from '@/components/sidebar-layout';
import { StatusBadge } from '@/components/status-badge';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/utils';
import { sileo } from 'sileo';
import { Loader2 } from 'lucide-react';
import type { Partner } from '@/lib/db/types';
import { Skeleton, SkeletonTableRows } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/empty-state';

export default function AdminPartnersPage() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    loadPartners();
  }, []);

  const loadPartners = async () => {
    try {
      const data = await getAllPartners();
      setPartners(data);
    } catch (error) {
      sileo.error({ title: 'Error', description: 'Error al cargar socios' });
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (
    partnerId: string,
    status: 'ACTIVE' | 'SUSPENDED'
  ) => {
    setUpdatingId(partnerId);
    try {
      await sileo.promise(updatePartnerStatus({ partnerId, status }), {
        loading: { title: 'Procesando...', description: 'Actualizando estado del socio' },
        success: { title: 'Éxito', description: `Socio ${status === 'ACTIVE' ? 'activado' : 'suspendido'}` },
        error: { title: 'Error', description: 'Error al actualizar estado del socio' },
      });
      loadPartners();
    } finally {
      setUpdatingId(null);
    }
  };

  const pendingCount = partners.filter(
    (partner) => partner.status === 'PENDING'
  ).length;
  const activeCount = partners.filter(
    (partner) => partner.status === 'ACTIVE'
  ).length;
  const suspendedCount = partners.filter(
    (partner) => partner.status === 'SUSPENDED'
  ).length;

  if (loading) {
    return (
      <SidebarLayout role="admin">
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            {[0, 1, 2].map((card) => (
              <Skeleton key={card} className="h-32 w-full" />
            ))}
          </div>
          <div className="rounded-2xl border border-surface-border bg-surface-card">
            <table className="w-full">
              <thead>
                <tr>
                  {Array.from({ length: 4 }).map((_, index) => (
                    <th key={index} className="px-6 py-4">
                      <Skeleton className="h-4 w-32" />
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <SkeletonTableRows rows={5} columns={4} />
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
            Gestión de socios
          </h1>
          <p className="max-w-3xl text-text-secondary">
            Visualiza el estado de cada partner y toma decisiones en segundos.
          </p>
        </header>

        <div className="grid gap-4 md:grid-cols-3">
          <MetricTile
            label="Pendientes"
            value={pendingCount}
            helper="Esperando aprobación"
          />
          <MetricTile
            label="Activos"
            value={activeCount}
            helper="Listos para operar"
          />
          <MetricTile
            label="Suspendidos"
            value={suspendedCount}
            helper="Revisa historial antes de activar"
          />
        </div>

        <div className="rounded-3xl border border-surface-border bg-surface-card shadow-subtle">
          <table className="w-full text-sm">
            <thead className="bg-surface-bg/60 text-left text-xs font-medium text-text-secondary">
              <tr>
                <th className="px-6 py-4">Nombre</th>
                <th className="px-6 py-4">Estado</th>
                <th className="px-6 py-4">Registro</th>
                <th className="px-6 py-4">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border">
              {partners.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-10">
                    <EmptyState
                      title="Sin socios registrados"
                      description="Cuando se apruebe un onboarding aparecerá aquí."
                    />
                  </td>
                </tr>
              ) : (
                partners.map((partner) => (
                  <tr key={partner._id.toString()} className="text-sm">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-text-primary">
                        {partner.displayName}
                      </div>
                      <p className="text-xs text-text-secondary">
                        ID {partner._id.toString().slice(-6)}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={partner.status} />
                    </td>
                    <td className="px-6 py-4 text-text-secondary">
                      {formatDate(partner.createdAt)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-2">
                        {partner.status === 'PENDING' && (
                          <Button
                            onClick={() =>
                              handleStatusChange(
                                partner._id.toString(),
                                'ACTIVE'
                              )
                            }
                            size="sm"
                            disabled={updatingId === partner._id.toString()}
                          >
                            {updatingId === partner._id.toString() && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Aprobar
                          </Button>
                        )}
                        {partner.status === 'ACTIVE' && (
                          <Button
                            onClick={() =>
                              handleStatusChange(
                                partner._id.toString(),
                                'SUSPENDED'
                              )
                            }
                            size="sm"
                            variant="destructive"
                            disabled={updatingId === partner._id.toString()}
                          >
                            {updatingId === partner._id.toString() && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Suspender
                          </Button>
                        )}
                        {partner.status === 'SUSPENDED' && (
                          <Button
                            onClick={() =>
                              handleStatusChange(
                                partner._id.toString(),
                                'ACTIVE'
                              )
                            }
                            size="sm"
                            variant="outline"
                            disabled={updatingId === partner._id.toString()}
                          >
                            {updatingId === partner._id.toString() && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Reactivar
                          </Button>
                        )}
                      </div>
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

function MetricTile({
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
