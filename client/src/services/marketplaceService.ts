import api from './api';
import type {
  CommissionBreakdown,
  MarketplaceItem,
  MarketplaceItemType,
} from '../types/b2b';

export interface SearchFilters {
  query?: string;
  type?: MarketplaceItemType;
  priceMinTl?: number;
  priceMaxTl?: number;
  sort?: 'recent' | 'popular' | 'price_asc' | 'price_desc';
  limit?: number;
}

export interface CreateItemPayload {
  type: MarketplaceItemType;
  title: string;
  description: string;
  priceTl: number;
  fileUrl: string;
  previewText?: string | null;
  tags?: string[];
}

export const marketplaceService = {
  async search(filters: SearchFilters): Promise<MarketplaceItem[]> {
    const params = new URLSearchParams();
    for (const [k, v] of Object.entries(filters)) {
      if (v !== undefined && v !== null && v !== '') {
        params.set(k, String(v));
      }
    }
    const res = await api.get(`/marketplace/items?${params.toString()}`);
    return (res.data.data ?? []) as MarketplaceItem[];
  },

  async get(id: string): Promise<MarketplaceItem> {
    const res = await api.get(`/marketplace/items/${id}`);
    return res.data.data as MarketplaceItem;
  },

  async create(payload: CreateItemPayload): Promise<MarketplaceItem> {
    const res = await api.post('/marketplace/items', payload);
    return res.data.data as MarketplaceItem;
  },

  async purchase(id: string): Promise<{
    checkoutUrl: string;
    commission: CommissionBreakdown;
  }> {
    const res = await api.post(`/marketplace/items/${id}/purchase`);
    return {
      checkoutUrl: res.data.data.checkoutUrl as string,
      commission: res.data.data.commission as CommissionBreakdown,
    };
  },
};
