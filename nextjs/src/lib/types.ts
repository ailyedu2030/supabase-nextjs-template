export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          operationName?: string
          query?: string
          variables?: Json
          extensions?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  storage: {
    Tables: {
      buckets: {
        Row: {
          id: string
          name: string
          owner: string | null
          created_at: string | null
          updated_at: string | null
          public: boolean | null
          avif_autodetection: boolean | null
          file_size_limit: number | null
          allowed_mime_types: string[] | null
        }
        Insert: {
          id: string
          name: string
          owner?: string | null
          created_at?: string | null
          updated_at?: string | null
          public?: boolean | null
          avif_autodetection?: boolean | null
          file_size_limit?: number | null
          allowed_mime_types?: string[] | null
        }
        Update: {
          id?: string
          name?: string
          owner?: string | null
          created_at?: string | null
          updated_at?: string | null
          public?: boolean | null
          avif_autodetection?: boolean | null
          file_size_limit?: number | null
          allowed_mime_types?: string[] | null
        }
        Relationships: []
      }
      migrations: {
        Row: {
          id: number
          name: string
          hash: string
          executed_at: string | null
        }
        Insert: {
          id?: number
          name: string
          hash: string
          executed_at?: string | null
        }
        Update: {
          id?: number
          name?: string
          hash?: string
          executed_at?: string | null
        }
        Relationships: []
      }
      objects: {
        Row: {
          id: string
          bucket_id: string | null
          name: string | null
          owner: string | null
          created_at: string | null
          updated_at: string | null
          last_accessed_at: string | null
          metadata: Json | null
          path_tokens: string[] | null
          version: string | null
        }
        Insert: {
          id?: string
          bucket_id?: string | null
          name?: string | null
          owner?: string | null
          created_at?: string | null
          updated_at?: string | null
          last_accessed_at?: string | null
          metadata?: Json | null
          path_tokens?: string[] | null
          version?: string | null
        }
        Update: {
          id?: string
          bucket_id?: string | null
          name?: string | null
          owner?: string | null
          created_at?: string | null
          updated_at?: string | null
          last_accessed_at?: string | null
          metadata?: Json | null
          path_tokens?: string[] | null
          version?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "objects_bucketId_fkey"
            columns: ["bucket_id"]
            isOneToOne: false
            referencedRelation: "buckets"
            referencedColumns: ["id"]
          }
        ]
      }
      s3_multipart_uploads: {
        Row: {
          id: string
          in_progress_size: number
          upload_id: string
          key: string
          bucket_id: string
          owner_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          in_progress_size?: number
          upload_id: string
          key: string
          bucket_id: string
          owner_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          in_progress_size?: number
          upload_id?: string
          key?: string
          bucket_id?: string
          owner_id?: string | null
          created_at?: string
        }
        Relationships: []
      }
      s3_multipart_uploads_parts: {
        Row: {
          id: string
          upload_id: string
          key: string
          bucket_id: string
          etag: string
          owner_id: string | null
          part_number: number
          size: number
          created_at: string
        }
        Insert: {
          id?: string
          upload_id: string
          key: string
          bucket_id: string
          etag: string
          owner_id?: string | null
          part_number: number
          size?: number
          created_at?: string
        }
        Update: {
          id?: string
          upload_id?: string
          key?: string
          bucket_id?: string
          etag?: string
          owner_id?: string | null
          part_number?: number
          size?: number
          created_at?: string
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
  public: {
    Tables: {
      todo_list: {
        Row: {
          created_at: string
          description: string | null
          done: boolean
          done_at: string | null
          id: number
          owner: string
          title: string
          urgent: boolean
        }
        Insert: {
          created_at?: string
          description?: string | null
          done?: boolean
          done_at?: string | null
          id?: number
          owner: string
          title: string
          urgent?: boolean
        }
        Update: {
          created_at?: string
          description?: string | null
          done?: boolean
          done_at?: string | null
          id?: number
          owner?: string
          title?: string
          urgent?: boolean
        }
        Relationships: []
      }
      profiles: {
        Row: {
          id: string
          username: string
          email: string
          user_type: string
          is_active: boolean
          is_verified: boolean
          avatar_url: string | null
          bio: string | null
          last_login: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          username: string
          email: string
          user_type?: string
          is_active?: boolean
          is_verified?: boolean
          avatar_url?: string | null
          bio?: string | null
          last_login?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          username?: string
          email?: string
          user_type?: string
          is_active?: boolean
          is_verified?: boolean
          avatar_url?: string | null
          bio?: string | null
          last_login?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      student_profiles: {
        Row: {
          id: string
          student_number: string | null
          grade_level: number | null
          major: string | null
          enrollment_date: string | null
          target_exam_date: string | null
          english_level: string
          daily_study_time: number
          total_study_days: number
          total_training_count: number
          current_streak: number
          longest_streak: number
          preferences: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          student_number?: string | null
          grade_level?: number | null
          major?: string | null
          enrollment_date?: string | null
          target_exam_date?: string | null
          english_level?: string
          daily_study_time?: number
          total_study_days?: number
          total_training_count?: number
          current_streak?: number
          longest_streak?: number
          preferences?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          student_number?: string | null
          grade_level?: number | null
          major?: string | null
          enrollment_date?: string | null
          target_exam_date?: string | null
          english_level?: string
          daily_study_time?: number
          total_study_days?: number
          total_training_count?: number
          current_streak?: number
          longest_streak?: number
          preferences?: Json
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      teacher_profiles: {
        Row: {
          id: string
          employee_number: string | null
          department: string | null
          title: string | null
          specialization: string | null
          teaching_years: number
          qualifications: Json
          teaching_courses: Json
          availability: Json
          rating: number
          total_students: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          employee_number?: string | null
          department?: string | null
          title?: string | null
          specialization?: string | null
          teaching_years?: number
          qualifications?: Json
          teaching_courses?: Json
          availability?: Json
          rating?: number
          total_students?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          employee_number?: string | null
          department?: string | null
          title?: string | null
          specialization?: string | null
          teaching_years?: number
          qualifications?: Json
          teaching_courses?: Json
          availability?: Json
          rating?: number
          total_students?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      training_sessions: {
        Row: {
          id: string
          user_id: string | null
          training_type: string
          difficulty_level: number
          session_name: string | null
          status: string
          started_at: string
          completed_at: string | null
          total_questions: number
          correct_count: number
          score: number | null
          time_spent: number
          ai_recommendations: Json | null
          metadata: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          training_type: string
          difficulty_level: number
          session_name?: string | null
          status?: string
          started_at?: string
          completed_at?: string | null
          total_questions?: number
          correct_count?: number
          score?: number | null
          time_spent?: number
          ai_recommendations?: Json | null
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          training_type?: string
          difficulty_level?: number
          session_name?: string | null
          status?: string
          started_at?: string
          completed_at?: string | null
          total_questions?: number
          correct_count?: number
          score?: number | null
          time_spent?: number
          ai_recommendations?: Json | null
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      questions: {
        Row: {
          id: string
          training_type: string
          question_type: string
          title: string
          content: string
          difficulty_level: number
          max_score: number | null
          time_limit: number | null
          knowledge_points: Json
          tags: Json
          correct_answer: string
          answer_analysis: string | null
          grading_criteria: Json | null
          audio_url: string | null
          image_urls: Json
          source: string | null
          usage_count: number
          success_rate: number | null
          is_active: boolean
          created_at: string
          updated_at: string
          vocabulary_id: string | null
        }
        Insert: {
          id?: string
          training_type: string
          question_type: string
          title: string
          content: string
          difficulty_level: number
          max_score?: number | null
          time_limit?: number | null
          knowledge_points?: Json
          tags?: Json
          correct_answer: string
          answer_analysis?: string | null
          grading_criteria?: Json | null
          audio_url?: string | null
          image_urls?: Json
          source?: string | null
          usage_count?: number
          success_rate?: number | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
          vocabulary_id?: string | null
        }
        Update: {
          id?: string
          training_type?: string
          question_type?: string
          title?: string
          content?: string
          difficulty_level?: number
          max_score?: number | null
          time_limit?: number | null
          knowledge_points?: Json
          tags?: Json
          correct_answer?: string
          answer_analysis?: string | null
          grading_criteria?: Json | null
          audio_url?: string | null
          image_urls?: Json
          source?: string | null
          usage_count?: number
          success_rate?: number | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
          vocabulary_id?: string | null
        }
        Relationships: []
      }
      training_records: {
        Row: {
          id: string
          session_id: string | null
          question_id: string | null
          user_id: string | null
          user_answer: string | null
          ai_evaluation: Json | null
          score: number | null
          is_correct: boolean | null
          time_spent: number | null
          difficulty_level: number | null
          knowledge_points: Json
          error_type: string | null
          error_analysis: string | null
          created_at: string
        }
        Insert: {
          id?: string
          session_id?: string | null
          question_id?: string | null
          user_id?: string | null
          user_answer?: string | null
          ai_evaluation?: Json | null
          score?: number | null
          is_correct?: boolean | null
          time_spent?: number | null
          difficulty_level?: number | null
          knowledge_points?: Json
          error_type?: string | null
          error_analysis?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          session_id?: string | null
          question_id?: string | null
          user_id?: string | null
          user_answer?: string | null
          ai_evaluation?: Json | null
          score?: number | null
          is_correct?: boolean | null
          time_spent?: number | null
          difficulty_level?: number | null
          knowledge_points?: Json
          error_type?: string | null
          error_analysis?: string | null
          created_at?: string
        }
        Relationships: []
      }
      error_questions: {
        Row: {
          id: string
          user_id: string | null
          question_id: string | null
          training_session_id: string | null
          user_answer: string
          correct_answer: string
          error_count: number
          last_reviewed_at: string | null
          next_review_at: string | null
          mastered_at: string | null
          consecutive_correct_count: number | null
          review_interval_index: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          question_id?: string | null
          training_session_id?: string | null
          user_answer: string
          correct_answer: string
          error_count?: number
          last_reviewed_at?: string | null
          next_review_at?: string | null
          mastered_at?: string | null
          consecutive_correct_count?: number | null
          review_interval_index?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          question_id?: string | null
          training_session_id?: string | null
          user_answer?: string
          correct_answer?: string
          error_count?: number
          last_reviewed_at?: string | null
          next_review_at?: string | null
          mastered_at?: string | null
          consecutive_correct_count?: number | null
          review_interval_index?: number | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      learning_plans: {
        Row: {
          id: string
          user_id: string | null
          title: string
          description: string | null
          target_date: string | null
          status: string
          daily_goals: Json
          progress: number
          completed_items: Json
          ai_suggestions: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          title: string
          description?: string | null
          target_date?: string | null
          status?: string
          daily_goals?: Json
          progress?: number
          completed_items?: Json
          ai_suggestions?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          title?: string
          description?: string | null
          target_date?: string | null
          status?: string
          daily_goals?: Json
          progress?: number
          completed_items?: Json
          ai_suggestions?: Json | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_achievements: {
        Row: {
          id: string
          user_id: string | null
          achievement_id: string | null
          achievement_type: string
          name: string
          description: string | null
          icon: string | null
          unlocked_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          achievement_id?: string | null
          achievement_type: string
          name: string
          description?: string | null
          icon?: string | null
          unlocked_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          achievement_id?: string | null
          achievement_type?: string
          name?: string
          description?: string | null
          icon?: string | null
          unlocked_at?: string
        }
        Relationships: []
      }
      courses: {
        Row: {
          id: string
          teacher_id: string | null
          title: string
          description: string | null
          category: string | null
          difficulty_level: number | null
          status: string
          enrollment_count: number
          thumbnail_url: string | null
          metadata: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          teacher_id?: string | null
          title: string
          description?: string | null
          category?: string | null
          difficulty_level?: number | null
          status?: string
          enrollment_count?: number
          thumbnail_url?: string | null
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          teacher_id?: string | null
          title?: string
          description?: string | null
          category?: string | null
          difficulty_level?: number | null
          status?: string
          enrollment_count?: number
          thumbnail_url?: string | null
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      classes: {
        Row: {
          id: string
          teacher_id: string | null
          course_id: string | null
          name: string
          description: string | null
          semester: string | null
          status: string
          max_students: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          teacher_id?: string | null
          course_id?: string | null
          name: string
          description?: string | null
          semester?: string | null
          status?: string
          max_students?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          teacher_id?: string | null
          course_id?: string | null
          name?: string
          description?: string | null
          semester?: string | null
          status?: string
          max_students?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      class_students: {
        Row: {
          id: string
          class_id: string | null
          student_id: string | null
          enrolled_at: string
          status: string
        }
        Insert: {
          id?: string
          class_id?: string | null
          student_id?: string | null
          enrolled_at?: string
          status?: string
        }
        Update: {
          id?: string
          class_id?: string | null
          student_id?: string | null
          enrolled_at?: string
          status?: string
        }
        Relationships: []
      }
      assignments: {
        Row: {
          id: string
          course_id: string | null
          class_id: string | null
          teacher_id: string | null
          title: string
          description: string | null
          due_date: string | null
          total_points: number | null
          status: string
          metadata: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          course_id?: string | null
          class_id?: string | null
          teacher_id?: string | null
          title: string
          description?: string | null
          due_date?: string | null
          total_points?: number | null
          status?: string
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          course_id?: string | null
          class_id?: string | null
          teacher_id?: string | null
          title?: string
          description?: string | null
          due_date?: string | null
          total_points?: number | null
          status?: string
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      grading_results: {
        Row: {
          id: string
          user_id: string | null
          question_id: string | null
          submission_text: string
          overall_score: number | null
          detailed_scores: Json | null
          feedback: string | null
          ai_model: string | null
          status: string
          error_message: string | null
          created_at: string
          completed_at: string | null
        }
        Insert: {
          id?: string
          user_id?: string | null
          question_id?: string | null
          submission_text: string
          overall_score?: number | null
          detailed_scores?: Json | null
          feedback?: string | null
          ai_model?: string | null
          status?: string
          error_message?: string | null
          created_at?: string
          completed_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string | null
          question_id?: string | null
          submission_text?: string
          overall_score?: number | null
          detailed_scores?: Json | null
          feedback?: string | null
          ai_model?: string | null
          status?: string
          error_message?: string | null
          created_at?: string
          completed_at?: string | null
        }
        Relationships: []
      }
      lesson_plans: {
        Row: {
          id: string
          teacher_id: string | null
          course_id: string | null
          title: string
          content: Json
          duration_minutes: number | null
          objectives: Json
          materials: Json
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          teacher_id?: string | null
          course_id?: string | null
          title: string
          content: Json
          duration_minutes?: number | null
          objectives?: Json
          materials?: Json
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          teacher_id?: string | null
          course_id?: string | null
          title?: string
          content?: Json
          duration_minutes?: number | null
          objectives?: Json
          materials?: Json
          status?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          id: string
          user_id: string | null
          type: string
          title: string
          content: string | null
          link: string | null
          is_read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          type: string
          title: string
          content?: string | null
          link?: string | null
          is_read?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          type?: string
          title?: string
          content?: string | null
          link?: string | null
          is_read?: boolean
          created_at?: string
        }
        Relationships: []
      }
      resources: {
        Row: {
          id: string
          created_by: string | null
          title: string
          description: string | null
          resource_type: string
          file_url: string
          file_size: number | null
          mime_type: string | null
          metadata: Json
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          created_by?: string | null
          title: string
          description?: string | null
          resource_type: string
          file_url: string
          file_size?: number | null
          mime_type?: string | null
          metadata?: Json
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          created_by?: string | null
          title?: string
          description?: string | null
          resource_type?: string
          file_url?: string
          file_size?: number | null
          mime_type?: string | null
          metadata?: Json
          status?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      vocabulary_words: {
        Row: {
          id: string
          word: string
          phonetic_uk: string | null
          phonetic_us: string | null
          definition: string
          translation: string | null
          difficulty_level: number | null
          part_of_speech: string | null
          examples: Json
          synonyms: Json
          antonyms: Json
          audio_url: string | null
          image_url: string | null
          frequency: number
          phonetic: string | null
          collocations: string[] | null
          difficulty: number | null
          frequency_rank: number | null
          cefr_level: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          word: string
          phonetic_uk?: string | null
          phonetic_us?: string | null
          definition: string
          translation?: string | null
          difficulty_level?: number | null
          part_of_speech?: string | null
          examples?: Json
          synonyms?: Json
          antonyms?: Json
          audio_url?: string | null
          image_url?: string | null
          frequency?: number
          phonetic?: string | null
          collocations?: string[] | null
          difficulty?: number | null
          frequency_rank?: number | null
          cefr_level?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          word?: string
          phonetic_uk?: string | null
          phonetic_us?: string | null
          definition?: string
          translation?: string | null
          difficulty_level?: number | null
          part_of_speech?: string | null
          examples?: Json
          synonyms?: Json
          antonyms?: Json
          audio_url?: string | null
          image_url?: string | null
          frequency?: number
          phonetic?: string | null
          collocations?: string[] | null
          difficulty?: number | null
          frequency_rank?: number | null
          cefr_level?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_vocabulary_progress: {
        Row: {
          id: string
          user_id: string
          word_id: string
          vocabulary_id: string | null
          state: string | null
          difficulty: number | null
          stability: number | null
          retrievability: number | null
          next_due: string | null
          last_review: string | null
          review_count: number | null
          lapse_count: number | null
          correct_count: number | null
          wrong_count: number | null
          avg_response_time: number | null
          mastery_level: number | null
          state_num: number | null
          difficulty_num: number | null
          stability_num: number | null
          retrievability_num: number | null
          scheduled_days: number | null
          total_reviews: number | null
          average_response_time_sec: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          word_id: string
          vocabulary_id?: string | null
          state?: string | null
          difficulty?: number | null
          stability?: number | null
          retrievability?: number | null
          next_due?: string | null
          last_review?: string | null
          review_count?: number | null
          lapse_count?: number | null
          correct_count?: number | null
          wrong_count?: number | null
          avg_response_time?: number | null
          mastery_level?: number | null
          state_num?: number | null
          difficulty_num?: number | null
          stability_num?: number | null
          retrievability_num?: number | null
          scheduled_days?: number | null
          total_reviews?: number | null
          average_response_time_sec?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          word_id?: string
          vocabulary_id?: string | null
          state?: string | null
          difficulty?: number | null
          stability?: number | null
          retrievability?: number | null
          next_due?: string | null
          last_review?: string | null
          review_count?: number | null
          lapse_count?: number | null
          correct_count?: number | null
          wrong_count?: number | null
          avg_response_time?: number | null
          mastery_level?: number | null
          state_num?: number | null
          difficulty_num?: number | null
          stability_num?: number | null
          retrievability_num?: number | null
          scheduled_days?: number | null
          total_reviews?: number | null
          average_response_time_sec?: number | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      learning_analytics: {
        Row: {
          id: string
          user_id: string | null
          analytics_type: string
          analytics_date: string
          metrics: Json
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          analytics_type: string
          analytics_date: string
          metrics: Json
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          analytics_type?: string
          analytics_date?: string
          metrics?: Json
          created_at?: string
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          id: string
          user_id: string | null
          action: string
          resource: string
          resource_id: string | null
          details: Json
          ip_address: string | null
          user_agent: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          action: string
          resource: string
          resource_id?: string | null
          details?: Json
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          action?: string
          resource?: string
          resource_id?: string | null
          details?: Json
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
        }
        Relationships: []
      }
      registration_applications: {
        Row: {
          id: string
          user_id: string | null
          user_type: string
          status: string
          real_name: string
          gender: string | null
          phone_number: string | null
          id_card_number: string | null
          school_name: string | null
          school_department: string | null
          major: string | null
          grade_level: number | null
          class_name: string | null
          emergency_contact_name: string | null
          emergency_contact_phone: string | null
          professional_title: string | null
          qualification_cert_url: string | null
          honor_cert_urls: string[] | null
          self_introduction: string | null
          reviewed_by: string | null
          reviewed_at: string | null
          rejection_reason: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          user_type: string
          status?: string
          real_name: string
          gender?: string | null
          phone_number?: string | null
          id_card_number?: string | null
          school_name?: string | null
          school_department?: string | null
          major?: string | null
          grade_level?: number | null
          class_name?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          professional_title?: string | null
          qualification_cert_url?: string | null
          honor_cert_urls?: string[] | null
          self_introduction?: string | null
          reviewed_by?: string | null
          reviewed_at?: string | null
          rejection_reason?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          user_type?: string
          status?: string
          real_name?: string
          gender?: string | null
          phone_number?: string | null
          id_card_number?: string | null
          school_name?: string | null
          school_department?: string | null
          major?: string | null
          grade_level?: number | null
          class_name?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          professional_title?: string | null
          qualification_cert_url?: string | null
          honor_cert_urls?: string[] | null
          self_introduction?: string | null
          reviewed_by?: string | null
          reviewed_at?: string | null
          rejection_reason?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_gamification: {
        Row: {
          id: string
          user_id: string | null
          xp: number
          level: number
          current_streak: number
          longest_streak: number
          total_correct_answers: number
          total_questions_answered: number
          total_words_learned: number
          last_streak_date: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          xp?: number
          level?: number
          current_streak?: number
          longest_streak?: number
          total_correct_answers?: number
          total_questions_answered?: number
          total_words_learned?: number
          last_streak_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          xp?: number
          level?: number
          current_streak?: number
          longest_streak?: number
          total_correct_answers?: number
          total_questions_answered?: number
          total_words_learned?: number
          last_streak_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      daily_learning_sessions: {
        Row: {
          id: string
          user_id: string | null
          session_date: string
          words_reviewed: number
          words_learned: number
          correct_answers: number
          total_questions: number
          session_duration_minutes: number
          xp_earned: number
          is_complete: boolean
          completed_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          session_date?: string | null
          words_reviewed?: number | null
          words_learned?: number | null
          correct_answers?: number | null
          total_questions?: number | null
          session_duration_minutes?: number | null
          xp_earned?: number | null
          is_complete?: boolean | null
          completed_at?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string | null
          session_date?: string | null
          words_reviewed?: number | null
          words_learned?: number | null
          correct_answers?: number | null
          total_questions?: number | null
          session_duration_minutes?: number | null
          xp_earned?: number | null
          is_complete?: boolean | null
          completed_at?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      vocabulary_questions: {
        Row: {
          id: string
          word_id: string
          question_type: string
          question_text: string
          options: string[] | null
          correct_answer: string
          explanation: string | null
          word_usage: string | null
          difficulty_level: number | null
          generated_by: string | null
          quality_score: number | null
          is_verified: boolean | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          word_id: string
          question_type: string
          question_text: string
          options?: string[] | null
          correct_answer: string
          explanation?: string | null
          word_usage?: string | null
          difficulty_level?: number | null
          generated_by?: string | null
          quality_score?: number | null
          is_verified?: boolean | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          word_id?: string
          question_type?: string
          question_text?: string
          options?: string[] | null
          correct_answer?: string
          explanation?: string | null
          word_usage?: string | null
          difficulty_level?: number | null
          generated_by?: string | null
          quality_score?: number | null
          is_verified?: boolean | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      },
      user_question_history: {
        Row: {
          id: string
          user_id: string
          question_id: string
          is_correct: boolean
          user_answer: string | null
          response_time: number | null
          attempts_count: number | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          question_id: string
          is_correct: boolean
          user_answer?: string | null
          response_time?: number | null
          attempts_count?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          question_id?: string
          is_correct?: boolean
          user_answer?: string | null
          response_time?: number | null
          attempts_count?: number | null
          created_at?: string
        }
        Relationships: []
      },
      achievements: {
        Row: {
          id: string
          name: string
          description: string | null
          type: string
          threshold: number
          rarity: string
          xp_reward: number
          icon: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          type: string
          threshold: number
          rarity: string
          xp_reward: number
          icon?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          type?: string
          threshold?: number
          rarity?: string
          xp_reward?: number
          icon?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      },
      review_logs: {
        Row: {
          id: string
          user_id: string
          word_id: string
          vocabulary_id: string | null
          rating: number
          response_time: number | null
          review_datetime: string | null
          scheduled_interval: number | null
          actual_interval: number | null
          stability_before: number | null
          stability_after: number | null
          difficulty_before: number | null
          difficulty_after: number | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          word_id: string
          vocabulary_id?: string | null
          rating: number
          response_time?: number | null
          review_datetime?: string | null
          scheduled_interval?: number | null
          actual_interval?: number | null
          stability_before?: number | null
          stability_after?: number | null
          difficulty_before?: number | null
          difficulty_after?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          word_id?: string
          vocabulary_id?: string | null
          rating?: number
          response_time?: number | null
          review_datetime?: string | null
          scheduled_interval?: number | null
          actual_interval?: number | null
          stability_before?: number | null
          stability_after?: number | null
          difficulty_before?: number | null
          difficulty_after?: number | null
          created_at?: string
        }
        Relationships: []
      }
      placement_test_results: {
        Row: {
          id: string
          user_id: string | null
          cefr_level: string
          estimated_vocabulary_size: number
          cet4_readiness_score: number
          questions_answered: number
          correct_answers: number
          test_duration_seconds: number
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          cefr_level: string
          estimated_vocabulary_size: number
          cet4_readiness_score: number
          questions_answered: number
          correct_answers: number
          test_duration_seconds: number
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          cefr_level?: string
          estimated_vocabulary_size?: number
          cet4_readiness_score?: number
          questions_answered?: number
          correct_answers?: number
          test_duration_seconds?: number
          created_at?: string
        }
        Relationships: []
<<<<<<< HEAD
      },
=======
      }
      vocabulary_questions: {
        Row: {
          id: string
          word_id: string
          question_type: string
          question_text: string
          options: string[] | null
          correct_answer: string
          explanation: string | null
          word_usage: string | null
          difficulty_level: number | null
          generated_by: string | null
          quality_score: number | null
          is_verified: boolean | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          word_id: string
          question_type: string
          question_text: string
          options?: string[] | null
          correct_answer: string
          explanation?: string | null
          word_usage?: string | null
          difficulty_level?: number | null
          generated_by?: string | null
          quality_score?: number | null
          is_verified?: boolean | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          word_id?: string
          question_type?: string
          question_text?: string
          options?: string[] | null
          correct_answer?: string
          explanation?: string | null
          word_usage?: string | null
          difficulty_level?: number | null
          generated_by?: string | null
          quality_score?: number | null
          is_verified?: boolean | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_question_history: {
        Row: {
          id: string
          user_id: string
          question_id: string
          is_correct: boolean
          user_answer: string | null
          response_time: number | null
          attempts_count: number | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          question_id: string
          is_correct: boolean
          user_answer?: string | null
          response_time?: number | null
          attempts_count?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          question_id?: string
          is_correct?: boolean
          user_answer?: string | null
          response_time?: number | null
          attempts_count?: number | null
          created_at?: string
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
>>>>>>> 2926435 (Fixed TypeScript errors)
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
