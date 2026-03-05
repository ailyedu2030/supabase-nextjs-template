'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, BookOpen, AlertCircle, CheckCircle2 } from 'lucide-react';
import type { TeacherCourseCreateRequest } from '@/lib/cet/types';

export default function TeacherCourseCreate() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [formData, setFormData] = useState<TeacherCourseCreateRequest>({
    title: '',
    description: '',
    category: 'comprehensive',
    difficulty_level: 3,
    thumbnail_url: '',
    metadata: {},
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setSaving(true);

    try {
      const response = await fetch('/api/v1/teacher/courses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const data = await response.json();
        setSuccess('课程创建成功');
        setTimeout(() => {
          router.push(`/app/teacher/courses/${data.course.id}`);
        }, 1500);
      } else {
        const data = await response.json();
        setError(data.error || '创建失败');
      }
    } catch (error) {
      console.error('Error creating course:', error);
      setError('服务器错误，请稍后重试');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 顶部导航 */}
        <div className="mb-8">
          <Link
            href="/app/teacher/courses"
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            返回课程列表
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">创建课程</h1>
            <p className="mt-2 text-gray-600">创建新的课程</p>
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

        {/* 创建表单 */}
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

            {/* 操作按钮 */}
            <div className="flex items-center justify-end gap-4 border-t pt-6">
              <Link
                href="/app/teacher/courses"
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
                {saving ? '创建中...' : '创建课程'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
