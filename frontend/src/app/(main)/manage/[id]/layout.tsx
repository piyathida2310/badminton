// app/(your-layout)/layout.tsx
import type { Metadata } from "next";
import Navbar from "../../../../../components/layouts/Navbar";
import ProtectedRoute from "../../../../../components/auth/ProtectedRoute";
import SidebarUser from "../../../../../components/layouts/SidebarUser"; // ถ้ามี sidebar

export const metadata: Metadata = {
  title: "Badminton",
  description: "Next.js Layout with Sidebar example",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      {/* ทุกหน้าเพื่อบังคับให้มี token ก่อนเข้าใช้งาน */}
      <div className="min-h-screen flex bg-gradient-to-b from-[#FFFDF8] to-[#FFF9FC] overflow-hidden">
        {/* Sidebar แบบ fixed */}

        {/* Navbar fixed ด้านบน */}
        <Navbar />

        {/* เนื้อหา */}
        <main className="flex-1 ml-0 md:ml-64 pt-[69px] overflow-y-auto">
          {children}
        </main>
      </div>
    </ProtectedRoute>
  );
}
