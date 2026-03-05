'use client';

import { useEffect, useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts';
import {
  TrendingUp,
  Clock,
  Target,
  Trophy,
  BookOpen,
  Headphones,
  FileText,
  PenTool,
  Award,
} from 'lucide-react';
import { createSPASassClient } from '@/lib/supabase/client';

interface ProgressData {
  vocabulary: { level: number; score: number; totalTime: number };
  listening: { level: number; score: number; totalTime: number };
  reading: { level: number; score: number; totalTime: number };
  writing: { level: number; score: number; totalTime: number };
  speaking: { level: number; score: number; totalTime: number };
}

interface DailyProgress {
  date: string;
  score: number;
  time: number;
}

export default function ProgressPage() {
  const [progress, setProgress] = useState<ProgressData | null>(null);
  const [dailyProgress, setDailyProgress] = useState<DailyProgress[]>([]);
  const [studentProfile, setStudentProfile] = useState<{
    total_study_days?: number;
    daily_study_time?: number;
    current_streak?: number;
    longest_streak?: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProgress();
  }, []);

  const loadProgress = async () => {
    try {
      const sassClient = await createSPASassClient();
      const supabase = sassClient.getSupabaseClient();

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;
      // Get student profile, create if it doesn't exist
      // eslint-disable-next-line prefer-const
      let { data: profile, error: profileError } = await supabase
        .from('student_profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError) {
        // If no profile found (PGRST116 = no rows returned), create one!
        if (profileError.code === 'PGRST116') {
          const { data: newProfile, error: insertError } = await supabase
            .from('student_profiles')
            .insert({ id: user.id })
            .select()
            .single();
          if (!insertError) {
            profile = newProfile;
          }
        } else {
          console.error('Error loading student profile:', profileError);
        }
      }

      if (profile) {
        setStudentProfile(profile);
      }

      const { data: sessions, error: sessionsError } = await supabase
        .from('training_sessions')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'completed')
        .order('created_at', { ascending: false });

      if (sessionsError) {
        console.error('Error loading training sessions:', sessionsError);
      }

      if (sessions) {
        const progressByType: ProgressData = {
          vocabulary: { level: 1, score: 0, totalTime: 0 },
          listening: { level: 1, score: 0, totalTime: 0 },
          reading: { level: 1, score: 0, totalTime: 0 },
          writing: { level: 1, score: 0, totalTime: 0 },
          speaking: { level: 1, score: 0, totalTime: 0 },
        };

        const dailyMap = new Map<string, { score: number; time: number }>();

        sessions.forEach((session) => {
          const type = session.training_type as keyof ProgressData;
          if (progressByType[type]) {
            progressByType[type].totalTime += session.time_spent || 0;
            if (session.score) {
              progressByType[type].score = Math.max(
                progressByType[type].score,
                Math.round(session.score)
              );
            }
            progressByType[type].level = Math.min(
              5,
              Math.floor(progressByType[type].score / 20) + 1
            );
          }

          const date = new Date(session.created_at).toLocaleDateString('zh-CN', {
            month: 'short',
            day: 'numeric',
          });
          const existing = dailyMap.get(date) || { score: 0, time: 0 };
          dailyMap.set(date, {
            score: Math.max(existing.score, Math.round(session.score || 0)),
            time: existing.time + (session.time_spent || 0),
          });
        });

        setProgress(progressByType);

        const dailyData: DailyProgress[] = Array.from(dailyMap.entries())
          .map(([date, data]) => ({ date, ...data }))
          .slice(0, 14)
          .reverse();

        setDailyProgress(dailyData);
      }
    } catch (error) {
      console.error('Error loading progress:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}小时${minutes}分钟`;
    return `${minutes}分钟`;
  };

  const chartData = progress
    ? [
        { name: '词汇', score: progress.vocabulary.score, level: progress.vocabulary.level },
        { name: '听力', score: progress.listening.score, level: progress.listening.level },
        { name: '阅读', score: progress.reading.score, level: progress.reading.level },
        { name: '写作', score: progress.writing.score, level: progress.writing.level },
        { name: '口语', score: progress.speaking.score, level: progress.speaking.level },
      ]
    : [];

  const skillIcons = {
    vocabulary: BookOpen,
    listening: Headphones,
    reading: FileText,
    writing: PenTool,
    speaking: Award,
  };

  const skillNames = {
    vocabulary: '词汇',
    listening: '听力',
    reading: '阅读',
    writing: '写作',
    speaking: '口语',
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">加载中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">学习进度</h1>
          <p className="mt-2 text-gray-600">追踪你的学习成果和进步</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <TrendingUp className="h-8 w-8 text-blue-500" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">总学习天数</p>
                <p className="text-2xl font-bold text-gray-900">
                  {studentProfile?.total_study_days || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Clock className="h-8 w-8 text-green-500" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">每日学习目标</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatTime((studentProfile?.daily_study_time || 0) * 60)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Target className="h-8 w-8 text-purple-500" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">当前连续学习</p>
                <p className="text-2xl font-bold text-gray-900">
                  {studentProfile?.current_streak || 0} 天
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Trophy className="h-8 w-8 text-yellow-500" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">最长连续学习</p>
                <p className="text-2xl font-bold text-gray-900">
                  {studentProfile?.longest_streak || 0} 天
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">技能掌握度</h2>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="score" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">每日进度</h2>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={dailyProgress}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="score"
                    stroke="#8b5cf6"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">详细技能进度</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {progress &&
              Object.entries(progress).map(([key, data]) => {
                const Icon = skillIcons[key as keyof typeof skillIcons];
                const name = skillNames[key as keyof typeof skillNames];
                return (
                  <div key={key} className="border rounded-lg p-4">
                    <div className="flex items-center mb-4">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                        <Icon className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{name}</h3>
                        <p className="text-sm text-gray-500">Level {data.level}</p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-600">掌握度</span>
                          <span className="font-medium text-gray-900">{data.score}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${Math.min(100, data.score)}%` }}
                          />
                        </div>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">学习时间</span>
                        <span className="font-medium text-gray-900">
                          {formatTime(data.totalTime)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      </div>
    </div>
  );
}
