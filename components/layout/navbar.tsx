'use client';

import { User } from 'lucide-react';
import type { Session } from 'next-auth';

interface NavbarProps {
  user: Session['user'];
}

export function Navbar({ user }: NavbarProps) {
  return (
    <header className="h-14 border-b border-slate-200 bg-white flex items-center justify-end px-6 gap-4 lg:px-8">
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100">
          <User className="h-4 w-4 text-brand-600" />
        </div>
        <span className="text-sm font-medium text-slate-700 hidden sm:inline">
          {user?.name ?? user?.email}
        </span>
      </div>
    </header>
  );
}
