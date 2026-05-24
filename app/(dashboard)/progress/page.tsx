'use client';

import { useState, useEffect, useCallback, forwardRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Plus, TrendingDown, TrendingUp } from 'lucide-react';
import { progressLogSchema, type ProgressLogInput } from '@/lib/validations';
import { formatShortDate } from '@/lib/utils';
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';

type Log = {
  id: string; date: string; weightKg: number | null;
  caloriesConsumed: number | null; sleepHours: number | null;
  energyRating: number | null; workoutCompleted: boolean | null;
  proteinGrams: number | null; waterLiters: number | null;
  waistCm: number | null;
};

function StatTrend({ logs, field, label, unit, color }: {
  logs: Log[]; field: keyof Log; label: string; unit: string; color: string;
}) {
  const vals = logs.filter((l) => l[field] != null).map((l) => ({
    date:  formatShortDate(l.date),
    value: Number(l[field]),
  })).reverse();

  if (!vals.length) return null;

  const last = vals[vals.length - 1].value;
  const prev = vals.length > 1 ? vals[vals.length - 2].value : last;
  const diff = last - prev;

  return (
    <div className="card p-5">
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">{label}</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{last.toFixed(1)} <span className="text-sm font-normal text-slate-400">{unit}</span></p>
        </div>
        {diff !== 0 && (
          <span className={`flex items-center gap-1 text-sm font-medium rounded-full px-2 py-1 ${diff < 0 ? 'text-green-700 bg-green-50' : 'text-red-700 bg-red-50'}`}>
            {diff < 0 ? <TrendingDown className="h-4 w-4" /> : <TrendingUp className="h-4 w-4" />}
            {Math.abs(diff).toFixed(1)}
          </span>
        )}
      </div>
      <ResponsiveContainer width="100%" height={80}>
        <AreaChart data={vals}>
          <defs>
            <linearGradient id={`g-${field}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor={color} stopOpacity={0.15} />
              <stop offset="95%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area type="monotone" dataKey="value" stroke={color} fill={`url(#g-${field})`} strokeWidth={2} dot={false} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export default function ProgressPage() {
  const [logs,    setLogs]    = useState<Log[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving,  setSaving]  = useState(false);
  const [saved,   setSaved]   = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<ProgressLogInput>({
    resolver: zodResolver(progressLogSchema),
  });

  const loadLogs = useCallback(async () => {
    setLoading(true);
    const res = await fetch('/api/progress');
    if (res.ok) setLogs(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => { loadLogs(); }, [loadLogs]);

  async function onSubmit(data: ProgressLogInput) {
    setSaving(true);
    const res = await fetch('/api/progress', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(data),
    });
    if (res.ok) {
      setSaved(true);
      reset();
      setShowForm(false);
      loadLogs();
      setTimeout(() => setSaved(false), 3000);
    }
    setSaving(false);
  }

  const chartData = [...logs].reverse().map((l) => ({
    date:     formatShortDate(l.date),
    weight:   l.weightKg,
    calories: l.caloriesConsumed,
    sleep:    l.sleepHours,
    energy:   l.energyRating,
    workout:  l.workoutCompleted ? 1 : 0,
  }));

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center justify-between page-header">
        <div>
          <h1 className="page-title">Progress Tracker</h1>
          <p className="page-subtitle">Log and visualise your journey</p>
        </div>
        <button onClick={() => setShowForm((f) => !f)} className="btn-primary gap-2">
          <Plus className="h-4 w-4" /> Log today
        </button>
      </div>

      {saved && (
        <div className="rounded-xl bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700">
          ✅ Progress logged successfully!
        </div>
      )}

      {/* Log form */}
      {showForm && (
        <div className="card p-6 animate-slide-up">
          <h2 className="text-lg font-semibold text-slate-900 mb-5">Log today&apos;s data</h2>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              <Field label="Weight (kg)"     type="number" step="0.1" placeholder="75.5" error={errors.weightKg?.message} {...register('weightKg', { valueAsNumber: true })} />
              <Field label="Calories eaten"  type="number" placeholder="2100" error={errors.caloriesConsumed?.message} {...register('caloriesConsumed', { valueAsNumber: true })} />
              <Field label="Protein (g)"     type="number" placeholder="150" error={errors.proteinGrams?.message} {...register('proteinGrams', { valueAsNumber: true })} />
              <Field label="Carbs (g)"       type="number" placeholder="200" error={errors.carbsGrams?.message} {...register('carbsGrams', { valueAsNumber: true })} />
              <Field label="Fat (g)"         type="number" placeholder="65" error={errors.fatGrams?.message} {...register('fatGrams', { valueAsNumber: true })} />
              <Field label="Water (L)"       type="number" step="0.1" placeholder="2.5" error={errors.waterLiters?.message} {...register('waterLiters', { valueAsNumber: true })} />
              <Field label="Sleep (hrs)"     type="number" step="0.5" placeholder="7.5" error={errors.sleepHours?.message} {...register('sleepHours', { valueAsNumber: true })} />
              <Field label="Mood (1–10)"     type="number" min="1" max="10" placeholder="7" error={errors.moodRating?.message} {...register('moodRating', { valueAsNumber: true })} />
              <Field label="Energy (1–10)"   type="number" min="1" max="10" placeholder="7" error={errors.energyRating?.message} {...register('energyRating', { valueAsNumber: true })} />
              <Field label="Waist (cm)"      type="number" step="0.5" placeholder="85" error={errors.waistCm?.message} {...register('waistCm', { valueAsNumber: true })} />
              <Field label="Chest (cm)"      type="number" step="0.5" placeholder="95" error={errors.chestCm?.message} {...register('chestCm', { valueAsNumber: true })} />
              <Field label="Arm (cm)"        type="number" step="0.5" placeholder="35" error={errors.armCm?.message} {...register('armCm', { valueAsNumber: true })} />
            </div>

            <div className="flex items-center gap-3">
              <input type="checkbox" id="workout" {...register('workoutCompleted')} className="h-4 w-4 rounded border-slate-300 text-brand-600" />
              <label htmlFor="workout" className="text-sm font-medium text-slate-700">Completed today&apos;s workout</label>
            </div>

            <div>
              <label className="label">Notes (optional)</label>
              <textarea
                {...register('notes')}
                placeholder="How are you feeling? Any observations?"
                rows={2}
                className="input resize-none"
              />
            </div>

            <div className="flex gap-3">
              <button type="submit" disabled={saving} className="btn-primary gap-2">
                {saving && <Loader2 className="h-4 w-4 animate-spin" />} Save log
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="btn-outline">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-brand-500" /></div>
      ) : logs.length === 0 ? (
        <div className="card p-12 text-center">
          <p className="text-4xl mb-3">📊</p>
          <h3 className="text-lg font-semibold text-slate-900">No logs yet</h3>
          <p className="text-sm text-slate-500 mt-1">Start logging to see your progress charts.</p>
        </div>
      ) : (
        <>
          {/* Trend cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatTrend logs={logs} field="weightKg"       label="Weight"  unit="kg"  color="#059669" />
            <StatTrend logs={logs} field="caloriesConsumed" label="Calories" unit="kcal" color="#f97316" />
            <StatTrend logs={logs} field="sleepHours"     label="Sleep"   unit="hrs" color="#8b5cf6" />
            <StatTrend logs={logs} field="energyRating"   label="Energy"  unit="/ 10" color="#3b82f6" />
          </div>

          {/* Weight chart */}
          {chartData.some((d) => d.weight != null) && (
            <div className="card p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Weight over time</h2>
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="weightGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#059669" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#059669" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} domain={['dataMin - 1', 'dataMax + 1']} />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0' }} />
                  <Area type="monotone" dataKey="weight" stroke="#059669" fill="url(#weightGrad)" strokeWidth={2.5} dot={{ r: 4, fill: '#059669' }} connectNulls />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Calories chart */}
          {chartData.some((d) => d.calories != null) && (
            <div className="card p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Calories & sleep trends</h2>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0' }} />
                  <Bar dataKey="calories" fill="#f97316" name="Calories" radius={[4,4,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Workout consistency */}
          <div className="card p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Workout consistency (last 14 days)</h2>
            <div className="flex flex-wrap gap-2">
              {logs.slice(0, 14).reverse().map((l) => (
                <div key={l.id} className={`flex flex-col items-center gap-1`}>
                  <div className={`h-8 w-8 rounded-lg ${l.workoutCompleted ? 'bg-brand-500' : 'bg-slate-200'}`} title={formatShortDate(l.date)} />
                  <span className="text-xs text-slate-400">{formatShortDate(l.date).split(' ')[0]}</span>
                </div>
              ))}
            </div>
            <p className="mt-3 text-xs text-slate-500">
              Green = workout completed · Grey = rest or no log
            </p>
          </div>
        </>
      )}
    </div>
  );
}

const Field = forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement> & { label: string; error?: string }
>(({ label, error, ...props }, ref) => (
  <div>
    <label className="label">{label}</label>
    <input className="input" ref={ref} {...props} />
    {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
  </div>
));
Field.displayName = 'Field';
