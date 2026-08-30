export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.15";
  };
  public: {
    Tables: {
      accounts: {
        Row: {
          bank: string | null;
          created_at: string;
          id: string;
          initial_balance: number;
          name: string;
          type: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          bank?: string | null;
          created_at?: string;
          id?: string;
          initial_balance?: number;
          name: string;
          type?: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          bank?: string | null;
          created_at?: string;
          id?: string;
          initial_balance?: number;
          name?: string;
          type?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      bills: {
        Row: {
          account_id: string | null;
          amount: number;
          category_id: string | null;
          created_at: string;
          description: string;
          due_date: string;
          id: string;
          notes: string | null;
          paid_at: string | null;
          recurrence: string;
          status: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          account_id?: string | null;
          amount: number;
          category_id?: string | null;
          created_at?: string;
          description: string;
          due_date: string;
          id?: string;
          notes?: string | null;
          paid_at?: string | null;
          recurrence?: string;
          status?: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          account_id?: string | null;
          amount?: number;
          category_id?: string | null;
          created_at?: string;
          description?: string;
          due_date?: string;
          id?: string;
          notes?: string | null;
          paid_at?: string | null;
          recurrence?: string;
          status?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "bills_account_id_fkey";
            columns: ["account_id"];
            isOneToOne: false;
            referencedRelation: "accounts";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "bills_category_id_fkey";
            columns: ["category_id"];
            isOneToOne: false;
            referencedRelation: "categories";
            referencedColumns: ["id"];
          },
        ];
      };
      categories: {
        Row: {
          color: string;
          created_at: string;
          id: string;
          is_default: boolean;
          kind: string;
          name: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          color?: string;
          created_at?: string;
          id?: string;
          is_default?: boolean;
          kind?: string;
          name: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          color?: string;
          created_at?: string;
          id?: string;
          is_default?: boolean;
          kind?: string;
          name?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      credit_card_purchases: {
        Row: {
          category_id: string | null;
          created_at: string;
          credit_card_id: string;
          description: string;
          id: string;
          installments: number;
          purchase_date: string;
          total_amount: number;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          category_id?: string | null;
          created_at?: string;
          credit_card_id: string;
          description: string;
          id?: string;
          installments?: number;
          purchase_date?: string;
          total_amount: number;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          category_id?: string | null;
          created_at?: string;
          credit_card_id?: string;
          description?: string;
          id?: string;
          installments?: number;
          purchase_date?: string;
          total_amount?: number;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "credit_card_purchases_category_id_fkey";
            columns: ["category_id"];
            isOneToOne: false;
            referencedRelation: "categories";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "credit_card_purchases_credit_card_id_fkey";
            columns: ["credit_card_id"];
            isOneToOne: false;
            referencedRelation: "credit_cards";
            referencedColumns: ["id"];
          },
        ];
      };
      credit_cards: {
        Row: {
          bank: string | null;
          closing_day: number;
          color: string;
          created_at: string;
          credit_limit: number;
          due_day: number;
          id: string;
          name: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          bank?: string | null;
          closing_day?: number;
          color?: string;
          created_at?: string;
          credit_limit?: number;
          due_day?: number;
          id?: string;
          name: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          bank?: string | null;
          closing_day?: number;
          color?: string;
          created_at?: string;
          credit_limit?: number;
          due_day?: number;
          id?: string;
          name?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      goals: {
        Row: {
          created_at: string;
          current_amount: number;
          deadline: string | null;
          description: string | null;
          id: string;
          name: string;
          target_amount: number;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          current_amount?: number;
          deadline?: string | null;
          description?: string | null;
          id?: string;
          name: string;
          target_amount?: number;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          current_amount?: number;
          deadline?: string | null;
          description?: string | null;
          id?: string;
          name?: string;
          target_amount?: number;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          created_at: string;
          current_balance: number;
          email: string;
          avatar_url: string | null;
          id: string;
          main_goal: string | null;
          monthly_income: number;
          name: string;
          onboarded: boolean;
          plan: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          current_balance?: number;
          email?: string;
          avatar_url?: string | null;
          id: string;
          main_goal?: string | null;
          monthly_income?: number;
          name?: string;
          onboarded?: boolean;
          plan?: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          current_balance?: number;
          email?: string;
          avatar_url?: string | null;
          id?: string;
          main_goal?: string | null;
          monthly_income?: number;
          name?: string;
          onboarded?: boolean;
          plan?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      subscriptions: {
        Row: {
          billing_interval: string | null;
          cancel_at_period_end: boolean;
          canceled_at: string | null;
          created_at: string;
          current_period_end_at: string | null;
          current_period_start_at: string | null;
          external_customer_id: string | null;
          external_subscription_id: string | null;
          last_webhook_at: string | null;
          last_webhook_id: string | null;
          plan: string;
          provider: string | null;
          provider_offer_id: string | null;
          provider_product_id: string | null;
          started_at: string | null;
          status: string;
          trial_end_at: string | null;
          trial_start_at: string | null;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          billing_interval?: string | null;
          cancel_at_period_end?: boolean;
          canceled_at?: string | null;
          created_at?: string;
          current_period_end_at?: string | null;
          current_period_start_at?: string | null;
          external_customer_id?: string | null;
          external_subscription_id?: string | null;
          last_webhook_at?: string | null;
          last_webhook_id?: string | null;
          plan?: string;
          provider?: string | null;
          provider_offer_id?: string | null;
          provider_product_id?: string | null;
          started_at?: string | null;
          status?: string;
          trial_end_at?: string | null;
          trial_start_at?: string | null;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          billing_interval?: string | null;
          cancel_at_period_end?: boolean;
          canceled_at?: string | null;
          created_at?: string;
          current_period_end_at?: string | null;
          current_period_start_at?: string | null;
          external_customer_id?: string | null;
          external_subscription_id?: string | null;
          last_webhook_at?: string | null;
          last_webhook_id?: string | null;
          plan?: string;
          provider?: string | null;
          provider_offer_id?: string | null;
          provider_product_id?: string | null;
          started_at?: string | null;
          status?: string;
          trial_end_at?: string | null;
          trial_start_at?: string | null;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      billing_checkout_requests: {
        Row: {
          created_at: string;
          external_checkout_id: string | null;
          id: string;
          plan_id: string;
          provider: string | null;
          status: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          external_checkout_id?: string | null;
          id?: string;
          plan_id: string;
          provider?: string | null;
          status?: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          external_checkout_id?: string | null;
          id?: string;
          plan_id?: string;
          provider?: string | null;
          status?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      billing_webhook_events: {
        Row: {
          error_message: string | null;
          event_type: string;
          id: string;
          payload: Json;
          processed_at: string | null;
          received_at: string;
          status: string;
          user_id: string | null;
        };
        Insert: {
          error_message?: string | null;
          event_type: string;
          id: string;
          payload?: Json;
          processed_at?: string | null;
          received_at?: string;
          status?: string;
          user_id?: string | null;
        };
        Update: {
          error_message?: string | null;
          event_type?: string;
          id?: string;
          payload?: Json;
          processed_at?: string | null;
          received_at?: string;
          status?: string;
          user_id?: string | null;
        };
        Relationships: [];
      };
      transactions: {
        Row: {
          account_id: string | null;
          amount: number;
          bill_id: string | null;
          category_id: string | null;
          created_at: string;
          credit_card_id: string | null;
          date: string;
          description: string;
          id: string;
          installment_number: number | null;
          installment_total: number | null;
          notes: string | null;
          payment_method: string;
          purchase_id: string | null;
          recurrence: string;
          type: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          account_id?: string | null;
          amount: number;
          bill_id?: string | null;
          category_id?: string | null;
          created_at?: string;
          credit_card_id?: string | null;
          date?: string;
          description: string;
          id?: string;
          installment_number?: number | null;
          installment_total?: number | null;
          notes?: string | null;
          payment_method?: string;
          purchase_id?: string | null;
          recurrence?: string;
          type?: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          account_id?: string | null;
          amount?: number;
          bill_id?: string | null;
          category_id?: string | null;
          created_at?: string;
          credit_card_id?: string | null;
          date?: string;
          description?: string;
          id?: string;
          installment_number?: number | null;
          installment_total?: number | null;
          notes?: string | null;
          payment_method?: string;
          purchase_id?: string | null;
          recurrence?: string;
          type?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "transactions_account_id_fkey";
            columns: ["account_id"];
            isOneToOne: false;
            referencedRelation: "accounts";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "transactions_bill_id_fkey";
            columns: ["bill_id"];
            isOneToOne: false;
            referencedRelation: "bills";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "transactions_category_id_fkey";
            columns: ["category_id"];
            isOneToOne: false;
            referencedRelation: "categories";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "transactions_credit_card_id_fkey";
            columns: ["credit_card_id"];
            isOneToOne: false;
            referencedRelation: "credit_cards";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "transactions_purchase_id_fkey";
            columns: ["purchase_id"];
            isOneToOne: false;
            referencedRelation: "credit_card_purchases";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      create_card_purchase_with_installments: {
        Args: {
          p_category_id: string | null;
          p_credit_card_id: string;
          p_description: string;
          p_installments: number;
          p_notes?: string | null;
          p_purchase_date: string;
          p_total_amount: number;
        };
        Returns: string;
      };
      get_current_entitlements: {
        Args: Record<PropertyKey, never>;
        Returns: {
          billing_interval: string | null;
          cancel_at_period_end: boolean;
          current_period_ends_at: string | null;
          is_pro: boolean;
          plan: string;
          status: string;
          trial_ends_at: string | null;
        }[];
      };
      billing_is_pro: {
        Args: { p_user_id: string };
        Returns: boolean;
      };
      prepare_billing_checkout: {
        Args: { p_plan_id: string };
        Returns: string;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    keyof DefaultSchema["Enums"] | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    keyof DefaultSchema["CompositeTypes"] | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {},
  },
} as const;
