export type ItemSemente = {
  collection: string;
  slug: string;
  title: string;
  subtitle?: string;
  excerpt?: string;
  body?: string;
  cover_url?: string;
  featured?: boolean;
  sort_order?: number;
  published_at?: string;
  data: Record<string, unknown>;
};
