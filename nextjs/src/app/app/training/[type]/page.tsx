'use client';

import { useEffect, useState, use, useCallback, useMemo } from 'react';
import { createSPASassClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { Play, CheckCircle, XCircle, ArrowRight, RotateCcw } from 'lucide-react';

interface Question {
  id: string;
  content: string;
  question_type: string;
  audio_url: string | null;
  correct_answer: string;
  difficulty_level?: number;
}

interface Session {
  id: string;
  training_type: string;
  status: string;
  total_questions: number;
  correct_count: number;
  score: number | null;
}

const TYPE_TITLES: Record<string, string> = {
  vocabulary: '词汇训练',
  listening: '听力训练',
  reading: '阅读训练',
  writing: '写作训练',
  speaking: '口语训练',
  adaptive: '自适应学习',
};

export default function TrainingTypePage({ params }: { params: Promise<{ type: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');
  const [answers, setAnswers] = useState<Map<string, string>>(new Map());
  const [showResult, setShowResult] = useState(false);
  const [startTime, setStartTime] = useState<number>(0);

  const completeSession = useCallback(async () => {
    if (!session) return;

    const durationSeconds = Math.round((Date.now() - startTime) / 1000);
    let correctCount = 0;

    answers.forEach((answer, questionId) => {
      const question = questions.find((q) => q.id === questionId);
      if (question && answer === question.correct_answer) {
        correctCount++;
      }
    });

    const score = Math.round((correctCount / questions.length) * 100);

    try {
      const sassClient = await createSPASassClient();
      const supabase = sassClient.getSupabaseClient();

      await supabase
        .from('training_sessions')
        .update({
          status: 'completed',
          correct_count: correctCount,
          score,
          time_spent: durationSeconds,
          completed_at: new Date().toISOString(),
        })
        .eq('id', session.id);
    } catch (error) {
      console.error('Error completing session:', error);
    }

    router.push('/app/training');
  }, [session, questions, answers, startTime, router]);

  const submitAnswer = useCallback(async () => {
    if (!session || !questions[currentIndex]) return;

    const newAnswers = new Map(answers);
    newAnswers.set(questions[currentIndex].id, selectedAnswer);
    setAnswers(newAnswers);

    const isCorrect = selectedAnswer === questions[currentIndex].correct_answer;

    try {
      const sassClient = await createSPASassClient();
      const supabase = sassClient.getSupabaseClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push('/auth/login');
        return;
      }
      if (questions[currentIndex].id.length > 5) {
        const { error: insertError } = await supabase.from('training_records').insert({
          session_id: session.id,
          user_id: user.id,
          question_id: questions[currentIndex].id,
          user_answer: selectedAnswer,
          is_correct: isCorrect,
          score: isCorrect ? 100 : 0,
          time_spent: 30,
          difficulty_level: questions[currentIndex].difficulty_level || 1,
          knowledge_points: [],
        });
        if (insertError) {
          console.error('Insert error details:', {
            message: insertError.message,
            details: insertError.details,
            hint: insertError.hint,
            code: insertError.code,
          });
        }
        // Handle error questions
        if (!isCorrect) {
          // Check if error question already exists
          const { data: existingError } = await supabase
            .from('error_questions')
            .select('*')
            .eq('user_id', user.id)
            .eq('question_id', questions[currentIndex].id)
            .maybeSingle(); // Use maybeSingle to avoid throwing error when not found
          if (existingError) {
            // Update error count
            await supabase
              .from('error_questions')
              .update({
                error_count: existingError.error_count + 1,
                user_answer: selectedAnswer,
                updated_at: new Date().toISOString(),
              })
              .eq('id', existingError.id);
          } else {
            // Create new error question
            await supabase.from('error_questions').insert({
              user_id: user.id,
              question_id: questions[currentIndex].id,
              training_session_id: session.id,
              user_answer: selectedAnswer,
              correct_answer: questions[currentIndex].correct_answer,
            });
          }
        }
      }
    } catch (error) {
      console.error('Error saving answer:', {
        message: (error as any)?.message,
        details: (error as any)?.details,
        hint: (error as any)?.hint,
        code: (error as any)?.code,
        full: error,
      });
    }

    setShowResult(true);
  }, [session, questions, currentIndex, selectedAnswer, answers, router]);

  const nextQuestion = useCallback(async () => {
    if (currentIndex >= questions.length - 1) {
      await completeSession();
    } else {
      setCurrentIndex((prev) => prev + 1);
      setSelectedAnswer('');
      setShowResult(false);
    }
  }, [currentIndex, questions.length, completeSession]);

  const startTraining = useCallback(async () => {
    setLoading(true);
    try {
      const sassClient = await createSPASassClient();
      const supabase = sassClient.getSupabaseClient();

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push('/auth/login');
        return;
      }

      const { data: newSession, error } = await supabase
        .from('training_sessions')
        .insert({
          user_id: user.id,
          training_type: resolvedParams.type,
          difficulty_level: 1,
          status: 'in_progress',
          total_questions: 5,
          started_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      setSession(newSession as any);
      setStartTime(Date.now());

      const { data: questionData } = await supabase
        .from('questions')
        .select('*')
        .eq('training_type', resolvedParams.type)
        .limit(5);

      if (questionData) {
        console.log('questionData:', JSON.stringify(questionData, null, 2));
        setQuestions(questionData);
      }
    } catch (error) {
      console.error('Error starting training:', error, JSON.stringify(error, null, 2));
    } finally {
      setLoading(false);
    }
  }, [resolvedParams.type, router]);

  const currentQuestion = useMemo(() => questions[currentIndex], [questions, currentIndex]);
  const progressPercentage = useMemo(
    () => ((currentIndex + 1) / questions.length) * 100,
    [currentIndex, questions.length]
  );
  const pageTitle = useMemo(() => TYPE_TITLES[resolvedParams.type], [resolvedParams.type]);

  useEffect(() => {
    startTraining();
  }, [resolvedParams.type, startTraining]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">加载中...</p>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">暂无题目</p>
          <button
            onClick={() => router.push('/app/training')}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            返回训练中心
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">{pageTitle}</h1>
          <div className="mt-2 flex items-center gap-4 text-sm text-gray-600">
            <span>
              题目 {currentIndex + 1} / {questions.length}
            </span>
            <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 transition-all duration-300"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="mb-6">
            <h2 className="text-lg font-medium text-gray-900">{currentQuestion.content}</h2>
            {currentQuestion.audio_url && (
              <audio controls className="mt-4 w-full">
                <source src={currentQuestion.audio_url} />
              </audio>
            )}
          </div>

          <div className="space-y-3">
            <textarea
              value={selectedAnswer}
              onChange={(e) => !showResult && setSelectedAnswer(e.target.value)}
              disabled={showResult}
              placeholder="请输入您的答案..."
              className="w-full p-4 border-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[120px]"
            />
          </div>

          <div className="mt-6 flex justify-end gap-4">
            {!showResult ? (
              <button
                onClick={submitAnswer}
                disabled={!selectedAnswer}
                className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <Play className="w-4 h-4" />
                提交答案
              </button>
            ) : (
              <button
                onClick={nextQuestion}
                className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center gap-2"
              >
                {currentIndex >= questions.length - 1 ? '完成' : '下一题'}
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        <div className="mt-6 flex justify-center">
          <button
            onClick={() => router.push('/app/training')}
            className="text-gray-500 hover:text-gray-700 flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            退出训练
          </button>
        </div>
      </div>
    </div>
  );
}
