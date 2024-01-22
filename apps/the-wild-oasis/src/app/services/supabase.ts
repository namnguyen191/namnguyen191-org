import { createClient } from '@supabase/supabase-js';

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type CabinRow = {
  description: string;
  discount: number;
  id: number;
  image: string;
  max_capacity: number;
  name: string;
  regular_price: number;
};

export interface Database {
  public: {
    Tables: {
      bookings: {
        Row: {
          cabin_id: number | null;
          cabin_price: number | null;
          created_at: string;
          end_date: string | null;
          extra_price: number | null;
          guest_id: number | null;
          has_breakfast: boolean | null;
          has_paid: boolean | null;
          id: number;
          num_guests: number | null;
          num_nights: number | null;
          observations: string | null;
          start_date: string | null;
          status: string | null;
          total_price: number | null;
        };
        Insert: {
          cabin_id?: number | null;
          cabin_price?: number | null;
          created_at?: string;
          end_date?: string | null;
          extra_price?: number | null;
          guest_id?: number | null;
          has_breakfast?: boolean | null;
          has_paid?: boolean | null;
          id?: number;
          num_guests?: number | null;
          num_nights?: number | null;
          observations?: string | null;
          start_date?: string | null;
          status?: string | null;
          total_price?: number | null;
        };
        Update: {
          cabin_id?: number | null;
          cabin_price?: number | null;
          created_at?: string;
          end_date?: string | null;
          extra_price?: number | null;
          guest_id?: number | null;
          has_breakfast?: boolean | null;
          has_paid?: boolean | null;
          id?: number;
          num_guests?: number | null;
          num_nights?: number | null;
          observations?: string | null;
          start_date?: string | null;
          status?: string | null;
          total_price?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: 'bookings_cabin_id_fkey';
            columns: ['cabin_id'];
            isOneToOne: false;
            referencedRelation: 'cabins';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'bookings_guest_id_fkey';
            columns: ['guest_id'];
            isOneToOne: false;
            referencedRelation: 'guests';
            referencedColumns: ['id'];
          },
        ];
      };
      cabins: {
        Row: CabinRow;
        Insert: Partial<CabinRow>;
        Update: Partial<CabinRow>;
        Relationships: [];
      };
      guests: {
        Row: {
          country_flag: string | null;
          created_at: string;
          email: string | null;
          full_name: string | null;
          id: number;
          national_id_number: string | null;
          nationality: string | null;
        };
        Insert: {
          country_flag?: string | null;
          created_at?: string;
          email?: string | null;
          full_name?: string | null;
          id?: number;
          national_id_number?: string | null;
          nationality?: string | null;
        };
        Update: {
          country_flag?: string | null;
          created_at?: string;
          email?: string | null;
          full_name?: string | null;
          id?: number;
          national_id_number?: string | null;
          nationality?: string | null;
        };
        Relationships: [];
      };
      settings: {
        Row: {
          breakfast_price: number | null;
          created_at: string;
          id: number;
          max_booking_length: number | null;
          max_guests_per_booking: number | null;
          min_booking_length: number | null;
        };
        Insert: {
          breakfast_price?: number | null;
          created_at?: string;
          id?: number;
          max_booking_length?: number | null;
          max_guests_per_booking?: number | null;
          min_booking_length?: number | null;
        };
        Update: {
          breakfast_price?: number | null;
          created_at?: string;
          id?: number;
          max_booking_length?: number | null;
          max_guests_per_booking?: number | null;
          min_booking_length?: number | null;
        };
        Relationships: [];
      };
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
}

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (Database['public']['Tables'] & Database['public']['Views'])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions['schema']]['Tables'] &
        Database[PublicTableNameOrOptions['schema']]['Views'])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions['schema']]['Tables'] &
      Database[PublicTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (Database['public']['Tables'] &
        Database['public']['Views'])
    ? (Database['public']['Tables'] &
        Database['public']['Views'])[PublicTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  PublicTableNameOrOptions extends keyof Database['public']['Tables'] | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions['schema']]['Tables']
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof Database['public']['Tables']
    ? Database['public']['Tables'][PublicTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  PublicTableNameOrOptions extends keyof Database['public']['Tables'] | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions['schema']]['Tables']
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof Database['public']['Tables']
    ? Database['public']['Tables'][PublicTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  PublicEnumNameOrOptions extends keyof Database['public']['Enums'] | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions['schema']]['Enums']
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions['schema']]['Enums'][EnumName]
  : PublicEnumNameOrOptions extends keyof Database['public']['Enums']
    ? Database['public']['Enums'][PublicEnumNameOrOptions]
    : never;

export const supabaseUrl = 'https://ftuinjmlmtgcuvzwlahm.supabase.co';
export const supabaseKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ0dWluam1sbXRnY3V2endsYWhtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDU2MzgyMzksImV4cCI6MjAyMTIxNDIzOX0.toFnKPTuYXPrsDiWLXxmbVipIPu4evmt1Fw9vHbQCII'; // public API Key
export const supabase = createClient<Database>(supabaseUrl, supabaseKey);
