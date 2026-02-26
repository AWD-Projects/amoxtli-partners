'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useSignIn, useAuth } from '@clerk/nextjs';
import { Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { PasswordInput } from '@/components/ui/password-input';
import { OtpInput } from '@/components/ui/otp-input';
import wordmarkBlue from '@/assets/wordmark_blue.svg';

const signInSchema = z.object({
  email: z.string().email('Ingresa un correo válido'),
  password: z.string().min(1, 'Ingresa tu contraseña'),
});

type SignInFormValues = z.infer<typeof signInSchema>;

export default function SignInPage() {
  const router = useRouter();
  const { isSignedIn } = useAuth();
  const { isLoaded, signIn, setActive } = useSignIn();

  useEffect(() => {
    if (isSignedIn) {
      router.replace('/');
    }
  }, [isSignedIn, router]);

  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
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

  const handleGoogleSignIn = async () => {
    if (!isLoaded) return;
    setIsGoogleLoading(true);
    try {
      await signIn.authenticateWithRedirect({
        strategy: 'oauth_google',
        redirectUrl: '/sso-callback',
        redirectUrlComplete: '/',
      });
    } catch (error) {
      setActionError(getErrorMessage(error, 'No pudimos conectar con Google.'));
      setIsGoogleLoading(false);
    }
  };

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
    <div className="min-h-screen bg-white flex">
      {/* Left side - Visual/Brand section */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-brand to-brand-hover relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full translate-x-1/3 translate-y-1/3" />
        </div>

        <div className="relative z-10 flex flex-col justify-between p-12 text-white">
          <div>
            <Image
              src={wordmarkBlue}
              alt="Amoxtli Partners"
              className="h-8 w-auto brightness-0 invert"
              priority
              sizes="160px"
            />
          </div>

          <div className="space-y-6">
            <h2 className="text-4xl font-bold leading-tight">
              Transforma oportunidades<br />en ingresos reales
            </h2>
            <p className="text-lg text-white/90 max-w-md">
              Únete a la red de partners más transparente de México. Refiere proyectos y gana comisiones justas.
            </p>

            <div className="space-y-4 pt-8">
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium">Comisiones transparentes</p>
                  <p className="text-sm text-white/75">Hasta 10% del margen neto del proyecto</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium">Portal en tiempo real</p>
                  <p className="text-sm text-white/75">Seguimiento completo de tus referidos</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium">Pagos puntuales</p>
                  <p className="text-sm text-white/75">Sin sorpresas, sin letra chica</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm text-white/60">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            Tus datos están protegidos con encriptación SSL
          </div>
        </div>
      </div>

      {/* Right side - Form section */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8">
          {/* Mobile logo */}
          <div className="lg:hidden text-center">
            <Image
              src={wordmarkBlue}
              alt="Amoxtli Partners"
              className="h-8 w-auto mx-auto"
              priority
              sizes="160px"
            />
          </div>

          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-text-primary">Bienvenido de vuelta</h1>
            <p className="text-text-muted">Ingresa tus credenciales para acceder al portal</p>
          </div>

          <div className="bg-white rounded-2xl border border-surface-border shadow-sm p-8">
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
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={handleGoogleSignIn}
                disabled={isGoogleLoading || !isLoaded}
              >
                {isGoogleLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                  </svg>
                )}
                Continuar con Google
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-surface-border" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-text-muted">o</span>
                </div>
              </div>

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
