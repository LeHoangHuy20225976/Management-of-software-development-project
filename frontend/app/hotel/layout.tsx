/**
 * Hotel Detail Layout
 * For public hotel detail pages (/hotel/[slug])
 * This layout does NOT require authentication
 * It's a simple passthrough for hotel detail pages
 */

'use client';

export default function HotelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Simple passthrough - no auth required for viewing hotel details
  return <>{children}</>;
}
