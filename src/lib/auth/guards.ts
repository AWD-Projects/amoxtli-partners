import { auth, currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { getPartnersCollection } from '@/lib/db';
import type { Partner } from '@/lib/db/types';

export interface AuthenticatedUser {
  clerkUserId: string;
  email: string;
  isSuperAdmin: boolean;
  partner?: Partner;
}

export async function requireSignedIn(): Promise<AuthenticatedUser> {
  const { userId } = await auth();

  if (!userId) {
    redirect('/sign-in');
  }

  const user = await currentUser();

  if (!user) {
    throw new Error('User not found');
  }

  const email = user.emailAddresses[0]?.emailAddress;

  if (!email) {
    throw new Error('User email not found');
  }

  const isSuperAdmin = email === process.env.SUPER_ADMIN_EMAIL;

  // Try to find partner record
  const partnersCollection = await getPartnersCollection();
  const partner = await partnersCollection.findOne({ clerkUserId: userId });

  return {
    clerkUserId: userId,
    email,
    isSuperAdmin,
    partner: partner || undefined,
  };
}

export async function requireAdmin(): Promise<AuthenticatedUser> {
  const user = await requireSignedIn();

  if (!user.isSuperAdmin) {
    redirect('/unauthorized');
  }

  return user;
}

export async function requireActivePartner(): Promise<
  AuthenticatedUser & { partner: Partner }
> {
  const user = await requireSignedIn();

  if (!user.partner) {
    redirect('/partner/onboarding');
  }

  if (user.partner.status === 'SUSPENDED') {
    redirect('/partner/suspended');
  }

  if (user.partner.status === 'PENDING') {
    redirect('/partner/pending');
  }

  return {
    ...user,
    partner: user.partner,
  };
}

export async function requirePartner(): Promise<
  AuthenticatedUser & { partner: Partner }
> {
  const user = await requireSignedIn();

  if (!user.partner) {
    redirect('/partner/onboarding');
  }

  return {
    ...user,
    partner: user.partner,
  };
}
