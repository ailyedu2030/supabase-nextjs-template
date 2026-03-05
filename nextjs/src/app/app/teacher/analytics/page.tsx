'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/cet/auth';
import { TeacherTeachingAnalytics } from '@/lib/cet/types';

export default function TeacherAnalyticsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [analyticsList, setAnalyticsList] = useState<TeacherTeachingAnalytics[]>([]);
  const [currentAnalytics, setCurrentAnalytics] = useState<TeacherTeachingAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedCourseId, setSelectedCourseId] = useState('');

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/signin');
      return;
    }

    if (user) {
      loadAnalyticsList();
    }
  }, [user, authLoading]);

  const loadAnalyticsList = async () => {
    try {
      setLoading(true);

      const response = await fetch('/api/v1/teacher/analytics', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) throw new Error('Failed to fetch analytics');
      const data = await response.json();
      if (data.analytics && data.analytics.length > 0) {
        setAnalyticsList(data.analytics);
        setCurrentAnalytics(data.analytics[0]);
      }
    } catch (error) {
      console.error('Error loading analytics list:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateAnalytics = async () => {
    try {
      setGenerating(true);

      const response = await fetch('/api/v1/teacher/analytics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          start_date: startDate || undefined,
          end_date: endDate || undefined,
          course_id: selectedCourseId || undefined,
        }),
      });

      if (!response.ok) throw new Error('Failed to generate analytics');
      const data: TeacherTeachingAnalytics = await response.json();
      setCurrentAnalytics(data);
      setAnalyticsList((prev) => [data, ...prev]);
      alert('教学分析生成成功！');
    } catch (error) {
      console.error('Error generating analytics:', error);
      alert('生成教学分析失败，请重试');
    } finally {
      setGenerating(false);
    }
  };

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return '↑';
      case 'down':
        return '↓';
      default:
        return '→';
    }
  };

  const getTrendColor = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return 'text-green-600';
      case 'down':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
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
          <h1 className="text-3xl font-bold text-gray-900">教学分析</h1>
          <div className="flex gap-3">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="开始日期"
            />
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="结束日期"
            />
            <button
              onClick={generateAnalytics}
              disabled={generating}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {generating ? '生成中...' : '生成分析'}
            </button>
          </div>
        </div>
        <p className="text-gray-600">查看班级整体表现、学生个人分析和教学建议</p>
      </div>

      {/* 历史分析记录选择 */}
      {analyticsList.length > 1 && (
        <div className="mb-6 bg-white rounded-lg shadow p-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">选择分析报告</label>
          <select
            value={currentAnalytics?.generated_at || ''}
            onChange={(e) => {
              const selected = analyticsList.find((a) => a.generated_at === e.target.value);
              setCurrentAnalytics(selected || null);
            }}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            {analyticsList.map((analytics, index) => (
              <option key={index} value={analytics.generated_at}>
                {new Date(analytics.generated_at).toLocaleString('zh-CN')}
              </option>
            ))}
          </select>
        </div>
      )}

      {!currentAnalytics ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <div className="text-gray-400 text-6xl mb-4">📊</div>
          <p className="text-gray-600 text-lg mb-4">暂无教学分析数据</p>
          <p className="text-gray-500 mb-6">点击&quot;生成分析&quot;按钮获取教学数据分析</p>
          <button
            onClick={generateAnalytics}
            disabled={generating}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {generating ? '生成中...' : '生成分析'}
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* 统计概览 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-3xl font-bold text-blue-600 mb-1">
                {currentAnalytics.overall_stats.total_courses}
              </div>
              <div className="text-sm text-gray-600">课程数</div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-3xl font-bold text-green-600 mb-1">
                {currentAnalytics.overall_stats.total_classes}
              </div>
              <div className="text-sm text-gray-600">班级数</div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-3xl font-bold text-purple-600 mb-1">
                {currentAnalytics.overall_stats.total_students}
              </div>
              <div className="text-sm text-gray-600">学生总数</div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-3xl font-bold text-orange-600 mb-1">
                {currentAnalytics.overall_stats.total_lessons}
              </div>
              <div className="text-sm text-gray-600">课时数</div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-3xl font-bold text-red-600 mb-1">
                {currentAnalytics.teaching_quality_score}
              </div>
              <div className="text-sm text-gray-600">教学质量评分</div>
            </div>
          </div>

          {/* 课程表现分析 */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">课程表现分析</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      课程名称
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      学生数
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      平均分
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      完成率
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentAnalytics.course_breakdown.map((course, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {course.course_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {course.student_count}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {course.average_score}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {course.completion_rate}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* 学生表现分析 */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">学生表现分析</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      学生姓名
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      训练次数
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      平均分
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      趋势
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      薄弱环节
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentAnalytics.student_performance.map((student, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {student.student_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {student.total_sessions}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {student.average_score}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`text-2xl font-bold ${getTrendColor(student.improvement_trend)}`}
                        >
                          {getTrendIcon(student.improvement_trend)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {student.weak_points.join(', ')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* 常见薄弱环节 */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">常见薄弱环节</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {currentAnalytics.common_weak_points.map((point, index) => (
                <div key={index} className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-semibold text-orange-900">
                      {point.knowledge_point}
                    </h3>
                    <div className="text-right">
                      <div className="text-sm text-orange-600">学生数</div>
                      <div className="text-xl font-bold text-orange-800">{point.student_count}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-sm text-orange-700">平均掌握度:</div>
                    <div className="text-lg font-bold text-orange-800">
                      {point.average_mastery}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 教学建议 */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">教学建议</h2>
            <div className="space-y-3">
              {currentAnalytics.recommendations.map((recommendation, index) => (
                <div key={index} className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg">
                  <div className="text-blue-600 text-xl mt-1">💡</div>
                  <p className="text-blue-900">{recommendation}</p>
                </div>
              ))}
            </div>
          </div>

          {/* 分析时间 */}
          <div className="text-center text-sm text-gray-500">
            分析生成时间: {new Date(currentAnalytics.generated_at).toLocaleString('zh-CN')}
          </div>
        </div>
      )}
    </div>
  );
}
