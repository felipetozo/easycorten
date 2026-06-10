'use client';

import { useState } from 'react';
import type { ContentProfile, ContentCalendar } from '@/types/content';
import { CHANNEL_META } from '@/types/content';
import { RiCalendarLine, RiSparklingLine, RiTimeLine } from 'react-icons/ri';
import s from './ContentPlannerTab.module.css';

type Props = {
  profile:   ContentProfile | null;
  calendars: ContentCalendar[];
  onGenerated: () => void;
};

type PlanningPeriod = 'day' | 'week' | 'month';

const PERIOD_OPTIONS: { value: PlanningPeriod; label: string; locked: boolean }[] = [
  { value: 'day',   label: '1 dia',     locked: false },
  { value: 'week',  label: '1 semana',  locked: true  },
  { value: 'month', label: '30 dias',   locked: true  },
];

export default function ContentPlannerTab({ profile, calendars, onGenerated }: Props) {
  const [period,    setPeriod]    = useState<PlanningPeriod>('day');
  const [refDate,   setRefDate]   = useState(() => new Date().toISOString().split('T')[0]);
  const [loading,   setLoading]   = useState(false);
  const [result,    setResult]    = useState<{ tasksCreated: number; period: string } | null>(null);
  const [error,     setError]     = useState('');

  const noProfile  = !profile;
  const noChannels = !profile?.activeChannels.length;

  async function handleGenerate() {
    setLoading(true); setError(''); setResult(null);
    try {
      const res = await fetch('/api/agents/content/planner', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ planningPeriod: period, referenceDate: refDate }),
      });
      const data = await res.json() as { ok?: boolean; tasksCreated?: number; period?: string; error?: string };
      if (!res.ok || !data.ok) { setError(data.error ?? 'Erro ao gerar calendário'); return; }
      setResult({ tasksCreated: data.tasksCreated ?? 0, period: data.period ?? '' });
      onGenerated();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  }

  function fmtDate(d: string) {
    return new Date(d).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit' });
  }

  return (
    <div className={s.root}>
      <div className={s.generator}>
        <h3 className={s.genTitle}><RiSparklingLine /> Gerar novo calendário</h3>

        {noProfile && (
          <div className={s.warn}>Configure o perfil da empresa antes de gerar o calendário.</div>
        )}
        {!noProfile && noChannels && (
          <div className={s.warn}>Nenhum canal ativo. Ative ao menos um canal em Configuração.</div>
        )}

        {profile && !noChannels && (
          <div className={s.channelSummary}>
            {profile.activeChannels.map((ch) => {
              const meta = CHANNEL_META[ch];
              const freq = profile.contentFrequency[ch] ?? 0;
              return (
                <span key={ch} className={s.channelChip} style={{ borderColor: meta.color, color: meta.color }}>
                  {meta.label} · {freq}/dia
                </span>
              );
            })}
          </div>
        )}

        <div className={s.controls}>
          <div className={s.controlGroup}>
            <span className={s.controlLabel}>Período</span>
            <div className={s.periodBtns}>
              {PERIOD_OPTIONS.map(({ value, label, locked }) => (
                <button
                  key={value}
                  type="button"
                  className={`${s.periodBtn} ${period === value ? s.periodBtnActive : ''} ${locked ? s.periodBtnLocked : ''}`}
                  onClick={() => !locked && setPeriod(value)}
                  title={locked ? 'Disponível com chave de IA própria' : undefined}
                >
                  {label}
                  {locked && <span className={s.lockIcon}>🔒</span>}
                </button>
              ))}
            </div>
          </div>
          <div className={s.controlGroup}>
            <span className={s.controlLabel}>Data de início</span>
            <input type="date" className={s.dateInput} value={refDate} onChange={(e) => setRefDate(e.target.value)} />
          </div>
          <button
            type="button" className={s.generateBtn}
            onClick={handleGenerate}
            disabled={loading || noProfile || noChannels}
          >
            {loading ? <><RiTimeLine className={s.spin} /> Gerando…</> : <><RiCalendarLine /> Gerar calendário</>}
          </button>
        </div>

        {error  && <div className={s.errorMsg}>{error}</div>}
        {result && (
          <div className={s.successMsg}>
            ✓ Calendário gerado com <strong>{result.tasksCreated}</strong> tarefas para o período <strong>{result.period}</strong>.
            Acesse a aba <em>Criação</em> para ver os conteúdos.
          </div>
        )}
      </div>

      {calendars.length > 0 && (
        <div className={s.history}>
          <h3 className={s.historyTitle}>Calendários anteriores</h3>
          <div className={s.calList}>
            {calendars.map((cal) => (
              <div key={cal.id} className={s.calItem}>
                <div className={s.calPeriod}>
                  <RiCalendarLine />
                  {fmtDate(cal.periodStart)} → {fmtDate(cal.periodEnd)}
                </div>
                <div className={s.calMeta}>
                  <span className={s.calCount}>{cal.tasksCount} tarefas</span>
                  <div className={s.calChannels}>
                    {(cal.channels as string[]).map((ch) => (
                      <span key={ch} className={s.calChannel}>{CHANNEL_META[ch as keyof typeof CHANNEL_META]?.label ?? ch}</span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
