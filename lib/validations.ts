import { z } from 'zod';

export const signUpSchema = z.object({
  name:     z.string().min(2, 'Name must be at least 2 characters'),
  email:    z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const loginSchema = z.object({
  email:    z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const onboardingSchema = z.object({
  // Step 1 – Basic info
  age:       z.number().int().min(13).max(100),
  sex:       z.enum(['male', 'female', 'other']),
  heightCm:  z.number().min(100).max(250),
  weightKg:  z.number().min(30).max(300),

  // Step 2 – Goals
  goalWeightKg:    z.number().min(30).max(300),
  bodyFatPercent:  z.number().min(3).max(60).optional(),
  physiqueGoal:    z.enum(['lean', 'athletic', 'muscular', 'bulky', 'toned', 'strength', 'fat-loss']),
  timeline:        z.enum(['slow', 'moderate', 'aggressive']),

  // Step 3 – Training
  experience:          z.enum(['beginner', 'intermediate', 'advanced']),
  activityLevel:       z.enum(['sedentary', 'light', 'moderate', 'very', 'extra']),
  workoutDaysPerWeek:  z.number().int().min(1).max(7),
  workoutLocation:     z.enum(['home', 'gym', 'both']),
  equipment:           z.array(z.string()).min(0),
  injuries:            z.string().optional(),

  // Step 4 – Nutrition
  dietaryPreference: z.enum(['normal', 'vegetarian', 'vegan', 'halal', 'keto', 'paleo', 'gluten-free']),
  allergies:         z.array(z.string()),
  dislikedFoods:     z.array(z.string()),
  mealsPerDay:       z.number().int().min(1).max(8),

  // Step 5 – Lifestyle
  sleepHours:       z.number().min(3).max(14),
  stressLevel:      z.enum(['low', 'moderate', 'high']),
  waterIntakeLiters: z.number().min(0).max(10),
  jobType:          z.enum(['sedentary', 'active', 'mixed']),
});

export const progressLogSchema = z.object({
  date:             z.string().optional(),
  weightKg:         z.number().min(20).max(300).optional(),
  bodyFatPercent:   z.number().min(3).max(60).optional(),
  chestCm:          z.number().min(50).max(200).optional(),
  waistCm:          z.number().min(40).max(200).optional(),
  hipsCm:           z.number().min(50).max(200).optional(),
  armCm:            z.number().min(15).max(80).optional(),
  thighCm:          z.number().min(20).max(100).optional(),
  caloriesConsumed: z.number().int().min(0).max(10000).optional(),
  proteinGrams:     z.number().int().min(0).max(1000).optional(),
  carbsGrams:       z.number().int().min(0).max(2000).optional(),
  fatGrams:         z.number().int().min(0).max(500).optional(),
  waterLiters:      z.number().min(0).max(20).optional(),
  sleepHours:       z.number().min(0).max(24).optional(),
  moodRating:       z.number().int().min(1).max(10).optional(),
  energyRating:     z.number().int().min(1).max(10).optional(),
  workoutCompleted: z.boolean().optional(),
  notes:            z.string().max(500).optional(),
});

export const weeklyCheckInSchema = z.object({
  weekStartDate:        z.string(),
  currentWeightKg:      z.number().min(20).max(300),
  avgCalories:          z.number().int().min(0).max(10000),
  workoutConsistency:   z.number().int().min(0).max(7),
  avgSleepHours:        z.number().min(0).max(24),
  hungerLevel:          z.enum(['low', 'moderate', 'high']),
  energyLevel:          z.enum(['low', 'moderate', 'high']),
  stressLevel:          z.enum(['low', 'moderate', 'high']),
  sustainabilityRating: z.enum(['too_hard', 'hard', 'sustainable', 'easy', 'too_easy']),
  feedback:             z.string().max(1000).optional(),
});

export type SignUpInput       = z.infer<typeof signUpSchema>;
export type LoginInput        = z.infer<typeof loginSchema>;
export type OnboardingInput   = z.infer<typeof onboardingSchema>;
export type ProgressLogInput  = z.infer<typeof progressLogSchema>;
export type WeeklyCheckInInput = z.infer<typeof weeklyCheckInSchema>;
