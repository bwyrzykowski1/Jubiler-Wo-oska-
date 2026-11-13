import { JEWELRY_COLLECTION } from '../data/jewelry';
import type { JewelryPiece } from '../data/jewelry';
import { DEFAULT_SITE_CONTENT } from '../data/workshop';
import type { SiteContent } from '../data/workshop';

export interface ClientInquiry {
  id: string;
  name: string;
  phone: string;
  email: string;
  category: string;
  metal: string;
  gemstone: string;
  budget: string;
  sizeOrLength: string;
  referencePiece: string;
  notes: string;
  createdAt: string;
}

const DB_NAME = 'jubiler_woloska_static_v1';
const STORE_NAME = 'kv';
const STATIC_PIN_KEY = 'jw_static_owner_pin_v1';
const DEFAULT_PIN = '2026';

let backendDetected: boolean | null = null;

export async function isBackendAvailable(): Promise<boolean> {
  if (backendDetected !== null) return backendDetected;
  try {
    const res = await fetch('./api/health', { cache: 'no-store' });
    const contentType = res.headers.get('content-type') || '';
    if (res.ok && contentType.includes('application/json')) {
      const json = (await res.json()) as { ok?: boolean };
      if (json?.ok) {
        backendDetected = true;
        return true;
      }
    }
  } catch {
    // Static host (e.g. GitHub Pages)
  }
  backendDetected = false;
  return false;
}

function openIdb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function idbGet<T>(key: string): Promise<T | null> {
  try {
    const db = await openIdb();
    return await new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(key);
      req.onsuccess = () => resolve((req.result as T) ?? null);
      req.onerror = () => resolve(null);
    });
  } catch {
    try {
      const raw = localStorage.getItem(`jw_fallback_${key}`);
      return raw ? (JSON.parse(raw) as T) : null;
    } catch {
      return null;
    }
  }
}

async function idbSet<T>(key: string, value: T): Promise<void> {
  try {
    const db = await openIdb();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      store.put(value, key);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch {
    localStorage.setItem(`jw_fallback_${key}`, JSON.stringify(value));
  }
}

export async function verifyOwnerPin(pin: string): Promise<{ valid: boolean; mode: 'server' | 'static'; error?: string }> {
  const clean = pin.trim();
  const hasBackend = await isBackendAvailable();
  if (hasBackend) {
    try {
      const res = await fetch('./api/owner/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin: clean }),
      });
      if (res.ok) {
        return { valid: true, mode: 'server' };
      }
      const data = await res.json().catch(() => ({}));
      return { valid: false, mode: 'server', error: data?.error || 'Nieprawidłowy kod dostępu.' };
    } catch {
      // Fall through only if network error
    }
  }

  const storedPin = localStorage.getItem(STATIC_PIN_KEY) || DEFAULT_PIN;
  if (clean === storedPin) {
    return { valid: true, mode: 'static' };
  }
  return { valid: false, mode: 'static', error: 'Nieprawidłowy kod dostępu pracowni.' };
}

export function updateStaticOwnerPin(newPin: string): void {
  const clean = newPin.trim();
  if (clean.length >= 4) {
    localStorage.setItem(STATIC_PIN_KEY, clean);
  }
}

export async function loadCatalogData(): Promise<JewelryPiece[]> {
  if (await isBackendAvailable()) {
    try {
      const res = await fetch('./api/products');
      if (res.ok) {
        const data = (await res.json()) as { products?: JewelryPiece[] };
        if (Array.isArray(data.products)) return data.products;
      }
    } catch {
      // Fallback
    }
  }
  const stored = await idbGet<JewelryPiece[]>('catalog');
  if (Array.isArray(stored)) return stored;
  return JEWELRY_COLLECTION;
}

export async function loadSiteContentData(): Promise<SiteContent> {
  if (await isBackendAvailable()) {
    try {
      const res = await fetch('./api/site-content');
      if (res.ok) {
        const data = (await res.json()) as SiteContent;
        if (data?.workshopInfo && data?.servicePrices) return data;
      }
    } catch {
      // Fallback
    }
  }
  const stored = await idbGet<SiteContent>('siteContent');
  return stored || DEFAULT_SITE_CONTENT;
}

export async function saveProductData(
  pin: string,
  editingId: string | null,
  payload: Partial<JewelryPiece> & { imageDataUrl?: string; sendPush?: boolean }
): Promise<{ ok: boolean; error?: string; unauthorized?: boolean }> {
  if (await isBackendAvailable()) {
    const url = editingId ? `./api/products/${encodeURIComponent(editingId)}` : './api/products';
    const res = await fetch(url, {
      method: editingId ? 'PATCH' : 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-owner-pin': pin,
      },
      body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return {
        ok: false,
        unauthorized: res.status === 401,
        error: data?.error || 'Nie udało się zapisać zmian.',
      };
    }
    return { ok: true };
  }

  // Static mode (GitHub Pages)
  const current = await loadCatalogData();
  if (editingId) {
    const idx = current.findIndex((p) => p.id === editingId);
    if (idx === -1) return { ok: false, error: 'Nie znaleziono wyrobu.' };
    const prev = current[idx];
    const updated: JewelryPiece = {
      ...prev,
      name: payload.name?.trim() || prev.name,
      category: payload.category || prev.category,
      metal: payload.metal || prev.metal,
      gemstone: payload.gemstone || prev.gemstone,
      gemstoneSpecs: payload.gemstoneSpecs ?? prev.gemstoneSpecs,
      weightGrams: payload.weightGrams ?? prev.weightGrams,
      pricePLN: Number(payload.pricePLN) > 0 ? Math.round(Number(payload.pricePLN)) : prev.pricePLN,
      leadTime: payload.leadTime ?? prev.leadTime,
      availability: payload.availability || prev.availability,
      shortNote: payload.shortNote ?? prev.shortNote,
      craftDetails: payload.craftDetails ?? payload.shortNote ?? prev.craftDetails,
      image: payload.imageDataUrl || prev.image,
    };
    const next = [...current];
    next[idx] = updated;
    await idbSet('catalog', next);
    return { ok: true };
  }

  if (!payload.name?.trim() || !payload.imageDataUrl || !Number(payload.pricePLN)) {
    return { ok: false, error: 'Podaj nazwę, zdjęcie i cenę wyrobu.' };
  }

  const newPiece: JewelryPiece = {
    id: `local-${Date.now()}`,
    name: payload.name.trim(),
    category: payload.category || 'Pierścionki',
    metal: payload.metal || 'Złoto żółte 585',
    gemstone: payload.gemstone || 'Diament / Brylant',
    gemstoneSpecs: payload.gemstoneSpecs || payload.gemstone || 'Kamień naturalny',
    weightGrams: payload.weightGrams || '—',
    pricePLN: Math.round(Number(payload.pricePLN)),
    leadTime: payload.leadTime || '10–14 dni roboczych',
    availability: payload.availability || 'Dostępny w pracowni',
    image: payload.imageDataUrl,
    shortNote: payload.shortNote || 'Autorski wyrób wykonany ręcznie w pracowni.',
    craftDetails: payload.craftDetails || payload.shortNote || 'Autorski wyrób wykonany ręcznie.',
    isNew: true,
  };
  await idbSet('catalog', [newPiece, ...current]);
  return { ok: true };
}

export async function deleteProductData(pin: string, id: string): Promise<boolean> {
  if (await isBackendAvailable()) {
    const res = await fetch(`./api/products/${encodeURIComponent(id)}`, {
      method: 'DELETE',
      headers: { 'x-owner-pin': pin },
    });
    return res.ok;
  }
  const current = await loadCatalogData();
  await idbSet(
    'catalog',
    current.filter((p) => p.id !== id)
  );
  return true;
}

export async function restoreDefaultProductsData(pin: string): Promise<void> {
  if (await isBackendAvailable()) {
    await fetch('./api/products/restore-defaults', {
      method: 'POST',
      headers: { 'x-owner-pin': pin },
    });
    return;
  }
  const current = await loadCatalogData();
  const ids = new Set(current.map((p) => p.id));
  const missing = JEWELRY_COLLECTION.filter((d) => !ids.has(d.id));
  await idbSet('catalog', [...current, ...missing]);
}

export async function saveSiteContentData(
  pin: string,
  patch: Partial<SiteContent> & { heroImageDataUrl?: string; aboutImageDataUrl?: string }
): Promise<{ ok: boolean; siteContent?: SiteContent; error?: string; unauthorized?: boolean }> {
  if (await isBackendAvailable()) {
    const res = await fetch('./api/site-content', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'x-owner-pin': pin,
      },
      body: JSON.stringify(patch),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return {
        ok: false,
        unauthorized: res.status === 401,
        error: data?.error || 'Nie udało się zapisać zmian.',
      };
    }
    return { ok: true, siteContent: data.siteContent };
  }

  const current = await loadSiteContentData();
  const nextWorkshopInfo = patch.workshopInfo
    ? {
        ...current.workshopInfo,
        ...patch.workshopInfo,
        phoneHref: patch.workshopInfo.phoneDisplay
          ? `tel:${patch.workshopInfo.phoneDisplay.replace(/[^\d+]/g, '')}`
          : current.workshopInfo.phoneHref,
      }
    : current.workshopInfo;

  const updated: SiteContent = {
    workshopInfo: nextWorkshopInfo,
    heroContent: patch.heroContent
      ? {
          ...current.heroContent,
          ...patch.heroContent,
          image: patch.heroImageDataUrl || patch.heroContent.image || current.heroContent.image,
        }
      : {
          ...current.heroContent,
          image: patch.heroImageDataUrl || current.heroContent.image,
        },
    aboutContent: patch.aboutContent
      ? {
          ...current.aboutContent,
          ...patch.aboutContent,
          image: patch.aboutImageDataUrl || patch.aboutContent.image || current.aboutContent.image,
        }
      : {
          ...current.aboutContent,
          image: patch.aboutImageDataUrl || current.aboutContent.image,
        },
    servicePrices: patch.servicePrices ?? current.servicePrices,
    bespokePrices: patch.bespokePrices ?? current.bespokePrices,
  };

  await idbSet('siteContent', updated);
  return { ok: true, siteContent: updated };
}

export async function submitInquiryData(
  payload: Omit<ClientInquiry, 'id' | 'createdAt'>
): Promise<{ ok: boolean; inquiryId?: string; error?: string }> {
  if (await isBackendAvailable()) {
    const res = await fetch('./api/inquiries', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return { ok: false, error: data?.error || 'Nie udało się wysłać zapytania.' };
    }
    return { ok: true, inquiryId: data.inquiryId };
  }

  const inquiry: ClientInquiry = {
    ...payload,
    id: `JW-${new Date().getFullYear()}-${String(Math.floor(1000 + Math.random() * 9000))}`,
    createdAt: new Date().toISOString(),
  };
  const existing = (await idbGet<ClientInquiry[]>('inquiries')) || [];
  await idbSet('inquiries', [inquiry, ...existing]);
  return { ok: true, inquiryId: inquiry.id };
}

export async function loadOwnerInquiriesData(pin: string): Promise<ClientInquiry[]> {
  if (await isBackendAvailable()) {
    const res = await fetch('./api/owner/inquiries', {
      headers: { 'x-owner-pin': pin },
    });
    if (res.ok) {
      const data = await res.json();
      return Array.isArray(data?.inquiries) ? data.inquiries : [];
    }
    return [];
  }
  return (await idbGet<ClientInquiry[]>('inquiries')) || [];
}

export async function deleteOwnerInquiryData(pin: string, id: string): Promise<void> {
  if (await isBackendAvailable()) {
    await fetch(`./api/owner/inquiries/${encodeURIComponent(id)}`, {
      method: 'DELETE',
      headers: { 'x-owner-pin': pin },
    });
    return;
  }
  const current = (await idbGet<ClientInquiry[]>('inquiries')) || [];
  await idbSet(
    'inquiries',
    current.filter((i) => i.id !== id)
  );
}
