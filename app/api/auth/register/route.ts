import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { db } from '@/lib/db';
import { signUpSchema } from '@/lib/validations';
import { z } from 'zod';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = signUpSchema.parse(body);

    const existing = await db.user.findUnique({
      where: { email: data.email.toLowerCase().trim() },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'An account with this email already exists.' },
        { status: 409 },
      );
    }

    const hashed = await bcrypt.hash(data.password, 12);

    const user = await db.user.create({
      data: {
        email:    data.email.toLowerCase().trim(),
        name:     data.name.trim(),
        password: hashed,
      },
    });

    return NextResponse.json({ id: user.id, email: user.email }, { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.errors[0].message }, { status: 400 });
    }
    console.error('[register]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
