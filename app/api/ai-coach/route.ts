import { NextRequest, NextResponse } from 'next/server';
import { getServerSession }         from 'next-auth';
import { authOptions }              from '@/lib/auth';
import { db }                       from '@/lib/db';

// ─── Rule-based fitness coach ─────────────────────────────────────────────────
// Matches keywords and returns contextual, evidence-based responses.
// No external API required.

type Rule = { keywords: string[]; response: string };

const RULES: Rule[] = [
  {
    keywords: ['eat today', 'what should i eat', 'meal today', 'food today', 'meals today'],
    response: `Great question! Here's a simple framework for today based on your plan:\n\n• **Breakfast** — Eggs + oats or Greek yogurt with fruit. High protein start sets you up well.\n• **Lunch** — Lean protein (chicken, fish, tofu) + complex carbs (rice, sweet potato) + vegetables.\n• **Dinner** — Similar to lunch. If you had rice at lunch, try potato or pasta at dinner.\n• **Snacks** — Greek yogurt, cottage cheese, fruit, or a handful of nuts.\n\nThe biggest lever you can pull today is hitting your protein target. Everything else is secondary. 💪`,
  },
  {
    keywords: ['swap', 'alternative', 'substitute', 'replace', 'instead of', 'cant do', "can't do"],
    response: `Swapping exercises is completely fine — your muscles don't know the name of the exercise, only the stimulus.\n\n**Common swaps:**\n• Can't squat? → Leg press, goblet squat, or split squats\n• Can't bench press? → Dumbbell press or push-ups (add weight in a bag)\n• Can't pull-up? → Lat pulldown or assisted pull-up machine\n• Can't deadlift? → Romanian deadlift or hip hinge with dumbbells\n• No gym? → Bodyweight versions of almost anything work great for building or maintaining muscle\n\nThe rule of thumb: swap for an exercise that targets the same muscle group and fits your equipment. You won't lose progress.`,
  },
  {
    keywords: ['not losing weight', 'plateau', 'stuck', 'stopped losing', 'no progress', 'not working', 'weight not moving', 'scale not moving'],
    response: `Plateaus are completely normal and almost always have a simple explanation. Here's what to check:\n\n**1. Are you actually eating what you think?** Tracking accuracy slips over time. Try logging for 3–5 days with a food scale.\n\n**2. Patience window.** Weight fluctuates 1–3 kg daily from water, food, hormones, and sleep. Judge progress over 2–3 weeks, not days.\n\n**3. NEAT has dropped.** As you lose weight, you naturally move less. Add a 15-min walk daily.\n\n**4. Calories need a small adjustment.** Your TDEE decreases as you lose weight. A 50–100 kcal cut or slight activity increase usually restarts progress.\n\n**5. Sleep and stress.** High cortisol from poor sleep actively stalls fat loss. Prioritise 7–9 hours.\n\nDon't slash calories dramatically — small, sustainable adjustments win.`,
  },
  {
    keywords: ['consistent', 'consistency', 'motivated', 'motivation', 'stay on track', 'discipline', 'habit'],
    response: `Consistency beats intensity every single time. Here's what actually works long-term:\n\n**Lower the bar on bad days.** A 20-min walk counts. A protein shake counts. A 15-min workout counts. Showing up at 50% is infinitely better than not showing up.\n\n**Remove friction.** Lay out gym clothes the night before. Meal prep on Sundays. Make the right choice the easy choice.\n\n**Attach new habits to existing ones.** "After I brush my teeth, I drink a glass of water." "After I sit at my desk, I eat breakfast."\n\n**Track your streaks.** Seeing a streak of green days on your progress log creates genuine motivation to protect it.\n\n**Forgive yourself fast.** One bad day doesn't undo weeks of work. The only bad outcome is quitting.`,
  },
  {
    keywords: ['miss', 'missed', 'skip', 'skipped', 'missed workout', 'skip workout', 'miss a workout'],
    response: `Missing a workout is not a big deal at all — life happens.\n\nHere's the right mindset:\n• **One missed session = zero long-term impact.** Muscle isn't built or lost in a single day.\n• **Don't try to "make it up"** by doubling your next session. That usually leads to injury.\n• **Just resume your normal schedule** at the next planned session.\n\nIf you're missing more than 1–2 per week consistently, that's worth examining — is the program too demanding? Wrong timing? Address the root cause rather than pushing harder.\n\nProgress is built over months, not ruined by one skipped Tuesday. 🙌`,
  },
  {
    keywords: ['protein', 'how much protein', 'protein target', 'protein goal', 'enough protein'],
    response: `Protein is the most important macronutrient for body composition — it preserves muscle during fat loss and builds muscle during a surplus.\n\n**For most active people: 1.6–2.2g per kg of body weight per day.**\n\n**Easy high-protein foods:**\n• Chicken breast (31g/100g) · Tuna (30g/100g)\n• Greek yogurt (10g/100g) · Cottage cheese (11g/100g)\n• Eggs (6g each) · Tempeh (19g/100g) · Tofu (8g/100g)\n• Whey or plant protein powder (20–25g per scoop)\n\n**Tips to hit your target:**\n• Put protein in every meal — don't save it all for dinner\n• Choose high-protein snacks (yogurt, eggs, edamame)\n• A protein shake is a totally valid tool if you're short\n\nIf you hit your protein target and are in the right calorie range, the rest largely takes care of itself.`,
  },
  {
    keywords: ['eat late', 'late at night', 'eating at night', 'night eating', 'before bed'],
    response: `Eating at night doesn't automatically cause fat gain — total daily calories are what matter, not when you eat them.\n\nThat said, a few practical points:\n• If late eating causes you to go over your calorie target, that's the issue — not the time.\n• Some people find late eating disrupts their sleep quality. If that's you, try to finish eating 2–3 hours before bed.\n• A high-protein snack before bed (cottage cheese, Greek yogurt, casein protein) can actually support muscle repair overnight.\n\nBottom line: if it fits your calories and doesn't hurt your sleep, it's fine. Focus your energy on total daily intake rather than meal timing.`,
  },
  {
    keywords: ['sleep', 'rest', 'recovery', 'tired', 'fatigue', 'exhausted'],
    response: `Sleep is when the real magic happens — muscle is repaired, fat-burning hormones peak, and hunger hormones reset.\n\n**Why it matters for your goals:**\n• Poor sleep raises ghrelin (hunger hormone) by up to 24% and lowers leptin (fullness hormone)\n• Low sleep = higher cortisol = more fat storage, especially around the midsection\n• Most muscle protein synthesis happens during deep sleep\n\n**Quick wins for better sleep:**\n• Same bedtime every night (even weekends) — your body clock loves consistency\n• Keep your bedroom cool (16–19°C is optimal)\n• Avoid screens 30–60 min before bed\n• No caffeine after 2pm if you're sensitive\n• A short walk after dinner can improve sleep quality\n\nIf you're training hard and sleeping poorly, prioritise sleep over extra training. It's not optional.`,
  },
  {
    keywords: ['cardio', 'running', 'walking', 'steps', 'hiit', 'aerobic'],
    response: `Cardio is a tool, not a punishment. Here's how to use it effectively:\n\n**For fat loss:** Cardio creates an extra calorie deficit without cutting food further. 3–4 sessions of 30–40 min steady-state (brisk walk, bike, elliptical) per week is plenty. You don't need HIIT — it's just another option.\n\n**For muscle gain:** Keep cardio light (1–2x/week, 20–30 min) to protect your calorie surplus and recovery. Excessive cardio competes with muscle growth.\n\n**Best bang for your buck:** Walking. It's easy to recover from, burns meaningful calories, improves mood, and has zero injury risk. 8,000–10,000 steps a day makes a huge difference over time.\n\n**HIIT:** Great for time efficiency but harder to recover from. Use it 1–2x/week max, not every day.`,
  },
  {
    keywords: ['sore', 'soreness', 'doms', 'pain', 'muscles hurt', 'recovery'],
    response: `Muscle soreness (DOMS) is normal, especially after a new program or harder session. Here's the guide:\n\n**Normal soreness:** Dull ache in the muscle belly, peaks 24–48 hours after training, improves with light movement. ✅ Train through it.\n\n**Concerning pain:** Sharp pain, pain in a joint (not muscle), pain during exercise, any swelling or bruising. ❌ Rest and see a doctor if it doesn't resolve.\n\n**What actually helps soreness:**\n• Light movement and walking (best option)\n• Staying hydrated\n• Getting good sleep\n• Eating enough protein\n• Cold shower or contrast shower\n• Gentle foam rolling (helps short term)\n\nNote: Soreness is not a marker of a good workout. You can have a great session and feel fine the next day.`,
  },
  {
    keywords: ['cheat meal', 'cheat day', 'cheat', 'treat', 'refeed'],
    response: `A planned treat meal is completely fine and can even be beneficial:\n\n**Psychologically:** Knowing you have a flexible day coming up makes the rest of the week easier to stick to.\n\n**Physiologically:** After prolonged dieting, a higher-calorie day (refeed) can temporarily boost leptin and metabolism — though this effect is modest.\n\n**Practical approach:**\n• Think of it as a "treat meal" not a "cheat day" — one meal, not a whole day of bingeing\n• Enjoy it fully and without guilt\n• Get back to your plan at the next meal — no compensation needed\n\nIf you find yourself feeling out of control around food, or planning very restrictive days to "earn" treat meals, that's worth paying attention to. A sustainable plan shouldn't require willpower heroics.`,
  },
  {
    keywords: ['bulking', 'bulk', 'gain muscle', 'muscle gain', 'build muscle', 'mass'],
    response: `Building muscle effectively comes down to a few fundamentals:\n\n**1. Calorie surplus** — Eat 200–400 kcal above maintenance. Bigger surpluses don't build muscle faster, they just add more fat.\n\n**2. Enough protein** — 1.8–2.2g per kg bodyweight per day.\n\n**3. Progressive overload** — Lift more weight or do more reps each session or week. This is non-negotiable.\n\n**4. Compound movements** — Squat, deadlift, press, row. These give you the most muscle stimulus per unit of effort.\n\n**5. Sleep** — Most muscle repair happens at night. 7–9 hours is part of the program.\n\n**Realistic expectations:** 1–2kg of actual muscle per month is excellent progress for a beginner. Intermediates gain significantly less. Anyone promising faster results is usually promising fat gain or worse.`,
  },
  {
    keywords: ['water', 'hydration', 'hydrate', 'drink', 'thirsty'],
    response: `Hydration is one of the most underrated performance and fat-loss tools:\n\n**How much:** A good starting point is 33–35ml per kg of bodyweight, plus more on training days and hot weather.\n\n**Why it matters:**\n• Dehydration of just 2% impairs physical and cognitive performance\n• Thirst is often mistaken for hunger — drink before reaching for food\n• Water supports digestion, joint lubrication, and waste removal\n\n**Easy habits:**\n• Drink a full glass of water immediately when you wake up\n• Keep a water bottle visible at your desk\n• Drink a glass before every meal\n• If your urine is pale yellow, you're well hydrated. Dark yellow = drink more.\n\nBlack coffee and tea count toward hydration. Sugary drinks don't help with body composition goals.`,
  },
  {
    keywords: ['supplement', 'supplements', 'protein powder', 'creatine', 'preworkout', 'pre-workout', 'vitamins'],
    response: `Most supplements are unnecessary if your nutrition is solid. Here are the ones worth considering:\n\n**Evidence-based and worth it:**\n• **Creatine monohydrate** — The most researched supplement in existence. 3–5g/day improves strength and muscle output. Cheap and safe.\n• **Protein powder** — Only if you struggle to hit protein targets from food. Not magic, just convenient protein.\n• **Vitamin D** — If you live somewhere with limited sun (most people are deficient).\n• **Omega-3 fish oil** — Anti-inflammatory, good for joint health.\n\n**Save your money:**\n• Fat burners, BCAAs (if you eat enough protein), testosterone boosters, most "pre-workouts"\n\n⚠️ No supplement will outwork a poor diet or substitute for sleep and training. Fix those first.`,
  },
  {
    keywords: ['stress', 'anxious', 'anxiety', 'overwhelmed', 'burnout', 'mental health'],
    response: `Stress has a direct physiological impact on your fitness goals — it's not just in your head.\n\n**The cortisol connection:** Chronic stress elevates cortisol, which promotes fat storage (especially abdominal), breaks down muscle tissue, disrupts sleep, and increases cravings for high-calorie foods.\n\n**What helps:**\n• 10–20 min of walking outdoors (genuinely one of the best stress reducers)\n• Consistent sleep schedule\n• Reducing caffeine if you're anxious\n• Exercise itself is a powerful stress reducer — but don't use it as punishment\n• Talking to someone — friends, family, or a professional\n\n**For your fitness plan:** If you're going through a stressful period, be flexible. A maintenance phase is infinitely better than abandoning your plan entirely. Lower the bar temporarily and protect your habits.\n\n⚠️ If stress or anxiety feels overwhelming, please speak to a healthcare professional.`,
  },
];

const FALLBACK = `That's a great question! Here's my general advice:\n\nFocus on the fundamentals — they deliver 90% of the results:\n\n1. **Protein first** — Hit your daily protein target before worrying about anything else\n2. **Progressive overload** — Aim to lift slightly more or do slightly more reps each week\n3. **Sleep** — 7–9 hours. This is when your body actually changes\n4. **Consistency** — A moderate plan followed consistently beats a perfect plan followed intermittently\n5. **Patience** — Real body composition change takes months, not weeks\n\nIf you have a more specific question about nutrition, workouts, recovery, or staying on track, ask away! I'm here to help. 💪\n\n⚠️ For medical concerns, injuries, or eating disorder support, please consult a qualified healthcare professional.`;

function getRuleBasedResponse(userMessage: string): string {
  const msg = userMessage.toLowerCase();

  for (const rule of RULES) {
    if (rule.keywords.some((kw) => msg.includes(kw))) {
      return rule.response;
    }
  }

  return FALLBACK;
}

type MessageParam = { role: 'user' | 'assistant'; content: string };

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const userId = (session.user as { id: string }).id;

  try {
    const body = await req.json();
    const messages: MessageParam[] = body.messages ?? [];

    const lastUserMsg = messages.filter((m) => m.role === 'user').at(-1);
    if (!lastUserMsg) {
      return NextResponse.json({ error: 'No message provided' }, { status: 400 });
    }

    const content = getRuleBasedResponse(lastUserMsg.content);

    // Save to DB (fire-and-forget)
    db.aIChatMessage.createMany({
      data: [
        { userId, role: 'user',      content: lastUserMsg.content },
        { userId, role: 'assistant', content },
      ],
    }).catch(() => {});

    return NextResponse.json({ content });
  } catch (err) {
    console.error('[ai-coach]', err);
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 },
    );
  }
}
