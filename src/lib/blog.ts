export type BlogPost = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  authorName: string;
  publishedAt: string;
  readTimeMinutes: number;
  coverImage: string | null;
  content: string;
};

export const BLOG_POSTS: BlogPost[] = [
  {
    id: '1',
    slug: 'aco-corten-beleza-que-evolui',
    title: 'Aço Corten: A Beleza que Evolui com o Tempo',
    excerpt:
      'Descubra como a oxidação controlada do aço corten cria uma camada protetora única que só fica mais bela com os anos.',
    category: 'Material',
    authorName: 'Equipe EasyCorten',
    publishedAt: '2025-03-10',
    readTimeMinutes: 5,
    coverImage: '/EM_200611_MEZA_1393_Edit.avif',
    content: `
<h2>O que é o aço corten?</h2>
<p>O aço corten — também chamado de aço patinável ou aço cortén — é uma liga metálica desenvolvida para resistir à corrosão atmosférica de forma natural. Diferente dos aços convencionais, ele não precisa de pintura ou revestimento protetor para durar décadas.</p>
<p>A composição química do corten inclui elementos como cobre, cromo, níquel e fósforo, que trabalham juntos para criar uma resposta diferente quando o material entra em contato com ar e umidade.</p>

<h2>A ciência da oxidação controlada</h2>
<p>Quando exposto ao ambiente, o corten desenvolve uma camada superficial de óxido estável — a famosa <strong>patina</strong>. Esse processo acontece nos primeiros meses de exposição e, diferente da ferrugem comum, cria uma barreira protetora que praticamente interrompe a corrosão interna.</p>
<p>O resultado visual é uma textura rica que vai do alaranjado vibrante ao marrom terroso profundo, com variações únicas em cada peça.</p>

<h2>Por que a patina não é corrosão?</h2>
<p>Muitas pessoas confundem a aparência enferrujada do corten com deterioração. Na verdade, é o oposto: a patina é o sinal de que o material está funcionando perfeitamente. Enquanto o aço comum corrói de dentro para fora, o corten forma uma proteção que cresce da superfície para dentro, estabilizando o material.</p>
<blockquote>O aço corten não envelhece — ele amadurece.</blockquote>

<h2>Aplicações mais comuns</h2>
<p>O corten é amplamente utilizado em fachadas arquitetônicas, painéis de jardim, portões, floreiras, esculturas e sinalização. Sua versatilidade permite cortes precisos, dobras e soldas sem perder as propriedades estéticas.</p>
<ul>
  <li>Fachadas e revestimentos externos</li>
  <li>Painéis e divisórias de jardim</li>
  <li>Esculturas e arte urbana</li>
  <li>Portões e grades</li>
  <li>Floreiras e estruturas paisagísticas</li>
</ul>

<h2>Manutenção: menos é mais</h2>
<p>Um dos maiores atrativos do corten é a ausência de manutenção intensiva. Uma limpeza ocasional com água e sabão neutro é suficiente para preservar a aparência. Não é necessário pintar, envernizar ou tratar quimicamente o material ao longo de sua vida útil.</p>
<p>Em ambientes costeiros ou de alta salinidade, pode ser necessário um tratamento inicial, mas na grande maioria das aplicações o corten é verdadeiramente livre de manutenção.</p>
    `.trim(),
  },
  {
    id: '2',
    slug: 'personalizacao-de-ambientes-com-corten',
    title: 'Personalização de Ambientes com Aço Corten',
    excerpt:
      'Do hall de entrada ao jardim, o corten transforma qualquer espaço com personalidade e sofisticação que nenhum outro material consegue replicar.',
    category: 'Design',
    authorName: 'Equipe EasyCorten',
    publishedAt: '2025-04-18',
    readTimeMinutes: 4,
    coverImage: '/IMG_3049_-_copia_f1aae601-f494-464b-af2d-291cfe4929fe.avif',
    content: `
<h2>Por que o corten personaliza?</h2>
<p>Diferente de materiais industrializados e padronizados, o aço corten tem uma característica única: cada peça é visualmente diferente. A patina se desenvolve de forma orgânica, respondendo às condições específicas de cada ambiente, luz e clima. Isso significa que dois painéis lado a lado podem ter nuances distintas — e isso é exatamente o charme.</p>

<h2>Ambientes externos e jardins</h2>
<p>O uso mais popular do corten é em ambientes externos. Floreiras elevadas, delimitadores de canteiro, painéis de jardim e muros de contenção ganham uma presença visual imponente com o material. A textura envelhecida contrasta lindamente com o verde das plantas, criando uma paleta que parece ter brotado da natureza.</p>
<p>Estruturas de jardinagem em corten também eliminam a preocupação com manutenção: sem pintura que descasca, sem ferrugem excessiva, sem trocas frequentes.</p>

<h2>Fachadas e revestimentos</h2>
<p>Em arquitetura, o corten aplicado em fachadas transforma completamente a personalidade de um edifício. O visual industrial-elegante é especialmente valorizado em projetos residenciais modernos, escritórios e estabelecimentos comerciais que buscam diferenciação.</p>
<p>Painéis perfurados em corten são amplamente usados como brises ou revestimentos que controlam a entrada de luz enquanto criam padrões visuais únicos na fachada.</p>

<h2>Interiores: corten dentro de casa</h2>
<p>O corten não precisa ficar só do lado de fora. Painéis decorativos, divisórias, revestimentos de paredes internas e até peças de mobiliário em corten trazem um elemento de originalidade e sofisticação para ambientes internos.</p>
<p>Cuidado especial é necessário para garantir que a peça esteja completamente patinada antes de entrar em um ambiente interno, para evitar que resíduos de oxidação manchem outras superfícies.</p>

<h2>Combinações que funcionam</h2>
<p>O corten harmoniza naturalmente com madeira, concreto aparente, vidro e vegetação. É um material que parece pertencer tanto a ambientes rústicos quanto modernos — essa versatilidade é uma das razões do seu sucesso no design contemporâneo.</p>
<ul>
  <li><strong>Corten + madeira:</strong> calor e autenticidade</li>
  <li><strong>Corten + concreto:</strong> industrial e sofisticado</li>
  <li><strong>Corten + vidro:</strong> contraste textura/transparência</li>
  <li><strong>Corten + vegetação:</strong> integração com a natureza</li>
</ul>
    `.trim(),
  },
  {
    id: '3',
    slug: 'sustentabilidade-e-corten',
    title: 'Sustentabilidade e Corten: Um Material Consciente',
    excerpt:
      'O aço corten não precisa de pintura nem manutenção química — sua durabilidade é naturalmente sustentável e seu ciclo de vida fecha de forma virtuosa.',
    category: 'Sustentabilidade',
    authorName: 'Equipe EasyCorten',
    publishedAt: '2025-05-05',
    readTimeMinutes: 6,
    coverImage: '/EasyCorten-Corten-Fachada.avif',
    content: `
<h2>Por que o corten é sustentável?</h2>
<p>Em um cenário onde a sustentabilidade deixou de ser diferencial para se tornar responsabilidade, o aço corten se destaca como uma das escolhas mais conscientes no design e na construção. Seu diferencial não está apenas na estética — está no ciclo de vida completo do material.</p>

<h2>Zero pintura, zero manutenção química</h2>
<p>A grande maioria dos metais utilizados em construção e design precisa de algum tipo de revestimento protetor: tinta, galvanização, verniz ou tratamentos químicos. Esses processos têm custo financeiro e ambiental significativo — e precisam ser repetidos ao longo dos anos.</p>
<p>O corten elimina esse ciclo completamente. Sua proteção vem da própria composição do material, sem necessidade de nenhum produto externo.</p>

<h2>Durabilidade que reduz o descarte</h2>
<p>Um produto que dura mais é, por definição, mais sustentável. O aço corten tem vida útil de <strong>50 a 80 anos</strong> em condições normais de exposição, o que reduz drasticamente a necessidade de substituição e, consequentemente, o descarte de materiais.</p>
<p>Compare com metais pintados ou galvanizados que precisam de reposição em 10 a 20 anos — a diferença no impacto ambiental acumulado é enorme.</p>

<h2>Reciclabilidade total</h2>
<p>O aço é um dos materiais mais recicláveis do mundo. Ao final da sua vida útil, o corten pode ser 100% reciclado e reintegrado à cadeia produtiva sem perda de qualidade. Isso fecha o ciclo de forma virtualmente perfeita.</p>

<h2>Origem e produção</h2>
<p>O aço corten é produzido por usinas siderúrgicas com altos padrões técnicos. No Brasil, a cadeia de produção do aço evoluiu significativamente nas últimas décadas em termos de eficiência energética e redução de emissões, tornando o material cada vez mais sustentável do ponto de vista da produção.</p>

<h2>O custo-benefício ambiental real</h2>
<p>Quando consideramos o custo de vida total de um projeto — incluindo substituição, manutenção e descarte — o corten frequentemente supera materiais aparentemente mais "verdes" que demandam substituição frequente ou tratamentos regulares.</p>
    `.trim(),
  },
  {
    id: '4',
    slug: 'corten-na-arquitetura-contemporanea',
    title: 'Corten na Arquitetura Contemporânea',
    excerpt:
      'Arquitetos ao redor do mundo escolhem o corten pela textura única, pela paleta terrosa e pela resistência incomparável a ambientes externos.',
    category: 'Arquitetura',
    authorName: 'Equipe EasyCorten',
    publishedAt: '2025-06-01',
    readTimeMinutes: 7,
    coverImage: '/EasyCorten-Corten-Fachada.avif',
    content: `
<h2>Uma escolha estética e técnica</h2>
<p>A adoção do aço corten na arquitetura contemporânea não foi por acaso. Arquitetos e designers encontraram no material uma combinação rara: identidade visual forte, performance técnica comprovada e custo de manutenção praticamente nulo.</p>
<p>O corten passou de material industrial a ícone do design moderno ao longo das últimas décadas, presente em projetos residenciais, comerciais e em grandes obras de arte pública ao redor do mundo.</p>

<h2>Projetos icônicos com corten</h2>
<p>O Centro Pompidou-Metz, a Fundação Iberê Camargo no Brasil e dezenas de outras obras icônicas utilizaram o corten como elemento central de sua linguagem arquitetônica. A escolha não é casual — é uma declaração de permanência e autenticidade.</p>
<p>No Brasil, o material ganhou espaço especialmente em projetos residenciais de alto padrão e em intervenções urbanas que buscam permanência estética sem manutenção excessiva.</p>

<h2>O corten no Brasil</h2>
<p>O mercado brasileiro absorveu o corten com entusiasmo, especialmente nos últimos 10 anos. O clima variado do país — que combina sol intenso, chuvas tropicais e umidade — é na verdade ideal para o desenvolvimento da patina, acelerando o processo de estabilização sem comprometer a durabilidade.</p>

<h2>Detalhes construtivos que fazem a diferença</h2>
<p>O uso bem-executado do corten depende de alguns cuidados técnicos: afastar a peça de superfícies que possam ser manchadas durante a fase de oxidação inicial, garantir drenagem adequada para evitar o acúmulo de água estagnada e dimensionar as peças considerando a dilatação térmica.</p>
<p>Quando bem planejado, o corten entrega uma performance estética e estrutural que muito dificilmente outro material consegue oferecer pelo mesmo custo total.</p>

<h2>O futuro do corten na arquitetura</h2>
<p>Com o crescimento do interesse por materiais com identidade, durabilidade e caráter sustentável, a tendência é que o corten continue ganhando espaço tanto em projetos de grande escala quanto em aplicações residenciais e paisagísticas.</p>
<p>A combinação de estética inconfundível, baixa manutenção e ciclo de vida sustentável posiciona o corten como um dos materiais mais relevantes da arquitetura do século XXI.</p>
    `.trim(),
  },
];

export function getPostBySlug(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find((p) => p.slug === slug);
}

export function getRelatedPosts(currentSlug: string, category: string, limit = 3): BlogPost[] {
  return BLOG_POSTS.filter((p) => p.slug !== currentSlug && p.category === category)
    .concat(BLOG_POSTS.filter((p) => p.slug !== currentSlug && p.category !== category))
    .slice(0, limit);
}

export function getAllCategories(): string[] {
  return [...new Set(BLOG_POSTS.map((p) => p.category))];
}

export function getPostsByCategory(category?: string): BlogPost[] {
  if (!category) return BLOG_POSTS;
  return BLOG_POSTS.filter((p) => p.category === category);
}
