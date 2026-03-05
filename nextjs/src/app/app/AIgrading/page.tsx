'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Send, Loader2, CheckCircle, XCircle, FileText, Mic } from 'lucide-react';
import { GradingResult } from '@/lib/cet/types';
import { createSPASassClient } from '@/lib/supabase/client';

export default function AIGradingPage() {
  const router = useRouter();
  const [contentType, setContentType] = useState<'writing' | 'speaking'>('writing');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<GradingResult[]>([]);
  const [selectedResult, setSelectedResult] = useState<GradingResult | null>(null);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
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

      const { data: results } = await supabase
        .from('grading_results')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (results) {
        setHistory(results as any);
      }
    } catch (error) {
      console.error('Error loading history:', error);
    }
  };

  const submitForGrading = async () => {
    if (!content.trim()) return;

    setLoading(true);
    try {
      const sassClient = await createSPASassClient();
      const supabase = sassClient.getSupabaseClient();

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('grading_results')
        .insert({
          user_id: user.id,
          submission_text: content,
          status: 'pending',
        })
        .select()
        .single();

      if (error) throw error;

      setContent('');
      loadHistory();
    } catch (error) {
      console.error('Error submitting for grading:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'processing':
        return <Loader2 className="w-4 h-4 text-yellow-500 animate-spin" />;
      default:
        return <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">AI 批改</h1>
          <p className="mt-2 text-gray-600">使用 AI 获取写作和口语反馈</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex gap-4 mb-6">
                <button
                  onClick={() => setContentType('writing')}
                  className={`flex-1 py-2 px-4 rounded-lg flex items-center justify-center gap-2 ${
                    contentType === 'writing'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  写作
                </button>
                <button
                  onClick={() => setContentType('speaking')}
                  className={`flex-1 py-2 px-4 rounded-lg flex items-center justify-center gap-2 ${
                    contentType === 'speaking'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Mic className="w-4 h-4" />
                  口语
                </button>
              </div>

              {contentType === 'writing' ? (
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="请输入您的作文..."
                  className="w-full h-64 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
              ) : (
                <div className="h-64 border border-gray-300 rounded-lg flex items-center justify-center bg-gray-50">
                  <div className="text-center">
                    <Mic className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500">音频录制功能开发中</p>
                  </div>
                </div>
              )}

              <button
                onClick={submitForGrading}
                disabled={loading || !content.trim()}
                className="mt-4 w-full py-3 px-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    提交中...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    提交批改
                  </>
                )}
              </button>
            </div>
          </div>

          <div>
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">历史记录</h2>

              {history.length === 0 ? (
                <p className="text-gray-500 text-center py-8">暂无历史记录</p>
              ) : (
                <div className="space-y-4">
                  {history.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => setSelectedResult(item)}
                      className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                        selectedResult?.id === item.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">
                          {contentType === 'writing' ? '写作' : '口语'}
                        </span>
                        {getStatusIcon(item.status)}
                      </div>
                      <p className="text-sm text-gray-500 truncate">{item.submission_text}</p>
                      <p className="text-xs text-gray-400 mt-2">
                        {new Date(item.created_at).toLocaleDateString()}
                      </p>
                      {selectedResult?.id === item.id && item.feedback && (
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <h4 className="text-sm font-semibold text-gray-900 mb-2">反馈</h4>
                          <p className="text-sm text-gray-600">{item.feedback}</p>
                          {item.overall_score && (
                            <p className="text-sm font-semibold text-blue-600 mt-2">
                              得分: {item.overall_score}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
