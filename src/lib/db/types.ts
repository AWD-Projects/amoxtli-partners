import { ObjectId } from 'mongodb';

// Status types
export type PartnerStatus = 'PENDING' | 'ACTIVE' | 'SUSPENDED';

export type ReferralStatus =
  | 'LINK_CREATED'
  | 'INTAKE_SUBMITTED'
  | 'IN_REVIEW'
  | 'ACCEPTED'
  | 'REJECTED'
  | 'PROPOSAL_SENT'
  | 'NEGOTIATION'
  | 'WON'
  | 'LOST'
  | 'PAYMENT_RECEIVED'
  | 'COMMISSION_PENDING'
  | 'COMMISSION_PARTIALLY_PAID'
  | 'COMMISSION_PAID';

export type CommissionStatus =
  | 'COMMISSION_PENDING'
  | 'COMMISSION_PARTIALLY_PAID'
  | 'COMMISSION_PAID';

export type PayoutStatus = 'SCHEDULED' | 'PAID' | 'FAILED';

export type PayoutPart = 1 | 2;

export type ActorRole = 'SYSTEM' | 'PARTNER' | 'ADMIN';

// Collection documents
export interface Partner {
  _id: ObjectId;
  clerkUserId: string;
  status: PartnerStatus;
  displayName: string;
  createdAt: Date;
}

export interface Referral {
  _id: ObjectId;
  partnerId: ObjectId;
  referralCode: string;
  status: ReferralStatus;
  createdAt: Date;
  protectionExpiresAt: Date;
  lastUpdatedAt: Date;
}

export interface LeadIntake {
  _id: ObjectId;
  referralId: ObjectId;
  companyName: string;
  contactName: string;
  email: string;
  phone: string;
  message: string;
  dedupeKey: string;
  createdAt: Date;
}

export interface DedupeRegistry {
  _id: ObjectId;
  dedupeKey: string;
  firstReferralId: ObjectId;
  firstPartnerId: ObjectId;
  expiresAt: Date;
}

export interface Project {
  _id: ObjectId;
  referralId: ObjectId;
  partnerId: ObjectId; // denormalized for faster partner queries
  publicAlias: string;
  internalName: string; // admin-only
  status: ReferralStatus;
  createdAt: Date;
}

export interface ProjectFinancials {
  _id: ObjectId;
  projectId: ObjectId;
  amountChargedMxn: number;
  directCostsMxn: number;
  profitNetMxn: number;
  commissionRate: number;
  commissionAmountMxn: number;
  profitConfirmedAt: Date;
}

export interface PartnerCommission {
  _id: ObjectId;
  partnerId: ObjectId;
  projectId: ObjectId;
  commissionAmountMxn: number;
  status: CommissionStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface CommissionPayout {
  _id: ObjectId;
  partnerId: ObjectId;
  projectId: ObjectId;
  amountMxn: number;
  part: PayoutPart;
  status: PayoutStatus;
  scheduledAt: Date;
  paidAt?: Date;
}

export interface ReferralEvent {
  _id: ObjectId;
  referralId: ObjectId;
  actorRole: ActorRole;
  fromStatus?: ReferralStatus;
  toStatus: ReferralStatus;
  notePublic?: string;
  notePrivate?: string; // admin-only
  createdAt: Date;
}

// Safe types for partners (exclude sensitive fields)
export interface SafeProject {
  _id: ObjectId;
  publicAlias: string;
  status: ReferralStatus;
  createdAt: Date;
}

export interface SafeReferral {
  _id: ObjectId;
  referralCode: string;
  status: ReferralStatus;
  createdAt: Date;
  lastUpdatedAt: Date;
}
