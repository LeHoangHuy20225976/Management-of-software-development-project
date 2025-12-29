'use client';

import { useState, useRef, useEffect } from 'react';
import { aiApi } from '@/lib/api/services';
import { Send, Bot, User, Image as ImageIcon } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useAuth } from '@/lib/context/AuthContext';

interface ChatMessage {
  role: 'user' | 'ai';
  content: string;
  images?: Array<{
    image_id: number;
    image_url: string;
    similarity_score: number;
    entity_name?: string;
  }>;
  timestamp: Date;
}

export default function HotelChatbot({ hotelId }: { hotelId?: number }) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      role: 'user',
      content: inputMessage,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      console.log('💬 Sending chat request:', {
        message: inputMessage,
        user_id: user?.user_id,
        user: user,
      });

      const response = await aiApi.chatWithImages({
        message: inputMessage,
        user_id: user?.user_id, // Send user_id if user is logged in
        hotel_id: hotelId,
        conversation_id: conversationId,
        include_images: true,
        max_images: 5,
        image_similarity_threshold: 0.3,
      });

      const aiMessage: ChatMessage = {
        role: 'ai',
        content: response.response,
        images: response.images,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiMessage]);
      setConversationId(response.conversation_id);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: ChatMessage = {
        role: 'ai',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-[600px] bg-white rounded-lg shadow-lg">
      {/* Header */}
      <div className="bg-blue-600 text-white p-4 rounded-t-lg">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Bot className="w-5 h-5" />
          Hotel AI Assistant
        </h2>
        <p className="text-sm text-blue-100">Ask me anything about hotels!</p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-gray-500 mt-8">
            <Bot className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p>Start a conversation!</p>
            {user && (
              <p className="text-sm mt-2 text-green-600">
                ✓ Logged in as {user.name}
              </p>
            )}
            <p className="text-sm mt-2">Try asking about:</p>
            <div className="mt-2 space-y-1 text-sm">
              <p>• Hotel amenities</p>
              <p>• Room availability</p>
              {user && <p>• My bookings</p>}
              <p>• Nearby attractions</p>
            </div>
          </div>
        )}

        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] ${
                message.role === 'user'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-800'
              } rounded-lg p-3`}
            >
              <div className="flex items-start gap-2 mb-1">
                {message.role === 'ai' ? (
                  <Bot className="w-5 h-5 mt-0.5 flex-shrink-0" />
                ) : (
                  <User className="w-5 h-5 mt-0.5 flex-shrink-0" />
                )}
                <div className="flex-1">
                  {message.role === 'ai' ? (
                    <div className="prose prose-sm max-w-none prose-headings:mt-2 prose-headings:mb-2 prose-p:my-1 prose-ul:my-1 prose-li:my-0">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {message.content}
                      </ReactMarkdown>
                    </div>
                  ) : (
                    <p className="whitespace-pre-wrap">{message.content}</p>
                  )}

                  {/* Images */}
                  {message.images && message.images.length > 0 && (
                    <div className="mt-3 grid grid-cols-2 gap-2">
                      {message.images.map((img) => (
                        <div key={img.image_id} className="relative group">
                          <img
                            src={img.image_url}
                            alt={img.entity_name || 'Hotel image'}
                            className="w-full h-32 object-cover rounded cursor-pointer hover:opacity-90 transition"
                            onClick={() => window.open(img.image_url, '_blank')}
                          />
                          {img.entity_name && (
                            <p className="text-xs mt-1 text-gray-600 truncate">
                              {img.entity_name}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <p className="text-xs opacity-70 mt-1">
                {message.timestamp.toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-lg p-3">
              <div className="flex items-center gap-2">
                <Bot className="w-5 h-5" />
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t">
        <div className="flex gap-2">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            className="flex-1 px-4 py-2 border rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isLoading}
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || isLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
