import React, { useState } from 'react';
import { Check, Clock, Copy, Mail, MapPin, Phone } from 'lucide-react';
import type { WorkshopInfo } from '../data/workshop';

interface ContactViewProps {
  workshopInfo: WorkshopInfo;
  onNavigateDirections: () => void;
  onNavigateQuote: () => void;
}

export const ContactView: React.FC<ContactViewProps> = ({
  workshopInfo,
  onNavigateDirections,
  onNavigateQuote,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopyPhone = async () => {
    try {
      await navigator.clipboard.writeText(workshopInfo.phoneDisplay);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Clipboard fallback not needed when tel: link is primary
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-6 py-12 md:py-16">
      <div className="border-b border-[#E6E2D8] pb-8">
        <p className="text-xs font-medium tracking-wider text-[#735830] uppercase">
          Kontakt z pracownią
        </p>
        <h1 className="mt-2 text-4xl md:text-5xl font-medium tracking-tight text-[#18181B]">
          Bezpośredni kontakt z jubilerem
        </h1>
        <p className="mt-3 max-w-2xl text-sm md:text-base text-[#57534E]">
          Chcesz zapytać o dostępność wzoru, termin naprawy lub potwierdzić obecność w pracowni?
          Najszybciej skontaktujesz się telefonicznie.
        </p>
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-12">
        <div className="lg:col-span-6 border border-[#E6E2D8] bg-white p-8 flex flex-col justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-[#735830]">
              Szybkie połączenie telefoniczne
            </p>
            <h2 className="mt-2 text-3xl font-medium text-[#18181B] tabular-nums">
              {workshopInfo.phoneDisplay}
            </h2>
            <p className="mt-3 text-sm text-[#57534E] leading-relaxed">
              {workshopInfo.hoursNote}
            </p>
            {workshopInfo.email && (
              <p className="mt-4 inline-flex items-center gap-2 text-xs text-[#57534E]">
                <Mail className="h-3.5 w-3.5 text-[#735830]" aria-hidden="true" />
                <span>{workshopInfo.email}</span>
              </p>
            )}
          </div>

          <div className="mt-8 space-y-3">
            <a
              href={workshopInfo.phoneHref}
              className="flex h-12 w-full items-center justify-center gap-2.5 bg-[#18181B] px-6 text-sm font-medium text-white transition-colors hover:bg-[#27272A]"
            >
              <Phone className="h-4 w-4" aria-hidden="true" />
              Zadzwoń teraz ({workshopInfo.phoneDisplay})
            </a>

            <button
              type="button"
              onClick={handleCopyPhone}
              className="flex h-11 w-full items-center justify-center gap-2 border border-[#E6E2D8] bg-[#FAF9F6] px-4 text-xs font-medium text-[#18181B] transition-colors hover:border-[#18181B] cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5 text-[#735830]" aria-hidden="true" />
                  Skopiowano numer telefonu
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" aria-hidden="true" />
                  Skopiuj numer telefonu
                </>
              )}
            </button>
          </div>
        </div>

        <div className="lg:col-span-6 space-y-6">
          <div className="border border-[#E6E2D8] bg-white p-6">
            <div className="flex items-start gap-3">
              <MapPin className="mt-0.5 h-5 w-5 text-[#735830] shrink-0" aria-hidden="true" />
              <div>
                <h3 className="text-lg font-medium text-[#18181B]">Adres pracowni</h3>
                <p className="mt-1 text-sm text-[#18181B]">{workshopInfo.fullTitle}</p>
                <p className="text-sm text-[#57534E]">{workshopInfo.streetAddress}</p>
                <p className="text-sm text-[#57534E]">{workshopInfo.postalCity}</p>
                <p className="mt-1 text-xs text-[#57534E]">{workshopInfo.landmark}</p>
                <div className="mt-4 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={onNavigateDirections}
                    className="border border-[#18181B] px-4 py-2 text-xs font-medium text-[#18181B] transition-colors hover:bg-[#18181B] hover:text-white cursor-pointer"
                  >
                    Sprawdź trasę dojazdu
                  </button>
                  <button
                    type="button"
                    onClick={onNavigateQuote}
                    className="border border-[#E6E2D8] px-4 py-2 text-xs font-medium text-[#57534E] transition-colors hover:border-[#18181B] hover:text-[#18181B] cursor-pointer"
                  >
                    Formularz wyceny projektu
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="border border-[#E6E2D8] bg-white p-6">
            <div className="flex items-start gap-3">
              <Clock className="mt-0.5 h-5 w-5 text-[#735830] shrink-0" aria-hidden="true" />
              <div className="w-full">
                <h3 className="text-lg font-medium text-[#18181B]">Godziny przyjęć</h3>
                <dl className="mt-3 divide-y divide-[#E6E2D8] text-xs">
                  {workshopInfo.typicalHours.map((row, idx) => (
                    <div key={`${row.days}-${idx}`} className="flex justify-between gap-4 py-2.5">
                      <dt className="font-medium text-[#18181B]">{row.days}</dt>
                      <dd className="text-[#57534E] tabular-nums text-right">{row.hours}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
