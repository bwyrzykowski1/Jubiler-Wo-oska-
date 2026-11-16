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
import {
  isBackendAvailable,
  loadCatalogData,
  loadSiteContentData,
} from './lib/workshopClient';

export default function App() {
  const [activeTab, setActiveTabState] = useState<AppTab>(() =>
    typeof window !== 'undefined'
      ? resolveTabFromPathname(window.location.pathname, window.location.hash)
      : 'galeria'
  );
  const [hasBackend, setHasBackend] = useState<boolean | null>(null);
  const [products, setProducts] = useState<JewelryPiece[]>(JEWELRY_COLLECTION);
  const [siteContent, setSiteContent] = useState<SiteContent>(DEFAULT_SITE_CONTENT);
  const [ownerPanelOpen, setOwnerPanelOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  const push = usePushNotifications();
  useDocumentMeta(activeTab);

  useEffect(() => {
    isBackendAvailable().then((available) => setHasBackend(available));
  }, []);

  const selectTab = useCallback(
    (tab: AppTab) => {
      setActiveTabState(tab);
      if (hasBackend) {
        const targetPath = TAB_SEO_METADATA[tab]?.path || '/';
        if (window.location.pathname !== targetPath) {
          window.history.pushState({ tab }, '', targetPath);
        }
      } else {
        const targetHash = tab === 'galeria' ? '' : `#${tab}`;
        if (window.location.hash !== targetHash) {
          window.history.pushState({ tab }, '', targetHash || window.location.pathname);
        }
      }
    },
    [hasBackend]
  );

  useEffect(() => {
    const handlePopState = () => {
      setActiveTabState(
        resolveTabFromPathname(window.location.pathname, window.location.hash)
      );
    };
    window.addEventListener('popstate', handlePopState);
    window.addEventListener('hashchange', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('hashchange', handlePopState);
    };
  }, []);

  const loadCatalog = useCallback(async () => {
    const items = await loadCatalogData();
    setProducts(items);
  }, []);

  const loadSiteContent = useCallback(async () => {
    const content = await loadSiteContentData();
    setSiteContent(content);
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

  const navigateToTab = (tab: AppTab) => {
    selectTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF9F6] text-[#18181B]">
      <TopNav
        brandName={siteContent.workshopInfo.brandName}
        activeTab={activeTab}
        phoneHref={siteContent.workshopInfo.phoneHref}
        onSelectTab={selectTab}
      />

      <main className="flex-1">
        {activeTab === 'galeria' && (
          <>
            <GalleryView
              products={products}
              heroContent={siteContent.heroContent}
              onContactAboutPiece={() => navigateToTab('kontakt')}
              onNavigateAbout={() => navigateToTab('o-pracowni')}
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
            onNavigateContact={() => navigateToTab('kontakt')}
            onNavigateDirections={() => navigateToTab('dojazd')}
          />
        )}

        {activeTab === 'cennik' && (
          <PricingAndQuoteView
            servicePrices={siteContent.servicePrices}
            bespokePrices={siteContent.bespokePrices}
            phoneDisplay={siteContent.workshopInfo.phoneDisplay}
            phoneHref={siteContent.workshopInfo.phoneHref}
            onNavigateContact={() => navigateToTab('kontakt')}
            onNavigateDirections={() => navigateToTab('dojazd')}
          />
        )}

        {activeTab === 'dojazd' && <DirectionsView workshopInfo={siteContent.workshopInfo} />}

        {activeTab === 'kontakt' && (
          <ContactView
            workshopInfo={siteContent.workshopInfo}
            onNavigateDirections={() => navigateToTab('dojazd')}
            onNavigatePricing={() => navigateToTab('cennik')}
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

      {!isOnline && (
        <div className="fixed bottom-4 left-4 z-50 flex items-center gap-2 border border-[#18181B] bg-[#18181B] px-3.5 py-2 text-xs font-medium text-white shadow-lg">
          <WifiOff className="h-3.5 w-3.5" aria-hidden="true" />
          <span>Tryb offline — wyświetlana jest zapisana kopia oferty</span>
        </div>
      )}
    </div>
  );
}
