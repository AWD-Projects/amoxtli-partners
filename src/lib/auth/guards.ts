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
  let userId: string | null = null;

  try {
    const authResult = await auth();
    userId = authResult.userId;
  } catch (error) {
    console.error('[Auth] Failed to get auth session:', error);
    redirect('/sign-in');
  }

  if (!userId) {
    redirect('/sign-in');
  }

  let user;
  try {
    user = await currentUser();
  } catch (error) {
    console.error('[Auth] Failed to fetch current user from Clerk:', error);
    redirect('/sign-in');
  }

  if (!user) {
    redirect('/sign-in');
  }

  const email = user.emailAddresses[0]?.emailAddress;

  if (!email) {
    console.error('[Auth] User has no email addresses:', userId);
    redirect('/sign-in');
  }

  const isSuperAdmin = email === process.env.SUPER_ADMIN_EMAIL;

  let partner: Partner | null = null;
  try {
    const partnersCollection = await getPartnersCollection();
    partner = await partnersCollection.findOne({ clerkUserId: userId });
  } catch (error) {
    console.error('[Auth] Failed to query partners collection:', error);
    // Continue without partner data - page can handle this
  }

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
