'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { RiCalendarLine, RiArrowDownSLine, RiArrowUpSLine } from 'react-icons/ri';
import s from './DateRangePicker.module.css';

export type DateRange = { from: Date; to: Date };

export type RangeKey =
  | 'this_year'
  | 'this_month'
  | 'this_week'
  | 'last_year'
  | 'last_month'
  | 'last_week'
  | 'custom';

const RANGE_LABELS: Record<RangeKey, string> = {
  this_year:  'Este ano',
  this_month: 'Este mês',
  this_week:  'Esta semana',
  last_year:  'Último ano',
  last_month: 'Último mês',
  last_week:  'Última semana',
  custom:     'Personalizado',
};

const RANGE_ORDER: RangeKey[] = ['this_year', 'this_month', 'this_week', 'last_year', 'last_month', 'last_week', 'custom'];
const DAY_MS = 86_400_000;

function startOfDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function computeRange(key: RangeKey, customFrom: string, customTo: string): DateRange {
  const now = new Date();
  switch (key) {
    case 'this_year':  return { from: new Date(now.getFullYear(), 0, 1), to: now };
    case 'this_month': return { from: new Date(now.getFullYear(), now.getMonth(), 1), to: now };
    case 'this_week': {
      const d = startOfDay(now);
      d.setDate(d.getDate() - d.getDay());
      return { from: d, to: now };
    }
    case 'last_year':  return { from: new Date(now.getTime() - 365 * DAY_MS), to: now };
    case 'last_week':  return { from: new Date(now.getTime() - 7 * DAY_MS), to: now };
    case 'custom': {
      const f = customFrom ? new Date(`${customFrom}T00:00:00`) : null;
      const t = customTo   ? new Date(`${customTo}T23:59:59`)   : null;
      if (f && !isNaN(f.getTime()) && t && !isNaN(t.getTime())) return { from: f, to: t };
      return { from: new Date(now.getTime() - 30 * DAY_MS), to: now };
    }
    case 'last_month':
    default: return { from: new Date(now.getTime() - 30 * DAY_MS), to: now };
  }
}

type Props = {
  onChange: (range: DateRange) => void;
  defaultRangeKey?: RangeKey;
};

export default function DateRangePicker({ onChange, defaultRangeKey = 'last_month' }: Props) {
  const [rangeKey, setRangeKey]     = useState<RangeKey>(defaultRangeKey);
  const [customFrom, setCustomFrom] = useState('');
  const [customTo, setCustomTo]     = useState('');
  const [open, setOpen]             = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const range = useMemo(() => computeRange(rangeKey, customFrom, customTo), [rangeKey, customFrom, customTo]);

  const onChangeRef = useRef(onChange);
  useEffect(() => { onChangeRef.current = onChange; });
  useEffect(() => { onChangeRef.current(range); }, [range]);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [open]);

  return (
    <div className={s.dateSelect} ref={ref}>
      <button
        type="button"
        className={`${s.dateBtn}${open ? ` ${s.dateBtnOpen}` : ''}`}
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <RiCalendarLine className={s.dateIcon} />
        {RANGE_LABELS[rangeKey]}
        {open ? <RiArrowUpSLine className={s.dateChevron} /> : <RiArrowDownSLine className={s.dateChevron} />}
      </button>
      {open && (
        <div className={s.dateMenu} role="listbox" aria-label="Período">
          {RANGE_ORDER.map((k) => (
            <button
              key={k}
              type="button"
              role="option"
              aria-selected={rangeKey === k}
              className={`${s.dateOption}${rangeKey === k ? ` ${s.dateOptionActive}` : ''}`}
              onClick={() => { setRangeKey(k); if (k !== 'custom') setOpen(false); }}
            >
              {RANGE_LABELS[k]}
            </button>
          ))}
          {rangeKey === 'custom' && (
            <div className={s.dateCustom}>
              <label className={s.dateCustomField}>
                <span>De</span>
                <input type="date" value={customFrom} max={customTo || undefined} onChange={(e) => setCustomFrom(e.target.value)} />
              </label>
              <label className={s.dateCustomField}>
                <span>Até</span>
                <input type="date" value={customTo} min={customFrom || undefined} onChange={(e) => setCustomTo(e.target.value)} />
              </label>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
