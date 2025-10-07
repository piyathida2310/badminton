// app/(your-layout)/layout.tsx
import type { Metadata } from "next"; 
import Navbar from "../../../../components/layouts/์Navbar";

export const metadata: Metadata = {
  title: "MyApp | Navbar + Sidebar",
  description: "Next.js Layout with Sidebar example",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex">
      {/* Navbar และ Sidebar อยู่ fixed อยู่แล้ว */}
      <Navbar />

      {/* สำหรับ Desktop ให้เว้นข้างซ้าย 64px (ขนาด sidebar) */}
      <div className="flex-1 pt-16 md:pl-64">
        {children}
      </div>
    </div>
  );
}
