import { NextRequest, NextResponse } from 'next/server';
import { getServerSession }         from 'next-auth';
import { authOptions }              from '@/lib/auth';
import { db }                       from '@/lib/db';
import { progressLogSchema }        from '@/lib/validations';
import { z }                        from 'zod';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const userId = (session.user as { id: string }).id;

  const logs = await db.progressLog.findMany({
    where:   { userId },
    orderBy: { date: 'desc' },
    take:    60,
  });

  return NextResponse.json(logs);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const userId = (session.user as { id: string }).id;
    const body   = await req.json();
    const data   = progressLogSchema.parse(body);

    // Destructure date so the string value doesn't override the converted Date below
    const { date: dateStr, ...logData } = data;
    const log = await db.progressLog.create({
      data: {
        userId,
        date: dateStr ? new Date(dateStr) : new Date(),
        ...logData,
      },
    });

    return NextResponse.json(log, { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.errors[0].message }, { status: 400 });
    }
    console.error('[progress POST]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
