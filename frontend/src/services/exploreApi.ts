import api from './api';

export type ExploreCategorySlug = 'birthday' | 'business';

export interface ExploreCategoryItem {
  slug: ExploreCategorySlug;
  label: string;
  count: number;
}

export interface ExploreBoothListItem {
  _id: string;
  name: string;
  category: ExploreCategorySlug;
  eventType: string;
  description: string;
  address: string;
  coverImage: string;
  averageRating: number;
  reviewCount: number;
}

export interface ExploreBoothDetailVendor {
  _id: string;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  description: string;
  averageRating: number;
  reviewCount: number;
  address: string;
}

export interface ExploreBoothDetail {
  _id: string;
  name: string;
  category: ExploreCategorySlug | null;
  eventType: string;
  description: string;
  address: string;
  coverImage: string;
  gallery: string[];
}

export interface ExploreBoothPackage {
  _id: string;
  name: string;
  price: number;
  depositAmount: number;
  minParticipants: number;
  maxParticipants: number;
  serviceDuration: string;
  description: string;
  images: string[];
  includedServices?: string[];
}

export const getExploreCategories = async (): Promise<ExploreCategoryItem[]> => {
  const res = await api.get('/explore/categories');
  return res.data?.data || [];
};

export const getBoothsByCategory = async (
  category: ExploreCategorySlug,
  search = ''
): Promise<{ category: ExploreCategorySlug; label: string; data: ExploreBoothListItem[] }> => {
  const res = await api.get('/explore/booths', {
    params: {
      category,
      search: search.trim() || undefined
    }
  });
  return res.data;
};

export const getBoothDetail = async (
  boothId: string
): Promise<{ vendor: ExploreBoothDetailVendor; booth: ExploreBoothDetail; packages: ExploreBoothPackage[] }> => {
  const res = await api.get(`/explore/booths/${boothId}`);
  return res.data;
};

export const getVendorFirstBooth = async (vendorId: string): Promise<{ boothId: string }> => {
  const res = await api.get(`/explore/vendors/${vendorId}/first-booth`);
  return res.data;
};
