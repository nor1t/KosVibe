import { supabase } from '../lib/supabase';
import type { SupportedLanguage } from '../i18n/messages';
import type {
  IMarketplaceRepository,
  MarketCategoryKey,
  MarketCategoryMeta,
  MarketCollection,
  MarketplaceData,
  MarketSeller,
  MarketSpot,
} from './types';

/**
 * Sprint 7 — Database-backed Marketplace Repository
 *
 * All marketplace content (bilingual en/sq) comes from Supabase.
 * The ~300-line hardcoded `marketplaceData` object has been removed.
 */

function buildSeller(row: Record<string, unknown>, language: SupportedLanguage): MarketSeller {
  return {
    family: (language === 'sq' ? row.family_sq : row.family_en) as string,
    address: (language === 'sq' ? row.address_sq : row.address_en) as string,
    phone: (row.phone as string) ?? '',
    image: (row.image_url as string) ?? '',
    description: (language === 'sq' ? row.description_sq : row.description_en) as string,
  };
}

function buildCategoryMeta(row: Record<string, unknown>, language: SupportedLanguage): MarketCategoryMeta {
  return {
    title: (language === 'sq' ? row.title_sq : row.title_en) as string,
    subtitle: (language === 'sq' ? row.subtitle_sq : row.subtitle_en) as string,
  };
}

function buildSpot(row: Record<string, unknown>, language: SupportedLanguage): MarketSpot {
  return {
    title: (language === 'sq' ? row.title_sq : row.title_en) as string,
    subtitle: (language === 'sq' ? row.subtitle_sq : row.subtitle_en) as string,
    tone: row.tone_color as string,
  };
}

function buildCollection(row: Record<string, unknown>, language: SupportedLanguage): MarketCollection {
  return {
    icon: row.icon_name as string,
    title: (language === 'sq' ? row.title_sq : row.title_en) as string,
    text: (language === 'sq' ? row.text_sq : row.text_en) as string,
  };
}

export class MarketplaceRepository implements IMarketplaceRepository {
  private cache = new Map<SupportedLanguage, MarketplaceData>();

  async refresh(): Promise<void> {
    // Load static content
    const categoriesRes = await supabase
      .from('marketplace_categories')
      .select('*')
      .eq('is_active', true)
      .is('deleted_at', null)
      .order('sort_order', { ascending: true });

    const spotsRes = await supabase
      .from('marketplace_spots')
      .select('*')
      .eq('is_active', true)
      .is('deleted_at', null)
      .order('sort_order', { ascending: true });

    const sellersRes = await supabase
      .from('marketplace_sellers')
      .select('*')
      .eq('is_active', true)
      .is('deleted_at', null)
      .order('sort_order', { ascending: true });

    const collectionsRes = await supabase
      .from('marketplace_collections')
      .select('*')
      .eq('is_active', true)
      .is('deleted_at', null)
      .order('sort_order', { ascending: true });

    const languages: SupportedLanguage[] = ['en', 'sq'];

    for (const language of languages) {
      const categories = (categoriesRes.data ?? []).map((row) => ({
        key: row.slug as MarketCategoryKey,
        label: (language === 'sq' ? row.label_sq : row.label_en) as string,
      }));

      const spots = (spotsRes.data ?? []).map((row) => buildSpot(row, language));
      const sellers = (sellersRes.data ?? []);
      const collections = (collectionsRes.data ?? []).map((row) => buildCollection(row, language));

      // Group sellers by category
      const sellersByCategory: Record<MarketCategoryKey, MarketSeller[]> = {
        food: [],
        craft: [],
        clothing: [],
      };

      for (const seller of sellers) {
        const key = seller.category_slug as MarketCategoryKey;
        if (sellersByCategory[key]) {
          sellersByCategory[key].push(buildSeller(seller, language));
        }
      }

      // Build seller category metas
      const catRows = (categoriesRes.data ?? []);
      const sellerCategories: Record<MarketCategoryKey, MarketCategoryMeta> = {
        food: buildCategoryMeta(catRows.find((r) => r.slug === 'food') ?? {}, language),
        craft: buildCategoryMeta(catRows.find((r) => r.slug === 'craft') ?? {}, language),
        clothing: buildCategoryMeta(catRows.find((r) => r.slug === 'clothing') ?? {}, language),
      };

      const sellersTitle =
        language === 'sq'
          ? 'Shites lokal qe ia vlejne'
          : 'Local sellers to check';

      this.cache.set(language, {
        eyebrow:
          language === 'sq'
            ? 'Udhezues per Tregun Rural'
            : 'Village Market Guide',
        title:
          language === 'sq'
            ? 'Gjej gjerat lokale qe turistet duan vertet t i marrin me vete.'
            : 'Find the local things tourists actually want to take home.',
        subtitle:
          language === 'sq'
            ? 'Nje faqe e kuruar per tregjet rurale ku mund te zbulosh vere, raki, objekte artizanale, ushqime tradicionale dhe pervoja autentike neper Kosove.'
            : 'FROM OUR LAND TO YOUR HAND',
        categories,
        marketSpots: spots,
        sellersTitle,
        sellerCategories,
        sellers: sellersByCategory,
        collections,
      });
    }
  }

  private async ensureReady(): Promise<void> {
    if (this.cache.size === 0) {
      await this.refresh();
    }
  }

  getMarketplaceData(language: SupportedLanguage): MarketplaceData {
    const cached = this.cache.get(language);
    if (cached) {
      return {
        ...cached,
        categories: cached.categories.map((c) => ({ ...c })),
        marketSpots: cached.marketSpots.map((s) => ({ ...s })),
        sellerCategories: {
          food: { ...cached.sellerCategories.food },
          craft: { ...cached.sellerCategories.craft },
          clothing: { ...cached.sellerCategories.clothing },
        },
        sellers: {
          food: cached.sellers.food.map((s) => ({ ...s })),
          craft: cached.sellers.craft.map((s) => ({ ...s })),
          clothing: cached.sellers.clothing.map((s) => ({ ...s })),
        },
        collections: cached.collections.map((c) => ({ ...c })),
      };
    }

    // Fallback: empty data
    return {
      eyebrow: 'Village Market Guide',
      title: 'Loading marketplace...',
      subtitle: '',
      categories: [],
      marketSpots: [],
      sellersTitle: '',
      sellerCategories: {
        food: { title: '', subtitle: '' },
        craft: { title: '', subtitle: '' },
        clothing: { title: '', subtitle: '' },
      },
      sellers: { food: [], craft: [], clothing: [] },
      collections: [],
    };
  }

  async getMarketplaceDataAsync(language: SupportedLanguage): Promise<MarketplaceData> {
    await this.ensureReady();
    return this.getMarketplaceData(language);
  }
}

export const marketplaceRepository = new MarketplaceRepository();