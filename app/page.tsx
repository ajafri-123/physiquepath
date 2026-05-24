import Link from 'next/link';
import { ArrowRight, BarChart3, Brain, CheckCircle, Dumbbell, Heart, Salad, Shield } from 'lucide-react';

const features = [
  { icon: Salad,    title: 'Smart Nutrition',   desc: 'Personalised calorie & macro targets based on your body metrics, goals, and dietary preferences.' },
  { icon: Dumbbell, title: 'Custom Workouts',   desc: 'Beginner to advanced programs tailored to your experience, equipment, and available days.' },
  { icon: BarChart3, title: 'Progress Tracking', desc: 'Log weight, measurements, macros, sleep, and mood. Visualise trends with beautiful charts.' },
  { icon: Brain,    title: 'AI Coach',           desc: 'Ask your AI coach anything — meal swaps, missed workouts, plateaus, motivation.' },
  { icon: Heart,    title: 'Weekly Check-Ins',   desc: 'Smart weekly reviews adjust your plan if progress stalls or life gets in the way.' },
  { icon: Shield,   title: 'Safe & Sustainable', desc: 'No crash diets. No extreme cuts. Evidence-based guidelines, always within healthy ranges.' },
];

const steps = [
  { n: '01', title: 'Create your account',         desc: 'Sign up in under 60 seconds.' },
  { n: '02', title: 'Complete the questionnaire',  desc: 'Tell us about your body, goals, lifestyle, and diet.' },
  { n: '03', title: 'Get your personalised plan',  desc: 'Receive a complete nutrition, workout, and recovery plan.' },
  { n: '04', title: 'Track & improve every week',  desc: 'Log progress, do weekly check-ins, and watch the plan adapt.' },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="fixed top-0 z-50 w-full border-b border-slate-100 bg-white/90 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <span className="text-xl font-bold text-brand-600">PhysiquePath</span>
          <div className="flex items-center gap-4">
            <Link href="/login"  className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">Log in</Link>
            <Link href="/signup" className="btn-primary text-sm">Get started free</Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative flex min-h-screen items-center overflow-hidden bg-gradient-to-br from-brand-600 via-brand-700 to-slate-900 pt-16">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=%2260%22 height=%2260%22 viewBox=%220 0 60 60%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg fill=%22none%22 fill-rule=%22evenodd%22%3E%3Cg fill=%22%23ffffff%22 fill-opacity=%220.03%22%3E%3Cpath d=%22M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-100" />
        <div className="relative mx-auto max-w-6xl px-6 py-24 text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm text-white/90 backdrop-blur-sm">
            <CheckCircle className="h-4 w-4 text-brand-300" />
            Evidence-based · Safe · Sustainable
          </div>
          <h1 className="mb-6 text-5xl font-extrabold leading-tight tracking-tight text-white sm:text-6xl lg:text-7xl">
            Your path to the<br />
            <span className="text-brand-300">physique you want.</span>
          </h1>
          <p className="mx-auto mb-10 max-w-2xl text-lg text-white/75 leading-relaxed">
            PhysiquePath builds a personalised nutrition plan, workout program, and weekly
            check-in system tailored to your body, goals, and lifestyle — without the
            extremes, the shame, or the guesswork.
          </p>
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link href="/signup" className="btn bg-white text-brand-700 hover:bg-brand-50 focus:ring-white px-8 py-3 text-base font-semibold shadow-lg">
              Start for free <ArrowRight className="h-5 w-5" />
            </Link>
            <Link href="/login" className="btn border border-white/30 text-white hover:bg-white/10 px-8 py-3 text-base">
              I already have an account
            </Link>
          </div>
          <p className="mt-6 text-sm text-white/50">
            No credit card required · Not a substitute for professional medical advice
          </p>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 bg-slate-50">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-16 text-center">
            <h2 className="text-3xl font-bold text-slate-900 sm:text-4xl">Everything you need in one place</h2>
            <p className="mt-4 text-lg text-slate-500">Science-backed tools, no toxic hustle culture.</p>
          </div>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {features.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="card p-6 hover:shadow-md transition-shadow">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-slate-900">{title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-24 bg-white">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-16 text-center">
            <h2 className="text-3xl font-bold text-slate-900 sm:text-4xl">How PhysiquePath works</h2>
            <p className="mt-4 text-lg text-slate-500">Four steps from sign-up to results.</p>
          </div>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map(({ n, title, desc }) => (
              <div key={n} className="relative">
                <div className="mb-4 text-5xl font-black text-brand-100">{n}</div>
                <h3 className="mb-2 text-lg font-semibold text-slate-900">{title}</h3>
                <p className="text-sm text-slate-500">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Disclaimer */}
      <section className="py-16 bg-amber-50 border-t border-amber-100">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <Shield className="mx-auto mb-4 h-8 w-8 text-amber-600" />
          <h3 className="mb-3 text-lg font-semibold text-amber-900">A note on safety</h3>
          <p className="text-sm text-amber-800 leading-relaxed">
            PhysiquePath provides general fitness and nutrition guidance for educational purposes only. It is{' '}
            <strong>not a replacement for professional medical advice</strong>, diagnosis, or treatment from a
            licensed physician, registered dietitian, or certified personal trainer. If you have a medical
            condition, eating disorder, or other health concern, please consult a qualified healthcare
            professional before starting any new diet or exercise program. We do not promote extreme dieting,
            steroid use, rapid unsustainable weight loss, or any behaviour that may harm your health.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-brand-600">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <h2 className="mb-6 text-3xl font-bold text-white sm:text-4xl">Ready to start your journey?</h2>
          <Link href="/signup" className="btn bg-white text-brand-700 hover:bg-brand-50 px-8 py-3 text-base font-semibold shadow-lg">
            Create free account <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-10">
        <div className="mx-auto max-w-6xl px-6 flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
          <span className="text-lg font-bold text-brand-600">PhysiquePath</span>
          <p className="text-xs text-slate-400 text-center">
            © {new Date().getFullYear()} PhysiquePath. For informational purposes only. Not medical advice.
          </p>
        </div>
      </footer>
    </div>
  );
}
