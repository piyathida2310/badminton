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
    <div className="flex">
      {/* NavbarUser มี SidebarUser อยู่ในตัวแล้ว */}
      <NavbarUser />

      {/* พื้นที่เนื้อหาหลัก */}
      <div className="flex-1 pt-[80px] md:pl-64">
        {children}
      </div>
    </div>
  );
}
