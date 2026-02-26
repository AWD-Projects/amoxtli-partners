'use server';

import { ObjectId } from 'mongodb';
import {
  getReferralsCollection,
  getLeadIntakesCollection,
  getDedupeRegistryCollection,
  getReferralEventsCollection,
  getPartnersCollection,
} from '@/lib/db';
import { leadIntakeSchema } from '@/lib/validators';
import { generateDedupeKey, isSelfReferral } from '@/lib/antifraud';

export async function submitLeadIntake(data: {
  referralCode: string;
  companyName: string;
  contactName: string;
  email: string;
  phone: string;
  message: string;
}) {
  const validated = leadIntakeSchema.parse(data);

  // Find referral
  const referralsCollection = await getReferralsCollection();
  const referral = await referralsCollection.findOne({
    referralCode: data.referralCode,
  });

  if (!referral) {
    throw new Error('Código de referido inválido');
  }

  // Check if referral is still valid
  if (referral.protectionExpiresAt < new Date()) {
    throw new Error('El enlace de referido ha expirado');
  }

  // Check if referral is in correct status
  if (referral.status !== 'LINK_CREATED') {
    throw new Error('Este referido ya fue enviado');
  }

  // Get partner email for self-referral check
  const partnersCollection = await getPartnersCollection();
  const partner = await partnersCollection.findOne({
    _id: referral.partnerId,
  });

  if (!partner) {
    throw new Error('Socio no encontrado');
  }

  // Check for self-referral (use partner's Clerk user ID to get email)
  // For now, we'll implement a basic check - in production, you'd fetch the partner's email from Clerk
  // This is a simplified version - actual implementation would need Clerk API call

  // Generate dedupe key
  const dedupeKey = generateDedupeKey(
    validated.email,
    validated.phone,
    validated.companyName
  );

  // Check for duplicate
  const dedupeCollection = await getDedupeRegistryCollection();
  const existing = await dedupeCollection.findOne({ dedupeKey });

  if (existing) {
    throw new Error(
      'Este lead ya fue registrado por otro socio'
    );
  }

  // Create dedupe entry
  const protectionExpiresAt = new Date();
  protectionExpiresAt.setDate(protectionExpiresAt.getDate() + 90);

  await dedupeCollection.insertOne({
    _id: new ObjectId(),
    dedupeKey,
    firstReferralId: referral._id,
    firstPartnerId: referral.partnerId,
    expiresAt: protectionExpiresAt,
  });

  // Create lead intake
  const intakesCollection = await getLeadIntakesCollection();
  await intakesCollection.insertOne({
    _id: new ObjectId(),
    referralId: referral._id,
    companyName: validated.companyName,
    contactName: validated.contactName,
    email: validated.email,
    phone: validated.phone,
    message: validated.message,
    dedupeKey,
    createdAt: new Date(),
  });

  // Update referral status
  await referralsCollection.updateOne(
    { _id: referral._id },
    {
      $set: {
        status: 'INTAKE_SUBMITTED',
        lastUpdatedAt: new Date(),
      },
    }
  );

  // Create event
  const eventsCollection = await getReferralEventsCollection();
  await eventsCollection.insertOne({
    _id: new ObjectId(),
    referralId: referral._id,
    actorRole: 'SYSTEM',
    fromStatus: 'LINK_CREATED',
    toStatus: 'INTAKE_SUBMITTED',
    notePublic: 'Formulario de lead enviado',
    createdAt: new Date(),
  });

  return { success: true };
}

export async function validateReferralCode(code: string) {
  const referralsCollection = await getReferralsCollection();
  const referral = await referralsCollection.findOne({ referralCode: code });

  if (!referral) {
    return { valid: false, reason: 'Código de referido inválido' };
  }

  if (referral.protectionExpiresAt < new Date()) {
    return { valid: false, reason: 'El enlace de referido ha expirado' };
  }

  if (referral.status !== 'LINK_CREATED') {
    return { valid: false, reason: 'Este referido ya fue enviado' };
  }

  return { valid: true };
}
