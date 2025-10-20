"use client";
import React, { useState } from "react";
import { Upload } from "lucide-react";

export default function StatusPage() {
  const [showPayment, setShowPayment] = useState(false);
  const [uploadedSlip, setUploadedSlip] = useState<string | null>(null);

  const [filter, setFilter] = useState({
    rank: "ทั้งหมด",
    type: "ทั้งหมด",
  });

  const [teams, setTeams] = useState([
    {
      teamName: "นิติมินี",
      members: [
        {
          id: 1,
          name: "นางสาวปิยธิดา อันชม",
          rank: "N",
          type: "คู่",
          register: "สมัครผ่าน",
          payment: "รอยืนยัน",
        },
        {
          id: 2,
          name: "นางสาวสุขหทัย พลยะเรศ",
          rank: "N",
          type: "คู่",
          register: "รอยืนยัน",
          payment: "—",
        },
      ],
    },
    {
      teamName: "นักตบเทพ",
      members: [
        {
          id: 3,
          name: "นางสาวปิยธิดา อันชม",
          rank: "BG",
          type: "เดี่ยว",
          register: "ไม่ผ่าน",
          payment: "—",
        },
      ],
    },
  ]);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setUploadedSlip(ev.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const confirmPayment = () => {
    setTeams((prev) =>
      prev.map((team) => ({
        ...team,
        members: team.members.map((m) =>
          m.register === "สมัครผ่าน" ? { ...m, payment: "ชำระเงินสำเร็จ" } : m
        ),
      }))
    );
    setShowPayment(false);
  };

  const filteredTeams = teams.map((team) => ({
    ...team,
    members: team.members.filter((m) => {
      const rankOK = filter.rank === "ทั้งหมด" || m.rank === filter.rank;
      const typeOK = filter.type === "ทั้งหมด" || m.type === filter.type;
      return rankOK && typeOK;
    }),
  }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#E6F8F3] via-[#DDEDFC] to-[#F9F9FF] py-10 px-4 sm:px-6 text-[#2F3E46]">
      <h1 className="text-center text-3xl sm:text-4xl font-bold mb-10 text-[#1E293B] drop-shadow-sm">
        สถานะผู้เข้าแข่งขัน
      </h1>

      {/* Filter ดรอปดาว */}
      <div className="max-w-6xl mx-auto mb-8 flex flex-wrap justify-center gap-4">
        <div className="flex items-center gap-2 text-sm sm:text-base">
          <label className="font-medium text-[#334155]">แรงค์</label>
          <select
            value={filter.rank}
            onChange={(e) =>
              setFilter((prev) => ({ ...prev, rank: e.target.value }))
            }
            className="rounded-lg border border-slate-300 bg-white text-sm px-3 py-1 shadow-sm focus:ring-2 focus:ring-teal-400"
          >
            {["ทั้งหมด", "BG", "NB", "N", "S", "P-", "P+"].map((r) => (
              <option key={r}>{r}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2 text-sm sm:text-base">
          <label className="font-medium text-[#334155]">ประเภท</label>
          <select
            value={filter.type}
            onChange={(e) =>
              setFilter((prev) => ({ ...prev, type: e.target.value }))
            }
            className="rounded-lg border border-slate-300 bg-white text-sm px-3 py-1 shadow-sm focus:ring-2 focus:ring-sky-400"
          >
            {["ทั้งหมด", "คู่", "เดี่ยว"].map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
        </div>
      </div>

      {/* ตารางทีม */}
      <div className="max-w-6xl mx-auto space-y-10">
        {filteredTeams.map((team) =>
          team.members.length > 0 ? (
            <div
              key={team.teamName}
              className="rounded-2xl shadow-lg border border-slate-200 bg-gradient-to-br from-[#FFFFFF] to-[#E6F3F9] backdrop-blur-sm"
            >
              {/* ✅ หัวตารางสีฟ้าเต็มมุม */}
              <div className="relative rounded-t-2xl overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-[#5CD6C0] to-[#6BA8F8]" />
                <div className="relative py-3 text-center text-base sm:text-lg font-semibold text-white tracking-wide z-10">
                  ทีม {team.teamName}
                </div>
              </div>

              {/* ✅ ย้าย overflow-x-auto มาครอบเฉพาะ table */}
              <div className="overflow-x-auto rounded-b-2xl">
                <table className="w-full text-center border-collapse text-sm sm:text-base min-w-[600px]">
                  <thead className="bg-[#E9F5FF] text-[#334155] font-semibold">
                    <tr>
                      <th className="p-3 border">ชื่อ–นามสกุล</th>
                      <th className="p-3 border">แรงค์</th>
                      <th className="p-3 border">ประเภท</th>
                      <th className="p-3 border">สถานะการสมัคร</th>
                      <th className="p-3 border">ชำระเงิน</th>
                      <th className="p-3 border">สถานะการชำระเงิน</th>
                    </tr>
                  </thead>
                  <tbody>
                    {team.members.map((m) => (
                      <tr key={m.id} className="hover:bg-slate-50 transition-all">
                        <td className="p-2 border whitespace-nowrap">{m.name}</td>
                        <td className="p-2 border">{m.rank}</td>
                        <td className="p-2 border">{m.type}</td>
                        <td className="p-2 border">
                          <span
                            className={`px-3 py-1 rounded-lg text-sm font-semibold ${
                              m.register === "สมัครผ่าน"
                                ? "bg-green-200 text-green-800"
                                : m.register === "รอยืนยัน"
                                ? "bg-amber-200 text-amber-800"
                                : "bg-red-200 text-red-800"
                            }`}
                          >
                            {m.register}
                          </span>
                        </td>
                        <td className="p-2 border">
                          {m.register === "สมัครผ่าน" ? (
                            <button
                              onClick={() => setShowPayment(true)}
                              className="px-3 py-1 bg-gradient-to-r from-[#93E7E1] to-[#66C2F5] hover:opacity-90 text-[#134E4A] rounded-md text-sm font-semibold shadow-sm"
                            >
                              ชำระเงิน
                            </button>
                          ) : (
                            <span className="text-gray-400 text-sm">—</span>
                          )}
                        </td>
                        <td className="p-2 border">
                          <span
                            className={`px-3 py-1 rounded-lg text-sm font-semibold ${
                              m.payment === "รอยืนยัน"
                                ? "bg-yellow-200 text-yellow-800"
                                : m.payment === "ชำระเงินสำเร็จ"
                                ? "bg-emerald-200 text-emerald-800"
                                : "text-gray-400"
                            }`}
                          >
                            {m.payment}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : null
        )}
      </div>

      {/* Modal ชำระเงิน */}
      {showPayment && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 max-w-2xl w-full relative border-2 border-sky-200">
            <button
              onClick={() => setShowPayment(false)}
              className="absolute top-3 right-4 text-gray-500 hover:text-gray-700"
            ></button>
            <h2 className="text-lg sm:text-xl font-bold text-center mb-6 text-[#1E293B]">
              ช่องทางการชำระเงิน
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center justify-center">
              <div className="bg-[#F0F9FF] border rounded-xl p-4 sm:p-6 flex flex-col items-center justify-center shadow-sm">
                <img
                  src="/images/qrcode.jpeg"
                  alt="QR Code"
                  className="w-full max-w-[280px] h-auto rounded-xl border-2 border-[#CFE8FA] shadow-md object-contain mb-3"
                />
                <p className="text-sm text-gray-600 text-center mt-1">
                  สแกน QR เพื่อโอนเข้าบัญชี
                </p>
              </div>

              <div className="bg-[#F0F9FF] border rounded-xl p-4 sm:p-6 flex flex-col items-center justify-center shadow-sm h-full min-h-[300px]">
                {uploadedSlip ? (
                  <img
                    src={uploadedSlip}
                    alt="slip"
                    className="w-full max-w-[280px] h-auto object-contain rounded-xl border-2 border-[#CFE8FA] shadow-md mb-2"
                  />
                ) : (
                  <label className="flex flex-col items-center justify-center text-gray-500 cursor-pointer">
                    <Upload className="w-8 h-8 mb-2" />
                    <p className="text-sm text-center">อัปโหลดสลิปชำระเงิน</p>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleUpload}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            </div>

            <div className="text-center mt-6">
              <button
                onClick={confirmPayment}
                className="bg-gradient-to-r from-[#6BA8F8] to-[#5CD6C0] hover:opacity-90 text-white font-semibold px-6 py-2 rounded-lg shadow-md text-sm sm:text-base"
              >
                เสร็จสิ้น
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
