import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/modules/authentication/context/AuthContext';
import { apiClient } from '@/shared/api/client';
import { MeloLogo } from '@/shared/components/MeloLogo';
import {
  Home,
  Compass,
  Users,
  PlusCircle,
  MessageSquare,
  ShieldCheck,
  Sparkles,
  User as UserIcon,
  LogOut,
  Bell,
  CheckCircle2,
  Calendar,
  Clock,
  AlertCircle,
  Check,
} from 'lucide-react';

interface NotificationItem {
  id: string;
  user_id: string;
  title: string;
  content: string;
  notification_type: string;
  link_url?: string | null;
  is_read: boolean;
  created_at: string;
}

interface NotificationListResponse {
  items: NotificationItem[];
  unread_count: number;
}

export const Navbar: React.FC = () => {
  const location = useLocation();
  const queryClient = useQueryClient();
  const { isAuthenticated, user, logout } = useAuth();
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  // Close notifications on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setIsNotifOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Live notifications query (polls every 15s when authenticated)
  const { data: notifData } = useQuery<NotificationListResponse>({
    queryKey: ['user-notifications'],
    queryFn: async () => {
      const res = await apiClient.get<NotificationListResponse>('/notifications?limit=15');
      return res.data;
    },
    enabled: isAuthenticated,
    refetchInterval: 15000,
  });

  // Mark single as read
  const markReadMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiClient.put(`/notifications/${id}/read`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-notifications'] });
    },
  });

  // Mark all as read
  const markAllReadMutation = useMutation({
    mutationFn: async () => {
      await apiClient.put('/notifications/mark-all-read');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-notifications'] });
    },
  });

  const unreadCount = notifData?.unread_count || 0;
  const notifications = notifData?.items || [];

  const navLinks = [
    { label: 'Home', path: '/', icon: Home },
    { label: 'Explore', path: '/explore', icon: Compass },
    { label: 'AI Matches', path: '/recommendations', icon: Sparkles, badge: 'Smart' },
    { label: 'My Meetups', path: '/my-activities', icon: Users },
    { label: 'Messages', path: '/messages', icon: MessageSquare },
    { label: 'Safety', path: '/safety', icon: ShieldCheck },
  ];

  const getNotifIcon = (type: string) => {
    switch (type) {
      case 'REQUEST_ACCEPTED':
        return <CheckCircle2 className="h-4 w-4 text-emerald-600" />;
      case 'JOIN_REQUEST':
        return <Clock className="h-4 w-4 text-amber-600" />;
      case 'ACTIVITY_CANCELLED':
        return <AlertCircle className="h-4 w-4 text-rose-600" />;
      default:
        return <Calendar className="h-4 w-4 text-[#7137A8]" />;
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#E8E7E2] bg-white/90 backdrop-blur-md transition-all">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo with Compass Detail and Gradient Arc */}
        <MeloLogo size="md" />

        {/* Central Navigation Pills */}
        <nav className="hidden lg:flex items-center gap-1 bg-[#F1F3EF] p-1 rounded-2xl border border-[#E8E7E2]">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`relative flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
                  isActive
                    ? 'bg-white text-[#7137A8] shadow-sm font-bold border border-[#7137A8]/20'
                    : 'text-[#55545C] hover:text-[#26232B] hover:bg-white/60'
                }`}
              >
                <Icon className={`h-4 w-4 ${isActive ? 'text-[#7137A8]' : 'text-[#85828A]'}`} />
                {link.label}
                {link.badge && (
                  <span className="ml-0.5 rounded-full bg-gradient-to-r from-[#FF9B32] to-[#F28B20] px-1.5 py-0.2 text-[8px] font-black text-slate-950 uppercase tracking-wider">
                    {link.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Right Action Controls */}
        <div className="flex items-center gap-2.5">
          <Link
            to="/activities/create"
            className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-[#7137A8] to-[#9B51CA] px-4 py-2 text-xs font-bold text-white shadow-md shadow-[#7137A8]/20 hover:from-[#5F2D8E] hover:to-[#7137A8] active:scale-95 transition-all duration-200"
          >
            <PlusCircle className="h-4 w-4" />
            <span>Host Outing</span>
          </Link>

          {isAuthenticated ? (
            <div className="flex items-center gap-2 pl-2 border-l border-[#E8E7E2]">
              {/* Notification Bell with Badge */}
              <div className="relative" ref={notifRef}>
                <button
                  onClick={() => setIsNotifOpen(!isNotifOpen)}
                  title="Notifications"
                  className="relative rounded-xl p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition"
                >
                  <Bell className="h-4 w-4" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[9px] font-black text-white shadow-sm animate-pulse">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>

                {/* Notifications Dropdown Drawer */}
                {isNotifOpen && (
                  <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-3xl bg-white shadow-2xl border border-slate-200/90 overflow-hidden z-50">
                    <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50/50">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-[#26232B]">Notifications</span>
                        {unreadCount > 0 && (
                          <span className="rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-bold text-rose-700">
                            {unreadCount} unread
                          </span>
                        )}
                      </div>
                      {unreadCount > 0 && (
                        <button
                          onClick={() => markAllReadMutation.mutate()}
                          disabled={markAllReadMutation.isPending}
                          className="text-[11px] font-semibold text-[#7137A8] hover:text-[#321044]"
                        >
                          Mark all as read
                        </button>
                      )}
                    </div>

                    <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                      {notifications.length === 0 ? (
                        <div className="py-10 text-center text-xs text-slate-400">
                          No notifications yet.
                        </div>
                      ) : (
                        notifications.map((n) => (
                          <div
                            key={n.id}
                            className={`p-3.5 transition flex items-start gap-3 ${
                              n.is_read ? 'bg-white hover:bg-slate-50' : 'bg-[#F1EAF8]/40 hover:bg-[#F1EAF8]/70'
                            }`}
                          >
                            <div className="mt-0.5 shrink-0">{getNotifIcon(n.notification_type)}</div>
                            <div className="flex-1 min-w-0">
                              {n.link_url ? (
                                <Link
                                  to={n.link_url}
                                  onClick={() => {
                                    if (!n.is_read) markReadMutation.mutate(n.id);
                                    setIsNotifOpen(false);
                                  }}
                                  className="text-xs font-bold text-[#26232B] hover:text-[#7137A8] block truncate"
                                >
                                  {n.title}
                                </Link>
                              ) : (
                                <p className="text-xs font-bold text-[#26232B] truncate">{n.title}</p>
                              )}
                              <p className="text-[11px] text-[#55545C] mt-0.5 line-clamp-2 leading-relaxed">
                                {n.content}
                              </p>
                              <span className="text-[9px] text-slate-400 mt-1 block">
                                {new Date(n.created_at).toLocaleTimeString(undefined, {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </span>
                            </div>
                            {!n.is_read && (
                              <button
                                onClick={() => markReadMutation.mutate(n.id)}
                                title="Mark read"
                                className="shrink-0 p-1 text-slate-400 hover:text-[#7137A8]"
                              >
                                <Check className="h-3.5 w-3.5" />
                              </button>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Profile Capsule */}
              <Link
                to="/profile"
                className="flex items-center gap-2.5 rounded-xl border border-[#E8E7E2] bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:border-[#7137A8]/30 hover:shadow-sm transition-all"
              >
                <div className="h-6 w-6 rounded-lg bg-gradient-to-tr from-[#7137A8] to-[#FF9B32] text-white flex items-center justify-center font-bold text-[11px] shadow-sm">
                  {user?.display_name ? user.display_name.charAt(0).toUpperCase() : <UserIcon className="h-3.5 w-3.5" />}
                </div>
                <span className="max-w-[110px] truncate font-medium text-slate-800">
                  {user?.display_name || 'My Profile'}
                </span>
              </Link>
              <button
                onClick={logout}
                title="Sign Out"
                className="rounded-xl p-2 text-slate-400 hover:bg-red-50 hover:text-red-600 transition"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 pl-1">
              <Link
                to="/login"
                className="rounded-xl px-3.5 py-2 text-xs font-semibold text-[#55545C] hover:text-[#26232B] hover:bg-slate-100 transition"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="rounded-xl bg-[#FF9B32] hover:bg-[#F28B20] px-4 py-2 text-xs font-bold text-slate-950 shadow-sm hover:scale-[1.02] active:scale-95 transition"
              >
                Join MELO
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
