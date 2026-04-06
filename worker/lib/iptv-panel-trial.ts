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

export type TrialVerificationResult =
  | { ok: true; username: string; status?: string | null; expDate?: string | null; raw: string }
  | { ok: false; message: string; raw?: string | null };

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

export async function verifyIptvTrialCredentials(
  env: Env,
  params: { username: string; password: string },
): Promise<TrialVerificationResult> {
  const apiBase = (env.IPTV_PANEL_API_BASE || '').trim();
  if (!apiBase) {
    return { ok: false, message: 'Panel API base is missing' };
  }

  let playerUrl: URL;
  try {
    const apiUrl = new URL(apiPhpUrl(apiBase));
    playerUrl = new URL('/player_api.php', `${apiUrl.origin}/`);
  } catch {
    return { ok: false, message: 'Panel API base is invalid' };
  }

  playerUrl.searchParams.set('username', params.username);
  playerUrl.searchParams.set('password', params.password);

  const ac = new AbortController();
  const t = setTimeout(() => ac.abort(), FETCH_MS);
  try {
    const res = await fetch(playerUrl.toString(), {
      method: 'GET',
      signal: ac.signal,
      headers: { Accept: 'application/json, text/plain, */*' },
    });
    const text = await res.text();
    if (!res.ok) {
      return { ok: false, message: `Player API HTTP ${res.status}`, raw: text };
    }

    const parsed = interpretTrialVerificationResponse(text, params.username);
    return parsed;
  } catch (e: unknown) {
    const name = e && typeof e === 'object' && 'name' in e ? String((e as { name?: string }).name) : '';
    const msg = name === 'AbortError' ? 'Player API request timed out' : 'Player API unreachable';
    return { ok: false, message: msg };
  } finally {
    clearTimeout(t);
  }
}

export function isLikelyPanelUsernameConflict(message: string): boolean {
  const text = (message || '').trim().toLowerCase();
  if (!text) return false;
  return /exist|duplicate|taken|used|username|login already|already exists/.test(text);
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

function interpretTrialVerificationResponse(text: string, expectedUsername: string): TrialVerificationResult {
  const raw = text.trim();
  if (!raw) {
    return { ok: false, message: 'Empty player API response', raw };
  }

  try {
    const json = JSON.parse(raw) as Record<string, any>;
    const userInfo = (json.user_info && typeof json.user_info === 'object') ? json.user_info as Record<string, any> : null;
    if (!userInfo) {
      return { ok: false, message: 'Missing user_info in player API response', raw };
    }

    const auth = String(userInfo.auth ?? '').trim();
    const username = String(userInfo.username ?? '').trim();
    const status = String(userInfo.status ?? '').trim();
    const expDate = userInfo.exp_date == null ? null : String(userInfo.exp_date).trim();

    if (auth === '1' && username && username.toLowerCase() === expectedUsername.toLowerCase()) {
      return {
        ok: true,
        username,
        status: status || null,
        expDate,
        raw,
      };
    }

    return {
      ok: false,
      message: status || 'Player API did not confirm the created user',
      raw,
    };
  } catch {
    return { ok: false, message: 'Invalid player API response', raw };
  }
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
