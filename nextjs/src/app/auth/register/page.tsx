'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import SSOButtons from '@/components/SSOButtons';
import StudentRegistrationForm from '@/components/StudentRegistrationForm';
import TeacherRegistrationForm from '@/components/TeacherRegistrationForm';

type RegistrationRole = 'student' | 'teacher' | null;

export default function RegisterPage() {
  const [role, setRole] = useState<RegistrationRole>(null);
  const [error, setError] = useState('');
  const router = useRouter();

  if (!role) {
    return (
      <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
        {error && (
          <div className="mb-4 p-4 text-sm text-red-700 bg-red-100 rounded-lg">{error}</div>
        )}

        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">选择注册身份</h1>
          <p className="text-gray-600">请选择您要注册的用户类型</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <button
            onClick={() => setRole('student')}
            className="p-6 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all"
          >
            <div className="text-center">
              <div className="text-4xl mb-4">👨‍🎓</div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">学生注册</h2>
              <p className="text-gray-600">加入CET英语学习平台，提升您的英语水平</p>
            </div>
          </button>

          <button
            onClick={() => setRole('teacher')}
            className="p-6 border-2 border-gray-200 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-all"
          >
            <div className="text-center">
              <div className="text-4xl mb-4">👨‍🏫</div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">教师注册</h2>
              <p className="text-gray-600">成为CET英语教师，帮助学生学习</p>
            </div>
          </button>
        </div>

        <div className="mt-6 text-center text-sm">
          <Link href="/auth/login" className="font-medium text-primary-600 hover:text-primary-500">
            返回登录
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
      <div className="mb-6">
        <button
          onClick={() => setRole(null)}
          className="text-sm text-gray-600 hover:text-gray-900 flex items-center"
        >
          <span className="mr-1">←</span> 返回选择身份
        </button>
      </div>

      {role === 'student' ? (
        <StudentRegistrationForm onSuccess={() => router.push('/auth/verify-email')} />
      ) : (
        <TeacherRegistrationForm onSuccess={() => router.push('/auth/verify-email')} />
      )}

      <SSOButtons onError={setError} />

      <div className="mt-6 text-center text-sm">
        <span className="text-gray-600">已有账号？</span>{' '}
        <Link href="/auth/login" className="font-medium text-primary-600 hover:text-primary-500">
          立即登录
        </Link>
      </div>
    </div>
  );
}
