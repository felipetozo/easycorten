import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { callLLM, searchWeb } from '@/lib/llm';

export const maxDuration = 120;
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const { taskId } = await req.json() as { taskId: string };
    if (!taskId) return NextResponse.json({ error: 'taskId obrigatório' }, { status: 400 });

    const task = await prisma.contentTask.findFirst({
      where:   { id: taskId, channel: 'blog' },
      include: { profile: true },
    });
    if (!task) return NextResponse.json({ error: 'Tarefa não encontrada' }, { status: 404 });

    const profile = task.profile;
    const searchResults = await searchWeb(`${task.theme} ${profile.segment ?? 'aço corten'}`);
    const searchContext = searchResults.length
      ? searchResults.map((r) => `- ${r.title}\n  URL: ${r.url}\n  Resumo: ${r.snippet}`).join('\n\n')
      : 'Pesquisa web não disponível — base o briefing no conhecimento do tema.';

    const prompt = `Você é o Blog Research Agent da Easy Corten. Crie um briefing de pesquisa completo para o artigo abaixo. Não escreva o artigo — apenas pesquise e estruture.

## Tarefa
- Tema: ${task.theme}
- Brief: ${task.brief}
- Data prevista: ${task.scheduledFor.toISOString().split('T')[0]}

## Perfil da empresa
- Segmento: ${profile.segment ?? 'Aço Corten e estruturas metálicas'}
- Público-alvo: ${profile.targetAudience ?? 'arquitetos, construtoras e compradores B2B'}
- Palavras-chave: ${(profile.brandKeywords as string[]).join(', ') || 'corten, aço corten'}
- Briefing geral: ${profile.briefing ?? 'não informado'}

## Resultados de pesquisa web
${searchContext}

Retorne APENAS JSON válido:
{
  "context": "2-3 parágrafos de contexto sobre o tema",
  "angle": "ângulo diferencial recomendado",
  "data_and_stats": [{ "stat": "dado relevante", "source": "fonte" }],
  "suggested_structure": {
    "h1": "título sugerido com palavra-chave principal",
    "meta_description": "meta descrição SEO até 155 caracteres",
    "h2s": ["H2 1", "H2 2", "H2 3", "H2 4", "H2 5"]
  },
  "faq": ["Dúvida 1", "Dúvida 2", "Dúvida 3"],
  "competitors": [{ "title": "título", "url": "url", "gap": "lacuna" }],
  "keywords": { "primary": "kw principal", "secondary": ["kw1", "kw2", "kw3"] },
  "external_links": [{ "text": "âncora", "url": "url" }]
}`;

    const raw   = await callLLM(prompt);
    const brief = JSON.parse(raw) as {
      context: string; angle: string;
      data_and_stats: { stat: string; source: string }[];
      suggested_structure: { h1: string; meta_description: string; h2s: string[] };
      faq: string[]; competitors: { title: string; url: string; gap: string }[];
      keywords: { primary: string; secondary: string[] };
      external_links: { text: string; url: string }[];
    };

    const briefMarkdown = `# Briefing — ${task.theme}

## Contexto
${brief.context}

## Ângulo recomendado
${brief.angle}

## Dados e estatísticas
${brief.data_and_stats.map((d) => `- ${d.stat} *(${d.source})*`).join('\n')}

## Estrutura sugerida
**H1:** ${brief.suggested_structure.h1}
**Meta descrição:** ${brief.suggested_structure.meta_description}
**H2s:**
${brief.suggested_structure.h2s.map((h) => `- ${h}`).join('\n')}

## Perguntas frequentes
${brief.faq.map((q) => `- ${q}`).join('\n')}

## Concorrência
${brief.competitors.map((c) => `- **${c.title}** — Lacuna: ${c.gap}`).join('\n')}

## Palavras-chave
**Principal:** ${brief.keywords.primary}
**Secundárias:** ${brief.keywords.secondary.join(', ')}

## Links externos recomendados
${brief.external_links.map((l) => `- [${l.text}](${l.url})`).join('\n')}`;

    const draft = await prisma.contentDraft.create({
      data: {
        taskId:   taskId,
        profileId: task.profileId,
        agent:    'blog_research',
        type:     'research_brief',
        content:  briefMarkdown,
        metadata: brief,
        status:   'ready_for_writer',
      },
    });

    await prisma.contentTask.update({ where: { id: taskId }, data: { status: 'research_done' } });

    return NextResponse.json({ ok: true, draftId: draft.id, agent: 'blog_research', taskId });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[blog-research]', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
