export interface WritingGradingRequest {
  content: string;
  type: 'writing';
  question_id: string;
  user_id: string;
  writing_type?: 'argumentative' | 'expository' | 'practical' | 'chart' | 'phenomenon';
}

export interface WritingGradingResponse {
  id: string;
  overall_score: number;
  detailed_scores: {
    grammar: number;
    vocabulary: number;
    structure: number;
    content: number;
    fluency: number;
  };
  strengths: string[];
  improvements: string[];
  feedback: string;
  ai_model: string;
  grading_time_ms: number;
  created_at: string;
}

export interface WritingGradingListResponse {
  gradings: WritingGradingResponse[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface LessonPlanRequest {
  topic: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  duration: number;
  objectives: string[];
}

export interface LessonPlanStage {
  name: string;
  duration: number;
  activities: string[];
}

export interface LessonPlanResponse {
  id: string;
  title: string;
  duration: number;
  stages: LessonPlanStage[];
  materials: string[];
  homework: string;
}

export interface LearningRecommendationRequest {
  user_id: string;
  recommendation_type:
    | 'vocabulary'
    | 'listening'
    | 'reading'
    | 'writing'
    | 'translation'
    | 'comprehensive';
}

export interface LearningRecommendation {
  id: string;
  user_id: string;
  type: string;
  title: string;
  description: string;
  content: Record<string, unknown>;
  priority: number;
  reason: string;
  created_at: string;
}

export interface LearningRecommendationResponse {
  recommendations: LearningRecommendation[];
  generated_at: string;
}

export interface LearningAnalyticsRequest {
  user_id: string;
  start_date?: string;
  end_date?: string;
}

export interface LearningAnalytics {
  user_id: string;
  period: {
    start_date: string;
    end_date: string;
  };
  overall_stats: {
    total_training_sessions: number;
    total_questions_answered: number;
    correct_rate: number;
    average_score: number;
    total_study_time: number;
  };
  skill_breakdown: {
    vocabulary: { score: number; trend: 'up' | 'down' | 'stable' };
    listening: { score: number; trend: 'up' | 'down' | 'stable' };
    reading: { score: number; trend: 'up' | 'down' | 'stable' };
    writing: { score: number; trend: 'up' | 'down' | 'stable' };
    translation: { score: number; trend: 'up' | 'down' | 'stable' };
  };
  knowledge_gaps: Array<{
    knowledge_point: string;
    mastery_level: number;
    recommendation: string;
  }>;
  recent_activity: Array<{
    date: string;
    training_type: string;
    score: number;
    duration: number;
  }>;
  generated_at: string;
}

export interface AIError {
  error: string;
  message: string;
}
