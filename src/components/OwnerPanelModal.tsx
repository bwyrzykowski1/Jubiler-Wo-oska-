import React, { useEffect, useState } from 'react';
import {
  Bell,
  Download,
  ImagePlus,
  KeyRound,
  Lock,
  LogOut,
  Pencil,
  Plus,
  RotateCcw,
  Save,
  Trash2,
  X,
} from 'lucide-react';
import { GEMSTONE_TYPES, PRECIOUS_METALS } from '../data/jewelry';
import type {
  GemstoneType,
  JewelryPiece,
  PreciousMetal,
  ProductCategory,
} from '../data/jewelry';
import { resolveMediaUrl } from '../data/mediaAssets';
import type { ServicePriceItem, SiteContent } from '../data/workshop';
import {
  deleteOwnerInquiryData,
  deleteProductData,
  isBackendAvailable,
  loadOwnerInquiriesData,
  restoreDefaultProductsData,
  saveProductData,
  saveSiteContentData,
  updateStaticOwnerPin,
  verifyOwnerPin,
} from '../lib/workshopClient';
import type { ClientInquiry } from '../lib/workshopClient';

type OwnerInquiry = ClientInquiry;

interface OwnerPanelModalProps {
  isOpen: boolean;
  products: JewelryPiece[];
  siteContent: SiteContent;
  onClose: () => void;
  onCatalogUpdated: () => Promise<void>;
  onSiteContentUpdated: (next: SiteContent) => void;
  onAnnouncementsUpdated?: () => void;
}

type OwnerTab = 'katalog' | 'cennik' | 'o-pracowni' | 'kontakt' | 'zapytania';

const PIN_SESSION_KEY = 'jw_owner_pin_session';

async function compressImageFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Nie udało się odczytać pliku zdjęcia.'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('Wybrany plik nie jest prawidłowym obrazem.'));
      img.onload = () => {
        const maxSide = 1400;
        let width = img.width;
        let height = img.height;

        if (width > maxSide || height > maxSide) {
          if (width > height) {
            height = Math.round((height * maxSide) / width);
            width = maxSide;
          } else {
            width = Math.round((width * maxSide) / height);
            height = maxSide;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Błąd przetwarzania obrazu w przeglądarce.'));
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.88));
      };
      img.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  });
}

export const OwnerPanelModal: React.FC<OwnerPanelModalProps> = ({
  isOpen,
  products,
  siteContent,
  onClose,
  onCatalogUpdated,
  onSiteContentUpdated,
}) => {
  const [pin, setPin] = useState('');
  const [verifiedPin, setVerifiedPin] = useState<string | null>(() =>
    typeof window !== 'undefined' ? sessionStorage.getItem(PIN_SESSION_KEY) : null
  );
  const [authError, setAuthError] = useState<string | null>(null);
  const [checkingPin, setCheckingPin] = useState(false);

  const [activeTab, setActiveTab] = useState<OwnerTab>('katalog');
  const [feedback, setFeedback] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Catalog Add/Edit State
  const [catalogSubTab, setCatalogSubTab] = useState<'list' | 'add' | 'edit'>('list');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [prodName, setProdName] = useState('');
  const [prodCategory, setProdCategory] = useState<ProductCategory>('Pierścionki');
  const [prodMetal, setProdMetal] = useState<PreciousMetal>('Złoto żółte 585');
  const [prodGemstone, setProdGemstone] = useState<GemstoneType>('Diament / Brylant');
  const [prodSpecs, setProdSpecs] = useState('');
  const [prodWeight, setProdWeight] = useState('');
  const [prodPrice, setProdPrice] = useState('');
  const [prodLeadTime, setProdLeadTime] = useState('10–14 dni roboczych');
  const [prodAvailability, setProdAvailability] =
    useState<JewelryPiece['availability']>('Dostępny w pracowni');
  const [prodNote, setProdNote] = useState('');
  const [prodImageDataUrl, setProdImageDataUrl] = useState<string | null>(null);
  const [prodCurrentImage, setProdCurrentImage] = useState<string | null>(null);
  const [sendPushOnNew, setSendPushOnNew] = useState(true);

  // Editable Site Content Draft
  const [draftContent, setDraftContent] = useState<SiteContent>(siteContent);
  const [heroImageUpload, setHeroImageUpload] = useState<string | null>(null);
  const [aboutImageUpload, setAboutImageUpload] = useState<string | null>(null);

  const [backendMode, setBackendMode] = useState<'server' | 'static' | null>(null);
  const [newStaticPin, setNewStaticPin] = useState('');

  // Inquiries & Push Broadcast
  const [inquiries, setInquiries] = useState<OwnerInquiry[]>([]);
  const [loadingInquiries, setLoadingInquiries] = useState(false);
  const [pushTitle, setPushTitle] = useState('Nowość w pracowni Jubiler Wołoska');
  const [pushMessage, setPushMessage] = useState('');
  const [pushCategory, setPushCategory] = useState('Pierścionki');

  useEffect(() => {
    setDraftContent(siteContent);
  }, [siteContent, isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    isBackendAvailable().then((hasBackend) => {
      setBackendMode(hasBackend ? 'server' : 'static');
    });
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && verifiedPin && activeTab === 'zapytania') {
      setLoadingInquiries(true);
      loadOwnerInquiriesData(verifiedPin)
        .then((items) => setInquiries(items))
        .catch(() => {})
        .finally(() => setLoadingInquiries(false));
    }
  }, [isOpen, verifiedPin, activeTab]);

  if (!isOpen) return null;

  const clearMessages = () => {
    setFeedback(null);
    setErrorMsg(null);
  };

  const handleVerifyPin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setCheckingPin(true);
    try {
      const result = await verifyOwnerPin(pin);
      setBackendMode(result.mode);
      if (!result.valid) {
        setAuthError(result.error || 'Nieprawidłowy kod dostępu.');
        return;
      }
      const cleanPin = pin.trim();
      setVerifiedPin(cleanPin);
      sessionStorage.setItem(PIN_SESSION_KEY, cleanPin);
      setPin('');
    } catch {
      setAuthError('Nie udało się zweryfikować kodu PIN.');
    } finally {
      setCheckingPin(false);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem(PIN_SESSION_KEY);
    setVerifiedPin(null);
    clearMessages();
  };

  const handleChangeStaticPin = (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();
    const clean = newStaticPin.trim();
    if (clean.length < 4) {
      setErrorMsg('Nowy kod PIN powinien mieć co najmniej 4 znaki.');
      return;
    }
    updateStaticOwnerPin(clean);
    setVerifiedPin(clean);
    sessionStorage.setItem(PIN_SESSION_KEY, clean);
    setNewStaticPin('');
    setFeedback('Zaktualizowano lokalny kod PIN w tej przeglądarce.');
  };

  const handleExportBackup = () => {
    const payload = {
      exportedAt: new Date().toISOString(),
      products,
      siteContent,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `jubiler-woloska-kopia-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    setFeedback('Pobrano plik kopii zapasowej JSON (katalog i treść strony).');
  };

  const resetProductForm = () => {
    setEditingId(null);
    setProdName('');
    setProdCategory('Pierścionki');
    setProdMetal('Złoto żółte 585');
    setProdGemstone('Diament / Brylant');
    setProdSpecs('');
    setProdWeight('');
    setProdPrice('');
    setProdLeadTime('10–14 dni roboczych');
    setProdAvailability('Dostępny w pracowni');
    setProdNote('');
    setProdImageDataUrl(null);
    setProdCurrentImage(null);
  };

  const startEditProduct = (item: JewelryPiece) => {
    clearMessages();
    setEditingId(item.id);
    setProdName(item.name);
    setProdCategory(item.category);
    setProdMetal(item.metal);
    setProdGemstone(item.gemstone);
    setProdSpecs(item.gemstoneSpecs);
    setProdWeight(item.weightGrams);
    setProdPrice(String(item.pricePLN));
    setProdLeadTime(item.leadTime);
    setProdAvailability(item.availability);
    setProdNote(item.craftDetails || item.shortNote);
    setProdCurrentImage(item.image);
    setProdImageDataUrl(null);
    setCatalogSubTab('edit');
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verifiedPin) return;
    clearMessages();

    const isEditing = catalogSubTab === 'edit' && editingId;
    if (!isEditing && !prodImageDataUrl) {
      setErrorMsg('Wybierz zdjęcie biżuterii z telefonu lub komputera.');
      return;
    }

    setSaving(true);
    try {
      const result = await saveProductData(verifiedPin, isEditing ? editingId : null, {
        name: prodName,
        category: prodCategory,
        metal: prodMetal,
        gemstone: prodGemstone,
        gemstoneSpecs: prodSpecs || prodGemstone,
        weightGrams: prodWeight || '—',
        pricePLN: Number(prodPrice),
        leadTime: prodLeadTime,
        availability: prodAvailability,
        shortNote: prodNote,
        craftDetails: prodNote,
        imageDataUrl: prodImageDataUrl || undefined,
        sendPush: !isEditing && sendPushOnNew,
      });

      if (!result.ok) {
        if (result.unauthorized) handleLogout();
        setErrorMsg(result.error || 'Nie udało się zapisać zmian w wyrobie.');
        return;
      }

      await onCatalogUpdated();
      setFeedback(
        isEditing
          ? `Zaktualizowano wzór „${prodName}”.`
          : `Dodano nowy wzór „${prodName}” do galerii.`
      );
      resetProductForm();
      setCatalogSubTab('list');
    } catch {
      setErrorMsg('Nie udało się zapisać zmian w katalogu.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!verifiedPin) return;
    clearMessages();
    const ok = await deleteProductData(verifiedPin, id);
    if (ok) {
      await onCatalogUpdated();
      setFeedback('Usunięto wzór z galerii.');
    }
  };

  const handleRestoreDefaultProducts = async () => {
    if (!verifiedPin) return;
    clearMessages();
    await restoreDefaultProductsData(verifiedPin);
    await onCatalogUpdated();
    setFeedback('Przywrócono brakujące wzory domyślne.');
  };

  const saveSiteContent = async (
    patch: Partial<SiteContent> & {
      heroImageDataUrl?: string;
      aboutImageDataUrl?: string;
    },
    successLabel: string
  ) => {
    if (!verifiedPin) return;
    clearMessages();
    setSaving(true);
    try {
      const result = await saveSiteContentData(verifiedPin, patch);
      if (!result.ok) {
        if (result.unauthorized) handleLogout();
        setErrorMsg(result.error || 'Nie udało się zapisać zmian.');
        return;
      }
      if (result.siteContent) {
        onSiteContentUpdated(result.siteContent);
      }
      setHeroImageUpload(null);
      setAboutImageUpload(null);
      setFeedback(successLabel);
    } catch {
      setErrorMsg('Nie udało się zapisać zmian.');
    } finally {
      setSaving(false);
    }
  };

  const updatePriceRow = (
    listKey: 'servicePrices' | 'bespokePrices',
    idx: number,
    field: keyof ServicePriceItem,
    value: string
  ) => {
    setDraftContent((prev) => {
      const copy = [...prev[listKey]];
      copy[idx] = { ...copy[idx], [field]: value };
      return { ...prev, [listKey]: copy };
    });
  };

  const addPriceRow = (listKey: 'servicePrices' | 'bespokePrices') => {
    setDraftContent((prev) => ({
      ...prev,
      [listKey]: [
        ...prev[listKey],
        {
          service: 'Nowa usługa',
          details: 'Opis zakresu prac',
          price: 'od 100 zł',
          turnaround: '1–3 dni',
        },
      ],
    }));
  };

  const removePriceRow = (listKey: 'servicePrices' | 'bespokePrices', idx: number) => {
    setDraftContent((prev) => ({
      ...prev,
      [listKey]: prev[listKey].filter((_, i) => i !== idx),
    }));
  };

  const handleBroadcastPush = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pushMessage.trim()) {
      setErrorMsg('Wpisz treść powiadomienia o nowości.');
      return;
    }
    clearMessages();
    setSaving(true);
    try {
      if (await isBackendAvailable()) {
        const res = await fetch('./api/push/notify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: pushTitle,
            message: pushMessage,
            category: pushCategory,
            publishAnnouncement: true,
          }),
        });
        const data = await res.json();
        if (res.ok) {
          setFeedback(
            `Opublikowano ogłoszenie i wysłano powiadomienie push (dostarczono do ${data.delivered ?? 0} urządzeń).`
          );
          setPushMessage('');
        }
      } else {
        if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
          new Notification(pushTitle, {
            body: pushMessage,
            icon: './pwa-192x192.png',
          });
        }
        setFeedback(
          'W trybie statycznym (GitHub Pages) podgląd powiadomienia działa wyłącznie lokalnie — wysyłka do wszystkich subskrybentów wymaga serwera Node.js.'
        );
        setPushMessage('');
      }
    } catch {
      setErrorMsg('Nie udało się wysłać powiadomienia.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteInquiry = async (id: string) => {
    if (!verifiedPin) return;
    await deleteOwnerInquiryData(verifiedPin, id);
    setInquiries((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-3 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="owner-panel-title"
      onClick={onClose}
    >
      <div
        className="max-h-[92vh] w-full max-w-4xl overflow-y-auto bg-[#FAF9F6] border border-[#E6E2D8] p-5 sm:p-8 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-[#E6E2D8] pb-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-[#735830]">
              Zarządzanie całą stroną pracowni
            </p>
            <h2 id="owner-panel-title" className="mt-1 text-2xl md:text-3xl font-medium text-[#18181B]">
              Panel właściciela
            </h2>
          </div>
          <div className="flex items-center gap-2">
            {verifiedPin && (
              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex items-center gap-1.5 border border-[#E6E2D8] bg-white px-3 py-1.5 text-xs text-[#57534E] hover:text-[#18181B] cursor-pointer"
              >
                <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
                Wyloguj
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              aria-label="Zamknij panel właściciela"
              className="p-1.5 text-[#57534E] hover:text-[#18181B] cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {!verifiedPin ? (
          <form onSubmit={handleVerifyPin} className="mt-6 max-w-sm space-y-4">
            <div className="flex items-center gap-2 text-sm text-[#57534E]">
              <Lock className="h-4 w-4 text-[#735830] shrink-0" aria-hidden="true" />
              <span>
                Wpisz kod PIN pracowni, aby edytować cennik, zdjęcia, opisy, kontakt i przeglądać
                zapytania klientów.
              </span>
            </div>
            <div>
              <label htmlFor="owner-pin-input" className="block text-xs font-medium text-[#18181B] mb-1.5">
                Kod PIN pracowni
              </label>
              <input
                id="owner-pin-input"
                type="password"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="••••"
                required
                className="h-11 w-full border border-[#E6E2D8] bg-white px-3 text-sm text-[#18181B] focus:border-[#735830] focus:outline-none"
              />
            </div>
            {authError && (
              <p className="text-xs text-red-700 bg-red-50 border border-red-200 px-3 py-2">
                {authError}
              </p>
            )}
            <button
              type="submit"
              disabled={checkingPin}
              className="bg-[#18181B] px-5 py-2.5 text-xs font-medium text-white hover:bg-[#27272A] cursor-pointer"
            >
              {checkingPin ? 'Sprawdzanie...' : 'Odblokuj panel'}
            </button>
          </form>
        ) : (
          <div className="mt-5">
            {/* Section Navigation */}
            <div className="flex flex-wrap gap-2 border-b border-[#E6E2D8] pb-4">
              {(
                [
                  { id: 'katalog', label: `Galeria (${products.length})` },
                  { id: 'cennik', label: 'Cennik' },
                  { id: 'o-pracowni', label: 'O pracowni i Hero' },
                  { id: 'kontakt', label: 'Kontakt i Dojazd' },
                  { id: 'zapytania', label: 'Zapytania i Push' },
                ] as { id: OwnerTab; label: string }[]
              ).map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    setActiveTab(tab.id);
                    clearMessages();
                  }}
                  className={`border px-3.5 py-2 text-xs font-medium transition-colors whitespace-nowrap cursor-pointer ${
                    activeTab === tab.id
                      ? 'border-[#18181B] bg-[#18181B] text-white'
                      : 'border-[#E6E2D8] bg-white text-[#57534E] hover:border-[#18181B] hover:text-[#18181B]'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {backendMode === 'static' && (
              <div className="mt-4 border border-[#E6E2D8] bg-white p-4 space-y-3">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <p className="text-xs text-[#57534E] leading-relaxed max-w-2xl">
                    <strong className="text-[#18181B]">Tryb statyczny (GitHub Pages):</strong>{' '}
                    zmiany zapisują się w pamięci tej przeglądarki (IndexedDB). Aby opublikować
                    zmiany globalnie dla wszystkich klientów, uruchom aplikację z serwerem Node.js
                    lub pobierz kopię JSON.
                  </p>
                  <button
                    type="button"
                    onClick={handleExportBackup}
                    className="inline-flex items-center gap-1.5 border border-[#E6E2D8] bg-[#FAF9F6] px-3 py-1.5 text-xs font-medium text-[#18181B] hover:border-[#18181B] shrink-0 cursor-pointer"
                  >
                    <Download className="h-3.5 w-3.5" aria-hidden="true" />
                    Pobierz kopię JSON
                  </button>
                </div>
                <form
                  onSubmit={handleChangeStaticPin}
                  className="flex flex-wrap items-center gap-2 pt-2 border-t border-[#E6E2D8]"
                >
                  <KeyRound className="h-3.5 w-3.5 text-[#735830] shrink-0" aria-hidden="true" />
                  <label htmlFor="static-pin-change" className="text-xs text-[#57534E]">
                    Zmień PIN w tej przeglądarce:
                  </label>
                  <input
                    id="static-pin-change"
                    type="password"
                    value={newStaticPin}
                    onChange={(e) => setNewStaticPin(e.target.value)}
                    placeholder="Nowy PIN (min. 4 znaki)"
                    className="h-8 border border-[#E6E2D8] bg-[#FAF9F6] px-2.5 text-xs text-[#18181B]"
                  />
                  <button
                    type="submit"
                    className="border border-[#18181B] bg-[#18181B] px-3 py-1 text-xs font-medium text-white hover:bg-[#27272A] cursor-pointer"
                  >
                    Zapisz PIN
                  </button>
                </form>
              </div>
            )}

            {feedback && (
              <p className="mt-4 border border-[#E6E2D8] bg-white px-4 py-2.5 text-xs text-[#18181B]">
                {feedback}
              </p>
            )}
            {errorMsg && (
              <p className="mt-4 border border-red-200 bg-red-50 px-4 py-2.5 text-xs text-red-700">
                {errorMsg}
              </p>
            )}

            {/* TAB 1: KATALOG */}
            {activeTab === 'katalog' && (
              <div className="mt-6">
                <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        clearMessages();
                        resetProductForm();
                        setCatalogSubTab('list');
                      }}
                      className={`border px-3.5 py-1.5 text-xs font-medium cursor-pointer ${
                        catalogSubTab === 'list'
                          ? 'border-[#735830] bg-[#735830] text-white'
                          : 'border-[#E6E2D8] bg-white text-[#57534E]'
                      }`}
                    >
                      Lista wyrobów
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        clearMessages();
                        resetProductForm();
                        setCatalogSubTab('add');
                      }}
                      className={`inline-flex items-center gap-1.5 border px-3.5 py-1.5 text-xs font-medium cursor-pointer ${
                        catalogSubTab === 'add'
                          ? 'border-[#735830] bg-[#735830] text-white'
                          : 'border-[#E6E2D8] bg-white text-[#57534E]'
                      }`}
                    >
                      <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                      Dodaj nowy wyrób
                    </button>
                  </div>

                  {catalogSubTab === 'list' && (
                    <button
                      type="button"
                      onClick={handleRestoreDefaultProducts}
                      className="inline-flex items-center gap-1.5 border border-[#E6E2D8] bg-white px-3 py-1.5 text-xs text-[#57534E] hover:text-[#18181B] cursor-pointer"
                    >
                      <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                      Przywróć domyślne wzory
                    </button>
                  )}
                </div>

                {catalogSubTab === 'list' ? (
                  <ul className="divide-y divide-[#E6E2D8] border border-[#E6E2D8] bg-white">
                    {products.map((item) => (
                      <li
                        key={item.id}
                        className="flex flex-wrap sm:flex-nowrap items-center justify-between gap-4 p-3.5"
                      >
                        <div className="flex items-center gap-3.5 min-w-0">
                          <img
                            src={resolveMediaUrl(item.image)}
                            alt={item.name}
                            className="h-14 w-16 object-cover bg-[#F3F1EC] shrink-0"
                          />
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-[#18181B] truncate">{item.name}</p>
                            <p className="text-xs text-[#57534E] truncate tabular-nums">
                              {item.category} · {item.metal} · {item.pricePLN} zł
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={() => startEditProduct(item)}
                            className="inline-flex items-center gap-1 border border-[#E6E2D8] px-3 py-1.5 text-xs text-[#18181B] hover:border-[#18181B] cursor-pointer"
                          >
                            <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                            Edytuj
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteProduct(item.id)}
                            className="inline-flex items-center gap-1 border border-[#E6E2D8] px-3 py-1.5 text-xs text-[#57534E] hover:border-red-300 hover:text-red-700 cursor-pointer"
                          >
                            <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                            Usuń
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <form onSubmit={handleSaveProduct} className="space-y-5">
                    <div>
                      <label className="block text-xs font-medium text-[#18181B] mb-2">
                        Zdjęcie biżuterii {catalogSubTab === 'add' ? '*' : '(kliknij, aby zmienić)'}
                      </label>
                      <div className="flex flex-col sm:flex-row items-start gap-4">
                        <label className="flex h-36 w-full sm:w-48 cursor-pointer flex-col items-center justify-center border border-dashed border-[#8C6D3F] bg-white p-2 text-center hover:bg-[#F3F1EC]">
                          {prodImageDataUrl || prodCurrentImage ? (
                            <img
                              src={
                                prodImageDataUrl ||
                                (prodCurrentImage ? resolveMediaUrl(prodCurrentImage) : '')
                              }
                              alt="Podgląd zdjęcia"
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <>
                              <ImagePlus className="h-6 w-6 text-[#735830]" aria-hidden="true" />
                              <span className="mt-2 text-xs text-[#57534E]">
                                Wybierz lub zrób zdjęcie
                              </span>
                            </>
                          )}
                          <input
                            type="file"
                            accept="image/*"
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (!file) return;
                              try {
                                setProdImageDataUrl(await compressImageFile(file));
                              } catch (err) {
                                setErrorMsg(
                                  err instanceof Error ? err.message : 'Błąd odczytu zdjęcia.'
                                );
                              }
                            }}
                            className="sr-only"
                          />
                        </label>
                        <p className="text-xs text-[#57534E] leading-relaxed">
                          Zdjęcie zostanie automatycznie przeskalowane i zoptymalizowane. Najlepszy
                          efekt daje naturalne światło dzienne oraz jasne kamienne tło w kadrze 4:3.
                        </p>
                      </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className="block text-xs font-medium text-[#18181B] mb-1.5">
                          Nazwa wzoru *
                        </label>
                        <input
                          type="text"
                          required
                          value={prodName}
                          onChange={(e) => setProdName(e.target.value)}
                          className="h-11 w-full border border-[#E6E2D8] bg-white px-3 text-sm text-[#18181B]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-[#18181B] mb-1.5">
                          Cena (PLN) *
                        </label>
                        <input
                          type="number"
                          min="1"
                          required
                          value={prodPrice}
                          onChange={(e) => setProdPrice(e.target.value)}
                          className="h-11 w-full border border-[#E6E2D8] bg-white px-3 text-sm text-[#18181B] tabular-nums"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-[#18181B] mb-1.5">
                          Kategoria
                        </label>
                        <select
                          value={prodCategory}
                          onChange={(e) => setProdCategory(e.target.value as ProductCategory)}
                          className="h-11 w-full border border-[#E6E2D8] bg-white px-3 text-sm text-[#18181B]"
                        >
                          <option value="Pierścionki">Pierścionki</option>
                          <option value="Zaręczynowe">Zaręczynowe</option>
                          <option value="Naszyjniki">Naszyjniki</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-[#18181B] mb-1.5">
                          Kruszec
                        </label>
                        <select
                          value={prodMetal}
                          onChange={(e) => setProdMetal(e.target.value as PreciousMetal)}
                          className="h-11 w-full border border-[#E6E2D8] bg-white px-3 text-sm text-[#18181B]"
                        >
                          {PRECIOUS_METALS.filter((m) => m !== 'Wszystkie kruszce').map((m) => (
                            <option key={m} value={m}>
                              {m}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-[#18181B] mb-1.5">
                          Kamień szlachetny
                        </label>
                        <select
                          value={prodGemstone}
                          onChange={(e) => setProdGemstone(e.target.value as GemstoneType)}
                          className="h-11 w-full border border-[#E6E2D8] bg-white px-3 text-sm text-[#18181B]"
                        >
                          {GEMSTONE_TYPES.filter((g) => g !== 'Wszystkie kamienie').map((g) => (
                            <option key={g} value={g}>
                              {g}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-[#18181B] mb-1.5">
                          Dostępność
                        </label>
                        <select
                          value={prodAvailability}
                          onChange={(e) =>
                            setProdAvailability(e.target.value as JewelryPiece['availability'])
                          }
                          className="h-11 w-full border border-[#E6E2D8] bg-white px-3 text-sm text-[#18181B]"
                        >
                          <option value="Dostępny w pracowni">Dostępny w pracowni</option>
                          <option value="Pojedynczy egzemplarz">Pojedynczy egzemplarz</option>
                          <option value="Na zamówienie">Na zamówienie</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-[#18181B] mb-1.5">
                          Parametry kamienia
                        </label>
                        <input
                          type="text"
                          value={prodSpecs}
                          onChange={(e) => setProdSpecs(e.target.value)}
                          className="h-11 w-full border border-[#E6E2D8] bg-white px-3 text-sm text-[#18181B]"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-xs font-medium text-[#18181B] mb-1.5">
                            Masa
                          </label>
                          <input
                            type="text"
                            value={prodWeight}
                            onChange={(e) => setProdWeight(e.target.value)}
                            className="h-11 w-full border border-[#E6E2D8] bg-white px-3 text-sm text-[#18181B]"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-[#18181B] mb-1.5">
                            Realizacja
                          </label>
                          <input
                            type="text"
                            value={prodLeadTime}
                            onChange={(e) => setProdLeadTime(e.target.value)}
                            className="h-11 w-full border border-[#E6E2D8] bg-white px-3 text-sm text-[#18181B]"
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-[#18181B] mb-1.5">
                        Opis wykonania
                      </label>
                      <textarea
                        rows={3}
                        value={prodNote}
                        onChange={(e) => setProdNote(e.target.value)}
                        className="w-full border border-[#E6E2D8] bg-white p-3 text-sm text-[#18181B]"
                      />
                    </div>

                    {catalogSubTab === 'add' && (
                      <label className="flex items-center gap-2.5 text-xs text-[#18181B] cursor-pointer">
                        <input
                          type="checkbox"
                          checked={sendPushOnNew}
                          onChange={(e) => setSendPushOnNew(e.target.checked)}
                          className="h-4 w-4 accent-[#18181B]"
                        />
                        <span>Wyślij powiadomienie push o tej nowości do subskrybentów</span>
                      </label>
                    )}

                    <div className="flex justify-end gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => {
                          resetProductForm();
                          setCatalogSubTab('list');
                        }}
                        className="border border-[#E6E2D8] bg-white px-5 py-2.5 text-xs font-medium text-[#57534E] cursor-pointer"
                      >
                        Anuluj
                      </button>
                      <button
                        type="submit"
                        disabled={saving}
                        className="inline-flex items-center gap-2 bg-[#18181B] px-6 py-2.5 text-xs font-medium text-white hover:bg-[#27272A] disabled:opacity-60 cursor-pointer"
                      >
                        <Save className="h-3.5 w-3.5" aria-hidden="true" />
                        {saving
                          ? 'Zapisywanie...'
                          : catalogSubTab === 'edit'
                          ? 'Zapisz zmiany'
                          : 'Dodaj do galerii'}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}

            {/* TAB 2: CENNIK */}
            {activeTab === 'cennik' && (
              <div className="mt-6 space-y-8">
                {(
                  [
                    { key: 'servicePrices', title: 'Naprawy i serwis złotniczy' },
                    { key: 'bespokePrices', title: 'Realizacje indywidualne' },
                  ] as const
                ).map((section) => (
                  <div key={section.key} className="border border-[#E6E2D8] bg-white p-5">
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E6E2D8] pb-3">
                      <h3 className="text-lg font-medium text-[#18181B]">{section.title}</h3>
                      <button
                        type="button"
                        onClick={() => addPriceRow(section.key)}
                        className="inline-flex items-center gap-1 border border-[#18181B] px-3 py-1.5 text-xs font-medium text-[#18181B] hover:bg-[#18181B] hover:text-white cursor-pointer"
                      >
                        <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                        Dodaj pozycję
                      </button>
                    </div>

                    <div className="mt-4 space-y-4">
                      {draftContent[section.key].map((row, idx) => (
                        <div
                          key={idx}
                          className="grid gap-2.5 border-b border-[#E6E2D8] pb-4 last:border-b-0 last:pb-0 sm:grid-cols-12 sm:items-center"
                        >
                          <div className="sm:col-span-4">
                            <label className="block text-[11px] text-[#57534E] mb-1">Usługa</label>
                            <input
                              type="text"
                              value={row.service}
                              onChange={(e) =>
                                updatePriceRow(section.key, idx, 'service', e.target.value)
                              }
                              className="h-10 w-full border border-[#E6E2D8] bg-[#FAF9F6] px-2.5 text-xs text-[#18181B]"
                            />
                          </div>
                          <div className="sm:col-span-4">
                            <label className="block text-[11px] text-[#57534E] mb-1">Opis</label>
                            <input
                              type="text"
                              value={row.details}
                              onChange={(e) =>
                                updatePriceRow(section.key, idx, 'details', e.target.value)
                              }
                              className="h-10 w-full border border-[#E6E2D8] bg-[#FAF9F6] px-2.5 text-xs text-[#18181B]"
                            />
                          </div>
                          <div className="sm:col-span-2">
                            <label className="block text-[11px] text-[#57534E] mb-1">Cena</label>
                            <input
                              type="text"
                              value={row.price}
                              onChange={(e) =>
                                updatePriceRow(section.key, idx, 'price', e.target.value)
                              }
                              className="h-10 w-full border border-[#E6E2D8] bg-[#FAF9F6] px-2.5 text-xs font-medium text-[#18181B] tabular-nums"
                            />
                          </div>
                          <div className="sm:col-span-1">
                            <label className="block text-[11px] text-[#57534E] mb-1">Czas</label>
                            <input
                              type="text"
                              value={row.turnaround}
                              onChange={(e) =>
                                updatePriceRow(section.key, idx, 'turnaround', e.target.value)
                              }
                              className="h-10 w-full border border-[#E6E2D8] bg-[#FAF9F6] px-2 text-xs text-[#18181B] tabular-nums"
                            />
                          </div>
                          <div className="sm:col-span-1 flex sm:justify-end sm:pt-4">
                            <button
                              type="button"
                              onClick={() => removePriceRow(section.key, idx)}
                              aria-label="Usuń pozycję"
                              className="p-2 text-[#57534E] hover:text-red-700 cursor-pointer"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}

                <div className="flex justify-end">
                  <button
                    type="button"
                    disabled={saving}
                    onClick={() =>
                      saveSiteContent(
                        {
                          servicePrices: draftContent.servicePrices,
                          bespokePrices: draftContent.bespokePrices,
                        },
                        'Zapisano nowy cennik na stronie.'
                      )
                    }
                    className="inline-flex items-center gap-2 bg-[#18181B] px-6 py-3 text-xs font-medium text-white hover:bg-[#27272A] disabled:opacity-60 cursor-pointer"
                  >
                    <Save className="h-3.5 w-3.5" aria-hidden="true" />
                    {saving ? 'Zapisywanie...' : 'Zapisz cały cennik'}
                  </button>
                </div>
              </div>
            )}

            {/* TAB 3: O PRACOWNI I HERO */}
            {activeTab === 'o-pracowni' && (
              <div className="mt-6 space-y-6">
                <div className="border border-[#E6E2D8] bg-white p-5 space-y-4">
                  <h3 className="text-lg font-medium text-[#18181B]">Baner główny (Galeria)</h3>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-xs font-medium text-[#18181B] mb-1">
                        Nagłówek pomocniczy
                      </label>
                      <input
                        type="text"
                        value={draftContent.heroContent.kicker}
                        onChange={(e) =>
                          setDraftContent((prev) => ({
                            ...prev,
                            heroContent: { ...prev.heroContent, kicker: e.target.value },
                          }))
                        }
                        className="h-10 w-full border border-[#E6E2D8] bg-[#FAF9F6] px-3 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-[#18181B] mb-1">
                        Zdjęcie główne (Hero 16:9)
                      </label>
                      <label className="inline-flex h-10 cursor-pointer items-center gap-2 border border-[#E6E2D8] bg-[#FAF9F6] px-3 text-xs font-medium text-[#18181B] hover:border-[#18181B]">
                        <ImagePlus className="h-4 w-4 text-[#735830]" aria-hidden="true" />
                        <span>
                          {heroImageUpload ? 'Wybrano nowe zdjęcie' : 'Wgraj nowe zdjęcie Hero'}
                        </span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={async (e) => {
                            const f = e.target.files?.[0];
                            if (f) setHeroImageUpload(await compressImageFile(f));
                          }}
                          className="sr-only"
                        />
                      </label>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#18181B] mb-1">
                      Główny tytuł
                    </label>
                    <input
                      type="text"
                      value={draftContent.heroContent.headline}
                      onChange={(e) =>
                        setDraftContent((prev) => ({
                          ...prev,
                          heroContent: { ...prev.heroContent, headline: e.target.value },
                        }))
                      }
                      className="h-10 w-full border border-[#E6E2D8] bg-[#FAF9F6] px-3 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#18181B] mb-1">
                      Podtytuł
                    </label>
                    <textarea
                      rows={2}
                      value={draftContent.heroContent.subheadline}
                      onChange={(e) =>
                        setDraftContent((prev) => ({
                          ...prev,
                          heroContent: { ...prev.heroContent, subheadline: e.target.value },
                        }))
                      }
                      className="w-full border border-[#E6E2D8] bg-[#FAF9F6] p-3 text-sm"
                    />
                  </div>
                </div>

                <div className="border border-[#E6E2D8] bg-white p-5 space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <h3 className="text-lg font-medium text-[#18181B]">Zakładka „O pracowni”</h3>
                    <label className="inline-flex h-9 cursor-pointer items-center gap-2 border border-[#E6E2D8] bg-[#FAF9F6] px-3 text-xs font-medium text-[#18181B] hover:border-[#18181B]">
                      <ImagePlus className="h-4 w-4 text-[#735830]" aria-hidden="true" />
                      <span>
                        {aboutImageUpload ? 'Wybrano nowe zdjęcie' : 'Zmień zdjęcie warsztatu'}
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={async (e) => {
                          const f = e.target.files?.[0];
                          if (f) setAboutImageUpload(await compressImageFile(f));
                        }}
                        className="sr-only"
                      />
                    </label>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#18181B] mb-1">
                      Nagłówek „O pracowni”
                    </label>
                    <input
                      type="text"
                      value={draftContent.aboutContent.headline}
                      onChange={(e) =>
                        setDraftContent((prev) => ({
                          ...prev,
                          aboutContent: { ...prev.aboutContent, headline: e.target.value },
                        }))
                      }
                      className="h-10 w-full border border-[#E6E2D8] bg-[#FAF9F6] px-3 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#18181B] mb-1">
                      Akapit główny
                    </label>
                    <textarea
                      rows={3}
                      value={draftContent.aboutContent.leadParagraph}
                      onChange={(e) =>
                        setDraftContent((prev) => ({
                          ...prev,
                          aboutContent: { ...prev.aboutContent, leadParagraph: e.target.value },
                        }))
                      }
                      className="w-full border border-[#E6E2D8] bg-[#FAF9F6] p-3 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#18181B] mb-1">
                      Akapit uzupełniający
                    </label>
                    <textarea
                      rows={2}
                      value={draftContent.aboutContent.secondaryParagraph}
                      onChange={(e) =>
                        setDraftContent((prev) => ({
                          ...prev,
                          aboutContent: {
                            ...prev.aboutContent,
                            secondaryParagraph: e.target.value,
                          },
                        }))
                      }
                      className="w-full border border-[#E6E2D8] bg-[#FAF9F6] p-3 text-sm"
                    />
                  </div>

                  <div className="pt-2 border-t border-[#E6E2D8]">
                    <p className="text-xs font-medium text-[#18181B] mb-3">
                      Techniki pracy (4 pozycje)
                    </p>
                    <div className="grid gap-4 sm:grid-cols-2">
                      {draftContent.aboutContent.techniques.map((tech, idx) => (
                        <div key={idx} className="space-y-1.5 border border-[#E6E2D8] p-3 bg-[#FAF9F6]">
                          <input
                            type="text"
                            value={tech.title}
                            onChange={(e) =>
                              setDraftContent((prev) => {
                                const next = [...prev.aboutContent.techniques];
                                next[idx] = { ...next[idx], title: e.target.value };
                                return {
                                  ...prev,
                                  aboutContent: { ...prev.aboutContent, techniques: next },
                                };
                              })
                            }
                            className="h-9 w-full border border-[#E6E2D8] bg-white px-2.5 text-xs font-medium"
                          />
                          <textarea
                            rows={3}
                            value={tech.description}
                            onChange={(e) =>
                              setDraftContent((prev) => {
                                const next = [...prev.aboutContent.techniques];
                                next[idx] = { ...next[idx], description: e.target.value };
                                return {
                                  ...prev,
                                  aboutContent: { ...prev.aboutContent, techniques: next },
                                };
                              })
                            }
                            className="w-full border border-[#E6E2D8] bg-white p-2 text-xs"
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-[#E6E2D8] space-y-3">
                    <label className="block text-xs font-medium text-[#18181B]">
                      Historia pracowni (nagłówek i akapity)
                    </label>
                    <input
                      type="text"
                      value={draftContent.aboutContent.historyTitle}
                      onChange={(e) =>
                        setDraftContent((prev) => ({
                          ...prev,
                          aboutContent: { ...prev.aboutContent, historyTitle: e.target.value },
                        }))
                      }
                      className="h-10 w-full border border-[#E6E2D8] bg-[#FAF9F6] px-3 text-sm"
                    />
                    {draftContent.aboutContent.historyParagraphs.map((para, idx) => (
                      <textarea
                        key={idx}
                        rows={3}
                        value={para}
                        onChange={(e) =>
                          setDraftContent((prev) => {
                            const next = [...prev.aboutContent.historyParagraphs];
                            next[idx] = e.target.value;
                            return {
                              ...prev,
                              aboutContent: { ...prev.aboutContent, historyParagraphs: next },
                            };
                          })
                        }
                        className="w-full border border-[#E6E2D8] bg-[#FAF9F6] p-3 text-xs"
                      />
                    ))}
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="button"
                    disabled={saving}
                    onClick={() =>
                      saveSiteContent(
                        {
                          heroContent: draftContent.heroContent,
                          aboutContent: draftContent.aboutContent,
                          heroImageDataUrl: heroImageUpload || undefined,
                          aboutImageDataUrl: aboutImageUpload || undefined,
                        },
                        'Zapisano zmiany w sekcji głównej oraz „O pracowni”.'
                      )
                    }
                    className="inline-flex items-center gap-2 bg-[#18181B] px-6 py-3 text-xs font-medium text-white hover:bg-[#27272A] disabled:opacity-60 cursor-pointer"
                  >
                    <Save className="h-3.5 w-3.5" aria-hidden="true" />
                    {saving ? 'Zapisywanie...' : 'Zapisz opisy i zdjęcia'}
                  </button>
                </div>
              </div>
            )}

            {/* TAB 4: KONTAKT I DOJAZD */}
            {activeTab === 'kontakt' && (
              <div className="mt-6 space-y-6">
                <div className="border border-[#E6E2D8] bg-white p-5 space-y-4">
                  <h3 className="text-lg font-medium text-[#18181B]">
                    Dane pracowni, telefon i Google Maps
                  </h3>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-xs font-medium text-[#18181B] mb-1">
                        Krótka nazwa w nagłówku
                      </label>
                      <input
                        type="text"
                        value={draftContent.workshopInfo.brandName}
                        onChange={(e) =>
                          setDraftContent((prev) => ({
                            ...prev,
                            workshopInfo: { ...prev.workshopInfo, brandName: e.target.value },
                          }))
                        }
                        className="h-10 w-full border border-[#E6E2D8] bg-[#FAF9F6] px-3 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-[#18181B] mb-1">
                        Pełna nazwa pracowni
                      </label>
                      <input
                        type="text"
                        value={draftContent.workshopInfo.fullTitle}
                        onChange={(e) =>
                          setDraftContent((prev) => ({
                            ...prev,
                            workshopInfo: { ...prev.workshopInfo, fullTitle: e.target.value },
                          }))
                        }
                        className="h-10 w-full border border-[#E6E2D8] bg-[#FAF9F6] px-3 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-[#18181B] mb-1">
                        Numer telefonu (przycisk Zadzwoń)
                      </label>
                      <input
                        type="text"
                        value={draftContent.workshopInfo.phoneDisplay}
                        onChange={(e) =>
                          setDraftContent((prev) => ({
                            ...prev,
                            workshopInfo: { ...prev.workshopInfo, phoneDisplay: e.target.value },
                          }))
                        }
                        className="h-10 w-full border border-[#E6E2D8] bg-[#FAF9F6] px-3 text-sm tabular-nums"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-[#18181B] mb-1">
                        Adres e-mail
                      </label>
                      <input
                        type="email"
                        value={draftContent.workshopInfo.email}
                        onChange={(e) =>
                          setDraftContent((prev) => ({
                            ...prev,
                            workshopInfo: { ...prev.workshopInfo, email: e.target.value },
                          }))
                        }
                        className="h-10 w-full border border-[#E6E2D8] bg-[#FAF9F6] px-3 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-[#18181B] mb-1">
                        Ulica i pawilon
                      </label>
                      <input
                        type="text"
                        value={draftContent.workshopInfo.streetAddress}
                        onChange={(e) =>
                          setDraftContent((prev) => ({
                            ...prev,
                            workshopInfo: { ...prev.workshopInfo, streetAddress: e.target.value },
                          }))
                        }
                        className="h-10 w-full border border-[#E6E2D8] bg-[#FAF9F6] px-3 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-[#18181B] mb-1">
                        Kod pocztowy i miasto
                      </label>
                      <input
                        type="text"
                        value={draftContent.workshopInfo.postalCity}
                        onChange={(e) =>
                          setDraftContent((prev) => ({
                            ...prev,
                            workshopInfo: { ...prev.workshopInfo, postalCity: e.target.value },
                          }))
                        }
                        className="h-10 w-full border border-[#E6E2D8] bg-[#FAF9F6] px-3 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-[#18181B] mb-1">
                        Link do wizytówki Google Maps
                      </label>
                      <input
                        type="url"
                        value={draftContent.workshopInfo.mapsShortUrl}
                        onChange={(e) =>
                          setDraftContent((prev) => ({
                            ...prev,
                            workshopInfo: { ...prev.workshopInfo, mapsShortUrl: e.target.value },
                          }))
                        }
                        className="h-10 w-full border border-[#E6E2D8] bg-[#FAF9F6] px-3 text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-[#18181B] mb-1">
                        Punkt docelowy w nawigacji Google Maps
                      </label>
                      <input
                        type="text"
                        value={draftContent.workshopInfo.mapsDestinationQuery}
                        onChange={(e) =>
                          setDraftContent((prev) => ({
                            ...prev,
                            workshopInfo: {
                              ...prev.workshopInfo,
                              mapsDestinationQuery: e.target.value,
                            },
                          }))
                        }
                        className="h-10 w-full border border-[#E6E2D8] bg-[#FAF9F6] px-3 text-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#18181B] mb-1">
                      Informacja o potwierdzaniu wizyt / godzinach otwarcia
                    </label>
                    <textarea
                      rows={2}
                      value={draftContent.workshopInfo.hoursNote}
                      onChange={(e) =>
                        setDraftContent((prev) => ({
                          ...prev,
                          workshopInfo: { ...prev.workshopInfo, hoursNote: e.target.value },
                        }))
                      }
                      className="w-full border border-[#E6E2D8] bg-[#FAF9F6] p-3 text-xs"
                    />
                  </div>

                  <div className="pt-2 border-t border-[#E6E2D8]">
                    <p className="text-xs font-medium text-[#18181B] mb-2">Godziny przyjęć</p>
                    <div className="space-y-2">
                      {draftContent.workshopInfo.typicalHours.map((row, idx) => (
                        <div key={idx} className="grid grid-cols-2 gap-3">
                          <input
                            type="text"
                            value={row.days}
                            onChange={(e) =>
                              setDraftContent((prev) => {
                                const next = [...prev.workshopInfo.typicalHours];
                                next[idx] = { ...next[idx], days: e.target.value };
                                return {
                                  ...prev,
                                  workshopInfo: { ...prev.workshopInfo, typicalHours: next },
                                };
                              })
                            }
                            className="h-9 border border-[#E6E2D8] bg-[#FAF9F6] px-2.5 text-xs"
                          />
                          <input
                            type="text"
                            value={row.hours}
                            onChange={(e) =>
                              setDraftContent((prev) => {
                                const next = [...prev.workshopInfo.typicalHours];
                                next[idx] = { ...next[idx], hours: e.target.value };
                                return {
                                  ...prev,
                                  workshopInfo: { ...prev.workshopInfo, typicalHours: next },
                                };
                              })
                            }
                            className="h-9 border border-[#E6E2D8] bg-[#FAF9F6] px-2.5 text-xs tabular-nums"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="button"
                    disabled={saving}
                    onClick={() =>
                      saveSiteContent(
                        { workshopInfo: draftContent.workshopInfo },
                        'Zapisano dane kontaktowe, godziny przyjęć i adres pracowni.'
                      )
                    }
                    className="inline-flex items-center gap-2 bg-[#18181B] px-6 py-3 text-xs font-medium text-white hover:bg-[#27272A] disabled:opacity-60 cursor-pointer"
                  >
                    <Save className="h-3.5 w-3.5" aria-hidden="true" />
                    {saving ? 'Zapisywanie...' : 'Zapisz dane kontaktowe'}
                  </button>
                </div>
              </div>
            )}

            {/* TAB 5: ZAPYTANIA I PUSH */}
            {activeTab === 'zapytania' && (
              <div className="mt-6 space-y-8">
                <form
                  onSubmit={handleBroadcastPush}
                  className="border border-[#E6E2D8] bg-white p-5 space-y-4"
                >
                  <div className="flex items-center gap-2">
                    <Bell className="h-4 w-4 text-[#735830]" aria-hidden="true" />
                    <h3 className="text-lg font-medium text-[#18181B]">
                      Wyślij powiadomienie push o nowości
                    </h3>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-3">
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-medium text-[#18181B] mb-1">
                        Tytuł powiadomienia
                      </label>
                      <input
                        type="text"
                        value={pushTitle}
                        onChange={(e) => setPushTitle(e.target.value)}
                        className="h-10 w-full border border-[#E6E2D8] bg-[#FAF9F6] px-3 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-[#18181B] mb-1">
                        Kategoria
                      </label>
                      <select
                        value={pushCategory}
                        onChange={(e) => setPushCategory(e.target.value)}
                        className="h-10 w-full border border-[#E6E2D8] bg-[#FAF9F6] px-3 text-sm"
                      >
                        <option value="Pierścionki">Pierścionki</option>
                        <option value="Naszyjniki">Naszyjniki</option>
                        <option value="Kamienie kolekcjonerskie">Kamienie kolekcjonerskie</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#18181B] mb-1">
                      Treść komunikatu
                    </label>
                    <textarea
                      rows={2}
                      value={pushMessage}
                      onChange={(e) => setPushMessage(e.target.value)}
                      placeholder="np. Do pracowni dotarły naturalne szafiry cejlońskie — zapraszamy na przymiarkę lub kontakt."
                      className="w-full border border-[#E6E2D8] bg-[#FAF9F6] p-3 text-sm"
                    />
                  </div>
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={saving}
                      className="bg-[#735830] px-5 py-2.5 text-xs font-medium text-white hover:bg-[#5E4725] cursor-pointer"
                    >
                      Wyślij powiadomienie push
                    </button>
                  </div>
                </form>

                <div className="border border-[#E6E2D8] bg-white p-5">
                  <h3 className="text-lg font-medium text-[#18181B] border-b border-[#E6E2D8] pb-3">
                    Zapytania o wycenę od klientów ({inquiries.length})
                  </h3>
                  {loadingInquiries ? (
                    <p className="py-6 text-xs text-[#57534E]">Ładowanie zapytań...</p>
                  ) : inquiries.length === 0 ? (
                    <p className="py-6 text-xs text-[#57534E]">
                      Brak nowych zapytań z formularza wyceny.
                    </p>
                  ) : (
                    <ul className="divide-y divide-[#E6E2D8]">
                      {inquiries.map((inq) => (
                        <li key={inq.id} className="py-4 space-y-2">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div className="text-xs text-[#57534E]">
                              <strong className="text-[#18181B]">{inq.name}</strong>
                              <span aria-hidden="true"> · </span>
                              <span className="tabular-nums">{inq.id}</span>
                              <span aria-hidden="true"> · </span>
                              <span className="tabular-nums">
                                {new Date(inq.createdAt).toLocaleDateString('pl-PL')}
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleDeleteInquiry(inq.id)}
                              className="text-xs text-[#57534E] hover:text-red-700 cursor-pointer"
                            >
                              Usuń
                            </button>
                          </div>
                          <p className="text-xs text-[#18181B]">
                            {inq.category} · {inq.metal} · {inq.gemstone} · Budżet: {inq.budget}
                            {inq.sizeOrLength ? ` · Rozmiar/długość: ${inq.sizeOrLength}` : ''}
                          </p>
                          <p className="text-xs text-[#57534E]">{inq.notes}</p>
                          <p className="text-xs text-[#735830] tabular-nums">
                            {inq.phone ? `Tel: ${inq.phone}` : ''}{' '}
                            {inq.email ? `E-mail: ${inq.email}` : ''}
                          </p>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
