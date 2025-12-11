'use client';

import { use, useState, useEffect } from 'react';
import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { tourismApi } from '@/lib/api/services';
import type { TourismSpot } from '@/types';

export default function TourismDetailPage({
  params,
}: {
  params: Promise<{ destination_id: string }>;
}) {
  const resolvedParams = use(params);
  const [destination, setDestination] = useState<TourismSpot | null>(null);
  const [relatedSpots, setRelatedSpots] = useState<TourismSpot[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [spot, allSpots] = await Promise.all([
          tourismApi.getById(String(resolvedParams.destination_id)),
          tourismApi.getAll(),
        ]);
        setDestination(spot);
        setRelatedSpots(
          allSpots
            .filter((s) => s.destination_id !== spot?.destination_id)
            .slice(0, 3)
        );
      } catch (error) {
        console.error('Error loading tourism spot:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [resolvedParams.destination_id]);

  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gray-50 py-12">
          <div className="container mx-auto px-4">
            <Card className="text-center py-12">
              <p className="text-gray-900 font-medium">Đang tải...</p>
            </Card>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (!destination) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gray-50 py-12">
          <div className="container mx-auto px-4">
            <Card className="text-center py-12">
              <div className="text-6xl mb-4">🗺️</div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Không tìm thấy điểm đến
              </h1>
              <p className="text-gray-600 mb-6">
                Điểm đến này không tồn tại hoặc đã bị xóa
              </p>
              <Link href="/tourism">
                <Button>Quay lại danh sách</Button>
              </Link>
            </Card>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  const highlights = [
    { icon: '🎨', title: 'Văn hóa', description: 'Di sản văn hóa độc đáo' },
    {
      icon: '🏞️',
      title: 'Thiên nhiên',
      description: 'Cảnh đẹp thiên nhiên tuyệt vời',
    },
    { icon: '🍜', title: 'Ẩm thực', description: 'Đặc sản địa phương hấp dẫn' },
    { icon: '📸', title: 'Check-in', description: 'Địa điểm chụp ảnh đẹp' },
  ];

  const activities = [
    {
      name: 'Tham quan di tích lịch sử',
      duration: '2-3 giờ',
      price: 'Miễn phí',
    },
    { name: 'Tour khám phá ẩm thực', duration: '3-4 giờ', price: '500.000đ' },
    { name: 'Chèo kayak & Trekking', duration: '4-5 giờ', price: '800.000đ' },
  ];

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50">
        <section className="relative h-96 md:h-[500px] bg-gray-900">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url('${destination.thumbnail}')` }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
            <div className="container mx-auto">
              <h1 className="text-4xl md:text-5xl font-bold mb-3">
                {destination.name}
              </h1>
              <div className="flex flex-wrap items-center gap-4 text-lg">
                <span className="flex items-center gap-2">
                  📍 {destination.location}
                </span>
                <span className="flex items-center gap-2">
                  ⭐ {destination.rating} / 5.0
                </span>
              </div>
            </div>
          </div>
        </section>

        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Giới thiệu
                </h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  {destination.description}
                </p>
                <p className="text-gray-700 leading-relaxed">
                  {destination.name} là một trong những điểm đến du lịch hấp dẫn
                  nhất tại {destination.location}, thu hút hàng triệu du khách
                  mỗi năm với vẻ đẹp thiên nhiên tuyệt vời và nền văn hóa phong
                  phú.
                </p>
              </Card>

              <Card>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Điểm nổi bật
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {highlights.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-4 p-4 bg-gradient-to-br from-blue-50 to-white rounded-xl border border-gray-200 hover:shadow-md transition-all"
                    >
                      <div className="text-4xl">{item.icon}</div>
                      <div>
                        <h3 className="font-bold text-gray-900 mb-1">
                          {item.title}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              <Card>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Hoạt động tham quan
                </h2>
                <div className="space-y-4">
                  {activities.map((activity, index) => (
                    <div
                      key={index}
                      className="p-5 border-2 border-gray-200 rounded-xl hover:border-[#0071c2] transition-all"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-gray-900 mb-2">
                            {activity.name}
                          </h3>
                          <div className="flex gap-4 text-sm text-gray-600">
                            <span>⏱️ {activity.duration}</span>
                            <span>💰 {activity.price}</span>
                          </div>
                        </div>
                        <Button size="sm" variant="outline">
                          Đặt ngay
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              <Card>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Lời khuyên du lịch
                </h2>
                <div className="space-y-3">
                  <div className="flex gap-3">
                    <span className="text-xl">🌤️</span>
                    <div>
                      <h4 className="font-semibold text-gray-900">
                        Thời điểm tốt nhất
                      </h4>
                      <p className="text-gray-600">
                        Từ tháng 3 đến tháng 9, thời tiết mát mẻ và ít mưa
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <span className="text-xl">🚗</span>
                    <div>
                      <h4 className="font-semibold text-gray-900">
                        Phương tiện di chuyển
                      </h4>
                      <p className="text-gray-600">
                        Có thể đi bằng xe máy, ô tô hoặc xe bus từ trung tâm
                        thành phố
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <span className="text-xl">💡</span>
                    <div>
                      <h4 className="font-semibold text-gray-900">Lưu ý</h4>
                      <p className="text-gray-600">
                        Nên đi theo nhóm và chuẩn bị đầy đủ nước uống, kem chống
                        nắng
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            <div className="lg:col-span-1">
              <div className="sticky top-20 space-y-6">
                <Card>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">
                    Thông tin nhanh
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between py-2 border-b border-gray-200">
                      <span className="text-gray-600">Phí tham quan</span>
                      <span className="font-semibold text-gray-900">
                        {destination.entry_fee
                          ? `${destination.entry_fee.toLocaleString('vi-VN')} ₫`
                          : 'Đang cập nhật'}
                      </span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-200">
                      <span className="text-gray-600">Phương tiện</span>
                      <span className="font-semibold text-gray-900">
                        {destination.transportation || 'Đang cập nhật'}
                      </span>
                    </div>
                    <div className="flex justify-between py-2">
                      <span className="text-gray-600">Loại hình</span>
                      <span className="font-semibold text-gray-900">
                        {destination.type || 'Đang cập nhật'}
                      </span>
                    </div>
                  </div>
                </Card>

                <Card>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">
                    Tìm khách sạn gần đây
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Khám phá các khách sạn gần {destination.name}
                  </p>
                  <Link
                    href={`/search?location=${encodeURIComponent(
                      destination.location
                    )}`}
                  >
                    <Button className="w-full">Tìm khách sạn</Button>
                  </Link>
                </Card>

                <Card>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">
                    Chia sẻ
                  </h3>
                  <div className="flex gap-2">
                    <button className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                      📘 Facebook
                    </button>
                    <button className="flex-1 px-4 py-2 bg-blue-400 text-white rounded-lg hover:bg-blue-500 transition-colors">
                      🐦 Twitter
                    </button>
                  </div>
                </Card>
              </div>
            </div>
          </div>

          <section className="mt-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              Điểm đến liên quan
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedSpots.map((spot) => (
                <Link
                  key={spot.destination_id}
                  href={`/tourism/${spot.destination_id}`}
                >
                  <div className="bg-white border-2 border-gray-200 rounded-xl overflow-hidden hover:border-[#0071c2] hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 group">
                    <div className="relative h-48 overflow-hidden">
                      <div
                        className="absolute inset-0 bg-cover bg-center transform group-hover:scale-110 transition-transform duration-500"
                        style={{ backgroundImage: `url('${spot.thumbnail}')` }}
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="font-bold text-gray-900 mb-1">
                        {spot.name}
                      </h3>
                      <p className="text-sm text-gray-600">
                        📍 {spot.location}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        </div>
      </div>
      <Footer />
    </>
  );
}
