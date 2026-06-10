import 'server-only';

export type GeoInfo = {
  city: string;
  region: string;
  country: string;
  countryCode: string;
  org: string;
};

type GeoLookup = (ip: string) => { country?: string; region?: string; city?: string } | null;
let geoipLookup: GeoLookup | null | undefined;
function getLookup(): GeoLookup | null {
  if (geoipLookup !== undefined) return geoipLookup;
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    geoipLookup = (require('geoip-lite') as { lookup: GeoLookup }).lookup;
  } catch {
    geoipLookup = null;
  }
  return geoipLookup;
}

let countryNames: Intl.DisplayNames | null = null;
function countryName(code: string): string {
  if (!code) return '';
  try {
    countryNames ??= new Intl.DisplayNames(['pt-BR'], { type: 'region' });
    return countryNames.of(code) || code;
  } catch {
    return code;
  }
}

export function lookupGeo(ip: string | null | undefined): GeoInfo | null {
  if (!ip) return null;
  const clean = ip.trim();
  if (
    !clean ||
    clean === '::1' ||
    clean.startsWith('127.') ||
    clean.startsWith('10.') ||
    clean.startsWith('192.168.') ||
    /^172\.(1[6-9]|2\d|3[0-1])\./.test(clean)
  ) {
    return null;
  }

  const lookup = getLookup();
  if (!lookup) return null;

  try {
    const r = lookup(clean);
    if (!r) return null;
    const code = r.country || '';
    return {
      city: r.city || '',
      region: r.region || '',
      country: countryName(code),
      countryCode: code,
      org: '',
    };
  } catch {
    return null;
  }
}
