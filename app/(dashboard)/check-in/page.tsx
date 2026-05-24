'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, CheckCircle, CalendarCheck } from 'lucide-react';
import { weeklyCheckInSchema, type WeeklyCheckInInput } from '@/lib/validations';
import { cn } from '@/lib/utils';

type OptionBtn = { value: string; label: string };

function OptionGroup({ label, options, value, onChange }: {
  label: string; options: OptionBtn[]; value: string; onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="label">{label}</label>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={cn(
              'rounded-xl border-2 px-4 py-2 text-sm font-medium transition-all',
              value === opt.value
                ? 'border-brand-500 bg-brand-50 text-brand-700'
                : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300',
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function NumberField({ label, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <div>
      <label className="label">{label}</label>
      <input className="input w-36" type="number" {...props} />
    </div>
  );
}

export default function CheckInPage() {
  const [submitted, setSubmitted] = useState(false);
  const [adjustments, setAdjustments] = useState<string[]>([]);

  const {
    register, handleSubmit, watch, setValue,
    formState: { errors, isSubmitting },
  } = useForm<WeeklyCheckInInput>({
    resolver: zodResolver(weeklyCheckInSchema),
    defaultValues: {
      weekStartDate:        new Date().toISOString().split('T')[0],
      hungerLevel:          undefined,
      energyLevel:          undefined,
      stressLevel:          undefined,
      sustainabilityRating: undefined,
    } as Partial<WeeklyCheckInInput>,
  });

  const watched = watch();

  async function onSubmit(data: WeeklyCheckInInput) {
    const res = await fetch('/api/check-in', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(data),
    });
    if (res.ok) {
      const body = await res.json();
      setAdjustments(body.adjustments ?? []);
      setSubmitted(true);
    }
  }

  if (submitted) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="page-header">
          <h1 className="page-title">Weekly check-in</h1>
        </div>
        <div className="card p-8 text-center">
          <CheckCircle className="mx-auto h-14 w-14 text-brand-500 mb-4" />
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Great job checking in!</h2>
          <p className="text-slate-500 mb-6">Your check-in has been recorded. Here&apos;s what we&apos;ve adjusted:</p>
          {adjustments.length > 0 ? (
            <ul className="space-y-2 text-left mx-auto max-w-md">
              {adjustments.map((adj, i) => (
                <li key={i} className="flex gap-3 text-sm text-slate-700 bg-brand-50 rounded-xl px-4 py-3">
                  <span className="text-brand-600 font-bold shrink-0">→</span>
                  {adj}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-slate-500 bg-green-50 rounded-xl px-4 py-3 max-w-md mx-auto">
              ✅ Your plan looks on track — no adjustments needed this week. Keep it up!
            </p>
          )}
          <button onClick={() => setSubmitted(false)} className="btn-outline mt-6">
            Do another check-in
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="page-header">
        <h1 className="page-title flex items-center gap-2">
          <CalendarCheck className="h-7 w-7 text-brand-600" /> Weekly check-in
        </h1>
        <p className="page-subtitle">Honest answers help us keep your plan working for you.</p>
      </div>

      <div className="card p-6">
        <div className="mb-6 rounded-xl bg-brand-50 border border-brand-200 px-4 py-3">
          <p className="text-sm text-brand-800">
            📋 This check-in takes 2–3 minutes and lets us adjust your plan if needed.
            Your answers are private and only used to refine your recommendations.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-7">
          {/* Metrics */}
          <div>
            <h3 className="text-base font-semibold text-slate-900 mb-4">This week&apos;s numbers</h3>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <NumberField label="Current weight (kg)" step="0.1" placeholder="75.5" {...register('currentWeightKg', { valueAsNumber: true })} />
              <NumberField label="Avg daily calories" placeholder="2100" {...register('avgCalories', { valueAsNumber: true })} />
              <NumberField label="Workouts completed" min="0" max="7" placeholder="3" {...register('workoutConsistency', { valueAsNumber: true })} />
              <NumberField label="Avg sleep (hrs)" step="0.5" placeholder="7" {...register('avgSleepHours', { valueAsNumber: true })} />
            </div>
            {(errors.currentWeightKg || errors.avgCalories || errors.workoutConsistency || errors.avgSleepHours) && (
              <p className="mt-2 text-xs text-red-500">Please fill in all required fields above.</p>
            )}
          </div>

          {/* How you felt */}
          <div>
            <h3 className="text-base font-semibold text-slate-900 mb-4">How did you feel this week?</h3>
            <div className="space-y-4">
              <OptionGroup
                label="Hunger level"
                options={[{ value: 'low', label: '😌 Low' }, { value: 'moderate', label: '😐 Moderate' }, { value: 'high', label: '😤 High' }]}
                value={watched.hungerLevel ?? ''}
                onChange={(v) => setValue('hungerLevel', v as WeeklyCheckInInput['hungerLevel'])}
              />
              <OptionGroup
                label="Energy level"
                options={[{ value: 'low', label: '😴 Low' }, { value: 'moderate', label: '😐 Moderate' }, { value: 'high', label: '⚡ High' }]}
                value={watched.energyLevel ?? ''}
                onChange={(v) => setValue('energyLevel', v as WeeklyCheckInInput['energyLevel'])}
              />
              <OptionGroup
                label="Stress level"
                options={[{ value: 'low', label: '😌 Low' }, { value: 'moderate', label: '😐 Moderate' }, { value: 'high', label: '😰 High' }]}
                value={watched.stressLevel ?? ''}
                onChange={(v) => setValue('stressLevel', v as WeeklyCheckInInput['stressLevel'])}
              />
            </div>
          </div>

          {/* Sustainability */}
          <OptionGroup
            label="How sustainable does the plan feel?"
            options={[
              { value: 'too_hard',   label: '😩 Too hard' },
              { value: 'hard',       label: '😤 Hard but doable' },
              { value: 'sustainable', label: '✅ Sustainable' },
              { value: 'easy',       label: '😊 Easy' },
              { value: 'too_easy',   label: '🤔 Too easy' },
            ]}
            value={watched.sustainabilityRating ?? ''}
            onChange={(v) => setValue('sustainabilityRating', v as WeeklyCheckInInput['sustainabilityRating'])}
          />

          {/* Feedback */}
          <div>
            <label className="label">Any notes or feedback? (optional)</label>
            <textarea
              {...register('feedback')}
              placeholder="e.g. I struggled with meal prep, workouts felt great, felt tired mid-week..."
              rows={3}
              className="input resize-none"
            />
          </div>

          <div className="rounded-xl bg-amber-50 border border-amber-200 px-4 py-3">
            <p className="text-xs text-amber-700">
              ⚠️ If you feel unwell, dizzy, or are experiencing disordered eating thoughts, please consult a healthcare professional rather than adjusting your plan.
            </p>
          </div>

          <button type="submit" disabled={isSubmitting} className="btn-primary w-full py-3">
            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Submit check-in & update plan'}
          </button>
        </form>
      </div>
    </div>
  );
}
