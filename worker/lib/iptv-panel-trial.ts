import type { Env } from '../index';

const FETCH_MS = 12_000;

export function iptvPanelTrialConfigured(env: Env): boolean {
  const base = (env.IPTV_PANEL_API_BASE || '').trim();
  const key = (env.IPTV_PANEL_API_KEY || '').trim();
  const pkg = (env.IPTV_PANEL_TRIAL_PACKAGE || '').trim();
  return Boolean(base && key && pkg);
}

export function apiPhpUrl(base: string): string {
  const b = base.trim().replace(/\/+$/, '');
  if (/\/api\.php$/i.test(b)) return b;
  return `${b}/api.php`;
}

export type PanelTrialResult =
  | { ok: true }
  | { ok: false; message: string };

export async function createIptvPanelTrial(
  env: Env,
  params: { username: string; password: string },
): Promise<PanelTrialResult> {
  const base = (env.IPTV_PANEL_API_BASE || '').trim();
  const apiKey = env.IPTV_PANEL_API_KEY || '';
  const packageCode = (env.IPTV_PANEL_TRIAL_PACKAGE || '').trim();
  const expRaw = (env.IPTV_PANEL_TRIAL_EXP_DAYS || '1.5').trim();

  const url = new URL(apiPhpUrl(base));
  url.searchParams.set('action', 'create_user_trial');
  url.searchParams.set('api_key', apiKey);
  url.searchParams.set('username', params.username);
  url.searchParams.set('password', params.password);
  url.searchParams.set('package_code', packageCode);
  url.searchParams.set('exp_days', expRaw);

  const ac = new AbortController();
  const t = setTimeout(() => ac.abort(), FETCH_MS);
  try {
    const res = await fetch(url.toString(), {
      method: 'GET',
      signal: ac.signal,
      headers: { Accept: 'application/json, text/plain, */*' },
    });
    const text = await res.text();
    if (!res.ok) {
      return { ok: false, message: `Panel HTTP ${res.status}` };
    }
    return interpretPanelTrialResponse(text);
  } catch (e: unknown) {
    const name = e && typeof e === 'object' && 'name' in e ? String((e as { name?: string }).name) : '';
    const msg = name === 'AbortError' ? 'Panel request timed out' : 'Panel unreachable';
    return { ok: false, message: msg };
  } finally {
    clearTimeout(t);
  }
}

function interpretPanelTrialResponse(text: string): PanelTrialResult {
  const t = text.trim();
  if (!t) return { ok: false, message: 'Empty panel response' };

  if (/^1$|^true$|^ok$|^success$/i.test(t)) return { ok: true };

  try {
    const j = JSON.parse(t) as Record<string, unknown>;
    const err = j.error;
    if (err !== undefined && err !== null && err !== false && String(err).toLowerCase() !== 'false') {
      return { ok: false, message: String(err) };
    }
    const msg = j.message;
    if (typeof msg === 'string' && /fail|error|invalid|exist|denied/i.test(msg)) {
      return { ok: false, message: msg };
    }
    const r = j.result;
    if (r === true || r === 1 || r === '1') return { ok: true };
    const st = j.status;
    if (st === true || st === 1 || st === '1' || String(st).toLowerCase() === 'true') return { ok: true };
    if (String(st).toLowerCase() === 'success') return { ok: true };
    if (j.success === true || j.success === 1 || j.success === '1') return { ok: true };
    if (typeof j.username === 'string' && j.username.length > 0 && typeof j.password === 'string') {
      return { ok: true };
    }
    if (st === false || r === false || j.success === false) {
      return { ok: false, message: typeof msg === 'string' ? msg : 'Panel rejected trial' };
    }
  } catch {
    // not JSON
  }

  if (/fail|error|invalid|denied/i.test(t)) {
    return { ok: false, message: 'Panel error' };
  }

  return { ok: false, message: 'Unable to confirm trial creation' };
}

/** M3U Plus playlist URL for apps that use a single line (optional in emails). */
export function m3uPlusPlaylistUrl(env: Env, username: string, password: string): string | null {
  const custom = (env.IPTV_PANEL_M3U_BASE || '').trim();
  if (custom) {
    const base = custom.replace(/\/+$/, '');
    const join = base.includes('?') ? '&' : '?';
    return `${base}${join}username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}&type=m3u_plus`;
  }
  const apiBase = (env.IPTV_PANEL_API_BASE || '').trim();
  if (!apiBase) return null;
  try {
    const u = new URL(apiPhpUrl(apiBase));
    return `${u.origin}/get.php?username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}&type=m3u_plus`;
  } catch {
    return null;
  }
}
