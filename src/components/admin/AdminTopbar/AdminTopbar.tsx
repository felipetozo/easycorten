'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { BsSearch, BsBell, BsSun, BsMoon, BsGear, BsPerson } from 'react-icons/bs';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import styles from './AdminTopbar.module.css';

type User = { name?: string | null; email?: string | null; image?: string | null };

type Props = {
  user?: User;
  firstName?: string;
  greeting?: string;
};

type SearchResult = { label: string; sub?: string; link: string };

const THEME_KEY = 'ec-admin-theme';

function initial(name: string): string {
  return (name.trim()[0] ?? 'A').toUpperCase();
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Bom dia';
  if (hour < 18) return 'Boa tarde';
  return 'Boa noite';
}

export default function AdminTopbar({ user, firstName, greeting }: Props) {
  const router = useRouter();

  const topbarRef = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = topbarRef.current;
    if (!el) return;
    const apply = () =>
      document.documentElement.style.setProperty('--admin-topbar-h', `${el.offsetHeight}px`);
    apply();
    const ro = new ResizeObserver(apply);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const dayLabel = now
    ? now.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })
    : '';
  const timeLabel = now
    ? now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    : '';

  const resolvedGreeting = greeting ?? getGreeting();
  const resolvedFirstName = firstName ?? (user?.name ?? '').trim().split(/\s+/)[0] ?? '';

  const [isDark, setIsDark] = useState(false);
  useEffect(() => {
    const saved = localStorage.getItem(THEME_KEY);
    setIsDark(saved === 'dark');
  }, []);

  const toggleTheme = useCallback((next: boolean) => {
    setIsDark(next);
    try { localStorage.setItem(THEME_KEY, next ? 'dark' : 'light'); } catch { /* ignore */ }
  }, []);

  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[] | null>(null);
  const searchRef = useRef<HTMLLabelElement | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const q = query.trim();
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (q.length < 2) return;
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/admin/search?q=${encodeURIComponent(q)}`, { credentials: 'same-origin' });
        const data = await res.json();
        if (data.ok) setResults(data.results as SearchResult[]);
      } catch { /* ignore */ }
    }, 220);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [query]);

  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function onDown(e: MouseEvent) {
      const t = e.target as Node;
      if (searchRef.current && !searchRef.current.contains(t)) setResults((r) => (r ? null : r));
      if (notifRef.current && !notifRef.current.contains(t)) setNotifOpen(false);
    }
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, []);

  const displayName = user?.name || user?.email || 'Admin';

  return (
    <header ref={topbarRef} className={styles.topbar}>
      <div className={styles.greeting}>
        <h1 className={styles.hello}>
          {resolvedGreeting}{resolvedFirstName ? `, ${resolvedFirstName}` : ''}
        </h1>
        <p className={styles.sub} suppressHydrationWarning>
          {now ? (
            <>{dayLabel.charAt(0).toUpperCase() + dayLabel.slice(1)} · <strong>{timeLabel}</strong></>
          ) : null}
        </p>
      </div>

      <label className={styles.search} ref={searchRef}>
        <span className={styles.searchIcon}><BsSearch /></span>
        <input
          type="search"
          className={styles.searchInput}
          placeholder="Buscar…"
          autoComplete="off"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Escape') { setQuery(''); setResults(null); (e.target as HTMLInputElement).blur(); } }}
        />
        {results && query.trim().length >= 2 && (
          <div className={styles.searchResults}>
            {results.length === 0 ? (
              <div className={styles.searchEmpty}>Nada encontrado.</div>
            ) : (
              results.map((r, i) => (
                <Link key={i} href={r.link} className={styles.searchItem} onClick={() => setResults(null)}>
                  <span className={styles.searchIco}><BsPerson /></span>
                  <span className={styles.searchTexts}>
                    <span className={styles.searchLabel}>{r.label}</span>
                    {r.sub ? <span className={styles.searchSub}>{r.sub}</span> : null}
                  </span>
                </Link>
              ))
            )}
          </div>
        )}
      </label>

      <div className={styles.tools}>
        <button
          type="button"
          className={styles.themeSwitch}
          role="switch"
          aria-checked={isDark}
          aria-label="Alternar tema claro/escuro"
          title="Tema claro/escuro"
          onClick={() => toggleTheme(!isDark)}
        >
          <span className={`${styles.themeEnd} ${!isDark ? styles.themeEndActive : ''}`}><BsSun /></span>
          <span className={`${styles.themeRail} ${isDark ? styles.themeRailDark : ''}`}>
            <span className={`${styles.themeThumb} ${isDark ? styles.themeThumbDark : ''}`} />
          </span>
          <span className={`${styles.themeEnd} ${isDark ? styles.themeEndActive : ''}`}><BsMoon /></span>
        </button>

        <span className={styles.divider} aria-hidden />

        <button
          type="button"
          className={styles.toolBtn}
          aria-label="Configurações"
          title="Configurações"
          onClick={() => router.push('/admin/configuracoes')}
        >
          <BsGear />
        </button>

        <div className={styles.notif} ref={notifRef}>
          <button
            type="button"
            className={styles.toolBtn}
            aria-label="Notificações"
            aria-haspopup="true"
            aria-expanded={notifOpen}
            onClick={() => setNotifOpen((v) => !v)}
          >
            <BsBell />
          </button>
          {notifOpen && (
            <div className={styles.notifPanel}>
              <div className={styles.notifPanelHead}>
                <span>Notificações</span>
              </div>
              <div className={styles.notifEmpty}>Sem notificações.</div>
            </div>
          )}
        </div>

        <div className={styles.avatar} aria-hidden>
          {user?.image ? (
            <img src={user.image} alt="" className={styles.avatarImg} />
          ) : (
            <span className={styles.avatarFallback}>{initial(displayName)}</span>
          )}
        </div>
      </div>
    </header>
  );
}
