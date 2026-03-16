import type { Metadata } from "next"; 
import Navbar from "../../../../components/layouts/Navbar";
import ProtectedRoute from "../../../../components/auth/ProtectedRoute";

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
      {/* ป้องกันหน้า user ทั้งหมดด้วยการตรวจ token */}
      <div className="fmin-h-screen flex bg-gradient-to-b from-[#FFFDF8] to-[#FFF9FC] overflow-hidden">
        {/* NavbarUser มี SidebarUser อยู่ในตัวแล้ว */}
        <Navbar variant="user" />

        {/* พื้นที่เนื้อหาหลัก */}
        <div className="flex-1 ml-0 md:ml-[240px] pt-[70px] overflow-y-auto">
          {children}
        </div>
      </div>
    </ProtectedRoute>
  );
}
