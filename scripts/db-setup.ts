import { getDb } from '../src/lib/db/client';
import { createIndexes } from '../src/lib/db/indexes';

async function setupDatabase() {
  console.log('🔧 Setting up database...\n');

  try {
    const db = await getDb();

    // List of collections to create
    const collections = [
      'partners',
      'referrals',
      'lead_intakes',
      'dedupe_registry',
      'projects',
      'project_financials',
      'partner_commissions',
      'commission_payouts',
      'referral_events',
    ];

    // Get existing collections
    const existingCollections = await db.listCollections().toArray();
    const existingNames = existingCollections.map((col: { name: string }) => col.name);

    // Create missing collections
    for (const collectionName of collections) {
      if (!existingNames.includes(collectionName)) {
        await db.createCollection(collectionName);
        console.log(`✅ Created collection: ${collectionName}`);
      } else {
        console.log(`⏭️  Collection already exists: ${collectionName}`);
      }
    }

    console.log('\n🔍 Creating indexes...\n');
    await createIndexes();

    console.log('\n✨ Database setup completed successfully!');
    if (typeof process !== 'undefined') process.exit(0);
  } catch (error) {
    console.error('❌ Database setup failed:', error);
    if (typeof process !== 'undefined') process.exit(1);
  }
}

setupDatabase();
