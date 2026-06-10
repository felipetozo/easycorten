export type ContentChannel = 'blog' | 'instagram' | 'gmb' | 'twitter' | 'linkedin' | 'facebook' | 'tiktok';

export type ContentFormat =
  | 'artigo'
  | 'post'
  | 'carrossel'
  | 'reels'
  | 'tweet'
  | 'thread'
  | 'gmb_post'
  | 'gmb_offer'
  | 'linkedin_post'
  | 'facebook_post'
  | 'tiktok_script';

export type ContentTaskStatus =
  | 'pending'
  | 'research_done'
  | 'writing_done'
  | 'pending_approval'
  | 'approved'
  | 'published'
  | 'publish_error';

export type ContentDraftType =
  | 'research_brief'
  | 'blog_post'
  | 'caption'
  | 'tweet'
  | 'linkedin_post'
  | 'facebook_post'
  | 'tiktok_script'
  | 'gmb_post';

export type ContentDraftStatus =
  | 'draft'
  | 'ready_for_writer'
  | 'pending_approval'
  | 'approved'
  | 'rejected';

export type ContentFrequency = Partial<Record<ContentChannel, number>>;

export type CmsConfig = {
  platform: 'wordpress' | 'webflow' | 'ghost' | 'custom';
  api_url:  string;
  api_key:  string;
  author_id?: string;
  default_category_id?: string;
  default_status?: 'publish' | 'draft';
};

export type ContentProfile = {
  id:                    string;
  name:                  string;
  segment:               string | null;
  tone:                  string | null;
  targetAudience:        string | null;
  brandKeywords:         string[];
  avoidWords:            string[];
  briefing:              string | null;
  activeChannels:        ContentChannel[];
  contentFrequency:      ContentFrequency;
  cmsConfig:             CmsConfig | null;
  imageStyleInstructions: string | null;
  brandColors:           string[];
  brandStyle:            string | null;
  avoidVisuals:          string[];
  createdAt:             string;
  updatedAt:             string;
};

export type ContentCalendar = {
  id:          string;
  profileId:   string;
  periodStart: string;
  periodEnd:   string;
  channels:    ContentChannel[];
  tasksCount:  number;
  status:      'active' | 'archived';
  createdAt:   string;
};

export type ContentTask = {
  id:           string;
  profileId:    string;
  calendarId:   string | null;
  channel:      ContentChannel;
  format:       ContentFormat;
  theme:        string;
  brief:        string;
  scheduledFor: string;
  status:       ContentTaskStatus;
  publishedUrl: string | null;
  errorLog:     string | null;
  createdBy:    string;
  createdAt:    string;
  updatedAt:    string;
  drafts?:      ContentDraft[];
};

export type ContentDraft = {
  id:        string;
  taskId:    string;
  profileId: string;
  agent:     string;
  type:      ContentDraftType;
  content:   string;
  metadata:  Record<string, unknown> | null;
  status:    ContentDraftStatus;
  createdAt: string;
  updatedAt: string;
};

// ─── Display helpers ──────────────────────────────────────────────────────────

export const CHANNEL_META: Record<ContentChannel, { label: string; color: string; bg: string }> = {
  blog:      { label: 'Blog',               color: '#6366f1', bg: 'rgba(99,102,241,0.08)'  },
  instagram: { label: 'Instagram',          color: '#E4405F', bg: 'rgba(228,64,95,0.07)'   },
  gmb:       { label: 'Google Meu Negócio', color: '#34A853', bg: 'rgba(52,168,83,0.08)'   },
  twitter:   { label: 'Twitter / X',        color: '#000000', bg: 'rgba(0,0,0,0.05)'        },
  linkedin:  { label: 'LinkedIn',           color: '#0A66C2', bg: 'rgba(10,102,194,0.08)'  },
  facebook:  { label: 'Facebook',           color: '#1877F2', bg: 'rgba(24,119,242,0.08)'  },
  tiktok:    { label: 'TikTok',             color: '#EE1D52', bg: 'rgba(238,29,82,0.07)'   },
};

export const TASK_STATUS_META: Record<ContentTaskStatus, { label: string; color: string }> = {
  pending:          { label: 'Pendente',             color: 'rgba(156, 163, 175, 1)' },
  research_done:    { label: 'Pesquisa pronta',      color: 'rgba(245, 158, 11, 1)'  },
  writing_done:     { label: 'Texto pronto',         color: 'rgba(139, 92, 246, 1)'  },
  pending_approval: { label: 'Aguardando aprovação', color: 'rgba(99, 102, 241, 1)'  },
  approved:         { label: 'Aprovado',             color: 'rgba(16, 185, 129, 1)'  },
  published:        { label: 'Publicado',            color: 'rgba(5, 150, 105, 1)'   },
  publish_error:    { label: 'Erro na publicação',   color: 'rgba(239, 68, 68, 1)'   },
};
