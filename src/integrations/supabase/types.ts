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
      admin_activity_log: {
        Row: {
          action_type: string
          admin_user_id: string
          created_at: string | null
          details: Json | null
          id: string
          ip_address: unknown | null
          target_user_id: string | null
          user_agent: string | null
        }
        Insert: {
          action_type: string
          admin_user_id: string
          created_at?: string | null
          details?: Json | null
          id?: string
          ip_address?: unknown | null
          target_user_id?: string | null
          user_agent?: string | null
        }
        Update: {
          action_type?: string
          admin_user_id?: string
          created_at?: string | null
          details?: Json | null
          id?: string
          ip_address?: unknown | null
          target_user_id?: string | null
          user_agent?: string | null
        }
        Relationships: []
      }
      ai_cover_letters: {
        Row: {
          company_name: string | null
          content: string
          created_at: string | null
          id: string
          job_title: string | null
          resume_id: string | null
          template_id: string | null
          title: string
          tone: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          company_name?: string | null
          content: string
          created_at?: string | null
          id?: string
          job_title?: string | null
          resume_id?: string | null
          template_id?: string | null
          title: string
          tone?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          company_name?: string | null
          content?: string
          created_at?: string | null
          id?: string
          job_title?: string | null
          resume_id?: string | null
          template_id?: string | null
          title?: string
          tone?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_cover_letters_resume_id_fkey"
            columns: ["resume_id"]
            isOneToOne: false
            referencedRelation: "ai_resumes"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_resumes: {
        Row: {
          ats_score: number | null
          content: Json
          created_at: string | null
          id: string
          is_primary: boolean | null
          is_public: boolean | null
          public_url_slug: string | null
          template_id: string | null
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          ats_score?: number | null
          content?: Json
          created_at?: string | null
          id?: string
          is_primary?: boolean | null
          is_public?: boolean | null
          public_url_slug?: string | null
          template_id?: string | null
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          ats_score?: number | null
          content?: Json
          created_at?: string | null
          id?: string
          is_primary?: boolean | null
          is_public?: boolean | null
          public_url_slug?: string | null
          template_id?: string | null
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_resumes_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "resume_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      candidate_communications: {
        Row: {
          candidate_id: string | null
          communication_type: string | null
          content: string | null
          created_at: string | null
          id: string
          job_id: string | null
          replied_at: string | null
          sender_id: string | null
          sent_at: string | null
          status: string | null
          subject: string | null
        }
        Insert: {
          candidate_id?: string | null
          communication_type?: string | null
          content?: string | null
          created_at?: string | null
          id?: string
          job_id?: string | null
          replied_at?: string | null
          sender_id?: string | null
          sent_at?: string | null
          status?: string | null
          subject?: string | null
        }
        Update: {
          candidate_id?: string | null
          communication_type?: string | null
          content?: string | null
          created_at?: string | null
          id?: string
          job_id?: string | null
          replied_at?: string | null
          sender_id?: string | null
          sent_at?: string | null
          status?: string | null
          subject?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "candidate_communications_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      candidate_notes: {
        Row: {
          author_id: string | null
          candidate_id: string | null
          content: string
          created_at: string | null
          id: string
          is_private: boolean | null
          job_id: string | null
          rating: number | null
          updated_at: string | null
        }
        Insert: {
          author_id?: string | null
          candidate_id?: string | null
          content: string
          created_at?: string | null
          id?: string
          is_private?: boolean | null
          job_id?: string | null
          rating?: number | null
          updated_at?: string | null
        }
        Update: {
          author_id?: string | null
          candidate_id?: string | null
          content?: string
          created_at?: string | null
          id?: string
          is_private?: boolean | null
          job_id?: string | null
          rating?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "candidate_notes_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_candidate_notes_author_id"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_candidate_notes_candidate_id"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_candidate_notes_job_id"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      candidate_shortlists: {
        Row: {
          id: string
          job_id: string | null
          match_score: number | null
          notes: string | null
          shortlisted_at: string | null
          shortlisted_by: string | null
          status: string | null
          user_id: string | null
        }
        Insert: {
          id?: string
          job_id?: string | null
          match_score?: number | null
          notes?: string | null
          shortlisted_at?: string | null
          shortlisted_by?: string | null
          status?: string | null
          user_id?: string | null
        }
        Update: {
          id?: string
          job_id?: string | null
          match_score?: number | null
          notes?: string | null
          shortlisted_at?: string | null
          shortlisted_by?: string | null
          status?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "candidate_shortlists_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
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
      career_switches: {
        Row: {
          created_at: string
          difficulty_score: number | null
          from_industry: string | null
          from_role: string
          id: string
          market_demand_score: number | null
          opportunities: Json | null
          recommended_steps: Json | null
          required_skills: Json | null
          risk_factors: Json | null
          salary_change_percentage: number | null
          time_estimate_months: number | null
          to_industry: string | null
          to_role: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          difficulty_score?: number | null
          from_industry?: string | null
          from_role: string
          id?: string
          market_demand_score?: number | null
          opportunities?: Json | null
          recommended_steps?: Json | null
          required_skills?: Json | null
          risk_factors?: Json | null
          salary_change_percentage?: number | null
          time_estimate_months?: number | null
          to_industry?: string | null
          to_role: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          difficulty_score?: number | null
          from_industry?: string | null
          from_role?: string
          id?: string
          market_demand_score?: number | null
          opportunities?: Json | null
          recommended_steps?: Json | null
          required_skills?: Json | null
          risk_factors?: Json | null
          salary_change_percentage?: number | null
          time_estimate_months?: number | null
          to_industry?: string | null
          to_role?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      certificates: {
        Row: {
          certificate_number: string
          certificate_url: string | null
          course_id: string | null
          id: string
          is_valid: boolean | null
          issued_at: string | null
          user_id: string | null
          verification_code: string
        }
        Insert: {
          certificate_number: string
          certificate_url?: string | null
          course_id?: string | null
          id?: string
          is_valid?: boolean | null
          issued_at?: string | null
          user_id?: string | null
          verification_code?: string
        }
        Update: {
          certificate_number?: string
          certificate_url?: string | null
          course_id?: string | null
          id?: string
          is_valid?: boolean | null
          issued_at?: string | null
          user_id?: string | null
          verification_code?: string
        }
        Relationships: [
          {
            foreignKeyName: "certificates_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      collaboration_sessions: {
        Row: {
          created_at: string
          created_by: string
          id: string
          is_active: boolean | null
          session_name: string
          shared_data: Json | null
          tool_name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          id?: string
          is_active?: boolean | null
          session_name: string
          shared_data?: Json | null
          tool_name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          id?: string
          is_active?: boolean | null
          session_name?: string
          shared_data?: Json | null
          tool_name?: string
          updated_at?: string
        }
        Relationships: []
      }
      companies: {
        Row: {
          benefits: string[] | null
          cover_image_url: string | null
          created_at: string | null
          created_by: string | null
          culture_description: string | null
          description: string | null
          employee_count_range: string | null
          founded_year: number | null
          id: string
          industry: string | null
          is_verified: boolean | null
          location: string | null
          logo_url: string | null
          name: string
          size_range: string | null
          social_links: Json | null
          tech_stack: string[] | null
          updated_at: string | null
          website: string | null
        }
        Insert: {
          benefits?: string[] | null
          cover_image_url?: string | null
          created_at?: string | null
          created_by?: string | null
          culture_description?: string | null
          description?: string | null
          employee_count_range?: string | null
          founded_year?: number | null
          id?: string
          industry?: string | null
          is_verified?: boolean | null
          location?: string | null
          logo_url?: string | null
          name: string
          size_range?: string | null
          social_links?: Json | null
          tech_stack?: string[] | null
          updated_at?: string | null
          website?: string | null
        }
        Update: {
          benefits?: string[] | null
          cover_image_url?: string | null
          created_at?: string | null
          created_by?: string | null
          culture_description?: string | null
          description?: string | null
          employee_count_range?: string | null
          founded_year?: number | null
          id?: string
          industry?: string | null
          is_verified?: boolean | null
          location?: string | null
          logo_url?: string | null
          name?: string
          size_range?: string | null
          social_links?: Json | null
          tech_stack?: string[] | null
          updated_at?: string | null
          website?: string | null
        }
        Relationships: []
      }
      company_access_requests: {
        Row: {
          approved_by: string | null
          company_domain: string
          company_id: string
          created_at: string | null
          id: string
          rejection_reason: string | null
          request_message: string | null
          requested_role: string | null
          requester_email: string
          requester_id: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          approved_by?: string | null
          company_domain: string
          company_id: string
          created_at?: string | null
          id?: string
          rejection_reason?: string | null
          request_message?: string | null
          requested_role?: string | null
          requester_email: string
          requester_id: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          approved_by?: string | null
          company_domain?: string
          company_id?: string
          created_at?: string | null
          id?: string
          rejection_reason?: string | null
          request_message?: string | null
          requested_role?: string | null
          requester_email?: string
          requester_id?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "company_access_requests_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      company_admins: {
        Row: {
          company_id: string
          created_at: string | null
          id: string
          role: string
          user_id: string
        }
        Insert: {
          company_id: string
          created_at?: string | null
          id?: string
          role?: string
          user_id: string
        }
        Update: {
          company_id?: string
          created_at?: string | null
          id?: string
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "company_admins_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      company_follows: {
        Row: {
          company_id: string | null
          followed_at: string | null
          id: string
          user_id: string | null
        }
        Insert: {
          company_id?: string | null
          followed_at?: string | null
          id?: string
          user_id?: string | null
        }
        Update: {
          company_id?: string | null
          followed_at?: string | null
          id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "company_follows_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      company_profiles: {
        Row: {
          active_jobs_count: number | null
          company_id: string | null
          created_at: string | null
          id: string
          jobs_posted_count: number | null
          owner_id: string | null
          subscription_plan: string | null
          total_applications_received: number | null
          updated_at: string | null
        }
        Insert: {
          active_jobs_count?: number | null
          company_id?: string | null
          created_at?: string | null
          id?: string
          jobs_posted_count?: number | null
          owner_id?: string | null
          subscription_plan?: string | null
          total_applications_received?: number | null
          updated_at?: string | null
        }
        Update: {
          active_jobs_count?: number | null
          company_id?: string | null
          created_at?: string | null
          id?: string
          jobs_posted_count?: number | null
          owner_id?: string | null
          subscription_plan?: string | null
          total_applications_received?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "company_profiles_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: true
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      company_team_members: {
        Row: {
          company_id: string | null
          id: string
          invited_at: string | null
          invited_by: string | null
          is_active: boolean | null
          joined_at: string | null
          permissions: Json | null
          role: Database["public"]["Enums"]["team_role"] | null
          user_id: string | null
        }
        Insert: {
          company_id?: string | null
          id?: string
          invited_at?: string | null
          invited_by?: string | null
          is_active?: boolean | null
          joined_at?: string | null
          permissions?: Json | null
          role?: Database["public"]["Enums"]["team_role"] | null
          user_id?: string | null
        }
        Update: {
          company_id?: string | null
          id?: string
          invited_at?: string | null
          invited_by?: string | null
          is_active?: boolean | null
          joined_at?: string | null
          permissions?: Json | null
          role?: Database["public"]["Enums"]["team_role"] | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "company_team_members_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
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
          updated_at: string | null
        }
        Insert: {
          connected_at?: string | null
          created_at?: string | null
          id?: string
          message?: string | null
          recipient_id?: string | null
          requester_id?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          connected_at?: string | null
          created_at?: string | null
          id?: string
          message?: string | null
          recipient_id?: string | null
          requester_id?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      conversations: {
        Row: {
          created_at: string | null
          created_by: string | null
          id: string
          is_group: boolean | null
          last_message_id: string | null
          last_updated: string | null
          name: string | null
          participants: string[]
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_group?: boolean | null
          last_message_id?: string | null
          last_updated?: string | null
          name?: string | null
          participants: string[]
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_group?: boolean | null
          last_message_id?: string | null
          last_updated?: string | null
          name?: string | null
          participants?: string[]
        }
        Relationships: []
      }
      course_assessments: {
        Row: {
          course_id: string | null
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          max_attempts: number | null
          passing_score: number | null
          questions: Json | null
          time_limit_minutes: number | null
          title: string
          updated_at: string | null
        }
        Insert: {
          course_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          max_attempts?: number | null
          passing_score?: number | null
          questions?: Json | null
          time_limit_minutes?: number | null
          title: string
          updated_at?: string | null
        }
        Update: {
          course_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          max_attempts?: number | null
          passing_score?: number | null
          questions?: Json | null
          time_limit_minutes?: number | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "course_assessments_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      course_lessons: {
        Row: {
          content: string | null
          created_at: string | null
          duration_minutes: number | null
          id: string
          is_active: boolean | null
          is_free: boolean | null
          lesson_order: number
          lesson_type: string | null
          module_id: string | null
          title: string
          updated_at: string | null
          video_url: string | null
        }
        Insert: {
          content?: string | null
          created_at?: string | null
          duration_minutes?: number | null
          id?: string
          is_active?: boolean | null
          is_free?: boolean | null
          lesson_order?: number
          lesson_type?: string | null
          module_id?: string | null
          title: string
          updated_at?: string | null
          video_url?: string | null
        }
        Update: {
          content?: string | null
          created_at?: string | null
          duration_minutes?: number | null
          id?: string
          is_active?: boolean | null
          is_free?: boolean | null
          lesson_order?: number
          lesson_type?: string | null
          module_id?: string | null
          title?: string
          updated_at?: string | null
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "course_lessons_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "course_modules"
            referencedColumns: ["id"]
          },
        ]
      }
      course_modules: {
        Row: {
          course_id: string | null
          created_at: string | null
          description: string | null
          duration_minutes: number | null
          id: string
          is_active: boolean | null
          module_order: number
          title: string
          updated_at: string | null
        }
        Insert: {
          course_id?: string | null
          created_at?: string | null
          description?: string | null
          duration_minutes?: number | null
          id?: string
          is_active?: boolean | null
          module_order?: number
          title: string
          updated_at?: string | null
        }
        Update: {
          course_id?: string | null
          created_at?: string | null
          description?: string | null
          duration_minutes?: number | null
          id?: string
          is_active?: boolean | null
          module_order?: number
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "course_modules_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
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
      currency_rates: {
        Row: {
          base_currency: string
          created_at: string | null
          id: string
          last_updated: string | null
          rate: number
          target_currency: string
        }
        Insert: {
          base_currency: string
          created_at?: string | null
          id?: string
          last_updated?: string | null
          rate: number
          target_currency: string
        }
        Update: {
          base_currency?: string
          created_at?: string | null
          id?: string
          last_updated?: string | null
          rate?: number
          target_currency?: string
        }
        Relationships: []
      }
      email_templates: {
        Row: {
          company_id: string | null
          content: string
          created_at: string | null
          created_by: string | null
          id: string
          is_active: boolean | null
          name: string
          subject: string
          template_type: string | null
          updated_at: string | null
        }
        Insert: {
          company_id?: string | null
          content: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          subject: string
          template_type?: string | null
          updated_at?: string | null
        }
        Update: {
          company_id?: string | null
          content?: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          subject?: string
          template_type?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "email_templates_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      emoji_configs: {
        Row: {
          created_at: string
          display_order: number
          emoji_code: string
          emoji_name: string
          id: string
          is_active: boolean
          updated_at: string
        }
        Insert: {
          created_at?: string
          display_order?: number
          emoji_code: string
          emoji_name: string
          id?: string
          is_active?: boolean
          updated_at?: string
        }
        Update: {
          created_at?: string
          display_order?: number
          emoji_code?: string
          emoji_name?: string
          id?: string
          is_active?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      employer_requests: {
        Row: {
          admin_notes: string | null
          approved_by: string | null
          company_description: string | null
          company_logo_url: string | null
          company_name: string
          company_website: string | null
          created_at: string | null
          email: string
          full_name: string
          gst_number: string | null
          hiring_reason: string | null
          id: string
          linkedin_profile: string | null
          phone_number: string | null
          rejection_reason: string | null
          status: string | null
          submitted_at: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          admin_notes?: string | null
          approved_by?: string | null
          company_description?: string | null
          company_logo_url?: string | null
          company_name: string
          company_website?: string | null
          created_at?: string | null
          email: string
          full_name: string
          gst_number?: string | null
          hiring_reason?: string | null
          id?: string
          linkedin_profile?: string | null
          phone_number?: string | null
          rejection_reason?: string | null
          status?: string | null
          submitted_at?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          admin_notes?: string | null
          approved_by?: string | null
          company_description?: string | null
          company_logo_url?: string | null
          company_name?: string
          company_website?: string | null
          created_at?: string | null
          email?: string
          full_name?: string
          gst_number?: string | null
          hiring_reason?: string | null
          id?: string
          linkedin_profile?: string | null
          phone_number?: string | null
          rejection_reason?: string | null
          status?: string | null
          submitted_at?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      event_rsvps: {
        Row: {
          event_id: string | null
          id: string
          rsvp_at: string | null
          status: string | null
          user_id: string | null
        }
        Insert: {
          event_id?: string | null
          id?: string
          rsvp_at?: string | null
          status?: string | null
          user_id?: string | null
        }
        Update: {
          event_id?: string | null
          id?: string
          rsvp_at?: string | null
          status?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "event_rsvps_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          cover_image_url: string | null
          created_at: string | null
          created_by: string | null
          current_attendees: number | null
          description: string | null
          end_time: string | null
          event_type: string | null
          group_id: string | null
          id: string
          is_virtual: boolean | null
          location: string | null
          max_attendees: number | null
          meeting_url: string | null
          start_time: string
          title: string
          updated_at: string | null
        }
        Insert: {
          cover_image_url?: string | null
          created_at?: string | null
          created_by?: string | null
          current_attendees?: number | null
          description?: string | null
          end_time?: string | null
          event_type?: string | null
          group_id?: string | null
          id?: string
          is_virtual?: boolean | null
          location?: string | null
          max_attendees?: number | null
          meeting_url?: string | null
          start_time: string
          title: string
          updated_at?: string | null
        }
        Update: {
          cover_image_url?: string | null
          created_at?: string | null
          created_by?: string | null
          current_attendees?: number | null
          description?: string | null
          end_time?: string | null
          event_type?: string | null
          group_id?: string | null
          id?: string
          is_virtual?: boolean | null
          location?: string | null
          max_attendees?: number | null
          meeting_url?: string | null
          start_time?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "events_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
        ]
      }
      follows: {
        Row: {
          created_at: string | null
          followed_id: string
          followed_type: string
          follower_id: string | null
          id: string
        }
        Insert: {
          created_at?: string | null
          followed_id: string
          followed_type: string
          follower_id?: string | null
          id?: string
        }
        Update: {
          created_at?: string | null
          followed_id?: string
          followed_type?: string
          follower_id?: string | null
          id?: string
        }
        Relationships: []
      }
      group_memberships: {
        Row: {
          group_id: string | null
          id: string
          joined_at: string | null
          role: string | null
          user_id: string | null
        }
        Insert: {
          group_id?: string | null
          id?: string
          joined_at?: string | null
          role?: string | null
          user_id?: string | null
        }
        Update: {
          group_id?: string | null
          id?: string
          joined_at?: string | null
          role?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "group_memberships_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
        ]
      }
      groups: {
        Row: {
          category: string | null
          cover_image_url: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          is_public: boolean | null
          member_count: number | null
          name: string
          rules: string | null
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          cover_image_url?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_public?: boolean | null
          member_count?: number | null
          name: string
          rules?: string | null
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          cover_image_url?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_public?: boolean | null
          member_count?: number | null
          name?: string
          rules?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      interview_schedules: {
        Row: {
          application_id: string | null
          created_at: string | null
          duration_minutes: number | null
          feedback: string | null
          id: string
          interview_type: string | null
          location: string | null
          meeting_url: string | null
          notes: string | null
          scheduled_at: string
          scheduled_by: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          application_id?: string | null
          created_at?: string | null
          duration_minutes?: number | null
          feedback?: string | null
          id?: string
          interview_type?: string | null
          location?: string | null
          meeting_url?: string | null
          notes?: string | null
          scheduled_at: string
          scheduled_by?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          application_id?: string | null
          created_at?: string | null
          duration_minutes?: number | null
          feedback?: string | null
          id?: string
          interview_type?: string | null
          location?: string | null
          meeting_url?: string | null
          notes?: string | null
          scheduled_at?: string
          scheduled_by?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "interview_schedules_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "job_applications"
            referencedColumns: ["id"]
          },
        ]
      }
      interview_sessions: {
        Row: {
          ai_feedback: Json | null
          created_at: string
          duration_minutes: number | null
          id: string
          job_role: string | null
          questions: Json | null
          responses: Json | null
          score: number | null
          session_type: string
          user_id: string
        }
        Insert: {
          ai_feedback?: Json | null
          created_at?: string
          duration_minutes?: number | null
          id?: string
          job_role?: string | null
          questions?: Json | null
          responses?: Json | null
          score?: number | null
          session_type: string
          user_id: string
        }
        Update: {
          ai_feedback?: Json | null
          created_at?: string
          duration_minutes?: number | null
          id?: string
          job_role?: string | null
          questions?: Json | null
          responses?: Json | null
          score?: number | null
          session_type?: string
          user_id?: string
        }
        Relationships: []
      }
      interviews: {
        Row: {
          application_id: string | null
          created_at: string | null
          duration_minutes: number | null
          feedback: string | null
          id: string
          interview_type: string | null
          location: string | null
          meeting_url: string | null
          notes: string | null
          rating: number | null
          scheduled_at: string
          scheduled_by: string | null
          status: Database["public"]["Enums"]["interview_status"] | null
          updated_at: string | null
        }
        Insert: {
          application_id?: string | null
          created_at?: string | null
          duration_minutes?: number | null
          feedback?: string | null
          id?: string
          interview_type?: string | null
          location?: string | null
          meeting_url?: string | null
          notes?: string | null
          rating?: number | null
          scheduled_at: string
          scheduled_by?: string | null
          status?: Database["public"]["Enums"]["interview_status"] | null
          updated_at?: string | null
        }
        Update: {
          application_id?: string | null
          created_at?: string | null
          duration_minutes?: number | null
          feedback?: string | null
          id?: string
          interview_type?: string | null
          location?: string | null
          meeting_url?: string | null
          notes?: string | null
          rating?: number | null
          scheduled_at?: string
          scheduled_by?: string | null
          status?: Database["public"]["Enums"]["interview_status"] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "interviews_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "job_applications"
            referencedColumns: ["id"]
          },
        ]
      }
      job_alerts: {
        Row: {
          created_at: string | null
          employment_type: string[] | null
          experience_level: string[] | null
          frequency: string | null
          id: string
          is_active: boolean | null
          is_remote: boolean | null
          keywords: string[] | null
          last_sent: string | null
          location: string | null
          salary_max: number | null
          salary_min: number | null
          title: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          employment_type?: string[] | null
          experience_level?: string[] | null
          frequency?: string | null
          id?: string
          is_active?: boolean | null
          is_remote?: boolean | null
          keywords?: string[] | null
          last_sent?: string | null
          location?: string | null
          salary_max?: number | null
          salary_min?: number | null
          title: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          employment_type?: string[] | null
          experience_level?: string[] | null
          frequency?: string | null
          id?: string
          is_active?: boolean | null
          is_remote?: boolean | null
          keywords?: string[] | null
          last_sent?: string | null
          location?: string | null
          salary_max?: number | null
          salary_min?: number | null
          title?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      job_analytics: {
        Row: {
          applications_count: number | null
          created_at: string | null
          date: string | null
          id: string
          job_id: string | null
          source_breakdown: Json | null
          unique_visitors: number | null
          views_count: number | null
        }
        Insert: {
          applications_count?: number | null
          created_at?: string | null
          date?: string | null
          id?: string
          job_id?: string | null
          source_breakdown?: Json | null
          unique_visitors?: number | null
          views_count?: number | null
        }
        Update: {
          applications_count?: number | null
          created_at?: string | null
          date?: string | null
          id?: string
          job_id?: string | null
          source_breakdown?: Json | null
          unique_visitors?: number | null
          views_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "job_analytics_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      job_applications: {
        Row: {
          ai_match_score: number | null
          application_data: Json | null
          applied_at: string | null
          assigned_to: string | null
          cover_letter: string | null
          id: string
          job_id: string | null
          last_activity_at: string | null
          resume_url: string | null
          status: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          ai_match_score?: number | null
          application_data?: Json | null
          applied_at?: string | null
          assigned_to?: string | null
          cover_letter?: string | null
          id?: string
          job_id?: string | null
          last_activity_at?: string | null
          resume_url?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          ai_match_score?: number | null
          application_data?: Json | null
          applied_at?: string | null
          assigned_to?: string | null
          cover_letter?: string | null
          id?: string
          job_id?: string | null
          last_activity_at?: string | null
          resume_url?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_job_applications_job_id"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_job_applications_user_id"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_applications_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      job_categories: {
        Row: {
          created_at: string | null
          description: string | null
          icon_name: string | null
          id: string
          is_active: boolean | null
          name: string
          parent_id: string | null
          slug: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          icon_name?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          parent_id?: string | null
          slug: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          icon_name?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          parent_id?: string | null
          slug?: string
        }
        Relationships: [
          {
            foreignKeyName: "job_categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "job_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      job_recommendations: {
        Row: {
          created_at: string | null
          id: string
          is_applied: boolean | null
          is_viewed: boolean | null
          job_id: string | null
          match_score: number | null
          recommendation_reason: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_applied?: boolean | null
          is_viewed?: boolean | null
          job_id?: string | null
          match_score?: number | null
          recommendation_reason?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_applied?: boolean | null
          is_viewed?: boolean | null
          job_id?: string | null
          match_score?: number | null
          recommendation_reason?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "job_recommendations_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      job_views: {
        Row: {
          id: string
          ip_address: unknown | null
          job_id: string | null
          referrer: string | null
          user_agent: string | null
          user_id: string | null
          viewed_at: string | null
        }
        Insert: {
          id?: string
          ip_address?: unknown | null
          job_id?: string | null
          referrer?: string | null
          user_agent?: string | null
          user_id?: string | null
          viewed_at?: string | null
        }
        Update: {
          id?: string
          ip_address?: unknown | null
          job_id?: string | null
          referrer?: string | null
          user_agent?: string | null
          user_id?: string | null
          viewed_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "job_views_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      jobs: {
        Row: {
          application_deadline: string | null
          application_method: string | null
          applications_count: number | null
          benefits: string[] | null
          category_id: string | null
          certification_required: string | null
          company_id: string | null
          contact_person_designation: string | null
          contact_person_name: string | null
          created_at: string | null
          description: string
          educational_qualification: string | null
          employment_type: string | null
          experience_level: string | null
          expires_at: string | null
          external_url: string | null
          id: string
          is_active: boolean | null
          is_featured: boolean | null
          is_hiring_fast: boolean | null
          is_remote: boolean | null
          is_urgent: boolean | null
          job_status: string | null
          location: string | null
          location_type: string | null
          posted_at: string | null
          posted_by: string | null
          requirements: string | null
          salary_currency: string | null
          salary_max: number | null
          salary_min: number | null
          skills_required: string[] | null
          supporting_documents: Json | null
          title: string
          updated_at: string | null
          views_count: number | null
          visibility_duration_days: number | null
          work_schedule: string | null
        }
        Insert: {
          application_deadline?: string | null
          application_method?: string | null
          applications_count?: number | null
          benefits?: string[] | null
          category_id?: string | null
          certification_required?: string | null
          company_id?: string | null
          contact_person_designation?: string | null
          contact_person_name?: string | null
          created_at?: string | null
          description: string
          educational_qualification?: string | null
          employment_type?: string | null
          experience_level?: string | null
          expires_at?: string | null
          external_url?: string | null
          id?: string
          is_active?: boolean | null
          is_featured?: boolean | null
          is_hiring_fast?: boolean | null
          is_remote?: boolean | null
          is_urgent?: boolean | null
          job_status?: string | null
          location?: string | null
          location_type?: string | null
          posted_at?: string | null
          posted_by?: string | null
          requirements?: string | null
          salary_currency?: string | null
          salary_max?: number | null
          salary_min?: number | null
          skills_required?: string[] | null
          supporting_documents?: Json | null
          title: string
          updated_at?: string | null
          views_count?: number | null
          visibility_duration_days?: number | null
          work_schedule?: string | null
        }
        Update: {
          application_deadline?: string | null
          application_method?: string | null
          applications_count?: number | null
          benefits?: string[] | null
          category_id?: string | null
          certification_required?: string | null
          company_id?: string | null
          contact_person_designation?: string | null
          contact_person_name?: string | null
          created_at?: string | null
          description?: string
          educational_qualification?: string | null
          employment_type?: string | null
          experience_level?: string | null
          expires_at?: string | null
          external_url?: string | null
          id?: string
          is_active?: boolean | null
          is_featured?: boolean | null
          is_hiring_fast?: boolean | null
          is_remote?: boolean | null
          is_urgent?: boolean | null
          job_status?: string | null
          location?: string | null
          location_type?: string | null
          posted_at?: string | null
          posted_by?: string | null
          requirements?: string | null
          salary_currency?: string | null
          salary_max?: number | null
          salary_min?: number | null
          skills_required?: string[] | null
          supporting_documents?: Json | null
          title?: string
          updated_at?: string | null
          views_count?: number | null
          visibility_duration_days?: number | null
          work_schedule?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "jobs_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "job_categories"
            referencedColumns: ["id"]
          },
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
      message_reads: {
        Row: {
          id: string
          message_id: string
          read_at: string | null
          user_id: string
        }
        Insert: {
          id?: string
          message_id: string
          read_at?: string | null
          user_id: string
        }
        Update: {
          id?: string
          message_id?: string
          read_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      messages: {
        Row: {
          attachments: Json | null
          content: string
          conversation_id: string | null
          created_at: string | null
          id: string
          is_read: boolean | null
          message_type: string | null
          recipient_id: string | null
          reply_to_id: string | null
          sender_id: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          attachments?: Json | null
          content: string
          conversation_id?: string | null
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message_type?: string | null
          recipient_id?: string | null
          reply_to_id?: string | null
          sender_id?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          attachments?: Json | null
          content?: string
          conversation_id?: string | null
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message_type?: string | null
          recipient_id?: string | null
          reply_to_id?: string | null
          sender_id?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_reply_to_id_fkey"
            columns: ["reply_to_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string | null
          id: string
          is_read: boolean | null
          message: string | null
          related_id: string | null
          title: string
          type: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message?: string | null
          related_id?: string | null
          title: string
          type: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message?: string | null
          related_id?: string | null
          title?: string
          type?: string
          user_id?: string | null
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount: number
          created_at: string | null
          currency: string
          failure_reason: string | null
          id: string
          payment_method: string | null
          processed_at: string | null
          razorpay_order_id: string | null
          razorpay_payment_id: string | null
          status: string
          subscription_id: string | null
          user_id: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          currency?: string
          failure_reason?: string | null
          id?: string
          payment_method?: string | null
          processed_at?: string | null
          razorpay_order_id?: string | null
          razorpay_payment_id?: string | null
          status: string
          subscription_id?: string | null
          user_id?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          currency?: string
          failure_reason?: string | null
          id?: string
          payment_method?: string | null
          processed_at?: string | null
          razorpay_order_id?: string | null
          razorpay_payment_id?: string | null
          status?: string
          subscription_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "subscriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      plan_analytics: {
        Row: {
          active_subscribers: number | null
          created_at: string | null
          date: string
          id: string
          plan_id: string | null
          plan_name: string
          total_revenue: number | null
          updated_at: string | null
        }
        Insert: {
          active_subscribers?: number | null
          created_at?: string | null
          date?: string
          id?: string
          plan_id?: string | null
          plan_name: string
          total_revenue?: number | null
          updated_at?: string | null
        }
        Update: {
          active_subscribers?: number | null
          created_at?: string | null
          date?: string
          id?: string
          plan_id?: string | null
          plan_name?: string
          total_revenue?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "plan_analytics_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "pricing_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      portfolio_items: {
        Row: {
          created_at: string | null
          description: string | null
          display_order: number | null
          id: string
          image_url: string | null
          is_featured: boolean | null
          tags: string[] | null
          title: string
          type: string | null
          updated_at: string | null
          url: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          id?: string
          image_url?: string | null
          is_featured?: boolean | null
          tags?: string[] | null
          title: string
          type?: string | null
          updated_at?: string | null
          url?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          id?: string
          image_url?: string | null
          is_featured?: boolean | null
          tags?: string[] | null
          title?: string
          type?: string | null
          updated_at?: string | null
          url?: string | null
          user_id?: string
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
      post_likes: {
        Row: {
          created_at: string
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_likes_post_id_fkey"
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
      post_shares: {
        Row: {
          created_at: string
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_shares_post_id_fkey"
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
          location: string | null
          media_urls: string[] | null
          post_type: string | null
          preview_url: string | null
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
          location?: string | null
          media_urls?: string[] | null
          post_type?: string | null
          preview_url?: string | null
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
          location?: string | null
          media_urls?: string[] | null
          post_type?: string | null
          preview_url?: string | null
          shares_count?: number | null
          tags?: string[] | null
          updated_at?: string | null
        }
        Relationships: []
      }
      pricing_plans: {
        Row: {
          billing_cycle: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          features: string[] | null
          id: string
          is_active: boolean | null
          is_popular: boolean | null
          limits: Json | null
          name: string
          price: number | null
          stripe_price_id: string | null
          trial_days: number | null
          updated_at: string | null
        }
        Insert: {
          billing_cycle?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          features?: string[] | null
          id?: string
          is_active?: boolean | null
          is_popular?: boolean | null
          limits?: Json | null
          name: string
          price?: number | null
          stripe_price_id?: string | null
          trial_days?: number | null
          updated_at?: string | null
        }
        Update: {
          billing_cycle?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          features?: string[] | null
          id?: string
          is_active?: boolean | null
          is_popular?: boolean | null
          limits?: Json | null
          name?: string
          price?: number | null
          stripe_price_id?: string | null
          trial_days?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      profile_views: {
        Row: {
          id: string
          ip_address: unknown | null
          profile_id: string
          user_agent: string | null
          viewed_at: string | null
          viewer_id: string | null
        }
        Insert: {
          id?: string
          ip_address?: unknown | null
          profile_id: string
          user_agent?: string | null
          viewed_at?: string | null
          viewer_id?: string | null
        }
        Update: {
          id?: string
          ip_address?: unknown | null
          profile_id?: string
          user_agent?: string | null
          viewed_at?: string | null
          viewer_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profile_views_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          about: string | null
          allow_profile_sharing: boolean | null
          cover_image_url: string | null
          created_at: string | null
          current_company: string | null
          custom_profile_url: string | null
          email: string | null
          employer_status: string | null
          experience_years: number | null
          first_login: boolean | null
          full_name: string | null
          github_url: string | null
          id: string
          industry: string | null
          is_employer: boolean | null
          is_profile_public: boolean | null
          last_login_at: string | null
          last_profile_view: string | null
          linkedin_url: string | null
          location: string | null
          login_count: number | null
          looking_for_job: boolean | null
          onboarding_completed: boolean | null
          open_to_remote: boolean | null
          phone: string | null
          portfolio_url: string | null
          preferences: Json | null
          preferred_currency: string | null
          preferred_locations: string[] | null
          preferred_salary_max: number | null
          preferred_salary_min: number | null
          primary_role: Database["public"]["Enums"]["app_role"] | null
          profile_completed: boolean | null
          profile_picture_url: string | null
          profile_views_count: number | null
          profile_visibility: string | null
          provider: string | null
          resume_url: string | null
          skills: string[] | null
          social_links: Json | null
          title: string | null
          updated_at: string | null
          user_role: Database["public"]["Enums"]["user_role"] | null
          website: string | null
        }
        Insert: {
          about?: string | null
          allow_profile_sharing?: boolean | null
          cover_image_url?: string | null
          created_at?: string | null
          current_company?: string | null
          custom_profile_url?: string | null
          email?: string | null
          employer_status?: string | null
          experience_years?: number | null
          first_login?: boolean | null
          full_name?: string | null
          github_url?: string | null
          id: string
          industry?: string | null
          is_employer?: boolean | null
          is_profile_public?: boolean | null
          last_login_at?: string | null
          last_profile_view?: string | null
          linkedin_url?: string | null
          location?: string | null
          login_count?: number | null
          looking_for_job?: boolean | null
          onboarding_completed?: boolean | null
          open_to_remote?: boolean | null
          phone?: string | null
          portfolio_url?: string | null
          preferences?: Json | null
          preferred_currency?: string | null
          preferred_locations?: string[] | null
          preferred_salary_max?: number | null
          preferred_salary_min?: number | null
          primary_role?: Database["public"]["Enums"]["app_role"] | null
          profile_completed?: boolean | null
          profile_picture_url?: string | null
          profile_views_count?: number | null
          profile_visibility?: string | null
          provider?: string | null
          resume_url?: string | null
          skills?: string[] | null
          social_links?: Json | null
          title?: string | null
          updated_at?: string | null
          user_role?: Database["public"]["Enums"]["user_role"] | null
          website?: string | null
        }
        Update: {
          about?: string | null
          allow_profile_sharing?: boolean | null
          cover_image_url?: string | null
          created_at?: string | null
          current_company?: string | null
          custom_profile_url?: string | null
          email?: string | null
          employer_status?: string | null
          experience_years?: number | null
          first_login?: boolean | null
          full_name?: string | null
          github_url?: string | null
          id?: string
          industry?: string | null
          is_employer?: boolean | null
          is_profile_public?: boolean | null
          last_login_at?: string | null
          last_profile_view?: string | null
          linkedin_url?: string | null
          location?: string | null
          login_count?: number | null
          looking_for_job?: boolean | null
          onboarding_completed?: boolean | null
          open_to_remote?: boolean | null
          phone?: string | null
          portfolio_url?: string | null
          preferences?: Json | null
          preferred_currency?: string | null
          preferred_locations?: string[] | null
          preferred_salary_max?: number | null
          preferred_salary_min?: number | null
          primary_role?: Database["public"]["Enums"]["app_role"] | null
          profile_completed?: boolean | null
          profile_picture_url?: string | null
          profile_views_count?: number | null
          profile_visibility?: string | null
          provider?: string | null
          resume_url?: string | null
          skills?: string[] | null
          social_links?: Json | null
          title?: string | null
          updated_at?: string | null
          user_role?: Database["public"]["Enums"]["user_role"] | null
          website?: string | null
        }
        Relationships: []
      }
      resume_sections: {
        Row: {
          content: Json
          created_at: string | null
          display_order: number | null
          id: string
          is_visible: boolean | null
          resume_id: string
          section_type: string
          updated_at: string | null
        }
        Insert: {
          content?: Json
          created_at?: string | null
          display_order?: number | null
          id?: string
          is_visible?: boolean | null
          resume_id: string
          section_type: string
          updated_at?: string | null
        }
        Update: {
          content?: Json
          created_at?: string | null
          display_order?: number | null
          id?: string
          is_visible?: boolean | null
          resume_id?: string
          section_type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "resume_sections_resume_id_fkey"
            columns: ["resume_id"]
            isOneToOne: false
            referencedRelation: "ai_resumes"
            referencedColumns: ["id"]
          },
        ]
      }
      resume_templates: {
        Row: {
          category: string
          created_at: string | null
          css_config: Json | null
          id: string
          is_active: boolean | null
          name: string
          preview_url: string | null
          thumbnail_url: string | null
          updated_at: string | null
        }
        Insert: {
          category?: string
          created_at?: string | null
          css_config?: Json | null
          id?: string
          is_active?: boolean | null
          name: string
          preview_url?: string | null
          thumbnail_url?: string | null
          updated_at?: string | null
        }
        Update: {
          category?: string
          created_at?: string | null
          css_config?: Json | null
          id?: string
          is_active?: boolean | null
          name?: string
          preview_url?: string | null
          thumbnail_url?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      resume_versions: {
        Row: {
          content: Json
          created_at: string | null
          id: string
          resume_id: string
          version_name: string
        }
        Insert: {
          content?: Json
          created_at?: string | null
          id?: string
          resume_id: string
          version_name: string
        }
        Update: {
          content?: Json
          created_at?: string | null
          id?: string
          resume_id?: string
          version_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "resume_versions_resume_id_fkey"
            columns: ["resume_id"]
            isOneToOne: false
            referencedRelation: "ai_resumes"
            referencedColumns: ["id"]
          },
        ]
      }
      resumes: {
        Row: {
          content: Json
          created_at: string | null
          file_size: number | null
          file_url: string | null
          id: string
          is_active: boolean | null
          is_primary: boolean | null
          mime_type: string | null
          template_id: string | null
          title: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          content: Json
          created_at?: string | null
          file_size?: number | null
          file_url?: string | null
          id?: string
          is_active?: boolean | null
          is_primary?: boolean | null
          mime_type?: string | null
          template_id?: string | null
          title: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          content?: Json
          created_at?: string | null
          file_size?: number | null
          file_url?: string | null
          id?: string
          is_active?: boolean | null
          is_primary?: boolean | null
          mime_type?: string | null
          template_id?: string | null
          title?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      revenue_analytics: {
        Row: {
          cancelled_subscribers: number | null
          created_at: string | null
          currency: string
          date: string
          failed_payments: number | null
          id: string
          new_subscribers: number | null
          total_revenue: number | null
          total_subscribers: number | null
          total_transactions: number | null
          updated_at: string | null
        }
        Insert: {
          cancelled_subscribers?: number | null
          created_at?: string | null
          currency?: string
          date: string
          failed_payments?: number | null
          id?: string
          new_subscribers?: number | null
          total_revenue?: number | null
          total_subscribers?: number | null
          total_transactions?: number | null
          updated_at?: string | null
        }
        Update: {
          cancelled_subscribers?: number | null
          created_at?: string | null
          currency?: string
          date?: string
          failed_payments?: number | null
          id?: string
          new_subscribers?: number | null
          total_revenue?: number | null
          total_subscribers?: number | null
          total_transactions?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      roadmap_milestones: {
        Row: {
          completion_date: string | null
          created_at: string
          description: string | null
          id: string
          milestone_type: string | null
          priority: number | null
          resources: Json | null
          roadmap_id: string | null
          status: string | null
          target_date: string | null
          title: string
          updated_at: string
        }
        Insert: {
          completion_date?: string | null
          created_at?: string
          description?: string | null
          id?: string
          milestone_type?: string | null
          priority?: number | null
          resources?: Json | null
          roadmap_id?: string | null
          status?: string | null
          target_date?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          completion_date?: string | null
          created_at?: string
          description?: string | null
          id?: string
          milestone_type?: string | null
          priority?: number | null
          resources?: Json | null
          roadmap_id?: string | null
          status?: string | null
          target_date?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "roadmap_milestones_roadmap_id_fkey"
            columns: ["roadmap_id"]
            isOneToOne: false
            referencedRelation: "roadmaps"
            referencedColumns: ["id"]
          },
        ]
      }
      roadmaps: {
        Row: {
          ai_generated: boolean | null
          created_at: string
          current_position: string | null
          description: string | null
          id: string
          milestones: Json | null
          progress_percentage: number | null
          roadmap_data: Json | null
          skills_current: Json | null
          skills_target: Json | null
          status: string | null
          target_company: string | null
          target_role: string
          timeline_months: number | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          ai_generated?: boolean | null
          created_at?: string
          current_position?: string | null
          description?: string | null
          id?: string
          milestones?: Json | null
          progress_percentage?: number | null
          roadmap_data?: Json | null
          skills_current?: Json | null
          skills_target?: Json | null
          status?: string | null
          target_company?: string | null
          target_role: string
          timeline_months?: number | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          ai_generated?: boolean | null
          created_at?: string
          current_position?: string | null
          description?: string | null
          id?: string
          milestones?: Json | null
          progress_percentage?: number | null
          roadmap_data?: Json | null
          skills_current?: Json | null
          skills_target?: Json | null
          status?: string | null
          target_company?: string | null
          target_role?: string
          timeline_months?: number | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      salary_data: {
        Row: {
          created_at: string
          currency: string | null
          data_source: string | null
          experience_level: string | null
          id: string
          industry: string | null
          job_title: string
          last_updated: string | null
          location: string
          salary_currency: string | null
          salary_range_max: number | null
          salary_range_min: number | null
        }
        Insert: {
          created_at?: string
          currency?: string | null
          data_source?: string | null
          experience_level?: string | null
          id?: string
          industry?: string | null
          job_title: string
          last_updated?: string | null
          location: string
          salary_currency?: string | null
          salary_range_max?: number | null
          salary_range_min?: number | null
        }
        Update: {
          created_at?: string
          currency?: string | null
          data_source?: string | null
          experience_level?: string | null
          id?: string
          industry?: string | null
          job_title?: string
          last_updated?: string | null
          location?: string
          salary_currency?: string | null
          salary_range_max?: number | null
          salary_range_min?: number | null
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
      saved_tool_results: {
        Row: {
          content: Json
          created_at: string
          id: string
          is_favorite: boolean | null
          title: string
          tool_name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content: Json
          created_at?: string
          id?: string
          is_favorite?: boolean | null
          title: string
          tool_name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: Json
          created_at?: string
          id?: string
          is_favorite?: boolean | null
          title?: string
          tool_name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      session_participants: {
        Row: {
          id: string
          joined_at: string
          role: string | null
          session_id: string | null
          user_id: string
        }
        Insert: {
          id?: string
          joined_at?: string
          role?: string | null
          session_id?: string | null
          user_id: string
        }
        Update: {
          id?: string
          joined_at?: string
          role?: string | null
          session_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "session_participants_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "collaboration_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          billing_cycle: string
          created_at: string | null
          currency: string
          current_period_end: string | null
          current_period_start: string | null
          email: string
          id: string
          plan_id: string | null
          plan_name: string
          price_amount: number
          razorpay_customer_id: string | null
          razorpay_subscription_id: string | null
          status: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          billing_cycle: string
          created_at?: string | null
          currency?: string
          current_period_end?: string | null
          current_period_start?: string | null
          email: string
          id?: string
          plan_id?: string | null
          plan_name: string
          price_amount: number
          razorpay_customer_id?: string | null
          razorpay_subscription_id?: string | null
          status?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          billing_cycle?: string
          created_at?: string | null
          currency?: string
          current_period_end?: string | null
          current_period_start?: string | null
          email?: string
          id?: string
          plan_id?: string | null
          plan_name?: string
          price_amount?: number
          razorpay_customer_id?: string | null
          razorpay_subscription_id?: string | null
          status?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "pricing_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      tool_usage: {
        Row: {
          created_at: string
          id: string
          results: Json | null
          session_data: Json | null
          tool_name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          results?: Json | null
          session_data?: Json | null
          tool_name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          results?: Json | null
          session_data?: Json | null
          tool_name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      url_previews: {
        Row: {
          created_at: string
          description: string | null
          domain: string | null
          expires_at: string | null
          favicon_url: string | null
          id: string
          image_url: string | null
          is_valid: boolean | null
          site_name: string | null
          title: string | null
          updated_at: string
          url: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          domain?: string | null
          expires_at?: string | null
          favicon_url?: string | null
          id?: string
          image_url?: string | null
          is_valid?: boolean | null
          site_name?: string | null
          title?: string | null
          updated_at?: string
          url: string
        }
        Update: {
          created_at?: string
          description?: string | null
          domain?: string | null
          expires_at?: string | null
          favicon_url?: string | null
          id?: string
          image_url?: string | null
          is_valid?: boolean | null
          site_name?: string | null
          title?: string | null
          updated_at?: string
          url?: string
        }
        Relationships: []
      }
      user_assessment_attempts: {
        Row: {
          answers: Json | null
          assessment_id: string | null
          attempt_number: number | null
          completed_at: string | null
          id: string
          passed: boolean | null
          score: number
          time_taken_minutes: number | null
          user_id: string | null
        }
        Insert: {
          answers?: Json | null
          assessment_id?: string | null
          attempt_number?: number | null
          completed_at?: string | null
          id?: string
          passed?: boolean | null
          score: number
          time_taken_minutes?: number | null
          user_id?: string | null
        }
        Update: {
          answers?: Json | null
          assessment_id?: string | null
          attempt_number?: number | null
          completed_at?: string | null
          id?: string
          passed?: boolean | null
          score?: number
          time_taken_minutes?: number | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_assessment_attempts_assessment_id_fkey"
            columns: ["assessment_id"]
            isOneToOne: false
            referencedRelation: "course_assessments"
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
      user_lesson_progress: {
        Row: {
          completed_at: string | null
          created_at: string | null
          id: string
          is_completed: boolean | null
          lesson_id: string | null
          time_spent_minutes: number | null
          user_id: string | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          id?: string
          is_completed?: boolean | null
          lesson_id?: string | null
          time_spent_minutes?: number | null
          user_id?: string | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          id?: string
          is_completed?: boolean | null
          lesson_id?: string | null
          time_spent_minutes?: number | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_lesson_progress_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "course_lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          assigned_at: string | null
          assigned_by: string | null
          created_at: string | null
          id: string
          is_active: boolean | null
          notes: string | null
          role: Database["public"]["Enums"]["app_role"]
          updated_at: string | null
          user_id: string
        }
        Insert: {
          assigned_at?: string | null
          assigned_by?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          notes?: string | null
          role: Database["public"]["Enums"]["app_role"]
          updated_at?: string | null
          user_id: string
        }
        Update: {
          assigned_at?: string | null
          assigned_by?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          notes?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_suggestions: {
        Row: {
          created_at: string
          description: string
          estimated_time: number | null
          expires_at: string | null
          id: string
          is_dismissed: boolean | null
          potential_impact: string | null
          priority: string | null
          reason: string | null
          title: string
          tool_name: string | null
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description: string
          estimated_time?: number | null
          expires_at?: string | null
          id?: string
          is_dismissed?: boolean | null
          potential_impact?: string | null
          priority?: string | null
          reason?: string | null
          title: string
          tool_name?: string | null
          type: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string
          estimated_time?: number | null
          expires_at?: string | null
          id?: string
          is_dismissed?: boolean | null
          potential_impact?: string | null
          priority?: string | null
          reason?: string | null
          title?: string
          tool_name?: string | null
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      user_tool_preferences: {
        Row: {
          created_at: string
          id: string
          preferences: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          preferences?: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          preferences?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      approve_company_access_request: {
        Args: { request_id: string }
        Returns: undefined
      }
      approve_employer_request: {
        Args: { request_id: string }
        Returns: undefined
      }
      complete_onboarding: {
        Args: {
          user_uuid: string
          user_full_name?: string
          selected_role?: Database["public"]["Enums"]["user_role"]
          user_preferences?: Json
        }
        Returns: undefined
      }
      get_email_domain: {
        Args: { email_address: string }
        Returns: string
      }
      get_post_reaction_counts: {
        Args: { post_uuid: string }
        Returns: {
          reaction_type: string
          emoji_code: string
          count: number
        }[]
      }
      get_user_app_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      has_app_role: {
        Args: {
          _user_id: string
          _role: Database["public"]["Enums"]["app_role"]
        }
        Returns: boolean
      }
      increment_job_applications: {
        Args: { job_id: string }
        Returns: undefined
      }
      increment_job_views: {
        Args: { job_id: string }
        Returns: undefined
      }
      increment_profile_views: {
        Args: {
          profile_user_id: string
          viewer_ip?: unknown
          viewer_agent?: string
        }
        Returns: undefined
      }
      is_app_admin: {
        Args: { _user_id: string }
        Returns: boolean
      }
      is_company_admin_or_owner: {
        Args: { company_uuid: string }
        Returns: boolean
      }
      reject_company_access_request: {
        Args: { request_id: string; reason?: string }
        Returns: undefined
      }
      reject_employer_request: {
        Args: { request_id: string; reason?: string }
        Returns: undefined
      }
      update_user_login: {
        Args: { user_uuid: string }
        Returns: undefined
      }
    }
    Enums: {
      app_role: "super_admin" | "admin" | "moderator" | "employer" | "user"
      application_status:
        | "applied"
        | "reviewing"
        | "shortlisted"
        | "interview_scheduled"
        | "interviewed"
        | "offered"
        | "hired"
        | "rejected"
      interview_status: "scheduled" | "completed" | "cancelled" | "rescheduled"
      team_role: "admin" | "recruiter" | "hr_manager" | "viewer" | "owner"
      user_role: "job_seeker" | "employer" | "admin" | "candidate"
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
    Enums: {
      app_role: ["super_admin", "admin", "moderator", "employer", "user"],
      application_status: [
        "applied",
        "reviewing",
        "shortlisted",
        "interview_scheduled",
        "interviewed",
        "offered",
        "hired",
        "rejected",
      ],
      interview_status: ["scheduled", "completed", "cancelled", "rescheduled"],
      team_role: ["admin", "recruiter", "hr_manager", "viewer", "owner"],
      user_role: ["job_seeker", "employer", "admin", "candidate"],
    },
  },
} as const
