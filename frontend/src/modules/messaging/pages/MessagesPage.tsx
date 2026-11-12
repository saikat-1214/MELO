import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient, getErrorMessage } from '@/shared/api/client';
import { useAuth } from '@/modules/authentication/context/AuthContext';
import {
  MessageSquare,
  ShieldCheck,
  Users,
  Send,
  Loader2,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface MessageItem {
  id: string;
  conversation_id: string;
  sender_id?: string | null;
  sender_name?: string | null;
  sender_avatar?: string | null;
  content: string;
  message_type: 'USER' | 'SYSTEM' | string;
  created_at: string;
}

interface ConversationItem {
  id: string;
  activity_id?: string | null;
  title: string;
  conversation_type: string;
  member_count: number;
  last_message?: MessageItem | null;
  created_at: string;
}

export const MessagesPage: React.FC = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedConvId, setSelectedConvId] = useState<string | null>(null);
  const [inputText, setInputText] = useState('');
  const [sendError, setSendError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const wsRef = useRef<WebSocket | null>(null);

  // 1. Fetch user's active conversations
  const {
    data: conversations,
    isLoading: isConvLoading,
    refetch: refetchConversations,
  } = useQuery<ConversationItem[]>({
    queryKey: ['conversations'],
    queryFn: async () => {
      const res = await apiClient.get<ConversationItem[]>('/conversations');
      return res.data;
    },
    refetchInterval: 10000,
  });

  // Automatically select first conversation if available and none selected
  useEffect(() => {
    if (!selectedConvId && conversations && conversations.length > 0) {
      setSelectedConvId(conversations[0].id);
    }
  }, [conversations, selectedConvId]);

  // 2. Fetch messages for selected conversation
  const {
    data: messages,
    isLoading: isMessagesLoading,
  } = useQuery<MessageItem[]>({
    queryKey: ['conversation-messages', selectedConvId],
    queryFn: async () => {
      if (!selectedConvId) return [];
      const res = await apiClient.get<MessageItem[]>(`/conversations/${selectedConvId}/messages`);
      return res.data;
    },
    enabled: !!selectedConvId,
    refetchInterval: 4000,
  });

  // 3. Connect WebSocket for live instant streaming
  useEffect(() => {
    if (!selectedConvId) return;

    const token = localStorage.getItem('access_token');
    if (!token) return;

    const wsUrl = `ws://localhost:8000/api/v1/ws/conversations/${selectedConvId}?token=${token}`;
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onmessage = (event) => {
      try {
        const newMsg: MessageItem = JSON.parse(event.data);
        queryClient.setQueryData<MessageItem[]>(
          ['conversation-messages', selectedConvId],
          (old) => {
            if (!old) return [newMsg];
            if (old.some((m) => m.id === newMsg.id)) return old;
            return [...old, newMsg];
          }
        );
        refetchConversations();
      } catch (e) {
        console.warn('WS message parse error', e);
      }
    };

    return () => {
      ws.close();
    };
  }, [selectedConvId, queryClient, refetchConversations]);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // 4. Send Message Mutation
  const sendMutation = useMutation({
    mutationFn: async (text: string) => {
      const res = await apiClient.post<MessageItem>(`/conversations/${selectedConvId}/messages`, {
        content: text.trim(),
      });
      return res.data;
    },
    onSuccess: (newMsg) => {
      setInputText('');
      setSendError(null);
      queryClient.setQueryData<MessageItem[]>(
        ['conversation-messages', selectedConvId],
        (old) => {
          if (!old) return [newMsg];
          if (old.some((m) => m.id === newMsg.id)) return old;
          return [...old, newMsg];
        }
      );
      refetchConversations();
    },
    onError: (err) => {
      setSendError(getErrorMessage(err));
    },
  });

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !selectedConvId) return;
    sendMutation.mutate(inputText);
  };

  const selectedConv = conversations?.find((c) => c.id === selectedConvId);

  return (
    <div className="space-y-6 pb-12">
      <div className="border-b border-slate-200/80 pb-4">
        <div className="flex items-center gap-2 text-[#7137A8] text-xs font-bold uppercase tracking-wider mb-1">
          <MessageSquare className="h-4 w-4" />
          Real-Time Coordination
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900">Activity Group Chats</h1>
        <p className="text-sm text-slate-500 mt-1">
          Authorized communication channels for approved participants to coordinate meeting times, routes, and public landmarks.
        </p>
      </div>

      {/* Main Messenger Layout */}
      <div className="grid grid-cols-1 md:grid-cols-12 rounded-3xl border border-slate-200/90 bg-white shadow-soft overflow-hidden min-h-[620px] max-h-[750px]">
        {/* Left Sidebar: Conversations List */}
        <div className="md:col-span-4 border-r border-slate-200/80 flex flex-col bg-slate-50/50">
          <div className="p-4 border-b border-slate-200/80 bg-white flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Active Outings ({conversations?.length || 0})
            </h2>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
            {isConvLoading ? (
              <div className="p-8 text-center">
                <Loader2 className="mx-auto h-6 w-6 text-[#7137A8] animate-spin" />
              </div>
            ) : !conversations || conversations.length === 0 ? (
              <div className="p-8 text-center space-y-2">
                <div className="h-12 w-12 mx-auto rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400">
                  <MessageSquare className="h-6 w-6" />
                </div>
                <p className="text-xs font-bold text-slate-700">No Active Chats</p>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Join an activity or host one to unlock authorized group messaging.
                </p>
                <Link
                  to="/"
                  className="inline-block mt-2 rounded-xl bg-slate-900 px-3 py-1.5 text-[11px] font-bold text-white hover:bg-slate-800 transition"
                >
                  Explore Outings
                </Link>
              </div>
            ) : (
              conversations.map((c) => {
                const isSelected = c.id === selectedConvId;
                return (
                  <button
                    key={c.id}
                    onClick={() => {
                      setSelectedConvId(c.id);
                      setSendError(null);
                    }}
                    className={`w-full text-left p-4 transition flex flex-col gap-1 ${
                      isSelected
                        ? 'bg-white border-l-4 border-[#7137A8] shadow-sm'
                        : 'hover:bg-slate-100/70'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold text-slate-900 truncate max-w-[180px]">
                        {c.title}
                      </p>
                      <span className="text-[10px] text-slate-400 font-medium">
                        {c.member_count} members
                      </span>
                    </div>
                    {c.last_message ? (
                      <p className="text-[11px] text-slate-500 truncate">
                        <strong className="text-slate-700">{c.last_message.sender_name}:</strong>{' '}
                        {c.last_message.content}
                      </p>
                    ) : (
                      <p className="text-[11px] text-slate-400 italic">No messages yet</p>
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right Main Area: Chat Window / Empty State */}
        <div className="md:col-span-8 flex flex-col justify-between bg-white">
          {selectedConv ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-slate-100 bg-white flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">{selectedConv.title}</h3>
                  <p className="text-[11px] text-slate-500">
                    {selectedConv.member_count} confirmed companions in this chat
                  </p>
                </div>
                {selectedConv.activity_id && (
                  <Link
                    to={`/activities/${selectedConv.activity_id}`}
                    className="inline-flex items-center gap-1 rounded-xl border border-slate-200 px-3 py-1.5 text-[11px] font-bold text-slate-700 hover:bg-slate-50 transition"
                  >
                    <span>View Activity</span>
                    <ExternalLink className="h-3 w-3" />
                  </Link>
                )}
              </div>

              {/* Messages Scroll Area */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-slate-50/30">
                {isMessagesLoading ? (
                  <div className="flex justify-center py-12">
                    <Loader2 className="h-6 w-6 text-[#7137A8] animate-spin" />
                  </div>
                ) : !messages || messages.length === 0 ? (
                  <div className="py-16 text-center space-y-2">
                    <p className="text-xs text-slate-500">
                      No messages yet. Send a greeting to start coordinating!
                    </p>
                  </div>
                ) : (
                  messages.map((m) => {
                    const isMe = user?.id === m.sender_id;
                    const isSystem = m.message_type === 'SYSTEM';

                    if (isSystem) {
                      return (
                        <div key={m.id} className="flex justify-center my-2">
                          <span className="rounded-full bg-slate-100 px-3 py-1 text-[10px] font-semibold text-slate-600">
                            {m.content}
                          </span>
                        </div>
                      );
                    }

                    return (
                      <div
                        key={m.id}
                        className={`flex items-end gap-2.5 ${isMe ? 'justify-end' : 'justify-start'}`}
                      >
                        {!isMe && (
                          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-800 text-[10px] font-bold text-white shadow-sm">
                            {m.sender_name?.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div
                          className={`max-w-[75%] rounded-2xl px-4 py-2.5 shadow-sm text-xs leading-relaxed ${
                            isMe
                              ? 'bg-gradient-to-r from-[#7137A8] to-[#9B51CA] text-white rounded-br-xs'
                              : 'bg-white border border-slate-200 text-slate-900 rounded-bl-xs'
                          }`}
                        >
                          {!isMe && (
                            <p className="text-[10px] font-bold text-[#7137A8] mb-0.5">
                              {m.sender_name}
                            </p>
                          )}
                          <p className="whitespace-pre-wrap">{m.content}</p>
                          <span
                            className={`text-[9px] mt-1 block text-right ${
                              isMe ? 'text-[#F1EAF8]' : 'text-slate-400'
                            }`}
                          >
                            {new Date(m.created_at).toLocaleTimeString(undefined, {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input Bar */}
              <div className="p-4 border-t border-slate-100 bg-white space-y-2">
                {sendError && (
                  <div className="rounded-xl bg-rose-50 border border-rose-200 p-2.5 text-xs text-rose-700 flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
                    <span>{sendError}</span>
                  </div>
                )}
                <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="Type a message to confirmed attendees (Enter to send)..."
                    className="flex-1 rounded-2xl border border-slate-300 px-4 py-2.5 text-xs placeholder:text-slate-400 focus:border-[#7137A8] focus:outline-none focus:ring-2 focus:ring-[#7137A8]/20 transition"
                  />
                  <button
                    type="submit"
                    disabled={sendMutation.isPending || !inputText.trim()}
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-r from-[#7137A8] to-[#9B51CA] text-white shadow-md hover:from-[#5F2D8E] hover:to-[#7137A8] disabled:opacity-50 transition"
                  >
                    {sendMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </button>
                </form>
              </div>
            </>
          ) : (
            /* Empty State */
            <div className="flex-1 flex flex-col items-center justify-center text-center max-w-md mx-auto p-6 sm:p-10 space-y-4">
              <div className="h-16 w-16 rounded-3xl bg-[#F1EAF8] text-[#7137A8] flex items-center justify-center shadow-inner">
                <Users className="h-8 w-8" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-extrabold text-slate-900">
                  Safe, Gated Group Discussions
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  To prevent spam and unwanted solicitations, MELO group chats are unlocked only for approved members of active meetups.
                </p>
              </div>

              <div className="rounded-2xl border border-[#7137A8]/20 bg-[#F1EAF8]/70 p-4 text-xs text-[#321044] text-left space-y-2">
                <div className="flex items-center gap-2 font-bold text-[#321044]">
                  <ShieldCheck className="h-4 w-4 text-[#7137A8]" />
                  Community Chat Standards:
                </div>
                <ul className="list-disc list-inside space-y-1 text-[11px] text-[#7137A8]">
                  <li>Coordinate logistics at the designated public landmark</li>
                  <li>No commercial selling or dating solicitations allowed</li>
                  <li>Respect all attendees' personal boundaries and privacy</li>
                </ul>
              </div>

              <div className="pt-2">
                <Link
                  to="/"
                  className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-xs font-bold text-white hover:bg-slate-800 transition"
                >
                  Find an Activity to Join
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
