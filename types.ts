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
        Relationships: [];
      };
      milestones: {
        Row: {
          user_id: string;
          created_at: string;
          updated_at: string;
          story_subject: string | null;
          story_subject_other: string | null;
          sex: string | null;
          name: string | null;
          dob: string | null;
          hometown: string | null;
          ethnicity: string | null;
          ethnicity_other: string | null;
          health_context: string | null;
          family_dynamics: string | null;
          traditions_and_events: string | null;
          significant_memories: string | null;
          hopes_and_aspirations: string | null;
        };
        Insert: {
          user_id: string;
          created_at?: string;
          updated_at?: string;
          story_subject?: string | null;
          story_subject_other?: string | null;
          sex?: string | null;
          name?: string | null;
          dob?: string | null;
          hometown?: string | null;
          ethnicity?: string | null;
          ethnicity_other?: string | null;
          health_context?: string | null;
          family_dynamics?: string | null;
          traditions_and_events?: string | null;
          significant_memories?: string | null;
          hopes_and_aspirations?: string | null;
        };
        Update: {
          updated_at?: string;
          story_subject?: string | null;
          story_subject_other?: string | null;
          sex?: string | null;
          name?: string | null;
          dob?: string | null;
          hometown?: string | null;
          ethnicity?: string | null;
          ethnicity_other?: string | null;
          health_context?: string | null;
          family_dynamics?: string | null;
          traditions_and_events?: string | null;
          significant_memories?: string | null;
          hopes_and_aspirations?: string | null;
        };
        Relationships: [];
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
};


export type Chapter = Database['public']['Tables']['chapters']['Row'];

export interface MilestoneData {
  story_subject: string;
  story_subject_other: string;
  sex: 'male' | 'female' | '';
  name: string;
  dob: string;
  hometown: string;
  ethnicity: string;
  ethnicity_other: string;
  health_context: string;
  family_dynamics: string;
  traditions_and_events: string;
  significant_memories: string;
  hopes_and_aspirations: string;
}

export type CockpitView = 'milestones' | 'chapters' | 'pictures' | 'settings' | 'menu' | 'auth' | 'mobile-menu' | 'baby-card-builder' | 'share-tale' | null;

export enum ToastType {
  Success = 'success',
  Error = 'error',
  Info = 'info',
}

export type Theme = 'light' | 'dark';
