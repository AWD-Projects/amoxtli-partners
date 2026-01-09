import { AlertCircle } from 'lucide-react';

export default function SuspendedPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-card rounded-lg shadow-card p-8 text-center">
        <AlertCircle className="h-16 w-16 text-red-600 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-brand mb-2">
          Cuenta Suspendida
        </h1>
        <p className="text-text-muted">
          Tu cuenta de partner ha sido suspendida. Por favor contacta a soporte para
          más información.
        </p>
      </div>
    </div>
  );
}
