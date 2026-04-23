import { generateUniqueCredentials, sendCredentialsEmail } from '../email';
import { getStorage } from '../helpers';
import type { Env } from '../index';
import type { Order, ProvisioningJob } from '../../shared/schema';
import { variantsForRealProductId } from '../../shared/real-product-id';
import { getPanelAdapter } from './panel-adapter';

type Storage = ReturnType<typeof getStorage>;

const JOB_RETRY_MS = 5 * 60 * 1000;
const MAX_JOB_ATTEMPTS = 5;
const LOCK_STALE_MS = 15 * 60 * 1000;

function safeJson(value: unknown): string {
  try {
    return JSON.stringify(value);
  } catch {
    return JSON.stringify({ error: 'Unable to serialize value' });
  }
}

export function orderNeedsProvisioning(order: Order): boolean {
  const productIds = String(order.realProductId || '')
    .split(',')
    .map((id) => id.trim())
    .filter(Boolean);
  for (const raw of productIds) {
    for (const id of variantsForRealProductId(raw)) {
      const x = id.toLowerCase();
      if (x.startsWith('iptv-') || x.startsWith('firestick-')) return true;
    }
  }
  return false;
}

export async function ensureProvisioningJob(
  storage: Storage,
  order: Order,
  payload: Record<string, unknown> = {},
): Promise<ProvisioningJob> {
  const existing = await storage.getProvisioningJobByOrderId(order.id);
  if (existing) {
    return existing;
  }

  return storage.createProvisioningJob({
    orderId: order.id,
    jobType: 'iptv_order',
    status: 'pending',
    provider: 'queued_local',
    payload: safeJson(payload),
    result: null,
    lastError: null,
    nextRunAt: new Date(),
    lockedAt: null,
    completedAt: null,
  });
}

export async function processProvisioningJobByOrderId(env: Env, orderId: string): Promise<ProvisioningJob | undefined> {
  const storage = getStorage(env);
  const job = await storage.getProvisioningJobByOrderId(orderId);
  if (!job) return undefined;
  if (!isJobRunnable(job)) return job;
  return processProvisioningJob(env, job, storage);
}

export async function processPendingProvisioningJobs(env: Env, limit = 5): Promise<ProvisioningJob[]> {
  const storage = getStorage(env);
  const now = Date.now();
  const jobs = await storage.listProvisioningJobsByStatus(['pending', 'retry'], limit * 3);
  const runnable = jobs
    .filter((job) => isJobRunnable(job) && (!job.nextRunAt || new Date(job.nextRunAt).getTime() <= now))
    .slice(0, limit);

  const processed: ProvisioningJob[] = [];
  for (const job of runnable) {
    processed.push(await processProvisioningJob(env, job, storage));
  }
  return processed;
}

async function processProvisioningJob(env: Env, job: ProvisioningJob, storage: Storage): Promise<ProvisioningJob> {
  const attemptCount = (job.attemptCount || 0) + 1;
  await storage.updateProvisioningJob(job.id, {
    status: 'processing',
    attemptCount,
    lockedAt: new Date(),
    lastError: null,
  });

  const order = await storage.getOrder(job.orderId);
  if (!order) {
    return (await storage.updateProvisioningJob(job.id, {
      status: 'failed',
      lockedAt: null,
      completedAt: new Date(),
      lastError: `Order ${job.orderId} not found`,
      result: safeJson({ outcome: 'missing_order' }),
    }))!;
  }

  if (order.status !== 'paid') {
    return (await storage.updateProvisioningJob(job.id, {
      status: attemptCount >= MAX_JOB_ATTEMPTS ? 'failed' : 'retry',
      lockedAt: null,
      lastError: `Order ${order.id} is not paid yet`,
      nextRunAt: new Date(Date.now() + JOB_RETRY_MS),
      completedAt: attemptCount >= MAX_JOB_ATTEMPTS ? new Date() : null,
      result: safeJson({ outcome: 'order_not_paid' }),
    }))!;
  }

  if (!orderNeedsProvisioning(order)) {
    return (await storage.updateProvisioningJob(job.id, {
      status: 'completed',
      lockedAt: null,
      completedAt: new Date(),
      result: safeJson({ outcome: 'no_provisioning_required' }),
    }))!;
  }

  try {
    const orderUpdates = await buildProvisioningUpdate(order, storage, env);
    const updatedOrder = await storage.updateOrder(order.id, orderUpdates);
    if (!updatedOrder) {
      throw new Error(`Failed to update order ${order.id} during provisioning`);
    }

    if (!updatedOrder.credentialsSent && !isManualReviewBranch(updatedOrder.provisioningBranch)) {
      await sendCredentialsEmail(updatedOrder, env, storage);
    }

    const completedStatus = isManualReviewBranch(updatedOrder.provisioningBranch)
      ? 'manual_review'
      : 'completed';

    return (await storage.updateProvisioningJob(job.id, {
      status: completedStatus,
      provider: 'queued_local',
      lockedAt: null,
      completedAt: new Date(),
      result: safeJson({
        outcome: completedStatus,
        provisioningBranch: updatedOrder.provisioningBranch,
        generatedUsername: updatedOrder.generatedUsername || updatedOrder.existingUsername || null,
      }),
      lastError: completedStatus === 'manual_review' ? 'Existing user could not be verified automatically.' : null,
    }))!;
  } catch (error: any) {
    const retryable = attemptCount < MAX_JOB_ATTEMPTS;
    return (await storage.updateProvisioningJob(job.id, {
      status: retryable ? 'retry' : 'failed',
      provider: 'queued_local',
      lockedAt: null,
      completedAt: retryable ? null : new Date(),
      nextRunAt: retryable ? new Date(Date.now() + JOB_RETRY_MS) : null,
      lastError: error?.message || 'Provisioning failed',
      result: safeJson({ outcome: retryable ? 'retry_scheduled' : 'failed' }),
    }))!;
  }
}

function isJobRunnable(job: ProvisioningJob): boolean {
  if (job.status === 'completed' || job.status === 'manual_review') return false;
  if (job.status === 'failed') return false;
  if (job.status === 'processing') {
    if (!job.lockedAt) return true;
    return Date.now() - new Date(job.lockedAt).getTime() > LOCK_STALE_MS;
  }
  return job.status === 'pending' || job.status === 'retry';
}

function isManualReviewBranch(branch?: string | null): boolean {
  return String(branch || '').includes('manual_review');
}

async function buildProvisioningUpdate(order: Order, storage: Storage, env: Env): Promise<Partial<Order>> {
  const updateData: Partial<Order> = {};
  const panelAdapter = getPanelAdapter(env);
  const panelConfig = resolvePanelOrderConfig(order, env);

  if (order.isRenewal && order.existingUsername) {
    if (panelAdapter.isAdminConfigured()) {
      const lookup = await panelAdapter.lookupExistingAccount({ username: order.existingUsername });
      if (lookup.ok) {
        const extendResult = await panelAdapter.extendExistingAccount({
          username: lookup.username || order.existingUsername,
          existingUsername: order.existingUsername,
          password: order.generatedPassword || lookup.password || '',
          packageCode: panelConfig.packageCode,
          maxConnections: panelConfig.maxConnections,
          durationDays: panelConfig.durationDays,
          bouquetIds: panelConfig.bouquetIds,
          countryPreference: order.countryPreference || null,
        });

        if (extendResult.ok) {
          updateData.generatedUsername = extendResult.username || order.existingUsername;
          if (extendResult.password) {
            updateData.generatedPassword = extendResult.password;
          }
          updateData.provisioningBranch = 'existing_customer_panel_extended';
          return updateData;
        }

        if (extendResult.retryable) {
          throw new Error(extendResult.message);
        }
      } else if (lookup.retryable) {
        throw new Error(lookup.message);
      }
    }

    const existingCustomer = await storage.getCustomerByUsername(order.existingUsername);
    if (existingCustomer) {
      updateData.generatedUsername = existingCustomer.username;
      updateData.generatedPassword = existingCustomer.password;
      updateData.provisioningBranch = 'existing_customer_local_match';

      if (!order.customerId) {
        updateData.customerId = existingCustomer.id;
      }

      await storage.incrementCustomerOrders(existingCustomer.id);
      return updateData;
    }

    if (order.expiredMoreThanOneWeek) {
      const fallbackCredentials = await generateUniqueCredentials(order, storage);

      if (panelAdapter.isAdminConfigured()) {
        const createResult = await panelAdapter.createPaidAccount({
          username: fallbackCredentials.username,
          password: fallbackCredentials.password,
          packageCode: panelConfig.packageCode,
          maxConnections: panelConfig.maxConnections,
          durationDays: panelConfig.durationDays,
          bouquetIds: panelConfig.bouquetIds,
          countryPreference: order.countryPreference || null,
        });

        if (createResult.ok) {
          updateData.generatedUsername = createResult.username || fallbackCredentials.username;
          updateData.generatedPassword = createResult.password || fallbackCredentials.password;
          updateData.provisioningBranch = 'existing_not_found_fallback_panel_new';
        } else if (createResult.retryable) {
          throw new Error(createResult.message);
        } else {
          updateData.provisioningBranch = 'existing_not_found_manual_review';
          return updateData;
        }
      } else {
        updateData.generatedUsername = fallbackCredentials.username;
        updateData.generatedPassword = fallbackCredentials.password;
        updateData.provisioningBranch = 'existing_not_found_fallback_new';
      }

      const newCustomer = await storage.createCustomer({
        username: updateData.generatedUsername || fallbackCredentials.username,
        password: updateData.generatedPassword || fallbackCredentials.password,
        email: order.customerEmail,
        fullName: order.customerName || undefined,
        phone: order.customerPhone || order.shippingPhone || undefined,
      });
      updateData.customerId = newCustomer.id;
      await storage.incrementCustomerOrders(newCustomer.id);
      return updateData;
    }

    updateData.provisioningBranch = 'existing_not_found_manual_review';
    return updateData;
  }

  const credentials = await generateUniqueCredentials(order, storage);

  if (panelAdapter.isAdminConfigured()) {
    const createResult = await panelAdapter.createPaidAccount({
      username: credentials.username,
      password: credentials.password,
      packageCode: panelConfig.packageCode,
      maxConnections: panelConfig.maxConnections,
      durationDays: panelConfig.durationDays,
      bouquetIds: panelConfig.bouquetIds,
      countryPreference: order.countryPreference || null,
    });

    if (createResult.ok) {
      updateData.generatedUsername = createResult.username || credentials.username;
      updateData.generatedPassword = createResult.password || credentials.password;
      updateData.provisioningBranch = 'new_customer_panel_created';
    } else if (createResult.retryable) {
      throw new Error(createResult.message);
    } else {
      updateData.provisioningBranch = 'new_customer_manual_review';
      return updateData;
    }
  } else {
    updateData.generatedUsername = credentials.username;
    updateData.generatedPassword = credentials.password;
    updateData.provisioningBranch = 'new_customer_created';
  }

  const newCustomer = await storage.createCustomer({
    username: updateData.generatedUsername || credentials.username,
    password: updateData.generatedPassword || credentials.password,
    email: order.customerEmail,
    fullName: order.customerName || undefined,
    phone: order.customerPhone || order.shippingPhone || undefined,
  });
  updateData.customerId = newCustomer.id;
  await storage.incrementCustomerOrders(newCustomer.id);
  return updateData;
}

function resolvePanelOrderConfig(order: Order, env: Env): {
  packageCode: string | null;
  durationDays: number | null;
  maxConnections: number | null;
  bouquetIds: string[];
} {
  const productIds = String(order.realProductId || '')
    .split(',')
    .map((id) => id.trim())
    .filter(Boolean);

  const productMap = parseJson<Record<string, any>>(env.IPTV_PANEL_PRODUCT_MAP_JSON);
  const bouquetMap = parseJson<Record<string, any>>(env.IPTV_PANEL_BOUQUET_MAP_JSON);

  let packageCode: string | null = null;
  let durationDays: number | null = null;
  let maxConnections: number | null = null;
  const bouquetIds = new Set<string>();

  for (const productId of productIds) {
    const mapped = productMap?.[productId];
    if (mapped) {
      if (!packageCode && typeof mapped === 'string') {
        packageCode = mapped;
      } else if (mapped && typeof mapped === 'object') {
        if (!packageCode && mapped.packageCode) packageCode = String(mapped.packageCode);
        if (durationDays == null && mapped.durationDays != null) durationDays = Number(mapped.durationDays) || null;
        if (maxConnections == null && mapped.maxConnections != null) maxConnections = Number(mapped.maxConnections) || null;
        if (Array.isArray(mapped.bouquetIds)) {
          for (const bouquetId of mapped.bouquetIds) {
            if (bouquetId != null && String(bouquetId).trim()) bouquetIds.add(String(bouquetId));
          }
        }
      }
    }

    if (durationDays == null) {
      durationDays = inferDurationDays(productId);
    }
    if (maxConnections == null) {
      maxConnections = inferMaxConnections(productId);
    }
  }

  for (const pref of splitCountryPreference(order.countryPreference)) {
    const mappedBouquets = bouquetMap?.[pref];
    if (Array.isArray(mappedBouquets)) {
      for (const bouquetId of mappedBouquets) {
        if (bouquetId != null && String(bouquetId).trim()) bouquetIds.add(String(bouquetId));
      }
    } else if (mappedBouquets != null && String(mappedBouquets).trim()) {
      bouquetIds.add(String(mappedBouquets));
    }
  }

  return {
    packageCode,
    durationDays,
    maxConnections,
    bouquetIds: [...bouquetIds],
  };
}

function inferDurationDays(productId: string): number | null {
  if (/1yr|12m|12mo/i.test(productId)) return 365;
  if (/6mo|6m/i.test(productId)) return 180;
  if (/3mo|3m/i.test(productId)) return 90;
  if (/1mo|1m/i.test(productId)) return 30;
  return null;
}

function inferMaxConnections(productId: string): number | null {
  const match = productId.match(/-(\d)d$/i);
  if (match) return Number(match[1]) || null;
  return null;
}

function splitCountryPreference(value?: string | null): string[] {
  return String(value || '')
    .split(/[;,]/)
    .map((part) => part.trim())
    .filter(Boolean);
}

function parseJson<T>(value?: string | null): T | null {
  if (!value || !value.trim()) return null;
  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}
