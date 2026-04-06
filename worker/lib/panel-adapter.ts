import type { Env } from '../index';
import { createIptvPanelTrial, iptvPanelTrialConfigured } from './iptv-panel-trial';

export type PanelAccountRequest = {
  username: string;
  password: string;
  packageCode?: string | null;
  maxConnections?: number | null;
  durationDays?: number | null;
  bouquetIds?: string[] | null;
  countryPreference?: string | null;
  existingUsername?: string | null;
};

export type PanelActionResult =
  | {
      ok: true;
      action: 'create_trial' | 'create_paid' | 'extend_paid' | 'lookup_existing';
      provider: 'trial_api' | 'xui_admin_api' | 'queued_local_placeholder';
      message?: string;
      username?: string;
      password?: string;
      panelId?: string | null;
      panelRaw?: string | null;
    }
  | {
      ok: false;
      action: 'create_trial' | 'create_paid' | 'extend_paid' | 'lookup_existing';
      provider: 'trial_api' | 'xui_admin_api' | 'queued_local_placeholder';
      message: string;
      retryable?: boolean;
      panelId?: string | null;
      panelRaw?: string | null;
    };

export interface PanelAdapter {
  isConfigured(): boolean;
  isTrialConfigured(): boolean;
  isAdminConfigured(): boolean;
  createTrial(request: PanelAccountRequest): Promise<PanelActionResult>;
  createPaidAccount(request: PanelAccountRequest): Promise<PanelActionResult>;
  extendExistingAccount(request: PanelAccountRequest): Promise<PanelActionResult>;
  lookupExistingAccount(request: { username: string }): Promise<PanelActionResult>;
}

class CurrentPanelAdapter implements PanelAdapter {
  constructor(private readonly env: Env) {}

  isConfigured(): boolean {
    return this.isTrialConfigured() || this.isAdminConfigured();
  }

  isTrialConfigured(): boolean {
    return iptvPanelTrialConfigured(this.env);
  }

  isAdminConfigured(): boolean {
    return this.adminConfigured();
  }

  async createTrial(request: PanelAccountRequest): Promise<PanelActionResult> {
    const result = await createIptvPanelTrial(this.env, {
      username: request.username,
      password: request.password,
    });

    if (result.ok) {
      return {
        ok: true,
        action: 'create_trial',
        provider: 'trial_api',
        username: request.username,
        password: request.password,
      };
    }

    return {
      ok: false,
      action: 'create_trial',
      provider: 'trial_api',
      message: result.message,
      retryable: /timeout|unreachable|http 5/i.test(result.message),
    };
  }

  async createPaidAccount(request: PanelAccountRequest): Promise<PanelActionResult> {
    if (!this.adminConfigured()) {
      return this.placeholderFailure('create_paid', `Paid panel account creation is not configured${request.packageCode ? ` for ${request.packageCode}` : ''}.`);
    }
    return this.callAdminAction('create_paid', 'create_line', request);
  }

  async extendExistingAccount(request: PanelAccountRequest): Promise<PanelActionResult> {
    if (!this.adminConfigured()) {
      return this.placeholderFailure('extend_paid', `Paid panel renewal is not configured${request.existingUsername ? ` for ${request.existingUsername}` : ''}.`);
    }

    const lookup = await this.lookupExistingAccount({ username: request.existingUsername || request.username });
    if (!lookup.ok) {
      return {
        ok: false,
        action: 'extend_paid',
        provider: lookup.provider,
        message: lookup.message,
        retryable: lookup.retryable,
        panelRaw: lookup.panelRaw,
      };
    }

    const payload = {
      ...request,
      username: request.existingUsername || request.username,
      existingUsername: request.existingUsername || request.username,
      packageCode: request.packageCode,
      panelId: lookup.panelId || null,
    };
    return this.callAdminAction('extend_paid', 'edit_line', payload);
  }

  async lookupExistingAccount(request: { username: string }): Promise<PanelActionResult> {
    if (!this.adminConfigured()) {
      return this.placeholderFailure('lookup_existing', `Panel lookup is not configured for ${request.username}.`);
    }

    const attempts = [
      { action: 'get_user', params: { username: request.username } },
      { action: 'get_line', params: { username: request.username } },
      { action: 'get_users', params: { search: request.username } },
      { action: 'get_lines', params: { search: request.username } },
    ];

    let lastFailure: PanelActionResult | null = null;
    for (const attempt of attempts) {
      const result = await this.fetchAdmin(attempt.action, attempt.params);
      if (!result.ok) {
        lastFailure = result;
        continue;
      }
      const parsed = parseLookupResponse(result.text, request.username);
      if (parsed.ok) {
        return parsed;
      }
      lastFailure = parsed;
    }

    return lastFailure || this.placeholderFailure('lookup_existing', `Panel lookup failed for ${request.username}.`);
  }

  private adminConfigured(): boolean {
    return Boolean(
      (this.env.IPTV_PANEL_ADMIN_BASE || '').trim() &&
      (this.env.IPTV_PANEL_ADMIN_ACCESS_CODE || '').trim() &&
      (this.env.IPTV_PANEL_ADMIN_API_KEY || '').trim()
    );
  }

  private placeholderFailure(action: PanelActionResult['action'], message: string): PanelActionResult {
    return {
      ok: false,
      action,
      provider: 'queued_local_placeholder',
      message,
      retryable: false,
    };
  }

  private async callAdminAction(
    action: PanelActionResult['action'],
    remoteAction: string,
    request: Record<string, unknown>,
  ): Promise<PanelActionResult> {
    const params = buildAdminPayload(remoteAction, request);
    const response = await this.fetchAdmin(remoteAction, params, true);
    if (!response.ok) {
      return {
        ok: false,
        action,
        provider: 'xui_admin_api',
        message: response.message,
        retryable: response.retryable,
        panelRaw: response.text,
      };
    }

    const parsed = parseMutationResponse(action, response.text, request);
    return parsed;
  }

  private async fetchAdmin(
    action: string,
    params: Record<string, unknown>,
    isPost = false,
  ): Promise<{ ok: true; text: string } | { ok: false; text: string | null; message: string; retryable: boolean }> {
    const url = buildAdminUrl(this.env, action);
    const body = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      if (value === undefined || value === null || value === '') continue;
      body.set(key, typeof value === 'string' ? value : JSON.stringify(value));
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    try {
      const response = await fetch(url, {
        method: isPost ? 'POST' : 'POST',
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json, text/plain, */*',
        },
        body: body.toString(),
      });
      const text = await response.text();
      if (!response.ok) {
        return {
          ok: false,
          text,
          message: `Panel HTTP ${response.status}`,
          retryable: response.status >= 500,
        };
      }
      return { ok: true, text };
    } catch (error: any) {
      return {
        ok: false,
        text: null,
        message: error?.name === 'AbortError' ? 'Panel request timed out' : 'Panel unreachable',
        retryable: true,
      };
    } finally {
      clearTimeout(timeout);
    }
  }
}

export function getPanelAdapter(env: Env): PanelAdapter {
  return new CurrentPanelAdapter(env);
}

function buildAdminUrl(env: Env, action: string): string {
  const base = (env.IPTV_PANEL_ADMIN_BASE || '').trim().replace(/\/+$/, '');
  const accessCode = (env.IPTV_PANEL_ADMIN_ACCESS_CODE || '').trim().replace(/^\/+|\/+$/g, '');
  const apiKey = (env.IPTV_PANEL_ADMIN_API_KEY || '').trim();
  const url = new URL(`${base}/${accessCode}/`);
  url.searchParams.set('api_key', apiKey);
  url.searchParams.set('action', action);
  return url.toString();
}

function buildAdminPayload(action: string, request: Record<string, unknown>): Record<string, unknown> {
  const payload: Record<string, unknown> = {
    username: request.username,
    password: request.password,
  };

  if (request.maxConnections) payload.max_connections = request.maxConnections;
  if (request.durationDays) payload.exp_date = `${request.durationDays}days`;
  if (request.packageCode) payload.package_code = request.packageCode;
  if (Array.isArray(request.bouquetIds) && request.bouquetIds.length > 0) {
    payload.bouquets_selected = request.bouquetIds;
  }
  if (request.panelId) payload.id = request.panelId;

  if (action === 'edit_line' && request.existingUsername) {
    payload.username = request.existingUsername;
  }

  return payload;
}

function parseMutationResponse(
  action: PanelActionResult['action'],
  text: string,
  request: Record<string, unknown>,
): PanelActionResult {
  const raw = (text || '').trim();
  if (!raw) {
    return {
      ok: false,
      action,
      provider: 'xui_admin_api',
      message: 'Empty panel response',
      retryable: true,
      panelRaw: raw,
    };
  }

  if (/^1$|^true$|^ok$|^success$/i.test(raw)) {
    return {
      ok: true,
      action,
      provider: 'xui_admin_api',
      username: String(request.username || request.existingUsername || ''),
      password: typeof request.password === 'string' ? request.password : undefined,
      panelRaw: raw,
    };
  }

  try {
    const json = JSON.parse(raw) as Record<string, unknown>;
    const failure = normalizePanelFailure(json);
    if (failure) {
      return {
        ok: false,
        action,
        provider: 'xui_admin_api',
        message: failure,
        retryable: /timeout|unreachable|temporar|busy|try again/i.test(failure),
        panelRaw: raw,
      };
    }

    return {
      ok: true,
      action,
      provider: 'xui_admin_api',
      username: String(json.username || request.username || request.existingUsername || ''),
      password: typeof json.password === 'string' ? json.password : (typeof request.password === 'string' ? request.password : undefined),
      panelId: firstTruthyString(json.id, json.user_id, json.line_id),
      panelRaw: raw,
    };
  } catch {
    if (/fail|error|invalid|denied/i.test(raw)) {
      return {
        ok: false,
        action,
        provider: 'xui_admin_api',
        message: raw,
        retryable: false,
        panelRaw: raw,
      };
    }
  }

  return {
    ok: true,
    action,
    provider: 'xui_admin_api',
    username: String(request.username || request.existingUsername || ''),
    password: typeof request.password === 'string' ? request.password : undefined,
    panelRaw: raw,
  };
}

function parseLookupResponse(text: string, expectedUsername: string): PanelActionResult {
  const raw = (text || '').trim();
  if (!raw) {
    return {
      ok: false,
      action: 'lookup_existing',
      provider: 'xui_admin_api',
      message: 'Empty panel lookup response',
      retryable: true,
      panelRaw: raw,
    };
  }

  try {
    const json = JSON.parse(raw);
    const matched = extractLookupRecord(json, expectedUsername);
    if (matched) {
      return {
        ok: true,
        action: 'lookup_existing',
        provider: 'xui_admin_api',
        username: matched.username || expectedUsername,
        password: matched.password || undefined,
        panelId: matched.id || null,
        panelRaw: raw,
      };
    }
    const failure = typeof json === 'object' && json ? normalizePanelFailure(json as Record<string, unknown>) : null;
    return {
      ok: false,
      action: 'lookup_existing',
      provider: 'xui_admin_api',
      message: failure || `Panel user ${expectedUsername} was not found`,
      retryable: false,
      panelRaw: raw,
    };
  } catch {
    return {
      ok: false,
      action: 'lookup_existing',
      provider: 'xui_admin_api',
      message: `Unable to parse panel lookup response for ${expectedUsername}`,
      retryable: true,
      panelRaw: raw,
    };
  }
}

function extractLookupRecord(value: unknown, expectedUsername: string): { id: string | null; username: string | null; password: string | null } | null {
  const queue: unknown[] = [value];
  while (queue.length > 0) {
    const current = queue.shift();
    if (!current) continue;
    if (Array.isArray(current)) {
      queue.push(...current);
      continue;
    }
    if (typeof current !== 'object') continue;
    const obj = current as Record<string, unknown>;
    const username = firstTruthyString(obj.username, obj.user_name, obj.line_username);
    const id = firstTruthyString(obj.id, obj.user_id, obj.line_id);
    const password = firstTruthyString(obj.password, obj.pass, obj.line_password);
    if (username && username.toLowerCase() === expectedUsername.toLowerCase()) {
      return { id, username, password };
    }
    for (const nested of Object.values(obj)) {
      if (nested && typeof nested === 'object') queue.push(nested);
    }
  }
  return null;
}

function normalizePanelFailure(json: Record<string, unknown>): string | null {
  const candidates = [
    json.error,
    json.message,
    json.msg,
    json.detail,
    json.status,
  ]
    .map((value) => (value == null ? '' : String(value).trim()))
    .filter(Boolean);

  for (const candidate of candidates) {
    if (/fail|error|invalid|denied|not found|missing/i.test(candidate)) {
      return candidate;
    }
  }

  if (json.success === false || json.result === false) {
    return candidates[0] || 'Panel rejected request';
  }

  return null;
}

function firstTruthyString(...values: unknown[]): string | null {
  for (const value of values) {
    if (value == null) continue;
    const text = String(value).trim();
    if (text) return text;
  }
  return null;
}
