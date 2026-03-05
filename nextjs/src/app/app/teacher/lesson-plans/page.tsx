'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/cet/auth';
import { createSPAClient } from '@/lib/supabase/client';
import { LessonPlan, Course } from '@/lib/cet/types';

export default function LessonPlansPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [lessonPlans, setLessonPlans] = useState<LessonPlan[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterCourse, setFilterCourse] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'draft' | 'published' | 'archived'>(
    'all'
  );

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/signin');
      return;
    }

    if (user) {
      loadData();
    }
  }, [user, authLoading, router]);

  const loadData = async () => {
    try {
      setLoading(true);
      const supabase = createSPAClient();

      // Load lesson plans
      let query = (supabase as any)
        .from('lesson_plans')
        .select('*, courses(*)')
        .eq('teacher_id', user?.id)
        .order('created_at', { ascending: false });

      if (filterCourse !== 'all') {
        query = query.eq('course_id', filterCourse);
      }

      if (filterStatus !== 'all') {
        query = query.eq('status', filterStatus);
      }

      const { data: plans, error: plansError } = await query;
      if (plansError) throw plansError;
      setLessonPlans((plans || []) as any);

      // Load courses
      const { data: coursesData, error: coursesError } = await (supabase as any)
        .from('courses')
        .select('*')
        .eq('teacher_id', user?.id)
        .order('created_at', { ascending: false });

      if (coursesError) throw coursesError;
      setCourses(coursesData || []);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = () => {
    loadData();
  };

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex justify-between items-center mb-2">
          <h1 className="text-3xl font-bold text-gray-900">教案管理</h1>
          <div className="flex gap-3">
            <Link
              href="/app/teacher/lesson-plans/generate"
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              AI生成教案
            </Link>
            <Link
              href="/app/teacher/lesson-plans/create"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              创建教案
            </Link>
          </div>
        </div>
        <p className="text-gray-600">管理和生成课程教案</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex flex-wrap gap-4 items-center">
          <select
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            value={filterCourse}
            onChange={(e) => setFilterCourse(e.target.value as any)}
          >
            <option value="all">所有课程</option>
            {courses.map((course) => (
              <option key={course.id} value={course.id}>
                {course.title}
              </option>
            ))}
          </select>
          <select
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
          >
            <option value="all">所有状态</option>
            <option value="draft">草稿</option>
            <option value="published">已发布</option>
            <option value="archived">已归档</option>
          </select>
          <button
            onClick={handleFilterChange}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            筛选
          </button>
        </div>
      </div>

      {/* Lesson Plans List */}
      <div className="space-y-4">
        {lessonPlans.map((plan) => (
          <div key={plan.id} className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span
                    className={`px-3 py-1 rounded text-sm ${
                      plan.status === 'published'
                        ? 'bg-green-100 text-green-800'
                        : plan.status === 'draft'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {plan.status === 'published'
                      ? '已发布'
                      : plan.status === 'draft'
                        ? '草稿'
                        : '已归档'}
                  </span>
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded text-sm">
                    v{plan.version}
                  </span>
                  {plan.is_public && (
                    <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded text-sm">
                      公开
                    </span>
                  )}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{plan.title}</h3>
                {plan.description && <p className="text-gray-600 mb-2">{plan.description}</p>}
                <div className="text-sm text-gray-500">
                  教学目标：{plan.teaching_objectives?.length || 0}个 · 教学步骤：
                  {plan.teaching_procedures?.length || 0}个
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Link
                href={`/app/teacher/lesson-plans/${plan.id}`}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
              >
                查看详情
              </Link>
              <Link
                href={`/app/teacher/lesson-plans/${plan.id}/edit`}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 text-sm"
              >
                编辑
              </Link>
            </div>
          </div>
        ))}

        {lessonPlans.length === 0 && (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <p className="text-gray-600 text-lg">暂无教案</p>
            <p className="text-gray-500 mt-2">创建或使用AI生成你的第一个教案</p>
            <div className="mt-6 flex justify-center gap-4">
              <Link
                href="/app/teacher/lesson-plans/generate"
                className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                AI生成教案
              </Link>
              <Link
                href="/app/teacher/lesson-plans/create"
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                创建教案
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
