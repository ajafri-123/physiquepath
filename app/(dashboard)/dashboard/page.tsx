import { getServerSession }  from 'next-auth';
import { authOptions }       from '@/lib/auth';
import { db }                from '@/lib/db';
import { redirect }          from 'next/navigation';
import Link                  from 'next/link';
import { Dumbbell, Droplets, Flame, Moon, TrendingUp, ArrowRight, AlertCircle } from 'lucide-react';
import { formatDate, capitalize } from '@/lib/utils';

async function getDashboardData(userId: string) {
  const [profile, nutritionPlan, workoutPlan, recentLogs] = await Promise.all([
    db.profile.findUnique({ where: { userId } }),
    db.nutritionPlan.findFirst({ where: { profile: { userId } } }),
    db.workoutPlan.findFirst({ where: { profile: { userId } } }),
    db.progressLog.findMany({
      where:   { userId },
      orderBy: { date: 'desc' },
      take:    7,
    }),
  ]);
  return { profile, nutritionPlan, workoutPlan, recentLogs };
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect('/login');
  const userId = (session.user as { id: string }).id;

  const { profile, nutritionPlan, workoutPlan, recentLogs } = await getDashboardData(userId);

  if (!profile || !nutritionPlan || !workoutPlan) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4 text-center">
        <AlertCircle className="h-12 w-12 text-amber-500" />
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Your plan isn&apos;t ready yet</h2>
          <p className="text-slate-500 mt-1">Let&apos;s finish setting up your profile.</p>
        </div>
        <Link href="/onboarding" className="btn-primary">Complete setup</Link>
      </div>
    );
  }

  const today    = new Date();
  const schedule = workoutPlan.weeklySchedule as Array<{ day: string; name: string }>;
  const todayName = today.toLocaleDateString('en-US', { weekday: 'long' });
  const todayWorkout = schedule.find((d) => d.day === todayName);

  const latestLog  = recentLogs[0];
  const calsLogged = latestLog?.caloriesConsumed ?? 0;
  const waterLogged = latestLog?.waterLiters ?? 0;

  const workoutsThisWeek = recentLogs.filter(
    (l) => l.workoutCompleted && new Date(l.date) > new Date(Date.now() - 7 * 86400000),
  ).length;

  const weeklyChange = workoutPlan.expectedWeeklyChange as number;
  const timeline     = workoutPlan.estimatedTimelineWeeks as number;

  const statCards = [
    {
      label:   'Daily calories',
      value:   `${nutritionPlan.dailyCalories}`,
      sub:     `${calsLogged} logged today`,
      icon:    Flame,
      color:   'text-orange-500',
      bg:      'bg-orange-50',
      href:    '/nutrition',
    },
    {
      label:   'Protein target',
      value:   `${nutritionPlan.proteinGrams}g`,
      sub:     'Daily protein goal',
      icon:    TrendingUp,
      color:   'text-brand-600',
      bg:      'bg-brand-50',
      href:    '/nutrition',
    },
    {
      label:   'Hydration goal',
      value:   `${nutritionPlan.hydrationLiters}L`,
      sub:     `${waterLogged}L logged today`,
      icon:    Droplets,
      color:   'text-blue-500',
      bg:      'bg-blue-50',
      href:    '/progress',
    },
    {
      label:   'Sleep target',
      value:   '7–9 hrs',
      sub:     `${latestLog?.sleepHours ?? '—'} hrs last night`,
      icon:    Moon,
      color:   'text-violet-500',
      bg:      'bg-violet-50',
      href:    '/progress',
    },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="page-header">
        <h1 className="page-title">
          Good {today.getHours() < 12 ? 'morning' : today.getHours() < 17 ? 'afternoon' : 'evening'},{' '}
          {session.user.name?.split(' ')[0] ?? 'there'} 👋
        </h1>
        <p className="page-subtitle">{formatDate(today)} · Here&apos;s your plan for today.</p>
      </div>

      {/* Goal banner */}
      <div className="rounded-2xl bg-gradient-to-r from-brand-600 to-brand-700 p-6 text-white">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-brand-200 font-medium">Current goal</p>
            <h2 className="text-2xl font-bold capitalize">{capitalize(profile.physiqueGoal)}</h2>
            <p className="text-sm text-brand-100 mt-1">
              {profile.weightKg}kg → {profile.goalWeightKg}kg ·{' '}
              {timeline > 0
                ? `~${timeline} weeks (${weeklyChange > 0 ? '+' : ''}${weeklyChange}kg/wk)`
                : 'Maintenance mode'}
            </p>
          </div>
          <div className="flex items-center gap-3 mt-3 sm:mt-0">
            <div className="text-center">
              <div className="text-3xl font-black">{workoutsThisWeek}</div>
              <div className="text-xs text-brand-200">workouts this week</div>
            </div>
          </div>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map(({ label, value, sub, icon: Icon, color, bg, href }) => (
          <Link key={label} href={href} className="card-hover p-5 group">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">{label}</p>
                <p className="mt-2 text-2xl font-bold text-slate-900">{value}</p>
                <p className="mt-1 text-xs text-slate-400">{sub}</p>
              </div>
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${bg}`}>
                <Icon className={`h-5 w-5 ${color}`} />
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Today's workout + Quick log */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Today's workout */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
              <Dumbbell className="h-5 w-5 text-brand-600" /> Today&apos;s workout
            </h3>
            <Link href="/workout" className="text-sm text-brand-600 hover:text-brand-700 flex items-center gap-1">
              Full plan <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          {todayWorkout ? (
            <div>
              <div className="mb-3">
                <span className="inline-flex items-center rounded-full bg-brand-100 px-3 py-1 text-sm font-medium text-brand-700">
                  {todayWorkout.name}
                </span>
              </div>
              <p className="text-sm text-slate-500">
                {(todayWorkout as { exercises?: unknown[] }).exercises?.length ?? 0} exercises · Tap &ldquo;Full plan&rdquo; to see details and log completion.
              </p>
              <Link href="/workout" className="btn-primary mt-4 w-full">
                Start workout
              </Link>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="text-4xl mb-2">😴</div>
              <p className="text-sm font-medium text-slate-700">Rest day — enjoy it!</p>
              <p className="text-xs text-slate-400 mt-1">Recovery is part of the plan.</p>
            </div>
          )}
        </div>

        {/* Quick log */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-900">Quick log</h3>
            <Link href="/progress" className="text-sm text-brand-600 hover:text-brand-700 flex items-center gap-1">
              Full log <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="space-y-4">
            <MacroBar label="Calories" current={calsLogged} goal={nutritionPlan.dailyCalories} unit="kcal" color="bg-orange-400" />
            <MacroBar label="Protein" current={latestLog?.proteinGrams ?? 0} goal={nutritionPlan.proteinGrams} unit="g" color="bg-brand-500" />
            <MacroBar label="Water" current={waterLogged} goal={nutritionPlan.hydrationLiters} unit="L" color="bg-blue-400" decimals />
          </div>

          <Link href="/progress" className="btn-outline mt-5 w-full">
            Log today&apos;s data
          </Link>
        </div>
      </div>

      {/* Weekly summary */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-900">This week</h3>
          <Link href="/check-in" className="text-sm text-brand-600 hover:text-brand-700 flex items-center gap-1">
            Weekly check-in <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            { label: 'Workouts done',      value: `${workoutsThisWeek} / ${Math.min(profile.workoutDaysPerWeek, 7)}` },
            { label: 'Avg sleep',          value: recentLogs.length ? `${(recentLogs.reduce((a, l) => a + (l.sleepHours ?? 0), 0) / recentLogs.length).toFixed(1)} hrs` : '—' },
            { label: 'Avg energy',         value: recentLogs.length ? `${(recentLogs.reduce((a, l) => a + (l.energyRating ?? 0), 0) / recentLogs.length).toFixed(1)} / 10` : '—' },
            { label: 'Logs this week',     value: `${recentLogs.length}` },
          ].map(({ label, value }) => (
            <div key={label} className="rounded-xl bg-slate-50 p-4">
              <p className="text-xs text-slate-500">{label}</p>
              <p className="mt-1 text-xl font-bold text-slate-900">{value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Disclaimer */}
      <p className="disclaimer">
        ⚠️ PhysiquePath is for informational purposes only. It does not constitute medical advice. Consult your doctor,
        dietitian, or certified trainer before making significant changes to your diet or exercise routine.
      </p>
    </div>
  );
}

function MacroBar({ label, current, goal, unit, color, decimals = false }: {
  label: string; current: number; goal: number; unit: string;
  color: string; decimals?: boolean;
}) {
  const pct = Math.min(100, goal > 0 ? Math.round((current / goal) * 100) : 0);
  const fmt = (n: number) => decimals ? n.toFixed(1) : Math.round(n).toString();
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="font-medium text-slate-700">{label}</span>
        <span className="text-slate-500">{fmt(current)} / {fmt(goal)} {unit}</span>
      </div>
      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full transition-all`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
