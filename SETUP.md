# Quick Setup Guide

Follow these steps to get Amoxtli Partners running locally.

## 1. Install Dependencies

```bash
npm install
```

## 2. Set Up Environment Variables

Create `.env.local` in the project root:

```bash
cp .env.local.example .env.local
```

Edit `.env.local` with your values:

```env
# MongoDB Connection
MONGODB_URI="mongodb://localhost:27017/amoxtli-partners"
# Or use MongoDB Atlas: "mongodb+srv://username:password@cluster.mongodb.net/amoxtli-partners"

# Clerk Authentication
# Get these from: https://dashboard.clerk.com
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."
CLERK_SECRET_KEY="sk_test_..."

# Super Admin Email
# The user with this email will have admin access
SUPER_ADMIN_EMAIL="awd@amoxtli.tech"
```

### Getting Clerk Credentials

1. Go to [https://dashboard.clerk.com](https://dashboard.clerk.com)
2. Create a new application (or use existing)
3. Go to "API Keys" in the sidebar
4. Copy:
   - Publishable key → `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
   - Secret key → `CLERK_SECRET_KEY`

### MongoDB Setup

**Option A: Local MongoDB**
```bash
# Install MongoDB (macOS with Homebrew)
brew tap mongodb/brew
brew install mongodb-community

# Start MongoDB
brew services start mongodb-community

# Use connection string:
MONGODB_URI="mongodb://localhost:27017/amoxtli-partners"
```

**Option B: MongoDB Atlas (Cloud)**
1. Go to [https://www.mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster
3. Get connection string from "Connect" → "Connect your application"
4. Replace `<password>` with your database password
5. Use connection string in `.env.local`

## 3. Initialize Database

Run the setup script to create collections and indexes:

```bash
npm run db:setup
```

You should see:
```
✅ Created collection: partners
✅ Created collection: referrals
...
✅ All indexes created successfully
✨ Database setup completed successfully!
```

## 4. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 5. Create Your First Admin Account

1. Go to [http://localhost:3000/sign-up](http://localhost:3000/sign-up)
2. Sign up with the email you set as `SUPER_ADMIN_EMAIL`
3. Complete Clerk verification
4. You'll be redirected to the admin dashboard

## 6. Create a Partner Account (Testing)

1. Sign out from admin account
2. Sign up with a different email
3. Complete partner onboarding (enter display name)
4. You'll see "Pending Approval" page
5. Sign back in as admin
6. Go to Admin → Partners
7. Approve the partner
8. Sign back in as partner → You can now create referrals

## Common Issues

### "Cannot connect to MongoDB"
- Check if MongoDB is running: `brew services list` (macOS)
- Verify `MONGODB_URI` is correct
- If using Atlas, check:
  - Database user password is correct
  - IP whitelist includes your IP (or use 0.0.0.0/0 for testing)

### "Clerk keys not found"
- Verify you copied the keys correctly
- Make sure `.env.local` exists and is in project root
- Restart dev server after adding env vars

### "TypeScript errors in db-setup.ts"
- These are expected in some IDEs due to process global
- The script will run correctly via `npm run db:setup`

### "User not recognized as admin"
- Verify `SUPER_ADMIN_EMAIL` exactly matches your Clerk account email
- Check Clerk dashboard → Users to see the user's email
- Email is case-insensitive but must match exactly

## Next Steps

After setup:

1. **Admin**: Review the admin dashboard at `/admin/dashboard`
2. **Partner**: Test the partner flow:
   - Create referral link
   - Open link in incognito window
   - Submit intake form
   - Review as admin
   - Set financials and payouts
3. **Read**: Check `README.md` and `SECURITY.md` for detailed documentation

## Production Deployment

Before deploying to production:

1. Set up production MongoDB (Atlas recommended)
2. Set up production Clerk instance
3. Update environment variables in hosting platform
4. Run `npm run build` to verify no errors
5. Enable Clerk production mode
6. Set up proper domain and SSL

### Vercel Deployment

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

Environment variables to set in Vercel:
- `MONGODB_URI`
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`
- `SUPER_ADMIN_EMAIL`

## Support

For issues or questions:
- Check `README.md` for detailed documentation
- Review `SECURITY.md` for security architecture
- Check TypeScript errors in your IDE
- Verify all environment variables are set correctly
