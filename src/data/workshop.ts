export interface WorkshopHoursRow {
  days: string;
  hours: string;
}

export interface WorkshopInfo {
  brandName: string;
  fullTitle: string;
  streetAddress: string;
  postalCity: string;
  landmark: string;
  phoneDisplay: string;
  phoneHref: string;
  email: string;
  mapsShortUrl: string;
  mapsDestinationQuery: string;
  hoursNote: string;
  typicalHours: WorkshopHoursRow[];
}

export interface ServicePriceItem {
  service: string;
  details: string;
  price: string;
  turnaround: string;
}

export interface AboutPillar {
  title: string;
  description: string;
}

export interface CraftTechnique {
  index: string;
  title: string;
  description: string;
}

export interface HeroContent {
  kicker: string;
  headline: string;
  subheadline: string;
  image: string;
}

export interface AboutContent {
  kicker: string;
  headline: string;
  leadParagraph: string;
  secondaryParagraph: string;
  image: string;
  pillars: AboutPillar[];
  techniques: CraftTechnique[];
  historyKicker: string;
  historyTitle: string;
  historyParagraphs: string[];
}

export interface SiteContent {
  workshopInfo: WorkshopInfo;
  heroContent: HeroContent;
  aboutContent: AboutContent;
  servicePrices: ServicePriceItem[];
  bespokePrices: ServicePriceItem[];
}

export const WORKSHOP_INFO: WorkshopInfo = {
  brandName: 'Jubiler Wołoska',
  fullTitle: 'Pracownia Jubilerska Jubiler Wołoska',
  streetAddress: 'ul. Wołoska / Antoniego Edwarda Odyńca, pawilon 7',
  postalCity: '02-507 Warszawa (Mokotów)',
  landmark: 'Bazarek Wołoska — róg ul. Wołoskiej i A. E. Odyńca',
  phoneDisplay: '+48 502 579 001',
  phoneHref: 'tel:+48502579001',
  email: 'kontakt@jubilerwoloska.pl',
  mapsShortUrl: 'https://maps.app.goo.gl/zGVzuUZWmBH7AUN26',
  mapsDestinationQuery: 'Jubiler Wołoska, Antoniego Edwarda Odyńca pawilon 7, 02-507 Warszawa',
  hoursNote:
    'Pracownia ma charakter kameralnego punktu rzemieślniczego — przed wizytą prosimy o krótki telefon w celu potwierdzenia obecności mistrza złotnika.',
  typicalHours: [
    { days: 'Poniedziałek – Piątek', hours: '10:00 – 17:30 (zalecamy potwierdzenie tel.)' },
    { days: 'Sobota', hours: '10:00 – 14:00 (po wcześniejszym umówieniu)' },
    { days: 'Niedziela', hours: 'Nieczynne' },
  ],
};

export const SERVICE_PRICES: ServicePriceItem[] = [
  {
    service: 'Lutowanie łańcuszka lub bransoletki',
    details: 'Srebro 925 lub złoto 585 (lutowanie laserowe lub palnikowe)',
    price: 'od 60 zł',
    turnaround: '1–2 dni',
  },
  {
    service: 'Zmiana rozmiaru pierścionka / obrączki',
    details: 'Powiększenie lub zmniejszenie z zachowaniem geometrii i opraw',
    price: 'od 120 zł',
    turnaround: '2–4 dni',
  },
  {
    service: 'Czyszczenie ultradźwiękowe i polerowanie',
    details: 'Usunięcie mikrorys, odświeżenie połysku oraz kontrola łapek',
    price: 'od 50 zł',
    turnaround: 'na miejscu / 1 dzień',
  },
  {
    service: 'Rodowanie białego złota lub srebra',
    details: 'Kąpiel galwaniczna przywracająca chłodny, lustrzany odcień',
    price: 'od 140 zł',
    turnaround: '2–3 dni',
  },
  {
    service: 'Oprawa lub wymiana kamienia szlachetnego',
    details: 'Precyzyjne osadzenie brylantów, szafirów, szmaragdów i cyrkonii',
    price: 'od 180 zł',
    turnaround: '3–7 dni',
  },
  {
    service: 'Grawerowanie indywidualne',
    details: 'Daty, inicjały lub odręczne dedykacje wewnątrz obrączek',
    price: 'od 80 zł',
    turnaround: '1–2 dni',
  },
];

export const BESPOKE_PRICES: ServicePriceItem[] = [
  {
    service: 'Pierścionek zaręczynowy na indywidualny projekt',
    details: 'Złoto 585 lub Platyna 950 + dobór certyfikowanego kamienia GIA/IGI',
    price: 'od 3 200 zł',
    turnaround: '14–21 dni',
  },
  {
    service: 'Autorski naszyjnik z kamieniem naturalnym',
    details: 'Projekt od szkicu, indywidualnie dobrany łańcuszek i oprawa',
    price: 'od 2 400 zł',
    turnaround: '10–14 dni',
  },
  {
    service: 'Przetop i wykonanie biżuterii z powierzonego złota',
    details: 'Analiza próby, oczyszczenie stopu i wykonanie nowego wzoru',
    price: 'wycena robocizny od 750 zł',
    turnaround: '14–21 dni',
  },
  {
    service: 'Para ręcznie kutych obrączek ślubnych',
    details: 'Klasyczne, soczewkowe lub fazowane, złoto żółte, białe lub różowe',
    price: 'od 2 900 zł / para',
    turnaround: '14–21 dni',
  },
];

export const CRAFT_TECHNIQUES: CraftTechnique[] = [
  {
    index: '01.',
    title: 'Ręczne kucie i walcowanie stopów',
    description:
      'Każdą szynę pierścionka i obrączki kształtujemy poprzez walcowanie i kucie na kowadełkach złotniczych. Zagęszcza to strukturę krystaliczną złota, dzięki czemu biżuteria jest znacznie odporniejsza na odkształcenia niż wyroby masowo odlewane.',
  },
  {
    index: '02.',
    title: 'Oprawa kamieni pod mikroskopem',
    description:
      'Brylanty, szafiry i szmaragdy osadzamy ręcznie pod powiększeniem stereoskopowym. Pozwala to wyciąć idealnie przylegające gniazda oraz zamknąć łapki tak, aby biżuteria nie zahaczała o odzież i bezpiecznie trzymała kamień przez dekady.',
  },
  {
    index: '03.',
    title: 'Metoda traconego wosku i modelowanie',
    description:
      'Dla form rzeźbiarskich i finezyjnych koron rzeźbimy prototyp w twardym wosku jubilerskim, który następnie odlewamy w złocie próby 585 lub platynie 950 i wykańczamy ręcznie pilnikami igłowymi.',
  },
  {
    index: '04.',
    title: 'Renowacja i re-design pamiątek rodzinnych',
    description:
      'Przywracamy blask przedwojennej i pamiątkowej biżuterii, wzmacniamy przetarte łapki oraz przetwarzamy powierzone złoto w nowoczesne, lekkie formy dopasowane do współczesnego stylu.',
  },
];

export const DEFAULT_SITE_CONTENT: SiteContent = {
  workshopInfo: WORKSHOP_INFO,
  heroContent: {
    kicker: 'Mokotów · ul. Wołoska / Odyńca',
    headline: 'Biżuteria tworzona ręcznie w sercu Mokotowa',
    subheadline:
      'Autorskie pierścionki, naszyjniki i oprawa kamieni szlachetnych wykonywane bezpośrednio przy stole złotniczym — od pierwszego szkicu po polerowanie.',
    image: '/src/assets/images/hero_atelier_showcase_1794550928029.jpg',
  },
  aboutContent: {
    kicker: 'O pracowni jubilerskiej',
    headline: 'Rzemiosło złotnicze bez pośredników',
    leadParagraph:
      'Pracownia Jubilerska Jubiler Wołoska przy ul. Wołoskiej / Antoniego Edwarda Odyńca, pawilon 7 to kameralny warsztat na warszawskim Mokotowie. Łączymy klasyczne techniki ręcznego złotnictwa z indywidualnym podejściem do każdego kamienia i projektu.',
    secondaryParagraph:
      'W naszej pracowni rozmawiasz bezpośrednio z wykonawcą Twojej biżuterii — od doboru próby złota czy platyny, przez weryfikację certyfikatów kamieni, aż po przymiarki i późniejszą bezpłatną kontrolę opraw.',
    image: '/src/assets/images/atelier_craft_bench_1794550928298.jpg',
    pillars: [
      {
        title: 'Biżuteria na zamówienie',
        description:
          'Projektujemy i wykonujemy od podstaw pierścionki zaręczynowe, autorskie naszyjniki oraz obrączki dopasowane do proporcji dłoni i indywidualnego budżetu.',
      },
      {
        title: 'Naprawy i korekty',
        description:
          'Precyzyjne lutowanie zerwanych łańcuszków, zmiana rozmiarów pierścionków, wymiana zapięć, wzmacnianie przetartych łapek oraz uzupełnianie brakujących kamieni.',
      },
      {
        title: 'Renowacja i przeróbki',
        description:
          'Odświeżamy biżuterię rodzinną lub przetwarzamy powierzone złoto w nowe, ponadczasowe wzory z zachowaniem sentymentalnej wartości kruszcu.',
      },
    ],
    techniques: CRAFT_TECHNIQUES,
    historyKicker: 'Nasza historia',
    historyTitle: 'Mokotowska tradycja rzemieślnicza',
    historyParagraphs: [
      'Pracownia Jubiler Wołoska wyrosła z przekonania, że prawdziwe złotnictwo potrzebuje spokoju, skupienia i bezpośredniego dialogu z klientem. Od lat jesteśmy związani z warszawskim Mokotowem — nasz punkt w pawilonie nr 7 przy zbiegu ulic Wołoskiej i Antoniego Edwarda Odyńca stał się miejscem, do którego wracają kolejne pokolenia mieszkańców dzielnicy.',
      'Zamiast masowej produkcji i anonimowych lad w galeriach handlowych wybraliśmy warsztat otwarty na sąsiedzki kontakt. Tutaj każdy pierścionek po wyjściu z kąpieli ultradźwiękowej trafia pod lupę jubilera, a każda realizacja autorska przechodzi przez nasze ręce od pierwszego nacięcia wosku lub wywalcowania sztabki złota aż po cechowanie probiercze.',
    ],
  },
  servicePrices: SERVICE_PRICES,
  bespokePrices: BESPOKE_PRICES,
};
