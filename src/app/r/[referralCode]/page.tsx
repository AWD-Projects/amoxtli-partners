'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { leadIntakeSchema, type LeadIntakeInput } from '@/lib/validators';
import { submitLeadIntake } from '@/actions/public';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { sileo } from 'sileo';

export default function ReferralIntakePage() {
  const params = useParams();
  const router = useRouter();
  const referralCode = params.referralCode as string;
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LeadIntakeInput>({
    resolver: zodResolver(leadIntakeSchema),
  });

  const onSubmit = async (data: LeadIntakeInput) => {
    setIsSubmitting(true);

    try {
      await submitLeadIntake({
        referralCode,
        ...data,
      });

      sileo.success({ title: '¡Éxito!', description: 'Tu información ha sido enviada. Nos pondremos en contacto pronto.' });

      // Redirect to success page or show success message
      router.push('/r/success');
    } catch (error) {
      sileo.error({ title: 'Error', description: error instanceof Error ? error.message : 'Error al enviar' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-card rounded-lg shadow-card p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-brand mb-2">
            Bienvenido a Amoxtli
          </h1>
          <p className="text-text-muted">
            Cuéntanos sobre tu proyecto y nos pondremos en contacto contigo pronto.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <Label htmlFor="companyName">Nombre de la Empresa</Label>
            <Input
              id="companyName"
              {...register('companyName')}
              placeholder="Acme Inc."
            />
            {errors.companyName && (
              <p className="text-sm text-red-600 mt-1">
                {errors.companyName.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="contactName">Nombre de Contacto</Label>
            <Input
              id="contactName"
              {...register('contactName')}
              placeholder="Juan Pérez"
            />
            {errors.contactName && (
              <p className="text-sm text-red-600 mt-1">
                {errors.contactName.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="email">Correo Electrónico</Label>
            <Input
              id="email"
              type="email"
              {...register('email')}
              placeholder="juan@ejemplo.com"
            />
            {errors.email && (
              <p className="text-sm text-red-600 mt-1">
                {errors.email.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="phone">Teléfono</Label>
            <Input
              id="phone"
              {...register('phone')}
              placeholder="+52 55 1234 5678"
            />
            {errors.phone && (
              <p className="text-sm text-red-600 mt-1">
                {errors.phone.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="message">Detalles del Proyecto</Label>
            <Textarea
              id="message"
              {...register('message')}
              placeholder="Cuéntanos sobre tus necesidades..."
              rows={5}
            />
            {errors.message && (
              <p className="text-sm text-red-600 mt-1">
                {errors.message.message}
              </p>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? 'Enviando...' : 'Enviar'}
          </Button>
        </form>
      </div>
    </div>
  );
}
