import { getServerSession } from 'next-auth';
import { redirect }         from 'next/navigation';
import { authOptions }      from '@/lib/auth';
import { db }               from '@/lib/db';
import { Sidebar }          from '@/components/layout/sidebar';
import { Navbar }           from '@/components/layout/navbar';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect('/login');

  const userId  = (session.user as { id: string }).id;
  const profile = await db.profile.findUnique({ where: { userId } });

  // If no profile, redirect to onboarding (unless already there)
  if (!profile) redirect('/onboarding');

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Navbar user={session.user} />
        <main className="flex-1 overflow-y-auto px-6 py-8 scrollbar-thin">
          <div className="mx-auto max-w-6xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
