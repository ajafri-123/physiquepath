import { NextResponse }    from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions }      from '@/lib/auth';
import { db }               from '@/lib/db';
import { generatePlan }     from '@/lib/plan-generator';

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const userId = (session.user as { id: string }).id;

  const profile = await db.profile.findUnique({ where: { userId } });
  if (!profile) return NextResponse.json({ error: 'Profile not found' }, { status: 404 });

  try {
    const plan = generatePlan(profile);

    const [nutritionPlan, workoutPlan] = await Promise.all([
      db.nutritionPlan.upsert({
        where:  { profileId: profile.id },
        create: {
          profileId:       profile.id,
          dailyCalories:   plan.nutrition.dailyCalories,
          proteinGrams:    plan.nutrition.proteinGrams,
          carbsGrams:      plan.nutrition.carbsGrams,
          fatGrams:        plan.nutrition.fatGrams,
          hydrationLiters: plan.nutrition.hydrationLiters,
          mealPlan:        plan.nutrition.mealPlan   as unknown as import('@prisma/client').Prisma.InputJsonValue,
          groceryList:     plan.nutrition.groceryList as unknown as import('@prisma/client').Prisma.InputJsonValue,
          tips:            plan.nutrition.tips,
        },
        update: {
          dailyCalories:   plan.nutrition.dailyCalories,
          proteinGrams:    plan.nutrition.proteinGrams,
          carbsGrams:      plan.nutrition.carbsGrams,
          fatGrams:        plan.nutrition.fatGrams,
          hydrationLiters: plan.nutrition.hydrationLiters,
          mealPlan:        plan.nutrition.mealPlan   as unknown as import('@prisma/client').Prisma.InputJsonValue,
          groceryList:     plan.nutrition.groceryList as unknown as import('@prisma/client').Prisma.InputJsonValue,
          tips:            plan.nutrition.tips,
        },
      }),
      db.workoutPlan.upsert({
        where:  { profileId: profile.id },
        create: {
          profileId:              profile.id,
          weeklySchedule:         plan.workout.weeklySchedule as unknown as import('@prisma/client').Prisma.InputJsonValue,
          cardioRecommendation:   plan.workout.cardioRecommendation,
          recoveryTips:           plan.workout.recoveryTips,
          progressionScheme:      plan.workout.progressionScheme,
          estimatedTimelineWeeks: plan.workout.estimatedTimelineWeeks,
          expectedWeeklyChange:   plan.workout.expectedWeeklyChange,
        },
        update: {
          weeklySchedule:         plan.workout.weeklySchedule as unknown as import('@prisma/client').Prisma.InputJsonValue,
          cardioRecommendation:   plan.workout.cardioRecommendation,
          recoveryTips:           plan.workout.recoveryTips,
          progressionScheme:      plan.workout.progressionScheme,
          estimatedTimelineWeeks: plan.workout.estimatedTimelineWeeks,
          expectedWeeklyChange:   plan.workout.expectedWeeklyChange,
        },
      }),
    ]);

    return NextResponse.json({ nutritionPlan, workoutPlan }, { status: 201 });
  } catch (err) {
    console.error('[plan/generate]', err);
    return NextResponse.json({ error: 'Failed to generate plan' }, { status: 500 });
  }
}
