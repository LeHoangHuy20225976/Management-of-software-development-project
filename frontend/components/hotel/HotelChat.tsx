'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';

interface Message {
  id: string;
  sender: 'user' | 'hotel';
  text: string;
  timestamp: Date;
}

interface HotelChatProps {
  hotelId: string;
  hotelName: string;
}

export function HotelChat({ hotelId, hotelName }: HotelChatProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      // Welcome message when first opening chat
      const welcomeMessage: Message = {
        id: '1',
        sender: 'hotel',
        text: `Xin chào! Chúng tôi là ${hotelName}. Chúng tôi có thể giúp gì cho bạn?`,
        timestamp: new Date(),
      };
      setMessages([welcomeMessage]);
    }
  }, [isOpen, hotelName, messages.length]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: inputMessage,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

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

      setMessages((prev) => [...prev, hotelMessage]);
      setIsTyping(false);
    }, 1000 + Math.random() * 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const quickQuestions = [
    'Giá phòng cho 2 người?',
    'Có chỗ đỗ xe không?',
    'Check-in lúc mấy giờ?',
    'Có phục vụ ăn sáng không?',
  ];

  const handleQuickQuestion = (question: string) => {
    setInputMessage(question);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-24 z-50 bg-green-600 text-white rounded-full p-4 shadow-lg hover:bg-green-700 transition-all duration-300 hover:scale-110 flex items-center gap-2"
      >
        <span className="text-2xl">🏨</span>
        <span className="font-semibold hidden sm:inline">Chat với khách sạn</span>
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-24 z-50 w-96 max-w-[calc(100vw-3rem)] h-[600px] max-h-[calc(100vh-8rem)] flex flex-col">
      <Card className="h-full flex flex-col shadow-2xl">
        {/* Header */}
        <div className="bg-[#0071c2] text-white p-4 rounded-t-lg flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <span className="text-xl">🏨</span>
            </div>
            <div>
              <h3 className="font-bold text-lg">{hotelName}</h3>
              <p className="text-xs text-white/80">Thường trả lời trong vài phút</p>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="text-white/80 hover:text-white text-2xl leading-none"
          >
            ✕
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.sender === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`max-w-[75%] rounded-2xl px-4 py-2 ${
                  message.sender === 'user'
                    ? 'bg-[#0071c2] text-white'
                    : 'bg-white text-gray-900 border border-gray-200'
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                <p
                  className={`text-xs mt-1 ${
                    message.sender === 'user' ? 'text-white/70' : 'text-gray-500'
                  }`}
                >
                  {formatTime(message.timestamp)}
                </p>
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-white text-gray-900 border border-gray-200 rounded-2xl px-4 py-3">
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

        {/* Quick Questions */}
        {messages.length <= 2 && (
          <div className="px-4 py-2 border-t border-gray-200 bg-white">
            <p className="text-xs text-gray-600 mb-2">Câu hỏi thường gặp:</p>
            <div className="flex flex-wrap gap-2">
              {quickQuestions.map((question, index) => (
                <button
                  key={index}
                  onClick={() => handleQuickQuestion(question)}
                  className="text-xs bg-blue-50 text-[#0071c2] px-3 py-1.5 rounded-full hover:bg-blue-100 transition-colors border border-blue-200"
                >
                  {question}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <div className="p-4 border-t border-gray-200 bg-white rounded-b-lg">
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
        </div>
      </Card>
    </div>
  );
}
