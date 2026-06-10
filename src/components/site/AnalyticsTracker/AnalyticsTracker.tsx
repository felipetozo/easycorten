'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

const API_URL    = '/api/analytics/track';
const VISITOR_KEY = '_ec_id';
const SESSION_KEY = '_ec_sk';

function uuid4(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });
}

function getVisitorId(): string {
  try {
    let id = localStorage.getItem(VISITOR_KEY);
    if (!id) { id = uuid4(); localStorage.setItem(VISITOR_KEY, id); }
    return id;
  } catch { return uuid4(); }
}

function getSessionKey(): string {
  try {
    let sk = sessionStorage.getItem(SESSION_KEY);
    if (!sk) { sk = Math.random().toString(36).slice(2) + Date.now().toString(36); sessionStorage.setItem(SESSION_KEY, sk); }
    return sk;
  } catch { return Math.random().toString(36).slice(2); }
}

function referrerDomain(ref: string): string {
  if (!ref) return '';
  try { return new URL(ref).hostname.toLowerCase().replace(/^www\./, ''); } catch { return ''; }
}

function getUtmParams() {
  try {
    const p = new URLSearchParams(window.location.search);
    return { utm_source: p.get('utm_source') || '', utm_medium: p.get('utm_medium') || '', utm_campaign: p.get('utm_campaign') || '', utm_content: p.get('utm_content') || '', utm_term: p.get('utm_term') || '' };
  } catch { return { utm_source: '', utm_medium: '', utm_campaign: '', utm_content: '', utm_term: '' }; }
}

function getAdClick(): { ad_click_id: string; ad_click_source: string } {
  try {
    const p = new URLSearchParams(window.location.search);
    const candidates: Array<[string, string]> = [
      ['gclid', 'google'], ['gbraid', 'google'], ['wbraid', 'google'],
      ['fbclid', 'facebook'], ['msclkid', 'microsoft'], ['ttclid', 'tiktok'],
    ];
    for (const [param, source] of candidates) {
      const value = p.get(param);
      if (value) return { ad_click_id: value.slice(0, 255), ad_click_source: source };
    }
  } catch { /* noop */ }
  return { ad_click_id: '', ad_click_source: '' };
}

function send(payload: Record<string, unknown>) {
  try {
    const body = JSON.stringify(payload);
    if (navigator.sendBeacon) {
      navigator.sendBeacon(API_URL, new Blob([body], { type: 'application/json' }));
    } else {
      fetch(API_URL, { method: 'POST', body, headers: { 'Content-Type': 'application/json' }, keepalive: true }).catch(() => {});
    }
  } catch { /* noop */ }
}

export default function AnalyticsTracker() {
  const pathname = usePathname() || '/';
  const pageStartRef = useRef<number>(Date.now());
  const lastPathRef  = useRef<string>('');
  const lastUrlRef   = useRef<string>('');

  useEffect(() => {
    if (!pathname || pathname.includes('/admin')) return;

    const visitorId  = getVisitorId();
    const sessionKey = getSessionKey();
    const referrer   = lastUrlRef.current || document.referrer || '';
    const utm = getUtmParams();
    const ad  = getAdClick();

    send({
      type: 'pageview', visitor_id: visitorId, session_key: sessionKey,
      path: pathname, title: document.title, referrer, referrer_domain: referrerDomain(referrer),
      is_mobile: /Mobi|Android/i.test(navigator.userAgent),
      language: (navigator.language || '').slice(0, 20),
      timezone: (Intl.DateTimeFormat().resolvedOptions().timeZone || '').slice(0, 64),
      screen: typeof screen !== 'undefined' ? `${screen.width}x${screen.height}` : '',
      utm_source: utm.utm_source, utm_medium: utm.utm_medium, utm_campaign: utm.utm_campaign,
      utm_content: utm.utm_content, utm_term: utm.utm_term,
      ad_click_id: ad.ad_click_id, ad_click_source: ad.ad_click_source,
    });

    pageStartRef.current = Date.now();
    lastPathRef.current  = pathname;
    lastUrlRef.current   = window.location.href;

    const flushTime = () => {
      const seconds = Math.round((Date.now() - pageStartRef.current) / 1000);
      if (seconds > 0 && lastPathRef.current) {
        send({ type: 'time', visitor_id: visitorId, session_key: sessionKey, path: lastPathRef.current, seconds });
      }
    };

    window.addEventListener('pagehide', flushTime);
    return () => { window.removeEventListener('pagehide', flushTime); flushTime(); };
  }, [pathname]);

  useEffect(() => {
    const track = (eventType: string, label: string, dataObj: Record<string, unknown>) => {
      if (window.location.pathname.includes('/admin')) return;
      send({ type: 'event', visitor_id: getVisitorId(), session_key: getSessionKey(), event_type: eventType, event_label: (label || '').trim().slice(0, 80), event_data: dataObj || {}, path: window.location.pathname });
    };

    const onClick = (e: MouseEvent) => {
      const target = e.target as Element | null;
      if (!target || typeof target.closest !== 'function') return;
      const anchor = target.closest('a') as HTMLAnchorElement | null;
      const href   = anchor?.getAttribute('href') || '';

      if (anchor && /wa\.me|whatsapp/i.test(href)) { track('whatsapp_click', 'WhatsApp', { href }); return; }

      const cta = target.closest('[data-track-cta], .cta-btn, .btn-primary') as HTMLElement | null;
      if (cta) { track('cta_click', cta.getAttribute('data-track-cta') || (cta.textContent || '').trim().slice(0, 80), {}); return; }

      if (anchor && anchor.closest('header, nav, [class*="menu"]')) {
        track('nav_click', (anchor.textContent || '').trim().slice(0, 80), { href });
      }
    };

    const onSubmit = (e: Event) => {
      const form = e.target as HTMLElement | null;
      if (!form || form.tagName !== 'FORM') return;
      const label = form.id || form.getAttribute('name') || (form as HTMLFormElement).className || 'form';
      track('form_submit', String(label).trim().slice(0, 80), {});
    };

    document.addEventListener('click', onClick, true);
    document.addEventListener('submit', onSubmit, true);
    return () => { document.removeEventListener('click', onClick, true); document.removeEventListener('submit', onSubmit, true); };
  }, []);

  return null;
}
