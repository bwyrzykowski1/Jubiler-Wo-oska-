import React from 'react';
import { Phone } from 'lucide-react';
import type { WorkshopInfo } from '../data/workshop';
import { PWAInstallButton } from './PWAInstallButton';
import type { AppTab } from './TopNav';

interface FooterProps {
  workshopInfo: WorkshopInfo;
  onSelectTab: (tab: AppTab) => void;
  onOpenOwnerPanel: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  workshopInfo,
  onSelectTab,
  onOpenOwnerPanel,
}) => {
  const handleNav = (tab: AppTab) => {
    onSelectTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="border-t border-[#E6E2D8] bg-[#FAF9F6] py-12">
      <div className="mx-auto max-w-6xl px-6">
        <div className="grid gap-8 md:grid-cols-12 md:items-start">
          <div className="md:col-span-5">
            <p className="font-display text-2xl font-medium text-[#18181B]">
              {workshopInfo.brandName}
            </p>
            <p className="mt-2 text-xs text-[#57534E] leading-relaxed">
              {workshopInfo.streetAddress}
              <br />
              {workshopInfo.postalCity}
            </p>
            <a
              href={workshopInfo.phoneHref}
              className="mt-3 inline-flex items-center gap-2 text-xs font-medium text-[#18181B] hover:text-[#735830]"
            >
              <Phone className="h-3.5 w-3.5" aria-hidden="true" />
              <span className="tabular-nums">{workshopInfo.phoneDisplay}</span>
            </a>
          </div>

          <div className="md:col-span-4">
            <p className="text-xs font-medium uppercase tracking-wider text-[#57534E]">
              Karty strony
            </p>
            <ul className="mt-3 grid grid-cols-2 gap-y-2 gap-x-4 text-xs">
              <li>
                <button
                  type="button"
                  onClick={() => handleNav('galeria')}
                  className="text-[#18181B] hover:text-[#735830] cursor-pointer"
                >
                  Galeria wzorów
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handleNav('o-pracowni')}
                  className="text-[#18181B] hover:text-[#735830] cursor-pointer"
                >
                  O pracowni
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handleNav('cennik')}
                  className="text-[#18181B] hover:text-[#735830] cursor-pointer"
                >
                  Cennik i wycena
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handleNav('dojazd')}
                  className="text-[#18181B] hover:text-[#735830] cursor-pointer"
                >
                  Dojazd Google Maps
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handleNav('kontakt')}
                  className="text-[#18181B] hover:text-[#735830] cursor-pointer"
                >
                  Kontakt i telefon
                </button>
              </li>
            </ul>
          </div>

          <div className="md:col-span-3 flex flex-col items-start md:items-end gap-3">
            <PWAInstallButton />
            <a
              href={workshopInfo.mapsShortUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-[#57534E] underline underline-offset-4 hover:text-[#18181B]"
            >
              Punkt w Google Maps
            </a>
          </div>
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-[#E6E2D8] pt-6 text-xs text-[#57534E]">
          <p>© {new Date().getFullYear()} {workshopInfo.fullTitle}</p>
          <div className="flex flex-wrap items-center gap-4">
            <span>Mokotów · Ręczne złotnictwo i oprawa kamieni szlachetnych</span>
            <button
              type="button"
              onClick={onOpenOwnerPanel}
              className="underline underline-offset-4 hover:text-[#18181B] cursor-pointer"
            >
              Panel właściciela
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
