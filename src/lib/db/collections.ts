import { Collection } from 'mongodb';
import { getDb } from './client';
import type {
  Partner,
  Referral,
  LeadIntake,
  DedupeRegistry,
  Project,
  ProjectFinancials,
  PartnerCommission,
  CommissionPayout,
  ReferralEvent,
} from './types';

export async function getPartnersCollection(): Promise<Collection<Partner>> {
  const db = await getDb();
  return db.collection<Partner>('partners');
}

export async function getReferralsCollection(): Promise<Collection<Referral>> {
  const db = await getDb();
  return db.collection<Referral>('referrals');
}

export async function getLeadIntakesCollection(): Promise<
  Collection<LeadIntake>
> {
  const db = await getDb();
  return db.collection<LeadIntake>('lead_intakes');
}

export async function getDedupeRegistryCollection(): Promise<
  Collection<DedupeRegistry>
> {
  const db = await getDb();
  return db.collection<DedupeRegistry>('dedupe_registry');
}

export async function getProjectsCollection(): Promise<Collection<Project>> {
  const db = await getDb();
  return db.collection<Project>('projects');
}

export async function getProjectFinancialsCollection(): Promise<
  Collection<ProjectFinancials>
> {
  const db = await getDb();
  return db.collection<ProjectFinancials>('project_financials');
}

export async function getPartnerCommissionsCollection(): Promise<
  Collection<PartnerCommission>
> {
  const db = await getDb();
  return db.collection<PartnerCommission>('partner_commissions');
}

export async function getCommissionPayoutsCollection(): Promise<
  Collection<CommissionPayout>
> {
  const db = await getDb();
  return db.collection<CommissionPayout>('commission_payouts');
}

export async function getReferralEventsCollection(): Promise<
  Collection<ReferralEvent>
> {
  const db = await getDb();
  return db.collection<ReferralEvent>('referral_events');
}
