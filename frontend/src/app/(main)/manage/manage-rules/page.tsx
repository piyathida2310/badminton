"use client";

import React from "react";

const Page = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#fff7f3] to-[#ffeae3] py-10 px-4 text-gray-800">
      <div className="max-w-6xl mx-auto space-y-10">
        {/* 🧡 ตารางที่ 1: ประเภทการแข่งขัน */}
        <div>
          <h2 className="text-2xl font-bold mb-4 text-[#e07a5f] text-center">
            ประเภทการแข่งขัน
          </h2>

          <div className="overflow-x-auto rounded-2xl shadow-lg border border-[#ffd4c4] bg-white">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-gradient-to-r from-[#ffe8b0] to-[#ffe07a] text-gray-900 text-center font-semibold">
                  <th className="border border-[#ffd4c4]/70 p-3 rounded-tl-2xl">
                    ประเภท
                  </th>
                  <th className="border border-[#ffd4c4]/70 p-3">จำนวน</th>
                  <th className="border border-[#ffd4c4]/70 p-3 rounded-tr-2xl">
                    รูปแบบ
                  </th>
                </tr>
              </thead>
              <tbody>
                {[
                  {
                    color: "bg-[#b7ece6]",
                    label: "BG",
                    count: "16 คู่",
                    desc: (
                      <>
                        <p>แบ่งกลุ่มละ 4 ทีม จำนวน 4 กลุ่ม</p>
                        <p>
                          - สายบน: ทีมอันดับที่ 1-2 ของกลุ่ม จำนวน 8 ทีม
                          เข้ารอบก่อนรองชนะเลิศ สายบน (Quarter Finals)
                        </p>
                        <p>
                          - สายล่าง: ทีมอันดับที่ 3-4 ของกลุ่ม จำนวน 8 ทีม
                          เข้ารอบก่อนรองชนะเลิศ สายล่าง (Quarter Finals)
                        </p>
                      </>
                    ),
                  },
                  {
                    color: "bg-[#e8d2fa]",
                    label: "N-",
                    count: "24 คู่",
                    desc: (
                      <>
                        <p>แบ่งกลุ่มละ 4 ทีม จำนวน 6 กลุ่ม</p>
                        <p>
                          - สายบน: ทีมอันดับที่ 1-2 ของกลุ่ม จำนวน 12 ทีม
                          และทีมอันดับที่ดีที่สุด 4 ทีม เข้ารอบ Knock Out 16 ทีม
                          สายบน
                        </p>
                        <p>
                          - สายล่าง: ทีมอันดับที่ 3 ที่เหลือ 2 ทีม
                          และทีมอันดับที่ 4 ของกลุ่ม จำนวน 6 ทีม
                          เข้ารอบก่อนรองชนะเลิศ สายล่าง (Quarter Finals)
                        </p>
                      </>
                    ),
                  },
                  {
                    color: "bg-[#ffe1df]",
                    label: "N",
                    count: "16 คู่",
                    desc: (
                      <>
                        <p>แบ่งกลุ่มละ 4 ทีม จำนวน 4 กลุ่ม</p>
                        <p>
                          - สายบน: ทีมอันดับที่ 1-2 ของกลุ่ม จำนวน 8 ทีม
                          เข้ารอบก่อนรองชนะเลิศ สายบน (Quarter Finals)
                        </p>
                        <p>
                          - สายล่าง: ทีมอันดับที่ 3-4 ของกลุ่ม จำนวน 8 ทีม
                          เข้ารอบก่อนรองชนะเลิศ สายล่าง (Quarter Finals)
                        </p>
                      </>
                    ),
                  },
                  {
                    color: "bg-[#c9f7d2]",
                    label: "เดี่ยว N-",
                    count: "16 คู่",
                    desc: (
                      <>
                        <p>แบ่งกลุ่มละ 4 ทีม จำนวน 4 กลุ่ม</p>
                        <p>
                          - สายบน: ทีมอันดับที่ 1-2 ของกลุ่ม จำนวน 8 ทีม
                          เข้ารอบก่อนรองชนะเลิศ สายบน (Quarter Finals)
                        </p>
                        <p>
                          - สายล่าง: ทีมอันดับที่ 3-4 ของกลุ่ม จำนวน 8 ทีม
                          เข้ารอบก่อนรองชนะเลิศ สายล่าง (Quarter Finals)
                        </p>
                      </>
                    ),
                  },
                  {
                    color: "bg-[#ffd297]",
                    label: "เดี่ยว N",
                    count: "8 คู่",
                    desc: (
                      <>
                        <p>แบ่งกลุ่มละ 2 ทีม จำนวน 2 กลุ่ม</p>
                        <p>
                          - สายบน: ทีมอันดับที่ 1-2 ของกลุ่ม จำนวน 4 ทีม
                          เข้ารอบรองชนะเลิศ สายบน (Semi Finals)
                        </p>
                        <p>
                          - สายล่าง: ทีมอันดับที่ 3-4 ของกลุ่ม จำนวน 4 ทีม
                          เข้ารอบรองชนะเลิศ สายล่าง (Semi Finals)
                        </p>
                      </>
                    ),
                  },
                  {
                    color: "bg-[#ffe9c5]",
                    label: "N/S",
                    count: "8 คู่",
                    desc: (
                      <>
                        <p>แบ่งกลุ่มละ 2 ทีม จำนวน 2 กลุ่ม</p>
                        <p>
                          - สายบน: ทีมอันดับที่ 1-2 ของกลุ่ม จำนวน 4 ทีม
                          เข้ารอบรองชนะเลิศ สายบน (Semi Finals)
                        </p>
                        <p>
                          - สายล่าง: ทีมอันดับที่ 3-4 ของกลุ่ม จำนวน 4 ทีม
                          เข้ารอบรองชนะเลิศ สายล่าง (Semi Finals)
                        </p>
                      </>
                    ),
                  },
                ].map((r, i) => (
                  <tr
                    key={i}
                    className="divide-x divide-[#ffd8c0] border-b border-[#ffddd0]"
                  >
                    <td
                      className={`${r.color} p-3 text-center font-bold align-top`}
                    >
                      {r.label}
                    </td>
                    <td className="p-3 text-center align-top bg-[#fffaf7]">
                      {r.count}
                    </td>
                    <td className="p-3 bg-[#fffaf7]">{r.desc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 💛 ตารางที่ 2: กติกา */}
<div>
  <h2 className="text-2xl font-bold mb-4 text-[#e07a5f] text-center">
    กติกา
  </h2>

  <div className="overflow-x-auto rounded-2xl shadow-lg border border-[#ffd4c4] bg-white">
    <table className="w-full text-sm leading-relaxed border-collapse">
      <tbody>
        {/* หัวตาราง */}
        <tr className="bg-gradient-to-r from-[#ffe8b0] to-[#ffe07a] font-semibold text-center text-gray-900">
          <td className="p-3 rounded-tl-2xl border border-[#ffd8c0] w-48">
            หมวด
          </td>
          <td className="p-3 rounded-tr-2xl border border-[#ffd8c0]">
            รายละเอียด
          </td>
        </tr>

        {/* รอบแบ่งกลุ่ม */}
        <tr className="border border-[#ffd8c0]">
          <td className="bg-[#fff6d6] font-semibold text-center align-top border-r border-[#ffd8c0]">
            รอบแบ่งกลุ่ม
          </td>
          <td className="p-3 bg-[#fffaf7] space-y-1">
            <p className="text-red-600 font-semibold">ประเภททีม BG, N-, N</p>
            <p>- แข่งขันแบบ 21 แต้ม 2 เซ็ท ไม่มีดิวส์ ทีมที่ได้แต้มที่ 21 ก่อนเป็นฝ่ายชนะในเซ็ทนั้นๆ</p>
            <p>- ทีมชนะ ได้ 2 คะแนน เสมอได้ 1 คะแนน แพ้ได้ 0 คะแนน</p>

            <p className="text-red-600 font-semibold mt-2">ประเภทเดี่ยว N-</p>
            <p>- แข่งขันแบบ 15 แต้ม 2 เซ็ท ไม่มีดิวส์ ทีมที่ได้แต้มที่ 15 ก่อนเป็นฝ่ายชนะในเซ็ทนั้นๆ</p>
            <p>- ทีมชนะ ได้ 2 คะแนน เสมอได้ 1 คะแนน แพ้ได้ 0 คะแนน</p>

            <p className="text-red-600 font-semibold mt-2">ประเภทเดี่ยว N</p>
            <p>- แข่งขันแบบ 15 แต้ม 2 ใน 3 เซ็ท ไม่มีดิวส์ ทีมที่ได้แต้มที่ 15 ก่อนเป็นฝ่ายชนะในเซ็ทนั้นๆ</p>
            <p>- เกณฑ์คะแนน:</p>
            <ul className="ml-5 list-disc">
              <li>ชนะ 2-0 เซ็ท ได้ 3 คะแนน</li>
              <li>ชนะ 2-1 เซ็ท ได้ 2 คะแนน</li>
              <li>แพ้ 1-2 เซ็ท ได้ 1 คะแนน</li>
              <li>แพ้ 0-2 เซ็ท ได้ 0 คะแนน</li>
            </ul>

            <p className="text-red-600 font-semibold mt-2">ประเภททีม N/S</p>
            <p>- แข่งขันแบบ 21 แต้ม 2 ใน 3 เซ็ท ไม่มีดิวส์ ทีมที่ได้แต้มที่ 21 ก่อนเป็นฝ่ายชนะในเซ็ทนั้นๆ</p>
          </td>
        </tr>

        {/* รอบ Knock Out */}
        <tr className="border border-[#ffd8c0]">
          <td className="bg-[#fff6d6] font-semibold text-center align-top border-r border-[#ffd8c0]">
            รอบ Knock Out
          </td>
          <td className="p-3 bg-[#fffaf7]">
            แข่งขันแบบ 21 แต้ม 2 ใน 3 เซ็ท มีดิวส์ (สูงสุด 30 แต้ม)
          </td>
        </tr>

        {/* การให้คะแนน BYE */}
        <tr className="border border-[#ffd8c0]">
          <td className="bg-[#fff6d6] font-semibold text-center align-top border-r border-[#ffd8c0]">
            การให้คะแนน BYE
          </td>
          <td className="p-3 bg-[#fffaf7] space-y-1">
            <p>- กรณีมาไม่ทันแข่งในแมตช์ใดแมตช์หนึ่ง แต่ยังลงทำการแข่งขันในแมตช์ที่เหลือ ทีมชนะจะได้คะแนน 21-11 / 15-7 (สำหรับประเภทเดี่ยว N-)</p>
            <p>- กรณีไม่มาทำการแข่งขันในรอบแบ่งกลุ่มเลย ทีมชนะจะได้ 2-0 / 15-0 (สำหรับเดี่ยว N-) และทีมแพ้จะไม่เสียสิทธิ์เข้าไปเล่นรอบ Knock Out สายล่าง (กรณีมีสายล่าง)</p>
            <p>- กรณีคู่แข่งขันขอถอนตัวก่อนแข่ง จะได้คะแนน 21-(คะแนนเฉลี่ย) / 15-(คะแนนเฉลี่ย)</p>
          </td>
        </tr>

        {/* การเลิศฟ์ */}
        <tr className="border border-[#ffd8c0]">
          <td className="bg-[#fff6d6] font-semibold text-center align-top border-r border-[#ffd8c0]">
            การเลิศฟ์
          </td>
          <td className="p-3 bg-[#fffaf7]">
            - เลิศฟ์ได้จากฝ่ายตั้งรับลูก สามารถเลิศฟ์ได้ทั้ง Forehand และ Backhand  
            และวิถีลูกในการเลิศฟ์ต้องไม่เป็นวิถีลูกหัวข้ามศีรษะ
          </td>
        </tr>

        {/* !!! สำคัญ !!! */}
        <tr className="border border-[#ffd8c0]">
          <td className="bg-[#ffe66f] font-semibold text-center align-top text-[#d6336c] border-r border-[#ffd8c0]">
            !!! สำคัญ !!!
          </td>
          <td className="p-3 bg-[#fff4f4] font-semibold text-[#d6336c]">
            - หลังจากแข่งขันเสร็จในแต่ละแมตช์ นักกีฬา/ทีมต้องส่งผลคะแนนให้คณะผู้จัดเพื่อยืนยันผลคะแนนทันที  
            หากไม่ส่งผลการแข่งขันจะถือว่าไม่รับผลการแข่งขันในแมตช์นั้น
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</div>

      </div>
    </div>
  );
};

export default Page;
