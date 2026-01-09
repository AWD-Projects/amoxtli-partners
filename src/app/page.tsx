import { auth, currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { getPartnersCollection } from '@/lib/db';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const { userId } = await auth();

  if (!userId) {
    redirect('/sign-in');
  }

  const user = await currentUser();
  const email = user?.emailAddresses[0]?.emailAddress;

  // Check if super admin
  if (email === process.env.SUPER_ADMIN_EMAIL) {
    redirect('/admin/dashboard');
  }

  // Check if partner
  const partnersCollection = await getPartnersCollection();
  const partner = await partnersCollection.findOne({ clerkUserId: userId });

  if (partner) {
    redirect('/partner/dashboard');
  }

  // New user - redirect to partner onboarding
  redirect('/partner/onboarding');
}
