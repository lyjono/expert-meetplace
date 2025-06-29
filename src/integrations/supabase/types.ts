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
      appointments: {
        Row: {
          client_id: string
          created_at: string | null
          date: string
          id: string
          method: string
          provider_id: string
          room_id: string | null
          service: string
          status: string
          time: string
          updated_at: string | null
        }
        Insert: {
          client_id: string
          created_at?: string | null
          date: string
          id?: string
          method: string
          provider_id: string
          room_id?: string | null
          service: string
          status?: string
          time: string
          updated_at?: string | null
        }
        Update: {
          client_id?: string
          created_at?: string | null
          date?: string
          id?: string
          method?: string
          provider_id?: string
          room_id?: string | null
          service?: string
          status?: string
          time?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "appointments_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "client_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "provider_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      client_profiles: {
        Row: {
          address: string | null
          avatar_url: string | null
          bio: string | null
          city: string | null
          created_at: string | null
          email: string
          id: string
          name: string
          phone: string | null
          state: string | null
          updated_at: string | null
          user_id: string
          zip: string | null
        }
        Insert: {
          address?: string | null
          avatar_url?: string | null
          bio?: string | null
          city?: string | null
          created_at?: string | null
          email: string
          id?: string
          name: string
          phone?: string | null
          state?: string | null
          updated_at?: string | null
          user_id: string
          zip?: string | null
        }
        Update: {
          address?: string | null
          avatar_url?: string | null
          bio?: string | null
          city?: string | null
          created_at?: string | null
          email?: string
          id?: string
          name?: string
          phone?: string | null
          state?: string | null
          updated_at?: string | null
          user_id?: string
          zip?: string | null
        }
        Relationships: []
      }
      client_settings: {
        Row: {
          activity_tracking: boolean | null
          created_at: string | null
          email_notifications: boolean | null
          id: string
          marketing_emails: boolean | null
          profile_visibility: boolean | null
          sms_notifications: boolean | null
          timezone: string | null
          two_factor_auth: boolean | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          activity_tracking?: boolean | null
          created_at?: string | null
          email_notifications?: boolean | null
          id?: string
          marketing_emails?: boolean | null
          profile_visibility?: boolean | null
          sms_notifications?: boolean | null
          timezone?: string | null
          two_factor_auth?: boolean | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          activity_tracking?: boolean | null
          created_at?: string | null
          email_notifications?: boolean | null
          id?: string
          marketing_emails?: boolean | null
          profile_visibility?: boolean | null
          sms_notifications?: boolean | null
          timezone?: string | null
          two_factor_auth?: boolean | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      documents: {
        Row: {
          created_at: string | null
          file_path: string
          file_type: string
          id: string
          name: string
          shared_with: string[] | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          file_path: string
          file_type: string
          id?: string
          name: string
          shared_with?: string[] | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          file_path?: string
          file_type?: string
          id?: string
          name?: string
          shared_with?: string[] | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      leads: {
        Row: {
          created_at: string | null
          date: string
          email: string
          id: string
          image_url: string | null
          message: string | null
          name: string
          phone: string | null
          provider_id: string | null
          service: string
          status: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          date: string
          email: string
          id?: string
          image_url?: string | null
          message?: string | null
          name: string
          phone?: string | null
          provider_id?: string | null
          service: string
          status?: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          date?: string
          email?: string
          id?: string
          image_url?: string | null
          message?: string | null
          name?: string
          phone?: string | null
          provider_id?: string | null
          service?: string
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "leads_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "provider_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          attachment_name: string | null
          attachment_type: string | null
          attachment_url: string | null
          content: string
          created_at: string | null
          id: string
          is_video_call: boolean | null
          read: boolean | null
          receiver_id: string
          sender_id: string
        }
        Insert: {
          attachment_name?: string | null
          attachment_type?: string | null
          attachment_url?: string | null
          content: string
          created_at?: string | null
          id?: string
          is_video_call?: boolean | null
          read?: boolean | null
          receiver_id: string
          sender_id: string
        }
        Update: {
          attachment_name?: string | null
          attachment_type?: string | null
          attachment_url?: string | null
          content?: string
          created_at?: string | null
          id?: string
          is_video_call?: boolean | null
          read?: boolean | null
          receiver_id?: string
          sender_id?: string
        }
        Relationships: []
      }
      provider_availability: {
        Row: {
          created_at: string | null
          day_of_week: number
          end_time: string
          id: string
          provider_id: string
          start_time: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          day_of_week: number
          end_time: string
          id?: string
          provider_id: string
          start_time: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          day_of_week?: number
          end_time?: string
          id?: string
          provider_id?: string
          start_time?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "provider_availability_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "provider_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      provider_profiles: {
        Row: {
          category: string
          created_at: string | null
          email: string
          id: string
          image_url: string | null
          name: string
          rating: number | null
          specialty: string | null
          updated_at: string | null
          user_id: string
          years_experience: number | null
        }
        Insert: {
          category: string
          created_at?: string | null
          email: string
          id?: string
          image_url?: string | null
          name: string
          rating?: number | null
          specialty?: string | null
          updated_at?: string | null
          user_id: string
          years_experience?: number | null
        }
        Update: {
          category?: string
          created_at?: string | null
          email?: string
          id?: string
          image_url?: string | null
          name?: string
          rating?: number | null
          specialty?: string | null
          updated_at?: string | null
          user_id?: string
          years_experience?: number | null
        }
        Relationships: []
      }
    }
    Views: {
      users_view: {
        Row: {
          email: string | null
          id: string | null
          name: string | null
          user_id: string | null
          user_type: string | null
        }
        Relationships: []
      }
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
