import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Rating } from '@/lib/fsrs';

// Types - using any to avoid database type generation issues
export interface DatabaseWord {
  id: string;
  word: string;
  definition: string;
  phonetic_uk?: string | null;
  phonetic_us?: string | null;
  translation?: string | null;
  difficulty_level?: number | null;
  part_of_speech?: string | null;
  examples?: any;
  synonyms?: any;
  antonyms?: any;
  audio_url?: string | null;
  image_url?: string | null;
  frequency?: number;
  created_at?: string;
  updated_at?: string;
}

export interface Vocabulary {
  id: string;
  word: string;
  definition: string;
  phonetic?: string;
  phonetic_uk?: string | null;
  phonetic_us?: string | null;
  translation?: string | null;
  example_sentence?: string;
  collocations?: string[];
  difficulty?: number;
  cefr_level?: string;
}

export interface Question {
  id: string;
  question_type: 'cloze' | 'multiple_choice' | 'synonym' | 'antonym' | 'sentence_completion';
  question_text: string;
  options?: string[];
  correct_answer: string;
  explanation?: string;
  word_usage?: string;
  difficulty_level?: number;
  vocabulary?: Vocabulary;
}

export interface UserStats {
  totalWords: number;
  masteredWords: number;
  reviewWords: number;
  newWords: number;
  masteryScore: number;
  currentStreak: number;
  longestStreak: number;
  totalXP: number;
  level: number;
}

export interface TrainingSession {
  id: string;
  type: 'placement' | 'training' | 'review';
  started_at: Date;
  total_questions: number;
}

// UserGamification type for gamification system
export interface UserGamification {
  id?: string;
  user_id?: string;
  xp?: number;
  level?: number;
  current_streak?: number;
  longest_streak?: number;
  total_correct_answers?: number;
  total_questions_answered?: number;
  total_words_learned?: number;
  last_streak_date?: string;
  created_at?: string;
  updated_at?: string;
}

// VocabStats type for vocabulary trainer
export interface VocabStats {
  totalWords: number;
  learnedWords: number;
  reviewWords: number;
  newWords: number;
  masteryScore: number;
  detailedProgress?: any[];
}

interface VocabularyStore {
  currentSession: TrainingSession | null;
  currentQuestionIndex: number;
  questions: Question[];
  currentWords: DatabaseWord[];
  selectedAnswer: string | null;
  showResult: boolean;
  showFSRSRating: boolean;
  isLoading: boolean;
  currentDifficulty: number;
  consecutiveCorrect: number;
  consecutiveWrong: number;
  stats: UserStats;
  initialize: () => Promise<void>;
  startSession: (type: 'placement' | 'training' | 'review') => Promise<void>;
  submitAnswer: (answer: string, responseTime: number) => Promise<void>;
  submitFSRSRating: (rating: Rating) => Promise<void>;
  nextQuestion: () => void;
  loadUserProgress: () => Promise<void>;
  resetSession: () => void;
}

const LEVEL_XP_REQUIREMENTS = (level: number): number => {
  return 500 * level;
};

const calculateLevel = (totalXP: number): number => {
  let level = 1;
  while (totalXP >= LEVEL_XP_REQUIREMENTS(level + 1)) {
    level++;
  }
  return level;
};

export const useVocabularyStore = create<VocabularyStore>()(
  persist(
    (set, get) => ({
      currentSession: null,
      currentQuestionIndex: 0,
      questions: [],
      currentWords: [],
      selectedAnswer: null,
      showResult: false,
      showFSRSRating: false,
      isLoading: false,
      currentDifficulty: 3,
      consecutiveCorrect: 0,
      consecutiveWrong: 0,
      stats: {
        totalWords: 5160,
        masteredWords: 0,
        reviewWords: 0,
        newWords: 5160,
        masteryScore: 0,
        currentStreak: 0,
        longestStreak: 0,
        totalXP: 0,
        level: 1,
      },

      initialize: async () => {},

      startSession: async (type: 'placement' | 'training' | 'review') => {
        set({ isLoading: true });
        
        try {
          // Dynamic import to avoid SSR issues
          const { createSPASassClient } = await import('@/lib/supabase/client');
          const { vocabularyTrainer } = await import('@/lib/vocabulary-trainer');
          
          const sassClient = await createSPASassClient();
          const supabase = sassClient.getSupabaseClient();
          
          const { data: { user } } = await supabase.auth.getUser();
          const userId = user?.id || 'temp-user-id';

          // 根据训练类型智能筛选词汇
          let words: DatabaseWord[] = [];

          if (type === 'placement') {
            // 水平测试：随机抽取各类词汇
            const { data: allWords, error: allWordsError }: any = await supabase
              .from('vocabulary_words')
              .select('*')
              .order('frequency', { ascending: true })
              .limit(15);
            
            if (allWordsError || !allWords) {
              console.error('Error fetching words:', allWordsError);
              set({ isLoading: false });
              return;
            }
            words = allWords;
          } else if (type === 'training') {
            // 智能学习：优先选择未掌握和新词 (state=0,1 且 mastery_level < 4)
            const { data: progress, error: progressError }: any = await supabase
              .from('user_vocabulary_progress')
              .select('vocabulary_id, vocabulary_words(*)')
              .eq('user_id', userId)
              .in('state', [0, 1])
              .lt('mastery_level', 4)
              .limit(30);

            if (progressError) console.error('Error fetching progress:', progressError);

            if (progress && progress.length > 0) {
              words = progress.map((p: any) => p.vocabulary_words).filter(Boolean);
            }

            // 补充新词
            if (words.length < 15) {
              const newWordsNeeded = 15 - words.length;
              const existingIds = new Set(words.map((w: any) => w.id));
              const { data: newWords }: any = await supabase
                .from('vocabulary_words')
                .select('*')
                .not('id', 'in', existingIds.size > 0 ? `(${Array.from(existingIds).join(',')})` : '(null)')
                .order('frequency', { ascending: true })
                .limit(newWordsNeeded);
              if (newWords) words = [...words, ...newWords];
            }

            words = words.sort(() => Math.random() - 0.5).slice(0, 15);
          } else if (type === 'review') {
            // 复习巩固：优先选择错题和到期复习
            const { data: errorProgress, error: errorProgressError }: any = await supabase
              .from('user_vocabulary_progress')
              .select('vocabulary_id, vocabulary_words(*), wrong_count, next_due')
              .eq('user_id', userId)
              .gt('wrong_count', 0)
              .order('wrong_count', { ascending: false })
              .limit(15);

            if (errorProgress && errorProgress.length > 0) {
              words = errorProgress.map((p: any) => p.vocabulary_words).filter(Boolean);
            }

            // 补充到期复习
            if (words.length < 15) {
              const reviewNeeded = 15 - words.length;
              const existingIds = new Set(words.map((w: any) => w.id));
              const { data: dueReviews }: any = await supabase
                .from('user_vocabulary_progress')
                .select('vocabulary_id, vocabulary_words(*), next_due')
                .eq('user_id', userId)
                .lte('next_due', new Date().toISOString())
                .not('id', 'in', existingIds.size > 0 ? `(${Array.from(existingIds).join(',')})` : '(null)')
                .order('next_due', { ascending: true })
                .limit(reviewNeeded);
              if (dueReviews) words = [...words, ...dueReviews.map((p: any) => p.vocabulary_words).filter(Boolean)];
            }

            words = words.sort(() => Math.random() - 0.5).slice(0, 15);
          }

          // 首次用户无进度，随机词汇
          if (!words || words.length === 0) {
            const { data: fallbackWords }: any = await supabase
              .from('vocabulary_words')
              .select('*')
              .order('frequency', { ascending: true })
              .limit(15);
            words = fallbackWords || [];
          }

          // Generate questions: English cloze with Chinese options
          const questions: Question[] = words.map((word: DatabaseWord, index: number) => {
            const sentenceExamples = word.examples ? (Array.isArray(word.examples) ? word.examples : [word.examples]) : [];
            const exampleText = sentenceExamples[0]?.phrase || sentenceExamples[0] || `The word "${word.word}" is used in English.`;
            const clozeQuestion = exampleText.replace(new RegExp(word.word, 'gi'), '____');
            const correctAnswer = word.translation || word.definition || '正确选项';
            
            const otherWords = words.filter((_, i) => i !== index);
            const wrongOptions = otherWords.slice(0, 3).map((w: DatabaseWord) => w.translation || w.definition || '错误选项').slice(0, 3);
            
            const allOptions = [correctAnswer, ...wrongOptions];
            const shuffled = allOptions.sort(() => Math.random() - 0.5);
            const correctIndex = shuffled.indexOf(correctAnswer);
            const correctLabel = String.fromCharCode(65 + correctIndex);
            
            return {
              id: `q-${word.id}`,
              question_type: 'cloze' as const,
              question_text: clozeQuestion,
              options: shuffled.map((opt: string, i: number) => `${String.fromCharCode(65 + i)}. ${opt}`),
              correct_answer: correctLabel,
              explanation: `${word.word}: ${word.definition || ''}\n${word.translation || ''}`,
              difficulty_level: get().currentDifficulty,
              vocabulary: word as Vocabulary,
            };
          });

          set({
            currentSession: {
              id: `session-${Date.now()}`,
              type,
              started_at: new Date(),
              total_questions: questions.length,
            },
            questions,
            currentWords: words,
            currentQuestionIndex: 0,
            selectedAnswer: null,
            showResult: false,
            showFSRSRating: false,
            isLoading: false,
          });

          // Try AI enhancement in background
          setTimeout(async () => {
            try {
              for (const word of words) {
                const { data }: any = await supabase.functions.invoke('generate-vocab-question', { 
                  body: { wordId: word.id, difficultyLevel: get().currentDifficulty } 
                });
                if (data?.question) {
                  set(state => ({
                    questions: state.questions.map((q: Question) => {
                      if (q.id === `q-${word.id}`) {
                        const safeOptions = data.question.options && data.question.options.length > 0 
                          ? data.question.options 
                          : q.options;
                        return { 
                          ...q, 
                          ...data.question, 
                          options: safeOptions,
                          id: data.question.id || q.id 
                        };
                      }
                      return q;
                    })
                  }));
                }
              }
            } catch (e) {
              console.error('Background AI failed:', e);
            }
          }, 100);

        } catch (error) {
          console.error('Error starting session:', error);
          set({ isLoading: false });
        }
      },

      submitAnswer: async (answer: string, responseTime: number) => {
        const { questions, currentQuestionIndex, currentDifficulty, consecutiveCorrect, consecutiveWrong, currentSession } = get();
        const currentQuestion = questions[currentQuestionIndex];
        if (!currentQuestion) return;
        
        const isCorrect = answer === currentQuestion.correct_answer;
        set({ selectedAnswer: answer, showResult: true });

        let newConsecutiveCorrect = consecutiveCorrect;
        let newConsecutiveWrong = consecutiveWrong;
        let newDifficulty = currentDifficulty;

        if (isCorrect) {
          newConsecutiveCorrect++;
          newConsecutiveWrong = 0;
          if (newConsecutiveCorrect >= 2 && newDifficulty < 5) {
            newDifficulty++;
            newConsecutiveCorrect = 0;
          }
        } else {
          newConsecutiveWrong++;
          newConsecutiveCorrect = 0;
          if (newConsecutiveWrong >= 2 && newDifficulty > 1) {
            newDifficulty--;
            newConsecutiveWrong = 0;
          }

          // 记录错题到 error_questions 表
          if (currentSession) {
            try {
              const { createSPASassClient } = await import('@/lib/supabase/client');
              const sassClient = await createSPASassClient();
              const supabase = sassClient.getSupabaseClient();
              const { data: { user } } = await supabase.auth.getUser();
              const userId = user?.id || 'temp-user-id';

              // 检查是否已存在该错题
              const { data: existingError }: any = await supabase
                .from('error_questions')
                .select('id, error_count')
                .eq('user_id', userId)
                .eq('question_id', currentQuestion.id)
                .single();

              if (existingError) {
                // 更新错误次数
                await supabase
                  .from('error_questions')
                  .update({
                    error_count: existingError.error_count + 1,
                    last_reviewed_at: new Date().toISOString(),
                    consecutive_correct_count: 0
                  })
                  .eq('id', existingError.id);
              } else {
                // 新增错题记录
                await supabase
                  .from('error_questions')
                  .insert({
                    user_id: userId,
                    question_id: currentQuestion.id,
                    training_session_id: currentSession.id,
                    user_answer: answer,
                    correct_answer: currentQuestion.correct_answer,
                    error_count: 1,
                    consecutive_correct_count: 0,
                    created_at: new Date().toISOString()
                  });
              }
            } catch (errorRecordError) {
              console.error('Error recording wrong answer:', errorRecordError);
            }
          }
        }

        set({ consecutiveCorrect: newConsecutiveCorrect, consecutiveWrong: newConsecutiveWrong, currentDifficulty: newDifficulty });

        if (currentSession?.type === 'training' || currentSession?.type === 'review') {
          set({ showFSRSRating: true });
        }
      },

      submitFSRSRating: async (rating: Rating) => {
        const { currentQuestionIndex, currentWords } = get();
        const currentItem = currentWords[currentQuestionIndex];
        
        if (currentItem?.id) {
          const { createSPASassClient } = await import('@/lib/supabase/client');
          const { vocabularyTrainer } = await import('@/lib/vocabulary-trainer');
          const sassClient = await createSPASassClient();
          const supabase = sassClient.getSupabaseClient();
          const { data: { user } } = await supabase.auth.getUser();
          await vocabularyTrainer.processReview(user?.id || 'temp-user-id', currentItem.id, rating);
        }

        set({ showFSRSRating: false });
        get().nextQuestion();
      },

      nextQuestion: () => {
        set((state) => {
          if (state.currentQuestionIndex >= state.questions.length - 1) {
            return { currentSession: null, currentQuestionIndex: 0, questions: [], currentWords: [], selectedAnswer: null, showResult: false, showFSRSRating: false, consecutiveCorrect: 0, consecutiveWrong: 0 };
          }
          return { currentQuestionIndex: state.currentQuestionIndex + 1, selectedAnswer: null, showResult: false, showFSRSRating: false };
        });
      },

      loadUserProgress: async () => {
        try {
          const { createSPASassClient } = await import('@/lib/supabase/client');
          const { gamificationService } = await import('@/lib/gamification');
          const { vocabularyTrainer } = await import('@/lib/vocabulary-trainer');
          
          const sassClient = await createSPASassClient();
          const supabase = sassClient.getSupabaseClient();
          const { data: { user } } = await supabase.auth.getUser();
          const userId = user?.id || 'temp-user-id';

          let userGamification: any = {};
          try { userGamification = await gamificationService.getUserGamification(userId); } 
          catch (e) { 
            const { data }: any = await supabase.from('user_gamification').select('*').eq('user_id', userId).single();
            userGamification = data || {};
          }

          let vocabStats: any = { learnedWords: 0, reviewWords: 0, newWords: 5160, masteryScore: 0 };
          try { vocabStats = await vocabularyTrainer.getUserVocabularyStats(userId); } 
          catch (e) {
            const { data: progress }: any = await supabase.from('user_vocabulary_progress').select('*').eq('user_id', userId);
            if (progress) {
              vocabStats.learnedWords = progress.filter((p: any) => p.state === 1).length;
              vocabStats.reviewWords = progress.filter((p: any) => p.state === 1 || p.state === 2).length;
              vocabStats.newWords = 5160 - progress.length;
            }
          }

          set({
            stats: {
              totalWords: 5160,
              masteredWords: vocabStats.learnedWords || 0,
              reviewWords: vocabStats.reviewWords || 0,
              newWords: vocabStats.newWords || 5160,
              masteryScore: vocabStats.masteryScore || 0,
              currentStreak: userGamification.current_streak || 0,
              longestStreak: userGamification.longest_streak || 0,
              totalXP: Number(userGamification.xp) || 0,
              level: userGamification.level || calculateLevel(Number(userGamification.xp) || 0),
            },
          });
        } catch (error) {
          console.error('Error loading progress:', error);
        }
      },

      resetSession: () => {
        set({ currentSession: null, currentQuestionIndex: 0, questions: [], currentWords: [], selectedAnswer: null, showResult: false, showFSRSRating: false, currentDifficulty: 3, consecutiveCorrect: 0, consecutiveWrong: 0 });
      },
    }),
    { name: 'vocabulary-storage', partialize: (state) => ({ stats: state.stats }) }
  )
);
