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
      accounts: {
        Row: {
          amount: number
          created_at: string
          currency: string
          id: string
          points: number
          status: string
          type: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          amount?: number
          created_at?: string
          currency?: string
          id?: string
          points?: number
          status?: string
          type: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string
          id?: string
          points?: number
          status?: string
          type?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "accounts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      agent_interactions: {
        Row: {
          agent_id: string
          agent_response: string
          context_data: Json | null
          conversation_id: string | null
          created_at: string
          id: string
          interaction_type: string
          outcome: string | null
          property_id: string | null
          response_time_ms: number | null
          updated_at: string
          user_id: string
          user_message: string
          user_satisfaction_score: number | null
        }
        Insert: {
          agent_id: string
          agent_response: string
          context_data?: Json | null
          conversation_id?: string | null
          created_at?: string
          id?: string
          interaction_type: string
          outcome?: string | null
          property_id?: string | null
          response_time_ms?: number | null
          updated_at?: string
          user_id: string
          user_message: string
          user_satisfaction_score?: number | null
        }
        Update: {
          agent_id?: string
          agent_response?: string
          context_data?: Json | null
          conversation_id?: string | null
          created_at?: string
          id?: string
          interaction_type?: string
          outcome?: string | null
          property_id?: string | null
          response_time_ms?: number | null
          updated_at?: string
          user_id?: string
          user_message?: string
          user_satisfaction_score?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "agent_interactions_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agent_interactions_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      agent_performance_metrics: {
        Row: {
          agent_id: string
          created_at: string
          id: string
          metadata: Json | null
          metric_type: string
          metric_value: number | null
          period_end: string
          period_start: string
          sample_size: number | null
        }
        Insert: {
          agent_id: string
          created_at?: string
          id?: string
          metadata?: Json | null
          metric_type: string
          metric_value?: number | null
          period_end: string
          period_start: string
          sample_size?: number | null
        }
        Update: {
          agent_id?: string
          created_at?: string
          id?: string
          metadata?: Json | null
          metric_type?: string
          metric_value?: number | null
          period_end?: string
          period_start?: string
          sample_size?: number | null
        }
        Relationships: []
      }
      ai_property_valuations: {
        Row: {
          ai_estimated_value: number
          ai_model: string | null
          confidence_score: number
          created_at: string
          id: string
          market_comparisons: Json | null
          property_id: string | null
          updated_at: string
          user_id: string
          valuation_factors: Json | null
        }
        Insert: {
          ai_estimated_value: number
          ai_model?: string | null
          confidence_score: number
          created_at?: string
          id?: string
          market_comparisons?: Json | null
          property_id?: string | null
          updated_at?: string
          user_id: string
          valuation_factors?: Json | null
        }
        Update: {
          ai_estimated_value?: number
          ai_model?: string | null
          confidence_score?: number
          created_at?: string
          id?: string
          market_comparisons?: Json | null
          property_id?: string | null
          updated_at?: string
          user_id?: string
          valuation_factors?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_property_valuations_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      aml_checks: {
        Row: {
          alerts: Json | null
          check_type: string
          created_at: string
          id: string
          provider: string
          request_payload: Json
          response_payload: Json
          review_notes: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          risk_level: string | null
          risk_score: number | null
          status: string
          transaction_id: string | null
          user_id: string
        }
        Insert: {
          alerts?: Json | null
          check_type: string
          created_at?: string
          id?: string
          provider: string
          request_payload: Json
          response_payload: Json
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          risk_level?: string | null
          risk_score?: number | null
          status?: string
          transaction_id?: string | null
          user_id: string
        }
        Update: {
          alerts?: Json | null
          check_type?: string
          created_at?: string
          id?: string
          provider?: string
          request_payload?: Json
          response_payload?: Json
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          risk_level?: string | null
          risk_score?: number | null
          status?: string
          transaction_id?: string | null
          user_id?: string
        }
        Relationships: []
      }
      api_keys: {
        Row: {
          created_at: string
          description: string | null
          expires_at: string | null
          id: string
          is_active: boolean
          key_hash: string
          last_used_at: string | null
          name: string
          permissions: Json
          rate_limit_per_day: number | null
          rate_limit_per_hour: number | null
          rate_limit_per_minute: number | null
          updated_at: string
          usage_count: number
          user_id: string
          webhook_secret: string | null
          webhook_url: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean
          key_hash: string
          last_used_at?: string | null
          name: string
          permissions?: Json
          rate_limit_per_day?: number | null
          rate_limit_per_hour?: number | null
          rate_limit_per_minute?: number | null
          updated_at?: string
          usage_count?: number
          user_id: string
          webhook_secret?: string | null
          webhook_url?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean
          key_hash?: string
          last_used_at?: string | null
          name?: string
          permissions?: Json
          rate_limit_per_day?: number | null
          rate_limit_per_hour?: number | null
          rate_limit_per_minute?: number | null
          updated_at?: string
          usage_count?: number
          user_id?: string
          webhook_secret?: string | null
          webhook_url?: string | null
        }
        Relationships: []
      }
      auction_listings: {
        Row: {
          auction_type: string
          auctioneer_id: string
          auto_extend: boolean
          bid_increment: number
          created_at: string
          current_bid: number | null
          end_time: string
          extension_time_minutes: number | null
          high_bidder_id: string | null
          id: string
          property_id: string
          reserve_price: number | null
          start_time: string
          starting_price: number
          status: string
          terms_and_conditions: string | null
          tokenized_property_id: string | null
          total_bids: number
          updated_at: string
        }
        Insert: {
          auction_type?: string
          auctioneer_id: string
          auto_extend?: boolean
          bid_increment?: number
          created_at?: string
          current_bid?: number | null
          end_time: string
          extension_time_minutes?: number | null
          high_bidder_id?: string | null
          id?: string
          property_id: string
          reserve_price?: number | null
          start_time: string
          starting_price: number
          status?: string
          terms_and_conditions?: string | null
          tokenized_property_id?: string | null
          total_bids?: number
          updated_at?: string
        }
        Update: {
          auction_type?: string
          auctioneer_id?: string
          auto_extend?: boolean
          bid_increment?: number
          created_at?: string
          current_bid?: number | null
          end_time?: string
          extension_time_minutes?: number | null
          high_bidder_id?: string | null
          id?: string
          property_id?: string
          reserve_price?: number | null
          start_time?: string
          starting_price?: number
          status?: string
          terms_and_conditions?: string | null
          tokenized_property_id?: string | null
          total_bids?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "auction_listings_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "auction_listings_tokenized_property_id_fkey"
            columns: ["tokenized_property_id"]
            isOneToOne: false
            referencedRelation: "tokenized_properties"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_trails: {
        Row: {
          action: string
          api_endpoint: string | null
          created_at: string
          flag_reason: string | null
          flagged: boolean
          http_method: string | null
          id: string
          ip_address: unknown | null
          new_values: Json | null
          old_values: Json | null
          processing_time_ms: number | null
          request_id: string | null
          resource_id: string | null
          resource_type: string
          response_status: number | null
          risk_score: number | null
          session_id: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          api_endpoint?: string | null
          created_at?: string
          flag_reason?: string | null
          flagged?: boolean
          http_method?: string | null
          id?: string
          ip_address?: unknown | null
          new_values?: Json | null
          old_values?: Json | null
          processing_time_ms?: number | null
          request_id?: string | null
          resource_id?: string | null
          resource_type: string
          response_status?: number | null
          risk_score?: number | null
          session_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          api_endpoint?: string | null
          created_at?: string
          flag_reason?: string | null
          flagged?: boolean
          http_method?: string | null
          id?: string
          ip_address?: unknown | null
          new_values?: Json | null
          old_values?: Json | null
          processing_time_ms?: number | null
          request_id?: string | null
          resource_id?: string | null
          resource_type?: string
          response_status?: number | null
          risk_score?: number | null
          session_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_trails_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      backup_recovery: {
        Row: {
          backup_hash: string | null
          backup_location: string
          backup_scope: string
          backup_size_bytes: number | null
          backup_type: string
          completed_at: string | null
          compression_enabled: boolean
          compression_ratio: number | null
          created_by: string | null
          encryption_enabled: boolean
          error_message: string | null
          id: string
          last_recovery_test: string | null
          recovery_tested: boolean
          retention_until: string
          started_at: string
          status: string
        }
        Insert: {
          backup_hash?: string | null
          backup_location: string
          backup_scope: string
          backup_size_bytes?: number | null
          backup_type: string
          completed_at?: string | null
          compression_enabled?: boolean
          compression_ratio?: number | null
          created_by?: string | null
          encryption_enabled?: boolean
          error_message?: string | null
          id?: string
          last_recovery_test?: string | null
          recovery_tested?: boolean
          retention_until: string
          started_at?: string
          status?: string
        }
        Update: {
          backup_hash?: string | null
          backup_location?: string
          backup_scope?: string
          backup_size_bytes?: number | null
          backup_type?: string
          completed_at?: string | null
          compression_enabled?: boolean
          compression_ratio?: number | null
          created_by?: string | null
          encryption_enabled?: boolean
          error_message?: string | null
          id?: string
          last_recovery_test?: string | null
          recovery_tested?: boolean
          retention_until?: string
          started_at?: string
          status?: string
        }
        Relationships: []
      }
      bank_cache: {
        Row: {
          created_at: string
          data: Json | null
          id: number
          updated_at: string | null
        }
        Insert: {
          created_at?: string
          data?: Json | null
          id?: number
          updated_at?: string | null
        }
        Update: {
          created_at?: string
          data?: Json | null
          id?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      blog_categories: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          slug: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          slug: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          slug?: string
        }
        Relationships: []
      }
      blog_post_categories: {
        Row: {
          category_id: string
          id: string
          post_id: string
        }
        Insert: {
          category_id: string
          id?: string
          post_id: string
        }
        Update: {
          category_id?: string
          id?: string
          post_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "blog_post_categories_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "blog_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "blog_post_categories_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "blog_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      blog_posts: {
        Row: {
          author_id: string
          content: string
          created_at: string
          excerpt: string | null
          featured: boolean
          featured_image_url: string | null
          id: string
          meta_description: string | null
          meta_title: string | null
          published: boolean
          published_at: string | null
          slug: string
          tags: string[] | null
          title: string
          updated_at: string
          views: number
        }
        Insert: {
          author_id: string
          content: string
          created_at?: string
          excerpt?: string | null
          featured?: boolean
          featured_image_url?: string | null
          id?: string
          meta_description?: string | null
          meta_title?: string | null
          published?: boolean
          published_at?: string | null
          slug: string
          tags?: string[] | null
          title: string
          updated_at?: string
          views?: number
        }
        Update: {
          author_id?: string
          content?: string
          created_at?: string
          excerpt?: string | null
          featured?: boolean
          featured_image_url?: string | null
          id?: string
          meta_description?: string | null
          meta_title?: string | null
          published?: boolean
          published_at?: string | null
          slug?: string
          tags?: string[] | null
          title?: string
          updated_at?: string
          views?: number
        }
        Relationships: []
      }
      chat_messages: {
        Row: {
          attachment_url: string | null
          content: string
          conversation_id: string | null
          created_at: string | null
          edited_at: string | null
          id: string
          message_type: string | null
          metadata: Json | null
          reply_to_id: string | null
          sender_id: string | null
          updated_at: string | null
        }
        Insert: {
          attachment_url?: string | null
          content: string
          conversation_id?: string | null
          created_at?: string | null
          edited_at?: string | null
          id?: string
          message_type?: string | null
          metadata?: Json | null
          reply_to_id?: string | null
          sender_id?: string | null
          updated_at?: string | null
        }
        Update: {
          attachment_url?: string | null
          content?: string
          conversation_id?: string | null
          created_at?: string | null
          edited_at?: string | null
          id?: string
          message_type?: string | null
          metadata?: Json | null
          reply_to_id?: string | null
          sender_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_messages_reply_to_id_fkey"
            columns: ["reply_to_id"]
            isOneToOne: false
            referencedRelation: "chat_messages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      compliance_records: {
        Row: {
          authority: string
          compliance_type: Database["public"]["Enums"]["compliance_type"]
          created_at: string
          document_url: string | null
          expiry_date: string | null
          id: string
          issue_date: string
          land_title_id: string
          metadata: Json | null
          reference_number: string
          renewal_reminder_sent: boolean | null
          status: Database["public"]["Enums"]["compliance_status"] | null
          updated_at: string
        }
        Insert: {
          authority: string
          compliance_type: Database["public"]["Enums"]["compliance_type"]
          created_at?: string
          document_url?: string | null
          expiry_date?: string | null
          id?: string
          issue_date: string
          land_title_id: string
          metadata?: Json | null
          reference_number: string
          renewal_reminder_sent?: boolean | null
          status?: Database["public"]["Enums"]["compliance_status"] | null
          updated_at?: string
        }
        Update: {
          authority?: string
          compliance_type?: Database["public"]["Enums"]["compliance_type"]
          created_at?: string
          document_url?: string | null
          expiry_date?: string | null
          id?: string
          issue_date?: string
          land_title_id?: string
          metadata?: Json | null
          reference_number?: string
          renewal_reminder_sent?: boolean | null
          status?: Database["public"]["Enums"]["compliance_status"] | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "compliance_records_land_title_id_fkey"
            columns: ["land_title_id"]
            isOneToOne: false
            referencedRelation: "land_titles"
            referencedColumns: ["id"]
          },
        ]
      }
      compliance_reports: {
        Row: {
          acknowledgment_received_at: string | null
          created_at: string
          file_url: string | null
          id: string
          jurisdiction: string
          regulator: string | null
          report_data: Json
          report_type: string
          reporting_period_end: string
          reporting_period_start: string
          status: string
          submission_reference: string | null
          submitted_at: string | null
          submitted_by: string | null
          updated_at: string
        }
        Insert: {
          acknowledgment_received_at?: string | null
          created_at?: string
          file_url?: string | null
          id?: string
          jurisdiction: string
          regulator?: string | null
          report_data: Json
          report_type: string
          reporting_period_end: string
          reporting_period_start: string
          status?: string
          submission_reference?: string | null
          submitted_at?: string | null
          submitted_by?: string | null
          updated_at?: string
        }
        Update: {
          acknowledgment_received_at?: string | null
          created_at?: string
          file_url?: string | null
          id?: string
          jurisdiction?: string
          regulator?: string | null
          report_data?: Json
          report_type?: string
          reporting_period_end?: string
          reporting_period_start?: string
          status?: string
          submission_reference?: string | null
          submitted_at?: string | null
          submitted_by?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      contacts_us: {
        Row: {
          created_at: string | null
          email: string
          first_name: string
          id: string
          last_name: string
          message: string
          phone_number: string
        }
        Insert: {
          created_at?: string | null
          email: string
          first_name: string
          id?: string
          last_name: string
          message: string
          phone_number: string
        }
        Update: {
          created_at?: string | null
          email?: string
          first_name?: string
          id?: string
          last_name?: string
          message?: string
          phone_number?: string
        }
        Relationships: []
      }
      conversation_contexts: {
        Row: {
          agent_id: string
          context_data: Json
          conversation_id: string | null
          current_intent: string | null
          id: string
          is_active: boolean | null
          last_interaction: string
          search_history: Json | null
          session_start: string
          user_id: string
        }
        Insert: {
          agent_id: string
          context_data: Json
          conversation_id?: string | null
          current_intent?: string | null
          id?: string
          is_active?: boolean | null
          last_interaction?: string
          search_history?: Json | null
          session_start?: string
          user_id: string
        }
        Update: {
          agent_id?: string
          context_data?: Json
          conversation_id?: string | null
          current_intent?: string | null
          id?: string
          is_active?: boolean | null
          last_interaction?: string
          search_history?: Json | null
          session_start?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversation_contexts_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          activity_type: Database["public"]["Enums"]["activity_type"] | null
          admin_id: string
          avatar_url: string | null
          created_at: string
          description: string | null
          id: string
          is_archived: boolean
          metadata: Json | null
          name: string
          participants: string[]
          settings: Json
          type: string
          updated_at: string
        }
        Insert: {
          activity_type?: Database["public"]["Enums"]["activity_type"] | null
          admin_id: string
          avatar_url?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_archived?: boolean
          metadata?: Json | null
          name: string
          participants: string[]
          settings?: Json
          type: string
          updated_at?: string
        }
        Update: {
          activity_type?: Database["public"]["Enums"]["activity_type"] | null
          admin_id?: string
          avatar_url?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_archived?: boolean
          metadata?: Json | null
          name?: string
          participants?: string[]
          settings?: Json
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversations_admin_id_fkey"
            columns: ["admin_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      dividend_payments: {
        Row: {
          amount: number
          created_at: string
          currency: string
          external_transaction_id: string | null
          id: string
          net_amount: number
          paid_at: string | null
          payment_method: string
          recipient_id: string
          revenue_distribution_id: string
          status: string
          tax_withholding: number | null
          token_holding_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          currency?: string
          external_transaction_id?: string | null
          id?: string
          net_amount: number
          paid_at?: string | null
          payment_method?: string
          recipient_id: string
          revenue_distribution_id: string
          status?: string
          tax_withholding?: number | null
          token_holding_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string
          external_transaction_id?: string | null
          id?: string
          net_amount?: number
          paid_at?: string | null
          payment_method?: string
          recipient_id?: string
          revenue_distribution_id?: string
          status?: string
          tax_withholding?: number | null
          token_holding_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "dividend_payments_revenue_distribution_id_fkey"
            columns: ["revenue_distribution_id"]
            isOneToOne: false
            referencedRelation: "revenue_distributions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dividend_payments_token_holding_id_fkey"
            columns: ["token_holding_id"]
            isOneToOne: false
            referencedRelation: "token_holdings"
            referencedColumns: ["id"]
          },
        ]
      }
      document_verification_requests: {
        Row: {
          assigned_verifier: string | null
          completed_at: string | null
          created_at: string
          document_id: string
          id: string
          notes: string | null
          priority: string | null
          property_id: string | null
          requested_by: string
          status: string | null
          updated_at: string
          verification_checklist: Json | null
        }
        Insert: {
          assigned_verifier?: string | null
          completed_at?: string | null
          created_at?: string
          document_id: string
          id?: string
          notes?: string | null
          priority?: string | null
          property_id?: string | null
          requested_by: string
          status?: string | null
          updated_at?: string
          verification_checklist?: Json | null
        }
        Update: {
          assigned_verifier?: string | null
          completed_at?: string | null
          created_at?: string
          document_id?: string
          id?: string
          notes?: string | null
          priority?: string | null
          property_id?: string | null
          requested_by?: string
          status?: string | null
          updated_at?: string
          verification_checklist?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "document_verification_requests_assigned_verifier_fkey1"
            columns: ["assigned_verifier"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "document_verification_requests_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "property_documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "document_verification_requests_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "document_verification_requests_requested_by_fkey1"
            columns: ["requested_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      escrow_accounts: {
        Row: {
          buyer_id: string
          conditions: Json
          created_at: string
          currency: string
          dispute_reason: string | null
          escrow_amount: number
          expires_at: string
          id: string
          mediator_id: string | null
          property_id: string | null
          release_conditions_met: boolean
          seller_id: string
          status: string
          tokenized_property_id: string | null
          transaction_id: string | null
          updated_at: string
        }
        Insert: {
          buyer_id: string
          conditions?: Json
          created_at?: string
          currency?: string
          dispute_reason?: string | null
          escrow_amount: number
          expires_at: string
          id?: string
          mediator_id?: string | null
          property_id?: string | null
          release_conditions_met?: boolean
          seller_id: string
          status?: string
          tokenized_property_id?: string | null
          transaction_id?: string | null
          updated_at?: string
        }
        Update: {
          buyer_id?: string
          conditions?: Json
          created_at?: string
          currency?: string
          dispute_reason?: string | null
          escrow_amount?: number
          expires_at?: string
          id?: string
          mediator_id?: string | null
          property_id?: string | null
          release_conditions_met?: boolean
          seller_id?: string
          status?: string
          tokenized_property_id?: string | null
          transaction_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "escrow_accounts_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "escrow_accounts_tokenized_property_id_fkey"
            columns: ["tokenized_property_id"]
            isOneToOne: false
            referencedRelation: "tokenized_properties"
            referencedColumns: ["id"]
          },
        ]
      }
      feedbacks: {
        Row: {
          attachments: string[] | null
          created_at: string | null
          description: string
          id: string
          is_anonymous: boolean | null
          resolved_at: string | null
          title: string
          type: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          attachments?: string[] | null
          created_at?: string | null
          description: string
          id?: string
          is_anonymous?: boolean | null
          resolved_at?: string | null
          title: string
          type: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          attachments?: string[] | null
          created_at?: string | null
          description?: string
          id?: string
          is_anonymous?: boolean | null
          resolved_at?: string | null
          title?: string
          type?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      financial_reports: {
        Row: {
          created_at: string
          data: Json
          generated_at: string
          id: string
          metadata: Json | null
          period_end: string
          period_start: string
          report_type: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          data?: Json
          generated_at?: string
          id?: string
          metadata?: Json | null
          period_end: string
          period_start: string
          report_type?: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          data?: Json
          generated_at?: string
          id?: string
          metadata?: Json | null
          period_end?: string
          period_start?: string
          report_type?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      identity_audit_logs: {
        Row: {
          action: string
          created_at: string
          device_fingerprint: string | null
          id: string
          ip_address: unknown | null
          new_values: Json | null
          old_values: Json | null
          performed_by: string | null
          resource_id: string | null
          resource_type: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          device_fingerprint?: string | null
          id?: string
          ip_address?: unknown | null
          new_values?: Json | null
          old_values?: Json | null
          performed_by?: string | null
          resource_id?: string | null
          resource_type?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          device_fingerprint?: string | null
          id?: string
          ip_address?: unknown | null
          new_values?: Json | null
          old_values?: Json | null
          performed_by?: string | null
          resource_id?: string | null
          resource_type?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      identity_verifications: {
        Row: {
          created_at: string
          expires_at: string | null
          full_name: string
          id: string
          identity_number: string
          identity_type: Database["public"]["Enums"]["identity_type"]
          last_retry_at: string | null
          retry_count: number | null
          updated_at: string
          user_id: string
          verification_provider: string | null
          verification_response: Json | null
          verification_status:
            | Database["public"]["Enums"]["verification_status"]
            | null
          verified_at: string | null
        }
        Insert: {
          created_at?: string
          expires_at?: string | null
          full_name: string
          id?: string
          identity_number: string
          identity_type: Database["public"]["Enums"]["identity_type"]
          last_retry_at?: string | null
          retry_count?: number | null
          updated_at?: string
          user_id: string
          verification_provider?: string | null
          verification_response?: Json | null
          verification_status?:
            | Database["public"]["Enums"]["verification_status"]
            | null
          verified_at?: string | null
        }
        Update: {
          created_at?: string
          expires_at?: string | null
          full_name?: string
          id?: string
          identity_number?: string
          identity_type?: Database["public"]["Enums"]["identity_type"]
          last_retry_at?: string | null
          retry_count?: number | null
          updated_at?: string
          user_id?: string
          verification_provider?: string | null
          verification_response?: Json | null
          verification_status?:
            | Database["public"]["Enums"]["verification_status"]
            | null
          verified_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "identity_verifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      inspections: {
        Row: {
          agent_id: string
          cancellation_details: Json | null
          conversation_id: string | null
          created_at: string
          id: string
          metadata: Json | null
          mode: string
          notes: string | null
          property_id: string
          status: string
          updated_at: string | null
          user_id: string
          when: string | null
        }
        Insert: {
          agent_id: string
          cancellation_details?: Json | null
          conversation_id?: string | null
          created_at?: string
          id?: string
          metadata?: Json | null
          mode?: string
          notes?: string | null
          property_id: string
          status?: string
          updated_at?: string | null
          user_id: string
          when?: string | null
        }
        Update: {
          agent_id?: string
          cancellation_details?: Json | null
          conversation_id?: string | null
          created_at?: string
          id?: string
          metadata?: Json | null
          mode?: string
          notes?: string | null
          property_id?: string
          status?: string
          updated_at?: string | null
          user_id?: string
          when?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "inspections_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inspections_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inspections_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inspections_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      investment_analytics: {
        Row: {
          calculation_date: string
          created_at: string
          id: string
          metadata: Json | null
          metric_type: string
          metric_value: number
          period_end: string
          period_start: string
          tokenized_property_id: string
          user_id: string
        }
        Insert: {
          calculation_date: string
          created_at?: string
          id?: string
          metadata?: Json | null
          metric_type: string
          metric_value: number
          period_end: string
          period_start: string
          tokenized_property_id: string
          user_id: string
        }
        Update: {
          calculation_date?: string
          created_at?: string
          id?: string
          metadata?: Json | null
          metric_type?: string
          metric_value?: number
          period_end?: string
          period_start?: string
          tokenized_property_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "investment_analytics_tokenized_property_id_fkey"
            columns: ["tokenized_property_id"]
            isOneToOne: false
            referencedRelation: "tokenized_properties"
            referencedColumns: ["id"]
          },
        ]
      }
      investment_discussions: {
        Row: {
          attachments: Json | null
          content: string
          created_at: string
          id: string
          investment_group_id: string
          is_pinned: boolean
          is_private: boolean
          parent_id: string | null
          updated_at: string
          user_id: string
          vote_count: number
        }
        Insert: {
          attachments?: Json | null
          content: string
          created_at?: string
          id?: string
          investment_group_id: string
          is_pinned?: boolean
          is_private?: boolean
          parent_id?: string | null
          updated_at?: string
          user_id: string
          vote_count?: number
        }
        Update: {
          attachments?: Json | null
          content?: string
          created_at?: string
          id?: string
          investment_group_id?: string
          is_pinned?: boolean
          is_private?: boolean
          parent_id?: string | null
          updated_at?: string
          user_id?: string
          vote_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "investment_discussions_investment_group_id_fkey"
            columns: ["investment_group_id"]
            isOneToOne: false
            referencedRelation: "investment_groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "investment_discussions_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "investment_discussions"
            referencedColumns: ["id"]
          },
        ]
      }
      investment_groups: {
        Row: {
          closes_at: string | null
          created_at: string
          current_amount: number
          description: string | null
          id: string
          investment_terms: Json
          investor_count: number
          lead_investor_id: string
          max_investors: number | null
          minimum_investment: number
          name: string
          status: string
          target_amount: number
          tokenized_property_id: string
          updated_at: string
          voting_power_distribution: Json | null
        }
        Insert: {
          closes_at?: string | null
          created_at?: string
          current_amount?: number
          description?: string | null
          id?: string
          investment_terms?: Json
          investor_count?: number
          lead_investor_id: string
          max_investors?: number | null
          minimum_investment: number
          name: string
          status?: string
          target_amount: number
          tokenized_property_id: string
          updated_at?: string
          voting_power_distribution?: Json | null
        }
        Update: {
          closes_at?: string | null
          created_at?: string
          current_amount?: number
          description?: string | null
          id?: string
          investment_terms?: Json
          investor_count?: number
          lead_investor_id?: string
          max_investors?: number | null
          minimum_investment?: number
          name?: string
          status?: string
          target_amount?: number
          tokenized_property_id?: string
          updated_at?: string
          voting_power_distribution?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "investment_groups_tokenized_property_id_fkey"
            columns: ["tokenized_property_id"]
            isOneToOne: false
            referencedRelation: "tokenized_properties"
            referencedColumns: ["id"]
          },
        ]
      }
      investment_polls: {
        Row: {
          allow_vote_changes: boolean | null
          consensus_threshold: number | null
          created_at: string
          created_by: string
          description: string | null
          ends_at: string
          hedera_consensus_timestamp: string | null
          hedera_topic_id: string | null
          id: string
          investment_group_id: string
          is_anonymous: boolean | null
          metadata: Json | null
          min_participation_percentage: number | null
          poll_type: string
          requires_consensus: boolean | null
          starts_at: string
          status: string
          title: string
          updated_at: string
          voting_power_basis: string | null
        }
        Insert: {
          allow_vote_changes?: boolean | null
          consensus_threshold?: number | null
          created_at?: string
          created_by: string
          description?: string | null
          ends_at: string
          hedera_consensus_timestamp?: string | null
          hedera_topic_id?: string | null
          id?: string
          investment_group_id: string
          is_anonymous?: boolean | null
          metadata?: Json | null
          min_participation_percentage?: number | null
          poll_type?: string
          requires_consensus?: boolean | null
          starts_at?: string
          status?: string
          title: string
          updated_at?: string
          voting_power_basis?: string | null
        }
        Update: {
          allow_vote_changes?: boolean | null
          consensus_threshold?: number | null
          created_at?: string
          created_by?: string
          description?: string | null
          ends_at?: string
          hedera_consensus_timestamp?: string | null
          hedera_topic_id?: string | null
          id?: string
          investment_group_id?: string
          is_anonymous?: boolean | null
          metadata?: Json | null
          min_participation_percentage?: number | null
          poll_type?: string
          requires_consensus?: boolean | null
          starts_at?: string
          status?: string
          title?: string
          updated_at?: string
          voting_power_basis?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "investment_polls_investment_group_id_fkey"
            columns: ["investment_group_id"]
            isOneToOne: false
            referencedRelation: "investment_groups"
            referencedColumns: ["id"]
          },
        ]
      }
      investment_tracking: {
        Row: {
          created_at: string
          current_value: number
          id: string
          investment_amount: number
          last_dividend_amount: number
          last_dividend_date: string | null
          roi_percentage: number
          tokenized_property_id: string
          tokens_owned: number
          total_dividends_received: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          current_value?: number
          id?: string
          investment_amount?: number
          last_dividend_amount?: number
          last_dividend_date?: string | null
          roi_percentage?: number
          tokenized_property_id: string
          tokens_owned?: number
          total_dividends_received?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          current_value?: number
          id?: string
          investment_amount?: number
          last_dividend_amount?: number
          last_dividend_date?: string | null
          roi_percentage?: number
          tokenized_property_id?: string
          tokens_owned?: number
          total_dividends_received?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      kyc_documents: {
        Row: {
          created_at: string
          document_side: string | null
          document_type: string
          expires_at: string | null
          extracted_data: Json | null
          file_hash: string
          file_size: number
          file_url: string
          id: string
          mime_type: string
          rejection_reason: string | null
          retry_count: number
          updated_at: string
          user_id: string
          verification_provider: string | null
          verification_response: Json | null
          verification_status: string
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          created_at?: string
          document_side?: string | null
          document_type: string
          expires_at?: string | null
          extracted_data?: Json | null
          file_hash: string
          file_size: number
          file_url: string
          id?: string
          mime_type: string
          rejection_reason?: string | null
          retry_count?: number
          updated_at?: string
          user_id: string
          verification_provider?: string | null
          verification_response?: Json | null
          verification_status?: string
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          created_at?: string
          document_side?: string | null
          document_type?: string
          expires_at?: string | null
          extracted_data?: Json | null
          file_hash?: string
          file_size?: number
          file_url?: string
          id?: string
          mime_type?: string
          rejection_reason?: string | null
          retry_count?: number
          updated_at?: string
          user_id?: string
          verification_provider?: string | null
          verification_response?: Json | null
          verification_status?: string
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "kyc_documents_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "kyc_documents_verified_by_fkey"
            columns: ["verified_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      land_titles: {
        Row: {
          acquisition_date: string
          acquisition_method: string
          area_sqm: number
          blockchain_hash: string | null
          blockchain_transaction_id: string | null
          coordinates: Json
          created_at: string
          description: string
          id: string
          land_use: string
          lga: string
          location_address: string
          owner_id: string
          previous_title_id: string | null
          state: string
          status: Database["public"]["Enums"]["land_title_status"] | null
          title_number: string
          title_type: string
          updated_at: string
          verification_metadata: Json | null
        }
        Insert: {
          acquisition_date: string
          acquisition_method: string
          area_sqm: number
          blockchain_hash?: string | null
          blockchain_transaction_id?: string | null
          coordinates: Json
          created_at?: string
          description: string
          id?: string
          land_use: string
          lga: string
          location_address: string
          owner_id: string
          previous_title_id?: string | null
          state: string
          status?: Database["public"]["Enums"]["land_title_status"] | null
          title_number: string
          title_type: string
          updated_at?: string
          verification_metadata?: Json | null
        }
        Update: {
          acquisition_date?: string
          acquisition_method?: string
          area_sqm?: number
          blockchain_hash?: string | null
          blockchain_transaction_id?: string | null
          coordinates?: Json
          created_at?: string
          description?: string
          id?: string
          land_use?: string
          lga?: string
          location_address?: string
          owner_id?: string
          previous_title_id?: string | null
          state?: string
          status?: Database["public"]["Enums"]["land_title_status"] | null
          title_number?: string
          title_type?: string
          updated_at?: string
          verification_metadata?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "land_titles_previous_title_id_fkey"
            columns: ["previous_title_id"]
            isOneToOne: false
            referencedRelation: "land_titles"
            referencedColumns: ["id"]
          },
        ]
      }
      learning_patterns: {
        Row: {
          confidence_score: number | null
          created_at: string
          id: string
          last_applied_at: string | null
          pattern_data: Json
          pattern_type: string
          success_rate: number | null
          updated_at: string
          usage_count: number | null
          user_id: string | null
        }
        Insert: {
          confidence_score?: number | null
          created_at?: string
          id?: string
          last_applied_at?: string | null
          pattern_data: Json
          pattern_type: string
          success_rate?: number | null
          updated_at?: string
          usage_count?: number | null
          user_id?: string | null
        }
        Update: {
          confidence_score?: number | null
          created_at?: string
          id?: string
          last_applied_at?: string | null
          pattern_data?: Json
          pattern_type?: string
          success_rate?: number | null
          updated_at?: string
          usage_count?: number | null
          user_id?: string | null
        }
        Relationships: []
      }
      legal_agreements: {
        Row: {
          agreement_type: Database["public"]["Enums"]["agreement_type"]
          blockchain_record: string | null
          created_at: string
          end_date: string | null
          financial_terms: Json
          id: string
          land_title_id: string
          parties: Json
          signed_document_url: string | null
          start_date: string
          status: Database["public"]["Enums"]["agreement_status"] | null
          terms: Json
          updated_at: string
        }
        Insert: {
          agreement_type: Database["public"]["Enums"]["agreement_type"]
          blockchain_record?: string | null
          created_at?: string
          end_date?: string | null
          financial_terms: Json
          id?: string
          land_title_id: string
          parties: Json
          signed_document_url?: string | null
          start_date: string
          status?: Database["public"]["Enums"]["agreement_status"] | null
          terms: Json
          updated_at?: string
        }
        Update: {
          agreement_type?: Database["public"]["Enums"]["agreement_type"]
          blockchain_record?: string | null
          created_at?: string
          end_date?: string | null
          financial_terms?: Json
          id?: string
          land_title_id?: string
          parties?: Json
          signed_document_url?: string | null
          start_date?: string
          status?: Database["public"]["Enums"]["agreement_status"] | null
          terms?: Json
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "legal_agreements_land_title_id_fkey"
            columns: ["land_title_id"]
            isOneToOne: false
            referencedRelation: "land_titles"
            referencedColumns: ["id"]
          },
        ]
      }
      market_analytics: {
        Row: {
          calculation_date: string
          confidence_level: number | null
          created_at: string
          currency: string
          id: string
          location_id: string
          metadata: Json | null
          metric_type: string
          metric_value: number
          period_type: string
          property_type: string
          sample_size: number
        }
        Insert: {
          calculation_date: string
          confidence_level?: number | null
          created_at?: string
          currency?: string
          id?: string
          location_id: string
          metadata?: Json | null
          metric_type: string
          metric_value: number
          period_type?: string
          property_type: string
          sample_size?: number
        }
        Update: {
          calculation_date?: string
          confidence_level?: number | null
          created_at?: string
          currency?: string
          id?: string
          location_id?: string
          metadata?: Json | null
          metric_type?: string
          metric_value?: number
          period_type?: string
          property_type?: string
          sample_size?: number
        }
        Relationships: []
      }
      message_attachments: {
        Row: {
          created_at: string
          id: string
          mime_type: string
          name: string
          size: number
          url: string
        }
        Insert: {
          created_at?: string
          id?: string
          mime_type: string
          name: string
          size: number
          url: string
        }
        Update: {
          created_at?: string
          id?: string
          mime_type?: string
          name?: string
          size?: number
          url?: string
        }
        Relationships: []
      }
      message_reactions: {
        Row: {
          created_at: string
          emoji: string
          id: string
          message_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          emoji: string
          id?: string
          message_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          emoji?: string
          id?: string
          message_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "message_reactions_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "message_reactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          attachment_id: string | null
          content: string
          conversation_id: string
          created_at: string
          error_message: string | null
          id: string
          is_deleted: boolean
          is_edited: boolean
          metadata: Json | null
          properties: Json | null
          property_id: string | null
          reactions: Json
          read_by: string[]
          reply_to_id: string | null
          sender: string
          sender_id: string
          timestamp: string
          type: string
        }
        Insert: {
          attachment_id?: string | null
          content: string
          conversation_id: string
          created_at?: string
          error_message?: string | null
          id?: string
          is_deleted?: boolean
          is_edited?: boolean
          metadata?: Json | null
          properties?: Json | null
          property_id?: string | null
          reactions?: Json
          read_by?: string[]
          reply_to_id?: string | null
          sender: string
          sender_id: string
          timestamp?: string
          type: string
        }
        Update: {
          attachment_id?: string | null
          content?: string
          conversation_id?: string
          created_at?: string
          error_message?: string | null
          id?: string
          is_deleted?: boolean
          is_edited?: boolean
          metadata?: Json | null
          properties?: Json | null
          property_id?: string | null
          reactions?: Json
          read_by?: string[]
          reply_to_id?: string | null
          sender?: string
          sender_id?: string
          timestamp?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_attachment_id_fkey"
            columns: ["attachment_id"]
            isOneToOne: false
            referencedRelation: "message_attachments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_reply_to_id_fkey"
            columns: ["reply_to_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_deliveries: {
        Row: {
          channel: string
          created_at: string
          delivered_at: string | null
          error_message: string | null
          external_id: string | null
          id: string
          notification_id: string
          status: string
          updated_at: string
        }
        Insert: {
          channel: string
          created_at?: string
          delivered_at?: string | null
          error_message?: string | null
          external_id?: string | null
          id?: string
          notification_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          channel?: string
          created_at?: string
          delivered_at?: string | null
          error_message?: string | null
          external_id?: string | null
          id?: string
          notification_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "notification_deliveries_notification_id_fkey"
            columns: ["notification_id"]
            isOneToOne: false
            referencedRelation: "notifications"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_preferences: {
        Row: {
          created_at: string
          do_not_disturb: boolean
          email_notifications: boolean
          id: string
          notification_types: Json
          push_notifications: boolean
          quiet_hours_end: string | null
          quiet_hours_start: string | null
          sms_notifications: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          do_not_disturb?: boolean
          email_notifications?: boolean
          id?: string
          notification_types?: Json
          push_notifications?: boolean
          quiet_hours_end?: string | null
          quiet_hours_start?: string | null
          sms_notifications?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          do_not_disturb?: boolean
          email_notifications?: boolean
          id?: string
          notification_types?: Json
          push_notifications?: boolean
          quiet_hours_end?: string | null
          quiet_hours_start?: string | null
          sms_notifications?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      notification_templates: {
        Row: {
          action_text: string | null
          body: string
          category: string
          created_at: string | null
          id: string
          language: string
          title: string
          updated_at: string | null
        }
        Insert: {
          action_text?: string | null
          body: string
          category?: string
          created_at?: string | null
          id: string
          language?: string
          title: string
          updated_at?: string | null
        }
        Update: {
          action_text?: string | null
          body?: string
          category?: string
          created_at?: string | null
          id?: string
          language?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      notifications: {
        Row: {
          action_label: string | null
          action_taken_at: string | null
          action_url: string | null
          channel: string | null
          created_at: string
          delivery_status: Json | null
          external_id: string | null
          id: string
          image_url: string | null
          is_read: boolean
          message: string | null
          metadata: Json
          retry_count: number | null
          scheduled_for: string | null
          sender_id: string | null
          title: string
          type: Database["public"]["Enums"]["notification_type"]
          updated_at: string | null
          user_id: string
        }
        Insert: {
          action_label?: string | null
          action_taken_at?: string | null
          action_url?: string | null
          channel?: string | null
          created_at?: string
          delivery_status?: Json | null
          external_id?: string | null
          id?: string
          image_url?: string | null
          is_read?: boolean
          message?: string | null
          metadata?: Json
          retry_count?: number | null
          scheduled_for?: string | null
          sender_id?: string | null
          title: string
          type: Database["public"]["Enums"]["notification_type"]
          updated_at?: string | null
          user_id: string
        }
        Update: {
          action_label?: string | null
          action_taken_at?: string | null
          action_url?: string | null
          channel?: string | null
          created_at?: string
          delivery_status?: Json | null
          external_id?: string | null
          id?: string
          image_url?: string | null
          is_read?: boolean
          message?: string | null
          metadata?: Json
          retry_count?: number | null
          scheduled_for?: string | null
          sender_id?: string | null
          title?: string
          type?: Database["public"]["Enums"]["notification_type"]
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_methods: {
        Row: {
          created_at: string
          details: Json
          expires_at: string | null
          external_id: string
          id: string
          is_active: boolean
          is_default: boolean
          is_verified: boolean
          last_used_at: string | null
          provider: string
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          details?: Json
          expires_at?: string | null
          external_id: string
          id?: string
          is_active?: boolean
          is_default?: boolean
          is_verified?: boolean
          last_used_at?: string | null
          provider?: string
          type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          details?: Json
          expires_at?: string | null
          external_id?: string
          id?: string
          is_active?: boolean
          is_default?: boolean
          is_verified?: boolean
          last_used_at?: string | null
          provider?: string
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      payment_sessions: {
        Row: {
          amount: number
          completed_at: string | null
          created_at: string | null
          currency: string | null
          expires_at: string | null
          id: string
          metadata: Json | null
          payment_provider: string | null
          purpose: string
          session_id: string
          status: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          amount: number
          completed_at?: string | null
          created_at?: string | null
          currency?: string | null
          expires_at?: string | null
          id?: string
          metadata?: Json | null
          payment_provider?: string | null
          purpose: string
          session_id: string
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          amount?: number
          completed_at?: string | null
          created_at?: string | null
          currency?: string | null
          expires_at?: string | null
          id?: string
          metadata?: Json | null
          payment_provider?: string | null
          purpose?: string
          session_id?: string
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      payments: {
        Row: {
          agent_id: string | null
          amount: number
          created_at: string | null
          currency: string | null
          id: string
          link: string | null
          metadata: Json | null
          method: string | null
          paid_at: string | null
          property_id: string | null
          provider: string | null
          reference: string
          related_id: string
          related_type: string
          status: string | null
          type: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          agent_id?: string | null
          amount: number
          created_at?: string | null
          currency?: string | null
          id?: string
          link?: string | null
          metadata?: Json | null
          method?: string | null
          paid_at?: string | null
          property_id?: string | null
          provider?: string | null
          reference: string
          related_id: string
          related_type: string
          status?: string | null
          type?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          agent_id?: string | null
          amount?: number
          created_at?: string | null
          currency?: string | null
          id?: string
          link?: string | null
          metadata?: Json | null
          method?: string | null
          paid_at?: string | null
          property_id?: string | null
          provider?: string | null
          reference?: string
          related_id?: string
          related_type?: string
          status?: string | null
          type?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      poll_options: {
        Row: {
          created_at: string
          id: string
          metadata: Json | null
          option_order: number
          option_text: string
          poll_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          metadata?: Json | null
          option_order?: number
          option_text: string
          poll_id: string
        }
        Update: {
          created_at?: string
          id?: string
          metadata?: Json | null
          option_order?: number
          option_text?: string
          poll_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "poll_options_poll_id_fkey"
            columns: ["poll_id"]
            isOneToOne: false
            referencedRelation: "investment_polls"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "poll_options_poll_id_fkey"
            columns: ["poll_id"]
            isOneToOne: false
            referencedRelation: "poll_results"
            referencedColumns: ["poll_id"]
          },
        ]
      }
      poll_votes: {
        Row: {
          hedera_consensus_timestamp: string | null
          hedera_transaction_id: string | null
          id: string
          ip_address: unknown | null
          poll_id: string
          poll_option_id: string | null
          ranked_choices: Json | null
          updated_at: string
          user_agent: string | null
          vote_data: Json | null
          vote_weight: number | null
          voted_at: string
          voter_id: string
          voting_power: number
        }
        Insert: {
          hedera_consensus_timestamp?: string | null
          hedera_transaction_id?: string | null
          id?: string
          ip_address?: unknown | null
          poll_id: string
          poll_option_id?: string | null
          ranked_choices?: Json | null
          updated_at?: string
          user_agent?: string | null
          vote_data?: Json | null
          vote_weight?: number | null
          voted_at?: string
          voter_id: string
          voting_power?: number
        }
        Update: {
          hedera_consensus_timestamp?: string | null
          hedera_transaction_id?: string | null
          id?: string
          ip_address?: unknown | null
          poll_id?: string
          poll_option_id?: string | null
          ranked_choices?: Json | null
          updated_at?: string
          user_agent?: string | null
          vote_data?: Json | null
          vote_weight?: number | null
          voted_at?: string
          voter_id?: string
          voting_power?: number
        }
        Relationships: [
          {
            foreignKeyName: "poll_votes_poll_id_fkey"
            columns: ["poll_id"]
            isOneToOne: false
            referencedRelation: "investment_polls"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "poll_votes_poll_id_fkey"
            columns: ["poll_id"]
            isOneToOne: false
            referencedRelation: "poll_results"
            referencedColumns: ["poll_id"]
          },
          {
            foreignKeyName: "poll_votes_poll_option_id_fkey"
            columns: ["poll_option_id"]
            isOneToOne: false
            referencedRelation: "poll_options"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "poll_votes_poll_option_id_fkey"
            columns: ["poll_option_id"]
            isOneToOne: false
            referencedRelation: "poll_results"
            referencedColumns: ["option_id"]
          },
        ]
      }
      portfolio_allocations: {
        Row: {
          allocation_type: string
          category: string
          created_at: string
          current_percentage: number
          current_value: number
          id: string
          last_rebalanced_at: string | null
          rebalance_threshold: number | null
          target_percentage: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          allocation_type: string
          category: string
          created_at?: string
          current_percentage?: number
          current_value?: number
          id?: string
          last_rebalanced_at?: string | null
          rebalance_threshold?: number | null
          target_percentage?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          allocation_type?: string
          category?: string
          created_at?: string
          current_percentage?: number
          current_value?: number
          id?: string
          last_rebalanced_at?: string | null
          rebalance_threshold?: number | null
          target_percentage?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "portfolio_allocations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      properties: {
        Row: {
          amenities: string[] | null
          backdrop: string | null
          blockchain_transaction_id: string | null
          category: string
          condition: string | null
          created_at: string
          description: string | null
          documents: Json | null
          favorites: number | null
          features: string[] | null
          garages: number | null
          id: string
          is_ad: boolean | null
          is_deleted: boolean | null
          is_exclusive: boolean | null
          is_featured: boolean | null
          is_tokenized: boolean | null
          is_verified: boolean | null
          land_title_id: string | null
          likes: number | null
          location: Json
          max_guest: number | null
          price: Json
          ratings: number | null
          review_count: number | null
          specification: Json
          sqrft: string | null
          status: string
          sub_type: string | null
          tags: string[] | null
          title: string | null
          tokenized_property_id: string | null
          type: string
          updated_at: string | null
          user_id: string
          views: number | null
          year_built: string | null
        }
        Insert: {
          amenities?: string[] | null
          backdrop?: string | null
          blockchain_transaction_id?: string | null
          category: string
          condition?: string | null
          created_at?: string
          description?: string | null
          documents?: Json | null
          favorites?: number | null
          features?: string[] | null
          garages?: number | null
          id?: string
          is_ad?: boolean | null
          is_deleted?: boolean | null
          is_exclusive?: boolean | null
          is_featured?: boolean | null
          is_tokenized?: boolean | null
          is_verified?: boolean | null
          land_title_id?: string | null
          likes?: number | null
          location: Json
          max_guest?: number | null
          price: Json
          ratings?: number | null
          review_count?: number | null
          specification: Json
          sqrft?: string | null
          status: string
          sub_type?: string | null
          tags?: string[] | null
          title?: string | null
          tokenized_property_id?: string | null
          type: string
          updated_at?: string | null
          user_id: string
          views?: number | null
          year_built?: string | null
        }
        Update: {
          amenities?: string[] | null
          backdrop?: string | null
          blockchain_transaction_id?: string | null
          category?: string
          condition?: string | null
          created_at?: string
          description?: string | null
          documents?: Json | null
          favorites?: number | null
          features?: string[] | null
          garages?: number | null
          id?: string
          is_ad?: boolean | null
          is_deleted?: boolean | null
          is_exclusive?: boolean | null
          is_featured?: boolean | null
          is_tokenized?: boolean | null
          is_verified?: boolean | null
          land_title_id?: string | null
          likes?: number | null
          location?: Json
          max_guest?: number | null
          price?: Json
          ratings?: number | null
          review_count?: number | null
          specification?: Json
          sqrft?: string | null
          status?: string
          sub_type?: string | null
          tags?: string[] | null
          title?: string | null
          tokenized_property_id?: string | null
          type?: string
          updated_at?: string | null
          user_id?: string
          views?: number | null
          year_built?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "properties_land_title_id_fkey"
            columns: ["land_title_id"]
            isOneToOne: false
            referencedRelation: "land_titles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "properties_tokenized_property_id_fkey"
            columns: ["tokenized_property_id"]
            isOneToOne: false
            referencedRelation: "tokenized_properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "properties_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      property_creation_workflows: {
        Row: {
          created_at: string
          current_step: number
          id: string
          property_id: string | null
          status: string
          step_data: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          current_step?: number
          id?: string
          property_id?: string | null
          status?: string
          step_data?: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          current_step?: number
          id?: string
          property_id?: string | null
          status?: string
          step_data?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "property_creation_workflows_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      property_documents: {
        Row: {
          created_at: string
          document_hash: string
          document_name: string
          document_type: Database["public"]["Enums"]["document_type"]
          expires_at: string | null
          file_size: number
          file_url: string
          id: string
          land_title_id: string | null
          metadata: Json | null
          mime_type: string
          property_id: string | null
          status: Database["public"]["Enums"]["document_status"] | null
          updated_at: string
          verification_notes: string | null
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          created_at?: string
          document_hash: string
          document_name: string
          document_type: Database["public"]["Enums"]["document_type"]
          expires_at?: string | null
          file_size: number
          file_url: string
          id?: string
          land_title_id?: string | null
          metadata?: Json | null
          mime_type: string
          property_id?: string | null
          status?: Database["public"]["Enums"]["document_status"] | null
          updated_at?: string
          verification_notes?: string | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          created_at?: string
          document_hash?: string
          document_name?: string
          document_type?: Database["public"]["Enums"]["document_type"]
          expires_at?: string | null
          file_size?: number
          file_url?: string
          id?: string
          land_title_id?: string | null
          metadata?: Json | null
          mime_type?: string
          property_id?: string | null
          status?: Database["public"]["Enums"]["document_status"] | null
          updated_at?: string
          verification_notes?: string | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "property_documents_land_title_id_fkey"
            columns: ["land_title_id"]
            isOneToOne: false
            referencedRelation: "land_titles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "property_documents_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "property_documents_verified_by_fkey"
            columns: ["verified_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      property_favorites: {
        Row: {
          created_at: string
          id: string
          list_name: string | null
          notes: string | null
          property_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          list_name?: string | null
          notes?: string | null
          property_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          list_name?: string | null
          notes?: string | null
          property_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "property_favorites_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      property_images: {
        Row: {
          category: string | null
          id: string
          is_primary: boolean | null
          property_id: string
          ratio: number | null
          size: number | null
          sort_order: number | null
          thumbnail_url: string | null
          url: string
        }
        Insert: {
          category?: string | null
          id?: string
          is_primary?: boolean | null
          property_id: string
          ratio?: number | null
          size?: number | null
          sort_order?: number | null
          thumbnail_url?: string | null
          url: string
        }
        Update: {
          category?: string | null
          id?: string
          is_primary?: boolean | null
          property_id?: string
          ratio?: number | null
          size?: number | null
          sort_order?: number | null
          thumbnail_url?: string | null
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "property_images_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      property_inquiries: {
        Row: {
          agent_id: string | null
          contact_preferences: Json | null
          conversion_type: string | null
          converted_at: string | null
          created_at: string
          id: string
          inquirer_id: string
          inquiry_type: string
          last_contact_at: string | null
          message: string
          property_id: string
          response_count: number
          status: string
          subject: string
          updated_at: string
          urgency_level: string
        }
        Insert: {
          agent_id?: string | null
          contact_preferences?: Json | null
          conversion_type?: string | null
          converted_at?: string | null
          created_at?: string
          id?: string
          inquirer_id: string
          inquiry_type?: string
          last_contact_at?: string | null
          message: string
          property_id: string
          response_count?: number
          status?: string
          subject: string
          updated_at?: string
          urgency_level?: string
        }
        Update: {
          agent_id?: string | null
          contact_preferences?: Json | null
          conversion_type?: string | null
          converted_at?: string | null
          created_at?: string
          id?: string
          inquirer_id?: string
          inquiry_type?: string
          last_contact_at?: string | null
          message?: string
          property_id?: string
          response_count?: number
          status?: string
          subject?: string
          updated_at?: string
          urgency_level?: string
        }
        Relationships: [
          {
            foreignKeyName: "property_inquiries_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      property_likes: {
        Row: {
          created_at: string
          id: string
          property_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          property_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          property_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "property_likes_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      property_reviews: {
        Row: {
          comment: string
          created_at: string
          id: string
          property_id: string
          rating: number
          updated_at: string | null
          user_id: string
          user_name: string
        }
        Insert: {
          comment: string
          created_at?: string
          id?: string
          property_id: string
          rating: number
          updated_at?: string | null
          user_id: string
          user_name: string
        }
        Update: {
          comment?: string
          created_at?: string
          id?: string
          property_id?: string
          rating?: number
          updated_at?: string | null
          user_id?: string
          user_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "property_reviews_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "property_reviews_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      property_valuations: {
        Row: {
          comparable_properties: Json | null
          created_at: string
          id: string
          land_title_id: string
          market_conditions: Json | null
          property_id: string | null
          report_url: string | null
          updated_at: string
          valid_until: string
          valuation_amount: number
          valuation_currency: string | null
          valuation_date: string
          valuation_method: string
          valuer_id: string
        }
        Insert: {
          comparable_properties?: Json | null
          created_at?: string
          id?: string
          land_title_id: string
          market_conditions?: Json | null
          property_id?: string | null
          report_url?: string | null
          updated_at?: string
          valid_until: string
          valuation_amount: number
          valuation_currency?: string | null
          valuation_date: string
          valuation_method: string
          valuer_id: string
        }
        Update: {
          comparable_properties?: Json | null
          created_at?: string
          id?: string
          land_title_id?: string
          market_conditions?: Json | null
          property_id?: string | null
          report_url?: string | null
          updated_at?: string
          valid_until?: string
          valuation_amount?: number
          valuation_currency?: string | null
          valuation_date?: string
          valuation_method?: string
          valuer_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "property_valuations_land_title_id_fkey"
            columns: ["land_title_id"]
            isOneToOne: false
            referencedRelation: "land_titles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "property_valuations_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      property_views: {
        Row: {
          created_at: string
          device_type: string | null
          id: string
          ip_address: unknown | null
          location_data: Json | null
          pages_viewed: Json | null
          property_id: string
          referrer: string | null
          session_id: string | null
          user_agent: string | null
          user_id: string | null
          view_duration: number | null
        }
        Insert: {
          created_at?: string
          device_type?: string | null
          id?: string
          ip_address?: unknown | null
          location_data?: Json | null
          pages_viewed?: Json | null
          property_id: string
          referrer?: string | null
          session_id?: string | null
          user_agent?: string | null
          user_id?: string | null
          view_duration?: number | null
        }
        Update: {
          created_at?: string
          device_type?: string | null
          id?: string
          ip_address?: unknown | null
          location_data?: Json | null
          pages_viewed?: Json | null
          property_id?: string
          referrer?: string | null
          session_id?: string | null
          user_agent?: string | null
          user_id?: string | null
          view_duration?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "property_views_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      rentals: {
        Row: {
          agent_id: string | null
          cancellation_details: Json | null
          conversation_id: string | null
          created_at: string
          id: string
          message: string | null
          metadata: Json | null
          move_in_date: string | null
          payment_id: string | null
          payment_plan: string
          payment_reference: string | null
          payment_status: string
          payment_url: string | null
          plan_id: string | null
          price: number | null
          property_id: string
          status: string
          subscription_id: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          agent_id?: string | null
          cancellation_details?: Json | null
          conversation_id?: string | null
          created_at?: string
          id?: string
          message?: string | null
          metadata?: Json | null
          move_in_date?: string | null
          payment_id?: string | null
          payment_plan?: string
          payment_reference?: string | null
          payment_status?: string
          payment_url?: string | null
          plan_id?: string | null
          price?: number | null
          property_id: string
          status?: string
          subscription_id?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          agent_id?: string | null
          cancellation_details?: Json | null
          conversation_id?: string | null
          created_at?: string
          id?: string
          message?: string | null
          metadata?: Json | null
          move_in_date?: string | null
          payment_id?: string | null
          payment_plan?: string
          payment_reference?: string | null
          payment_status?: string
          payment_url?: string | null
          plan_id?: string | null
          price?: number | null
          property_id?: string
          status?: string
          subscription_id?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "rentals_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rentals_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rentals_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rentals_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      reservations: {
        Row: {
          adults: number | null
          agent_id: string | null
          cancellation_details: Json | null
          caution_deposit: number | null
          children: number | null
          conversation_id: string | null
          created_at: string
          fee: number | null
          from_date: string | null
          id: string
          infants: number | null
          metadata: Json | null
          nights: number | null
          note: string | null
          payment_id: string | null
          payment_reference: string | null
          payment_url: string | null
          property_id: string
          status: string
          to_date: string | null
          total: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          adults?: number | null
          agent_id?: string | null
          cancellation_details?: Json | null
          caution_deposit?: number | null
          children?: number | null
          conversation_id?: string | null
          created_at?: string
          fee?: number | null
          from_date?: string | null
          id?: string
          infants?: number | null
          metadata?: Json | null
          nights?: number | null
          note?: string | null
          payment_id?: string | null
          payment_reference?: string | null
          payment_url?: string | null
          property_id: string
          status?: string
          to_date?: string | null
          total?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          adults?: number | null
          agent_id?: string | null
          cancellation_details?: Json | null
          caution_deposit?: number | null
          children?: number | null
          conversation_id?: string | null
          created_at?: string
          fee?: number | null
          from_date?: string | null
          id?: string
          infants?: number | null
          metadata?: Json | null
          nights?: number | null
          note?: string | null
          payment_id?: string | null
          payment_reference?: string | null
          payment_url?: string | null
          property_id?: string
          status?: string
          to_date?: string | null
          total?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reservations_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reservations_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reservations_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reservations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      revenue_distributions: {
        Row: {
          blockchain_transaction_hash: string | null
          created_at: string
          distribution_date: string
          distribution_type: string
          id: string
          metadata: Json | null
          revenue_per_token: number
          source_description: string
          tokenized_property_id: string
          total_revenue: number
        }
        Insert: {
          blockchain_transaction_hash?: string | null
          created_at?: string
          distribution_date: string
          distribution_type: string
          id?: string
          metadata?: Json | null
          revenue_per_token: number
          source_description: string
          tokenized_property_id: string
          total_revenue: number
        }
        Update: {
          blockchain_transaction_hash?: string | null
          created_at?: string
          distribution_date?: string
          distribution_type?: string
          id?: string
          metadata?: Json | null
          revenue_per_token?: number
          source_description?: string
          tokenized_property_id?: string
          total_revenue?: number
        }
        Relationships: [
          {
            foreignKeyName: "revenue_distributions_tokenized_property_id_fkey"
            columns: ["tokenized_property_id"]
            isOneToOne: false
            referencedRelation: "tokenized_properties"
            referencedColumns: ["id"]
          },
        ]
      }
      sanctions_screening: {
        Row: {
          confidence_scores: Json | null
          created_at: string
          exemption_approved_by: string | null
          exemption_reason: string | null
          false_positive: boolean | null
          id: string
          last_screened_at: string
          lists_checked: Json
          matches_found: Json | null
          next_screening_due: string | null
          screening_frequency: string | null
          screening_type: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          confidence_scores?: Json | null
          created_at?: string
          exemption_approved_by?: string | null
          exemption_reason?: string | null
          false_positive?: boolean | null
          id?: string
          last_screened_at?: string
          lists_checked: Json
          matches_found?: Json | null
          next_screening_due?: string | null
          screening_frequency?: string | null
          screening_type: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          confidence_scores?: Json | null
          created_at?: string
          exemption_approved_by?: string | null
          exemption_reason?: string | null
          false_positive?: boolean | null
          id?: string
          last_screened_at?: string
          lists_checked?: Json
          matches_found?: Json | null
          next_screening_due?: string | null
          screening_frequency?: string | null
          screening_type?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      saved_searches: {
        Row: {
          alert_enabled: boolean | null
          created_at: string | null
          id: string
          last_run_at: string | null
          name: string
          search_criteria: Json
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          alert_enabled?: boolean | null
          created_at?: string | null
          id?: string
          last_run_at?: string | null
          name: string
          search_criteria: Json
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          alert_enabled?: boolean | null
          created_at?: string | null
          id?: string
          last_run_at?: string | null
          name?: string
          search_criteria?: Json
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      service_bookings: {
        Row: {
          budget_range: Json | null
          conversation_id: string | null
          created_at: string | null
          customer_id: string
          description: string | null
          id: string
          location: Json | null
          preferred_date: string | null
          provider_id: string
          service_type: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          budget_range?: Json | null
          conversation_id?: string | null
          created_at?: string | null
          customer_id: string
          description?: string | null
          id?: string
          location?: Json | null
          preferred_date?: string | null
          provider_id: string
          service_type: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          budget_range?: Json | null
          conversation_id?: string | null
          created_at?: string | null
          customer_id?: string
          description?: string | null
          id?: string
          location?: Json | null
          preferred_date?: string | null
          provider_id?: string
          service_type?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "service_bookings_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_bookings_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "service_providers"
            referencedColumns: ["id"]
          },
        ]
      }
      service_providers: {
        Row: {
          availability: Json | null
          business_name: string
          category_id: string
          certifications: string[] | null
          contact_email: string | null
          contact_phone: string | null
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          is_verified: boolean | null
          location: Json | null
          portfolio_images: string[] | null
          pricing_info: Json | null
          rating: number | null
          review_count: number | null
          services_offered: string[] | null
          updated_at: string | null
          user_id: string | null
          years_experience: number | null
        }
        Insert: {
          availability?: Json | null
          business_name: string
          category_id: string
          certifications?: string[] | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_verified?: boolean | null
          location?: Json | null
          portfolio_images?: string[] | null
          pricing_info?: Json | null
          rating?: number | null
          review_count?: number | null
          services_offered?: string[] | null
          updated_at?: string | null
          user_id?: string | null
          years_experience?: number | null
        }
        Update: {
          availability?: Json | null
          business_name?: string
          category_id?: string
          certifications?: string[] | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_verified?: boolean | null
          location?: Json | null
          portfolio_images?: string[] | null
          pricing_info?: Json | null
          rating?: number | null
          review_count?: number | null
          services_offered?: string[] | null
          updated_at?: string | null
          user_id?: string | null
          years_experience?: number | null
        }
        Relationships: []
      }
      smart_contracts: {
        Row: {
          abi: Json
          bytecode: string | null
          compiler_version: string | null
          contract_address: string
          contract_type: string
          created_at: string
          deployer_id: string
          deployment_cost: number | null
          deployment_transaction_hash: string
          gas_used: number | null
          id: string
          network: string
          related_property_id: string | null
          related_tokenized_property_id: string | null
          source_code: string | null
          status: string
          updated_at: string
          verification_status: string | null
        }
        Insert: {
          abi: Json
          bytecode?: string | null
          compiler_version?: string | null
          contract_address: string
          contract_type: string
          created_at?: string
          deployer_id: string
          deployment_cost?: number | null
          deployment_transaction_hash: string
          gas_used?: number | null
          id?: string
          network?: string
          related_property_id?: string | null
          related_tokenized_property_id?: string | null
          source_code?: string | null
          status?: string
          updated_at?: string
          verification_status?: string | null
        }
        Update: {
          abi?: Json
          bytecode?: string | null
          compiler_version?: string | null
          contract_address?: string
          contract_type?: string
          created_at?: string
          deployer_id?: string
          deployment_cost?: number | null
          deployment_transaction_hash?: string
          gas_used?: number | null
          id?: string
          network?: string
          related_property_id?: string | null
          related_tokenized_property_id?: string | null
          source_code?: string | null
          status?: string
          updated_at?: string
          verification_status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "smart_contracts_related_property_id_fkey"
            columns: ["related_property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "smart_contracts_related_tokenized_property_id_fkey"
            columns: ["related_tokenized_property_id"]
            isOneToOne: false
            referencedRelation: "tokenized_properties"
            referencedColumns: ["id"]
          },
        ]
      }
      system_notifications: {
        Row: {
          action_label: string | null
          action_required: boolean
          action_url: string | null
          auto_dismiss_after: unknown | null
          created_at: string
          created_by: string
          display_from: string
          display_until: string | null
          expires_at: string | null
          id: string
          is_active: boolean | null
          is_dismissible: boolean
          message: string
          notification_type: string
          severity: string
          target_audience: string
          target_users: string[] | null
          title: string
        }
        Insert: {
          action_label?: string | null
          action_required?: boolean
          action_url?: string | null
          auto_dismiss_after?: unknown | null
          created_at?: string
          created_by: string
          display_from?: string
          display_until?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          is_dismissible?: boolean
          message: string
          notification_type: string
          severity?: string
          target_audience?: string
          target_users?: string[] | null
          title: string
        }
        Update: {
          action_label?: string | null
          action_required?: boolean
          action_url?: string | null
          auto_dismiss_after?: unknown | null
          created_at?: string
          created_by?: string
          display_from?: string
          display_until?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          is_dismissible?: boolean
          message?: string
          notification_type?: string
          severity?: string
          target_audience?: string
          target_users?: string[] | null
          title?: string
        }
        Relationships: []
      }
      token_holdings: {
        Row: {
          acquisition_date: string
          created_at: string
          holder_id: string
          id: string
          purchase_price_per_token: number
          tokenized_property_id: string
          tokens_owned: string
          total_investment: number
          updated_at: string
          vesting_schedule: Json | null
        }
        Insert: {
          acquisition_date: string
          created_at?: string
          holder_id: string
          id?: string
          purchase_price_per_token: number
          tokenized_property_id: string
          tokens_owned: string
          total_investment: number
          updated_at?: string
          vesting_schedule?: Json | null
        }
        Update: {
          acquisition_date?: string
          created_at?: string
          holder_id?: string
          id?: string
          purchase_price_per_token?: number
          tokenized_property_id?: string
          tokens_owned?: string
          total_investment?: number
          updated_at?: string
          vesting_schedule?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "token_holdings_holder_id_fkey"
            columns: ["holder_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "token_holdings_tokenized_property_id_fkey"
            columns: ["tokenized_property_id"]
            isOneToOne: false
            referencedRelation: "tokenized_properties"
            referencedColumns: ["id"]
          },
        ]
      }
      token_transactions: {
        Row: {
          blockchain_hash: string | null
          created_at: string
          from_holder: string | null
          hedera_transaction_id: string | null
          id: string
          metadata: Json | null
          price_per_token: number
          status: Database["public"]["Enums"]["transaction_status"] | null
          to_holder: string
          token_amount: string
          tokenized_property_id: string
          total_value: number
          transaction_type: Database["public"]["Enums"]["transaction_type"]
        }
        Insert: {
          blockchain_hash?: string | null
          created_at?: string
          from_holder?: string | null
          hedera_transaction_id?: string | null
          id?: string
          metadata?: Json | null
          price_per_token: number
          status?: Database["public"]["Enums"]["transaction_status"] | null
          to_holder: string
          token_amount: string
          tokenized_property_id: string
          total_value: number
          transaction_type: Database["public"]["Enums"]["transaction_type"]
        }
        Update: {
          blockchain_hash?: string | null
          created_at?: string
          from_holder?: string | null
          hedera_transaction_id?: string | null
          id?: string
          metadata?: Json | null
          price_per_token?: number
          status?: Database["public"]["Enums"]["transaction_status"] | null
          to_holder?: string
          token_amount?: string
          tokenized_property_id?: string
          total_value?: number
          transaction_type?: Database["public"]["Enums"]["transaction_type"]
        }
        Relationships: [
          {
            foreignKeyName: "token_transactions_tokenized_property_id_fkey"
            columns: ["tokenized_property_id"]
            isOneToOne: false
            referencedRelation: "tokenized_properties"
            referencedColumns: ["id"]
          },
        ]
      }
      tokenized_properties: {
        Row: {
          blockchain_network: string
          created_at: string
          expected_roi: number
          hedera_token_id: string | null
          id: string
          investment_terms: Database["public"]["Enums"]["investment_terms"]
          land_title_id: string
          legal_structure: Json | null
          lock_up_period_months: number
          metadata: Json | null
          minimum_investment: number
          property_id: string | null
          revenue_distribution_frequency: string
          status: Database["public"]["Enums"]["tokenization_status"] | null
          token_contract_address: string | null
          token_id: string | null
          token_name: string
          token_price: number
          token_symbol: string
          token_type: Database["public"]["Enums"]["token_type"]
          total_supply: string
          total_value_usd: number
          updated_at: string
        }
        Insert: {
          blockchain_network: string
          created_at?: string
          expected_roi: number
          hedera_token_id?: string | null
          id?: string
          investment_terms: Database["public"]["Enums"]["investment_terms"]
          land_title_id: string
          legal_structure?: Json | null
          lock_up_period_months: number
          metadata?: Json | null
          minimum_investment: number
          property_id?: string | null
          revenue_distribution_frequency: string
          status?: Database["public"]["Enums"]["tokenization_status"] | null
          token_contract_address?: string | null
          token_id?: string | null
          token_name: string
          token_price: number
          token_symbol: string
          token_type: Database["public"]["Enums"]["token_type"]
          total_supply: string
          total_value_usd: number
          updated_at?: string
        }
        Update: {
          blockchain_network?: string
          created_at?: string
          expected_roi?: number
          hedera_token_id?: string | null
          id?: string
          investment_terms?: Database["public"]["Enums"]["investment_terms"]
          land_title_id?: string
          legal_structure?: Json | null
          lock_up_period_months?: number
          metadata?: Json | null
          minimum_investment?: number
          property_id?: string | null
          revenue_distribution_frequency?: string
          status?: Database["public"]["Enums"]["tokenization_status"] | null
          token_contract_address?: string | null
          token_id?: string | null
          token_name?: string
          token_price?: number
          token_symbol?: string
          token_type?: Database["public"]["Enums"]["token_type"]
          total_supply?: string
          total_value_usd?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tokenized_properties_land_title_id_fkey"
            columns: ["land_title_id"]
            isOneToOne: false
            referencedRelation: "land_titles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tokenized_properties_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      transaction_fees: {
        Row: {
          base_fee: number
          created_at: string
          currency: string
          effective_from: string
          effective_until: string | null
          fee_type: string
          id: string
          is_active: boolean
          max_fee: number | null
          min_fee: number
          percentage_fee: number
          tier_thresholds: Json | null
          transaction_type: string
        }
        Insert: {
          base_fee?: number
          created_at?: string
          currency?: string
          effective_from?: string
          effective_until?: string | null
          fee_type: string
          id?: string
          is_active?: boolean
          max_fee?: number | null
          min_fee?: number
          percentage_fee?: number
          tier_thresholds?: Json | null
          transaction_type: string
        }
        Update: {
          base_fee?: number
          created_at?: string
          currency?: string
          effective_from?: string
          effective_until?: string | null
          fee_type?: string
          id?: string
          is_active?: boolean
          max_fee?: number | null
          min_fee?: number
          percentage_fee?: number
          tier_thresholds?: Json | null
          transaction_type?: string
        }
        Relationships: []
      }
      tree_donations: {
        Row: {
          certificate_url: string | null
          created_at: string
          id: string
          metadata: Json | null
          payment_provider: string
          payment_reference: string | null
          payment_status: string
          planted_at: string | null
          quantity: number
          total_amount_ngn: number
          tree_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          certificate_url?: string | null
          created_at?: string
          id?: string
          metadata?: Json | null
          payment_provider?: string
          payment_reference?: string | null
          payment_status?: string
          planted_at?: string | null
          quantity?: number
          total_amount_ngn: number
          tree_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          certificate_url?: string | null
          created_at?: string
          id?: string
          metadata?: Json | null
          payment_provider?: string
          payment_reference?: string | null
          payment_status?: string
          planted_at?: string | null
          quantity?: number
          total_amount_ngn?: number
          tree_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tree_donations_tree_id_fkey"
            columns: ["tree_id"]
            isOneToOne: false
            referencedRelation: "trees"
            referencedColumns: ["id"]
          },
        ]
      }
      trees: {
        Row: {
          carbon_offset_kg: number | null
          country: string
          created_at: string
          description: string | null
          growth_time_years: number | null
          id: string
          image_url: string
          is_available: boolean
          location: string
          name: string
          price_ngn: number
          scientific_name: string | null
          updated_at: string
        }
        Insert: {
          carbon_offset_kg?: number | null
          country?: string
          created_at?: string
          description?: string | null
          growth_time_years?: number | null
          id?: string
          image_url: string
          is_available?: boolean
          location: string
          name: string
          price_ngn: number
          scientific_name?: string | null
          updated_at?: string
        }
        Update: {
          carbon_offset_kg?: number | null
          country?: string
          created_at?: string
          description?: string | null
          growth_time_years?: number | null
          id?: string
          image_url?: string
          is_available?: boolean
          location?: string
          name?: string
          price_ngn?: number
          scientific_name?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      typing_indicators: {
        Row: {
          conversation_id: string | null
          id: string
          last_typed_at: string | null
          user_id: string | null
        }
        Insert: {
          conversation_id?: string | null
          id?: string
          last_typed_at?: string | null
          user_id?: string | null
        }
        Update: {
          conversation_id?: string | null
          id?: string
          last_typed_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "typing_indicators_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      user_behavior_profiles: {
        Row: {
          characteristics: Json
          confidence_score: number | null
          created_at: string
          id: string
          interaction_style: string | null
          last_updated: string
          optimal_response_length: string | null
          preferences: Json | null
          preferred_communication_time: string[] | null
          profile_type: string
          user_id: string
        }
        Insert: {
          characteristics: Json
          confidence_score?: number | null
          created_at?: string
          id?: string
          interaction_style?: string | null
          last_updated?: string
          optimal_response_length?: string | null
          preferences?: Json | null
          preferred_communication_time?: string[] | null
          profile_type: string
          user_id: string
        }
        Update: {
          characteristics?: Json
          confidence_score?: number | null
          created_at?: string
          id?: string
          interaction_style?: string | null
          last_updated?: string
          optimal_response_length?: string | null
          preferences?: Json | null
          preferred_communication_time?: string[] | null
          profile_type?: string
          user_id?: string
        }
        Relationships: []
      }
      user_devices: {
        Row: {
          browser: string | null
          created_at: string
          device_fingerprint: string
          device_name: string | null
          device_type: string | null
          id: string
          ip_address: unknown | null
          is_trusted: boolean | null
          last_used: string | null
          location: Json | null
          user_id: string
        }
        Insert: {
          browser?: string | null
          created_at?: string
          device_fingerprint: string
          device_name?: string | null
          device_type?: string | null
          id?: string
          ip_address?: unknown | null
          is_trusted?: boolean | null
          last_used?: string | null
          location?: Json | null
          user_id: string
        }
        Update: {
          browser?: string | null
          created_at?: string
          device_fingerprint?: string
          device_name?: string | null
          device_type?: string | null
          id?: string
          ip_address?: unknown | null
          is_trusted?: boolean | null
          last_used?: string | null
          location?: Json | null
          user_id?: string
        }
        Relationships: []
      }
      user_role_requests: {
        Row: {
          contact_phone: string | null
          created_at: string
          credentials: string | null
          experience_years: number | null
          id: string
          issuing_authority: string | null
          license_number: string | null
          reason: string
          requested_role: string
          review_notes: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          contact_phone?: string | null
          created_at?: string
          credentials?: string | null
          experience_years?: number | null
          id?: string
          issuing_authority?: string | null
          license_number?: string | null
          reason: string
          requested_role: string
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          contact_phone?: string | null
          created_at?: string
          credentials?: string | null
          experience_years?: number | null
          id?: string
          issuing_authority?: string | null
          license_number?: string | null
          reason?: string
          requested_role?: string
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_role_requests_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_role_requests_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          assigned_at: string
          assigned_by: string | null
          expires_at: string | null
          id: string
          is_active: boolean | null
          metadata: Json | null
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          assigned_at?: string
          assigned_by?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          metadata?: Json | null
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          assigned_at?: string
          assigned_by?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          metadata?: Json | null
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      users: {
        Row: {
          address: string | null
          avatar: string | null
          bio: string | null
          city: string | null
          coordinates: Json | null
          country: string | null
          created_at: string
          date_of_birth: string | null
          email: string
          first_name: string
          full_name: string | null
          gender: string | null
          has_setup: boolean | null
          has_setup_preference: boolean | null
          id: string
          interest: string | null
          is_active: boolean | null
          is_verified: boolean | null
          last_login: string | null
          last_name: string
          lga: string | null
          middle_name: string | null
          nationality: string | null
          phone: string | null
          state: string | null
          state_of_origin: string | null
          updated_at: string | null
          user_type: string
          verification_status:
            | Database["public"]["Enums"]["verification_status"]
            | null
        }
        Insert: {
          address?: string | null
          avatar?: string | null
          bio?: string | null
          city?: string | null
          coordinates?: Json | null
          country?: string | null
          created_at?: string
          date_of_birth?: string | null
          email: string
          first_name: string
          full_name?: string | null
          gender?: string | null
          has_setup?: boolean | null
          has_setup_preference?: boolean | null
          id?: string
          interest?: string | null
          is_active?: boolean | null
          is_verified?: boolean | null
          last_login?: string | null
          last_name: string
          lga?: string | null
          middle_name?: string | null
          nationality?: string | null
          phone?: string | null
          state?: string | null
          state_of_origin?: string | null
          updated_at?: string | null
          user_type?: string
          verification_status?:
            | Database["public"]["Enums"]["verification_status"]
            | null
        }
        Update: {
          address?: string | null
          avatar?: string | null
          bio?: string | null
          city?: string | null
          coordinates?: Json | null
          country?: string | null
          created_at?: string
          date_of_birth?: string | null
          email?: string
          first_name?: string
          full_name?: string | null
          gender?: string | null
          has_setup?: boolean | null
          has_setup_preference?: boolean | null
          id?: string
          interest?: string | null
          is_active?: boolean | null
          is_verified?: boolean | null
          last_login?: string | null
          last_name?: string
          lga?: string | null
          middle_name?: string | null
          nationality?: string | null
          phone?: string | null
          state?: string | null
          state_of_origin?: string | null
          updated_at?: string | null
          user_type?: string
          verification_status?:
            | Database["public"]["Enums"]["verification_status"]
            | null
        }
        Relationships: []
      }
      verification_history: {
        Row: {
          action: string
          created_at: string
          id: string
          metadata: Json | null
          new_status: string | null
          notes: string | null
          previous_status: string | null
          verification_task_id: string | null
          verifier_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          id?: string
          metadata?: Json | null
          new_status?: string | null
          notes?: string | null
          previous_status?: string | null
          verification_task_id?: string | null
          verifier_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          id?: string
          metadata?: Json | null
          new_status?: string | null
          notes?: string | null
          previous_status?: string | null
          verification_task_id?: string | null
          verifier_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "verification_history_verification_task_id_fkey"
            columns: ["verification_task_id"]
            isOneToOne: false
            referencedRelation: "verification_tasks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "verification_history_verifier_id_fkey"
            columns: ["verifier_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      verification_tasks: {
        Row: {
          assigned_at: string | null
          completed_at: string | null
          created_at: string
          deadline: string | null
          decision: string | null
          decision_reason: string | null
          id: string
          priority: string
          property_id: string | null
          status: string
          task_type: string
          updated_at: string
          verification_checklist: Json | null
          verifier_id: string | null
          verifier_notes: string | null
        }
        Insert: {
          assigned_at?: string | null
          completed_at?: string | null
          created_at?: string
          deadline?: string | null
          decision?: string | null
          decision_reason?: string | null
          id?: string
          priority?: string
          property_id?: string | null
          status?: string
          task_type?: string
          updated_at?: string
          verification_checklist?: Json | null
          verifier_id?: string | null
          verifier_notes?: string | null
        }
        Update: {
          assigned_at?: string | null
          completed_at?: string | null
          created_at?: string
          deadline?: string | null
          decision?: string | null
          decision_reason?: string | null
          id?: string
          priority?: string
          property_id?: string | null
          status?: string
          task_type?: string
          updated_at?: string
          verification_checklist?: Json | null
          verifier_id?: string | null
          verifier_notes?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "verification_tasks_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "verification_tasks_verifier_id_fkey"
            columns: ["verifier_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      verifier_credentials: {
        Row: {
          created_at: string
          documents: Json | null
          expiry_date: string
          id: string
          is_active: boolean | null
          issue_date: string
          issuing_authority: string
          license_name: string
          license_number: string
          reputation_score: number | null
          successful_verifications: number | null
          suspended_until: string | null
          suspension_reason: string | null
          total_verifications: number | null
          updated_at: string
          user_id: string
          verification_status:
            | Database["public"]["Enums"]["verification_status"]
            | null
          verified_at: string | null
          verified_by: string | null
          verifier_type: Database["public"]["Enums"]["verifier_type"]
        }
        Insert: {
          created_at?: string
          documents?: Json | null
          expiry_date: string
          id?: string
          is_active?: boolean | null
          issue_date: string
          issuing_authority: string
          license_name: string
          license_number: string
          reputation_score?: number | null
          successful_verifications?: number | null
          suspended_until?: string | null
          suspension_reason?: string | null
          total_verifications?: number | null
          updated_at?: string
          user_id: string
          verification_status?:
            | Database["public"]["Enums"]["verification_status"]
            | null
          verified_at?: string | null
          verified_by?: string | null
          verifier_type: Database["public"]["Enums"]["verifier_type"]
        }
        Update: {
          created_at?: string
          documents?: Json | null
          expiry_date?: string
          id?: string
          is_active?: boolean | null
          issue_date?: string
          issuing_authority?: string
          license_name?: string
          license_number?: string
          reputation_score?: number | null
          successful_verifications?: number | null
          suspended_until?: string | null
          suspension_reason?: string | null
          total_verifications?: number | null
          updated_at?: string
          user_id?: string
          verification_status?:
            | Database["public"]["Enums"]["verification_status"]
            | null
          verified_at?: string | null
          verified_by?: string | null
          verifier_type?: Database["public"]["Enums"]["verifier_type"]
        }
        Relationships: [
          {
            foreignKeyName: "verifier_credentials_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "verifier_credentials_verified_by_fkey"
            columns: ["verified_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      waitlist: {
        Row: {
          additional_info: string | null
          created_at: string | null
          email: string
          full_name: string | null
          id: string
          interest_type: string | null
          location: string | null
          phone_number: string | null
          referral_source: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          additional_info?: string | null
          created_at?: string | null
          email: string
          full_name?: string | null
          id?: string
          interest_type?: string | null
          location?: string | null
          phone_number?: string | null
          referral_source?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          additional_info?: string | null
          created_at?: string | null
          email?: string
          full_name?: string | null
          id?: string
          interest_type?: string | null
          location?: string | null
          phone_number?: string | null
          referral_source?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      wallets: {
        Row: {
          address: string
          balance_hbar: number | null
          created_at: string
          encrypted_private_key: string | null
          id: string
          is_primary: boolean
          is_verified: boolean
          last_sync_at: string | null
          metadata: Json
          public_key: string | null
          updated_at: string
          user_id: string
          wallet_type: string
        }
        Insert: {
          address: string
          balance_hbar?: number | null
          created_at?: string
          encrypted_private_key?: string | null
          id?: string
          is_primary?: boolean
          is_verified?: boolean
          last_sync_at?: string | null
          metadata?: Json
          public_key?: string | null
          updated_at?: string
          user_id: string
          wallet_type: string
        }
        Update: {
          address?: string
          balance_hbar?: number | null
          created_at?: string
          encrypted_private_key?: string | null
          id?: string
          is_primary?: boolean
          is_verified?: boolean
          last_sync_at?: string | null
          metadata?: Json
          public_key?: string | null
          updated_at?: string
          user_id?: string
          wallet_type?: string
        }
        Relationships: []
      }
      withdrawal_requests: {
        Row: {
          amount: number
          created_at: string
          currency: string
          external_transaction_id: string | null
          failure_reason: string | null
          fee_amount: number
          id: string
          net_amount: number
          payment_method_id: string
          processed_at: string | null
          processor_response: Json | null
          reference: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          currency?: string
          external_transaction_id?: string | null
          failure_reason?: string | null
          fee_amount?: number
          id?: string
          net_amount: number
          payment_method_id: string
          processed_at?: string | null
          processor_response?: Json | null
          reference: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string
          external_transaction_id?: string | null
          failure_reason?: string | null
          fee_amount?: number
          id?: string
          net_amount?: number
          payment_method_id?: string
          processed_at?: string | null
          processor_response?: Json | null
          reference?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "withdrawal_requests_payment_method_id_fkey"
            columns: ["payment_method_id"]
            isOneToOne: false
            referencedRelation: "payment_methods"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      poll_results: {
        Row: {
          ends_at: string | null
          option_id: string | null
          option_order: number | null
          option_text: string | null
          poll_id: string | null
          status: string | null
          title: string | null
          total_vote_weight: number | null
          total_voting_power: number | null
          vote_count: number | null
          vote_percentage: number | null
        }
        Relationships: []
      }
      user_activities: {
        Row: {
          activity_id: string | null
          activity_type: string | null
          agent_id: string | null
          metadata: Json | null
          timestamp: string | null
          user_id: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      add_conversation_participant: {
        Args: { conversation_id: string; user_id: string }
        Returns: {
          activity_type: Database["public"]["Enums"]["activity_type"] | null
          admin_id: string
          avatar_url: string | null
          created_at: string
          description: string | null
          id: string
          is_archived: boolean
          metadata: Json | null
          name: string
          participants: string[]
          settings: Json
          type: string
          updated_at: string
        }
      }
      assign_verification_task: {
        Args: {
          p_property_id: string
          p_verifier_id: string
          p_task_type?: string
          p_priority?: string
          p_deadline?: string
        }
        Returns: string
      }
      calculate_voting_power: {
        Args: { p_poll_id: string; p_voter_id: string }
        Returns: number
      }
      can_access_property: {
        Args: { _property_id: string; _user_id?: string }
        Returns: boolean
      }
      cleanup_expired_system_notifications: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      cleanup_typing_indicators: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      close_expired_polls: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      complete_verification_task: {
        Args: {
          p_task_id: string
          p_decision: string
          p_decision_reason?: string
          p_verifier_notes?: string
          p_checklist?: Json
        }
        Returns: boolean
      }
      create_investment_tracking: {
        Args: {
          p_user_id: string
          p_tokenized_property_id: string
          p_tokens_owned: number
          p_investment_amount: number
          p_purchase_price_per_token: number
        }
        Returns: string
      }
      create_notification_with_delivery: {
        Args: {
          p_user_id: string
          p_type: Database["public"]["Enums"]["notification_type"]
          p_title: string
          p_message?: string
          p_metadata?: Json
          p_action_url?: string
          p_action_label?: string
          p_image_url?: string
          p_sender_id?: string
        }
        Returns: string
      }
      get_current_user_profile: {
        Args: Record<PropertyKey, never>
        Returns: {
          address: string | null
          avatar: string | null
          bio: string | null
          city: string | null
          coordinates: Json | null
          country: string | null
          created_at: string
          date_of_birth: string | null
          email: string
          first_name: string
          full_name: string | null
          gender: string | null
          has_setup: boolean | null
          has_setup_preference: boolean | null
          id: string
          interest: string | null
          is_active: boolean | null
          is_verified: boolean | null
          last_login: string | null
          last_name: string
          lga: string | null
          middle_name: string | null
          nationality: string | null
          phone: string | null
          state: string | null
          state_of_origin: string | null
          updated_at: string | null
          user_type: string
          verification_status:
            | Database["public"]["Enums"]["verification_status"]
            | null
        }[]
      }
      get_property_secure: {
        Args: { _property_id: string }
        Returns: {
          amenities: string[] | null
          backdrop: string | null
          blockchain_transaction_id: string | null
          category: string
          condition: string | null
          created_at: string
          description: string | null
          documents: Json | null
          favorites: number | null
          features: string[] | null
          garages: number | null
          id: string
          is_ad: boolean | null
          is_deleted: boolean | null
          is_exclusive: boolean | null
          is_featured: boolean | null
          is_tokenized: boolean | null
          is_verified: boolean | null
          land_title_id: string | null
          likes: number | null
          location: Json
          max_guest: number | null
          price: Json
          ratings: number | null
          review_count: number | null
          specification: Json
          sqrft: string | null
          status: string
          sub_type: string | null
          tags: string[] | null
          title: string | null
          tokenized_property_id: string | null
          type: string
          updated_at: string | null
          user_id: string
          views: number | null
          year_built: string | null
        }
      }
      get_user_active_roles: {
        Args: { _user_id?: string }
        Returns: Database["public"]["Enums"]["app_role"][]
      }
      get_user_role_priority: {
        Args: { _user_id: string }
        Returns: number
      }
      has_role: {
        Args: {
          _user_id: string
          _role: Database["public"]["Enums"]["app_role"]
        }
        Returns: boolean
      }
      is_user_verified: {
        Args: { _user_id?: string }
        Returns: boolean
      }
      reassign_verifier_for_property: {
        Args: {
          p_property_id: string
          p_verifier_id: string
          p_task_type?: string
          p_priority?: string
          p_deadline?: string
        }
        Returns: undefined
      }
      register_user_device: {
        Args: {
          p_device_id: string
          p_device_type: string
          p_device_name?: string
          p_user_agent?: string
          p_is_trusted?: boolean
        }
        Returns: string
      }
      remove_conversation_participant: {
        Args: { conversation_id: string; user_id: string }
        Returns: {
          activity_type: Database["public"]["Enums"]["activity_type"] | null
          admin_id: string
          avatar_url: string | null
          created_at: string
          description: string | null
          id: string
          is_archived: boolean
          metadata: Json | null
          name: string
          participants: string[]
          settings: Json
          type: string
          updated_at: string
        }
      }
      track_agent_interaction: {
        Args: {
          p_user_id: string
          p_agent_id: string
          p_conversation_id: string
          p_property_id: string
          p_interaction_type: string
          p_user_message: string
          p_agent_response: string
          p_response_time_ms: number
          p_outcome?: string
          p_context_data?: Json
        }
        Returns: string
      }
      track_property_interaction: {
        Args: {
          p_property_id: string
          p_user_id: string
          p_interaction_type: string
          p_metadata?: Json
        }
        Returns: undefined
      }
      update_conversation_context: {
        Args: {
          p_user_id: string
          p_agent_id: string
          p_conversation_id: string
          p_context_data: Json
          p_current_intent?: string
        }
        Returns: string
      }
      update_property_analytics: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
    }
    Enums: {
      activity_type: "reservation" | "rental" | "inspection" | "investment"
      agreement_status:
        | "draft"
        | "active"
        | "completed"
        | "cancelled"
        | "disputed"
      agreement_type: "sale" | "lease" | "transfer" | "mortgage" | "easement"
      app_role:
        | "admin"
        | "landowner"
        | "verifier"
        | "agent"
        | "investor"
        | "user"
      compliance_status: "compliant" | "non_compliant" | "pending" | "expired"
      compliance_type:
        | "tax_payment"
        | "land_use_approval"
        | "environmental_clearance"
        | "building_permit"
      document_status: "pending" | "verified" | "rejected" | "expired"
      document_type:
        | "deed"
        | "survey"
        | "certificate_of_occupancy"
        | "government_consent"
        | "tax_clearance"
        | "other"
      identity_type:
        | "nin"
        | "bvn"
        | "cac"
        | "passport"
        | "drivers_license"
        | "national_id"
        | "voters_card"
      investment_terms: "fixed" | "variable" | "hybrid"
      land_title_status:
        | "draft"
        | "pending_verification"
        | "verified"
        | "disputed"
        | "revoked"
      notification_type:
        | "reservation"
        | "rental"
        | "inspection"
        | "payment"
        | "general"
        | "investment"
        | "chat"
        | "property_updates"
        | "verification_updates"
      token_type: "erc20" | "erc721" | "hts_fungible" | "hts_nft"
      tokenization_status:
        | "draft"
        | "pending_approval"
        | "approved"
        | "minted"
        | "active"
        | "paused"
        | "retired"
      transaction_status: "pending" | "confirmed" | "failed"
      transaction_type: "mint" | "transfer" | "burn" | "split"
      verification_status:
        | "verified"
        | "pending"
        | "unverified"
        | "rejected"
        | "expired"
      verifier_type:
        | "surveyor"
        | "lawyer"
        | "estate_agent"
        | "government_official"
        | "chartered_surveyor"
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
      activity_type: ["reservation", "rental", "inspection", "investment"],
      agreement_status: [
        "draft",
        "active",
        "completed",
        "cancelled",
        "disputed",
      ],
      agreement_type: ["sale", "lease", "transfer", "mortgage", "easement"],
      app_role: ["admin", "landowner", "verifier", "agent", "investor", "user"],
      compliance_status: ["compliant", "non_compliant", "pending", "expired"],
      compliance_type: [
        "tax_payment",
        "land_use_approval",
        "environmental_clearance",
        "building_permit",
      ],
      document_status: ["pending", "verified", "rejected", "expired"],
      document_type: [
        "deed",
        "survey",
        "certificate_of_occupancy",
        "government_consent",
        "tax_clearance",
        "other",
      ],
      identity_type: [
        "nin",
        "bvn",
        "cac",
        "passport",
        "drivers_license",
        "national_id",
        "voters_card",
      ],
      investment_terms: ["fixed", "variable", "hybrid"],
      land_title_status: [
        "draft",
        "pending_verification",
        "verified",
        "disputed",
        "revoked",
      ],
      notification_type: [
        "reservation",
        "rental",
        "inspection",
        "payment",
        "general",
        "investment",
        "chat",
        "property_updates",
        "verification_updates",
      ],
      token_type: ["erc20", "erc721", "hts_fungible", "hts_nft"],
      tokenization_status: [
        "draft",
        "pending_approval",
        "approved",
        "minted",
        "active",
        "paused",
        "retired",
      ],
      transaction_status: ["pending", "confirmed", "failed"],
      transaction_type: ["mint", "transfer", "burn", "split"],
      verification_status: [
        "verified",
        "pending",
        "unverified",
        "rejected",
        "expired",
      ],
      verifier_type: [
        "surveyor",
        "lawyer",
        "estate_agent",
        "government_official",
        "chartered_surveyor",
      ],
    },
  },
} as const
