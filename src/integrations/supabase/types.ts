export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      career_goals: {
        Row: {
          created_at: string | null
          current_position: string | null
          id: string
          is_active: boolean | null
          milestones: Json | null
          progress_notes: string | null
          skills_needed: string[] | null
          target_company: string | null
          target_role: string | null
          timeline_months: number | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          current_position?: string | null
          id?: string
          is_active?: boolean | null
          milestones?: Json | null
          progress_notes?: string | null
          skills_needed?: string[] | null
          target_company?: string | null
          target_role?: string | null
          timeline_months?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          current_position?: string | null
          id?: string
          is_active?: boolean | null
          milestones?: Json | null
          progress_notes?: string | null
          skills_needed?: string[] | null
          target_company?: string | null
          target_role?: string | null
          timeline_months?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      companies: {
        Row: {
          created_at: string | null
          description: string | null
          founded_year: number | null
          id: string
          industry: string | null
          location: string | null
          logo_url: string | null
          name: string
          size_range: string | null
          updated_at: string | null
          website: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          founded_year?: number | null
          id?: string
          industry?: string | null
          location?: string | null
          logo_url?: string | null
          name: string
          size_range?: string | null
          updated_at?: string | null
          website?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          founded_year?: number | null
          id?: string
          industry?: string | null
          location?: string | null
          logo_url?: string | null
          name?: string
          size_range?: string | null
          updated_at?: string | null
          website?: string | null
        }
        Relationships: []
      }
      connections: {
        Row: {
          connected_at: string | null
          created_at: string | null
          id: string
          message: string | null
          recipient_id: string | null
          requester_id: string | null
          status: string | null
        }
        Insert: {
          connected_at?: string | null
          created_at?: string | null
          id?: string
          message?: string | null
          recipient_id?: string | null
          requester_id?: string | null
          status?: string | null
        }
        Update: {
          connected_at?: string | null
          created_at?: string | null
          id?: string
          message?: string | null
          recipient_id?: string | null
          requester_id?: string | null
          status?: string | null
        }
        Relationships: []
      }
      courses: {
        Row: {
          category: string | null
          created_at: string | null
          created_by: string | null
          curriculum: Json | null
          description: string | null
          difficulty_level: string | null
          duration_hours: number | null
          enrolled_count: number | null
          id: string
          instructor_bio: string | null
          instructor_name: string | null
          is_active: boolean | null
          is_free: boolean | null
          price: number | null
          rating: number | null
          skills_taught: string[] | null
          thumbnail_url: string | null
          title: string
          updated_at: string | null
          video_url: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          created_by?: string | null
          curriculum?: Json | null
          description?: string | null
          difficulty_level?: string | null
          duration_hours?: number | null
          enrolled_count?: number | null
          id?: string
          instructor_bio?: string | null
          instructor_name?: string | null
          is_active?: boolean | null
          is_free?: boolean | null
          price?: number | null
          rating?: number | null
          skills_taught?: string[] | null
          thumbnail_url?: string | null
          title: string
          updated_at?: string | null
          video_url?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          created_by?: string | null
          curriculum?: Json | null
          description?: string | null
          difficulty_level?: string | null
          duration_hours?: number | null
          enrolled_count?: number | null
          id?: string
          instructor_bio?: string | null
          instructor_name?: string | null
          is_active?: boolean | null
          is_free?: boolean | null
          price?: number | null
          rating?: number | null
          skills_taught?: string[] | null
          thumbnail_url?: string | null
          title?: string
          updated_at?: string | null
          video_url?: string | null
        }
        Relationships: []
      }
      cover_letters: {
        Row: {
          content: string
          created_at: string | null
          id: string
          job_id: string | null
          title: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          job_id?: string | null
          title: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          job_id?: string | null
          title?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cover_letters_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      job_applications: {
        Row: {
          applied_at: string | null
          cover_letter: string | null
          id: string
          job_id: string | null
          resume_url: string | null
          status: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          applied_at?: string | null
          cover_letter?: string | null
          id?: string
          job_id?: string | null
          resume_url?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          applied_at?: string | null
          cover_letter?: string | null
          id?: string
          job_id?: string | null
          resume_url?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "job_applications_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      jobs: {
        Row: {
          benefits: string[] | null
          company_id: string | null
          created_at: string | null
          description: string
          employment_type: string | null
          experience_level: string | null
          expires_at: string | null
          id: string
          is_active: boolean | null
          is_remote: boolean | null
          location: string | null
          posted_at: string | null
          posted_by: string | null
          requirements: string | null
          salary_max: number | null
          salary_min: number | null
          skills_required: string[] | null
          title: string
          updated_at: string | null
        }
        Insert: {
          benefits?: string[] | null
          company_id?: string | null
          created_at?: string | null
          description: string
          employment_type?: string | null
          experience_level?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          is_remote?: boolean | null
          location?: string | null
          posted_at?: string | null
          posted_by?: string | null
          requirements?: string | null
          salary_max?: number | null
          salary_min?: number | null
          skills_required?: string[] | null
          title: string
          updated_at?: string | null
        }
        Update: {
          benefits?: string[] | null
          company_id?: string | null
          created_at?: string | null
          description?: string
          employment_type?: string | null
          experience_level?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          is_remote?: boolean | null
          location?: string | null
          posted_at?: string | null
          posted_by?: string | null
          requirements?: string | null
          salary_max?: number | null
          salary_min?: number | null
          skills_required?: string[] | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "jobs_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      learning_paths: {
        Row: {
          course_ids: string[] | null
          created_at: string | null
          created_by: string | null
          description: string | null
          difficulty_level: string | null
          estimated_duration_weeks: number | null
          id: string
          skills_gained: string[] | null
          target_role: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          course_ids?: string[] | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          difficulty_level?: string | null
          estimated_duration_weeks?: number | null
          id?: string
          skills_gained?: string[] | null
          target_role?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          course_ids?: string[] | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          difficulty_level?: string | null
          estimated_duration_weeks?: number | null
          id?: string
          skills_gained?: string[] | null
          target_role?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      post_comments: {
        Row: {
          author_id: string | null
          content: string
          created_at: string | null
          id: string
          likes_count: number | null
          parent_comment_id: string | null
          post_id: string | null
          updated_at: string | null
        }
        Insert: {
          author_id?: string | null
          content: string
          created_at?: string | null
          id?: string
          likes_count?: number | null
          parent_comment_id?: string | null
          post_id?: string | null
          updated_at?: string | null
        }
        Update: {
          author_id?: string | null
          content?: string
          created_at?: string | null
          id?: string
          likes_count?: number | null
          parent_comment_id?: string | null
          post_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "post_comments_parent_comment_id_fkey"
            columns: ["parent_comment_id"]
            isOneToOne: false
            referencedRelation: "post_comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      post_reactions: {
        Row: {
          created_at: string | null
          id: string
          post_id: string | null
          reaction_type: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          post_id?: string | null
          reaction_type?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          post_id?: string | null
          reaction_type?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "post_reactions_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      posts: {
        Row: {
          author_id: string | null
          comments_count: number | null
          content: string
          created_at: string | null
          id: string
          is_public: boolean | null
          likes_count: number | null
          media_urls: string[] | null
          post_type: string | null
          shares_count: number | null
          tags: string[] | null
          updated_at: string | null
        }
        Insert: {
          author_id?: string | null
          comments_count?: number | null
          content: string
          created_at?: string | null
          id?: string
          is_public?: boolean | null
          likes_count?: number | null
          media_urls?: string[] | null
          post_type?: string | null
          shares_count?: number | null
          tags?: string[] | null
          updated_at?: string | null
        }
        Update: {
          author_id?: string | null
          comments_count?: number | null
          content?: string
          created_at?: string | null
          id?: string
          is_public?: boolean | null
          likes_count?: number | null
          media_urls?: string[] | null
          post_type?: string | null
          shares_count?: number | null
          tags?: string[] | null
          updated_at?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          about: string | null
          cover_image_url: string | null
          created_at: string | null
          current_company: string | null
          email: string | null
          experience_years: number | null
          full_name: string | null
          github_url: string | null
          id: string
          industry: string | null
          is_profile_public: boolean | null
          linkedin_url: string | null
          location: string | null
          looking_for_job: boolean | null
          open_to_remote: boolean | null
          phone: string | null
          portfolio_url: string | null
          preferred_locations: string[] | null
          preferred_salary_max: number | null
          preferred_salary_min: number | null
          profile_picture_url: string | null
          resume_url: string | null
          skills: string[] | null
          title: string | null
          updated_at: string | null
          website: string | null
        }
        Insert: {
          about?: string | null
          cover_image_url?: string | null
          created_at?: string | null
          current_company?: string | null
          email?: string | null
          experience_years?: number | null
          full_name?: string | null
          github_url?: string | null
          id: string
          industry?: string | null
          is_profile_public?: boolean | null
          linkedin_url?: string | null
          location?: string | null
          looking_for_job?: boolean | null
          open_to_remote?: boolean | null
          phone?: string | null
          portfolio_url?: string | null
          preferred_locations?: string[] | null
          preferred_salary_max?: number | null
          preferred_salary_min?: number | null
          profile_picture_url?: string | null
          resume_url?: string | null
          skills?: string[] | null
          title?: string | null
          updated_at?: string | null
          website?: string | null
        }
        Update: {
          about?: string | null
          cover_image_url?: string | null
          created_at?: string | null
          current_company?: string | null
          email?: string | null
          experience_years?: number | null
          full_name?: string | null
          github_url?: string | null
          id?: string
          industry?: string | null
          is_profile_public?: boolean | null
          linkedin_url?: string | null
          location?: string | null
          looking_for_job?: boolean | null
          open_to_remote?: boolean | null
          phone?: string | null
          portfolio_url?: string | null
          preferred_locations?: string[] | null
          preferred_salary_max?: number | null
          preferred_salary_min?: number | null
          profile_picture_url?: string | null
          resume_url?: string | null
          skills?: string[] | null
          title?: string | null
          updated_at?: string | null
          website?: string | null
        }
        Relationships: []
      }
      resumes: {
        Row: {
          content: Json
          created_at: string | null
          file_url: string | null
          id: string
          is_primary: boolean | null
          template_id: string | null
          title: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          content: Json
          created_at?: string | null
          file_url?: string | null
          id?: string
          is_primary?: boolean | null
          template_id?: string | null
          title: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          content?: Json
          created_at?: string | null
          file_url?: string | null
          id?: string
          is_primary?: boolean | null
          template_id?: string | null
          title?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      saved_jobs: {
        Row: {
          id: string
          job_id: string | null
          saved_at: string | null
          user_id: string | null
        }
        Insert: {
          id?: string
          job_id?: string | null
          saved_at?: string | null
          user_id?: string | null
        }
        Update: {
          id?: string
          job_id?: string | null
          saved_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "saved_jobs_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      user_courses: {
        Row: {
          certificate_url: string | null
          completed_at: string | null
          course_id: string | null
          enrolled_at: string | null
          id: string
          progress_percentage: number | null
          user_id: string | null
        }
        Insert: {
          certificate_url?: string | null
          completed_at?: string | null
          course_id?: string | null
          enrolled_at?: string | null
          id?: string
          progress_percentage?: number | null
          user_id?: string | null
        }
        Update: {
          certificate_url?: string | null
          completed_at?: string | null
          course_id?: string | null
          enrolled_at?: string | null
          id?: string
          progress_percentage?: number | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_courses_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
