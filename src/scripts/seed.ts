/**
 * Database seed script.
 * Run: npx ts-node --project tsconfig.json src/scripts/seed.ts
 * Or via npm run seed
 *
 * Seeds: 2 users (admin + user), 5 charities, and sample draws.
 */
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function seed() {
  const uri = process.env.MONGODB_URI!;
  if (!uri) throw new Error('MONGODB_URI not found in .env.local');

  console.log('🔌 Connecting to MongoDB...');
  await mongoose.connect(uri);
  console.log('✅ Connected!');

  // Dynamic imports to avoid circular issues with model registry
  const { User } = await import('../models/User');
  const { Charity } = await import('../models/Charity');
  const { Subscription } = await import('../models/Subscription');

  // ── Users ──────────────────────────────────────────────
  console.log('👥 Seeding users...');
  await User.deleteMany({});

  const adminEmail = process.env.SEED_ADMIN_EMAIL || 'admin@digitalheroes.com';
  const adminPass = process.env.SEED_ADMIN_PASSWORD || 'Admin@123456';
  const userEmail = process.env.SEED_USER_EMAIL || 'user@digitalheroes.com';
  const userPass = process.env.SEED_USER_PASSWORD || 'User@123456';

  const admin = await User.create({ email: adminEmail, password: adminPass, fullName: 'Admin User', role: 'admin' });
  const user = await User.create({ email: userEmail, password: userPass, fullName: 'Demo Player', role: 'user' });

  // ── Subscriptions ──────────────────────────────────────
  await Subscription.deleteMany({});
  await Subscription.create({ userId: user._id, planType: 'monthly', status: 'active', amount: 999 });
  await Subscription.create({ userId: admin._id, planType: 'yearly', status: 'active', amount: 9990 });

  // ── Charities ──────────────────────────────────────────
  console.log('💚 Seeding charities...');
  await Charity.deleteMany({});
  await Charity.insertMany([
    {
      name: 'Youth Golf Foundation',
      slug: 'youth-golf-foundation',
      shortDescription: 'Bringing golf to young people from all backgrounds.',
      description: 'The Youth Golf Foundation works tirelessly to provide access to golf for children in underserved communities. Through equipment grants, coaching programmes, and course partnerships, we help the next generation discover the sport.',
      category: 'Youth',
      isFeatured: true,
      isActive: true,
      totalReceived: 128000,
    },
    {
      name: 'Greenway Environmental Trust',
      slug: 'greenway-environmental-trust',
      shortDescription: 'Protecting natural landscapes and biodiversity.',
      description: 'A UK-based charity focused on preserving and restoring natural habitats, supporting sustainable land management, and educating communities about environmental stewardship.',
      category: 'Environment',
      isFeatured: true,
      isActive: true,
      totalReceived: 87500,
    },
    {
      name: 'Veterans Sports Alliance',
      slug: 'veterans-sports-alliance',
      shortDescription: 'Sport as therapy for military veterans.',
      description: 'We use the healing power of sport to support veterans dealing with physical and psychological challenges. Golf programmes, team sports, and community events help veterans rebuild and reconnect.',
      category: 'Veterans',
      isFeatured: false,
      isActive: true,
      totalReceived: 56200,
    },
    {
      name: 'Children\'s Cancer Research Fund',
      slug: 'childrens-cancer-research-fund',
      shortDescription: 'Funding breakthrough research for children with cancer.',
      description: 'Every pound donated goes directly to funding research labs, clinical trials, and family support programmes for children diagnosed with cancer across the UK.',
      category: 'Health',
      isFeatured: false,
      isActive: true,
      totalReceived: 204800,
    },
    {
      name: 'Community Kitchen Network',
      slug: 'community-kitchen-network',
      shortDescription: 'Fighting hunger one meal at a time.',
      description: 'A grassroots network of volunteer-run community kitchens providing nutritious free meals to those in need, reducing food waste, and building community bonds.',
      category: 'Community',
      isFeatured: false,
      isActive: true,
      totalReceived: 32400,
    },
  ]);

  console.log('\n✅ Seed complete!');
  console.log('─'.repeat(40));
  console.log(`👤 User:  ${userEmail} / ${userPass}`);
  console.log(`⚡ Admin: ${adminEmail} / ${adminPass}`);
  console.log('─'.repeat(40));

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
