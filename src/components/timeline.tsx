import { formatDate } from '@/lib/utils';
import type { ReferralEvent } from '@/lib/db/types';
import { StatusBadge } from './status-badge';

interface TimelineProps {
  events: ReferralEvent[];
  showPrivateNotes?: boolean;
}

const actorLabels: Record<string, string> = {
  SYSTEM: 'Sistema',
  PARTNER: 'Partner',
  ADMIN: 'Administrador',
};

const noteTranslations: Record<string, string> = {
  'Lead intake form submitted': 'Formulario de ingreso enviado',
  'Referral link created': 'Link de referido creado',
};

export function Timeline({ events, showPrivateNotes = false }: TimelineProps) {
  if (events.length === 0) {
    return (
      <div className="py-8 text-center text-text-muted">
        Aún no hay actividad
      </div>
    );
  }

  return (
    <div className="flow-root">
      <ul className="-mb-8">
        {events.map((event, eventIdx) => (
          <li key={event._id.toString()}>
            <div className="relative pb-8">
              {eventIdx !== events.length - 1 ? (
                <span
                  className="absolute left-4 top-4 -ml-px h-full w-0.5 bg-border"
                  aria-hidden="true"
                />
              ) : null}
              <div className="relative flex space-x-3">
                <div>
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand ring-8 ring-card">
                    <div className="h-2 w-2 rounded-full bg-white" />
                  </span>
                </div>
                <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                  <div>
                    <p className="text-sm text-text-primary">
                      {event.fromStatus && (
                        <>
                          <StatusBadge status={event.fromStatus} className="mr-2" />
                          →
                        </>
                      )}
                      <StatusBadge status={event.toStatus} className="ml-2" />
                    </p>
                    {event.notePublic && (
                      <p className="mt-2 text-sm text-text-muted">
                        {noteTranslations[event.notePublic] ?? event.notePublic}
                      </p>
                    )}
                    {showPrivateNotes && event.notePrivate && (
                      <p className="mt-2 rounded bg-red-50 p-2 text-sm text-red-600">
                        <strong>Privado:</strong> {event.notePrivate}
                      </p>
                    )}
                    <p className="mt-1 text-xs text-text-muted">
                      Por {actorLabels[event.actorRole] ?? event.actorRole}
                    </p>
                  </div>
                  <div className="whitespace-nowrap text-right text-sm text-text-muted">
                    <time dateTime={new Date(event.createdAt).toISOString()}>
                      {formatDate(event.createdAt)}
                    </time>
                  </div>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
