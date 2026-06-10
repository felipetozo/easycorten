import 'server-only';

export async function callLLM(prompt: string): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error('OPENAI_API_KEY não configurada');

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method:  'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model:       'gpt-4o',
      temperature: 0.7,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: 'Você é um assistente especialista em marketing de conteúdo. Responda sempre em JSON válido.' },
        { role: 'user',   content: prompt },
      ],
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`OpenAI error ${res.status}: ${err}`);
  }

  type OpenAIResponse = { choices: { message: { content: string } }[] };
  const data = await res.json() as OpenAIResponse;
  return data.choices[0].message.content.trim();
}

export async function searchWeb(query: string): Promise<Array<{ title: string; url: string; snippet: string }>> {
  const apiKey = process.env.TAVILY_API_KEY;
  if (!apiKey) return [];
  try {
    const res = await fetch('https://api.tavily.com/search', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ api_key: apiKey, query, search_depth: 'basic', max_results: 5 }),
    });
    if (!res.ok) return [];
    const data = await res.json() as { results?: { title: string; url: string; content: string }[] };
    return (data.results ?? []).map((r) => ({ title: r.title, url: r.url, snippet: r.content }));
  } catch { return []; }
}
