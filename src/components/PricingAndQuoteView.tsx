import React from 'react';
import { MapPin, Phone } from 'lucide-react';
import type { ServicePriceItem } from '../data/workshop';

interface PricingAndQuoteViewProps {
  servicePrices: ServicePriceItem[];
  bespokePrices: ServicePriceItem[];
  phoneDisplay: string;
  phoneHref: string;
  onNavigateContact: () => void;
  onNavigateDirections: () => void;
}

export const PricingAndQuoteView: React.FC<PricingAndQuoteViewProps> = ({
  servicePrices,
  bespokePrices,
  phoneDisplay,
  phoneHref,
  onNavigateContact,
  onNavigateDirections,
}) => {
  return (
    <div className="mx-auto max-w-6xl px-6 py-12 md:py-16">
      <div className="border-b border-[#E6E2D8] pb-8">
        <p className="text-xs font-medium tracking-wider text-[#735830] uppercase">
          Cennik pracowni
        </p>
        <h1 className="mt-2 text-4xl md:text-5xl font-medium tracking-tight text-[#18181B]">
          Cennik usług i projektów autorskich
        </h1>
        <p className="mt-3 max-w-2xl text-sm md:text-base text-[#57534E]">
          Podane kwoty mają charakter orientacyjny — dokładną wycenę przedstawiamy przed
          rozpoczęciem prac po obejrzeniu biżuterii lub ustaleniu parametrów kamienia.
        </p>
      </div>

      {/* Price Tables */}
      <div className="mt-12 grid gap-12 lg:grid-cols-2">
        <section>
          <h2 className="text-2xl font-medium text-[#18181B]">Naprawy i serwis złotniczy</h2>
          <div className="mt-5 divide-y divide-[#E6E2D8] border-y border-[#E6E2D8]">
            {servicePrices.map((row, idx) => (
              <div key={`${row.service}-${idx}`} className="py-4 flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-[#18181B]">{row.service}</p>
                  <p className="mt-1 text-xs text-[#57534E]">{row.details}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-semibold text-[#18181B] tabular-nums">{row.price}</p>
                  <p className="mt-0.5 text-xs text-[#57534E] tabular-nums">{row.turnaround}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-medium text-[#18181B]">Realizacje indywidualne</h2>
          <div className="mt-5 divide-y divide-[#E6E2D8] border-y border-[#E6E2D8]">
            {bespokePrices.map((row, idx) => (
              <div key={`${row.service}-${idx}`} className="py-4 flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-[#18181B]">{row.service}</p>
                  <p className="mt-1 text-xs text-[#57534E]">{row.details}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-semibold text-[#18181B] tabular-nums">{row.price}</p>
                  <p className="mt-0.5 text-xs text-[#57534E] tabular-nums">{row.turnaround}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Direct Contact Note */}
      <section className="mt-16 border border-[#E6E2D8] bg-white p-6 md:p-10">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-xl">
            <p className="text-xs font-medium tracking-wider text-[#735830] uppercase">
              Konsultacja w pracowni
            </p>
            <h2 className="mt-2 text-2xl md:text-3xl font-medium text-[#18181B]">
              Dokładna wycena po rozmowie lub obejrzeniu wyrobu
            </h2>
            <p className="mt-2.5 text-sm text-[#57534E] leading-relaxed">
              W sprawie indywidualnych projektów, doboru kamieni czy naprawy pamiątkowej biżuterii
              zapraszamy do kontaktu telefonicznego lub bezpośredniej wizyty w pracowni na Mokotowie.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 shrink-0">
            <a
              href={phoneHref}
              className="inline-flex items-center gap-2 bg-[#18181B] px-5 py-3 text-xs font-medium text-white transition-colors hover:bg-[#27272A] whitespace-nowrap"
            >
              <Phone className="h-3.5 w-3.5" aria-hidden="true" />
              Zadzwoń ({phoneDisplay})
            </a>
            <button
              type="button"
              onClick={onNavigateDirections}
              className="inline-flex items-center gap-2 border border-[#E6E2D8] bg-[#FAF9F6] px-5 py-3 text-xs font-medium text-[#18181B] transition-colors hover:border-[#18181B] cursor-pointer whitespace-nowrap"
            >
              <MapPin className="h-3.5 w-3.5 text-[#735830]" aria-hidden="true" />
              Dojazd do pracowni
            </button>
            <button
              type="button"
              onClick={onNavigateContact}
              className="border border-[#E6E2D8] bg-white px-5 py-3 text-xs font-medium text-[#57534E] transition-colors hover:border-[#18181B] hover:text-[#18181B] cursor-pointer whitespace-nowrap"
            >
              Dane kontaktowe
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
