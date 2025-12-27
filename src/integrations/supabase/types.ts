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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      announcements: {
        Row: {
          content: string
          created_at: string
          created_by: string | null
          expires_at: string | null
          id: string
          institution: string | null
          is_active: boolean | null
          is_org_wide: boolean | null
          title: string
          updated_at: string
        }
        Insert: {
          content: string
          created_at?: string
          created_by?: string | null
          expires_at?: string | null
          id?: string
          institution?: string | null
          is_active?: boolean | null
          is_org_wide?: boolean | null
          title: string
          updated_at?: string
        }
        Update: {
          content?: string
          created_at?: string
          created_by?: string | null
          expires_at?: string | null
          id?: string
          institution?: string | null
          is_active?: boolean | null
          is_org_wide?: boolean | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      attendance: {
        Row: {
          admin_override: boolean | null
          approved_at: string | null
          approved_by: string | null
          check_in_time: string | null
          created_at: string
          date: string
          id: string
          notes: string | null
          status: Database["public"]["Enums"]["attendance_status"] | null
          updated_at: string
          user_id: string
        }
        Insert: {
          admin_override?: boolean | null
          approved_at?: string | null
          approved_by?: string | null
          check_in_time?: string | null
          created_at?: string
          date: string
          id?: string
          notes?: string | null
          status?: Database["public"]["Enums"]["attendance_status"] | null
          updated_at?: string
          user_id: string
        }
        Update: {
          admin_override?: boolean | null
          approved_at?: string | null
          approved_by?: string | null
          check_in_time?: string | null
          created_at?: string
          date?: string
          id?: string
          notes?: string | null
          status?: Database["public"]["Enums"]["attendance_status"] | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      documents: {
        Row: {
          document_name: string
          document_type: string
          file_url: string
          id: string
          uploaded_at: string
          user_id: string
          verified: boolean | null
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          document_name: string
          document_type: string
          file_url: string
          id?: string
          uploaded_at?: string
          user_id: string
          verified?: boolean | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          document_name?: string
          document_type?: string
          file_url?: string
          id?: string
          uploaded_at?: string
          user_id?: string
          verified?: boolean | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: []
      }
      employee_profiles: {
        Row: {
          aadhar_number: string | null
          alternate_phone: string | null
          bank_account_name: string | null
          bank_account_number: string | null
          bank_city: string | null
          bank_ifsc_code: string | null
          bank_name: string | null
          base_salary: number | null
          biometric_id: string | null
          blood_group: string | null
          caste: string | null
          confirmation_date: string | null
          country: string | null
          created_at: string
          current_address: string | null
          current_city: string | null
          current_pincode: string | null
          current_state: string | null
          date_of_birth: string | null
          date_of_joining: string | null
          degree: string | null
          department: string | null
          designation: string | null
          driving_license: string | null
          education_worker_permit: string | null
          email: string
          emergency_contact_name: string | null
          emergency_contact_phone: string | null
          emergency_contact_relation: string | null
          employee_id: string | null
          employment_status: string | null
          employment_type: string | null
          engagement_type: string | null
          first_name: string
          gender: string | null
          has_driving_license: boolean | null
          highest_qualification: string | null
          house_number: string | null
          id: string
          institution_assignment: string | null
          is_active: boolean | null
          last_name: string
          marital_status: string | null
          medical_health_condition: string | null
          nationality: string | null
          next_increment_date: string | null
          pan_number: string | null
          passport_expiry: string | null
          passport_number: string | null
          permanent_address: string | null
          permanent_city: string | null
          permanent_pincode: string | null
          permanent_state: string | null
          phone: string | null
          position: string | null
          probation_end_date: string | null
          professional_qualification_teaching: string | null
          profile_photo_url: string | null
          project_program: string | null
          race: string | null
          religion: string | null
          role_code: string | null
          samagra_id: string | null
          skills: string[] | null
          social_category: string | null
          training_record: string | null
          university: string | null
          updated_at: string
          user_id: string
          vehicle_information: string | null
          wes_mail: string | null
          wes_mail_pass: string | null
          year_of_passing: number | null
        }
        Insert: {
          aadhar_number?: string | null
          alternate_phone?: string | null
          bank_account_name?: string | null
          bank_account_number?: string | null
          bank_city?: string | null
          bank_ifsc_code?: string | null
          bank_name?: string | null
          base_salary?: number | null
          biometric_id?: string | null
          blood_group?: string | null
          caste?: string | null
          confirmation_date?: string | null
          country?: string | null
          created_at?: string
          current_address?: string | null
          current_city?: string | null
          current_pincode?: string | null
          current_state?: string | null
          date_of_birth?: string | null
          date_of_joining?: string | null
          degree?: string | null
          department?: string | null
          designation?: string | null
          driving_license?: string | null
          education_worker_permit?: string | null
          email: string
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          emergency_contact_relation?: string | null
          employee_id?: string | null
          employment_status?: string | null
          employment_type?: string | null
          engagement_type?: string | null
          first_name: string
          gender?: string | null
          has_driving_license?: boolean | null
          highest_qualification?: string | null
          house_number?: string | null
          id?: string
          institution_assignment?: string | null
          is_active?: boolean | null
          last_name: string
          marital_status?: string | null
          medical_health_condition?: string | null
          nationality?: string | null
          next_increment_date?: string | null
          pan_number?: string | null
          passport_expiry?: string | null
          passport_number?: string | null
          permanent_address?: string | null
          permanent_city?: string | null
          permanent_pincode?: string | null
          permanent_state?: string | null
          phone?: string | null
          position?: string | null
          probation_end_date?: string | null
          professional_qualification_teaching?: string | null
          profile_photo_url?: string | null
          project_program?: string | null
          race?: string | null
          religion?: string | null
          role_code?: string | null
          samagra_id?: string | null
          skills?: string[] | null
          social_category?: string | null
          training_record?: string | null
          university?: string | null
          updated_at?: string
          user_id: string
          vehicle_information?: string | null
          wes_mail?: string | null
          wes_mail_pass?: string | null
          year_of_passing?: number | null
        }
        Update: {
          aadhar_number?: string | null
          alternate_phone?: string | null
          bank_account_name?: string | null
          bank_account_number?: string | null
          bank_city?: string | null
          bank_ifsc_code?: string | null
          bank_name?: string | null
          base_salary?: number | null
          biometric_id?: string | null
          blood_group?: string | null
          caste?: string | null
          confirmation_date?: string | null
          country?: string | null
          created_at?: string
          current_address?: string | null
          current_city?: string | null
          current_pincode?: string | null
          current_state?: string | null
          date_of_birth?: string | null
          date_of_joining?: string | null
          degree?: string | null
          department?: string | null
          designation?: string | null
          driving_license?: string | null
          education_worker_permit?: string | null
          email?: string
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          emergency_contact_relation?: string | null
          employee_id?: string | null
          employment_status?: string | null
          employment_type?: string | null
          engagement_type?: string | null
          first_name?: string
          gender?: string | null
          has_driving_license?: boolean | null
          highest_qualification?: string | null
          house_number?: string | null
          id?: string
          institution_assignment?: string | null
          is_active?: boolean | null
          last_name?: string
          marital_status?: string | null
          medical_health_condition?: string | null
          nationality?: string | null
          next_increment_date?: string | null
          pan_number?: string | null
          passport_expiry?: string | null
          passport_number?: string | null
          permanent_address?: string | null
          permanent_city?: string | null
          permanent_pincode?: string | null
          permanent_state?: string | null
          phone?: string | null
          position?: string | null
          probation_end_date?: string | null
          professional_qualification_teaching?: string | null
          profile_photo_url?: string | null
          project_program?: string | null
          race?: string | null
          religion?: string | null
          role_code?: string | null
          samagra_id?: string | null
          skills?: string[] | null
          social_category?: string | null
          training_record?: string | null
          university?: string | null
          updated_at?: string
          user_id?: string
          vehicle_information?: string | null
          wes_mail?: string | null
          wes_mail_pass?: string | null
          year_of_passing?: number | null
        }
        Relationships: []
      }
      holidays: {
        Row: {
          created_at: string
          date: string
          description: string | null
          id: string
          is_national: boolean | null
          name: string
        }
        Insert: {
          created_at?: string
          date: string
          description?: string | null
          id?: string
          is_national?: boolean | null
          name: string
        }
        Update: {
          created_at?: string
          date?: string
          description?: string | null
          id?: string
          is_national?: boolean | null
          name?: string
        }
        Relationships: []
      }
      leaves: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          created_at: string
          end_date: string
          id: string
          is_emergency: boolean | null
          reason: string
          rejection_reason: string | null
          start_date: string
          status: Database["public"]["Enums"]["leave_status"] | null
          updated_at: string
          user_id: string
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          end_date: string
          id?: string
          is_emergency?: boolean | null
          reason: string
          rejection_reason?: string | null
          start_date: string
          status?: Database["public"]["Enums"]["leave_status"] | null
          updated_at?: string
          user_id: string
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          end_date?: string
          id?: string
          is_emergency?: boolean | null
          reason?: string
          rejection_reason?: string | null
          start_date?: string
          status?: Database["public"]["Enums"]["leave_status"] | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      login_history: {
        Row: {
          id: string
          ip_address: string | null
          login_at: string
          user_agent: string | null
          user_id: string
        }
        Insert: {
          id?: string
          ip_address?: string | null
          login_at?: string
          user_agent?: string | null
          user_id: string
        }
        Update: {
          id?: string
          ip_address?: string | null
          login_at?: string
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      manager_institutions: {
        Row: {
          created_at: string
          id: string
          institution_name: string
          manager_user_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          institution_name: string
          manager_user_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          institution_name?: string
          manager_user_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          is_read: boolean | null
          message: string
          related_id: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean | null
          message: string
          related_id?: string | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean | null
          message?: string
          related_id?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      performance_reviews: {
        Row: {
          areas_of_improvement: string | null
          comments: string | null
          created_at: string
          employee_user_id: string
          goals: string | null
          id: string
          rating: number | null
          review_period: string
          reviewer_user_id: string | null
          strengths: string | null
          updated_at: string
        }
        Insert: {
          areas_of_improvement?: string | null
          comments?: string | null
          created_at?: string
          employee_user_id: string
          goals?: string | null
          id?: string
          rating?: number | null
          review_period: string
          reviewer_user_id?: string | null
          strengths?: string | null
          updated_at?: string
        }
        Update: {
          areas_of_improvement?: string | null
          comments?: string | null
          created_at?: string
          employee_user_id?: string
          goals?: string | null
          id?: string
          rating?: number | null
          review_period?: string
          reviewer_user_id?: string | null
          strengths?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      salaries: {
        Row: {
          absent_days: number | null
          base_salary: number
          created_at: string
          final_salary: number | null
          id: string
          is_locked: boolean | null
          locked_at: string | null
          locked_by: string | null
          month: number
          paid_leave_days: number | null
          per_day_salary: number | null
          present_days: number | null
          processed_at: string | null
          updated_at: string
          user_id: string
          working_days: number
          year: number
        }
        Insert: {
          absent_days?: number | null
          base_salary: number
          created_at?: string
          final_salary?: number | null
          id?: string
          is_locked?: boolean | null
          locked_at?: string | null
          locked_by?: string | null
          month: number
          paid_leave_days?: number | null
          per_day_salary?: number | null
          present_days?: number | null
          processed_at?: string | null
          updated_at?: string
          user_id: string
          working_days: number
          year: number
        }
        Update: {
          absent_days?: number | null
          base_salary?: number
          created_at?: string
          final_salary?: number | null
          id?: string
          is_locked?: boolean | null
          locked_at?: string | null
          locked_by?: string | null
          month?: number
          paid_leave_days?: number | null
          per_day_salary?: number | null
          present_days?: number | null
          processed_at?: string | null
          updated_at?: string
          user_id?: string
          working_days?: number
          year?: number
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
          role?: Database["public"]["Enums"]["app_role"]
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
      get_user_institution: { Args: { _user_id: string }; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_manager_of_institution: {
        Args: { _institution: string; _user_id: string }
        Returns: boolean
      }
      is_manager_of_user: {
        Args: { _employee_id: string; _manager_id: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "manager" | "employee"
      attendance_status: "pending" | "approved" | "rejected"
      leave_status: "pending" | "approved" | "rejected"
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
      app_role: ["admin", "manager", "employee"],
      attendance_status: ["pending", "approved", "rejected"],
      leave_status: ["pending", "approved", "rejected"],
    },
  },
} as const
