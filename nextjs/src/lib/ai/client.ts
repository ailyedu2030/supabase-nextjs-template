import type {
  WritingGradingRequest,
  WritingGradingResponse,
  LessonPlanRequest,
  LessonPlanResponse,
} from './types';

const AI_API_BASE_URL = process.env.NEXT_PUBLIC_AI_API_URL || 'http://localhost:8000';

export class AIClient {
  private baseUrl: string;
  private timeout: number;

  constructor(baseUrl?: string, timeout?: number) {
    this.baseUrl = baseUrl || AI_API_BASE_URL;
    this.timeout = timeout || 60000;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `AI API error: ${response.status}`);
      }

      return response.json();
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('AI API request timed out');
      }
      throw error;
    }
  }

  async gradeWriting(request: WritingGradingRequest): Promise<WritingGradingResponse> {
    return this.request<WritingGradingResponse>('/api/v1/ai/grading', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async generateLessonPlan(request: LessonPlanRequest): Promise<LessonPlanResponse> {
    return this.request<LessonPlanResponse>('/api/v1/ai/lesson-plan', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }
}

let aiClientInstance: AIClient | null = null;

export function getAIClient(): AIClient {
  if (!aiClientInstance) {
    aiClientInstance = new AIClient();
  }
  return aiClientInstance;
}

export function setAIClient(client: AIClient): void {
  aiClientInstance = client;
}
