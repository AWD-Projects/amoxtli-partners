import { requireActivePartner } from '@/lib/auth';
import { getReferralTimeline } from '@/actions/partner';
import { SidebarLayout } from '@/components/sidebar-layout';
import { Timeline } from '@/components/timeline';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function ReferralDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireActivePartner();
  const { id } = await params;
  const events = await getReferralTimeline(id);

  return (
    <SidebarLayout role="partner">
      <div>
        <Link href="/partner/referrals">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver a Referidos
          </Button>
        </Link>

        <h1 className="text-3xl font-bold text-brand mb-8">
          Línea de Tiempo del Referido
        </h1>

        <div className="bg-card rounded-lg shadow-card p-6">
          <Timeline events={events} />
        </div>
      </div>
    </SidebarLayout>
  );
}
