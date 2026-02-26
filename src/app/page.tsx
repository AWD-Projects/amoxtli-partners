import { auth, currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { getPartnersCollection } from '@/lib/db';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  let userId: string | null = null;

  try {
    const authResult = await auth();
    userId = authResult.userId;
  } catch (error) {
    console.error('[HomePage] Auth check failed:', error);
    redirect('/sign-in');
  }

  if (!userId) {
    redirect('/sign-in');
  }

  let user;
  try {
    user = await currentUser();
  } catch (error) {
    console.error('[HomePage] Failed to fetch current user:', error);
    redirect('/sign-in');
  }

  const email = user?.emailAddresses[0]?.emailAddress;

  // Check if super admin
  if (email === process.env.SUPER_ADMIN_EMAIL) {
    redirect('/admin/dashboard');
  }

  // Check if partner
  try {
    const partnersCollection = await getPartnersCollection();
    const partner = await partnersCollection.findOne({ clerkUserId: userId });

    if (partner) {
      redirect('/partner/dashboard');
    }
  } catch (error) {
    console.error('[HomePage] Failed to query partners:', error);
    // Continue to onboarding as fallback
  }

  // New user - redirect to partner onboarding
  redirect('/partner/onboarding');
}
