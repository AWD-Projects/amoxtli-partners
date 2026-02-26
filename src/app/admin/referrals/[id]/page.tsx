'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  getLeadIntake,
  updateReferralStatus,
  getAdminReferralTimeline,
  createProject,
  getReferralProject,
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
import { sileo } from 'sileo';
import { ArrowLeft, ExternalLink, Loader2 } from 'lucide-react';
import Link from 'next/link';
import type { LeadIntake, ReferralEvent, Project } from '@/lib/db/types';
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
  const [existingProject, setExistingProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  const [newStatus, setNewStatus] = useState('');
  const [notePublic, setNotePublic] = useState('');
  const [notePrivate, setNotePrivate] = useState('');

  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [creatingProject, setCreatingProject] = useState(false);

  const [publicAlias, setPublicAlias] = useState('');
  const [internalName, setInternalName] = useState('');

  const currentStatus = events[0]?.toStatus;
  const canCreateProject = currentStatus === 'WON' && !existingProject;

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [referralId]);

  const loadData = async () => {
    try {
      const [intakeData, eventsData, projectData] = await Promise.all([
        getLeadIntake(referralId),
        getAdminReferralTimeline(referralId),
        getReferralProject(referralId),
      ]);
      setIntake(intakeData);
      setEvents(eventsData);
      setExistingProject(projectData);
    } catch (error) {
      sileo.error({ title: 'Error', description: 'Error al cargar detalles del referido' });
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newStatus) {
      sileo.warning({ title: 'Atención', description: 'Por favor selecciona un estado' });
      return;
    }

    setUpdatingStatus(true);
    try {
      await sileo.promise(
        updateReferralStatus({
          referralId,
          newStatus,
          notePublic: notePublic || undefined,
          notePrivate: notePrivate || undefined,
        }),
        {
          loading: { title: 'Actualizando...', description: 'Cambiando estado del referido' },
          success: { title: 'Éxito', description: 'Estado actualizado exitosamente' },
          error: { title: 'Error', description: 'Error al actualizar estado' },
        }
      );

      setNewStatus('');
      setNotePublic('');
      setNotePrivate('');
      loadData();
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!publicAlias || !internalName) {
      sileo.warning({ title: 'Atención', description: 'Por favor completa todos los campos' });
      return;
    }

    setCreatingProject(true);
    try {
      await sileo.promise(
        createProject({
          referralId,
          publicAlias,
          internalName,
        }),
        {
          loading: { title: 'Creando...', description: 'Creando proyecto' },
          success: { title: 'Éxito', description: 'Proyecto creado exitosamente' },
          error: (err) => ({ title: 'Error', description: err instanceof Error ? err.message : 'Error al crear proyecto' }),
        }
      );

      router.push(`/admin/projects`);
    } finally {
      setCreatingProject(false);
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

                <Button type="submit" className="w-full" disabled={updatingStatus}>
                  {updatingStatus && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Actualizar estado
                </Button>
              </form>
            </div>

            <div className="rounded-2xl border border-surface-border bg-surface-card p-6 shadow-subtle">
              <h2 className="text-lg font-semibold text-text-primary">
                Proyecto
              </h2>

              {existingProject ? (
                <div className="mt-4 space-y-4">
                  <div className="rounded-lg bg-surface-bg/60 p-4">
                    <p className="text-sm font-medium text-text-primary">
                      {existingProject.publicAlias}
                    </p>
                    <p className="text-xs text-text-secondary mt-1">
                      {existingProject.internalName}
                    </p>
                  </div>
                  <Link href="/admin/projects">
                    <Button variant="outline" className="w-full gap-2">
                      Ver en Proyectos
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              ) : (
                <>
                  {currentStatus !== 'WON' && (
                    <div className="mt-4 rounded-lg bg-yellow-50 p-4 text-sm text-yellow-800">
                      El referido debe estar en status <strong>WON</strong> para crear un proyecto.
                    </div>
                  )}
                  <form onSubmit={handleCreateProject} className="mt-4 space-y-4">
                    <div>
                      <Label>Alias público</Label>
                      <Input
                        value={publicAlias}
                        onChange={(e) => setPublicAlias(e.target.value)}
                        placeholder="ej., Proyecto #2024-001"
                        disabled={!canCreateProject}
                      />
                    </div>

                    <div>
                      <Label>Nombre interno</Label>
                      <Input
                        value={internalName}
                        onChange={(e) => setInternalName(e.target.value)}
                        placeholder="ej., Acme Corp - Implementación CRM"
                        disabled={!canCreateProject}
                      />
                    </div>

                    <Button type="submit" className="w-full" disabled={!canCreateProject || creatingProject}>
                      {creatingProject && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Crear proyecto
                    </Button>
                  </form>
                </>
              )}
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
