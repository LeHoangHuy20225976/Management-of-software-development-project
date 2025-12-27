'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Card } from '@/components/common/Card';
import { HotelLogo } from '@/components/hotel/HotelLogo';

export default function AttendancePage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [userInfo, setUserInfo] = useState<{ userId: number; confidence: number; name?: string } | null>(null);

  // Start camera on mount
  useEffect(() => {
    let mediaStream: MediaStream | null = null;

    const startCamera = async () => {
      try {
        setError('');
        mediaStream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } } 
        });
        setStream(mediaStream);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      } catch (err) {
        console.error("Error accessing camera:", err);
        setError('Không thể truy cập camera. Vui lòng kiểm tra quyền truy cập.');
      }
    };

    startCamera();

    return () => {
      if (mediaStream) {
        mediaStream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const captureImage = (): string | null => {
    if (!videoRef.current || !canvasRef.current) return null;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (!context) return null;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    return canvas.toDataURL('image/jpeg', 0.9);
  };

  const handleAttendance = async (eventType: 'CHECK_IN' | 'CHECK_OUT') => {
    const imageBase64 = captureImage();
    if (!imageBase64) {
      setError('Không thể chụp ảnh. Vui lòng thử lại.');
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccessMessage('');
    setUserInfo(null);

    try {
      const response = await fetch('http://localhost:8001/cv/face/recognize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image_base64: imageBase64,
          event_type: eventType,
          device_id: 'web-app-attendance',
          location: 'Front Desk' // You might want to make this dynamic or configurable
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Nhận diện thất bại');
      }

      if (data.success) {
        setSuccessMessage(`Thành công! ${eventType === 'CHECK_IN' ? 'Check-in' : 'Check-out'} đã được ghi nhận.`);
        setUserInfo({
          userId: data.user_id,
          confidence: data.confidence
        });
        
        // Clear success message after 5 seconds
        setTimeout(() => {
          setSuccessMessage('');
          setUserInfo(null);
        }, 5000);
      } else {
        setError(data.message || 'Không tìm thấy khuôn mặt phù hợp.');
      }

    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Lỗi kết nối server.';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <div className="flex justify-center mb-4">
                <HotelLogo size="lg" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Check-in / Check-out Nhân viên
              </h1>
              <p className="text-gray-600">
                Sử dụng nhận diện khuôn mặt để chấm công
              </p>
            </div>

            <Card className="p-6">
              {/* Camera View */}
              <div className="relative aspect-video bg-black rounded-lg overflow-hidden mb-6 shadow-inner">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover transform scale-x-[-1]" // Mirror effect
                />
                {!stream && !error && (
                  <div className="absolute inset-0 flex items-center justify-center text-white/70">
                    <p>Đang khởi động camera...</p>
                  </div>
                )}
                <canvas ref={canvasRef} className="hidden" />
              </div>

              {/* Status Messages */}
              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg animate-fade-in">
                  <p className="text-red-600 text-center font-medium">{error}</p>
                </div>
              )}

              {successMessage && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg animate-fade-in">
                  <div className="text-center">
                    <p className="text-green-700 font-bold text-lg mb-1">{successMessage}</p>
                    {userInfo && (
                      <p className="text-green-600 text-sm">
                        User ID: {userInfo.userId} • Độ chính xác: {(userInfo.confidence * 100).toFixed(1)}%
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => handleAttendance('CHECK_IN')}
                  disabled={isLoading || !stream}
                  className="flex flex-col items-center justify-center p-6 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-xl transition-all shadow-md hover:shadow-lg transform hover:-translate-y-1 active:translate-y-0"
                >
                  <span className="text-3xl mb-2">☀️</span>
                  <span className="font-bold text-lg">Check In</span>
                  <span className="text-xs opacity-90 mt-1">Bắt đầu ca làm việc</span>
                </button>

                <button
                  onClick={() => handleAttendance('CHECK_OUT')}
                  disabled={isLoading || !stream}
                  className="flex flex-col items-center justify-center p-6 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white rounded-xl transition-all shadow-md hover:shadow-lg transform hover:-translate-y-1 active:translate-y-0"
                >
                  <span className="text-3xl mb-2">🌙</span>
                  <span className="font-bold text-lg">Check Out</span>
                  <span className="text-xs opacity-90 mt-1">Kết thúc ca làm việc</span>
                </button>
              </div>

              {/* Instructions */}
              <div className="mt-8 text-center text-sm text-gray-500">
                <p>Giữ khuôn mặt ở chính giữa khung hình và đảm bảo đủ ánh sáng.</p>
                <div className="mt-4">
                  <Link href="/hotel-manager/login" className="text-[#0071c2] hover:underline">
                    &larr; Quay lại trang đăng nhập quản lý
                  </Link>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
