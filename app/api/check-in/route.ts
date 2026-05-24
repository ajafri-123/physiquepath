import { NextRequest, NextResponse } from 'next/server';
import { getServerSession }         from 'next-auth';
import { authOptions }              from '@/lib/auth';
import { db }                       from '@/lib/db';
import { weeklyCheckInSchema }      from '@/lib/validations';
import { z }                        from 'zod';

function deriveAdjustments(data: {
  currentWeightKg: number;
  avgCalories: number;
  workoutConsistency: number;
  avgSleepHours: number;
  energyLevel: string;
  hungerLevel: string;
  stressLevel: string;
  sustainabilityRating: string;
}, plan: { dailyCalories: number; expectedWeeklyChange: number } | null): string[] {
  const adjustments: string[] = [];

  if (!plan) return adjustments;

  const expectedLoss = plan.expectedWeeklyChange < 0; // true if losing
  // Simple heuristics
  if (data.sustainabilityRating === 'too_hard' || data.energyLevel === 'low') {
    adjustments.push(`Increase daily calories by ~100 kcal (to ~${plan.dailyCalories + 100}) to improve energy and sustainability.`);
  }

  if (data.sustainabilityRating === 'too_easy' && expectedLoss) {
    adjustments.push(`Your progress seems comfortable — consider a small calorie reduction (~50 kcal) to keep the deficit effective.`);
  }

  if (data.hungerLevel === 'high' && expectedLoss) {
    adjustments.push('Add 1–2 high-volume, low-calorie foods (vegetables, broth-based soups) to increase satiety without breaking the deficit.');
  }

  if (data.avgSleepHours < 6.5) {
    adjustments.push('Your sleep average is below 7 hours. Prioritise sleep — it directly impacts fat loss, muscle recovery, and hunger hormones.');
  }

  if (data.workoutConsistency < 2) {
    adjustments.push('Workout consistency was low this week. Consider shorter sessions (30 min) to reduce the barrier to showing up.');
  }

  if (data.stressLevel === 'high') {
    adjustments.push('High stress detected. Consider adding 10 min of mindfulness, walks, or breathwork — chronic stress elevates cortisol and impairs progress.');
  }

  return adjustments;
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const userId = (session.user as { id: string }).id;
  const checkIns = await db.weeklyCheckIn.findMany({
    where:   { userId },
    orderBy: { weekStartDate: 'desc' },
    take:    12,
  });

  return NextResponse.json(checkIns);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const userId = (session.user as { id: string }).id;
    const body   = await req.json();
    const data   = weeklyCheckInSchema.parse(body);

    const nutritionPlan = await db.nutritionPlan.findFirst({
      where: { profile: { userId } },
    });

    const adjustments = deriveAdjustments(
      { ...data, stressLevel: data.stressLevel },
      nutritionPlan ? { dailyCalories: nutritionPlan.dailyCalories, expectedWeeklyChange: 0 } : null,
    );

    // Apply calorie adjustment if needed
    let calorieAdjustment = 0;
    if (data.sustainabilityRating === 'too_hard' || data.energyLevel === 'low') {
      calorieAdjustment = 100;
    }

    const checkIn = await db.weeklyCheckIn.create({
      data: {
        userId,
        weekStartDate:        new Date(data.weekStartDate),
        currentWeightKg:      data.currentWeightKg,
        avgCalories:          data.avgCalories,
        workoutConsistency:   data.workoutConsistency,
        avgSleepHours:        data.avgSleepHours,
        hungerLevel:          data.hungerLevel,
        energyLevel:          data.energyLevel,
        stressLevel:          data.stressLevel,
        sustainabilityRating: data.sustainabilityRating,
        feedback:             data.feedback,
        calorieAdjustment:    calorieAdjustment || null,
        planNotes:            adjustments.join(' | ') || null,
      },
    });

    // Apply calorie adjustment to nutrition plan
    if (calorieAdjustment && nutritionPlan) {
      const newCals = Math.max(nutritionPlan.dailyCalories + calorieAdjustment, 1200);
      await db.nutritionPlan.update({
        where: { id: nutritionPlan.id },
        data:  { dailyCalories: newCals },
      });
    }

    return NextResponse.json({ checkIn, adjustments }, { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.errors[0].message }, { status: 400 });
    }
    console.error('[check-in POST]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
