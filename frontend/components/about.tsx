"use client";
import { motion } from "framer-motion";
import Image from "next/image";
import { CheckCircle2, Target, Lightbulb, Calendar, TrendingUp, MonitorSmartphone } from "lucide-react";

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
    { title: "จัดการแข่งขันง่าย", desc: "สร้างแมตช์และจัดการวันเวลาได้ง่าย", icon: <Calendar className="w-8 h-8 text-orange-500" /> },
    { title: "ติดตามผลเรียลไทม์", desc: "ดูคะแนนและอันดับแบบทันที", icon: <TrendingUp className="w-8 h-8 text-orange-500" /> },
    { title: "รองรับทุกอุปกรณ์", desc: "ใช้งานได้ทั้งมือถือและเดสก์ท็อป", icon: <MonitorSmartphone className="w-8 h-8 text-orange-500" /> },
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
      <section className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 mb-20 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="flex flex-col gap-6 bg-white/80 backdrop-blur-xl border border-white/40 rounded-3xl p-8 lg:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(249,115,22,0.08)] hover:-translate-y-1 transition-all duration-500 group relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-orange-100/50 rounded-bl-full -z-10 transition-transform group-hover:scale-110"></div>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-orange-100 rounded-2xl text-orange-600">
              <Target className="w-8 h-8" />
            </div>
            <h2 className="text-3xl font-extrabold text-gray-800 tracking-tight">วัตถุประสงค์</h2>
          </div>
          <ul className="text-gray-600 space-y-4">
            <li className="flex items-start gap-3">
              <CheckCircle2 className="w-6 h-6 text-amber-500 flex-shrink-0 mt-0.5" />
              <span>ทำเว็บไซต์เพื่อช่วยจัดการข้อมูลการแข่งลดปัญหางานเอกสารซ้ำซ้อนที่เคยใช้ Excel</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="w-6 h-6 text-amber-500 flex-shrink-0 mt-0.5" />
              <span>มีระบบจับคู่และจัดสายแข่งขันอัตโนมัติ ทั้งเดี่ยวและคู่ให้การแข่งขันมีมาตรฐาน</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="w-6 h-6 text-amber-500 flex-shrink-0 mt-0.5" />
              <span>เก็บประวัติผลการแข่งขันเอาไว้เพื่อนำมาใช้ในการจัดอันดับและช่วยตัดสินใจได้ง่ายขึ้น</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="w-6 h-6 text-amber-500 flex-shrink-0 mt-0.5" />
              <span>ผู้เล่นเห็นตารางและย้อมูลการแข่งขันออนไลน์ได้เลย สะดวก รวดเร็ว</span>
            </li>
          </ul>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="flex flex-col gap-6 bg-white/80 backdrop-blur-xl border border-white/40 rounded-3xl p-8 lg:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(249,115,22,0.08)] hover:-translate-y-1 transition-all duration-500 group relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-32 h-32 bg-amber-100/50 rounded-br-full -z-10 transition-transform group-hover:scale-110"></div>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-amber-100 rounded-2xl text-amber-600">
              <Lightbulb className="w-8 h-8" />
            </div>
            <h2 className="text-3xl font-extrabold text-gray-800 tracking-tight">ประโยชน์</h2>
          </div>
          <ul className="text-gray-600 space-y-4">
            <li className="flex items-start gap-3">
              <CheckCircle2 className="w-6 h-6 text-orange-500 flex-shrink-0 mt-0.5" />
              <span>จัดการข้อมูลของผู้เข้าแข่งขันได้อย่างเป็นระบบ</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="w-6 h-6 text-orange-500 flex-shrink-0 mt-0.5" />
              <span>ลดขั้นตอนการทำงานหรือเก็บข้อมูลที่ซับซ้อนในระบบ Excel</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="w-6 h-6 text-orange-500 flex-shrink-0 mt-0.5" />
              <span>สามารถรู้ค่าใช้จ่ายด้วยระบบกำหนดราคาลูกแบดมินตัน</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="w-6 h-6 text-orange-500 flex-shrink-0 mt-0.5" />
              <span>รายงานผลการแข่งขันที่เป็นระบบ เพิ่มความโปร่งใสและความน่าเชื่อถือ</span>
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
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 mb-32 max-w-7xl mx-auto">
        {features.map((feature, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: idx * 0.2 }}
            className="flex flex-col items-center gap-4 bg-white backdrop-blur-xl border border-slate-100 rounded-3xl p-8 shadow-[0_4px_20px_rgb(0,0,0,0.03)] text-center hover:shadow-[0_20px_40px_rgb(249,115,22,0.08)] hover:-translate-y-2 transition-all duration-500 group"
          >
            <div className="p-4 bg-orange-50 rounded-full group-hover:scale-110 group-hover:bg-orange-100 transition-all duration-300">
              {feature.icon}
            </div>
            <h3 className="text-xl font-bold text-gray-800 tracking-tight mt-2">{feature.title}</h3>
            <p className="text-slate-500 leading-relaxed">{feature.desc}</p>
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-16 mb-24 max-w-4xl mx-auto">
          {teamMembers.map((person, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: idx * 0.2 }}
              className="relative flex flex-col items-center bg-white border border-slate-100 rounded-[2rem] p-10 shadow-[0_4px_24px_rgb(0,0,0,0.04)] hover:shadow-[0_24px_48px_rgb(249,115,22,0.08)] hover:-translate-y-2 transition-all duration-500 group overflow-hidden"
            >
              {/* Decorative top background */}
              <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-br from-orange-100/80 to-amber-50/40 -z-10 group-hover:h-36 transition-all duration-500"></div>
              
              <div className="relative mb-6">
                <div className="absolute -inset-1 bg-gradient-to-r from-orange-400 to-amber-400 rounded-full blur opacity-30 group-hover:opacity-60 transition duration-500"></div>
                <Image
                  src={person.img}
                  alt={person.name}
                  width={140}
                  height={140}
                  className="relative rounded-full object-cover border-4 border-white shadow-lg z-10 w-[140px] h-[140px]"
                />
              </div>
              
              <h3 className="text-2xl font-extrabold text-gray-800 mb-2">{person.name}</h3>
              <div className="px-4 py-1.5 bg-orange-50 text-orange-600 font-semibold text-sm rounded-full mb-4">
                {person.role}
              </div>
              <a
                href={`mailto:${person.email}`}
                className="text-slate-500 hover:text-orange-500 hover:underline transition-colors font-medium"
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
