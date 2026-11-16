import 'dotenv/config';
import express from 'express';
import type { Request, Response } from 'express';
import fs from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { PushSubscription } from 'web-push';
import { JEWELRY_COLLECTION } from './src/data/jewelry.ts';
import type { JewelryPiece } from './src/data/jewelry.ts';
import { resolveTabFromPathname, TAB_SEO_METADATA } from './src/data/seo.ts';
import { DEFAULT_SITE_CONTENT } from './src/data/workshop.ts';
import type { SiteContent } from './src/data/workshop.ts';
import { extract3dEmbedUrl } from './src/lib/embed3d.ts';

const require = createRequire(import.meta.url);
const webpush = require('web-push') as typeof import('web-push');

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface SubscriptionRecord {
  endpoint: string;
  subscription: PushSubscription;
  topics: string[];
  createdAt: string;
}

interface ValuationInquiry {
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

interface AnnouncementItem {
  id: string;
  title: string;
  body: string;
  category: string;
  publishedAt: string;
}

const DATA_DIR = path.join(__dirname, '.data');
const UPLOADS_DIR = path.join(DATA_DIR, 'uploads');
const VAPID_FILE = path.join(DATA_DIR, 'vapid.json');
const INQUIRIES_FILE = path.join(DATA_DIR, 'inquiries.json');
const CATALOG_FILE = path.join(DATA_DIR, 'catalog.json');
const SITE_CONTENT_FILE = path.join(DATA_DIR, 'site-content.json');
const ANNOUNCEMENTS_FILE = path.join(DATA_DIR, 'announcements.json');

// Legacy files kept only for seamless migration if present
const LEGACY_PRODUCTS_FILE = path.join(DATA_DIR, 'products.json');
const LEGACY_HIDDEN_FILE = path.join(DATA_DIR, 'hidden-products.json');

const OWNER_PIN = process.env.OWNER_PIN || '2026';

function ensureDataDirs(): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  }
}

function getOrCreateVapidKeys(): { publicKey: string; privateKey: string } {
  ensureDataDirs();
  if (fs.existsSync(VAPID_FILE)) {
    try {
      const raw = fs.readFileSync(VAPID_FILE, 'utf8');
      const parsed = JSON.parse(raw) as { publicKey?: string; privateKey?: string };
      if (parsed.publicKey && parsed.privateKey) {
        return { publicKey: parsed.publicKey, privateKey: parsed.privateKey };
      }
    } catch {
      // Regenerate if corrupt
    }
  }
  const keys = webpush.generateVAPIDKeys();
  fs.writeFileSync(VAPID_FILE, JSON.stringify(keys, null, 2));
  return keys;
}

function readJsonArray<T>(filePath: string): T[] {
  ensureDataDirs();
  if (!fs.existsSync(filePath)) {
    return [];
  }
  try {
    const raw = fs.readFileSync(filePath, 'utf8');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as T[]) : [];
  } catch {
    return [];
  }
}

function writeJsonFile(filePath: string, data: unknown): void {
  ensureDataDirs();
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

function getCatalog(): JewelryPiece[] {
  ensureDataDirs();
  if (fs.existsSync(CATALOG_FILE)) {
    const items = readJsonArray<JewelryPiece>(CATALOG_FILE);
    if (items.length > 0 || fs.readFileSync(CATALOG_FILE, 'utf8').trim() === '[]') {
      return items;
    }
  }
  // Seed catalog cleanly (preserving any legacy custom uploads)
  const legacyCustom = readJsonArray<JewelryPiece>(LEGACY_PRODUCTS_FILE);
  const legacyHidden = new Set(readJsonArray<string>(LEGACY_HIDDEN_FILE));
  const seeded = [
    ...legacyCustom,
    ...JEWELRY_COLLECTION.filter((item) => !legacyHidden.has(item.id)),
  ];
  writeJsonFile(CATALOG_FILE, seeded);
  return seeded;
}

function getSiteContent(): SiteContent {
  ensureDataDirs();
  if (!fs.existsSync(SITE_CONTENT_FILE)) {
    writeJsonFile(SITE_CONTENT_FILE, DEFAULT_SITE_CONTENT);
    return DEFAULT_SITE_CONTENT;
  }
  try {
    const raw = fs.readFileSync(SITE_CONTENT_FILE, 'utf8');
    const parsed = JSON.parse(raw) as Partial<SiteContent>;
    return {
      workshopInfo: { ...DEFAULT_SITE_CONTENT.workshopInfo, ...(parsed.workshopInfo || {}) },
      heroContent: { ...DEFAULT_SITE_CONTENT.heroContent, ...(parsed.heroContent || {}) },
      aboutContent: { ...DEFAULT_SITE_CONTENT.aboutContent, ...(parsed.aboutContent || {}) },
      servicePrices: Array.isArray(parsed.servicePrices)
        ? parsed.servicePrices
        : DEFAULT_SITE_CONTENT.servicePrices,
      bespokePrices: Array.isArray(parsed.bespokePrices)
        ? parsed.bespokePrices
        : DEFAULT_SITE_CONTENT.bespokePrices,
    };
  } catch {
    return DEFAULT_SITE_CONTENT;
  }
}

const DEFAULT_ANNOUNCEMENTS: AnnouncementItem[] = [
  {
    id: 'news-2026-11-solitaire',
    title: 'Nowość: Pierścionek Soliter „Mokotów” w złocie 585',
    body: 'W pracowni przy ul. Wołoskiej pojawił się nowy wzór zaręczynowy z certyfikowanym brylantem 0,55 ct w ręcznie kutej oprawie.',
    category: 'Pierścionki',
    publishedAt: '2026-11-12',
  },
  {
    id: 'news-2026-11-tanzanit',
    title: 'Nowa kolekcja naszyjników z tanzanitami i szmaragdami',
    body: 'Limitowana seria autorskich zawieszek z kamieniami kolekcjonerskimi w białym i żółtym złocie 585.',
    category: 'Naszyjniki',
    publishedAt: '2026-11-08',
  },
];

function getAnnouncements(): AnnouncementItem[] {
  ensureDataDirs();
  if (!fs.existsSync(ANNOUNCEMENTS_FILE)) {
    writeJsonFile(ANNOUNCEMENTS_FILE, DEFAULT_ANNOUNCEMENTS);
    return DEFAULT_ANNOUNCEMENTS;
  }
  const items = readJsonArray<AnnouncementItem>(ANNOUNCEMENTS_FILE);
  return items.length > 0 ? items : DEFAULT_ANNOUNCEMENTS;
}

function saveBase64Image(imageDataUrl: string, prefix: string): string | null {
  const match = imageDataUrl.match(/^data:image\/(jpeg|jpg|png|webp);base64,(.+)$/i);
  if (!match) return null;
  const ext = match[1].toLowerCase() === 'jpeg' ? 'jpg' : match[1].toLowerCase();
  const filename = `${prefix}-${Date.now()}.${ext}`;
  const filePath = path.join(UPLOADS_DIR, filename);
  const buffer = Buffer.from(match[2], 'base64');
  fs.writeFileSync(filePath, buffer);
  return `/uploads/${filename}`;
}

const vapidKeys = getOrCreateVapidKeys();
webpush.setVapidDetails(
  'mailto:kontakt@jubilerwoloska.pl',
  vapidKeys.publicKey,
  vapidKeys.privateKey
);

const subscriptions = new Map<string, SubscriptionRecord>();

async function broadcastPush(payload: {
  title: string;
  body: string;
  url: string;
  tag: string;
}): Promise<number> {
  let delivered = 0;
  for (const record of Array.from(subscriptions.values())) {
    try {
      await webpush.sendNotification(record.subscription, JSON.stringify(payload));
      delivered += 1;
    } catch (err: unknown) {
      const statusCode =
        typeof err === 'object' && err !== null && 'statusCode' in err
          ? Number((err as { statusCode?: number }).statusCode)
          : 0;
      if (statusCode === 404 || statusCode === 410) {
        subscriptions.delete(record.endpoint);
      }
    }
  }
  return delivered;
}

function isValidOwnerPin(req: Request): boolean {
  const pinHeader = String(req.headers['x-owner-pin'] || '').trim();
  return pinHeader === OWNER_PIN;
}

async function createApp() {
  ensureDataDirs();
  const app = express();
  app.use(express.json({ limit: '15mb' }));
  app.use('/uploads', express.static(UPLOADS_DIR));

  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({ ok: true });
  });

  app.get('/api/push/vapid-public-key', (_req: Request, res: Response) => {
    res.json({ publicKey: vapidKeys.publicKey });
  });

  app.post('/api/push/subscribe', (req: Request, res: Response) => {
    const body = req.body as {
      subscription?: PushSubscription;
      topics?: string[];
    };

    if (!body?.subscription?.endpoint) {
      res.status(400).json({ error: 'Brak prawidłowej subskrypcji push.' });
      return;
    }

    const topics =
      Array.isArray(body.topics) && body.topics.length > 0
        ? body.topics
        : ['Pierścionki', 'Naszyjniki', 'Kamienie kolekcjonerskie'];

    subscriptions.set(body.subscription.endpoint, {
      endpoint: body.subscription.endpoint,
      subscription: body.subscription,
      topics,
      createdAt: new Date().toISOString(),
    });

    res.status(201).json({
      subscribed: true,
      topics,
      activeSubscribers: subscriptions.size,
    });
  });

  app.post('/api/push/unsubscribe', (req: Request, res: Response) => {
    const body = req.body as { endpoint?: string };
    if (body?.endpoint) {
      subscriptions.delete(body.endpoint);
    }
    res.json({ subscribed: false });
  });

  app.post('/api/push/notify', async (req: Request, res: Response) => {
    const body = req.body as {
      title?: string;
      message?: string;
      category?: string;
      publishAnnouncement?: boolean;
      endpoint?: string;
    };

    const currentAnnouncements = getAnnouncements();
    const latest = currentAnnouncements[0];
    const title = body?.title?.trim() || latest.title;
    const message = body?.message?.trim() || latest.body;

    if (body?.publishAnnouncement) {
      const next: AnnouncementItem = {
        id: `news-${Date.now()}`,
        title,
        body: message,
        category: body.category?.trim() || 'Nowości',
        publishedAt: new Date().toISOString().slice(0, 10),
      };
      writeJsonFile(ANNOUNCEMENTS_FILE, [next, ...currentAnnouncements].slice(0, 10));
    }

    const payload = {
      title,
      body: message,
      url: '/',
      tag: `jubiler-woloska-${Date.now()}`,
    };

    let delivered = 0;
    if (body?.endpoint && subscriptions.has(body.endpoint)) {
      try {
        await webpush.sendNotification(
          subscriptions.get(body.endpoint)!.subscription,
          JSON.stringify(payload)
        );
        delivered = 1;
      } catch {
        // Ignore single delivery failure
      }
    } else {
      delivered = await broadcastPush(payload);
    }

    res.json({
      sent: true,
      delivered,
      payload,
    });
  });

  app.get('/api/announcements', (_req: Request, res: Response) => {
    res.json({ announcements: getAnnouncements() });
  });

  // Public Site Content (Workshop Info, Hero, About, Prices)
  app.get('/api/site-content', (_req: Request, res: Response) => {
    res.json(getSiteContent());
  });

  app.put('/api/site-content', (req: Request, res: Response) => {
    if (!isValidOwnerPin(req)) {
      res.status(401).json({ error: 'Brak autoryzacji właściciela.' });
      return;
    }

    const current = getSiteContent();
    const body = req.body as Partial<SiteContent> & {
      heroImageDataUrl?: string;
      aboutImageDataUrl?: string;
    };

    let nextHeroImage = body.heroContent?.image ?? current.heroContent.image;
    if (body.heroImageDataUrl) {
      const saved = saveBase64Image(body.heroImageDataUrl, 'hero');
      if (!saved) {
        res.status(400).json({ error: 'Nieprawidłowy format zdjęcia głównego.' });
        return;
      }
      nextHeroImage = saved;
    }

    let nextAboutImage = body.aboutContent?.image ?? current.aboutContent.image;
    if (body.aboutImageDataUrl) {
      const saved = saveBase64Image(body.aboutImageDataUrl, 'about');
      if (!saved) {
        res.status(400).json({ error: 'Nieprawidłowy format zdjęcia pracowni.' });
        return;
      }
      nextAboutImage = saved;
    }

    const nextWorkshopInfo = body.workshopInfo
      ? {
          ...current.workshopInfo,
          ...body.workshopInfo,
          phoneHref: body.workshopInfo.phoneDisplay
            ? `tel:${body.workshopInfo.phoneDisplay.replace(/[^\d+]/g, '')}`
            : current.workshopInfo.phoneHref,
        }
      : current.workshopInfo;

    const updated: SiteContent = {
      workshopInfo: nextWorkshopInfo,
      heroContent: body.heroContent
        ? { ...current.heroContent, ...body.heroContent, image: nextHeroImage }
        : { ...current.heroContent, image: nextHeroImage },
      aboutContent: body.aboutContent
        ? { ...current.aboutContent, ...body.aboutContent, image: nextAboutImage }
        : { ...current.aboutContent, image: nextAboutImage },
      servicePrices: Array.isArray(body.servicePrices)
        ? body.servicePrices
        : current.servicePrices,
      bespokePrices: Array.isArray(body.bespokePrices)
        ? body.bespokePrices
        : current.bespokePrices,
    };

    writeJsonFile(SITE_CONTENT_FILE, updated);
    res.json({ ok: true, siteContent: updated });
  });

  app.post('/api/site-content/reset', (req: Request, res: Response) => {
    if (!isValidOwnerPin(req)) {
      res.status(401).json({ error: 'Brak autoryzacji właściciela.' });
      return;
    }
    writeJsonFile(SITE_CONTENT_FILE, DEFAULT_SITE_CONTENT);
    res.json({ ok: true, siteContent: DEFAULT_SITE_CONTENT });
  });

  // Public Catalog
  app.get('/api/products', (_req: Request, res: Response) => {
    res.json({ products: getCatalog() });
  });

  app.post('/api/owner/verify', (req: Request, res: Response) => {
    const body = req.body as { pin?: string };
    if (String(body?.pin || '').trim() === OWNER_PIN) {
      res.json({ valid: true });
      return;
    }
    res.status(401).json({ valid: false, error: 'Nieprawidłowy kod dostępu pracowni.' });
  });

  app.post('/api/products', async (req: Request, res: Response) => {
    if (!isValidOwnerPin(req)) {
      res.status(401).json({ error: 'Brak autoryzacji właściciela.' });
      return;
    }

    const body = req.body as Partial<JewelryPiece> & {
      imageDataUrl?: string;
      sendPush?: boolean;
    };

    const name = String(body.name || '').trim();
    const imageDataUrl = String(body.imageDataUrl || '').trim();
    const pricePLN = Number(body.pricePLN || 0);

    if (!name || !imageDataUrl || !Number.isFinite(pricePLN) || pricePLN <= 0) {
      res.status(400).json({ error: 'Podaj nazwę wzoru, zdjęcie oraz prawidłową cenę w PLN.' });
      return;
    }

    const id = `piece-${Date.now()}`;
    const savedImage = saveBase64Image(imageDataUrl, id);
    if (!savedImage) {
      res.status(400).json({ error: 'Nieprawidłowy format zdjęcia (obsługiwane: JPG, PNG, WebP).' });
      return;
    }

    const rawModel3d = typeof body.model3dUrl === 'string' ? body.model3dUrl.trim() : '';
    const validatedModel3d = rawModel3d ? extract3dEmbedUrl(rawModel3d) : null;
    if (rawModel3d && !validatedModel3d) {
      res.status(400).json({ error: 'Nieprawidłowy adres lub kod <iframe> modelu 3D (wymagany link https://).' });
      return;
    }

    const category = body.category || 'Pierścionki';
    const metal = body.metal || 'Złoto żółte 585';
    const gemstone = body.gemstone || 'Diament / Brylant';
    const shortNote =
      String(body.shortNote || '').trim() ||
      'Autorski wyrób wykonany ręcznie w pracowni Jubiler Wołoska.';

    const newProduct: JewelryPiece = {
      id,
      name,
      category,
      metal,
      gemstone,
      gemstoneSpecs: String(body.gemstoneSpecs || gemstone).trim(),
      weightGrams: String(body.weightGrams || '—').trim(),
      pricePLN: Math.round(pricePLN),
      leadTime: String(body.leadTime || '10–14 dni roboczych').trim(),
      availability: body.availability || 'Dostępny w pracowni',
      image: savedImage,
      model3dUrl: validatedModel3d || undefined,
      shortNote,
      craftDetails: String(body.craftDetails || shortNote).trim(),
      isNew: true,
    };

    const catalog = getCatalog();
    writeJsonFile(CATALOG_FILE, [newProduct, ...catalog]);

    let pushDelivered = 0;
    if (body.sendPush) {
      const today = new Date().toISOString().slice(0, 10);
      const pushTitle = `Nowość w pracowni: ${name}`;
      const pushBody = `${category} · ${metal} · ${gemstone}. Już dostępny w galerii.`;
      const currentAnnouncements = getAnnouncements();
      writeJsonFile(
        ANNOUNCEMENTS_FILE,
        [
          {
            id: `news-${Date.now()}`,
            title: pushTitle,
            body: pushBody,
            category,
            publishedAt: today,
          },
          ...currentAnnouncements,
        ].slice(0, 10)
      );
      pushDelivered = await broadcastPush({
        title: pushTitle,
        body: pushBody,
        url: '/',
        tag: `jubiler-woloska-${id}`,
      });
    }

    res.status(201).json({
      ok: true,
      product: newProduct,
      pushDelivered,
    });
  });

  app.patch('/api/products/:id', (req: Request, res: Response) => {
    if (!isValidOwnerPin(req)) {
      res.status(401).json({ error: 'Brak autoryzacji właściciela.' });
      return;
    }

    const id = String(req.params.id || '').trim();
    const catalog = getCatalog();
    const idx = catalog.findIndex((item) => item.id === id);
    if (idx === -1) {
      res.status(404).json({ error: 'Nie znaleziono wyrobu w katalogu.' });
      return;
    }

    const body = req.body as Partial<JewelryPiece> & { imageDataUrl?: string };
    const existing = catalog[idx];
    let nextImage = existing.image;

    if (body.imageDataUrl) {
      const saved = saveBase64Image(body.imageDataUrl, `edit-${Date.now()}`);
      if (!saved) {
        res.status(400).json({ error: 'Nieprawidłowy format nowego zdjęcia.' });
        return;
      }
      nextImage = saved;
    }

    const nextPrice =
      body.pricePLN !== undefined && Number.isFinite(Number(body.pricePLN)) && Number(body.pricePLN) > 0
        ? Math.round(Number(body.pricePLN))
        : existing.pricePLN;

    let nextModel3dUrl = existing.model3dUrl;
    if (body.model3dUrl !== undefined) {
      const rawModel3d = String(body.model3dUrl || '').trim();
      if (!rawModel3d) {
        nextModel3dUrl = undefined;
      } else {
        const validated = extract3dEmbedUrl(rawModel3d);
        if (!validated) {
          res.status(400).json({ error: 'Nieprawidłowy adres lub kod <iframe> modelu 3D (wymagany link https://).' });
          return;
        }
        nextModel3dUrl = validated;
      }
    }

    const updated: JewelryPiece = {
      ...existing,
      name: body.name !== undefined ? String(body.name).trim() || existing.name : existing.name,
      category: body.category || existing.category,
      metal: body.metal || existing.metal,
      gemstone: body.gemstone || existing.gemstone,
      gemstoneSpecs:
        body.gemstoneSpecs !== undefined ? String(body.gemstoneSpecs).trim() : existing.gemstoneSpecs,
      weightGrams:
        body.weightGrams !== undefined ? String(body.weightGrams).trim() : existing.weightGrams,
      pricePLN: nextPrice,
      leadTime: body.leadTime !== undefined ? String(body.leadTime).trim() : existing.leadTime,
      availability: body.availability || existing.availability,
      shortNote: body.shortNote !== undefined ? String(body.shortNote).trim() : existing.shortNote,
      craftDetails:
        body.craftDetails !== undefined
          ? String(body.craftDetails).trim()
          : body.shortNote !== undefined
          ? String(body.shortNote).trim()
          : existing.craftDetails,
      isNew: body.isNew !== undefined ? Boolean(body.isNew) : existing.isNew,
      image: nextImage,
      model3dUrl: nextModel3dUrl,
    };

    catalog[idx] = updated;
    writeJsonFile(CATALOG_FILE, catalog);
    res.json({ ok: true, product: updated });
  });

  app.delete('/api/products/:id', (req: Request, res: Response) => {
    if (!isValidOwnerPin(req)) {
      res.status(401).json({ error: 'Brak autoryzacji właściciela.' });
      return;
    }

    const id = String(req.params.id || '').trim();
    const catalog = getCatalog();
    const idx = catalog.findIndex((item) => item.id === id);
    if (idx === -1) {
      res.status(404).json({ error: 'Nie znaleziono wyrobu.' });
      return;
    }

    const [removed] = catalog.splice(idx, 1);
    writeJsonFile(CATALOG_FILE, catalog);

    if (removed?.image?.startsWith('/uploads/')) {
      const imgPath = path.join(UPLOADS_DIR, path.basename(removed.image));
      if (fs.existsSync(imgPath)) {
        fs.unlinkSync(imgPath);
      }
    }
    res.json({ ok: true, removedId: id });
  });

  app.post('/api/products/restore-defaults', (req: Request, res: Response) => {
    if (!isValidOwnerPin(req)) {
      res.status(401).json({ error: 'Brak autoryzacji właściciela.' });
      return;
    }
    const catalog = getCatalog();
    const existingIds = new Set(catalog.map((p) => p.id));
    const missingDefaults = JEWELRY_COLLECTION.filter((d) => !existingIds.has(d.id));
    const merged = [...catalog, ...missingDefaults];
    writeJsonFile(CATALOG_FILE, merged);
    res.json({ ok: true, products: merged });
  });

  // Inquiries (Public submit, Owner view/delete)
  app.get('/api/inquiries', (_req: Request, res: Response) => {
    const items = readJsonArray<ValuationInquiry>(INQUIRIES_FILE);
    res.json({ count: items.length });
  });

  app.get('/api/owner/inquiries', (req: Request, res: Response) => {
    if (!isValidOwnerPin(req)) {
      res.status(401).json({ error: 'Brak autoryzacji właściciela.' });
      return;
    }
    res.json({ inquiries: readJsonArray<ValuationInquiry>(INQUIRIES_FILE) });
  });

  app.delete('/api/owner/inquiries/:id', (req: Request, res: Response) => {
    if (!isValidOwnerPin(req)) {
      res.status(401).json({ error: 'Brak autoryzacji właściciela.' });
      return;
    }
    const id = String(req.params.id || '').trim();
    const existing = readJsonArray<ValuationInquiry>(INQUIRIES_FILE);
    const filtered = existing.filter((item) => item.id !== id);
    writeJsonFile(INQUIRIES_FILE, filtered);
    res.json({ ok: true });
  });

  app.post('/api/inquiries', (req: Request, res: Response) => {
    const body = req.body as Partial<ValuationInquiry>;
    const name = String(body.name || '').trim();
    const phone = String(body.phone || '').trim();
    const email = String(body.email || '').trim();
    const category = String(body.category || '').trim();
    const metal = String(body.metal || '').trim();
    const gemstone = String(body.gemstone || '').trim();
    const budget = String(body.budget || '').trim();
    const sizeOrLength = String(body.sizeOrLength || '').trim();
    const referencePiece = String(body.referencePiece || '').trim();
    const notes = String(body.notes || '').trim();

    if (!name || (!phone && !email) || !notes) {
      res.status(400).json({
        error: 'Proszę podać imię, numer telefonu lub e-mail oraz krótki opis projektu.',
      });
      return;
    }

    const inquiry: ValuationInquiry = {
      id: `JW-${new Date().getFullYear()}-${String(Math.floor(1000 + Math.random() * 9000))}`,
      name,
      phone,
      email,
      category: category || 'Indywidualny projekt',
      metal: metal || 'Do ustalenia',
      gemstone: gemstone || 'Do ustalenia',
      budget: budget || 'Do ustalenia w pracowni',
      sizeOrLength,
      referencePiece,
      notes,
      createdAt: new Date().toISOString(),
    };

    const existing = readJsonArray<ValuationInquiry>(INQUIRIES_FILE);
    existing.unshift(inquiry);
    writeJsonFile(INQUIRIES_FILE, existing.slice(0, 200));

    res.status(201).json({
      ok: true,
      inquiryId: inquiry.id,
      createdAt: inquiry.createdAt,
      summary: {
        category: inquiry.category,
        metal: inquiry.metal,
        gemstone: inquiry.gemstone,
      },
    });
  });

  const resolveOrigin = (req: Request): string => {
    const envUrl = process.env.APP_URL?.trim();
    if (envUrl && /^https?:\/\//i.test(envUrl) && !envUrl.includes('MY_APP_URL')) {
      return envUrl.replace(/\/+$/, '');
    }
    const proto = req.headers['x-forwarded-proto']
      ? String(req.headers['x-forwarded-proto']).split(',')[0].trim()
      : req.protocol;
    const host = req.get('host') || 'localhost:3000';
    return `${proto}://${host}`;
  };

  const escapeHtmlAttr = (val: string): string =>
    val
      .replace(/&/g, '&amp;')
      .replace(/"/g, '&quot;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

  const injectSeoMetadata = (html: string, req: Request): string => {
    const tabId = resolveTabFromPathname(req.path);
    const meta = TAB_SEO_METADATA[tabId] || TAB_SEO_METADATA.galeria;
    const origin = resolveOrigin(req);
    const canonicalUrl = `${origin}${meta.path}`;
    const ogImageUrl = `${origin}/og-cover.jpg`;

    return html
      .replace(/<title>[\s\S]*?<\/title>/i, `<title>${escapeHtmlAttr(meta.title)}</title>`)
      .replace(
        /<meta\s+name="description"[^>]*>/i,
        `<meta name="description" content="${escapeHtmlAttr(meta.description)}" />`
      )
      .replace(
        /<meta\s+name="keywords"[^>]*>/i,
        `<meta name="keywords" content="${escapeHtmlAttr(meta.keywords)}" />`
      )
      .replace(
        /(<!--\s*seo-canonical\s*-->|<link\s+rel="canonical"[^>]*>)/i,
        `<link rel="canonical" href="${escapeHtmlAttr(canonicalUrl)}" />`
      )
      .replace(
        /<meta\s+property="og:title"[^>]*>/i,
        `<meta property="og:title" content="${escapeHtmlAttr(meta.ogTitle)}" />`
      )
      .replace(
        /<meta\s+property="og:description"[^>]*>/i,
        `<meta property="og:description" content="${escapeHtmlAttr(meta.ogDescription)}" />`
      )
      .replace(
        /<meta\s+property="og:url"[^>]*>/i,
        `<meta property="og:url" content="${escapeHtmlAttr(canonicalUrl)}" />`
      )
      .replace(
        /<meta\s+property="og:image"[^>]*>/i,
        `<meta property="og:image" content="${escapeHtmlAttr(ogImageUrl)}" />`
      )
      .replace(
        /<meta\s+name="twitter:title"[^>]*>/i,
        `<meta name="twitter:title" content="${escapeHtmlAttr(meta.ogTitle)}" />`
      )
      .replace(
        /<meta\s+name="twitter:description"[^>]*>/i,
        `<meta name="twitter:description" content="${escapeHtmlAttr(meta.ogDescription)}" />`
      )
      .replace(
        /<meta\s+name="twitter:image"[^>]*>/i,
        `<meta name="twitter:image" content="${escapeHtmlAttr(ogImageUrl)}" />`
      )
      .replace(/(href|src)="\.\//gi, '$1="/');
  };

  app.get('/robots.txt', (req: Request, res: Response) => {
    const origin = resolveOrigin(req);
    res
      .type('text/plain')
      .send(`User-agent: *\nAllow: /\nSitemap: ${origin}/sitemap.xml\n`);
  });

  app.get('/sitemap.xml', (req: Request, res: Response) => {
    const origin = resolveOrigin(req);
    const urls = Object.values(TAB_SEO_METADATA)
      .map(
        (item) => `  <url>
    <loc>${escapeHtmlAttr(`${origin}${item.path}`)}</loc>
    <changefreq>weekly</changefreq>
    <priority>${item.path === '/' ? '1.0' : '0.8'}</priority>
  </url>`
      )
      .join('\n');
    res.type('application/xml').send(
      `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`
    );
  });

  const SPA_ROUTES = ['/', '/galeria', '/o-pracowni', '/cennik', '/dojazd', '/kontakt'];
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });

    app.get(SPA_ROUTES, async (req: Request, res: Response, next) => {
      try {
        const template = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
        const withSeo = injectSeoMetadata(template, req);
        const transformed = await vite.transformIndexHtml(req.originalUrl, withSeo);
        res.status(200).set({ 'Content-Type': 'text/html; charset=utf-8' }).end(transformed);
      } catch (err) {
        next(err);
      }
    });

    app.use(vite.middlewares);
  } else {
    const distDir = path.join(__dirname, 'dist');
    app.use(express.static(distDir, { index: false }));
    app.get('*', (req: Request, res: Response) => {
      const template = fs.readFileSync(path.join(distDir, 'index.html'), 'utf8');
      const withSeo = injectSeoMetadata(template, req);
      res.status(200).set({ 'Content-Type': 'text/html; charset=utf-8' }).end(withSeo);
    });
  }

  const port = Number(process.env.PORT || 3000);
  app.listen(port, '0.0.0.0', () => {
    console.log(`Jubiler Wołoska server listening on http://0.0.0.0:${port}`);
  });
}

createApp().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
