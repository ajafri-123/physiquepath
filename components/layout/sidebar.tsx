'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, Salad, Dumbbell, TrendingUp,
  CalendarCheck, Bot, LogOut,
} from 'lucide-react';
import { signOut } from 'next-auth/react';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { href: '/dashboard',  label: 'Dashboard',  icon: LayoutDashboard },
  { href: '/nutrition',  label: 'Nutrition',  icon: Salad           },
  { href: '/workout',    label: 'Workout',    icon: Dumbbell        },
  { href: '/progress',   label: 'Progress',   icon: TrendingUp      },
  { href: '/check-in',   label: 'Check-in',   icon: CalendarCheck   },
  { href: '/ai-coach',   label: 'AI Coach',   icon: Bot             },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-60 bg-white border-r border-slate-200 h-screen">
        <div className="flex items-center gap-2 px-6 py-5 border-b border-slate-100">
          <span className="text-xl font-bold text-brand-600">PhysiquePath</span>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || pathname.startsWith(href + '/');
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all',
                  active
                    ? 'bg-brand-50 text-brand-700'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900',
                )}
              >
                <Icon className={cn('h-5 w-5', active ? 'text-brand-600' : 'text-slate-400')} />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="px-3 py-4 border-t border-slate-100">
          <button
            onClick={() => signOut({ callbackUrl: '/' })}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-500 hover:bg-red-50 hover:text-red-600 transition-all"
          >
            <LogOut className="h-5 w-5" />
            Sign out
          </button>
        </div>
      </aside>

      {/* Mobile bottom nav */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200 flex">
        {NAV_ITEMS.slice(0, 5).map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex flex-1 flex-col items-center gap-1 py-2 text-xs font-medium transition-colors',
                active ? 'text-brand-600' : 'text-slate-400',
              )}
            >
              <Icon className="h-5 w-5" />
              {label}
            </Link>
          );
        })}
      </nav>
    </>
  );
}
