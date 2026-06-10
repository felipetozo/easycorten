import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { callLLM } from '@/lib/llm';

export const maxDuration = 120;
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const { draftId, instructions } = await req.json() as { draftId?: string; instructions?: string };
    if (!draftId)             return NextResponse.json({ error: 'draftId obrigatório' }, { status: 400 });
    if (!instructions?.trim()) return NextResponse.json({ error: 'instructions obrigatório' }, { status: 400 });

    const draft = await prisma.contentDraft.findUnique({
      where:   { id: draftId },
      include: { task: { include: { profile: true } } },
    });
    if (!draft) return NextResponse.json({ error: 'Draft não encontrado' }, { status: 404 });

    const { task } = draft;
    const profile  = task.profile;
    const meta     = draft.metadata as Record<string, unknown> | null;

    let newContent:  string;
    let newMetadata: Record<string, unknown>;

    if (draft.type === 'blog_post') {
      const prompt = `Você é o Blog Writer da Easy Corten. Você receberá um artigo existente e instruções de correção. Aplique APENAS as correções solicitadas, mantendo estrutura, estilo e informações do original.

## Artigo atual (Markdown)
${draft.content}

## Instruções de correção
${instructions}

## Regras
- Tom de voz: ${profile.tone ?? 'técnico, claro e confiável'}
- Palavras proibidas: ${(profile.avoidWords as string[]).join(', ') || 'nenhuma'}
- Palavras-chave da marca: ${(profile.brandKeywords as string[]).join(', ') || 'corten, aço corten'}
- Aplique APENAS as correções pedidas — não altere partes não mencionadas

Retorne APENAS JSON válido:
{
  "title": "${String(meta?.title ?? '')}",
  "meta_title": "Título SEO até 60 chars",
  "meta_description": "Meta descrição SEO até 155 chars",
  "key_takeaways": ${JSON.stringify((meta?.key_takeaways as string[] | undefined) ?? [])},
  "content": "artigo completo corrigido em Markdown",
  "word_count": 0,
  "h2s": ${JSON.stringify((meta?.h2s as string[] | undefined) ?? [])}
}`;

      const raw  = await callLLM(prompt);
      const data = JSON.parse(raw) as {
        title: string; meta_title: string; meta_description: string;
        key_takeaways: string[]; content: string; word_count: number; h2s: string[];
      };

      newContent  = data.content;
      newMetadata = {
        ...meta,
        title:              data.title,
        meta_title:         data.meta_title,
        meta_description:   data.meta_description,
        key_takeaways:      data.key_takeaways,
        word_count:         data.word_count,
        h2s:                data.h2s,
        corrected_from:     draftId,
        correction_instructions: instructions,
      };
    } else {
      // caption / instagram / outros canais de texto
      const prompt = `Você é o Content Writer da Easy Corten. Você receberá um conteúdo existente (${draft.type}) e instruções de correção. Aplique APENAS as correções solicitadas.

## Conteúdo atual
${draft.content}

## Instruções de correção
${instructions}

## Regras
- Tom de voz: ${profile.tone ?? 'técnico, claro e confiável'}
- Palavras proibidas: ${(profile.avoidWords as string[]).join(', ') || 'nenhuma'}
- Aplique APENAS as correções pedidas

Retorne APENAS JSON válido:
{
  "content": "conteúdo corrigido completo"
}`;

      const raw  = await callLLM(prompt);
      const data = JSON.parse(raw) as { content: string };

      newContent  = data.content;
      newMetadata = {
        ...meta,
        corrected_from:          draftId,
        correction_instructions: instructions,
      };
    }

    const newDraft = await prisma.contentDraft.create({
      data: {
        taskId:    task.id,
        profileId: task.profileId,
        agent:     'rewrite',
        type:      draft.type,
        content:   newContent,
        metadata:  newMetadata as Parameters<typeof prisma.contentDraft.create>[0]['data']['metadata'],
        status:    'pending_approval',
      },
    });

    await prisma.contentTask.update({
      where: { id: task.id },
      data:  { status: 'writing_done' },
    });

    return NextResponse.json({ ok: true, draftId: newDraft.id });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[rewrite]', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
