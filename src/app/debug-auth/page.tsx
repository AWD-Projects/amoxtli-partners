import { auth, currentUser } from '@clerk/nextjs/server';

export const dynamic = 'force-dynamic';

export default async function DebugAuthPage() {
  const { userId } = await auth();
  const user = await currentUser();
  const email = user?.emailAddresses[0]?.emailAddress;

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-2xl mx-auto bg-card rounded-lg shadow-card p-6">
        <h1 className="text-2xl font-bold mb-4">Debug Auth Info</h1>

        <div className="space-y-4">
          <div>
            <strong>User ID:</strong>
            <pre className="bg-background p-2 rounded mt-1 overflow-auto">
              {userId || 'null'}
            </pre>
          </div>

          <div>
            <strong>Email from Clerk:</strong>
            <pre className="bg-background p-2 rounded mt-1 overflow-auto">
              {email || 'null'}
            </pre>
            <p className="text-sm text-text-muted mt-1">
              Length: {email?.length || 0} characters
            </p>
          </div>

          <div>
            <strong>SUPER_ADMIN_EMAIL env var:</strong>
            <pre className="bg-background p-2 rounded mt-1 overflow-auto">
              {process.env.SUPER_ADMIN_EMAIL || 'null'}
            </pre>
            <p className="text-sm text-text-muted mt-1">
              Length: {process.env.SUPER_ADMIN_EMAIL?.length || 0} characters
            </p>
          </div>

          <div>
            <strong>Comparison result:</strong>
            <pre className="bg-background p-2 rounded mt-1">
              email === SUPER_ADMIN_EMAIL: {String(email === process.env.SUPER_ADMIN_EMAIL)}
            </pre>
          </div>

          <div>
            <strong>All user data:</strong>
            <pre className="bg-background p-2 rounded mt-1 overflow-auto text-xs">
              {JSON.stringify(user, null, 2)}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
