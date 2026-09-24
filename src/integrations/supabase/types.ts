// Gerado a partir do banco (Supabase → generate_typescript_types). Regerar após migrations.
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

type Row<T> = T;
type Ins<T> = Partial<T>;

type AnalyticsEvent = {
  browser: string | null;
  city: string | null;
  country: string | null;
  created_at: string;
  device: string | null;
  id: number;
  label: string | null;
  os: string | null;
  path: string;
  referrer: string | null;
  region: string | null;
  session_id: string;
  type: string;
  utm_campaign: string | null;
  utm_medium: string | null;
  utm_source: string | null;
  value: number | null;
  visitor_id: string;
};

export type ContentItemRow = {
  body: string | null;
  collection: string;
  cover_url: string | null;
  created_at: string;
  data: Json;
  excerpt: string | null;
  featured: boolean;
  id: string;
  published_at: string | null;
  seo_description: string | null;
  seo_title: string | null;
  slug: string;
  sort_order: number;
  status: string;
  subtitle: string | null;
  title: string;
  updated_at: string;
  updated_by: string | null;
};

export type LeadRow = {
  company: string | null;
  created_at: string;
  data: Json;
  email: string | null;
  id: string;
  item_id: string | null;
  kind: string;
  message: string | null;
  name: string;
  notes: string | null;
  phone: string | null;
  referrer: string | null;
  source_path: string | null;
  status: string;
  subject: string | null;
  updated_at: string;
  utm: Json | null;
  visitor_id: string | null;
};

export type SiteContentRow = {
  data: Json;
  key: string;
  updated_at: string;
  updated_by: string | null;
};

type UserRoleRow = {
  created_at: string;
  id: string;
  role: "admin" | "editor";
  user_id: string;
};

export type Database = {
  __InternalSupabase: { PostgrestVersion: "14.5" };
  public: {
    Tables: {
      analytics_events: {
        Row: Row<AnalyticsEvent>;
        Insert: Ins<AnalyticsEvent> & {
          path: string;
          session_id: string;
          type: string;
          visitor_id: string;
        };
        Update: Ins<AnalyticsEvent>;
        Relationships: [];
      };
      content_items: {
        Row: Row<ContentItemRow>;
        Insert: Ins<ContentItemRow> & { collection: string; slug: string; title: string };
        Update: Ins<ContentItemRow>;
        Relationships: [];
      };
      leads: {
        Row: Row<LeadRow>;
        Insert: Ins<LeadRow> & { kind: string; name: string };
        Update: Ins<LeadRow>;
        Relationships: [
          {
            foreignKeyName: "leads_item_id_fkey";
            columns: ["item_id"];
            isOneToOne: false;
            referencedRelation: "content_items";
            referencedColumns: ["id"];
          },
        ];
      };
      site_content: {
        Row: Row<SiteContentRow>;
        Insert: Ins<SiteContentRow> & { key: string };
        Update: Ins<SiteContentRow>;
        Relationships: [];
      };
      user_roles: {
        Row: Row<UserRoleRow>;
        Insert: Ins<UserRoleRow> & { role: "admin" | "editor"; user_id: string };
        Update: Ins<UserRoleRow>;
        Relationships: [];
      };
    };
    Views: { [_ in never]: never };
    Functions: {
      analytics_overview: { Args: { p_from: string; p_to: string }; Returns: Json };
      has_role: { Args: { _role: "admin" | "editor"; _user_id: string }; Returns: boolean };
      is_staff: { Args: never; Returns: boolean };
      submit_lead: { Args: { p: Json }; Returns: string };
      track_events: { Args: { p: Json }; Returns: number };
    };
    Enums: { app_role: "admin" | "editor" };
    CompositeTypes: { [_ in never]: never };
  };
};
