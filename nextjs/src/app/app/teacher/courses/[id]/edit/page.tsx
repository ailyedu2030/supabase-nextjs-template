'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, BookOpen, AlertCircle, CheckCircle2 } from 'lucide-react';
import type { Course } from '@/lib/cet/types';
import type { AdminCourseDetailResponse, TeacherCourseUpdateRequest } from '@/lib/cet/types';

export default function TeacherCourseEdit() {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [courseData, setCourseData] = useState<Course | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [formData, setFormData] = useState<TeacherCourseUpdateRequest>({
    title: '',
    description: '',
    category: 'comprehensive',
    difficulty_level: 3,
    status: 'draft',
    thumbnail_url: '',
    metadata: {},
  });

  const courseId = params.id as string;

  useEffect(() => {
    loadCourseDetail();
  }, [courseId]);

  const loadCourseDetail = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/v1/teacher/courses/${courseId}`);
      if (response.ok) {
        const data: AdminCourseDetailResponse = await response.json();
        setCourseData(data.course);
        setFormData({
          title: data.course.title,
          description: data.course.description || '',
          category: data.course.category,
          difficulty_level: data.course.difficulty_level || 3,
          status: data.course.status as 'draft' | 'published' | 'archived',
          thumbnail_url: data.course.thumbnail_url || '',
          metadata: data.course.metadata || {},
        });
      } else if (response.status === 404) {
        setError('课程不存在');
        router.push('/app/teacher/courses');
      }
    } catch (error) {
      console.error('Error loading course detail:', error);
      setError('加载课程信息失败');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setSaving(true);

    try {
      const response = await fetch(`/api/v1/teacher/courses/${courseId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setSuccess('课程信息已更新');
        setTimeout(() => {
          router.push(`/app/teacher/courses/${courseId}`);
        }, 1500);
      } else {
        const data = await response.json();
        setError(data.error || '更新失败');
      }
    } catch (error) {
      console.error('Error updating course:', error);
      setError('服务器错误，请稍后重试');
    } finally {
      setSaving(false);
    }
  };

  const getCategoryText = (category: string) => {
    switch (category) {
      case 'listening':
        return '听力训练';
      case 'reading':
        return '阅读理解';
      case 'writing':
        return '写作训练';
      case 'translation':
        return '翻译练习';
      case 'comprehensive':
        return '综合训练';
      default:
        return category;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'draft':
        return '草稿';
      case 'published':
        return '已发布';
      case 'archived':
        return '已归档';
      default:
        return status;
    }
  };

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

  if (!courseData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">课程不存在</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 顶部导航 */}
        <div className="mb-8">
          <Link
            href={`/app/teacher/courses/${courseId}`}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            返回课程详情
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">编辑课程</h1>
            <p className="mt-2 text-gray-600">编辑课程：{courseData.title}</p>
          </div>
        </div>

        {/* 成功/错误提示 */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center">
            <AlertCircle className="w-5 h-5 text-red-400 mr-2" />
            <span className="text-red-700">{error}</span>
          </div>
        )}
        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center">
            <CheckCircle2 className="w-5 h-5 text-green-400 mr-2" />
            <span className="text-green-700">{success}</span>
          </div>
        )}

        {/* 编辑表单 */}
        <div className="bg-white rounded-lg shadow">
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* 基本信息 */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <BookOpen className="w-5 h-5 mr-2 text-gray-500" />
                基本信息
              </h2>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    课程标题 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="输入课程标题"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">课程描述</label>
                  <textarea
                    value={formData.description || ''}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="输入课程描述..."
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      课程分类 <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.category as any}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="listening">听力训练</option>
                      <option value="reading">阅读理解</option>
                      <option value="writing">写作训练</option>
                      <option value="translation">翻译练习</option>
                      <option value="comprehensive">综合训练</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      难度等级 <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.difficulty_level as any}
                      onChange={(e) =>
                        setFormData({ ...formData, difficulty_level: parseInt(e.target.value) })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value={1}>1 - 入门</option>
                      <option value={2}>2 - 初级</option>
                      <option value={3}>3 - 中级</option>
                      <option value={4}>4 - 中高级</option>
                      <option value={5}>5 - 高级</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">缩略图URL</label>
                  <input
                    type="url"
                    value={formData.thumbnail_url || ''}
                    onChange={(e) => setFormData({ ...formData, thumbnail_url: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="https://example.com/thumbnail.jpg"
                  />
                </div>
              </div>
            </div>

            {/* 课程状态 */}
            <div className="border-t pt-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">课程状态</h2>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  状态 <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      status: e.target.value as 'draft' | 'published' | 'archived',
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="draft">草稿</option>
                  <option value="published">已发布</option>
                  <option value="archived">已归档</option>
                </select>
              </div>
            </div>

            {/* 只读信息 */}
            <div className="border-t pt-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">只读信息</h2>
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">创建时间</span>
                  <span className="text-sm font-medium">
                    {new Date(courseData.created_at).toLocaleString('zh-CN')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">注册人数</span>
                  <span className="text-sm font-medium">{courseData.enrollment_count}</span>
                </div>
              </div>
            </div>

            {/* 操作按钮 */}
            <div className="flex items-center justify-end gap-4 border-t pt-6">
              <Link
                href={`/app/teacher/courses/${courseId}`}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                取消
              </Link>
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center"
              >
                <Save className="w-4 h-4 mr-2" />
                {saving ? '保存中...' : '保存更改'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
