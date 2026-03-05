'use client';

import { useState } from 'react';
import Link from 'next/link';
import { StudentRegistrationRequest, RegistrationSuccessResponse } from '@/lib/cet/types';

interface StudentRegistrationFormProps {
  onSuccess: () => void;
}

export default function StudentRegistrationForm({ onSuccess }: StudentRegistrationFormProps) {
  const [formData, setFormData] = useState<Partial<StudentRegistrationRequest>>({
    username: '',
    password: '',
    email: '',
    real_name: '',
  });
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [success, setSuccess] = useState<RegistrationSuccessResponse | null>(null);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'number' ? (value ? parseInt(value) : undefined) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!acceptedTerms) {
      setError('您必须同意服务条款和隐私政策');
      return;
    }

    if (formData.password !== confirmPassword) {
      setError('两次输入的密码不一致');
      return;
    }

    if (!formData.real_name) {
      setError('请输入真实姓名');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/auth/register/student', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || data.message || '注册失败');
      }

      setSuccess(data);
      setTimeout(onSuccess, 2000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : '注册失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="text-center py-8">
        <div className="text-4xl mb-4">✅</div>
        <h2 className="text-2xl font-bold text-green-600 mb-2">注册申请提交成功！</h2>
        <p className="text-gray-600 mb-4">{success.message}</p>
        <p className="text-sm text-gray-500">预计审核时间：{success.estimated_review_time}</p>
        <p className="text-sm text-gray-500 mt-2">正在跳转到邮箱验证页面...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">学生注册</h1>
        <p className="text-gray-600">请填写以下信息完成注册</p>
      </div>

      {error && <div className="mb-4 p-4 text-sm text-red-700 bg-red-100 rounded-lg">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700">
              用户名 <span className="text-red-500">*</span>
            </label>
            <input
              id="username"
              name="username"
              type="text"
              required
              value={formData.username}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-primary-500"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              邮箱地址 <span className="text-red-500">*</span>
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              value={formData.email}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-primary-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              密码 <span className="text-red-500">*</span>
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              value={formData.password}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-primary-500"
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
              确认密码 <span className="text-red-500">*</span>
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-primary-500"
            />
          </div>
        </div>

        <div className="border-t pt-4 mt-4">
          <h3 className="text-lg font-medium text-gray-900 mb-4">个人信息</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="real_name" className="block text-sm font-medium text-gray-700">
                真实姓名 <span className="text-red-500">*</span>
              </label>
              <input
                id="real_name"
                name="real_name"
                type="text"
                required
                value={formData.real_name}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-primary-500"
              />
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                联系电话
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                value={formData.phone || ''}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-primary-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="age" className="block text-sm font-medium text-gray-700">
                年龄
              </label>
              <input
                id="age"
                name="age"
                type="number"
                min="16"
                max="100"
                value={formData.age || ''}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-primary-500"
              />
            </div>

            <div>
              <label htmlFor="gender" className="block text-sm font-medium text-gray-700">
                性别
              </label>
              <select
                id="gender"
                name="gender"
                value={formData.gender || ''}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-primary-500"
              >
                <option value="">请选择</option>
                <option value="男">男</option>
                <option value="女">女</option>
                <option value="其他">其他</option>
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="id_number" className="block text-sm font-medium text-gray-700">
              身份证号
            </label>
            <input
              id="id_number"
              name="id_number"
              type="text"
              maxLength={18}
              value={formData.id_number || ''}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-primary-500"
            />
          </div>
        </div>

        <div className="border-t pt-4 mt-4">
          <h3 className="text-lg font-medium text-gray-900 mb-4">紧急联系人</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="emergency_contact_name"
                className="block text-sm font-medium text-gray-700"
              >
                紧急联系人姓名
              </label>
              <input
                id="emergency_contact_name"
                name="emergency_contact_name"
                type="text"
                value={formData.emergency_contact_name || ''}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-primary-500"
              />
            </div>

            <div>
              <label
                htmlFor="emergency_contact_phone"
                className="block text-sm font-medium text-gray-700"
              >
                紧急联系人电话
              </label>
              <input
                id="emergency_contact_phone"
                name="emergency_contact_phone"
                type="tel"
                value={formData.emergency_contact_phone || ''}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-primary-500"
              />
            </div>
          </div>
        </div>

        <div className="border-t pt-4 mt-4">
          <h3 className="text-lg font-medium text-gray-900 mb-4">学校信息</h3>

          <div>
            <label htmlFor="school" className="block text-sm font-medium text-gray-700">
              学校
            </label>
            <input
              id="school"
              name="school"
              type="text"
              value={formData.school || ''}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-primary-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <label htmlFor="department" className="block text-sm font-medium text-gray-700">
                院系
              </label>
              <input
                id="department"
                name="department"
                type="text"
                value={formData.department || ''}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-primary-500"
              />
            </div>

            <div>
              <label htmlFor="major" className="block text-sm font-medium text-gray-700">
                专业
              </label>
              <input
                id="major"
                name="major"
                type="text"
                value={formData.major || ''}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-primary-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <label htmlFor="grade" className="block text-sm font-medium text-gray-700">
                年级
              </label>
              <input
                id="grade"
                name="grade"
                type="text"
                value={formData.grade || ''}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-primary-500"
              />
            </div>

            <div>
              <label htmlFor="class_name" className="block text-sm font-medium text-gray-700">
                班级
              </label>
              <input
                id="class_name"
                name="class_name"
                type="text"
                value={formData.class_name || ''}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-primary-500"
              />
            </div>
          </div>
        </div>

        <div className="space-y-4 mt-6">
          <div className="flex items-start">
            <div className="flex h-5 items-center">
              <input
                id="terms"
                name="terms"
                type="checkbox"
                checked={acceptedTerms}
                onChange={(e) => setAcceptedTerms(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
            </div>
            <div className="ml-3 text-sm">
              <label htmlFor="terms" className="text-gray-600">
                我同意{' '}
                <Link
                  href="/legal/terms"
                  className="font-medium text-primary-600 hover:text-primary-500"
                  target="_blank"
                >
                  服务条款
                </Link>{' '}
                和{' '}
                <Link
                  href="/legal/privacy"
                  className="font-medium text-primary-600 hover:text-primary-500"
                  target="_blank"
                >
                  隐私政策
                </Link>
              </label>
            </div>
          </div>
        </div>

        <div>
          <button
            type="submit"
            disabled={loading}
            className="flex w-full justify-center rounded-md border border-transparent bg-primary-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50"
          >
            {loading ? '提交中...' : '提交注册申请'}
          </button>
        </div>
      </form>
    </div>
  );
}
