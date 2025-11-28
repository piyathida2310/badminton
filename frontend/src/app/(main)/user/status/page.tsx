"use client";
import React, { useState, useEffect, useMemo } from "react";
import { Upload } from "lucide-react";
import api from "@/lib/api";

// Helper to map backend status to frontend display text
const mapStatus = (status: string) => {
  switch (status) {
    case "WAITING":
      return "รอยืนยัน";
    case "PASSED":
      return "สมัครผ่าน";
    case "FAILED":
      return "ยกเลิก";
    default:
      return status;
  }
};

const mapPaymentStatus = (status: string | undefined | null) => {
  if (!status) return "—";
  switch (status) {
    case "PENDING":
      return "รอยืนยัน";
    case "CONFIRMED":
      return "ชำระเงินสำเร็จ";
    case "REJECTED":
      return "ยกเลิก";
    default:
      return status;
  }
};

const mapRank = (rank: string | undefined | null) => {
  if (!rank) return "";
  const r = rank.trim().toUpperCase();

  if (["BG", "NB", "N", "S", "P-", "P+"].includes(r)) {
    return r;
  }

  switch (r) {
    case "P_MINUS":
    case "P_MINUS ":
      return "P-";
    case "P_PLUS":
    case "P_PLUS ":
      return "P+";
    default:
      return r;
  }
};


export default function StatusPage() {
  const [showPayment, setShowPayment] = useState(false);
  const [uploadedSlip, setUploadedSlip] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [currentRegistrationId, setCurrentRegistrationId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [modalQrCodeUrl, setModalQrCodeUrl] = useState<string | null>(null);
  const [loadingQr, setLoadingQr] = useState(false);

  const [filter, setFilter] = useState({
    rank: "",
    type: "",
  });

  const [teams, setTeams] = useState<any[]>([]);

  // Fetch data from API
  useEffect(() => {
    const fetchRegistrations = async () => {
      try {
        const response = await api.get("/api/user/registrations");
        const registrations = response.data.data;

        const formattedTeams = registrations.map((reg: any) => {

          const isDouble = reg.tournament.playType === "DOUBLE";
          const members = [
            {
              id: reg.id,
              name: reg.player1Name,
              rank: mapRank(reg.playType?.trim()?.toUpperCase()),

              type: isDouble ? "คู่" : "เดี่ยว",
              register: mapStatus(reg.status),
              payment: reg.status === "FAILED" ? "ยกเลิก" : mapPaymentStatus(reg.payment?.status),
            },
          ];

          if (isDouble && reg.player2Name) {
            members.push({
              id: `${reg.id}_2`,
              name: reg.player2Name,
              rank: mapRank(reg.playType),
              type: "คู่",
              register: mapStatus(reg.status),
              payment: reg.status === "FAILED" ? "ยกเลิก" : mapPaymentStatus(reg.payment?.status),
            });
          }

          return {
            teamName: reg.teamName || "ไม่มีชื่อทีม",
            registrationId: reg.id,
            members,
            qrCodeUrl: reg.tournament?.qrCodeImg,
            tournamentId: reg.tournament?.id,
            slipUrl: reg.payment?.slipImg,
          };
        });

        // Sort: Waiting/Pending first
        formattedTeams.sort((a: any, b: any) => {
          const getPriority = (team: any) => {
            const status = team.members[0].register;
            const payment = team.members[0].payment;

            if (status === "รอยืนยัน" || payment === "รอยืนยัน") return 1;
            if (status === "สมัครผ่าน") return 2;
            if (status === "ยกเลิก") return 3;
            return 4;
          };

          return getPriority(a) - getPriority(b);
        });

        setTeams(formattedTeams);
      } catch (error) {
        console.error("Failed to fetch registrations:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRegistrations();
  }, []);

  // Fetch QR and Slip when modal opens
  useEffect(() => {
    if (showPayment && currentRegistrationId) {
      const team = teams.find((t) => t.registrationId === currentRegistrationId);
      if (team) {
        // Fetch QR Code
        if (team.tournamentId) {
          setLoadingQr(true);
          api.get(`/api/payment/qr/${team.tournamentId}`)
            .then((res) => {
              setModalQrCodeUrl(res.data.url);
            })
            .catch((err) => {
              console.error("Failed to fetch QR code:", err);
              setModalQrCodeUrl(null);
            })
            .finally(() => {
              setLoadingQr(false);
            });
        }

        // Fetch existing slip if available
        if (team.slipUrl) {
          api.get(`/api/payment/slip/${team.registrationId}`)
            .then((res) => {
              setUploadedSlip(res.data.url);
            })
            .catch((err) => {
              console.error("Failed to fetch slip:", err);
              setUploadedSlip(null);
            });
        } else {
          setUploadedSlip(null);
        }
      }
    } else {
      setModalQrCodeUrl(null);
      setUploadedSlip(null);
    }
  }, [showPayment, currentRegistrationId, teams]);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      const reader = new FileReader();
      reader.onload = (ev) => {
        setUploadedSlip(ev.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const confirmPayment = async () => {
    if (!uploadedFile || !currentRegistrationId) {
      alert("กรุณาอัปโหลดสลิปการชำระเงิน");
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("slip", uploadedFile);

      await api.post(
        `/api/registration/${currentRegistrationId}/payment/slip`,
        formData,
        {
          headers: {
            "Content-Type": undefined,
          } as any,
        }
      );

      // Update local state to show pending payment
      setTeams((prev) =>
        prev.map((team) =>
          team.registrationId === currentRegistrationId
            ? {
              ...team,
              members: team.members.map((m: any) => ({
                ...m,
                payment: "รอยืนยัน",
              })),
            }
            : team
        )
      );

      setShowPayment(false);
      setUploadedSlip(null);
      setUploadedFile(null);
      setCurrentRegistrationId(null);
      alert("อัปโหลดสลิปการชำระเงินสำเร็จ รอการตรวจสอบจากผู้จัด");
    } catch (error) {
      console.error("Failed to upload payment slip:", error);
      alert("ไม่สามารถอัปโหลดสลิปได้ กรุณาลองใหม่อีกครั้ง");
    } finally {
      setUploading(false);
    }
  };

  const rankOptions = useMemo(() => {
    const ranks = new Set<string>();
    teams.forEach((team) => {
      team.members.forEach((m: any) => {
        if (m.rank) ranks.add(m.rank);
      });
    });
    return Array.from(ranks).sort();
  }, [teams]);

  const filteredTeams = teams
    .map((team) => ({
      ...team,
      members: team.members.filter((m: any) => {
        const rankOK = filter.rank === "" || m.rank === filter.rank;
        const typeOK = filter.type === "" || m.type === filter.type;
        return rankOK && typeOK;
      }),
    }))
    .filter((team) => team.members.length > 0);

  const hasData = filteredTeams.some((t) => t.members.length > 0);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#E6F8F3] via-[#DDEDFC] to-[#F9F9FF]">
        <div className="text-[#1E293B] text-xl font-semibold">กำลังโหลดข้อมูล...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#E6F8F3] via-[#DDEDFC] to-[#F9F9FF] py-10 px-4 sm:px-6 text-[#2F3E46]">
      <h1 className="text-center text-3xl sm:text-4xl font-bold mb-10 text-[#1E293B] drop-shadow-sm">
        สถานะผู้เข้าแข่งขัน
      </h1>

      {/* 🔽 Filter */}
      <div className="max-w-6xl mx-auto mb-8 flex flex-wrap justify-center gap-4">
        <div className="flex items-center gap-2 text-sm sm:text-base">
          <label className="font-medium text-[#334155]">ประเภทมือ</label>
          <select
            value={filter.rank}
            onChange={(e) =>
              setFilter((prev) => ({ ...prev, rank: e.target.value }))
            }
            className="rounded-lg border border-slate-300 bg-white text-sm px-3 py-1 shadow-sm focus:ring-2 focus:ring-teal-400"
          >
            <option value="">ทั้งหมด</option>
            {rankOptions.map((r) => (
              <option key={r} value={r}>{r}</option>
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
            <option value="">ทั้งหมด</option>
            {["คู่", "เดี่ยว"].map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
      </div>

      {/* 🔹 ตารางทีม */}
      <div className="max-w-6xl mx-auto space-y-10">
        {!hasData ? (
          <div className="text-center text-gray-500 py-10">
            ไม่พบข้อมูลสำหรับตัวเลือกนี้
          </div>
        ) : (
          filteredTeams.map(
            (team) =>
              team.members.length > 0 && (
                <div
                  key={team.registrationId}
                  className="rounded-2xl shadow-lg border border-slate-200 bg-gradient-to-br from-[#FFFFFF] to-[#E6F3F9] backdrop-blur-sm"
                >
                  {/* หัวตาราง */}
                  <div className="relative rounded-t-2xl overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-[#5CD6C0] to-[#6BA8F8]" />
                    <div className="relative py-3 text-center text-base sm:text-lg font-semibold text-white tracking-wide z-10">
                      ทีม {team.teamName}
                    </div>
                  </div>

                  {/* ตาราง */}
                  <div className="overflow-x-auto rounded-b-2xl">
                    <table className="w-full text-center border-collapse text-sm sm:text-base min-w-[600px]">
                      <thead className="bg-[#E9F5FF] text-[#334155] font-semibold">
                        <tr>
                          <th className="p-3 border">ชื่อ–นามสกุล</th>
                          <th className="p-3 border">ประเภทมือ</th>
                          <th className="p-3 border">ประเภท</th>
                          <th className="p-3 border">สถานะการสมัคร</th>
                          <th className="p-3 border">ชำระเงิน</th>
                          <th className="p-3 border">สถานะการชำระเงิน</th>
                        </tr>
                      </thead>
                      <tbody>
                        {/* ทีมคู่ */}
                        {team.members[0].type === "คู่" ? (
                          <tr className="hover:bg-slate-50 transition-all">
                            <td className="p-3 border text-center leading-relaxed">
                              {team.members.map((m: any) => (
                                <div key={m.id}>{m.name}</div>
                              ))}
                            </td>
                            <td className="p-2 border">{team.members[0].rank}</td>
                            <td className="p-2 border">{team.members[0].type}</td>
                            <td className="p-2 border">
                              {(() => {
                                const statuses = team.members.map((m: any) => m.register);
                                const finalStatus = statuses.includes("รอยืนยัน")
                                  ? "รอยืนยัน"
                                  : statuses.includes("สมัครผ่าน")
                                    ? "สมัครผ่าน"
                                    : "ยกเลิก";
                                return (
                                  <span
                                    className={`px-3 py-1 rounded-lg text-sm font-semibold ${finalStatus === "สมัครผ่าน"
                                      ? "bg-green-200 text-green-800"
                                      : finalStatus === "รอยืนยัน"
                                        ? "bg-amber-200 text-amber-800"
                                        : "bg-red-200 text-red-800"
                                      }`}
                                  >
                                    {finalStatus}
                                  </span>
                                );
                              })()}
                            </td>
                            <td className="p-2 border">
                              {team.members[0].register === "สมัครผ่าน" ? (
                                <button
                                  onClick={() => {
                                    setCurrentRegistrationId(team.registrationId);
                                    setShowPayment(true);
                                  }}
                                  className="px-3 py-1 bg-gradient-to-r from-[#93E7E1] to-[#66C2F5] hover:opacity-90 text-[#134E4A] rounded-md text-sm font-semibold shadow-sm"
                                >
                                  ชำระเงิน
                                </button>
                              ) : (
                                <span className="text-gray-400 text-sm">—</span>
                              )}
                            </td>

                            {/* ✅ รวมสถานะการชำระเงินทั้งทีม */}
                            <td className="p-2 border">
                              {(() => {
                                const payments = team.members.map((m: any) => m.payment);
                                const finalPay = payments.includes("รอยืนยัน")
                                  ? "รอยืนยัน"
                                  : payments.includes("ชำระเงินสำเร็จ")
                                    ? "ชำระเงินสำเร็จ"
                                    : "—";
                                return (
                                  <span
                                    className={`px-3 py-1 rounded-lg text-sm font-semibold ${finalPay === "รอยืนยัน"
                                      ? "bg-yellow-200 text-yellow-800"
                                      : finalPay === "ชำระเงินสำเร็จ"
                                        ? "bg-emerald-200 text-emerald-800"
                                        : "text-gray-400"
                                      }`}
                                  >
                                    {finalPay}
                                  </span>
                                );
                              })()}
                            </td>
                          </tr>
                        ) : (
                          /* เดี่ยว */
                          team.members.map((m: any) => (
                            <tr key={m.id} className="hover:bg-slate-50 transition-all">
                              <td className="p-2 border">{m.name}</td>
                              <td className="p-2 border">{m.rank}</td>
                              <td className="p-2 border">{m.type}</td>
                              <td className="p-2 border">
                                <span
                                  className={`px-3 py-1 rounded-lg text-sm font-semibold ${m.register === "สมัครผ่าน"
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
                                    onClick={() => {
                                      setCurrentRegistrationId(team.registrationId);
                                      setShowPayment(true);
                                    }}
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
                                  className={`px-3 py-1 rounded-lg text-sm font-semibold ${m.payment === "รอยืนยัน"
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
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )
          )
        )}
      </div >

      {/* 💳 Modal ชำระเงิน */}
      {
        showPayment && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
            <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 max-w-2xl w-full relative border-2 border-sky-200">
              <button
                onClick={() => {
                  setShowPayment(false);
                  setUploadedSlip(null);
                  setUploadedFile(null);
                }}
                className="absolute top-3 right-4 text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
              <h2 className="text-lg sm:text-xl font-bold text-center mb-6 text-[#1E293B]">
                ช่องทางการชำระเงิน
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center justify-center">
                <div className="bg-[#F0F9FF] border rounded-xl p-4 sm:p-6 flex flex-col items-center justify-center shadow-sm">
                  {loadingQr ? (
                    <div className="text-gray-500">กำลังโหลด QR Code...</div>
                  ) : modalQrCodeUrl ? (
                    <img
                      src={modalQrCodeUrl}
                      alt="QR Code"
                      className="w-full max-w-[280px] h-auto rounded-xl border-2 border-[#CFE8FA] shadow-md object-contain mb-3"
                    />
                  ) : (
                    <div className="text-gray-500">ยังไม่มี QR Code</div>
                  )}
                  <p className="text-sm text-gray-600 text-center mt-1">
                    สแกน QR เพื่อโอนเข้าบัญชี
                  </p>
                </div>

                <div className="bg-[#F0F9FF] border rounded-xl p-4 sm:p-6 flex flex-col items-center justify-center shadow-sm h-full min-h-[300px]">
                  {(() => {
                    const team = teams.find((t) => t.registrationId === currentRegistrationId);
                    const paymentStatus = team?.members[0]?.payment;
                    const isEditable = paymentStatus !== "ชำระเงินสำเร็จ" && paymentStatus !== "ยกเลิก";

                    return uploadedSlip ? (
                      <div className="relative group">
                        <img
                          src={uploadedSlip}
                          alt="slip"
                          className="w-full max-w-[280px] h-auto object-contain rounded-xl border-2 border-[#CFE8FA] shadow-md mb-2"
                        />
                        {isEditable && (
                          <label className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl cursor-pointer">
                            <p className="text-white font-semibold">เปลี่ยนรูปภาพ</p>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleUpload}
                              className="hidden"
                            />
                          </label>
                        )}
                      </div>
                    ) : (
                      <label className={`flex flex-col items-center justify-center text-gray-500 ${isEditable ? "cursor-pointer" : "cursor-not-allowed opacity-50"}`}>
                        <Upload className="w-8 h-8 mb-2" />
                        <p className="text-sm text-center">
                          {isEditable ? "อัปโหลดสลิปชำระเงิน" : "ไม่สามารถอัปโหลดได้"}
                        </p>
                        {isEditable && (
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleUpload}
                            className="hidden"
                          />
                        )}
                      </label>
                    );
                  })()}
                </div>
              </div>

              <div className="text-center mt-6">
                {(() => {
                  const team = teams.find((t) => t.registrationId === currentRegistrationId);
                  const paymentStatus = team?.members[0]?.payment;
                  const isEditable = paymentStatus !== "ชำระเงินสำเร็จ" && paymentStatus !== "ยกเลิก";

                  if (!isEditable) return null;

                  return (
                    <button
                      onClick={confirmPayment}
                      disabled={uploading || !uploadedFile}
                      className={`bg-gradient-to-r from-[#6BA8F8] to-[#5CD6C0] text-white font-semibold px-6 py-2 rounded-lg shadow-md text-sm sm:text-base ${uploading || !uploadedFile ? "opacity-50 cursor-not-allowed" : "hover:opacity-90"
                        }`}
                    >
                      {uploading ? "กำลังอัปโหลด..." : "เสร็จสิ้น"}
                    </button>
                  );
                })()}
              </div>
            </div>
          </div>
        )
      }
    </div >
  );
}
