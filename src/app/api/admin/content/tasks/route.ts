import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const channel  = searchParams.get('channel') ?? undefined;
    const status   = searchParams.get('status')  ?? undefined;
    const calId    = searchParams.get('calendarId') ?? undefined;

    const tasks = await prisma.contentTask.findMany({
      where: {
        ...(channel  ? { channel }  : {}),
        ...(status   ? { status }   : {}),
        ...(calId    ? { calendarId: calId } : {}),
      },
      include: { drafts: { orderBy: { createdAt: 'desc' } } },
      orderBy: { scheduledFor: 'asc' },
      take: 200,
    });

    return NextResponse.json({ ok: true, tasks });
  } catch (e) {
    console.error('[content/tasks GET]', e);
    return NextResponse.json({ ok: false, error: 'DB error' }, { status: 500 });
  }
}
