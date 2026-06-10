import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { callLLM } from '@/lib/llm';

export const maxDuration = 120;
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const { planningPeriod = 'week', referenceDate } = await req.json() as {
      planningPeriod?: 'day' | 'week' | 'month';
      referenceDate?: string;
    };

    const profile = await prisma.contentProfile.findFirst({ orderBy: { createdAt: 'asc' } });
    if (!profile) return NextResponse.json({ error: 'Perfil não configurado' }, { status: 400 });

    const activeChannels = profile.activeChannels as string[];
    if (!activeChannels.length) return NextResponse.json({ error: 'Nenhum canal ativo' }, { status: 400 });

    const refDate  = referenceDate ? new Date(referenceDate) : new Date();
    const periodDays = planningPeriod === 'day' ? 1 : planningPeriod === 'month' ? 30 : 7;
    const periodEnd  = new Date(refDate);
    periodEnd.setDate(periodEnd.getDate() + periodDays - 1);

    const since = new Date(refDate);
    since.setDate(since.getDate() - 14);
    const recentTasks: { theme: string; channel: string }[] = await prisma.contentTask.findMany({
      where:  { profileId: profile.id, createdAt: { gte: since } },
      select: { theme: true, channel: true },
    });

    const freq = (profile.contentFrequency as Record<string, number>) ?? {};

    const totalBlog      = Math.round((freq['blog']      ?? 0) * periodDays);
    const totalInstagram = Math.round((freq['instagram'] ?? 0) * periodDays);
    const totalGmb       = Math.round((freq['gmb']       ?? 0) * periodDays);

    const recentThemes = recentTasks.length
      ? recentTasks.map((t) => `[${t.channel}] ${t.theme}`).join('\n')
      : 'Nenhum histórico recente';

    const prompt = `Você é o Content Planner da Easy Corten. Gere um calendário editorial para a empresa abaixo.

## Perfil da empresa
- Nome: ${profile.name}
- Segmento: ${profile.segment ?? 'Aço Corten e estruturas metálicas'}
- Tom de voz: ${profile.tone ?? 'técnico e confiável'}
- Público-alvo: ${profile.targetAudience ?? 'arquitetos, construtoras e compradores B2B'}
- Palavras-chave da marca: ${(profile.brandKeywords as string[]).join(', ') || 'corten, aço corten, chapas de aço'}
- Briefing: ${profile.briefing ?? 'não informado'}
- Canais ativos: ${activeChannels.join(', ')}

## Período
- Início: ${refDate.toISOString().split('T')[0]}
- Fim: ${periodEnd.toISOString().split('T')[0]}
- Modo: ${planningPeriod}

## Temas recentes (evite repetir)
${recentThemes}

## Regras de volume (OBRIGATÓRIO)
- Blog: EXATAMENTE ${totalBlog} artigos (${freq['blog'] ?? 0}/dia × ${periodDays} dias). Formato "artigo", foco SEO.
- Instagram: EXATAMENTE ${totalInstagram} posts (${freq['instagram'] ?? 0}/dia × ${periodDays} dias), variando "post" e "carrossel"
- GMB: EXATAMENTE ${totalGmb} posts (${freq['gmb'] ?? 0}/dia × ${periodDays} dias), formato "gmb_post"
- Se total de um canal for 0, não gere tarefas para ele
- Nunca repita tema das últimas 2 semanas no mesmo canal
- Toda tarefa deve ter brief específico e acionável (mínimo 2 frases)

Retorne APENAS JSON válido:
{
  "tasks": [
    {
      "channel": "blog | instagram | gmb",
      "format": "artigo | post | carrossel | gmb_post | gmb_offer",
      "theme": "tema específico da peça",
      "brief": "orientações detalhadas para o agent executar — mínimo 2 frases",
      "scheduled_for": "YYYY-MM-DD"
    }
  ]
}`;

    const raw    = await callLLM(prompt);
    const parsed = JSON.parse(raw) as { tasks: { channel: string; format: string; theme: string; brief: string; scheduled_for: string }[] };

    const calendar = await prisma.contentCalendar.create({
      data: {
        profileId:   profile.id,
        periodStart: refDate,
        periodEnd,
        channels:    activeChannels,
        tasksCount:  parsed.tasks.length,
      },
    });

    await prisma.contentTask.createMany({
      data: parsed.tasks.map((t) => ({
        profileId:   profile.id,
        calendarId:  calendar.id,
        channel:     t.channel,
        format:      t.format,
        theme:       t.theme,
        brief:       t.brief,
        scheduledFor: new Date(t.scheduled_for),
        createdBy:   'content_planner',
      })),
    });

    return NextResponse.json({
      ok:           true,
      calendarId:   calendar.id,
      tasksCreated: parsed.tasks.length,
      period:       `${refDate.toISOString().split('T')[0]} a ${periodEnd.toISOString().split('T')[0]}`,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[content/planner]', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
