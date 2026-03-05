'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/cet/auth';
import { createSPAClient } from '@/lib/supabase/client';
import { LessonPlan } from '@/lib/cet/types';

export default function LessonPlanDetailPage() {
  const { user, loading: authLoading } = useAuth();
  const params = useParams();
  const router = useRouter();
  const [lessonPlan, setLessonPlan] = useState<LessonPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/signin');
      return;
    }

    if (user && params.id) {
      loadLessonPlan();
    }
  }, [user, authLoading, params.id, router]);

  const loadLessonPlan = async () => {
    try {
      setLoading(true);
      const supabase = createSPAClient();

      const { data, error } = await (supabase as any)
        .from('lesson_plans')
        .select('*, courses(*)')
        .eq('id', params.id as any)
        .single();

      if (error) throw error;
      setLessonPlan(data as any);
    } catch (error) {
      console.error('Error loading lesson plan:', error);
      router.push('/app/teacher/lesson-plans');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (newStatus: any) => {
    if (!lessonPlan) return;

    try {
      setUpdating(true);
      const supabase = createSPAClient();

      const { data, error } = await (supabase as any)
        .from('lesson_plans')
        .update({
          status: newStatus,
          version: typeof lessonPlan.version === 'number' ? lessonPlan.version + 1 : 1,
          updated_at: new Date().toISOString(),
        })
        .eq('id', params.id as any)
        .eq('teacher_id', user?.id as any)
        .select('*, courses(*)')
        .single();

      if (error) throw error;
      setLessonPlan(data as any);
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

  if (!lessonPlan) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p>教案不存在</p>
        <Link href="/app/teacher/lesson-plans" className="text-blue-600 hover:underline">
          返回教案管理
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link
          href="/app/teacher/lesson-plans"
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
          返回教案管理
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-8">
        <div className="flex justify-between items-start mb-6">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span
                className={`px-3 py-1 rounded ${
                  lessonPlan.status === 'published'
                    ? 'bg-green-100 text-green-800'
                    : lessonPlan.status === 'draft'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-gray-100 text-gray-800'
                }`}
              >
                {lessonPlan.status === 'published'
                  ? '已发布'
                  : lessonPlan.status === 'draft'
                    ? '草稿'
                    : '已归档'}
              </span>
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded">
                v{lessonPlan.version}
              </span>
              {lessonPlan.is_public && (
                <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded">公开</span>
              )}
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{lessonPlan.title}</h1>
            {lessonPlan.description && (
              <p className="text-gray-600 text-lg">{lessonPlan.description}</p>
            )}
          </div>
        </div>

        {/* Teaching Objectives */}
        {lessonPlan.teaching_objectives && lessonPlan.teaching_objectives.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">教学目标</h2>
            <ul className="space-y-2">
              {lessonPlan.teaching_objectives.map((objective, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold mt-1">•</span>
                  <span className="text-gray-700">{objective}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Teaching Procedures */}
        {lessonPlan.teaching_procedures && lessonPlan.teaching_procedures.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">教学步骤</h2>
            <div className="space-y-4">
              {lessonPlan.teaching_procedures.map((procedure) => (
                <div key={procedure.step} className="bg-gray-50 rounded-lg p-6">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-lg font-semibold text-gray-900">
                      步骤 {procedure.step}: {procedure.title}
                    </h3>
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded text-sm">
                      {procedure.duration} 分钟
                    </span>
                  </div>
                  <p className="text-gray-700 whitespace-pre-wrap">
                    {procedure.content || procedure.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Teaching Methods */}
        {lessonPlan.teaching_methods && lessonPlan.teaching_methods.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">教学方法</h2>
            <div className="flex flex-wrap gap-2">
              {lessonPlan.teaching_methods.map((method, index) => (
                <span key={index} className="px-4 py-2 bg-blue-100 text-blue-800 rounded-lg">
                  {method}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Materials */}
        {Array.isArray(lessonPlan.materials) && lessonPlan.materials.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">教学材料</h2>
            <ul className="space-y-2">
              {Array.isArray(lessonPlan.materials) &&
                lessonPlan.materials.map((material: string, index: number) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-green-600 font-bold mt-1">✓</span>
                    <span className="text-gray-700">{material}</span>
                  </li>
                ))}
            </ul>
          </div>
        )}

        {/* Assessment Methods */}
        {lessonPlan.assessment_methods && lessonPlan.assessment_methods.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">评估方法</h2>
            <ul className="space-y-2">
              {lessonPlan.assessment_methods.map((method, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-purple-600 font-bold mt-1">★</span>
                  <span className="text-gray-700">{method}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Content */}
        {lessonPlan.content && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">详细内容</h2>
            <div className="bg-gray-50 rounded-lg p-6">
              <div className="text-gray-700 whitespace-pre-wrap">
                {typeof lessonPlan.content === 'string'
                  ? lessonPlan.content
                  : JSON.stringify(lessonPlan.content, null, 2)}
              </div>
            </div>
          </div>
        )}

        {/* Status Update */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">更新状态</h3>
          <div className="flex gap-3">
            <button
              onClick={() => updateStatus('draft')}
              disabled={updating || lessonPlan.status === 'draft'}
              className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:opacity-50"
            >
              设为草稿
            </button>
            <button
              onClick={() => updateStatus('published')}
              disabled={updating || lessonPlan.status === 'published'}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              发布
            </button>
            <button
              onClick={() => updateStatus('archived')}
              disabled={updating || lessonPlan.status === 'archived'}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50"
            >
              归档
            </button>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Link
            href={`/app/teacher/lesson-plans/${lessonPlan.id}/edit`}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
          >
            编辑教案
          </Link>
        </div>
      </div>
    </div>
  );
}
