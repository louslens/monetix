export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      admin_settings: {
        Row: {
          address: string
          company_name: string
          contact_email: string
          contact_phone: string
          default_lang: string
          id: number
          logo_url: string | null
          mobile_money_number: string
          notify_admin_new_client: boolean
          notify_admin_new_message: boolean
          notify_admin_new_order: boolean
          notify_near_deadline_hours: number
          updated_at: string
          whatsapp_number: string
        }
        Insert: {
          address?: string
          company_name?: string
          contact_email?: string
          contact_phone?: string
          default_lang?: string
          id?: number
          logo_url?: string | null
          mobile_money_number?: string
          notify_admin_new_client?: boolean
          notify_admin_new_message?: boolean
          notify_admin_new_order?: boolean
          notify_near_deadline_hours?: number
          updated_at?: string
          whatsapp_number?: string
        }
        Update: {
          address?: string
          company_name?: string
          contact_email?: string
          contact_phone?: string
          default_lang?: string
          id?: number
          logo_url?: string | null
          mobile_money_number?: string
          notify_admin_new_client?: boolean
          notify_admin_new_message?: boolean
          notify_admin_new_order?: boolean
          notify_near_deadline_hours?: number
          updated_at?: string
          whatsapp_number?: string
        }
        Relationships: []
      }
      contact_messages: {
        Row: {
          created_at: string
          email: string
          handled: boolean
          id: string
          kind: string
          message: string
          name: string
          phone: string
          subject: string
        }
        Insert: {
          created_at?: string
          email: string
          handled?: boolean
          id?: string
          kind?: string
          message: string
          name: string
          phone?: string
          subject?: string
        }
        Update: {
          created_at?: string
          email?: string
          handled?: boolean
          id?: string
          kind?: string
          message?: string
          name?: string
          phone?: string
          subject?: string
        }
        Relationships: []
      }
      conversations: {
        Row: {
          created_at: string
          id: string
          last_message_at: string
          order_id: string | null
          subject: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          last_message_at?: string
          order_id?: string | null
          subject?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          last_message_at?: string
          order_id?: string | null
          subject?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversations_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      deliveries: {
        Row: {
          attachments: Json
          delivered_at: string
          delivered_by: string
          id: string
          info: string
          instructions: string
          links: Json
          message: string
          order_id: string
          user_id: string
        }
        Insert: {
          attachments?: Json
          delivered_at?: string
          delivered_by: string
          id?: string
          info?: string
          instructions?: string
          links?: Json
          message?: string
          order_id: string
          user_id: string
        }
        Update: {
          attachments?: Json
          delivered_at?: string
          delivered_by?: string
          id?: string
          info?: string
          instructions?: string
          links?: Json
          message?: string
          order_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "deliveries_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: true
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deliveries_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          attachment_name: string | null
          attachment_path: string | null
          body: string
          conversation_id: string
          created_at: string
          id: string
          is_admin: boolean
          kind: string
          read_at: string | null
          sender_id: string
        }
        Insert: {
          attachment_name?: string | null
          attachment_path?: string | null
          body?: string
          conversation_id: string
          created_at?: string
          id?: string
          is_admin?: boolean
          kind?: string
          read_at?: string | null
          sender_id: string
        }
        Update: {
          attachment_name?: string | null
          attachment_path?: string | null
          body?: string
          conversation_id?: string
          created_at?: string
          id?: string
          is_admin?: boolean
          kind?: string
          read_at?: string | null
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          audience: string
          created_at: string
          id: string
          link: string | null
          params: Json
          read_at: string | null
          type: string
          user_id: string | null
        }
        Insert: {
          audience?: string
          created_at?: string
          id?: string
          link?: string | null
          params?: Json
          read_at?: string | null
          type: string
          user_id?: string | null
        }
        Update: {
          audience?: string
          created_at?: string
          id?: string
          link?: string | null
          params?: Json
          read_at?: string | null
          type?: string
          user_id?: string | null
        }
        Relationships: []
      }
      order_forms: {
        Row: {
          account_type: string
          birth_date: string
          confirmation_accepted: boolean
          country: string
          dedicated_email: string
          desired_account_name: string
          desired_username: string
          email: string
          extra_info: string
          full_name: string
          id: string
          order_id: string
          phone: string
          platform: Database["public"]["Enums"]["service_category"]
          submitted_at: string
          user_id: string
        }
        Insert: {
          account_type: string
          birth_date: string
          confirmation_accepted: boolean
          country: string
          dedicated_email: string
          desired_account_name: string
          desired_username: string
          email: string
          extra_info?: string
          full_name: string
          id?: string
          order_id: string
          phone: string
          platform: Database["public"]["Enums"]["service_category"]
          submitted_at?: string
          user_id: string
        }
        Update: {
          account_type?: string
          birth_date?: string
          confirmation_accepted?: boolean
          country?: string
          dedicated_email?: string
          desired_account_name?: string
          desired_username?: string
          email?: string
          extra_info?: string
          full_name?: string
          id?: string
          order_id?: string
          phone?: string
          platform?: Database["public"]["Enums"]["service_category"]
          submitted_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_forms_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: true
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_forms_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      order_status_history: {
        Row: {
          actor_id: string | null
          created_at: string
          event: string
          from_status: string | null
          id: string
          note: string | null
          order_id: string
          to_status: string | null
        }
        Insert: {
          actor_id?: string | null
          created_at?: string
          event: string
          from_status?: string | null
          id?: string
          note?: string | null
          order_id: string
          to_status?: string | null
        }
        Update: {
          actor_id?: string | null
          created_at?: string
          event?: string
          from_status?: string | null
          id?: string
          note?: string | null
          order_id?: string
          to_status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "order_status_history_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          amount_xaf: number
          category: Database["public"]["Enums"]["service_category"]
          countdown_started_at: string | null
          created_at: string
          deadline_at: string | null
          delivered_at: string | null
          expired_at: string | null
          id: string
          is_free: boolean
          near_deadline_notified: boolean
          order_number: string
          payment_status: Database["public"]["Enums"]["payment_status"]
          processing_started_at: string | null
          rated_at: string | null
          rating: number | null
          review: string | null
          service_id: string | null
          service_name_en: string
          service_name_fr: string
          status: Database["public"]["Enums"]["order_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          amount_xaf: number
          category: Database["public"]["Enums"]["service_category"]
          countdown_started_at?: string | null
          created_at?: string
          deadline_at?: string | null
          delivered_at?: string | null
          expired_at?: string | null
          id?: string
          is_free?: boolean
          near_deadline_notified?: boolean
          order_number?: string
          payment_status?: Database["public"]["Enums"]["payment_status"]
          processing_started_at?: string | null
          rated_at?: string | null
          rating?: number | null
          review?: string | null
          service_id?: string | null
          service_name_en: string
          service_name_fr: string
          status?: Database["public"]["Enums"]["order_status"]
          updated_at?: string
          user_id: string
        }
        Update: {
          amount_xaf?: number
          category?: Database["public"]["Enums"]["service_category"]
          countdown_started_at?: string | null
          created_at?: string
          deadline_at?: string | null
          delivered_at?: string | null
          expired_at?: string | null
          id?: string
          is_free?: boolean
          near_deadline_notified?: boolean
          order_number?: string
          payment_status?: Database["public"]["Enums"]["payment_status"]
          processing_started_at?: string | null
          rated_at?: string | null
          rating?: number | null
          review?: string | null
          service_id?: string | null
          service_name_en?: string
          service_name_fr?: string
          status?: Database["public"]["Enums"]["order_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount_xaf: number
          confirmed_at: string | null
          created_at: string
          currency: string
          failure_reason: string | null
          id: string
          operator: string
          operator_reference: string | null
          order_id: string
          phone: string
          provider: string
          provider_reference: string | null
          raw: Json | null
          status: Database["public"]["Enums"]["txn_status"]
          updated_at: string
          user_id: string
          ussd_code: string | null
        }
        Insert: {
          amount_xaf: number
          confirmed_at?: string | null
          created_at?: string
          currency?: string
          failure_reason?: string | null
          id?: string
          operator: string
          operator_reference?: string | null
          order_id: string
          phone: string
          provider?: string
          provider_reference?: string | null
          raw?: Json | null
          status?: Database["public"]["Enums"]["txn_status"]
          updated_at?: string
          user_id: string
          ussd_code?: string | null
        }
        Update: {
          amount_xaf?: number
          confirmed_at?: string | null
          created_at?: string
          currency?: string
          failure_reason?: string | null
          id?: string
          operator?: string
          operator_reference?: string | null
          order_id?: string
          phone?: string
          provider?: string
          provider_reference?: string | null
          raw?: Json | null
          status?: Database["public"]["Enums"]["txn_status"]
          updated_at?: string
          user_id?: string
          ussd_code?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      payouts: {
        Row: {
          amount_xaf: number
          created_at: string
          created_by: string
          id: string
          phone: string
          provider_reference: string | null
          raw: Json | null
          status: Database["public"]["Enums"]["txn_status"]
          updated_at: string
        }
        Insert: {
          amount_xaf: number
          created_at?: string
          created_by: string
          id?: string
          phone: string
          provider_reference?: string | null
          raw?: Json | null
          status?: Database["public"]["Enums"]["txn_status"]
          updated_at?: string
        }
        Update: {
          amount_xaf?: number
          created_at?: string
          created_by?: string
          id?: string
          phone?: string
          provider_reference?: string | null
          raw?: Json | null
          status?: Database["public"]["Enums"]["txn_status"]
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          client_code: string
          created_at: string
          email: string
          full_name: string
          id: string
          phone: string
          preferred_lang: string
          suspended: boolean
          updated_at: string
        }
        Insert: {
          client_code?: string
          created_at?: string
          email?: string
          full_name?: string
          id: string
          phone?: string
          preferred_lang?: string
          suspended?: boolean
          updated_at?: string
        }
        Update: {
          client_code?: string
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          phone?: string
          preferred_lang?: string
          suspended?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      refunds: {
        Row: {
          amount_xaf: number
          created_at: string
          id: string
          notes: string | null
          order_id: string
          payment_id: string | null
          processed_at: string | null
          provider_reference: string | null
          reason: string
          status: Database["public"]["Enums"]["refund_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          amount_xaf: number
          created_at?: string
          id?: string
          notes?: string | null
          order_id: string
          payment_id?: string | null
          processed_at?: string | null
          provider_reference?: string | null
          reason: string
          status?: Database["public"]["Enums"]["refund_status"]
          updated_at?: string
          user_id: string
        }
        Update: {
          amount_xaf?: number
          created_at?: string
          id?: string
          notes?: string | null
          order_id?: string
          payment_id?: string | null
          processed_at?: string | null
          provider_reference?: string | null
          reason?: string
          status?: Database["public"]["Enums"]["refund_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "refunds_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "refunds_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "payments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "refunds_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      services: {
        Row: {
          active: boolean
          category: Database["public"]["Enums"]["service_category"]
          created_at: string
          description_en: string
          description_fr: string
          id: string
          image_url: string | null
          name_en: string
          name_fr: string
          price_xaf: number
          sort_order: number
          updated_at: string
        }
        Insert: {
          active?: boolean
          category: Database["public"]["Enums"]["service_category"]
          created_at?: string
          description_en?: string
          description_fr?: string
          id?: string
          image_url?: string | null
          name_en: string
          name_fr: string
          price_xaf: number
          sort_order?: number
          updated_at?: string
        }
        Update: {
          active?: boolean
          category?: Database["public"]["Enums"]["service_category"]
          created_at?: string
          description_en?: string
          description_fr?: string
          id?: string
          image_url?: string | null
          name_en?: string
          name_fr?: string
          price_xaf?: number
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      admin_create_refund: {
        Args: { _amount: number; _notes: string; _order_id: string }
        Returns: undefined
      }
      admin_deliver_order: {
        Args: {
          _attachments: Json
          _info: string
          _instructions: string
          _links: Json
          _message: string
          _order_id: string
        }
        Returns: undefined
      }
      admin_set_suspended: {
        Args: { _suspended: boolean; _user_id: string }
        Returns: undefined
      }
      admin_start_processing: {
        Args: { _order_id: string }
        Returns: undefined
      }
      admin_update_refund: {
        Args: {
          _notes: string
          _reference: string
          _refund_id: string
          _status: Database["public"]["Enums"]["refund_status"]
        }
        Returns: undefined
      }
      confirm_payment: {
        Args: {
          _amount: number
          _operator_reference: string
          _payment_id: string
          _raw: Json
        }
        Returns: string
      }
      create_order: {
        Args: { _form: Json; _service_id: string }
        Returns: {
          order_id: string
          order_number: string
        }[]
      }
      fail_payment: {
        Args: { _payment_id: string; _raw: Json; _reason: string }
        Returns: undefined
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      log_order_event: {
        Args: {
          _actor: string
          _event: string
          _from: string
          _note: string
          _order_id: string
          _to: string
        }
        Returns: undefined
      }
      notify: {
        Args: {
          _audience: string
          _link: string
          _params: Json
          _type: string
          _user_id: string
        }
        Returns: undefined
      }
      process_order_deadlines: { Args: never; Returns: number }
      public_reviews: {
        Args: never
        Returns: {
          category: Database["public"]["Enums"]["service_category"]
          first_name: string
          rated_at: string
          rating: number
          review: string
          service_name_en: string
          service_name_fr: string
        }[]
      }
      rate_order: {
        Args: { _order_id: string; _rating: number; _review: string }
        Returns: undefined
      }
      server_now: { Args: never; Returns: string }
    }
    Enums: {
      app_role: "admin" | "client"
      order_status:
        | "awaiting_payment"
        | "in_queue"
        | "processing"
        | "delivered"
        | "expired_free"
        | "cancelled"
      payment_status:
        | "unpaid"
        | "pending"
        | "paid"
        | "failed"
        | "refund_pending"
        | "refunded"
      refund_status: "pending" | "processing" | "completed" | "failed"
      service_category: "tiktok" | "youtube"
      txn_status: "pending" | "successful" | "failed"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
      app_role: ["admin", "client"],
      order_status: [
        "awaiting_payment",
        "in_queue",
        "processing",
        "delivered",
        "expired_free",
        "cancelled",
      ],
      payment_status: [
        "unpaid",
        "pending",
        "paid",
        "failed",
        "refund_pending",
        "refunded",
      ],
      refund_status: ["pending", "processing", "completed", "failed"],
      service_category: ["tiktok", "youtube"],
      txn_status: ["pending", "successful", "failed"],
    },
  },
} as const
