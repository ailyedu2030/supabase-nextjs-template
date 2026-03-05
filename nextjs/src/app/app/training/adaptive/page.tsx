'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Brain, TrendingUp, Target, BookOpen, Clock, Award } from 'lucide-react';
import { createSPASassClient } from '@/lib/supabase/client';

interface WeakArea {
  id: string;
  name: string;
  type: 'listening' | 'reading' | 'writing' | 'translation';
  errorCount: number;
  masteryLevel: number;
  recommendedQuestions: number;
}

interface LearningPath {
  id: string;
  title: string;
  description: string;
  estimatedTime: string;
  questionsCount: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  focusAreas: string[];
}

interface StudyStat {
  label: string;
  value: string;
  icon: React.ElementType;
  color: string;
}

export default function AdaptiveLearningPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [weakAreas, setWeakAreas] = useState<WeakArea[]>([]);
  const [learningPaths, setLearningPaths] = useState<LearningPath[]>([]);
  const [selectedPath, setSelectedPath] = useState<string | null>(null);

  const sampleWeakAreas: WeakArea[] = [
    {
      id: '1',
      name: '听力理解 - 细节题',
      type: 'listening',
      errorCount: 15,
      masteryLevel: 45,
      recommendedQuestions: 20,
    },
    {
      id: '2',
      name: '阅读理解 - 推理题',
      type: 'reading',
      errorCount: 12,
      masteryLevel: 52,
      recommendedQuestions: 15,
    },
    {
      id: '3',
      name: '写作 - 议论文结构',
      type: 'writing',
      errorCount: 8,
      masteryLevel: 60,
      recommendedQuestions: 10,
    },
  ];

  const sampleLearningPaths: LearningPath[] = [
    {
      id: '1',
      title: '听力强化训练',
      description: '针对听力薄弱环节的专项训练，包括细节捕捉、主旨理解和推理判断',
      estimatedTime: '2小时',
      questionsCount: 30,
      difficulty: 'intermediate',
      focusAreas: ['听力理解 - 细节题', '听力理解 - 主旨题'],
    },
    {
      id: '2',
      title: '阅读能力提升',
      description: '系统训练阅读理解技巧，从基础词汇到复杂推理',
      estimatedTime: '3小时',
      questionsCount: 40,
      difficulty: 'intermediate',
      focusAreas: ['阅读理解 - 推理题', '阅读理解 - 词汇题'],
    },
    {
      id: '3',
      title: '综合能力突破',
      description: '全面提升听读写译四项技能的综合训练课程',
      estimatedTime: '5小时',
      questionsCount: 60,
      difficulty: 'advanced',
      focusAreas: ['听力理解', '阅读理解', '写作', '翻译'],
    },
  ];

  useEffect(() => {
    loadAdaptiveData();
  }, []);

  const loadAdaptiveData = async () => {
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

      setWeakAreas(sampleWeakAreas);
      setLearningPaths(sampleLearningPaths);
      setLoading(false);
    } catch (error) {
      console.error('Error loading adaptive data:', error);
      setWeakAreas(sampleWeakAreas);
      setLearningPaths(sampleLearningPaths);
      setLoading(false);
    }
  };

  const startLearningPath = async (path: LearningPath) => {
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
          training_type: 'adaptive',
          difficulty_level:
            path.difficulty === 'beginner' ? 1 : path.difficulty === 'intermediate' ? 2 : 3,
          status: 'in_progress',
        })
        .select()
        .single();

      if (session) {
        router.push(`/app/training/adaptive-session/${session.id}`);
      }
    } catch (error) {
      console.error('Error starting learning path:', error);
      router.push('/app/training');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">加载中...</div>
      </div>
    );
  }

  const stats: StudyStat[] = [
    {
      label: '薄弱环节',
      value: weakAreas.length.toString(),
      icon: Target,
      color: 'text-orange-500',
    },
    {
      label: '平均掌握度',
      value: `${Math.round(weakAreas.reduce((sum, a) => sum + a.masteryLevel, 0) / weakAreas.length)}%`,
      icon: TrendingUp,
      color: 'text-blue-500',
    },
    {
      label: '推荐学习路径',
      value: learningPaths.length.toString(),
      icon: BookOpen,
      color: 'text-green-500',
    },
  ];

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return 'bg-green-100 text-green-800';
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-800';
      case 'advanced':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <button
            onClick={() => router.push('/app/training')}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            返回训练中心
          </button>
          <h1 className="text-3xl font-bold text-gray-900">自适应学习</h1>
          <p className="mt-2 text-gray-600">AI智能分析，精准提升</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <Icon className={`w-8 h-8 ${stat.color} mr-4`} />
                  <div>
                    <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                    <div className="text-sm text-gray-600">{stat.label}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <Brain className="w-5 h-5 mr-2 text-purple-500" />
              薄弱环节分析
            </h2>
            <div className="bg-white rounded-lg shadow">
              {weakAreas.map((area) => (
                <div key={area.id} className="p-6 border-b last:border-b-0">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-semibold text-gray-900">{area.name}</h3>
                      <p className="text-sm text-gray-500 mt-1">
                        错误次数: {area.errorCount} · 推荐练习: {area.recommendedQuestions}题
                      </p>
                    </div>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        area.type === 'listening'
                          ? 'bg-blue-100 text-blue-800'
                          : area.type === 'reading'
                            ? 'bg-green-100 text-green-800'
                            : area.type === 'writing'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-purple-100 text-purple-800'
                      }`}
                    >
                      {area.type === 'listening'
                        ? '听力'
                        : area.type === 'reading'
                          ? '阅读'
                          : area.type === 'writing'
                            ? '写作'
                            : '翻译'}
                    </span>
                  </div>
                  <div className="mb-2">
                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                      <span>掌握度</span>
                      <span>{area.masteryLevel}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-300 ${
                          area.masteryLevel >= 70
                            ? 'bg-green-500'
                            : area.masteryLevel >= 40
                              ? 'bg-yellow-500'
                              : 'bg-red-500'
                        }`}
                        style={{ width: `${area.masteryLevel}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <Award className="w-5 h-5 mr-2 text-yellow-500" />
              推荐学习路径
            </h2>
            <div className="space-y-4">
              {learningPaths.map((path) => (
                <div
                  key={path.id}
                  className={`bg-white rounded-lg shadow p-6 cursor-pointer transition-all ${
                    selectedPath === path.id ? 'ring-2 ring-blue-500' : 'hover:shadow-lg'
                  }`}
                  onClick={() => setSelectedPath(path.id)}
                >
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-semibold text-gray-900">{path.title}</h3>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(path.difficulty)}`}
                    >
                      {path.difficulty === 'beginner'
                        ? '初级'
                        : path.difficulty === 'intermediate'
                          ? '中级'
                          : '高级'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-4">{path.description}</p>
                  <div className="flex items-center space-x-4 mb-4 text-sm text-gray-500">
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      {path.estimatedTime}
                    </div>
                    <div className="flex items-center">
                      <BookOpen className="w-4 h-4 mr-1" />
                      {path.questionsCount}题
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {path.focusAreas.map((focus, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs"
                      >
                        {focus}
                      </span>
                    ))}
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      startLearningPath(path);
                    }}
                    className="w-full bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                  >
                    开始学习
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
