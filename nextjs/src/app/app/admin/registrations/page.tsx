'use client';

import { useEffect, useState } from 'react';
import { RegistrationApplication, ApplicationStatus, UserType } from '@/lib/cet/types';

export default function AdminRegistrations() {
  const [loading, setLoading] = useState(true);
  const [applications, setApplications] = useState<RegistrationApplication[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<ApplicationStatus | 'all'>('all');
  const [selectedApplication, setSelectedApplication] = useState<RegistrationApplication | null>(
    null
  );
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewDecision, setReviewDecision] = useState<'approve' | 'reject'>('approve');
  const [reviewComment, setReviewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadApplications();
  }, [selectedStatus]);

  async function loadApplications() {
    try {
      setLoading(true);
      let url = '/api/auth/register/applications';
      if (selectedStatus !== 'all') {
        url += `?status=${selectedStatus}`;
      }

      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setApplications(data.applications || data || []);
      }
    } catch (error) {
      console.error('Error loading applications:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleReview() {
    if (!selectedApplication) return;

    try {
      setSubmitting(true);
      const response = await fetch(
        `/api/auth/register/applications/${selectedApplication.id}/review`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            action: reviewDecision,
            review_notes: reviewComment,
          }),
        }
      );

      if (response.ok) {
        setShowReviewModal(false);
        setSelectedApplication(null);
        setReviewComment('');
        loadApplications();
      } else {
        const data = await response.json();
        alert(data.error || '审核失败');
      }
    } catch (error) {
      console.error('Error reviewing application:', error);
      alert('服务器错误，请稍后重试');
    } finally {
      setSubmitting(false);
    }
  }

  function getStatusBadgeClass(status: ApplicationStatus) {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  function getStatusText(status: ApplicationStatus) {
    switch (status) {
      case 'pending':
        return '待审核';
      case 'approved':
        return '已通过';
      case 'rejected':
        return '已拒绝';
      default:
        return status;
    }
  }

  function getUserTypeText(type: UserType) {
    switch (type) {
      case 'student':
        return '学生';
      case 'teacher':
        return '教师';
      case 'admin':
        return '管理员';
      default:
        return type;
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">加载中...</div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">注册审核</h1>
        <p className="text-gray-600">审核学生和教师的注册申请</p>
      </div>

      <div className="mb-6 flex gap-4">
        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value as ApplicationStatus | 'all')}
          className="px-4 py-2 border rounded-lg"
        >
          <option value="all">全部状态</option>
          <option value="pending">待审核</option>
          <option value="approved">已通过</option>
          <option value="rejected">已拒绝</option>
        </select>
        <button
          onClick={loadApplications}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          刷新
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  申请人
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  类型
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  状态
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  提交时间
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {applications.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    暂无申请记录
                  </td>
                </tr>
              ) : (
                applications.map((app) => (
                  <tr key={app.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {app.student_profile?.real_name ||
                          app.teacher_profile?.real_name ||
                          app.email}
                      </div>
                      <div className="text-sm text-gray-500">{app.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">
                        {getUserTypeText(app.user_type)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(app.status)}`}
                      >
                        {getStatusText(app.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(app.created_at).toLocaleString('zh-CN')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => {
                          setSelectedApplication(app);
                          setShowReviewModal(true);
                        }}
                        className="text-blue-600 hover:text-blue-900 mr-3"
                      >
                        查看
                      </button>
                      {app.status === 'pending' && (
                        <>
                          <button
                            onClick={() => {
                              setSelectedApplication(app);
                              setReviewDecision('approve');
                              setShowReviewModal(true);
                            }}
                            className="text-green-600 hover:text-green-900 mr-3"
                          >
                            通过
                          </button>
                          <button
                            onClick={() => {
                              setSelectedApplication(app);
                              setReviewDecision('reject');
                              setShowReviewModal(true);
                            }}
                            className="text-red-600 hover:text-red-900"
                          >
                            拒绝
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showReviewModal && selectedApplication && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">申请详情</h2>
                <button
                  onClick={() => setShowReviewModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="px-6 py-4">
              <div className="mb-4">
                <h3 className="text-lg font-medium mb-2">基本信息</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-gray-600">邮箱：</span>
                    <span>{selectedApplication.email}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">用户类型：</span>
                    <span>{getUserTypeText(selectedApplication.user_type)}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">状态：</span>
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(selectedApplication.status)}`}
                    >
                      {getStatusText(selectedApplication.status)}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">提交时间：</span>
                    <span>{new Date(selectedApplication.created_at).toLocaleString('zh-CN')}</span>
                  </div>
                </div>
              </div>

              {selectedApplication.student_profile && (
                <div className="mb-4">
                  <h3 className="text-lg font-medium mb-2">学生信息</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-gray-600">姓名：</span>
                      <span>{selectedApplication.student_profile.real_name}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">学号：</span>
                      <span>{selectedApplication.student_profile.student_id}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">学校：</span>
                      <span>{selectedApplication.student_profile.school}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">专业：</span>
                      <span>{selectedApplication.student_profile.major}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">年级：</span>
                      <span>{selectedApplication.student_profile.grade}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">班级：</span>
                      <span>{selectedApplication.student_profile.class_name}</span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-gray-600">身份证号：</span>
                      <span>{selectedApplication.student_profile.id_number}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">手机号：</span>
                      <span>{selectedApplication.student_profile.phone}</span>
                    </div>
                  </div>
                </div>
              )}

              {selectedApplication.teacher_profile && (
                <div className="mb-4">
                  <h3 className="text-lg font-medium mb-2">教师信息</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-gray-600">姓名：</span>
                      <span>{selectedApplication.teacher_profile.real_name}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">工号：</span>
                      <span>{selectedApplication.teacher_profile.teacher_id}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">学校：</span>
                      <span>{selectedApplication.teacher_profile.school}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">学院：</span>
                      <span>{selectedApplication.teacher_profile.department}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">职称：</span>
                      <span>{selectedApplication.teacher_profile.title}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">手机号：</span>
                      <span>{selectedApplication.teacher_profile.phone}</span>
                    </div>
                    {selectedApplication.teacher_profile.certificate_url && (
                      <div className="col-span-2">
                        <span className="text-gray-600">证书：</span>
                        <a
                          href={selectedApplication.teacher_profile.certificate_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline ml-2"
                        >
                          查看证书
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {selectedApplication.status === 'pending' && (
                <div className="mt-6 border-t pt-4">
                  <h3 className="text-lg font-medium mb-3">审核操作</h3>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">审核决定</label>
                    <div className="flex gap-4">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          value="approve"
                          checked={reviewDecision === 'approve'}
                          onChange={(e) =>
                            setReviewDecision(e.target.value as 'approve' | 'reject')
                          }
                          className="mr-2"
                        />
                        通过
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          value="reject"
                          checked={reviewDecision === 'reject'}
                          onChange={(e) =>
                            setReviewDecision(e.target.value as 'approve' | 'reject')
                          }
                          className="mr-2"
                        />
                        拒绝
                      </label>
                    </div>
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">审核备注</label>
                    <textarea
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg"
                      rows={3}
                      placeholder="请输入审核备注（可选）"
                    />
                  </div>
                  <div className="flex gap-3 justify-end">
                    <button
                      onClick={() => setShowReviewModal(false)}
                      className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                    >
                      取消
                    </button>
                    <button
                      onClick={handleReview}
                      disabled={submitting}
                      className={`px-4 py-2 rounded-lg text-white ${
                        reviewDecision === 'approve'
                          ? 'bg-green-600 hover:bg-green-700'
                          : 'bg-red-600 hover:bg-red-700'
                      } disabled:opacity-50`}
                    >
                      {submitting
                        ? '提交中...'
                        : reviewDecision === 'approve'
                          ? '通过申请'
                          : '拒绝申请'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
