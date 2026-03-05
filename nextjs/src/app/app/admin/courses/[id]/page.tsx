'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { BookOpen, Calendar, Users, Edit, ArrowLeft, Award, CheckCircle2 } from 'lucide-react';
import type { Course } from '@/lib/cet/types';
import type { AdminCourseDetailResponse } from '@/lib/cet/types';

interface CourseWithTeacher extends Course {
  teacher?: {
    username: string;
    email: string;
    teacher_profiles?: { real_name?: string; department?: string; title?: string };
  };
  classes?: Array<{
    id: string;
    name: string;
    status: string;
    max_students: number;
  }>;
}

export default function AdminCourseDetail() {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [courseData, setCourseData] = useState<AdminCourseDetailResponse | null>(null);

  const courseId = params.id as string;

  useEffect(() => {
    loadCourseDetail();
  }, [courseId]);

  const loadCourseDetail = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/v1/admin/courses/${courseId}`);
      if (response.ok) {
        const data: AdminCourseDetailResponse = await response.json();
        setCourseData(data);
      } else if (response.status === 404) {
        alert('课程不存在');
        router.push('/app/admin/courses');
      }
    } catch (error) {
      console.error('Error loading course detail:', error);
    } finally {
      setLoading(false);
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

  const getCategoryText = (category: string | null) => {
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

  const getDifficultyText = (level: number | null) => {
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

  const getClassStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return '进行中';
      case 'completed':
        return '已完成';
      case 'archived':
        return '已归档';
      default:
        return status;
    }
  };

  const getClassStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'archived':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
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

  const { course, recentEnrollments } = courseData;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 顶部导航 */}
        <div className="mb-8">
          <button
            onClick={() => router.push('/app/admin/courses')}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            返回课程列表
          </button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">课程详情</h1>
              <p className="mt-2 text-gray-600">查看和管理课程信息</p>
            </div>
            <Link
              href={`/app/admin/courses/${course.id}/edit`}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
            >
              <Edit className="w-4 h-4 mr-2" />
              编辑课程
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 课程信息卡片 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 课程基本信息 */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b">
                <h2 className="text-xl font-semibold flex items-center">
                  <BookOpen className="w-5 h-5 mr-2 text-gray-500" />
                  课程信息
                </h2>
              </div>
              <div className="p-6">
                <div className="flex items-start space-x-6 mb-6">
                  <div className="flex-shrink-0">
                    {course.thumbnail_url ? (
                      <img
                        className="h-32 w-48 rounded object-cover"
                        src={course.thumbnail_url}
                        alt=""
                      />
                    ) : (
                      <div className="h-32 w-48 rounded bg-gray-200 flex items-center justify-center">
                        <BookOpen className="h-12 w-12 text-gray-500" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-gray-900">{course.title}</h3>
                    {course.description && (
                      <p className="text-gray-600 mt-2">{course.description}</p>
                    )}
                    <div className="flex items-center gap-3 mt-4">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${getCategoryText(course.category) === '听力训练' ? 'bg-blue-100 text-blue-800' : getCategoryText(course.category) === '阅读理解' ? 'bg-green-100 text-green-800' : getCategoryText(course.category) === '写作训练' ? 'bg-purple-100 text-purple-800' : getCategoryText(course.category) === '翻译练习' ? 'bg-orange-100 text-orange-800' : 'bg-gray-100 text-gray-800'}`}
                      >
                        {getCategoryText(course.category)}
                      </span>
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(course.status)}`}
                      >
                        {getStatusText(course.status)}
                      </span>
                      <span
                        className={`text-sm font-medium ${getDifficultyColor(course.difficulty_level as any)}`}
                      >
                        {getDifficultyText(course.difficulty_level)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t pt-6">
                  <div>
                    <span className="text-sm text-gray-500">创建时间</span>
                    <p className="font-medium flex items-center">
                      <Calendar className="w-4 h-4 mr-2" />
                      {new Date(course.created_at).toLocaleString('zh-CN')}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">注册人数</span>
                    <p className="font-medium flex items-center">
                      <Users className="w-4 h-4 mr-2" />
                      {course.enrollment_count} 人
                    </p>
                  </div>
                  {course.teacher && (
                    <div className="md:col-span-2">
                      <span className="text-sm text-gray-500">授课教师</span>
                      <p className="font-medium">
                        {course.teacher.teacher_profiles?.real_name || course.teacher.username}
                        {course.teacher.teacher_profiles?.department && (
                          <span className="text-gray-500 ml-2">
                            ({course.teacher.teacher_profiles.department})
                          </span>
                        )}
                        {course.teacher.teacher_profiles?.title && (
                          <span className="text-gray-500 ml-2">
                            · {course.teacher.teacher_profiles.title}
                          </span>
                        )}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* 关联班级 */}
            {course.classes && course.classes.length > 0 && (
              <div className="bg-white rounded-lg shadow">
                <div className="p-6 border-b">
                  <h2 className="text-xl font-semibold flex items-center">
                    <Users className="w-5 h-5 mr-2 text-gray-500" />
                    关联班级
                  </h2>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {course.classes.map((cls) => (
                      <div
                        key={cls.id}
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div>
                          <h4 className="font-medium">{cls.name}</h4>
                          <p className="text-sm text-gray-500">最多 {cls.max_students} 人</p>
                        </div>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getClassStatusColor(cls.status)}`}
                        >
                          {getClassStatusText(cls.status)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* 最近注册 */}
            {recentEnrollments && recentEnrollments.length > 0 && (
              <div className="bg-white rounded-lg shadow">
                <div className="p-6 border-b">
                  <h2 className="text-xl font-semibold flex items-center">
                    <Award className="w-5 h-5 mr-2 text-gray-500" />
                    最近注册
                  </h2>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {recentEnrollments.map((enrollment) => (
                      <div
                        key={enrollment.id}
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div>
                          <h4 className="font-medium">{enrollment.student_name || '学生'}</h4>
                          <p className="text-sm text-gray-500">
                            {new Date(enrollment.enrolled_at).toLocaleString('zh-CN')}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{enrollment.progress}%</p>
                          <p className="text-xs text-gray-500">完成度</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 侧边栏 - 快速操作 */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b">
                <h2 className="text-lg font-semibold">快速操作</h2>
              </div>
              <div className="p-6 space-y-3">
                <Link
                  href={`/app/admin/courses/${course.id}/edit`}
                  className="block w-full text-center p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  编辑课程信息
                </Link>
                <button className="w-full text-center p-3 border border-gray-300 rounded-lg hover:bg-gray-50">
                  发布课程
                </button>
                <button className="w-full text-center p-3 border border-gray-300 rounded-lg hover:bg-gray-50">
                  归档课程
                </button>
              </div>
            </div>

            {/* 统计卡片 */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b">
                <h2 className="text-lg font-semibold">课程统计</h2>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <span className="text-sm text-gray-500">注册人数</span>
                  <p className="text-2xl font-bold text-blue-600">{course.enrollment_count}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">班级数</span>
                  <p className="text-2xl font-bold text-green-600">{course.classes?.length || 0}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">状态</span>
                  <p className="text-lg font-medium">{getStatusText(course.status)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
