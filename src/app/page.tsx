import { auth, currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { getPartnersCollection } from '@/lib/db';
import { ObjectId } from 'mongodb';
import { generateReferralCode } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const authResult = await auth();
  const userId = authResult.userId;

  if (!userId) {
    redirect('/sign-in');
  }

  const user = await currentUser();
  if (!user) {
    redirect('/sign-in');
  }

  const email = user.emailAddresses[0]?.emailAddress ?? '';

  // Admin
  if (email === process.env.SUPER_ADMIN_EMAIL) {
    redirect('/admin/dashboard');
  }

  const partnersCollection = await getPartnersCollection();
  let partner = await partnersCollection.findOne({ clerkUserId: userId });

  // Auto-create partner profile for new users (Google OAuth or email)
  if (!partner) {
    const displayName =
      user.fullName ||
      `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim() ||
      email.split('@')[0] ||
      'Partner';

    await partnersCollection.insertOne({
      _id: new ObjectId(),
      clerkUserId: userId,
      status: 'PENDING',
      displayName,
      createdAt: new Date(),
    });

    redirect('/partner/pending');
  }

  // Route based on partner status
  if (partner.status === 'SUSPENDED') redirect('/partner/suspended');
  if (partner.status === 'PENDING') redirect('/partner/pending');
  redirect('/partner/dashboard');
}
