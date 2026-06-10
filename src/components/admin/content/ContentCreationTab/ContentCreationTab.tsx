'use client';

import { useState, useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';
import type { ContentTask, ContentDraft, ContentTaskStatus, ContentChannel } from '@/types/content';
import { CHANNEL_META, TASK_STATUS_META } from '@/types/content';
import {
  RiEyeLine, RiDeleteBinLine, RiCheckLine, RiCloseLine,
  RiFileTextLine, RiMapPinLine, RiRefreshLine,
  RiArrowRightLine, RiArrowDownSLine, RiArrowUpSLine,
  RiPlayLine,
} from 'react-icons/ri';
import { SiInstagram, SiX, SiFacebook, SiTiktok } from 'react-icons/si';
import { RiLinkedinBoxFill } from 'react-icons/ri';
import s from './ContentCreationTab.module.css';

type Props = { tasks: ContentTask[]; onRefresh: () => void };
type ChannelFilter = ContentChannel | 'all';
type StatusFilter  = ContentTaskStatus | 'all';
type GenStep = 'research' | 'writing' | null;

const GEN_STEPS: Record<NonNullable<GenStep>, { label: string; pct: number }> = {
  research: { label: 'Pesquisando na web…', pct: 25 },
  writing:  { label: 'Gerando conteúdo…',   pct: 65 },
};

const CHANNEL_ICON: Record<ContentChannel, React.ComponentType<{ size?: number }>> = {
  blog:      RiFileTextLine,
  instagram: SiInstagram,
  gmb:       RiMapPinLine,
  twitter:   SiX,
  linkedin:  RiLinkedinBoxFill,
  facebook:  SiFacebook,
  tiktok:    SiTiktok,
};

function mdToHtml(md: string): string {
  const lines = md.split('\n');
  const out: string[] = [];
  let listItems: string[] = [];
  function inline(t: string) {
    return t
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/`(.+?)`/g, '<code>$1</code>')
      .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" target="_blank" rel="noreferrer">$1</a>');
  }
  function flush() { if (listItems.length) { out.push(`<ul>${listItems.join('')}</ul>`); listItems = []; } }
  for (const line of lines) {
    if      (line.startsWith('# '))   { flush(); out.push(`<h1>${inline(line.slice(2))}</h1>`); }
    else if (line.startsWith('## '))  { flush(); out.push(`<h2>${inline(line.slice(3))}</h2>`); }
    else if (line.startsWith('### ')) { flush(); out.push(`<h3>${inline(line.slice(4))}</h3>`); }
    else if (/^[-*] /.test(line))     { listItems.push(`<li>${inline(line.slice(2))}</li>`); }
    else if (line.trim() === '')      { flush(); }
    else { flush(); out.push(`<p>${inline(line)}</p>`); }
  }
  flush();
  return out.join('');
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
}

// ─── TaskCard ─────────────────────────────────────────────────────────────────

type TaskCardProps = {
  task:      ContentTask;
  onRefresh: () => void;
  onPreview: (task: ContentTask, draft: ContentDraft) => void;
};

function TaskCard({ task, onRefresh, onPreview }: TaskCardProps) {
  const [genStep,  setGenStep]  = useState<GenStep>(null);
  const [genPct,   setGenPct]   = useState(0);
  const [genError, setGenError] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [open,     setOpen]     = useState(false);

  const isGenerating = genStep !== null;
  const meta    = CHANNEL_META[task.channel];
  const stMeta  = TASK_STATUS_META[task.status];
  const Icon    = CHANNEL_ICON[task.channel];
  const drafts  = task.drafts ?? [];

  const mainDraft = drafts.find((d) =>
    d.type === 'blog_post' || d.type === 'caption' || d.type === 'tweet' ||
    d.type === 'linkedin_post' || d.type === 'facebook_post' ||
    d.type === 'tiktok_script' || d.type === 'gmb_post'
  ) ?? drafts[0] ?? null;

  const canRun =
    !isGenerating && (
      (task.channel === 'blog'      && (task.status === 'pending' || task.status === 'research_done')) ||
      (task.channel === 'instagram' && task.status === 'pending')
    );

  async function post(url: string, body: Record<string, string>) {
    const res  = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    const data = await res.json() as { ok?: boolean; error?: string };
    if (!res.ok || !data.ok) throw new Error((data as { error?: string }).error ?? 'Erro desconhecido');
  }

  async function handleGenerate() {
    setGenError('');
    setGenPct(0);
    try {
      if (task.channel === 'blog') {
        if (task.status === 'pending') {
          setGenStep('research');
          setGenPct(GEN_STEPS.research.pct);
          await post('/api/agents/content/blog-research', { taskId: task.id });
        }
        setGenStep('writing');
        setGenPct(GEN_STEPS.writing.pct);
        await post('/api/agents/content/blog-writer', { taskId: task.id });
      } else if (task.channel === 'instagram') {
        setGenStep('writing');
        setGenPct(GEN_STEPS.writing.pct);
        await post('/api/agents/content/instagram-writer', { taskId: task.id });
      }
      setGenPct(100);
      onRefresh();
    } catch (err) {
      setGenError(err instanceof Error ? err.message : String(err));
    } finally {
      setGenStep(null);
    }
  }

  async function handleApprove() {
    await fetch(`/api/admin/content/tasks/${task.id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'approved' }),
    });
    onRefresh();
  }

  async function handleDelete() {
    if (!confirm('Excluir esta tarefa?')) return;
    setDeleting(true);
    await fetch(`/api/admin/content/tasks/${task.id}`, { method: 'DELETE' });
    setDeleting(null as unknown as boolean);
    onRefresh();
  }

  const canApprove = task.status === 'writing_done' && drafts.length > 0 && !isGenerating;

  return (
    <div
      className={s.taskCard}
      style={{ borderColor: isGenerating ? 'rgba(16,185,129,0.3)' : undefined }}
    >
      {/* Header row */}
      <div className={s.cardHead}>
        <span className={s.channelBadge} style={{ color: meta.color, borderColor: meta.color + '40' }}>
          <Icon size={12} /> {meta.label}
        </span>
        <span className={s.taskTheme}>{task.theme}</span>
        <span className={s.taskDate}>{formatDate(task.scheduledFor)}</span>
        <span className={s.statusBadge} style={{ color: stMeta.color, backgroundColor: stMeta.color + '18' }}>
          {stMeta.label}
        </span>

        {canRun && (
          <button type="button" className={`${s.iconBtn} ${s.runIconBtn}`} onClick={handleGenerate} title="Gerar com IA">
            <RiPlayLine size={16} />
          </button>
        )}
        {isGenerating && (
          <span className={s.generatingLabel}>
            <RiRefreshLine size={14} className={s.spin} />
            {GEN_STEPS[genStep!].label}
          </span>
        )}
        {mainDraft && !isGenerating && (
          <button type="button" className={`${s.iconBtn} ${s.viewIconBtn}`} onClick={() => onPreview(task, mainDraft)} title="Ver conteúdo">
            <RiEyeLine size={16} />
          </button>
        )}
        {canApprove && (
          <button type="button" className={`${s.iconBtn} ${s.approveIconBtn}`} onClick={handleApprove} title="Aprovar">
            <RiCheckLine size={16} />
          </button>
        )}
        <button
          type="button"
          className={`${s.iconBtn} ${s.deleteIconBtn}`}
          onClick={handleDelete}
          disabled={deleting || isGenerating}
          title="Excluir"
        >
          <RiDeleteBinLine size={15} />
        </button>
        <button type="button" className={`${s.iconBtn} ${s.expandBtn}`} onClick={() => setOpen((v) => !v)}>
          {open ? <RiArrowUpSLine size={18} /> : <RiArrowDownSLine size={18} />}
        </button>
      </div>

      {/* Progress bar */}
      {isGenerating && (
        <div className={s.progressWrap}>
          <div className={s.progressTop}>
            <span className={s.progressLabel}>{GEN_STEPS[genStep!].label}</span>
            <span className={s.progressPct}>{genPct}%</span>
          </div>
          <div className={s.progressTrack}>
            <div className={s.progressFill} style={{ width: `${genPct}%` }} />
          </div>
        </div>
      )}

      {/* Error */}
      {genError && !isGenerating && (
        <div className={s.genError}>Erro: {genError}</div>
      )}

      {/* Expanded: brief + drafts */}
      {open && !isGenerating && (
        <div className={s.cardExpanded}>
          <p className={s.briefText}>{task.brief}</p>
          {drafts.length > 0 && (
            <div className={s.draftList}>
              <span className={s.draftsLabel}>Rascunhos</span>
              {drafts.map((d) => {
                const dLabels: Record<string, string> = {
                  research_brief: 'Pesquisa', blog_post: 'Artigo', caption: 'Legenda',
                  tweet: 'Tweet', linkedin_post: 'LinkedIn', facebook_post: 'Facebook',
                  tiktok_script: 'TikTok', gmb_post: 'GMB',
                };
                const dColors: Record<string, string> = {
                  approved: '#10b981', rejected: '#ef4444', pending_approval: '#6366f1', draft: '#9ca3af',
                };
                return (
                  <div key={d.id} className={s.draftRow}>
                    <span className={s.draftType}>{dLabels[d.type] ?? d.type}</span>
                    <span className={s.draftStatus} style={{ color: dColors[d.status] ?? '#9ca3af' }}>
                      {d.status === 'pending_approval' ? 'Aguardando aprovação' : d.status === 'approved' ? 'Aprovado' : d.status === 'rejected' ? 'Rejeitado' : 'Rascunho'}
                    </span>
                    <button type="button" className={s.draftViewBtn} onClick={() => onPreview(task, d)}>
                      <RiEyeLine size={14} />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Modal ────────────────────────────────────────────────────────────────────

type ModalProps = {
  task:    ContentTask;
  draft:   ContentDraft;
  onClose: () => void;
  onRefresh: () => void;
};

function DraftModal({ task, draft, onClose, onRefresh }: ModalProps) {
  const [mounted, setMounted] = useState(false);
  const [cur, setCur]         = useState(draft);
  useEffect(() => { setMounted(true); }, []);

  const dLabels: Record<string, string> = {
    research_brief: 'Pesquisa', blog_post: 'Artigo', caption: 'Legenda',
    tweet: 'Tweet', linkedin_post: 'LinkedIn', facebook_post: 'Facebook',
    tiktok_script: 'TikTok', gmb_post: 'GMB',
  };
  const allDrafts = task.drafts ?? [];
  const meta      = cur.metadata as Record<string, unknown> | null;
  const isBlog    = cur.type === 'blog_post';
  const isCaption = cur.type === 'caption';

  if (!mounted) return null;

  async function approve() {
    await fetch(`/api/admin/content/tasks/${task.id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'approved' }),
    });
    onRefresh();
    onClose();
  }

  return createPortal(
    <div className={s.overlay} onClick={onClose}>
      <div className={s.modal} onClick={(e) => e.stopPropagation()}>
        <div className={s.modalHead}>
          <div className={s.modalHeadLeft}>
            <span className={s.modalTitle}>{task.theme}</span>
            <span className={s.modalSub}>
              {CHANNEL_META[task.channel].label} · {formatDate(task.scheduledFor)}
              {isBlog && !!meta?.['word_count'] && <> · {String(meta['word_count'])} palavras</>}
            </span>
          </div>
          <div className={s.modalHeadRight}>
            {allDrafts.length > 1 && (
              <div className={s.draftSwitcher}>
                {allDrafts.map((d) => (
                  <button key={d.id} type="button"
                    className={`${s.draftBtn} ${cur.id === d.id ? s.draftBtnActive : ''}`}
                    onClick={() => setCur(d)}
                  >
                    {dLabels[d.type] ?? d.type}
                  </button>
                ))}
              </div>
            )}
            <button type="button" className={s.closeBtn} onClick={onClose}><RiCloseLine /></button>
          </div>
        </div>

        {isCaption ? (
          <div className={s.modalBody}>
            <div className={s.captionPreview}>
              {cur.content.split('\n').map((line, i) => (
                <p key={i} className={line.startsWith('#') ? s.captionHashtags : s.captionLine}>{line || ' '}</p>
              ))}
            </div>
            {!!(cur.metadata as Record<string, unknown> | null)?.['image_direction'] && (
              <div className={s.imageDir}>
                <strong>Direção de imagem:</strong> {String((cur.metadata as Record<string, unknown>)['image_direction'])}
              </div>
            )}
          </div>
        ) : isBlog ? (
          <div className={s.modalBody}>
            {meta && (
              <div className={s.articleMeta}>
                {(['meta_title', 'meta_description', 'category', 'read_time_minutes'] as const).map((k) => {
                  const v = meta[k]; if (!v) return null;
                  const labels: Record<string, string> = { meta_title: 'Título SEO', meta_description: 'Meta descrição', category: 'Categoria', read_time_minutes: 'Tempo de leitura' };
                  return (
                    <div key={k} className={s.metaRow}>
                      <span className={s.metaKey}>{labels[k]}</span>
                      <span className={s.metaVal}>{String(v)}{k === 'read_time_minutes' ? ' min' : ''}</span>
                    </div>
                  );
                })}
                {Array.isArray(meta['tags']) && (
                  <div className={s.metaRow}>
                    <span className={s.metaKey}>Tags</span>
                    <div className={s.tagList}>
                      {(meta['tags'] as string[]).map((t) => <span key={t} className={s.tag}>{t}</span>)}
                    </div>
                  </div>
                )}
              </div>
            )}
            <div className={s.articleBody} dangerouslySetInnerHTML={{ __html: mdToHtml(cur.content) }} />
          </div>
        ) : (
          <div className={s.modalBody}>
            <pre className={s.rawContent}>{cur.content}</pre>
          </div>
        )}

        {task.status === 'writing_done' && cur.status === 'pending_approval' && (
          <div className={s.modalFooter}>
            <button type="button" className={s.approveTaskBtn} onClick={approve}>
              <RiCheckLine /> Aprovar conteúdo
            </button>
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function ContentCreationTab({ tasks, onRefresh }: Props) {
  const [channelFilter, setChannelFilter] = useState<ChannelFilter>('all');
  const [statusFilter,  setStatusFilter]  = useState<StatusFilter>('all');
  const [modal, setModal] = useState<{ task: ContentTask; draft: ContentDraft } | null>(null);

  const openPreview = useCallback((task: ContentTask, draft: ContentDraft) => {
    setModal({ task, draft });
  }, []);

  const filtered = tasks.filter((t) => {
    if (channelFilter !== 'all' && t.channel !== channelFilter) return false;
    if (statusFilter  !== 'all' && t.status  !== statusFilter)  return false;
    return true;
  });

  const grouped = filtered.reduce<Record<string, ContentTask[]>>((acc, t) => {
    const key = t.scheduledFor.split('T')[0];
    (acc[key] ??= []).push(t);
    return acc;
  }, {});

  const sortedDays = Object.keys(grouped).sort();
  const channels: ChannelFilter[] = ['all', ...(Array.from(new Set(tasks.map((t) => t.channel))) as ContentChannel[])];
  const statuses: StatusFilter[]  = ['all', ...(Array.from(new Set(tasks.map((t) => t.status))) as ContentTaskStatus[])];

  return (
    <>
      <div className={s.root}>
        <div className={s.toolbar}>
          <div className={s.filters}>
            <div className={s.filterGroup}>
              {channels.map((ch) => (
                <button key={ch} type="button"
                  className={`${s.filterBtn} ${channelFilter === ch ? s.filterBtnActive : ''}`}
                  onClick={() => setChannelFilter(ch)}
                >
                  {ch === 'all' ? 'Todos' : CHANNEL_META[ch as ContentChannel].label}
                </button>
              ))}
            </div>
            <div className={s.filterGroup}>
              {statuses.map((st) => (
                <button key={st} type="button"
                  className={`${s.filterBtn} ${statusFilter === st ? s.filterBtnActive : ''}`}
                  onClick={() => setStatusFilter(st)}
                >
                  {st === 'all' ? 'Todos status' : TASK_STATUS_META[st as ContentTaskStatus].label}
                </button>
              ))}
            </div>
          </div>
          <button type="button" className={s.refreshBtn} onClick={onRefresh} title="Atualizar">
            <RiRefreshLine />
          </button>
        </div>

        {tasks.length === 0 ? (
          <div className={s.empty}>Nenhum conteúdo ainda. Use o Content Planner para gerar um calendário.</div>
        ) : sortedDays.length === 0 ? (
          <div className={s.empty}>Nenhuma tarefa para o filtro selecionado.</div>
        ) : (
          sortedDays.map((day) => (
            <div key={day} className={s.dayGroup}>
              <div className={s.dayHeader}>
                {new Date(`${day}T12:00:00`).toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' })}
              </div>
              <div className={s.taskList}>
                {grouped[day].map((task) => (
                  <TaskCard key={task.id} task={task} onRefresh={onRefresh} onPreview={openPreview} />
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {modal && (
        <DraftModal
          task={modal.task}
          draft={modal.draft}
          onClose={() => setModal(null)}
          onRefresh={() => { setModal(null); onRefresh(); }}
        />
      )}
    </>
  );
}
