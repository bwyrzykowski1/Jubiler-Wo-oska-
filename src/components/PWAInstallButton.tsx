import React, { useState } from 'react';
import { Download, X } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  if (isInstalled) {
    return null;
  }

  if (isInstallable) {
    return (
      <button
        type="button"
        onClick={install}
        className="inline-flex items-center gap-2 border border-[#18181B]/20 bg-white px-4 py-2 text-xs font-medium text-[#18181B] transition-colors hover:border-[#18181B] hover:bg-[#18181B] hover:text-white whitespace-nowrap shrink-0 cursor-pointer"
      >
        <Download className="h-3.5 w-3.5" aria-hidden="true" />
        Zainstaluj aplikację
      </button>
    );
  }

  if (isIOS) {
    return (
      <>
        <button
          type="button"
          onClick={() => setShowIOSGuide(true)}
          className="inline-flex items-center gap-2 border border-[#18181B]/20 bg-white px-4 py-2 text-xs font-medium text-[#18181B] transition-colors hover:border-[#18181B] whitespace-nowrap shrink-0 cursor-pointer"
        >
          <Download className="h-3.5 w-3.5" aria-hidden="true" />
          Dodaj do ekranu (iOS)
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-sm bg-white p-6 border border-[#E6E2D8] shadow-xl">
              <div className="flex items-start justify-between gap-4">
                <h3 className="text-xl font-medium text-[#18181B]">
                  Dodaj Jubiler Wołoska do ekranu
                </h3>
                <button
                  type="button"
                  onClick={() => setShowIOSGuide(false)}
                  aria-label="Zamknij instrukcję"
                  className="p-1 text-[#57534E] hover:text-[#18181B] cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <ol className="mt-4 space-y-2 text-sm text-[#57534E] leading-relaxed">
                <li>1. Stuknij ikonę Udostępnij na pasku przeglądarki Safari.</li>
                <li>2. Wybierz opcję „Do ekranu początkowego”.</li>
                <li>3. Zatwierdź nazwę skrótu i stuknij „Dodaj”.</li>
              </ol>
              <button
                type="button"
                onClick={() => setShowIOSGuide(false)}
                className="mt-6 w-full bg-[#18181B] py-2.5 text-xs font-medium text-white transition-colors hover:bg-[#27272A] cursor-pointer"
              >
                Rozumiem
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
