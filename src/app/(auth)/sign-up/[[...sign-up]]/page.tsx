'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useSignUp } from '@clerk/nextjs';
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

const signUpSchema = z
  .object({
    fullName: z
      .string()
      .min(3, 'Ingresa tu nombre completo')
      .max(100, 'Nombre demasiado largo'),
    email: z.string().email('Ingresa un correo válido'),
    password: z
      .string()
      .min(8, 'La contraseña debe tener al menos 8 caracteres')
      .regex(/[A-Z]/, 'Incluye al menos una mayúscula')
      .regex(/[0-9]/, 'Incluye al menos un número'),
    confirmPassword: z.string().min(8, 'Confirma tu contraseña'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
  });

type SignUpFormValues = z.infer<typeof signUpSchema>;

export default function SignUpPage() {
  const router = useRouter();
  const { isLoaded, signUp, setActive } = useSignUp();
  const [pendingVerification, setPendingVerification] = useState(false);
  const [emailForVerification, setEmailForVerification] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [actionError, setActionError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const handleSignUp = async (data: SignUpFormValues) => {
    if (!isLoaded) return;
    setActionError(null);

    try {
      const [firstName, ...rest] = data.fullName.trim().split(' ');

      await signUp.create({
        emailAddress: data.email,
        password: data.password,
        firstName: firstName || undefined,
        lastName: rest.join(' ') || undefined,
      });

      await signUp.prepareEmailAddressVerification({
        strategy: 'email_code',
      });

      setPendingVerification(true);
      setEmailForVerification(data.email);
    } catch (error) {
      setActionError(getErrorMessage(error, 'No pudimos crear tu cuenta'));
    }
  };

  const handleVerifyCode = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!isLoaded) return;
    setActionError(null);
    setIsVerifying(true);

    try {
      const result = await signUp.attemptEmailAddressVerification({
        code: verificationCode,
      });

      if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId });
        router.replace('/');
        return;
      }

      setActionError('Necesitamos información adicional para terminar el registro.');
    } catch (error) {
      setActionError(getErrorMessage(error, 'Código inválido. Intenta nuevamente.'));
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendCode = async () => {
    if (!isLoaded) return;
    setIsResending(true);
    setActionError(null);

    try {
      await signUp.prepareEmailAddressVerification({
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

  const title = pendingVerification ? 'Verifica tu correo' : 'Crea tu cuenta';
  const subtitle = pendingVerification
    ? `Enviamos un código a ${emailForVerification}.`
    : 'Únete al programa de referidos de Amoxtli';

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
              Conecta tu red,<br />multiplica tus ingresos
            </h2>
            <p className="text-lg text-white/90 max-w-md">
              Cada contacto que tienes vale oro. Convierte esas conexiones en comisiones reales con nuestro programa transparente.
            </p>

            <div className="space-y-4 pt-8">
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium">Registro sin compromiso</p>
                  <p className="text-sm text-white/75">Comienza gratis, cobra cuando ganes</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium">Sin cuotas ocultas</p>
                  <p className="text-sm text-white/75">Todo claro desde el día uno</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium">Soporte dedicado</p>
                  <p className="text-sm text-white/75">Te acompañamos en cada referido</p>
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
            <h1 className="text-3xl font-bold text-text-primary">{title}</h1>
            <p className="text-text-muted">{subtitle}</p>
          </div>

          <div className="bg-white rounded-2xl border border-surface-border shadow-sm p-8">
          {pendingVerification ? (
            <form onSubmit={handleVerifyCode} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="code">Código de verificación</Label>
                <OtpInput value={verificationCode} onChange={setVerificationCode} autoFocus />
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
            <form onSubmit={handleSubmit(handleSignUp)} className="space-y-4">
              <div>
                <Label htmlFor="fullName">Nombre completo</Label>
                <Input
                  id="fullName"
                  placeholder="Nombre y apellidos"
                  {...register('fullName')}
                />
                {errors.fullName && (
                  <p className="text-sm text-red-500 mt-1">
                    {errors.fullName.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="email">Correo electrónico</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="tu@correo.com"
                  {...register('email')}
                />
                {errors.email && (
                  <p className="text-sm text-red-500 mt-1">
                    {errors.email.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="password">Contraseña</Label>
                <PasswordInput
                  id="password"
                  placeholder="••••••••"
                  {...register('password')}
                />
                {errors.password && (
                  <p className="text-sm text-red-500 mt-1">
                    {errors.password.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="confirmPassword">Confirmar contraseña</Label>
                <PasswordInput
                  id="confirmPassword"
                  placeholder="••••••••"
                  {...register('confirmPassword')}
                />
                {errors.confirmPassword && (
                  <p className="text-sm text-red-500 mt-1">
                    {errors.confirmPassword.message}
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
                {isSubmitting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Crear cuenta
              </Button>

              <p className="text-sm text-center text-text-muted">
                ¿Ya tienes una cuenta?{' '}
                <Link
                  href="/sign-in"
                  className="text-brand font-medium hover:underline"
                >
                  Inicia sesión
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
