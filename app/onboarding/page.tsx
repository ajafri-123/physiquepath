'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Loader2, ChevronLeft, ChevronRight, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

// ─── Step definitions ──────────────────────────────────────────────────────────

const STEPS = [
  { id: 1, title: 'Your body',      subtitle: 'Basic measurements' },
  { id: 2, title: 'Your goal',      subtitle: 'What you want to achieve' },
  { id: 3, title: 'Training',       subtitle: 'Experience & schedule' },
  { id: 4, title: 'Nutrition',      subtitle: 'Diet & preferences' },
  { id: 5, title: 'Lifestyle',      subtitle: 'Sleep, stress & routine' },
  { id: 6, title: 'Review & go!',   subtitle: 'Confirm your details' },
];

const EQUIPMENT_OPTIONS = [
  { value: 'barbell',     label: 'Barbell' },
  { value: 'dumbbells',   label: 'Dumbbells' },
  { value: 'cables',      label: 'Cables' },
  { value: 'machines',    label: 'Machines' },
  { value: 'pullup_bar',  label: 'Pull-up bar' },
  { value: 'bench',       label: 'Bench' },
  { value: 'bands',       label: 'Resistance bands' },
  { value: 'kettlebells', label: 'Kettlebells' },
  { value: 'none',        label: 'No equipment' },
];

type FormData = {
  age: number;
  sex: string;
  heightCm: number;
  weightKg: number;
  goalWeightKg: number;
  bodyFatPercent: number | '';
  physiqueGoal: string;
  timeline: string;
  experience: string;
  activityLevel: string;
  workoutDaysPerWeek: number;
  workoutLocation: string;
  equipment: string[];
  injuries: string;
  dietaryPreference: string;
  allergies: string;
  dislikedFoods: string;
  mealsPerDay: number;
  sleepHours: number;
  stressLevel: string;
  waterIntakeLiters: number;
  jobType: string;
};

const defaults: FormData = {
  age: 25, sex: '', heightCm: 170, weightKg: 70, goalWeightKg: 65,
  bodyFatPercent: '', physiqueGoal: '', timeline: 'moderate',
  experience: '', activityLevel: '', workoutDaysPerWeek: 3,
  workoutLocation: '', equipment: [], injuries: '',
  dietaryPreference: 'normal', allergies: '', dislikedFoods: '',
  mealsPerDay: 3, sleepHours: 7, stressLevel: 'moderate',
  waterIntakeLiters: 2, jobType: '',
};

// ─── Option cards ───────────────────────────────────────────────────────────────

function OptionCard({ value, label, selected, onClick, small = false }: {
  value: string; label: string; selected: boolean; onClick: () => void; small?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'relative flex items-center justify-center rounded-xl border-2 font-medium transition-all text-sm',
        small ? 'px-3 py-2' : 'px-4 py-3',
        selected
          ? 'border-brand-500 bg-brand-50 text-brand-700 shadow-sm'
          : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50',
      )}
    >
      {selected && <CheckCircle className="absolute top-1.5 right-1.5 h-3.5 w-3.5 text-brand-500" />}
      {label}
    </button>
  );
}

function NumberInput({ label, value, onChange, min, max, step = 1, unit }: {
  label: string; value: number; onChange: (v: number) => void;
  min: number; max: number; step?: number; unit?: string;
}) {
  return (
    <div>
      <label className="label">{label}</label>
      <div className="flex items-center gap-2">
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          min={min} max={max} step={step}
          className="input w-28"
        />
        {unit && <span className="text-sm text-slate-500">{unit}</span>}
      </div>
    </div>
  );
}

// ─── Step components ────────────────────────────────────────────────────────────

function Step1({ data, set }: { data: FormData; set: (k: keyof FormData, v: FormData[keyof FormData]) => void }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <NumberInput label="Age" value={data.age} onChange={(v) => set('age', v)} min={13} max={100} unit="yrs" />
        <NumberInput label="Height" value={data.heightCm} onChange={(v) => set('heightCm', v)} min={100} max={250} unit="cm" />
        <NumberInput label="Weight" value={data.weightKg} onChange={(v) => set('weightKg', v)} min={30} max={300} step={0.5} unit="kg" />
        <div>
          <label className="label">Body fat % (optional)</label>
          <input
            type="number" min={3} max={60}
            value={data.bodyFatPercent === '' ? '' : data.bodyFatPercent}
            onChange={(e) => set('bodyFatPercent', e.target.value === '' ? '' : Number(e.target.value))}
            placeholder="e.g. 20"
            className="input w-28"
          />
        </div>
      </div>
      <div>
        <label className="label">Biological sex</label>
        <div className="flex gap-3">
          {['male', 'female', 'other'].map((s) => (
            <OptionCard key={s} value={s} label={s.charAt(0).toUpperCase() + s.slice(1)}
              selected={data.sex === s} onClick={() => set('sex', s)} />
          ))}
        </div>
      </div>
    </div>
  );
}

function Step2({ data, set }: { data: FormData; set: (k: keyof FormData, v: FormData[keyof FormData]) => void }) {
  const goals = [
    { v: 'fat-loss',  l: '🔥 Fat Loss' },
    { v: 'lean',      l: '✨ Lean & Defined' },
    { v: 'toned',     l: '💪 Toned' },
    { v: 'athletic',  l: '⚡ Athletic' },
    { v: 'strength',  l: '🏋️ Strength' },
    { v: 'muscular',  l: '💪 Muscular' },
    { v: 'bulky',     l: '🔥 Bulky / Size' },
  ];
  const timelines = [
    { v: 'slow',       l: '🐢 Slow & sustainable (0.25kg/wk)' },
    { v: 'moderate',   l: '⚖️ Moderate (0.5kg/wk)' },
    { v: 'aggressive', l: '🚀 Aggressive but safe (0.75kg/wk)' },
  ];
  return (
    <div className="space-y-6">
      <NumberInput label="Goal weight" value={data.goalWeightKg} onChange={(v) => set('goalWeightKg', v)} min={30} max={300} step={0.5} unit="kg" />
      <div>
        <label className="label">Physique goal</label>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {goals.map(({ v, l }) => (
            <OptionCard key={v} value={v} label={l} selected={data.physiqueGoal === v} onClick={() => set('physiqueGoal', v)} />
          ))}
        </div>
      </div>
      <div>
        <label className="label">Timeline preference</label>
        <div className="flex flex-col gap-2">
          {timelines.map(({ v, l }) => (
            <OptionCard key={v} value={v} label={l} selected={data.timeline === v} onClick={() => set('timeline', v)} />
          ))}
        </div>
        <p className="mt-2 text-xs text-amber-600 bg-amber-50 rounded-lg px-3 py-2">
          ⚠️ Even &ldquo;aggressive&rdquo; targets stay within safe, evidence-based ranges. We never recommend starvation diets.
        </p>
      </div>
    </div>
  );
}

function Step3({ data, set }: { data: FormData; set: (k: keyof FormData, v: FormData[keyof FormData]) => void }) {
  const experiences = [
    { v: 'beginner',     l: '🌱 Beginner (< 1 year)' },
    { v: 'intermediate', l: '💪 Intermediate (1–3 years)' },
    { v: 'advanced',     l: '🔥 Advanced (3+ years)' },
  ];
  const activities = [
    { v: 'sedentary', l: '🪑 Sedentary (desk job, little movement)' },
    { v: 'light',     l: '🚶 Light (light walks, light activity)' },
    { v: 'moderate',  l: '🚴 Moderate (some sport/gym 3x/wk)' },
    { v: 'very',      l: '🏃 Very active (hard training 6x/wk)' },
    { v: 'extra',     l: '⚡ Extra active (athlete / physical job)' },
  ];
  const locations = [
    { v: 'gym',  l: '🏋️ Gym' },
    { v: 'home', l: '🏠 Home' },
    { v: 'both', l: '↔️ Both' },
  ];
  function toggleEquip(val: string) {
    const curr = data.equipment as string[];
    set('equipment', curr.includes(val) ? curr.filter((e) => e !== val) : [...curr, val]);
  }
  return (
    <div className="space-y-6">
      <div>
        <label className="label">Training experience</label>
        <div className="flex flex-col gap-2">
          {experiences.map(({ v, l }) => (
            <OptionCard key={v} value={v} label={l} selected={data.experience === v} onClick={() => set('experience', v)} />
          ))}
        </div>
      </div>
      <div>
        <label className="label">Current activity level (outside planned workouts)</label>
        <div className="flex flex-col gap-2">
          {activities.map(({ v, l }) => (
            <OptionCard key={v} value={v} label={l} selected={data.activityLevel === v} onClick={() => set('activityLevel', v)} />
          ))}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <NumberInput label="Workout days / week" value={data.workoutDaysPerWeek} onChange={(v) => set('workoutDaysPerWeek', v)} min={1} max={7} unit="days" />
      </div>
      <div>
        <label className="label">Workout location</label>
        <div className="flex gap-3">
          {locations.map(({ v, l }) => (
            <OptionCard key={v} value={v} label={l} selected={data.workoutLocation === v} onClick={() => set('workoutLocation', v)} />
          ))}
        </div>
      </div>
      <div>
        <label className="label">Available equipment (select all that apply)</label>
        <div className="flex flex-wrap gap-2">
          {EQUIPMENT_OPTIONS.map(({ value, label }) => (
            <OptionCard key={value} value={value} label={label} small
              selected={(data.equipment as string[]).includes(value)}
              onClick={() => toggleEquip(value)} />
          ))}
        </div>
      </div>
      <div>
        <label className="label">Injuries or physical limitations (optional)</label>
        <textarea
          value={data.injuries}
          onChange={(e) => set('injuries', e.target.value)}
          placeholder="e.g. bad knees, lower back pain, shoulder impingement..."
          rows={3}
          className="input resize-none"
        />
      </div>
    </div>
  );
}

function Step4({ data, set }: { data: FormData; set: (k: keyof FormData, v: FormData[keyof FormData]) => void }) {
  const diets = [
    { v: 'normal',       l: '🍽️ No restrictions' },
    { v: 'vegetarian',   l: '🥗 Vegetarian' },
    { v: 'vegan',        l: '🌱 Vegan' },
    { v: 'halal',        l: '☪️ Halal' },
    { v: 'keto',         l: '🥑 Keto' },
    { v: 'paleo',        l: '🥩 Paleo' },
    { v: 'gluten-free',  l: '🌾 Gluten-free' },
  ];
  return (
    <div className="space-y-6">
      <div>
        <label className="label">Dietary preference</label>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {diets.map(({ v, l }) => (
            <OptionCard key={v} value={v} label={l} selected={data.dietaryPreference === v} onClick={() => set('dietaryPreference', v)} />
          ))}
        </div>
      </div>
      <div>
        <label className="label">Food allergies (optional)</label>
        <input
          type="text"
          value={data.allergies}
          onChange={(e) => set('allergies', e.target.value)}
          placeholder="e.g. nuts, dairy, shellfish..."
          className="input"
        />
      </div>
      <div>
        <label className="label">Foods you dislike (optional)</label>
        <input
          type="text"
          value={data.dislikedFoods}
          onChange={(e) => set('dislikedFoods', e.target.value)}
          placeholder="e.g. liver, cabbage..."
          className="input"
        />
      </div>
      <NumberInput label="Meals per day" value={data.mealsPerDay} onChange={(v) => set('mealsPerDay', v)} min={1} max={8} unit="meals" />
    </div>
  );
}

function Step5({ data, set }: { data: FormData; set: (k: keyof FormData, v: FormData[keyof FormData]) => void }) {
  const stress  = [{ v: 'low', l: '😌 Low' }, { v: 'moderate', l: '😐 Moderate' }, { v: 'high', l: '😤 High' }];
  const jobType = [{ v: 'sedentary', l: '💻 Desk job' }, { v: 'mixed', l: '🔄 Mixed' }, { v: 'active', l: '🏗️ Physical job' }];
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <NumberInput label="Sleep hours / night" value={data.sleepHours} onChange={(v) => set('sleepHours', v)} min={3} max={14} step={0.5} unit="hrs" />
        <NumberInput label="Current water intake" value={data.waterIntakeLiters} onChange={(v) => set('waterIntakeLiters', v)} min={0} max={10} step={0.5} unit="L" />
      </div>
      <div>
        <label className="label">Stress level</label>
        <div className="flex gap-3">
          {stress.map(({ v, l }) => (
            <OptionCard key={v} value={v} label={l} selected={data.stressLevel === v} onClick={() => set('stressLevel', v)} />
          ))}
        </div>
      </div>
      <div>
        <label className="label">Job / daily lifestyle</label>
        <div className="flex gap-3">
          {jobType.map(({ v, l }) => (
            <OptionCard key={v} value={v} label={l} selected={data.jobType === v} onClick={() => set('jobType', v)} />
          ))}
        </div>
      </div>
    </div>
  );
}

function Step6({ data }: { data: FormData }) {
  const rows = [
    ['Age', `${data.age} yrs`],
    ['Sex', data.sex],
    ['Height', `${data.heightCm} cm`],
    ['Weight', `${data.weightKg} kg`],
    ['Goal weight', `${data.goalWeightKg} kg`],
    ['Physique goal', data.physiqueGoal],
    ['Timeline', data.timeline],
    ['Experience', data.experience],
    ['Activity level', data.activityLevel],
    ['Workout days', `${data.workoutDaysPerWeek}/wk @ ${data.workoutLocation}`],
    ['Diet', data.dietaryPreference],
    ['Meals/day', `${data.mealsPerDay}`],
    ['Sleep', `${data.sleepHours} hrs`],
    ['Job type', data.jobType],
  ];
  return (
    <div className="space-y-4">
      <div className="rounded-xl bg-brand-50 border border-brand-200 px-4 py-3">
        <p className="text-sm text-brand-800 font-medium">✅ Looking great! Review your details and we&apos;ll generate your personalised plan.</p>
      </div>
      <div className="divide-y divide-slate-100">
        {rows.map(([k, v]) => (
          <div key={k} className="flex justify-between py-2 text-sm">
            <span className="text-slate-500">{k}</span>
            <span className="font-medium text-slate-900 capitalize">{v || '—'}</span>
          </div>
        ))}
      </div>
      <p className="disclaimer">
        ⚠️ PhysiquePath provides general wellness information only. It is not a substitute for advice from a licensed
        physician, registered dietitian, or certified trainer. If you have a medical condition or eating disorder,
        please consult a healthcare professional before following any nutrition or exercise plan.
      </p>
    </div>
  );
}

// ─── Main page ─────────────────────────────────────────────────────────────────

function validate(step: number, data: FormData): string | null {
  if (step === 1) {
    if (!data.sex)       return 'Please select your biological sex.';
    if (data.age < 13)   return 'You must be at least 13 to use PhysiquePath.';
  }
  if (step === 2) {
    if (!data.physiqueGoal) return 'Please choose a physique goal.';
    if (!data.timeline)     return 'Please choose a timeline.';
  }
  if (step === 3) {
    if (!data.experience)    return 'Please select your training experience.';
    if (!data.activityLevel) return 'Please select your activity level.';
    if (!data.workoutLocation) return 'Please select your workout location.';
  }
  if (step === 4) {
    if (!data.dietaryPreference) return 'Please select a dietary preference.';
  }
  if (step === 5) {
    if (!data.stressLevel) return 'Please select your stress level.';
    if (!data.jobType)     return 'Please select your job type.';
  }
  return null;
}

export default function OnboardingPage() {
  const router  = useRouter();
  const { data: session } = useSession();
  const [step,    setStep]    = useState(1);
  const [data,    setDataRaw] = useState<FormData>(defaults);
  const [error,   setError]   = useState('');
  const [loading, setLoading] = useState(false);

  function set(k: keyof FormData, v: FormData[keyof FormData]) {
    setDataRaw((prev) => ({ ...prev, [k]: v }));
  }

  function next() {
    const err = validate(step, data);
    if (err) { setError(err); return; }
    setError('');
    setStep((s) => Math.min(s + 1, STEPS.length));
  }

  function back() {
    setError('');
    setStep((s) => Math.max(s - 1, 1));
  }

  async function submit() {
    if (!session?.user) return;
    setLoading(true);
    setError('');
    try {
      const payload = {
        ...data,
        bodyFatPercent: data.bodyFatPercent === '' ? undefined : data.bodyFatPercent,
        allergies:     data.allergies     ? data.allergies.split(',').map((s) => s.trim()).filter(Boolean) : [],
        dislikedFoods: data.dislikedFoods ? data.dislikedFoods.split(',').map((s) => s.trim()).filter(Boolean) : [],
      };

      const res = await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? 'Failed to save profile');
      }

      // Generate plan
      await fetch('/api/plan/generate', { method: 'POST' });

      router.push('/dashboard');
      router.refresh();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  const progress = ((step - 1) / (STEPS.length - 1)) * 100;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="mx-auto max-w-2xl">
          <div className="flex items-center justify-between mb-3">
            <span className="text-lg font-bold text-brand-600">PhysiquePath</span>
            <span className="text-sm text-slate-500">Step {step} of {STEPS.length}</span>
          </div>
          <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-brand-500 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="mt-3">
            <h2 className="text-lg font-semibold text-slate-900">{STEPS[step - 1].title}</h2>
            <p className="text-sm text-slate-500">{STEPS[step - 1].subtitle}</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 py-8">
        <div className="mx-auto max-w-2xl animate-slide-up">
          {step === 1 && <Step1 data={data} set={set} />}
          {step === 2 && <Step2 data={data} set={set} />}
          {step === 3 && <Step3 data={data} set={set} />}
          {step === 4 && <Step4 data={data} set={set} />}
          {step === 5 && <Step5 data={data} set={set} />}
          {step === 6 && <Step6 data={data} />}

          {error && (
            <div className="mt-4 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}
        </div>
      </div>

      {/* Footer nav */}
      <div className="bg-white border-t border-slate-200 px-6 py-4">
        <div className="mx-auto max-w-2xl flex items-center justify-between">
          <button
            type="button"
            onClick={back}
            disabled={step === 1}
            className="btn-outline disabled:invisible gap-1"
          >
            <ChevronLeft className="h-4 w-4" /> Back
          </button>

          {step < STEPS.length ? (
            <button type="button" onClick={next} className="btn-primary gap-1">
              Continue <ChevronRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={submit}
              disabled={loading}
              className="btn-primary gap-1"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Generate my plan <ChevronRight className="h-4 w-4" /></>}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
