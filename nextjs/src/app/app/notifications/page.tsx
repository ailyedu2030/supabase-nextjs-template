'use client';

import { useEffect, useState } from 'react';
import { createSPASassClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { Bell, Check, Trash2, BookOpen, Award, AlertCircle, Info } from 'lucide-react';
import { Notification } from '@/lib/cet/types';

export default function NotificationsPage() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
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

      const { data: notifs } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (notifs) {
        setNotifications(notifs as any);
      }
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      const sassClient = await createSPASassClient();
      const supabase = sassClient.getSupabaseClient();

      await supabase.from('notifications').update({ is_read: true }).eq('id', id);

      setNotifications(notifications.map((n) => (n.id === id ? { ...n, is_read: true } : n)));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const sassClient = await createSPASassClient();
      const supabase = sassClient.getSupabaseClient();

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', user.id)
        .eq('is_read', false);

      setNotifications(notifications.map((n) => ({ ...n, is_read: true })));
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      const sassClient = await createSPASassClient();
      const supabase = sassClient.getSupabaseClient();

      await supabase.from('notifications').delete().eq('id', id);

      setNotifications(notifications.filter((n) => n.id !== id));
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const getTypeIcon = (type?: string) => {
    switch (type) {
      case 'achievement':
        return <Award className="w-5 h-5 text-yellow-500" />;
      case 'training':
        return <BookOpen className="w-5 h-5 text-blue-500" />;
      case 'alert':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Info className="w-5 h-5 text-gray-500" />;
    }
  };

  const filteredNotifications = notifications.filter((n) => filter === 'all' || !n.is_read);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

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
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">通知</h1>
            <p className="mt-2 text-gray-600">
              {unreadCount > 0 ? `${unreadCount} 条未读消息` : '暂无新通知'}
            </p>
          </div>
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="flex items-center gap-2 px-4 py-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
            >
              <Check className="w-4 h-4" />
              全部已读
            </button>
          )}
        </div>

        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg ${
              filter === 'all'
                ? 'bg-blue-500 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            全部
          </button>
          <button
            onClick={() => setFilter('unread')}
            className={`px-4 py-2 rounded-lg ${
              filter === 'unread'
                ? 'bg-blue-500 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            未读
          </button>
        </div>

        {filteredNotifications.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">暂无通知</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredNotifications.map((notif) => (
              <div
                key={notif.id}
                className={`bg-white rounded-lg shadow p-4 transition-colors ${
                  !notif.is_read ? 'border-l-4 border-blue-500' : ''
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 mt-1">{getTypeIcon((notif as any).type)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h3
                        className={`font-medium ${!notif.is_read ? 'text-gray-900' : 'text-gray-700'}`}
                      >
                        {notif.title}
                      </h3>
                      {!notif.is_read && (
                        <span className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-2" />
                      )}
                    </div>
                    <p className="mt-1 text-sm text-gray-500">{notif.content}</p>
                    <p className="mt-2 text-xs text-gray-400">
                      {new Date(notif.created_at).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {!notif.is_read && (
                      <button
                        onClick={() => markAsRead(notif.id)}
                        className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                        title="标记已读"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => deleteNotification(notif.id)}
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      title="删除"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
