'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Search,
  Filter,
  BookOpen,
  Edit,
  Eye,
  Plus,
  Trash2,
  CheckCircle2,
  UploadCloud,
} from 'lucide-react';
import type { Course } from '@/lib/cet/types';
import type { TeacherCourseListResponse } from '@/lib/cet/types';

interface CourseWithTeacher extends Course {
  profiles?: { username: string; email: string };
}

export default function TeacherCourses() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState<CourseWithTeacher[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 1 });
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [publishingId, setPublishingId] = useState<string | null>(null);

  useEffect(() => {
    loadCourses();
  }, [page, selectedCategory, selectedStatus]);

  const loadCourses = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
      });
      if (selectedCategory !== 'all') {
        params.set('category', selectedCategory);
      }
      if (selectedStatus !== 'all') {
        params.set('status', selectedStatus);
      }
      if (searchQuery) {
        params.set('search', searchQuery);
      }

      const response = await fetch(`/api/v1/teacher/courses?${params.toString()}`);
      if (response.ok) {
        const data: TeacherCourseListResponse = await response.json();
        setCourses(data.courses);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error('Error loading courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    loadCourses();
  };

  const handleDelete = async (courseId: string) => {
    if (!confirm('确定要删除这个课程吗？此操作不可恢复。')) {
      return;
    }

    try {
      setDeletingId(courseId);
      const response = await fetch(`/api/v1/teacher/courses/${courseId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        loadCourses();
      } else {
        alert('删除失败，请稍后重试');
      }
    } catch (error) {
      console.error('Error deleting course:', error);
      alert('删除失败，请稍后重试');
    } finally {
      setDeletingId(null);
    }
  };

  const handlePublish = async (courseId: string) => {
    try {
      setPublishingId(courseId);
      const response = await fetch(`/api/v1/teacher/courses/${courseId}/publish`, {
        method: 'POST',
      });

      if (response.ok) {
        loadCourses();
      } else {
        const data = await response.json();
        alert(data.error || '发布失败，请稍后重试');
      }
    } catch (error) {
      console.error('Error publishing course:', error);
      alert('发布失败，请稍后重试');
    } finally {
      setPublishingId(null);
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      case 'published':
        return 'bg-green-100 text-green-800';
      case 'archived':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
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

  const getDifficultyText = (level?: number) => {
    if (!level) return '未设置';
    if (level <= 2) return '初级';
    if (level <= 4) return '中级';
    return '高级';
  };

  const getDifficultyColor = (level?: number) => {
    if (!level) return 'text-gray-500';
    if (level <= 2) return 'text-green-600';
    if (level <= 4) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (loading && !courses.length) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">我的课程</h1>
            <p className="mt-2 text-gray-600">管理和创建您的课程</p>
          </div>
          <Link
            href="/app/teacher/courses/create"
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" />
            创建课程
          </Link>
        </div>

        {/* 搜索和筛选 */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <form onSubmit={handleSearch} className="flex-1 flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="搜索课程标题或描述..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                搜索
              </button>
            </form>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Filter className="w-5 h-5 text-gray-400" />
                <select
                  value={selectedCategory}
                  onChange={(e) => {
                    setSelectedCategory(e.target.value);
                    setPage(1);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">全部分类</option>
                  <option value="listening">听力训练</option>
                  <option value="reading">阅读理解</option>
                  <option value="writing">写作训练</option>
                  <option value="translation">翻译练习</option>
                  <option value="comprehensive">综合训练</option>
                </select>
              </div>
              <select
                value={selectedStatus}
                onChange={(e) => {
                  setSelectedStatus(e.target.value);
                  setPage(1);
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">全部状态</option>
                <option value="draft">草稿</option>
                <option value="published">已发布</option>
                <option value="archived">已归档</option>
              </select>
            </div>
          </div>
        </div>

        {/* 课程列表 */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    课程
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    分类
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    难度
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    状态
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    注册数
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    创建时间
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {courses.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                      暂无课程
                    </td>
                  </tr>
                ) : (
                  courses.map((course) => (
                    <tr key={course.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0">
                            {course.thumbnail_url ? (
                              <img
                                className="h-12 w-16 rounded object-cover"
                                src={course.thumbnail_url}
                                alt=""
                              />
                            ) : (
                              <div className="h-12 w-16 rounded bg-gray-200 flex items-center justify-center">
                                <BookOpen className="h-6 w-6 text-gray-500" />
                              </div>
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{course.title}</div>
                            {course.description && (
                              <div className="text-sm text-gray-500 line-clamp-1">
                                {course.description}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                          {getCategoryText(course.category as any)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`text-sm font-medium ${getDifficultyColor(course.difficulty_level as any)}`}
                        >
                          {getDifficultyText(course.difficulty_level as any)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(course.status)}`}
                        >
                          {getStatusText(course.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {course.enrollment_count}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(course.created_at).toLocaleDateString('zh-CN')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center gap-3">
                          <Link
                            href={`/app/teacher/courses/${course.id}`}
                            className="text-blue-600 hover:text-blue-900 flex items-center"
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            查看
                          </Link>
                          <Link
                            href={`/app/teacher/courses/${course.id}/edit`}
                            className="text-orange-600 hover:text-orange-900 flex items-center"
                          >
                            <Edit className="w-4 h-4 mr-1" />
                            编辑
                          </Link>
                          {course.status === 'draft' && (
                            <button
                              onClick={() => handlePublish(course.id)}
                              disabled={publishingId === course.id}
                              className="text-green-600 hover:text-green-900 flex items-center disabled:opacity-50"
                            >
                              <UploadCloud className="w-4 h-4 mr-1" />
                              {publishingId === course.id ? '发布中...' : '发布'}
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(course.id)}
                            disabled={deletingId === course.id}
                            className="text-red-600 hover:text-red-900 flex items-center disabled:opacity-50"
                          >
                            <Trash2 className="w-4 h-4 mr-1" />
                            {deletingId === course.id ? '删除中...' : '删除'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* 分页 */}
          {pagination.totalPages > 1 && (
            <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  显示第 <span className="font-medium">{(page - 1) * pagination.limit + 1}</span> 到{' '}
                  <span className="font-medium">
                    {Math.min(page * pagination.limit, pagination.total)}
                  </span>{' '}
                  条，共 <span className="font-medium">{pagination.total}</span> 条
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPage(Math.max(1, page - 1))}
                    disabled={page <= 1}
                    className="px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-50"
                  >
                    上一页
                  </button>
                  {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                    const pageNum = i + 1;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setPage(pageNum)}
                        className={`px-3 py-2 rounded-lg ${
                          page === pageNum
                            ? 'bg-blue-600 text-white'
                            : 'border border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  <button
                    onClick={() => setPage(Math.min(pagination.totalPages, page + 1))}
                    disabled={page >= pagination.totalPages}
                    className="px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-50"
                  >
                    下一页
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
