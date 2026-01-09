import { CheckCircle } from 'lucide-react';

export default function SuccessPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-card rounded-lg shadow-card p-8 text-center">
        <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-brand mb-2">
          ¡Gracias!
        </h1>
        <p className="text-text-muted">
          Hemos recibido tu información y nos pondremos en contacto contigo pronto.
        </p>
      </div>
    </div>
  );
}
