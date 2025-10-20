import type { Metadata } from "next"; 
import NavbarUser from "../../../../components/layouts/NavbarUser";

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
    <div className="fmin-h-screen flex bg-gradient-to-b from-[#FFFDF8] to-[#FFF9FC] overflow-hidden">
      {/* NavbarUser มี SidebarUser อยู่ในตัวแล้ว */}
      <NavbarUser />

      {/* พื้นที่เนื้อหาหลัก */}
      <div className="flex-1 ml-0 md:ml-64 pt-[80px] overflow-y-auto">
        {children}
      </div>
    </div>
  );
}
