import { Clock } from 'lucide-react';

export default function PendingPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl border border-gray-200 shadow-sm p-8 text-center">
        <Clock className="h-16 w-16 text-yellow-600 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-brand mb-2">
          Aprobación Pendiente
        </h1>
        <p className="text-gray-500">
          Tu perfil de partner está esperando aprobación de nuestro equipo. Te notificaremos
          una vez que tu cuenta esté activada.
        </p>
      </div>
    </div>
  );
}
