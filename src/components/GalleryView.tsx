import React, { useMemo, useState } from 'react';
import { ArrowRight, Gem, RotateCcw, X } from 'lucide-react';
import {
  GEMSTONE_TYPES,
  PRECIOUS_METALS,
  PRODUCT_CATEGORIES,
} from '../data/jewelry';
import type {
  GemstoneType,
  JewelryPiece,
  PreciousMetal,
  ProductCategory,
} from '../data/jewelry';
import type { HeroContent } from '../data/workshop';

interface GalleryViewProps {
  products: JewelryPiece[];
  heroContent: HeroContent;
  onRequestPieceQuote: (piece: JewelryPiece) => void;
  onNavigateAbout: () => void;
}

type SortOrder = 'newest' | 'price-asc' | 'price-desc';

const formatPrice = (price: number) =>
  new Intl.NumberFormat('pl-PL', {
    style: 'currency',
    currency: 'PLN',
    maximumFractionDigits: 0,
  }).format(price);

export const GalleryView: React.FC<GalleryViewProps> = ({
  products,
  heroContent,
  onRequestPieceQuote,
  onNavigateAbout,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<'Wszystkie' | ProductCategory>('Wszystkie');
  const [selectedMetal, setSelectedMetal] = useState<'Wszystkie kruszce' | PreciousMetal>('Wszystkie kruszce');
  const [selectedGemstone, setSelectedGemstone] = useState<'Wszystkie kamienie' | GemstoneType>('Wszystkie kamienie');
  const [sortOrder, setSortOrder] = useState<SortOrder>('newest');
  const [activePiece, setActivePiece] = useState<JewelryPiece | null>(null);
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});

  const filteredItems = useMemo(() => {
    const filtered = products.filter((item) => {
      const catMatch = selectedCategory === 'Wszystkie' || item.category === selectedCategory;
      const metalMatch = selectedMetal === 'Wszystkie kruszce' || item.metal === selectedMetal;
      const gemMatch = selectedGemstone === 'Wszystkie kamienie' || item.gemstone === selectedGemstone;
      return catMatch && metalMatch && gemMatch;
    });

    if (sortOrder === 'price-asc') {
      return [...filtered].sort((a, b) => a.pricePLN - b.pricePLN);
    }
    if (sortOrder === 'price-desc') {
      return [...filtered].sort((a, b) => b.pricePLN - a.pricePLN);
    }
    return [...filtered].sort((a, b) => Number(Boolean(b.isNew)) - Number(Boolean(a.isNew)));
  }, [products, selectedCategory, selectedMetal, selectedGemstone, sortOrder]);

  const hasActiveFilters =
    selectedCategory !== 'Wszystkie' ||
    selectedMetal !== 'Wszystkie kruszce' ||
    selectedGemstone !== 'Wszystkie kamienie';

  const resetFilters = () => {
    setSelectedCategory('Wszystkie');
    setSelectedMetal('Wszystkie kruszce');
    setSelectedGemstone('Wszystkie kamienie');
    setSortOrder('newest');
  };

  const scrollToCatalog = () => {
    const el = document.getElementById('kolekcja-katalog');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div>
      {/* Storefront Hero Split */}
      <section className="border-b border-[#E6E2D8] bg-[#FAF9F6]">
        <div className="mx-auto max-w-6xl px-6 py-12 md:py-16">
          <div className="grid gap-10 lg:grid-cols-12 lg:items-stretch">
            <div className="flex flex-col justify-center lg:col-span-5">
              <p className="text-xs font-medium tracking-wider text-[#735830] uppercase">
                {heroContent.kicker}
              </p>
              <h1 className="mt-3 text-4xl sm:text-5xl font-medium tracking-tight text-[#18181B] leading-[1.08]">
                {heroContent.headline}
              </h1>
              <p className="mt-5 text-base text-[#57534E] leading-relaxed">
                {heroContent.subheadline}
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-4">
                <button
                  type="button"
                  onClick={scrollToCatalog}
                  className="inline-flex items-center gap-2 bg-[#18181B] px-6 py-3 text-xs font-medium text-white transition-colors hover:bg-[#27272A] whitespace-nowrap shrink-0 cursor-pointer"
                >
                  Przeglądaj najnowsze wzory
                  <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={onNavigateAbout}
                  className="inline-flex items-center border-b border-[#18181B]/30 py-2 text-xs font-medium text-[#18181B] transition-colors hover:border-[#18181B] whitespace-nowrap shrink-0 cursor-pointer"
                >
                  Poznaj pracownię
                </button>
              </div>
            </div>

            <div className="lg:col-span-7">
              <div className="aspect-[16/9] lg:h-full w-full overflow-hidden bg-[#F3F1EC] border border-[#E6E2D8]">
                {!failedImages['hero'] ? (
                  <img
                    src={heroContent.image}
                    alt="Złoty pierścionek z diamentem i delikatny naszyjnik z pracowni Jubiler Wołoska"
                    referrerPolicy="no-referrer"
                    onError={() => setFailedImages((prev) => ({ ...prev, hero: true }))}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full flex-col items-center justify-center p-8 text-center text-[#57534E]">
                    <Gem className="h-8 w-8 text-[#735830]" aria-hidden="true" />
                    <span className="mt-2 font-display text-xl text-[#18181B]">
                      Jubiler Wołoska — Kolekcja Autorska
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Gallery & Interactive Filters */}
      <section id="kolekcja-katalog" className="mx-auto max-w-6xl px-6 py-14 md:py-16">
        <div className="flex flex-col gap-4 border-b border-[#E6E2D8] pb-6 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="text-3xl md:text-4xl font-medium text-[#18181B] tracking-tight">
              Galeria najnowszych wzorów
            </h2>
            <p className="mt-2 text-sm text-[#57534E]">
              Wybierz kategorię oraz filtruj biżuterię według użytego kruszcu i kamienia szlachetnego.
            </p>
          </div>
          <p className="text-xs text-[#57534E] tabular-nums">
            Wyświetlono {filteredItems.length} z {products.length} wzorów
          </p>
        </div>

        {/* Category Tabs + Metal & Gemstone Filters */}
        <div className="mt-6 space-y-4">
          <div className="flex flex-wrap items-center gap-2" role="tablist" aria-label="Kategorie produktów">
            {PRODUCT_CATEGORIES.map((category) => {
              const active = selectedCategory === category;
              return (
                <button
                  key={category}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setSelectedCategory(category)}
                  className={`border px-4 py-2 text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    active
                      ? 'border-[#18181B] bg-[#18181B] text-white'
                      : 'border-[#E6E2D8] bg-white text-[#57534E] hover:border-[#18181B] hover:text-[#18181B]'
                  }`}
                >
                  {category}
                </button>
              );
            })}
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <label htmlFor="filter-metal" className="block text-xs font-medium text-[#57534E] mb-1.5">
                Kruszec
              </label>
              <select
                id="filter-metal"
                value={selectedMetal}
                onChange={(e) => setSelectedMetal(e.target.value as 'Wszystkie kruszce' | PreciousMetal)}
                className="h-11 w-full border border-[#E6E2D8] bg-white px-3 text-sm text-[#18181B] focus:border-[#735830] focus:outline-none"
              >
                {PRECIOUS_METALS.map((metal) => (
                  <option key={metal} value={metal}>
                    {metal}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="filter-gemstone" className="block text-xs font-medium text-[#57534E] mb-1.5">
                Kamień szlachetny
              </label>
              <select
                id="filter-gemstone"
                value={selectedGemstone}
                onChange={(e) => setSelectedGemstone(e.target.value as 'Wszystkie kamienie' | GemstoneType)}
                className="h-11 w-full border border-[#E6E2D8] bg-white px-3 text-sm text-[#18181B] focus:border-[#735830] focus:outline-none"
              >
                {GEMSTONE_TYPES.map((gem) => (
                  <option key={gem} value={gem}>
                    {gem}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="sort-order" className="block text-xs font-medium text-[#57534E] mb-1.5">
                Sortowanie
              </label>
              <select
                id="sort-order"
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as SortOrder)}
                className="h-11 w-full border border-[#E6E2D8] bg-white px-3 text-sm text-[#18181B] focus:border-[#735830] focus:outline-none"
              >
                <option value="newest">Najnowsze wzory</option>
                <option value="price-asc">Cena: od najniższej</option>
                <option value="price-desc">Cena: od najwyższej</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                type="button"
                onClick={resetFilters}
                disabled={!hasActiveFilters && sortOrder === 'newest'}
                className="inline-flex h-11 w-full items-center justify-center gap-2 border border-[#E6E2D8] bg-[#F3F1EC] px-4 text-xs font-medium text-[#18181B] transition-colors hover:border-[#18181B] disabled:opacity-45 disabled:cursor-not-allowed cursor-pointer whitespace-nowrap"
              >
                <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                Resetuj filtry
              </button>
            </div>
          </div>
        </div>

        {/* Product Grid */}
        {filteredItems.length === 0 ? (
          <div className="mt-10 border border-[#E6E2D8] bg-white p-12 text-center">
            <p className="font-display text-2xl text-[#18181B]">
              Brak wzorów spełniających wybrane kryteria
            </p>
            <p className="mt-2 text-sm text-[#57534E]">
              Każde połączenie kruszcu i kamienia możemy wykonać na indywidualne zamówienie w naszej pracowni.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <button
                type="button"
                onClick={resetFilters}
                className="border border-[#18181B] bg-[#18181B] px-5 py-2.5 text-xs font-medium text-white cursor-pointer"
              >
                Pokaż wszystkie wzory
              </button>
            </div>
          </div>
        ) : (
          <div className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {filteredItems.map((piece) => (
              <article
                key={piece.id}
                className="group flex flex-col border border-[#E6E2D8] bg-white transition-transform duration-200 hover:-translate-y-0.5"
              >
                <button
                  type="button"
                  onClick={() => setActivePiece(piece)}
                  className="block w-full text-left cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#735830]"
                >
                  <div className="aspect-[4/3] w-full overflow-hidden bg-[#F3F1EC]">
                    {!failedImages[piece.id] ? (
                      <img
                        src={piece.image}
                        alt={`${piece.name} — ${piece.metal}, ${piece.gemstone}`}
                        referrerPolicy="no-referrer"
                        onError={() => setFailedImages((prev) => ({ ...prev, [piece.id]: true }))}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                      />
                    ) : (
                      <div className="flex h-full w-full flex-col items-center justify-center p-6 text-center text-[#57534E]">
                        <Gem className="h-6 w-6 text-[#735830]" aria-hidden="true" />
                        <span className="mt-2 text-xs font-medium text-[#18181B]">{piece.name}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-1 flex-col p-5">
                    <div className="flex items-center justify-between gap-2 text-xs text-[#57534E]">
                      <span className="truncate">
                        {piece.category} · {piece.metal}
                      </span>
                      {piece.isNew && (
                        <span className="text-[11px] font-medium text-[#735830] shrink-0">
                          Nowość
                        </span>
                      )}
                    </div>

                    <h3 className="mt-1.5 text-lg font-medium text-[#18181B] leading-snug">
                      {piece.name}
                    </h3>

                    <p className="mt-1 text-xs text-[#57534E]">{piece.gemstone}</p>

                    <div className="mt-4 flex items-baseline justify-between border-t border-[#E6E2D8] pt-3">
                      <span className="text-sm font-semibold text-[#18181B] tabular-nums">
                        {formatPrice(piece.pricePLN)}
                      </span>
                      <span className="text-xs text-[#735830] group-hover:underline">
                        Szczegóły wzoru
                      </span>
                    </div>
                  </div>
                </button>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* Product Detail Modal */}
      {activePiece && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-piece-title"
          onClick={() => setActivePiece(null)}
        >
          <div
            className="max-h-[90vh] w-full max-w-3xl overflow-y-auto bg-[#FAF9F6] border border-[#E6E2D8] shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="grid md:grid-cols-12">
              <div className="bg-[#F3F1EC] md:col-span-6">
                <div className="aspect-[4/3] md:h-full w-full">
                  <img
                    src={activePiece.image}
                    alt={activePiece.name}
                    referrerPolicy="no-referrer"
                    className="h-full w-full object-cover"
                  />
                </div>
              </div>

              <div className="p-6 md:p-8 md:col-span-6 flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between gap-4">
                    <p className="text-xs text-[#735830] font-medium">
                      {activePiece.category} · {activePiece.availability}
                    </p>
                    <button
                      type="button"
                      onClick={() => setActivePiece(null)}
                      aria-label="Zamknij podgląd wzoru"
                      className="p-1 text-[#57534E] hover:text-[#18181B] cursor-pointer"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>

                  <h3
                    id="modal-piece-title"
                    className="mt-2 text-2xl md:text-3xl font-medium text-[#18181B]"
                  >
                    {activePiece.name}
                  </h3>

                  <p className="mt-2 text-xl font-semibold text-[#18181B] tabular-nums">
                    {formatPrice(activePiece.pricePLN)}
                  </p>

                  <p className="mt-4 text-sm text-[#57534E] leading-relaxed">
                    {activePiece.craftDetails}
                  </p>

                  <dl className="mt-6 divide-y divide-[#E6E2D8] border-y border-[#E6E2D8] text-xs">
                    <div className="flex justify-between py-2.5 gap-4">
                      <dt className="text-[#57534E]">Kruszec</dt>
                      <dd className="font-medium text-[#18181B] text-right">{activePiece.metal}</dd>
                    </div>
                    <div className="flex justify-between py-2.5 gap-4">
                      <dt className="text-[#57534E]">Kamień</dt>
                      <dd className="font-medium text-[#18181B] text-right">{activePiece.gemstoneSpecs}</dd>
                    </div>
                    <div className="flex justify-between py-2.5 gap-4">
                      <dt className="text-[#57534E]">Masa wyrobu</dt>
                      <dd className="font-medium text-[#18181B] tabular-nums">{activePiece.weightGrams}</dd>
                    </div>
                    <div className="flex justify-between py-2.5 gap-4">
                      <dt className="text-[#57534E]">Czas wykonania</dt>
                      <dd className="font-medium text-[#18181B] tabular-nums">{activePiece.leadTime}</dd>
                    </div>
                  </dl>
                </div>

                <div className="mt-6 flex flex-col gap-2.5">
                  <button
                    type="button"
                    onClick={() => {
                      const chosen = activePiece;
                      setActivePiece(null);
                      onRequestPieceQuote(chosen);
                    }}
                    className="w-full bg-[#18181B] py-3 text-xs font-medium text-white transition-colors hover:bg-[#27272A] cursor-pointer"
                  >
                    Zapytaj o wycenę lub rozmiar tego wzoru
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
