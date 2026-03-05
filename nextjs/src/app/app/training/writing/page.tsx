'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, CheckCircle2, XCircle, SkipForward, PenTool } from 'lucide-react';
import { createSPASassClient } from '@/lib/supabase/client';

interface WritingQuestion {
  id: string;
  title: string;
  content: string;
  difficultyLevel: number;
}

const SAMPLE_QUESTIONS: WritingQuestion[] = [
  {
    id: '1',
    title: '写作练习 1',
    content: '请写一篇关于你最喜欢的季节的短文，不少于80词。',
    difficultyLevel: 2,
  },
  {
    id: '2',
    title: '写作练习 2',
    content: '描述一次你难忘的旅行经历，不少于100词。',
    difficultyLevel: 2,
  },
  {
    id: '3',
    title: '写作练习 3',
    content: '谈谈你对未来科技发展的看法，不少于120词。',
    difficultyLevel: 3,
  },
];

export default function WritingPage() {
  const router = useRouter();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [answered, setAnswered] = useState(false);
  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState<WritingQuestion[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [startTime] = useState<number>(Date.now());

  const question = useMemo(() => questions[currentQuestion], [questions, currentQuestion]);
  const progress = useMemo(
    () => ((currentQuestion + 1) / questions.length) * 100,
    [currentQuestion, questions.length]
  );

  const initializeSession = useCallback(async () => {
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

      const { data: session } = await supabase
        .from('training_sessions')
        .insert({
          user_id: user.id,
          training_type: 'writing',
          difficulty_level: 2,
          status: 'in_progress',
        })
        .select()
        .single();

      if (session) {
        setSessionId(session.id);
      }

      const { data: questionsData } = await supabase
        .from('questions')
        .select('*')
        .eq('training_type', 'writing')
        .eq('difficulty_level', 2)
        .limit(3);

      if (questionsData && questionsData.length > 0) {
        const formattedQuestions: WritingQuestion[] = questionsData.map((q) => ({
          id: q.id,
          title: q.title || '写作练习',
          content: q.content || '',
          difficultyLevel: q.difficulty_level,
        }));
        setQuestions(formattedQuestions);
      } else {
        setQuestions(SAMPLE_QUESTIONS);
      }

      setLoading(false);
    } catch (error) {
      console.error('Error initializing session:', error, JSON.stringify(error, null, 2));
      setQuestions(SAMPLE_QUESTIONS);
      setLoading(false);
    }
  }, [router]);

  const submitAnswer = useCallback(async () => {
    if (!userAnswer || answered) return;

    const currentQ = questions[currentQuestion];

    setAnswered(true);

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
      if (sessionId && currentQ.id.length > 5) {
        const { error: insertError } = await supabase.from('training_records').insert({
          session_id: sessionId,
          question_id: currentQ.id,
          user_id: user.id,
          user_answer: userAnswer,
          is_correct: true,
          score: 80,
          time_spent: 300,
          difficulty_level: currentQ.difficultyLevel,
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
  }, [userAnswer, answered, questions, currentQuestion, sessionId, router]);

  const nextQuestion = useCallback(() => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion((prev) => prev + 1);
      setUserAnswer('');
      setAnswered(false);
    } else {
      finishSession();
    }
  }, [currentQuestion, questions.length]);

  const finishSession = useCallback(async () => {
    try {
      const sassClient = await createSPASassClient();
      const supabase = sassClient.getSupabaseClient();

      if (sessionId) {
        const timeSpent = Math.floor((Date.now() - startTime) / 1000);
        const finalScore = Math.round((score / questions.length) * 100);

        await supabase
          .from('training_sessions')
          .update({
            status: 'completed',
            completed_at: new Date().toISOString(),
            total_questions: questions.length,
            correct_count: questions.length,
            score: finalScore,
            time_spent: timeSpent,
          })
          .eq('id', sessionId);
      }

      router.push('/app/training');
    } catch (error) {
      console.error('Error finishing session:', error);
      router.push('/app/training');
    }
  }, [sessionId, startTime, score, questions.length, router]);

  useEffect(() => {
    initializeSession();
  }, [initializeSession]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">加载中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <button
            onClick={() => router.push('/app/training')}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            返回训练中心
          </button>
          <h1 className="text-3xl font-bold text-gray-900">写作训练</h1>
          <p className="mt-2 text-gray-600">
            第 {currentQuestion + 1} / {questions.length} 题
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="mb-4">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>进度</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <div className="mb-6">
            <div className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
              <PenTool className="w-5 h-5" />
              {question.title}
            </div>
            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <div className="text-gray-800 leading-relaxed whitespace-pre-wrap">
                {question.content}
              </div>
            </div>
          </div>

          <div className="mb-6">
            <div className="text-lg font-medium text-gray-900 mb-4">你的答案</div>
            <textarea
              value={userAnswer}
              onChange={(e) => !answered && setUserAnswer(e.target.value)}
              disabled={answered}
              placeholder="请在这里输入你的答案..."
              className="w-full p-4 border-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[200px]"
            />
          </div>

          <div className="flex justify-between">
            {!answered ? (
              <button
                onClick={submitAnswer}
                disabled={!userAnswer}
                className="ml-auto bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-6 py-2 rounded-lg font-medium transition-colors"
              >
                提交答案
              </button>
            ) : (
              <button
                onClick={nextQuestion}
                className="ml-auto bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center"
              >
                {currentQuestion < questions.length - 1 ? (
                  <>
                    下一题
                    <SkipForward className="w-4 h-4 ml-2" />
                  </>
                ) : (
                  '完成训练'
                )}
              </button>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">当前得分</span>
            <span className="font-bold text-gray-900">
              {score} / {questions.length}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
