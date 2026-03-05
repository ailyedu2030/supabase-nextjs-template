'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ChevronLeft,
  Calendar,
  CheckCircle2,
  Clock,
  Target,
  BookOpen,
  Trash2,
  Edit,
} from 'lucide-react';
import { createSPASassClient } from '@/lib/supabase/client';

interface StudyTask {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  type: 'listening' | 'reading' | 'writing' | 'translation' | 'vocabulary';
  duration: number;
  completed: boolean;
  priority: 'high' | 'medium' | 'low';
}

interface WeeklyGoal {
  id: string;
  title: string;
  description: string;
  target: number;
  current: number;
  unit: string;
}

export default function LearningPlanPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState<StudyTask[]>([]);
  const [weeklyGoals, setWeeklyGoals] = useState<WeeklyGoal[]>([]);

  const sampleTasks: StudyTask[] = [
    {
      id: '1',
      title: '完成听力练习',
      description: '完成20道听力理解题',
      dueDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
      type: 'listening',
      duration: 45,
      completed: false,
      priority: 'high',
    },
    {
      id: '2',
      title: '阅读理解训练',
      description: '阅读3篇文章并完成练习',
      dueDate: new Date(Date.now() + 172800000).toISOString().split('T')[0],
      type: 'reading',
      duration: 60,
      completed: true,
      priority: 'medium',
    },
    {
      id: '3',
      title: '词汇背诵',
      description: '背诵50个新单词',
      dueDate: new Date(Date.now() + 259200000).toISOString().split('T')[0],
      type: 'vocabulary',
      duration: 30,
      completed: false,
      priority: 'low',
    },
  ];

  const sampleGoals: WeeklyGoal[] = [
    {
      id: '1',
      title: '听力练习',
      description: '本周完成听力练习',
      target: 5,
      current: 3,
      unit: '套',
    },
    {
      id: '2',
      title: '阅读训练',
      description: '本周完成阅读训练',
      target: 8,
      current: 5,
      unit: '篇',
    },
    {
      id: '3',
      title: '写作练习',
      description: '本周完成写作练习',
      target: 3,
      current: 1,
      unit: '篇',
    },
  ];

  useEffect(() => {
    loadLearningPlan();
  }, []);

  const loadLearningPlan = async () => {
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

      setTasks(sampleTasks);
      setWeeklyGoals(sampleGoals);
      setLoading(false);
    } catch (error) {
      console.error('Error loading learning plan:', error);
      setTasks(sampleTasks);
      setWeeklyGoals(sampleGoals);
      setLoading(false);
    }
  };

  const toggleTaskComplete = async (taskId: string) => {
    setTasks(
      tasks.map((task) => (task.id === taskId ? { ...task, completed: !task.completed } : task))
    );
  };

  const deleteTask = async (taskId: string) => {
    setTasks(tasks.filter((task) => task.id !== taskId));
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'listening':
        return '🎧';
      case 'reading':
        return '📖';
      case 'writing':
        return '✍️';
      case 'translation':
        return '🌐';
      case 'vocabulary':
        return '📚';
      default:
        return '📝';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'border-l-red-500 bg-red-50';
      case 'medium':
        return 'border-l-yellow-500 bg-yellow-50';
      case 'low':
        return 'border-l-green-500 bg-green-50';
      default:
        return 'border-l-gray-500 bg-gray-50';
    }
  };

  const isOverdue = (dueDate: string) => {
    return new Date(dueDate) < new Date() && !tasks.find((t) => t.dueDate === dueDate)?.completed;
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
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <button
            onClick={() => router.push('/app/training')}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            返回训练中心
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">学习计划</h1>
            <p className="mt-2 text-gray-600">制定计划，高效学习</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <Calendar className="w-5 h-5 mr-2 text-blue-500" />
              学习任务
            </h2>
            <div className="space-y-4">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  className={`bg-white rounded-lg shadow p-4 border-l-4 transition-all ${getPriorityColor(
                    task.priority
                  )} ${task.completed ? 'opacity-60' : ''}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 flex-1">
                      <button
                        onClick={() => toggleTaskComplete(task.id)}
                        className={`mt-1 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                          task.completed
                            ? 'bg-green-500 border-green-500 text-white'
                            : 'border-gray-300 hover:border-blue-500'
                        }`}
                      >
                        {task.completed && <CheckCircle2 className="w-4 h-4" />}
                      </button>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <span className="text-2xl">{getTypeIcon(task.type)}</span>
                          <h3
                            className={`font-semibold text-gray-900 ${
                              task.completed ? 'line-through' : ''
                            }`}
                          >
                            {task.title}
                          </h3>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              task.priority === 'high'
                                ? 'bg-red-100 text-red-800'
                                : task.priority === 'medium'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-green-100 text-green-800'
                            }`}
                          >
                            {task.priority === 'high'
                              ? '高'
                              : task.priority === 'medium'
                                ? '中'
                                : '低'}
                            优先级
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                        <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                          <div className="flex items-center">
                            <Clock className="w-4 h-4 mr-1" />
                            {task.duration}分钟
                          </div>
                          <div
                            className={`flex items-center ${
                              isOverdue(task.dueDate) && !task.completed ? 'text-red-600' : ''
                            }`}
                          >
                            <Calendar className="w-4 h-4 mr-1" />
                            截止: {task.dueDate}
                            {isOverdue(task.dueDate) && !task.completed && (
                              <span className="ml-2 text-red-600 text-xs">(已逾期)</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
                      <button className="text-gray-400 hover:text-gray-600">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteTask(task.id)}
                        className="text-gray-400 hover:text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <Target className="w-5 h-5 mr-2 text-purple-500" />
              本周目标
            </h2>
            <div className="bg-white rounded-lg shadow p-6">
              {weeklyGoals.map((goal) => {
                const progress = (goal.current / goal.target) * 100;
                return (
                  <div key={goal.id} className="mb-6 last:mb-0">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-semibold text-gray-900">{goal.title}</h3>
                      <span className="text-sm text-gray-600">
                        {goal.current} / {goal.target} {goal.unit}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mb-3">{goal.description}</p>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className={`h-3 rounded-full transition-all duration-300 ${
                          progress >= 100
                            ? 'bg-green-500'
                            : progress >= 50
                              ? 'bg-blue-500'
                              : 'bg-yellow-500'
                        }`}
                        style={{ width: `${Math.min(progress, 100)}%` }}
                      />
                    </div>
                    <div className="text-right text-xs text-gray-500 mt-1">
                      {Math.round(progress)}% 完成
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-6 bg-white rounded-lg shadow p-6">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                <BookOpen className="w-5 h-5 mr-2 text-green-500" />
                今日统计
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">已完成任务</span>
                  <span className="font-bold text-gray-900">
                    {tasks.filter((t) => t.completed).length}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">待完成任务</span>
                  <span className="font-bold text-gray-900">
                    {tasks.filter((t) => !t.completed).length}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">学习时长</span>
                  <span className="font-bold text-gray-900">
                    {tasks.filter((t) => t.completed).reduce((sum, t) => sum + t.duration, 0)}分钟
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
