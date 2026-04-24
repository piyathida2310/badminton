"use client";
import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Swal from "sweetalert2";
import api from "../../../../../lib/api";
import { useLanguage } from "@/contexts/LanguageContext";

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
  genders: string[];
  ages: number[];
  rank: string;
  type: string;
  typeRaw: string;
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
  PASSED: "text-[#10B981]",
  FAILED: "text-red-500",
};

const paymentStatusLabel: Record<PaymentStatus, string> = {
  PENDING: "รอตรวจสอบ",
  CONFIRMED: "สำเร็จ",
  REJECTED: "ยกเลิก",
};

const paymentStatusColor: Record<PaymentStatus, string> = {
  PENDING: "text-gray-500",
  CONFIRMED: "text-[#10B981]",
  REJECTED: "text-red-500",
};

const mapHandTypeLabel = (value?: string | null) => {
  if (!value) return "-";
  if (value === "P_MINUS") return "P-";
  if (value === "P_PLUS") return "P+";
  return value;
};

const mapMatchTypeLabel = (value: string | null | undefined, t: any) => {
  if (!value) return "-";
  return value === "DOUBLE" ? t('status.double') : t('status.single');
};

export default function RegisterStatusPage() {
  const { id } = useParams<{ id: string }>();
  const { t } = useLanguage();

  // คำนวณอายุจากวันเกิด
  const calculateAge = (birthday: string | null | undefined): number => {
    if (!birthday) return 0;
    const birthDate = new Date(birthday);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
    return age;
  };

  const mapApplicantToPlayer = React.useCallback((applicant: ApplicantResponse): Player => {
    const fallbackName =
      `${applicant.user.firstName ?? ""} ${applicant.user.lastName ?? ""}`.trim() ||
      applicant.user.userName ||
      t('playersStatus.unnamed');

    const playerNames =
      applicant.players && applicant.players.length > 0
        ? applicant.players.map((p) => p.name || fallbackName).filter(Boolean)
        : [fallbackName];

    const playerGenders =
      applicant.players && applicant.players.length > 0
        ? applicant.players.map((p) => {
          if (p.gender === "MALE") return t('status.male');
          if (p.gender === "FEMALE") return t('status.female');
          return p.gender || "-";
        })
        : ["-"];

    const playerAges =
      applicant.players && applicant.players.length > 0
        ? applicant.players.map((p) => calculateAge(p.birthday))
        : [0];

    return {
      registrationId: applicant.registrationId,
      team: applicant.teamName || applicant.managerName || fallbackName,
      names: playerNames,
      genders: playerGenders,
      ages: playerAges,
      rank: applicant.rankLabel || mapHandTypeLabel(applicant.rank),
      type: mapMatchTypeLabel(applicant.matchType, t),
      typeRaw: applicant.matchType,
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
  }, [t]);

  const [applicantsRaw, setApplicantsRaw] = useState<ApplicantResponse[]>([]);
  const players: Player[] = useMemo(() => applicantsRaw.map(mapApplicantToPlayer), [applicantsRaw, mapApplicantToPlayer]);
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
    return Array.from(new Set(players.map((p) => p.typeRaw).filter(Boolean)));
  }, [players]);


  // Removed auto-selection useEffects to allow "All" (empty) as default

  useEffect(() => {
    const fetchApplicants = async () => {
      if (!id) {
        setLoading(false);
        setError(t('playersStatus.noTournamentId'));
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
          types = playTypesRaw;
        } else if (typeof playTypesRaw === 'string') {
          try {
            const parsed = JSON.parse(playTypesRaw);
            if (Array.isArray(parsed)) {
              types = parsed;
            } else {
              types = [playTypesRaw];
            }
          } catch {
            types = [playTypesRaw];
          }
        }

        setApplicantsRaw(applicants);
        setTournamentRanks(ranks);
        setTournamentTypes(types);
        // ⭐ ตั้งค่า default เฉพาะครั้งแรกเท่านั้น เพื่อไม่ให้เด้งเวลาเปลี่ยนสถานะ
        setSelectedRank(prev => prev || (ranks.length > 0
          ? mapHandTypeLabel(ranks[0])
          : (applicants.length > 0 ? mapHandTypeLabel(applicants[0].rank) : "")
        ));

        setSelectedType(prev => prev || (types.length > 0
          ? types[0]
          : (applicants.length > 0 ? applicants[0].matchType : "")
        ));
      } catch (err: any) {
        // Only log error if not 403
        if (err?.response?.status !== 403) {
          console.error("Failed to load applicants", err);
        }

        let message =
          err?.response?.data?.message ||
          t('playersStatus.loadFailed');

        if (
          err?.response?.status === 403 ||
          message.includes("Forbidden") ||
          message.includes("permissions")
        ) {
          message = t('playersStatus.forbidden');
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

        setApplicantsRaw((prev) => {
          const updated = [...prev];
          updated[index] = {
            ...updated[index],
            status: { ...updated[index].status, evaluation: value as EvaluationStatus }
          };
          if (value === "FAILED") {
            updated[index].payment = { ...updated[index].payment, status: "REJECTED" as PaymentStatus };
          }
          return updated;
        });
      } else {
        // Update payment status
        await api.patch(`/api/registration/${player.registrationId}/payment/status`, {
          status: value,
        });

        setApplicantsRaw((prev) => {
          const updated = [...prev];
          updated[index] = {
            ...updated[index],
            payment: { ...updated[index].payment, status: value as PaymentStatus }
          };
          return updated;
        });
      }
    } catch (error) {
      console.error("Failed to update status:", error);
      alert(t('playersStatus.updateFailed'));
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

        setApplicantsRaw((prev) => {
          const updated = [...prev];
          updated[selectedPlayerIndex] = {
            ...updated[selectedPlayerIndex],
            status: { ...updated[selectedPlayerIndex].status, score: videoScore }
          };
          return updated;
        });

        setModalVideo(null);
        setSelectedPlayerIndex(null);
        setVideoScore(0);
      } catch (error) {
        console.error("Failed to save score:", error);
        alert(t('playersStatus.saveScoreFailed'));
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

      setApplicantsRaw((prev) => {
        const updated = [...prev];
        if (updated[index]) {
          updated[index] = {
            ...updated[index],
            status: { ...updated[index].status, comment: value }
          };
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

    const label = action === "REFUNDED" ? t('playersStatus.refund') : t('playersStatus.noRefund');
    const confirmResult = await Swal.fire({
      title: action === "REFUNDED" ? t('playersStatus.confirmRefundTitle') : t('playersStatus.confirmNoRefundTitle'),
      text: `${action === "REFUNDED" ? t('playersStatus.confirmRefundText') : t('playersStatus.confirmNoRefundText')} ${player.team} ${t('playersStatus.yesRef')}`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: action === "REFUNDED" ? "#22c55e" : "#ef4444",
      confirmButtonText: `${label}`,
      cancelButtonText: t('status.goBack'),
    });
    if (!confirmResult.isConfirmed) return;

    setRefunding(true);
    try {
      await api.patch(`/api/registration/${player.registrationId}/refund`, { status: action });

      setApplicantsRaw(prev => {
        const updated = [...prev];
        updated[playerIndex] = {
          ...updated[playerIndex],
          cancellationStatus: action,
          status: {
            ...updated[playerIndex].status,
            evaluation: action === "REFUNDED" ? "FAILED" : updated[playerIndex].status.evaluation,
          }
        };
        return updated;
      });

      await Swal.fire({ title: t('playersStatus.actionSuccessTitle'), text: t('playersStatus.actionSuccessText'), icon: "success", timer: 1500, showConfirmButton: false });
    } catch (error) {
      console.error("Refund Error:", error);
      await Swal.fire({ title: t('playersStatus.actionErrorTitle'), text: t('playersStatus.actionErrorText'), icon: "error" });
    } finally {
      setRefunding(false);
    }
  };



  const filteredPlayers = players.filter((p) => {
    const rankMatch = !selectedRank || p.rank === selectedRank;
    const typeMatch = !selectedType || p.typeRaw === selectedType;
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
    <div className="min-h-screen bg-[#2ED3B7]/5 py-10 px-4 sm:px-6 text-slate-800">
      <h1 className="text-center text-3xl sm:text-4xl font-extrabold mb-10 text-[#194185] drop-shadow-sm">
        {t('status.pageTitle')}
      </h1>

      {/* Filter - Only show if no error */}
      {!error && (
        <div className="max-w-6xl mx-auto mb-8 flex flex-wrap justify-center gap-4">
          <div className="flex items-center gap-2 text-sm sm:text-base">
            <label className="font-medium text-[#194185]">{t('status.rankType')}</label>
            <select
              value={selectedRank}
              onChange={(e) => setSelectedRank(e.target.value)}
              className="rounded-lg border border-slate-300 bg-white text-sm px-3 py-1 shadow-sm focus:ring-2 focus:ring-[#2ED3B7]"
            >

              {rankOptions.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2 text-sm sm:text-base">
            <label className="font-medium text-[#194185]">{t('status.type')}</label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="rounded-lg border border-slate-300 bg-white text-sm px-3 py-1 shadow-sm focus:ring-2 focus:ring-[#2ED3B7]"
            >

              {typeOptions.map((tRaw) => (
                <option key={tRaw} value={tRaw}>
                  {mapMatchTypeLabel(tRaw, t)}
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
          {t('playersStatus.loadingApplicants')}
        </div>
      )}

      {/* ตารางทีม */}
      <div className="max-w-6xl mx-auto space-y-10">
        {Object.entries(groupedPlayers).length === 0 && !loading && !error && (
          <div className="flex flex-col items-center justify-center py-10">
            <img
              src="/images/statusform.png"
              alt="No Status Data"
              className="w-64 h-64 md:w-80 md:h-80 object-contain"
            />
          </div>
        )}
        {Object.entries(groupedPlayers).map(([teamName, members]) => (
          <div
            key={teamName}
            className="rounded-2xl shadow-lg border border-slate-100 bg-white overflow-hidden"
          >
            {/* หัวทีม */}
            <div className="relative">
              <div className="absolute inset-0 bg-[#194185]" />
              <div className="relative py-3 text-center text-base sm:text-xl font-bold text-white tracking-wide z-10">
                {t('status.team')} {teamName}
              </div>
            </div>

            <div className="overflow-x-auto rounded-b-2xl">
              <table className="w-full border-collapse text-sm md:text-base text-center min-w-[600px]">
                <thead className="bg-[#194185]/5 text-[#194185] font-bold">
                  <tr>
                    <th className="border p-2">{t('status.name')}</th>
                    <th className="border p-2">{t('status.gender')}</th>
                    <th className="border p-2">{t('status.age')}</th>
                    <th className="border p-2">{t('status.rankCol')}</th>
                    <th className="border p-2">{t('status.typeCol')}</th>
                    <th className="border p-2">{t('playersStatus.video')}</th>
                    <th className="border p-2">{t('playersStatus.score')}</th>
                    <th className="border p-2">{t('playersStatus.comment')}</th>
                    <th className="border p-2">{t('status.regStatus')}</th>
                    <th className="border p-2">{t('playersStatus.slip')}</th>
                    <th className="border p-2">{t('status.paymentStatus')}</th>
                    <th className="border p-2">{t('playersStatus.cancelRefund')}</th>
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
                        <td className="border p-2 whitespace-nowrap min-w-[70px]">
                          {p.ages.map((age, idx) => (
                            <div key={idx} className="leading-relaxed">
                              {age > 0 ? `${age} ${t('status.year')}` : "-"}
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
                            className={`whitespace-nowrap px-3 py-1 bg-[#194185] text-white rounded-md shadow-sm ${hasVideo && p.status !== "PASSED" && p.status !== "FAILED" ? "hover:opacity-90" : "opacity-50 cursor-not-allowed"
                              }`}
                          >
                            {t('playersStatus.watchVideo')}
                          </button>
                        </td>
                        <td className="border p-2 text-[#194185] font-bold">
                          {p.score !== undefined && p.score !== null ? `${p.score} / 10` : "-"}
                        </td>
                        <td className="border p-2">
                          <textarea
                            value={p.comment || ""}
                            onChange={(e) => handleCommentChange(safeIndex, e.target.value)}
                            placeholder={t('playersStatus.addComment')}
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
                              {p.status === "WAITING" ? t('status.waiting') : p.status === "PASSED" ? t('status.passed') : p.status === "FAILED" ? t('status.failed') : p.status}
                            </div>
                            {p.status === "WAITING" && (
                              <div className="flex gap-2">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    handleStatusChange(safeIndex, "status", "PASSED");
                                  }}
                                  className="px-3 py-1 rounded-lg shadow-sm bg-[#2ED3B7]/20 text-[#194185] hover:bg-[#2ED3B7]/40"
                                >
                                  {t('playersStatus.confirm')}
                                </button>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    handleStatusChange(safeIndex, "status", "FAILED");
                                  }}
                                  className="px-3 py-1 rounded-lg shadow-sm bg-red-100 text-red-700 hover:bg-red-200"
                                >
                                  {t('playersStatus.cancel')}
                                </button>
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="border p-2">
                          <button
                            onClick={() => hasSlip && setModalImage(p.slipUrl || null)}
                            disabled={!hasSlip}
                            className={`px-3 py-1 bg-[#2ED3B7] text-[#194185] rounded-md shadow-sm ${hasSlip ? "hover:opacity-90 font-bold" : "opacity-50 cursor-not-allowed"
                              }`}
                          >
                            {t('playersStatus.viewImage')}
                          </button>
                        </td>
                        <td className="border p-2">
                          <div className="flex flex-col items-center gap-2">
                            <div
                              className={`text-sm font-semibold ${paymentStatusColor[p.paymentStatus]}`}
                            >
                              {p.paymentStatus === "PENDING" ? t('status.waiting') : p.paymentStatus === "CONFIRMED" ? t('status.confirmed') : p.paymentStatus === "REJECTED" ? t('status.failed') : p.paymentStatus}
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
                                  {t('playersStatus.confirm')}
                                </button>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    handleStatusChange(safeIndex, "payment", "REJECTED");
                                  }}
                                  className="px-3 py-1 rounded-lg shadow-sm bg-red-100 text-red-700 hover:bg-red-200"
                                >
                                  {t('playersStatus.cancel')}
                                </button>
                              </div>
                            )}
                          </div>
                        </td>

                        {/* สถานะการยกเลิก/คืนเงิน */}
                        <td className="border p-2">
                          {p.cancellationStatus === "REQUESTED" ? (
                            <div className="flex flex-col items-center gap-1.5">
                              <span className="text-red-600 font-bold text-sm">{t('playersStatus.cancelRequested')}</span>
                              {p.cancelReason && (
                                <button
                                  onClick={() => Swal.fire({
                                    title: `<div class="pt-2 text-2xl font-black text-rose-500 tracking-tight">${t('playersStatus.reason')}</div>`,
                                    html: `
                                      <div class="mt-4 px-2">
                                        <div class="bg-amber-50 border-2 border-dashed border-amber-200 rounded-[2rem] p-6">
                                          <div class="text-amber-800 text-lg font-bold leading-snug">
                                            ${p.cancelReason || t('playersStatus.noReason')}
                                          </div>
                                        </div>
                                        <div class="mt-4 flex items-center justify-center gap-2 text-rose-300 text-[10px] font-medium uppercase tracking-widest">
                                          <span class="h-px w-8 bg-rose-100"></span>
                                          <span>${t('playersStatus.notifiedAt')} ${new Date().toLocaleDateString(t('status.gender') === 'ชาย' ? 'th-TH' : 'en-US')}</span>
                                          <span class="h-px w-8 bg-rose-100"></span>
                                        </div>
                                      </div>
                                    `,
                                    showConfirmButton: true,
                                    confirmButtonText: t('playersStatus.acknowledge'),
                                    confirmButtonColor: "#fb7185",
                                    customClass: {
                                      popup: 'rounded-[2.5rem] p-8 border-4 border-rose-50 shadow-2xl bg-white',
                                      confirmButton: 'px-10 py-3 rounded-full font-bold text-sm shadow-md shadow-rose-100 hover:scale-105 active:scale-95 transition-all'
                                    },
                                    buttonsStyling: true,
                                    width: '420px',
                                  })}
                                  className="text-xs text-blue-600 underline hover:text-blue-800 transition-colors cursor-pointer font-medium"
                                >
                                  {t('playersStatus.viewReason')}
                                </button>
                              )}
                              <div className="flex gap-2 mt-1">
                                <button
                                  onClick={() => handleRefundAction(safeIndex, "REFUNDED")}
                                  disabled={refunding}
                                  className="px-3 py-1.5 bg-[#2ED3B7]/20 text-[#194185] rounded-lg text-xs font-semibold hover:bg-[#2ED3B7]/40 shadow-sm disabled:opacity-50 min-w-[70px] transition-colors"
                                >
                                  {t('playersStatus.refund')}
                                </button>
                                <button
                                  onClick={() => handleRefundAction(safeIndex, "REJECTED")}
                                  disabled={refunding}
                                  className="px-3 py-1.5 bg-red-100 text-red-700 rounded-lg text-xs font-semibold hover:bg-red-200 shadow-sm disabled:opacity-50 whitespace-nowrap transition-colors"
                                >
                                  {t('playersStatus.noRefund')}
                                </button>
                              </div>
                            </div>
                          ) : p.cancellationStatus === "REFUNDED" || p.cancellationStatus === "REJECTED" ? (
                            <button disabled className="px-3 py-1 bg-gray-100 text-gray-400 rounded-lg text-xs font-semibold cursor-not-allowed">{t('playersStatus.canceled')}</button>
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
                <p className="mb-2 font-semibold text-[#194185]">
                  {t('playersStatus.rateVideo')}
                </p>

                <div className="flex flex-wrap justify-center gap-2">
                  {[...Array(10)].map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setVideoScore(idx + 1)}
                      className={`w-8 h-8 rounded-full border ${videoScore === idx + 1
                        ? "bg-[#194185] text-white"
                        : "bg-white hover:bg-[#2ED3B7]/20"
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
                    ? "bg-[#194185] hover:bg-[#2ED3B7]"
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
