export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          username: string
          email: string
          user_type: 'admin' | 'teacher' | 'student'
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
          user_type?: 'admin' | 'teacher' | 'student'
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
          user_type?: 'admin' | 'teacher' | 'student'
          is_active?: boolean
          is_verified?: boolean
          avatar_url?: string | null
          bio?: string | null
          last_login?: string | null
          created_at?: string
          updated_at?: string
        }
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
          rating: number | null
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
          rating?: number | null
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
          rating?: number | null
          total_students?: number
          created_at?: string
          updated_at?: string
        }
      }
      training_sessions: {
        Row: {
          id: string
          user_id: string | null
          training_type: 'vocabulary' | 'listening' | 'reading' | 'writing' | 'translation' | 'grammar' | 'comprehensive'
          difficulty_level: number
          session_name: string | null
          status: 'in_progress' | 'completed' | 'abandoned'
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
          training_type: 'vocabulary' | 'listening' | 'reading' | 'writing' | 'translation' | 'grammar' | 'comprehensive'
          difficulty_level: number
          session_name?: string | null
          status?: 'in_progress' | 'completed' | 'abandoned'
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
          training_type?: 'vocabulary' | 'listening' | 'reading' | 'writing' | 'translation' | 'grammar' | 'comprehensive'
          difficulty_level?: number
          session_name?: string | null
          status?: 'in_progress' | 'completed' | 'abandoned'
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
      }
      questions: {
        Row: {
          id: string
          training_type: string
          question_type: 'multiple_choice' | 'fill_blank' | 'true_false' | 'short_answer' | 'essay' | 'listening_comprehension' | 'reading_comprehension' | 'translation_en_to_cn' | 'translation_cn_to_en'
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
        }
        Insert: {
          id?: string
          training_type: string
          question_type: 'multiple_choice' | 'fill_blank' | 'true_false' | 'short_answer' | 'essay' | 'listening_comprehension' | 'reading_comprehension' | 'translation_en_to_cn' | 'translation_cn_to_en'
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
        }
        Update: {
          id?: string
          training_type?: string
          question_type?: 'multiple_choice' | 'fill_blank' | 'true_false' | 'short_answer' | 'essay' | 'listening_comprehension' | 'reading_comprehension' | 'translation_en_to_cn' | 'translation_cn_to_en'
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
        }
      }
      vocabulary: {
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
          created_at?: string
          updated_at?: string
        }
      }
      user_vocabulary_progress: {
        Row: {
          id: string
          user_id: string
          vocabulary_id: string
          mastery_level: number
          correct_count: number
          wrong_count: number
          last_reviewed_at: string | null
          next_review_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          vocabulary_id: string
          mastery_level?: number
          correct_count?: number
          wrong_count?: number
          last_reviewed_at?: string | null
          next_review_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          vocabulary_id?: string
          mastery_level?: number
          correct_count?: number
          wrong_count?: number
          last_reviewed_at?: string | null
          next_review_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      error_questions: {
        Row: {
          id: string
          user_id: string
          question_id: string
          training_session_id: string | null
          user_answer: string
          correct_answer: string
          error_count: number
          last_reviewed_at: string | null
          next_review_at: string | null
          mastered_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          question_id: string
          training_session_id?: string | null
          user_answer: string
          correct_answer: string
          error_count?: number
          last_reviewed_at?: string | null
          next_review_at?: string | null
          mastered_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          question_id?: string
          training_session_id?: string | null
          user_answer?: string
          correct_answer?: string
          error_count?: number
          last_reviewed_at?: string | null
          next_review_at?: string | null
          mastered_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}
