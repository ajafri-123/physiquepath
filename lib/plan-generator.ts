import type { Profile } from '@prisma/client';
import {
  calculateBMR,
  calculateTDEE,
  calculateCalorieTarget,
  calculateMacros,
  calculateHydration,
  weeklyWeightChange,
  estimatedTimeline,
  type ActivityLevel,
  type PhysiqueGoal,
  type Sex,
  type Timeline,
} from './calculations';

// ─── Exercise library ─────────────────────────────────────────────────────────

export interface Exercise {
  name: string;
  sets: string;
  reps: string;
  rest: string;
  muscles: string[];
  equipment: string[];
  instructions: string;
  alternatives?: string[];
}

const EXERCISE_LIBRARY: Record<string, Exercise> = {
  squat: {
    name: 'Barbell Back Squat',
    sets: '4', reps: '6–10', rest: '2–3 min',
    muscles: ['quads', 'glutes', 'hamstrings'],
    equipment: ['barbell'],
    instructions: 'Stand with feet shoulder-width apart. Brace core, descend until thighs are parallel, drive through heels to stand.',
    alternatives: ['Goblet Squat', 'Leg Press', 'Bodyweight Squat'],
  },
  gobletSquat: {
    name: 'Goblet Squat',
    sets: '3', reps: '10–15', rest: '90s',
    muscles: ['quads', 'glutes'],
    equipment: ['dumbbell', 'none'],
    instructions: 'Hold a dumbbell at chest height. Squat down keeping your chest tall, elbows inside knees.',
    alternatives: ['Bodyweight Squat', 'Split Squat'],
  },
  deadlift: {
    name: 'Conventional Deadlift',
    sets: '3', reps: '5–8', rest: '3 min',
    muscles: ['hamstrings', 'glutes', 'back', 'traps'],
    equipment: ['barbell'],
    instructions: 'Grip bar just outside legs, hinge at hips, keep back neutral, drive hips forward to stand.',
    alternatives: ['Romanian Deadlift', 'Dumbbell RDL', 'Hip Hinge'],
  },
  rdl: {
    name: 'Romanian Deadlift',
    sets: '3', reps: '10–12', rest: '2 min',
    muscles: ['hamstrings', 'glutes'],
    equipment: ['barbell', 'dumbbell'],
    instructions: 'Hold weight at hips, push hips back (hinge), lower weight along legs until you feel a stretch in hamstrings, then drive hips forward.',
    alternatives: ['Single-Leg RDL', 'Good Morning'],
  },
  benchPress: {
    name: 'Barbell Bench Press',
    sets: '4', reps: '6–10', rest: '2–3 min',
    muscles: ['chest', 'triceps', 'shoulders'],
    equipment: ['barbell', 'bench'],
    instructions: 'Lie on bench, grip bar slightly wider than shoulder-width. Lower to chest, press up explosively.',
    alternatives: ['Dumbbell Press', 'Push-Up', 'Cable Fly'],
  },
  dbPress: {
    name: 'Dumbbell Bench Press',
    sets: '3', reps: '10–12', rest: '90s',
    muscles: ['chest', 'triceps', 'shoulders'],
    equipment: ['dumbbell', 'bench'],
    instructions: 'Lie on bench holding dumbbells. Press up until arms are extended, lower with control.',
    alternatives: ['Push-Up', 'Chest Fly'],
  },
  pushUp: {
    name: 'Push-Up',
    sets: '3', reps: '10–20', rest: '60s',
    muscles: ['chest', 'triceps', 'shoulders'],
    equipment: ['none'],
    instructions: 'Hands slightly wider than shoulders, body in a plank. Lower chest to floor, press up.',
    alternatives: ['Incline Push-Up', 'Knee Push-Up'],
  },
  pullUp: {
    name: 'Pull-Up',
    sets: '3', reps: '5–10', rest: '2 min',
    muscles: ['lats', 'biceps', 'rear delts'],
    equipment: ['pullup_bar'],
    instructions: 'Hang from bar with overhand grip. Pull chest to bar, lower with control.',
    alternatives: ['Lat Pulldown', 'Band-Assisted Pull-Up', 'Inverted Row'],
  },
  latPulldown: {
    name: 'Lat Pulldown',
    sets: '3', reps: '10–12', rest: '90s',
    muscles: ['lats', 'biceps'],
    equipment: ['cables', 'machines'],
    instructions: 'Grip bar wider than shoulders, pull bar to upper chest while leaning slightly back.',
    alternatives: ['Pull-Up', 'Band Pull-Down'],
  },
  rowBarbell: {
    name: 'Barbell Bent-Over Row',
    sets: '4', reps: '6–10', rest: '2 min',
    muscles: ['upper back', 'lats', 'biceps'],
    equipment: ['barbell'],
    instructions: 'Hinge forward ~45°, pull bar to lower chest/navel, squeeze shoulder blades.',
    alternatives: ['Dumbbell Row', 'Cable Row', 'Inverted Row'],
  },
  dbRow: {
    name: 'Dumbbell Single-Arm Row',
    sets: '3', reps: '10–12', rest: '60s',
    muscles: ['lats', 'upper back'],
    equipment: ['dumbbell', 'bench'],
    instructions: 'Place knee on bench, pull dumbbell from floor to hip, elbow close to body.',
    alternatives: ['Cable Row', 'Inverted Row'],
  },
  invRow: {
    name: 'Inverted Row',
    sets: '3', reps: '8–15', rest: '90s',
    muscles: ['upper back', 'biceps'],
    equipment: ['none'],
    instructions: 'Lie under a sturdy table/bar, pull chest up to bar keeping body straight.',
    alternatives: ['Band Row', 'Dumbbell Row'],
  },
  ohp: {
    name: 'Overhead Press',
    sets: '3', reps: '8–12', rest: '2 min',
    muscles: ['shoulders', 'triceps'],
    equipment: ['barbell', 'dumbbell'],
    instructions: 'Press weight from shoulders overhead until arms are fully extended, lower with control.',
    alternatives: ['Arnold Press', 'Pike Push-Up'],
  },
  lateralRaise: {
    name: 'Lateral Raise',
    sets: '3', reps: '12–15', rest: '60s',
    muscles: ['side delts'],
    equipment: ['dumbbell', 'cables'],
    instructions: 'Raise dumbbells to the side until arms are parallel to the floor, lower slowly.',
  },
  tricepDip: {
    name: 'Tricep Dip',
    sets: '3', reps: '10–15', rest: '60s',
    muscles: ['triceps', 'chest'],
    equipment: ['none'],
    instructions: 'Place hands on bench behind you, lower body by bending elbows, press back up.',
    alternatives: ['Cable Pushdown', 'Close-Grip Push-Up'],
  },
  bicepCurl: {
    name: 'Dumbbell Bicep Curl',
    sets: '3', reps: '10–15', rest: '60s',
    muscles: ['biceps'],
    equipment: ['dumbbell'],
    instructions: 'Curl dumbbells from hips to shoulders, control the descent.',
  },
  lungeFwd: {
    name: 'Forward Lunge',
    sets: '3', reps: '10–12 each', rest: '90s',
    muscles: ['quads', 'glutes', 'hamstrings'],
    equipment: ['none', 'dumbbell'],
    instructions: 'Step forward into a lunge until both knees reach 90°, push back to start.',
    alternatives: ['Reverse Lunge', 'Split Squat'],
  },
  stepUp: {
    name: 'Step-Up',
    sets: '3', reps: '10 each', rest: '60s',
    muscles: ['quads', 'glutes'],
    equipment: ['none'],
    instructions: 'Step onto an elevated surface (box/chair), drive through heel, bring other foot up.',
  },
  hipThrust: {
    name: 'Hip Thrust',
    sets: '3', reps: '12–15', rest: '90s',
    muscles: ['glutes', 'hamstrings'],
    equipment: ['barbell', 'dumbbell', 'bench'],
    instructions: 'Upper back on bench, feet flat, drive hips up squeezing glutes at top.',
    alternatives: ['Glute Bridge', 'Donkey Kick'],
  },
  calfRaise: {
    name: 'Calf Raise',
    sets: '4', reps: '15–20', rest: '60s',
    muscles: ['calves'],
    equipment: ['none'],
    instructions: 'Rise onto toes slowly, lower all the way down for a full stretch.',
  },
  plank: {
    name: 'Plank',
    sets: '3', reps: '30–60s', rest: '45s',
    muscles: ['core', 'abs'],
    equipment: ['none'],
    instructions: 'Forearms on floor, body in a straight line from head to heels. Breathe steadily.',
    alternatives: ['Dead Bug', 'Bird Dog'],
  },
  crunches: {
    name: 'Crunch',
    sets: '3', reps: '15–20', rest: '45s',
    muscles: ['abs'],
    equipment: ['none'],
    instructions: 'Lie on back, hands behind head, curl upper body toward knees.',
    alternatives: ['Leg Raise', 'Ab Wheel'],
  },
  mountainClimber: {
    name: 'Mountain Climber',
    sets: '3', reps: '20 each', rest: '45s',
    muscles: ['core', 'cardio'],
    equipment: ['none'],
    instructions: 'In push-up position, alternate driving knees to chest quickly.',
  },
  cableFly: {
    name: 'Cable Fly',
    sets: '3', reps: '12–15', rest: '60s',
    muscles: ['chest'],
    equipment: ['cables'],
    instructions: 'Set cables at shoulder height, bring handles together in an arc in front of chest.',
    alternatives: ['Dumbbell Fly', 'Push-Up'],
  },
  facePull: {
    name: 'Face Pull',
    sets: '3', reps: '15–20', rest: '60s',
    muscles: ['rear delts', 'rotator cuff'],
    equipment: ['cables'],
    instructions: 'Pull cable rope to face level, keeping elbows high. Excellent for shoulder health.',
    alternatives: ['Band Face Pull', 'Rear Delt Fly'],
  },
};

// ─── Workout templates ────────────────────────────────────────────────────────

export interface WorkoutDay {
  day: string;
  name: string;
  exercises: Exercise[];
  notes?: string;
}

function hasEquipment(userEquipment: string[], required: string[]): boolean {
  if (required.includes('none')) return true;
  return required.some((e) => userEquipment.includes(e));
}

function pickExercises(
  keys: string[],
  userEquipment: string[],
): Exercise[] {
  return keys
    .map((k) => EXERCISE_LIBRARY[k])
    .filter(Boolean)
    .filter((ex) => hasEquipment(userEquipment, ex.equipment));
}

function buildFullBodyDay(
  dayName: string,
  equipment: string[],
  variant: 'A' | 'B',
): WorkoutDay {
  const exercises =
    variant === 'A'
      ? pickExercises(
          ['squat', 'benchPress', 'rowBarbell', 'ohp', 'rdl', 'plank'],
          equipment,
        )
      : pickExercises(
          ['gobletSquat', 'dbPress', 'dbRow', 'lateralRaise', 'lungeFwd', 'crunches'],
          equipment,
        );

  // Fallback to bodyweight if no equipment matched
  const filtered = exercises.length
    ? exercises
    : pickExercises(
        variant === 'A'
          ? ['gobletSquat', 'pushUp', 'invRow', 'ohp', 'lungeFwd', 'plank']
          : ['stepUp', 'pushUp', 'invRow', 'tricepDip', 'calfRaise', 'mountainClimber'],
        ['none'],
      );

  return { day: dayName, name: `Full Body ${variant}`, exercises: filtered };
}

function buildUpperDay(dayName: string, equipment: string[], emphasis: 'push' | 'pull'): WorkoutDay {
  const exercises =
    emphasis === 'push'
      ? pickExercises(['benchPress', 'dbPress', 'ohp', 'lateralRaise', 'tricepDip', 'cableFly'], equipment)
      : pickExercises(['pullUp', 'latPulldown', 'rowBarbell', 'dbRow', 'bicepCurl', 'facePull'], equipment);
  return { day: dayName, name: `Upper Body (${emphasis === 'push' ? 'Push' : 'Pull'})`, exercises: exercises.slice(0, 5) };
}

function buildLowerDay(dayName: string, equipment: string[], emphasis: 'quad' | 'posterior'): WorkoutDay {
  const exercises =
    emphasis === 'quad'
      ? pickExercises(['squat', 'lungeFwd', 'stepUp', 'calfRaise', 'plank'], equipment)
      : pickExercises(['deadlift', 'rdl', 'hipThrust', 'calfRaise', 'crunches'], equipment);
  return { day: dayName, name: `Lower Body (${emphasis === 'quad' ? 'Quad-Focus' : 'Posterior-Chain'})`, exercises };
}

function buildPushDay(dayName: string, equipment: string[]): WorkoutDay {
  const exercises = pickExercises(['benchPress', 'ohp', 'cableFly', 'lateralRaise', 'tricepDip'], equipment);
  return { day: dayName, name: 'Push (Chest / Shoulders / Triceps)', exercises };
}

function buildPullDay(dayName: string, equipment: string[]): WorkoutDay {
  const exercises = pickExercises(['pullUp', 'rowBarbell', 'latPulldown', 'facePull', 'bicepCurl'], equipment);
  return { day: dayName, name: 'Pull (Back / Biceps)', exercises };
}

function buildLegsDay(dayName: string, equipment: string[]): WorkoutDay {
  const exercises = pickExercises(['squat', 'rdl', 'lungeFwd', 'hipThrust', 'calfRaise'], equipment);
  return { day: dayName, name: 'Legs (Quads / Hamstrings / Glutes)', exercises };
}

const ALL_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export function buildWorkoutSchedule(
  experience: string,
  days: number,
  equipment: string[],
  goal: PhysiqueGoal,
): WorkoutDay[] {
  const d = Math.min(Math.max(days, 2), 6);
  const schedule: WorkoutDay[] = [];
  const workDays = ALL_DAYS.slice(0, d === 3 ? 5 : 7)
    .filter((_, i) => {
      // Spread workout days evenly
      if (d === 3) return [0, 2, 4].includes(i); // Mon Wed Fri
      if (d === 4) return [0, 1, 3, 4].includes(i);
      if (d === 5) return [0, 1, 2, 3, 4].includes(i);
      if (d === 6) return i < 6;
      return i < 2;
    })
    .slice(0, d);

  if (experience === 'beginner' || d <= 3) {
    const patterns: Array<'A' | 'B'> = ['A', 'B', 'A'];
    workDays.forEach((day, i) => {
      schedule.push(buildFullBodyDay(day, equipment, patterns[i % 2] as 'A' | 'B'));
    });
    return schedule;
  }

  if (experience === 'intermediate' || d === 4) {
    const builders = [
      (day: string) => buildUpperDay(day, equipment, 'push'),
      (day: string) => buildLowerDay(day, equipment, 'quad'),
      (day: string) => buildUpperDay(day, equipment, 'pull'),
      (day: string) => buildLowerDay(day, equipment, 'posterior'),
    ];
    workDays.slice(0, 4).forEach((day, i) => schedule.push(builders[i % 4](day)));
    return schedule;
  }

  // Advanced — PPL
  const pplBuilders = [
    (day: string) => buildPushDay(day, equipment),
    (day: string) => buildPullDay(day, equipment),
    (day: string) => buildLegsDay(day, equipment),
    (day: string) => buildPushDay(day, equipment),
    (day: string) => buildPullDay(day, equipment),
    (day: string) => buildLegsDay(day, equipment),
  ];
  workDays.forEach((day, i) => schedule.push(pplBuilders[i % 6](day)));
  return schedule;
}

// ─── Meal plan ────────────────────────────────────────────────────────────────

export interface Meal {
  name: string;
  time: string;
  foods: string[];
  approxCalories: number;
  approxProtein: number;
}

function buildMealPlan(
  dailyCalories: number,
  proteinGrams: number,
  mealsPerDay: number,
  diet: string,
): Meal[] {
  const caloriesPerMeal = Math.round(dailyCalories / mealsPerDay);
  const proteinPerMeal  = Math.round(proteinGrams   / mealsPerDay);

  const mealTimes = ['7:00 AM', '10:30 AM', '1:00 PM', '4:00 PM', '7:00 PM', '9:00 PM', '10:00 PM', '6:00 AM'];

  const highProteinFoods: Record<string, string[][]> = {
    normal:      [
      ['Scrambled eggs (3)', 'Oats with milk', 'Banana'],
      ['Greek yogurt', 'Mixed berries', 'Almonds'],
      ['Grilled chicken breast', 'Brown rice', 'Steamed broccoli'],
      ['Cottage cheese', 'Apple slices', 'Rice cakes'],
      ['Salmon fillet', 'Sweet potato', 'Green salad'],
    ],
    vegetarian:  [
      ['Scrambled eggs (3)', 'Whole-wheat toast', 'Orange'],
      ['Greek yogurt', 'Granola', 'Blueberries'],
      ['Paneer tikka', 'Brown rice', 'Lentil soup'],
      ['Cottage cheese', 'Carrot sticks', 'Hummus'],
      ['Tofu stir-fry', 'Quinoa', 'Roasted vegetables'],
    ],
    vegan:       [
      ['Tofu scramble', 'Whole-wheat toast', 'Avocado'],
      ['Soy yogurt', 'Mixed berries', 'Hemp seeds'],
      ['Tempeh bowl', 'Brown rice', 'Edamame'],
      ['Protein shake (plant-based)', 'Banana', 'Peanut butter'],
      ['Chickpea curry', 'Quinoa', 'Roasted broccoli'],
    ],
    halal:       [
      ['Eggs (3 ways)', 'Whole-wheat toast', 'Dates'],
      ['Labneh', 'Cucumber slices', 'Whole-grain crackers'],
      ['Grilled chicken', 'Brown rice', 'Tabbouleh'],
      ['Protein shake', 'Apple', 'Almonds'],
      ['Lamb kebab', 'Bulgur wheat', 'Mixed salad'],
    ],
    keto:        [
      ['Bacon & eggs', 'Avocado', 'Spinach'],
      ['Macadamia nuts', 'Cheese cubes'],
      ['Grilled chicken thigh', 'Cauliflower rice', 'Green beans'],
      ['Beef jerky', 'Celery & cream cheese'],
      ['Salmon with butter', 'Asparagus', 'Caesar salad'],
    ],
    paleo:       [
      ['Eggs (3)', 'Sweet potato hash', 'Berries'],
      ['Almonds', 'Apple'],
      ['Grilled turkey', 'Roasted vegetables', 'Guacamole'],
      ['Hard-boiled eggs', 'Cucumber'],
      ['Grass-fed beef steak', 'Roasted beets', 'Arugula salad'],
    ],
    'gluten-free': [
      ['Eggs & spinach omelette', 'Rice cakes', 'Orange'],
      ['Greek yogurt', 'Granola (GF)', 'Strawberries'],
      ['Grilled chicken', 'Quinoa', 'Roasted peppers'],
      ['Protein shake', 'Rice crackers', 'Almond butter'],
      ['Baked salmon', 'Brown rice', 'Steamed broccoli'],
    ],
  };

  const foods = highProteinFoods[diet] ?? highProteinFoods.normal;

  return Array.from({ length: mealsPerDay }, (_, i) => ({
    name:           i === 0 ? 'Breakfast' : i === mealsPerDay - 1 ? 'Dinner' : i === 1 && mealsPerDay > 3 ? 'Mid-Morning Snack' : `Meal ${i + 1}`,
    time:           mealTimes[i] ?? `${7 + i * 3}:00`,
    foods:          foods[i % foods.length],
    approxCalories: caloriesPerMeal,
    approxProtein:  proteinPerMeal,
  }));
}

function buildGroceryList(diet: string, _goal: PhysiqueGoal): string[] {
  const base = [
    'Eggs', 'Greek yogurt', 'Oats', 'Brown rice', 'Sweet potatoes',
    'Broccoli', 'Spinach', 'Mixed berries', 'Bananas', 'Apples',
    'Almonds', 'Olive oil', 'Garlic', 'Onions',
  ];
  const proteinSources: Record<string, string[]> = {
    normal:       ['Chicken breast', 'Salmon', 'Tuna cans', 'Lean beef', 'Cottage cheese'],
    vegetarian:   ['Paneer', 'Tempeh', 'Lentils', 'Chickpeas', 'Cottage cheese'],
    vegan:        ['Tofu', 'Tempeh', 'Lentils', 'Chickpeas', 'Edamame', 'Plant protein powder'],
    halal:        ['Halal chicken', 'Halal lamb', 'Tuna cans', 'Labneh'],
    keto:         ['Chicken thighs', 'Salmon', 'Bacon', 'Ground beef', 'Cheese', 'Butter', 'Avocados'],
    paleo:        ['Grass-fed beef', 'Wild salmon', 'Turkey breast', 'Coconut oil', 'Avocados'],
    'gluten-free': ['Chicken breast', 'Salmon', 'Rice cakes', 'Quinoa', 'Gluten-free oats'],
  };
  return [...base, ...(proteinSources[diet] ?? proteinSources.normal)];
}

// ─── Plan generator entry point ───────────────────────────────────────────────

export interface GeneratedPlan {
  nutrition: {
    dailyCalories: number;
    proteinGrams:  number;
    carbsGrams:    number;
    fatGrams:      number;
    hydrationLiters: number;
    mealPlan:      Meal[];
    groceryList:   string[];
    tips:          string[];
  };
  workout: {
    weeklySchedule:         WorkoutDay[];
    cardioRecommendation:   string;
    recoveryTips:           string[];
    progressionScheme:      string;
    estimatedTimelineWeeks: number;
    expectedWeeklyChange:   number;
  };
}

export function generatePlan(profile: Profile): GeneratedPlan {
  const bmr   = calculateBMR(profile.weightKg, profile.heightCm, profile.age, profile.sex as Sex);
  const tdee  = calculateTDEE(bmr, profile.activityLevel as ActivityLevel);
  const cals  = calculateCalorieTarget(
    tdee,
    profile.physiqueGoal as PhysiqueGoal,
    profile.timeline as Timeline,
    profile.weightKg,
    profile.goalWeightKg,
    profile.sex as Sex,
  );
  const macros = calculateMacros(cals, profile.weightKg, profile.physiqueGoal as PhysiqueGoal);
  const hydration = calculateHydration(profile.weightKg, profile.activityLevel as ActivityLevel);
  const weeklyChange = weeklyWeightChange(tdee, cals);
  const timelineWeeks = estimatedTimeline(profile.weightKg, profile.goalWeightKg, weeklyChange);

  const mealPlan    = buildMealPlan(cals, macros.proteinGrams, profile.mealsPerDay, profile.dietaryPreference);
  const groceryList = buildGroceryList(profile.dietaryPreference, profile.physiqueGoal as PhysiqueGoal);
  const schedule    = buildWorkoutSchedule(
    profile.experience,
    profile.workoutDaysPerWeek,
    profile.equipment,
    profile.physiqueGoal as PhysiqueGoal,
  );

  const needsLoss = profile.weightKg > profile.goalWeightKg + 1;
  const needsGain = profile.weightKg < profile.goalWeightKg - 1;

  const cardio = needsLoss
    ? `3–4 sessions/week of moderate cardio: 30–40 min brisk walk, bike, or elliptical. Keep heart rate at 60–70% max.`
    : needsGain
    ? `1–2 light cardio sessions/week for cardiovascular health. 20–30 min easy walk or bike. Avoid excessive cardio.`
    : `2–3 moderate cardio sessions/week for fitness. 25–35 min steady-state or interval training.`;

  const nutritionTips = [
    `Target ${macros.proteinGrams}g protein daily — this is your most important macro for body composition.`,
    'Eat your first meal within 1–2 hours of waking to fuel your day.',
    'Drink water before every meal to help with satiety and digestion.',
    'Plan and prep meals in advance to avoid poor food choices when hungry.',
    needsLoss
      ? 'Track your food for at least the first 4 weeks — awareness is the first step to change.'
      : 'Focus on nutrient-dense whole foods. Supplements are optional, not essential.',
    '⚠️ Disclaimer: This plan is a starting estimate. Consult a registered dietitian for personalised medical nutrition therapy.',
  ];

  const recoveryTips = [
    `Aim for ${profile.sleepHours >= 7 ? '7–9' : '7–9'} hours of sleep — this is when muscle repair and fat burning happen.`,
    'Schedule at least 1 full rest day between similar muscle groups.',
    'Foam roll major muscle groups for 5–10 min after workouts.',
    'Manage stress: chronic cortisol elevation inhibits fat loss and muscle gain.',
    'If you feel persistently sore or fatigued, take an extra rest day — progress requires recovery.',
  ];

  const progression = profile.experience === 'beginner'
    ? 'Add 2.5–5 kg to compound lifts (squat, bench, row) each week while form stays perfect. For bodyweight exercises, increase reps or add a harder variation.'
    : profile.experience === 'intermediate'
    ? 'Use linear periodisation: increase weight or reps each session. Every 4–6 weeks take a deload week at 50–60% intensity.'
    : 'Follow a structured periodisation model (linear, undulating, or block). Focus on technique and weak-point training. Deload every 4–6 weeks.';

  return {
    nutrition: {
      dailyCalories:   cals,
      proteinGrams:    macros.proteinGrams,
      carbsGrams:      macros.carbsGrams,
      fatGrams:        macros.fatGrams,
      hydrationLiters: hydration,
      mealPlan,
      groceryList,
      tips:            nutritionTips,
    },
    workout: {
      weeklySchedule:         schedule,
      cardioRecommendation:   cardio,
      recoveryTips,
      progressionScheme:      progression,
      estimatedTimelineWeeks: timelineWeeks,
      expectedWeeklyChange:   weeklyChange,
    },
  };
}
