import { requireActivePartner } from '@/lib/auth';
import { SidebarLayout } from '@/components/sidebar-layout';
import { StatusBadge } from '@/components/status-badge';
import { formatDate } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export default async function ProfilePage() {
  const { partner } = await requireActivePartner();

  return (
    <SidebarLayout role="partner">
      <div>
        <h1 className="text-3xl font-bold text-brand mb-8">
          Perfil
        </h1>

        <div className="bg-card rounded-lg shadow-card p-6 space-y-6">
          <div>
            <label className="text-sm text-text-muted">Nombre</label>
            <p className="text-lg font-medium">{partner.displayName}</p>
          </div>

          <div>
            <label className="text-sm text-text-muted">Estado</label>
            <div className="mt-1">
              <StatusBadge status={partner.status} />
            </div>
          </div>

          <div>
            <label className="text-sm text-text-muted">Miembro Desde</label>
            <p className="text-lg">{formatDate(partner.createdAt)}</p>
          </div>

          <div className="pt-6 border-t border-border">
            <h3 className="font-semibold mb-4">Límites del Programa</h3>
            <ul className="space-y-2 text-sm">
              <li>• Máximo 5 referidos activos por mes</li>
              <li>• Tope de comisión: 25,000 MXN por proyecto</li>
              <li>• Tope mensual de pagos: 40,000 MXN</li>
              <li>• Tope anual de pagos: 120,000 MXN</li>
              <li>• Protección de leads: 90 días</li>
            </ul>
          </div>
        </div>
      </div>
    </SidebarLayout>
  );
}
