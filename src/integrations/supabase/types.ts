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
      profiles: {
        Row: {
          bio: string | null
          created_at: string
          email: string
          followers: number | null
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

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
