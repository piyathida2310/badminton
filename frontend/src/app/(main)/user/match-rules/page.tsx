"use client";
import { useEffect, useState } from "react";
import RulesTablesPage from "../../../../../components/rulesTables";
import axios from "../../../../lib/api";

interface Tournament {
  id: number;
  name: string;
}

interface Registration {
  id: number;
  tournament: Tournament;
}

export default function Page() {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [selectedTournamentId, setSelectedTournamentId] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserRegistrations = async () => {
      try {
        const response = await axios.get("/api/user/registrations");
        const data = response.data.data;
        setRegistrations(data);

        // เลือกรายการแข่งแรกโดยอัตโนมัติถ้ามี
        if (data.length > 0) {
          setSelectedTournamentId(String(data[0].tournament.id));
        }
      } catch (error) {
        console.error("Failed to fetch user registrations:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserRegistrations();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#fff7f3] to-[#ffeae3] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-[#e07a5f] mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">กำลังโหลดข้อมูล...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#fff7f3] to-[#ffeae3] py-6 px-4">
      <div className="max-w-6xl mx-auto mb-6">
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-[#ffd4c4]">
          <label className="block text-lg font-semibold text-[#e07a5f] mb-3">
            เลือกรายการแข่งขัน
          </label>
          <select
            value={selectedTournamentId}
            onChange={(e) => setSelectedTournamentId(e.target.value)}
            className="w-full p-3 border-2 border-[#ffd4c4] rounded-xl bg-[#fffaf7] text-gray-800 font-medium focus:outline-none focus:border-[#e07a5f] focus:ring-2 focus:ring-[#e07a5f]/20 transition-all"
          >
            {registrations.length === 0 && (
              <option value="">ไม่มีรายการแข่งขันที่สมัคร</option>
            )}
            {registrations.map((reg) => (
              <option key={reg.id} value={String(reg.tournament.id)}>
                {reg.tournament.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {selectedTournamentId ? (
        <RulesTablesPage tournamentId={selectedTournamentId} readOnly={true} />
      ) : (
        <EmptyRulesView />
      )}
    </div>
  );
}

function EmptyRulesView() {
  const competitionTypeData = [
    {
      color: "bg-[#b3e5fc]",
      count: "16 คู่",
      desc: (
        <>
          <p>แบ่งกลุ่มละ 4 ทีม จำนวน 4 กลุ่ม</p>
          <p>
            - สายบน: ทีมอันดับที่ 1-2 ของกลุ่ม จำนวน 8 ทีม เข้ารอบก่อนรองชนะเลิศ
            สายบน (Quarter Finals)
          </p>
          <p>
            - สายล่าง: ทีมอันดับที่ 3-4 ของกลุ่ม จำนวน 8 ทีม
            เข้ารอบก่อนรองชนะเลิศ สายล่าง (Quarter Finals) (ถ้ามี)
          </p>
        </>
      ),
    },
    {
      color: "bg-[#ffe1df]",
      count: "32 คู่",
      desc: (
        <>
          <p>แบ่งกลุ่มละ 4 ทีม จำนวน 8 กลุ่ม</p>
          <p>
            - สายบน: ทีมอันดับที่ 1-2 ของกลุ่ม จำนวน 16 ทีม เข้ารอบ Knock Out 16
            ทีม
          </p>
          <p>
            - สายล่าง: ทีมอันดับที่ 3-4 ของกลุ่ม จำนวน 16 ทีม เข้ารอบ Knock Out
            16 ทีม สายล่าง (ถ้ามี)
          </p>
        </>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-transparent py-4 text-gray-800">
      <div className="max-w-6xl mx-auto space-y-10">
        {/* ---------------------- ประเภทการแข่งขัน ---------------------- */}
        <div>
          <h2 className="text-[35px] font-bold mb-4 text-[#e07a5f] text-center">
            ประเภทการแข่งขัน
          </h2>

          <div className="overflow-x-auto rounded-2xl shadow-lg border border-[#ffd4c4] bg-white">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-gradient-to-r from-[#ffe8b0] to-[#ffe07a] text-gray-900 text-center font-semibold">
                  <th className="border border-[#ffd4c4]/70 p-3 w-32 rounded-tl-2xl">
                    จำนวน
                  </th>
                  <th className="border border-[#ffd4c4]/70 p-3 rounded-tr-2xl">
                    รูปแบบ
                  </th>
                </tr>
              </thead>
              <tbody>
                {competitionTypeData.map((r, i) => (
                  <tr
                    key={i}
                    className="divide-x divide-[#ffd8c0] border-b border-[#ffddd0]"
                  >
                    <td
                      className={`${r.color} p-3 text-center font-bold align-top`}
                    >
                      {r.count}
                    </td>
                    <td className="p-3 bg-[#fffaf7]">{r.desc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ---------------------- กติกา ---------------------- */}
        <div>
          <h2 className="text-[35px] font-bold mb-4 text-[#e07a5f] text-center">
            กติกา
          </h2>

          <div className="overflow-x-auto rounded-2xl shadow-lg border border-[#ffd4c4] bg-white">
            <table className="w-full text-sm leading-relaxed border-collapse">
              <tbody>
                <tr className="bg-gradient-to-r from-[#ffe8b0] to-[#ffe07a] font-semibold text-center text-gray-900">
                  <td className="p-3 rounded-tl-2xl border border-[#ffd8c0] w-48">
                    หมวด
                  </td>
                  <td className="p-3 rounded-tr-2xl border border-[#ffd8c0]">
                    รายละเอียด
                  </td>
                </tr>

                <tr className="border border-[#ffd8c0]">
                  <td className="bg-[#fff6d6] font-semibold text-center align-top border-r border-[#ffd8c0]">
                    รอบแบ่งกลุ่ม
                  </td>
                  <td className="p-3 bg-[#fffaf7] space-y-1">
                    <p className="text-red-600 font-semibold">
                      - แข่งขันแบบ 21 แต้ม 2 เซ็ต ไม่มีดิวส์ ทีมที่ได้แต้มที่ 21
                      ก่อนเป็นฝ่ายชนะ
                    </p>
                    <p>- ทีมชนะ ได้ 2 คะแนน เสมอได้ 1 คะแนน แพ้ได้ 0 คะแนน</p>
                    <p>- เกณฑ์คะแนน:</p>
                    <ul className="ml-5 list-disc">
                      <li>ชนะ 2-0 เซ็ท ได้ 3 คะแนน</li>
                      <li>ชนะ 2-1 เซ็ท ได้ 2 คะแนน</li>
                      <li>แพ้ 1-2 เซ็ท ได้ 1 คะแนน</li>
                      <li>แพ้ 0-2 เซ็ท ได้ 0 คะแนน</li>
                    </ul>
                  </td>
                </tr>

                <tr className="border border-[#ffd8c0]">
                  <td className="bg-[#fff6d6] font-semibold text-center align-top border-r border-[#ffd8c0]">
                    รอบ Knock Out
                  </td>
                  <td className="p-3 bg-[#fffaf7]">
                    แข่งขันแบบ 21 แต้ม 2 ใน 3 เซ็ท มีดิวส์ (สูงสุด 30 แต้ม)
                  </td>
                </tr>

                <tr className="border border-[#ffd8c0]">
                  <td className="bg-[#fff6d6] font-semibold text-center align-top border-r border-[#ffd8c0]">
                    การให้คะแนน BYE
                  </td>
                  <td className="p-3 bg-[#fffaf7] space-y-1">
                    <p>
                      - มาไม่ทันแข่งแต่ยังแข่งต่อได้: ทีมชนะได้ 21-11 / 15-7
                    </p>
                    <p>
                      - ไม่มาแข่งทั้งกลุ่ม: ทีมชนะได้ 2-0 / 15-0,
                      ทีมแพ้หมดสิทธิ์เข้ารอบสายล่าง
                    </p>
                    <p>- บาดเจ็บเล่นต่อไม่ได้: ทีมชนะได้ 21-(คะแนนจริง)</p>
                    <p>- ทุจริต: ทีมอื่นได้ 21-0, ทีมนี้หมดสิทธิ์เข้าสายล่าง</p>
                  </td>
                </tr>

                <tr className="border border-[#ffd8c0]">
                  <td className="bg-[#fff6d6] font-semibold text-center align-top border-r border-[#ffd8c0]">
                    การเสิร์ฟ
                  </td>
                  <td className="p-3 bg-[#fffaf7]">
                    <p>
                      - เสิร์ฟด้านหน้า: Forehand หรือ Backhand ได้
                      แต่ห้ามพุ่งใส่ตัว
                    </p>
                    <p>
                      - เสิร์ฟด้านหลัง: ได้เฉพาะ Forehand
                      ต้องเป็นวิถีโค้งขึ้นสูง
                    </p>
                  </td>
                </tr>

                <tr className="border border-[#ffd8c0]">
                  <td className="bg-[#ffe66f] font-semibold text-center align-top text-[#d6336c] border-r border-[#ffd8c0]">
                    !!! สำคัญ !!!
                  </td>
                  <td className="p-3 bg-[#fff4f4] font-semibold text-[#d6336c]">
                    - หลังจบแมตช์ทุกครั้ง ต้องลงคะแนนและเซ็นชื่อในใบคะแนน <br />
                    - ทีมชนะนำใบคะแนนส่งที่โต๊ะดำเนินการ <br />
                    - แจ้งแก้คะแนนได้เฉพาะก่อนออกสาย Knock Out เท่านั้น <br />-
                    หากตรวจสอบพบว่ามีการแก้ไข → ถือว่าทุจริต → ปรับแพ้ 21-0
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* ---------------------- กติกาแข่งขัน (ว่าง) ---------------------- */}
        <div>
          <h2 className="text-[35px] font-bold mb-4 text-[#e07a5f] text-center">
            กติกาแข่งขัน
          </h2>

          <div className="overflow-x-auto rounded-2xl shadow-lg border bg-white">
            <table className="w-full text-sm leading-relaxed">
              <tbody>
                <tr className="bg-gradient-to-r from-[#ffe8b0] to-[#ffe07a] font-semibold text-center text-gray-900">
                  <td className="p-3 border">รายละเอียด</td>
                </tr>

                <tr>
                  <td className="p-3 bg-[#fffaf7] space-y-2 h-20 text-center text-gray-400">
                    -
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* ---------------------- เวลารอบการแข่งขัน (ว่าง) ---------------------- */}
        <div>
          <h2 className="text-[35px] font-bold mb-4 text-[#e07a5f] text-center">
            เวลารอบการแข่งขัน
          </h2>

          <div className="overflow-x-auto rounded-2xl shadow-lg border bg-white">
            <table className="w-full text-sm border">
              <thead>
                <tr className="bg-gradient-to-r from-[#ffe8b0] to-[#ffe07a] font-semibold text-center">
                  <th className="p-3 border">เวลา</th>
                  <th className="p-3 border">ระดับฝีมือ</th>
                  <th className="p-3 border">รายละเอียด</th>
                </tr>
              </thead>

              <tbody>
                <tr>
                  <td colSpan={3} className="p-3 text-gray-500 text-center">
                    ยังไม่มีข้อมูลเวลาการแข่งขัน
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
