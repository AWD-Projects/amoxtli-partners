'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { SignOutButton, UserButton } from '@clerk/nextjs';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  LayoutDashboard,
  Link2,
  DollarSign,
  User,
  Users,
  Briefcase,
  Wallet,
} from 'lucide-react';

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface SidebarLayoutProps {
  children: React.ReactNode;
  role: 'partner' | 'admin';
}

const partnerNav: NavItem[] = [
  { name: 'Inicio', href: '/partner/dashboard', icon: LayoutDashboard },
  { name: 'Referidos', href: '/partner/referrals', icon: Link2 },
  { name: 'Comisiones', href: '/partner/commissions', icon: DollarSign },
  { name: 'Perfil', href: '/partner/profile', icon: User },
];

const adminNav: NavItem[] = [
  { name: 'Inicio', href: '/admin/dashboard', icon: LayoutDashboard },
  { name: 'Partners', href: '/admin/partners', icon: Users },
  { name: 'Referidos', href: '/admin/referrals', icon: Link2 },
  { name: 'Proyectos', href: '/admin/projects', icon: Briefcase },
  { name: 'Pagos', href: '/admin/payouts', icon: Wallet },
];

export function SidebarLayout({ children, role }: SidebarLayoutProps) {
  const pathname = usePathname();
  const navigation = role === 'admin' ? adminNav : partnerNav;

  return (
    <div className="min-h-screen bg-surface-bg text-text-primary">
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-72 flex-col border-r border-brand-active/40 bg-brand px-6 py-8 text-white lg:flex">
        <div className="space-y-1">
          <p className="text-sm font-medium text-white/70">Amoxtli</p>
          <h1 className="text-2xl font-semibold">Partners</h1>
          <p className="text-xs text-white/60">
            {role === 'admin' ? 'Panel superadmin' : 'Panel partner'}
          </p>
        </div>

        <nav className="mt-10 flex-1 space-y-1">
          {navigation.map((item) => {
            const isActive =
              pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'group flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold transition-colors',
                  isActive
                    ? 'bg-white/15 text-white'
                    : 'text-white/70 hover:bg-white/5 hover:text-white'
                )}
              >
                <span
                  className={cn(
                    'flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-sm transition',
                    isActive && 'bg-white text-brand'
                  )}
                >
                  <item.icon
                    className={cn(
                      'h-4 w-4',
                      isActive ? 'text-brand' : 'text-white'
                    )}
                  />
                </span>
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="flex items-center gap-3">
            <UserButton appearance={{ elements: { userButtonPopoverCard: 'bg-surface-card text-text-primary' } }} />
            <div>
              <p className="text-sm font-semibold">
                {role === 'admin' ? 'Administrador' : 'Partner'}
              </p>
              <p className="text-xs text-white/70">Sesión activa</p>
            </div>
          </div>
          <SignOutButton redirectUrl="/sign-in">
            <Button variant="light" className="mt-4 w-full">
              Cerrar sesión
            </Button>
          </SignOutButton>
        </div>
      </aside>

      <div className="lg:pl-72">
        <header className="sticky top-0 z-10 flex items-center justify-between border-b border-surface-border bg-surface-bg/80 px-4 py-4 backdrop-blur lg:hidden">
          <div>
            <p className="text-xs font-semibold text-text-secondary">
              Amoxtli Partners
            </p>
            <p className="text-sm font-semibold text-text-primary">
              {role === 'admin' ? 'Panel superadmin' : 'Panel partner'}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <UserButton appearance={{ elements: { userButtonPopoverCard: 'bg-surface-card text-text-primary' } }} />
            <SignOutButton redirectUrl="/sign-in">
              <Button variant="outline" size="sm">
                Salir
              </Button>
            </SignOutButton>
          </div>
        </header>

        <main className="px-4 pb-12 pt-8 sm:px-8 lg:px-12">
          <div className="space-y-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
