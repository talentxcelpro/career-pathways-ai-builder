export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      ab_test_participants: {
        Row: {
          assigned_at: string | null
          id: string
          test_id: string
          user_id: string
          variant: string
        }
        Insert: {
          assigned_at?: string | null
          id?: string
          test_id: string
          user_id: string
          variant: string
        }
        Update: {
          assigned_at?: string | null
          id?: string
          test_id?: string
          user_id?: string
          variant?: string
        }
        Relationships: [
          {
            foreignKeyName: "ab_test_participants_test_id_fkey"
            columns: ["test_id"]
            isOneToOne: false
            referencedRelation: "ab_tests"
            referencedColumns: ["id"]
          },
        ]
      }
      ab_tests: {
        Row: {
          created_at: string | null
          created_by: string | null
          description: string | null
          end_date: string | null
          id: string
          start_date: string | null
          status: string | null
          success_metrics: string[] | null
          test_name: string
          traffic_allocation: number | null
          updated_at: string | null
          variants: Json
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          start_date?: string | null
          status?: string | null
          success_metrics?: string[] | null
          test_name: string
          traffic_allocation?: number | null
          updated_at?: string | null
          variants?: Json
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          start_date?: string | null
          status?: string | null
          success_metrics?: string[] | null
          test_name?: string
          traffic_allocation?: number | null
          updated_at?: string | null
          variants?: Json
        }
        Relationships: []
      }
      ad_campaigns: {
        Row: {
          budget_settings: Json | null
          campaign_name: string
          campaign_type: string
          created_at: string | null
          created_by: string | null
          creative_assets: Json | null
          end_date: string | null
          id: string
          performance_metrics: Json | null
          start_date: string | null
          status: string | null
          targeting_rules: Json | null
          updated_at: string | null
        }
        Insert: {
          budget_settings?: Json | null
          campaign_name: string
          campaign_type: string
          created_at?: string | null
          created_by?: string | null
          creative_assets?: Json | null
          end_date?: string | null
          id?: string
          performance_metrics?: Json | null
          start_date?: string | null
          status?: string | null
          targeting_rules?: Json | null
          updated_at?: string | null
        }
        Update: {
          budget_settings?: Json | null
          campaign_name?: string
          campaign_type?: string
          created_at?: string | null
          created_by?: string | null
          creative_assets?: Json | null
          end_date?: string | null
          id?: string
          performance_metrics?: Json | null
          start_date?: string | null
          status?: string | null
          targeting_rules?: Json | null
          updated_at?: string | null
        }
        Relationships: []
      }
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
      admin_content_flags: {
        Row: {
          created_at: string | null
          created_by: string | null
          entity_id: number
          entity_type: string
          expires_at: string | null
          flag: string
          id: number
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          entity_id: number
          entity_type: string
          expires_at?: string | null
          flag: string
          id?: number
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          entity_id?: number
          entity_type?: string
          expires_at?: string | null
          flag?: string
          id?: number
        }
        Relationships: []
      }
      admin_tool_configs: {
        Row: {
          ai_settings: Json | null
          feature_flags: Json | null
          id: string
          last_updated: string | null
          rate_limits: Json | null
          status: string | null
          tool_slug: string
          visibility: string | null
        }
        Insert: {
          ai_settings?: Json | null
          feature_flags?: Json | null
          id?: string
          last_updated?: string | null
          rate_limits?: Json | null
          status?: string | null
          tool_slug: string
          visibility?: string | null
        }
        Update: {
          ai_settings?: Json | null
          feature_flags?: Json | null
          id?: string
          last_updated?: string | null
          rate_limits?: Json | null
          status?: string | null
          tool_slug?: string
          visibility?: string | null
        }
        Relationships: []
      }
      ai_admin_inputs: {
        Row: {
          category: string | null
          content: Json
          created_at: string | null
          created_by: string | null
          id: string
          input_type: string
          is_active: boolean | null
          priority: number | null
          title: string
          tool_slug: string | null
          updated_at: string | null
          usage_count: number | null
        }
        Insert: {
          category?: string | null
          content?: Json
          created_at?: string | null
          created_by?: string | null
          id?: string
          input_type: string
          is_active?: boolean | null
          priority?: number | null
          title: string
          tool_slug?: string | null
          updated_at?: string | null
          usage_count?: number | null
        }
        Update: {
          category?: string | null
          content?: Json
          created_at?: string | null
          created_by?: string | null
          id?: string
          input_type?: string
          is_active?: boolean | null
          priority?: number | null
          title?: string
          tool_slug?: string | null
          updated_at?: string | null
          usage_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_admin_inputs_tool_slug_fkey"
            columns: ["tool_slug"]
            isOneToOne: false
            referencedRelation: "ai_tools_config"
            referencedColumns: ["tool_slug"]
          },
        ]
      }
      ai_career_insights: {
        Row: {
          confidence_level: string | null
          created_at: string | null
          data: Json
          data_freshness: string | null
          id: string
          industry: string | null
          insight_type: string
          is_personalized: boolean | null
          location: string | null
          role: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          confidence_level?: string | null
          created_at?: string | null
          data?: Json
          data_freshness?: string | null
          id?: string
          industry?: string | null
          insight_type: string
          is_personalized?: boolean | null
          location?: string | null
          role?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          confidence_level?: string | null
          created_at?: string | null
          data?: Json
          data_freshness?: string | null
          id?: string
          industry?: string | null
          insight_type?: string
          is_personalized?: boolean | null
          location?: string | null
          role?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      ai_career_recommendations: {
        Row: {
          confidence_score: number | null
          created_at: string | null
          description: string
          expires_at: string | null
          id: string
          is_dismissed: boolean | null
          is_viewed: boolean | null
          metadata: Json | null
          priority: number | null
          recommendation_type: string
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          confidence_score?: number | null
          created_at?: string | null
          description: string
          expires_at?: string | null
          id?: string
          is_dismissed?: boolean | null
          is_viewed?: boolean | null
          metadata?: Json | null
          priority?: number | null
          recommendation_type: string
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          confidence_score?: number | null
          created_at?: string | null
          description?: string
          expires_at?: string | null
          id?: string
          is_dismissed?: boolean | null
          is_viewed?: boolean | null
          metadata?: Json | null
          priority?: number | null
          recommendation_type?: string
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      ai_chat_messages: {
        Row: {
          content: string
          created_at: string | null
          id: string
          message_type: string
          metadata: Json | null
          session_id: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          message_type: string
          metadata?: Json | null
          session_id: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          message_type?: string
          metadata?: Json | null
          session_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_chat_messages_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "ai_chat_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_chat_sessions: {
        Row: {
          context_data: Json | null
          created_at: string | null
          id: string
          is_active: boolean | null
          last_message_at: string | null
          session_title: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          context_data?: Json | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          last_message_at?: string | null
          session_title?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          context_data?: Json | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          last_message_at?: string | null
          session_title?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      ai_content_library: {
        Row: {
          approved_by: string | null
          category: string
          content: string
          created_at: string | null
          created_by: string | null
          id: string
          is_approved: boolean | null
          metadata: Json | null
          quality_score: number | null
          tags: string[] | null
          template_type: string
          title: string
          updated_at: string | null
          usage_count: number | null
        }
        Insert: {
          approved_by?: string | null
          category: string
          content: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_approved?: boolean | null
          metadata?: Json | null
          quality_score?: number | null
          tags?: string[] | null
          template_type: string
          title: string
          updated_at?: string | null
          usage_count?: number | null
        }
        Update: {
          approved_by?: string | null
          category?: string
          content?: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_approved?: boolean | null
          metadata?: Json | null
          quality_score?: number | null
          tags?: string[] | null
          template_type?: string
          title?: string
          updated_at?: string | null
          usage_count?: number | null
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
      ai_cover_letters_enhanced: {
        Row: {
          ai_generated: boolean | null
          ai_prompt: string | null
          company_name: string | null
          content: string
          created_at: string | null
          id: string
          job_id: string | null
          job_title: string | null
          language: string | null
          resume_id: string | null
          template_id: string | null
          title: string
          tone: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          ai_generated?: boolean | null
          ai_prompt?: string | null
          company_name?: string | null
          content: string
          created_at?: string | null
          id?: string
          job_id?: string | null
          job_title?: string | null
          language?: string | null
          resume_id?: string | null
          template_id?: string | null
          title: string
          tone?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          ai_generated?: boolean | null
          ai_prompt?: string | null
          company_name?: string | null
          content?: string
          created_at?: string | null
          id?: string
          job_id?: string | null
          job_title?: string | null
          language?: string | null
          resume_id?: string | null
          template_id?: string | null
          title?: string
          tone?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_cover_letters_enhanced_resume_id_fkey"
            columns: ["resume_id"]
            isOneToOne: false
            referencedRelation: "resumes"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_datasets: {
        Row: {
          created_at: string | null
          created_by: string | null
          data_schema: Json | null
          dataset_name: string
          dataset_type: string
          description: string | null
          file_path: string | null
          file_size_mb: number | null
          id: string
          last_processed_at: string | null
          processing_progress: number | null
          processing_status: string | null
          quality_score: number | null
          sample_count: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          data_schema?: Json | null
          dataset_name: string
          dataset_type: string
          description?: string | null
          file_path?: string | null
          file_size_mb?: number | null
          id?: string
          last_processed_at?: string | null
          processing_progress?: number | null
          processing_status?: string | null
          quality_score?: number | null
          sample_count?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          data_schema?: Json | null
          dataset_name?: string
          dataset_type?: string
          description?: string | null
          file_path?: string | null
          file_size_mb?: number | null
          id?: string
          last_processed_at?: string | null
          processing_progress?: number | null
          processing_status?: string | null
          quality_score?: number | null
          sample_count?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      ai_deployments: {
        Row: {
          average_response_time_ms: number | null
          created_at: string | null
          deployed_by: string | null
          deployment_config: Json | null
          deployment_date: string | null
          deployment_name: string
          endpoint_url: string
          error_rate: number | null
          health_status: string | null
          id: string
          is_live: boolean | null
          last_health_check: string | null
          model_id: string | null
          module_name: string
          request_count: number | null
          updated_at: string | null
        }
        Insert: {
          average_response_time_ms?: number | null
          created_at?: string | null
          deployed_by?: string | null
          deployment_config?: Json | null
          deployment_date?: string | null
          deployment_name: string
          endpoint_url: string
          error_rate?: number | null
          health_status?: string | null
          id?: string
          is_live?: boolean | null
          last_health_check?: string | null
          model_id?: string | null
          module_name: string
          request_count?: number | null
          updated_at?: string | null
        }
        Update: {
          average_response_time_ms?: number | null
          created_at?: string | null
          deployed_by?: string | null
          deployment_config?: Json | null
          deployment_date?: string | null
          deployment_name?: string
          endpoint_url?: string
          error_rate?: number | null
          health_status?: string | null
          id?: string
          is_live?: boolean | null
          last_health_check?: string | null
          model_id?: string | null
          module_name?: string
          request_count?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_deployments_model_id_fkey"
            columns: ["model_id"]
            isOneToOne: false
            referencedRelation: "ai_models"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_features_status: {
        Row: {
          average_response_time: number | null
          created_at: string
          enabled: boolean
          error_count: number | null
          error_message: string | null
          feature_key: string
          feature_name: string
          id: string
          last_checked: string | null
          last_error: string | null
          last_success: string | null
          module_name: string
          notes: string | null
          prompt_version: string | null
          success_count: number | null
          updated_at: string
          usage_count: number | null
        }
        Insert: {
          average_response_time?: number | null
          created_at?: string
          enabled?: boolean
          error_count?: number | null
          error_message?: string | null
          feature_key: string
          feature_name: string
          id?: string
          last_checked?: string | null
          last_error?: string | null
          last_success?: string | null
          module_name: string
          notes?: string | null
          prompt_version?: string | null
          success_count?: number | null
          updated_at?: string
          usage_count?: number | null
        }
        Update: {
          average_response_time?: number | null
          created_at?: string
          enabled?: boolean
          error_count?: number | null
          error_message?: string | null
          feature_key?: string
          feature_name?: string
          id?: string
          last_checked?: string | null
          last_error?: string | null
          last_success?: string | null
          module_name?: string
          notes?: string | null
          prompt_version?: string | null
          success_count?: number | null
          updated_at?: string
          usage_count?: number | null
        }
        Relationships: []
      }
      ai_feedback: {
        Row: {
          created_at: string | null
          feedback_text: string | null
          feedback_type: string | null
          id: string
          is_helpful: boolean | null
          log_id: string | null
          rating: number | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          feedback_text?: string | null
          feedback_type?: string | null
          id?: string
          is_helpful?: boolean | null
          log_id?: string | null
          rating?: number | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          feedback_text?: string | null
          feedback_type?: string | null
          id?: string
          is_helpful?: boolean | null
          log_id?: string | null
          rating?: number | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_feedback_log_id_fkey"
            columns: ["log_id"]
            isOneToOne: false
            referencedRelation: "ai_request_logs"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_feedback_system: {
        Row: {
          admin_response: string | null
          created_at: string | null
          feedback_text: string | null
          feedback_type: string | null
          id: string
          is_resolved: boolean | null
          metadata: Json | null
          operation_id: string | null
          rating: number | null
          resolved_at: string | null
          tool_slug: string
          user_id: string
        }
        Insert: {
          admin_response?: string | null
          created_at?: string | null
          feedback_text?: string | null
          feedback_type?: string | null
          id?: string
          is_resolved?: boolean | null
          metadata?: Json | null
          operation_id?: string | null
          rating?: number | null
          resolved_at?: string | null
          tool_slug: string
          user_id: string
        }
        Update: {
          admin_response?: string | null
          created_at?: string | null
          feedback_text?: string | null
          feedback_type?: string | null
          id?: string
          is_resolved?: boolean | null
          metadata?: Json | null
          operation_id?: string | null
          rating?: number | null
          resolved_at?: string | null
          tool_slug?: string
          user_id?: string
        }
        Relationships: []
      }
      ai_job_matches: {
        Row: {
          applied_at: string | null
          created_at: string | null
          id: string
          is_bookmarked: boolean | null
          job_id: string
          match_score: number
          matching_factors: Json | null
          salary_comparison: Json | null
          skill_gaps: Json | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          applied_at?: string | null
          created_at?: string | null
          id?: string
          is_bookmarked?: boolean | null
          job_id: string
          match_score: number
          matching_factors?: Json | null
          salary_comparison?: Json | null
          skill_gaps?: Json | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          applied_at?: string | null
          created_at?: string | null
          id?: string
          is_bookmarked?: boolean | null
          job_id?: string
          match_score?: number
          matching_factors?: Json | null
          salary_comparison?: Json | null
          skill_gaps?: Json | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_job_matches_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_models: {
        Row: {
          api_endpoint: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          is_active: boolean | null
          model_config: Json | null
          model_name: string
          model_path: string | null
          model_size_mb: number | null
          model_version: string
          performance_metrics: Json | null
          task_type: string
          training_accuracy: number | null
          training_date: string | null
          updated_at: string | null
        }
        Insert: {
          api_endpoint?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          model_config?: Json | null
          model_name: string
          model_path?: string | null
          model_size_mb?: number | null
          model_version?: string
          performance_metrics?: Json | null
          task_type: string
          training_accuracy?: number | null
          training_date?: string | null
          updated_at?: string | null
        }
        Update: {
          api_endpoint?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          model_config?: Json | null
          model_name?: string
          model_path?: string | null
          model_size_mb?: number | null
          model_version?: string
          performance_metrics?: Json | null
          task_type?: string
          training_accuracy?: number | null
          training_date?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      ai_operation_queue: {
        Row: {
          attempts: number | null
          completed_at: string | null
          cost: number | null
          created_at: string | null
          error_message: string | null
          id: string
          input_data: Json
          max_attempts: number | null
          operation_type: string
          output_data: Json | null
          priority: number | null
          processing_time_ms: number | null
          scheduled_at: string | null
          started_at: string | null
          status: string | null
          tool_slug: string
          user_id: string
        }
        Insert: {
          attempts?: number | null
          completed_at?: string | null
          cost?: number | null
          created_at?: string | null
          error_message?: string | null
          id?: string
          input_data: Json
          max_attempts?: number | null
          operation_type: string
          output_data?: Json | null
          priority?: number | null
          processing_time_ms?: number | null
          scheduled_at?: string | null
          started_at?: string | null
          status?: string | null
          tool_slug: string
          user_id: string
        }
        Update: {
          attempts?: number | null
          completed_at?: string | null
          cost?: number | null
          created_at?: string | null
          error_message?: string | null
          id?: string
          input_data?: Json
          max_attempts?: number | null
          operation_type?: string
          output_data?: Json | null
          priority?: number | null
          processing_time_ms?: number | null
          scheduled_at?: string | null
          started_at?: string | null
          status?: string | null
          tool_slug?: string
          user_id?: string
        }
        Relationships: []
      }
      ai_prompt_library: {
        Row: {
          created_at: string | null
          created_by: string | null
          id: string
          is_active: boolean | null
          model_settings: Json | null
          prompt_category: string
          prompt_name: string
          prompt_text: string
          rating: number | null
          system_message: string | null
          updated_at: string | null
          usage_count: number | null
          variables: Json | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          model_settings?: Json | null
          prompt_category: string
          prompt_name: string
          prompt_text: string
          rating?: number | null
          system_message?: string | null
          updated_at?: string | null
          usage_count?: number | null
          variables?: Json | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          model_settings?: Json | null
          prompt_category?: string
          prompt_name?: string
          prompt_text?: string
          rating?: number | null
          system_message?: string | null
          updated_at?: string | null
          usage_count?: number | null
          variables?: Json | null
        }
        Relationships: []
      }
      ai_prompt_templates: {
        Row: {
          created_at: string
          created_by: string | null
          feature_key: string
          id: string
          is_active: boolean
          max_tokens: number | null
          model_name: string | null
          module_name: string
          prompt_template: string
          system_message: string | null
          temperature: number | null
          template_name: string
          updated_at: string
          version: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          feature_key: string
          id?: string
          is_active?: boolean
          max_tokens?: number | null
          model_name?: string | null
          module_name: string
          prompt_template: string
          system_message?: string | null
          temperature?: number | null
          template_name: string
          updated_at?: string
          version?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          feature_key?: string
          id?: string
          is_active?: boolean
          max_tokens?: number | null
          model_name?: string | null
          module_name?: string
          prompt_template?: string
          system_message?: string | null
          temperature?: number | null
          template_name?: string
          updated_at?: string
          version?: string
        }
        Relationships: []
      }
      ai_request_logs: {
        Row: {
          cost_estimate: number | null
          created_at: string | null
          deployment_id: string | null
          error_message: string | null
          id: string
          input_data: Json
          ip_address: unknown | null
          output_data: Json | null
          request_type: string
          response_time_ms: number | null
          success: boolean | null
          tokens_used: number | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          cost_estimate?: number | null
          created_at?: string | null
          deployment_id?: string | null
          error_message?: string | null
          id?: string
          input_data: Json
          ip_address?: unknown | null
          output_data?: Json | null
          request_type: string
          response_time_ms?: number | null
          success?: boolean | null
          tokens_used?: number | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          cost_estimate?: number | null
          created_at?: string | null
          deployment_id?: string | null
          error_message?: string | null
          id?: string
          input_data?: Json
          ip_address?: unknown | null
          output_data?: Json | null
          request_type?: string
          response_time_ms?: number | null
          success?: boolean | null
          tokens_used?: number | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_request_logs_deployment_id_fkey"
            columns: ["deployment_id"]
            isOneToOne: false
            referencedRelation: "ai_deployments"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_resume_analysis: {
        Row: {
          analysis_version: string | null
          ats_compatibility_score: number | null
          created_at: string | null
          id: string
          improvements: Json | null
          industry_comparison: Json | null
          keyword_optimization: Json | null
          overall_score: number | null
          resume_id: string
          strengths: Json | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          analysis_version?: string | null
          ats_compatibility_score?: number | null
          created_at?: string | null
          id?: string
          improvements?: Json | null
          industry_comparison?: Json | null
          keyword_optimization?: Json | null
          overall_score?: number | null
          resume_id: string
          strengths?: Json | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          analysis_version?: string | null
          ats_compatibility_score?: number | null
          created_at?: string | null
          id?: string
          improvements?: Json | null
          industry_comparison?: Json | null
          keyword_optimization?: Json | null
          overall_score?: number | null
          resume_id?: string
          strengths?: Json | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_resume_analysis_resume_id_fkey"
            columns: ["resume_id"]
            isOneToOne: false
            referencedRelation: "resumes"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_resume_suggestions: {
        Row: {
          confidence_score: number | null
          created_at: string | null
          experience_level: string | null
          id: string
          industry: string | null
          is_used: boolean | null
          job_title: string | null
          keywords: Json | null
          original_content: string | null
          section_type: string
          suggested_content: string
          suggestion_type: string
          user_id: string | null
        }
        Insert: {
          confidence_score?: number | null
          created_at?: string | null
          experience_level?: string | null
          id?: string
          industry?: string | null
          is_used?: boolean | null
          job_title?: string | null
          keywords?: Json | null
          original_content?: string | null
          section_type: string
          suggested_content: string
          suggestion_type: string
          user_id?: string | null
        }
        Update: {
          confidence_score?: number | null
          created_at?: string | null
          experience_level?: string | null
          id?: string
          industry?: string | null
          is_used?: boolean | null
          job_title?: string | null
          keywords?: Json | null
          original_content?: string | null
          section_type?: string
          suggested_content?: string
          suggestion_type?: string
          user_id?: string | null
        }
        Relationships: []
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
      ai_tools_config: {
        Row: {
          admin_notes: string | null
          category: string | null
          cost_per_request: number | null
          created_at: string | null
          description: string | null
          id: string
          is_enabled: boolean | null
          is_premium: boolean | null
          max_tokens: number | null
          model_name: string | null
          prompt_template: string | null
          rate_limit_per_day: number | null
          rate_limit_per_hour: number | null
          system_message: string | null
          temperature: number | null
          tool_name: string
          tool_slug: string
          updated_at: string | null
        }
        Insert: {
          admin_notes?: string | null
          category?: string | null
          cost_per_request?: number | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_enabled?: boolean | null
          is_premium?: boolean | null
          max_tokens?: number | null
          model_name?: string | null
          prompt_template?: string | null
          rate_limit_per_day?: number | null
          rate_limit_per_hour?: number | null
          system_message?: string | null
          temperature?: number | null
          tool_name: string
          tool_slug: string
          updated_at?: string | null
        }
        Update: {
          admin_notes?: string | null
          category?: string | null
          cost_per_request?: number | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_enabled?: boolean | null
          is_premium?: boolean | null
          max_tokens?: number | null
          model_name?: string | null
          prompt_template?: string | null
          rate_limit_per_day?: number | null
          rate_limit_per_hour?: number | null
          system_message?: string | null
          temperature?: number | null
          tool_name?: string
          tool_slug?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      ai_training_jobs: {
        Row: {
          accuracy: number | null
          created_at: string | null
          created_by: string | null
          current_epoch: number | null
          dataset_id: string | null
          end_time: string | null
          error_message: string | null
          id: string
          job_name: string
          loss_value: number | null
          model_id: string | null
          progress: number | null
          start_time: string | null
          status: string | null
          total_epochs: number | null
          training_config: Json | null
          training_logs: Json | null
          updated_at: string | null
        }
        Insert: {
          accuracy?: number | null
          created_at?: string | null
          created_by?: string | null
          current_epoch?: number | null
          dataset_id?: string | null
          end_time?: string | null
          error_message?: string | null
          id?: string
          job_name: string
          loss_value?: number | null
          model_id?: string | null
          progress?: number | null
          start_time?: string | null
          status?: string | null
          total_epochs?: number | null
          training_config?: Json | null
          training_logs?: Json | null
          updated_at?: string | null
        }
        Update: {
          accuracy?: number | null
          created_at?: string | null
          created_by?: string | null
          current_epoch?: number | null
          dataset_id?: string | null
          end_time?: string | null
          error_message?: string | null
          id?: string
          job_name?: string
          loss_value?: number | null
          model_id?: string | null
          progress?: number | null
          start_time?: string | null
          status?: string | null
          total_epochs?: number | null
          training_config?: Json | null
          training_logs?: Json | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_training_jobs_dataset_id_fkey"
            columns: ["dataset_id"]
            isOneToOne: false
            referencedRelation: "ai_datasets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_training_jobs_model_id_fkey"
            columns: ["model_id"]
            isOneToOne: false
            referencedRelation: "ai_models"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_usage_logs: {
        Row: {
          admin_flagged: boolean | null
          cost_estimate: number | null
          created_at: string
          error_message: string | null
          feature_key: string | null
          feature_type: string
          id: string
          input_tokens: number | null
          module_name: string | null
          operation_id: string | null
          output_tokens: number | null
          request_data: Json | null
          request_type: string
          response_data: Json | null
          response_time: number | null
          session_id: string | null
          success: boolean | null
          tokens_used: number | null
          tool_slug: string | null
          user_id: string
          user_rating: number | null
        }
        Insert: {
          admin_flagged?: boolean | null
          cost_estimate?: number | null
          created_at?: string
          error_message?: string | null
          feature_key?: string | null
          feature_type: string
          id?: string
          input_tokens?: number | null
          module_name?: string | null
          operation_id?: string | null
          output_tokens?: number | null
          request_data?: Json | null
          request_type: string
          response_data?: Json | null
          response_time?: number | null
          session_id?: string | null
          success?: boolean | null
          tokens_used?: number | null
          tool_slug?: string | null
          user_id: string
          user_rating?: number | null
        }
        Update: {
          admin_flagged?: boolean | null
          cost_estimate?: number | null
          created_at?: string
          error_message?: string | null
          feature_key?: string | null
          feature_type?: string
          id?: string
          input_tokens?: number | null
          module_name?: string | null
          operation_id?: string | null
          output_tokens?: number | null
          request_data?: Json | null
          request_type?: string
          response_data?: Json | null
          response_time?: number | null
          session_id?: string | null
          success?: boolean | null
          tokens_used?: number | null
          tool_slug?: string | null
          user_id?: string
          user_rating?: number | null
        }
        Relationships: []
      }
      analytics_company_views: {
        Row: {
          company_id: string | null
          device_type: string | null
          id: string
          location_country: string | null
          referral_source: string | null
          total_views: number | null
          unique_views: number | null
          view_date: string | null
        }
        Insert: {
          company_id?: string | null
          device_type?: string | null
          id?: string
          location_country?: string | null
          referral_source?: string | null
          total_views?: number | null
          unique_views?: number | null
          view_date?: string | null
        }
        Update: {
          company_id?: string | null
          device_type?: string | null
          id?: string
          location_country?: string | null
          referral_source?: string | null
          total_views?: number | null
          unique_views?: number | null
          view_date?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "analytics_company_views_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      analytics_job_stats: {
        Row: {
          applications_count: number | null
          avg_time_to_apply: unknown | null
          conversion_rate: number | null
          hires_count: number | null
          id: string
          interviews_scheduled: number | null
          job_id: string | null
          qualified_applications: number | null
          stat_date: string | null
          views_count: number | null
        }
        Insert: {
          applications_count?: number | null
          avg_time_to_apply?: unknown | null
          conversion_rate?: number | null
          hires_count?: number | null
          id?: string
          interviews_scheduled?: number | null
          job_id?: string | null
          qualified_applications?: number | null
          stat_date?: string | null
          views_count?: number | null
        }
        Update: {
          applications_count?: number | null
          avg_time_to_apply?: unknown | null
          conversion_rate?: number | null
          hires_count?: number | null
          id?: string
          interviews_scheduled?: number | null
          job_id?: string | null
          qualified_applications?: number | null
          stat_date?: string | null
          views_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "analytics_job_stats_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      analytics_post_engagement: {
        Row: {
          click_through_rate: number | null
          comments_count: number | null
          engagement_date: string | null
          id: string
          likes_count: number | null
          post_id: string | null
          shares_count: number | null
          views_count: number | null
        }
        Insert: {
          click_through_rate?: number | null
          comments_count?: number | null
          engagement_date?: string | null
          id?: string
          likes_count?: number | null
          post_id?: string | null
          shares_count?: number | null
          views_count?: number | null
        }
        Update: {
          click_through_rate?: number | null
          comments_count?: number | null
          engagement_date?: string | null
          id?: string
          likes_count?: number | null
          post_id?: string | null
          shares_count?: number | null
          views_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "analytics_post_engagement_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "company_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      applications: {
        Row: {
          academic_info: Json | null
          admin_notes: string | null
          ai_completion_score: number | null
          ai_suggestions: string[] | null
          application_date: string | null
          application_deadline: string | null
          application_number: string | null
          application_status: string | null
          campus_preferences: string[] | null
          college_id: string
          course_id: string
          course_preferences: string[] | null
          created_at: string
          document_deadline: string | null
          documents: Json | null
          entrance_exam_scores: Json | null
          fee_deadline: string | null
          id: string
          last_updated_by: string | null
          personal_info: Json | null
          status_history: Json | null
          student_id: string
          submission_date: string | null
          updated_at: string
        }
        Insert: {
          academic_info?: Json | null
          admin_notes?: string | null
          ai_completion_score?: number | null
          ai_suggestions?: string[] | null
          application_date?: string | null
          application_deadline?: string | null
          application_number?: string | null
          application_status?: string | null
          campus_preferences?: string[] | null
          college_id: string
          course_id: string
          course_preferences?: string[] | null
          created_at?: string
          document_deadline?: string | null
          documents?: Json | null
          entrance_exam_scores?: Json | null
          fee_deadline?: string | null
          id?: string
          last_updated_by?: string | null
          personal_info?: Json | null
          status_history?: Json | null
          student_id: string
          submission_date?: string | null
          updated_at?: string
        }
        Update: {
          academic_info?: Json | null
          admin_notes?: string | null
          ai_completion_score?: number | null
          ai_suggestions?: string[] | null
          application_date?: string | null
          application_deadline?: string | null
          application_number?: string | null
          application_status?: string | null
          campus_preferences?: string[] | null
          college_id?: string
          course_id?: string
          course_preferences?: string[] | null
          created_at?: string
          document_deadline?: string | null
          documents?: Json | null
          entrance_exam_scores?: Json | null
          fee_deadline?: string | null
          id?: string
          last_updated_by?: string | null
          personal_info?: Json | null
          status_history?: Json | null
          student_id?: string
          submission_date?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "applications_college_id_fkey"
            columns: ["college_id"]
            isOneToOne: false
            referencedRelation: "colleges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "applications_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "college_courses"
            referencedColumns: ["id"]
          },
        ]
      }
      article_bookmarks: {
        Row: {
          created_at: string | null
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "article_bookmarks_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      article_subscriptions: {
        Row: {
          author_id: string
          created_at: string | null
          id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          author_id: string
          created_at?: string | null
          id?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          author_id?: string
          created_at?: string | null
          id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      awards: {
        Row: {
          award_date: string | null
          award_description: string | null
          award_title: string | null
          created_at: string | null
          id: string
          issued_by: string | null
          user_id: string
        }
        Insert: {
          award_date?: string | null
          award_description?: string | null
          award_title?: string | null
          created_at?: string | null
          id?: string
          issued_by?: string | null
          user_id: string
        }
        Update: {
          award_date?: string | null
          award_description?: string | null
          award_title?: string | null
          created_at?: string | null
          id?: string
          issued_by?: string | null
          user_id?: string
        }
        Relationships: []
      }
      breadcrumb_configs: {
        Row: {
          breadcrumb_structure: Json
          created_at: string
          id: string
          is_active: boolean | null
          page_pattern: string
          priority: number | null
          updated_at: string
        }
        Insert: {
          breadcrumb_structure?: Json
          created_at?: string
          id?: string
          is_active?: boolean | null
          page_pattern: string
          priority?: number | null
          updated_at?: string
        }
        Update: {
          breadcrumb_structure?: Json
          created_at?: string
          id?: string
          is_active?: boolean | null
          page_pattern?: string
          priority?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      bulk_operation_queue: {
        Row: {
          completed_at: string | null
          created_at: string | null
          created_by: string
          error_details: string | null
          id: string
          operation_type: string
          parameters: Json | null
          processed_items: number | null
          progress: number | null
          started_at: string | null
          status: string | null
          target_criteria: Json
          total_items: number | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          created_by: string
          error_details?: string | null
          id?: string
          operation_type: string
          parameters?: Json | null
          processed_items?: number | null
          progress?: number | null
          started_at?: string | null
          status?: string | null
          target_criteria: Json
          total_items?: number | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          created_by?: string
          error_details?: string | null
          id?: string
          operation_type?: string
          parameters?: Json | null
          processed_items?: number | null
          progress?: number | null
          started_at?: string | null
          status?: string | null
          target_criteria?: Json
          total_items?: number | null
        }
        Relationships: []
      }
      bulk_operations: {
        Row: {
          completed_at: string | null
          created_at: string | null
          error_log: Json | null
          failure_count: number | null
          id: string
          operation_name: string
          operation_type: string
          organization_id: string | null
          processed_count: number | null
          progress_percentage: number | null
          result_summary: Json | null
          started_at: string | null
          started_by: string | null
          status: string | null
          success_count: number | null
          target_count: number
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          error_log?: Json | null
          failure_count?: number | null
          id?: string
          operation_name: string
          operation_type: string
          organization_id?: string | null
          processed_count?: number | null
          progress_percentage?: number | null
          result_summary?: Json | null
          started_at?: string | null
          started_by?: string | null
          status?: string | null
          success_count?: number | null
          target_count?: number
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          error_log?: Json | null
          failure_count?: number | null
          id?: string
          operation_name?: string
          operation_type?: string
          organization_id?: string | null
          processed_count?: number | null
          progress_percentage?: number | null
          result_summary?: Json | null
          started_at?: string | null
          started_by?: string | null
          status?: string | null
          success_count?: number | null
          target_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "bulk_operations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
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
      career_milestones: {
        Row: {
          achievement_date: string
          celebration_count: number | null
          company: string | null
          created_at: string | null
          description: string | null
          id: string
          is_public: boolean | null
          milestone_type: string
          title: string
          user_id: string
        }
        Insert: {
          achievement_date: string
          celebration_count?: number | null
          company?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_public?: boolean | null
          milestone_type: string
          title: string
          user_id: string
        }
        Update: {
          achievement_date?: string
          celebration_count?: number | null
          company?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_public?: boolean | null
          milestone_type?: string
          title?: string
          user_id?: string
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
      certifications: {
        Row: {
          certificate_name: string | null
          certificate_url: string | null
          created_at: string | null
          date_earned: string | null
          id: string
          issuer: string | null
          user_id: string
        }
        Insert: {
          certificate_name?: string | null
          certificate_url?: string | null
          created_at?: string | null
          date_earned?: string | null
          id?: string
          issuer?: string | null
          user_id: string
        }
        Update: {
          certificate_name?: string | null
          certificate_url?: string | null
          created_at?: string | null
          date_earned?: string | null
          id?: string
          issuer?: string | null
          user_id?: string
        }
        Relationships: []
      }
      clean_resumes: {
        Row: {
          ats_score: number | null
          content: Json
          created_at: string | null
          id: string
          is_primary: boolean | null
          is_public: boolean | null
          public_url_slug: string | null
          template_id: string
          title: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          ats_score?: number | null
          content: Json
          created_at?: string | null
          id?: string
          is_primary?: boolean | null
          is_public?: boolean | null
          public_url_slug?: string | null
          template_id?: string
          title?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          ats_score?: number | null
          content?: Json
          created_at?: string | null
          id?: string
          is_primary?: boolean | null
          is_public?: boolean | null
          public_url_slug?: string | null
          template_id?: string
          title?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
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
      college_admins: {
        Row: {
          can_edit_college_info: boolean | null
          can_manage_admissions: boolean | null
          can_manage_courses: boolean | null
          can_view_analytics: boolean | null
          college_id: string
          created_at: string
          department: string | null
          designation: string | null
          id: string
          invited_by: string | null
          is_active: boolean | null
          joined_at: string | null
          role: string
          updated_at: string
          user_id: string
        }
        Insert: {
          can_edit_college_info?: boolean | null
          can_manage_admissions?: boolean | null
          can_manage_courses?: boolean | null
          can_view_analytics?: boolean | null
          college_id: string
          created_at?: string
          department?: string | null
          designation?: string | null
          id?: string
          invited_by?: string | null
          is_active?: boolean | null
          joined_at?: string | null
          role?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          can_edit_college_info?: boolean | null
          can_manage_admissions?: boolean | null
          can_manage_courses?: boolean | null
          can_view_analytics?: boolean | null
          college_id?: string
          created_at?: string
          department?: string | null
          designation?: string | null
          id?: string
          invited_by?: string | null
          is_active?: boolean | null
          joined_at?: string | null
          role?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "college_admins_college_id_fkey"
            columns: ["college_id"]
            isOneToOne: false
            referencedRelation: "colleges"
            referencedColumns: ["id"]
          },
        ]
      }
      college_analytics: {
        Row: {
          application_completions: number | null
          application_starts: number | null
          bookmark_count: number | null
          college_id: string | null
          course_views: number | null
          created_at: string | null
          date: string | null
          id: string
          profile_views: number | null
          unique_visitors: number | null
        }
        Insert: {
          application_completions?: number | null
          application_starts?: number | null
          bookmark_count?: number | null
          college_id?: string | null
          course_views?: number | null
          created_at?: string | null
          date?: string | null
          id?: string
          profile_views?: number | null
          unique_visitors?: number | null
        }
        Update: {
          application_completions?: number | null
          application_starts?: number | null
          bookmark_count?: number | null
          college_id?: string | null
          course_views?: number | null
          created_at?: string | null
          date?: string | null
          id?: string
          profile_views?: number | null
          unique_visitors?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "college_analytics_college_id_fkey"
            columns: ["college_id"]
            isOneToOne: false
            referencedRelation: "colleges"
            referencedColumns: ["id"]
          },
        ]
      }
      college_bookmarks: {
        Row: {
          college_id: string
          created_at: string
          id: string
          notes: string | null
          tags: string[] | null
          user_id: string
        }
        Insert: {
          college_id: string
          created_at?: string
          id?: string
          notes?: string | null
          tags?: string[] | null
          user_id: string
        }
        Update: {
          college_id?: string
          created_at?: string
          id?: string
          notes?: string | null
          tags?: string[] | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "college_bookmarks_college_id_fkey"
            columns: ["college_id"]
            isOneToOne: false
            referencedRelation: "colleges"
            referencedColumns: ["id"]
          },
        ]
      }
      college_courses: {
        Row: {
          additional_fees: Json | null
          ai_career_alignment_score: number | null
          ai_course_summary: string | null
          average_salary: number | null
          brochure_url: string | null
          career_prospects: string[] | null
          college_id: string
          course_code: string | null
          course_mode: string | null
          course_name: string
          created_at: string
          curriculum: string[] | null
          degree_type: string
          description: string | null
          discipline: string
          duration_years: number
          eligibility_criteria: string | null
          emi_available: boolean | null
          entrance_exams: string[] | null
          fees_per_semester: number | null
          id: string
          is_active: boolean | null
          learning_outcomes: string[] | null
          placement_rate: number | null
          reservation_details: Json | null
          scholarship_available: boolean | null
          specialization: string | null
          syllabus_url: string | null
          top_recruiters: string[] | null
          total_fees: number | null
          total_seats: number | null
          updated_at: string
        }
        Insert: {
          additional_fees?: Json | null
          ai_career_alignment_score?: number | null
          ai_course_summary?: string | null
          average_salary?: number | null
          brochure_url?: string | null
          career_prospects?: string[] | null
          college_id: string
          course_code?: string | null
          course_mode?: string | null
          course_name: string
          created_at?: string
          curriculum?: string[] | null
          degree_type: string
          description?: string | null
          discipline: string
          duration_years: number
          eligibility_criteria?: string | null
          emi_available?: boolean | null
          entrance_exams?: string[] | null
          fees_per_semester?: number | null
          id?: string
          is_active?: boolean | null
          learning_outcomes?: string[] | null
          placement_rate?: number | null
          reservation_details?: Json | null
          scholarship_available?: boolean | null
          specialization?: string | null
          syllabus_url?: string | null
          top_recruiters?: string[] | null
          total_fees?: number | null
          total_seats?: number | null
          updated_at?: string
        }
        Update: {
          additional_fees?: Json | null
          ai_career_alignment_score?: number | null
          ai_course_summary?: string | null
          average_salary?: number | null
          brochure_url?: string | null
          career_prospects?: string[] | null
          college_id?: string
          course_code?: string | null
          course_mode?: string | null
          course_name?: string
          created_at?: string
          curriculum?: string[] | null
          degree_type?: string
          description?: string | null
          discipline?: string
          duration_years?: number
          eligibility_criteria?: string | null
          emi_available?: boolean | null
          entrance_exams?: string[] | null
          fees_per_semester?: number | null
          id?: string
          is_active?: boolean | null
          learning_outcomes?: string[] | null
          placement_rate?: number | null
          reservation_details?: Json | null
          scholarship_available?: boolean | null
          specialization?: string | null
          syllabus_url?: string | null
          top_recruiters?: string[] | null
          total_fees?: number | null
          total_seats?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "college_courses_college_id_fkey"
            columns: ["college_id"]
            isOneToOne: false
            referencedRelation: "colleges"
            referencedColumns: ["id"]
          },
        ]
      }
      college_creation_requests: {
        Row: {
          address: string | null
          admin_notes: string | null
          city: string | null
          college_email: string
          college_name: string
          contact_person: string
          created_at: string | null
          documents_urls: string[] | null
          id: string
          official_website: string | null
          phone: string | null
          requester_id: string
          state: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          admin_notes?: string | null
          city?: string | null
          college_email: string
          college_name: string
          contact_person: string
          created_at?: string | null
          documents_urls?: string[] | null
          id?: string
          official_website?: string | null
          phone?: string | null
          requester_id: string
          state?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          admin_notes?: string | null
          city?: string | null
          college_email?: string
          college_name?: string
          contact_person?: string
          created_at?: string | null
          documents_urls?: string[] | null
          id?: string
          official_website?: string | null
          phone?: string | null
          requester_id?: string
          state?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      college_events: {
        Row: {
          brochure_url: string | null
          college_id: string
          created_at: string
          created_by: string | null
          current_registrations: number | null
          description: string | null
          end_date: string | null
          event_name: string
          event_type: string
          id: string
          is_active: boolean | null
          is_online: boolean | null
          max_participants: number | null
          poster_url: string | null
          registration_fee: number | null
          registration_url: string | null
          start_date: string
          updated_at: string
          venue: string | null
        }
        Insert: {
          brochure_url?: string | null
          college_id: string
          created_at?: string
          created_by?: string | null
          current_registrations?: number | null
          description?: string | null
          end_date?: string | null
          event_name: string
          event_type: string
          id?: string
          is_active?: boolean | null
          is_online?: boolean | null
          max_participants?: number | null
          poster_url?: string | null
          registration_fee?: number | null
          registration_url?: string | null
          start_date: string
          updated_at?: string
          venue?: string | null
        }
        Update: {
          brochure_url?: string | null
          college_id?: string
          created_at?: string
          created_by?: string | null
          current_registrations?: number | null
          description?: string | null
          end_date?: string | null
          event_name?: string
          event_type?: string
          id?: string
          is_active?: boolean | null
          is_online?: boolean | null
          max_participants?: number | null
          poster_url?: string | null
          registration_fee?: number | null
          registration_url?: string | null
          start_date?: string
          updated_at?: string
          venue?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "college_events_college_id_fkey"
            columns: ["college_id"]
            isOneToOne: false
            referencedRelation: "colleges"
            referencedColumns: ["id"]
          },
        ]
      }
      college_media: {
        Row: {
          category: string | null
          college_id: string
          created_at: string
          description: string | null
          display_order: number | null
          duration: number | null
          file_size: number | null
          id: string
          is_featured: boolean | null
          media_type: string
          media_url: string
          resolution: string | null
          thumbnail_url: string | null
          title: string | null
          updated_at: string
          uploaded_by: string | null
        }
        Insert: {
          category?: string | null
          college_id: string
          created_at?: string
          description?: string | null
          display_order?: number | null
          duration?: number | null
          file_size?: number | null
          id?: string
          is_featured?: boolean | null
          media_type: string
          media_url: string
          resolution?: string | null
          thumbnail_url?: string | null
          title?: string | null
          updated_at?: string
          uploaded_by?: string | null
        }
        Update: {
          category?: string | null
          college_id?: string
          created_at?: string
          description?: string | null
          display_order?: number | null
          duration?: number | null
          file_size?: number | null
          id?: string
          is_featured?: boolean | null
          media_type?: string
          media_url?: string
          resolution?: string | null
          thumbnail_url?: string | null
          title?: string | null
          updated_at?: string
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "college_media_college_id_fkey"
            columns: ["college_id"]
            isOneToOne: false
            referencedRelation: "colleges"
            referencedColumns: ["id"]
          },
        ]
      }
      college_posts: {
        Row: {
          college_id: string | null
          content: string
          created_at: string | null
          created_by: string | null
          id: string
          image_url: string | null
          is_featured: boolean | null
          post_type: string | null
          status: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          college_id?: string | null
          content: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          image_url?: string | null
          is_featured?: boolean | null
          post_type?: string | null
          status?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          college_id?: string | null
          content?: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          image_url?: string | null
          is_featured?: boolean | null
          post_type?: string | null
          status?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "college_posts_college_id_fkey"
            columns: ["college_id"]
            isOneToOne: false
            referencedRelation: "colleges"
            referencedColumns: ["id"]
          },
        ]
      }
      college_reviews: {
        Row: {
          academic_rating: number | null
          ai_extracted_topics: string[] | null
          ai_sentiment_label: string | null
          ai_sentiment_score: number | null
          college_id: string
          course_studied: string | null
          created_at: string
          faculty_rating: number | null
          graduation_year: number | null
          helpful_count: number | null
          id: string
          infrastructure_rating: number | null
          is_anonymous: boolean | null
          is_verified: boolean | null
          overall_rating: number
          placement_rating: number | null
          review_content: string
          review_title: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          academic_rating?: number | null
          ai_extracted_topics?: string[] | null
          ai_sentiment_label?: string | null
          ai_sentiment_score?: number | null
          college_id: string
          course_studied?: string | null
          created_at?: string
          faculty_rating?: number | null
          graduation_year?: number | null
          helpful_count?: number | null
          id?: string
          infrastructure_rating?: number | null
          is_anonymous?: boolean | null
          is_verified?: boolean | null
          overall_rating: number
          placement_rating?: number | null
          review_content: string
          review_title?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          academic_rating?: number | null
          ai_extracted_topics?: string[] | null
          ai_sentiment_label?: string | null
          ai_sentiment_score?: number | null
          college_id?: string
          course_studied?: string | null
          created_at?: string
          faculty_rating?: number | null
          graduation_year?: number | null
          helpful_count?: number | null
          id?: string
          infrastructure_rating?: number | null
          is_anonymous?: boolean | null
          is_verified?: boolean | null
          overall_rating?: number
          placement_rating?: number | null
          review_content?: string
          review_title?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "college_reviews_college_id_fkey"
            columns: ["college_id"]
            isOneToOne: false
            referencedRelation: "colleges"
            referencedColumns: ["id"]
          },
        ]
      }
      colleges: {
        Row: {
          accreditation_grade: string | null
          address: string | null
          affiliation: string | null
          ai_match_keywords: string[] | null
          ai_summary: string | null
          average_fees_per_year: number | null
          average_package: number | null
          campus_size_acres: number | null
          city: string | null
          college_type: string | null
          country: string | null
          cover_image_url: string | null
          created_at: string
          created_by: string | null
          description: string | null
          email: string | null
          established_year: number | null
          featured: boolean | null
          highest_package: number | null
          hostels_available: boolean | null
          id: string
          is_active: boolean | null
          is_verified: boolean | null
          keywords: string[] | null
          labs_count: number | null
          library_books: number | null
          logo_url: string | null
          meta_description: string | null
          meta_title: string | null
          name: string
          phone: string | null
          placement_percentage: number | null
          postal_code: string | null
          ranking_national: number | null
          ranking_nirf: number | null
          recognition: string[] | null
          scholarship_available: boolean | null
          slug: string | null
          state: string | null
          total_faculty: number | null
          total_students: number | null
          updated_at: string
          verification_status: string | null
          website: string | null
        }
        Insert: {
          accreditation_grade?: string | null
          address?: string | null
          affiliation?: string | null
          ai_match_keywords?: string[] | null
          ai_summary?: string | null
          average_fees_per_year?: number | null
          average_package?: number | null
          campus_size_acres?: number | null
          city?: string | null
          college_type?: string | null
          country?: string | null
          cover_image_url?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          email?: string | null
          established_year?: number | null
          featured?: boolean | null
          highest_package?: number | null
          hostels_available?: boolean | null
          id?: string
          is_active?: boolean | null
          is_verified?: boolean | null
          keywords?: string[] | null
          labs_count?: number | null
          library_books?: number | null
          logo_url?: string | null
          meta_description?: string | null
          meta_title?: string | null
          name: string
          phone?: string | null
          placement_percentage?: number | null
          postal_code?: string | null
          ranking_national?: number | null
          ranking_nirf?: number | null
          recognition?: string[] | null
          scholarship_available?: boolean | null
          slug?: string | null
          state?: string | null
          total_faculty?: number | null
          total_students?: number | null
          updated_at?: string
          verification_status?: string | null
          website?: string | null
        }
        Update: {
          accreditation_grade?: string | null
          address?: string | null
          affiliation?: string | null
          ai_match_keywords?: string[] | null
          ai_summary?: string | null
          average_fees_per_year?: number | null
          average_package?: number | null
          campus_size_acres?: number | null
          city?: string | null
          college_type?: string | null
          country?: string | null
          cover_image_url?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          email?: string | null
          established_year?: number | null
          featured?: boolean | null
          highest_package?: number | null
          hostels_available?: boolean | null
          id?: string
          is_active?: boolean | null
          is_verified?: boolean | null
          keywords?: string[] | null
          labs_count?: number | null
          library_books?: number | null
          logo_url?: string | null
          meta_description?: string | null
          meta_title?: string | null
          name?: string
          phone?: string | null
          placement_percentage?: number | null
          postal_code?: string | null
          ranking_national?: number | null
          ranking_nirf?: number | null
          recognition?: string[] | null
          scholarship_available?: boolean | null
          slug?: string | null
          state?: string | null
          total_faculty?: number | null
          total_students?: number | null
          updated_at?: string
          verification_status?: string | null
          website?: string | null
        }
        Relationships: []
      }
      community_activities: {
        Row: {
          activity_type: string
          community_id: string | null
          content: string | null
          created_at: string | null
          id: string
          points_earned: number | null
          user_id: string | null
        }
        Insert: {
          activity_type: string
          community_id?: string | null
          content?: string | null
          created_at?: string | null
          id?: string
          points_earned?: number | null
          user_id?: string | null
        }
        Update: {
          activity_type?: string
          community_id?: string | null
          content?: string | null
          created_at?: string | null
          id?: string
          points_earned?: number | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "community_activities_community_id_fkey"
            columns: ["community_id"]
            isOneToOne: false
            referencedRelation: "goal_communities"
            referencedColumns: ["id"]
          },
        ]
      }
      community_memberships: {
        Row: {
          community_id: string | null
          id: string
          is_active: boolean | null
          joined_at: string | null
          last_activity_at: string | null
          progress_score: number | null
          role: string | null
          streak_days: number | null
          user_id: string | null
        }
        Insert: {
          community_id?: string | null
          id?: string
          is_active?: boolean | null
          joined_at?: string | null
          last_activity_at?: string | null
          progress_score?: number | null
          role?: string | null
          streak_days?: number | null
          user_id?: string | null
        }
        Update: {
          community_id?: string | null
          id?: string
          is_active?: boolean | null
          joined_at?: string | null
          last_activity_at?: string | null
          progress_score?: number | null
          role?: string | null
          streak_days?: number | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "community_memberships_community_id_fkey"
            columns: ["community_id"]
            isOneToOne: false
            referencedRelation: "goal_communities"
            referencedColumns: ["id"]
          },
        ]
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
          slug: string | null
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
          slug?: string | null
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
          slug?: string | null
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
      company_activity_logs: {
        Row: {
          activity_type: string
          company_id: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          metadata: Json | null
          title: string
        }
        Insert: {
          activity_type: string
          company_id?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          metadata?: Json | null
          title: string
        }
        Update: {
          activity_type?: string
          company_id?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          metadata?: Json | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "company_activity_logs_company_id_fkey"
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
      company_ai_insights: {
        Row: {
          company_id: string | null
          confidence_score: number | null
          created_at: string | null
          description: string
          expires_at: string | null
          id: string
          insight_type: string
          priority: string | null
          recommendations: Json | null
          status: string | null
          title: string
        }
        Insert: {
          company_id?: string | null
          confidence_score?: number | null
          created_at?: string | null
          description: string
          expires_at?: string | null
          id?: string
          insight_type: string
          priority?: string | null
          recommendations?: Json | null
          status?: string | null
          title: string
        }
        Update: {
          company_id?: string | null
          confidence_score?: number | null
          created_at?: string | null
          description?: string
          expires_at?: string | null
          id?: string
          insight_type?: string
          priority?: string | null
          recommendations?: Json | null
          status?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "company_ai_insights_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      company_ai_recommendations: {
        Row: {
          action_items: Json | null
          company_id: string | null
          created_at: string | null
          description: string
          expected_outcome: string | null
          expires_at: string | null
          id: string
          impact_score: number | null
          implementation_effort: string | null
          is_implemented: boolean | null
          recommendation_type: string
          title: string
        }
        Insert: {
          action_items?: Json | null
          company_id?: string | null
          created_at?: string | null
          description: string
          expected_outcome?: string | null
          expires_at?: string | null
          id?: string
          impact_score?: number | null
          implementation_effort?: string | null
          is_implemented?: boolean | null
          recommendation_type: string
          title: string
        }
        Update: {
          action_items?: Json | null
          company_id?: string | null
          created_at?: string | null
          description?: string
          expected_outcome?: string | null
          expires_at?: string | null
          id?: string
          impact_score?: number | null
          implementation_effort?: string | null
          is_implemented?: boolean | null
          recommendation_type?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "company_ai_recommendations_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      company_analytics_sessions: {
        Row: {
          application_completions: number | null
          application_starts: number | null
          bounce_rate: number | null
          company_id: string | null
          id: string
          job_page_views: number | null
          page_views: number | null
          profile_engagement_time: unknown | null
          session_date: string | null
          traffic_sources: Json | null
          unique_visitors: number | null
        }
        Insert: {
          application_completions?: number | null
          application_starts?: number | null
          bounce_rate?: number | null
          company_id?: string | null
          id?: string
          job_page_views?: number | null
          page_views?: number | null
          profile_engagement_time?: unknown | null
          session_date?: string | null
          traffic_sources?: Json | null
          unique_visitors?: number | null
        }
        Update: {
          application_completions?: number | null
          application_starts?: number | null
          bounce_rate?: number | null
          company_id?: string | null
          id?: string
          job_page_views?: number | null
          page_views?: number | null
          profile_engagement_time?: unknown | null
          session_date?: string | null
          traffic_sources?: Json | null
          unique_visitors?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "company_analytics_sessions_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      company_benchmarks: {
        Row: {
          benchmark_date: string | null
          company_id: string | null
          data_source: string | null
          id: string
          industry_avg_applications: number | null
          industry_avg_engagement: number | null
          industry_avg_followers: number | null
          industry_avg_time_to_hire: unknown | null
        }
        Insert: {
          benchmark_date?: string | null
          company_id?: string | null
          data_source?: string | null
          id?: string
          industry_avg_applications?: number | null
          industry_avg_engagement?: number | null
          industry_avg_followers?: number | null
          industry_avg_time_to_hire?: unknown | null
        }
        Update: {
          benchmark_date?: string | null
          company_id?: string | null
          data_source?: string | null
          id?: string
          industry_avg_applications?: number | null
          industry_avg_engagement?: number | null
          industry_avg_followers?: number | null
          industry_avg_time_to_hire?: unknown | null
        }
        Relationships: [
          {
            foreignKeyName: "company_benchmarks_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      company_content_calendar: {
        Row: {
          company_id: string | null
          content_data: Json | null
          content_type: string
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          scheduled_date: string
          status: string | null
          title: string
        }
        Insert: {
          company_id?: string | null
          content_data?: Json | null
          content_type: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          scheduled_date: string
          status?: string | null
          title: string
        }
        Update: {
          company_id?: string | null
          content_data?: Json | null
          content_type?: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          scheduled_date?: string
          status?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "company_content_calendar_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      company_events: {
        Row: {
          company_id: string | null
          created_at: string | null
          created_by: string | null
          current_attendees: number | null
          description: string | null
          event_date: string
          event_type: string | null
          id: string
          is_virtual: boolean | null
          location: string | null
          max_attendees: number | null
          registration_url: string | null
          status: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          company_id?: string | null
          created_at?: string | null
          created_by?: string | null
          current_attendees?: number | null
          description?: string | null
          event_date: string
          event_type?: string | null
          id?: string
          is_virtual?: boolean | null
          location?: string | null
          max_attendees?: number | null
          registration_url?: string | null
          status?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          company_id?: string | null
          created_at?: string | null
          created_by?: string | null
          current_attendees?: number | null
          description?: string | null
          event_date?: string
          event_type?: string | null
          id?: string
          is_virtual?: boolean | null
          location?: string | null
          max_attendees?: number | null
          registration_url?: string | null
          status?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "company_events_company_id_fkey"
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
          created_at: string | null
          followed_at: string | null
          id: string
          user_id: string | null
        }
        Insert: {
          company_id?: string | null
          created_at?: string | null
          followed_at?: string | null
          id?: string
          user_id?: string | null
        }
        Update: {
          company_id?: string | null
          created_at?: string | null
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
      company_integrations: {
        Row: {
          api_credentials: Json | null
          company_id: string | null
          configuration: Json | null
          created_at: string | null
          id: string
          integration_name: string
          integration_type: string
          is_active: boolean | null
          last_sync: string | null
          sync_status: string | null
          updated_at: string | null
        }
        Insert: {
          api_credentials?: Json | null
          company_id?: string | null
          configuration?: Json | null
          created_at?: string | null
          id?: string
          integration_name: string
          integration_type: string
          is_active?: boolean | null
          last_sync?: string | null
          sync_status?: string | null
          updated_at?: string | null
        }
        Update: {
          api_credentials?: Json | null
          company_id?: string | null
          configuration?: Json | null
          created_at?: string | null
          id?: string
          integration_name?: string
          integration_type?: string
          is_active?: boolean | null
          last_sync?: string | null
          sync_status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "company_integrations_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      company_media_library: {
        Row: {
          alt_text: string | null
          company_id: string | null
          created_at: string | null
          file_name: string
          file_size: number | null
          file_type: string
          file_url: string
          id: string
          is_featured: boolean | null
          mime_type: string | null
          tags: string[] | null
          uploaded_by: string | null
        }
        Insert: {
          alt_text?: string | null
          company_id?: string | null
          created_at?: string | null
          file_name: string
          file_size?: number | null
          file_type: string
          file_url: string
          id?: string
          is_featured?: boolean | null
          mime_type?: string | null
          tags?: string[] | null
          uploaded_by?: string | null
        }
        Update: {
          alt_text?: string | null
          company_id?: string | null
          created_at?: string | null
          file_name?: string
          file_size?: number | null
          file_type?: string
          file_url?: string
          id?: string
          is_featured?: boolean | null
          mime_type?: string | null
          tags?: string[] | null
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "company_media_library_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      company_metrics: {
        Row: {
          active_jobs_count: number | null
          avg_engagement: number | null
          brand_reach: number | null
          company_id: string | null
          content_performance_score: number | null
          created_at: string | null
          engagement_rate: number | null
          engagement_score: number | null
          followers_count: number | null
          id: string
          month_year: string | null
          profile_views_count: number | null
          success_rate: number | null
          talent_attraction_score: number | null
          total_applications_count: number | null
          updated_at: string | null
        }
        Insert: {
          active_jobs_count?: number | null
          avg_engagement?: number | null
          brand_reach?: number | null
          company_id?: string | null
          content_performance_score?: number | null
          created_at?: string | null
          engagement_rate?: number | null
          engagement_score?: number | null
          followers_count?: number | null
          id?: string
          month_year?: string | null
          profile_views_count?: number | null
          success_rate?: number | null
          talent_attraction_score?: number | null
          total_applications_count?: number | null
          updated_at?: string | null
        }
        Update: {
          active_jobs_count?: number | null
          avg_engagement?: number | null
          brand_reach?: number | null
          company_id?: string | null
          content_performance_score?: number | null
          created_at?: string | null
          engagement_rate?: number | null
          engagement_score?: number | null
          followers_count?: number | null
          id?: string
          month_year?: string | null
          profile_views_count?: number | null
          success_rate?: number | null
          talent_attraction_score?: number | null
          total_applications_count?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "company_metrics_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      company_notification_settings: {
        Row: {
          company_id: string | null
          created_at: string | null
          email_notifications: Json | null
          id: string
          notification_frequency: string | null
          push_notifications: Json | null
          slack_webhook: string | null
          teams_webhook: string | null
          updated_at: string | null
        }
        Insert: {
          company_id?: string | null
          created_at?: string | null
          email_notifications?: Json | null
          id?: string
          notification_frequency?: string | null
          push_notifications?: Json | null
          slack_webhook?: string | null
          teams_webhook?: string | null
          updated_at?: string | null
        }
        Update: {
          company_id?: string | null
          created_at?: string | null
          email_notifications?: Json | null
          id?: string
          notification_frequency?: string | null
          push_notifications?: Json | null
          slack_webhook?: string | null
          teams_webhook?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "company_notification_settings_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: true
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      company_post_interactions: {
        Row: {
          content: string | null
          created_at: string | null
          id: string
          interaction_type: string
          post_id: string
          user_id: string
        }
        Insert: {
          content?: string | null
          created_at?: string | null
          id?: string
          interaction_type: string
          post_id: string
          user_id: string
        }
        Update: {
          content?: string | null
          created_at?: string | null
          id?: string
          interaction_type?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "company_post_interactions_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "company_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      company_posts: {
        Row: {
          author_id: string
          comments_count: number | null
          company_id: string
          content: string
          created_at: string | null
          id: string
          is_featured: boolean | null
          likes_count: number | null
          media_urls: Json | null
          post_type: string
          published_at: string | null
          scheduled_at: string | null
          shares_count: number | null
          status: string
          tags: string[] | null
          title: string
          updated_at: string | null
          views_count: number | null
        }
        Insert: {
          author_id: string
          comments_count?: number | null
          company_id: string
          content: string
          created_at?: string | null
          id?: string
          is_featured?: boolean | null
          likes_count?: number | null
          media_urls?: Json | null
          post_type?: string
          published_at?: string | null
          scheduled_at?: string | null
          shares_count?: number | null
          status?: string
          tags?: string[] | null
          title: string
          updated_at?: string | null
          views_count?: number | null
        }
        Update: {
          author_id?: string
          comments_count?: number | null
          company_id?: string
          content?: string
          created_at?: string | null
          id?: string
          is_featured?: boolean | null
          likes_count?: number | null
          media_urls?: Json | null
          post_type?: string
          published_at?: string | null
          scheduled_at?: string | null
          shares_count?: number | null
          status?: string
          tags?: string[] | null
          title?: string
          updated_at?: string | null
          views_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "company_posts_company_id_fkey"
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
      company_realtime_metrics: {
        Row: {
          company_id: string | null
          id: string
          metadata: Json | null
          metric_type: string
          metric_value: number
          timestamp: string | null
        }
        Insert: {
          company_id?: string | null
          id?: string
          metadata?: Json | null
          metric_type: string
          metric_value: number
          timestamp?: string | null
        }
        Update: {
          company_id?: string | null
          id?: string
          metadata?: Json | null
          metric_type?: string
          metric_value?: number
          timestamp?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "company_realtime_metrics_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      company_settings: {
        Row: {
          ai_settings: Json | null
          branding_settings: Json | null
          company_id: string | null
          created_at: string | null
          id: string
          integration_keys: Json | null
          notification_preferences: Json | null
          privacy_settings: Json | null
          updated_at: string | null
        }
        Insert: {
          ai_settings?: Json | null
          branding_settings?: Json | null
          company_id?: string | null
          created_at?: string | null
          id?: string
          integration_keys?: Json | null
          notification_preferences?: Json | null
          privacy_settings?: Json | null
          updated_at?: string | null
        }
        Update: {
          ai_settings?: Json | null
          branding_settings?: Json | null
          company_id?: string | null
          created_at?: string | null
          id?: string
          integration_keys?: Json | null
          notification_preferences?: Json | null
          privacy_settings?: Json | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "company_settings_company_id_fkey"
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
      compliance_reports: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          compliance_score: number | null
          findings: Json | null
          generated_at: string | null
          generated_by: string | null
          id: string
          organization_id: string | null
          recommendations: Json | null
          report_data: Json
          report_name: string
          report_type: string
          reporting_period_end: string
          reporting_period_start: string
          status: string | null
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          compliance_score?: number | null
          findings?: Json | null
          generated_at?: string | null
          generated_by?: string | null
          id?: string
          organization_id?: string | null
          recommendations?: Json | null
          report_data?: Json
          report_name: string
          report_type: string
          reporting_period_end: string
          reporting_period_start: string
          status?: string | null
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          compliance_score?: number | null
          findings?: Json | null
          generated_at?: string | null
          generated_by?: string | null
          id?: string
          organization_id?: string | null
          recommendations?: Json | null
          report_data?: Json
          report_name?: string
          report_type?: string
          reporting_period_end?: string
          reporting_period_start?: string
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "compliance_reports_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
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
      content_hub: {
        Row: {
          author_id: string | null
          content: string
          content_type: string
          created_at: string | null
          editor_id: string | null
          excerpt: string | null
          id: string
          metadata: Json | null
          publish_date: string | null
          seo_data: Json | null
          status: string | null
          tags: string[] | null
          title: string
          updated_at: string | null
        }
        Insert: {
          author_id?: string | null
          content: string
          content_type: string
          created_at?: string | null
          editor_id?: string | null
          excerpt?: string | null
          id?: string
          metadata?: Json | null
          publish_date?: string | null
          seo_data?: Json | null
          status?: string | null
          tags?: string[] | null
          title: string
          updated_at?: string | null
        }
        Update: {
          author_id?: string | null
          content?: string
          content_type?: string
          created_at?: string | null
          editor_id?: string | null
          excerpt?: string | null
          id?: string
          metadata?: Json | null
          publish_date?: string | null
          seo_data?: Json | null
          status?: string | null
          tags?: string[] | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      content_moderation: {
        Row: {
          automated_flags: Json | null
          content_id: string
          content_type: string
          created_at: string | null
          id: string
          moderation_reason: string | null
          moderator_id: string | null
          reported_by: string[] | null
          severity_level: number | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          automated_flags?: Json | null
          content_id: string
          content_type: string
          created_at?: string | null
          id?: string
          moderation_reason?: string | null
          moderator_id?: string | null
          reported_by?: string[] | null
          severity_level?: number | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          automated_flags?: Json | null
          content_id?: string
          content_type?: string
          created_at?: string | null
          id?: string
          moderation_reason?: string | null
          moderator_id?: string | null
          reported_by?: string[] | null
          severity_level?: number | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      contract_activities: {
        Row: {
          activity_type: string
          contract_id: string
          created_at: string | null
          description: string | null
          id: string
          metadata: Json | null
          user_email: string | null
          user_id: string | null
        }
        Insert: {
          activity_type: string
          contract_id: string
          created_at?: string | null
          description?: string | null
          id?: string
          metadata?: Json | null
          user_email?: string | null
          user_id?: string | null
        }
        Update: {
          activity_type?: string
          contract_id?: string
          created_at?: string | null
          description?: string | null
          id?: string
          metadata?: Json | null
          user_email?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contract_activities_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "contracts"
            referencedColumns: ["id"]
          },
        ]
      }
      contract_signatures: {
        Row: {
          contract_id: string
          created_at: string | null
          id: string
          ip_address: unknown | null
          signature_data: string | null
          signed_at: string | null
          signer_email: string
          signer_name: string
          signer_type: string
          user_agent: string | null
        }
        Insert: {
          contract_id: string
          created_at?: string | null
          id?: string
          ip_address?: unknown | null
          signature_data?: string | null
          signed_at?: string | null
          signer_email: string
          signer_name: string
          signer_type: string
          user_agent?: string | null
        }
        Update: {
          contract_id?: string
          created_at?: string | null
          id?: string
          ip_address?: unknown | null
          signature_data?: string | null
          signed_at?: string | null
          signer_email?: string
          signer_name?: string
          signer_type?: string
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contract_signatures_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "contracts"
            referencedColumns: ["id"]
          },
        ]
      }
      contract_templates: {
        Row: {
          content: string
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          template_type: string
          updated_at: string | null
          variables: Json | null
        }
        Insert: {
          content: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          template_type: string
          updated_at?: string | null
          variables?: Json | null
        }
        Update: {
          content?: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          template_type?: string
          updated_at?: string | null
          variables?: Json | null
        }
        Relationships: []
      }
      contracts: {
        Row: {
          content: string
          contract_currency: string | null
          contract_value: number | null
          created_at: string | null
          created_by: string
          id: string
          metadata: Json | null
          pdf_url: string | null
          recipient_email: string
          recipient_name: string | null
          signed_pdf_url: string | null
          signing_deadline: string | null
          status: string | null
          template_id: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          content: string
          contract_currency?: string | null
          contract_value?: number | null
          created_at?: string | null
          created_by: string
          id?: string
          metadata?: Json | null
          pdf_url?: string | null
          recipient_email: string
          recipient_name?: string | null
          signed_pdf_url?: string | null
          signing_deadline?: string | null
          status?: string | null
          template_id?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          content?: string
          contract_currency?: string | null
          contract_value?: number | null
          created_at?: string | null
          created_by?: string
          id?: string
          metadata?: Json | null
          pdf_url?: string | null
          recipient_email?: string
          recipient_name?: string | null
          signed_pdf_url?: string | null
          signing_deadline?: string | null
          status?: string | null
          template_id?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contracts_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "contract_templates"
            referencedColumns: ["id"]
          },
        ]
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
      custom_sections: {
        Row: {
          content: string | null
          created_at: string | null
          id: string
          section_title: string | null
          user_id: string
        }
        Insert: {
          content?: string | null
          created_at?: string | null
          id?: string
          section_title?: string | null
          user_id: string
        }
        Update: {
          content?: string | null
          created_at?: string | null
          id?: string
          section_title?: string | null
          user_id?: string
        }
        Relationships: []
      }
      dashboard_widgets: {
        Row: {
          configuration: Json
          created_at: string | null
          height: number | null
          id: string
          is_active: boolean | null
          position_x: number | null
          position_y: number | null
          title: string
          updated_at: string | null
          user_id: string
          widget_type: string
          width: number | null
        }
        Insert: {
          configuration?: Json
          created_at?: string | null
          height?: number | null
          id?: string
          is_active?: boolean | null
          position_x?: number | null
          position_y?: number | null
          title: string
          updated_at?: string | null
          user_id: string
          widget_type: string
          width?: number | null
        }
        Update: {
          configuration?: Json
          created_at?: string | null
          height?: number | null
          id?: string
          is_active?: boolean | null
          position_x?: number | null
          position_y?: number | null
          title?: string
          updated_at?: string | null
          user_id?: string
          widget_type?: string
          width?: number | null
        }
        Relationships: []
      }
      data_transfer_jobs: {
        Row: {
          completed_at: string | null
          created_at: string | null
          data_type: string
          error_log: Json | null
          file_url: string | null
          id: string
          job_type: string
          mapping_config: Json | null
          organization_id: string | null
          progress_percentage: number | null
          records_failed: number | null
          records_processed: number | null
          records_successful: number | null
          records_total: number | null
          result_file_url: string | null
          source_format: string | null
          started_at: string | null
          started_by: string | null
          status: string | null
          target_format: string | null
          validation_rules: Json | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          data_type: string
          error_log?: Json | null
          file_url?: string | null
          id?: string
          job_type: string
          mapping_config?: Json | null
          organization_id?: string | null
          progress_percentage?: number | null
          records_failed?: number | null
          records_processed?: number | null
          records_successful?: number | null
          records_total?: number | null
          result_file_url?: string | null
          source_format?: string | null
          started_at?: string | null
          started_by?: string | null
          status?: string | null
          target_format?: string | null
          validation_rules?: Json | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          data_type?: string
          error_log?: Json | null
          file_url?: string | null
          id?: string
          job_type?: string
          mapping_config?: Json | null
          organization_id?: string | null
          progress_percentage?: number | null
          records_failed?: number | null
          records_processed?: number | null
          records_successful?: number | null
          records_total?: number | null
          result_file_url?: string | null
          source_format?: string | null
          started_at?: string | null
          started_by?: string | null
          status?: string | null
          target_format?: string | null
          validation_rules?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "data_transfer_jobs_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      department_members: {
        Row: {
          department_id: string
          id: string
          joined_at: string
          role: string
          user_id: string
        }
        Insert: {
          department_id: string
          id?: string
          joined_at?: string
          role?: string
          user_id: string
        }
        Update: {
          department_id?: string
          id?: string
          joined_at?: string
          role?: string
          user_id?: string
        }
        Relationships: []
      }
      discussion_forums: {
        Row: {
          category: string
          created_at: string | null
          created_by: string | null
          description: string | null
          icon: string | null
          id: string
          is_active: boolean | null
          member_count: number | null
          name: string
          post_count: number | null
          updated_at: string | null
        }
        Insert: {
          category: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          member_count?: number | null
          name: string
          post_count?: number | null
          updated_at?: string | null
        }
        Update: {
          category?: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          member_count?: number | null
          name?: string
          post_count?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      education: {
        Row: {
          academic_projects: string[] | null
          created_at: string | null
          degree: string | null
          gpa_honors: string | null
          graduation_date: string | null
          id: string
          institution: string | null
          relevant_coursework: string[] | null
          user_id: string
        }
        Insert: {
          academic_projects?: string[] | null
          created_at?: string | null
          degree?: string | null
          gpa_honors?: string | null
          graduation_date?: string | null
          id?: string
          institution?: string | null
          relevant_coursework?: string[] | null
          user_id: string
        }
        Update: {
          academic_projects?: string[] | null
          created_at?: string | null
          degree?: string | null
          gpa_honors?: string | null
          graduation_date?: string | null
          id?: string
          institution?: string | null
          relevant_coursework?: string[] | null
          user_id?: string
        }
        Relationships: []
      }
      elite_service_templates: {
        Row: {
          category: string
          created_at: string | null
          delivery_time_days: number | null
          description: string
          features: string[] | null
          id: string
          is_active: boolean | null
          recommended_pricing_type: string | null
          suggested_price_range: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          category: string
          created_at?: string | null
          delivery_time_days?: number | null
          description: string
          features?: string[] | null
          id?: string
          is_active?: boolean | null
          recommended_pricing_type?: string | null
          suggested_price_range?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          category?: string
          created_at?: string | null
          delivery_time_days?: number | null
          description?: string
          features?: string[] | null
          id?: string
          is_active?: boolean | null
          recommended_pricing_type?: string | null
          suggested_price_range?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      email_analytics_daily: {
        Row: {
          created_at: string
          date: string
          emails_bounced: number | null
          emails_clicked: number | null
          emails_delivered: number | null
          emails_failed: number | null
          emails_opened: number | null
          emails_sent: number | null
          id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          date?: string
          emails_bounced?: number | null
          emails_clicked?: number | null
          emails_delivered?: number | null
          emails_failed?: number | null
          emails_opened?: number | null
          emails_sent?: number | null
          id?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          date?: string
          emails_bounced?: number | null
          emails_clicked?: number | null
          emails_delivered?: number | null
          emails_failed?: number | null
          emails_opened?: number | null
          emails_sent?: number | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      email_automation_queue: {
        Row: {
          attempts: number | null
          created_at: string | null
          error_message: string | null
          id: string
          max_attempts: number | null
          recipient_email: string
          recipient_name: string | null
          scheduled_at: string | null
          sent_at: string | null
          status: string | null
          template_data: Json | null
          trigger_type: string
          updated_at: string | null
        }
        Insert: {
          attempts?: number | null
          created_at?: string | null
          error_message?: string | null
          id?: string
          max_attempts?: number | null
          recipient_email: string
          recipient_name?: string | null
          scheduled_at?: string | null
          sent_at?: string | null
          status?: string | null
          template_data?: Json | null
          trigger_type: string
          updated_at?: string | null
        }
        Update: {
          attempts?: number | null
          created_at?: string | null
          error_message?: string | null
          id?: string
          max_attempts?: number | null
          recipient_email?: string
          recipient_name?: string | null
          scheduled_at?: string | null
          sent_at?: string | null
          status?: string | null
          template_data?: Json | null
          trigger_type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      email_automation_settings: {
        Row: {
          conditions: Json | null
          created_at: string | null
          delay_minutes: number | null
          html_template: string | null
          id: string
          is_enabled: boolean | null
          subject_template: string
          template_name: string
          trigger_type: string
          updated_at: string | null
        }
        Insert: {
          conditions?: Json | null
          created_at?: string | null
          delay_minutes?: number | null
          html_template?: string | null
          id?: string
          is_enabled?: boolean | null
          subject_template: string
          template_name: string
          trigger_type: string
          updated_at?: string | null
        }
        Update: {
          conditions?: Json | null
          created_at?: string | null
          delay_minutes?: number | null
          html_template?: string | null
          id?: string
          is_enabled?: boolean | null
          subject_template?: string
          template_name?: string
          trigger_type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      email_delivery_events: {
        Row: {
          created_at: string
          email_id: string | null
          event_data: Json | null
          event_type: string
          external_id: string | null
          id: string
          ip_address: unknown | null
          link_url: string | null
          recipient_email: string
          user_agent: string | null
        }
        Insert: {
          created_at?: string
          email_id?: string | null
          event_data?: Json | null
          event_type: string
          external_id?: string | null
          id?: string
          ip_address?: unknown | null
          link_url?: string | null
          recipient_email: string
          user_agent?: string | null
        }
        Update: {
          created_at?: string
          email_id?: string | null
          event_data?: Json | null
          event_type?: string
          external_id?: string | null
          id?: string
          ip_address?: unknown | null
          link_url?: string | null
          recipient_email?: string
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "email_delivery_events_email_id_fkey"
            columns: ["email_id"]
            isOneToOne: false
            referencedRelation: "email_automation_queue"
            referencedColumns: ["id"]
          },
        ]
      }
      email_notification_settings: {
        Row: {
          created_at: string
          id: string
          push_on_application: boolean
          push_on_connection: boolean
          push_on_interview: boolean
          push_on_job_match: boolean
          push_on_monthly_digest: boolean
          push_on_password_reset: boolean
          push_on_team_invite: boolean
          push_on_welcome: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          push_on_application?: boolean
          push_on_connection?: boolean
          push_on_interview?: boolean
          push_on_job_match?: boolean
          push_on_monthly_digest?: boolean
          push_on_password_reset?: boolean
          push_on_team_invite?: boolean
          push_on_welcome?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          push_on_application?: boolean
          push_on_connection?: boolean
          push_on_interview?: boolean
          push_on_job_match?: boolean
          push_on_monthly_digest?: boolean
          push_on_password_reset?: boolean
          push_on_team_invite?: boolean
          push_on_welcome?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      email_queue: {
        Row: {
          created_at: string | null
          data: Json | null
          error_message: string | null
          id: string
          max_retries: number | null
          retry_count: number | null
          sent_at: string | null
          status: string | null
          subject: string
          template: string
          to_email: string
        }
        Insert: {
          created_at?: string | null
          data?: Json | null
          error_message?: string | null
          id?: string
          max_retries?: number | null
          retry_count?: number | null
          sent_at?: string | null
          status?: string | null
          subject: string
          template: string
          to_email: string
        }
        Update: {
          created_at?: string | null
          data?: Json | null
          error_message?: string | null
          id?: string
          max_retries?: number | null
          retry_count?: number | null
          sent_at?: string | null
          status?: string | null
          subject?: string
          template?: string
          to_email?: string
        }
        Relationships: []
      }
      email_queue_simple: {
        Row: {
          created_at: string
          error_message: string | null
          html_content: string
          id: string
          max_retries: number | null
          retry_count: number | null
          sent_at: string | null
          status: string | null
          subject: string
          template_data: Json | null
          template_name: string | null
          to_email: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          html_content: string
          id?: string
          max_retries?: number | null
          retry_count?: number | null
          sent_at?: string | null
          status?: string | null
          subject: string
          template_data?: Json | null
          template_name?: string | null
          to_email: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          error_message?: string | null
          html_content?: string
          id?: string
          max_retries?: number | null
          retry_count?: number | null
          sent_at?: string | null
          status?: string | null
          subject?: string
          template_data?: Json | null
          template_name?: string | null
          to_email?: string
          updated_at?: string
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
          role: string | null
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
          role?: string | null
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
          role?: string | null
          status?: string | null
          submitted_at?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      enterprise_api_keys: {
        Row: {
          allowed_ips: string[] | null
          api_key_hash: string
          api_key_preview: string
          created_at: string | null
          created_by: string | null
          expires_at: string | null
          id: string
          is_active: boolean | null
          key_name: string
          last_used_at: string | null
          organization_id: string | null
          permissions: Json
          rate_limit_per_day: number | null
          rate_limit_per_hour: number | null
          updated_at: string | null
          usage_count: number | null
        }
        Insert: {
          allowed_ips?: string[] | null
          api_key_hash: string
          api_key_preview: string
          created_at?: string | null
          created_by?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          key_name: string
          last_used_at?: string | null
          organization_id?: string | null
          permissions?: Json
          rate_limit_per_day?: number | null
          rate_limit_per_hour?: number | null
          updated_at?: string | null
          usage_count?: number | null
        }
        Update: {
          allowed_ips?: string[] | null
          api_key_hash?: string
          api_key_preview?: string
          created_at?: string | null
          created_by?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          key_name?: string
          last_used_at?: string | null
          organization_id?: string | null
          permissions?: Json
          rate_limit_per_day?: number | null
          rate_limit_per_hour?: number | null
          updated_at?: string | null
          usage_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "enterprise_api_keys_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      enterprise_audit_logs: {
        Row: {
          action_type: string
          compliance_category: string | null
          created_at: string | null
          event_details: Json
          id: string
          ip_address: unknown | null
          organization_id: string | null
          resource_id: string | null
          resource_type: string
          retention_required: boolean | null
          risk_level: string | null
          session_id: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action_type: string
          compliance_category?: string | null
          created_at?: string | null
          event_details?: Json
          id?: string
          ip_address?: unknown | null
          organization_id?: string | null
          resource_id?: string | null
          resource_type: string
          retention_required?: boolean | null
          risk_level?: string | null
          session_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action_type?: string
          compliance_category?: string | null
          created_at?: string | null
          event_details?: Json
          id?: string
          ip_address?: unknown | null
          organization_id?: string | null
          resource_id?: string | null
          resource_type?: string
          retention_required?: boolean | null
          risk_level?: string | null
          session_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "enterprise_audit_logs_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      enterprise_integrations: {
        Row: {
          configuration: Json
          created_at: string | null
          created_by: string | null
          credentials_encrypted: string | null
          error_count: number | null
          id: string
          integration_name: string
          integration_type: string
          is_active: boolean | null
          last_error_message: string | null
          last_sync_at: string | null
          next_sync_at: string | null
          organization_id: string | null
          provider_name: string
          sync_frequency: string | null
          sync_status: string | null
          updated_at: string | null
        }
        Insert: {
          configuration?: Json
          created_at?: string | null
          created_by?: string | null
          credentials_encrypted?: string | null
          error_count?: number | null
          id?: string
          integration_name: string
          integration_type: string
          is_active?: boolean | null
          last_error_message?: string | null
          last_sync_at?: string | null
          next_sync_at?: string | null
          organization_id?: string | null
          provider_name: string
          sync_frequency?: string | null
          sync_status?: string | null
          updated_at?: string | null
        }
        Update: {
          configuration?: Json
          created_at?: string | null
          created_by?: string | null
          credentials_encrypted?: string | null
          error_count?: number | null
          id?: string
          integration_name?: string
          integration_type?: string
          is_active?: boolean | null
          last_error_message?: string | null
          last_sync_at?: string | null
          next_sync_at?: string | null
          organization_id?: string | null
          provider_name?: string
          sync_frequency?: string | null
          sync_status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "enterprise_integrations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      enterprise_webhooks: {
        Row: {
          created_at: string | null
          created_by: string | null
          endpoint_url: string
          events: string[]
          failure_count: number | null
          id: string
          is_active: boolean | null
          last_triggered_at: string | null
          name: string
          organization_id: string | null
          retry_count: number | null
          secret_token: string | null
          success_count: number | null
          timeout_seconds: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          endpoint_url: string
          events?: string[]
          failure_count?: number | null
          id?: string
          is_active?: boolean | null
          last_triggered_at?: string | null
          name: string
          organization_id?: string | null
          retry_count?: number | null
          secret_token?: string | null
          success_count?: number | null
          timeout_seconds?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          endpoint_url?: string
          events?: string[]
          failure_count?: number | null
          id?: string
          is_active?: boolean | null
          last_triggered_at?: string | null
          name?: string
          organization_id?: string | null
          retry_count?: number | null
          secret_token?: string | null
          success_count?: number | null
          timeout_seconds?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "enterprise_webhooks_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
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
      feature_flags: {
        Row: {
          created_at: string | null
          created_by: string | null
          description: string | null
          flag_name: string
          flag_type: string | null
          flag_value: Json | null
          id: string
          is_enabled: boolean | null
          rollout_percentage: number | null
          target_audience: Json | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          flag_name: string
          flag_type?: string | null
          flag_value?: Json | null
          id?: string
          is_enabled?: boolean | null
          rollout_percentage?: number | null
          target_audience?: Json | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          flag_name?: string
          flag_type?: string | null
          flag_value?: Json | null
          id?: string
          is_enabled?: boolean | null
          rollout_percentage?: number | null
          target_audience?: Json | null
          updated_at?: string | null
        }
        Relationships: []
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
      forum_memberships: {
        Row: {
          forum_id: string
          id: string
          joined_at: string | null
          role: string | null
          user_id: string
        }
        Insert: {
          forum_id: string
          id?: string
          joined_at?: string | null
          role?: string | null
          user_id: string
        }
        Update: {
          forum_id?: string
          id?: string
          joined_at?: string | null
          role?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "forum_memberships_forum_id_fkey"
            columns: ["forum_id"]
            isOneToOne: false
            referencedRelation: "discussion_forums"
            referencedColumns: ["id"]
          },
        ]
      }
      goal_communities: {
        Row: {
          cover_image_url: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          goal_type: string
          id: string
          is_active: boolean | null
          max_members: number | null
          member_count: number | null
          name: string
          tags: string[] | null
          target_outcome: string | null
          timeline_months: number | null
          updated_at: string | null
        }
        Insert: {
          cover_image_url?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          goal_type: string
          id?: string
          is_active?: boolean | null
          max_members?: number | null
          member_count?: number | null
          name: string
          tags?: string[] | null
          target_outcome?: string | null
          timeline_months?: number | null
          updated_at?: string | null
        }
        Update: {
          cover_image_url?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          goal_type?: string
          id?: string
          is_active?: boolean | null
          max_members?: number | null
          member_count?: number | null
          name?: string
          tags?: string[] | null
          target_outcome?: string | null
          timeline_months?: number | null
          updated_at?: string | null
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
      hreflang_configs: {
        Row: {
          alternate_url: string
          created_at: string
          id: string
          is_active: boolean | null
          is_default: boolean | null
          language_code: string
          page_url: string
          region_code: string | null
          updated_at: string
        }
        Insert: {
          alternate_url: string
          created_at?: string
          id?: string
          is_active?: boolean | null
          is_default?: boolean | null
          language_code: string
          page_url: string
          region_code?: string | null
          updated_at?: string
        }
        Update: {
          alternate_url?: string
          created_at?: string
          id?: string
          is_active?: boolean | null
          is_default?: boolean | null
          language_code?: string
          page_url?: string
          region_code?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      industry_skills_library: {
        Row: {
          created_at: string | null
          id: string
          industry: string
          is_active: boolean | null
          priority_level: number | null
          skill_category: string
          skill_keywords: string[] | null
          skill_name: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          industry: string
          is_active?: boolean | null
          priority_level?: number | null
          skill_category: string
          skill_keywords?: string[] | null
          skill_name: string
        }
        Update: {
          created_at?: string | null
          id?: string
          industry?: string
          is_active?: boolean | null
          priority_level?: number | null
          skill_category?: string
          skill_keywords?: string[] | null
          skill_name?: string
        }
        Relationships: []
      }
      integration_configs: {
        Row: {
          config_data: Json
          created_at: string | null
          created_by: string | null
          credentials: Json | null
          error_message: string | null
          id: string
          integration_name: string
          integration_type: string
          is_active: boolean | null
          last_sync: string | null
          sync_status: string | null
          updated_at: string | null
        }
        Insert: {
          config_data?: Json
          created_at?: string | null
          created_by?: string | null
          credentials?: Json | null
          error_message?: string | null
          id?: string
          integration_name: string
          integration_type: string
          is_active?: boolean | null
          last_sync?: string | null
          sync_status?: string | null
          updated_at?: string | null
        }
        Update: {
          config_data?: Json
          created_at?: string | null
          created_by?: string | null
          credentials?: Json | null
          error_message?: string | null
          id?: string
          integration_name?: string
          integration_type?: string
          is_active?: boolean | null
          last_sync?: string | null
          sync_status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      interests: {
        Row: {
          created_at: string | null
          id: string
          interest_items: string[] | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          interest_items?: string[] | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          interest_items?: string[] | null
          user_id?: string
        }
        Relationships: []
      }
      internal_links_optimization: {
        Row: {
          anchor_text: string
          created_at: string
          id: string
          is_follow: boolean | null
          link_type: string | null
          position_in_content: number | null
          relevance_score: number | null
          source_url: string
          target_url: string
          updated_at: string
        }
        Insert: {
          anchor_text: string
          created_at?: string
          id?: string
          is_follow?: boolean | null
          link_type?: string | null
          position_in_content?: number | null
          relevance_score?: number | null
          source_url: string
          target_url: string
          updated_at?: string
        }
        Update: {
          anchor_text?: string
          created_at?: string
          id?: string
          is_follow?: boolean | null
          link_type?: string | null
          position_in_content?: number | null
          relevance_score?: number | null
          source_url?: string
          target_url?: string
          updated_at?: string
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
      job_application_stages: {
        Row: {
          application_id: string | null
          automated: boolean | null
          id: string
          notes: string | null
          stage: string
          status_date: string | null
          updated_by: string | null
        }
        Insert: {
          application_id?: string | null
          automated?: boolean | null
          id?: string
          notes?: string | null
          stage: string
          status_date?: string | null
          updated_by?: string | null
        }
        Update: {
          application_id?: string | null
          automated?: boolean | null
          id?: string
          notes?: string | null
          stage?: string
          status_date?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "job_application_stages_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "job_applications"
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
      job_documents: {
        Row: {
          document_type: string | null
          file_url: string
          filename: string | null
          id: string
          job_id: string | null
          uploaded_at: string | null
        }
        Insert: {
          document_type?: string | null
          file_url: string
          filename?: string | null
          id?: string
          job_id?: string | null
          uploaded_at?: string | null
        }
        Update: {
          document_type?: string | null
          file_url?: string
          filename?: string | null
          id?: string
          job_id?: string | null
          uploaded_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "job_documents_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      job_matches: {
        Row: {
          created_at: string | null
          employer_id: string
          employer_swiped_at: string | null
          id: string
          is_mutual: boolean | null
          job_id: string
          match_score: number | null
          user_id: string
          user_swiped_at: string | null
        }
        Insert: {
          created_at?: string | null
          employer_id: string
          employer_swiped_at?: string | null
          id?: string
          is_mutual?: boolean | null
          job_id: string
          match_score?: number | null
          user_id: string
          user_swiped_at?: string | null
        }
        Update: {
          created_at?: string | null
          employer_id?: string
          employer_swiped_at?: string | null
          id?: string
          is_mutual?: boolean | null
          job_id?: string
          match_score?: number | null
          user_id?: string
          user_swiped_at?: string | null
        }
        Relationships: []
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
      job_skills_required: {
        Row: {
          created_at: string | null
          id: string
          is_mandatory: boolean | null
          job_id: string
          required_level: number
          skill_id: string
          weight: number | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_mandatory?: boolean | null
          job_id: string
          required_level: number
          skill_id: string
          weight?: number | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_mandatory?: boolean | null
          job_id?: string
          required_level?: number
          skill_id?: string
          weight?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "job_skills_required_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_skills_required_skill_id_fkey"
            columns: ["skill_id"]
            isOneToOne: false
            referencedRelation: "skills_master"
            referencedColumns: ["id"]
          },
        ]
      }
      job_swipes: {
        Row: {
          action: string
          created_at: string | null
          id: string
          job_id: string
          match_score: number | null
          user_id: string
        }
        Insert: {
          action: string
          created_at?: string | null
          id?: string
          job_id: string
          match_score?: number | null
          user_id: string
        }
        Update: {
          action?: string
          created_at?: string | null
          id?: string
          job_id?: string
          match_score?: number | null
          user_id?: string
        }
        Relationships: []
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
          ai_match_enabled: boolean | null
          ai_priority: boolean | null
          ai_skill_tags: string[] | null
          application_deadline: string | null
          application_method: string | null
          applications_count: number | null
          benefits: string[] | null
          benefits_offered: string[] | null
          benefits_policy_url: string | null
          category_id: string | null
          certification_required: string | null
          certifications: string[] | null
          company_id: string | null
          company_name: string
          company_size: string | null
          company_website: string | null
          contact_designation: string | null
          contact_name: string | null
          contact_person_designation: string | null
          contact_person_email: string | null
          contact_person_name: string | null
          contact_person_phone: string | null
          created_at: string | null
          description: string
          detailed_description: string | null
          education_level: string | null
          education_notes: string | null
          educational_qualification: string | null
          employment_type: string | null
          experience_level: string | null
          experience_preference: string | null
          experience_type: string | null
          expires_at: string | null
          external_url: string | null
          field_of_study: string[] | null
          id: string
          industry_domain: string | null
          is_active: boolean | null
          is_draft: boolean | null
          is_featured: boolean | null
          is_hiring_fast: boolean | null
          is_remote: boolean | null
          is_urgent: boolean | null
          jd_flyer_url: string | null
          job_description: string | null
          job_status: string | null
          job_summary: string | null
          job_title: string
          key_responsibilities: string[] | null
          location: string | null
          location_city: string | null
          location_state: string | null
          location_type: string | null
          max_education_gap: number | null
          max_experience: number | null
          maximum_experience_years: number | null
          maximum_gap_allowed: number | null
          min_experience: number | null
          minimum_education: string | null
          minimum_experience_years: number | null
          minimum_year_of_passing: number | null
          must_have_requirements: string[] | null
          nice_to_have: string[] | null
          posted_at: string | null
          posted_by: string | null
          preferred_certifications: Json | null
          preferred_certifications_list: string[] | null
          preferred_company_background: string[] | null
          preferred_company_types: string[] | null
          preferred_experience_in: string[] | null
          preferred_industries: string[] | null
          preferred_requirements: string[] | null
          relevant_industry_experience: string[] | null
          requirements: string | null
          salary_currency: string | null
          salary_max: number | null
          salary_min: number | null
          skills_required: string[] | null
          specialization_fields: string[] | null
          specific_experience_areas: string | null
          specific_tools: string[] | null
          specific_tools_domains: string | null
          supporting_documents: Json | null
          team_brochure_url: string | null
          title: string
          updated_at: string | null
          views_count: number | null
          visibility_duration_days: number | null
          visibility_status: string | null
          work_mode: string | null
          work_schedule: string | null
          year_of_passing: number | null
        }
        Insert: {
          ai_match_enabled?: boolean | null
          ai_priority?: boolean | null
          ai_skill_tags?: string[] | null
          application_deadline?: string | null
          application_method?: string | null
          applications_count?: number | null
          benefits?: string[] | null
          benefits_offered?: string[] | null
          benefits_policy_url?: string | null
          category_id?: string | null
          certification_required?: string | null
          certifications?: string[] | null
          company_id?: string | null
          company_name?: string
          company_size?: string | null
          company_website?: string | null
          contact_designation?: string | null
          contact_name?: string | null
          contact_person_designation?: string | null
          contact_person_email?: string | null
          contact_person_name?: string | null
          contact_person_phone?: string | null
          created_at?: string | null
          description: string
          detailed_description?: string | null
          education_level?: string | null
          education_notes?: string | null
          educational_qualification?: string | null
          employment_type?: string | null
          experience_level?: string | null
          experience_preference?: string | null
          experience_type?: string | null
          expires_at?: string | null
          external_url?: string | null
          field_of_study?: string[] | null
          id?: string
          industry_domain?: string | null
          is_active?: boolean | null
          is_draft?: boolean | null
          is_featured?: boolean | null
          is_hiring_fast?: boolean | null
          is_remote?: boolean | null
          is_urgent?: boolean | null
          jd_flyer_url?: string | null
          job_description?: string | null
          job_status?: string | null
          job_summary?: string | null
          job_title?: string
          key_responsibilities?: string[] | null
          location?: string | null
          location_city?: string | null
          location_state?: string | null
          location_type?: string | null
          max_education_gap?: number | null
          max_experience?: number | null
          maximum_experience_years?: number | null
          maximum_gap_allowed?: number | null
          min_experience?: number | null
          minimum_education?: string | null
          minimum_experience_years?: number | null
          minimum_year_of_passing?: number | null
          must_have_requirements?: string[] | null
          nice_to_have?: string[] | null
          posted_at?: string | null
          posted_by?: string | null
          preferred_certifications?: Json | null
          preferred_certifications_list?: string[] | null
          preferred_company_background?: string[] | null
          preferred_company_types?: string[] | null
          preferred_experience_in?: string[] | null
          preferred_industries?: string[] | null
          preferred_requirements?: string[] | null
          relevant_industry_experience?: string[] | null
          requirements?: string | null
          salary_currency?: string | null
          salary_max?: number | null
          salary_min?: number | null
          skills_required?: string[] | null
          specialization_fields?: string[] | null
          specific_experience_areas?: string | null
          specific_tools?: string[] | null
          specific_tools_domains?: string | null
          supporting_documents?: Json | null
          team_brochure_url?: string | null
          title: string
          updated_at?: string | null
          views_count?: number | null
          visibility_duration_days?: number | null
          visibility_status?: string | null
          work_mode?: string | null
          work_schedule?: string | null
          year_of_passing?: number | null
        }
        Update: {
          ai_match_enabled?: boolean | null
          ai_priority?: boolean | null
          ai_skill_tags?: string[] | null
          application_deadline?: string | null
          application_method?: string | null
          applications_count?: number | null
          benefits?: string[] | null
          benefits_offered?: string[] | null
          benefits_policy_url?: string | null
          category_id?: string | null
          certification_required?: string | null
          certifications?: string[] | null
          company_id?: string | null
          company_name?: string
          company_size?: string | null
          company_website?: string | null
          contact_designation?: string | null
          contact_name?: string | null
          contact_person_designation?: string | null
          contact_person_email?: string | null
          contact_person_name?: string | null
          contact_person_phone?: string | null
          created_at?: string | null
          description?: string
          detailed_description?: string | null
          education_level?: string | null
          education_notes?: string | null
          educational_qualification?: string | null
          employment_type?: string | null
          experience_level?: string | null
          experience_preference?: string | null
          experience_type?: string | null
          expires_at?: string | null
          external_url?: string | null
          field_of_study?: string[] | null
          id?: string
          industry_domain?: string | null
          is_active?: boolean | null
          is_draft?: boolean | null
          is_featured?: boolean | null
          is_hiring_fast?: boolean | null
          is_remote?: boolean | null
          is_urgent?: boolean | null
          jd_flyer_url?: string | null
          job_description?: string | null
          job_status?: string | null
          job_summary?: string | null
          job_title?: string
          key_responsibilities?: string[] | null
          location?: string | null
          location_city?: string | null
          location_state?: string | null
          location_type?: string | null
          max_education_gap?: number | null
          max_experience?: number | null
          maximum_experience_years?: number | null
          maximum_gap_allowed?: number | null
          min_experience?: number | null
          minimum_education?: string | null
          minimum_experience_years?: number | null
          minimum_year_of_passing?: number | null
          must_have_requirements?: string[] | null
          nice_to_have?: string[] | null
          posted_at?: string | null
          posted_by?: string | null
          preferred_certifications?: Json | null
          preferred_certifications_list?: string[] | null
          preferred_company_background?: string[] | null
          preferred_company_types?: string[] | null
          preferred_experience_in?: string[] | null
          preferred_industries?: string[] | null
          preferred_requirements?: string[] | null
          relevant_industry_experience?: string[] | null
          requirements?: string | null
          salary_currency?: string | null
          salary_max?: number | null
          salary_min?: number | null
          skills_required?: string[] | null
          specialization_fields?: string[] | null
          specific_experience_areas?: string | null
          specific_tools?: string[] | null
          specific_tools_domains?: string | null
          supporting_documents?: Json | null
          team_brochure_url?: string | null
          title?: string
          updated_at?: string | null
          views_count?: number | null
          visibility_duration_days?: number | null
          visibility_status?: string | null
          work_mode?: string | null
          work_schedule?: string | null
          year_of_passing?: number | null
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
      learning_progress: {
        Row: {
          completed_steps: string[] | null
          created_at: string
          current_step: number
          id: string
          last_accessed_at: string | null
          learning_path_id: string | null
          notes: string | null
          step_details: Json
          time_spent_minutes: number
          total_steps: number
          updated_at: string
          user_id: string
        }
        Insert: {
          completed_steps?: string[] | null
          created_at?: string
          current_step?: number
          id?: string
          last_accessed_at?: string | null
          learning_path_id?: string | null
          notes?: string | null
          step_details?: Json
          time_spent_minutes?: number
          total_steps: number
          updated_at?: string
          user_id: string
        }
        Update: {
          completed_steps?: string[] | null
          created_at?: string
          current_step?: number
          id?: string
          last_accessed_at?: string | null
          learning_path_id?: string | null
          notes?: string | null
          step_details?: Json
          time_spent_minutes?: number
          total_steps?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "learning_progress_learning_path_id_fkey"
            columns: ["learning_path_id"]
            isOneToOne: false
            referencedRelation: "learning_paths"
            referencedColumns: ["id"]
          },
        ]
      }
      marketing_campaigns: {
        Row: {
          budget: number | null
          campaign_type: string
          created_at: string
          created_by: string | null
          description: string | null
          end_date: string | null
          id: string
          metrics: Json | null
          name: string
          organization_id: string
          spent: number | null
          start_date: string | null
          status: string
          target_audience: Json | null
          updated_at: string
        }
        Insert: {
          budget?: number | null
          campaign_type?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          metrics?: Json | null
          name: string
          organization_id: string
          spent?: number | null
          start_date?: string | null
          status?: string
          target_audience?: Json | null
          updated_at?: string
        }
        Update: {
          budget?: number | null
          campaign_type?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          metrics?: Json | null
          name?: string
          organization_id?: string
          spent?: number | null
          start_date?: string | null
          status?: string
          target_audience?: Json | null
          updated_at?: string
        }
        Relationships: []
      }
      mentorship_programs: {
        Row: {
          created_at: string | null
          duration_weeks: number | null
          goals: string[] | null
          id: string
          meeting_frequency: string | null
          mentee_id: string
          mentor_id: string
          notes: string | null
          program_type: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          duration_weeks?: number | null
          goals?: string[] | null
          id?: string
          meeting_frequency?: string | null
          mentee_id: string
          mentor_id: string
          notes?: string | null
          program_type: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          duration_weeks?: number | null
          goals?: string[] | null
          id?: string
          meeting_frequency?: string | null
          mentee_id?: string
          mentor_id?: string
          notes?: string | null
          program_type?: string
          status?: string | null
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
      notification_templates: {
        Row: {
          content: string
          created_at: string | null
          created_by: string | null
          id: string
          is_active: boolean | null
          name: string
          subject: string | null
          type: string
          updated_at: string | null
          variables: Json | null
        }
        Insert: {
          content: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          subject?: string | null
          type: string
          updated_at?: string | null
          variables?: Json | null
        }
        Update: {
          content?: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          subject?: string | null
          type?: string
          updated_at?: string | null
          variables?: Json | null
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string | null
          expires_at: string | null
          icon: string | null
          id: string
          is_read: boolean | null
          link: string | null
          message: string | null
          module: string | null
          priority: string | null
          related_id: string | null
          sound: boolean | null
          title: string
          type: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          expires_at?: string | null
          icon?: string | null
          id?: string
          is_read?: boolean | null
          link?: string | null
          message?: string | null
          module?: string | null
          priority?: string | null
          related_id?: string | null
          sound?: boolean | null
          title: string
          type: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          expires_at?: string | null
          icon?: string | null
          id?: string
          is_read?: boolean | null
          link?: string | null
          message?: string | null
          module?: string | null
          priority?: string | null
          related_id?: string | null
          sound?: boolean | null
          title?: string
          type?: string
          user_id?: string | null
        }
        Relationships: []
      }
      organization_branding: {
        Row: {
          accent_color: string | null
          created_at: string | null
          created_by: string | null
          custom_css: string | null
          custom_fonts: Json | null
          dashboard_layout: Json | null
          email_footer_text: string | null
          email_header_logo: string | null
          favicon_url: string | null
          id: string
          login_page_background: string | null
          logo_dark_url: string | null
          logo_url: string | null
          organization_id: string | null
          primary_color: string | null
          secondary_color: string | null
          updated_at: string | null
        }
        Insert: {
          accent_color?: string | null
          created_at?: string | null
          created_by?: string | null
          custom_css?: string | null
          custom_fonts?: Json | null
          dashboard_layout?: Json | null
          email_footer_text?: string | null
          email_header_logo?: string | null
          favicon_url?: string | null
          id?: string
          login_page_background?: string | null
          logo_dark_url?: string | null
          logo_url?: string | null
          organization_id?: string | null
          primary_color?: string | null
          secondary_color?: string | null
          updated_at?: string | null
        }
        Update: {
          accent_color?: string | null
          created_at?: string | null
          created_by?: string | null
          custom_css?: string | null
          custom_fonts?: Json | null
          dashboard_layout?: Json | null
          email_footer_text?: string | null
          email_header_logo?: string | null
          favicon_url?: string | null
          id?: string
          login_page_background?: string | null
          logo_dark_url?: string | null
          logo_url?: string | null
          organization_id?: string | null
          primary_color?: string | null
          secondary_color?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "organization_branding_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: true
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_departments: {
        Row: {
          budget_allocation: number | null
          cost_center_code: string | null
          created_at: string | null
          created_by: string | null
          department_head_id: string | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          organization_id: string | null
          parent_department_id: string | null
          updated_at: string | null
        }
        Insert: {
          budget_allocation?: number | null
          cost_center_code?: string | null
          created_at?: string | null
          created_by?: string | null
          department_head_id?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          organization_id?: string | null
          parent_department_id?: string | null
          updated_at?: string | null
        }
        Update: {
          budget_allocation?: number | null
          cost_center_code?: string | null
          created_at?: string | null
          created_by?: string | null
          department_head_id?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          organization_id?: string | null
          parent_department_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "organization_departments_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_departments_parent_department_id_fkey"
            columns: ["parent_department_id"]
            isOneToOne: false
            referencedRelation: "organization_departments"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_members: {
        Row: {
          created_at: string
          created_by: string | null
          department_id: string | null
          hired_date: string | null
          id: string
          organization_id: string
          permissions: Json | null
          role: string
          salary: number | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          department_id?: string | null
          hired_date?: string | null
          id?: string
          organization_id: string
          permissions?: Json | null
          role?: string
          salary?: number | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          department_id?: string | null
          hired_date?: string | null
          id?: string
          organization_id?: string
          permissions?: Json | null
          role?: string
          salary?: number | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      organization_roles: {
        Row: {
          can_approve_budget: boolean | null
          created_at: string | null
          created_by: string | null
          data_access_level: string | null
          department_access: string[] | null
          id: string
          is_system_role: boolean | null
          max_approval_amount: number | null
          organization_id: string | null
          parent_role_id: string | null
          permissions: Json
          role_level: number
          role_name: string
          updated_at: string | null
        }
        Insert: {
          can_approve_budget?: boolean | null
          created_at?: string | null
          created_by?: string | null
          data_access_level?: string | null
          department_access?: string[] | null
          id?: string
          is_system_role?: boolean | null
          max_approval_amount?: number | null
          organization_id?: string | null
          parent_role_id?: string | null
          permissions?: Json
          role_level?: number
          role_name: string
          updated_at?: string | null
        }
        Update: {
          can_approve_budget?: boolean | null
          created_at?: string | null
          created_by?: string | null
          data_access_level?: string | null
          department_access?: string[] | null
          id?: string
          is_system_role?: boolean | null
          max_approval_amount?: number | null
          organization_id?: string | null
          parent_role_id?: string | null
          permissions?: Json
          role_level?: number
          role_name?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "organization_roles_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_roles_parent_role_id_fkey"
            columns: ["parent_role_id"]
            isOneToOne: false
            referencedRelation: "organization_roles"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_settings: {
        Row: {
          created_at: string | null
          created_by: string | null
          id: string
          is_encrypted: boolean | null
          organization_id: string | null
          setting_key: string
          setting_type: string | null
          setting_value: Json
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_encrypted?: boolean | null
          organization_id?: string | null
          setting_key: string
          setting_type?: string | null
          setting_value?: Json
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_encrypted?: boolean | null
          organization_id?: string | null
          setting_key?: string
          setting_type?: string | null
          setting_value?: Json
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "organization_settings_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          created_at: string | null
          created_by: string | null
          custom_domain: string | null
          description: string | null
          id: string
          is_active: boolean | null
          logo_url: string | null
          max_storage_gb: number | null
          max_users: number | null
          name: string
          slug: string
          subscription_tier: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          custom_domain?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          logo_url?: string | null
          max_storage_gb?: number | null
          max_users?: number | null
          name: string
          slug: string
          subscription_tier?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          custom_domain?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          logo_url?: string | null
          max_storage_gb?: number | null
          max_users?: number | null
          name?: string
          slug?: string
          subscription_tier?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      page_builder_pages: {
        Row: {
          created_at: string | null
          created_by: string | null
          id: string
          is_published: boolean | null
          is_template: boolean | null
          page_content: Json
          page_name: string
          page_slug: string
          page_type: string | null
          performance_score: number | null
          seo_settings: Json | null
          template_category: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_published?: boolean | null
          is_template?: boolean | null
          page_content?: Json
          page_name: string
          page_slug: string
          page_type?: string | null
          performance_score?: number | null
          seo_settings?: Json | null
          template_category?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_published?: boolean | null
          is_template?: boolean | null
          page_content?: Json
          page_name?: string
          page_slug?: string
          page_type?: string | null
          performance_score?: number | null
          seo_settings?: Json | null
          template_category?: string | null
          updated_at?: string | null
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
      performance_analytics: {
        Row: {
          device_type: string | null
          id: string
          location: string | null
          metadata: Json | null
          metric_name: string
          metric_type: string
          metric_value: number
          page_url: string | null
          timestamp: string | null
        }
        Insert: {
          device_type?: string | null
          id?: string
          location?: string | null
          metadata?: Json | null
          metric_name: string
          metric_type: string
          metric_value: number
          page_url?: string | null
          timestamp?: string | null
        }
        Update: {
          device_type?: string | null
          id?: string
          location?: string | null
          metadata?: Json | null
          metric_name?: string
          metric_type?: string
          metric_value?: number
          page_url?: string | null
          timestamp?: string | null
        }
        Relationships: []
      }
      performance_benchmarks: {
        Row: {
          benchmark_type: string
          created_at: string | null
          data_source: string | null
          id: string
          industry: string | null
          last_updated: string | null
          metric_name: string
          percentile_25: number | null
          percentile_50: number | null
          percentile_75: number | null
          percentile_90: number | null
          role_level: string | null
          sample_size: number | null
        }
        Insert: {
          benchmark_type: string
          created_at?: string | null
          data_source?: string | null
          id?: string
          industry?: string | null
          last_updated?: string | null
          metric_name: string
          percentile_25?: number | null
          percentile_50?: number | null
          percentile_75?: number | null
          percentile_90?: number | null
          role_level?: string | null
          sample_size?: number | null
        }
        Update: {
          benchmark_type?: string
          created_at?: string | null
          data_source?: string | null
          id?: string
          industry?: string | null
          last_updated?: string | null
          metric_name?: string
          percentile_25?: number | null
          percentile_50?: number | null
          percentile_75?: number | null
          percentile_90?: number | null
          role_level?: string | null
          sample_size?: number | null
        }
        Relationships: []
      }
      permission_requests: {
        Row: {
          approved_by: string | null
          company_id: string
          created_at: string | null
          expires_at: string | null
          id: string
          permission_type: string
          reason: string | null
          requested_at: string | null
          requester_id: string
          resource_id: string | null
          responded_at: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          approved_by?: string | null
          company_id: string
          created_at?: string | null
          expires_at?: string | null
          id?: string
          permission_type: string
          reason?: string | null
          requested_at?: string | null
          requester_id: string
          resource_id?: string | null
          responded_at?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          approved_by?: string | null
          company_id?: string
          created_at?: string | null
          expires_at?: string | null
          id?: string
          permission_type?: string
          reason?: string | null
          requested_at?: string | null
          requester_id?: string
          resource_id?: string | null
          responded_at?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "permission_requests_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
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
      platform_metrics: {
        Row: {
          created_at: string | null
          id: string
          metadata: Json | null
          metric_category: string
          metric_name: string
          metric_unit: string | null
          metric_value: number | null
          period_end: string
          period_start: string
          time_period: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          metadata?: Json | null
          metric_category: string
          metric_name: string
          metric_unit?: string | null
          metric_value?: number | null
          period_end: string
          period_start: string
          time_period?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          metadata?: Json | null
          metric_category?: string
          metric_name?: string
          metric_unit?: string | null
          metric_value?: number | null
          period_end?: string
          period_start?: string
          time_period?: string | null
        }
        Relationships: []
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
      post_hashtag_suggestions: {
        Row: {
          created_at: string | null
          id: string
          post_content: string | null
          post_id: string | null
          suggested_hashtags: Json | null
          updated_at: string | null
          user_id: string
          user_role: string | null
          user_skills: Json | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          post_content?: string | null
          post_id?: string | null
          suggested_hashtags?: Json | null
          updated_at?: string | null
          user_id: string
          user_role?: string | null
          user_skills?: Json | null
        }
        Update: {
          created_at?: string | null
          id?: string
          post_content?: string | null
          post_id?: string | null
          suggested_hashtags?: Json | null
          updated_at?: string | null
          user_id?: string
          user_role?: string | null
          user_skills?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "post_hashtag_suggestions_post_id_fkey"
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
          article_category: string | null
          author_id: string | null
          comments_count: number | null
          content: string
          content_type: string | null
          created_at: string | null
          featured_image_url: string | null
          headline: string | null
          id: string
          intent_tags: string[] | null
          is_public: boolean | null
          likes_count: number | null
          location: string | null
          media_urls: string[] | null
          post_type: string | null
          preview_url: string | null
          reading_time: number | null
          shares_count: number | null
          status: string | null
          tagline: string | null
          tags: string[] | null
          updated_at: string | null
          word_count: number | null
        }
        Insert: {
          article_category?: string | null
          author_id?: string | null
          comments_count?: number | null
          content: string
          content_type?: string | null
          created_at?: string | null
          featured_image_url?: string | null
          headline?: string | null
          id?: string
          intent_tags?: string[] | null
          is_public?: boolean | null
          likes_count?: number | null
          location?: string | null
          media_urls?: string[] | null
          post_type?: string | null
          preview_url?: string | null
          reading_time?: number | null
          shares_count?: number | null
          status?: string | null
          tagline?: string | null
          tags?: string[] | null
          updated_at?: string | null
          word_count?: number | null
        }
        Update: {
          article_category?: string | null
          author_id?: string | null
          comments_count?: number | null
          content?: string
          content_type?: string | null
          created_at?: string | null
          featured_image_url?: string | null
          headline?: string | null
          id?: string
          intent_tags?: string[] | null
          is_public?: boolean | null
          likes_count?: number | null
          location?: string | null
          media_urls?: string[] | null
          post_type?: string | null
          preview_url?: string | null
          reading_time?: number | null
          shares_count?: number | null
          status?: string | null
          tagline?: string | null
          tags?: string[] | null
          updated_at?: string | null
          word_count?: number | null
        }
        Relationships: []
      }
      posts_ai_scores: {
        Row: {
          created_at: string | null
          cta_strength: number | null
          hashtag_relevance: number | null
          id: string
          post_id: string | null
          score: number | null
          tone: string | null
          updated_at: string | null
          user_id: string
          virality_potential: string | null
        }
        Insert: {
          created_at?: string | null
          cta_strength?: number | null
          hashtag_relevance?: number | null
          id?: string
          post_id?: string | null
          score?: number | null
          tone?: string | null
          updated_at?: string | null
          user_id: string
          virality_potential?: string | null
        }
        Update: {
          created_at?: string | null
          cta_strength?: number | null
          hashtag_relevance?: number | null
          id?: string
          post_id?: string | null
          score?: number | null
          tone?: string | null
          updated_at?: string | null
          user_id?: string
          virality_potential?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "posts_ai_scores_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
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
      pro_analytics: {
        Row: {
          avg_response_time_hours: number | null
          bookings_count: number | null
          churn_rate: number | null
          client_acquisition_cost: number | null
          client_satisfaction: number | null
          conversion_rate: number | null
          created_at: string
          customer_lifetime_value: number | null
          date: string
          id: string
          inquiries_count: number | null
          monthly_recurring_revenue: number | null
          portfolio_views: number | null
          profile_id: string
          referral_source: Json | null
          revenue: number | null
          service_id: string | null
          service_inquiries: number | null
          unique_visitors: number | null
          views_count: number | null
        }
        Insert: {
          avg_response_time_hours?: number | null
          bookings_count?: number | null
          churn_rate?: number | null
          client_acquisition_cost?: number | null
          client_satisfaction?: number | null
          conversion_rate?: number | null
          created_at?: string
          customer_lifetime_value?: number | null
          date: string
          id?: string
          inquiries_count?: number | null
          monthly_recurring_revenue?: number | null
          portfolio_views?: number | null
          profile_id: string
          referral_source?: Json | null
          revenue?: number | null
          service_id?: string | null
          service_inquiries?: number | null
          unique_visitors?: number | null
          views_count?: number | null
        }
        Update: {
          avg_response_time_hours?: number | null
          bookings_count?: number | null
          churn_rate?: number | null
          client_acquisition_cost?: number | null
          client_satisfaction?: number | null
          conversion_rate?: number | null
          created_at?: string
          customer_lifetime_value?: number | null
          date?: string
          id?: string
          inquiries_count?: number | null
          monthly_recurring_revenue?: number | null
          portfolio_views?: number | null
          profile_id?: string
          referral_source?: Json | null
          revenue?: number | null
          service_id?: string | null
          service_inquiries?: number | null
          unique_visitors?: number | null
          views_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "pro_analytics_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "pro_service_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pro_analytics_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "pro_services"
            referencedColumns: ["id"]
          },
        ]
      }
      pro_client_feedback: {
        Row: {
          client_id: string | null
          communication_rating: number | null
          contract_id: string | null
          created_at: string | null
          id: string
          is_public: boolean | null
          profile_id: string | null
          rating: number | null
          responded_at: string | null
          response_from_provider: string | null
          review: string | null
          service_quality_rating: number | null
          timeliness_rating: number | null
          updated_at: string | null
          would_recommend: boolean | null
        }
        Insert: {
          client_id?: string | null
          communication_rating?: number | null
          contract_id?: string | null
          created_at?: string | null
          id?: string
          is_public?: boolean | null
          profile_id?: string | null
          rating?: number | null
          responded_at?: string | null
          response_from_provider?: string | null
          review?: string | null
          service_quality_rating?: number | null
          timeliness_rating?: number | null
          updated_at?: string | null
          would_recommend?: boolean | null
        }
        Update: {
          client_id?: string | null
          communication_rating?: number | null
          contract_id?: string | null
          created_at?: string | null
          id?: string
          is_public?: boolean | null
          profile_id?: string | null
          rating?: number | null
          responded_at?: string | null
          response_from_provider?: string | null
          review?: string | null
          service_quality_rating?: number | null
          timeliness_rating?: number | null
          updated_at?: string | null
          would_recommend?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "pro_client_feedback_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pro_client_feedback_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "pro_contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pro_client_feedback_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "pro_service_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      pro_client_notes: {
        Row: {
          content: string
          contract_id: string | null
          created_at: string | null
          id: string
          is_private: boolean | null
          lead_id: string | null
          note_type: string | null
          profile_id: string | null
          reminder_date: string | null
          tags: string[] | null
          title: string | null
          updated_at: string | null
        }
        Insert: {
          content: string
          contract_id?: string | null
          created_at?: string | null
          id?: string
          is_private?: boolean | null
          lead_id?: string | null
          note_type?: string | null
          profile_id?: string | null
          reminder_date?: string | null
          tags?: string[] | null
          title?: string | null
          updated_at?: string | null
        }
        Update: {
          content?: string
          contract_id?: string | null
          created_at?: string | null
          id?: string
          is_private?: boolean | null
          lead_id?: string | null
          note_type?: string | null
          profile_id?: string | null
          reminder_date?: string | null
          tags?: string[] | null
          title?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pro_client_notes_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "pro_contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pro_client_notes_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "pro_leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pro_client_notes_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "pro_service_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      pro_communications: {
        Row: {
          communication_type: string
          completed_at: string | null
          content: string | null
          contract_id: string | null
          created_at: string | null
          direction: string
          id: string
          lead_id: string | null
          metadata: Json | null
          profile_id: string | null
          scheduled_at: string | null
          status: string | null
          subject: string | null
          updated_at: string | null
        }
        Insert: {
          communication_type: string
          completed_at?: string | null
          content?: string | null
          contract_id?: string | null
          created_at?: string | null
          direction: string
          id?: string
          lead_id?: string | null
          metadata?: Json | null
          profile_id?: string | null
          scheduled_at?: string | null
          status?: string | null
          subject?: string | null
          updated_at?: string | null
        }
        Update: {
          communication_type?: string
          completed_at?: string | null
          content?: string | null
          contract_id?: string | null
          created_at?: string | null
          direction?: string
          id?: string
          lead_id?: string | null
          metadata?: Json | null
          profile_id?: string | null
          scheduled_at?: string | null
          status?: string | null
          subject?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pro_communications_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "pro_contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pro_communications_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "pro_leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pro_communications_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "pro_service_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      pro_contracts: {
        Row: {
          booking_id: string | null
          client_id: string | null
          client_signature: string | null
          content: string
          contract_type: string | null
          created_at: string
          deliverables: Json | null
          expiry_date: string | null
          id: string
          payment_terms: string | null
          profile_id: string
          provider_signature: string | null
          signed_date: string | null
          status: string | null
          template_used: string | null
          terms_conditions: string | null
          title: string
          total_value: number | null
          updated_at: string
        }
        Insert: {
          booking_id?: string | null
          client_id?: string | null
          client_signature?: string | null
          content: string
          contract_type?: string | null
          created_at?: string
          deliverables?: Json | null
          expiry_date?: string | null
          id?: string
          payment_terms?: string | null
          profile_id: string
          provider_signature?: string | null
          signed_date?: string | null
          status?: string | null
          template_used?: string | null
          terms_conditions?: string | null
          title: string
          total_value?: number | null
          updated_at?: string
        }
        Update: {
          booking_id?: string | null
          client_id?: string | null
          client_signature?: string | null
          content?: string
          contract_type?: string | null
          created_at?: string
          deliverables?: Json | null
          expiry_date?: string | null
          id?: string
          payment_terms?: string | null
          profile_id?: string
          provider_signature?: string | null
          signed_date?: string | null
          status?: string | null
          template_used?: string | null
          terms_conditions?: string | null
          title?: string
          total_value?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "pro_contracts_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "pro_service_bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pro_contracts_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "pro_service_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      pro_deliverables: {
        Row: {
          access_expires_at: string | null
          booking_id: string | null
          contract_id: string
          created_at: string
          description: string | null
          download_count: number | null
          file_name: string | null
          file_size_mb: number | null
          file_type: string | null
          file_url: string | null
          id: string
          is_downloadable: boolean | null
          title: string
          updated_at: string
        }
        Insert: {
          access_expires_at?: string | null
          booking_id?: string | null
          contract_id: string
          created_at?: string
          description?: string | null
          download_count?: number | null
          file_name?: string | null
          file_size_mb?: number | null
          file_type?: string | null
          file_url?: string | null
          id?: string
          is_downloadable?: boolean | null
          title: string
          updated_at?: string
        }
        Update: {
          access_expires_at?: string | null
          booking_id?: string | null
          contract_id?: string
          created_at?: string
          description?: string | null
          download_count?: number | null
          file_name?: string | null
          file_size_mb?: number | null
          file_type?: string | null
          file_url?: string | null
          id?: string
          is_downloadable?: boolean | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "pro_deliverables_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "pro_service_bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pro_deliverables_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "pro_contracts"
            referencedColumns: ["id"]
          },
        ]
      }
      pro_lead_scoring: {
        Row: {
          created_at: string | null
          factors: Json | null
          id: string
          lead_id: string | null
          score: number | null
          scoring_date: string | null
        }
        Insert: {
          created_at?: string | null
          factors?: Json | null
          id?: string
          lead_id?: string | null
          score?: number | null
          scoring_date?: string | null
        }
        Update: {
          created_at?: string | null
          factors?: Json | null
          id?: string
          lead_id?: string | null
          score?: number | null
          scoring_date?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pro_lead_scoring_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "pro_leads"
            referencedColumns: ["id"]
          },
        ]
      }
      pro_leads: {
        Row: {
          ai_lead_score: number | null
          assigned_to: string | null
          booking_id: string | null
          client_email: string
          client_name: string
          client_phone: string | null
          company: string | null
          created_at: string
          estimated_value: number | null
          id: string
          interaction_history: Json | null
          last_contact_date: string | null
          next_follow_up: string | null
          notes: string | null
          priority: string | null
          probability: number | null
          profile_id: string
          source: string | null
          status: string | null
          tags: string[] | null
          updated_at: string
        }
        Insert: {
          ai_lead_score?: number | null
          assigned_to?: string | null
          booking_id?: string | null
          client_email: string
          client_name: string
          client_phone?: string | null
          company?: string | null
          created_at?: string
          estimated_value?: number | null
          id?: string
          interaction_history?: Json | null
          last_contact_date?: string | null
          next_follow_up?: string | null
          notes?: string | null
          priority?: string | null
          probability?: number | null
          profile_id: string
          source?: string | null
          status?: string | null
          tags?: string[] | null
          updated_at?: string
        }
        Update: {
          ai_lead_score?: number | null
          assigned_to?: string | null
          booking_id?: string | null
          client_email?: string
          client_name?: string
          client_phone?: string | null
          company?: string | null
          created_at?: string
          estimated_value?: number | null
          id?: string
          interaction_history?: Json | null
          last_contact_date?: string | null
          next_follow_up?: string | null
          notes?: string | null
          priority?: string | null
          probability?: number | null
          profile_id?: string
          source?: string | null
          status?: string | null
          tags?: string[] | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "pro_leads_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "pro_service_bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pro_leads_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "pro_service_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      pro_performance_metrics: {
        Row: {
          comparison_period: string | null
          created_at: string | null
          id: string
          metadata: Json | null
          metric_date: string | null
          metric_type: string
          metric_value: number
          profile_id: string | null
        }
        Insert: {
          comparison_period?: string | null
          created_at?: string | null
          id?: string
          metadata?: Json | null
          metric_date?: string | null
          metric_type: string
          metric_value: number
          profile_id?: string | null
        }
        Update: {
          comparison_period?: string | null
          created_at?: string | null
          id?: string
          metadata?: Json | null
          metric_date?: string | null
          metric_type?: string
          metric_value?: number
          profile_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pro_performance_metrics_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "pro_service_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      pro_portfolios: {
        Row: {
          created_at: string
          description: string | null
          display_order: number | null
          external_url: string | null
          file_size_mb: number | null
          file_url: string | null
          id: string
          is_featured: boolean | null
          metadata: Json | null
          profile_id: string
          service_id: string | null
          tags: string[] | null
          thumbnail_url: string | null
          title: string
          type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          display_order?: number | null
          external_url?: string | null
          file_size_mb?: number | null
          file_url?: string | null
          id?: string
          is_featured?: boolean | null
          metadata?: Json | null
          profile_id: string
          service_id?: string | null
          tags?: string[] | null
          thumbnail_url?: string | null
          title: string
          type: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          display_order?: number | null
          external_url?: string | null
          file_size_mb?: number | null
          file_url?: string | null
          id?: string
          is_featured?: boolean | null
          metadata?: Json | null
          profile_id?: string
          service_id?: string | null
          tags?: string[] | null
          thumbnail_url?: string | null
          title?: string
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "pro_portfolios_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "pro_service_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pro_portfolios_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "pro_services"
            referencedColumns: ["id"]
          },
        ]
      }
      pro_service_bookings: {
        Row: {
          ai_lead_score: number | null
          booking_type: string | null
          client_email: string
          client_id: string | null
          client_name: string
          client_phone: string | null
          contract_id: string | null
          created_at: string
          deposit_amount: number | null
          duration_hours: number | null
          follow_up_date: string | null
          id: string
          message: string | null
          notes: string | null
          payment_id: string | null
          payment_status: string | null
          pricing_selected: Json | null
          priority: string | null
          requirements: Json | null
          scheduled_date: string | null
          service_id: string
          source: string | null
          status: string | null
          total_amount: number | null
          updated_at: string
        }
        Insert: {
          ai_lead_score?: number | null
          booking_type?: string | null
          client_email: string
          client_id?: string | null
          client_name: string
          client_phone?: string | null
          contract_id?: string | null
          created_at?: string
          deposit_amount?: number | null
          duration_hours?: number | null
          follow_up_date?: string | null
          id?: string
          message?: string | null
          notes?: string | null
          payment_id?: string | null
          payment_status?: string | null
          pricing_selected?: Json | null
          priority?: string | null
          requirements?: Json | null
          scheduled_date?: string | null
          service_id: string
          source?: string | null
          status?: string | null
          total_amount?: number | null
          updated_at?: string
        }
        Update: {
          ai_lead_score?: number | null
          booking_type?: string | null
          client_email?: string
          client_id?: string | null
          client_name?: string
          client_phone?: string | null
          contract_id?: string | null
          created_at?: string
          deposit_amount?: number | null
          duration_hours?: number | null
          follow_up_date?: string | null
          id?: string
          message?: string | null
          notes?: string | null
          payment_id?: string | null
          payment_status?: string | null
          pricing_selected?: Json | null
          priority?: string | null
          requirements?: Json | null
          scheduled_date?: string | null
          service_id?: string
          source?: string | null
          status?: string | null
          total_amount?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "pro_service_bookings_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "pro_services"
            referencedColumns: ["id"]
          },
        ]
      }
      pro_service_profiles: {
        Row: {
          availability_hours: Json | null
          average_rating: number | null
          bio: string | null
          business_name: string | null
          contact_email: string | null
          contact_phone: string | null
          cover_image_url: string | null
          created_at: string
          custom_branding: Json | null
          id: string
          is_active: boolean | null
          is_verified: boolean | null
          location: string | null
          logo_url: string | null
          profile_slug: string
          response_time_hours: number | null
          social_links: Json | null
          subscription_tier: string | null
          timezone: string | null
          total_bookings: number | null
          total_reviews: number | null
          updated_at: string
          user_id: string
          video_bio_url: string | null
          website_url: string | null
        }
        Insert: {
          availability_hours?: Json | null
          average_rating?: number | null
          bio?: string | null
          business_name?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          cover_image_url?: string | null
          created_at?: string
          custom_branding?: Json | null
          id?: string
          is_active?: boolean | null
          is_verified?: boolean | null
          location?: string | null
          logo_url?: string | null
          profile_slug: string
          response_time_hours?: number | null
          social_links?: Json | null
          subscription_tier?: string | null
          timezone?: string | null
          total_bookings?: number | null
          total_reviews?: number | null
          updated_at?: string
          user_id: string
          video_bio_url?: string | null
          website_url?: string | null
        }
        Update: {
          availability_hours?: Json | null
          average_rating?: number | null
          bio?: string | null
          business_name?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          cover_image_url?: string | null
          created_at?: string
          custom_branding?: Json | null
          id?: string
          is_active?: boolean | null
          is_verified?: boolean | null
          location?: string | null
          logo_url?: string | null
          profile_slug?: string
          response_time_hours?: number | null
          social_links?: Json | null
          subscription_tier?: string | null
          timezone?: string | null
          total_bookings?: number | null
          total_reviews?: number | null
          updated_at?: string
          user_id?: string
          video_bio_url?: string | null
          website_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_pro_service_profiles_user_id"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pro_service_profiles_subscription_tier_fkey"
            columns: ["subscription_tier"]
            isOneToOne: false
            referencedRelation: "pro_subscription_tiers"
            referencedColumns: ["name"]
          },
        ]
      }
      pro_services: {
        Row: {
          base_price: number | null
          booking_enabled: boolean | null
          bookings_count: number | null
          category: string
          conversion_rate: number | null
          created_at: string
          delivery_time_days: number | null
          description: string
          hourly_rate: number | null
          id: string
          inquiries_count: number | null
          instant_booking: boolean | null
          is_active: boolean | null
          is_featured: boolean | null
          pricing_tiers: Json | null
          pricing_type: string | null
          profile_id: string
          requirements: string | null
          revisions_included: number | null
          seo_description: string | null
          seo_title: string | null
          service_type: string | null
          subcategory: string | null
          tags: string[] | null
          title: string
          updated_at: string
          views_count: number | null
          what_included: string[] | null
          what_not_included: string[] | null
        }
        Insert: {
          base_price?: number | null
          booking_enabled?: boolean | null
          bookings_count?: number | null
          category: string
          conversion_rate?: number | null
          created_at?: string
          delivery_time_days?: number | null
          description: string
          hourly_rate?: number | null
          id?: string
          inquiries_count?: number | null
          instant_booking?: boolean | null
          is_active?: boolean | null
          is_featured?: boolean | null
          pricing_tiers?: Json | null
          pricing_type?: string | null
          profile_id: string
          requirements?: string | null
          revisions_included?: number | null
          seo_description?: string | null
          seo_title?: string | null
          service_type?: string | null
          subcategory?: string | null
          tags?: string[] | null
          title: string
          updated_at?: string
          views_count?: number | null
          what_included?: string[] | null
          what_not_included?: string[] | null
        }
        Update: {
          base_price?: number | null
          booking_enabled?: boolean | null
          bookings_count?: number | null
          category?: string
          conversion_rate?: number | null
          created_at?: string
          delivery_time_days?: number | null
          description?: string
          hourly_rate?: number | null
          id?: string
          inquiries_count?: number | null
          instant_booking?: boolean | null
          is_active?: boolean | null
          is_featured?: boolean | null
          pricing_tiers?: Json | null
          pricing_type?: string | null
          profile_id?: string
          requirements?: string | null
          revisions_included?: number | null
          seo_description?: string | null
          seo_title?: string | null
          service_type?: string | null
          subcategory?: string | null
          tags?: string[] | null
          title?: string
          updated_at?: string
          views_count?: number | null
          what_included?: string[] | null
          what_not_included?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "pro_services_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "pro_service_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      pro_subscription_tiers: {
        Row: {
          created_at: string
          features: Json
          has_ai_tools: boolean | null
          has_analytics: boolean | null
          has_branding: boolean | null
          has_contracts: boolean | null
          has_crm: boolean | null
          has_payments: boolean | null
          id: string
          is_active: boolean | null
          marketplace_priority: number | null
          max_services: number | null
          name: string
          price_monthly: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          features?: Json
          has_ai_tools?: boolean | null
          has_analytics?: boolean | null
          has_branding?: boolean | null
          has_contracts?: boolean | null
          has_crm?: boolean | null
          has_payments?: boolean | null
          id?: string
          is_active?: boolean | null
          marketplace_priority?: number | null
          max_services?: number | null
          name: string
          price_monthly: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          features?: Json
          has_ai_tools?: boolean | null
          has_analytics?: boolean | null
          has_branding?: boolean | null
          has_contracts?: boolean | null
          has_crm?: boolean | null
          has_payments?: boolean | null
          id?: string
          is_active?: boolean | null
          marketplace_priority?: number | null
          max_services?: number | null
          name?: string
          price_monthly?: number
          updated_at?: string
        }
        Relationships: []
      }
      pro_subscriptions: {
        Row: {
          created_at: string | null
          currency: string
          expires_at: string | null
          features: Json | null
          id: string
          plan_name: string
          price_amount: number
          razorpay_payment_id: string | null
          razorpay_subscription_id: string | null
          started_at: string | null
          status: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          currency?: string
          expires_at?: string | null
          features?: Json | null
          id?: string
          plan_name: string
          price_amount: number
          razorpay_payment_id?: string | null
          razorpay_subscription_id?: string | null
          started_at?: string | null
          status?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          currency?: string
          expires_at?: string | null
          features?: Json | null
          id?: string
          plan_name?: string
          price_amount?: number
          razorpay_payment_id?: string | null
          razorpay_subscription_id?: string | null
          started_at?: string | null
          status?: string
          updated_at?: string | null
          user_id?: string
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
          banner_url: string | null
          career_goals: string[] | null
          career_interests: string[] | null
          career_stage: string | null
          cover_image_url: string | null
          created_at: string | null
          current_company: string | null
          custom_logo_url: string | null
          custom_profile_url: string | null
          custom_theme: Json | null
          email: string | null
          employer_status: string | null
          experience_years: number | null
          first_login: boolean | null
          full_name: string | null
          github_url: string | null
          headline: string | null
          id: string
          industry: string | null
          is_employer: boolean | null
          is_profile_public: boolean | null
          is_viewing_private: boolean | null
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
          pro_expires_at: string | null
          pro_plan: string | null
          pro_status: string | null
          profile_completed: boolean | null
          profile_photo_url: string | null
          profile_picture_url: string | null
          profile_views_count: number | null
          profile_visibility: string | null
          provider: string | null
          resume_url: string | null
          skills: string[] | null
          social_links: Json | null
          testimonials_count: number | null
          title: string | null
          updated_at: string | null
          user_role: Database["public"]["Enums"]["user_role"] | null
          vanity_url: string | null
          verification_badges: Json | null
          verification_status: string | null
          video_bio_url: string | null
          video_resume_url: string | null
          website: string | null
          work_experiences: Json | null
        }
        Insert: {
          about?: string | null
          allow_profile_sharing?: boolean | null
          banner_url?: string | null
          career_goals?: string[] | null
          career_interests?: string[] | null
          career_stage?: string | null
          cover_image_url?: string | null
          created_at?: string | null
          current_company?: string | null
          custom_logo_url?: string | null
          custom_profile_url?: string | null
          custom_theme?: Json | null
          email?: string | null
          employer_status?: string | null
          experience_years?: number | null
          first_login?: boolean | null
          full_name?: string | null
          github_url?: string | null
          headline?: string | null
          id: string
          industry?: string | null
          is_employer?: boolean | null
          is_profile_public?: boolean | null
          is_viewing_private?: boolean | null
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
          pro_expires_at?: string | null
          pro_plan?: string | null
          pro_status?: string | null
          profile_completed?: boolean | null
          profile_photo_url?: string | null
          profile_picture_url?: string | null
          profile_views_count?: number | null
          profile_visibility?: string | null
          provider?: string | null
          resume_url?: string | null
          skills?: string[] | null
          social_links?: Json | null
          testimonials_count?: number | null
          title?: string | null
          updated_at?: string | null
          user_role?: Database["public"]["Enums"]["user_role"] | null
          vanity_url?: string | null
          verification_badges?: Json | null
          verification_status?: string | null
          video_bio_url?: string | null
          video_resume_url?: string | null
          website?: string | null
          work_experiences?: Json | null
        }
        Update: {
          about?: string | null
          allow_profile_sharing?: boolean | null
          banner_url?: string | null
          career_goals?: string[] | null
          career_interests?: string[] | null
          career_stage?: string | null
          cover_image_url?: string | null
          created_at?: string | null
          current_company?: string | null
          custom_logo_url?: string | null
          custom_profile_url?: string | null
          custom_theme?: Json | null
          email?: string | null
          employer_status?: string | null
          experience_years?: number | null
          first_login?: boolean | null
          full_name?: string | null
          github_url?: string | null
          headline?: string | null
          id?: string
          industry?: string | null
          is_employer?: boolean | null
          is_profile_public?: boolean | null
          is_viewing_private?: boolean | null
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
          pro_expires_at?: string | null
          pro_plan?: string | null
          pro_status?: string | null
          profile_completed?: boolean | null
          profile_photo_url?: string | null
          profile_picture_url?: string | null
          profile_views_count?: number | null
          profile_visibility?: string | null
          provider?: string | null
          resume_url?: string | null
          skills?: string[] | null
          social_links?: Json | null
          testimonials_count?: number | null
          title?: string | null
          updated_at?: string | null
          user_role?: Database["public"]["Enums"]["user_role"] | null
          vanity_url?: string | null
          verification_badges?: Json | null
          verification_status?: string | null
          video_bio_url?: string | null
          video_resume_url?: string | null
          website?: string | null
          work_experiences?: Json | null
        }
        Relationships: []
      }
      projects: {
        Row: {
          created_at: string | null
          description: string | null
          github_link: string | null
          id: string
          project_title: string | null
          technologies_used: string[] | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          github_link?: string | null
          id?: string
          project_title?: string | null
          technologies_used?: string[] | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          github_link?: string | null
          id?: string
          project_title?: string | null
          technologies_used?: string[] | null
          user_id?: string
        }
        Relationships: []
      }
      public_post_views: {
        Row: {
          country_code: string | null
          device_type: string | null
          id: string
          post_id: string
          referrer: string | null
          session_id: string | null
          user_agent: string | null
          viewed_at: string
          viewer_ip: unknown | null
        }
        Insert: {
          country_code?: string | null
          device_type?: string | null
          id?: string
          post_id: string
          referrer?: string | null
          session_id?: string | null
          user_agent?: string | null
          viewed_at?: string
          viewer_ip?: unknown | null
        }
        Update: {
          country_code?: string | null
          device_type?: string | null
          id?: string
          post_id?: string
          referrer?: string | null
          session_id?: string | null
          user_agent?: string | null
          viewed_at?: string
          viewer_ip?: unknown | null
        }
        Relationships: [
          {
            foreignKeyName: "public_post_views_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      publications: {
        Row: {
          created_at: string | null
          id: string
          link: string | null
          publication_date: string | null
          publication_source: string | null
          title: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          link?: string | null
          publication_date?: string | null
          publication_source?: string | null
          title?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          link?: string | null
          publication_date?: string | null
          publication_source?: string | null
          title?: string | null
          user_id?: string
        }
        Relationships: []
      }
      push_notification_history: {
        Row: {
          body: string
          created_at: string
          data: Json | null
          id: string
          platform: string
          sent_at: string | null
          status: string
          title: string
          trigger_type: string | null
          user_id: string
        }
        Insert: {
          body: string
          created_at?: string
          data?: Json | null
          id?: string
          platform: string
          sent_at?: string | null
          status?: string
          title: string
          trigger_type?: string | null
          user_id: string
        }
        Update: {
          body?: string
          created_at?: string
          data?: Json | null
          id?: string
          platform?: string
          sent_at?: string | null
          status?: string
          title?: string
          trigger_type?: string | null
          user_id?: string
        }
        Relationships: []
      }
      references_info: {
        Row: {
          contact_info: string | null
          created_at: string | null
          id: string
          reference_name: string | null
          title: string | null
          user_id: string
        }
        Insert: {
          contact_info?: string | null
          created_at?: string | null
          id?: string
          reference_name?: string | null
          title?: string | null
          user_id: string
        }
        Update: {
          contact_info?: string | null
          created_at?: string | null
          id?: string
          reference_name?: string | null
          title?: string | null
          user_id?: string
        }
        Relationships: []
      }
      reports: {
        Row: {
          created_at: string | null
          created_by: string
          data: Json | null
          description: string | null
          file_url: string | null
          format: string | null
          id: string
          is_scheduled: boolean | null
          parameters: Json | null
          report_type: string
          schedule_frequency: string | null
          status: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by: string
          data?: Json | null
          description?: string | null
          file_url?: string | null
          format?: string | null
          id?: string
          is_scheduled?: boolean | null
          parameters?: Json | null
          report_type: string
          schedule_frequency?: string | null
          status?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string
          data?: Json | null
          description?: string | null
          file_url?: string | null
          format?: string | null
          id?: string
          is_scheduled?: boolean | null
          parameters?: Json | null
          report_type?: string
          schedule_frequency?: string | null
          status?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      resume_ab_results: {
        Row: {
          id: string
          metric_type: string
          metric_value: number
          recorded_at: string | null
          test_id: string | null
          variant: string
        }
        Insert: {
          id?: string
          metric_type: string
          metric_value: number
          recorded_at?: string | null
          test_id?: string | null
          variant: string
        }
        Update: {
          id?: string
          metric_type?: string
          metric_value?: number
          recorded_at?: string | null
          test_id?: string | null
          variant?: string
        }
        Relationships: [
          {
            foreignKeyName: "resume_ab_results_test_id_fkey"
            columns: ["test_id"]
            isOneToOne: false
            referencedRelation: "resume_ab_tests"
            referencedColumns: ["id"]
          },
        ]
      }
      resume_ab_tests: {
        Row: {
          created_at: string | null
          end_date: string | null
          id: string
          resume_id: string | null
          start_date: string | null
          status: string | null
          test_name: string
          traffic_split: number | null
          user_id: string
          variant_a: Json
          variant_b: Json
          winner_variant: string | null
        }
        Insert: {
          created_at?: string | null
          end_date?: string | null
          id?: string
          resume_id?: string | null
          start_date?: string | null
          status?: string | null
          test_name: string
          traffic_split?: number | null
          user_id: string
          variant_a: Json
          variant_b: Json
          winner_variant?: string | null
        }
        Update: {
          created_at?: string | null
          end_date?: string | null
          id?: string
          resume_id?: string | null
          start_date?: string | null
          status?: string | null
          test_name?: string
          traffic_split?: number | null
          user_id?: string
          variant_a?: Json
          variant_b?: Json
          winner_variant?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "resume_ab_tests_resume_id_fkey"
            columns: ["resume_id"]
            isOneToOne: false
            referencedRelation: "ai_resumes"
            referencedColumns: ["id"]
          },
        ]
      }
      resume_analytics: {
        Row: {
          created_at: string | null
          event_data: Json | null
          event_type: string
          id: string
          ip_address: unknown | null
          job_id: string | null
          location: string | null
          metadata: Json | null
          referrer: string | null
          resume_id: string
          source: string | null
          user_agent: string | null
          viewer_id: string | null
        }
        Insert: {
          created_at?: string | null
          event_data?: Json | null
          event_type: string
          id?: string
          ip_address?: unknown | null
          job_id?: string | null
          location?: string | null
          metadata?: Json | null
          referrer?: string | null
          resume_id: string
          source?: string | null
          user_agent?: string | null
          viewer_id?: string | null
        }
        Update: {
          created_at?: string | null
          event_data?: Json | null
          event_type?: string
          id?: string
          ip_address?: unknown | null
          job_id?: string | null
          location?: string | null
          metadata?: Json | null
          referrer?: string | null
          resume_id?: string
          source?: string | null
          user_agent?: string | null
          viewer_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "resume_analytics_resume_id_fkey"
            columns: ["resume_id"]
            isOneToOne: false
            referencedRelation: "resumes"
            referencedColumns: ["id"]
          },
        ]
      }
      resume_ats_analysis: {
        Row: {
          analyzed_at: string | null
          content_score: number | null
          expires_at: string | null
          flagged_issues: Json | null
          formatting_score: number | null
          id: string
          job_description_id: string | null
          keyword_score: number | null
          missing_keywords: Json | null
          overall_score: number
          recommendations: Json | null
          resume_id: string
        }
        Insert: {
          analyzed_at?: string | null
          content_score?: number | null
          expires_at?: string | null
          flagged_issues?: Json | null
          formatting_score?: number | null
          id?: string
          job_description_id?: string | null
          keyword_score?: number | null
          missing_keywords?: Json | null
          overall_score?: number
          recommendations?: Json | null
          resume_id: string
        }
        Update: {
          analyzed_at?: string | null
          content_score?: number | null
          expires_at?: string | null
          flagged_issues?: Json | null
          formatting_score?: number | null
          id?: string
          job_description_id?: string | null
          keyword_score?: number | null
          missing_keywords?: Json | null
          overall_score?: number
          recommendations?: Json | null
          resume_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "resume_ats_analysis_resume_id_fkey"
            columns: ["resume_id"]
            isOneToOne: false
            referencedRelation: "resumes"
            referencedColumns: ["id"]
          },
        ]
      }
      resume_ats_optimization: {
        Row: {
          created_at: string | null
          id: string
          issues_found: Json | null
          keywords_matched: string[] | null
          missing_keywords: string[] | null
          optimization_score: number | null
          optimization_status: string | null
          optimized_content: Json | null
          parsed_resume_id: string | null
          resume_id: string | null
          suggestions: Json | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          issues_found?: Json | null
          keywords_matched?: string[] | null
          missing_keywords?: string[] | null
          optimization_score?: number | null
          optimization_status?: string | null
          optimized_content?: Json | null
          parsed_resume_id?: string | null
          resume_id?: string | null
          suggestions?: Json | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          issues_found?: Json | null
          keywords_matched?: string[] | null
          missing_keywords?: string[] | null
          optimization_score?: number | null
          optimization_status?: string | null
          optimized_content?: Json | null
          parsed_resume_id?: string | null
          resume_id?: string | null
          suggestions?: Json | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "resume_ats_optimization_parsed_resume_id_fkey"
            columns: ["parsed_resume_id"]
            isOneToOne: false
            referencedRelation: "resume_parsed"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "resume_ats_optimization_resume_id_fkey"
            columns: ["resume_id"]
            isOneToOne: false
            referencedRelation: "resumes"
            referencedColumns: ["id"]
          },
        ]
      }
      resume_collaborations: {
        Row: {
          accepted_at: string | null
          collaborator_id: string
          created_at: string | null
          id: string
          invited_at: string | null
          is_active: boolean | null
          owner_id: string
          permission_level: string
          resume_id: string | null
        }
        Insert: {
          accepted_at?: string | null
          collaborator_id: string
          created_at?: string | null
          id?: string
          invited_at?: string | null
          is_active?: boolean | null
          owner_id: string
          permission_level?: string
          resume_id?: string | null
        }
        Update: {
          accepted_at?: string | null
          collaborator_id?: string
          created_at?: string | null
          id?: string
          invited_at?: string | null
          is_active?: boolean | null
          owner_id?: string
          permission_level?: string
          resume_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "resume_collaborations_resume_id_fkey"
            columns: ["resume_id"]
            isOneToOne: false
            referencedRelation: "ai_resumes"
            referencedColumns: ["id"]
          },
        ]
      }
      resume_comments: {
        Row: {
          content: string
          created_at: string | null
          id: string
          is_resolved: boolean | null
          parent_id: string | null
          resume_id: string | null
          section_id: string | null
          section_type: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          is_resolved?: boolean | null
          parent_id?: string | null
          resume_id?: string | null
          section_id?: string | null
          section_type?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          is_resolved?: boolean | null
          parent_id?: string | null
          resume_id?: string | null
          section_id?: string | null
          section_type?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "resume_comments_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "resume_comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "resume_comments_resume_id_fkey"
            columns: ["resume_id"]
            isOneToOne: false
            referencedRelation: "ai_resumes"
            referencedColumns: ["id"]
          },
        ]
      }
      resume_content_blocks: {
        Row: {
          achievements_data: Json | null
          ai_generated: boolean | null
          ai_prompt: string | null
          block_type: string
          certifications_data: Json | null
          company: string | null
          created_at: string | null
          description: string | null
          end_date: string | null
          enhanced_content: string | null
          extraction_confidence: number | null
          id: string
          is_current: boolean | null
          keywords: string[] | null
          location: string | null
          metadata: Json | null
          position: number
          raw_content: string | null
          resume_id: string
          section_type: string
          start_date: string | null
          subtitle: string | null
          technical_skills: Json | null
          title: string | null
          updated_at: string | null
        }
        Insert: {
          achievements_data?: Json | null
          ai_generated?: boolean | null
          ai_prompt?: string | null
          block_type: string
          certifications_data?: Json | null
          company?: string | null
          created_at?: string | null
          description?: string | null
          end_date?: string | null
          enhanced_content?: string | null
          extraction_confidence?: number | null
          id?: string
          is_current?: boolean | null
          keywords?: string[] | null
          location?: string | null
          metadata?: Json | null
          position?: number
          raw_content?: string | null
          resume_id: string
          section_type: string
          start_date?: string | null
          subtitle?: string | null
          technical_skills?: Json | null
          title?: string | null
          updated_at?: string | null
        }
        Update: {
          achievements_data?: Json | null
          ai_generated?: boolean | null
          ai_prompt?: string | null
          block_type?: string
          certifications_data?: Json | null
          company?: string | null
          created_at?: string | null
          description?: string | null
          end_date?: string | null
          enhanced_content?: string | null
          extraction_confidence?: number | null
          id?: string
          is_current?: boolean | null
          keywords?: string[] | null
          location?: string | null
          metadata?: Json | null
          position?: number
          raw_content?: string | null
          resume_id?: string
          section_type?: string
          start_date?: string | null
          subtitle?: string | null
          technical_skills?: Json | null
          title?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "resume_content_blocks_resume_id_fkey"
            columns: ["resume_id"]
            isOneToOne: false
            referencedRelation: "resumes"
            referencedColumns: ["id"]
          },
        ]
      }
      resume_enhancements: {
        Row: {
          confidence_score: number | null
          created_at: string | null
          enhanced_content: string | null
          enhancement_type: string | null
          id: string
          is_applied: boolean | null
          original_content: string | null
          parsed_resume_id: string | null
          resume_id: string | null
          section_type: string
          suggestion_reason: string | null
          updated_at: string | null
        }
        Insert: {
          confidence_score?: number | null
          created_at?: string | null
          enhanced_content?: string | null
          enhancement_type?: string | null
          id?: string
          is_applied?: boolean | null
          original_content?: string | null
          parsed_resume_id?: string | null
          resume_id?: string | null
          section_type: string
          suggestion_reason?: string | null
          updated_at?: string | null
        }
        Update: {
          confidence_score?: number | null
          created_at?: string | null
          enhanced_content?: string | null
          enhancement_type?: string | null
          id?: string
          is_applied?: boolean | null
          original_content?: string | null
          parsed_resume_id?: string | null
          resume_id?: string | null
          section_type?: string
          suggestion_reason?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "resume_enhancements_parsed_resume_id_fkey"
            columns: ["parsed_resume_id"]
            isOneToOne: false
            referencedRelation: "resume_parsed"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "resume_enhancements_resume_id_fkey"
            columns: ["resume_id"]
            isOneToOne: false
            referencedRelation: "resumes"
            referencedColumns: ["id"]
          },
        ]
      }
      resume_export_history: {
        Row: {
          created_at: string | null
          download_count: number | null
          export_format: string
          file_url: string | null
          id: string
          resume_id: string
          template_id: string | null
        }
        Insert: {
          created_at?: string | null
          download_count?: number | null
          export_format: string
          file_url?: string | null
          id?: string
          resume_id: string
          template_id?: string | null
        }
        Update: {
          created_at?: string | null
          download_count?: number | null
          export_format?: string
          file_url?: string | null
          id?: string
          resume_id?: string
          template_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "resume_export_history_resume_id_fkey"
            columns: ["resume_id"]
            isOneToOne: false
            referencedRelation: "ai_resumes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "resume_export_history_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "resume_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      resume_exports: {
        Row: {
          created_at: string | null
          export_format: string
          export_settings: Json | null
          file_url: string | null
          id: string
          resume_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          export_format: string
          export_settings?: Json | null
          file_url?: string | null
          id?: string
          resume_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          export_format?: string
          export_settings?: Json | null
          file_url?: string | null
          id?: string
          resume_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "resume_exports_resume_id_fkey"
            columns: ["resume_id"]
            isOneToOne: false
            referencedRelation: "resumes"
            referencedColumns: ["id"]
          },
        ]
      }
      resume_extraction_jobs: {
        Row: {
          completed_at: string | null
          created_at: string | null
          error_details: string | null
          extracted_data: Json | null
          extraction_status: string | null
          id: string
          processing_step: string | null
          processing_time_ms: number | null
          progress_percentage: number | null
          raw_text: string | null
          resume_id: string | null
          updated_at: string | null
          user_id: string
          validation_results: Json | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          error_details?: string | null
          extracted_data?: Json | null
          extraction_status?: string | null
          id?: string
          processing_step?: string | null
          processing_time_ms?: number | null
          progress_percentage?: number | null
          raw_text?: string | null
          resume_id?: string | null
          updated_at?: string | null
          user_id: string
          validation_results?: Json | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          error_details?: string | null
          extracted_data?: Json | null
          extraction_status?: string | null
          id?: string
          processing_step?: string | null
          processing_time_ms?: number | null
          progress_percentage?: number | null
          raw_text?: string | null
          resume_id?: string | null
          updated_at?: string | null
          user_id?: string
          validation_results?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "resume_extraction_jobs_resume_id_fkey"
            columns: ["resume_id"]
            isOneToOne: false
            referencedRelation: "resumes"
            referencedColumns: ["id"]
          },
        ]
      }
      resume_insights: {
        Row: {
          created_at: string | null
          id: string
          insight_data: Json
          insight_type: string
          is_read: boolean | null
          priority: string | null
          recommendation: string | null
          resume_id: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          insight_data: Json
          insight_type: string
          is_read?: boolean | null
          priority?: string | null
          recommendation?: string | null
          resume_id?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          insight_data?: Json
          insight_type?: string
          is_read?: boolean | null
          priority?: string | null
          recommendation?: string | null
          resume_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "resume_insights_resume_id_fkey"
            columns: ["resume_id"]
            isOneToOne: false
            referencedRelation: "ai_resumes"
            referencedColumns: ["id"]
          },
        ]
      }
      resume_job_matches: {
        Row: {
          analyzed_at: string | null
          expires_at: string | null
          id: string
          job_id: string
          match_score: number
          matched_keywords: Json | null
          matched_skills: Json | null
          missing_keywords: Json | null
          missing_skills: Json | null
          recommendations: Json | null
          resume_id: string
        }
        Insert: {
          analyzed_at?: string | null
          expires_at?: string | null
          id?: string
          job_id: string
          match_score?: number
          matched_keywords?: Json | null
          matched_skills?: Json | null
          missing_keywords?: Json | null
          missing_skills?: Json | null
          recommendations?: Json | null
          resume_id: string
        }
        Update: {
          analyzed_at?: string | null
          expires_at?: string | null
          id?: string
          job_id?: string
          match_score?: number
          matched_keywords?: Json | null
          matched_skills?: Json | null
          missing_keywords?: Json | null
          missing_skills?: Json | null
          recommendations?: Json | null
          resume_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "resume_job_matches_resume_id_fkey"
            columns: ["resume_id"]
            isOneToOne: false
            referencedRelation: "resumes"
            referencedColumns: ["id"]
          },
        ]
      }
      resume_parsed: {
        Row: {
          certifications: Json | null
          created_at: string | null
          education: Json | null
          experience: Json | null
          extraction_status: string | null
          file_size: number | null
          file_type: string | null
          full_text: string | null
          id: string
          languages: Json | null
          original_file_url: string | null
          parsed_data: Json | null
          personal_info: Json | null
          projects: Json | null
          resume_name: string
          skills: string[] | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          certifications?: Json | null
          created_at?: string | null
          education?: Json | null
          experience?: Json | null
          extraction_status?: string | null
          file_size?: number | null
          file_type?: string | null
          full_text?: string | null
          id?: string
          languages?: Json | null
          original_file_url?: string | null
          parsed_data?: Json | null
          personal_info?: Json | null
          projects?: Json | null
          resume_name: string
          skills?: string[] | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          certifications?: Json | null
          created_at?: string | null
          education?: Json | null
          experience?: Json | null
          extraction_status?: string | null
          file_size?: number | null
          file_type?: string | null
          full_text?: string | null
          id?: string
          languages?: Json | null
          original_file_url?: string | null
          parsed_data?: Json | null
          personal_info?: Json | null
          projects?: Json | null
          resume_name?: string
          skills?: string[] | null
          updated_at?: string | null
          user_id?: string
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
      resume_sections_config: {
        Row: {
          created_at: string | null
          enabled: boolean | null
          id: string
          order_index: number
          resume_id: string | null
          section_group: string
          section_type: string
          settings: Json | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          enabled?: boolean | null
          id?: string
          order_index: number
          resume_id?: string | null
          section_group: string
          section_type: string
          settings?: Json | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          enabled?: boolean | null
          id?: string
          order_index?: number
          resume_id?: string | null
          section_group?: string
          section_type?: string
          settings?: Json | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "resume_sections_config_resume_id_fkey"
            columns: ["resume_id"]
            isOneToOne: false
            referencedRelation: "ai_resumes"
            referencedColumns: ["id"]
          },
        ]
      }
      resume_skills: {
        Row: {
          ai_suggested: boolean | null
          category: string | null
          created_at: string | null
          display_style: string | null
          id: string
          is_verified: boolean | null
          proficiency: string | null
          proficiency_score: number | null
          resume_id: string
          skill_name: string
          verification_source: string | null
        }
        Insert: {
          ai_suggested?: boolean | null
          category?: string | null
          created_at?: string | null
          display_style?: string | null
          id?: string
          is_verified?: boolean | null
          proficiency?: string | null
          proficiency_score?: number | null
          resume_id: string
          skill_name: string
          verification_source?: string | null
        }
        Update: {
          ai_suggested?: boolean | null
          category?: string | null
          created_at?: string | null
          display_style?: string | null
          id?: string
          is_verified?: boolean | null
          proficiency?: string | null
          proficiency_score?: number | null
          resume_id?: string
          skill_name?: string
          verification_source?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "resume_skills_resume_id_fkey"
            columns: ["resume_id"]
            isOneToOne: false
            referencedRelation: "resumes"
            referencedColumns: ["id"]
          },
        ]
      }
      resume_templates: {
        Row: {
          ats_score: number | null
          category: string
          component_name: string
          created_at: string | null
          css_config: Json | null
          description: string | null
          design_tokens: Json
          experience_level: string | null
          features: Json
          id: string
          industry: string[] | null
          is_active: boolean | null
          is_premium: boolean | null
          layout_config: Json | null
          name: string
          preview_url: string | null
          rating: number | null
          status: boolean | null
          tags: string[] | null
          template_config: Json
          thumbnail_url: string | null
          updated_at: string | null
          usage_count: number | null
        }
        Insert: {
          ats_score?: number | null
          category?: string
          component_name?: string
          created_at?: string | null
          css_config?: Json | null
          description?: string | null
          design_tokens?: Json
          experience_level?: string | null
          features?: Json
          id?: string
          industry?: string[] | null
          is_active?: boolean | null
          is_premium?: boolean | null
          layout_config?: Json | null
          name: string
          preview_url?: string | null
          rating?: number | null
          status?: boolean | null
          tags?: string[] | null
          template_config?: Json
          thumbnail_url?: string | null
          updated_at?: string | null
          usage_count?: number | null
        }
        Update: {
          ats_score?: number | null
          category?: string
          component_name?: string
          created_at?: string | null
          css_config?: Json | null
          description?: string | null
          design_tokens?: Json
          experience_level?: string | null
          features?: Json
          id?: string
          industry?: string[] | null
          is_active?: boolean | null
          is_premium?: boolean | null
          layout_config?: Json | null
          name?: string
          preview_url?: string | null
          rating?: number | null
          status?: boolean | null
          tags?: string[] | null
          template_config?: Json
          thumbnail_url?: string | null
          updated_at?: string | null
          usage_count?: number | null
        }
        Relationships: []
      }
      resume_upload_logs: {
        Row: {
          confidence_score: number | null
          created_at: string | null
          error_message: string | null
          extraction_status: string | null
          file_size: number | null
          filename: string
          id: string
          processing_time_ms: number | null
          user_id: string
        }
        Insert: {
          confidence_score?: number | null
          created_at?: string | null
          error_message?: string | null
          extraction_status?: string | null
          file_size?: number | null
          filename: string
          id?: string
          processing_time_ms?: number | null
          user_id: string
        }
        Update: {
          confidence_score?: number | null
          created_at?: string | null
          error_message?: string | null
          extraction_status?: string | null
          file_size?: number | null
          filename?: string
          id?: string
          processing_time_ms?: number | null
          user_id?: string
        }
        Relationships: []
      }
      resume_upload_status: {
        Row: {
          created_at: string | null
          current_step: string | null
          error_message: string | null
          file_name: string
          file_url: string | null
          id: string
          parsed_resume_id: string | null
          progress_percentage: number | null
          resume_id: string | null
          updated_at: string | null
          upload_status: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          current_step?: string | null
          error_message?: string | null
          file_name: string
          file_url?: string | null
          id?: string
          parsed_resume_id?: string | null
          progress_percentage?: number | null
          resume_id?: string | null
          updated_at?: string | null
          upload_status?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          current_step?: string | null
          error_message?: string | null
          file_name?: string
          file_url?: string | null
          id?: string
          parsed_resume_id?: string | null
          progress_percentage?: number | null
          resume_id?: string | null
          updated_at?: string | null
          upload_status?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "resume_upload_status_parsed_resume_id_fkey"
            columns: ["parsed_resume_id"]
            isOneToOne: false
            referencedRelation: "resume_parsed"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "resume_upload_status_resume_id_fkey"
            columns: ["resume_id"]
            isOneToOne: false
            referencedRelation: "resumes"
            referencedColumns: ["id"]
          },
        ]
      }
      resume_versions: {
        Row: {
          content: Json
          content_snapshot: Json | null
          created_at: string | null
          id: string
          is_current: boolean | null
          notes: string | null
          resume_id: string
          version_name: string
          version_number: number | null
        }
        Insert: {
          content?: Json
          content_snapshot?: Json | null
          created_at?: string | null
          id?: string
          is_current?: boolean | null
          notes?: string | null
          resume_id: string
          version_name: string
          version_number?: number | null
        }
        Update: {
          content?: Json
          content_snapshot?: Json | null
          created_at?: string | null
          id?: string
          is_current?: boolean | null
          notes?: string | null
          resume_id?: string
          version_name?: string
          version_number?: number | null
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
          ats_score: number | null
          completeness_score: number | null
          completion_percentage: number | null
          content: Json
          created_at: string | null
          extraction_confidence: number | null
          extraction_version: string | null
          file_size: number | null
          file_url: string | null
          id: string
          industry_type: string | null
          is_active: boolean | null
          is_primary: boolean | null
          is_public: boolean | null
          language: string | null
          metadata: Json | null
          mime_type: string | null
          processing_metadata: Json | null
          public_url_slug: string | null
          raw_extracted_data: Json | null
          template_id: string | null
          title: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          ats_score?: number | null
          completeness_score?: number | null
          completion_percentage?: number | null
          content: Json
          created_at?: string | null
          extraction_confidence?: number | null
          extraction_version?: string | null
          file_size?: number | null
          file_url?: string | null
          id?: string
          industry_type?: string | null
          is_active?: boolean | null
          is_primary?: boolean | null
          is_public?: boolean | null
          language?: string | null
          metadata?: Json | null
          mime_type?: string | null
          processing_metadata?: Json | null
          public_url_slug?: string | null
          raw_extracted_data?: Json | null
          template_id?: string | null
          title: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          ats_score?: number | null
          completeness_score?: number | null
          completion_percentage?: number | null
          content?: Json
          created_at?: string | null
          extraction_confidence?: number | null
          extraction_version?: string | null
          file_size?: number | null
          file_url?: string | null
          id?: string
          industry_type?: string | null
          is_active?: boolean | null
          is_primary?: boolean | null
          is_public?: boolean | null
          language?: string | null
          metadata?: Json | null
          mime_type?: string | null
          processing_metadata?: Json | null
          public_url_slug?: string | null
          raw_extracted_data?: Json | null
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
      role_permissions: {
        Row: {
          created_at: string | null
          id: string
          is_allowed: boolean | null
          permission_type: string
          requires_approval: boolean | null
          role: Database["public"]["Enums"]["team_role"]
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_allowed?: boolean | null
          permission_type: string
          requires_approval?: boolean | null
          role: Database["public"]["Enums"]["team_role"]
        }
        Update: {
          created_at?: string | null
          id?: string
          is_allowed?: boolean | null
          permission_type?: string
          requires_approval?: boolean | null
          role?: Database["public"]["Enums"]["team_role"]
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
      saved_posts: {
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
            foreignKeyName: "saved_posts_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
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
      search_engine_submissions: {
        Row: {
          created_at: string
          engine_name: string
          id: string
          last_checked: string | null
          max_retries: number | null
          priority: number | null
          response_data: Json | null
          retry_count: number | null
          status: string | null
          submission_type: string
          submitted_at: string | null
          target_url: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          engine_name: string
          id?: string
          last_checked?: string | null
          max_retries?: number | null
          priority?: number | null
          response_data?: Json | null
          retry_count?: number | null
          status?: string | null
          submission_type: string
          submitted_at?: string | null
          target_url: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          engine_name?: string
          id?: string
          last_checked?: string | null
          max_retries?: number | null
          priority?: number | null
          response_data?: Json | null
          retry_count?: number | null
          status?: string | null
          submission_type?: string
          submitted_at?: string | null
          target_url?: string
          updated_at?: string
        }
        Relationships: []
      }
      section_analytics: {
        Row: {
          completion_percentage: number | null
          created_at: string | null
          edit_count: number | null
          effectiveness_score: number | null
          id: string
          last_edited: string | null
          resume_id: string | null
          section_type: string
          updated_at: string | null
          view_count: number | null
        }
        Insert: {
          completion_percentage?: number | null
          created_at?: string | null
          edit_count?: number | null
          effectiveness_score?: number | null
          id?: string
          last_edited?: string | null
          resume_id?: string | null
          section_type: string
          updated_at?: string | null
          view_count?: number | null
        }
        Update: {
          completion_percentage?: number | null
          created_at?: string | null
          edit_count?: number | null
          effectiveness_score?: number | null
          id?: string
          last_edited?: string | null
          resume_id?: string | null
          section_type?: string
          updated_at?: string | null
          view_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "section_analytics_resume_id_fkey"
            columns: ["resume_id"]
            isOneToOne: false
            referencedRelation: "ai_resumes"
            referencedColumns: ["id"]
          },
        ]
      }
      section_templates: {
        Row: {
          created_at: string | null
          created_by: string | null
          experience_level: string | null
          id: string
          industry: string | null
          is_active: boolean | null
          name: string
          section_type: string
          template_data: Json
          updated_at: string | null
          usage_count: number | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          experience_level?: string | null
          id?: string
          industry?: string | null
          is_active?: boolean | null
          name: string
          section_type: string
          template_data?: Json
          updated_at?: string | null
          usage_count?: number | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          experience_level?: string | null
          id?: string
          industry?: string | null
          is_active?: boolean | null
          name?: string
          section_type?: string
          template_data?: Json
          updated_at?: string | null
          usage_count?: number | null
        }
        Relationships: []
      }
      seo_cache: {
        Row: {
          cache_key: string
          content: Json
          created_at: string
          expires_at: string | null
          hit_count: number | null
          id: string
          is_fresh: boolean | null
          last_generated: string
          meta_data: Json | null
          page_id: string | null
          page_type: string
          structured_data: Json | null
          updated_at: string
        }
        Insert: {
          cache_key: string
          content?: Json
          created_at?: string
          expires_at?: string | null
          hit_count?: number | null
          id?: string
          is_fresh?: boolean | null
          last_generated?: string
          meta_data?: Json | null
          page_id?: string | null
          page_type: string
          structured_data?: Json | null
          updated_at?: string
        }
        Update: {
          cache_key?: string
          content?: Json
          created_at?: string
          expires_at?: string | null
          hit_count?: number | null
          id?: string
          is_fresh?: boolean | null
          last_generated?: string
          meta_data?: Json | null
          page_id?: string | null
          page_type?: string
          structured_data?: Json | null
          updated_at?: string
        }
        Relationships: []
      }
      seo_learning_paths: {
        Row: {
          category: string | null
          created_at: string | null
          description: string | null
          duration_weeks: number | null
          enrollment_count: number | null
          id: number
          is_active: boolean | null
          level: string | null
          slug: string
          title: string
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          duration_weeks?: number | null
          enrollment_count?: number | null
          id?: number
          is_active?: boolean | null
          level?: string | null
          slug: string
          title: string
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          duration_weeks?: number | null
          enrollment_count?: number | null
          id?: number
          is_active?: boolean | null
          level?: string | null
          slug?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      seo_locations: {
        Row: {
          company_count: number | null
          country: string | null
          created_at: string | null
          id: number
          is_active: boolean | null
          job_count: number | null
          name: string
          slug: string
          state: string | null
          type: string | null
          updated_at: string | null
        }
        Insert: {
          company_count?: number | null
          country?: string | null
          created_at?: string | null
          id?: number
          is_active?: boolean | null
          job_count?: number | null
          name: string
          slug: string
          state?: string | null
          type?: string | null
          updated_at?: string | null
        }
        Update: {
          company_count?: number | null
          country?: string | null
          created_at?: string | null
          id?: number
          is_active?: boolean | null
          job_count?: number | null
          name?: string
          slug?: string
          state?: string | null
          type?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      seo_meta_tags: {
        Row: {
          canonical_url: string | null
          click_count: number | null
          description: string | null
          entity_id: number | null
          entity_type: string | null
          id: number
          image_url: string | null
          is_active: boolean | null
          keywords: string | null
          path: string
          title: string
          updated_at: string | null
        }
        Insert: {
          canonical_url?: string | null
          click_count?: number | null
          description?: string | null
          entity_id?: number | null
          entity_type?: string | null
          id?: number
          image_url?: string | null
          is_active?: boolean | null
          keywords?: string | null
          path: string
          title: string
          updated_at?: string | null
        }
        Update: {
          canonical_url?: string | null
          click_count?: number | null
          description?: string | null
          entity_id?: number | null
          entity_type?: string | null
          id?: number
          image_url?: string | null
          is_active?: boolean | null
          keywords?: string | null
          path?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      seo_metadata: {
        Row: {
          canonical_url: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          is_active: boolean | null
          keywords: string[] | null
          meta_robots: string | null
          og_description: string | null
          og_image: string | null
          og_title: string | null
          og_type: string | null
          page_identifier: string
          page_type: string
          schema_markup: Json | null
          title: string | null
          twitter_card: string | null
          twitter_description: string | null
          twitter_image: string | null
          twitter_title: string | null
          updated_at: string | null
        }
        Insert: {
          canonical_url?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          keywords?: string[] | null
          meta_robots?: string | null
          og_description?: string | null
          og_image?: string | null
          og_title?: string | null
          og_type?: string | null
          page_identifier: string
          page_type: string
          schema_markup?: Json | null
          title?: string | null
          twitter_card?: string | null
          twitter_description?: string | null
          twitter_image?: string | null
          twitter_title?: string | null
          updated_at?: string | null
        }
        Update: {
          canonical_url?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          keywords?: string[] | null
          meta_robots?: string | null
          og_description?: string | null
          og_image?: string | null
          og_title?: string | null
          og_type?: string | null
          page_identifier?: string
          page_type?: string
          schema_markup?: Json | null
          title?: string | null
          twitter_card?: string | null
          twitter_description?: string | null
          twitter_image?: string | null
          twitter_title?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      seo_monitoring: {
        Row: {
          accessibility_score: number | null
          created_at: string
          external_links_count: number | null
          id: string
          indexing_status: Json | null
          internal_links_count: number | null
          meta_quality_score: number | null
          metrics: Json
          monitored_at: string | null
          page_type: string
          page_url: string
          performance_score: number | null
          search_rankings: Json | null
          structured_data_errors: Json | null
          updated_at: string
        }
        Insert: {
          accessibility_score?: number | null
          created_at?: string
          external_links_count?: number | null
          id?: string
          indexing_status?: Json | null
          internal_links_count?: number | null
          meta_quality_score?: number | null
          metrics?: Json
          monitored_at?: string | null
          page_type: string
          page_url: string
          performance_score?: number | null
          search_rankings?: Json | null
          structured_data_errors?: Json | null
          updated_at?: string
        }
        Update: {
          accessibility_score?: number | null
          created_at?: string
          external_links_count?: number | null
          id?: string
          indexing_status?: Json | null
          internal_links_count?: number | null
          meta_quality_score?: number | null
          metrics?: Json
          monitored_at?: string | null
          page_type?: string
          page_url?: string
          performance_score?: number | null
          search_rankings?: Json | null
          structured_data_errors?: Json | null
          updated_at?: string
        }
        Relationships: []
      }
      seo_roles: {
        Row: {
          avg_salary: number | null
          category: string | null
          created_at: string | null
          description: string | null
          id: number
          is_active: boolean | null
          job_count: number | null
          name: string
          slug: string
          updated_at: string | null
        }
        Insert: {
          avg_salary?: number | null
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: number
          is_active?: boolean | null
          job_count?: number | null
          name: string
          slug: string
          updated_at?: string | null
        }
        Update: {
          avg_salary?: number | null
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: number
          is_active?: boolean | null
          job_count?: number | null
          name?: string
          slug?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      seo_salary_insights: {
        Row: {
          avg_salary: number | null
          currency: string | null
          data_points: number | null
          experience_level: string | null
          id: number
          location_id: number | null
          max_salary: number | null
          min_salary: number | null
          role_id: number | null
          updated_at: string | null
        }
        Insert: {
          avg_salary?: number | null
          currency?: string | null
          data_points?: number | null
          experience_level?: string | null
          id?: number
          location_id?: number | null
          max_salary?: number | null
          min_salary?: number | null
          role_id?: number | null
          updated_at?: string | null
        }
        Update: {
          avg_salary?: number | null
          currency?: string | null
          data_points?: number | null
          experience_level?: string | null
          id?: number
          location_id?: number | null
          max_salary?: number | null
          min_salary?: number | null
          role_id?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "seo_salary_insights_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "seo_locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "seo_salary_insights_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "seo_roles"
            referencedColumns: ["id"]
          },
        ]
      }
      seo_skills: {
        Row: {
          category: string | null
          created_at: string | null
          demand_level: string | null
          id: number
          is_active: boolean | null
          job_count: number | null
          name: string
          slug: string
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          demand_level?: string | null
          id?: number
          is_active?: boolean | null
          job_count?: number | null
          name: string
          slug: string
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          demand_level?: string | null
          id?: number
          is_active?: boolean | null
          job_count?: number | null
          name?: string
          slug?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      service_analytics: {
        Row: {
          created_at: string | null
          event_type: string
          id: string
          metadata: Json | null
          service_id: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          event_type: string
          id?: string
          metadata?: Json | null
          service_id?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          event_type?: string
          id?: string
          metadata?: Json | null
          service_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "service_analytics_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      service_booking_requests: {
        Row: {
          budget_range: string | null
          client_email: string
          client_id: string
          client_name: string
          client_phone: string | null
          created_at: string
          id: string
          preferred_start_date: string | null
          project_description: string
          provider_id: string
          provider_response: string | null
          responded_at: string | null
          service_id: string
          status: string | null
          updated_at: string
          urgency: string | null
        }
        Insert: {
          budget_range?: string | null
          client_email: string
          client_id: string
          client_name: string
          client_phone?: string | null
          created_at?: string
          id?: string
          preferred_start_date?: string | null
          project_description: string
          provider_id: string
          provider_response?: string | null
          responded_at?: string | null
          service_id: string
          status?: string | null
          updated_at?: string
          urgency?: string | null
        }
        Update: {
          budget_range?: string | null
          client_email?: string
          client_id?: string
          client_name?: string
          client_phone?: string | null
          created_at?: string
          id?: string
          preferred_start_date?: string | null
          project_description?: string
          provider_id?: string
          provider_response?: string | null
          responded_at?: string | null
          service_id?: string
          status?: string | null
          updated_at?: string
          urgency?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "service_booking_requests_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      service_bookings: {
        Row: {
          booking_date: string | null
          booking_status: string | null
          client_id: string | null
          client_requirements: string | null
          created_at: string | null
          currency: string
          id: string
          payment_method: string | null
          payment_reference: string | null
          payment_status: string | null
          provider_id: string
          selected_addons: Json | null
          service_id: string | null
          special_instructions: string | null
          total_amount: number
          updated_at: string | null
        }
        Insert: {
          booking_date?: string | null
          booking_status?: string | null
          client_id?: string | null
          client_requirements?: string | null
          created_at?: string | null
          currency: string
          id?: string
          payment_method?: string | null
          payment_reference?: string | null
          payment_status?: string | null
          provider_id: string
          selected_addons?: Json | null
          service_id?: string | null
          special_instructions?: string | null
          total_amount: number
          updated_at?: string | null
        }
        Update: {
          booking_date?: string | null
          booking_status?: string | null
          client_id?: string | null
          client_requirements?: string | null
          created_at?: string | null
          currency?: string
          id?: string
          payment_method?: string | null
          payment_reference?: string | null
          payment_status?: string | null
          provider_id?: string
          selected_addons?: Json | null
          service_id?: string | null
          special_instructions?: string | null
          total_amount?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "service_bookings_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      service_categories: {
        Row: {
          color_theme: string | null
          created_at: string | null
          description: string | null
          display_order: number | null
          icon_emoji: string | null
          id: string
          is_active: boolean | null
          name: string
          parent_id: string | null
          slug: string
          updated_at: string | null
        }
        Insert: {
          color_theme?: string | null
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          icon_emoji?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          parent_id?: string | null
          slug: string
          updated_at?: string | null
        }
        Update: {
          color_theme?: string | null
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          icon_emoji?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          parent_id?: string | null
          slug?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "service_categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "service_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      service_orders: {
        Row: {
          client_feedback: string | null
          client_id: string
          created_at: string
          delivery_date: string | null
          id: string
          order_details: Json
          payment_status: string
          provider_id: string
          provider_notes: string | null
          rating: number | null
          requirements_met: boolean | null
          service_id: string | null
          status: string
          total_amount: number
          updated_at: string
        }
        Insert: {
          client_feedback?: string | null
          client_id: string
          created_at?: string
          delivery_date?: string | null
          id?: string
          order_details: Json
          payment_status?: string
          provider_id: string
          provider_notes?: string | null
          rating?: number | null
          requirements_met?: boolean | null
          service_id?: string | null
          status?: string
          total_amount: number
          updated_at?: string
        }
        Update: {
          client_feedback?: string | null
          client_id?: string
          created_at?: string
          delivery_date?: string | null
          id?: string
          order_details?: Json
          payment_status?: string
          provider_id?: string
          provider_notes?: string | null
          rating?: number | null
          requirements_met?: boolean | null
          service_id?: string | null
          status?: string
          total_amount?: number
          updated_at?: string
        }
        Relationships: []
      }
      service_promotion_credits: {
        Row: {
          created_at: string | null
          credit_type: string
          credits_available: number | null
          credits_used: number | null
          expires_at: string | null
          id: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          credit_type: string
          credits_available?: number | null
          credits_used?: number | null
          expires_at?: string | null
          id?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          credit_type?: string
          credits_available?: number | null
          credits_used?: number | null
          expires_at?: string | null
          id?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      service_promotion_transactions: {
        Row: {
          created_at: string | null
          credits_used: number
          id: string
          is_active: boolean | null
          promotion_end: string | null
          promotion_start: string | null
          promotion_type: string
          service_id: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          credits_used: number
          id?: string
          is_active?: boolean | null
          promotion_end?: string | null
          promotion_start?: string | null
          promotion_type: string
          service_id?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          credits_used?: number
          id?: string
          is_active?: boolean | null
          promotion_end?: string | null
          promotion_start?: string | null
          promotion_type?: string
          service_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "service_promotion_transactions_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      service_reviews: {
        Row: {
          created_at: string | null
          id: string
          is_verified: boolean | null
          rating: number
          review_text: string | null
          reviewer_id: string
          service_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_verified?: boolean | null
          rating: number
          review_text?: string | null
          reviewer_id: string
          service_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_verified?: boolean | null
          rating?: number
          review_text?: string | null
          reviewer_id?: string
          service_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "service_reviews_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      service_testimonials: {
        Row: {
          created_at: string
          id: string
          is_featured: boolean | null
          is_verified: boolean | null
          rating: number
          service_experience: string | null
          service_id: string
          service_order_id: string | null
          testimonial_text: string
          updated_at: string
          user_id: string
          would_recommend: boolean | null
        }
        Insert: {
          created_at?: string
          id?: string
          is_featured?: boolean | null
          is_verified?: boolean | null
          rating: number
          service_experience?: string | null
          service_id: string
          service_order_id?: string | null
          testimonial_text: string
          updated_at?: string
          user_id: string
          would_recommend?: boolean | null
        }
        Update: {
          created_at?: string
          id?: string
          is_featured?: boolean | null
          is_verified?: boolean | null
          rating?: number
          service_experience?: string | null
          service_id?: string
          service_order_id?: string | null
          testimonial_text?: string
          updated_at?: string
          user_id?: string
          would_recommend?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_service_testimonials_service_order_id"
            columns: ["service_order_id"]
            isOneToOne: false
            referencedRelation: "service_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      services: {
        Row: {
          add_ons: Json | null
          auto_accept_bookings: boolean | null
          available_slots: number | null
          average_rating: number | null
          booking_buffer: string | null
          booking_count: number | null
          category_id: string | null
          client_requirements: string | null
          contact_email: boolean | null
          contact_phone: boolean | null
          contact_preferences: string[] | null
          contact_website: boolean | null
          created_at: string | null
          currency: string
          delivery_time_days: number
          description: string
          focus_keywords: string | null
          id: string
          is_active: boolean | null
          is_featured: boolean | null
          is_promoted: boolean | null
          last_updated: string | null
          location: string | null
          meta_description: string | null
          payment_methods: string[] | null
          phone_number: string | null
          portfolio_files: string[] | null
          portfolio_items: Json | null
          price: number
          professional_title: string | null
          profile_link: string | null
          profile_picture_url: string | null
          promotion_expires_at: string | null
          provider_id: string
          reviews_count: number | null
          seo_title: string | null
          service_rating: number | null
          service_slug: string | null
          status: string | null
          subcategory_id: string | null
          tags: string[] | null
          title: string
          total_orders: number | null
          total_reviews: number | null
          updated_at: string | null
          view_count: number | null
          website_url: string | null
          whats_included: string[] | null
          working_days: string[] | null
          years_experience: string | null
        }
        Insert: {
          add_ons?: Json | null
          auto_accept_bookings?: boolean | null
          available_slots?: number | null
          average_rating?: number | null
          booking_buffer?: string | null
          booking_count?: number | null
          category_id?: string | null
          client_requirements?: string | null
          contact_email?: boolean | null
          contact_phone?: boolean | null
          contact_preferences?: string[] | null
          contact_website?: boolean | null
          created_at?: string | null
          currency?: string
          delivery_time_days?: number
          description: string
          focus_keywords?: string | null
          id?: string
          is_active?: boolean | null
          is_featured?: boolean | null
          is_promoted?: boolean | null
          last_updated?: string | null
          location?: string | null
          meta_description?: string | null
          payment_methods?: string[] | null
          phone_number?: string | null
          portfolio_files?: string[] | null
          portfolio_items?: Json | null
          price: number
          professional_title?: string | null
          profile_link?: string | null
          profile_picture_url?: string | null
          promotion_expires_at?: string | null
          provider_id: string
          reviews_count?: number | null
          seo_title?: string | null
          service_rating?: number | null
          service_slug?: string | null
          status?: string | null
          subcategory_id?: string | null
          tags?: string[] | null
          title: string
          total_orders?: number | null
          total_reviews?: number | null
          updated_at?: string | null
          view_count?: number | null
          website_url?: string | null
          whats_included?: string[] | null
          working_days?: string[] | null
          years_experience?: string | null
        }
        Update: {
          add_ons?: Json | null
          auto_accept_bookings?: boolean | null
          available_slots?: number | null
          average_rating?: number | null
          booking_buffer?: string | null
          booking_count?: number | null
          category_id?: string | null
          client_requirements?: string | null
          contact_email?: boolean | null
          contact_phone?: boolean | null
          contact_preferences?: string[] | null
          contact_website?: boolean | null
          created_at?: string | null
          currency?: string
          delivery_time_days?: number
          description?: string
          focus_keywords?: string | null
          id?: string
          is_active?: boolean | null
          is_featured?: boolean | null
          is_promoted?: boolean | null
          last_updated?: string | null
          location?: string | null
          meta_description?: string | null
          payment_methods?: string[] | null
          phone_number?: string | null
          portfolio_files?: string[] | null
          portfolio_items?: Json | null
          price?: number
          professional_title?: string | null
          profile_link?: string | null
          profile_picture_url?: string | null
          promotion_expires_at?: string | null
          provider_id?: string
          reviews_count?: number | null
          seo_title?: string | null
          service_rating?: number | null
          service_slug?: string | null
          status?: string | null
          subcategory_id?: string | null
          tags?: string[] | null
          title?: string
          total_orders?: number | null
          total_reviews?: number | null
          updated_at?: string | null
          view_count?: number | null
          website_url?: string | null
          whats_included?: string[] | null
          working_days?: string[] | null
          years_experience?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "services_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "service_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "services_subcategory_id_fkey"
            columns: ["subcategory_id"]
            isOneToOne: false
            referencedRelation: "service_categories"
            referencedColumns: ["id"]
          },
        ]
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
      sharing_analytics: {
        Row: {
          clicked_count: number | null
          content_id: string
          content_type: string
          conversion_count: number | null
          id: string
          platform: string
          referrer: string | null
          share_url: string
          shared_at: string
          shared_by: string | null
          user_agent: string | null
        }
        Insert: {
          clicked_count?: number | null
          content_id: string
          content_type: string
          conversion_count?: number | null
          id?: string
          platform: string
          referrer?: string | null
          share_url: string
          shared_at?: string
          shared_by?: string | null
          user_agent?: string | null
        }
        Update: {
          clicked_count?: number | null
          content_id?: string
          content_type?: string
          conversion_count?: number | null
          id?: string
          platform?: string
          referrer?: string | null
          share_url?: string
          shared_at?: string
          shared_by?: string | null
          user_agent?: string | null
        }
        Relationships: []
      }
      site_announcements: {
        Row: {
          announcement_type: string | null
          content: string
          created_at: string | null
          created_by: string | null
          end_date: string | null
          id: string
          is_active: boolean | null
          is_dismissible: boolean | null
          start_date: string | null
          target_audience: Json | null
          title: string
          updated_at: string | null
        }
        Insert: {
          announcement_type?: string | null
          content: string
          created_at?: string | null
          created_by?: string | null
          end_date?: string | null
          id?: string
          is_active?: boolean | null
          is_dismissible?: boolean | null
          start_date?: string | null
          target_audience?: Json | null
          title: string
          updated_at?: string | null
        }
        Update: {
          announcement_type?: string | null
          content?: string
          created_at?: string | null
          created_by?: string | null
          end_date?: string | null
          id?: string
          is_active?: boolean | null
          is_dismissible?: boolean | null
          start_date?: string | null
          target_audience?: Json | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      site_redirects: {
        Row: {
          created_at: string | null
          created_by: string | null
          destination_url: string
          hit_count: number | null
          id: string
          is_active: boolean | null
          redirect_type: number | null
          source_url: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          destination_url: string
          hit_count?: number | null
          id?: string
          is_active?: boolean | null
          redirect_type?: number | null
          source_url: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          destination_url?: string
          hit_count?: number | null
          id?: string
          is_active?: boolean | null
          redirect_type?: number | null
          source_url?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      skill_assessments: {
        Row: {
          created_at: string | null
          created_by: string | null
          description: string | null
          difficulty_level: string
          duration_minutes: number | null
          id: string
          is_active: boolean | null
          passing_score: number | null
          questions: Json
          skill_id: string
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          difficulty_level: string
          duration_minutes?: number | null
          id?: string
          is_active?: boolean | null
          passing_score?: number | null
          questions?: Json
          skill_id: string
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          difficulty_level?: string
          duration_minutes?: number | null
          id?: string
          is_active?: boolean | null
          passing_score?: number | null
          questions?: Json
          skill_id?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "skill_assessments_skill_id_fkey"
            columns: ["skill_id"]
            isOneToOne: false
            referencedRelation: "skills_master"
            referencedColumns: ["id"]
          },
        ]
      }
      skill_recommendations: {
        Row: {
          based_on_data: Json
          confidence_score: number
          created_at: string
          id: string
          is_dismissed: boolean | null
          priority_level: string
          reasoning: string | null
          recommended_skill: string
          skill_category: string
          user_id: string
        }
        Insert: {
          based_on_data?: Json
          confidence_score: number
          created_at?: string
          id?: string
          is_dismissed?: boolean | null
          priority_level: string
          reasoning?: string | null
          recommended_skill: string
          skill_category: string
          user_id: string
        }
        Update: {
          based_on_data?: Json
          confidence_score?: number
          created_at?: string
          id?: string
          is_dismissed?: boolean | null
          priority_level?: string
          reasoning?: string | null
          recommended_skill?: string
          skill_category?: string
          user_id?: string
        }
        Relationships: []
      }
      skill_salary_data: {
        Row: {
          company_size: string | null
          confidence_score: number | null
          created_at: string | null
          currency: string | null
          data_source: string | null
          experience_level: string | null
          id: string
          job_title: string | null
          location: string | null
          salary_max: number | null
          salary_min: number | null
          skills: Json
        }
        Insert: {
          company_size?: string | null
          confidence_score?: number | null
          created_at?: string | null
          currency?: string | null
          data_source?: string | null
          experience_level?: string | null
          id?: string
          job_title?: string | null
          location?: string | null
          salary_max?: number | null
          salary_min?: number | null
          skills: Json
        }
        Update: {
          company_size?: string | null
          confidence_score?: number | null
          created_at?: string | null
          currency?: string | null
          data_source?: string | null
          experience_level?: string | null
          id?: string
          job_title?: string | null
          location?: string | null
          salary_max?: number | null
          salary_min?: number | null
          skills?: Json
        }
        Relationships: []
      }
      skills: {
        Row: {
          created_at: string | null
          id: string
          languages_spoken: string[] | null
          programming_languages: string[] | null
          soft_skills: string[] | null
          technical_skills: string[] | null
          tools_software: string[] | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          languages_spoken?: string[] | null
          programming_languages?: string[] | null
          soft_skills?: string[] | null
          technical_skills?: string[] | null
          tools_software?: string[] | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          languages_spoken?: string[] | null
          programming_languages?: string[] | null
          soft_skills?: string[] | null
          technical_skills?: string[] | null
          tools_software?: string[] | null
          user_id?: string
        }
        Relationships: []
      }
      skills_master: {
        Row: {
          average_salary_impact: number | null
          category: string
          created_at: string | null
          description: string | null
          difficulty_level: string | null
          id: string
          is_active: boolean | null
          learning_resources: Json | null
          market_demand_score: number | null
          name: string
          related_skills: string[] | null
          subcategory: string | null
          updated_at: string | null
        }
        Insert: {
          average_salary_impact?: number | null
          category: string
          created_at?: string | null
          description?: string | null
          difficulty_level?: string | null
          id?: string
          is_active?: boolean | null
          learning_resources?: Json | null
          market_demand_score?: number | null
          name: string
          related_skills?: string[] | null
          subcategory?: string | null
          updated_at?: string | null
        }
        Update: {
          average_salary_impact?: number | null
          category?: string
          created_at?: string | null
          description?: string | null
          difficulty_level?: string | null
          id?: string
          is_active?: boolean | null
          learning_resources?: Json | null
          market_demand_score?: number | null
          name?: string
          related_skills?: string[] | null
          subcategory?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      smart_feed_preferences: {
        Row: {
          blocked_keywords: string[] | null
          blocked_users: string[] | null
          content_freshness_weight: number | null
          created_at: string | null
          diversity_weight: number | null
          exclude_content_types: string[] | null
          exclude_tags: string[] | null
          id: string
          include_content_types: string[] | null
          include_tags: string[] | null
          preferred_industries: string[] | null
          preferred_roles: string[] | null
          prioritize_connections: boolean | null
          relevance_weight: number | null
          show_trending_content: boolean | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          blocked_keywords?: string[] | null
          blocked_users?: string[] | null
          content_freshness_weight?: number | null
          created_at?: string | null
          diversity_weight?: number | null
          exclude_content_types?: string[] | null
          exclude_tags?: string[] | null
          id?: string
          include_content_types?: string[] | null
          include_tags?: string[] | null
          preferred_industries?: string[] | null
          preferred_roles?: string[] | null
          prioritize_connections?: boolean | null
          relevance_weight?: number | null
          show_trending_content?: boolean | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          blocked_keywords?: string[] | null
          blocked_users?: string[] | null
          content_freshness_weight?: number | null
          created_at?: string | null
          diversity_weight?: number | null
          exclude_content_types?: string[] | null
          exclude_tags?: string[] | null
          id?: string
          include_content_types?: string[] | null
          include_tags?: string[] | null
          preferred_industries?: string[] | null
          preferred_roles?: string[] | null
          prioritize_connections?: boolean | null
          relevance_weight?: number | null
          show_trending_content?: boolean | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      social_interactions: {
        Row: {
          content: string | null
          created_at: string | null
          id: string
          interaction_type: string
          target_id: string
          target_type: string
          user_id: string
        }
        Insert: {
          content?: string | null
          created_at?: string | null
          id?: string
          interaction_type: string
          target_id: string
          target_type: string
          user_id: string
        }
        Update: {
          content?: string | null
          created_at?: string | null
          id?: string
          interaction_type?: string
          target_id?: string
          target_type?: string
          user_id?: string
        }
        Relationships: []
      }
      sop_drafts: {
        Row: {
          ai_feedback: string | null
          ai_generated: boolean | null
          ai_prompt: string | null
          ai_score: number | null
          ai_suggestions: string[] | null
          character_count: number | null
          college_id: string | null
          content: string
          course_id: string | null
          created_at: string
          document_type: string
          id: string
          is_final: boolean | null
          parent_draft_id: string | null
          title: string
          updated_at: string
          user_id: string
          version: number | null
          word_count: number | null
        }
        Insert: {
          ai_feedback?: string | null
          ai_generated?: boolean | null
          ai_prompt?: string | null
          ai_score?: number | null
          ai_suggestions?: string[] | null
          character_count?: number | null
          college_id?: string | null
          content: string
          course_id?: string | null
          created_at?: string
          document_type?: string
          id?: string
          is_final?: boolean | null
          parent_draft_id?: string | null
          title: string
          updated_at?: string
          user_id: string
          version?: number | null
          word_count?: number | null
        }
        Update: {
          ai_feedback?: string | null
          ai_generated?: boolean | null
          ai_prompt?: string | null
          ai_score?: number | null
          ai_suggestions?: string[] | null
          character_count?: number | null
          college_id?: string | null
          content?: string
          course_id?: string | null
          created_at?: string
          document_type?: string
          id?: string
          is_final?: boolean | null
          parent_draft_id?: string | null
          title?: string
          updated_at?: string
          user_id?: string
          version?: number | null
          word_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "sop_drafts_college_id_fkey"
            columns: ["college_id"]
            isOneToOne: false
            referencedRelation: "colleges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sop_drafts_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "college_courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sop_drafts_parent_draft_id_fkey"
            columns: ["parent_draft_id"]
            isOneToOne: false
            referencedRelation: "sop_drafts"
            referencedColumns: ["id"]
          },
        ]
      }
      sso_configurations: {
        Row: {
          attribute_mapping: Json | null
          auto_provision_users: boolean | null
          configuration: Json
          created_at: string | null
          created_by: string | null
          default_role_id: string | null
          id: string
          is_active: boolean | null
          metadata_xml: string | null
          organization_id: string | null
          provider_name: string
          provider_type: string
          updated_at: string | null
        }
        Insert: {
          attribute_mapping?: Json | null
          auto_provision_users?: boolean | null
          configuration?: Json
          created_at?: string | null
          created_by?: string | null
          default_role_id?: string | null
          id?: string
          is_active?: boolean | null
          metadata_xml?: string | null
          organization_id?: string | null
          provider_name: string
          provider_type: string
          updated_at?: string | null
        }
        Update: {
          attribute_mapping?: Json | null
          auto_provision_users?: boolean | null
          configuration?: Json
          created_at?: string | null
          created_by?: string | null
          default_role_id?: string | null
          id?: string
          is_active?: boolean | null
          metadata_xml?: string | null
          organization_id?: string | null
          provider_name?: string
          provider_type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sso_configurations_default_role_id_fkey"
            columns: ["default_role_id"]
            isOneToOne: false
            referencedRelation: "organization_roles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sso_configurations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      student_college_interactions: {
        Row: {
          college_id: string
          created_at: string
          id: string
          inquiry_message: string | null
          inquiry_status: string | null
          inquiry_subject: string | null
          interaction_type: string
          metadata: Json | null
          user_id: string
        }
        Insert: {
          college_id: string
          created_at?: string
          id?: string
          inquiry_message?: string | null
          inquiry_status?: string | null
          inquiry_subject?: string | null
          interaction_type: string
          metadata?: Json | null
          user_id: string
        }
        Update: {
          college_id?: string
          created_at?: string
          id?: string
          inquiry_message?: string | null
          inquiry_status?: string | null
          inquiry_subject?: string | null
          interaction_type?: string
          metadata?: Json | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_college_interactions_college_id_fkey"
            columns: ["college_id"]
            isOneToOne: false
            referencedRelation: "colleges"
            referencedColumns: ["id"]
          },
        ]
      }
      subscription_plans: {
        Row: {
          billing_cycle: string
          created_at: string
          currency: string
          features: Json
          id: string
          is_active: boolean
          name: string
          price: number
          updated_at: string
        }
        Insert: {
          billing_cycle?: string
          created_at?: string
          currency?: string
          features?: Json
          id?: string
          is_active?: boolean
          name: string
          price: number
          updated_at?: string
        }
        Update: {
          billing_cycle?: string
          created_at?: string
          currency?: string
          features?: Json
          id?: string
          is_active?: boolean
          name?: string
          price?: number
          updated_at?: string
        }
        Relationships: []
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
      system_configuration: {
        Row: {
          category: string
          created_at: string | null
          data_type: string | null
          description: string | null
          id: string
          is_public: boolean | null
          key: string
          updated_at: string | null
          updated_by: string | null
          value: Json
        }
        Insert: {
          category: string
          created_at?: string | null
          data_type?: string | null
          description?: string | null
          id?: string
          is_public?: boolean | null
          key: string
          updated_at?: string | null
          updated_by?: string | null
          value: Json
        }
        Update: {
          category?: string
          created_at?: string | null
          data_type?: string | null
          description?: string | null
          id?: string
          is_public?: boolean | null
          key?: string
          updated_at?: string | null
          updated_by?: string | null
          value?: Json
        }
        Relationships: []
      }
      system_metrics: {
        Row: {
          id: string
          metadata: Json | null
          metric_name: string
          metric_type: string
          metric_value: number
          organization_id: string
          timestamp: string
        }
        Insert: {
          id?: string
          metadata?: Json | null
          metric_name: string
          metric_type?: string
          metric_value: number
          organization_id: string
          timestamp?: string
        }
        Update: {
          id?: string
          metadata?: Json | null
          metric_name?: string
          metric_type?: string
          metric_value?: number
          organization_id?: string
          timestamp?: string
        }
        Relationships: []
      }
      team_activity_logs: {
        Row: {
          action_type: string
          company_id: string
          created_at: string | null
          details: Json | null
          id: string
          ip_address: unknown | null
          resource_id: string | null
          resource_type: string | null
          user_agent: string | null
          user_id: string
        }
        Insert: {
          action_type: string
          company_id: string
          created_at?: string | null
          details?: Json | null
          id?: string
          ip_address?: unknown | null
          resource_id?: string | null
          resource_type?: string | null
          user_agent?: string | null
          user_id: string
        }
        Update: {
          action_type?: string
          company_id?: string
          created_at?: string | null
          details?: Json | null
          id?: string
          ip_address?: unknown | null
          resource_id?: string | null
          resource_type?: string | null
          user_agent?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_activity_logs_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      team_collaboration_logs: {
        Row: {
          action_details: Json | null
          action_type: string
          company_id: string | null
          id: string
          ip_address: unknown | null
          resource_id: string | null
          resource_type: string | null
          timestamp: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action_details?: Json | null
          action_type: string
          company_id?: string | null
          id?: string
          ip_address?: unknown | null
          resource_id?: string | null
          resource_type?: string | null
          timestamp?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action_details?: Json | null
          action_type?: string
          company_id?: string | null
          id?: string
          ip_address?: unknown | null
          resource_id?: string | null
          resource_type?: string | null
          timestamp?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "team_collaboration_logs_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      team_invitation_requests: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          company_id: string
          created_at: string | null
          expires_at: string | null
          id: string
          invited_email: string
          rejection_reason: string | null
          request_message: string | null
          requested_by: string
          requested_role: string
          status: string
          updated_at: string | null
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          company_id: string
          created_at?: string | null
          expires_at?: string | null
          id?: string
          invited_email: string
          rejection_reason?: string | null
          request_message?: string | null
          requested_by: string
          requested_role?: string
          status?: string
          updated_at?: string | null
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          company_id?: string
          created_at?: string | null
          expires_at?: string | null
          id?: string
          invited_email?: string
          rejection_reason?: string | null
          request_message?: string | null
          requested_by?: string
          requested_role?: string
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "team_invitation_requests_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      team_invitations: {
        Row: {
          accepted_at: string | null
          company_id: string
          created_at: string | null
          expires_at: string | null
          id: string
          invitation_token: string
          invited_at: string | null
          invited_by: string
          invited_email: string
          role: string
          status: string
          updated_at: string | null
        }
        Insert: {
          accepted_at?: string | null
          company_id: string
          created_at?: string | null
          expires_at?: string | null
          id?: string
          invitation_token?: string
          invited_at?: string | null
          invited_by: string
          invited_email: string
          role?: string
          status?: string
          updated_at?: string | null
        }
        Update: {
          accepted_at?: string | null
          company_id?: string
          created_at?: string | null
          expires_at?: string | null
          id?: string
          invitation_token?: string
          invited_at?: string | null
          invited_by?: string
          invited_email?: string
          role?: string
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "team_invitations_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      template_customizations: {
        Row: {
          applied_at: string | null
          customization_data: Json
          id: string
          template_id: string | null
          user_id: string
        }
        Insert: {
          applied_at?: string | null
          customization_data?: Json
          id?: string
          template_id?: string | null
          user_id: string
        }
        Update: {
          applied_at?: string | null
          customization_data?: Json
          id?: string
          template_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "template_customizations_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "resume_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      template_usage_analytics: {
        Row: {
          action_type: string
          id: string
          metadata: Json | null
          template_id: string | null
          timestamp: string | null
          user_id: string | null
        }
        Insert: {
          action_type: string
          id?: string
          metadata?: Json | null
          template_id?: string | null
          timestamp?: string | null
          user_id?: string | null
        }
        Update: {
          action_type?: string
          id?: string
          metadata?: Json | null
          template_id?: string | null
          timestamp?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "template_usage_analytics_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "resume_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      tool_feedback: {
        Row: {
          comments: string | null
          created_at: string | null
          feedback_category: string | null
          id: string
          is_anonymous: boolean | null
          rating: number
          tool_slug: string
          user_id: string | null
        }
        Insert: {
          comments?: string | null
          created_at?: string | null
          feedback_category?: string | null
          id?: string
          is_anonymous?: boolean | null
          rating: number
          tool_slug: string
          user_id?: string | null
        }
        Update: {
          comments?: string | null
          created_at?: string | null
          feedback_category?: string | null
          id?: string
          is_anonymous?: boolean | null
          rating?: number
          tool_slug?: string
          user_id?: string | null
        }
        Relationships: []
      }
      tool_prompts: {
        Row: {
          created_at: string | null
          id: string
          is_active: boolean | null
          language: string | null
          prompt_template: string
          prompt_type: string
          tool_slug: string
          updated_at: string | null
          variables: Json | null
          version: number | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          language?: string | null
          prompt_template: string
          prompt_type: string
          tool_slug: string
          updated_at?: string | null
          variables?: Json | null
          version?: number | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          language?: string | null
          prompt_template?: string
          prompt_type?: string
          tool_slug?: string
          updated_at?: string | null
          variables?: Json | null
          version?: number | null
        }
        Relationships: []
      }
      tool_registry: {
        Row: {
          category: string | null
          created_at: string | null
          description: string | null
          icon_name: string | null
          id: string
          is_active: boolean | null
          name: string
          slug: string
          sort_order: number | null
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          icon_name?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          slug: string
          sort_order?: number | null
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          icon_name?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          slug?: string
          sort_order?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      tool_saved_results: {
        Row: {
          created_at: string | null
          id: string
          is_favorite: boolean | null
          result_data: Json
          result_title: string
          result_type: string | null
          tags: string[] | null
          tool_slug: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_favorite?: boolean | null
          result_data?: Json
          result_title: string
          result_type?: string | null
          tags?: string[] | null
          tool_slug: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_favorite?: boolean | null
          result_data?: Json
          result_title?: string
          result_type?: string | null
          tags?: string[] | null
          tool_slug?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      tool_usage: {
        Row: {
          completion_status: string | null
          created_at: string
          duration_seconds: number | null
          id: string
          results: Json | null
          session_data: Json | null
          tool_name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          completion_status?: string | null
          created_at?: string
          duration_seconds?: number | null
          id?: string
          results?: Json | null
          session_data?: Json | null
          tool_name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          completion_status?: string | null
          created_at?: string
          duration_seconds?: number | null
          id?: string
          results?: Json | null
          session_data?: Json | null
          tool_name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      tool_usage_enhanced: {
        Row: {
          completion_status: string | null
          created_at: string | null
          duration_seconds: number | null
          feedback_rating: number | null
          feedback_text: string | null
          id: string
          input_data: Json | null
          output_data: Json | null
          tool_name: string
          tool_slug: string
          updated_at: string | null
          usage_type: string | null
          user_id: string | null
        }
        Insert: {
          completion_status?: string | null
          created_at?: string | null
          duration_seconds?: number | null
          feedback_rating?: number | null
          feedback_text?: string | null
          id?: string
          input_data?: Json | null
          output_data?: Json | null
          tool_name: string
          tool_slug: string
          updated_at?: string | null
          usage_type?: string | null
          user_id?: string | null
        }
        Update: {
          completion_status?: string | null
          created_at?: string | null
          duration_seconds?: number | null
          feedback_rating?: number | null
          feedback_text?: string | null
          id?: string
          input_data?: Json | null
          output_data?: Json | null
          tool_name?: string
          tool_slug?: string
          updated_at?: string | null
          usage_type?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      trending_topics_by_role: {
        Row: {
          created_at: string | null
          engagement_score: number | null
          id: string
          role: string
          trending_topics: Json | null
          updated_at: string | null
          week_start: string | null
        }
        Insert: {
          created_at?: string | null
          engagement_score?: number | null
          id?: string
          role: string
          trending_topics?: Json | null
          updated_at?: string | null
          week_start?: string | null
        }
        Update: {
          created_at?: string | null
          engagement_score?: number | null
          id?: string
          role?: string
          trending_topics?: Json | null
          updated_at?: string | null
          week_start?: string | null
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
      user_achievements: {
        Row: {
          achievement_type: string
          badge_icon: string | null
          community_id: string | null
          description: string | null
          earned_at: string | null
          id: string
          points: number | null
          title: string
          user_id: string | null
        }
        Insert: {
          achievement_type: string
          badge_icon?: string | null
          community_id?: string | null
          description?: string | null
          earned_at?: string | null
          id?: string
          points?: number | null
          title: string
          user_id?: string | null
        }
        Update: {
          achievement_type?: string
          badge_icon?: string | null
          community_id?: string | null
          description?: string | null
          earned_at?: string | null
          id?: string
          points?: number | null
          title?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_achievements_community_id_fkey"
            columns: ["community_id"]
            isOneToOne: false
            referencedRelation: "goal_communities"
            referencedColumns: ["id"]
          },
        ]
      }
      user_analytics: {
        Row: {
          created_at: string | null
          event_category: string
          event_data: Json | null
          event_type: string
          id: string
          ip_address: unknown | null
          page_url: string | null
          session_id: string | null
          user_agent: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          event_category: string
          event_data?: Json | null
          event_type: string
          id?: string
          ip_address?: unknown | null
          page_url?: string | null
          session_id?: string | null
          user_agent?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          event_category?: string
          event_data?: Json | null
          event_type?: string
          id?: string
          ip_address?: unknown | null
          page_url?: string | null
          session_id?: string | null
          user_agent?: string | null
          user_id?: string
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
      user_assessment_results: {
        Row: {
          answers: Json | null
          assessment_id: string
          attempted_at: string | null
          id: string
          passed: boolean
          score: number
          time_taken_minutes: number | null
          user_id: string
        }
        Insert: {
          answers?: Json | null
          assessment_id: string
          attempted_at?: string | null
          id?: string
          passed: boolean
          score: number
          time_taken_minutes?: number | null
          user_id: string
        }
        Update: {
          answers?: Json | null
          assessment_id?: string
          attempted_at?: string | null
          id?: string
          passed?: boolean
          score?: number
          time_taken_minutes?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_assessment_results_assessment_id_fkey"
            columns: ["assessment_id"]
            isOneToOne: false
            referencedRelation: "skill_assessments"
            referencedColumns: ["id"]
          },
        ]
      }
      user_behavior_analytics: {
        Row: {
          element_selector: string | null
          event_data: Json | null
          event_type: string
          id: string
          ip_address: unknown | null
          page_url: string
          session_id: string | null
          timestamp: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          element_selector?: string | null
          event_data?: Json | null
          event_type: string
          id?: string
          ip_address?: unknown | null
          page_url: string
          session_id?: string | null
          timestamp?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          element_selector?: string | null
          event_data?: Json | null
          event_type?: string
          id?: string
          ip_address?: unknown | null
          page_url?: string
          session_id?: string | null
          timestamp?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      user_career_goals: {
        Row: {
          created_at: string | null
          current_readiness_score: number | null
          id: string
          progress_milestones: Json | null
          recommended_courses: string[] | null
          recommended_paths: string[] | null
          skill_gaps: Json | null
          status: string | null
          target_location: string | null
          target_role: string
          target_salary: number | null
          timeline_months: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          current_readiness_score?: number | null
          id?: string
          progress_milestones?: Json | null
          recommended_courses?: string[] | null
          recommended_paths?: string[] | null
          skill_gaps?: Json | null
          status?: string | null
          target_location?: string | null
          target_role: string
          target_salary?: number | null
          timeline_months?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          current_readiness_score?: number | null
          id?: string
          progress_milestones?: Json | null
          recommended_courses?: string[] | null
          recommended_paths?: string[] | null
          skill_gaps?: Json | null
          status?: string | null
          target_location?: string | null
          target_role?: string
          target_salary?: number | null
          timeline_months?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_course_progress: {
        Row: {
          certificate_earned: boolean | null
          certificate_url: string | null
          completion_date: string | null
          course_id: string
          created_at: string | null
          current_module: string | null
          enrollment_date: string | null
          id: string
          progress_percentage: number | null
          status: string | null
          time_spent_hours: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          certificate_earned?: boolean | null
          certificate_url?: string | null
          completion_date?: string | null
          course_id: string
          created_at?: string | null
          current_module?: string | null
          enrollment_date?: string | null
          id?: string
          progress_percentage?: number | null
          status?: string | null
          time_spent_hours?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          certificate_earned?: boolean | null
          certificate_url?: string | null
          completion_date?: string | null
          course_id?: string
          created_at?: string | null
          current_module?: string | null
          enrollment_date?: string | null
          id?: string
          progress_percentage?: number | null
          status?: string | null
          time_spent_hours?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_course_progress_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
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
      user_department_assignments: {
        Row: {
          assignment_type: string | null
          created_at: string | null
          created_by: string | null
          department_id: string | null
          end_date: string | null
          id: string
          is_primary: boolean | null
          organization_id: string | null
          role_id: string | null
          start_date: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          assignment_type?: string | null
          created_at?: string | null
          created_by?: string | null
          department_id?: string | null
          end_date?: string | null
          id?: string
          is_primary?: boolean | null
          organization_id?: string | null
          role_id?: string | null
          start_date?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          assignment_type?: string | null
          created_at?: string | null
          created_by?: string | null
          department_id?: string | null
          end_date?: string | null
          id?: string
          is_primary?: boolean | null
          organization_id?: string | null
          role_id?: string | null
          start_date?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_department_assignments_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "organization_departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_department_assignments_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_department_assignments_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "organization_roles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_engagement_metrics: {
        Row: {
          content_quality_avg: number | null
          created_at: string | null
          engagement_rate: number | null
          id: string
          influence_score: number | null
          network_reach: number | null
          updated_at: string | null
          user_id: string
          weekly_growth: number | null
        }
        Insert: {
          content_quality_avg?: number | null
          created_at?: string | null
          engagement_rate?: number | null
          id?: string
          influence_score?: number | null
          network_reach?: number | null
          updated_at?: string | null
          user_id: string
          weekly_growth?: number | null
        }
        Update: {
          content_quality_avg?: number | null
          created_at?: string | null
          engagement_rate?: number | null
          id?: string
          influence_score?: number | null
          network_reach?: number | null
          updated_at?: string | null
          user_id?: string
          weekly_growth?: number | null
        }
        Relationships: []
      }
      user_job_preferences: {
        Row: {
          career_growth_importance: number | null
          company_culture_importance: number | null
          created_at: string | null
          id: string
          preferred_company_sizes: string[] | null
          preferred_industries: string[] | null
          preferred_locations: string[] | null
          preferred_roles: string[] | null
          remote_work_preference: string | null
          salary_max: number | null
          salary_min: number | null
          updated_at: string | null
          user_id: string
          work_life_balance_importance: number | null
        }
        Insert: {
          career_growth_importance?: number | null
          company_culture_importance?: number | null
          created_at?: string | null
          id?: string
          preferred_company_sizes?: string[] | null
          preferred_industries?: string[] | null
          preferred_locations?: string[] | null
          preferred_roles?: string[] | null
          remote_work_preference?: string | null
          salary_max?: number | null
          salary_min?: number | null
          updated_at?: string | null
          user_id: string
          work_life_balance_importance?: number | null
        }
        Update: {
          career_growth_importance?: number | null
          company_culture_importance?: number | null
          created_at?: string | null
          id?: string
          preferred_company_sizes?: string[] | null
          preferred_industries?: string[] | null
          preferred_locations?: string[] | null
          preferred_roles?: string[] | null
          remote_work_preference?: string | null
          salary_max?: number | null
          salary_min?: number | null
          updated_at?: string | null
          user_id?: string
          work_life_balance_importance?: number | null
        }
        Relationships: []
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
      user_management_actions: {
        Row: {
          action_type: string
          admin_user_id: string
          created_at: string | null
          expires_at: string | null
          id: string
          metadata: Json | null
          reason: string | null
          target_user_id: string
        }
        Insert: {
          action_type: string
          admin_user_id: string
          created_at?: string | null
          expires_at?: string | null
          id?: string
          metadata?: Json | null
          reason?: string | null
          target_user_id: string
        }
        Update: {
          action_type?: string
          admin_user_id?: string
          created_at?: string | null
          expires_at?: string | null
          id?: string
          metadata?: Json | null
          reason?: string | null
          target_user_id?: string
        }
        Relationships: []
      }
      user_posts: {
        Row: {
          author_id: string
          comments_count: number | null
          content: string
          created_at: string | null
          id: string
          is_featured: boolean | null
          likes_count: number | null
          media_urls: string[] | null
          post_type: string
          shares_count: number | null
          tags: string[] | null
          title: string
          updated_at: string | null
          views_count: number | null
        }
        Insert: {
          author_id: string
          comments_count?: number | null
          content: string
          created_at?: string | null
          id?: string
          is_featured?: boolean | null
          likes_count?: number | null
          media_urls?: string[] | null
          post_type: string
          shares_count?: number | null
          tags?: string[] | null
          title: string
          updated_at?: string | null
          views_count?: number | null
        }
        Update: {
          author_id?: string
          comments_count?: number | null
          content?: string
          created_at?: string | null
          id?: string
          is_featured?: boolean | null
          likes_count?: number | null
          media_urls?: string[] | null
          post_type?: string
          shares_count?: number | null
          tags?: string[] | null
          title?: string
          updated_at?: string | null
          views_count?: number | null
        }
        Relationships: []
      }
      user_progress: {
        Row: {
          communities_joined: number | null
          connections_made: number | null
          current_streak: number | null
          id: string
          last_activity_at: string | null
          longest_streak: number | null
          posts_created: number | null
          total_points: number | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          communities_joined?: number | null
          connections_made?: number | null
          current_streak?: number | null
          id?: string
          last_activity_at?: string | null
          longest_streak?: number | null
          posts_created?: number | null
          total_points?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          communities_joined?: number | null
          connections_made?: number | null
          current_streak?: number | null
          id?: string
          last_activity_at?: string | null
          longest_streak?: number | null
          posts_created?: number | null
          total_points?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      user_push_tokens: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          platform: string
          push_token: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          platform: string
          push_token: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          platform?: string
          push_token?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
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
      user_skills: {
        Row: {
          created_at: string | null
          id: string
          last_used_date: string | null
          proficiency_level: number
          proficiency_type: string | null
          skill_id: string
          updated_at: string | null
          user_id: string
          verification_details: Json | null
          years_experience: number | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          last_used_date?: string | null
          proficiency_level: number
          proficiency_type?: string | null
          skill_id: string
          updated_at?: string | null
          user_id: string
          verification_details?: Json | null
          years_experience?: number | null
        }
        Update: {
          created_at?: string | null
          id?: string
          last_used_date?: string | null
          proficiency_level?: number
          proficiency_type?: string | null
          skill_id?: string
          updated_at?: string | null
          user_id?: string
          verification_details?: Json | null
          years_experience?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "user_skills_skill_id_fkey"
            columns: ["skill_id"]
            isOneToOne: false
            referencedRelation: "skills_master"
            referencedColumns: ["id"]
          },
        ]
      }
      user_subscriptions: {
        Row: {
          cancelled_at: string | null
          created_at: string
          current_period_end: string | null
          current_period_start: string | null
          id: string
          plan_id: string
          razorpay_customer_id: string | null
          razorpay_subscription_id: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          cancelled_at?: string | null
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          plan_id: string
          razorpay_customer_id?: string | null
          razorpay_subscription_id?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          cancelled_at?: string | null
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          plan_id?: string
          razorpay_customer_id?: string | null
          razorpay_subscription_id?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_subscriptions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "subscription_plans"
            referencedColumns: ["id"]
          },
        ]
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
      user_verification_requests: {
        Row: {
          admin_notes: string | null
          created_at: string
          expires_at: string | null
          id: string
          rejection_reason: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          submitted_at: string
          submitted_documents: Json | null
          updated_at: string
          user_id: string
          verification_status: string
          verification_type: string
        }
        Insert: {
          admin_notes?: string | null
          created_at?: string
          expires_at?: string | null
          id?: string
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          submitted_at?: string
          submitted_documents?: Json | null
          updated_at?: string
          user_id: string
          verification_status?: string
          verification_type: string
        }
        Update: {
          admin_notes?: string | null
          created_at?: string
          expires_at?: string | null
          id?: string
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          submitted_at?: string
          submitted_documents?: Json | null
          updated_at?: string
          user_id?: string
          verification_status?: string
          verification_type?: string
        }
        Relationships: []
      }
      users_profile: {
        Row: {
          created_at: string | null
          email: string | null
          full_name: string | null
          id: string
          linkedin_url: string | null
          location: string | null
          phone: string | null
          professional_summary: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          linkedin_url?: string | null
          location?: string | null
          phone?: string | null
          professional_summary?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          linkedin_url?: string | null
          location?: string | null
          phone?: string | null
          professional_summary?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      volunteer_experience: {
        Row: {
          created_at: string | null
          description: string | null
          end_date: string | null
          id: string
          organization: string | null
          role: string | null
          start_date: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          organization?: string | null
          role?: string | null
          start_date?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          organization?: string | null
          role?: string | null
          start_date?: string | null
          user_id?: string
        }
        Relationships: []
      }
      webhook_delivery_logs: {
        Row: {
          created_at: string | null
          delivered_at: string | null
          delivery_attempt: number | null
          error_message: string | null
          event_type: string
          id: string
          payload: Json
          response_body: string | null
          response_status: number | null
          webhook_id: string | null
        }
        Insert: {
          created_at?: string | null
          delivered_at?: string | null
          delivery_attempt?: number | null
          error_message?: string | null
          event_type: string
          id?: string
          payload: Json
          response_body?: string | null
          response_status?: number | null
          webhook_id?: string | null
        }
        Update: {
          created_at?: string | null
          delivered_at?: string | null
          delivery_attempt?: number | null
          error_message?: string | null
          event_type?: string
          id?: string
          payload?: Json
          response_body?: string | null
          response_status?: number | null
          webhook_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "webhook_delivery_logs_webhook_id_fkey"
            columns: ["webhook_id"]
            isOneToOne: false
            referencedRelation: "enterprise_webhooks"
            referencedColumns: ["id"]
          },
        ]
      }
      work_experience: {
        Row: {
          company_name: string | null
          created_at: string | null
          end_date: string | null
          id: string
          job_title: string | null
          key_achievements: string[] | null
          location: string | null
          responsibilities: string[] | null
          start_date: string | null
          technologies_used: string[] | null
          user_id: string
        }
        Insert: {
          company_name?: string | null
          created_at?: string | null
          end_date?: string | null
          id?: string
          job_title?: string | null
          key_achievements?: string[] | null
          location?: string | null
          responsibilities?: string[] | null
          start_date?: string | null
          technologies_used?: string[] | null
          user_id: string
        }
        Update: {
          company_name?: string | null
          created_at?: string | null
          end_date?: string | null
          id?: string
          job_title?: string | null
          key_achievements?: string[] | null
          location?: string | null
          responsibilities?: string[] | null
          start_date?: string | null
          technologies_used?: string[] | null
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      accept_team_invitation: {
        Args: { invitation_token: string }
        Returns: Json
      }
      activate_pro_subscription: {
        Args: {
          p_user_id: string
          p_plan_name: string
          p_price_amount: number
          p_razorpay_payment_id: string
          p_duration_months?: number
        }
        Returns: string
      }
      approve_college_creation: {
        Args: { request_id: string }
        Returns: string
      }
      approve_company_access_request: {
        Args: { request_id: string }
        Returns: undefined
      }
      approve_employer_request: {
        Args: { request_id: string }
        Returns: undefined
      }
      approve_team_invitation_request: {
        Args: { request_id: string }
        Returns: Json
      }
      calculate_company_engagement_score: {
        Args: { company_uuid: string }
        Returns: number
      }
      calculate_job_skill_match: {
        Args: { job_uuid: string; user_uuid: string }
        Returns: {
          match_percentage: number
          matching_skills: Json
          missing_skills: Json
          skill_gaps: Json
        }[]
      }
      calculate_reading_time: {
        Args: { content_text: string }
        Returns: number
      }
      calculate_resume_completion_enhanced: {
        Args: { resume_uuid: string }
        Returns: number
      }
      check_vanity_url_availability: {
        Args: { url: string }
        Returns: boolean
      }
      cleanup_old_notifications: {
        Args: Record<PropertyKey, never>
        Returns: number
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
      count_words: {
        Args: { content_text: string }
        Returns: number
      }
      create_notification: {
        Args: {
          p_user_id: string
          p_type: string
          p_title: string
          p_message: string
          p_module: string
          p_related_id?: string
          p_link?: string
          p_priority?: string
          p_icon?: string
        }
        Returns: string
      }
      create_permission_request: {
        Args: {
          _company_id: string
          _permission_type: string
          _reason: string
          _resource_id?: string
        }
        Returns: string
      }
      ensure_unique_college_slug: {
        Args: { base_slug: string; college_id?: string }
        Returns: string
      }
      ensure_unique_slug: {
        Args: { base_slug: string; company_id?: string }
        Returns: string
      }
      generate_college_slug: {
        Args: { college_name: string }
        Returns: string
      }
      generate_company_slug: {
        Args: { company_name: string }
        Returns: string
      }
      generate_resume_slug_enhanced: {
        Args: { resume_title: string; user_uuid: string }
        Returns: string
      }
      generate_service_slug: {
        Args: { service_title: string; provider_id: string }
        Returns: string
      }
      generate_vanity_url_suggestions: {
        Args: { base_name: string }
        Returns: string[]
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
      get_user_pro_plan: {
        Args: { p_user_id: string }
        Returns: string
      }
      get_user_subscription_tier: {
        Args: { user_uuid: string }
        Returns: string
      }
      has_app_role: {
        Args: {
          _user_id: string
          _role: Database["public"]["Enums"]["app_role"]
        }
        Returns: boolean
      }
      has_team_permission: {
        Args: {
          _user_id: string
          _company_id: string
          _permission_type: string
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
      is_pro_user: {
        Args: { p_user_id: string }
        Returns: boolean
      }
      is_super_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      log_enterprise_audit: {
        Args: {
          p_organization_id: string
          p_user_id: string
          p_action_type: string
          p_resource_type: string
          p_resource_id?: string
          p_event_details?: Json
          p_risk_level?: string
          p_compliance_category?: string
        }
        Returns: string
      }
      log_team_activity: {
        Args: {
          _company_id: string
          _user_id: string
          _action_type: string
          _resource_type?: string
          _resource_id?: string
          _details?: Json
        }
        Returns: undefined
      }
      queue_automated_email: {
        Args: {
          p_trigger_type: string
          p_recipient_email: string
          p_recipient_name?: string
          p_template_data?: Json
          p_delay_minutes?: number
        }
        Returns: string
      }
      queue_profile_completion_reminders: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      reject_company_access_request: {
        Args: { request_id: string; reason?: string }
        Returns: undefined
      }
      reject_employer_request: {
        Args: { request_id: string; reason?: string }
        Returns: undefined
      }
      reject_team_invitation_request: {
        Args: { request_id: string; reason?: string }
        Returns: Json
      }
      send_system_notification: {
        Args: {
          p_user_ids: string[]
          p_title: string
          p_message: string
          p_module?: string
          p_priority?: string
          p_link?: string
        }
        Returns: number
      }
      setup_multiple_pro_users: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      simulate_delivery_events_for_sent_emails: {
        Args: Record<PropertyKey, never>
        Returns: {
          processed_count: number
          simulated_events: number
        }[]
      }
      track_public_post_view: {
        Args: {
          p_post_id: string
          p_viewer_ip?: unknown
          p_user_agent?: string
          p_referrer?: string
          p_session_id?: string
        }
        Returns: string
      }
      track_share_analytics: {
        Args: {
          p_content_type: string
          p_content_id: string
          p_platform: string
          p_share_url: string
          p_shared_by?: string
          p_referrer?: string
          p_user_agent?: string
        }
        Returns: string
      }
      track_template_usage: {
        Args: {
          template_uuid: string
          user_uuid: string
          action_type: string
          metadata?: Json
        }
        Returns: undefined
      }
      update_ai_feature_status: {
        Args: {
          p_module_name: string
          p_feature_key: string
          p_success: boolean
          p_response_time?: number
          p_error_message?: string
        }
        Returns: undefined
      }
      update_upload_progress: {
        Args: {
          status_id: string
          new_status: string
          new_step: string
          new_progress: number
          error_msg?: string
        }
        Returns: undefined
      }
      update_user_login: {
        Args: { user_uuid: string }
        Returns: undefined
      }
      upsert_daily_analytics: {
        Args: { p_date: string; p_field: string; p_increment?: number }
        Returns: undefined
      }
      user_has_feature_access: {
        Args: { user_uuid: string; feature_name: string }
        Returns: boolean
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
      article_category:
        | "news"
        | "opinion"
        | "tutorial"
        | "industry_update"
        | "career_advice"
        | "technology"
        | "business"
        | "other"
      interview_status: "scheduled" | "completed" | "cancelled" | "rescheduled"
      team_role: "admin" | "recruiter" | "hr_manager" | "viewer" | "owner"
      user_role: "job_seeker" | "employer" | "admin" | "candidate"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
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
      article_category: [
        "news",
        "opinion",
        "tutorial",
        "industry_update",
        "career_advice",
        "technology",
        "business",
        "other",
      ],
      interview_status: ["scheduled", "completed", "cancelled", "rescheduled"],
      team_role: ["admin", "recruiter", "hr_manager", "viewer", "owner"],
      user_role: ["job_seeker", "employer", "admin", "candidate"],
    },
  },
} as const
