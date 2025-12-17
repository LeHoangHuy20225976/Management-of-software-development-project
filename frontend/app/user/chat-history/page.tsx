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

export default function ChatHistoryPage() {
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
    // Load from localStorage (mock data for now)
    const stored = localStorage.getItem('chatHistory');
    if (stored) {
      const parsed = JSON.parse(stored);
      // Convert date strings back to Date objects
      const sessions = parsed.map((session: any) => ({
        ...session,
        lastMessageTime: new Date(session.lastMessageTime),
        messages: session.messages.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp),
        })),
      }));
      setChatSessions(sessions);
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

    const userMessage: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: inputMessage,
      timestamp: new Date(),
    };

    // Update messages in selected chat
    const updatedMessages = [...selectedChat.messages, userMessage];
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
    setIsTyping(true);

    // Save to localStorage
    localStorage.setItem('chatHistory', JSON.stringify(updatedSessions));

    // Simulate hotel response
    setTimeout(() => {
      const responses = [
        'Cảm ơn bạn đã liên hệ. Chúng tôi sẽ phản hồi ngay.',
        'Vâng, chúng tôi hiểu yêu cầu của bạn. Chúng tôi sẽ kiểm tra và trả lời sớm nhất.',
        'Chúng tôi có thể hỗ trợ bạn về vấn đề này. Vui lòng cho biết thêm chi tiết.',
        'Đội ngũ của chúng tôi sẽ xử lý yêu cầu này ngay lập tức.',
      ];

      const hotelMessage: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'hotel',
        text: responses[Math.floor(Math.random() * responses.length)],
        timestamp: new Date(),
      };

      const finalMessages = [...updatedMessages, hotelMessage];
      const finalChat = {
        ...updatedChat,
        messages: finalMessages,
        lastMessage: hotelMessage.text,
        lastMessageTime: new Date(),
      };

      const finalSessions = chatSessions.map((session) =>
        session.id === selectedChat.id ? finalChat : session
      );
      
      setChatSessions(finalSessions);
      setSelectedChat(finalChat);
      setIsTyping(false);
      localStorage.setItem('chatHistory', JSON.stringify(finalSessions));
    }, 1000 + Math.random() * 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Lịch sử chat
          </h1>
          <p className="text-gray-600">
            Xem lại các cuộc trò chuyện với khách sạn
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Chat List */}
            <div className="lg:col-span-1">
              <Card>
                <h2 className="text-lg font-bold text-gray-900 mb-4">
                  Cuộc trò chuyện
                </h2>
                {loading ? (
                  <div className="text-center py-8">
                    <p className="text-gray-600">Đang tải...</p>
                  </div>
                ) : chatSessions.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-5xl mb-3">💬</div>
                    <p className="text-gray-600 mb-4">
                      Chưa có cuộc trò chuyện nào
                    </p>
                    <Link href="/search">
                      <Button size="sm">Tìm khách sạn</Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-2">
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
                          <img
                            src={session.hotelImage}
                            alt={session.hotelName}
                            className="w-12 h-12 rounded-lg object-cover"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <h3 className="font-semibold text-gray-900 text-sm truncate">
                                {session.hotelName}
                              </h3>
                              {session.unreadCount > 0 && (
                                <span className="bg-red-500 text-white text-xs rounded-full px-2 py-0.5 ml-2">
                                  {session.unreadCount}
                                </span>
                              )}
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
                <Card className="h-[600px] flex flex-col">
                  {/* Chat Header */}
                  <div className="flex items-center gap-3 pb-4 border-b border-gray-200">
                    <img
                      src={selectedChat.hotelImage}
                      alt={selectedChat.hotelName}
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900">
                        {selectedChat.hotelName}
                      </h3>
                      <p className="text-xs text-gray-500">
                        {selectedChat.messages.length} tin nhắn
                      </p>
                    </div>
                    <Link href={`/hotel/${selectedChat.hotelId}`}>
                      <Button size="sm">Xem khách sạn</Button>
                    </Link>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto py-4 space-y-4">
                    {selectedChat.messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${
                          message.sender === 'user'
                            ? 'justify-end'
                            : 'justify-start'
                        }`}
                      >
                        <div
                          className={`max-w-[75%] rounded-2xl px-4 py-2 ${
                            message.sender === 'user'
                              ? 'bg-[#0071c2] text-white'
                              : 'bg-gray-100 text-gray-900'
                          }`}
                        >
                          <p className="text-sm whitespace-pre-wrap">
                            {message.text}
                          </p>
                          <p
                            className={`text-xs mt-1 ${
                              message.sender === 'user'
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

                  {/* Input */}
                  <div className="pt-4 border-t border-gray-200">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Nhập tin nhắn..."
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
                    <div className="mt-2 text-right">
                      <Link href={`/hotel/${selectedChat.hotelId}`}>
                        <button className="text-sm text-[#0071c2] hover:underline">
                          Xem trang khách sạn →
                        </button>
                      </Link>
                    </div>
                  </div>
                </Card>
              ) : (
                <Card className="h-[600px] flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-6xl mb-4">💬</div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      Chọn một cuộc trò chuyện
                    </h3>
                    <p className="text-gray-600">
                      Chọn từ danh sách bên trái để xem chi tiết
                    </p>
                  </div>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
  );
}
