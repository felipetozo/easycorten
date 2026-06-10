'use client';

import { useCallback, useEffect, useState } from 'react';
import type { ContentProfile, ContentCalendar, ContentTask } from '@/types/content';
import ConfiguracaoTab    from '@/components/admin/content/ConfiguracaoTab/ConfiguracaoTab';
import ContentPlannerTab  from '@/components/admin/content/ContentPlannerTab/ContentPlannerTab';
import ContentCreationTab from '@/components/admin/content/ContentCreationTab/ContentCreationTab';
import { RiSettings3Line, RiCalendarLine, RiFileTextLine } from 'react-icons/ri';
import s from './conteudo.module.css';

type Tab = 'configuracao' | 'planner' | 'criacao';

const TABS: { id: Tab; label: string; Icon: React.ComponentType<{ size?: number }> }[] = [
  { id: 'configuracao', label: 'Configuração',    Icon: RiSettings3Line },
  { id: 'planner',      label: 'Content Planner', Icon: RiCalendarLine  },
  { id: 'criacao',      label: 'Content Creation', Icon: RiFileTextLine  },
];

export default function ConteudoPage() {
  const [tab,       setTab]       = useState<Tab>('configuracao');
  const [profile,   setProfile]   = useState<ContentProfile | null>(null);
  const [calendars, setCalendars] = useState<ContentCalendar[]>([]);
  const [tasks,     setTasks]     = useState<ContentTask[]>([]);
  const [loading,   setLoading]   = useState(true);

  const fetchProfile = useCallback(async () => {
    const res  = await fetch('/api/admin/content/profile');
    const data = await res.json() as { ok: boolean; profile: ContentProfile | null };
    if (data.ok) setProfile(data.profile);
  }, []);

  const fetchTasks = useCallback(async () => {
    const res  = await fetch('/api/admin/content/tasks');
    const data = await res.json() as { ok: boolean; tasks: ContentTask[] };
    if (data.ok) setTasks(data.tasks);
  }, []);

  const fetchCalendars = useCallback(async () => {
    const res  = await fetch('/api/admin/content/calendars');
    const data = await res.json() as { ok: boolean; calendars: ContentCalendar[] };
    if (data.ok) setCalendars(data.calendars);
  }, []);

  useEffect(() => {
    Promise.all([fetchProfile(), fetchTasks(), fetchCalendars()]).finally(() => setLoading(false));
  }, [fetchProfile, fetchTasks, fetchCalendars]);

  function handleProfileSaved(p: ContentProfile) { setProfile(p); }

  function handleGenerated() {
    fetchTasks();
    fetchCalendars();
    setTimeout(() => setTab('criacao'), 600);
  }

  function handleRefresh() { fetchTasks(); }

  return (
    <div className={s.page}>
      <div className={s.header}>
        <h1 className={s.title}>Conteúdo</h1>
        <p className={s.subtitle}>Configuração, planejamento e criação com IA</p>
      </div>

      <div className={s.tabs}>
        {TABS.map(({ id, label, Icon }) => (
          <button key={id} type="button"
            className={`${s.tab} ${tab === id ? s.tabActive : ''}`}
            onClick={() => setTab(id)}
          >
            <Icon size={15} />
            {label}
            {id === 'criacao' && tasks.length > 0 && (
              <span className={s.tabBadge}>{tasks.filter((t) => t.status === 'pending' || t.status === 'writing_done').length || null}</span>
            )}
          </button>
        ))}
      </div>

      <div className={s.body}>
        {loading ? (
          <div className={s.loading}>Carregando…</div>
        ) : (
          <>
            {tab === 'configuracao' && (
              <ConfiguracaoTab profile={profile} onSaved={handleProfileSaved} />
            )}
            {tab === 'planner' && (
              <ContentPlannerTab profile={profile} calendars={calendars} onGenerated={handleGenerated} />
            )}
            {tab === 'criacao' && (
              <ContentCreationTab tasks={tasks} onRefresh={handleRefresh} />
            )}
          </>
        )}
      </div>
    </div>
  );
}
