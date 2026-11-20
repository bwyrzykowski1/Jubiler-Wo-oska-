export type ProductCategory = 'Pierścionki' | 'Naszyjniki' | 'Zaręczynowe';

export type PreciousMetal =
  | 'Złoto żółte 585'
  | 'Złoto białe 585'
  | 'Złoto różowe 585'
  | 'Platyna 950'
  | 'Srebro 925';

export type GemstoneType =
  | 'Diament / Brylant'
  | 'Szafir'
  | 'Szmaragd'
  | 'Tanzanit'
  | 'Perła naturalna'
  | 'Bez kamienia';

export interface JewelryPiece {
  id: string;
  name: string;
  category: ProductCategory;
  metal: PreciousMetal;
  gemstone: GemstoneType;
  gemstoneSpecs: string;
  weightGrams: string;
  pricePLN: number;
  leadTime: string;
  availability: 'Dostępny w pracowni' | 'Na zamówienie' | 'Pojedynczy egzemplarz';
  image: string;
  model3dUrl?: string;
  shortNote: string;
  craftDetails: string;
  isNew?: boolean;
}

export const PRODUCT_CATEGORIES: ('Wszystkie' | ProductCategory)[] = [
  'Wszystkie',
  'Pierścionki',
  'Naszyjniki',
  'Zaręczynowe',
];

export const PRECIOUS_METALS: ('Wszystkie kruszce' | PreciousMetal)[] = [
  'Wszystkie kruszce',
  'Złoto żółte 585',
  'Złoto białe 585',
  'Złoto różowe 585',
  'Platyna 950',
  'Srebro 925',
];

export const GEMSTONE_TYPES: ('Wszystkie kamienie' | GemstoneType)[] = [
  'Wszystkie kamienie',
  'Diament / Brylant',
  'Szafir',
  'Szmaragd',
  'Tanzanit',
  'Perła naturalna',
  'Bez kamienia',
];

export const HERO_IMAGE = '/src/assets/images/hero_atelier_showcase_1794550928029.jpg';
export const WORKSHOP_BENCH_IMAGE = '/src/assets/images/atelier_craft_bench_1794550928298.jpg';

export const JEWELRY_COLLECTION: JewelryPiece[] = [
  {
    id: 'local-1795202829775',
    name: 'Jezus',
    category: 'Pierścionki',
    metal: 'Złoto żółte 585',
    gemstone: 'Diament / Brylant',
    gemstoneSpecs: 'Diament / Brylant',
    weightGrams: '—',
    pricePLN: 1000000,
    leadTime: '10–14 dni roboczych',
    availability: 'Dostępny w pracowni',
    image: '/src/assets/images/jezus_local_1795202829775.jpg',
    model3dUrl:
      'https://ijewel3d.com/drive/files/Nbx00KwKTw-_wumOvB9tmw/embedded?slug=Nbx00KwKTw-_wumOvB9tmw&isTitle=true&isRemoveHologram=false&isRemoveLogo=false&isRemoveLogoLink=false&isRemoveLoadingBgImg=true&isShowPrompt=true&isTurntableAnimation=false&isAutoplay=false&isTransparentBackground=false&isConfigurator=true&isEnabledZoom=true&isShare=true&isShowModelInfo=false&isQuality=true&isResetView=true&isRotateCamera=true&isPlayCameraViews=true&isPlayAnimations=true&isFitObject=true&isFullScreen=true',
    shortNote: 'Autorski wyrób wykonany ręcznie w pracowni.',
    craftDetails: 'Autorski wyrób wykonany ręcznie.',
    isNew: true,
  },
  {
    id: 'local-1794638125069',
    name: 'Est',
    category: 'Pierścionki',
    metal: 'Złoto żółte 585',
    gemstone: 'Diament / Brylant',
    gemstoneSpecs: 'Diament / Brylant',
    weightGrams: '—',
    pricePLN: 2222,
    leadTime: '10–14 dni roboczych',
    availability: 'Dostępny w pracowni',
    image: '/src/assets/images/est_local_1794638125069.jpg',
    shortNote: 'Autorski wyrób wykonany ręcznie w pracowni.',
    craftDetails: 'Autorski wyrób wykonany ręcznie.',
    isNew: true,
  },
  {
    id: 'soliter-mokotow-585',
    name: 'Soliter „Mokotów” z brylantem',
    category: 'Zaręczynowe',
    metal: 'Złoto żółte 585',
    gemstone: 'Diament / Brylant',
    gemstoneSpecs: 'Brylant 0,55 ct · czystość VS1 · barwa F · certyfikat GIA',
    weightGrams: '3,40 g',
    pricePLN: 7400,
    leadTime: '10–14 dni roboczych',
    availability: 'Dostępny w pracowni',
    image: '/src/assets/images/ring_diamond_gold_1794550927289.jpg',
    shortNote: 'Klasyczna czterokrapowa korona osadzona na smukłej, ręcznie kutej szynie.',
    craftDetails:
      'Szyna wykuta ręcznie z litego złota próby 585 o subtelnym przekroju soczewkowym dla codziennej wygody noszenia. Wysoko otwarta korona wpuszcza światło pod każdym kątem.',
    isNew: true,
  },
  {
    id: 'ceylon-sapphire-pt950',
    name: 'Pierścionek „Odyńca” z szafirem cejlońskim',
    category: 'Zaręczynowe',
    metal: 'Platyna 950',
    gemstone: 'Szafir',
    gemstoneSpecs: 'Szafir naturalny 1,45 ct (szlif owalny) + 2 brylanty bagietkowe 0,24 ct',
    weightGrams: '5,10 g',
    pricePLN: 11800,
    leadTime: '14–21 dni roboczych',
    availability: 'Pojedynczy egzemplarz',
    image: '/src/assets/images/ring_sapphire_whitegold_1794550925514.jpg',
    shortNote: 'Królewski błękit naturalnego szafiru w towarzystwie diamentowych bagietek.',
    craftDetails:
      'Wykonany w czystej platynie próby 950, która nie wymaga rodowania i zachowuje naturalny chłodny blask. Kamień centralny dobrany pod mikroskopem ze względu na głębię barwy.',
    isNew: true,
  },
  {
    id: 'bezel-emerald-rose585',
    name: 'Pierścionek „Szmaragdowy Kadr”',
    category: 'Pierścionki',
    metal: 'Złoto różowe 585',
    gemstone: 'Szmaragd',
    gemstoneSpecs: 'Szmaragd kolumbijski 1,10 ct · szlif szmaragdowy',
    weightGrams: '4,25 g',
    pricePLN: 8900,
    leadTime: '14 dni roboczych',
    availability: 'Na zamówienie',
    image: '/src/assets/images/ring_emerald_rosegold_1794550927652.jpg',
    shortNote: 'Nowoczesna, pełna oprawa bezlowa chroniąca narożniki szmaragdu.',
    craftDetails:
      'Ręcznie dopasowana pełna oprawa (bezel) z ciepłego różowego złota bezpiecznie otula delikatne krawędzie szmaragdu, podkreślając geometryczny charakter szlifu.',
    isNew: true,
  },
  {
    id: 'naszyjnik-soliter-bezel',
    name: 'Naszyjnik „Światło” z diamentem w oprawie pełnej',
    category: 'Naszyjniki',
    metal: 'Złoto żółte 585',
    gemstone: 'Diament / Brylant',
    gemstoneSpecs: 'Brylant 0,28 ct · barwa G · czystość SI1',
    weightGrams: '2,65 g',
    pricePLN: 3600,
    leadTime: '7–10 dni roboczych',
    availability: 'Dostępny w pracowni',
    image: '/src/assets/images/necklace_solitaire_gold_1794550928315.jpg',
    shortNote: 'Minimalistyczny punkt światła zawieszony na pełnym łańcuszku ankierowym.',
    craftDetails:
      'Łańcuszek o długości 42 cm z regulacją na 45 cm, połączony na stałe z ręcznie toczoną oprawą bezlową, dzięki czemu zawieszka zawsze układa się centralnie.',
    isNew: true,
  },
  {
    id: 'naszyjnik-tanzanit-biale',
    name: 'Naszyjnik „Kropla Tanzanitu”',
    category: 'Naszyjniki',
    metal: 'Złoto białe 585',
    gemstone: 'Tanzanit',
    gemstoneSpecs: 'Tanzanit naturalny 1,80 ct (łezka) + brylanty w krawatce 0,08 ct',
    weightGrams: '3,80 g',
    pricePLN: 6200,
    leadTime: '12–14 dni roboczych',
    availability: 'Pojedynczy egzemplarz',
    image: '/src/assets/images/necklace_tanzanite_platinum_1794550928343.jpg',
    shortNote: 'Głęboki fioletowo-niebieski tanzanit zawieszony pod diamentową krawatką.',
    craftDetails:
      'Białe złoto wzbogacone palladem, wykończone warstwą czystego rodu. Kamień osadzony w trzech delikatnych łapkach dla maksymalnej ekspozycji pleochroizmu.',
    isNew: true,
  },
  {
    id: 'naszyjnik-perla-slodkowodna',
    name: 'Naszyjnik „Perła Wołoska”',
    category: 'Naszyjniki',
    metal: 'Złoto żółte 585',
    gemstone: 'Perła naturalna',
    gemstoneSpecs: 'Perła słodkowodna klasy AAA · średnica 10,5 mm',
    weightGrams: '3,95 g',
    pricePLN: 2950,
    leadTime: '5–7 dni roboczych',
    availability: 'Dostępny w pracowni',
    image: '/src/assets/images/necklace_pearl_gold_1794550928847.jpg',
    shortNote: 'Lśniąca perła o naturalnym połysku na klasycznym złotym splocie.',
    craftDetails:
      'Każda perła selekcjonowana indywidualnie pod kątem idealnej sferyczności i ciepłego orientu. Zapięcie typu federing z ręcznie wybijaną cechą probierczą.',
  },
  {
    id: 'pierscionek-srebro-mlotkowane',
    name: 'Pierścionek „Faktura Ręki” bez kamienia',
    category: 'Pierścionki',
    metal: 'Srebro 925',
    gemstone: 'Bez kamienia',
    gemstoneSpecs: 'Ręcznie młotkowana powierzchnia satynowa · szerokość 4,5 mm',
    weightGrams: '4,80 g',
    pricePLN: 680,
    leadTime: '5 dni roboczych',
    availability: 'Dostępny w pracowni',
    image: '/src/assets/images/hero_atelier_showcase_1794550928029.jpg',
    shortNote: 'Surowa, rzeźbiarska obrączka ze srebra wysokiej próby o delikatnym fasetowaniu.',
    craftDetails:
      'Każdy ślad młotka cyzelerskiego jest niepowtarzalny. Powierzchnia wykańczana szczotką mosiężną dla miękkiego, jedwabistego połysku.',
  },
  {
    id: 'pierscionek-biale-zloto-diament',
    name: 'Pierścionek „Harmonia” w białym złocie',
    category: 'Pierścionki',
    metal: 'Złoto białe 585',
    gemstone: 'Diament / Brylant',
    gemstoneSpecs: 'Brylant 0,40 ct · czystość VVS2 · barwa E',
    weightGrams: '3,60 g',
    pricePLN: 6100,
    leadTime: '10–14 dni roboczych',
    availability: 'Na zamówienie',
    image: '/src/assets/images/ring_diamond_gold_1794550927289.jpg',
    shortNote: 'Chłodna elegancja białego złota i wyjątkowo czysty brylant.',
    craftDetails:
      'Precyzyjna oprawa mikroskopowa gwarantuje trwałość mocowania na dziesięciolecia codziennego noszenia.',
  },
];
