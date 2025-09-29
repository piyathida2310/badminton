// import Image from "next/image";

// export default function Home() {
//   return (
//     <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
//       <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
//         <Image
//           className="dark:invert"
//           src="/next.svg"
//           alt="Next.js logo"
//           width={180}
//           height={38}
//           priority
//         />
//         <ol className="font-mono list-inside list-decimal text-sm/6 text-center sm:text-left">
//           <li className="mb-2 tracking-[-.01em]">
//             Get started by editing{" "}
//             <code className="bg-black/[.05] dark:bg-white/[.06] font-mono font-semibold px-1 py-0.5 rounded">
//               src/app/page.tsx
//             </code>
//             .
//           </li>
//           <li className="tracking-[-.01em]">
//             Save and see your changes instantly. 
//           </li>
//         </ol>

//         <div className="flex gap-4 items-center flex-col sm:flex-row">
//           <a
//             className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background gap-2 hover:bg-[#383838] dark:hover:bg-[#ccc] font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 sm:w-auto"
//             href="https://vercel.com/new?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
//             target="_blank"
//             rel="noopener noreferrer"
//           >
//             <Image
//               className="dark:invert"
//               src="/vercel.svg"
//               alt="Vercel logomark"
//               width={20}
//               height={20}
//             />
//             Deploy now
//           </a>
//           <a
//             className="rounded-full border border-solid border-black/[.08] dark:border-white/[.145] transition-colors flex items-center justify-center hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] hover:border-transparent font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 w-full sm:w-auto md:w-[158px]"
//             href="https://nextjs.org/docs?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
//             target="_blank"
//             rel="noopener noreferrer"
//           >
//             Read our docs
//           </a>
//         </div>
//       </main>
//       <footer className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center">
//         <a
//           className="flex items-center gap-2 hover:underline hover:underline-offset-4"
//           href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
//           target="_blank"
//           rel="noopener noreferrer"
//         >
//           <Image
//             aria-hidden
//             src="/file.svg"
//             alt="File icon"
//             width={16}
//             height={16}
//           />
//           Learn
//         </a>
//         <a
//           className="flex items-center gap-2 hover:underline hover:underline-offset-4"
//           href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
//           target="_blank"
//           rel="noopener noreferrer"
//         >
//           <Image
//             aria-hidden
//             src="/window.svg"
//             alt="Window icon"
//             width={16}
//             height={16}
//           />
//           Examples
//         </a>
//         <a
//           className="flex items-center gap-2 hover:underline hover:underline-offset-4"
//           href="https://nextjs.org?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
//           target="_blank"
//           rel="noopener noreferrer"
//         >
//           <Image
//             aria-hidden
//             src="/globe.svg"
//             alt="Globe icon"
//             width={16}
//             height={16}
//           />
//           Go to nextjs.org →
//         </a>
//       </footer>
//     </div>
//   );
// }
import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#FCFCF4] flex flex-col">
      {/* Navbar */}
      <nav className="flex flex-col md:flex-row justify-between items-center px-6 md:px-12 py-4 gap-4 md:gap-0">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <Image
            src="/images/logo.png"
            alt="Badminton Logo"
            width={40}
            height={40}
          />
          <div className="flex flex-col">
            <span className="text-teal-700 font-bold text-lg md:text-xl">
              BADMINTON
            </span>
            <span className="text-xs text-gray-600">CLUB MANAGEMENT</span>
          </div>
        </div>

        {/* Menu */}
        <div className="flex items-center gap-6 text-gray-700 font-medium text-sm md:text-base">
          <Link href="/">หน้าแรก</Link>
          <Link href="/about">เกี่ยวกับ</Link>
        </div>

        {/* Buttons */}
        <div className="flex gap-2 md:gap-3">
          <Link
            href="/login"
            className="bg-pink-500 text-white px-4 py-2 rounded-md text-sm md:text-base hover:bg-pink-600 transition"
          >
            เข้าสู่ระบบ
          </Link>
          <Link
            href="/register"
            className="bg-amber-500 text-white px-4 py-2 rounded-md text-sm md:text-base hover:bg-amber-600 transition"
          >
            ลงทะเบียน
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="flex flex-col-reverse lg:flex-row flex-1 items-center justify-between px-6 md:px-12 py-8 gap-10">
        {/* Text */}
        <div className="flex flex-col gap-12 text-center lg:text-left">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 leading-snug">
            ระบบจัดการแข่งขันแบดมินตัน
          </h1>
          <Link
            href="/register"
            className="bg-amber-500 text-white px-6 py-3 rounded-md w-fit mx-auto lg:mx-0 text-sm md:text-base hover:bg-amber-600 transition"
          >
            ลงทะเบียน
          </Link>
        </div>

        {/* Illustration */}
        <div className="relative w-[260px] h-[200px] md:w-[340px] md:h-[260px] lg:w-[380px] lg:h-[280px]">
          <Image
            src="/images/bad.svg"
            alt="Badminton Illustration"
            fill
            className="object-contain"
          />
        </div>
      </section>
    </main>
  );
}



