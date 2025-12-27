import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ChatbotWrapper } from "@/components/layout/ChatbotWrapper";
import { AuthProvider } from "@/lib/context/AuthContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "VietStay - Đặt phòng khách sạn Việt Nam",
  description: "Nền tảng đặt phòng khách sạn hàng đầu Việt Nam. Khám phá những địa điểm tuyệt vời và đặt phòng dễ dàng.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          {children}
          <ChatbotWrapper />
        </AuthProvider>
      </body>
    </html>
  );
}
