import { getServerSession } from 'next-auth';
import { authOptions }      from '@/lib/auth';
import { db }               from '@/lib/db';
import { redirect }         from 'next/navigation';
import { Dumbbell, Activity, Heart, TrendingUp } from 'lucide-react';
import type { WorkoutDay, Exercise } from '@/lib/plan-generator';

export default async function WorkoutPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect('/login');
  const userId = (session.user as { id: string }).id;

  const workoutPlan = await db.workoutPlan.findFirst({
    where: { profile: { userId } },
  });
  const profile = await db.profile.findUnique({ where: { userId } });

  if (!workoutPlan || !profile) redirect('/onboarding');

  const schedule    = workoutPlan.weeklySchedule    as unknown as WorkoutDay[];
  const recoveryTips = workoutPlan.recoveryTips    as string[];

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">Workout Plan</h1>
        <p className="page-subtitle">
          {profile.workoutDaysPerWeek} days/week · {profile.experience.charAt(0).toUpperCase() + profile.experience.slice(1)} program ·{' '}
          {profile.workoutLocation.charAt(0).toUpperCase() + profile.workoutLocation.slice(1)}
        </p>
      </div>

      {/* Progression scheme */}
      <div className="card p-5 flex gap-4 items-start">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50">
          <TrendingUp className="h-5 w-5 text-brand-600" />
        </div>
        <div>
          <h3 className="font-semibold text-slate-900">Progressive overload strategy</h3>
          <p className="text-sm text-slate-600 mt-1">{workoutPlan.progressionScheme as string}</p>
        </div>
      </div>

      {/* Weekly schedule */}
      <div>
        <h2 className="text-xl font-semibold text-slate-900 mb-4 flex items-center gap-2">
          <Dumbbell className="h-5 w-5 text-brand-600" /> Weekly schedule
        </h2>
        <div className="space-y-4">
          {schedule.map((workoutDay) => (
            <WorkoutDayCard key={workoutDay.day} workoutDay={workoutDay} />
          ))}
        </div>
      </div>

      {/* Cardio */}
      <div className="card p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-3 flex items-center gap-2">
          <Activity className="h-5 w-5 text-blue-500" /> Cardio recommendation
        </h2>
        <p className="text-sm text-slate-700 leading-relaxed">{workoutPlan.cardioRecommendation as string}</p>
      </div>

      {/* Recovery */}
      <div className="card p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
          <Heart className="h-5 w-5 text-rose-500" /> Recovery tips
        </h2>
        <ul className="space-y-3">
          {recoveryTips.map((tip, i) => (
            <li key={i} className="flex gap-3 text-sm">
              <span className="flex-shrink-0 flex h-5 w-5 items-center justify-center rounded-full bg-rose-100 text-rose-700 text-xs font-bold">{i + 1}</span>
              <span className="text-slate-700">{tip}</span>
            </li>
          ))}
        </ul>
      </div>

      <p className="disclaimer">
        ⚠️ These workouts are generated based on the information you provided. They are not a substitute for guidance
        from a certified personal trainer. If you experience pain (not just soreness), stop and consult a medical
        professional. Always warm up for 5–10 minutes before lifting.
      </p>
    </div>
  );
}

function WorkoutDayCard({ workoutDay }: { workoutDay: WorkoutDay }) {
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
  const isToday = workoutDay.day === today;

  return (
    <div className={`card overflow-hidden ${isToday ? 'ring-2 ring-brand-500' : ''}`}>
      <div className={`flex items-center justify-between px-5 py-4 ${isToday ? 'bg-brand-600' : 'bg-slate-50 border-b border-slate-200'}`}>
        <div className="flex items-center gap-3">
          <span className={`text-sm font-bold ${isToday ? 'text-white' : 'text-slate-500'}`}>{workoutDay.day}</span>
          <h3 className={`font-semibold ${isToday ? 'text-white' : 'text-slate-900'}`}>{workoutDay.name}</h3>
        </div>
        {isToday && (
          <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-medium text-white">Today</span>
        )}
      </div>
      <div className="divide-y divide-slate-100">
        {workoutDay.exercises.map((ex, i) => (
          <ExerciseRow key={i} exercise={ex} index={i} />
        ))}
      </div>
    </div>
  );
}

function ExerciseRow({ exercise, index }: { exercise: Exercise; index: number }) {
  return (
    <details className="group">
      <summary className="flex cursor-pointer items-center gap-4 px-5 py-3.5 hover:bg-slate-50 transition-colors list-none">
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-500 shrink-0">
          {index + 1}
        </span>
        <div className="flex-1">
          <p className="text-sm font-semibold text-slate-900">{exercise.name}</p>
          <p className="text-xs text-slate-500">{exercise.sets} sets × {exercise.reps} · Rest {exercise.rest}</p>
        </div>
        <div className="flex flex-wrap gap-1">
          {exercise.muscles.slice(0, 2).map((m) => (
            <span key={m} className="rounded-full bg-brand-50 px-2 py-0.5 text-xs text-brand-700 font-medium capitalize">{m}</span>
          ))}
        </div>
        <svg className="h-4 w-4 text-slate-400 group-open:rotate-180 transition-transform shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </summary>
      <div className="px-5 pb-4 pt-1 bg-slate-50">
        <p className="text-sm text-slate-600 mb-2">{exercise.instructions}</p>
        {exercise.alternatives && exercise.alternatives.length > 0 && (
          <p className="text-xs text-slate-400">
            <span className="font-medium">Alternatives:</span> {exercise.alternatives.join(', ')}
          </p>
        )}
      </div>
    </details>
  );
}
