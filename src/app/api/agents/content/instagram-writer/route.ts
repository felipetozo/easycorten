import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { callLLM } from '@/lib/llm';

export const maxDuration = 120;
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const { taskId } = await req.json() as { taskId: string };
    if (!taskId) return NextResponse.json({ error: 'taskId obrigatório' }, { status: 400 });

    const task = await prisma.contentTask.findFirst({
      where:   { id: taskId, channel: 'instagram', status: 'pending' },
      include: { profile: true },
    });
    if (!task) return NextResponse.json({ error: 'Tarefa não encontrada ou já processada' }, { status: 404 });

    const profile     = task.profile;
    const isCarrossel = task.format === 'carrossel';

    const prompt = `Você é o Instagram Copywriter da Easy Corten. Escreva uma legenda completa para o Instagram.

## Perfil da empresa
- Nome: ${profile.name}
- Segmento: ${profile.segment ?? 'Aço Corten e estruturas metálicas'}
- Tom de voz: ${profile.tone ?? 'técnico, claro e confiável'}
- Público-alvo: ${profile.targetAudience ?? 'arquitetos, construtoras e compradores B2B'}
- Palavras-chave (inclua ao menos 1 naturalmente): ${(profile.brandKeywords as string[]).join(', ') || 'corten, aço corten'}
- Palavras proibidas: ${(profile.avoidWords as string[]).join(', ') || 'nenhuma'}

## Tarefa
- Tema: ${task.theme}
- Formato: ${isCarrossel ? 'carrossel (múltiplos slides)' : 'post único'}
- Brief: ${task.brief}

## Regras
- GANCHO na primeira linha (até 125 chars antes do "mais")
- CORPO: ${isCarrossel ? '1 frase por slide + "Arrasta para ver →"' : '3 a 6 parágrafos curtos, máx 3 linhas'}
- CTA claro no final
- Linha em branco entre parágrafos
- HASHTAGS ao final (linha em branco antes)
- Entre 5 e 15 hashtags: nicho de construção, arquitetura, aço
- Máximo 2.200 caracteres no total
- Use emojis com moderação

Retorne APENAS JSON válido:
{
  "caption": "texto completo sem hashtags",
  "hashtags": ["#hashtag1", "#hashtag2"],
  "character_count": 0,
  "cta_type": "engagement | traffic | leads",
  "hook": "primeira linha isolada",
  "image_direction": "orientações visuais para quem vai criar a imagem"${isCarrossel ? ',\n  "slide_titles": ["Título slide 1", "Título slide 2", "Título slide 3"]' : ''}
}`;

    const raw    = await callLLM(prompt);
    const result = JSON.parse(raw) as {
      caption: string; hashtags: string[]; character_count: number;
      cta_type: string; hook: string; image_direction: string; slide_titles?: string[];
    };

    const fullContent = `${result.caption}\n\n${result.hashtags.join(' ')}`;

    const draft = await prisma.contentDraft.create({
      data: {
        taskId,
        profileId: task.profileId,
        agent:    'instagram_writer',
        type:     'caption',
        content:  fullContent,
        metadata: {
          format:          task.format,
          character_count: result.character_count || fullContent.length,
          hashtags:        result.hashtags,
          cta_type:        result.cta_type,
          hook:            result.hook,
          image_direction: result.image_direction,
          slide_titles:    result.slide_titles ?? [],
          theme:           task.theme,
        },
        status: 'pending_approval',
      },
    });

    await prisma.contentTask.update({ where: { id: taskId }, data: { status: 'writing_done' } });

    return NextResponse.json({ ok: true, draftId: draft.id, agent: 'instagram_writer', taskId });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[instagram-writer]', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
