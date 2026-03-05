'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, CheckCircle2, XCircle, SkipForward } from 'lucide-react';
import { createSPASassClient } from '@/lib/supabase/client';

interface ReadingQuestion {
  id: string;
  title: string;
  passage: string;
  questions: Array<{
    id: string;
    question: string;
    options: string[];
    correctAnswer: number;
  }>;
  difficultyLevel: number;
}

const SAMPLE_QUESTIONS: ReadingQuestion[] = [
  {
    id: '1',
    title: '阅读理解 1',
    passage:
      '在现代社会，英语已经成为国际交流的重要工具。无论是商务往来、学术研究还是旅游观光，英语都扮演着不可或缺的角色。学习英语不仅能够帮助我们更好地了解世界，还能够为我们的职业发展创造更多机会。',
    questions: [
      {
        id: '1-1',
        question: '根据文章，英语在现代社会中的作用是什么？',
        options: ['仅用于学术研究', '国际交流的重要工具', '仅用于旅游观光', '仅用于商务往来'],
        correctAnswer: 1,
      },
      {
        id: '1-2',
        question: '学习英语能够带来什么好处？',
        options: ['只能了解世界', '只能创造职业机会', '了解世界并创造职业机会', '没有明显好处'],
        correctAnswer: 2,
      },
    ],
    difficultyLevel: 2,
  },
  {
    id: '2',
    title: '阅读理解 2',
    passage:
      '气候变化是当今世界面临的最大挑战之一。科学家们警告说，如果我们不采取行动减少温室气体排放，全球气温将继续上升，导致极端天气事件增多、海平面上升以及生态系统破坏。每个人都可以为应对气候变化做出贡献，比如节约能源、减少浪费和支持可再生能源。',
    questions: [
      {
        id: '2-1',
        question: '气候变化可能导致什么后果？',
        options: ['气温下降', '极端天气事件增多', '海平面下降', '生态系统改善'],
        correctAnswer: 1,
      },
    ],
    difficultyLevel: 3,
  },
];

export default function ReadingPage() {
  const router = useRouter();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [currentSubQuestion, setCurrentSubQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);
  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState<ReadingQuestion[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [startTime] = useState<number>(Date.now());

  const question = useMemo(() => questions[currentQuestion], [questions, currentQuestion]);
  const subQuestion = useMemo(
    () => (question ? question.questions[currentSubQuestion] : null),
    [question, currentSubQuestion]
  );
  const completedQuestions = useMemo(
    () =>
      questions.slice(0, currentQuestion).reduce((sum, q) => sum + q.questions.length, 0) +
      currentSubQuestion +
      1,
    [questions, currentQuestion, currentSubQuestion]
  );
  const progress = useMemo(
    () => (totalQuestions > 0 ? (completedQuestions / totalQuestions) * 100 : 0),
    [completedQuestions, totalQuestions]
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
          training_type: 'reading',
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
        .eq('training_type', 'reading')
        .eq('difficulty_level', 2)
        .limit(3);

      if (questionsData && questionsData.length > 0) {
        const formattedQuestions: ReadingQuestion[] = questionsData.map((q) => ({
          id: q.id,
          title: q.title,
          passage: q.content || '',
          questions: q.correct_answer
            ? [
                {
                  id: `${q.id}-1`,
                  question: '请回答以下问题',
                  options: [q.correct_answer, '选项 B', '选项 C', '选项 D'],
                  correctAnswer: 0,
                },
              ]
            : [],
          difficultyLevel: q.difficulty_level,
        }));
        setQuestions(formattedQuestions);
        setTotalQuestions(formattedQuestions.reduce((sum, q) => sum + q.questions.length, 0));
      } else {
        setQuestions(SAMPLE_QUESTIONS);
        setTotalQuestions(SAMPLE_QUESTIONS.reduce((sum, q) => sum + q.questions.length, 0));
      }

      setLoading(false);
    } catch (error) {
      console.error('Error initializing session:', error);
      setQuestions(SAMPLE_QUESTIONS);
      setTotalQuestions(SAMPLE_QUESTIONS.reduce((sum, q) => sum + q.questions.length, 0));
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    initializeSession();
  }, [initializeSession]);

  const selectAnswer = useCallback(
    (index: number) => {
      if (answered) return;
      setSelectedAnswer(index);
    },
    [answered]
  );

  const submitAnswer = useCallback(async () => {
    if (selectedAnswer === null || answered || !question || !subQuestion) return;

    const isCorrect = selectedAnswer === subQuestion.correctAnswer;
    setAnswered(true);
    if (isCorrect) {
      setScore((prev) => prev + 1);
    }
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
      if (sessionId && question.id.length > 5) {
        const { error: insertError } = await supabase.from('training_records').insert({
          session_id: sessionId,
          question_id: question.id,
          user_id: user.id,
          user_answer: subQuestion.options[selectedAnswer],
          is_correct: isCorrect,
          score: isCorrect ? 100 : 0,
          time_spent: 30,
          difficulty_level: question.difficultyLevel || 1,
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
      console.error('Error saving answer:', error);
    }
  }, [selectedAnswer, answered, question, subQuestion, sessionId, router]);

  const nextQuestion = useCallback(() => {
    if (!question) return;

    if (currentSubQuestion < question.questions.length - 1) {
      setCurrentSubQuestion((prev) => prev + 1);
      setSelectedAnswer(null);
      setAnswered(false);
    } else if (currentQuestion < questions.length - 1) {
      setCurrentQuestion((prev) => prev + 1);
      setCurrentSubQuestion(0);
      setSelectedAnswer(null);
      setAnswered(false);
    } else {
      finishSession();
    }
  }, [question, currentSubQuestion, currentQuestion, questions.length]);

  const finishSession = useCallback(async () => {
    try {
      const sassClient = await createSPASassClient();
      const supabase = sassClient.getSupabaseClient();

      if (sessionId) {
        const timeSpent = Math.floor((Date.now() - startTime) / 1000);
        const finalScore = Math.round((score / totalQuestions) * 100);

        await supabase
          .from('training_sessions')
          .update({
            status: 'completed',
            completed_at: new Date().toISOString(),
            total_questions: totalQuestions,
            correct_count: score,
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
  }, [sessionId, startTime, score, totalQuestions, router]);

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
          <h1 className="text-3xl font-bold text-gray-900">阅读训练</h1>
          <p className="mt-2 text-gray-600">
            第 {completedQuestions} / {totalQuestions} 题
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
            <div className="text-lg font-semibold text-gray-900 mb-2">{question.title}</div>
            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <div className="text-gray-800 leading-relaxed whitespace-pre-wrap">
                {question.passage}
              </div>
            </div>
          </div>

          <div className="mb-6">
            <div className="text-lg font-medium text-gray-900 mb-4">
              {subQuestion?.question || ''}
            </div>
            <div className="space-y-3">
              {subQuestion?.options?.map((option, index) => (
                <button
                  key={index}
                  onClick={() => selectAnswer(index)}
                  disabled={answered}
                  className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                    answered
                      ? index === subQuestion?.correctAnswer
                        ? 'border-green-500 bg-green-50'
                        : index === selectedAnswer
                          ? 'border-red-500 bg-red-50'
                          : 'border-gray-200 bg-gray-50'
                      : selectedAnswer === index
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span>{option}</span>
                    {answered && index === subQuestion?.correctAnswer && (
                      <CheckCircle2 className="w-5 h-5 text-green-500" />
                    )}
                    {answered &&
                      index === selectedAnswer &&
                      index !== subQuestion?.correctAnswer && (
                        <XCircle className="w-5 h-5 text-red-500" />
                      )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-between">
            {!answered ? (
              <button
                onClick={submitAnswer}
                disabled={selectedAnswer === null}
                className="ml-auto bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-6 py-2 rounded-lg font-medium transition-colors"
              >
                提交答案
              </button>
            ) : (
              <button
                onClick={nextQuestion}
                className="ml-auto bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center"
              >
                {completedQuestions < totalQuestions ? (
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
              {score} / {totalQuestions}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
