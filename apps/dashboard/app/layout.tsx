import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "kors-relv collector",
  description: "해양 관측 데이터 수집 현황",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body className="bg-slate-50 text-slate-900 antialiased">{children}</body>
    </html>
  );
}
