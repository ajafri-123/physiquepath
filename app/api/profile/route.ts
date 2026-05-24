import { NextRequest, NextResponse } from 'next/server';
import { getServerSession }         from 'next-auth';
import { authOptions }              from '@/lib/auth';
import { db }                       from '@/lib/db';
import { onboardingSchema }         from '@/lib/validations';
import { z }                        from 'zod';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const userId = (session.user as { id: string }).id;
  const profile = await db.profile.findUnique({ where: { userId } });

  return NextResponse.json(profile ?? null);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const userId = (session.user as { id: string }).id;
    const body   = await req.json();
    const data   = onboardingSchema.parse(body);

    const profile = await db.profile.upsert({
      where:  { userId },
      create: { userId, ...data },
      update: { ...data },
    });

    return NextResponse.json(profile, { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.errors[0].message }, { status: 400 });
    }
    console.error('[profile POST]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
