import { z } from 'zod';

// Partner validators
export const createPartnerSchema = z.object({
  displayName: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
});

export const updatePartnerStatusSchema = z.object({
  partnerId: z.string(),
  status: z.enum(['ACTIVE', 'SUSPENDED']),
});

// Referral validators
export const createReferralSchema = z.object({});

// Lead intake validators
export const leadIntakeSchema = z.object({
  companyName: z.string().min(2, 'El nombre de la empresa es requerido'),
  contactName: z.string().min(2, 'El nombre de contacto es requerido'),
  email: z.string().email('Correo electrónico válido es requerido'),
  phone: z.string().min(10, 'Número de teléfono válido es requerido'),
  message: z.string().min(10, 'Por favor proporciona más detalles sobre tus necesidades'),
});

// Project validators
export const createProjectSchema = z.object({
  referralId: z.string(),
  publicAlias: z.string().min(2, 'El alias público es requerido'),
  internalName: z.string().min(2, 'El nombre interno es requerido'),
});

export const updateProjectFinancialsSchema = z.object({
  projectId: z.string(),
  amountChargedMxn: z.number().min(0, 'El monto debe ser positivo'),
  directCostsMxn: z.number().min(0, 'Los costos directos deben ser positivos'),
  commissionRate: z
    .number()
    .min(0, 'La tasa de comisión debe ser al menos 0')
    .max(10, 'La tasa de comisión no puede exceder el 10%'),
});

// Status update validators
export const updateReferralStatusSchema = z.object({
  referralId: z.string(),
  newStatus: z.enum([
    'IN_REVIEW',
    'ACCEPTED',
    'REJECTED',
    'PROPOSAL_SENT',
    'NEGOTIATION',
    'WON',
    'LOST',
    'PAYMENT_RECEIVED',
    'COMMISSION_PENDING',
    'COMMISSION_PARTIALLY_PAID',
    'COMMISSION_PAID',
  ]),
  notePublic: z.string().optional(),
  notePrivate: z.string().optional(),
});

// Payout validators
export const schedulePayoutSchema = z.object({
  projectId: z.string(),
  part: z.union([z.literal(1), z.literal(2)]),
});

export const markPayoutPaidSchema = z.object({
  payoutId: z.string(),
});

export type CreatePartnerInput = z.infer<typeof createPartnerSchema>;
export type UpdatePartnerStatusInput = z.infer<
  typeof updatePartnerStatusSchema
>;
export type LeadIntakeInput = z.infer<typeof leadIntakeSchema>;
export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectFinancialsInput = z.infer<
  typeof updateProjectFinancialsSchema
>;
export type UpdateReferralStatusInput = z.infer<
  typeof updateReferralStatusSchema
>;
export type SchedulePayoutInput = z.infer<typeof schedulePayoutSchema>;
export type MarkPayoutPaidInput = z.infer<typeof markPayoutPaidSchema>;
