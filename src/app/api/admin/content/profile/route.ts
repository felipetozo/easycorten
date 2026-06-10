import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const profile = await prisma.contentProfile.findFirst({ orderBy: { createdAt: 'asc' } });
    return NextResponse.json({ ok: true, profile });
  } catch (e) {
    console.error('[content/profile GET]', e);
    return NextResponse.json({ ok: false, error: 'DB error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as {
      name?: string; segment?: string; tone?: string; targetAudience?: string;
      brandKeywords?: string[]; avoidWords?: string[]; briefing?: string;
      activeChannels?: string[]; contentFrequency?: Record<string, number>;
      cmsConfig?: unknown; imageStyleInstructions?: string;
      brandColors?: string[]; brandStyle?: string; avoidVisuals?: string[];
    };

    const existing = await prisma.contentProfile.findFirst({ orderBy: { createdAt: 'asc' } });

    const data = {
      name:                  body.name                  ?? 'Easy Corten',
      segment:               body.segment               ?? null,
      tone:                  body.tone                  ?? null,
      targetAudience:        body.targetAudience        ?? null,
      brandKeywords:         body.brandKeywords         ?? [],
      avoidWords:            body.avoidWords            ?? [],
      briefing:              body.briefing              ?? null,
      activeChannels:        body.activeChannels        ?? [],
      contentFrequency:      body.contentFrequency      ?? {},
      cmsConfig:             body.cmsConfig !== undefined ? body.cmsConfig : undefined,
      imageStyleInstructions: body.imageStyleInstructions ?? null,
      brandColors:           body.brandColors           ?? [],
      brandStyle:            body.brandStyle            ?? null,
      avoidVisuals:          body.avoidVisuals          ?? [],
    };

    const profile = existing
      ? await prisma.contentProfile.update({ where: { id: existing.id }, data: data as Parameters<typeof prisma.contentProfile.update>[0]['data'] })
      : await prisma.contentProfile.create({ data: data as Parameters<typeof prisma.contentProfile.create>[0]['data'] });

    return NextResponse.json({ ok: true, profile });
  } catch (e) {
    console.error('[content/profile POST]', e);
    return NextResponse.json({ ok: false, error: 'DB error' }, { status: 500 });
  }
}
