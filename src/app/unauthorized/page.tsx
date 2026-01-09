import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-card rounded-lg shadow-card p-8 text-center">
        <AlertCircle className="h-16 w-16 text-red-600 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-brand mb-2">
          No Autorizado
        </h1>
        <p className="text-text-muted mb-6">
          No tienes permiso para acceder a esta página.
        </p>
        <Link href="/">
          <Button>Ir al Inicio</Button>
        </Link>
      </div>
    </div>
  );
}
