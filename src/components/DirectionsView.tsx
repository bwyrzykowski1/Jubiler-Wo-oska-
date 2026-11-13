import React, { useMemo, useState } from 'react';
import {
  Bike,
  Car,
  Compass,
  ExternalLink,
  Footprints,
  LocateFixed,
  MapPin,
  TrainFront,
} from 'lucide-react';
import type { WorkshopInfo } from '../data/workshop';

type TravelMode = 'driving' | 'transit' | 'walking' | 'bicycling';

interface DirectionsViewProps {
  workshopInfo: WorkshopInfo;
}

const TRAVEL_MODES: { id: TravelMode; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'driving', label: 'Samochód', icon: Car },
  { id: 'transit', label: 'Komunikacja', icon: TrainFront },
  { id: 'walking', label: 'Pieszo', icon: Footprints },
  { id: 'bicycling', label: 'Rower', icon: Bike },
];

export const DirectionsView: React.FC<DirectionsViewProps> = ({ workshopInfo }) => {
  const [origin, setOrigin] = useState('');
  const [travelMode, setTravelMode] = useState<TravelMode>('transit');
  const [geoStatus, setGeoStatus] = useState<string | null>(null);
  const [locating, setLocating] = useState(false);

  const googleMapsDirectionsUrl = useMemo(() => {
    const params = new URLSearchParams({
      api: '1',
      destination: workshopInfo.mapsDestinationQuery,
      travelmode: travelMode,
    });
    if (origin.trim()) {
      params.set('origin', origin.trim());
    }
    return `https://www.google.com/maps/dir/?${params.toString()}`;
  }, [origin, travelMode, workshopInfo.mapsDestinationQuery]);

  const mapEmbedUrl = useMemo(() => {
    const query = encodeURIComponent(workshopInfo.mapsDestinationQuery);
    return `https://maps.google.com/maps?q=${query}&t=&z=16&ie=UTF8&iwloc=&output=embed`;
  }, [workshopInfo.mapsDestinationQuery]);

  const handleUseCurrentLocation = () => {
    if (!('geolocation' in navigator)) {
      setGeoStatus('Twoja przeglądarka nie obsługuje geolokalizacji. Wpisz adres początkowy ręcznie.');
      return;
    }

    setLocating(true);
    setGeoStatus(null);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords = `${position.coords.latitude.toFixed(6)},${position.coords.longitude.toFixed(6)}`;
        setOrigin(coords);
        setGeoStatus('Pobrano bieżące współrzędne GPS jako punkt startowy.');
        setLocating(false);
      },
      () => {
        setGeoStatus('Nie udało się pobrać lokalizacji. Wpisz ulicę lub dzielnicę startową ręcznie.');
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  return (
    <div className="mx-auto max-w-6xl px-6 py-12 md:py-16">
      <div className="border-b border-[#E6E2D8] pb-8">
        <p className="text-xs font-medium tracking-wider text-[#735830] uppercase">
          Lokalizacja i wyznaczanie trasy
        </p>
        <h1 className="mt-2 text-4xl md:text-5xl font-medium tracking-tight text-[#18181B]">
          Dojazd do pracowni w Google Maps
        </h1>
        <p className="mt-3 max-w-2xl text-sm md:text-base text-[#57534E]">
          Wyznacz trasę z dowolnego miejsca — punktem docelowym jest zawsze nasza pracownia{' '}
          <strong className="font-medium text-[#18181B]">{workshopInfo.brandName}</strong> przy{' '}
          {workshopInfo.streetAddress}.
        </p>
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-12">
        <div className="lg:col-span-5 space-y-6">
          <div className="border border-[#E6E2D8] bg-white p-6">
            <div className="flex items-start gap-3 border-b border-[#E6E2D8] pb-5">
              <MapPin className="mt-0.5 h-5 w-5 text-[#735830] shrink-0" aria-hidden="true" />
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-[#735830]">
                  Stały punkt docelowy
                </p>
                <p className="mt-1 text-base font-medium text-[#18181B]">
                  {workshopInfo.brandName}
                </p>
                <p className="text-sm text-[#57534E]">{workshopInfo.streetAddress}</p>
                <p className="text-sm text-[#57534E]">{workshopInfo.postalCity}</p>
              </div>
            </div>

            <div className="mt-5 space-y-4">
              <div>
                <label
                  htmlFor="route-origin"
                  className="block text-xs font-medium text-[#18181B] mb-1.5"
                >
                  Punkt startowy (opcjonalnie)
                </label>
                <input
                  id="route-origin"
                  type="text"
                  value={origin}
                  onChange={(e) => setOrigin(e.target.value)}
                  placeholder="np. Dworzec Centralny, Warszawa lub kod pocztowy"
                  className="h-11 w-full border border-[#E6E2D8] bg-[#FAF9F6] px-3 text-sm text-[#18181B] focus:border-[#735830] focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleUseCurrentLocation}
                  disabled={locating}
                  className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-[#735830] hover:underline cursor-pointer"
                >
                  <LocateFixed className="h-3.5 w-3.5" aria-hidden="true" />
                  {locating ? 'Pobieranie lokalizacji...' : 'Użyj mojej bieżącej lokalizacji'}
                </button>
                {geoStatus && (
                  <p className="mt-2 text-xs text-[#57534E]">{geoStatus}</p>
                )}
              </div>

              <div>
                <p className="text-xs font-medium text-[#18181B] mb-2">Środek transportu</p>
                <div className="grid grid-cols-2 gap-2">
                  {TRAVEL_MODES.map((mode) => {
                    const Icon = mode.icon;
                    const active = travelMode === mode.id;
                    return (
                      <button
                        key={mode.id}
                        type="button"
                        onClick={() => setTravelMode(mode.id)}
                        className={`flex h-11 items-center justify-center gap-2 border px-3 text-xs font-medium transition-colors whitespace-nowrap cursor-pointer ${
                          active
                            ? 'border-[#18181B] bg-[#18181B] text-white'
                            : 'border-[#E6E2D8] bg-[#FAF9F6] text-[#57534E] hover:border-[#18181B] hover:text-[#18181B]'
                        }`}
                      >
                        <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                        <span>{mode.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="pt-2 space-y-2.5">
                <a
                  href={googleMapsDirectionsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-11 w-full items-center justify-center gap-2 bg-[#18181B] px-4 text-xs font-medium text-white transition-colors hover:bg-[#27272A]"
                >
                  <Compass className="h-4 w-4" aria-hidden="true" />
                  Wyznacz trasę w Google Maps
                </a>
                <a
                  href={workshopInfo.mapsShortUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-11 w-full items-center justify-center gap-2 border border-[#E6E2D8] bg-white px-4 text-xs font-medium text-[#18181B] transition-colors hover:border-[#18181B]"
                >
                  <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                  Otwórz wizytówkę pracowni w Google Maps
                </a>
              </div>
            </div>
          </div>

          <div className="border border-[#E6E2D8] bg-[#F3F1EC] p-6 text-xs text-[#57534E] leading-relaxed space-y-2">
            <p className="font-medium text-[#18181B]">Wskazówki dojazdu na miejscu</p>
            <p>{workshopInfo.landmark}</p>
            <p>
              Komunikacja miejska: przystanki tramwajowe przy ul. Wołoskiej (Wołoska / Odyńca) oraz
              stacje metra M1 Racławicka i M1 Wierzbno w odległości krótkiego spaceru.
            </p>
          </div>
        </div>

        <div className="lg:col-span-7">
          <div className="h-[400px] md:h-[520px] w-full overflow-hidden border border-[#E6E2D8] bg-[#F3F1EC]">
            <iframe
              title={`Mapa dojazdu do pracowni ${workshopInfo.brandName}`}
              src={mapEmbedUrl}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="h-full w-full border-0"
            />
          </div>
          <p className="mt-2.5 text-xs text-[#57534E]">
            Kliknięcie przycisku „Wyznacz trasę w Google Maps” otwiera nawigację z adresem
            docelowym {workshopInfo.streetAddress}.
          </p>
        </div>
      </div>
    </div>
  );
};
