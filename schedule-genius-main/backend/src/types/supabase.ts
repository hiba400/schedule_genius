// Copy of the types from frontend
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      availability: {
        Row: {
          available: boolean;
          created_at: string;
          day_of_week: number;
          id: string;
          professor_id: string;
          slot_index: number;
        };
        Insert: {
          available?: boolean;
          created_at?: string;
          day_of_week: number;
          id?: string;
          professor_id: string;
          slot_index: number;
        };
        Update: {
          available?: boolean;
          created_at?: string;
          day_of_week?: number;
          id?: string;
          professor_id?: string;
          slot_index?: number;
        };
      };
      constraints: {
        Row: {
          active: boolean;
          created_at: string;
          id: string;
          params: Json;
          priority: number;
          type: 'module_room' | 'time_incompatibility' | 'capacity_rule' | 'professor_preference';
          updated_at: string;
        };
        Insert: {
          active?: boolean;
          created_at?: string;
          id?: string;
          params?: Json;
          priority?: number;
          type: 'module_room' | 'time_incompatibility' | 'capacity_rule' | 'professor_preference';
          updated_at?: string;
        };
        Update: {
          active?: boolean;
          created_at?: string;
          id?: string;
          params?: Json;
          priority?: number;
          type?: 'module_room' | 'time_incompatibility' | 'capacity_rule' | 'professor_preference';
          updated_at?: string;
        };
      };
      generation_history: {
        Row: {
          completed_at: string | null;
          created_at: string;
          created_by: string | null;
          fitness_score: number;
          generation_count: number;
          id: string;
          parameters: Json;
          semester: string;
          status: string;
        };
        Insert: {
          completed_at?: string | null;
          created_at?: string;
          created_by?: string | null;
          fitness_score?: number;
          generation_count?: number;
          id?: string;
          parameters?: Json;
          semester: string;
          status?: string;
        };
        Update: {
          completed_at?: string | null;
          created_at?: string;
          created_by?: string | null;
          fitness_score?: number;
          generation_count?: number;
          id?: string;
          parameters?: Json;
          semester?: string;
          status?: string;
        };
      };
      groups: {
        Row: {
          created_at: string;
          id: string;
          name: string;
          program_id: string;
          size: number;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          name: string;
          program_id: string;
          size?: number;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          name?: string;
          program_id?: string;
          size?: number;
          updated_at?: string;
        };
      };
      modules: {
        Row: {
          code: string;
          created_at: string;
          hours_cm: number;
          hours_td: number;
          hours_tp: number;
          id: string;
          name: string;
          nature: 'informatique' | 'electronique' | 'instrumentation' | 'mathematiques' | 'physique' | 'langues' | 'gestion' | 'autre';
          program_id: string | null;
          type: 'CM' | 'TD' | 'TP';
          updated_at: string;
        };
        Insert: {
          code: string;
          created_at?: string;
          hours_cm?: number;
          hours_td?: number;
          hours_tp?: number;
          id?: string;
          name: string;
          nature?: 'informatique' | 'electronique' | 'instrumentation' | 'mathematiques' | 'physique' | 'langues' | 'gestion' | 'autre';
          program_id?: string | null;
          type?: 'CM' | 'TD' | 'TP';
          updated_at?: string;
        };
        Update: {
          code?: string;
          created_at?: string;
          hours_cm?: number;
          hours_td?: number;
          hours_tp?: number;
          id?: string;
          name?: string;
          nature?: 'informatique' | 'electronique' | 'instrumentation' | 'mathematiques' | 'physique' | 'langues' | 'gestion' | 'autre';
          program_id?: string | null;
          type?: 'CM' | 'TD' | 'TP';
          updated_at?: string;
        };
      };
      professors: {
        Row: {
          created_at: string;
          email: string;
          id: string;
          max_hours_per_week: number;
          name: string;
          specialties: string[] | null;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          email: string;
          id?: string;
          max_hours_per_week?: number;
          name: string;
          specialties?: string[] | null;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          email?: string;
          id?: string;
          max_hours_per_week?: number;
          name?: string;
          specialties?: string[] | null;
          updated_at?: string;
        };
      };
      profiles: {
        Row: {
          created_at: string;
          email: string;
          full_name: string | null;
          id: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          email: string;
          full_name?: string | null;
          id: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          email?: string;
          full_name?: string | null;
          id?: string;
          updated_at?: string;
        };
      };
      programs: {
        Row: {
          code: string;
          created_at: string;
          id: string;
          level: string;
          name: string;
          updated_at: string;
        };
        Insert: {
          code: string;
          created_at?: string;
          id?: string;
          level: string;
          name: string;
          updated_at?: string;
        };
        Update: {
          code?: string;
          created_at?: string;
          id?: string;
          level?: string;
          name?: string;
          updated_at?: string;
        };
      };
      rooms: {
        Row: {
          capacity: number;
          created_at: string;
          equipment: string[] | null;
          id: string;
          name: string;
          type: 'amphi' | 'td' | 'tp' | 'specialisee';
          updated_at: string;
        };
        Insert: {
          capacity?: number;
          created_at?: string;
          equipment?: string[] | null;
          id?: string;
          name: string;
          type?: 'amphi' | 'td' | 'tp' | 'specialisee';
          updated_at?: string;
        };
        Update: {
          capacity?: number;
          created_at?: string;
          equipment?: string[] | null;
          id?: string;
          name?: string;
          type?: 'amphi' | 'td' | 'tp' | 'specialisee';
          updated_at?: string;
        };
      };
      timetable_entries: {
        Row: {
          created_at: string;
          day_of_week: number;
          group_id: string;
          id: string;
          module_id: string;
          professor_id: string | null;
          room_id: string | null;
          semester: string;
          session_type: 'CM' | 'TD' | 'TP';
          slot_index: number;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          day_of_week: number;
          group_id: string;
          id?: string;
          module_id: string;
          professor_id?: string | null;
          room_id?: string | null;
          semester?: string;
          session_type?: 'CM' | 'TD' | 'TP';
          slot_index: number;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          day_of_week?: number;
          group_id?: string;
          id?: string;
          module_id?: string;
          professor_id?: string | null;
          room_id?: string | null;
          semester?: string;
          session_type?: 'CM' | 'TD' | 'TP';
          slot_index?: number;
          updated_at?: string;
        };
      };
      user_roles: {
        Row: {
          created_at: string;
          id: string;
          role: 'admin' | 'student';
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          role?: 'admin' | 'student';
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          role?: 'admin' | 'student';
          user_id?: string;
        };
      };
    };
    Enums: {
      app_role: 'admin' | 'student';
      constraint_type: 'module_room' | 'time_incompatibility' | 'capacity_rule' | 'professor_preference';
      module_nature: 'informatique' | 'electronique' | 'instrumentation' | 'mathematiques' | 'physique' | 'langues' | 'gestion' | 'autre';
      module_type: 'CM' | 'TD' | 'TP';
      room_type: 'amphi' | 'td' | 'tp' | 'specialisee';
    };
  };
};

