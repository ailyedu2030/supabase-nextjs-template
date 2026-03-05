'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/cet/auth';
import { createSPAClient } from '@/lib/supabase/client';
import { TeachingSyllabus } from '@/lib/cet/types';

export default function SyllabusDetailPage() {
  const { user, loading: authLoading } = useAuth();
  const params = useParams();
  const router = useRouter();
  const [syllabus, setSyllabus] = useState<TeachingSyllabus | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/signin');
      return;
    }

    if (user && params.id) {
      loadSyllabus();
    }
  }, [user, authLoading, params.id, router]);

  const loadSyllabus = async () => {
    try {
      setLoading(true);
      const supabase = createSPAClient();

      const { data, error } = await supabase
        .from('teaching_syllabi')
        .select('*, courses(*)')
        .eq('id', params.id as any)
        .single();

      if (error) throw error;
      setSyllabus(data as any);
    } catch (error) {
      console.error('Error loading syllabus:', error);
      router.push('/app/teacher/syllabi');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (newStatus: any) => {
    if (!syllabus) return;

    try {
      setUpdating(true);
      const supabase = createSPAClient();

      const { data, error } = await (supabase as any)
        .update({
          status: newStatus,
          updated_at: new Date().toISOString(),
        })
        .eq('id', params.id as any)
        .eq('teacher_id', user?.id as any)
        .select('*, courses(*)')
        .single();

      if (error) throw error;
      setSyllabus(data as any);
    } catch (error) {
      console.error('Error updating status:', error);
    } finally {
      setUpdating(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!syllabus) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p>教学大纲不存在</p>
        <Link href="/app/teacher/syllabi" className="text-blue-600 hover:underline">
          返回教学大纲管理
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link
          href="/app/teacher/syllabi"
          className="text-blue-600 hover:underline flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          返回教学大纲管理
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-8">
        <div className="flex justify-between items-start mb-6">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span
                className={`px-3 py-1 rounded ${
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
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded">
                v{syllabus.version}
              </span>
              <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded">
                {syllabus.academic_year} {syllabus.semester}
              </span>
              {syllabus.is_public && (
                <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded">公开</span>
              )}
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{syllabus.title}</h1>
            {syllabus.description && (
              <p className="text-gray-600 text-lg">{syllabus.description}</p>
            )}
          </div>
        </div>

        {/* Course Objectives */}
        {syllabus.course_objectives && syllabus.course_objectives.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">课程目标</h2>
            <ul className="space-y-2">
              {syllabus.course_objectives.map((objective, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold mt-1">•</span>
                  <span className="text-gray-700">{objective}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Course Content */}
        {syllabus.course_content && syllabus.course_content.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">课程内容</h2>
            <div className="space-y-4">
              {(syllabus.course_content as any[]).map((module) => (
                <div key={module.module} className="bg-gray-50 rounded-lg p-6">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-lg font-semibold text-gray-900">
                      模块 {module.module}: {module.title}
                    </h3>
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded text-sm">
                      {module.hours} 学时
                    </span>
                  </div>
                  <p className="text-gray-700 mb-4">{module.description}</p>

                  {module.key_points && module.key_points.length > 0 && (
                    <div className="mb-3">
                      <h4 className="font-medium text-gray-900 mb-2">重点</h4>
                      <ul className="space-y-1">
                        {module.key_points.map((point: string, i: number) => (
                          <li key={i} className="text-sm text-green-700 flex items-start gap-1">
                            <span>✓</span>
                            <span>{point}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {module.difficulties && module.difficulties.length > 0 && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">难点</h4>
                      <ul className="space-y-1">
                        {module.difficulties.map((diff: string, i: number) => (
                          <li key={i} className="text-sm text-orange-700 flex items-start gap-1">
                            <span>★</span>
                            <span>{diff}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Teaching Methods */}
        {syllabus.teaching_methods && syllabus.teaching_methods.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">教学方法</h2>
            <div className="flex flex-wrap gap-2">
              {syllabus.teaching_methods.map((method, index) => (
                <span key={index} className="px-4 py-2 bg-blue-100 text-blue-800 rounded-lg">
                  {method}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Assessment Methods */}
        {syllabus.assessment_methods && syllabus.assessment_methods.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">考核方式</h2>
            <div className="space-y-3">
              {(syllabus.assessment_methods as any[]).map((method, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center bg-gray-50 rounded-lg p-4"
                >
                  <div>
                    <h4 className="font-medium text-gray-900">{method.type}</h4>
                    <p className="text-sm text-gray-600">{method.description}</p>
                  </div>
                  <span className="px-4 py-2 bg-purple-100 text-purple-800 rounded-lg font-bold">
                    {method.weight}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Textbooks */}
        {syllabus.textbooks && syllabus.textbooks.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">教材</h2>
            <ul className="space-y-2">
              {syllabus.textbooks.map((book, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-green-600 font-bold mt-1">📚</span>
                  <span className="text-gray-700">{book}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Reference Materials */}
        {syllabus.reference_materials && syllabus.reference_materials.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">参考资料</h2>
            <ul className="space-y-2">
              {syllabus.reference_materials.map((material, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold mt-1">📖</span>
                  <span className="text-gray-700">{material}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Teaching Progress */}
        {syllabus.teaching_progress && syllabus.teaching_progress.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">教学进度</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      周次
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      日期
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      内容
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      学时
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {(syllabus.teaching_progress as any[]).map((item) => (
                    <tr key={item.week}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        第{item.week}周
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {item.date}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{item.content}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {item.hours}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Status Update */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">更新状态</h3>
          <div className="flex gap-3">
            <button
              onClick={() => updateStatus('draft')}
              disabled={updating || syllabus.status === 'draft'}
              className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:opacity-50"
            >
              设为草稿
            </button>
            <button
              onClick={() => updateStatus('published')}
              disabled={updating || syllabus.status === 'published'}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              发布
            </button>
            <button
              onClick={() => updateStatus('archived')}
              disabled={updating || syllabus.status === 'archived'}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50"
            >
              归档
            </button>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Link
            href={`/app/teacher/syllabi/${syllabus.id}/edit`}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
          >
            编辑大纲
          </Link>
        </div>
      </div>
    </div>
  );
}
