'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/cet/auth';
import { createSPAClient } from '@/lib/supabase/client';
import { TeachingSyllabus, Course } from '@/lib/cet/types';

export default function SyllabiPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [syllabi, setSyllabi] = useState<TeachingSyllabus[]>([]);
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

      // Load syllabi
      let query = (supabase as any)
        .from('teaching_syllabi')
        .select('*, courses(*)')
        .eq('teacher_id', user?.id)
        .order('created_at', { ascending: false });

      if (filterCourse !== 'all') {
        query = query.eq('course_id', filterCourse);
      }

      if (filterStatus !== 'all') {
        query = query.eq('status', filterStatus);
      }

      const { data: syllabiData, error: syllabiError } = await query;
      if (syllabiError) throw syllabiError;
      setSyllabi((syllabiData || []) as any);

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
          <h1 className="text-3xl font-bold text-gray-900">教学大纲管理</h1>
          <div className="flex gap-3">
            <Link
              href="/app/teacher/syllabi/generate"
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              AI生成大纲
            </Link>
            <Link
              href="/app/teacher/syllabi/create"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              创建大纲
            </Link>
          </div>
        </div>
        <p className="text-gray-600">管理和生成课程教学大纲</p>
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

      {/* Syllabi List */}
      <div className="space-y-4">
        {syllabi.map((syllabus) => (
          <div key={syllabus.id} className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span
                    className={`px-3 py-1 rounded text-sm ${
                      syllabus.status === 'published'
                        ? 'bg-green-100 text-green-800'
                        : syllabus.status === 'draft'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {syllabus.status === 'published'
                      ? '已发布'
                      : syllabus.status === 'draft'
                        ? '草稿'
                        : '已归档'}
                  </span>
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded text-sm">
                    v{syllabus.version}
                  </span>
                  <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded text-sm">
                    {syllabus.academic_year} {syllabus.semester}
                  </span>
                  {syllabus.is_public && (
                    <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded text-sm">
                      公开
                    </span>
                  )}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{syllabus.title}</h3>
                {syllabus.description && (
                  <p className="text-gray-600 mb-2">{syllabus.description}</p>
                )}
                <div className="text-sm text-gray-500">
                  课程目标：{syllabus.course_objectives?.length || 0}个 · 教学模块：
                  {syllabus.course_content?.length || 0}个
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Link
                href={`/app/teacher/syllabi/${syllabus.id}`}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
              >
                查看详情
              </Link>
              <Link
                href={`/app/teacher/syllabi/${syllabus.id}/edit`}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 text-sm"
              >
                编辑
              </Link>
            </div>
          </div>
        ))}

        {syllabi.length === 0 && (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <p className="text-gray-600 text-lg">暂无教学大纲</p>
            <p className="text-gray-500 mt-2">创建或使用AI生成你的第一个教学大纲</p>
            <div className="mt-6 flex justify-center gap-4">
              <Link
                href="/app/teacher/syllabi/generate"
                className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                AI生成大纲
              </Link>
              <Link
                href="/app/teacher/syllabi/create"
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                创建大纲
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
