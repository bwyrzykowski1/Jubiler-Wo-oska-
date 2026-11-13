export type SeoTabId = 'galeria' | 'o-pracowni' | 'cennik' | 'dojazd' | 'kontakt';

export interface TabSeoMetadata {
  tab: SeoTabId;
  path: string;
  title: string;
  description: string;
  ogTitle: string;
  ogDescription: string;
  keywords: string;
}

export const TAB_SEO_METADATA: Record<SeoTabId, TabSeoMetadata> = {
  galeria: {
    tab: 'galeria',
    path: '/',
    title: 'Jubiler Wołoska — Galeria pierścionków i naszyjników',
    description:
      'Odkryj ręcznie kute pierścionki i naszyjniki ze złota 585, platyny i kamieni szlachetnych w pracowni Jubiler Wołoska na Mokotowie.',
    ogTitle: 'Jubiler Wołoska — Galeria pierścionków i naszyjników',
    ogDescription:
      'Przeglądaj najnowsze wzory pierścionków zaręczynowych i naszyjników z brylantami, szafirami i szmaragdami według kruszcu i kamienia.',
    keywords:
      'jubiler warszawa, pracownia jubilerska mokotów, pierścionki zaręczynowe, naszyjniki złoto 585, jubiler wołoska',
  },
  'o-pracowni': {
    tab: 'o-pracowni',
    path: '/o-pracowni',
    title: 'Jubiler Wołoska — O pracowni i technikach złotniczych',
    description:
      'Poznaj historię pracowni Jubiler Wołoska przy ul. Odyńca i techniki ręcznego kucia, oprawy mikroskopowej oraz renowacji biżuterii.',
    ogTitle: 'Jubiler Wołoska — O pracowni i rzemiośle złotniczym',
    ogDescription:
      'Kameralny warsztat złotniczy na Mokotowie. Dowiedz się, jak powstają nasze projekty od wosku i ręcznego kucia po oprawę kamieni.',
    keywords:
      'złotnik mokotów, techniki jubilerskie, ręczne kucie złota, oprawa kamieni szlachetnych, historia pracowni',
  },
  cennik: {
    tab: 'cennik',
    path: '/cennik',
    title: 'Jubiler Wołoska — Cennik usług i wycena projektów',
    description:
      'Sprawdź cennik napraw złotniczych, lutowania i zmiany rozmiaru oraz zamów indywidualną wycenę pierścionka lub naszyjnika na wymiar.',
    ogTitle: 'Jubiler Wołoska — Cennik usług złotniczych i wycena projektu',
    ogDescription:
      'Orientacyjny cennik lutowania, rodowania, powiększania pierścionków oraz formularz szybkiej wyceny autorskiego projektu biżuterii.',
    keywords:
      'cennik jubilera warszawa, naprawa biżuterii cena, zmiana rozmiaru pierścionka, wycena projektu biżuterii',
  },
  dojazd: {
    tab: 'dojazd',
    path: '/dojazd',
    title: 'Jubiler Wołoska — Dojazd i mapa pracowni Mokotów',
    description:
      'Wyznacz trasę w Google Maps do pracowni Jubiler Wołoska przy ul. Wołoskiej i Odyńca, pawilon 7 na Mokotowie w Warszawie.',
    ogTitle: 'Jubiler Wołoska — Dojazd Google Maps na Mokotów',
    ogDescription:
      'Sprawdź wskazówki dojazdu komunikacją miejską lub samochodem do pawilonu nr 7 na rogu Wołoskiej i Odyńca w Warszawie.',
    keywords:
      'jubiler wołoska dojazd, jubiler odyńca pawilon 7, mapa pracowni jubilerskiej mokotów',
  },
  kontakt: {
    tab: 'kontakt',
    path: '/kontakt',
    title: 'Jubiler Wołoska — Kontakt i telefon do jubilera',
    description:
      'Skontaktuj się bezpośrednio z mistrzem złotnikiem pod numerem +48 502 579 001, potwierdź wizytę i omów naprawę lub projekt biżuterii.',
    ogTitle: 'Jubiler Wołoska — Bezpośredni kontakt z pracownią',
    ogDescription:
      'Szybkie połączenie telefoniczne z pracownią (+48 502 579 001), adres punktu rzemieślniczego i godziny przyjęć na Mokotowie.',
    keywords:
      'jubiler wołoska telefon, kontakt złotnik warszawa, naprawa biżuterii mokotów kontakt',
  },
};

export function resolveTabFromPathname(pathname: string): SeoTabId {
  const clean = pathname.replace(/\/+$/, '') || '/';
  if (clean === '/o-pracowni') return 'o-pracowni';
  if (clean === '/cennik') return 'cennik';
  if (clean === '/dojazd') return 'dojazd';
  if (clean === '/kontakt') return 'kontakt';
  return 'galeria';
}
