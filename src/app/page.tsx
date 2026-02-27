import { auth, currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { getPartnersCollection } from '@/lib/db';

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

  // New user — send to onboarding to fill in their profile
  if (!partner) {
    redirect('/partner/onboarding');
  }

  // Route based on partner status
  if (partner.status === 'SUSPENDED') redirect('/partner/suspended');
  if (partner.status === 'PENDING') redirect('/partner/pending');
  redirect('/partner/dashboard');
}
