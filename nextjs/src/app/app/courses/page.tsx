'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { BookOpen, Users, PlayCircle, Search, Filter } from 'lucide-react';
import { Course, Class } from '@/lib/cet/types';
import { createSPASassClient } from '@/lib/supabase/client';

interface ClassStudent {
  id: string;
  class_id: string;
  student_id: string;
  enrolled_at: string;
  status: string;
}

export default function CoursesPage() {
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [classes, setClasses] = useState<Map<string, Class[]>>(new Map());
  const [enrollments, setEnrollments] = useState<Map<string, ClassStudent>>(new Map());
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showClassSelector, setShowClassSelector] = useState<string | null>(null);

  const loadCourses = useCallback(async () => {
    try {
      const sassClient = await createSPASassClient();
      const supabase = sassClient.getSupabaseClient();

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push('/auth/login');
        return;
      }
      const { data: coursesData } = await supabase
        .from('courses')
        .select('*')
        .eq('status', 'published')
        .order('created_at', { ascending: false });

      if (coursesData) {
        setCourses(coursesData as any);
        const courseIds = coursesData.map((c: any) => c.id);
        const { data: classesData } = await supabase
          .from('classes')
          .select('*')
          .in('course_id', courseIds)
          .eq('status', 'active');

        if (classesData) {
          const classMap = new Map<string, Class[]>();
          classesData.forEach((cls: any) => {
            const existing = classMap.get(cls.course_id) || [];
            classMap.set(cls.course_id, [...existing, cls]);
          });
          setClasses(classMap);
        }
        const { data: enrollmentData } = await supabase
          .from('class_students')
          .select('*, classes!inner(course_id)')
          .eq('student_id', user.id);

        if (enrollmentData) {
          const enrollmentMap = new Map<string, ClassStudent>();
          enrollmentData.forEach((e: any) => enrollmentMap.set((e as any).classes.course_id, e));
          enrollmentData.forEach((e: any) => enrollmentMap.set(e.classes.course_id, e));
          setEnrollments(enrollmentMap);
        }
      }
    } catch (error) {
      console.error('Error loading courses:', error);
    } finally {
      setLoading(false);
    }
  }, [router]);

  const enrollInClass = async (classId: string) => {
    try {
      const sassClient = await createSPASassClient();
      const supabase = sassClient.getSupabaseClient();

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      await supabase.from('class_students').insert({
        student_id: user.id,
        class_id: classId,
        status: 'active',
      });

      setShowClassSelector(null);
      loadCourses();
    } catch (error) {
      console.error('Error enrolling in class:', error);
    }
  };

  const categories = [
    'all',
    ...new Set(courses.map((c: Course) => c.category).filter(Boolean) as string[]),
  ];

  const filteredCourses = courses.filter((course) => {
    const matchesSearch =
      course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || course.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const levelColors: Record<string, string> = {
    beginner: 'bg-green-100 text-green-800',
    intermediate: 'bg-yellow-100 text-yellow-800',
    advanced: 'bg-red-100 text-red-800',
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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">课程中心</h1>
          <p className="mt-2 text-gray-600">浏览和学习英语课程</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜索课程..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat === 'all' ? '全部分类' : cat}
                </option>
              ))}
            </select>
          </div>
        </div>

        {filteredCourses.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">暂无课程</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course) => {
              const enrollment = enrollments.get(course.id);
              const courseClasses = classes.get(course.id) || [];

              return (
                <div
                  key={course.id}
                  className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow duration-200 overflow-hidden"
                >
                  <div className="h-40 bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                    <BookOpen className="w-16 h-16 text-white opacity-50" />
                  </div>
                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800`}>
                        {(course as any).level || course.difficulty_level || 'N/A'}
                      </span>
                      <span className="text-xs text-gray-500">{course.category}</span>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{course.title}</h3>
                    <p className="text-sm text-gray-500 mb-4 line-clamp-2">{course.description}</p>

                    {enrollment ? (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-500">已报名</span>
                        </div>
                        <button
                          onClick={() => router.push(`/app/courses/${course.id}`)}
                          className="w-full mt-4 py-2 px-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center justify-center gap-2"
                        >
                          <PlayCircle className="w-4 h-4" />
                          继续学习
                        </button>
                      </div>
                    ) : (
                      <div>
                        {showClassSelector === course.id ? (
                          <div className="space-y-2">
                            <p className="text-sm text-gray-600 mb-2">选择班级：</p>
                            {courseClasses.length === 0 ? (
                              <p className="text-sm text-gray-500">暂无可用班级</p>
                            ) : (
                              courseClasses.map((cls) => (
                                <button
                                  key={cls.id}
                                  onClick={() => enrollInClass(cls.id)}
                                  className="w-full py-2 px-4 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-left"
                                >
                                  {cls.name}
                                  {cls.semester && (
                                    <span className="text-xs text-gray-500 ml-2">
                                      ({cls.semester})
                                    </span>
                                  )}
                                </button>
                              ))
                            )}
                            <button
                              onClick={() => setShowClassSelector(null)}
                              className="w-full py-2 px-4 text-gray-500 hover:text-gray-700"
                            >
                              取消
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setShowClassSelector(course.id)}
                            className="w-full py-2 px-4 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center justify-center gap-2"
                          >
                            <Users className="w-4 h-4" />
                            开始学习
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
