'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSignIn } from '@clerk/nextjs';
import { Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { PasswordInput } from '@/components/ui/password-input';
import { OtpInput } from '@/components/ui/otp-input';

const signInSchema = z.object({
  email: z.string().email('Ingresa un correo válido'),
  password: z.string().min(1, 'Ingresa tu contraseña'),
});

type SignInFormValues = z.infer<typeof signInSchema>;

export default function SignInPage() {
  const router = useRouter();
  const { isLoaded, signIn, setActive } = useSignIn();
  const [actionError, setActionError] = useState<string | null>(null);
  const [needsSecondFactor, setNeedsSecondFactor] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignInFormValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const handleSignIn = async (data: SignInFormValues) => {
    if (!isLoaded) return;
    setActionError(null);

    try {
      const result = await signIn.create({
        identifier: data.email,
        password: data.password,
      });

      if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId });
        router.replace('/');
        return;
      }

      if (result.status === 'needs_second_factor') {
        await signIn.prepareSecondFactor({
          strategy: 'email_code',
        });
        setNeedsSecondFactor(true);
        setActionError(null);
        return;
      }

      setActionError(
        'Necesitas completar un paso adicional de seguridad. Sigue las instrucciones enviadas a tu correo o método secundario.'
      );
    } catch (error) {
      setActionError(
        getErrorMessage(error, 'No pudimos iniciar sesión. Intenta nuevamente.')
      );
    }
  };

  const handleVerifyCode = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!isLoaded) return;
    setActionError(null);
    setIsVerifying(true);

    try {
      const result = await signIn.attemptSecondFactor({
        strategy: 'email_code',
        code: verificationCode,
      });

      if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId });
        router.replace('/');
        return;
      }

      setActionError(
        'Necesitamos completar otro paso para validar tu identidad. Revisa tu correo.'
      );
    } catch (error) {
      setActionError(
        getErrorMessage(error, 'Código incorrecto o expirado. Inténtalo de nuevo.')
      );
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendCode = async () => {
    if (!isLoaded) return;
    setIsResending(true);
    setActionError(null);

    try {
      await signIn.prepareSecondFactor({
        strategy: 'email_code',
      });
    } catch (error) {
      setActionError(
        getErrorMessage(error, 'No pudimos reenviar el código. Intenta más tarde.')
      );
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-brand mb-2">
            Amoxtli Partners
          </h1>
          <p className="text-text-muted">Inicia sesión para gestionar tus referidos.</p>
        </div>

        <div className="bg-card rounded-xl shadow-card p-6">
          <h2 className="text-xl font-semibold text-text-primary mb-1">
            Bienvenido de vuelta
          </h2>
          <p className="text-sm text-text-muted mb-6">
            Ingresa tus credenciales para acceder al panel.
          </p>

          {needsSecondFactor ? (
            <form onSubmit={handleVerifyCode} className="space-y-4">
              <p className="text-sm text-text-muted">
                Ingresa el código que enviamos a tu correo para completar el acceso.
              </p>

              <div className="space-y-2">
                <Label htmlFor="code">Código de verificación</Label>
                <OtpInput
                  value={verificationCode}
                  onChange={setVerificationCode}
                  autoFocus
                  length={6}
                />
              </div>

              {actionError && (
                <p className="text-sm text-red-500">{actionError}</p>
              )}

              <Button
                type="submit"
                className="w-full"
                disabled={isVerifying || verificationCode.length !== 6}
              >
                {isVerifying && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Confirmar código
              </Button>

              <button
                type="button"
                className="text-sm text-brand hover:underline w-full text-center"
                onClick={handleResendCode}
                disabled={isResending}
              >
                {isResending ? 'Reenviando código...' : 'Reenviar código'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleSubmit(handleSignIn)} className="space-y-4">
              <div>
                <Label htmlFor="email">Correo electrónico</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="tu@correo.com"
                  autoComplete="email"
                  {...register('email')}
                />
                {errors.email && (
                  <p className="text-sm text-red-500 mt-1">{errors.email.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="password">Contraseña</Label>
                <PasswordInput
                  id="password"
                  placeholder="••••••••"
                  autoComplete="current-password"
                  {...register('password')}
                />
                {errors.password && (
                  <p className="text-sm text-red-500 mt-1">
                    {errors.password.message}
                  </p>
                )}
              </div>

              {actionError && (
                <p className="text-sm text-red-500">{actionError}</p>
              )}

              <Button
                type="submit"
                className="w-full"
                disabled={isSubmitting || !isLoaded}
              >
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Iniciar sesión
              </Button>

              <p className="text-sm text-center text-text-muted">
                ¿No tienes una cuenta?{' '}
                <Link
                  href="/sign-up"
                  className="text-brand font-medium hover:underline"
                >
                  Regístrate
                </Link>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

function getErrorMessage(error: unknown, fallback: string) {
  if (
    error &&
    typeof error === 'object' &&
    'errors' in error &&
    Array.isArray((error as { errors?: Array<{ message?: string }> }).errors)
  ) {
    const [firstError] = (error as { errors?: Array<{ message?: string }> }).errors || [];
    if (firstError?.message) {
      return firstError.message;
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return fallback;
}
