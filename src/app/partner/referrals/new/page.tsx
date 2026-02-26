'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createReferralLink } from '@/actions/partner';
import { SidebarLayout } from '@/components/sidebar-layout';
import { Button } from '@/components/ui/button';
import { sileo } from 'sileo';
import { Copy, ArrowLeft } from 'lucide-react';

export default function NewReferralPage() {
  const router = useRouter();
  const [isCreating, setIsCreating] = useState(false);
  const [referralUrl, setReferralUrl] = useState<string | null>(null);

  const handleCreate = async () => {
    setIsCreating(true);

    try {
      const result = await createReferralLink();
      const fullUrl = `${window.location.origin}${result.url}`;
      setReferralUrl(fullUrl);

      sileo.success({ title: '¡Link de referido creado!', description: 'Comparte este link con clientes potenciales.' });
    } catch (error) {
      sileo.error({ title: 'Error', description: error instanceof Error ? error.message : 'Error al crear el link' });
    } finally {
      setIsCreating(false);
    }
  };

  const copyToClipboard = () => {
    if (referralUrl) {
      navigator.clipboard.writeText(referralUrl);
      sileo.success({ title: '¡Copiado!', description: 'Link de referido copiado al portapapeles.' });
    }
  };

  return (
    <SidebarLayout role="partner">
      <div className="space-y-6">
        <Link href="/partner/referrals">
          <Button variant="ghost" className="px-0 text-text-secondary">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver a referidos
          </Button>
        </Link>

        <div className="rounded-3xl border border-surface-border bg-surface-card p-8 shadow-subtle">
          <h1 className="text-3xl font-semibold text-text-primary">
            Crear nuevo link
          </h1>
          <p className="mt-2 text-text-secondary">
            Genera un link único para compartir con clientes potenciales.
          </p>

          {!referralUrl ? (
            <Button
              onClick={handleCreate}
              disabled={isCreating}
              className="mt-6 w-full"
            >
              {isCreating ? 'Creando...' : 'Generar link de referido'}
            </Button>
          ) : (
            <div className="mt-6 space-y-4">
              <div className="rounded-2xl border border-surface-border bg-surface-bg p-4">
                <p className="text-sm text-text-secondary">
                  Tu link de referido
                </p>
                <div className="mt-3 flex items-center gap-3">
                  <code className="flex-1 truncate rounded-xl border border-surface-border bg-white px-4 py-3 text-sm text-text-primary">
                    {referralUrl}
                  </code>
                  <Button onClick={copyToClipboard} variant="outline" size="sm">
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="flex flex-col gap-2 sm:flex-row">
                <Button
                  onClick={() => router.push('/partner/referrals')}
                  className="flex-1"
                >
                  Ver todos los referidos
                </Button>
                <Button
                  onClick={() => setReferralUrl(null)}
                  variant="outline"
                  className="flex-1"
                >
                  Crear otro
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </SidebarLayout>
  );
}
