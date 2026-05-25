"use client";

import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import DatePicker, { registerLocale } from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { th, enUS } from "date-fns/locale";

registerLocale("th", th);
registerLocale("en", enUS);

export default function Form({
  date,
  setDate,
  location,
  tournamentName,
  setTournamentName,
  setLocation,
  registrationPrice,
  setRegistrationPrice,
  shuttlecockPrice,
  setShuttlecockPrice,
  ranks,
  setRanks,
  types,
  setTypes,
  bracketLines,
  setBracketLines,
  people,
  setPeople,
  handleUpload,
  posterPreview,
  qrPreview,
  handleNext,
  isFormComplete,
  levelOptions,
  toggleValue,
}: any) {
  const { t, language } = useLanguage();
  const isImagesUploaded = posterPreview && qrPreview;
  return (
    <motion.div
      key="organize"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -30 }}
      transition={{ duration: 0.5 }}
      className="w-[90%] max-w-4xl 
      bg-white text-slate-800 shadow-[0_10px_60px_rgba(0,0,0,0.15)]
      backdrop-blur-xl rounded-3xl border border-slate-200 
      overflow-hidden flex flex-col 
      max-sm:w-full max-sm:rounded-2xl py-8 mt-12 mb-16 transition-all duration-500"
    >
      <div className="px-6 py-4 border-b border-slate-200/60 text-center sm:text-left">
        <h1 className="text-2xl sm:text-3xl font-bold drop-shadow">
          {t('manageMatch.formTitle')}
        </h1>
      </div>

      {/* ฟอร์มเนื้อหาหลัก */}
      <div className="p-6 grid gap-6 md:grid-cols-2 text-slate-700 overflow-y-auto max-h-[55vh] scrollbar-thin scrollbar-thumb-[#194185]/20 hover:scrollbar-thumb-[#194185]/40 scrollbar-track-transparent scrollbar-thumb-rounded-full">

        {/* ฝั่งซ้าย */}
        <div className="space-y-4">
          <LabeledInput
            label={t('manageMatch.matchDate')}
            type="date"
            value={date}
            onChange={(e: any) => setDate(e.target.value)}
            language={language === 'en' ? 'en-US' : 'th-TH'}
          />

          <LabeledInput
            label={t('manageMatch.tourName')}
            value={tournamentName}
            onChange={(e: any) => setTournamentName(e.target.value)}
          />

          <LabeledInput
            label={t('manageMatch.location')}
            value={location}
            onChange={(e: any) => setLocation(e.target.value)}
          />

          <LabeledInput
            label={t('manageMatch.registrationPrice')}
            type="number"
            min={0}
            value={registrationPrice}
            onChange={(e: any) => {
              const val = e.target.value;
              if (Number(val) < 0) return;
              setRegistrationPrice(val);
            }}
          />

          <LabeledInput
            label={t('manageMatch.shuttlePrice')}
            type="number"
            min={0}
            value={shuttlecockPrice}
            onChange={(e: any) => {
              const val = e.target.value;
              if (Number(val) < 0) return;
              setShuttlecockPrice(val);
            }}
          />

          {/* ประเภทมือ */}
          <RadioStyleMultiSelect
            label={t('manageMatch.rankType')}
            options={levelOptions}
            selected={ranks}
            onToggle={(val: string) => toggleValue(ranks, val, setRanks)}
          />

          {/* ประเภท เดี่ยว/คู่ — ใช้ label ไทย + value อังกฤษ */}
          <RadioStyleMultiSelect
            label={t('manageMatch.type')}
            options={[
              { label: t('manageMatch.single'), value: "SINGLE" },
              { label: t('manageMatch.double'), value: "DOUBLE" },
            ]}
            selected={types}
            onToggle={(val: string) => setTypes([val])}
          />

          {/* สายการแข่งขัน */}
          <RadioStyleMultiSelect
            label={t('manageMatch.bracket')}
            options={[{ label: t('manageMatch.lowerBracket'), value: "สายล่าง" }]}
            selected={bracketLines}
            onToggle={(val: string) =>
              toggleValue(bracketLines, val, setBracketLines)
            }
          />

          <PeopleSelector people={people} setPeople={setPeople} t={t} />
        </div>

        {/* ฝั่งขวา */}
        <div className="space-y-5">
          <UploadPreview
            title={t('manageMatch.uploadPoster')}
            onUpload={(e: any) => handleUpload(e, "poster")}
            preview={posterPreview}
            t={t}
          />
          <UploadPreview
            title={t('manageMatch.uploadQr')}
            onUpload={(e: any) => handleUpload(e, "qr")}
            preview={qrPreview}
            t={t}
          />
        </div>
      </div>

      {/* ปุ่มถัดไป */}
      <div className="flex justify-center mt-4 pb-6">
        <motion.button
          disabled={!isFormComplete || !isImagesUploaded}
          className={`w-full sm:w-auto px-10 py-2.5 rounded-2xl font-semibold text-white text-base transition-all duration-300
                  ${
                    isFormComplete && isImagesUploaded
                      ? "bg-[#194185] hover:bg-[#2ED3B7] hover:scale-105"
                      : "bg-gray-300/50 text-gray-500 cursor-not-allowed"
                  }`}
          onClick={handleNext}
        >
          {t('manageMatch.next')}
        </motion.button>
      </div>
    </motion.div>
  );
}

/* ---------- Components ย่อย ---------- */
function LabeledInput({ label, type = "text", value, onChange, language, min }: any) {
  const today = new Date().toISOString().split("T")[0];
  return (
    <div className="block text-slate-700 text-sm">
      <div className="mb-1 font-medium">{label}</div>
      {type === "date" ? (
        <div className="relative w-full">
          <DatePicker
            selected={value ? new Date(value + "T00:00:00") : null}
            onChange={(date: Date | null) => {
              if (date) {
                const offset = date.getTimezoneOffset() * 60000;
                const formattedDate = new Date(date.getTime() - offset).toISOString().split("T")[0];
                onChange({ target: { value: formattedDate } });
              } else {
                onChange({ target: { value: "" } });
              }
            }}
            locale={language === "en-US" ? "en" : "th"}
            minDate={new Date()}
            dateFormat="dd/MM/yyyy"
            shouldCloseOnSelect={true}
            placeholderText={language === "en-US" || language === "en" ? "Select Date (DD/MM/YYYY)" : "เลือกวัน/เดือน/ปี"}
            renderCustomHeader={({
              date,
              changeYear,
              changeMonth,
              decreaseMonth,
              increaseMonth,
              prevMonthButtonDisabled,
              nextMonthButtonDisabled,
            }) => {
              const months = language === "en-US" || language === "en" ? [
                "January", "February", "March", "April", "May", "June",
                "July", "August", "September", "October", "November", "December"
              ] : [
                "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
                "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"
              ];
              const years = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() + i);
              return (
                <div className="flex justify-between items-center px-4 py-1 bg-white">
                  <button
                    onClick={(e) => { e.preventDefault(); decreaseMonth(); }}
                    disabled={prevMonthButtonDisabled}
                    className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-500 hover:text-slate-900 transition-all disabled:opacity-30 disabled:hover:bg-transparent"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/></svg>
                  </button>
                  <div className="flex items-center gap-1.5">
                    <select
                      value={months[date.getMonth()]}
                      onChange={({ target: { value } }) => changeMonth(months.indexOf(value))}
                      className="font-semibold text-slate-700 bg-transparent rounded-md px-1 py-1 text-[15px] outline-none cursor-pointer hover:bg-slate-50 transition-all border-none"
                    >
                      {months.map((option) => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                    <select
                      value={date.getFullYear()}
                      onChange={({ target: { value } }) => changeYear(Number(value))}
                      className="font-semibold text-slate-700 bg-transparent rounded-md px-1 py-1 text-[15px] outline-none cursor-pointer hover:bg-slate-50 transition-all border-none"
                    >
                      {years.map((option) => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                  </div>
                  <button
                    onClick={(e) => { e.preventDefault(); increaseMonth(); }}
                    disabled={nextMonthButtonDisabled}
                    className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-500 hover:text-slate-900 transition-all disabled:opacity-30 disabled:hover:bg-transparent"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/></svg>
                  </button>
                </div>
              );
            }}
            className="w-full h-10 rounded-lg bg-white/90 text-slate-700 
            border border-slate-200 px-3 pl-10 placeholder:text-slate-400 
            focus:outline-none focus:ring-2 focus:ring-[#194185]/20 text-sm shadow-inner cursor-pointer"
          />
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
            <path d="M20 4a2 2 0 0 0-2-2h-2V1a1 1 0 0 0-2 0v1h-3V1a1 1 0 0 0-2 0v1H6V1a1 1 0 0 0-2 0v1H2a2 2 0 0 0-2 2v2h20V4ZM0 18a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8H0v10Zm5-8h10a1 1 0 0 1 0 2H5a1 1 0 0 1 0-2Z"/>
          </svg>
        </div>
      ) : (
        <input
          type={type}
          value={value}
          onChange={onChange}
          min={min}
          className="w-full h-10 rounded-lg bg-white/90 text-slate-700 
          border border-slate-200 px-3 placeholder:text-slate-400 
          focus:outline-none focus:ring-2 focus:ring-[#194185]/20 text-sm shadow-inner"
        />
      )}
    </div>
  );
}

/*  RadioStyleMultiSelect — รองรับ string และ object {label,value} */
function RadioStyleMultiSelect({ label, options, selected, onToggle }: any) {
  return (
    <div className="text-slate-700 text-sm">
      <div className="font-semibold mb-2">{label}</div>

      <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
        {options.map((opt: any) => {
          const value = typeof opt === "string" ? opt : opt.value;
          const display = typeof opt === "string" ? opt : opt.label;

          return (
            <RadioBox
              key={value}
              active={selected.includes(value)}
              onClick={() => onToggle(value)}
            >
              {display}
            </RadioBox>
          );
        })}
      </div>
    </div>
  );
}

function RadioBox({ active, children, onClick }: any) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-medium border transition-all duration-300
        ${
          active
            ? "bg-[#194185] text-white border-[#194185] shadow-sm"
            : "bg-white/80 text-slate-600 border-slate-200 hover:bg-white/90"
        }`}
    >
      <span
        className={`h-2.5 w-2.5 rounded-full border ${
          active ? "bg-[#2ED3B7] border-[#2ED3B7]" : "border-slate-400"
        }`}
      />
      {children}
    </button>
  );
}

function PeopleSelector({ people, setPeople, t }: any) {
  return (
    <div>
      <div className="font-semibold mb-2">{t('manageMatch.peopleCount')}</div>
      <div className="flex gap-3 flex-wrap justify-center sm:justify-start">
        {[16, 32].map((num) => (
          <RadioBox
            key={num}
            active={people === num}
            onClick={() => setPeople(num)}
          >
            {num}
          </RadioBox>
        ))}
      </div>
    </div>
  );
}

/* ---------- 🌈Upload Section ---------- */
function UploadPreview({ title, onUpload, preview, t }: any) {
  return (
    <label
      className="group relative flex flex-col items-center justify-center 
      w-full rounded-2xl border-2 border-dashed border-[#194185]/20 
      bg-slate-50 
      hover:bg-slate-100
      cursor-pointer overflow-hidden transition-all duration-300 shadow-sm"
    >
      <input type="file" className="hidden" onChange={onUpload} />

      {preview ? (
        <div className="relative w-full">
          <img
            src={preview}
            alt="Preview"
            className="w-full h-52 object-cover rounded-xl transition-all duration-300 group-hover:scale-[1.02]"
          />
          <div className="absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-sm font-medium transition-all">
            {t('manageMatch.changeImg')}
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-8 px-4 text-center space-y-2">
          <div className="w-14 h-14 rounded-full bg-[#194185]/10 flex items-center justify-center border border-[#194185]/20 shadow-inner">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-[#194185]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 4v16m8-8H4"
              />
            </svg>
          </div>
          <div className="font-semibold text-slate-700 text-sm sm:text-base">
            {title}
          </div>
          <p className="text-xs text-slate-500">
            {t('manageMatch.clickToUpload')}
          </p>
        </div>
      )}
    </label>
  );
}
