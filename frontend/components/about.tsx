"use client";
import { motion } from "framer-motion";
import Image from "next/image";
import { CheckCircle2, Target, Lightbulb, Calendar, TrendingUp, MonitorSmartphone } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

export default function About() {
  const { t } = useLanguage();
  const teamMembers = [
    {
      name: t('about.team.cream'),
      role: "Full Stack Developer",
      email: "sukhathai7331@gmail.com",
      img: "/images/cream.jpg",
    },
    {
      name: t('about.team.faii'),
      role: "Full Stack Developer",
      email: "18987m210@gmail.com",
      img: "/images/faii.jpg",
    },
  ];

  const features = [
    { title: t('about.features.easyManage'), desc: t('about.features.easyManageDesc'), icon: <Calendar className="w-8 h-8 text-[#0040C1]" /> },
    { title: t('about.features.realtime'), desc: t('about.features.realtimeDesc'), icon: <TrendingUp className="w-8 h-8 text-[#0040C1]" /> },
    { title: t('about.features.responsive'), desc: t('about.features.responsiveDesc'), icon: <MonitorSmartphone className="w-8 h-8 text-[#0040C1]" /> },
  ];

  return (
    <section
      id="about"
      className="bg-white px-4 sm:px-6 md:px-12 lg:px-20 xl:px-32 py-24"
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
          {t('about.title')} <br />
          <span className="text-[#0040C1] drop-shadow-sm">
            {t('about.systemName')}
          </span>
        </h1>
        <p className="text-gray-700 mt-4 text-base sm:text-lg md:text-xl">
          {t('about.description')}
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
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#0040C1]/5 rounded-bl-full -z-10 transition-transform group-hover:scale-110"></div>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-[#0040C1]/10 rounded-2xl text-[#0040C1]">
              <Target className="w-8 h-8" />
            </div>
            <h2 className="text-3xl font-extrabold text-gray-800 tracking-tight">{t('about.objectivesTitle')}</h2>
          </div>
          <ul className="text-gray-600 space-y-4">
            <li className="flex items-start gap-3">
              <CheckCircle2 className="w-6 h-6 text-[#2ED3B7] flex-shrink-0 mt-0.5" />
              <span>{t('about.objective1')}</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="w-6 h-6 text-[#2ED3B7] flex-shrink-0 mt-0.5" />
              <span>{t('about.objective2')}</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="w-6 h-6 text-[#2ED3B7] flex-shrink-0 mt-0.5" />
              <span>{t('about.objective3')}</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="w-6 h-6 text-[#2ED3B7] flex-shrink-0 mt-0.5" />
              <span>{t('about.objective4')}</span>
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
          <div className="absolute top-0 left-0 w-32 h-32 bg-[#2ED3B7]/5 rounded-br-full -z-10 transition-transform group-hover:scale-110"></div>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-[#2ED3B7]/10 rounded-2xl text-[#2ED3B7]">
              <Lightbulb className="w-8 h-8" />
            </div>
            <h2 className="text-3xl font-extrabold text-gray-800 tracking-tight">{t('about.benefitsTitle')}</h2>
          </div>
          <ul className="text-gray-600 space-y-4">
            <li className="flex items-start gap-3">
              <CheckCircle2 className="w-6 h-6 text-[#0040C1] flex-shrink-0 mt-0.5" />
              <span>{t('about.benefit1')}</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="w-6 h-6 text-[#0040C1] flex-shrink-0 mt-0.5" />
              <span>{t('about.benefit2')}</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="w-6 h-6 text-[#0040C1] flex-shrink-0 mt-0.5" />
              <span>{t('about.benefit3')}</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="w-6 h-6 text-[#0040C1] flex-shrink-0 mt-0.5" />
              <span>{t('about.benefit4')}</span>
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
            <div className="p-4 bg-[#0040C1]/5 rounded-full group-hover:scale-110 group-hover:bg-[#0040C1]/10 transition-all duration-300">
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
          {t('about.contactTitle')}
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
              <div className="absolute top-0 left-0 w-full h-32 bg-[#0040C1]/5 -z-10 group-hover:h-36 transition-all duration-500"></div>
              
              <div className="relative mb-6">
                <div className="absolute -inset-1 bg-[#0040C1]/20 rounded-full blur opacity-30 group-hover:opacity-60 transition duration-500"></div>
                <Image
                  src={person.img}
                  alt={person.name}
                  width={140}
                  height={140}
                  className="relative rounded-full object-cover border-4 border-white shadow-lg z-10 w-[140px] h-[140px]"
                />
              </div>
              
              <h3 className="text-2xl font-extrabold text-gray-800 mb-2">{person.name}</h3>
              <div className="px-4 py-1.5 bg-[#0040C1]/10 text-[#0040C1] font-semibold text-sm rounded-full mb-4">
                {person.role}
              </div>
              <a
                href={`mailto:${person.email}`}
                className="text-slate-500 hover:text-[#0040C1] hover:underline transition-colors font-medium"
              >
                {person.email}
              </a>
            </motion.div>
          ))}
        </div>

        <div className="text-center">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-800 mb-8 tracking-tight">
            {t('about.readyToUse')}
          </h2>
          <motion.a
            href="/register"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="bg-[#0040C1] text-white px-10 py-4 rounded-full shadow-lg hover:bg-[#2ED3B7] hover:-translate-y-1 transition-all duration-300 font-bold text-lg"
          >
            {t('about.registerNow')}
          </motion.a>
        </div>
      </section>
    </section>
  );
}
