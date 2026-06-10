'use client';

import { useState } from 'react';
import type { ContentProfile, ContentChannel, ContentFrequency } from '@/types/content';
import { CHANNEL_META } from '@/types/content';
import { RiSaveLine, RiCheckLine, RiMapPinLine, RiLinkedinBoxFill } from 'react-icons/ri';
import { SiBlogger, SiInstagram, SiX, SiFacebook, SiTiktok } from 'react-icons/si';
import s from './ConfiguracaoTab.module.css';

const ALL_CHANNELS: { id: ContentChannel; Icon: React.ComponentType<{ size?: number }> }[] = [
  { id: 'blog',      Icon: SiBlogger    },
  { id: 'instagram', Icon: SiInstagram  },
  { id: 'gmb',       Icon: RiMapPinLine },
  { id: 'twitter',   Icon: SiX          },
  { id: 'linkedin',  Icon: RiLinkedinBoxFill },
  { id: 'facebook',  Icon: SiFacebook   },
  { id: 'tiktok',    Icon: SiTiktok     },
];

const AVAILABLE_CHANNELS: ContentChannel[] = ['blog', 'instagram'];

type Props = { profile: ContentProfile | null; onSaved: (p: ContentProfile) => void };

function tagsFromStr(v: string): string[] {
  return v.split(',').map((t) => t.trim()).filter(Boolean);
}

export default function ConfiguracaoTab({ profile, onSaved }: Props) {
  const [saving, setSaving] = useState(false);
  const [saved,  setSaved]  = useState(false);

  const [name,       setName]       = useState(profile?.name                   ?? 'Easy Corten');
  const [segment,    setSegment]    = useState(profile?.segment                ?? '');
  const [tone,       setTone]       = useState(profile?.tone                   ?? '');
  const [audience,   setAudience]   = useState(profile?.targetAudience         ?? '');
  const [keywords,   setKeywords]   = useState((profile?.brandKeywords         ?? []).join(', '));
  const [avoid,      setAvoid]      = useState((profile?.avoidWords            ?? []).join(', '));
  const [briefing,   setBriefing]   = useState(profile?.briefing               ?? '');
  const [channels,   setChannels]   = useState<ContentChannel[]>(profile?.activeChannels ?? []);
  const [freq,       setFreq]       = useState<ContentFrequency>(profile?.contentFrequency ?? {});
  const [imgStyle,   setImgStyle]   = useState(profile?.imageStyleInstructions ?? '');
  const [brandStyle, setBrandStyle] = useState(profile?.brandStyle             ?? '');
  const [colors,     setColors]     = useState((profile?.brandColors           ?? []).join(', '));
  const [avoidVis,   setAvoidVis]   = useState((profile?.avoidVisuals          ?? []).join(', '));

  function toggleChannel(ch: ContentChannel) {
    setChannels((prev) =>
      prev.includes(ch) ? prev.filter((c) => c !== ch) : [...prev, ch]
    );
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/admin/content/profile', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          name, segment, tone, targetAudience: audience,
          brandKeywords:          tagsFromStr(keywords),
          avoidWords:             tagsFromStr(avoid),
          briefing,
          activeChannels:         channels,
          contentFrequency:       freq,
          imageStyleInstructions: imgStyle,
          brandColors:            tagsFromStr(colors),
          brandStyle,
          avoidVisuals:           tagsFromStr(avoidVis),
        }),
      });
      const data = await res.json() as { ok: boolean; profile: ContentProfile };
      if (data.ok) { onSaved(data.profile); setSaved(true); setTimeout(() => setSaved(false), 3000); }
    } finally { setSaving(false); }
  }

  return (
    <form className={s.form} onSubmit={handleSave}>
      <div className={s.section}>
        <h3 className={s.sectionTitle}>Identidade da marca</h3>
        <div className={s.grid2}>
          <label className={s.field}>
            <span className={s.label}>Nome da empresa</span>
            <input className={s.input} value={name} onChange={(e) => setName(e.target.value)} placeholder="Easy Corten" />
          </label>
          <label className={s.field}>
            <span className={s.label}>Segmento</span>
            <input className={s.input} value={segment} onChange={(e) => setSegment(e.target.value)} placeholder="Aço Corten e estruturas metálicas" />
          </label>
        </div>
        <label className={s.field}>
          <span className={s.label}>Tom de voz</span>
          <input className={s.input} value={tone} onChange={(e) => setTone(e.target.value)} placeholder="Ex: técnico, claro e confiável" />
        </label>
        <label className={s.field}>
          <span className={s.label}>Público-alvo</span>
          <input className={s.input} value={audience} onChange={(e) => setAudience(e.target.value)} placeholder="Arquitetos, construtoras e compradores B2B" />
        </label>
        <label className={s.field}>
          <span className={s.label}>Briefing geral</span>
          <textarea className={s.textarea} rows={4} value={briefing} onChange={(e) => setBriefing(e.target.value)} placeholder="Contexto geral do negócio, diferenciais, produtos principais…" />
        </label>
        <div className={s.grid2}>
          <label className={s.field}>
            <span className={s.label}>Palavras-chave da marca <span className={s.hint}>(separadas por vírgula)</span></span>
            <input className={s.input} value={keywords} onChange={(e) => setKeywords(e.target.value)} placeholder="corten, aço corten, chapas de aço, steel" />
          </label>
          <label className={s.field}>
            <span className={s.label}>Palavras proibidas <span className={s.hint}>(separadas por vírgula)</span></span>
            <input className={s.input} value={avoid} onChange={(e) => setAvoid(e.target.value)} placeholder="barato, frete grátis…" />
          </label>
        </div>
      </div>

      <div className={s.section}>
        <h3 className={s.sectionTitle}>Canais e frequência <span className={s.hint}>(posts por semana)</span></h3>
        <div className={s.channelGrid}>
          {ALL_CHANNELS.map(({ id, Icon }) => {
            const available = AVAILABLE_CHANNELS.includes(id);
            const active    = available && channels.includes(id);
            const qty       = freq[id] ?? 0;
            const meta      = CHANNEL_META[id];
            return (
              <div
                key={id}
                className={`${s.channelRow} ${!available ? s.channelRowDisabled : ''}`}
                style={{
                  borderColor:     active ? meta.color + '55' : 'rgba(0,0,0,0.08)',
                  backgroundColor: active ? meta.bg           : 'rgba(0,0,0,0.015)',
                }}
              >
                <button
                  type="button"
                  className={s.channelToggle}
                  onClick={available ? () => toggleChannel(id) : undefined}
                  disabled={!available}
                >
                  <span className={s.chIcon} style={{ color: active ? meta.color : 'rgba(0,0,0,0.28)' }}>
                    <Icon size={15} />
                  </span>
                  <span className={s.chLabel} style={{ color: active ? meta.color : 'rgba(0,0,0,0.35)' }}>
                    {meta.label}
                  </span>
                </button>
                {available && active && (
                  <div className={s.counter}>
                    <button
                      type="button"
                      className={s.counterBtn}
                      style={{ '--ch-color': meta.color } as React.CSSProperties}
                      onClick={() => setFreq((f) => ({ ...f, [id]: Math.max(0, (f[id] ?? 0) - 1) }))}
                    >−</button>
                    <span className={s.counterVal}>{qty}</span>
                    <button
                      type="button"
                      className={s.counterBtn}
                      style={{ '--ch-color': meta.color } as React.CSSProperties}
                      onClick={() => setFreq((f) => ({ ...f, [id]: (f[id] ?? 0) + 1 }))}
                    >+</button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className={s.section}>
        <h3 className={s.sectionTitle}>Identidade visual <span className={s.hint}>(para geração de imagens)</span></h3>
        <label className={s.field}>
          <span className={s.label}>Instruções de estilo de imagem</span>
          <textarea className={s.textarea} rows={3} value={imgStyle} onChange={(e) => setImgStyle(e.target.value)} placeholder="Fotografias industriais de alta qualidade, luz natural, paleta terrosa e metálica…" />
        </label>
        <div className={s.grid2}>
          <label className={s.field}>
            <span className={s.label}>Estilo visual</span>
            <input className={s.input} value={brandStyle} onChange={(e) => setBrandStyle(e.target.value)} placeholder="Ex: fotorrealista, minimalista, flat illustration" />
          </label>
          <label className={s.field}>
            <span className={s.label}>Cores da marca <span className={s.hint}>(hex separados por vírgula)</span></span>
            <input className={s.input} value={colors} onChange={(e) => setColors(e.target.value)} placeholder="#BA4818, #8B2A0A, #F5F0EB" />
          </label>
        </div>
        <label className={s.field}>
          <span className={s.label}>Evitar visuais <span className={s.hint}>(separados por vírgula)</span></span>
          <input className={s.input} value={avoidVis} onChange={(e) => setAvoidVis(e.target.value)} placeholder="rostos de pessoas, ambientes sujos, concorrentes…" />
        </label>
      </div>

      <div className={s.actions}>
        <button type="submit" className={s.saveBtn} disabled={saving}>
          {saved ? <><RiCheckLine /> Salvo</> : saving ? 'Salvando…' : <><RiSaveLine /> Salvar configurações</>}
        </button>
      </div>
    </form>
  );
}
