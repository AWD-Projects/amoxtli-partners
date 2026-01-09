import { requireActivePartner } from '@/lib/auth';
import { getMyReferrals } from '@/actions/partner';
import { SidebarLayout } from '@/components/sidebar-layout';
import { StatusBadge } from '@/components/status-badge';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/utils';
import { Plus, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { EmptyState } from '@/components/empty-state';

export const dynamic = 'force-dynamic';

export default async function ReferralsPage() {
  await requireActivePartner();
  const referrals = await getMyReferrals();

  return (
    <SidebarLayout role="partner">
      <div>
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-brand mb-2">
              Mis Referidos
            </h1>
            <p className="text-text-muted">
              Administra tus links de referidos y rastrea su progreso
            </p>
          </div>
          <Link href="/partner/referrals/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Referido
            </Button>
          </Link>
        </div>

        <div className="rounded-3xl border border-surface-border bg-surface-card shadow-subtle">
          <table className="w-full text-sm">
            <thead className="bg-surface-bg/60 text-left text-xs font-medium text-text-secondary">
              <tr>
                <th className="px-6 py-4">Código</th>
                <th className="px-6 py-4">Estado</th>
                <th className="px-6 py-4">Creado</th>
                <th className="px-6 py-4">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border">
              {referrals.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8">
                    <EmptyState
                      title="Aún no hay referidos"
                      description="Crea tu primer link y empieza a compartirlo con tus prospectos."
                    />
                  </td>
                </tr>
              ) : (
                referrals.map((referral) => (
                  <tr key={referral._id.toString()}>
                    <td className="px-6 py-4 font-mono text-base text-text-primary">
                      {referral.referralCode}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={referral.status} />
                    </td>
                    <td className="px-6 py-4 text-text-secondary">
                      {formatDate(referral.createdAt)}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="flex gap-2">
                        <Link href={`/partner/referrals/${referral._id.toString()}`}>
                          <Button variant="outline" size="sm">
                            Ver
                          </Button>
                        </Link>
                        {referral.status === 'LINK_CREATED' && (
                          <a
                            href={`${process.env.NEXT_PUBLIC_APP_URL || ''}/r/${referral.referralCode}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Button variant="outline" size="icon">
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                          </a>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </SidebarLayout>
  );
}
