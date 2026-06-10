import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json() as { status?: string };
    const draft = await prisma.contentDraft.update({ where: { id }, data: body });
    return NextResponse.json({ ok: true, draft });
  } catch (e) {
    console.error('[content/drafts PATCH]', e);
    return NextResponse.json({ ok: false, error: 'DB error' }, { status: 500 });
  }
}
