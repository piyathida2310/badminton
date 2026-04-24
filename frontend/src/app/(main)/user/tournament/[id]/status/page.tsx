"use client";
import React, { useState, useEffect, useMemo } from "react";
import { useSearchParams, useParams } from "next/navigation";
import { Upload, XCircle } from "lucide-react";
import api from "@/lib/api";
import Swal from "sweetalert2";
import { useLanguage } from "@/contexts/LanguageContext";

// Helper to map backend status to frontend display text
const mapStatus = (status: string, t: any) => {
  switch (status) {
    case "WAITING":
      return t('status.waiting');
    case "PASSED":
      return t('status.passed');
    case "FAILED":
      return t('status.failed');
    default:
      return status;
  }
};

const mapPaymentStatus = (status: string | undefined | null, t: any) => {
  if (!status) return "—";
  switch (status) {
    case "PENDING":
      return t('status.waiting');
    case "CONFIRMED":
      return t('status.confirmed');
    case "REJECTED":
      return t('status.failed');
    default:
      return status;
  }
};

const mapRank = (rank: string | undefined | null) => {
  if (!rank) return "";
  const r = rank.trim().toUpperCase();

  if (["BG", "NB", "N", "S", "P-", "P+"].includes(r)) return r;

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

const mapGender = (gender: string | null | undefined, t: any) => {
  if (!gender) return "-";
  switch (gender) {
    case "MALE":
      return t('status.male');
    case "FEMALE":
      return t('status.female');
    case "OTHER":
      return t('status.other');
    default:
      return gender;
  }
};

// -------------------- SweetAlert2 helpers --------------------
const toast = Swal.mixin({
  toast: true,
  position: "top-end",
  showConfirmButton: false,
  timer: 2200,
  timerProgressBar: true,
});

const alertInfo = (title: string, text?: string) =>
  Swal.fire({ icon: "info", title, text });

const alertSuccess = (title: string, text?: string) =>
  Swal.fire({ icon: "success", title, text });

const alertError = (title: string, text?: string) =>
  Swal.fire({ icon: "error", title, text });

const alertConfirm = (t: any, title: string, text?: string) =>
  Swal.fire({
    icon: "question",
    title,
    text,
    showCancelButton: true,
    confirmButtonText: t('status.confirm'),
    cancelButtonText: t('common.cancel'),
    reverseButtons: true, //  ยืนยันอยู่ก่อน (ซ้าย)
    focusConfirm: true,
  });

export default function StatusPage() {
  const searchParams = useSearchParams();
  const params = useParams();
  const tournamentIdFromUrl = params?.id || (searchParams ? (searchParams.get("tournamentId") || searchParams.get("id")) : null);
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

  const [showPayment, setShowPayment] = useState(false);
  const [uploadedSlip, setUploadedSlip] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [currentRegistrationId, setCurrentRegistrationId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [modalQrCodeUrl, setModalQrCodeUrl] = useState<string | null>(null);
  const [loadingQr, setLoadingQr] = useState(false);

  // Cancellation State
  const [cancelling, setCancelling] = useState(false);

  const [filter, setFilter] = useState({
    rank: "",
    type: "",
  });

  const [registrationsRaw, setRegistrationsRaw] = useState<any[]>([]);
  const [tournamentMeta, setTournamentMeta] = useState<any>(null);

  const teams = useMemo(() => {
    return registrationsRaw.map((reg: any) => {
      const isDouble = reg.tournament?.playType === "DOUBLE";
      const members: any[] = [
        {
          id: reg.id,
          name: reg.player1Name,
          gender: reg.player1Gender,
          age: calculateAge(reg.player1Birthday),
          rank: mapRank(reg.playType?.trim()?.toUpperCase()),
          type: isDouble ? t('status.double') : t('status.single'),
          typeRaw: isDouble ? "DOUBLE" : "SINGLE",
          register: reg.cancellation?.status === "REQUESTED" ? t('status.pending') : (reg.cancellation?.status === "REFUNDED" || reg.cancellation?.status === "REJECTED") ? t('status.failed') : mapStatus(reg.status, t),
          payment: reg.cancellation?.status === "REFUNDED" ? t('status.refunded') : reg.cancellation?.status === "REJECTED" ? t('status.noRefund') : reg.status === "FAILED" ? t('status.failed') : mapPaymentStatus(reg.payment?.status, t),
          cancellationStatus: reg.cancellation?.status ?? null,
        },
      ];

      if (isDouble && reg.player2Name) {
        members.push({
          id: `${reg.id}_2`,
          name: reg.player2Name,
          gender: reg.player2Gender,
          age: calculateAge(reg.player2Birthday),
          rank: mapRank(reg.playType),
          type: t('status.double'),
          typeRaw: "DOUBLE",
          register: reg.cancellation?.status === "REQUESTED" ? t('status.pending') : (reg.cancellation?.status === "REFUNDED" || reg.cancellation?.status === "REJECTED") ? t('status.failed') : mapStatus(reg.status, t),
          payment: reg.cancellation?.status === "REFUNDED" ? t('status.refunded') : reg.cancellation?.status === "REJECTED" ? t('status.noRefund') : reg.status === "FAILED" ? t('status.failed') : mapPaymentStatus(reg.payment?.status, t),
          cancellationStatus: reg.cancellation?.status ?? null,
        });
      }

      return {
        teamName: reg.teamName || t('status.noTeamName'),
        registrationId: reg.id,
        members,
        qrCodeUrl: reg.tournament?.qrCodeImg,
        tournamentId: reg.tournament?.id,
        slipUrl: reg.payment?.slipImg,
      };
    });
  }, [registrationsRaw, t]);

  // Fetch data from API
  useEffect(() => {
    const fetchRegistrations = async () => {
      try {
        const response = await api.get("/api/user/registrations");
        setRegistrationsRaw(response.data.data);
      } catch (error) {
        console.error("Failed to fetch registrations:", error);
        await alertError(t('status.loadFailed'), t('status.refreshTryAgain'));
      } finally {
        setLoading(false);
      }
    };

    fetchRegistrations();
  }, []);

  // Fetch Tournament Meta for Options
  useEffect(() => {
    if (tournamentIdFromUrl) {
      api.get(`/api/tournament/${tournamentIdFromUrl}`)
        .then((res) => {
          const data = res.data.data;
          if (typeof data.rank === "string") {
            try {
              data.rank = JSON.parse(data.rank);
            } catch (e) { }
          }
          setTournamentMeta(data);
        })
        .catch((err) => {
          console.error("Failed to fetch tournament meta:", err);
          setTournamentMeta(null);
        });
    } else {
      setTournamentMeta(null);
    }
  }, [tournamentIdFromUrl]);

  // Fetch QR and Slip when modal opens
  useEffect(() => {
    if (showPayment && currentRegistrationId) {
      const team = teams.find((t) => t.registrationId === currentRegistrationId);
      if (team) {
        // Fetch QR Code
        if (team.tournamentId) {
          setLoadingQr(true);
          api
            .get(`/api/payment/qr/${team.tournamentId}`)
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
          api
            .get(`/api/payment/slip/${team.registrationId}`)
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

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      const reader = new FileReader();
      reader.onload = (ev) => {
        setUploadedSlip(ev.target?.result as string);
      };
      reader.readAsDataURL(file);

      //  toast แจ้งว่าเลือกรูปแล้ว
      toast.fire({ icon: "success", title: t('status.slipSelected') });
    }
  };

  const confirmPayment = async () => {
    if (!uploadedFile || !currentRegistrationId) {
      await alertInfo(t('status.pleaseUploadSlip'), t('status.beforeDone'));
      return;
    }

    // Confirm ก่อนส่งสลิป
    const result = await alertConfirm(t, t('status.confirmSendSlipTitle'), t('status.confirmSendSlipDesc'));
    if (!result.isConfirmed) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("slip", uploadedFile);

      await api.post(`/api/registration/${currentRegistrationId}/payment/slip`, formData, {
        headers: {
          "Content-Type": undefined,
        } as any,
      });

      // Update local state to show pending payment
      setRegistrationsRaw((prev) =>
        prev.map((reg) =>
          reg.id === currentRegistrationId
            ? {
                ...reg,
                payment: { ...reg.payment, status: "PENDING" },
              }
            : reg
        )
      );

      setShowPayment(false);
      setUploadedSlip(null);
      setUploadedFile(null);
      setCurrentRegistrationId(null);

      await alertSuccess(t('status.uploadSuccess'), t('status.waitOrganizerReview'));
    } catch (error) {
      console.error("Failed to upload payment slip:", error);
      await alertError(t('status.uploadFailed'), t('status.tryAgain'));
    } finally {
      setUploading(false);
    }
  };

  // === Cancellation Handler ===
  const handleCancelRegistration = async (regId: number) => {
    const { value: reason, isConfirmed } = await Swal.fire({
      title: t('status.cancelRegTitle'),
      input: "textarea",
      inputLabel: t('status.cancelReasonText'),
      inputPlaceholder: t('status.cancelReasonPlaceholder'),
      inputAttributes: { "aria-label": t('status.cancelReasonText') },
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      confirmButtonText: t('status.confirmCancelBtn'),
      cancelButtonText: t('status.goBack'),
      inputValidator: (value) => {
        if (!value) return t('status.pleaseSpecifyReason');
      },
    });
    if (!isConfirmed || !reason) return;

    setCancelling(true);
    try {
      await api.post(`/api/registration/${regId}/cancel`, { reason });
      await alertSuccess(t('status.cancelSuccess'), t('status.waitOrganizerProcess'));

      setRegistrationsRaw((prev) =>
        prev.map((reg) =>
          reg.id === regId
            ? { ...reg, cancellation: { ...reg.cancellation, status: "REQUESTED" } }
            : reg
        )
      );
    } catch (error) {
      console.error("Cancel Error:", error);
      await alertError(t('status.cannotCancel'), t('status.tryAgain'));
    } finally {
      setCancelling(false);
    }
  };

  const teamsInView = useMemo(() => {
    return teams.filter((team) => {
      if (!tournamentIdFromUrl) return true;
      return String(team.tournamentId) === String(tournamentIdFromUrl);
    });
  }, [teams, tournamentIdFromUrl]);

  const rankOptions = useMemo(() => {
    if (tournamentIdFromUrl && tournamentMeta?.rank) {
      const rawRanks = Array.isArray(tournamentMeta.rank) ? tournamentMeta.rank : [];
      return rawRanks.map((r: string) => mapRank(r)).sort();
    }
    const ranks = new Set<string>();
    teamsInView.forEach((team) => {
      team.members.forEach((m: any) => {
        if (m.rank) ranks.add(m.rank);
      });
    });
    return Array.from(ranks).sort();
  }, [teamsInView, tournamentMeta, tournamentIdFromUrl]);

  const typeOptions = useMemo(() => {
    if (tournamentIdFromUrl && tournamentMeta?.playType) {
      const pt = tournamentMeta.playType;
      if (pt === "DOUBLE") return ["DOUBLE"];
      if (pt === "SINGLE") return ["SINGLE"];
    }
    const types = new Set<string>();
    teamsInView.forEach((team) => {
      team.members.forEach((m: any) => {
        if (m.typeRaw) types.add(m.typeRaw);
      });
    });
    return Array.from(types).sort();
  }, [teamsInView, tournamentMeta, tournamentIdFromUrl]);

  // Auto-select first option when options change (like manage players-status page)
  useEffect(() => {
    if (rankOptions.length > 0 && (!filter.rank || !rankOptions.includes(filter.rank))) {
      setFilter((prev) => ({ ...prev, rank: rankOptions[0] }));
    }
  }, [rankOptions]);

  useEffect(() => {
    if (typeOptions.length > 0 && (!filter.type || !typeOptions.includes(filter.type))) {
      setFilter((prev) => ({ ...prev, type: typeOptions[0] }));
    }
  }, [typeOptions]);

  const filteredTeams = teamsInView
    .map((team) => ({
      ...team,
      members: team.members.filter((m: any) => {
        const rankOK = filter.rank === "" || m.rank === filter.rank;
        const typeOK = filter.type === "" || m.typeRaw === filter.type;
        return rankOK && typeOK;
      }),
    }))
    .filter((team) => team.members.length > 0);

  const hasData = filteredTeams.some((t) => t.members.length > 0);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-[#194185] text-xl font-bold animate-pulse">{t('common.loading')}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#2ED3B7]/10 via-white to-white py-10 px-4 sm:px-6 text-[#194185]">
      <h1 className="text-center text-3xl sm:text-4xl font-bold mb-10 text-[#194185] drop-shadow-sm">
        {t('status.pageTitle')}
      </h1>

      {/* 🔽 Filter */}
      <div className="max-w-6xl mx-auto mb-8 flex flex-wrap justify-center gap-4">
        <div className="flex items-center gap-2 text-sm sm:text-base">
          <label className="font-medium text-[#334155]">{t('status.rankType')}</label>
          <select
            value={filter.rank}
            onChange={(e) => setFilter((prev) => ({ ...prev, rank: e.target.value }))}
            className="rounded-lg border border-slate-300 bg-white text-sm px-3 py-1 shadow-sm focus:ring-2 focus:ring-[#2ED3B7] outline-none"
          >
            {rankOptions.map((r: string) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2 text-sm sm:text-base">
          <label className="font-medium text-[#334155]">{t('status.type')}</label>
          <select
            value={filter.type}
            onChange={(e) => setFilter((prev) => ({ ...prev, type: e.target.value }))}
            className="rounded-lg border border-slate-300 bg-white text-sm px-3 py-1 shadow-sm focus:ring-2 focus:ring-[#2ED3B7] outline-none"
          >
            {typeOptions.map((tRaw: string) => (
              <option key={tRaw} value={tRaw}>
                {tRaw === "DOUBLE" ? t('status.double') : t('status.single')}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 🔹 ตารางทีม */}
      <div className="max-w-6xl mx-auto space-y-10">
        {!hasData ? (
          <div className="flex flex-col items-center justify-center py-10">
            <img
              src="/images/statusform.png"
              alt="No Status Data"
              className="w-64 h-64 md:w-80 md:h-80 object-contain"
            />
          </div>
        ) : (
          filteredTeams.map(
            (team) =>
              team.members.length > 0 && (
                <div
                  key={team.registrationId}
                  className="rounded-2xl shadow-lg border border-[#194185]/10 bg-white/80 backdrop-blur-sm overflow-hidden"
                >
                  {/* หัวตาราง */}
                  <div className="bg-[#194185] py-3 text-center text-base sm:text-lg font-semibold text-white tracking-wide">
                    {t('status.team')} {team.teamName}
                  </div>

                  {/* ตาราง */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-center border-collapse text-sm sm:text-base min-w-[600px]">
                      <thead className="bg-[#194185]/5 text-[#194185] font-semibold">
                        <tr>
                          <th className="p-3 border">{t('status.name')}</th>
                          <th className="p-3 border">{t('status.gender')}</th>
                          <th className="p-3 border">{t('status.age')}</th>
                          <th className="p-3 border">{t('status.rankCol')}</th>
                          <th className="p-3 border">{t('status.typeCol')}</th>
                          <th className="p-3 border">{t('status.regStatus')}</th>
                          <th className="p-3 border">{t('status.payment')}</th>
                          <th className="p-3 border">{t('status.paymentStatus')}</th>
                          <th className="p-3 border">{t('status.cancelReg')}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {/* ทีมคู่ */}
                        {team.members[0].typeRaw === "DOUBLE" ? (
                          <tr className="hover:bg-slate-50 transition-all">
                            <td className="p-3 border text-center leading-relaxed">
                              {team.members.map((m: any) => (
                                <div key={m.id}>{m.name}</div>
                              ))}
                            </td>
                            <td className="p-3 border text-center leading-relaxed">
                              {team.members.map((m: any) => (
                                <div key={m.id}>{mapGender(m.gender, t)}</div>
                              ))}
                            </td>
                            <td className="p-2 border whitespace-nowrap min-w-[70px]">
                              {team.members.map((m: any) => (
                                <div key={m.id} className="leading-relaxed">
                                  {m.age > 0 ? `${m.age} ${t('status.year')}` : "-"}
                                </div>
                              ))}
                            </td>
                            <td className="p-2 border">{team.members[0].rank}</td>
                            <td className="p-2 border">{team.members[0].type}</td>
                            <td className="p-2 border">
                              {(() => {
                                const statuses = team.members.map((m: any) => m.register);
                                const finalStatus = statuses.includes(t('status.pending'))
                                  ? t('status.pending')
                                  : statuses.includes(t('status.waiting'))
                                    ? t('status.waiting')
                                    : statuses.includes(t('status.passed'))
                                      ? t('status.passed')
                                      : t('status.failed');
                                return (
                                  <span
                                    className={`px-3 py-1 rounded-lg text-sm font-semibold ${finalStatus === t('status.passed')
                                      ? "bg-[#10B981]/10 text-[#10B981]"
                                      : finalStatus === t('status.waiting') || finalStatus === t('status.pending')
                                        ? "bg-amber-100 text-amber-600"
                                        : "bg-red-100 text-red-600"
                                      }`}
                                  >
                                    {finalStatus}
                                  </span>
                                );
                              })()}
                            </td>
                            <td className="p-2 border">
                              {team.members[0].register === t('status.passed') ? (
                                <button
                                  onClick={() => {
                                    setCurrentRegistrationId(team.registrationId);
                                    setShowPayment(true);
                                  }}
                                  className="px-3 py-1 bg-gradient-to-r from-[#93E7E1] to-[#66C2F5] hover:opacity-90 text-[#134E4A] rounded-md text-sm font-semibold shadow-sm"
                                >
                                  {t('status.pay')}
                                </button>
                              ) : (
                                <span className="text-gray-400 text-sm">—</span>
                              )}
                            </td>

                            {/*  รวมสถานะการชำระเงินทั้งทีม */}
                            <td className="p-2 border">
                              {(() => {
                                const payments = team.members.map((m: any) => m.payment);
                                const finalPay = payments.includes(t('status.waiting'))
                                  ? t('status.waiting')
                                  : payments.includes(t('status.confirmed'))
                                    ? t('status.confirmed')
                                    : "—";
                                return (
                                  <span
                                    className={`px-3 py-1 rounded-lg text-sm font-semibold ${finalPay === t('status.waiting')
                                      ? "bg-amber-100 text-amber-600"
                                      : finalPay === t('status.confirmed')
                                        ? "bg-[#10B981]/10 text-[#10B981]"
                                        : "text-gray-400"
                                      }`}
                                  >
                                    {finalPay}
                                  </span>
                                );
                              })()}
                            </td>
                            <td className="p-2 border">
                              {team.members[0].cancellationStatus === "REQUESTED" ? (
                                <span className="text-amber-600 font-semibold text-xs">{t('status.pending')}</span>
                              ) : team.members[0].cancellationStatus === "REFUNDED" || team.members[0].cancellationStatus === "REJECTED" ? (
                                <button disabled className="px-3 py-1 bg-gray-300 text-gray-600 rounded-lg text-xs font-semibold cursor-not-allowed">{t('status.canceled')}</button>
                              ) : team.members[0].register !== t('status.failed') ? (
                                <button onClick={() => handleCancelRegistration(team.registrationId)} disabled={cancelling} className="px-3 py-1 bg-red-500 text-white rounded-lg text-xs font-semibold hover:bg-red-600 shadow-sm disabled:opacity-50">
                                  {t('status.confirm')}
                                </button>
                              ) : null}
                            </td>
                          </tr>
                        ) : (
                          /* เดี่ยว */
                          team.members.map((m: any) => (
                            <tr key={m.id} className="hover:bg-slate-50 transition-all">
                              <td className="p-2 border">{m.name}</td>
                              <td className="p-2 border">{mapGender(m.gender, t)}</td>
                              <td className="p-2 border whitespace-nowrap min-w-[70px]">{m.age > 0 ? `${m.age} ${t('status.year')}` : "-"}</td>
                              <td className="p-2 border">{m.rank}</td>
                              <td className="p-2 border">{m.type}</td>
                              <td className="p-2 border">
                                <span
                                  className={`px-3 py-1 rounded-lg text-sm font-semibold ${m.register === t('status.passed')
                                    ? "bg-[#10B981]/10 text-[#10B981]"
                                    : m.register === t('status.waiting') || m.register === t('status.pending')
                                      ? "bg-amber-100 text-amber-600"
                                      : "bg-red-100 text-red-600"
                                    }`}
                                >
                                  {m.register}
                                </span>
                              </td>
                              <td className="p-2 border">
                                {m.register === t('status.passed') ? (
                                  <button
                                    onClick={() => {
                                      setCurrentRegistrationId(team.registrationId);
                                      setShowPayment(true);
                                    }}
                                    className="px-4 py-1 bg-[#2ED3B7] hover:bg-[#2ED3B7]/80 text-[#194185] rounded-md text-sm font-bold shadow-sm transition-all"
                                  >
                                    {t('status.pay')}
                                  </button>
                                ) : (
                                  <span className="text-gray-400 text-sm">—</span>
                                )}
                              </td>
                              <td className="p-2 border">
                                <span
                                  className={`px-3 py-1 rounded-lg text-sm font-semibold ${m.payment === t('status.waiting')
                                    ? "bg-amber-100 text-amber-600"
                                    : m.payment === t('status.confirmed')
                                      ? "bg-[#10B981]/10 text-[#10B981]"
                                      : "text-gray-400"
                                    }`}
                                >
                                  {m.payment}
                                </span>
                              </td>
                              <td className="p-2 border">
                                {m.cancellationStatus === "REQUESTED" ? (
                                  <span className="text-amber-600 font-semibold text-xs">{t('status.pending')}</span>
                                ) : m.cancellationStatus === "REFUNDED" || m.cancellationStatus === "REJECTED" ? (
                                  <button disabled className="px-3 py-1 bg-gray-300 text-gray-600 rounded-lg text-xs font-semibold cursor-not-allowed">{t('status.canceled')}</button>
                                ) : m.register !== t('status.failed') ? (
                                  <button onClick={() => handleCancelRegistration(team.registrationId)} disabled={cancelling} className="px-3 py-1 bg-red-500 text-white rounded-lg text-xs font-semibold hover:bg-red-600 shadow-sm disabled:opacity-50">
                                    {t('status.confirm')}
                                  </button>
                                ) : null}
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
      </div>

      {/* 💳 Modal ชำระเงิน */}
      {showPayment && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-3xl shadow-2xl p-6 sm:p-8 max-w-2xl w-full relative border border-[#194185]/10">
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

            <h2 className="text-xl sm:text-2xl font-bold text-center mb-6 text-[#194185]">
              {t('status.paymentModal')}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center justify-center">
              <div className="bg-[#F0F9FF] border rounded-xl p-4 sm:p-6 flex flex-col items-center justify-center shadow-sm">
                {loadingQr ? (
                  <div className="text-gray-500">{t('status.loadingQr')}</div>
                ) : modalQrCodeUrl ? (
                  <img
                    src={modalQrCodeUrl}
                    alt="QR Code"
                    className="w-full max-w-[280px] h-auto rounded-xl border-2 border-[#194185]/10 shadow-md object-contain mb-3"
                  />
                ) : (
                  <div className="text-gray-500">{t('status.noQr')}</div>
                )}
                <p className="text-sm text-gray-600 text-center mt-1">{t('status.scanQr')}</p>
              </div>

              <div className="bg-[#F0F9FF] border rounded-xl p-4 sm:p-6 flex flex-col items-center justify-center shadow-sm h-full min-h-[300px]">
                {(() => {
                  const team = teams.find((t) => t.registrationId === currentRegistrationId);
                  const paymentStatus = team?.members[0]?.payment;
                  const isEditable = paymentStatus !== t('status.confirmed') && paymentStatus !== t('status.failed');

                  return uploadedSlip ? (
                    <div className="relative group">
                      <img
                        src={uploadedSlip}
                        alt="slip"
                        className="w-full max-w-[280px] h-auto object-contain rounded-xl border-2 border-[#194185]/10 shadow-md mb-2"
                      />
                      {isEditable && (
                        <label className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl cursor-pointer">
                          <p className="text-white font-semibold">{t('status.changeImage')}</p>
                          <input type="file" accept="image/*" onChange={handleUpload} className="hidden" />
                        </label>
                      )}
                    </div>
                  ) : (
                    <label
                      className={`flex flex-col items-center justify-center text-gray-500 ${isEditable ? "cursor-pointer" : "cursor-not-allowed opacity-50"
                        }`}
                    >
                      <Upload className="w-8 h-8 mb-2" />
                      <p className="text-sm text-center">{isEditable ? t('status.uploadSlip') : t('status.cannotUpload')}</p>
                      {isEditable && (
                        <input type="file" accept="image/*" onChange={handleUpload} className="hidden" />
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
                const isEditable = paymentStatus !== t('status.confirmed') && paymentStatus !== t('status.failed');
                if (!isEditable) return null;

                return (
                  <button
                    onClick={confirmPayment}
                    disabled={uploading || !uploadedFile}
                    className={`bg-[#194185] hover:bg-[#2ED3B7] text-white font-bold px-8 py-2.5 rounded-xl shadow-lg transition-all text-sm sm:text-base ${uploading || !uploadedFile ? "opacity-50 cursor-not-allowed" : "hover:scale-105"
                      }`}
                  >
                    {uploading ? t('status.uploading') : t('status.done')}
                  </button>
                );
              })()}
            </div>
          </div>
        </div>
      )}


    </div>
  );
}
