import { useCallback, useEffect, useState } from 'react';
import { Bell, WifiOff, X } from 'lucide-react';
import { AboutView } from './components/AboutView';
import { ContactView } from './components/ContactView';
import { DirectionsView } from './components/DirectionsView';
import { Footer } from './components/Footer';
import { GalleryView } from './components/GalleryView';
import { OwnerPanelModal } from './components/OwnerPanelModal';
import { PricingAndQuoteView } from './components/PricingAndQuoteView';
import { PushNotificationPanel } from './components/PushNotificationPanel';
import { TopNav } from './components/TopNav';
import type { AppTab } from './components/TopNav';
import { JEWELRY_COLLECTION } from './data/jewelry';
import type { JewelryPiece } from './data/jewelry';
import { resolveTabFromPathname, TAB_SEO_METADATA } from './data/seo';
import { DEFAULT_SITE_CONTENT } from './data/workshop';
import type { SiteContent } from './data/workshop';
import { useDocumentMeta } from './hooks/useDocumentMeta';
import { usePushNotifications } from './hooks/usePushNotifications';

export default function App() {
  const [activeTab, setActiveTabState] = useState<AppTab>(() =>
    typeof window !== 'undefined'
      ? resolveTabFromPathname(window.location.pathname)
      : 'galeria'
  );
  const [prefilledPiece, setPrefilledPiece] = useState<JewelryPiece | null>(null);
  const [products, setProducts] = useState<JewelryPiece[]>(JEWELRY_COLLECTION);
  const [siteContent, setSiteContent] = useState<SiteContent>(DEFAULT_SITE_CONTENT);
  const [ownerPanelOpen, setOwnerPanelOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  const push = usePushNotifications();
  useDocumentMeta(activeTab);

  const selectTab = useCallback((tab: AppTab) => {
    setActiveTabState(tab);
    const targetPath = TAB_SEO_METADATA[tab]?.path || '/';
    if (window.location.pathname !== targetPath) {
      window.history.pushState({ tab }, '', targetPath);
    }
  }, []);

  useEffect(() => {
    const handlePopState = () => {
      setActiveTabState(resolveTabFromPathname(window.location.pathname));
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const loadCatalog = useCallback(async () => {
    try {
      const res = await fetch('/api/products');
      if (!res.ok) return;
      const data = (await res.json()) as { products?: JewelryPiece[] };
      if (Array.isArray(data.products)) {
        setProducts(data.products);
      }
    } catch {
      // Fallback to built-in catalog when offline
    }
  }, []);

  const loadSiteContent = useCallback(async () => {
    try {
      const res = await fetch('/api/site-content');
      if (!res.ok) return;
      const data = (await res.json()) as SiteContent;
      if (data?.workshopInfo && data?.servicePrices) {
        setSiteContent(data);
      }
    } catch {
      // Fallback to defaults when offline
    }
  }, []);

  useEffect(() => {
    loadCatalog();
    loadSiteContent();
  }, [loadCatalog, loadSiteContent]);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleRequestPieceQuote = (piece: JewelryPiece) => {
    setPrefilledPiece(piece);
    selectTab('cennik');
    setTimeout(() => {
      document.getElementById('formularz-wyceny')?.scrollIntoView({ behavior: 'smooth' });
    }, 80);
  };

  const handleOpenQuote = () => {
    selectTab('cennik');
    setTimeout(() => {
      document.getElementById('formularz-wyceny')?.scrollIntoView({ behavior: 'smooth' });
    }, 80);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF9F6] text-[#18181B]">
      <TopNav
        brandName={siteContent.workshopInfo.brandName}
        activeTab={activeTab}
        onSelectTab={selectTab}
        onOpenQuote={handleOpenQuote}
      />

      <main className="flex-1">
        {activeTab === 'galeria' && (
          <>
            <GalleryView
              products={products}
              heroContent={siteContent.heroContent}
              onRequestPieceQuote={handleRequestPieceQuote}
              onNavigateAbout={() => {
                selectTab('o-pracowni');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />
            <PushNotificationPanel
              isSubscribed={push.isSubscribed}
              selectedTopics={push.selectedTopics}
              isLoading={push.isLoading}
              statusMessage={push.statusMessage}
              announcements={push.announcements}
              onToggleTopic={push.toggleTopic}
              onSubscribe={push.subscribe}
              onUnsubscribe={push.unsubscribe}
              onSendTest={push.sendTestNotification}
            />
          </>
        )}

        {activeTab === 'o-pracowni' && (
          <AboutView
            aboutContent={siteContent.aboutContent}
            onNavigateQuote={handleOpenQuote}
            onNavigateDirections={() => {
              selectTab('dojazd');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}

        {activeTab === 'cennik' && (
          <PricingAndQuoteView
            servicePrices={siteContent.servicePrices}
            bespokePrices={siteContent.bespokePrices}
            phoneDisplay={siteContent.workshopInfo.phoneDisplay}
            prefilledPiece={prefilledPiece}
            onClearPrefill={() => setPrefilledPiece(null)}
          />
        )}

        {activeTab === 'dojazd' && <DirectionsView workshopInfo={siteContent.workshopInfo} />}

        {activeTab === 'kontakt' && (
          <ContactView
            workshopInfo={siteContent.workshopInfo}
            onNavigateDirections={() => {
              selectTab('dojazd');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onNavigateQuote={handleOpenQuote}
          />
        )}
      </main>

      <Footer
        workshopInfo={siteContent.workshopInfo}
        onSelectTab={selectTab}
        onOpenOwnerPanel={() => setOwnerPanelOpen(true)}
      />

      <OwnerPanelModal
        isOpen={ownerPanelOpen}
        products={products}
        siteContent={siteContent}
        onClose={() => setOwnerPanelOpen(false)}
        onCatalogUpdated={loadCatalog}
        onSiteContentUpdated={(next) => setSiteContent(next)}
      />

      {/* Live Push Notification Preview Toast */}
      {push.activeAlert && (
        <div
          role="status"
          aria-live="polite"
          className="fixed right-4 bottom-4 z-50 w-[calc(100%-2rem)] max-w-sm border border-[#18181B] bg-white p-4 shadow-xl"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2 text-xs font-medium text-[#735830]">
              <Bell className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Powiadomienie push · {push.activeAlert.timestamp}</span>
            </div>
            <button
              type="button"
              onClick={push.dismissAlert}
              aria-label="Zamknij powiadomienie"
              className="p-0.5 text-[#57534E] hover:text-[#18181B] cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <p className="mt-1.5 text-sm font-medium text-[#18181B]">{push.activeAlert.title}</p>
          <p className="mt-1 text-xs text-[#57534E] leading-relaxed">{push.activeAlert.body}</p>
        </div>
      )}

      {/* Offline Connectivity Notice */}
      {!isOnline && (
        <div className="fixed bottom-4 left-4 z-50 flex items-center gap-2 border border-[#18181B] bg-[#18181B] px-3.5 py-2 text-xs font-medium text-white shadow-lg">
          <WifiOff className="h-3.5 w-3.5" aria-hidden="true" />
          <span>Tryb offline — wyświetlana jest zapisana kopia oferty</span>
        </div>
      )}
    </div>
  );
}
