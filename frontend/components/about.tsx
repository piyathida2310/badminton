"use client";
import { motion } from "framer-motion";
import Image from "next/image";

export default function About() {
  const teamMembers = [
    {
      name: "สุขหทัย พลยะเรศ",
      role: "Frontend Developer",
      email: "sukhathai7331@gmail.com",
      img: "/images/cream.jpg",
    },
    {
      name: "ปิยธิดา  อันชม",
      role: "Backend Developer",
      email: "18987m210@gmail.com",
      img: "/images/faii.jpg",
    },
  ];

  const features = [
    { title: "จัดการแข่งขันง่าย", desc: "สร้างแมตช์และจัดการวันเวลาได้ง่าย" },
    { title: "ติดตามผลเรียลไทม์", desc: "ดูคะแนนและอันดับแบบทันที" },
    { title: "รองรับทุกอุปกรณ์", desc: "ใช้งานได้ทั้งมือถือและเดสก์ท็อป" },
  ];

  return (
    <section
      id="about"
      className="bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-50 via-white to-orange-50/30 px-4 sm:px-6 md:px-12 lg:px-20 xl:px-32 py-24"
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="text-center mb-16"
      >
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-800">
          เกี่ยวกับระบบ <br />
          <span className="bg-gradient-to-r from-orange-600 via-amber-500 to-yellow-500 bg-clip-text text-transparent drop-shadow-sm">
            Badminton Competition
          </span>
        </h1>
        <p className="text-gray-700 mt-4 text-base sm:text-lg md:text-xl">
          ระบบช่วยจัดการการแข่งขันแบดมินตัน สมัครผู้เล่น
          และติดตามผลการแข่งขันได้ง่ายๆ
        </p>
      </motion.div>

      {/* Mission & Vision */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-20">
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="flex flex-col gap-4 bg-white/80 backdrop-blur-xl border border-white/40 rounded-2xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(249,115,22,0.08)] hover:-translate-y-1 transition-all duration-300"
        >
          <h2 className="text-2xl font-bold text-gray-800">วัตถุประสงค์</h2>
          <ul className="text-gray-700">
            <li>
              ทำเว็บไซต์เพื่อช่วยจัดการข้อมูลการแข่งลดปัญหางานเอกสารซ้ำซ้อนที่เคยใช้
              Excel
            </li>
            <li>
              มีระบบจับคู่และจัดสายแข็งขันอัตโนมัติ
              ทั้งเดี่ยวและคู่ให้การแข่งขันมีมาตรฐาน
            </li>
            <li>
              เก็บประวัติผลการแข่งขันเอาไว้เพื่อนำมาใช้ในการจัดอันดับและช่วยตัดสินใจได้ง่ายขึ้น
            </li>
            <li>
              ทำให้ผู้เล่นเห็นตารางและข้อมูลการแข่งขันออนไลน์ได้เลยไม่ต้องคอยถามพนักงาน
              สะดวก รวดเร็วกว่าเดิม
            </li>
          </ul>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="flex flex-col gap-4 bg-white/80 backdrop-blur-xl border border-white/40 rounded-2xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(249,115,22,0.08)] hover:-translate-y-1 transition-all duration-300"
        >
          <h2 className="text-2xl font-bold text-gray-800">ประโยชน์</h2>
          <ul className="text-gray-700 list-disc list-inside space-y-2">
            <li>จัดการข้อมูลของผู้เข้าแข่งขันได้อย่างเป็นระบบ</li>
            <li>ลดขั้นตอนการทำงานหรือเก็บข้อมูลที่ซับซ้อนในระบบ Excel</li>
            <li>สามารถรู้ค่าใช้จ่ายด้วยระบบกำหนดราคาลูกแบดมินตัน</li>
            <li>
              รายงานผลการแข่งขันที่เป็นระบบ
              ทำให้เพิ่มความโปร่งใสและความน่าเชื่อถือของการแข่งขัน
            </li>
          </ul>
        </motion.div>
      </section>

      {/* Illustration */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="relative w-full max-w-lg mx-auto mb-20"
      >
        <motion.div
          animate={{ y: [0, -10, 0], rotate: [0, 5, -5, 0] }}
          transition={{ duration: 3, repeat: Infinity }}
          className="w-full h-full"
        >
          <Image
            src="/images/bad.svg"
            alt="Badminton Team Illustration"
            width={500}
            height={400}
            className="object-contain drop-shadow-2xl"
          />
        </motion.div>
      </motion.div>

      {/* Features */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
        {features.map((feature, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: idx * 0.2 }}
            className="flex flex-col gap-4 bg-white/80 backdrop-blur-xl border border-white/40 rounded-2xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] text-center hover:shadow-[0_8px_30px_rgb(249,115,22,0.08)] hover:-translate-y-2 transition-all duration-300 group"
          >
            <h3 className="text-xl font-bold text-gray-800 group-hover:text-orange-600 transition-colors">{feature.title}</h3>
            <p className="text-gray-700">{feature.desc}</p>
          </motion.div>
        ))}
      </section>

      {/* Contact Section */}
      <section className="mt-20">
        <motion.h2
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-2xl sm:text-3xl font-bold text-gray-800 text-center mb-10"
        >
          ติดต่อผู้จัดทำ
        </motion.h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {teamMembers.map((person, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: idx * 0.2 }}
              className="flex flex-col items-center bg-white/80 backdrop-blur-xl border border-white/40 rounded-2xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(249,115,22,0.08)] hover:-translate-y-2 transition-all duration-300 group"
            >
              <Image
                src={person.img}
                alt={person.name}
                width={120}
                height={120}
                className="rounded-full mb-4 object-contain border-4 border-amber-400"
              />
              <h3 className="text-xl font-bold text-gray-800">{person.name}</h3>
              <p className="text-gray-600">{person.role}</p>
              <a
                href={`mailto:${person.email}`}
                className="text-amber-500 hover:underline mt-2"
              >
                {person.email}
              </a>
            </motion.div>
          ))}
        </div>

        <div className="text-center">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-800 mb-8 tracking-tight">
            พร้อมเริ่มใช้งานแล้วหรือยัง?
          </h2>
          <motion.a
            href="/register"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="group relative inline-flex items-center justify-center bg-gradient-to-r from-orange-500 to-amber-500 text-white px-10 py-4 rounded-full shadow-[0_10px_40px_-10px_rgba(249,115,22,0.5)] hover:shadow-[0_10px_40px_-10px_rgba(249,115,22,0.8)] hover:-translate-y-1 transition-all duration-300 font-bold text-lg overflow-hidden"
          >
            <span className="relative z-10">ลงทะเบียนตอนนี้</span>
            <div className="absolute inset-0 h-full w-full bg-gradient-to-r from-amber-500 to-orange-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </motion.a>
        </div>
      </section>
    </section>
  );
}
