'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function TeacherDashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalClasses: 0,
    totalCourses: 0,
    pendingAssignments: 0,
    recentActivities: 0,
  });
  const [myCourses, setMyCourses] = useState<any[]>([]);
  const [pendingAssignments, setPendingAssignments] = useState<any[]>([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  async function loadDashboardData() {
    try {
      // 调用后端API获取统计数据
      const statsResponse = await fetch('/api/v1/users/teacher/dashboard/stats');
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData);
      } else {
        // 如果API调用失败，使用模拟数据
        setStats({
          totalStudents: 0,
          totalClasses: 0,
          totalCourses: 0,
          pendingAssignments: 0,
          recentActivities: 0,
        });
      }

      // 调用后端API获取课程列表
      const coursesResponse = await fetch('/api/v1/users/teacher/dashboard/courses');
      if (coursesResponse.ok) {
        const coursesData = await coursesResponse.json();
        setMyCourses(coursesData);
      }

      // 调用后端API获取待批改作业
      const assignmentsResponse = await fetch('/api/v1/users/teacher/dashboard/assignments');
      if (assignmentsResponse.ok) {
        const assignmentsData = await assignmentsResponse.json();
        setPendingAssignments(assignmentsData);
      }
    } catch (error) {
      console.error('Error loading dashboard:', error);
      // 出错时使用模拟数据
      setStats({
        totalStudents: 0,
        totalClasses: 0,
        totalCourses: 0,
        pendingAssignments: 0,
        recentActivities: 0,
      });
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">教师仪表盘</h1>
        <p className="text-gray-600">欢迎回来！查看您的教学概览</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-3xl font-bold text-blue-600">{stats.totalStudents}</div>
          <div className="text-gray-600">学生总数</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-3xl font-bold text-green-600">{stats.totalCourses}</div>
          <div className="text-gray-600">课程数量</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-3xl font-bold text-orange-600">{stats.pendingAssignments}</div>
          <div className="text-gray-600">待批改作业</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-3xl font-bold text-purple-600">{stats.recentActivities}</div>
          <div className="text-gray-600">最近活动</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold">我的课程</h2>
          </div>
          <div className="p-6">
            {myCourses.length > 0 ? (
              <div className="space-y-4">
                {myCourses.map((course) => (
                  <div key={course.id} className="border-b pb-4 last:border-b-0">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold">{course.name}</h3>
                        <p className="text-sm text-gray-500">{course.description}</p>
                      </div>
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          course.status === 'published'
                            ? 'bg-green-100 text-green-800'
                            : course.status === 'approved'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {course.status}
                      </span>
                    </div>
                    <div className="mt-2 flex gap-4 text-sm text-gray-500">
                      <span>{course.class_count} 个班级</span>
                      <span>{course.student_count} 名学生</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">暂无课程</p>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold">待批改作业</h2>
          </div>
          <div className="p-6">
            {pendingAssignments.length > 0 ? (
              <div className="space-y-4">
                {pendingAssignments.map((assignment, index) => (
                  <div key={index} className="border-b pb-4 last:border-b-0">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold">{assignment.title}</h3>
                        <p className="text-sm text-gray-500">学生: {assignment.student_name}</p>
                      </div>
                    </div>
                    <div className="mt-2 flex gap-4 text-sm text-gray-500">
                      <span>提交时间: {new Date(assignment.submitted_at).toLocaleString()}</span>
                      {assignment.deadline && (
                        <span>截止时间: {new Date(assignment.deadline).toLocaleString()}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">暂无待批改作业</p>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold">快速操作</h2>
          </div>
          <div className="p-6 space-y-3">
            <Link
              href="/app/teacher/courses/create"
              className="block w-full text-center p-3 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              创建新课程
            </Link>
            <Link
              href="/app/teacher/lesson-plan"
              className="block w-full text-center p-3 bg-green-600 text-white rounded hover:bg-green-700"
            >
              生成教案
            </Link>
            <Link
              href="/app/teacher/syllabus"
              className="block w-full text-center p-3 bg-purple-600 text-white rounded hover:bg-purple-700"
            >
              生成大纲
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold">最近作业</h2>
          </div>
          <div className="p-6">
            <p className="text-gray-500">暂无作业</p>
          </div>
        </div>
      </div>
    </div>
  );
}
