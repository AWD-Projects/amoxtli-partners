'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  getLeadIntake,
  updateReferralStatus,
  getAdminReferralTimeline,
  createProject,
} from '@/actions/admin';
import { SidebarLayout } from '@/components/sidebar-layout';
import { Timeline } from '@/components/timeline';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from '@/components/ui/use-toast';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import type { LeadIntake, ReferralEvent } from '@/lib/db/types';
import { Skeleton } from '@/components/ui/skeleton';
import { StatusBadge } from '@/components/status-badge';
import { cn } from '@/lib/utils';

const STATUSES = [
  'IN_REVIEW',
  'ACCEPTED',
  'REJECTED',
  'PROPOSAL_SENT',
  'NEGOTIATION',
  'WON',
  'LOST',
] as const;

export default function AdminReferralDetailPage() {
  const params = useParams();
  const router = useRouter();
  const referralId = params.id as string;

  const [intake, setIntake] = useState<LeadIntake | null>(null);
  const [events, setEvents] = useState<ReferralEvent[]>([]);
  const [loading, setLoading] = useState(true);

  const [newStatus, setNewStatus] = useState('');
  const [notePublic, setNotePublic] = useState('');
  const [notePrivate, setNotePrivate] = useState('');

  const [publicAlias, setPublicAlias] = useState('');
  const [internalName, setInternalName] = useState('');

  const currentStatus = events[0]?.toStatus;

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [referralId]);

  const loadData = async () => {
    try {
      const [intakeData, eventsData] = await Promise.all([
        getLeadIntake(referralId),
        getAdminReferralTimeline(referralId),
      ]);
      setIntake(intakeData);
      setEvents(eventsData);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Error al cargar detalles del referido',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newStatus) {
      toast({
        title: 'Error',
        description: 'Por favor selecciona un estado',
        variant: 'destructive',
      });
      return;
    }

    try {
      await updateReferralStatus({
        referralId,
        newStatus,
        notePublic: notePublic || undefined,
        notePrivate: notePrivate || undefined,
      });

      toast({
        title: 'Éxito',
        description: 'Estado actualizado exitosamente',
        variant: 'success',
      });

      setNewStatus('');
      setNotePublic('');
      setNotePrivate('');
      loadData();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Error al actualizar estado',
        variant: 'destructive',
      });
    }
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!publicAlias || !internalName) {
      toast({
        title: 'Error',
        description: 'Por favor completa todos los campos',
        variant: 'destructive',
      });
      return;
    }

    try {
      await createProject({
        referralId,
        publicAlias,
        internalName,
      });

      toast({
        title: 'Éxito',
        description: 'Proyecto creado exitosamente',
        variant: 'success',
      });

      router.push(`/admin/projects`);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Error al crear proyecto',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <SidebarLayout role="admin">
        <div className="space-y-6">
          <Skeleton className="h-20 w-full" />
          <div className="grid gap-6 lg:grid-cols-2">
            <Skeleton className="h-96 w-full" />
            <Skeleton className="h-96 w-full" />
          </div>
        </div>
      </SidebarLayout>
    );
  }

  return (
    <SidebarLayout role="admin">
      <section className="space-y-8">
        <Link href="/admin/referrals">
          <Button variant="ghost" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Volver a referidos
          </Button>
        </Link>

        <div className="rounded-2xl border border-surface-border bg-surface-card p-6 shadow-subtle">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-sm text-text-secondary">Código</p>
              <h1 className="text-3xl font-semibold text-text-primary">
                {intake?.companyName ?? 'Referido'}
              </h1>
              <p className="text-sm text-text-secondary">
                Contacto: {intake?.contactName} · {intake?.email}
              </p>
            </div>
            {currentStatus && <StatusBadge status={currentStatus} />}
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-6">
            {intake && (
              <div className="rounded-2xl border border-surface-border bg-surface-card p-6 shadow-subtle">
                <h2 className="text-lg font-semibold text-text-primary">
                  Información del lead
                </h2>
                <div className="mt-4 grid gap-4">
                  <InfoRow label="Empresa" value={intake.companyName} />
                  <InfoRow label="Contacto" value={intake.contactName} />
                  <InfoRow label="Correo" value={intake.email} />
                  <InfoRow label="Teléfono" value={intake.phone} />
                  <InfoRow label="Mensaje" value={intake.message} multiline />
                </div>
              </div>
            )}

            <div className="rounded-2xl border border-surface-border bg-surface-card p-6 shadow-subtle">
              <h2 className="text-lg font-semibold text-text-primary">
                Actualizar estado
              </h2>
              <form onSubmit={handleStatusUpdate} className="mt-4 space-y-4">
                <div>
                  <Label>Nuevo estado</Label>
                  <Select value={newStatus} onValueChange={setNewStatus}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar estado" />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUSES.map((status) => (
                        <SelectItem key={status} value={status}>
                          {status.replace(/_/g, ' ')}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Nota Pública (visible para el socio)</Label>
                  <Textarea
                    value={notePublic}
                    onChange={(e) => setNotePublic(e.target.value)}
                    placeholder="Nota pública opcional..."
                  />
                </div>

                <div>
                  <Label>Nota Privada (solo admin)</Label>
                  <Textarea
                    value={notePrivate}
                    onChange={(e) => setNotePrivate(e.target.value)}
                    placeholder="Nota privada opcional..."
                  />
                </div>

                <Button type="submit" className="w-full">
                  Actualizar estado
                </Button>
              </form>
            </div>

            <div className="rounded-2xl border border-surface-border bg-surface-card p-6 shadow-subtle">
              <h2 className="text-lg font-semibold text-text-primary">
                Crear proyecto
              </h2>
              <form onSubmit={handleCreateProject} className="mt-4 space-y-4">
                <div>
                  <Label>Alias público</Label>
                  <Input
                    value={publicAlias}
                    onChange={(e) => setPublicAlias(e.target.value)}
                    placeholder="ej., Proyecto #2024-001"
                  />
                </div>

                <div>
                  <Label>Nombre interno</Label>
                  <Input
                    value={internalName}
                    onChange={(e) => setInternalName(e.target.value)}
                    placeholder="ej., Acme Corp - Implementación CRM"
                  />
                </div>

                <Button type="submit" className="w-full">
                  Crear proyecto
                </Button>
              </form>
            </div>
          </div>

          <div className="rounded-2xl border border-surface-border bg-surface-card p-6 shadow-subtle">
            <h2 className="text-lg font-semibold text-text-primary">
              Línea de tiempo
            </h2>
            <div className="mt-4">
              <Timeline events={events} showPrivateNotes={true} />
            </div>
          </div>
        </div>
      </section>
    </SidebarLayout>
  );
}

function InfoRow({
  label,
  value,
  multiline,
}: {
  label: string;
  value: string;
  multiline?: boolean;
}) {
  return (
    <div>
      <p className="text-xs font-medium text-text-secondary">{label}</p>
      <p
        className={cn(
          'mt-1 text-sm font-medium text-text-primary',
          multiline && 'leading-relaxed'
        )}
      >
        {value}
      </p>
    </div>
  );
}
