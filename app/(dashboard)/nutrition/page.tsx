import { getServerSession } from 'next-auth';
import { authOptions }      from '@/lib/auth';
import { db }               from '@/lib/db';
import { redirect }         from 'next/navigation';
import { ShoppingCart, Utensils, Lightbulb, AlertTriangle } from 'lucide-react';
import { capitalize }       from '@/lib/utils';

export default async function NutritionPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect('/login');
  const userId = (session.user as { id: string }).id;

  const nutritionPlan = await db.nutritionPlan.findFirst({
    where: { profile: { userId } },
  });
  const profile = await db.profile.findUnique({ where: { userId } });

  if (!nutritionPlan || !profile) redirect('/onboarding');

  type Meal = { name: string; time: string; foods: string[]; approxCalories: number; approxProtein: number };
  const mealPlan    = nutritionPlan.mealPlan    as Meal[];
  const groceryList = nutritionPlan.groceryList as string[];
  const tips        = nutritionPlan.tips        as string[];

  const macros = [
    { label: 'Protein',  grams: nutritionPlan.proteinGrams, pct: Math.round((nutritionPlan.proteinGrams * 4 / nutritionPlan.dailyCalories) * 100), color: 'bg-brand-500', light: 'bg-brand-50 text-brand-700' },
    { label: 'Carbs',    grams: nutritionPlan.carbsGrams,   pct: Math.round((nutritionPlan.carbsGrams   * 4 / nutritionPlan.dailyCalories) * 100), color: 'bg-blue-500',  light: 'bg-blue-50 text-blue-700' },
    { label: 'Fat',      grams: nutritionPlan.fatGrams,     pct: Math.round((nutritionPlan.fatGrams     * 9 / nutritionPlan.dailyCalories) * 100), color: 'bg-amber-500', light: 'bg-amber-50 text-amber-700' },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">Nutrition Plan</h1>
        <p className="page-subtitle">Personalised for your {capitalize(profile.physiqueGoal)} goal · {capitalize(profile.dietaryPreference)} diet</p>
      </div>

      {/* Calorie & macro overview */}
      <div className="card p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-6">Daily targets</h2>
        <div className="flex flex-col items-center gap-8 sm:flex-row">
          {/* Calorie ring */}
          <div className="flex flex-col items-center">
            <div className="relative flex h-36 w-36 items-center justify-center">
              <svg className="absolute inset-0 h-full w-full -rotate-90" viewBox="0 0 120 120">
                <circle cx="60" cy="60" r="50" fill="none" stroke="#e2e8f0" strokeWidth="12" />
                <circle cx="60" cy="60" r="50" fill="none" stroke="#059669" strokeWidth="12"
                  strokeDasharray={`${Math.PI * 100}`} strokeDashoffset={`${Math.PI * 100 * 0}`}
                  strokeLinecap="round" />
              </svg>
              <div className="text-center">
                <span className="text-3xl font-black text-slate-900">{nutritionPlan.dailyCalories}</span>
                <span className="block text-xs text-slate-500">kcal / day</span>
              </div>
            </div>
            <p className="mt-2 text-sm text-slate-500">Daily calorie target</p>
          </div>

          {/* Macros */}
          <div className="flex-1 space-y-4 w-full">
            {macros.map(({ label, grams, pct, color, light }) => (
              <div key={label}>
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="font-medium text-slate-700">{label}</span>
                  <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${light}`}>
                    {grams}g · {pct}%
                  </span>
                </div>
                <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                  <div className={`h-full ${color} rounded-full`} style={{ width: `${pct}%` }} />
                </div>
              </div>
            ))}
            <div className="mt-3 flex items-center gap-2 rounded-xl bg-blue-50 px-3 py-2">
              <span className="text-blue-600 text-sm">💧</span>
              <span className="text-sm text-blue-700 font-medium">Hydration goal: {nutritionPlan.hydrationLiters}L / day</span>
            </div>
          </div>
        </div>
      </div>

      {/* Meal plan */}
      <div className="card p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-1 flex items-center gap-2">
          <Utensils className="h-5 w-5 text-brand-600" /> Example daily meal plan
        </h2>
        <p className="text-sm text-slate-500 mb-6">These are suggestions — swap foods freely as long as macros stay close.</p>
        <div className="grid gap-4 sm:grid-cols-2">
          {mealPlan.map((meal, i) => (
            <div key={i} className="rounded-xl border border-slate-200 p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="font-semibold text-slate-900">{meal.name}</p>
                  <p className="text-xs text-slate-400">{meal.time}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-slate-900">~{meal.approxCalories} kcal</p>
                  <p className="text-xs text-slate-400">~{meal.approxProtein}g protein</p>
                </div>
              </div>
              <ul className="space-y-1">
                {meal.foods.map((f, j) => (
                  <li key={j} className="text-sm text-slate-600 flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-brand-400 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Grocery list */}
      <div className="card p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
          <ShoppingCart className="h-5 w-5 text-brand-600" /> Weekly grocery list
        </h2>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {groceryList.map((item, i) => (
            <div key={i} className="flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2">
              <span className="h-2 w-2 rounded-full bg-brand-400 shrink-0" />
              <span className="text-sm text-slate-700">{item}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Tips */}
      <div className="card p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-amber-500" /> Nutrition tips
        </h2>
        <ul className="space-y-3">
          {tips.map((tip, i) => (
            <li key={i} className="flex gap-3 text-sm">
              <span className="flex-shrink-0 flex h-5 w-5 items-center justify-center rounded-full bg-brand-100 text-brand-700 text-xs font-bold">{i + 1}</span>
              <span className="text-slate-700">{tip}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Safety warning */}
      <div className="rounded-2xl border border-red-200 bg-red-50 p-5 flex gap-3">
        <AlertTriangle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-red-800">Important safety note</p>
          <p className="text-sm text-red-700 mt-1">
            Never consume fewer than 1,200 kcal/day (women) or 1,500 kcal/day (men) without medical supervision.
            Extreme calorie restriction is harmful and counterproductive. If you feel dizzy, extremely fatigued, or
            are having disordered thoughts about food, please consult a healthcare professional immediately.
          </p>
        </div>
      </div>
    </div>
  );
}
