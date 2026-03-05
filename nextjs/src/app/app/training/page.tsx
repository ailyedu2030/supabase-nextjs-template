'use client';

import { useEffect, useState } from 'react';
import { createSPASassClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { BookOpen, Headphones, FileText, PenTool, Brain, Target } from 'lucide-react';

interface TrainingStats {
  totalSessions: number;
  totalTime: number;
  currentStreak: number;
  averageScore: number;
}

export default function TrainingPage() {
  const [stats, setStats] = useState<TrainingStats>({
    totalSessions: 0,
    totalTime: 0,
    currentStreak: 0,
    averageScore: 0,
  });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const sassClient = await createSPASassClient();
      const supabase = sassClient.getSupabaseClient();

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data: sessions } = await supabase
        .from('training_sessions')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'completed');

      if (sessions && sessions.length > 0) {
        const totalTime = sessions.reduce((acc, s) => acc + (s.time_spent || 0), 0);
        const avgScore = sessions.reduce((acc, s) => acc + (s.score || 0), 0) / sessions.length;

        setStats({
          totalSessions: sessions.length,
          totalTime,
          currentStreak: 0,
          averageScore: Math.round(avgScore),
        });
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const trainingModules = [
    {
      type: 'vocabulary',
      title: '词汇训练',
      description: '记忆单词，提升词汇量',
      icon: BookOpen,
      color: 'bg-blue-500',
      href: '/app/training/vocabulary',
    },
    {
      type: 'listening',
      title: '听力训练',
      description: '练习英语听力理解',
      icon: Headphones,
      color: 'bg-green-500',
      href: '/app/training/listening',
    },
    {
      type: 'reading',
      title: '阅读训练',
      description: '提升阅读理解能力',
      icon: FileText,
      color: 'bg-purple-500',
      href: '/app/training/reading',
    },
    {
      type: 'writing',
      title: '写作训练',
      description: 'AI辅助写作练习',
      icon: PenTool,
      color: 'bg-orange-500',
      href: '/app/training/writing',
    },
    {
      type: 'speaking',
      title: '口语训练',
      description: 'AI语音评分练习',
      icon: Target,
      color: 'bg-pink-500',
      href: '/app/training/speaking',
    },
    {
      type: 'adaptive',
      title: '自适应学习',
      description: '智能推荐学习内容',
      icon: Brain,
      color: 'bg-indigo-500',
      href: '/app/training/adaptive',
    },
  ];

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}小时${minutes}分钟`;
    return `${minutes}分钟`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">训练中心</h1>
          <p className="mt-2 text-gray-600">选择训练模块开始学习</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-500">总训练次数</div>
            <div className="text-2xl font-bold text-gray-900">{stats.totalSessions}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-500">总学习时间</div>
            <div className="text-2xl font-bold text-gray-900">{formatTime(stats.totalTime)}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-500">当前连续学习</div>
            <div className="text-2xl font-bold text-gray-900">{stats.currentStreak} 天</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-500">平均正确率</div>
            <div className="text-2xl font-bold text-gray-900">{stats.averageScore}%</div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {trainingModules.map((module) => (
            <Link
              key={module.type}
              href={module.href}
              className="block bg-white rounded-lg shadow hover:shadow-lg transition-shadow duration-200"
            >
              <div className="p-6">
                <div
                  className={`w-12 h-12 ${module.color} rounded-lg flex items-center justify-center mb-4`}
                >
                  <module.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">{module.title}</h3>
                <p className="mt-1 text-sm text-gray-500">{module.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
