import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { MessageCircle, Send, ChevronRight, Loader2, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import {
  getConversationsApi,
  getConversationMessagesApi,
  sendMessageApi,
  markConversationReadApi,
  getUnreadCountApi
} from '../config/api';

const PAGE_SIZE = 20;

const formatMessageTime = (iso) => {
  if (!iso) return '';
  const d = new Date(iso);
  const now = new Date();
  const sameDay = d.toDateString() === now.toDateString();
  if (sameDay) return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
};

const Messages = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, token, isAuthenticated } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [selectedPartner, setSelectedPartner] = useState(null);
  const [startConversationApplied, setStartConversationApplied] = useState(false);
  const [messages, setMessages] = useState({ content: [], totalElements: 0, totalPages: 0, number: 0 });
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [error, setError] = useState('');
  const [unreadTotal, setUnreadTotal] = useState(0);
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
  }, [isAuthenticated, navigate]);

  const loadConversations = async () => {
    if (!token) return;
    setLoadingConversations(true);
    setError('');
    try {
      const list = await getConversationsApi(token);
      setConversations(list);
      const countRes = await getUnreadCountApi(token);
      setUnreadTotal(countRes.unreadCount ?? 0);
      return list;
    } catch (err) {
      setError(err.message || 'Failed to load conversations');
      return [];
    } finally {
      setLoadingConversations(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated || !token) return;
    const startConv = location.state?.startConversation;
    if (startConv && !startConversationApplied) {
      setStartConversationApplied(true);
      loadConversations().then((list) => {
        const existing = Array.isArray(list) && list.find((c) => Number(c.partnerId) === Number(startConv.partnerId));
        if (existing) {
          setSelectedPartner(existing);
          loadMessages(existing.partnerId);
        } else {
          setSelectedPartner({
            partnerId: startConv.partnerId,
            partnerName: startConv.partnerName || 'Guide',
            partnerEmail: startConv.partnerEmail || '',
            partnerRole: startConv.partnerRole || 'GUIDE'
          });
          setMessages({ content: [], totalElements: 0, totalPages: 0, number: 0 });
        }
        navigate(location.pathname, { replace: true, state: {} });
      });
    } else {
      loadConversations();
    }
  }, [isAuthenticated, token]);

  useEffect(() => {
    document.title = unreadTotal > 0 ? `Inbox (${unreadTotal}) – Sea & Tea` : 'Inbox – Sea & Tea';
    return () => { document.title = 'Sea & Tea'; };
  }, [unreadTotal]);

  const loadMessages = async (partnerId, page = 0) => {
    if (!token || !partnerId) return;
    setLoadingMessages(true);
    setError('');
    try {
      const data = await getConversationMessagesApi(partnerId, { page, size: PAGE_SIZE }, token);
      setMessages(data);
      await markConversationReadApi(partnerId, token);
      const countRes = await getUnreadCountApi(token);
      setUnreadTotal(countRes.unreadCount ?? 0);
      setConversations((prev) =>
        prev.map((c) =>
          c.partnerId === partnerId ? { ...c, unreadCount: 0 } : c
        )
      );
    } catch (err) {
      setError(err.message || 'Failed to load messages');
    } finally {
      setLoadingMessages(false);
    }
  };

  const handleSelectConversation = (partner) => {
    setSelectedPartner(partner);
    loadMessages(partner.partnerId);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    const text = messageText.trim();
    if (!text || !selectedPartner || !token || sending) return;
    setSending(true);
    setError('');
    try {
      await sendMessageApi(
        { receiverId: selectedPartner.partnerId, message: text },
        token
      );
      setMessageText('');
      await loadMessages(selectedPartner.partnerId);
      await loadConversations();
    } catch (err) {
      setError(err.message || 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const loadMoreMessages = async () => {
    if (!selectedPartner || messages.number >= messages.totalPages - 1 || loadingMessages) return;
    const nextPage = messages.number + 1;
    setLoadingMessages(true);
    try {
      const data = await getConversationMessagesApi(
        selectedPartner.partnerId,
        { page: nextPage, size: PAGE_SIZE },
        token
      );
      setMessages((prev) => ({
        ...data,
        content: [...(prev.content || []), ...(data.content || [])]
      }));
    } catch (err) {
      setError(err.message || 'Failed to load more');
    } finally {
      setLoadingMessages(false);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.content]);

  if (!isAuthenticated) return null;

  const currentUserId = user?.id;

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50/50 via-white to-secondary-50/50 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-2 mb-6">
          <MessageCircle className="h-8 w-8 text-primary-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Inbox</h1>
            <p className="text-sm text-gray-500 mt-0.5">Your conversations with guides and support</p>
          </div>
          {unreadTotal > 0 && (
            <span className="ml-2 rounded-full bg-primary-600 text-white text-sm font-semibold px-2.5 py-0.5">
              {unreadTotal} unread
            </span>
          )}
        </div>

        {error && (
          <div className="mb-4 flex items-center gap-2 rounded-xl bg-red-50 border border-red-200 text-red-700 px-4 py-3">
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="glass rounded-2xl border border-white/20 shadow-xl overflow-hidden flex flex-col md:flex-row min-h-[500px]">
          {/* Conversations list */}
          <div className="w-full md:w-80 border-b md:border-b-0 md:border-r border-white/20 flex flex-col bg-white/30">
            <div className="p-3 border-b border-white/20 bg-white/50">
              <h2 className="text-sm font-semibold text-gray-600 uppercase tracking-wider">Conversations</h2>
            </div>
            <div className="flex-1 overflow-y-auto">
              {loadingConversations ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
                </div>
              ) : conversations.length === 0 ? (
                <p className="p-4 text-gray-500 text-sm text-center">No conversations yet.</p>
              ) : (
                <ul className="divide-y divide-white/20">
                  {conversations.map((conv) => (
                    <li key={conv.partnerId}>
                      <button
                        type="button"
                        onClick={() => handleSelectConversation(conv)}
                        className={`w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-white/50 transition-colors ${
                          selectedPartner?.partnerId === conv.partnerId ? 'bg-primary-50/80 border-l-4 border-primary-600' : ''
                        }`}
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-medium text-gray-900 truncate">{conv.partnerName}</span>
                            {conv.unreadCount > 0 && (
                              <span className="flex-shrink-0 rounded-full bg-primary-600 text-white text-xs font-semibold min-w-[1.25rem] h-5 flex items-center justify-center px-1.5">
                                {conv.unreadCount}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-500 truncate mt-0.5">{conv.lastMessagePreview || 'No messages'}</p>
                          <p className="text-xs text-gray-400 mt-0.5">{formatMessageTime(conv.lastMessageAt)}</p>
                        </div>
                        <ChevronRight className="h-5 w-5 text-gray-400 flex-shrink-0" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Thread */}
          <div className="flex-1 flex flex-col min-h-0">
            {!selectedPartner ? (
              <div className="flex-1 flex items-center justify-center text-gray-500 p-8">
                <div className="text-center">
                  <MessageCircle className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                  <p className="font-medium text-gray-600">Select a conversation</p>
                  <p className="text-sm text-gray-500 mt-1">Your chats with guides and admins will appear here.</p>
                </div>
              </div>
            ) : (
              <>
                <div className="p-4 border-b border-white/20 bg-white/50 flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                    <span className="text-primary-600 font-semibold">
                      {(selectedPartner.partnerName || '?').charAt(0)}
                    </span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{selectedPartner.partnerName}</p>
                    <p className="text-xs text-gray-500">{selectedPartner.partnerEmail} · {selectedPartner.partnerRole}</p>
                  </div>
                </div>

                <div
                  ref={messagesContainerRef}
                  className="flex-1 overflow-y-auto p-4 space-y-3 flex flex-col-reverse"
                  style={{ minHeight: 200 }}
                >
                  {loadingMessages && messages.content?.length === 0 ? (
                    <div className="flex justify-center py-12">
                      <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
                    </div>
                  ) : (
                    <>
                      <div ref={messagesEndRef} />
                      {(messages.content || []).map((msg) => {
                        const isMe = msg.senderId === currentUserId;
                        return (
                          <div
                            key={msg.id}
                            className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                          >
                            <div
                              className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                                isMe
                                  ? 'bg-primary-600 text-white rounded-br-md'
                                  : 'bg-gray-100 text-gray-900 rounded-bl-md'
                              }`}
                            >
                              {!isMe && (
                                <p className="text-xs font-medium text-primary-600 mb-0.5">{msg.senderName}</p>
                              )}
                              <p className="text-sm whitespace-pre-wrap break-words">{msg.message}</p>
                              <p className={`text-xs mt-1 ${isMe ? 'text-primary-100' : 'text-gray-500'}`}>
                                {formatMessageTime(msg.createdAt)}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                      {messages.totalPages > 1 && messages.number < messages.totalPages - 1 && (
                        <div className="flex justify-center py-2">
                          <button
                            type="button"
                            onClick={loadMoreMessages}
                            disabled={loadingMessages}
                            className="text-sm text-primary-600 hover:underline disabled:opacity-50"
                          >
                            {loadingMessages ? 'Loading…' : 'Load older messages'}
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </div>

                <form onSubmit={handleSendMessage} className="p-4 border-t border-white/20 bg-white/50">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      placeholder="Type a message…"
                      maxLength={5000}
                      className="flex-1 rounded-xl border border-gray-200 px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      disabled={sending}
                    />
                    <button
                      type="submit"
                      disabled={sending || !messageText.trim()}
                      className="btn-primary flex items-center gap-2 px-4 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {sending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                      Send
                    </button>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">{messageText.length}/5000</p>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Messages;
