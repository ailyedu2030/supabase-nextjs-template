'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import { TeacherRegistrationRequest, RegistrationSuccessResponse } from '@/lib/cet/types';

interface TeacherRegistrationFormProps {
  onSuccess: () => void;
}

interface UploadedFile {
  file: File;
  type: 'teacher_certificate' | 'qualification' | 'honor';
  previewUrl?: string;
}

export default function TeacherRegistrationForm({ onSuccess }: TeacherRegistrationFormProps) {
  const [formData, setFormData] = useState<Partial<TeacherRegistrationRequest>>({
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
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const fileInputRefs = {
    teacher_certificate: useRef<HTMLInputElement>(null),
    qualification: useRef<HTMLInputElement>(null),
    honor: useRef<HTMLInputElement>(null),
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'number' ? (value ? parseInt(value) : undefined) : value,
    }));
  };

  const handleFileUpload =
    (type: 'teacher_certificate' | 'qualification' | 'honor') =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || []);
      if (files.length === 0) return;

      const newFiles: UploadedFile[] = files.map((file) => {
        const previewUrl = file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined;
        return { file, type, previewUrl };
      });

      setUploadedFiles((prev) => [...prev, ...newFiles]);
    };

  const removeFile = (index: number) => {
    setUploadedFiles((prev) => {
      const newFiles = [...prev];
      const removed = newFiles.splice(index, 1)[0];
      if (removed.previewUrl) {
        URL.revokeObjectURL(removed.previewUrl);
      }
      return newFiles;
    });
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
      const uploadedFileUrls: { [key: string]: string[] } = {
        qualification_certificates: [],
        honor_certificates: [],
      };
      let teacherCertificateUrl: string | undefined;

      for (const uploadedFile of uploadedFiles) {
        const formDataFile = new FormData();
        formDataFile.append('file', uploadedFile.file);
        formDataFile.append(
          'certificate_type',
          uploadedFile.type === 'teacher_certificate'
            ? 'teacher_certificate'
            : uploadedFile.type === 'qualification'
              ? 'qualification_certificates'
              : 'honor_certificates'
        );

        const uploadResponse = await fetch('/api/auth/register/teacher/upload-certificate', {
          method: 'POST',
          body: formDataFile,
        });

        const uploadData = await uploadResponse.json();

        if (!uploadResponse.ok) {
          throw new Error(uploadData.detail || uploadData.message || '文件上传失败');
        }

        if (uploadedFile.type === 'teacher_certificate') {
          teacherCertificateUrl = uploadData.file_url;
        } else if (uploadedFile.type === 'qualification') {
          uploadedFileUrls.qualification_certificates.push(uploadData.file_url);
        } else {
          uploadedFileUrls.honor_certificates.push(uploadData.file_url);
        }
      }

      const response = await fetch('/api/auth/register/teacher', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          teacher_certificate: teacherCertificateUrl,
          qualification_certificates: uploadedFileUrls.qualification_certificates,
          honor_certificates: uploadedFileUrls.honor_certificates,
        }),
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
        <h1 className="text-2xl font-bold text-gray-900 mb-2">教师注册</h1>
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <label htmlFor="age" className="block text-sm font-medium text-gray-700">
                年龄
              </label>
              <input
                id="age"
                name="age"
                type="number"
                min="22"
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                职称
              </label>
              <input
                id="title"
                name="title"
                type="text"
                value={formData.title || ''}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-primary-500"
              />
            </div>

            <div>
              <label htmlFor="subject" className="block text-sm font-medium text-gray-700">
                所授学科
              </label>
              <input
                id="subject"
                name="subject"
                type="text"
                value={formData.subject || ''}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-primary-500"
              />
            </div>
          </div>

          <div className="mt-4">
            <label htmlFor="introduction" className="block text-sm font-medium text-gray-700">
              自我介绍
            </label>
            <textarea
              id="introduction"
              name="introduction"
              rows={4}
              maxLength={1000}
              value={formData.introduction || ''}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-primary-500"
            />
          </div>
        </div>

        <div className="border-t pt-4 mt-4">
          <h3 className="text-lg font-medium text-gray-900 mb-4">资质材料</h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                教师证扫描件 <span className="text-red-500">*</span>
              </label>
              <input
                type="file"
                ref={fileInputRefs.teacher_certificate}
                onChange={handleFileUpload('teacher_certificate')}
                accept="image/*,.pdf"
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRefs.teacher_certificate.current?.click()}
                className="w-full border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-primary-500 hover:bg-primary-50 transition-colors"
              >
                <div className="text-2xl mb-2">📄</div>
                <p className="text-sm text-gray-600">点击上传教师证扫描件</p>
                <p className="text-xs text-gray-400">支持 JPG、PNG、PDF 格式，最大 5MB</p>
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">职业资格证书</label>
              <input
                type="file"
                ref={fileInputRefs.qualification}
                onChange={handleFileUpload('qualification')}
                accept="image/*,.pdf"
                multiple
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRefs.qualification.current?.click()}
                className="w-full border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-primary-500 hover:bg-primary-50 transition-colors"
              >
                <div className="text-2xl mb-2">📁</div>
                <p className="text-sm text-gray-600">点击上传职业资格证书</p>
                <p className="text-xs text-gray-400">支持多文件上传，JPG、PNG、PDF 格式</p>
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">荣誉证书</label>
              <input
                type="file"
                ref={fileInputRefs.honor}
                onChange={handleFileUpload('honor')}
                accept="image/*,.pdf"
                multiple
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRefs.honor.current?.click()}
                className="w-full border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-primary-500 hover:bg-primary-50 transition-colors"
              >
                <div className="text-2xl mb-2">🏆</div>
                <p className="text-sm text-gray-600">点击上传荣誉证书</p>
                <p className="text-xs text-gray-400">支持多文件上传，JPG、PNG、PDF 格式</p>
              </button>
            </div>
          </div>

          {uploadedFiles.length > 0 && (
            <div className="mt-4 space-y-2">
              <h4 className="text-sm font-medium text-gray-700">已上传文件：</h4>
              {uploadedFiles.map((uploadedFile, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    {uploadedFile.previewUrl ? (
                      <img
                        src={uploadedFile.previewUrl}
                        alt="预览"
                        className="w-12 h-12 object-cover rounded"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center">
                        📄
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-medium text-gray-900">{uploadedFile.file.name}</p>
                      <p className="text-xs text-gray-500">
                        {uploadedFile.type === 'teacher_certificate'
                          ? '教师证'
                          : uploadedFile.type === 'qualification'
                            ? '职业资格证书'
                            : '荣誉证书'}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeFile(index)}
                    className="text-red-600 hover:text-red-800"
                  >
                    删除
                  </button>
                </div>
              ))}
            </div>
          )}
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
