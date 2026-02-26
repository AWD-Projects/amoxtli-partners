'use client';

import { Component, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ClerkErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error) {
    console.error('[ClerkErrorBoundary]', error);
  }

  render() {
    if (this.state.hasError) {
      const isClerkError =
        this.state.error?.message?.includes('Clerk') ||
        this.state.error?.message?.includes('clerk');

      return (
        <div className="flex min-h-screen items-center justify-center p-4">
          <div className="text-center space-y-4 max-w-md">
            <h2 className="text-xl font-semibold">
              {isClerkError
                ? 'Error al cargar la autenticación'
                : 'Algo salió mal'}
            </h2>
            <p className="text-muted-foreground">
              {isClerkError
                ? 'No se pudo conectar con el servicio de autenticación. Esto puede deberse a una conexión lenta.'
                : 'Ocurrió un error inesperado. Por favor, inténtalo de nuevo.'}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground hover:bg-primary/90"
            >
              Recargar página
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
