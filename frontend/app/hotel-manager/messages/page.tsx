'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';

interface ChatSession {
  id: string;
  hotelId: string;
  hotelName: string;
  hotelImage: string;
  customerId: string;
  customerName: string;
  customerAvatar?: string;
  lastMessage: string;
  lastMessageTime: Date;
  unreadCount: number;
  messages: Message[];
}

interface Message {
  id: string;
  sender: 'user' | 'hotel';
  text: string;
  timestamp: Date;
}

export default function HotelManagerMessagesPage() {
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [selectedChat, setSelectedChat] = useState<ChatSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  };

  useEffect(() => {
    loadChatHistory();
  }, []);

  useEffect(() => {
    if (selectedChat) {
      scrollToBottom();
    }
  }, [selectedChat?.messages, isTyping]);

  const loadChatHistory = () => {
    // Load from localStorage and filter by current hotel
    const stored = localStorage.getItem('chatHistory');
    const hotelManager = localStorage.getItem('hotelManager');
    
    if (stored && hotelManager) {
      const manager = JSON.parse(hotelManager);
      const allChats = JSON.parse(stored);
      
      // Filter chats for this hotel
      const hotelChats = allChats
        .filter((chat: any) => chat.hotelId === manager.hotelId)
        .map((session: any) => ({
          ...session,
          customerName: 'Khách hàng ' + session.id.substring(0, 8),
          customerAvatar: `https://ui-avatars.com/api/?name=${session.id}&background=0071c2&color=fff`,
          lastMessageTime: new Date(session.lastMessageTime),
          messages: session.messages.map((msg: any) => ({
            ...msg,
            timestamp: new Date(msg.timestamp),
          })),
        }));
      
      setChatSessions(hotelChats);
    }
    setLoading(false);
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
      return date.toLocaleTimeString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
      });
    } else if (days === 1) {
      return 'Hôm qua';
    } else if (days < 7) {
      return `${days} ngày trước`;
    } else {
      return date.toLocaleDateString('vi-VN');
    }
  };

  const handleSendMessage = () => {
    if (!inputMessage.trim() || !selectedChat) return;

    const hotelMessage: Message = {
      id: Date.now().toString(),
      sender: 'hotel',
      text: inputMessage,
      timestamp: new Date(),
    };

    // Update messages in selected chat
    const updatedMessages = [...selectedChat.messages, hotelMessage];
    const updatedChat = {
      ...selectedChat,
      messages: updatedMessages,
      lastMessage: inputMessage,
      lastMessageTime: new Date(),
    };

    // Update chat sessions
    const updatedSessions = chatSessions.map((session) =>
      session.id === selectedChat.id ? updatedChat : session
    );
    setChatSessions(updatedSessions);
    setSelectedChat(updatedChat);
    setInputMessage('');

    // Save to localStorage (update original chatHistory)
    const allChats = JSON.parse(localStorage.getItem('chatHistory') || '[]');
    const updatedAllChats = allChats.map((chat: any) =>
      chat.id === selectedChat.id
        ? {
            ...chat,
            messages: updatedMessages,
            lastMessage: inputMessage,
            lastMessageTime: new Date(),
          }
        : chat
    );
    localStorage.setItem('chatHistory', JSON.stringify(updatedAllChats));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Tin nhắn khách hàng
        </h1>
        <p className="text-gray-600">
          Quản lý và trả lời tin nhắn từ khách hàng
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chat List */}
        <div className="lg:col-span-1">
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">
                Tin nhắn ({chatSessions.length})
              </h2>
              {chatSessions.some(s => s.unreadCount > 0) && (
                <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1">
                  {chatSessions.reduce((sum, s) => sum + s.unreadCount, 0)} mới
                </span>
              )}
            </div>
            
            {loading ? (
              <div className="text-center py-8">
                <p className="text-gray-600">Đang tải...</p>
              </div>
            ) : chatSessions.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-5xl mb-3">💬</div>
                <p className="text-gray-600 mb-2">
                  Chưa có tin nhắn nào
                </p>
                <p className="text-sm text-gray-500">
                  Khách hàng sẽ liên hệ qua trang chi tiết khách sạn
                </p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[600px] overflow-y-auto">
                {chatSessions.map((session) => (
                  <div
                    key={session.id}
                    onClick={() => setSelectedChat(session)}
                    className={`p-3 rounded-lg cursor-pointer transition-all ${
                      selectedChat?.id === session.id
                        ? 'bg-blue-50 border-2 border-[#0071c2]'
                        : 'hover:bg-gray-50 border-2 border-transparent'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="relative">
                        <img
                          src={session.customerAvatar}
                          alt={session.customerName}
                          className="w-12 h-12 rounded-full"
                        />
                        {session.unreadCount > 0 && (
                          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                            {session.unreadCount}
                          </span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="font-semibold text-gray-900 text-sm truncate">
                            {session.customerName}
                          </h3>
                        </div>
                        <p className="text-xs text-gray-600 truncate">
                          {session.lastMessage}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {formatTime(session.lastMessageTime)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Chat Messages */}
        <div className="lg:col-span-2">
          {selectedChat ? (
            <Card className="h-[700px] flex flex-col">
              {/* Chat Header */}
              <div className="flex items-center gap-3 pb-4 border-b border-gray-200">
                <img
                  src={selectedChat.customerAvatar}
                  alt={selectedChat.customerName}
                  className="w-12 h-12 rounded-full"
                />
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900">
                    {selectedChat.customerName}
                  </h3>
                  <p className="text-xs text-gray-500">
                    {selectedChat.messages.length} tin nhắn
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-900">
                    {selectedChat.hotelName}
                  </p>
                  <p className="text-xs text-gray-500">Khách sạn của bạn</p>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto py-4 space-y-4">
                {selectedChat.messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${
                      message.sender === 'hotel'
                        ? 'justify-end'
                        : 'justify-start'
                    }`}
                  >
                    <div
                      className={`max-w-[75%] rounded-2xl px-4 py-2 ${
                        message.sender === 'hotel'
                          ? 'bg-[#0071c2] text-white'
                          : 'bg-gray-100 text-gray-900'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">
                        {message.text}
                      </p>
                      <p
                        className={`text-xs mt-1 ${
                          message.sender === 'hotel'
                            ? 'text-white/70'
                            : 'text-gray-500'
                        }`}
                      >
                        {message.timestamp.toLocaleTimeString('vi-VN', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>
                ))}
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 text-gray-900 rounded-2xl px-4 py-3">
                      <div className="flex gap-1">
                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-75" />
                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-150" />
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Quick Replies */}
              <div className="py-3 border-t border-gray-200">
                <p className="text-xs text-gray-600 mb-2">Trả lời nhanh:</p>
                <div className="flex flex-wrap gap-2">
                  {[
                    'Cảm ơn bạn đã quan tâm!',
                    'Chúng tôi sẽ kiểm tra và phản hồi ngay.',
                    'Phòng hiện đang còn trống.',
                    'Rất tiếc, phòng đã kín.',
                  ].map((reply, index) => (
                    <button
                      key={index}
                      onClick={() => setInputMessage(reply)}
                      className="text-xs bg-blue-50 text-[#0071c2] px-3 py-1.5 rounded-full hover:bg-blue-100 transition-colors border border-blue-200"
                    >
                      {reply}
                    </button>
                  ))}
                </div>
              </div>

              {/* Input */}
              <div className="pt-3 border-t border-gray-200">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Nhập tin nhắn trả lời..."
                    className="flex-1 px-4 py-2 border-2 border-gray-200 rounded-full focus:ring-2 focus:ring-[#0071c2] focus:border-[#0071c2] transition-all text-gray-900 text-sm"
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!inputMessage.trim()}
                    className="bg-[#0071c2] text-white rounded-full p-2 px-4 hover:bg-[#005999] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    <span className="text-xl">➤</span>
                  </button>
                </div>
              </div>
            </Card>
          ) : (
            <Card className="h-[700px] flex items-center justify-center">
              <div className="text-center">
                <div className="text-6xl mb-4">💬</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Chọn tin nhắn để xem
                </h3>
                <p className="text-gray-600">
                  Chọn từ danh sách bên trái để trả lời khách hàng
                </p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
