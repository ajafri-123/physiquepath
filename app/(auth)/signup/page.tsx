'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { signUpSchema, type SignUpInput } from '@/lib/validations';

export default function SignUpPage() {
  const router = useRouter();
  const [showPw, setShowPw] = useState(false);
  const [error,  setError]  = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignUpInput>({ resolver: zodResolver(signUpSchema) });

  async function onSubmit(data: SignUpInput) {
    setError('');
    const res = await fetch('/api/auth/register', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(data),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.error ?? 'Something went wrong. Please try again.');
      return;
    }

    // Auto sign-in after registration
    const signInRes = await signIn('credentials', {
      email:    data.email,
      password: data.password,
      redirect: false,
    });

    if (signInRes?.error) {
      setError('Account created but could not sign in. Please log in manually.');
      return;
    }

    router.push('/onboarding');
    router.refresh();
  }

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Create your account</h1>
        <p className="mt-1 text-sm text-slate-500">Start your physique journey today — completely free.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div>
          <label className="label" htmlFor="name">Full name</label>
          <input
            id="name"
            type="text"
            autoComplete="name"
            placeholder="Alex Johnson"
            className="input"
            {...register('name')}
          />
          {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>}
        </div>

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
          <label className="label" htmlFor="password">Password</label>
          <div className="relative">
            <input
              id="password"
              type={showPw ? 'text' : 'password'}
              autoComplete="new-password"
              placeholder="Min. 8 characters"
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
          {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Create free account'}
        </button>

        <p className="text-center text-xs text-slate-400">
          By signing up you agree that this app is for informational purposes only and is not a substitute for professional medical or nutritional advice.
        </p>
      </form>

      <p className="mt-6 text-center text-sm text-slate-500">
        Already have an account?{' '}
        <Link href="/login" className="font-medium text-brand-600 hover:text-brand-700">Sign in</Link>
      </p>
    </div>
  );
}
