import type { Metadata } from "next";
import Navbar from "../../../../components/layouts/์Navbar";
import { div } from "framer-motion/client";

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
    <div>
      <Navbar />

      <div className="py-28 pl-40">{children}</div>
    </div>
  );
}
