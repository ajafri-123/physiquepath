<div align="center">

# 🏋️ PhysiquePath

### Your personalised fitness & nutrition coach — completely free, no subscriptions, no gimmicks.

[![Live Demo](https://img.shields.io/badge/Live%20Demo-physiquepath.vercel.app-059669?style=for-the-badge&logo=vercel)](https://physiquepath.vercel.app)
[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon-4169e1?style=for-the-badge&logo=postgresql)](https://neon.tech)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)

</div>

---

## 📖 What is PhysiquePath?

PhysiquePath is a **full-stack web application** that creates a completely personalised fitness and nutrition plan for you — based on your body, your goals, and your lifestyle. Think of it as having a personal trainer and nutritionist in your pocket, available 24/7, for free.

You answer a short questionnaire (takes about 2 minutes), and the app instantly calculates:

- **Exactly how many calories** you should eat each day
- **How much protein, carbs, and fat** to aim for
- **A full workout plan** tailored to your experience level and available equipment
- **A meal plan** with real food ideas matched to your diet preference
- **A grocery shopping list** so you know exactly what to buy
- **How much water** to drink daily

You then track your progress over time, log daily data, and do weekly check-ins so the plan evolves as you do.

---

## ✨ Features at a Glance

| Feature | Description |
|---------|-------------|
| 🔐 **Secure Auth** | Email/password signup & login with encrypted sessions |
| 📋 **Smart Onboarding** | 6-step questionnaire covering body metrics, goals, diet & lifestyle |
| 🍽️ **Nutrition Plan** | Personalised calorie/macro targets, meal plans & grocery lists |
| 💪 **Workout Plan** | Experience-adapted weekly programmes (Full Body / Upper-Lower / PPL) |
| 📊 **Progress Tracker** | Log weight, measurements, macros, sleep & mood with interactive charts |
| ✅ **Weekly Check-Ins** | Smart weekly review that safely adjusts your plan based on feedback |
| 🤖 **AI Coach** | Instant answers to fitness questions — free, no API key needed |
| 📱 **Fully Responsive** | Works perfectly on mobile, tablet, and desktop |

---

## 🧠 How Does It Actually Work? (Plain English)

Here's a complete walkthrough of everything the app does — no technical knowledge required.

---

### Step 1 — Create an Account

When you visit the site and sign up, your email and password are securely saved to a database. Your password is **never stored as plain text** — it's scrambled using a technique called *bcrypt hashing*, which means even the developers can't read it. When you log in, the app checks your hashed password against what's on file.

---

### Step 2 — The Onboarding Questionnaire (6 Steps)

After signing up, you fill out a short questionnaire split into 6 screens:

| Step | What it asks | Why it matters |
|------|-------------|----------------|
| **1 — Body Metrics** | Height, weight, age, sex | Needed to calculate your metabolism |
| **2 — Goals** | Goal (lose fat / build muscle / recomp / maintain), target weight, timeline | Sets your calorie target |
| **3 — Training** | Experience level, days per week, workout type, equipment | Builds your workout plan |
| **4 — Nutrition** | Diet preference (standard, vegetarian, vegan, keto, etc.), food allergies | Builds your meal plan |
| **5 — Lifestyle** | Activity level, sleep, stress, occupation type | Refines your calorie needs |
| **6 — Review** | Summary of everything | Confirm before generating |

---

### Step 3 — Plan Generation (The Science)

Once you hit **"Generate My Plan"**, the app runs a series of evidence-based calculations entirely on the server. No AI API needed — it's all proven maths.

#### 🔥 Calorie Calculation

The app uses the **Mifflin-St Jeor formula** — the gold standard used by registered dietitians — to calculate your **BMR** (Basal Metabolic Rate), which is how many calories your body burns just to stay alive (breathing, heartbeat, digestion, etc.).

```
Men:    BMR = (10 × weight_kg) + (6.25 × height_cm) − (5 × age) + 5
Women:  BMR = (10 × weight_kg) + (6.25 × height_cm) − (5 × age) − 161
```

Then it multiplies by your **activity level** to get your TDEE (Total Daily Energy Expenditure):

| Activity Level | Multiplier |
|---------------|-----------|
| Sedentary (desk job, no exercise) | × 1.2 |
| Lightly active (1–3 days/week) | × 1.375 |
| Moderately active (3–5 days/week) | × 1.55 |
| Very active (6–7 days/week) | × 1.725 |
| Extremely active (athlete / physical job) | × 1.9 |

Then, based on your **goal**:

- **Fat loss** → deficit of 200–500 kcal/day *(never below 1,200 kcal for women / 1,500 kcal for men — hard safety floors)*
- **Muscle gain** → surplus of 200–350 kcal/day
- **Body recomposition** → maintenance calories
- **Maintenance** → maintenance calories

Your **timeline** is used to pace the deficit/surplus — a 12-week cut gets a larger deficit than a gradual 6-month cut.

#### 🥩 Macro Calculation

Macros are split using a **protein-first** approach — the most evidence-based method for body composition:

1. **Protein** → 1.6–2.2 g per kg of body weight (higher end for cutting)
2. **Fat** → 27% of total calories (essential for hormones and fat-soluble vitamins)
3. **Carbohydrates** → everything left over

#### 💪 Workout Plan

The workout split is selected based on your experience level:

| Experience | Split | Days/Week |
|-----------|-------|----------|
| Beginner | **Full Body** — all muscle groups every session | 3 |
| Intermediate | **Upper/Lower** — top half one day, bottom half next | 4 |
| Advanced | **PPL** — Push / Pull / Legs | 5–6 |

Each workout is populated from a library of **20+ exercises**. Every exercise shows sets, reps, muscles targeted, and alternative exercises in case you don't have the equipment.

#### 🍽️ Meal Plan

A 5-meal daily template (3 meals + 2 snacks) is built around your diet type — standard, vegetarian, vegan, keto, Mediterranean, high-protein, dairy-free, or gluten-free. Each meal comes with approximate calories and protein.

A **grocery list** is auto-generated and grouped by category (proteins, vegetables, grains, dairy, fats).

#### 💧 Hydration Goal

```
Daily water (ml) = body weight (kg) × 35 ml + 500 ml per workout day
```

---

### Step 4 — Your Dashboard

After onboarding you land on a personalised dashboard showing:

- Daily calorie & macro targets
- Today's scheduled workout
- Progress towards hydration and protein goals
- A 7-day summary of your logged data

---

### Step 5 — Logging Progress

Every day (or whenever you remember), you can log:

- Weight, waist, chest, and arm measurements
- Calories, protein, carbs, and fat consumed
- Water intake and sleep hours
- Mood and energy ratings (1–10)
- Whether you completed your workout
- Free-text notes

The app visualises all this with interactive charts:

- 📈 **Weight over time** — area chart showing the trend line
- 📊 **Daily calories** — bar chart
- 🟩 **Workout consistency grid** — like GitHub's contribution graph
- 🔢 **Trend cards** — weight, calories, sleep, and energy with mini sparklines

---

### Step 6 — Weekly Check-Ins

Once a week you fill out a short check-in form. Based on your answers, the plan automatically adjusts:

- Workouts **too hard** → suggests adding a rest day
- Energy **consistently low** → bumps calories up by ~100 kcal
- Progressing **well** → keeps plan the same

---

### Step 7 — AI Coach

The AI Coach lets you type any fitness question and get an instant, detailed answer. It uses a **keyword-matching engine** covering 15 topic areas — completely free, no external API required:

> Meal ideas · Exercise swaps · Breaking plateaus · Missed workouts · Protein goals · Late-night eating · Sleep · Cardio · Muscle soreness · Cheat meals · Bulking · Hydration · Supplements · Stress · Consistency

---

## 🛡️ Safety First

PhysiquePath has strict safety rules baked into the code:

- ❌ Calorie targets **never** go below 1,200 kcal (women) or 1,500 kcal (men)
- ❌ No advice about steroids, fat burners, or dangerous supplements
- ❌ No medical claims or diagnoses
- ✅ Safety disclaimers on every plan page
- ✅ Conservative deficit/surplus ranges throughout
- ✅ Users always encouraged to consult a healthcare professional

---

## 🗺️ Pages Overview

| URL | Page |
|-----|------|
| `/` | Landing page |
| `/signup` | Create a new account |
| `/login` | Sign into existing account |
| `/onboarding` | 6-step questionnaire |
| `/dashboard` | Daily overview and stats |
| `/nutrition` | Meal plan, macros, grocery list |
| `/workout` | Workout schedule with exercise details |
| `/progress` | Log data and view charts |
| `/check-in` | Weekly check-in form |
| `/ai-coach` | Chat with the fitness coach |

---

## 🏗️ Tech Stack

### Frontend
| Technology | Purpose |
|-----------|---------|
| **Next.js 14** (App Router) | React framework — handles routing and server/client components |
| **TypeScript** | Type-safe JavaScript — catches bugs before they happen |
| **Tailwind CSS** | Utility-first CSS framework |
| **Recharts** | Interactive chart library |
| **React Hook Form + Zod** | Form handling and validation |

### Backend
| Technology | Purpose |
|-----------|---------|
| **Next.js Route Handlers** | API endpoints (no separate backend server needed) |
| **Prisma ORM** | Type-safe database queries — no raw SQL |
| **PostgreSQL (Neon)** | Serverless PostgreSQL — stores all user data |
| **NextAuth v4** | Secure authentication and session management |
| **bcryptjs** | Password hashing — plain-text passwords never stored |

### Infrastructure
| Technology | Purpose |
|-----------|---------|
| **Vercel** | Hosting — global edge deployment |
| **Neon** | Serverless PostgreSQL — scales to zero on free tier |

---

## 🚀 Running Locally

### Prerequisites
- [Node.js 18+](https://nodejs.org)
- A PostgreSQL database ([Neon](https://neon.tech) has a generous free tier)

### Setup

```bash
# 1. Clone the repository
git clone https://github.com/ajafri-123/physiquepath.git
cd physiquepath

# 2. Install dependencies
npm install

# 3. Create environment variables file
# (edit .env with your actual values — see below)
cp .env.example .env

# 4. Push the database schema (creates all tables)
npx prisma db push

# 5. (Optional) Load demo data
npx ts-node prisma/seed.ts

# 6. Start the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) ✅

**Demo account** (after seeding):
- Email: `demo@physiquepath.app`
- Password: `demo1234`

### Environment Variables

```env
# Your Neon (or any PostgreSQL) connection string
DATABASE_URL="postgresql://user:pass@host/db?sslmode=require"

# Generate with: openssl rand -base64 32
NEXTAUTH_SECRET="your-random-secret-here"

# Your app URL
NEXTAUTH_URL="http://localhost:3000"
```

### Scripts

```bash
npm run dev          # Development server (hot reload)
npm run build        # Production build
npm run start        # Run production build
npm run lint         # Lint the codebase
npx prisma studio    # Visual database browser
npx prisma db push   # Sync schema to database
```

---

## 📁 Project Structure

```
physiquepath/
├── app/
│   ├── page.tsx                  # Landing page
│   ├── layout.tsx                # Root layout
│   ├── globals.css               # Global styles + component classes
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── signup/page.tsx
│   ├── (dashboard)/              # Protected routes
│   │   ├── layout.tsx            # Redirects if not onboarded
│   │   ├── dashboard/page.tsx
│   │   ├── nutrition/page.tsx
│   │   ├── workout/page.tsx
│   │   ├── progress/page.tsx
│   │   ├── check-in/page.tsx
│   │   └── ai-coach/page.tsx
│   ├── onboarding/page.tsx       # 6-step wizard
│   └── api/
│       ├── auth/[...nextauth]/   # NextAuth
│       ├── auth/register/        # Sign up endpoint
│       ├── profile/              # Save onboarding answers
│       ├── plan/generate/        # Generate personalised plan
│       ├── progress/             # Log and fetch progress
│       ├── check-in/             # Weekly check-in
│       └── ai-coach/             # Keyword-based coach
├── components/layout/
│   ├── sidebar.tsx               # Desktop sidebar + mobile nav
│   └── navbar.tsx                # Top bar
├── lib/
│   ├── auth.ts                   # NextAuth config
│   ├── calculations.ts           # BMR / TDEE / macro formulas
│   ├── plan-generator.ts         # Workout + meal plan builder
│   ├── validations.ts            # Zod schemas
│   ├── db.ts                     # Prisma singleton
│   └── utils.ts                  # Helpers
├── prisma/
│   ├── schema.prisma             # Database schema (7 models)
│   └── seed.ts                   # Demo data
├── types/next-auth.d.ts          # TypeScript extensions
├── middleware.ts                  # Route protection
├── next.config.mjs               # Next.js config
└── tailwind.config.ts            # Design system
```

---

## 🌐 Deploying to Vercel

```bash
npm install -g vercel
vercel --prod
```

Add these environment variables in **Vercel → Settings → Environment Variables**:

| Variable | Value |
|----------|-------|
| `DATABASE_URL` | Your Neon connection string |
| `NEXTAUTH_SECRET` | Random 32-char string |
| `NEXTAUTH_URL` | Your Vercel URL (e.g. `https://physiquepath.vercel.app`) |

> **Important:** The build command is `prisma generate && next build` — this is already set in `package.json` and is required for Prisma to work on Vercel's serverless runtime.

---

## 🤝 Contributing

Contributions are welcome! Here's how:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Commit your changes: `git commit -m 'Add my feature'`
4. Push: `git push origin feature/my-feature`
5. Open a Pull Request

**Ideas for future contributions:**
- [ ] Body fat % tracking and estimates
- [ ] Exercise GIF/video demos
- [ ] Export progress as PDF or CSV
- [ ] Email reminders for daily logging
- [ ] Dark mode
- [ ] Custom meal plan builder
- [ ] Fitness tracker integration (Apple Health, Fitbit)

---

## ⚠️ Disclaimer

PhysiquePath is for **informational and educational purposes only**. It is not a substitute for professional medical advice, diagnosis, or treatment. Always consult a qualified healthcare provider before starting a new diet or exercise programme, especially if you have a pre-existing medical condition.

---

## 📄 License

MIT © [ajafri-123](https://github.com/ajafri-123)

---

<div align="center">

Built with ❤️ &nbsp;|&nbsp; ⭐ Star the repo if you find it useful!

</div>
