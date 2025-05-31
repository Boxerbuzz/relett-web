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
          created_at: string
          id: string
          image_url: string | null
          is_read: boolean
          message: string | null
          metadata: Json
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
          created_at?: string
          id?: string
          image_url?: string | null
          is_read?: boolean
          message?: string | null
          metadata?: Json
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
          created_at?: string
          id?: string
          image_url?: string | null
          is_read?: boolean
          message?: string | null
          metadata?: Json
          sender_id?: string | null
          title?: string
          type?: Database["public"]["Enums"]["notification_type"]
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_sender_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_user_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
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
      properties: {
        Row: {
          amenities: string[] | null
          backdrop: string | null
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
          is_verified: boolean | null
          likes: number | null
          location: Json
          max_guest: number | null
          price: Json
          ratings: number | null
          review_count: number | null
          specification: Json
          sqrft: string | null
          status: string
          tags: string[] | null
          title: string | null
          type: string
          updated_at: string | null
          user_id: string
          views: number | null
          year_built: string | null
        }
        Insert: {
          amenities?: string[] | null
          backdrop?: string | null
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
          is_verified?: boolean | null
          likes?: number | null
          location: Json
          max_guest?: number | null
          price: Json
          ratings?: number | null
          review_count?: number | null
          specification: Json
          sqrft?: string | null
          status: string
          tags?: string[] | null
          title?: string | null
          type: string
          updated_at?: string | null
          user_id: string
          views?: number | null
          year_built?: string | null
        }
        Update: {
          amenities?: string[] | null
          backdrop?: string | null
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
          is_verified?: boolean | null
          likes?: number | null
          location?: Json
          max_guest?: number | null
          price?: Json
          ratings?: number | null
          review_count?: number | null
          specification?: Json
          sqrft?: string | null
          status?: string
          tags?: string[] | null
          title?: string | null
          type?: string
          updated_at?: string | null
          user_id?: string
          views?: number | null
          year_built?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "properties_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
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
          sort_order?: number | null
          thumbnail_url?: string | null
          url?: string
        }
        Relationships: []
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
          payment_status: string
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
          payment_status?: string
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
          payment_status?: string
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
      user_preferences: {
        Row: {
          address: string | null
          city: string | null
          coordinates: Json | null
          country: string | null
          created_at: string
          digest: Json | null
          do_not_disturb: boolean | null
          enabled: boolean | null
          has_setup_preference: boolean | null
          interest: string | null
          notification_channels: Json | null
          notification_types: Json | null
          quiet_hours_end: string | null
          quiet_hours_start: string | null
          state: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          address?: string | null
          city?: string | null
          coordinates?: Json | null
          country?: string | null
          created_at?: string
          digest?: Json | null
          do_not_disturb?: boolean | null
          enabled?: boolean | null
          has_setup_preference?: boolean | null
          interest?: string | null
          notification_channels?: Json | null
          notification_types?: Json | null
          quiet_hours_end?: string | null
          quiet_hours_start?: string | null
          state?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          address?: string | null
          city?: string | null
          coordinates?: Json | null
          country?: string | null
          created_at?: string
          digest?: Json | null
          do_not_disturb?: boolean | null
          enabled?: boolean | null
          has_setup_preference?: boolean | null
          interest?: string | null
          notification_channels?: Json | null
          notification_types?: Json | null
          quiet_hours_end?: string | null
          quiet_hours_start?: string | null
          state?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_preferences_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          avatar: string | null
          bio: string | null
          created_at: string
          email: string
          first_name: string
          full_name: string | null
          has_setup: boolean | null
          id: string
          is_active: boolean | null
          is_verified: boolean | null
          last_name: string
          phone: string | null
          updated_at: string | null
          user_type: string
          verification_status:
            | Database["public"]["Enums"]["verification_status"]
            | null
        }
        Insert: {
          avatar?: string | null
          bio?: string | null
          created_at?: string
          email: string
          first_name: string
          full_name?: string | null
          has_setup?: boolean | null
          id?: string
          is_active?: boolean | null
          is_verified?: boolean | null
          last_name: string
          phone?: string | null
          updated_at?: string | null
          user_type?: string
          verification_status?:
            | Database["public"]["Enums"]["verification_status"]
            | null
        }
        Update: {
          avatar?: string | null
          bio?: string | null
          created_at?: string
          email?: string
          first_name?: string
          full_name?: string | null
          has_setup?: boolean | null
          id?: string
          is_active?: boolean | null
          is_verified?: boolean | null
          last_name?: string
          phone?: string | null
          updated_at?: string | null
          user_type?: string
          verification_status?:
            | Database["public"]["Enums"]["verification_status"]
            | null
        }
        Relationships: []
      }
    }
    Views: {
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
    }
    Enums: {
      activity_type: "reservation" | "rental" | "inspection" | "investment"
      notification_type:
        | "reservation"
        | "rental"
        | "inspection"
        | "payment"
        | "general"
        | "investment"
        | "chat"
      verification_status: "verified" | "pending" | "unverified" | "rejected"
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
      activity_type: ["reservation", "rental", "inspection", "investment"],
      notification_type: [
        "reservation",
        "rental",
        "inspection",
        "payment",
        "general",
        "investment",
        "chat",
      ],
      verification_status: ["verified", "pending", "unverified", "rejected"],
    },
  },
} as const
