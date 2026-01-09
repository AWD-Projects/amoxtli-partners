'use client';

import { useState } from 'react';
import Link from 'next/link';
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
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-brand mb-2">
            Amoxtli Partners
          </h1>
          <p className="text-text-muted">{subtitle}</p>
        </div>

        <div className="bg-card rounded-xl shadow-card p-6">
          <h2 className="text-xl font-semibold text-text-primary mb-1">
            {title}
          </h2>
          <p className="text-sm text-text-muted mb-6">
            {pendingVerification
              ? 'Ingresa el código de verificación para activar tu cuenta.'
              : 'Completa el formulario para empezar a referir oportunidades.'}
          </p>

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
