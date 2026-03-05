'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Play,
  Pause,
  SkipForward,
  Volume2,
  VolumeX,
  ChevronLeft,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { createSPASassClient } from '@/lib/supabase/client';

interface ListeningQuestion {
  id: string;
  title: string;
  audioUrl: string;
  question: string;
  options: string[];
  correctAnswer: number;
  difficultyLevel: number;
}

const SAMPLE_QUESTIONS: ListeningQuestion[] = [
  {
    id: '1',
    title: '听力练习 1',
    audioUrl: '',
    question: '对话中提到的天气如何？',
    options: ['晴天', '雨天', '多云', '大风'],
    correctAnswer: 1,
    difficultyLevel: 2,
  },
  {
    id: '2',
    title: '听力练习 2',
    audioUrl: '',
    question: '他们计划什么时候见面？',
    options: ['今天下午', '明天上午', '本周六', '下周一'],
    correctAnswer: 2,
    difficultyLevel: 2,
  },
  {
    id: '3',
    title: '听力练习 3',
    audioUrl: '',
    question: '女士的职业是什么？',
    options: ['教师', '医生', '工程师', '律师'],
    correctAnswer: 0,
    difficultyLevel: 3,
  },
];

export default function ListeningPage() {
  const router = useRouter();
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(1);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState<ListeningQuestion[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [startTime] = useState<number>(() => Date.now());

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
          training_type: 'listening',
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
        .eq('training_type', 'listening')
        .eq('difficulty_level', 2)
        .limit(5);

      if (questionsData && questionsData.length > 0) {
        const formattedQuestions: ListeningQuestion[] = questionsData.map((q) => ({
          id: q.id,
          title: q.title,
          audioUrl: q.audio_url || '',
          question: q.content,
          options: q.correct_answer ? [q.correct_answer] : ['选项 A', '选项 B', '选项 C', '选项 D'],
          correctAnswer: 0,
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

  useEffect(() => {
    initializeSession();
  }, [initializeSession]);

  const togglePlay = useCallback(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying((prev) => !prev);
    }
  }, [isPlaying]);

  const handleVolumeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  }, []);

  const selectAnswer = useCallback(
    (index: number) => {
      if (answered) return;
      setSelectedAnswer(index);
    },
    [answered]
  );

  const submitAnswer = useCallback(async () => {
    if (selectedAnswer === null || answered) return;

    const currentQ = questions[currentQuestion];
    const isCorrect = selectedAnswer === currentQ.correctAnswer;

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
      if (sessionId && currentQ.id.length > 5) {
        const { error: insertError } = await supabase.from('training_records').insert({
          session_id: sessionId,
          question_id: currentQ.id,
          user_id: user.id,
          user_answer: currentQ.options[selectedAnswer],
          is_correct: isCorrect,
          score: isCorrect ? 100 : 0,
          time_spent: 30,
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

    setShowResult(true);
  }, [selectedAnswer, answered, questions, currentQuestion, sessionId, router]);

  const nextQuestion = useCallback(() => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion((prev) => prev + 1);
      setSelectedAnswer(null);
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
  }, [sessionId, startTime, score, questions.length, router]);

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
          <h1 className="text-3xl font-bold text-gray-900">听力训练</h1>
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

          <div className="text-center mb-6">
            <div className="text-lg font-semibold text-gray-900 mb-2">{question.title}</div>
            <div className="flex items-center justify-center space-x-4 mb-4">
              <button
                onClick={togglePlay}
                className="w-16 h-16 bg-blue-500 hover:bg-blue-600 rounded-full flex items-center justify-center text-white transition-colors"
              >
                {isPlaying ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8 ml-1" />}
              </button>
              <div className="flex items-center space-x-2">
                {volume === 0 ? (
                  <VolumeX className="w-5 h-5 text-gray-400" />
                ) : (
                  <Volume2 className="w-5 h-5 text-gray-400" />
                )}
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={volume}
                  onChange={handleVolumeChange}
                  className="w-24"
                />
              </div>
            </div>
            <div className="text-sm text-gray-500">
              注意：这是示例音频。实际项目中请上传真实的听力音频文件。
            </div>
          </div>

          <audio ref={audioRef} src={question.audioUrl || undefined} />

          <div className="mb-6">
            <div className="text-lg font-medium text-gray-900 mb-4">{question.question}</div>
            <div className="space-y-3">
              {question.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => selectAnswer(index)}
                  disabled={answered}
                  className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                    answered
                      ? index === question.correctAnswer
                        ? 'border-green-500 bg-green-50'
                        : selectedAnswer === index
                          ? 'border-red-500 bg-red-50'
                          : 'border-gray-200 bg-gray-50'
                      : selectedAnswer === index
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span>{option}</span>
                    {answered && index === question.correctAnswer && (
                      <CheckCircle2 className="w-5 h-5 text-green-500" />
                    )}
                    {answered && selectedAnswer === index && index !== question.correctAnswer && (
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
