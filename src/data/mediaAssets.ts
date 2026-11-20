import atelierCraftBench from '../assets/images/atelier_craft_bench_1794550928298.jpg';
import estLocal1794638125069 from '../assets/images/est_local_1794638125069.jpg';
import heroAtelierShowcase from '../assets/images/hero_atelier_showcase_1794550928029.jpg';
import jezusLocal1795202829775 from '../assets/images/jezus_local_1795202829775.jpg';
import necklacePearlGold from '../assets/images/necklace_pearl_gold_1794550928847.jpg';
import necklaceSolitaireGold from '../assets/images/necklace_solitaire_gold_1794550928315.jpg';
import necklaceTanzanitePlatinum from '../assets/images/necklace_tanzanite_platinum_1794550928343.jpg';
import ringDiamondGold from '../assets/images/ring_diamond_gold_1794550927289.jpg';
import ringEmeraldRosegold from '../assets/images/ring_emerald_rosegold_1794550927652.jpg';
import ringSapphireWhitegold from '../assets/images/ring_sapphire_whitegold_1794550925514.jpg';

const BUNDLED_ASSETS: Record<string, string> = {
  '/src/assets/images/atelier_craft_bench_1794550928298.jpg': atelierCraftBench,
  '/src/assets/images/est_local_1794638125069.jpg': estLocal1794638125069,
  '/src/assets/images/hero_atelier_showcase_1794550928029.jpg': heroAtelierShowcase,
  '/src/assets/images/jezus_local_1795202829775.jpg': jezusLocal1795202829775,
  '/src/assets/images/necklace_pearl_gold_1794550928847.jpg': necklacePearlGold,
  '/src/assets/images/necklace_solitaire_gold_1794550928315.jpg': necklaceSolitaireGold,
  '/src/assets/images/necklace_tanzanite_platinum_1794550928343.jpg': necklaceTanzanitePlatinum,
  '/src/assets/images/ring_diamond_gold_1794550927289.jpg': ringDiamondGold,
  '/src/assets/images/ring_emerald_rosegold_1794550927652.jpg': ringEmeraldRosegold,
  '/src/assets/images/ring_sapphire_whitegold_1794550925514.jpg': ringSapphireWhitegold,
};

export function resolveMediaUrl(src: string): string {
  if (!src) return heroAtelierShowcase;
  if (BUNDLED_ASSETS[src]) {
    return BUNDLED_ASSETS[src];
  }
  const normalized = src.startsWith('./src/') ? src.slice(1) : src;
  if (BUNDLED_ASSETS[normalized]) {
    return BUNDLED_ASSETS[normalized];
  }
  if (src.startsWith('/uploads/')) {
    return `.${src}`;
  }
  return src;
}
