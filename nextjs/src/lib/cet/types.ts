import type { Json } from '@/lib/types';

export type UserType = 'admin' | 'teacher' | 'student';

export type ApplicationStatus = 'pending' | 'approved' | 'rejected';

export interface Profile {
  id: string;
  username: string;
  email: string;
  user_type: UserType;
  is_active: boolean;
  is_verified: boolean;
  avatar_url: string | null;
  bio: string | null;
  last_login: string | null;
  created_at: string;
  updated_at: string;
}

export interface StudentProfile {
  id: string;
  student_number: string | null;
  grade_level: number | null;
  major: string | null;
  enrollment_date: string | null;
  target_exam_date: string | null;
  english_level: string;
  daily_study_time: number;
  total_study_days: number;
  total_training_count: number;
  current_streak: number;
  longest_streak: number;
  preferences: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface TeacherProfile {
  id: string;
  real_name?: string;
  gender?: string;
  employee_number: string | null;
  department: string | null;
  title: string | null;
  specialization: string | null;
  teaching_years: number;
  qualifications: string[];
  teaching_courses: string[];
  availability: Record<string, unknown>[];
  rating: number;
  total_students: number;
  created_at: string;
  updated_at: string;
}

export interface QuestionBank {
  id: string;
  name: string;
  description: string | null;
  category: string;
  difficulty: string;
  created_by: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export type QuestionType =
  | 'choice'
  | 'fill_blank'
  | 'listening'
  | 'reading'
  | 'writing'
  | 'speaking';

export interface Question {
  id: string;
  bank_id: string;
  question_type: QuestionType;
  content: string;
  options: string[] | null;
  correct_answer: string;
  explanation: string | null;
  difficulty: number;
  category: string;
  tags: string[];
  audio_url: string | null;
  image_url: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface TrainingSession {
  id: string;
  user_id: string;
  training_type:
    | 'vocabulary'
    | 'listening'
    | 'reading'
    | 'writing'
    | 'translation'
    | 'grammar'
    | 'comprehensive';
  difficulty_level: number;
  session_name: string | null;
  status: 'in_progress' | 'completed' | 'abandoned';
  started_at: string;
  completed_at: string | null;
  total_questions: number;
  correct_count: number;
  score: number | null;
  time_spent: number;
  ai_recommendations: Record<string, unknown> | null;
  metadata: any;
  created_at: string;
  updated_at: string;
}

export interface Course {
  id: string;
  teacher_id: string | null;
  title: string;
  description: string | null;
  category: string | null;
  difficulty_level: number | null;
  level?: string;
  status: string;
  enrollment_count: number;
  thumbnail_url: string | null;
  metadata: Json;
  created_at: string;
  updated_at: string;
}

export interface Class {
  id: string;
  teacher_id: string | null;
  course_id: string | null;
  name: string;
  description: string | null;
  semester: string | null;
  status: 'active' | 'completed' | 'archived';
  max_students: number;
  created_at: string;
  updated_at: string;
}

export interface RegistrationApplication {
  id: number;
  user_id: number;
  email: string;
  user_type: UserType;
  application_type: UserType;
  application_data: Record<string, unknown>;
  submitted_documents: Record<string, unknown>;
  status: ApplicationStatus;
  review_notes: string | null;
  reviewed_at: string | null;
  reviewer_id: number | null;
  created_at: string;
  updated_at: string;
  student_profile?: {
    real_name?: string;
    student_id?: string;
    school?: string;
    major?: string;
    grade?: string;
    class_name?: string;
    id_number?: string;
    phone?: string;
  };
  teacher_profile?: {
    real_name?: string;
    teacher_id?: string;
    school?: string;
    department?: string;
    title?: string;
    phone?: string;
    certificate_url?: string;
  };
}

export interface AdminCourseDetailResponse {
  course: Course & {
    teacher?: Profile & { teacher_profiles?: TeacherProfile };
    classes?: Array<{
      id: string;
      name: string;
      status: string;
      max_students: number;
      student_count: number;
    }>;
  };
  recentEnrollments?: Array<{
    id: string;
    student_id: string;
    student_name: string;
    enrolled_at: string;
    progress: number;
  }>;
}

export interface AdminCourseCreateRequest {
  title: string;
  description?: string;
  category: string;
  difficulty_level?: number;
  thumbnail_url?: string;
  metadata?: Json;
}

export interface AdminCourseUpdateRequest {
  title?: string;
  description?: string | null;
  category?: string | null;
  difficulty_level?: number | null;
  status?: 'draft' | 'published' | 'archived';
  thumbnail_url?: string | null;
  metadata?: Json;
}

export interface AdminUserUpdateRequest {
  username?: string;
  is_active?: boolean;
  is_verified?: boolean;
  user_type?: UserType;
  bio?: string | null;
  avatar_url?: string | null;
}

export interface AdminUserDetailResponse {
  user: Profile & {
    student_profiles?: StudentProfile & {
      real_name?: string;
      gender?: string;
      id_number?: string;
      phone?: string;
      emergency_contact_name?: string;
      emergency_contact_phone?: string;
      school?: string;
      department?: string;
      major?: string;
      grade_level?: number;
      class_name?: string;
    };
    teacher_profiles?: TeacherProfile & { real_name?: string; gender?: string };
  };
  recentSessions: Array<{
    id: string;
    training_type: string;
    status: string;
    score: number | null;
    created_at: string;
    completed_at: string | null;
  }>;
}

export enum ErrorQuestionStatus {
  TO_REVIEW = 'to_review',
  IN_PROGRESS = 'in_progress',
  MASTERED = 'mastered',
}

export enum ErrorQuestionTag {
  VOCABULARY = 'vocabulary',
  LISTENING = 'listening',
  READING = 'reading',
  WRITING = 'writing',
  TRANSLATION = 'translation',
}

export interface Notification {
  id: string;
  user_id: string | null;
  type?: string;
  notification_type?: string;
  title: string;
  content: string | null;
  link: string | null;
  is_read: boolean;
  created_at: string;
}

export interface GradingResult {
  id: string;
  user_id: string | null;
  question_id: string | null;
  submission_text: string;
  overall_score: number | null;
  detailed_scores: Json | null;
  feedback: string | null;
  ai_model: string | null;
  status: string;
  error_message: string | null;
  created_at: string;
  completed_at: string | null;
}

export interface ErrorQuestion {
  id: string;
  user_id: string | null;
  question_id: string | null;
  training_session_id: string | null;
  user_answer: string;
  correct_answer: string;
  error_count: number;
  last_reviewed_at: string | null;
  next_review_at: string | null;
  mastered_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ClassListResponse {
  classes: Class[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface AdminCourseListResponse {
  courses: Course[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface AdminCourseStatsResponse {
  total_courses: number;
  published_courses: number;
  draft_courses: number;
  archived_courses: number;
  total_enrollments: number;
  popular_categories: Array<{ category: string; count: number }>;
}

export interface TeacherCourseCreateRequest {
  title: string;
  description?: string | null;
  category: string | null;
  difficulty_level?: number | null;
  thumbnail_url?: string | null;
  metadata?: any;
}

export interface TeacherCourseUpdateRequest {
  title?: string;
  description?: string | null;
  category?: string | null;
  difficulty_level?: number | null;
  status?: 'draft' | 'published' | 'archived';
  thumbnail_url?: string | null;
  metadata?: any;
}

export interface TeacherCourseListResponse {
  courses: Course[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export type LessonPlanStatus = 'draft' | 'published' | 'archived';

export interface LessonPlan {
  id: string;
  teacher_id: string | null;
  course_id: string | null;
  title: string;
  description?: string;
  version?: string | number;
  is_public?: boolean;
  content: Record<string, unknown> | string;
  duration_minutes: number | null;
  objectives: string[] | Record<string, unknown>;
  teaching_objectives?: string[];
  teaching_procedures?: Array<{
    step: number;
    title: string;
    description: string;
    duration: number;
    content?: string;
  }>;
  teaching_methods?: string[];
  assessment_methods?: string[];
  materials: string[] | Record<string, unknown>;
  status: LessonPlanStatus;
  created_at: string;
  updated_at: string;
}

export type TeachingSyllabusStatus = 'draft' | 'published' | 'archived';

export interface TeachingSyllabus {
  id: string;
  teacher_id: string | null;
  course_id: string | null;
  title: string;
  description: string | null;
  version: string;
  academic_year: string;
  semester: string;
  course_objectives: string[];
  course_content: Array<{
    module: number;
    title: string;
    description: string;
    hours: number;
    key_points: string[];
    difficulties: string[];
  }>;
  teaching_methods: string[];
  assessment_methods: Array<{
    type: string;
    description: string;
    weight: number;
  }>;
  textbooks: string[];
  reference_materials: string[];
  teaching_progress: Array<{
    week: number;
    date: string;
    content: string;
    hours: number;
    notes: string | null;
  }>;
  status: TeachingSyllabusStatus;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

export interface TeacherTeachingAnalytics {
  teacher_id: string;
  period: {
    start_date: string;
    end_date: string;
  };
  overall_stats: {
    total_courses: number;
    total_classes: number;
    total_students: number;
    total_lessons: number;
    total_study_hours: number;
  };
  course_breakdown: Array<{
    course_id: string;
    course_name: string;
    student_count: number;
    average_score: number;
    completion_rate: number;
  }>;
  student_performance: Array<{
    student_id: string;
    student_name: string;
    total_sessions: number;
    average_score: number;
    improvement_trend: 'up' | 'down' | 'stable';
    weak_points: string[];
  }>;
  common_weak_points: Array<{
    knowledge_point: string;
    student_count: number;
    average_mastery: number;
  }>;
  teaching_quality_score: number;
  recommendations: string[];
  generated_at: string;
}

export interface SystemMonitoringStats {
  overall_stats: {
    total_users: number;
    active_users_today: number;
    active_users_7days: number;
    total_courses: number;
    total_classes: number;
    total_training_sessions: number;
  };
  user_growth: Array<{
    date: string;
    new_users: number;
    active_users: number;
  }>;
  course_stats: Array<{
    course_id: string;
    course_name: string;
    enrollment_count: number;
    completion_rate: number;
    average_score: number;
  }>;
  system_performance: {
    avg_response_time_ms: number;
    uptime_percent: number;
    error_rate: number;
    active_connections: number;
  };
  recent_activities: Array<{
    id: string;
    type: string;
    user_id: string;
    user_name: string;
    description: string;
    created_at: string;
  }>;
  generated_at: string;
}

export interface StudentRegistrationRequest {
  username?: string;
  email: string;
  password: string;
  real_name?: string;
  age?: number;
  gender?: string;
  student_id?: string;
  school?: string;
  major?: string;
  grade?: string;
  class_name?: string;
  id_number?: string;
  phone?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  department?: string;
}

export interface TeacherRegistrationRequest {
  username?: string;
  email: string;
  password: string;
  real_name?: string;
  age?: number;
  gender?: string;
  teacher_id?: string;
  school?: string;
  department?: string;
  title?: string;
  subject?: string;
  introduction?: string;
  phone?: string;
  certificate_url?: string;
}

export interface RegistrationSuccessResponse {
  success: boolean;
  message: string;
  user_id: string;
  estimated_review_time?: string;
}

export interface Session {
  id: string;
  user_id: string | null;
  training_type: string;
  difficulty_level: number;
  session_name: string | null;
  status: string;
  started_at: string;
  completed_at: string | null;
  total_questions: number;
  correct_count: number;
  score: number | null;
  time_spent: number;
  ai_recommendations: Record<string, unknown> | null;
  metadata: any;
  created_at: string;
  updated_at: string;
}
