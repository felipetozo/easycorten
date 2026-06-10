import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { lookupGeo } from '@/lib/geo';

export const dynamic = 'force-dynamic';

const UUID_V4 = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const section = (searchParams.get('section') ?? 'overview').trim();
  const days    = Math.max(1, Math.min(365, parseInt(searchParams.get('days') ?? '30', 10) || 30));
  const vid     = (searchParams.get('visitor_id') ?? '').trim();

  const fromDate = searchParams.get('from') ? new Date(searchParams.get('from')!) : null;
  const toDate   = searchParams.get('to')   ? new Date(searchParams.get('to')!)   : null;
  const since = fromDate && !isNaN(fromDate.getTime()) ? fromDate : new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  const until = toDate   && !isNaN(toDate.getTime())   ? toDate   : new Date();

  try {
    if (section === 'overview') {
      const [totalPv, avg, returning, devices, chart, unique] = await Promise.all([
        prisma.analyticsPageview.count({ where: { createdAt: { gt: since, lte: until } } }),
        prisma.analyticsPageview.aggregate({ _avg: { timeOnPage: true }, where: { createdAt: { gt: since, lte: until }, timeOnPage: { gt: 0 } } }),
        prisma.analyticsVisitor.count({ where: { visitCount: { gt: 1 }, pageviews: { some: { createdAt: { gt: since, lte: until } } } } }),
        prisma.analyticsPageview.groupBy({ by: ['isMobile'], _count: { _all: true }, where: { createdAt: { gt: since, lte: until } } }),
        prisma.$queryRaw<Array<{ day: string; visits: number }>>`
          SELECT to_char(created_at, 'YYYY-MM-DD') AS day, COUNT(*)::int AS visits
            FROM analytics_pageview
           WHERE created_at > ${since} AND created_at <= ${until}
           GROUP BY day ORDER BY day ASC`,
        prisma.$queryRaw<Array<{ n: number }>>`
          SELECT COUNT(DISTINCT visitor_id)::int AS n
            FROM analytics_pageview WHERE created_at > ${since} AND created_at <= ${until}`,
      ]);

      let mobile = 0, desktop = 0;
      for (const d of devices) {
        if (d.isMobile) mobile += d._count._all;
        else desktop += d._count._all;
      }

      return NextResponse.json({ ok: true, total_pageviews: totalPv, unique_visitors: unique[0]?.n ?? 0, avg_time_sec: Math.round(avg._avg.timeOnPage ?? 0), returning, mobile, desktop, chart });
    }

    if (section === 'pages') {
      const rows = await prisma.$queryRaw`
        SELECT path, COUNT(*)::int AS views, COUNT(DISTINCT visitor_id)::int AS visitors, ROUND(AVG(time_on_page))::int AS avg_time
          FROM analytics_pageview
         WHERE created_at > ${since} AND created_at <= ${until}
         GROUP BY path ORDER BY views DESC LIMIT 20`;
      return NextResponse.json({ ok: true, rows });
    }

    if (section === 'referrers') {
      const rows = await prisma.$queryRaw`
        SELECT referrer_src, NULLIF(utm_campaign, '') AS campaign, NULLIF(utm_medium, '') AS medium,
               COUNT(*)::int AS visits, COUNT(DISTINCT visitor_id)::int AS visitors
          FROM analytics_pageview
         WHERE created_at > ${since} AND created_at <= ${until} AND referrer_src <> 'internal'
         GROUP BY referrer_src, utm_campaign, utm_medium ORDER BY visits DESC LIMIT 40`;
      return NextResponse.json({ ok: true, rows });
    }

    if (section === 'landing' || section === 'exit') {
      const order = section === 'landing' ? 'ASC' : 'DESC';
      const rows = await prisma.$queryRawUnsafe(
        `SELECT path, COUNT(*)::int AS hits, COUNT(DISTINCT visitor_id)::int AS visitors, ROUND(AVG(time_on_page))::int AS avg_time
           FROM (
             SELECT DISTINCT ON (session_key) session_key, path, visitor_id, time_on_page
               FROM analytics_pageview
              WHERE created_at > $1 AND created_at <= $2 AND session_key IS NOT NULL AND referrer_src <> 'internal'
              ORDER BY session_key, created_at ${order}
           ) t
          GROUP BY path ORDER BY hits DESC LIMIT 20`,
        since, until,
      );
      return NextResponse.json({ ok: true, rows });
    }

    if (section === 'conversions') {
      const rows = await prisma.$queryRaw`
        SELECT referrer_src, campaign, COUNT(DISTINCT visitor_id)::int AS conversions, COUNT(*)::int AS events
          FROM (
            SELECT e.visitor_id,
                   COALESCE(NULLIF(v.first_referrer_src, ''), (SELECT referrer_src FROM analytics_pageview p WHERE p.visitor_id = v.id AND p.referrer_src <> 'internal' ORDER BY p.created_at ASC LIMIT 1), 'direct') AS referrer_src,
                   COALESCE(NULLIF(v.first_utm_campaign, ''), (SELECT utm_campaign FROM analytics_pageview p WHERE p.visitor_id = v.id AND p.utm_campaign IS NOT NULL ORDER BY p.created_at ASC LIMIT 1)) AS campaign
              FROM analytics_event e JOIN analytics_visitor v ON v.id = e.visitor_id
             WHERE e.created_at > ${since} AND e.created_at <= ${until}
               AND e.event_type IN ('form_submit', 'whatsapp_click', 'cta_click')
          ) t
         GROUP BY referrer_src, campaign ORDER BY conversions DESC LIMIT 40`;
      return NextResponse.json({ ok: true, rows });
    }

    if (section === 'events') {
      const [rows, byType] = await Promise.all([
        prisma.$queryRaw`
          SELECT event_type, event_label, COUNT(*)::int AS total
            FROM analytics_event WHERE created_at > ${since} AND created_at <= ${until}
           GROUP BY event_type, event_label ORDER BY total DESC LIMIT 30`,
        prisma.$queryRaw`
          SELECT event_type, COUNT(*)::int AS total
            FROM analytics_event WHERE created_at > ${since} AND created_at <= ${until}
           GROUP BY event_type ORDER BY total DESC`,
      ]);
      return NextResponse.json({ ok: true, rows, by_type: byType });
    }

    if (section === 'visitors') {
      const rows = await prisma.$queryRaw`
        SELECT v.id, LEFT(v.id, 8) AS visitor_num, v.display_name, v.lead_key, v.visit_count, v.first_seen, v.last_seen,
               COUNT(p.id)::int AS pageviews, ROUND(AVG(p.time_on_page))::int AS avg_time,
               (SELECT path FROM analytics_pageview pv WHERE pv.visitor_id = v.id ORDER BY pv.created_at DESC LIMIT 1) AS last_path,
               (SELECT event_type FROM analytics_event ev WHERE ev.visitor_id = v.id ORDER BY ev.created_at DESC LIMIT 1) AS last_event_type,
               (SELECT event_label FROM analytics_event ev WHERE ev.visitor_id = v.id ORDER BY ev.created_at DESC LIMIT 1) AS last_event_label,
               MAX(CASE WHEN p.is_mobile THEN 'mobile' ELSE 'desktop' END) AS device,
               COALESCE(NULLIF(v.first_referrer_src, 'direct'), (SELECT referrer_src FROM analytics_pageview sub WHERE sub.visitor_id = v.id AND sub.referrer_src NOT IN ('direct', 'internal') ORDER BY sub.created_at ASC LIMIT 1)) AS first_referrer,
               COALESCE(NULLIF(v.first_utm_campaign, ''), (SELECT utm_campaign FROM analytics_pageview sub WHERE sub.visitor_id = v.id AND sub.referrer_src NOT IN ('direct', 'internal') AND sub.utm_campaign IS NOT NULL ORDER BY sub.created_at ASC LIMIT 1)) AS first_campaign
          FROM analytics_visitor v
          JOIN analytics_pageview p ON p.visitor_id = v.id
         WHERE p.created_at > ${since} AND p.created_at <= ${until}
         GROUP BY v.id, v.display_name, v.lead_key, v.visit_count, v.first_seen, v.last_seen
         ORDER BY v.last_seen DESC LIMIT 100`;
      return NextResponse.json({ ok: true, rows });
    }

    if (section === 'visitor_detail') {
      if (!UUID_V4.test(vid)) return NextResponse.json({ ok: false, error: 'invalid visitor_id' }, { status: 400 });

      const v = await prisma.analyticsVisitor.findUnique({ where: { id: vid } });
      if (!v) return NextResponse.json({ ok: false, error: 'not found' }, { status: 404 });

      const [pvs, evs]: [
        { path: string; title: string | null; referrer: string | null; referrerSrc: string | null; utmCampaign: string | null; timeOnPage: number | null; isMobile: boolean; createdAt: Date }[],
        { eventType: string; eventLabel: string | null; eventData: string | null; path: string; createdAt: Date }[]
      ] = await Promise.all([
        prisma.analyticsPageview.findMany({
          where: { visitorId: vid }, orderBy: { createdAt: 'desc' }, take: 200,
          select: { path: true, title: true, referrer: true, referrerSrc: true, utmCampaign: true, timeOnPage: true, isMobile: true, createdAt: true },
        }),
        prisma.analyticsEvent.findMany({
          where: { visitorId: vid }, orderBy: { createdAt: 'desc' }, take: 200,
          select: { eventType: true, eventLabel: true, eventData: true, path: true, createdAt: true },
        }),
      ]);

      return NextResponse.json({
        ok: true,
        visitor: { id: v.id, visitor_num: v.id.slice(0, 8), display_name: v.displayName, lead_key: v.leadKey, visit_count: v.visitCount, first_seen: v.firstSeen, last_seen: v.lastSeen, last_ip: v.lastIp, user_agent: v.userAgent, language: v.language, timezone: v.timezone, screen: v.screen },
        pageviews: pvs.map((p) => ({ path: p.path, title: p.title, referrer: p.referrer, referrer_src: p.referrerSrc, utm_campaign: p.utmCampaign, time_on_page: p.timeOnPage, is_mobile: p.isMobile ? 1 : 0, created_at: p.createdAt })),
        events: evs.map((e) => ({ event_type: e.eventType, event_label: e.eventLabel, event_data: e.eventData, path: e.path, created_at: e.createdAt })),
        geo: lookupGeo(v.lastIp),
      });
    }

    return NextResponse.json({ ok: false, error: 'invalid section' }, { status: 400 });
  } catch (e) {
    console.error('[admin/analytics]', e);
    return NextResponse.json({ ok: false, error: 'DB error' }, { status: 500 });
  }
}
