import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const profile = await prisma.contentProfile.findFirst({ orderBy: { createdAt: 'asc' } });
    if (!profile) return NextResponse.json({ ok: true, calendars: [] });

    const calendars = await prisma.contentCalendar.findMany({
      where:   { profileId: profile.id },
      orderBy: { createdAt: 'desc' },
      take:    20,
    });

    return NextResponse.json({ ok: true, calendars });
  } catch (e) {
    console.error('[content/calendars GET]', e);
    return NextResponse.json({ ok: false, error: 'DB error' }, { status: 500 });
  }
}
