import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json() as { status?: string; publishedUrl?: string; errorLog?: string };
    const task = await prisma.contentTask.update({
      where: { id },
      data:  body,
      include: { drafts: { orderBy: { createdAt: 'desc' } } },
    });
    return NextResponse.json({ ok: true, task });
  } catch (e) {
    console.error('[content/tasks PATCH]', e);
    return NextResponse.json({ ok: false, error: 'DB error' }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await prisma.contentTask.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('[content/tasks DELETE]', e);
    return NextResponse.json({ ok: false, error: 'DB error' }, { status: 500 });
  }
}
