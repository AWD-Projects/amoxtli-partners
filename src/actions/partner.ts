'use server';

import { ObjectId } from 'mongodb';
import { auth } from '@clerk/nextjs/server';
import { requireActivePartner } from '@/lib/auth';
import {
  getPartnersCollection,
  getReferralsCollection,
  getPartnerCommissionsCollection,
  getCommissionPayoutsCollection,
  getProjectsCollection,
  getReferralEventsCollection,
} from '@/lib/db';
import { generateReferralCode } from '@/lib/utils';
import { createPartnerSchema } from '@/lib/validators';
import { toPlainObject } from '@/lib/serializers';
import type {
  SafeReferral,
  SafeProject,
  PartnerCommission,
  CommissionPayout,
  ReferralEvent,
} from '@/lib/db/types';

// Create partner profile during onboarding
export async function createPartnerProfile(data: { displayName: string }) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error('Necesitas iniciar sesión para completar tu perfil.');
  }

  const validated = createPartnerSchema.parse(data);

  const partnersCollection = await getPartnersCollection();

  // Check if partner already exists
  const existing = await partnersCollection.findOne({ clerkUserId: userId });
  if (existing) {
    throw new Error('Ya tienes un perfil de partner creado.');
  }

  const result = await partnersCollection.insertOne({
    _id: new ObjectId(),
    clerkUserId: userId,
    status: 'PENDING',
    displayName: validated.displayName,
    createdAt: new Date(),
  });

  return { success: true, partnerId: result.insertedId.toString() };
}

// Get partner's own referrals (safe data only)
export async function getMyReferrals(): Promise<SafeReferral[]> {
  const { partner } = await requireActivePartner();

  const referralsCollection = await getReferralsCollection();
  const referrals = await referralsCollection
    .find({ partnerId: partner._id })
    .sort({ createdAt: -1 })
    .toArray();

  // Return only safe fields with proper serialization
  return referrals.map((ref) =>
    toPlainObject({
      _id: ref._id,
      referralCode: ref.referralCode,
      status: ref.status,
      createdAt: ref.createdAt,
      lastUpdatedAt: ref.lastUpdatedAt,
    }) as unknown as SafeReferral
  );
}

// Create a new referral link
export async function createReferralLink() {
  const { partner } = await requireActivePartner();

  const referralsCollection = await getReferralsCollection();

  // Check monthly limit (max 5 active referrals in current month)
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const activeThisMonth = await referralsCollection.countDocuments({
    partnerId: partner._id,
    createdAt: { $gte: monthStart },
    status: {
      $nin: ['REJECTED', 'LOST', 'COMMISSION_PAID'],
    },
  });

  if (activeThisMonth >= 5) {
    throw new Error('Límite mensual de referidos alcanzado (5 referidos activos)');
  }

  // Generate unique referral code
  let referralCode: string;
  let isUnique = false;

  while (!isUnique) {
    referralCode = generateReferralCode();
    const existing = await referralsCollection.findOne({ referralCode });
    isUnique = !existing;
  }

  const protectionExpiresAt = new Date();
  protectionExpiresAt.setDate(protectionExpiresAt.getDate() + 90);

  const result = await referralsCollection.insertOne({
    _id: new ObjectId(),
    partnerId: partner._id,
    referralCode: referralCode!,
    status: 'LINK_CREATED',
    createdAt: now,
    protectionExpiresAt,
    lastUpdatedAt: now,
  });

  // Create initial event
  const eventsCollection = await getReferralEventsCollection();
  await eventsCollection.insertOne({
    _id: new ObjectId(),
    referralId: result.insertedId,
    actorRole: 'PARTNER',
    toStatus: 'LINK_CREATED',
    notePublic: 'Enlace de referido creado',
    createdAt: now,
  });

  return {
    success: true,
    referralCode: referralCode!,
    url: `/r/${referralCode!}`,
  };
}

// Get referral timeline (public notes only)
export async function getReferralTimeline(
  referralId: string
): Promise<ReferralEvent[]> {
  const { partner } = await requireActivePartner();

  // Validate ObjectId format
  if (!ObjectId.isValid(referralId)) {
    throw new Error('Referido no encontrado');
  }

  const referralsCollection = await getReferralsCollection();
  const referral = await referralsCollection.findOne({
    _id: new ObjectId(referralId),
  });

  if (!referral) {
    throw new Error('Referido no encontrado');
  }

  if (!referral.partnerId.equals(partner._id)) {
    throw new Error('Referido no encontrado');
  }

  const eventsCollection = await getReferralEventsCollection();
  const events = await eventsCollection
    .find({ referralId: new ObjectId(referralId) })
    .sort({ createdAt: -1 })
    .toArray();

  // Remove private notes (admin-only) and serialize
  return events.map((event) =>
    toPlainObject({
      ...event,
      notePrivate: undefined,
    }) as unknown as ReferralEvent
  );
}

// Get partner's projects (safe data only - NO financials)
export async function getMyProjects(): Promise<SafeProject[]> {
  const { partner } = await requireActivePartner();

  const projectsCollection = await getProjectsCollection();
  const projects = await projectsCollection
    .find({ partnerId: partner._id })
    .sort({ createdAt: -1 })
    .toArray();

  // Return only safe fields (no internalName, no financials) with serialization
  return projects.map((proj) =>
    toPlainObject({
      _id: proj._id,
      publicAlias: proj.publicAlias,
      status: proj.status,
      createdAt: proj.createdAt,
    }) as unknown as SafeProject
  );
}

// Get partner's commissions (safe summary only - NO project financials)
export async function getMyCommissions(): Promise<PartnerCommission[]> {
  const { partner } = await requireActivePartner();

  const commissionsCollection = await getPartnerCommissionsCollection();
  const commissions = await commissionsCollection
    .find({ partnerId: partner._id })
    .sort({ createdAt: -1 })
    .toArray();

  return commissions.map((commission) =>
    toPlainObject(commission) as unknown as PartnerCommission
  );
}

// Get partner's payouts
export async function getMyPayouts(): Promise<CommissionPayout[]> {
  const { partner } = await requireActivePartner();

  const payoutsCollection = await getCommissionPayoutsCollection();
  const payouts = await payoutsCollection
    .find({ partnerId: partner._id })
    .sort({ scheduledAt: -1 })
    .toArray();

  return payouts.map((payout) =>
    toPlainObject(payout) as unknown as CommissionPayout
  );
}

// Get partner dashboard stats
export async function getPartnerDashboardStats() {
  const { partner } = await requireActivePartner();

  const referralsCollection = await getReferralsCollection();
  const commissionsCollection = await getPartnerCommissionsCollection();
  const payoutsCollection = await getCommissionPayoutsCollection();

  const [
    totalReferrals,
    activeReferrals,
    wonProjects,
    totalCommissions,
    paidCommissions,
  ] = await Promise.all([
    referralsCollection.countDocuments({ partnerId: partner._id }),
    referralsCollection.countDocuments({
      partnerId: partner._id,
      status: {
        $in: [
          'INTAKE_SUBMITTED',
          'IN_REVIEW',
          'ACCEPTED',
          'PROPOSAL_SENT',
          'NEGOTIATION',
        ],
      },
    }),
    referralsCollection.countDocuments({
      partnerId: partner._id,
      status: 'WON',
    }),
    commissionsCollection
      .aggregate([
        { $match: { partnerId: partner._id } },
        { $group: { _id: null, total: { $sum: '$commissionAmountMxn' } } },
      ])
      .toArray(),
    payoutsCollection
      .aggregate([
        { $match: { partnerId: partner._id, status: 'PAID' } },
        { $group: { _id: null, total: { $sum: '$amountMxn' } } },
      ])
      .toArray(),
  ]);

  return {
    totalReferrals,
    activeReferrals,
    wonProjects,
    totalCommissionsEarned: totalCommissions[0]?.total || 0,
    totalPaid: paidCommissions[0]?.total || 0,
  };
}
