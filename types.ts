
export type Database = {
  public: {
    Tables: {
      chapters: {
        Row: {
          id: string;
          created_at: string;
          name: string;
          content: string;
          word_count: number;
          sort_order: number;
          user_id: string;
        };
        Insert: {
          id?: string;
          created_at?: string;
          name: string;
          content: string;
          word_count: number;
          sort_order: number;
          user_id: string;
        };
        Update: {
          name?: string;
          content?: string;
          word_count?: number;
          sort_order?: number;
        };
      };
      milestones: {
        Row: {
          user_id: string;
          created_at: string;
          updated_at: string;
          writing_about: string | null;
          sex: string | null;
          name: string | null;
          dob: string | null;
          hometown: string | null;
          ethnicity: string | null;
          traditions: string | null;
          family_members: string | null;
          favorite_memories: string | null;
          parent_wishes: string | null;
        };
        Insert: {
          user_id: string;
          created_at?: string;
          updated_at?: string;
          writing_about?: string | null;
          sex?: string | null;
          name?: string | null;
          dob?: string | null;
          hometown?: string | null;
          ethnicity?: string | null;
          traditions?: string | null;
          family_members?: string | null;
          favorite_memories?: string | null;
          parent_wishes?: string | null;
        };
        Update: {
          updated_at?: string;
          writing_about?: string | null;
          sex?: string | null;
          name?: string | null;
          dob?: string | null;
          hometown?: string | null;
          ethnicity?: string | null;
          traditions?: string | null;
          family_members?: string | null;
          favorite_memories?: string | null;
          parent_wishes?: string | null;
        };
      };
      profiles: {
        Row: {
          id: string;
          name: string | null;
        };
        Insert: {
          id: string;
          name: string | null;
        };
        Update: {
          name?: string | null;
        };
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
};


export type Chapter = Database['public']['Tables']['chapters']['Row'];

export interface MilestoneData {
  writing_about: string;
  sex: 'male' | 'female' | '';
  name: string;
  dob: string;
  hometown: string;
  ethnicity: string;
  traditions: string;
  family_members: string;
  favorite_memories: string;
  parent_wishes: string;
}

export type CockpitView = 'milestones' | 'chapters' | 'pictures' | 'settings' | 'menu' | 'auth' | null;

export enum ToastType {
  Success = 'success',
  Error = 'error',
  Info = 'info',
}

export type Theme = 'light' | 'dark';