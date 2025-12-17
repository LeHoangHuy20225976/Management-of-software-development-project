'use client';

import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Card } from '@/components/common/Card';

export default function AboutPage() {
  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50">
        <section className="bg-gradient-to-br from-[#003580] to-[#0071c2] py-20 text-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-5xl font-bold mb-6">Về VietStay</h1>
              <p className="text-xl text-white/90 leading-relaxed">
                Nền tảng đặt phòng khách sạn trực tuyến hàng đầu Việt Nam,
                kết nối hàng triệu du khách với những trải nghiệm lưu trú tuyệt vời
              </p>
            </div>
          </div>
        </section>

        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-4xl font-bold text-gray-900 mb-4">Sứ mệnh của chúng tôi</h2>
                <div className="w-24 h-1 bg-[#0071c2] mx-auto"></div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <Card className="text-center p-8 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                  <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-4xl">🎯</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">Tầm nhìn</h3>
                  <p className="text-gray-600">
                    Trở thành nền tảng đặt phòng số 1 Việt Nam, mang đến trải nghiệm du lịch hoàn hảo
                  </p>
                </Card>

                <Card className="text-center p-8 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                  <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-green-50 to-green-100 rounded-full flex items-center justify-center">
                    <span className="text-4xl">💡</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">Sứ mệnh</h3>
                  <p className="text-gray-600">
                    Kết nối du khách với những chỗ nghỉ tuyệt vời, tạo ra những kỷ niệm đáng nhớ
                  </p>
                </Card>

                <Card className="text-center p-8 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                  <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-full flex items-center justify-center">
                    <span className="text-4xl">🌟</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">Giá trị</h3>
                  <p className="text-gray-600">
                    Đặt khách hàng làm trung tâm, cam kết chất lượng và sự minh bạch
                  </p>
                </Card>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 bg-gradient-to-br from-[#003580] to-[#0071c2] text-white">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-4xl font-bold mb-4">Con số ấn tượng</h2>
                <p className="text-xl text-white/90">Chúng tôi tự hào về những gì đã đạt được</p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                <div className="text-center">
                  <div className="text-5xl font-bold mb-2">1000+</div>
                  <div className="text-white/80">Khách sạn</div>
                </div>
                <div className="text-center">
                  <div className="text-5xl font-bold mb-2">50K+</div>
                  <div className="text-white/80">Đặt phòng</div>
                </div>
                <div className="text-center">
                  <div className="text-5xl font-bold mb-2">30K+</div>
                  <div className="text-white/80">Khách hàng</div>
                </div>
                <div className="text-center">
                  <div className="text-5xl font-bold mb-2">4.8/5</div>
                  <div className="text-white/80">Đánh giá</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-4xl font-bold text-gray-900 mb-4">Tại sao chọn VietStay?</h2>
                <div className="w-24 h-1 bg-[#0071c2] mx-auto"></div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-2xl">✓</span>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Giá tốt nhất</h3>
                    <p className="text-gray-600">
                      Cam kết giá cạnh tranh nhất thị trường với chính sách hoàn tiền nếu tìm thấy giá tốt hơn
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                      <span className="text-2xl">✓</span>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Thanh toán an toàn</h3>
                    <p className="text-gray-600">
                      Hệ thống bảo mật SSL 256-bit, đảm bảo an toàn tuyệt đối cho mọi giao dịch
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                      <span className="text-2xl">✓</span>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Đặt phòng dễ dàng</h3>
                    <p className="text-gray-600">
                      Giao diện thân thiện, quy trình đặt phòng nhanh chóng chỉ trong vài phút
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                      <span className="text-2xl">✓</span>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Hỗ trợ 24/7</h3>
                    <p className="text-gray-600">
                      Đội ngũ chăm sóc khách hàng luôn sẵn sàng hỗ trợ bạn mọi lúc, mọi nơi
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <Card className="max-w-3xl mx-auto text-center p-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Bạn muốn hợp tác với chúng tôi?
              </h2>
              <p className="text-gray-600 mb-8">
                Hãy liên hệ với đội ngũ VietStay để khám phá cơ hội hợp tác
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="mailto:contact@vietstay.vn"
                  className="px-8 py-3 bg-[#0071c2] hover:bg-[#005999] text-white font-semibold rounded-lg transition-all duration-200 hover:shadow-lg"
                >
                  Liên hệ ngay
                </a>
                <a
                  href="/hotel-manager/login"
                  className="px-8 py-3 border-2 border-[#0071c2] text-[#0071c2] hover:bg-blue-50 font-semibold rounded-lg transition-all duration-200"
                >
                  Đăng ký khách sạn
                </a>
              </div>
            </Card>
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
}
