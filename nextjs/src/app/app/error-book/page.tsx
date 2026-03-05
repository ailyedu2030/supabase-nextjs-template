'use client';

import { useEffect, useState } from 'react';
import { createSPASassClient } from '@/lib/supabase/client';
import {
  AlertCircle,
  BookOpen,
  RefreshCw,
  Trash2,
  CheckCircle2,
  Calendar,
  Clock,
} from 'lucide-react';
import { ErrorQuestion as BaseErrorQuestion } from '@/lib/cet/types';

interface ErrorQuestion extends BaseErrorQuestion {
  question?: {
    id: string;
    title: string;
    content: string;
    question_type: string;
    difficulty_level: number;
  };
}

export default function ErrorBookPage() {
  const [errorQuestions, setErrorQuestions] = useState<ErrorQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'active' | 'mastered'>('all');

  useEffect(() => {
    loadErrorQuestions();
  }, [filter]);

  const loadErrorQuestions = async () => {
    try {
      const sassClient = await createSPASassClient();
      const supabase = sassClient.getSupabaseClient();

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      let query = supabase
        .from('error_questions')
        .select(`
          *,
          question:questions (*)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (filter === 'active') {
        query = query.is('mastered_at', null);
      } else if (filter === 'mastered') {
        query = query.not('mastered_at', 'is', null);
      }

      const { data } = await query;

      if (data) {
        setErrorQuestions(data as any);
      }
    } catch (error) {
      console.error('Error loading error questions:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsMastered = async (id: string) => {
    try {
      const sassClient = await createSPASassClient();
      const supabase = sassClient.getSupabaseClient();

      await supabase
        .from('error_questions')
        .update({ mastered_at: new Date().toISOString() })
        .eq('id', id);

      loadErrorQuestions();
    } catch (error) {
      console.error('Error marking as mastered:', error);
    }
  };

  const deleteErrorQuestion = async (id: string) => {
    try {
      const sassClient = await createSPASassClient();
      const supabase = sassClient.getSupabaseClient();

      await supabase.from('error_questions').delete().eq('id', id);

      loadErrorQuestions();
    } catch (error) {
      console.error('Error deleting question:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getDifficultyColor = (level: number) => {
    const colors = [
      'bg-green-100 text-green-800',
      'bg-blue-100 text-blue-800',
      'bg-yellow-100 text-yellow-800',
      'bg-orange-100 text-orange-800',
      'bg-red-100 text-red-800',
    ];
    return colors[Math.min(level - 1, 4)];
  };

  const stats = {
    total: errorQuestions.length,
    active: errorQuestions.filter((q) => !q.mastered_at).length,
    mastered: errorQuestions.filter((q) => q.mastered_at).length,
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
          <h1 className="text-3xl font-bold text-gray-900">错题本</h1>
          <p className="mt-2 text-gray-600">复习和巩固你的错题</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <AlertCircle className="h-8 w-8 text-red-500" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">总错题数</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <BookOpen className="h-8 w-8 text-yellow-500" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">待复习</p>
                <p className="text-2xl font-bold text-gray-900">{stats.active}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CheckCircle2 className="h-8 w-8 text-green-500" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">已掌握</p>
                <p className="text-2xl font-bold text-gray-900">{stats.mastered}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex space-x-4">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-lg font-medium ${filter === 'all' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              >
                全部
              </button>
              <button
                onClick={() => setFilter('active')}
                className={`px-4 py-2 rounded-lg font-medium ${filter === 'active' ? 'bg-yellow-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              >
                待复习
              </button>
              <button
                onClick={() => setFilter('mastered')}
                className={`px-4 py-2 rounded-lg font-medium ${filter === 'mastered' ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              >
                已掌握
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {errorQuestions.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <AlertCircle className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">暂无错题</h3>
              <p className="text-gray-500">继续学习，错题会自动添加到这里</p>
            </div>
          ) : (
            errorQuestions.map((errorQuestion) => (
              <div key={errorQuestion.id} className="bg-white rounded-lg shadow p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${getDifficultyColor(errorQuestion.question?.difficulty_level || 1)}`}
                      >
                        难度 {errorQuestion.question?.difficulty_level || 1}
                      </span>
                      <span className="text-sm text-gray-500 flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        {formatDate(errorQuestion.created_at)}
                      </span>
                      <span className="text-sm text-gray-500 flex items-center">
                        <RefreshCw className="h-4 w-4 mr-1" />
                        错误 {errorQuestion.error_count} 次
                      </span>
                      {errorQuestion.mastered_at && (
                        <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-medium">
                          已掌握
                        </span>
                      )}
                    </div>

                    <div className="mb-4">
                      <h4 className="font-semibold text-gray-900 mb-2">
                        {errorQuestion.question?.title || '题目'}
                      </h4>
                      <p className="text-gray-700 whitespace-pre-wrap">
                        {errorQuestion.question?.content || '题目内容'}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-red-600 mb-1">你的答案</p>
                        <p className="text-gray-700 bg-red-50 p-3 rounded">
                          {errorQuestion.user_answer}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-green-600 mb-1">正确答案</p>
                        <p className="text-gray-700 bg-green-50 p-3 rounded">
                          {errorQuestion.correct_answer}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col space-y-2 ml-4">
                    {!errorQuestion.mastered_at && (
                      <button
                        onClick={() => markAsMastered(errorQuestion.id)}
                        className="p-2 text-green-600 hover:text-green-800 hover:bg-green-50 rounded"
                        title="标记为已掌握"
                      >
                        <CheckCircle2 className="h-5 w-5" />
                      </button>
                    )}
                    <button
                      onClick={() => deleteErrorQuestion(errorQuestion.id)}
                      className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded"
                      title="删除"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                {errorQuestion.next_review_at && (
                  <div className="mt-4 pt-4 border-t">
                    <p className="text-sm text-gray-500 flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      下次复习: {formatDate(errorQuestion.next_review_at)}
                    </p>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
