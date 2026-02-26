'use server';

import { ObjectId } from 'mongodb';
import { requireAdmin } from '@/lib/auth';
import {
  getPartnersCollection,
  getReferralsCollection,
  getLeadIntakesCollection,
  getProjectsCollection,
  getProjectFinancialsCollection,
  getPartnerCommissionsCollection,
  getCommissionPayoutsCollection,
  getReferralEventsCollection,
} from '@/lib/db';
import {
  updatePartnerStatusSchema,
  createProjectSchema,
  updateProjectFinancialsSchema,
  updateReferralStatusSchema,
  schedulePayoutSchema,
  markPayoutPaidSchema,
} from '@/lib/validators';
import { calculateCommission, canSchedulePayout } from '@/lib/antifraud';
import { toPlainObject } from '@/lib/serializers';
import type {
  Partner,
  Referral,
  LeadIntake,
  Project,
  ProjectFinancials,
  ReferralEvent,
  CommissionPayout,
  PartnerCommission,
} from '@/lib/db/types';

// Get all partners
export async function getAllPartners(): Promise<Partner[]> {
  await requireAdmin();

  const partnersCollection = await getPartnersCollection();
  const partners = await partnersCollection
    .find({})
    .sort({ createdAt: -1 })
    .toArray();
  return partners.map((partner) => toPlainObject(partner)) as unknown as Partner[];
}

// Update partner status (approve/suspend)
export async function updatePartnerStatus(data: {
  partnerId: string;
  status: 'ACTIVE' | 'SUSPENDED';
}) {
  await requireAdmin();

  const validated = updatePartnerStatusSchema.parse(data);

  const partnersCollection = await getPartnersCollection();
  const result = await partnersCollection.updateOne(
    { _id: new ObjectId(validated.partnerId) },
    { $set: { status: validated.status } }
  );

  if (result.matchedCount === 0) {
    throw new Error('Socio no encontrado');
  }

  return { success: true };
}

// Get all referrals with full details
export async function getAllReferrals(): Promise<Referral[]> {
  await requireAdmin();

  const referralsCollection = await getReferralsCollection();
  const referrals = await referralsCollection
    .find({})
    .sort({ createdAt: -1 })
    .toArray();
  return referrals.map((referral) => toPlainObject(referral)) as unknown as Referral[];
}

// Get lead intake (SENSITIVE - admin only)
export async function getLeadIntake(referralId: string): Promise<LeadIntake> {
  await requireAdmin();

  const intakesCollection = await getLeadIntakesCollection();
  const intake = await intakesCollection.findOne({
    referralId: new ObjectId(referralId),
  });

  if (!intake) {
    throw new Error('Formulario de lead no encontrado');
  }

  return toPlainObject(intake) as unknown as LeadIntake;
}

// Update referral status
export async function updateReferralStatus(data: {
  referralId: string;
  newStatus: string;
  notePublic?: string;
  notePrivate?: string;
}) {
  await requireAdmin();

  const validated = updateReferralStatusSchema.parse(data);

  const referralsCollection = await getReferralsCollection();
  const referral = await referralsCollection.findOne({
    _id: new ObjectId(validated.referralId),
  });

  if (!referral) {
    throw new Error('Referido no encontrado');
  }

  const oldStatus = referral.status;

  await referralsCollection.updateOne(
    { _id: new ObjectId(validated.referralId) },
    {
      $set: {
        status: validated.newStatus,
        lastUpdatedAt: new Date(),
      },
    }
  );

  // Create event
  const eventsCollection = await getReferralEventsCollection();
  await eventsCollection.insertOne({
    _id: new ObjectId(),
    referralId: new ObjectId(validated.referralId),
    actorRole: 'ADMIN',
    fromStatus: oldStatus,
    toStatus: validated.newStatus as any,
    notePublic: validated.notePublic,
    notePrivate: validated.notePrivate,
    createdAt: new Date(),
  });

  return { success: true };
}

// Create project from referral
export async function createProject(data: {
  referralId: string;
  publicAlias: string;
  internalName: string;
}) {
  await requireAdmin();

  const validated = createProjectSchema.parse(data);

  const referralsCollection = await getReferralsCollection();
  const referral = await referralsCollection.findOne({
    _id: new ObjectId(validated.referralId),
  });

  if (!referral) {
    throw new Error('Referido no encontrado');
  }

  // Validate referral is WON
  if (referral.status !== 'WON') {
    throw new Error('Solo puedes crear proyectos para referidos ganados (status WON)');
  }

  // Check if project already exists for this referral
  const projectsCollection = await getProjectsCollection();
  const existingProject = await projectsCollection.findOne({
    referralId: new ObjectId(validated.referralId),
  });

  if (existingProject) {
    throw new Error('Ya existe un proyecto para este referido');
  }

  const result = await projectsCollection.insertOne({
    _id: new ObjectId(),
    referralId: new ObjectId(validated.referralId),
    partnerId: referral.partnerId,
    publicAlias: validated.publicAlias,
    internalName: validated.internalName,
    status: referral.status,
    createdAt: new Date(),
  });

  return { success: true, projectId: result.insertedId.toString() };
}

// Check if referral has project
export async function getReferralProject(referralId: string): Promise<Project | null> {
  await requireAdmin();

  const projectsCollection = await getProjectsCollection();
  const project = await projectsCollection.findOne({
    referralId: new ObjectId(referralId),
  });

  if (!project) {
    return null;
  }

  return toPlainObject(project) as unknown as Project;
}

// Get all projects
export async function getAllProjects(): Promise<Project[]> {
  await requireAdmin();

  const projectsCollection = await getProjectsCollection();
  const projects = await projectsCollection
    .find({})
    .sort({ createdAt: -1 })
    .toArray();
  return projects.map((project) => toPlainObject(project)) as unknown as Project[];
}

// Get project financials
export async function getProjectFinancials(
  projectId: string
): Promise<ProjectFinancials | null> {
  await requireAdmin();

  const financialsCollection = await getProjectFinancialsCollection();
  const financials = await financialsCollection.findOne({
    projectId: new ObjectId(projectId),
  });

  if (!financials) {
    return null;
  }

  return toPlainObject(financials) as unknown as ProjectFinancials;
}

// Update project financials
export async function updateProjectFinancials(data: {
  projectId: string;
  amountChargedMxn: number;
  directCostsMxn: number;
  commissionRate: number;
}) {
  await requireAdmin();

  const validated = updateProjectFinancialsSchema.parse(data);

  // Calculate profit and commission
  const profitNetMxn =
    validated.amountChargedMxn - validated.directCostsMxn;
  const commissionAmountMxn = calculateCommission(
    profitNetMxn,
    validated.commissionRate
  );

  const financialsCollection = await getProjectFinancialsCollection();

  // Upsert financials
  await financialsCollection.updateOne(
    { projectId: new ObjectId(validated.projectId) },
    {
      $set: {
        amountChargedMxn: validated.amountChargedMxn,
        directCostsMxn: validated.directCostsMxn,
        profitNetMxn,
        commissionRate: validated.commissionRate,
        commissionAmountMxn,
        profitConfirmedAt: new Date(),
      },
    },
    { upsert: true }
  );

  // Get project to find partnerId
  const projectsCollection = await getProjectsCollection();
  const project = await projectsCollection.findOne({
    _id: new ObjectId(validated.projectId),
  });

  if (!project) {
    throw new Error('Proyecto no encontrado');
  }

  // Create/update partner_commissions record (safe for partners to read)
  const commissionsCollection = await getPartnerCommissionsCollection();
  await commissionsCollection.updateOne(
    { projectId: new ObjectId(validated.projectId) },
    {
      $set: {
        partnerId: project.partnerId,
        commissionAmountMxn,
        status: 'COMMISSION_PENDING',
        updatedAt: new Date(),
      },
      $setOnInsert: {
        _id: new ObjectId(),
        projectId: new ObjectId(validated.projectId),
        createdAt: new Date(),
      },
    },
    { upsert: true }
  );

  return {
    success: true,
    profitNetMxn,
    commissionAmountMxn,
  };
}

// Schedule payout
export async function schedulePayout(data: {
  projectId: string;
  part: 1 | 2;
}) {
  await requireAdmin();

  const validated = schedulePayoutSchema.parse(data);

  const projectsCollection = await getProjectsCollection();
  const project = await projectsCollection.findOne({
    _id: new ObjectId(validated.projectId),
  });

  if (!project) {
    throw new Error('Proyecto no encontrado');
  }

  // Validate project status
  const eligibleStatuses = [
    'WON',
    'PAYMENT_RECEIVED',
    'COMMISSION_PENDING',
    'COMMISSION_PARTIALLY_PAID',
  ];

  if (!eligibleStatuses.includes(project.status)) {
    throw new Error('El proyecto debe estar en status WON o posterior para programar pagos');
  }

  const commissionsCollection = await getPartnerCommissionsCollection();
  const commission = await commissionsCollection.findOne({
    projectId: new ObjectId(validated.projectId),
  });

  if (!commission) {
    throw new Error('El proyecto debe tener finanzas configuradas para programar pagos');
  }

  const payoutAmount = commission.commissionAmountMxn / 2;

  // Check caps
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const yearStart = new Date(now.getFullYear(), 0, 1);

  const payoutsCollection = await getCommissionPayoutsCollection();

  const [monthlyPaid, yearlyPaid] = await Promise.all([
    payoutsCollection
      .aggregate([
        {
          $match: {
            partnerId: project.partnerId,
            status: { $in: ['SCHEDULED', 'PAID'] },
            scheduledAt: { $gte: monthStart },
          },
        },
        { $group: { _id: null, total: { $sum: '$amountMxn' } } },
      ])
      .toArray(),
    payoutsCollection
      .aggregate([
        {
          $match: {
            partnerId: project.partnerId,
            status: { $in: ['SCHEDULED', 'PAID'] },
            scheduledAt: { $gte: yearStart },
          },
        },
        { $group: { _id: null, total: { $sum: '$amountMxn' } } },
      ])
      .toArray(),
  ]);

  const currentMonthTotal = monthlyPaid[0]?.total || 0;
  const currentYearTotal = yearlyPaid[0]?.total || 0;

  const capCheck = canSchedulePayout(
    currentMonthTotal,
    currentYearTotal,
    payoutAmount
  );

  if (!capCheck.allowed) {
    throw new Error(capCheck.reason);
  }

  // Check if payout already exists
  const existing = await payoutsCollection.findOne({
    projectId: new ObjectId(validated.projectId),
    part: validated.part,
  });

  if (existing) {
    throw new Error(`El payout parte ${validated.part} ya existe`);
  }

  await payoutsCollection.insertOne({
    _id: new ObjectId(),
    partnerId: project.partnerId,
    projectId: new ObjectId(validated.projectId),
    amountMxn: payoutAmount,
    part: validated.part,
    status: 'SCHEDULED',
    scheduledAt: now,
  });

  // Update commission status
  const hasPart1 = await payoutsCollection.findOne({
    projectId: new ObjectId(validated.projectId),
    part: 1,
  });
  const hasPart2 = await payoutsCollection.findOne({
    projectId: new ObjectId(validated.projectId),
    part: 2,
  });

  let newCommissionStatus: 'COMMISSION_PENDING' | 'COMMISSION_PARTIALLY_PAID' | 'COMMISSION_PAID' = 'COMMISSION_PENDING';

  if (hasPart1 && hasPart2) {
    const allPaid =
      hasPart1.status === 'PAID' && hasPart2.status === 'PAID';
    newCommissionStatus = allPaid ? 'COMMISSION_PAID' : 'COMMISSION_PARTIALLY_PAID';
  } else if (hasPart1 || hasPart2) {
    newCommissionStatus = 'COMMISSION_PARTIALLY_PAID';
  }

  await commissionsCollection.updateOne(
    { projectId: new ObjectId(validated.projectId) },
    { $set: { status: newCommissionStatus, updatedAt: now } }
  );

  return { success: true };
}

// Mark payout as paid
export async function markPayoutPaid(data: { payoutId: string }) {
  await requireAdmin();

  const validated = markPayoutPaidSchema.parse(data);

  const payoutsCollection = await getCommissionPayoutsCollection();
  const payout = await payoutsCollection.findOne({
    _id: new ObjectId(validated.payoutId),
  });

  if (!payout) {
    throw new Error('Payout no encontrado');
  }

  await payoutsCollection.updateOne(
    { _id: new ObjectId(validated.payoutId) },
    { $set: { status: 'PAID', paidAt: new Date() } }
  );

  // Update commission status
  const allPayouts = await payoutsCollection
    .find({ projectId: payout.projectId })
    .toArray();

  const allPaid = allPayouts.every((p) => p.status === 'PAID');

  const commissionsCollection = await getPartnerCommissionsCollection();
  await commissionsCollection.updateOne(
    { projectId: payout.projectId },
    {
      $set: {
        status: allPaid ? 'COMMISSION_PAID' : 'COMMISSION_PARTIALLY_PAID',
        updatedAt: new Date(),
      },
    }
  );

  return { success: true };
}

// Get all commissions
export async function getAllCommissions(): Promise<PartnerCommission[]> {
  await requireAdmin();

  const commissionsCollection = await getPartnerCommissionsCollection();
  const commissions = await commissionsCollection
    .find({})
    .sort({ createdAt: -1 })
    .toArray();
  return commissions.map((commission) => toPlainObject(commission)) as unknown as PartnerCommission[];
}

// Get all payouts
export async function getAllPayouts(): Promise<CommissionPayout[]> {
  await requireAdmin();

  const payoutsCollection = await getCommissionPayoutsCollection();
  const payouts = await payoutsCollection
    .find({})
    .sort({ scheduledAt: -1 })
    .toArray();
  return payouts.map((payout) => toPlainObject(payout)) as unknown as CommissionPayout[];
}

// Get referral events (with private notes)
export async function getAdminReferralTimeline(
  referralId: string
): Promise<ReferralEvent[]> {
  await requireAdmin();

  const eventsCollection = await getReferralEventsCollection();
  const events = await eventsCollection
    .find({ referralId: new ObjectId(referralId) })
    .sort({ createdAt: -1 })
    .toArray();

  return events.map((event) => toPlainObject(event)) as unknown as ReferralEvent[];
}
