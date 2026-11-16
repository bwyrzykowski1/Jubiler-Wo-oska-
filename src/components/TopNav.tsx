import React, { useState } from 'react';
import { Menu, Phone, X } from 'lucide-react';

export type AppTab = 'galeria' | 'o-pracowni' | 'cennik' | 'dojazd' | 'kontakt';

interface TopNavProps {
  brandName: string;
  activeTab: AppTab;
  phoneHref: string;
  onSelectTab: (tab: AppTab) => void;
}

const NAV_ITEMS: { id: AppTab; label: string }[] = [
  { id: 'galeria', label: 'Galeria' },
  { id: 'o-pracowni', label: 'O pracowni' },
  { id: 'cennik', label: 'Cennik' },
  { id: 'dojazd', label: 'Dojazd' },
  { id: 'kontakt', label: 'Kontakt' },
];

export const TopNav: React.FC<TopNavProps> = ({
  brandName,
  activeTab,
  phoneHref,
  onSelectTab,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSelect = (tab: AppTab) => {
    onSelectTab(tab);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className="sticky top-0 z-40 border-b border-[#E6E2D8] bg-[#FAF9F6]/95 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-8 px-6">
        <button
          type="button"
          onClick={() => handleSelect('galeria')}
          className="font-display text-2xl font-medium tracking-tight text-[#18181B] whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#735830]"
        >
          {brandName}
        </button>

        <nav
          aria-label="Nawigacja główna"
          className="hidden md:flex items-center gap-7"
        >
          {NAV_ITEMS.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleSelect(item.id)}
                aria-current={isActive ? 'page' : undefined}
                className={`relative py-1.5 text-sm font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#735830] ${
                  isActive
                    ? 'text-[#18181B]'
                    : 'text-[#57534E] hover:text-[#18181B]'
                }`}
              >
                {item.label}
                {isActive && (
                  <span
                    aria-hidden="true"
                    className="absolute right-0 bottom-0 left-0 h-px bg-[#735830]"
                  />
                )}
              </button>
            );
          })}
        </nav>

        <div className="flex items-center gap-3 shrink-0">
          <a
            href={phoneHref}
            onClick={() => setMobileMenuOpen(false)}
            className="hidden sm:inline-flex items-center gap-1.5 bg-[#18181B] px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-[#27272A] whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#735830]"
          >
            <Phone className="h-3.5 w-3.5" aria-hidden="true" />
            Zadzwoń
          </a>

          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-expanded={mobileMenuOpen}
            aria-label={mobileMenuOpen ? 'Zamknij menu' : 'Otwórz menu'}
            className="inline-flex h-11 w-11 items-center justify-center text-[#18181B] md:hidden cursor-pointer"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="border-t border-[#E6E2D8] bg-[#FAF9F6] px-6 py-4 md:hidden">
          <nav aria-label="Nawigacja mobilna" className="flex flex-col gap-1">
            {NAV_ITEMS.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleSelect(item.id)}
                  className={`flex h-11 items-center justify-between border-b border-[#E6E2D8]/60 text-left text-sm font-medium whitespace-nowrap cursor-pointer ${
                    isActive ? 'text-[#735830]' : 'text-[#18181B]'
                  }`}
                >
                  <span>{item.label}</span>
                  {isActive && <span className="text-xs text-[#735830]">Aktywna</span>}
                </button>
              );
            })}
            <a
              href={phoneHref}
              onClick={() => setMobileMenuOpen(false)}
              className="mt-3 flex h-11 w-full items-center justify-center gap-2 bg-[#18181B] text-xs font-medium text-white"
            >
              <Phone className="h-3.5 w-3.5" aria-hidden="true" />
              Zadzwoń do pracowni
            </a>
          </nav>
        </div>
      )}
    </header>
  );
};
