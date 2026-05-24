import Link from 'next/link';
import { Shield } from 'lucide-react';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between bg-gradient-to-br from-brand-600 to-brand-900 p-12 text-white">
        <Link href="/" className="text-2xl font-bold">PhysiquePath</Link>
        <div>
          <blockquote className="text-2xl font-light leading-relaxed text-white/90">
            &ldquo;The body achieves what the mind believes — but only with a solid plan and the patience to follow it.&rdquo;
          </blockquote>
          <p className="mt-6 text-sm text-white/60">Sustainable fitness starts here.</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-white/50">
          <Shield className="h-4 w-4" />
          Not a substitute for professional medical advice.
        </div>
      </div>

      {/* Right panel */}
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-12 bg-slate-50">
        <Link href="/" className="mb-8 text-xl font-bold text-brand-600 lg:hidden">PhysiquePath</Link>
        <div className="w-full max-w-md">
          {children}
        </div>
      </div>
    </div>
  );
}
