/**
 * Auto-generated Supabase database types for KosVibe.
 *
 * This file mirrors the public schema after Sprint 2 (Places Architecture).
 * It includes:
 *   - Existing tables: profiles, restaurants, restaurant_images, saved_restaurants,
 *     menu_categories, menu_items
 *   - Existing view: restaurant_catalog
 *   - Sprint 1 tables: roles, user_roles, business_accounts, business_members
 *   - Sprint 1 enums: record_status, business_status, business_member_role,
 *     business_member_status
 *   - Sprint 2 tables: cities, place_categories, places, place_category_links,
 *     place_images, place_hours, place_contacts, tags, place_tags,
 *     restaurant_profiles
 *   - Sprint 2 views: place_catalog, restaurants_compat
 *   - Sprint 2 enums: place_status, place_kind, contact_kind, day_of_week
 *
 * Regenerate after future migrations with:
 *   npx supabase gen types typescript --project-id <ref> > src/types/database.types.ts
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type RecordStatus = 'active' | 'archived';

export type BusinessStatus = 'pending' | 'active' | 'inactive' | 'suspended';

export type BusinessMemberRole = 'owner' | 'manager' | 'staff';

export type BusinessMemberStatus = 'active' | 'invited' | 'removed';

export type PlaceStatus = 'draft' | 'active' | 'inactive' | 'archived';

export type PlaceKind =
  | 'restaurant'
  | 'cafe'
  | 'bar'
  | 'venue'
  | 'attraction'
  | 'hotel'
  | 'shop'
  | 'other';

export type ContactKind =
  | 'phone'
  | 'email'
  | 'website'
  | 'instagram'
  | 'facebook'
  | 'tiktok'
  | 'x'
  | 'other';

export type DayOfWeek = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never;
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string | null;
          avatar_url: string | null;
          preferred_language: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name?: string | null;
          avatar_url?: string | null;
          preferred_language?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          preferred_language?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      restaurants: {
        Row: {
          id: string;
          name: string;
          slug: string;
          description: string | null;
          city: string;
          address: string | null;
          cuisine: string | null;
          price_range: string | null;
          rating: number | null;
          latitude: number | null;
          longitude: number | null;
          phone: string | null;
          website: string | null;
          is_featured: boolean;
          is_published: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          description?: string | null;
          city: string;
          address?: string | null;
          cuisine?: string | null;
          price_range?: string | null;
          rating?: number | null;
          latitude?: number | null;
          longitude?: number | null;
          phone?: string | null;
          website?: string | null;
          is_featured?: boolean;
          is_published?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          description?: string | null;
          city?: string;
          address?: string | null;
          cuisine?: string | null;
          price_range?: string | null;
          rating?: number | null;
          latitude?: number | null;
          longitude?: number | null;
          phone?: string | null;
          website?: string | null;
          is_featured?: boolean;
          is_published?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      restaurant_images: {
        Row: {
          id: string;
          restaurant_id: string;
          image_url: string;
          alt_text: string | null;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          restaurant_id: string;
          image_url: string;
          alt_text?: string | null;
          sort_order?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          restaurant_id?: string;
          image_url?: string;
          alt_text?: string | null;
          sort_order?: number;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'restaurant_images_restaurant_id_fkey';
            columns: ['restaurant_id'];
            isOneToOne: false;
            referencedRelation: 'restaurants';
            referencedColumns: ['id'];
          },
        ];
      };
      saved_restaurants: {
        Row: {
          id: string;
          user_id: string;
          restaurant_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          restaurant_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          restaurant_id?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'saved_restaurants_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'saved_restaurants_restaurant_id_fkey';
            columns: ['restaurant_id'];
            isOneToOne: false;
            referencedRelation: 'restaurants';
            referencedColumns: ['id'];
          },
        ];
      };
      menu_categories: {
        Row: {
          id: string;
          restaurant_id: string;
          name: string;
          description: string | null;
          sort_order: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          restaurant_id: string;
          name: string;
          description?: string | null;
          sort_order?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          restaurant_id?: string;
          name?: string;
          description?: string | null;
          sort_order?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'menu_categories_restaurant_id_fkey';
            columns: ['restaurant_id'];
            isOneToOne: false;
            referencedRelation: 'restaurants';
            referencedColumns: ['id'];
          },
        ];
      };
      menu_items: {
        Row: {
          id: string;
          category_id: string;
          name: string;
          description: string | null;
          price: number;
          image_url: string | null;
          image_alt_text: string | null;
          sort_order: number;
          is_available: boolean;
          availability_note: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          category_id: string;
          name: string;
          description?: string | null;
          price: number;
          image_url?: string | null;
          image_alt_text?: string | null;
          sort_order?: number;
          is_available?: boolean;
          availability_note?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          category_id?: string;
          name?: string;
          description?: string | null;
          price?: number;
          image_url?: string | null;
          image_alt_text?: string | null;
          sort_order?: number;
          is_available?: boolean;
          availability_note?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'menu_items_category_id_fkey';
            columns: ['category_id'];
            isOneToOne: false;
            referencedRelation: 'menu_categories';
            referencedColumns: ['id'];
          },
        ];
      };
      roles: {
        Row: {
          id: string;
          slug: string;
          name: string;
          description: string | null;
          is_system: boolean;
          status: RecordStatus;
          created_at: string;
          updated_at: string;
          created_by: string | null;
          updated_by: string | null;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          slug: string;
          name: string;
          description?: string | null;
          is_system?: boolean;
          status?: RecordStatus;
          created_at?: string;
          updated_at?: string;
          created_by?: string | null;
          updated_by?: string | null;
          deleted_at?: string | null;
        };
        Update: {
          id?: string;
          slug?: string;
          name?: string;
          description?: string | null;
          is_system?: boolean;
          status?: RecordStatus;
          created_at?: string;
          updated_at?: string;
          created_by?: string | null;
          updated_by?: string | null;
          deleted_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'roles_created_by_fkey';
            columns: ['created_by'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'roles_updated_by_fkey';
            columns: ['updated_by'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      user_roles: {
        Row: {
          id: string;
          user_id: string;
          role_id: string;
          status: RecordStatus;
          created_at: string;
          updated_at: string;
          created_by: string | null;
          updated_by: string | null;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          role_id: string;
          status?: RecordStatus;
          created_at?: string;
          updated_at?: string;
          created_by?: string | null;
          updated_by?: string | null;
          deleted_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          role_id?: string;
          status?: RecordStatus;
          created_at?: string;
          updated_at?: string;
          created_by?: string | null;
          updated_by?: string | null;
          deleted_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'user_roles_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'user_roles_role_id_fkey';
            columns: ['role_id'];
            isOneToOne: false;
            referencedRelation: 'roles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'user_roles_created_by_fkey';
            columns: ['created_by'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'user_roles_updated_by_fkey';
            columns: ['updated_by'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      business_accounts: {
        Row: {
          id: string;
          slug: string;
          name: string;
          description: string | null;
          business_type: string | null;
          email: string | null;
          phone: string | null;
          website: string | null;
          logo_url: string | null;
          status: BusinessStatus;
          created_at: string;
          updated_at: string;
          created_by: string | null;
          updated_by: string | null;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          slug?: string;
          name: string;
          description?: string | null;
          business_type?: string | null;
          email?: string | null;
          phone?: string | null;
          website?: string | null;
          logo_url?: string | null;
          status?: BusinessStatus;
          created_at?: string;
          updated_at?: string;
          created_by?: string | null;
          updated_by?: string | null;
          deleted_at?: string | null;
        };
        Update: {
          id?: string;
          slug?: string;
          name?: string;
          description?: string | null;
          business_type?: string | null;
          email?: string | null;
          phone?: string | null;
          website?: string | null;
          logo_url?: string | null;
          status?: BusinessStatus;
          created_at?: string;
          updated_at?: string;
          created_by?: string | null;
          updated_by?: string | null;
          deleted_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'business_accounts_created_by_fkey';
            columns: ['created_by'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'business_accounts_updated_by_fkey';
            columns: ['updated_by'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      business_members: {
        Row: {
          id: string;
          business_account_id: string;
          user_id: string;
          role: BusinessMemberRole;
          status: BusinessMemberStatus;
          created_at: string;
          updated_at: string;
          created_by: string | null;
          updated_by: string | null;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          business_account_id: string;
          user_id: string;
          role?: BusinessMemberRole;
          status?: BusinessMemberStatus;
          created_at?: string;
          updated_at?: string;
          created_by?: string | null;
          updated_by?: string | null;
          deleted_at?: string | null;
        };
        Update: {
          id?: string;
          business_account_id?: string;
          user_id?: string;
          role?: BusinessMemberRole;
          status?: BusinessMemberStatus;
          created_at?: string;
          updated_at?: string;
          created_by?: string | null;
          updated_by?: string | null;
          deleted_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'business_members_business_account_id_fkey';
            columns: ['business_account_id'];
            isOneToOne: false;
            referencedRelation: 'business_accounts';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'business_members_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'business_members_created_by_fkey';
            columns: ['created_by'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'business_members_updated_by_fkey';
            columns: ['updated_by'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      cities: {
        Row: {
          id: string;
          slug: string;
          name: string;
          name_sq: string | null;
          region: string | null;
          country: string;
          latitude: number | null;
          longitude: number | null;
          default_zoom: number;
          is_active: boolean;
          sort_order: number;
          created_at: string;
          updated_at: string;
          created_by: string | null;
          updated_by: string | null;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          slug?: string;
          name: string;
          name_sq?: string | null;
          region?: string | null;
          country?: string;
          latitude?: number | null;
          longitude?: number | null;
          default_zoom?: number;
          is_active?: boolean;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
          created_by?: string | null;
          updated_by?: string | null;
          deleted_at?: string | null;
        };
        Update: {
          id?: string;
          slug?: string;
          name?: string;
          name_sq?: string | null;
          region?: string | null;
          country?: string;
          latitude?: number | null;
          longitude?: number | null;
          default_zoom?: number;
          is_active?: boolean;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
          created_by?: string | null;
          updated_by?: string | null;
          deleted_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'cities_created_by_fkey';
            columns: ['created_by'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'cities_updated_by_fkey';
            columns: ['updated_by'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      place_categories: {
        Row: {
          id: string;
          slug: string;
          name: string;
          name_sq: string | null;
          description: string | null;
          icon: string | null;
          accent_color: string | null;
          is_active: boolean;
          sort_order: number;
          created_at: string;
          updated_at: string;
          created_by: string | null;
          updated_by: string | null;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          slug?: string;
          name: string;
          name_sq?: string | null;
          description?: string | null;
          icon?: string | null;
          accent_color?: string | null;
          is_active?: boolean;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
          created_by?: string | null;
          updated_by?: string | null;
          deleted_at?: string | null;
        };
        Update: {
          id?: string;
          slug?: string;
          name?: string;
          name_sq?: string | null;
          description?: string | null;
          icon?: string | null;
          accent_color?: string | null;
          is_active?: boolean;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
          created_by?: string | null;
          updated_by?: string | null;
          deleted_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'place_categories_created_by_fkey';
            columns: ['created_by'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'place_categories_updated_by_fkey';
            columns: ['updated_by'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      places: {
        Row: {
          id: string;
          slug: string;
          name: string;
          description: string | null;
          kind: PlaceKind;
          city_id: string | null;
          city: string | null;
          address: string | null;
          latitude: number | null;
          longitude: number | null;
          price_range: string | null;
          rating: number | null;
          review_count: number;
          is_featured: boolean;
          is_published: boolean;
          status: PlaceStatus;
          business_account_id: string | null;
          created_at: string;
          updated_at: string;
          created_by: string | null;
          updated_by: string | null;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          slug?: string;
          name: string;
          description?: string | null;
          kind?: PlaceKind;
          city_id?: string | null;
          city?: string | null;
          address?: string | null;
          latitude?: number | null;
          longitude?: number | null;
          price_range?: string | null;
          rating?: number | null;
          review_count?: number;
          is_featured?: boolean;
          is_published?: boolean;
          status?: PlaceStatus;
          business_account_id?: string | null;
          created_at?: string;
          updated_at?: string;
          created_by?: string | null;
          updated_by?: string | null;
          deleted_at?: string | null;
        };
        Update: {
          id?: string;
          slug?: string;
          name?: string;
          description?: string | null;
          kind?: PlaceKind;
          city_id?: string | null;
          city?: string | null;
          address?: string | null;
          latitude?: number | null;
          longitude?: number | null;
          price_range?: string | null;
          rating?: number | null;
          review_count?: number;
          is_featured?: boolean;
          is_published?: boolean;
          status?: PlaceStatus;
          business_account_id?: string | null;
          created_at?: string;
          updated_at?: string;
          created_by?: string | null;
          updated_by?: string | null;
          deleted_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'places_city_id_fkey';
            columns: ['city_id'];
            isOneToOne: false;
            referencedRelation: 'cities';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'places_business_account_id_fkey';
            columns: ['business_account_id'];
            isOneToOne: false;
            referencedRelation: 'business_accounts';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'places_created_by_fkey';
            columns: ['created_by'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'places_updated_by_fkey';
            columns: ['updated_by'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      place_category_links: {
        Row: {
          id: string;
          place_id: string;
          category_id: string;
          is_primary: boolean;
          sort_order: number;
          created_at: string;
          updated_at: string;
          created_by: string | null;
          updated_by: string | null;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          place_id: string;
          category_id: string;
          is_primary?: boolean;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
          created_by?: string | null;
          updated_by?: string | null;
          deleted_at?: string | null;
        };
        Update: {
          id?: string;
          place_id?: string;
          category_id?: string;
          is_primary?: boolean;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
          created_by?: string | null;
          updated_by?: string | null;
          deleted_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'place_category_links_place_id_fkey';
            columns: ['place_id'];
            isOneToOne: false;
            referencedRelation: 'places';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'place_category_links_category_id_fkey';
            columns: ['category_id'];
            isOneToOne: false;
            referencedRelation: 'place_categories';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'place_category_links_created_by_fkey';
            columns: ['created_by'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'place_category_links_updated_by_fkey';
            columns: ['updated_by'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      place_images: {
        Row: {
          id: string;
          place_id: string;
          image_url: string;
          alt_text: string | null;
          sort_order: number;
          is_primary: boolean;
          created_at: string;
          updated_at: string;
          created_by: string | null;
          updated_by: string | null;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          place_id: string;
          image_url: string;
          alt_text?: string | null;
          sort_order?: number;
          is_primary?: boolean;
          created_at?: string;
          updated_at?: string;
          created_by?: string | null;
          updated_by?: string | null;
          deleted_at?: string | null;
        };
        Update: {
          id?: string;
          place_id?: string;
          image_url?: string;
          alt_text?: string | null;
          sort_order?: number;
          is_primary?: boolean;
          created_at?: string;
          updated_at?: string;
          created_by?: string | null;
          updated_by?: string | null;
          deleted_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'place_images_place_id_fkey';
            columns: ['place_id'];
            isOneToOne: false;
            referencedRelation: 'places';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'place_images_created_by_fkey';
            columns: ['created_by'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'place_images_updated_by_fkey';
            columns: ['updated_by'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      place_hours: {
        Row: {
          id: string;
          place_id: string;
          day_of_week: DayOfWeek;
          open_time: string | null;
          close_time: string | null;
          is_closed: boolean;
          sort_order: number;
          created_at: string;
          updated_at: string;
          created_by: string | null;
          updated_by: string | null;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          place_id: string;
          day_of_week: DayOfWeek;
          open_time?: string | null;
          close_time?: string | null;
          is_closed?: boolean;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
          created_by?: string | null;
          updated_by?: string | null;
          deleted_at?: string | null;
        };
        Update: {
          id?: string;
          place_id?: string;
          day_of_week?: DayOfWeek;
          open_time?: string | null;
          close_time?: string | null;
          is_closed?: boolean;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
          created_by?: string | null;
          updated_by?: string | null;
          deleted_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'place_hours_place_id_fkey';
            columns: ['place_id'];
            isOneToOne: false;
            referencedRelation: 'places';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'place_hours_created_by_fkey';
            columns: ['created_by'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'place_hours_updated_by_fkey';
            columns: ['updated_by'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      place_contacts: {
        Row: {
          id: string;
          place_id: string;
          kind: ContactKind;
          value: string;
          label: string | null;
          is_primary: boolean;
          sort_order: number;
          created_at: string;
          updated_at: string;
          created_by: string | null;
          updated_by: string | null;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          place_id: string;
          kind: ContactKind;
          value: string;
          label?: string | null;
          is_primary?: boolean;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
          created_by?: string | null;
          updated_by?: string | null;
          deleted_at?: string | null;
        };
        Update: {
          id?: string;
          place_id?: string;
          kind?: ContactKind;
          value?: string;
          label?: string | null;
          is_primary?: boolean;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
          created_by?: string | null;
          updated_by?: string | null;
          deleted_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'place_contacts_place_id_fkey';
            columns: ['place_id'];
            isOneToOne: false;
            referencedRelation: 'places';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'place_contacts_created_by_fkey';
            columns: ['created_by'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'place_contacts_updated_by_fkey';
            columns: ['updated_by'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      tags: {
        Row: {
          id: string;
          slug: string;
          name: string;
          name_sq: string | null;
          description: string | null;
          is_system: boolean;
          is_active: boolean;
          created_at: string;
          updated_at: string;
          created_by: string | null;
          updated_by: string | null;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          slug?: string;
          name: string;
          name_sq?: string | null;
          description?: string | null;
          is_system?: boolean;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
          created_by?: string | null;
          updated_by?: string | null;
          deleted_at?: string | null;
        };
        Update: {
          id?: string;
          slug?: string;
          name?: string;
          name_sq?: string | null;
          description?: string | null;
          is_system?: boolean;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
          created_by?: string | null;
          updated_by?: string | null;
          deleted_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'tags_created_by_fkey';
            columns: ['created_by'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'tags_updated_by_fkey';
            columns: ['updated_by'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      place_tags: {
        Row: {
          id: string;
          place_id: string;
          tag_id: string;
          sort_order: number;
          created_at: string;
          updated_at: string;
          created_by: string | null;
          updated_by: string | null;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          place_id: string;
          tag_id: string;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
          created_by?: string | null;
          updated_by?: string | null;
          deleted_at?: string | null;
        };
        Update: {
          id?: string;
          place_id?: string;
          tag_id?: string;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
          created_by?: string | null;
          updated_by?: string | null;
          deleted_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'place_tags_place_id_fkey';
            columns: ['place_id'];
            isOneToOne: false;
            referencedRelation: 'places';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'place_tags_tag_id_fkey';
            columns: ['tag_id'];
            isOneToOne: false;
            referencedRelation: 'tags';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'place_tags_created_by_fkey';
            columns: ['created_by'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'place_tags_updated_by_fkey';
            columns: ['updated_by'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      restaurant_profiles: {
        Row: {
          id: string;
          place_id: string;
          cuisine: string | null;
          tagline: string | null;
          hours_text: string | null;
          is_open_now: boolean;
          reservation_enabled: boolean;
          delivery_enabled: boolean;
          takeaway_enabled: boolean;
          created_at: string;
          updated_at: string;
          created_by: string | null;
          updated_by: string | null;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          place_id: string;
          cuisine?: string | null;
          tagline?: string | null;
          hours_text?: string | null;
          is_open_now?: boolean;
          reservation_enabled?: boolean;
          delivery_enabled?: boolean;
          takeaway_enabled?: boolean;
          created_at?: string;
          updated_at?: string;
          created_by?: string | null;
          updated_by?: string | null;
          deleted_at?: string | null;
        };
        Update: {
          id?: string;
          place_id?: string;
          cuisine?: string | null;
          tagline?: string | null;
          hours_text?: string | null;
          is_open_now?: boolean;
          reservation_enabled?: boolean;
          delivery_enabled?: boolean;
          takeaway_enabled?: boolean;
          created_at?: string;
          updated_at?: string;
          created_by?: string | null;
          updated_by?: string | null;
          deleted_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'restaurant_profiles_place_id_fkey';
            columns: ['place_id'];
            isOneToOne: true;
            referencedRelation: 'places';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'restaurant_profiles_created_by_fkey';
            columns: ['created_by'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'restaurant_profiles_updated_by_fkey';
            columns: ['updated_by'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
    };
    Views: {
      restaurant_catalog: {
        Row: {
          id: string;
          slug: string;
          name: string;
          description: string | null;
          city: string;
          address: string | null;
          cuisine: string | null;
          price_range: string | null;
          rating: number | null;
          latitude: number | null;
          longitude: number | null;
          phone: string | null;
          website: string | null;
          is_featured: boolean;
          image_url: string | null;
        };
        Relationships: [];
      };
      place_catalog: {
        Row: {
          id: string;
          slug: string;
          name: string;
          description: string | null;
          city: string | null;
          address: string | null;
          cuisine: string | null;
          price_range: string | null;
          rating: number | null;
          latitude: number | null;
          longitude: number | null;
          phone: string | null;
          website: string | null;
          is_featured: boolean;
          image_url: string | null;
          kind: PlaceKind;
          city_id: string | null;
          status: PlaceStatus;
        };
        Relationships: [];
      };
      restaurants_compat: {
        Row: {
          id: string;
          slug: string;
          name: string;
          description: string | null;
          city: string | null;
          address: string | null;
          cuisine: string | null;
          price_range: string | null;
          rating: number | null;
          latitude: number | null;
          longitude: number | null;
          phone: string | null;
          website: string | null;
          is_featured: boolean;
          is_published: boolean;
          created_at: string;
          updated_at: string;
        };
        Relationships: [];
      };
    };
    Functions: {
      slugify: {
        Args: { input: string };
        Returns: string;
      };
      set_updated_at: {
        Args: Record<string, never>;
        Returns: unknown;
      };
      set_created_by: {
        Args: Record<string, never>;
        Returns: unknown;
      };
      set_updated_by: {
        Args: Record<string, never>;
        Returns: unknown;
      };
      set_business_account_slug: {
        Args: Record<string, never>;
        Returns: unknown;
      };
      set_city_slug: {
        Args: Record<string, never>;
        Returns: unknown;
      };
      set_place_category_slug: {
        Args: Record<string, never>;
        Returns: unknown;
      };
      set_place_slug: {
        Args: Record<string, never>;
        Returns: unknown;
      };
      set_tag_slug: {
        Args: Record<string, never>;
        Returns: unknown;
      };
      is_admin: {
        Args: Record<string, never>;
        Returns: boolean;
      };
      is_business_owner: {
        Args: { business_id: string };
        Returns: boolean;
      };
      is_business_member: {
        Args: { business_id: string };
        Returns: boolean;
      };
      is_place_owner: {
        Args: { place_id: string };
        Returns: boolean;
      };
      assign_default_role: {
        Args: Record<string, never>;
        Returns: unknown;
      };
      create_business_owner_membership: {
        Args: Record<string, never>;
        Returns: unknown;
      };
    };
    Enums: {
      record_status: RecordStatus;
      business_status: BusinessStatus;
      business_member_role: BusinessMemberRole;
      business_member_status: BusinessMemberStatus;
      place_status: PlaceStatus;
      place_kind: PlaceKind;
      contact_kind: ContactKind;
      day_of_week: DayOfWeek;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
  storage: {
    Tables: {
      [_ in never]: never;
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

// Convenience type aliases for the default (public) schema.
// These mirror the official Supabase generated types helpers but are simplified
// to remain compatible with the project's strict TypeScript configuration.

export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row'];

export type TablesInsert<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Insert'];

export type TablesUpdate<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Update'];

export type Views<T extends keyof Database['public']['Views']> =
  Database['public']['Views'][T]['Row'];

export type Functions<T extends keyof Database['public']['Functions']> =
  Database['public']['Functions'][T];

export type Enums<T extends keyof Database['public']['Enums']> =
  Database['public']['Enums'][T];
