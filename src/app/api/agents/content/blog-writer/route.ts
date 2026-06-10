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
      where:   { id: taskId, channel: 'blog', status: 'research_done' },
      include: { profile: true },
    });
    if (!task) return NextResponse.json({ error: 'Tarefa não encontrada ou pesquisa não concluída' }, { status: 404 });

    const researchDraft = await prisma.contentDraft.findFirst({
      where:   { taskId, type: 'research_brief', status: 'ready_for_writer' },
      orderBy: { createdAt: 'desc' },
    });
    if (!researchDraft) return NextResponse.json({ error: 'Briefing não encontrado — rode o Research Agent primeiro' }, { status: 400 });

    const profile = task.profile;

    const prompt = `Você é o Blog Writer da Easy Corten. Escreva um artigo completo, otimizado para SEO.

## Regras de escrita
- Tom de voz: ${profile.tone ?? 'técnico, claro e confiável'}
- Palavras proibidas: ${(profile.avoidWords as string[]).join(', ') || 'nenhuma'}
- Palavras-chave da marca (use ao menos 2 organicamente): ${(profile.brandKeywords as string[]).join(', ') || 'corten, aço corten'}
- Público-alvo: ${profile.targetAudience ?? 'arquitetos, construtoras e compradores B2B'}
- Mínimo de 800 palavras, ideal 1.200–2.000
- Parágrafos curtos (máximo 4 linhas)
- Linguagem ativa — evite voz passiva
- Nunca invente dados — use apenas o que está no briefing

## Briefing de pesquisa
${researchDraft.content}

## Estrutura obrigatória do Markdown
1. # H1 com palavra-chave principal (até 65 caracteres)
2. ## Key Takeaways — lista de 3 a 5 bullets
3. Introdução: 2–3 parágrafos sem heading
4. Corpo: mínimo 5 seções ## H2, cada uma com 2–4 parágrafos
5. ## Conclusão
6. ## Próximos Passos — CTA claro

Retorne APENAS JSON válido:
{
  "title": "H1 do artigo",
  "slug": "titulo-em-kebab-case",
  "excerpt": "Resumo 2-3 frases para listagem (até 200 chars)",
  "category": "Categoria temática",
  "tags": ["tag1", "tag2", "tag3", "tag4"],
  "read_time_minutes": 8,
  "cover_alt": "Descrição visual para imagem de capa",
  "destaque": false,
  "meta_title": "Título SEO até 60 chars",
  "meta_description": "Meta descrição SEO até 155 caracteres.",
  "key_takeaways": ["takeaway 1", "takeaway 2", "takeaway 3"],
  "content": "artigo completo em Markdown",
  "word_count": 0,
  "primary_keyword": "palavra-chave principal",
  "secondary_keywords": ["kw1", "kw2"],
  "h2s": ["H2 1", "H2 2", "H2 3", "H2 4", "H2 5"]
}`;

    const raw     = await callLLM(prompt);
    const article = JSON.parse(raw) as {
      title: string; slug: string; excerpt: string; category: string;
      tags: string[]; read_time_minutes: number; cover_alt: string; destaque: boolean;
      meta_title: string; meta_description: string; key_takeaways: string[];
      content: string; word_count: number; primary_keyword: string;
      secondary_keywords: string[]; h2s: string[];
    };

    const draft = await prisma.contentDraft.create({
      data: {
        taskId,
        profileId: task.profileId,
        agent:    'blog_writer',
        type:     'blog_post',
        content:  article.content,
        metadata: {
          title:              article.title,
          slug:               article.slug,
          excerpt:            article.excerpt,
          category:           article.category,
          tags:               article.tags ?? [],
          read_time_minutes:  article.read_time_minutes,
          cover_alt:          article.cover_alt,
          destaque:           article.destaque ?? false,
          meta_title:         article.meta_title,
          meta_description:   article.meta_description,
          key_takeaways:      article.key_takeaways ?? [],
          word_count:         article.word_count,
          primary_keyword:    article.primary_keyword,
          secondary_keywords: article.secondary_keywords,
          h2s:                article.h2s,
        },
        status: 'pending_approval',
      },
    });

    await prisma.contentTask.update({ where: { id: taskId }, data: { status: 'writing_done' } });

    return NextResponse.json({ ok: true, draftId: draft.id, agent: 'blog_writer', taskId, wordCount: article.word_count });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[blog-writer]', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
