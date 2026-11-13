import React, { useEffect, useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { GEMSTONE_TYPES, PRECIOUS_METALS } from '../data/jewelry';
import type { JewelryPiece } from '../data/jewelry';
import type { ServicePriceItem } from '../data/workshop';

interface PricingAndQuoteViewProps {
  servicePrices: ServicePriceItem[];
  bespokePrices: ServicePriceItem[];
  phoneDisplay: string;
  prefilledPiece: JewelryPiece | null;
  onClearPrefill: () => void;
}

export const PricingAndQuoteView: React.FC<PricingAndQuoteViewProps> = ({
  servicePrices,
  bespokePrices,
  phoneDisplay,
  prefilledPiece,
  onClearPrefill,
}) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [category, setCategory] = useState('Pierścionek');
  const [metal, setMetal] = useState('Złoto żółte 585');
  const [gemstone, setGemstone] = useState('Diament / Brylant');
  const [sizeOrLength, setSizeOrLength] = useState('');
  const [budget, setBudget] = useState('3 000 – 6 000 zł');
  const [referencePiece, setReferencePiece] = useState('');
  const [notes, setNotes] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [submittedReceipt, setSubmittedReceipt] = useState<{
    inquiryId: string;
    category: string;
    metal: string;
    gemstone: string;
  } | null>(null);

  useEffect(() => {
    if (prefilledPiece) {
      setCategory(prefilledPiece.category === 'Naszyjniki' ? 'Naszyjnik' : 'Pierścionek');
      setMetal(prefilledPiece.metal);
      setGemstone(prefilledPiece.gemstone);
      setReferencePiece(prefilledPiece.name);
      setNotes(`Proszę o wycenę wariantu inspirowanego wzorem „${prefilledPiece.name}”.`);
    }
  }, [prefilledPiece]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!name.trim() || (!phone.trim() && !email.trim()) || !notes.trim()) {
      setErrorMessage('Podaj imię, telefon lub adres e-mail oraz krótki opis projektu.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          phone,
          email,
          category,
          metal,
          gemstone,
          sizeOrLength,
          budget,
          referencePiece,
          notes,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMessage(data?.error || 'Nie udało się zapisać zapytania.');
        return;
      }

      setSubmittedReceipt({
        inquiryId: data.inquiryId,
        category: data.summary?.category || category,
        metal: data.summary?.metal || metal,
        gemstone: data.summary?.gemstone || gemstone,
      });
      onClearPrefill();
      setName('');
      setPhone('');
      setEmail('');
      setSizeOrLength('');
      setReferencePiece('');
      setNotes('');
    } catch {
      setErrorMessage(`Błąd połączenia z serwerem pracowni. Zadzwoń bezpośrednio pod ${phoneDisplay}.`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-6 py-12 md:py-16">
      <div className="border-b border-[#E6E2D8] pb-8">
        <p className="text-xs font-medium tracking-wider text-[#735830] uppercase">
          Cennik i wycena indywidualna
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

      {/* Custom Project Valuation Form */}
      <section
        id="formularz-wyceny"
        className="mt-16 border border-[#E6E2D8] bg-white p-6 md:p-10"
      >
        <div className="grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <p className="text-xs font-medium tracking-wider text-[#735830] uppercase">
              Zapytanie o wycenę
            </p>
            <h2 className="mt-2 text-3xl font-medium text-[#18181B]">
              Indywidualna wycena projektu
            </h2>
            <p className="mt-3 text-sm text-[#57534E] leading-relaxed">
              Opisz krótko pomysł na pierścionek, naszyjnik lub przeróbkę własnego złota.
              Oddzwonimy lub odpiszemy z wstępną kalkulacją oraz propozycją kamieni.
            </p>
            {referencePiece && (
              <div className="mt-5 border border-[#E6E2D8] bg-[#FAF9F6] p-3.5 text-xs">
                <p className="text-[#57534E]">Wybrany wzór bazowy:</p>
                <p className="mt-1 font-medium text-[#18181B]">{referencePiece}</p>
              </div>
            )}
          </div>

          <div className="lg:col-span-8">
            {submittedReceipt ? (
              <div className="border border-[#E6E2D8] bg-[#FAF9F6] p-8">
                <div className="flex items-center gap-2.5 text-[#735830]">
                  <CheckCircle2 className="h-5 w-5" aria-hidden="true" />
                  <span className="text-xs font-semibold uppercase tracking-wider">
                    Zapytanie przyjęte
                  </span>
                </div>
                <h3 className="mt-3 text-2xl font-medium text-[#18181B]">
                  Dziękujemy za przesłanie zapytania
                </h3>
                <p className="mt-2 text-sm text-[#57534E] leading-relaxed">
                  Numer zgłoszenia:{' '}
                  <strong className="font-semibold text-[#18181B] tabular-nums">
                    {submittedReceipt.inquiryId}
                  </strong>
                  . Przygotujemy wstępną wycenę dla parametrów: {submittedReceipt.category},{' '}
                  {submittedReceipt.metal}, {submittedReceipt.gemstone}.
                </p>
                <button
                  type="button"
                  onClick={() => setSubmittedReceipt(null)}
                  className="mt-6 border border-[#18181B] bg-[#18181B] px-5 py-2.5 text-xs font-medium text-white cursor-pointer"
                >
                  Wyślij kolejne zapytanie
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="quote-category" className="block text-xs font-medium text-[#18181B] mb-1.5">
                      Rodzaj biżuterii
                    </label>
                    <select
                      id="quote-category"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="h-11 w-full border border-[#E6E2D8] bg-[#FAF9F6] px-3 text-sm text-[#18181B] focus:border-[#735830] focus:outline-none"
                    >
                      <option value="Pierścionek">Pierścionek</option>
                      <option value="Pierścionek zaręczynowy">Pierścionek zaręczynowy</option>
                      <option value="Naszyjnik">Naszyjnik / Zawieszka</option>
                      <option value="Obrączki ślubne">Obrączki ślubne</option>
                      <option value="Przeróbka powierzonego złota">Przeróbka powierzonego złota</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="quote-metal" className="block text-xs font-medium text-[#18181B] mb-1.5">
                      Preferowany kruszec
                    </label>
                    <select
                      id="quote-metal"
                      value={metal}
                      onChange={(e) => setMetal(e.target.value)}
                      className="h-11 w-full border border-[#E6E2D8] bg-[#FAF9F6] px-3 text-sm text-[#18181B] focus:border-[#735830] focus:outline-none"
                    >
                      {PRECIOUS_METALS.filter((m) => m !== 'Wszystkie kruszce').map((m) => (
                        <option key={m} value={m}>
                          {m}
                        </option>
                      ))}
                      <option value="Złoto powierzone przez klienta">Złoto powierzone przez klienta</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="quote-gemstone" className="block text-xs font-medium text-[#18181B] mb-1.5">
                      Kamień szlachetny
                    </label>
                    <select
                      id="quote-gemstone"
                      value={gemstone}
                      onChange={(e) => setGemstone(e.target.value)}
                      className="h-11 w-full border border-[#E6E2D8] bg-[#FAF9F6] px-3 text-sm text-[#18181B] focus:border-[#735830] focus:outline-none"
                    >
                      {GEMSTONE_TYPES.filter((g) => g !== 'Wszystkie kamienie').map((g) => (
                        <option key={g} value={g}>
                          {g}
                        </option>
                      ))}
                      <option value="Inny kamień (do uzgodnienia)">Inny kamień (do uzgodnienia)</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="quote-budget" className="block text-xs font-medium text-[#18181B] mb-1.5">
                      Orientacyjny budżet
                    </label>
                    <select
                      id="quote-budget"
                      value={budget}
                      onChange={(e) => setBudget(e.target.value)}
                      className="h-11 w-full border border-[#E6E2D8] bg-[#FAF9F6] px-3 text-sm text-[#18181B] focus:border-[#735830] focus:outline-none"
                    >
                      <option value="do 3 000 zł">do 3 000 zł</option>
                      <option value="3 000 – 6 000 zł">3 000 – 6 000 zł</option>
                      <option value="6 000 – 12 000 zł">6 000 – 12 000 zł</option>
                      <option value="powyżej 12 000 zł">powyżej 12 000 zł</option>
                      <option value="Wycena samej robocizny">Wycena samej robocizny</option>
                    </select>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                  <div>
                    <label htmlFor="quote-name" className="block text-xs font-medium text-[#18181B] mb-1.5">
                      Imię i nazwisko *
                    </label>
                    <input
                      id="quote-name"
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="np. Anna Kowalska"
                      className="h-11 w-full border border-[#E6E2D8] bg-[#FAF9F6] px-3 text-sm text-[#18181B] focus:border-[#735830] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label htmlFor="quote-phone" className="block text-xs font-medium text-[#18181B] mb-1.5">
                      Telefon kontaktowy *
                    </label>
                    <input
                      id="quote-phone"
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+48 500 000 000"
                      className="h-11 w-full border border-[#E6E2D8] bg-[#FAF9F6] px-3 text-sm text-[#18181B] focus:border-[#735830] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label htmlFor="quote-email" className="block text-xs font-medium text-[#18181B] mb-1.5">
                      E-mail
                    </label>
                    <input
                      id="quote-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="anna@przyklad.pl"
                      className="h-11 w-full border border-[#E6E2D8] bg-[#FAF9F6] px-3 text-sm text-[#18181B] focus:border-[#735830] focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="quote-size" className="block text-xs font-medium text-[#18181B] mb-1.5">
                    Rozmiar pierścionka lub długość naszyjnika (opcjonalnie)
                  </label>
                  <input
                    id="quote-size"
                    type="text"
                    value={sizeOrLength}
                    onChange={(e) => setSizeOrLength(e.target.value)}
                    placeholder="np. rozmiar 13 lub długość 45 cm"
                    className="h-11 w-full border border-[#E6E2D8] bg-[#FAF9F6] px-3 text-sm text-[#18181B] focus:border-[#735830] focus:outline-none"
                  />
                </div>

                <div>
                  <label htmlFor="quote-notes" className="block text-xs font-medium text-[#18181B] mb-1.5">
                    Opis projektu i oczekiwania *
                  </label>
                  <textarea
                    id="quote-notes"
                    rows={4}
                    required
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Opisz styl oprawy, wielkość kamienia, termin realizacji lub ewentualny grawer..."
                    className="w-full border border-[#E6E2D8] bg-[#FAF9F6] p-3 text-sm text-[#18181B] focus:border-[#735830] focus:outline-none"
                  />
                </div>

                {errorMessage && (
                  <p className="text-xs text-red-700 bg-red-50 border border-red-200 px-3.5 py-2.5">
                    {errorMessage}
                  </p>
                )}

                <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
                  <p className="text-xs text-[#57534E]">
                    * Wymagane: imię, telefon lub e-mail oraz opis projektu.
                  </p>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="bg-[#18181B] px-6 py-3 text-xs font-medium text-white transition-colors hover:bg-[#27272A] disabled:opacity-60 cursor-pointer whitespace-nowrap"
                  >
                    {submitting ? 'Wysyłanie zapytania...' : 'Wyślij zapytanie o wycenę'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};
