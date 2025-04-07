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
      comments: {
        Row: {
          content: string
          created_at: string
          id: string
          post_id: string | null
          user_id: string
          user_name: string
          user_profile_image: string | null
          user_role: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          post_id?: string | null
          user_id: string
          user_name: string
          user_profile_image?: string | null
          user_role: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          post_id?: string | null
          user_id?: string
          user_name?: string
          user_profile_image?: string | null
          user_role?: string
        }
        Relationships: [
          {
            foreignKeyName: "comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      event_announcements: {
        Row: {
          content: string
          created_at: string
          creator_id: string
          creator_name: string
          event_id: string | null
          id: string
        }
        Insert: {
          content: string
          created_at?: string
          creator_id: string
          creator_name: string
          event_id?: string | null
          id?: string
        }
        Update: {
          content?: string
          created_at?: string
          creator_id?: string
          creator_name?: string
          event_id?: string | null
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_announcements_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      event_attendee_details: {
        Row: {
          additional_info: string | null
          age: number | null
          email: string
          emergency_contact: string | null
          event_id: string
          gender: string | null
          id: string
          instagram: string | null
          name: string
          phone: string | null
          profile_image: string | null
          registered_at: string | null
          twitter: string | null
          user_id: string
        }
        Insert: {
          additional_info?: string | null
          age?: number | null
          email: string
          emergency_contact?: string | null
          event_id: string
          gender?: string | null
          id?: string
          instagram?: string | null
          name: string
          phone?: string | null
          profile_image?: string | null
          registered_at?: string | null
          twitter?: string | null
          user_id: string
        }
        Update: {
          additional_info?: string | null
          age?: number | null
          email?: string
          emergency_contact?: string | null
          event_id?: string
          gender?: string | null
          id?: string
          instagram?: string | null
          name?: string
          phone?: string | null
          profile_image?: string | null
          registered_at?: string | null
          twitter?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_attendee_details_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          attendees: string[] | null
          created_at: string
          creator_id: string
          creator_name: string
          creator_role: string
          date: string
          description: string
          id: string
          image: string | null
          is_completed: boolean | null
          location: string
          pending_requests: number | null
          price: number | null
          privacy: string
          title: string
        }
        Insert: {
          attendees?: string[] | null
          created_at?: string
          creator_id: string
          creator_name: string
          creator_role: string
          date: string
          description: string
          id?: string
          image?: string | null
          is_completed?: boolean | null
          location: string
          pending_requests?: number | null
          price?: number | null
          privacy?: string
          title: string
        }
        Update: {
          attendees?: string[] | null
          created_at?: string
          creator_id?: string
          creator_name?: string
          creator_role?: string
          date?: string
          description?: string
          id?: string
          image?: string | null
          is_completed?: boolean | null
          location?: string
          pending_requests?: number | null
          price?: number | null
          privacy?: string
          title?: string
        }
        Relationships: []
      }
      followers: {
        Row: {
          created_at: string
          follower_id: string
          following_id: string
          id: string
        }
        Insert: {
          created_at?: string
          follower_id: string
          following_id: string
          id?: string
        }
        Update: {
          created_at?: string
          follower_id?: string
          following_id?: string
          id?: string
        }
        Relationships: []
      }
      group_members: {
        Row: {
          group_id: string
          id: string
          joined_at: string
          user_id: string
        }
        Insert: {
          group_id: string
          id?: string
          joined_at?: string
          user_id: string
        }
        Update: {
          group_id?: string
          id?: string
          joined_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "group_members_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
        ]
      }
      groups: {
        Row: {
          created_at: string
          creator_id: string
          creator_name: string
          creator_role: string
          description: string
          id: string
          image: string | null
          member_limit: number | null
          members: number
          name: string
          pending_requests: number | null
          price: number | null
          privacy: string
          rules: string[] | null
        }
        Insert: {
          created_at?: string
          creator_id: string
          creator_name: string
          creator_role: string
          description: string
          id?: string
          image?: string | null
          member_limit?: number | null
          members?: number
          name: string
          pending_requests?: number | null
          price?: number | null
          privacy?: string
          rules?: string[] | null
        }
        Update: {
          created_at?: string
          creator_id?: string
          creator_name?: string
          creator_role?: string
          description?: string
          id?: string
          image?: string | null
          member_limit?: number | null
          members?: number
          name?: string
          pending_requests?: number | null
          price?: number | null
          privacy?: string
          rules?: string[] | null
        }
        Relationships: []
      }
      job_postings: {
        Row: {
          application_deadline: string | null
          application_email: string | null
          application_url: string | null
          benefits: string[] | null
          company_description: string | null
          company_id: string
          company_logo: string | null
          company_name: string
          created_at: string
          description: string
          id: string
          job_type: string
          location: string | null
          requirements: string[] | null
          responsibilities: string[] | null
          salary_range: string | null
          skills: string[] | null
          title: string
          updated_at: string
        }
        Insert: {
          application_deadline?: string | null
          application_email?: string | null
          application_url?: string | null
          benefits?: string[] | null
          company_description?: string | null
          company_id: string
          company_logo?: string | null
          company_name: string
          created_at?: string
          description: string
          id?: string
          job_type?: string
          location?: string | null
          requirements?: string[] | null
          responsibilities?: string[] | null
          salary_range?: string | null
          skills?: string[] | null
          title: string
          updated_at?: string
        }
        Update: {
          application_deadline?: string | null
          application_email?: string | null
          application_url?: string | null
          benefits?: string[] | null
          company_description?: string | null
          company_id?: string
          company_logo?: string | null
          company_name?: string
          created_at?: string
          description?: string
          id?: string
          job_type?: string
          location?: string | null
          requirements?: string[] | null
          responsibilities?: string[] | null
          salary_range?: string | null
          skills?: string[] | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      join_requests: {
        Row: {
          created_at: string
          event_id: string | null
          group_id: string | null
          id: string
          status: string
          user_id: string
          user_name: string
          user_profile_image: string | null
        }
        Insert: {
          created_at?: string
          event_id?: string | null
          group_id?: string | null
          id?: string
          status?: string
          user_id: string
          user_name: string
          user_profile_image?: string | null
        }
        Update: {
          created_at?: string
          event_id?: string | null
          group_id?: string | null
          id?: string
          status?: string
          user_id?: string
          user_name?: string
          user_profile_image?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "join_requests_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string
          created_at: string
          group_id: string | null
          id: string
          media_type: string | null
          media_url: string | null
          user_id: string
          user_name: string
          user_profile_image: string | null
          user_role: string
        }
        Insert: {
          content: string
          created_at?: string
          group_id?: string | null
          id?: string
          media_type?: string | null
          media_url?: string | null
          user_id: string
          user_name: string
          user_profile_image?: string | null
          user_role: string
        }
        Update: {
          content?: string
          created_at?: string
          group_id?: string | null
          id?: string
          media_type?: string | null
          media_url?: string | null
          user_id?: string
          user_name?: string
          user_profile_image?: string | null
          user_role?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
        ]
      }
      post_likes: {
        Row: {
          created_at: string
          id: string
          post_id: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          post_id?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          post_id?: string | null
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
      posts: {
        Row: {
          comments_count: number | null
          content: string
          created_at: string
          id: string
          image: string | null
          likes_count: number | null
          user_id: string
          user_name: string
          user_profile_image: string | null
          user_role: string
        }
        Insert: {
          comments_count?: number | null
          content: string
          created_at?: string
          id?: string
          image?: string | null
          likes_count?: number | null
          user_id: string
          user_name: string
          user_profile_image?: string | null
          user_role: string
        }
        Update: {
          comments_count?: number | null
          content?: string
          created_at?: string
          id?: string
          image?: string | null
          likes_count?: number | null
          user_id?: string
          user_name?: string
          user_profile_image?: string | null
          user_role?: string
        }
        Relationships: []
      }
      products: {
        Row: {
          category: string
          company_id: string
          company_logo: string | null
          company_name: string
          created_at: string
          demo_url: string | null
          description: string
          features: string[] | null
          id: string
          image: string | null
          long_description: string | null
          price: string
          pricing_tiers: Json | null
          release_date: string
          tags: string[] | null
          title: string
          use_cases: string[] | null
          website_url: string | null
        }
        Insert: {
          category: string
          company_id: string
          company_logo?: string | null
          company_name: string
          created_at?: string
          demo_url?: string | null
          description: string
          features?: string[] | null
          id?: string
          image?: string | null
          long_description?: string | null
          price: string
          pricing_tiers?: Json | null
          release_date: string
          tags?: string[] | null
          title: string
          use_cases?: string[] | null
          website_url?: string | null
        }
        Update: {
          category?: string
          company_id?: string
          company_logo?: string | null
          company_name?: string
          created_at?: string
          demo_url?: string | null
          description?: string
          features?: string[] | null
          id?: string
          image?: string | null
          long_description?: string | null
          price?: string
          pricing_tiers?: Json | null
          release_date?: string
          tags?: string[] | null
          title?: string
          use_cases?: string[] | null
          website_url?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          bio: string | null
          created_at: string
          email: string
          followers: number | null
          following: string[] | null
          id: string
          interests: string[] | null
          location: string | null
          name: string
          profile_image: string | null
          role: string
          social_links: Json | null
          verified: boolean | null
        }
        Insert: {
          bio?: string | null
          created_at?: string
          email: string
          followers?: number | null
          following?: string[] | null
          id: string
          interests?: string[] | null
          location?: string | null
          name: string
          profile_image?: string | null
          role: string
          social_links?: Json | null
          verified?: boolean | null
        }
        Update: {
          bio?: string | null
          created_at?: string
          email?: string
          followers?: number | null
          following?: string[] | null
          id?: string
          interests?: string[] | null
          location?: string | null
          name?: string
          profile_image?: string | null
          role?: string
          social_links?: Json | null
          verified?: boolean | null
        }
        Relationships: []
      }
      service_bookings: {
        Row: {
          created_at: string
          id: string
          notes: string | null
          payment_status: string
          service_id: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          notes?: string | null
          payment_status?: string
          service_id: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          notes?: string | null
          payment_status?: string
          service_id?: string
          status?: string
          updated_at?: string
          user_id?: string
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
      service_enrollments: {
        Row: {
          amount: number | null
          created_at: string
          id: string
          payment_completed: boolean | null
          payment_required: boolean | null
          payment_status: string
          service_id: string
          status: string
          user_email: string
          user_id: string
          user_name: string
          user_profile_image: string | null
        }
        Insert: {
          amount?: number | null
          created_at?: string
          id?: string
          payment_completed?: boolean | null
          payment_required?: boolean | null
          payment_status?: string
          service_id: string
          status?: string
          user_email: string
          user_id: string
          user_name: string
          user_profile_image?: string | null
        }
        Update: {
          amount?: number | null
          created_at?: string
          id?: string
          payment_completed?: boolean | null
          payment_required?: boolean | null
          payment_status?: string
          service_id?: string
          status?: string
          user_email?: string
          user_id?: string
          user_name?: string
          user_profile_image?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "service_enrollments_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      service_messages: {
        Row: {
          content: string
          created_at: string
          id: string
          service_id: string
          user_id: string
          user_name: string
          user_profile_image: string | null
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          service_id: string
          user_id: string
          user_name: string
          user_profile_image?: string | null
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          service_id?: string
          user_id?: string
          user_name?: string
          user_profile_image?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "service_messages_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      services: {
        Row: {
          capacity: number | null
          coach_id: string
          coach_name: string
          cover_image: string | null
          created_at: string
          description: string | null
          duration: string | null
          id: string
          image: string | null
          is_active: boolean
          is_free: boolean
          is_online: boolean
          location: string | null
          meeting_url: string | null
          price: number
          service_type: string
          start_time: string | null
          title: string
          updated_at: string
        }
        Insert: {
          capacity?: number | null
          coach_id: string
          coach_name: string
          cover_image?: string | null
          created_at?: string
          description?: string | null
          duration?: string | null
          id?: string
          image?: string | null
          is_active?: boolean
          is_free?: boolean
          is_online?: boolean
          location?: string | null
          meeting_url?: string | null
          price?: number
          service_type: string
          start_time?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          capacity?: number | null
          coach_id?: string
          coach_name?: string
          cover_image?: string | null
          created_at?: string
          description?: string | null
          duration?: string | null
          id?: string
          image?: string | null
          is_active?: boolean
          is_free?: boolean
          is_online?: boolean
          location?: string | null
          meeting_url?: string | null
          price?: number
          service_type?: string
          start_time?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      sponsorship_applications: {
        Row: {
          created_at: string
          experience: string
          id: string
          motivation: string
          social_links: Json | null
          sponsorship_id: string
          status: string
          user_email: string
          user_id: string
          user_name: string
          user_profile_image: string | null
        }
        Insert: {
          created_at?: string
          experience: string
          id?: string
          motivation: string
          social_links?: Json | null
          sponsorship_id: string
          status?: string
          user_email: string
          user_id: string
          user_name: string
          user_profile_image?: string | null
        }
        Update: {
          created_at?: string
          experience?: string
          id?: string
          motivation?: string
          social_links?: Json | null
          sponsorship_id?: string
          status?: string
          user_email?: string
          user_id?: string
          user_name?: string
          user_profile_image?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sponsorship_applications_sponsorship_id_fkey"
            columns: ["sponsorship_id"]
            isOneToOne: false
            referencedRelation: "sponsorships"
            referencedColumns: ["id"]
          },
        ]
      }
      sponsorships: {
        Row: {
          benefits: string[]
          company_id: string
          company_logo: string | null
          company_name: string
          compensation: string | null
          created_at: string
          deadline: string | null
          description: string
          id: string
          requirements: string[]
          status: string
          tags: string[] | null
          title: string
        }
        Insert: {
          benefits: string[]
          company_id: string
          company_logo?: string | null
          company_name: string
          compensation?: string | null
          created_at?: string
          deadline?: string | null
          description: string
          id?: string
          requirements: string[]
          status: string
          tags?: string[] | null
          title: string
        }
        Update: {
          benefits?: string[]
          company_id?: string
          company_logo?: string | null
          company_name?: string
          compensation?: string | null
          created_at?: string
          deadline?: string | null
          description?: string
          id?: string
          requirements?: string[]
          status?: string
          tags?: string[] | null
          title?: string
        }
        Relationships: []
      }
      workshop_registrations: {
        Row: {
          created_at: string
          id: string
          status: string
          user_email: string
          user_id: string
          user_name: string
          user_profile_image: string | null
          workshop_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          status?: string
          user_email: string
          user_id: string
          user_name: string
          user_profile_image?: string | null
          workshop_id: string
        }
        Update: {
          created_at?: string
          id?: string
          status?: string
          user_email?: string
          user_id?: string
          user_name?: string
          user_profile_image?: string | null
          workshop_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workshop_registrations_workshop_id_fkey"
            columns: ["workshop_id"]
            isOneToOne: false
            referencedRelation: "workshops"
            referencedColumns: ["id"]
          },
        ]
      }
      workshops: {
        Row: {
          capacity: number | null
          category: string
          company_id: string
          company_logo: string | null
          company_name: string
          created_at: string
          date: string
          description: string
          duration: string
          end_time: string | null
          id: string
          image: string | null
          includes: string[] | null
          instructors: Json | null
          is_online: boolean
          location: string | null
          long_description: string | null
          meeting_url: string | null
          prerequisites: string[] | null
          price: number
          start_time: string | null
          tags: string[] | null
          title: string
          topics: string[] | null
        }
        Insert: {
          capacity?: number | null
          category: string
          company_id: string
          company_logo?: string | null
          company_name: string
          created_at?: string
          date: string
          description: string
          duration: string
          end_time?: string | null
          id?: string
          image?: string | null
          includes?: string[] | null
          instructors?: Json | null
          is_online?: boolean
          location?: string | null
          long_description?: string | null
          meeting_url?: string | null
          prerequisites?: string[] | null
          price?: number
          start_time?: string | null
          tags?: string[] | null
          title: string
          topics?: string[] | null
        }
        Update: {
          capacity?: number | null
          category?: string
          company_id?: string
          company_logo?: string | null
          company_name?: string
          created_at?: string
          date?: string
          description?: string
          duration?: string
          end_time?: string | null
          id?: string
          image?: string | null
          includes?: string[] | null
          instructors?: Json | null
          is_online?: boolean
          location?: string | null
          long_description?: string | null
          meeting_url?: string | null
          prerequisites?: string[] | null
          price?: number
          start_time?: string | null
          tags?: string[] | null
          title?: string
          topics?: string[] | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_event: {
        Args: {
          title: string
          description: string
          creator_id: string
          creator_name: string
          creator_role: string
          location: string
          date: string
          image: string
          privacy: string
          price: number
          attendees: string[]
          pending_requests: number
        }
        Returns: Json
      }
      create_service_booking: {
        Args: {
          p_service_id: string
          p_user_id: string
          p_notes?: string
          p_payment_status?: string
          p_status?: string
        }
        Returns: string
      }
      decrement_post_comments: {
        Args: { post_id: string }
        Returns: undefined
      }
      decrement_post_likes: {
        Args: { post_id: string }
        Returns: undefined
      }
      delete_user: {
        Args: { p_user_id: string }
        Returns: undefined
      }
      get_service_bookings: {
        Args: { p_service_id: string }
        Returns: {
          id: string
          service_id: string
          user_id: string
          user_name: string
          user_email: string
          status: string
          payment_status: string
          notes: string
          created_at: string
        }[]
      }
      get_service_chat_messages: {
        Args: { p_service_id: string }
        Returns: {
          id: string
          service_id: string
          user_id: string
          user_name: string
          user_profile_image: string
          content: string
          created_at: string
        }[]
      }
      get_user_booking_for_service: {
        Args: { p_service_id: string; p_user_id: string }
        Returns: {
          id: string
          service_id: string
          user_id: string
          user_name: string
          user_email: string
          status: string
          payment_status: string
          notes: string
          created_at: string
        }[]
      }
      get_user_bookings: {
        Args: { p_user_id: string }
        Returns: {
          id: string
          service_id: string
          user_id: string
          user_name: string
          user_email: string
          status: string
          payment_status: string
          notes: string
          created_at: string
          service_title: string
          coach_name: string
          price: number
          duration: string
          is_online: boolean
          service_type: string
        }[]
      }
      increment_post_comments: {
        Args: { post_id: string }
        Returns: undefined
      }
      increment_post_likes: {
        Args: { post_id: string }
        Returns: undefined
      }
      send_service_chat_message: {
        Args: { p_service_id: string; p_user_id: string; p_content: string }
        Returns: string
      }
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
