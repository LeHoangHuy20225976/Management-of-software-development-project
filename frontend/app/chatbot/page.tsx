'use client';

import HotelChatbot from '@/components/chatbot/HotelChatbot';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function ChatbotPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Home
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6 text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Hotel AI Assistant
            </h1>
            <p className="text-gray-600">
              Ask me anything about hotels, rooms, amenities, and more!
            </p>
          </div>

          <HotelChatbot />
        </div>
      </div>
    </div>
  );
}
