// app/(your-layout)/layout.tsx
import type { Metadata } from "next";
import Navbar from "../../../../../components/layouts/Navbar";
import ProtectedRoute from "../../../../../components/auth/ProtectedRoute";

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
      <div className="min-h-screen flex bg-white overflow-hidden">
        {/* Sidebar แบบ fixed */}

        {/* Navbar fixed ด้านบน */}
        <Navbar variant="manage-id" />

        {/* เนื้อหา */}
        <main className="flex-1 ml-0 md:ml-[250px] pt-[69px] overflow-y-auto">
          {children}
        </main>
      </div>
    </ProtectedRoute>
  );
}
