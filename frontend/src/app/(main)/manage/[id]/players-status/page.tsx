"use client";
import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Swal from "sweetalert2";
import api from "../../../../../lib/api";

type EvaluationStatus = "WAITING" | "PASSED" | "FAILED";
type PaymentStatus = "PENDING" | "CONFIRMED" | "REJECTED";
type CancellationStatus = "REQUESTED" | "REFUNDED" | "REJECTED" | null;

interface ApplicantResponse {
  registrationId: number;
  tournamentId: number;
  tournamentName: string;
  userId: number;
  user: {
    id: number;
    userName: string | null;
    firstName: string | null;
    lastName: string | null;
    email: string | null;
    phoneNumber: string | null;
  };
  teamName?: string | null;
  managerName?: string | null;
  players: {
    name?: string | null;
    phoneNumber?: string | null;
    birthday?: string | null;
    gender?: string | null; // ✅ เพิ่ม field
  }[];
  rank: string;
  rankLabel?: string | null;
  matchType: "SINGLE" | "DOUBLE";
  matchTypeLabel?: string | null;
  status: {
    evaluation: EvaluationStatus;
    score?: number | null;
    comment?: string | null;
  };
  payment?: {
    status: PaymentStatus;
    slipUrl?: string | null;
  } | null;
  media?: {
    videoUrl?: string | null;
  } | null;
  cancellationStatus?: CancellationStatus;
  cancelReason?: string | null;
  refundQrUrl?: string | null;
  refundBankName?: string | null;
  refundAccountNum?: string | null;
  refundAccountName?: string | null;
}

interface Player {
  registrationId: number;
  team: string;
  names: string[];
  genders: string[]; // ✅ เพิ่ม field
  rank: string;
  type: string;
  videoUrl?: string | null;
  slipUrl?: string | null;
  status: EvaluationStatus;
  paymentStatus: PaymentStatus;
  score?: number | null;
  comment?: string;
  cancellationStatus?: CancellationStatus;
  cancelReason?: string | null;
  refundQrUrl?: string | null;
  refundBankName?: string | null;
  refundAccountNum?: string | null;
  refundAccountName?: string | null;
}

const evaluationStatusLabel: Record<EvaluationStatus, string> = {
  WAITING: "รอตรวจสอบ",
  PASSED: "ผ่าน",
  FAILED: "ยกเลิก",
};

const evaluationStatusColor: Record<EvaluationStatus, string> = {
  WAITING: "text-gray-500",
  PASSED: "text-green-600",
  FAILED: "text-red-500",
};

const paymentStatusLabel: Record<PaymentStatus, string> = {
  PENDING: "รอตรวจสอบ",
  CONFIRMED: "สำเร็จ",
  REJECTED: "ยกเลิก",
};

const paymentStatusColor: Record<PaymentStatus, string> = {
  PENDING: "text-gray-500",
  CONFIRMED: "text-green-600",
  REJECTED: "text-red-500",
};

const mapHandTypeLabel = (value?: string | null) => {
  if (!value) return "-";
  if (value === "P_MINUS") return "P-";
  if (value === "P_PLUS") return "P+";
  return value;
};

const mapMatchTypeLabel = (value?: string | null) => {
  if (!value) return "-";
  return value === "DOUBLE" ? "คู่" : "เดี่ยว";
};

export default function RegisterStatusPage() {
  const { id } = useParams<{ id: string }>();

  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tournamentRanks, setTournamentRanks] = useState<string[]>([]);
  const [tournamentTypes, setTournamentTypes] = useState<string[]>([]);
  const [selectedRank, setSelectedRank] = useState("");

  const [selectedType, setSelectedType] = useState("");
  const [modalVideo, setModalVideo] = useState<string | null>(null);
  const [modalImage, setModalImage] = useState<string | null>(null);
  const [selectedPlayerIndex, setSelectedPlayerIndex] = useState<number | null>(
    null
  );
  const [videoScore, setVideoScore] = useState<number>(0);

  // Refund state
  const [refunding, setRefunding] = useState(false);

  const rankOptions = useMemo(() => {
    if (tournamentRanks.length > 0) return tournamentRanks.map(r => mapHandTypeLabel(r));
    const options = Array.from(new Set(players.map((p) => p.rank).filter(Boolean)));
    return options.length ? options : ["BG", "NB", "N", "S", "P-", "P+"];
  }, [players, tournamentRanks]);

  const typeOptions = useMemo(() => {
    return Array.from(new Set(players.map((p) => p.type).filter(Boolean)));
  }, [players]);


  // Removed auto-selection useEffects to allow "All" (empty) as default

  const mapApplicantToPlayer = (applicant: ApplicantResponse): Player => {
    const fallbackName =
      `${applicant.user.firstName ?? ""} ${applicant.user.lastName ?? ""}`.trim() ||
      applicant.user.userName ||
      "ไม่ระบุชื่อ";

    const playerNames =
      applicant.players && applicant.players.length > 0
        ? applicant.players.map((p) => p.name || fallbackName).filter(Boolean)
        : [fallbackName];

    const playerGenders =
      applicant.players && applicant.players.length > 0
        ? applicant.players.map((p) => {
          if (p.gender === "MALE") return "ชาย";
          if (p.gender === "FEMALE") return "หญิง";
          return p.gender || "-";
        })
        : ["-"];

    return {
      registrationId: applicant.registrationId,
      team: applicant.teamName || applicant.managerName || fallbackName,
      names: playerNames,
      genders: playerGenders,
      rank: applicant.rankLabel || mapHandTypeLabel(applicant.rank),
      type: mapMatchTypeLabel(applicant.matchType),
      videoUrl: applicant.media?.videoUrl ?? null,
      slipUrl: applicant.payment?.slipUrl ?? null,
      status: applicant.status?.evaluation ?? "WAITING",
      paymentStatus: applicant.status?.evaluation === "FAILED" ? "REJECTED" : (applicant.payment?.status ?? "PENDING"),
      score: applicant.status?.score ?? undefined,
      comment: applicant.status?.comment ?? "",
      cancellationStatus: (applicant as any).cancellationStatus ?? null,
      cancelReason: (applicant as any).cancelReason ?? null,
      refundQrUrl: (applicant as any).refundQrUrl ?? null,
      refundBankName: (applicant as any).refundBankName ?? null,
      refundAccountNum: (applicant as any).refundAccountNum ?? null,
      refundAccountName: (applicant as any).refundAccountName ?? null,
    };
  };



  useEffect(() => {
    const fetchApplicants = async () => {
      if (!id) {
        setLoading(false);
        setError("ไม่พบรหัสทัวร์นาเมนต์");
        return;
      }
      setLoading(true);
      setError(null);

      try {
        const response = await api.get(`/api/tournament/${id}/applicants`);
        const data = response.data?.data;
        const applicants: ApplicantResponse[] = data?.applicants ?? [];
        const ranks: string[] = data?.tournament?.ranks ?? [];

        // Handle playType which might be a string or array of strings
        let playTypesRaw = data?.tournament?.playType;
        let types: string[] = [];

        if (Array.isArray(playTypesRaw)) {
          types = playTypesRaw.map((t: string) => mapMatchTypeLabel(t));
        } else if (typeof playTypesRaw === 'string') {
          // In case it's a single string, though usually it's an array for checkboxes
          // If it's a JSON string representation of array
          try {
            const parsed = JSON.parse(playTypesRaw);
            if (Array.isArray(parsed)) {
              types = parsed.map((t: string) => mapMatchTypeLabel(t));
            } else {
              types = [mapMatchTypeLabel(playTypesRaw)];
            }
          } catch {
            types = [mapMatchTypeLabel(playTypesRaw)];
          }
        }

        setPlayers(applicants.map(mapApplicantToPlayer));
        setTournamentRanks(ranks);
        setTournamentTypes(types);
        // ⭐ ตั้งค่า default เฉพาะครั้งแรกเท่านั้น เพื่อไม่ให้เด้งเวลาเปลี่ยนสถานะ
        setSelectedRank(prev => prev || (ranks.length > 0
          ? mapHandTypeLabel(ranks[0])
          : (applicants.length > 0 ? mapHandTypeLabel(applicants[0].rank) : "")
        ));

        setSelectedType(prev => prev || (types.length > 0
          ? types[0]
          : (applicants.length > 0 ? mapMatchTypeLabel(applicants[0].matchType) : "")
        ));
      } catch (err: any) {
        // Only log error if not 403
        if (err?.response?.status !== 403) {
          console.error("Failed to load applicants", err);
        }

        let message =
          err?.response?.data?.message ||
          "ไม่สามารถโหลดรายชื่อผู้สมัครได้ โปรดลองใหม่อีกครั้ง";

        if (
          err?.response?.status === 403 ||
          message.includes("Forbidden") ||
          message.includes("permissions")
        ) {
          message = "คุณไม่สามารถดูข้อมูลนี้ได้ เนื่องจากไม่ใช่รายการแข่งขันของคุณ";
        }

        setError(message);
      } finally {
        setLoading(false);
      }
    };

    fetchApplicants();
  }, [id]);





  const handleStatusChange = async (
    index: number,
    type: "status" | "payment",
    value: EvaluationStatus | PaymentStatus
  ) => {
    const player = players[index];
    if (!player) return;

    try {
      if (type === "status") {
        // Update evaluation status
        await api.patch(`/api/registration/${player.registrationId}/evaluation`, {
          status: value,
        });

        setPlayers((prev) => {
          const updated = [...prev];
          updated[index].status = value as EvaluationStatus;
          if (value === "FAILED") {
            updated[index].paymentStatus = "REJECTED";
          }
          return updated;
        });
      } else {
        // Update payment status
        await api.patch(`/api/registration/${player.registrationId}/payment/status`, {
          status: value,
        });

        setPlayers((prev) => {
          const updated = [...prev];
          updated[index].paymentStatus = value as PaymentStatus;
          return updated;
        });
      }
    } catch (error) {
      console.error("Failed to update status:", error);
      alert("ไม่สามารถอัปเดตสถานะได้ กรุณาลองใหม่อีกครั้ง");
    }
  };

  const handleConfirmScore = async () => {
    if (selectedPlayerIndex !== null) {
      const player = players[selectedPlayerIndex];
      if (!player) return;

      try {
        // Update score in database
        await api.patch(`/api/registration/${player.registrationId}/evaluation`, {
          score: videoScore,
        });

        setPlayers((prev) => {
          const updated = [...prev];
          updated[selectedPlayerIndex].score = videoScore;
          return updated;
        });

        setModalVideo(null);
        setSelectedPlayerIndex(null);
        setVideoScore(0);
      } catch (error) {
        console.error("Failed to save score:", error);
        alert("ไม่สามารถบันทึกคะแนนได้ กรุณาลองใหม่อีกครั้ง");
      }
    }
  };

  const handleCommentChange = async (index: number, value: string) => {
    const player = players[index];
    if (!player) return;

    try {
      // Update comment in database
      await api.patch(`/api/registration/${player.registrationId}/evaluation`, {
        comment: value,
      });

      setPlayers((prev) => {
        const updated = [...prev];
        if (updated[index]) {
          updated[index].comment = value;
        }
        return updated;
      });
    } catch (error) {
      console.error("Failed to save comment:", error);
      // Optionally show error to user
    }
  };

  // === Refund / Reject Handler ===
  const handleRefundAction = async (playerIndex: number, action: "REFUNDED" | "REJECTED") => {
    const player = players[playerIndex];
    if (!player) return;

    const label = action === "REFUNDED" ? "คืนเงิน" : "ไม่คืนเงิน";
    const confirmResult = await Swal.fire({
      title: `ยืนยัน${label}?`,
      text: `คุณต้องการ${label}ให้ทีม ${player.team} ใช่หรือไม่`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: action === "REFUNDED" ? "#22c55e" : "#ef4444",
      confirmButtonText: `ยืนยัน${label}`,
      cancelButtonText: "ย้อนกลับ",
    });
    if (!confirmResult.isConfirmed) return;

    setRefunding(true);
    try {
      await api.patch(`/api/registration/${player.registrationId}/refund`, { status: action });

      setPlayers(prev => {
        const updated = [...prev];
        updated[playerIndex] = {
          ...updated[playerIndex],
          cancellationStatus: action,
          status: action === "REFUNDED" ? "FAILED" as EvaluationStatus : updated[playerIndex].status,
        };
        return updated;
      });

      await Swal.fire({ title: "สำเร็จ", text: `${label}เรียบร้อยแล้ว`, icon: "success", timer: 1500, showConfirmButton: false });
    } catch (error) {
      console.error("Refund Error:", error);
      await Swal.fire({ title: "ผิดพลาด", text: "ไม่สามารถดำเนินการได้ กรุณาลองใหม่", icon: "error" });
    } finally {
      setRefunding(false);
    }
  };

  const filteredPlayers = players.filter((p) => {
    const rankMatch = !selectedRank || p.rank === selectedRank;
    const typeMatch = !selectedType || p.type === selectedType;
    return rankMatch && typeMatch;
  });


  const groupedPlayers = filteredPlayers.reduce(
    (acc: Record<string, Player[]>, player) => {
      if (!acc[player.team]) acc[player.team] = [];
      acc[player.team].push(player);
      return acc;
    },
    {}
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#E6F8F3] via-[#DDEDFC] to-[#F9F9FF] py-10 px-4 sm:px-6 text-[#2F3E46]">
      <h1 className="text-center text-3xl sm:text-4xl font-bold mb-10 text-[#1E293B] drop-shadow-sm">
        สถานะการสมัคร
      </h1>

      {/* Filter - Only show if no error */}
      {!error && (
        <div className="max-w-6xl mx-auto mb-8 flex flex-wrap justify-center gap-4">
          <div className="flex items-center gap-2 text-sm sm:text-base">
            <label className="font-medium text-[#334155]">ประเภทมือ</label>
            <select
              value={selectedRank}
              onChange={(e) => setSelectedRank(e.target.value)}
              className="rounded-lg border border-slate-300 bg-white text-sm px-3 py-1 shadow-sm focus:ring-2 focus:ring-teal-400"
            >

              {rankOptions.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2 text-sm sm:text-base">
            <label className="font-medium text-[#334155]">ประเภท</label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="rounded-lg border border-slate-300 bg-white text-sm px-3 py-1 shadow-sm focus:ring-2 focus:ring-sky-400"
            >

              {typeOptions.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {error && (
        <div
          className={`max-w-4xl mx-auto mb-6 px-4 py-3 rounded-xl text-center border ${error.includes("คุณไม่สามารถ")
            ? "bg-slate-50 border-slate-200 text-slate-500"
            : "bg-red-50 border-red-200 text-red-700"
            }`}
        >
          {error}
        </div>
      )}
      {loading && (
        <div className="max-w-4xl mx-auto mb-6 bg-slate-50 border border-slate-200 text-slate-600 px-4 py-3 rounded-xl text-center">
          กำลังโหลดข้อมูลผู้สมัคร...
        </div>
      )}

      {/* ตารางทีม */}
      <div className="max-w-6xl mx-auto space-y-10">
        {Object.entries(groupedPlayers).length === 0 && !loading && !error && (
          <div className="text-center text-slate-600 bg-white/80 border border-slate-200 rounded-2xl py-10 shadow-sm">
            ไม่มีข้อมูลผู้สมัครสำหรับทัวร์นาเมนต์นี้
          </div>
        )}
        {Object.entries(groupedPlayers).map(([teamName, members]) => (
          <div
            key={teamName}
            className="rounded-2xl shadow-lg border border-slate-200 bg-gradient-to-br from-[#FFFFFF] to-[#E6F3F9] backdrop-blur-sm"
          >
            {/* หัวทีม */}
            <div className="relative rounded-t-2xl overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-[#5CD6C0] to-[#6BA8F8]" />
              <div className="relative py-3 text-center text-base sm:text-xl font-semibold text-white tracking-wide z-10">
                ทีม {teamName}
              </div>
            </div>

            <div className="overflow-x-auto rounded-b-2xl">
              <table className="w-full border-collapse text-sm md:text-base text-center min-w-[600px]">
                <thead className="bg-[#E9F5FF] text-[#334155] font-semibold">
                  <tr>
                    <th className="border p-2">ชื่อ–นามสกุล</th>
                    <th className="border p-2">เพศ</th>
                    <th className="border p-2">ประเภทมือ</th>
                    <th className="border p-2">ประเภท</th>
                    <th className="border p-2">วิดีโอ</th>
                    <th className="border p-2">คะแนน</th>
                    <th className="border p-2">คอมเมนต์</th>
                    <th className="border p-2">สถานะ</th>
                    <th className="border p-2">รูปภาพการชำระเงิน</th>
                    <th className="border p-2">สถานะการชำระเงิน</th>
                    <th className="border p-2">การยกเลิก/คืนเงิน</th>
                  </tr>
                </thead>
                <tbody>
                  {members.map((p, i) => {
                    const globalIndex = players.findIndex(
                      (pl) => pl.registrationId === p.registrationId
                    );
                    const safeIndex = globalIndex === -1 ? i : globalIndex;
                    const hasVideo = Boolean(p.videoUrl);
                    const hasSlip = Boolean(p.slipUrl);
                    return (
                      <tr
                        key={p.registrationId}
                        className={`transition-all ${p.cancellationStatus === "REQUESTED"
                          ? "bg-red-50 hover:bg-red-100 border-l-4 border-l-red-400"
                          : p.cancellationStatus === "REFUNDED"
                            ? "bg-gray-100 opacity-60"
                            : "even:bg-slate-50 odd:bg-[#F8FAFF] hover:bg-[#E9F5FF]"
                          }`}
                      >
                        <td className="border p-2">
                          {p.names.map((n, idx) => (
                            <div key={idx} className="leading-relaxed">
                              {n}
                            </div>
                          ))}
                        </td>
                        <td className="border p-2">
                          {p.genders.map((g, idx) => (
                            <div key={idx} className="leading-relaxed">
                              {g}
                            </div>
                          ))}
                        </td>
                        <td className="border p-2">{p.rank}</td>
                        <td className="border p-2">{p.type}</td>
                        <td className="border p-2">
                          <button
                            onClick={() => {
                              if (!hasVideo || p.status === "PASSED" || p.status === "FAILED") return;
                              setModalVideo(p.videoUrl || null);
                              setSelectedPlayerIndex(safeIndex);
                            }}
                            disabled={!hasVideo || p.status === "PASSED" || p.status === "FAILED"}
                            className={`whitespace-nowrap px-3 py-1 bg-gradient-to-r from-pink-400 to-rose-400 text-white rounded-md shadow-sm ${hasVideo && p.status !== "PASSED" && p.status !== "FAILED" ? "hover:opacity-90" : "opacity-50 cursor-not-allowed"
                              }`}
                          >
                            ดูวิดีโอ
                          </button>
                        </td>
                        <td className="border p-2 text-pink-700 font-semibold">
                          {p.score !== undefined && p.score !== null ? `${p.score} / 10` : "-"}
                        </td>
                        <td className="border p-2">
                          <textarea
                            value={p.comment || ""}
                            onChange={(e) => handleCommentChange(safeIndex, e.target.value)}
                            placeholder="เพิ่มความคิดเห็น..."
                            disabled={p.status === "PASSED" || p.status === "FAILED"}
                            className={`w-full h-24 p-2 rounded-xl border border-slate-300 bg-slate-50 text-gray-700 focus:outline-none focus:ring-2 focus:ring-sky-300 resize-none shadow-sm ${p.status === "PASSED" || p.status === "FAILED" ? "opacity-50 cursor-not-allowed bg-gray-100" : ""
                              }`}
                          />
                        </td>
                        <td className="border p-2">
                          <div className="flex flex-col items-center gap-2">
                            <div
                              className={`text-sm font-semibold ${evaluationStatusColor[p.status]}`}
                            >
                              {evaluationStatusLabel[p.status] ?? p.status}
                            </div>
                            {p.status === "WAITING" && (
                              <div className="flex gap-2">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    handleStatusChange(safeIndex, "status", "PASSED");
                                  }}
                                  className="px-3 py-1 rounded-lg shadow-sm bg-green-100 text-green-700 hover:bg-green-200"
                                >
                                  ยืนยัน
                                </button>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    handleStatusChange(safeIndex, "status", "FAILED");
                                  }}
                                  className="px-3 py-1 rounded-lg shadow-sm bg-red-100 text-red-700 hover:bg-red-200"
                                >
                                  ยกเลิก
                                </button>
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="border p-2">
                          <button
                            onClick={() => hasSlip && setModalImage(p.slipUrl || null)}
                            disabled={!hasSlip}
                            className={`px-3 py-1 bg-gradient-to-r from-[#a882f5] to-[#c874d6] text-white rounded-md shadow-sm ${hasSlip ? "hover:opacity-90" : "opacity-50 cursor-not-allowed"
                              }`}
                          >
                            ดูรูปภาพ
                          </button>
                        </td>
                        <td className="border p-2">
                          <div className="flex flex-col items-center gap-2">
                            <div
                              className={`text-sm font-semibold ${paymentStatusColor[p.paymentStatus]}`}
                            >
                              {paymentStatusLabel[p.paymentStatus] ?? p.paymentStatus}
                            </div>
                            {p.paymentStatus === "PENDING" && (
                              <div className="flex gap-2">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    handleStatusChange(safeIndex, "payment", "CONFIRMED");
                                  }}
                                  className="px-3 py-1 rounded-lg shadow-sm bg-green-100 text-green-700 hover:bg-green-200"
                                >
                                  ยืนยัน
                                </button>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    handleStatusChange(safeIndex, "payment", "REJECTED");
                                  }}
                                  className="px-3 py-1 rounded-lg shadow-sm bg-red-100 text-red-700 hover:bg-red-200"
                                >
                                  ยกเลิก
                                </button>
                              </div>
                            )}
                          </div>
                        </td>

                        {/* สถานะการยกเลิก/คืนเงิน */}
                        <td className="border p-2">
                          {p.cancellationStatus === "REQUESTED" ? (
                            <div className="flex flex-col items-center gap-1">
                              <span className="text-red-600 font-bold text-xs">ขอยกเลิก</span>
                              <div className="flex gap-1 mt-1">
                                <button
                                  onClick={() => handleRefundAction(safeIndex, "REFUNDED")}
                                  disabled={refunding}
                                  className="px-2 py-1 bg-green-500 text-white rounded-lg text-[10px] font-semibold hover:bg-green-600 shadow-sm disabled:opacity-50"
                                >
                                  คืนเงิน
                                </button>
                                <button
                                  onClick={() => handleRefundAction(safeIndex, "REJECTED")}
                                  disabled={refunding}
                                  className="px-2 py-1 bg-gray-500 text-white rounded-lg text-[10px] font-semibold hover:bg-gray-600 shadow-sm disabled:opacity-50"
                                >
                                  ไม่คืนเงิน
                                </button>
                              </div>
                            </div>
                          ) : p.cancellationStatus === "REFUNDED" ? (
                            <span className="text-green-600 font-bold text-xs">คืนเงินแล้ว</span>
                          ) : p.cancellationStatus === "REJECTED" ? (
                            <span className="text-red-600 font-bold text-xs">ไม่คืนเงิน</span>
                          ) : (
                            <span className="text-gray-400 text-xs">—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>

      {/* Modal วิดีโอ */}
      {
        modalVideo && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="relative bg-white rounded-xl p-4 w-[90%] md:w-[600px] shadow-xl">
              <button
                onClick={() => {
                  setModalVideo(null);
                  setSelectedPlayerIndex(null);
                  setVideoScore(0);
                }}
                className="absolute -top-4 -right-4 bg-rose-500 hover:bg-rose-600 text-white rounded-full w-8 h-8 flex items-center justify-center shadow-lg"
              >
                ✕
              </button>


              <div className="w-full aspect-video bg-black rounded-lg overflow-hidden mb-4">
                <video
                  src={modalVideo}
                  controls
                  className="w-full h-full object-contain"
                />
              </div>

              <div className="text-center">
                <p className="mb-2 font-semibold text-pink-700">
                  ให้คะแนนวิดีโอ (1–10)
                </p>

                <div className="flex flex-wrap justify-center gap-2">
                  {[...Array(10)].map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setVideoScore(idx + 1)}
                      className={`w-8 h-8 rounded-full border ${videoScore === idx + 1
                        ? "bg-pink-500 text-white"
                        : "bg-white hover:bg-pink-100"
                        }`}
                    >
                      {idx + 1}
                    </button>
                  ))}
                </div>

                <button
                  onClick={handleConfirmScore}
                  disabled={videoScore === 0}
                  className={`mt-4 px-6 py-2 rounded-lg text-white font-semibold transition-all ${videoScore > 0
                    ? "bg-pink-500 hover:bg-pink-600"
                    : "bg-gray-300 cursor-not-allowed"
                    }`}
                >
                  ตกลง
                </button>
              </div>
            </div>
          </div>
        )
      }


      {/* Modal รูปภาพ */}
      {
        modalImage && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[60]">
            <div className="bg-white rounded-xl p-4 shadow-xl relative max-w-[90%] md:max-w-lg">
              <button
                onClick={() => setModalImage(null)}
                className="absolute top-2 right-2 bg-gray-400 text-white rounded-full px-3 py-1"
              >
                ✕
              </button>
              <img
                src={modalImage}
                alt="slip"
                className="rounded-lg w-full object-contain"
              />
            </div>
          </div>
        )
      }


    </div >
  );
}
