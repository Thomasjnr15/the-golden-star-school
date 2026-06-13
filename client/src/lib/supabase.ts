import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env.local file'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          role: 'admin' | 'student';
          full_name: string;
          created_at: string;
        };
        Insert: {
          id: string;
          role: 'admin' | 'student';
          full_name: string;
        };
        Update: {
          full_name?: string;
        };
      };
      students: {
        Row: {
          id: string;
          user_id: string | null;
          full_name: string;
          registration_number: string;
          class: string;
          created_at: string;
        };
        Insert: {
          user_id?: string | null;
          full_name: string;
          registration_number: string;
          class: string;
        };
        Update: {
          full_name?: string;
          class?: string;
        };
      };
      school_settings: {
        Row: {
          id: number;
          school_name: string;
          tagline: string;
          logo: string | null;
          hero_heading: string;
          hero_subheading: string;
          hero_image: string | null;
          about_text: string | null;
          admission_text: string | null;
          admission_image: string | null;
          contact_email: string | null;
          contact_phone: string | null;
          contact_address: string | null;
          map_embed: string | null;
          bank_name: string | null;
          account_number: string | null;
          account_name: string | null;
          fees_table: Record<string, any>;
          primary_color: string;
          secondary_color: string;
          facebook: string | null;
          twitter: string | null;
          instagram: string | null;
          whatsapp: string | null;
          youtube: string | null;
          updated_at: string;
        };
      };
      news: {
        Row: {
          id: string;
          title: string;
          description: string;
          date: string;
          image_url: string | null;
          created_at: string;
        };
        Insert: {
          title: string;
          description: string;
          date: string;
          image_url?: string | null;
        };
        Update: {
          title?: string;
          description?: string;
          date?: string;
          image_url?: string | null;
        };
      };
      exams: {
        Row: {
          id: string;
          title: string;
          subject: string;
          class: string;
          date: string;
          start_time: string;
          duration: number;
          exam_type: 'ca' | 'ppt' | 'exam';
          term: '1st Term' | '2nd Term' | '3rd Term';
          session: string;
          max_score: number;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          title: string;
          subject: string;
          class: string;
          date: string;
          start_time: string;
          duration: number;
          exam_type: 'ca' | 'ppt' | 'exam';
          term: '1st Term' | '2nd Term' | '3rd Term';
          session: string;
          max_score?: number;
          is_active?: boolean;
        };
        Update: {
          title?: string;
          subject?: string;
          class?: string;
          date?: string;
          start_time?: string;
          duration?: number;
          exam_type?: 'ca' | 'ppt' | 'exam';
          term?: '1st Term' | '2nd Term' | '3rd Term';
          session?: string;
          max_score?: number;
          is_active?: boolean;
        };
      };
      questions: {
        Row: {
          id: string;
          exam_id: string;
          question_text: string;
          option_a: string;
          option_b: string;
          option_c: string;
          option_d: string;
          correct_option: 'a' | 'b' | 'c' | 'd';
          created_at: string;
        };
        Insert: {
          exam_id: string;
          question_text: string;
          option_a: string;
          option_b: string;
          option_c: string;
          option_d: string;
          correct_option: 'a' | 'b' | 'c' | 'd';
        };
        Update: {
          question_text?: string;
          option_a?: string;
          option_b?: string;
          option_c?: string;
          option_d?: string;
          correct_option?: 'a' | 'b' | 'c' | 'd';
        };
      };
      exam_sessions: {
        Row: {
          id: string;
          student_id: string;
          exam_id: string;
          started_at: string;
          submitted_at: string | null;
          question_order: string[];
        };
        Insert: {
          student_id: string;
          exam_id: string;
          question_order: string[];
        };
      };
      student_answers: {
        Row: {
          id: string;
          student_id: string;
          exam_id: string;
          question_id: string;
          selected_option: 'a' | 'b' | 'c' | 'd' | null;
          saved_at: string;
        };
        Insert: {
          student_id: string;
          exam_id: string;
          question_id: string;
          selected_option?: 'a' | 'b' | 'c' | 'd' | null;
        };
        Update: {
          selected_option?: 'a' | 'b' | 'c' | 'd' | null;
        };
      };
      exam_results: {
        Row: {
          id: string;
          student_id: string;
          exam_id: string;
          score: number;
          total: number;
          percentage: number;
          is_published: boolean;
          published_at: string | null;
          submitted_at: string;
        };
        Insert: {
          student_id: string;
          exam_id: string;
          score: number;
          total: number;
          is_published?: boolean;
        };
        Update: {
          is_published?: boolean;
          published_at?: string | null;
        };
      };
      score_components: {
        Row: {
          id: string;
          student_id: string;
          subject: string;
          class: string;
          term: '1st Term' | '2nd Term' | '3rd Term';
          session: string;
          ca_label: string;
          ca_max: number;
          ca_score: number | null;
          ppt_label: string;
          ppt_max: number;
          ppt_score: number | null;
          exam_label: string;
          exam_max: number;
          exam_score: number | null;
          exam_auto_filled: boolean;
          total_score: number;
          max_total: number;
          is_approved: boolean;
          approved_at: string | null;
          entered_by: string | null;
          entered_at: string;
          updated_at: string;
        };
        Insert: {
          student_id: string;
          subject: string;
          class: string;
          term: '1st Term' | '2nd Term' | '3rd Term';
          session: string;
          ca_label?: string;
          ca_max?: number;
          ca_score?: number | null;
          ppt_label?: string;
          ppt_max?: number;
          ppt_score?: number | null;
          exam_label?: string;
          exam_max?: number;
          exam_score?: number | null;
          entered_by?: string | null;
        };
        Update: {
          ca_score?: number | null;
          ppt_score?: number | null;
          exam_score?: number | null;
          is_approved?: boolean;
          approved_at?: string | null;
        };
      };
      report_cards: {
        Row: {
          id: string;
          student_id: string;
          term: '1st Term' | '2nd Term' | '3rd Term';
          session: string;
          class: string;
          subjects_data: Record<string, any>[];
          total_score: number | null;
          average_score: number | null;
          overall_grade: string | null;
          position_in_class: number | null;
          total_students_in_class: number | null;
          teacher_remark: string | null;
          head_teacher_remark: string | null;
          next_term_begins: string | null;
          days_present: number | null;
          days_absent: number | null;
          is_published: boolean;
          published_at: string | null;
          pdf_url: string | null;
          generated_at: string;
        };
        Insert: {
          student_id: string;
          term: '1st Term' | '2nd Term' | '3rd Term';
          session: string;
          class: string;
          subjects_data: Record<string, any>[];
          total_score?: number | null;
          average_score?: number | null;
          overall_grade?: string | null;
          position_in_class?: number | null;
          total_students_in_class?: number | null;
          teacher_remark?: string | null;
          head_teacher_remark?: string | null;
          next_term_begins?: string | null;
          days_present?: number | null;
          days_absent?: number | null;
        };
        Update: {
          teacher_remark?: string | null;
          head_teacher_remark?: string | null;
          next_term_begins?: string | null;
          days_present?: number | null;
          days_absent?: number | null;
          is_published?: boolean;
          published_at?: string | null;
          pdf_url?: string | null;
        };
      };
      payments: {
        Row: {
          id: string;
          student_id: string;
          amount: number;
          date_paid: string;
          status: 'paid' | 'pending';
          created_at: string;
        };
        Insert: {
          student_id: string;
          amount: number;
          date_paid: string;
          status?: 'paid' | 'pending';
        };
        Update: {
          amount?: number;
          date_paid?: string;
          status?: 'paid' | 'pending';
        };
      };
      registration_requests: {
        Row: {
          id: string;
          full_name: string;
          date_of_birth: string | null;
          gender: string | null;
          class_applying: string;
          previous_school: string | null;
          parent_name: string;
          parent_phone: string;
          parent_email: string;
          home_address: string | null;
          additional_info: string | null;
          status: 'pending' | 'approved' | 'rejected';
          assigned_registration_number: string | null;
          assigned_class: string | null;
          submitted_at: string;
          reviewed_at: string | null;
        };
        Insert: {
          full_name: string;
          date_of_birth?: string | null;
          gender?: string | null;
          class_applying: string;
          previous_school?: string | null;
          parent_name: string;
          parent_phone: string;
          parent_email: string;
          home_address?: string | null;
          additional_info?: string | null;
        };
        Update: {
          status?: 'pending' | 'approved' | 'rejected';
          assigned_registration_number?: string | null;
          assigned_class?: string | null;
          reviewed_at?: string | null;
        };
      };
      contact_messages: {
        Row: {
          id: string;
          name: string;
          email: string;
          message: string;
          is_read: boolean;
          received_at: string;
        };
        Insert: {
          name: string;
          email: string;
          message: string;
        };
      };
    };
  };
};
