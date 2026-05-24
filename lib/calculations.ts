/**
 * Core fitness calculations used to generate personalised plans.
 * All formulas are based on peer-reviewed research; results are
 * estimates and not medical advice.
 */

export type Sex = 'male' | 'female' | 'other';
export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'very' | 'extra';
export type PhysiqueGoal =
  | 'lean'
  | 'athletic'
  | 'muscular'
  | 'bulky'
  | 'toned'
  | 'strength'
  | 'fat-loss';
export type Timeline = 'slow' | 'moderate' | 'aggressive';

const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  light:     1.375,
  moderate:  1.55,
  very:      1.725,
  extra:     1.9,
};

/** Mifflin-St Jeor BMR (kcal/day) */
export function calculateBMR(
  weightKg: number,
  heightCm: number,
  age: number,
  sex: Sex,
): number {
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
  // Use male formula for 'other' as a neutral default
  return sex === 'female' ? base - 161 : base + 5;
}

/** Total Daily Energy Expenditure */
export function calculateTDEE(bmr: number, activityLevel: ActivityLevel): number {
  return Math.round(bmr * (ACTIVITY_MULTIPLIERS[activityLevel] ?? 1.55));
}

/** Safe minimum calories (avoid starvation diets) */
export function minimumCalories(sex: Sex): number {
  return sex === 'female' ? 1200 : 1500;
}

/** Daily calorie target based on goal and timeline */
export function calculateCalorieTarget(
  tdee: number,
  goal: PhysiqueGoal,
  timeline: Timeline,
  currentWeightKg: number,
  goalWeightKg: number,
  sex: Sex,
): number {
  const minCals = minimumCalories(sex);
  const needsLoss  = currentWeightKg > goalWeightKg + 1;
  const needsGain  = currentWeightKg < goalWeightKg - 1;

  const isGainGoal = goal === 'muscular' || goal === 'bulky';
  const isLossGoal = goal === 'fat-loss' || goal === 'lean' || goal === 'toned';

  if (isLossGoal || needsLoss) {
    const deficits: Record<Timeline, number> = { slow: 250, moderate: 400, aggressive: 600 };
    return Math.max(tdee - deficits[timeline], minCals);
  }

  if (isGainGoal || needsGain) {
    const surpluses: Record<Timeline, number> = { slow: 150, moderate: 300, aggressive: 450 };
    return tdee + surpluses[timeline];
  }

  // Maintenance / recomposition
  return tdee;
}

/** Macro targets in grams */
export function calculateMacros(
  calories: number,
  weightKg: number,
  goal: PhysiqueGoal,
): { proteinGrams: number; fatGrams: number; carbsGrams: number } {
  const proteinPerKg: Record<PhysiqueGoal, number> = {
    'fat-loss':  2.0,
    lean:        1.9,
    toned:       1.8,
    athletic:    2.0,
    strength:    2.2,
    muscular:    2.2,
    bulky:       2.0,
  };

  const proteinGrams = Math.round(weightKg * (proteinPerKg[goal] ?? 1.8));
  const proteinCals  = proteinGrams * 4;

  // Fat = 25–30 % of calories
  const fatCalories = Math.round(calories * 0.27);
  const fatGrams    = Math.round(fatCalories / 9);

  // Carbs get the remainder
  const carbCals  = Math.max(0, calories - proteinCals - fatCalories);
  const carbsGrams = Math.round(carbCals / 4);

  return { proteinGrams, fatGrams, carbsGrams };
}

/** Hydration goal in litres */
export function calculateHydration(weightKg: number, activityLevel: ActivityLevel): number {
  const base = weightKg * 0.033;
  const bonus: Record<ActivityLevel, number> = {
    sedentary: 0,
    light:     0.3,
    moderate:  0.5,
    very:      0.8,
    extra:     1.0,
  };
  return Math.round((base + bonus[activityLevel]) * 10) / 10;
}

/** Expected weekly weight change in kg (negative = loss) */
export function weeklyWeightChange(
  tdee: number,
  calorieTarget: number,
): number {
  const weeklyDeficit = (calorieTarget - tdee) * 7; // negative = deficit
  return Math.round((weeklyDeficit / 7700) * 10) / 10; // 7700 kcal ≈ 1 kg
}

/** Estimated weeks to reach goal weight */
export function estimatedTimeline(
  currentWeightKg: number,
  goalWeightKg: number,
  weeklyChange: number,
): number {
  if (Math.abs(weeklyChange) < 0.05) return 0; // maintenance
  const delta = goalWeightKg - currentWeightKg;
  if ((delta < 0 && weeklyChange > 0) || (delta > 0 && weeklyChange < 0)) return 0;
  return Math.ceil(Math.abs(delta / weeklyChange));
}
