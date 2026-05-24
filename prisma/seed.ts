import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const db = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  const hashedPassword = await bcrypt.hash('demo1234', 12);

  const user = await db.user.upsert({
    where: { email: 'demo@physiquepath.app' },
    update: {},
    create: {
      email: 'demo@physiquepath.app',
      password: hashedPassword,
      name: 'Alex Demo',
      profile: {
        create: {
          age: 28,
          sex: 'male',
          heightCm: 178,
          weightKg: 85,
          goalWeightKg: 75,
          bodyFatPercent: 22,
          physiqueGoal: 'athletic',
          timeline: 'moderate',
          experience: 'intermediate',
          activityLevel: 'moderate',
          workoutDaysPerWeek: 4,
          workoutLocation: 'gym',
          equipment: ['barbell', 'dumbbells', 'cables', 'machines', 'pullup_bar'],
          injuries: 'Mild lower back sensitivity — avoid heavy deadlifts',
          dietaryPreference: 'normal',
          allergies: [],
          dislikedFoods: ['liver', 'brussels sprouts'],
          mealsPerDay: 3,
          sleepHours: 7,
          stressLevel: 'moderate',
          waterIntakeLiters: 2,
          jobType: 'sedentary',
        },
      },
    },
    include: { profile: true },
  });

  console.log(`✅ Created demo user: ${user.email}`);

  // Add some sample progress logs
  const progressDates = Array.from({ length: 8 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (7 - i) * 7);
    return d;
  });

  const weights = [85, 84.5, 84, 83.6, 83.2, 82.8, 82.4, 82];

  for (let i = 0; i < progressDates.length; i++) {
    await db.progressLog.create({
      data: {
        userId: user.id,
        date: progressDates[i],
        weightKg: weights[i],
        caloriesConsumed: 2100 + Math.floor(Math.random() * 200 - 100),
        proteinGrams: 165 + Math.floor(Math.random() * 20 - 10),
        carbsGrams: 220 + Math.floor(Math.random() * 30 - 15),
        fatGrams: 68 + Math.floor(Math.random() * 10 - 5),
        waterLiters: 2.5 + Math.random() * 0.5,
        sleepHours: 6.5 + Math.random() * 1.5,
        moodRating: 7 + Math.floor(Math.random() * 3),
        energyRating: 7 + Math.floor(Math.random() * 3),
        workoutCompleted: Math.random() > 0.2,
      },
    });
  }

  console.log('✅ Created sample progress logs');
  console.log('\n🎉 Seed complete!');
  console.log('   Email:    demo@physiquepath.app');
  console.log('   Password: demo1234');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
