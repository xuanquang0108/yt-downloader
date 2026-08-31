import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "YT Downloader - Tải Nhạc YouTube",
  description: "Tải nhạc từ YouTube về máy.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <body>{children}</body>
    </html>
  );
}
