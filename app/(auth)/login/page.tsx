'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { loginSchema, type LoginInput } from '@/lib/validations';

export default function LoginPage() {
  const router = useRouter();
  const [showPw, setShowPw] = useState(false);
  const [error,  setError]  = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) });

  async function onSubmit(data: LoginInput) {
    setError('');
    const res = await signIn('credentials', {
      email:    data.email,
      password: data.password,
      redirect: false,
    });

    if (res?.error) {
      setError('Invalid email or password. Please try again.');
      return;
    }

    router.push('/dashboard');
    router.refresh();
  }

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Welcome back</h1>
        <p className="mt-1 text-sm text-slate-500">Sign in to continue your journey.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div>
          <label className="label" htmlFor="email">Email address</label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            className="input"
            {...register('email')}
          />
          {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="label mb-0" htmlFor="password">Password</label>
          </div>
          <div className="relative">
            <input
              id="password"
              type={showPw ? 'text' : 'password'}
              autoComplete="current-password"
              placeholder="••••••••"
              className="input pr-10"
              {...register('password')}
            />
            <button
              type="button"
              onClick={() => setShowPw((p) => !p)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>}
        </div>

        {error && (
          <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <button type="submit" disabled={isSubmitting} className="btn-primary w-full py-3">
          {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Sign in'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-500">
        Don&apos;t have an account?{' '}
        <Link href="/signup" className="font-medium text-brand-600 hover:text-brand-700">
          Create one free
        </Link>
      </p>

      <div className="mt-8 rounded-xl bg-slate-100 px-4 py-3">
        <p className="text-xs text-slate-500 font-medium mb-1">Demo account</p>
        <p className="text-xs text-slate-500">Email: <code>demo@physiquepath.app</code></p>
        <p className="text-xs text-slate-500">Password: <code>demo1234</code></p>
      </div>
    </div>
  );
}
