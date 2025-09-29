"use client";
import { motion } from "framer-motion";
import Image from "next/image";

export default function About() {
  const teamMembers = [
    {
      name: "สุขหทัย พลยะเรศ",
      role: "Frontend Developer",
      email: "sukhathai@example.com",
      img: "/images/cream.jpg",
    },
    {
      name: "ปิยธิดา  อันชม",
      role: "Backend Developer",
      email: "piyathida@example.com",
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
      className="bg-gradient-to-b from-[#FFFDF6] to-[#F9F6EE] px-4 sm:px-6 md:px-12 lg:px-20 xl:px-32 py-20"
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
          <span className="bg-gradient-to-r from-amber-500 to-pink-500 bg-clip-text text-transparent">
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
          className="flex flex-col gap-4 bg-white/60 backdrop-blur-md rounded-xl p-8 shadow-xl hover:scale-105 transition-transform"
        >
          <h2 className="text-2xl font-bold text-gray-800">วัตถุประสงค์</h2>
          <ul className="text-gray-700">
            <li>ทำเว็บไซต์เพื่อช่วยจัดการข้อมูลการแข่งลดปัญหางานเอกสารซ้ำซ้อนที่เคยใช้ Excel</li>
            <li>มีระบบจับคู่และจัดสายแข็งขันอัตโนมัติ ทั้งเดี่ยวและคู่ให้การแข่งขันมีมาตรฐาน</li>
            <li>เก็บประวัติผลการแข่งขันเอาไว้เพื่อนำมาใช้ในการจัดอันดับและช่วยตัดสินใจได้ง่ายขึ้น</li> 
            <li>ทำให้ผู้เล่นเห็นตารางและข้อมูลการแข่งขันออนไลน์ได้เลยไม่ต้องคอยถามพนักงาน สะดวก รวดเร็วกว่าเดิม</li>
            
          </ul>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="flex flex-col gap-4 bg-white/60 backdrop-blur-md rounded-xl p-8 shadow-xl hover:scale-105 transition-transform"
        >
          <h2 className="text-2xl font-bold text-gray-800">ประโยชน์</h2>
          <ul className="text-gray-700 list-disc list-inside space-y-2">
            <li>จัดการข้อมูลของผู้เข้าแข่งขันได้อย่างเป็นระบบ</li>
		    <li>ลดขั้นตอนการทำงานหรือเก็บข้อมูลที่ซับซ้อนในระบบ Excel</li>
		    <li>สามารถรู้ค่าใช้จ่ายด้วยระบบกำหนดราคาลูกแบดมินตัน</li>
		    <li>รายงานผลการแข่งขันที่เป็นระบบ ทำให้เพิ่มความโปร่งใสและความน่าเชื่อถือของการแข่งขัน</li>
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
            className="flex flex-col gap-4 bg-white/60 backdrop-blur-md rounded-xl p-6 shadow-lg text-center hover:scale-105 transition-transform"
          >
            <h3 className="text-xl font-bold text-gray-800">{feature.title}</h3>
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
              className="flex flex-col items-center bg-white/60 backdrop-blur-md rounded-xl p-6 shadow-xl hover:scale-105 transition-transform"
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
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6">
            พร้อมเริ่มใช้งานแล้วหรือยัง?
          </h2>
          <motion.a
            href="/register"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-gradient-to-r from-amber-500 to-pink-500 text-white px-8 py-3 rounded-lg shadow-xl hover:from-amber-600 hover:to-pink-600 transition-all"
          >
            ลงทะเบียนตอนนี้
          </motion.a>
        </div>
      </section>
    </section>
  );
}
