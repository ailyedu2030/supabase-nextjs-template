'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/cet/auth';
import { SystemMonitoringStats } from '@/lib/cet/types';

export default function AdminSystemMonitoringPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<SystemMonitoringStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/signin');
      return;
    }

    if (user) {
      loadStats();
    }
  }, [user, authLoading]);

  const loadStats = async () => {
    try {
      setLoading(true);

      const response = await fetch('/api/v1/admin/system', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) throw new Error('Failed to fetch system stats');
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Error loading system stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshStats = async () => {
    try {
      setRefreshing(true);
      await loadStats();
    } finally {
      setRefreshing(false);
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
          <h1 className="text-3xl font-bold text-gray-900">系统监控</h1>
          <button
            onClick={refreshStats}
            disabled={refreshing}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {refreshing ? '刷新中...' : '刷新数据'}
          </button>
        </div>
        <p className="text-gray-600">实时监控系统运行状态和用户活动</p>
      </div>

      {stats && (
        <div className="space-y-6">
          {/* 系统概览 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-3xl font-bold text-blue-600 mb-1">
                {stats.overall_stats.total_users}
              </div>
              <div className="text-sm text-gray-600">总用户数</div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-3xl font-bold text-green-600 mb-1">
                {stats.overall_stats.active_users_today}
              </div>
              <div className="text-sm text-gray-600">今日活跃</div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-3xl font-bold text-purple-600 mb-1">
                {stats.overall_stats.active_users_7days}
              </div>
              <div className="text-sm text-gray-600">7天活跃</div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-3xl font-bold text-orange-600 mb-1">
                {stats.overall_stats.total_courses}
              </div>
              <div className="text-sm text-gray-600">课程总数</div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-3xl font-bold text-red-600 mb-1">
                {stats.overall_stats.total_classes}
              </div>
              <div className="text-sm text-gray-600">班级总数</div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-3xl font-bold text-indigo-600 mb-1">
                {stats.overall_stats.total_training_sessions}
              </div>
              <div className="text-sm text-gray-600">训练会话</div>
            </div>
          </div>

          {/* 系统性能 */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">系统性能</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-sm text-gray-600 mb-1">平均响应时间</div>
                <div className="text-2xl font-bold text-blue-600">
                  {stats.system_performance.avg_response_time_ms}ms
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-sm text-gray-600 mb-1">系统正常运行时间</div>
                <div className="text-2xl font-bold text-green-600">
                  {stats.system_performance.uptime_percent}%
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-sm text-gray-600 mb-1">错误率</div>
                <div className="text-2xl font-bold text-orange-600">
                  {stats.system_performance.error_rate}%
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-sm text-gray-600 mb-1">活跃连接数</div>
                <div className="text-2xl font-bold text-purple-600">
                  {stats.system_performance.active_connections}
                </div>
              </div>
            </div>
          </div>

          {/* 用户增长趋势 */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">用户增长趋势（最近7天）</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      日期
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      新增用户
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      活跃用户
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {stats.user_growth.map((day, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {day.date}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {day.new_users}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {day.active_users}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* 课程统计 */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">热门课程</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      课程名称
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      报名人数
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      完成率
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      平均分
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {stats.course_stats.map((course, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {course.course_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {course.enrollment_count}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {course.completion_rate}%
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {course.average_score}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* 最近活动 */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">最近活动</h2>
            <div className="space-y-4">
              {stats.recent_activities.map((activity, index) => (
                <div key={index} className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                  <div className="text-gray-400 text-xl mt-1">
                    {activity.type === 'user_signup' && '👤'}
                    {activity.type === 'course_created' && '📚'}
                    {activity.type === 'training_completed' && '✅'}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="font-medium text-gray-900">{activity.user_name}</span>
                        <span className="text-gray-600 ml-2">{activity.description}</span>
                      </div>
                      <span className="text-sm text-gray-500">
                        {new Date(activity.created_at).toLocaleString('zh-CN')}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 数据更新时间 */}
          <div className="text-center text-sm text-gray-500">
            数据更新时间: {new Date(stats.generated_at).toLocaleString('zh-CN')}
          </div>
        </div>
      )}
    </div>
  );
}
