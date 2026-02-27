'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createPartnerSchema, type CreatePartnerInput } from '@/lib/validators';
import { createPartnerProfile } from '@/actions/partner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { sileo } from 'sileo';
import { BrandLogo } from '@/components/brand-logo';

export default function OnboardingPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreatePartnerInput>({
    resolver: zodResolver(createPartnerSchema),
  });

  const onSubmit = async (data: CreatePartnerInput) => {
    setIsSubmitting(true);

    try {
      await createPartnerProfile(data);

      sileo.success({ title: '¡Perfil creado!', description: 'Tu perfil está pendiente de aprobación.' });

      router.push('/partner/pending');
    } catch (error) {
      sileo.error({ title: 'Error', description: error instanceof Error ? error.message : 'Error al crear el perfil' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
        <h1 className="mb-4 flex justify-center">
          <BrandLogo className="h-8 w-auto" priority sizes="200px" />
        </h1>
        <p className="text-gray-500 mb-6">
          Completa tu perfil para comenzar.
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="displayName">Nombre</Label>
            <Input
              id="displayName"
              {...register('displayName')}
              placeholder="Tu nombre o empresa"
            />
            {errors.displayName && (
              <p className="text-sm text-red-600 mt-1">
                {errors.displayName.message}
              </p>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? 'Creando...' : 'Crear Perfil'}
          </Button>
        </form>
      </div>
    </div>
  );
}
