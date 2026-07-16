"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import api from "@/src/lib/axios";
import { useAuthStore } from "@/src/lib/store/useAuthStore";
import ProtectedRoute from "@/src/components/ProtectedRoute";
import { generateSavedScanReportPDF } from "@/src/lib/utils/pdfGenerator";
import {
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  Video,
  Loader2,
  Lock,
} from "lucide-react";

type ReviewStatus =
  | "pending"
  | "confirmed"
  | "needs_recheck"
  | "incorrect"
  | "unclear";

type AppointmentStatus =
  | "Pending"
  | "Confirmed"
  | "Cancelled"
  | "Completed"
  | "Patient Absent";

// ✅ Helper: Check if appointment time has passed
function isExpired(appointmentDate: string): boolean {
  return new Date(appointmentDate) < new Date();
}

function getStatusBadge(status?: ReviewStatus) {
  const current = status || "pending";
  if (current === "confirmed")
    return "bg-emerald-500/15 text-emerald-300 border-emerald-500/30";
  if (current === "needs_recheck")
    return "bg-amber-500/15 text-amber-300 border-amber-500/30";
  if (current === "incorrect")
    return "bg-red-500/15 text-red-300 border-red-500/30";
  if (current === "unclear")
    return "bg-orange-500/15 text-orange-300 border-orange-500/30";
  return "bg-purple-500/15 text-purple-300 border-purple-500/30";
}

function getStatusLabel(status?: ReviewStatus) {
  if (status === "confirmed") return "Confirmed / Approved";
  if (status === "needs_recheck") return "Needs Recheck";
  if (status === "incorrect") return "AI Prediction Incorrect";
  if (status === "unclear") return "Image Not Clear";
  return "Pending Radiologist Review";
}

// ✅ Appointment status badge styling
function getApptStatusBadge(status: AppointmentStatus, expired: boolean) {
  if (expired && status === "Pending")
    return "bg-gray-800 text-gray-400 border-gray-600";
  if (status === "Confirmed")
    return "bg-green-900/30 text-green-400 border-green-500/30";
  if (status === "Cancelled")
    return "bg-red-900/30 text-red-400 border-red-500/30";
  if (status === "Completed")
    return "bg-blue-900/30 text-blue-400 border-blue-500/30";
  if (status === "Patient Absent")
    return "bg-orange-900/30 text-orange-400 border-orange-500/30";
  return "bg-amber-900/30 text-amber-400 border-amber-500/30";
}

// ✅ Label to show on the badge
function getApptStatusLabel(
  status: AppointmentStatus,
  expired: boolean
): string {
  if (expired && status === "Pending") return "Expired";
  return status;
}

interface Appointment {
  _id: string;
  userId: string | any;
  patientName: string;
  doctorName: string;
  clinic: string;
  appointmentDate: string;
  fee: string;
  status: AppointmentStatus;
  tumorType: string;
  createdAt: string;
}

interface ScanResult {
  _id: string;
  user: string | any;
  imageData: string;
  className: string;
  confidence: number;
  tumorDetected: boolean;
  createdAt: string;
  comment?: string;
  radiologistReviewStatus?: ReviewStatus;
  radiologistComment?: string | null;
  radiologistRecommendation?: string | null;
  reviewedAt?: string | null;
  reviewedBy?: any;
}

export default function DoctorSchedulePage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [scans, setScans] = useState<ScanResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAppt, setSelectedAppt] = useState<Appointment | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  const { user, isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated) return;
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const apptResponse = await api.get(
          `/api/appointments?userId=${user?.id}&role=doctor`
        );
        const scanResponse = await api.get(
          `/api/results?userId=${user?.id}&role=doctor`
        );
        if (apptResponse.data.success && scanResponse.data.success) {
          setAppointments(apptResponse.data.data);
          setScans(scanResponse.data.data);
          if (apptResponse.data.data.length > 0) {
            setSelectedAppt(apptResponse.data.data[0]);
          }
        }
      } catch (err) {
        console.error("Error fetching clinical data:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [isAuthenticated, user?.id]);

  const handleStatusUpdate = async (
    appointmentId: string,
    newStatus: AppointmentStatus
  ) => {
    try {
      const response = await api.put("/api/appointments", {
        appointmentId,
        status: newStatus,
      });
      if (response.data.success) {
        setAppointments((prev) =>
          prev.map((appt) =>
            appt._id === appointmentId ? { ...appt, status: newStatus } : appt
          )
        );
        if (selectedAppt?._id === appointmentId) {
          setSelectedAppt((prev) =>
            prev ? { ...prev, status: newStatus } : null
          );
        }
      }
    } catch (err) {
      console.error("Error updating status:", err);
      alert("Failed to update status.");
    }
  };

  const patientScan = selectedAppt
    ? scans.find((scan) => {
        const scanUserId =
          (scan.user as any)?._id?.toString() || scan.user?.toString();
        const apptUserId =
          typeof selectedAppt.userId === "object" &&
          selectedAppt.userId !== null
            ? selectedAppt.userId.toString()
            : selectedAppt.userId.toString();
        return scanUserId === apptUserId;
      })
    : null;

  const handleDownloadReport = async () => {
    if (!patientScan) {
      alert("No scan available for this appointment.");
      return;
    }
    try {
      setIsDownloading(true);
      const patientName = selectedAppt?.patientName || "Patient";
      await generateSavedScanReportPDF({
        scan: patientScan as any,
        patientName,
      });
    } catch (error) {
      console.error("Failed to generate PDF:", error);
      alert("An error occurred while downloading the report.");
    } finally {
      setIsDownloading(false);
    }
  };

  if (!isAuthenticated || user?.role?.toLowerCase() !== "doctor") {
    return (
      <div className="flex flex-col items-center justify-center text-white pt-20">
        <h2 className="text-2xl font-bold mb-4">Clinical Access Only</h2>
        <p className="text-gray-400">
          Please log in with a verified physician account.
        </p>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="h-auto lg:h-[calc(100vh-80px)] bg-transparent text-white w-full mx-auto pt-6 px-4 sm:px-6 pb-6 flex flex-col lg:flex-row gap-6 lg:gap-8 print:block print:p-0 print:m-0 print:bg-white">
        
        {/* LEFT COLUMN: APPOINTMENT LIST */}
        <aside className="w-full lg:w-[400px] flex flex-col gap-4 flex-none h-auto lg:h-full overflow-y-auto custom-scrollbar pr-0 lg:pr-2 print:hidden">
          <div className="mb-2 sm:mb-4 flex-none animate-fade-in-up">
            <h1 className="text-2xl sm:text-[28px] font-bold text-gray-100">
              Todays Schedule
            </h1>
            <p className="text-gray-400 text-xs sm:text-sm">
              Select an appointment to manage status and view scans.
            </p>
          </div>

          {isLoading ? (
            <div className="flex items-center gap-2 text-blue-400 text-sm py-4">
              <Loader2 className="w-4 h-4 animate-spin" />
              Loading schedules...
            </div>
          ) : appointments.length === 0 ? (
            <div className="text-gray-500 bg-white/5 backdrop-blur-sm p-6 rounded-xl border border-white/10 text-center text-sm animate-fade-in-up">
              No appointments found.
            </div>
          ) : (
            <div className="flex flex-col gap-3 sm:gap-4 flex-1 overflow-y-auto p-1">
              {appointments.map((appt, idx) => {
                const expired = isExpired(appt.appointmentDate);
                return (
                  <div
                    key={appt._id}
                    onClick={() => setSelectedAppt(appt)}
                    style={{ animationDelay: `${idx * 60}ms` }}
                    className={`p-4 rounded-xl border cursor-pointer transition-all duration-300 flex-none animate-fade-in-up hover:-translate-y-0.5 ${
                      selectedAppt?._id === appt._id
                        ? "bg-[#1e2235] border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.15)]"
                        : "bg-white/5 backdrop-blur-sm border-white/10 hover:border-gray-500"
                    }`}
                  >
                    <div className="flex justify-between items-start gap-2 mb-2">
                      <h3 className="font-bold text-gray-100 text-base truncate">
                        {appt.patientName}
                      </h3>
                      <span
                        className={`text-[9px] px-2 py-0.5 rounded-md uppercase tracking-wider font-bold whitespace-nowrap border ${getApptStatusBadge(appt.status, expired)}`}
                      >
                        {getApptStatusLabel(appt.status, expired)}
                      </span>
                    </div>
                    <p className="text-blue-400 text-xs font-medium mb-1.5">
                      {appt.appointmentDate}
                    </p>
                    <p className="text-gray-500 text-xs truncate">
                      Type: {appt.tumorType}
                    </p>

                    {/* ✅ Join button only if Confirmed AND not expired */}
                    {appt.status === "Confirmed" && !expired && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(`/consultation/${appt._id}`, "_blank");
                        }}
                        className="mt-4 w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white py-2.5 rounded-lg text-sm font-bold transition-all hover:-translate-y-0.5"
                      >
                        <Video className="w-4 h-4" />
                        Join Video Consultation
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </aside>

        {/* RIGHT COLUMN */}
        <main className="flex-1 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-4 sm:p-6 lg:p-8 shadow-xl overflow-y-auto h-auto lg:h-full custom-scrollbar print:block print:w-full print:h-auto print:overflow-visible print:bg-white print:p-0 print:border-none print:shadow-none print:text-black">
          {!selectedAppt ? (
            <div className="flex items-center justify-center h-48 lg:h-full text-gray-500 text-sm print:hidden">
              Select an appointment from the list to view details.
            </div>
          ) : (() => {
            const expired = isExpired(selectedAppt.appointmentDate);
            const isFinal =
              selectedAppt.status === "Cancelled" ||
              selectedAppt.status === "Completed" ||
              selectedAppt.status === "Patient Absent";

            return (
              <div className="flex flex-col gap-6 sm:gap-8">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-gray-800 print:hidden">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-100">
                      Consultation Details
                    </h2>
                    {/* Expired warning banner */}
                    {expired && !isFinal && (
                      <p className="text-amber-400 text-xs mt-1 font-semibold flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        This appointment time has passed.
                      </p>
                    )}
                  </div>
                  <button
                    onClick={handleDownloadReport}
                    disabled={isDownloading || !patientScan}
                    className="bg-emerald-600 hover:bg-emerald-500 disabled:bg-[#1e293b] disabled:text-gray-500 border border-transparent text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2 w-full sm:w-auto justify-center"
                  >
                    {isDownloading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" /> Generating...
                      </>
                    ) : !patientScan ? (
                      "No Scan Available"
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        Download Report
                      </>
                    )}
                  </button>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-white/5 backdrop-blur-sm p-4 sm:p-6 rounded-xl border border-white/10">
                  <div>
                    <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Patient Name</p>
                    <p className="text-base font-bold text-gray-100">{selectedAppt.patientName || "Unknown"}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Time Slot</p>
                    <p className="text-base font-bold text-gray-100">{selectedAppt.appointmentDate}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Clinic / Location</p>
                    <p className="text-sm font-semibold text-gray-300">{selectedAppt.clinic}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Current Status</p>
                    <span className={`text-xs font-bold px-2 py-1 rounded border ${getApptStatusBadge(selectedAppt.status, expired)}`}>
                      {getApptStatusLabel(selectedAppt.status, expired)}
                    </span>
                  </div>
                </div>

                {/* ✅ DOCTOR ACTION BUTTONS — smart workflow */}
                <div className="flex flex-col gap-3 print:hidden">

                  {/* CASE 1: Already in a final state */}
                  {isFinal && (
                    <div className={`w-full text-center py-3 rounded-lg text-sm font-bold border flex items-center justify-center gap-2 ${
                      selectedAppt.status === "Completed"
                        ? "bg-blue-900/20 border-blue-500/30 text-blue-400"
                        : selectedAppt.status === "Patient Absent"
                        ? "bg-orange-900/20 border-orange-500/30 text-orange-400"
                        : "bg-red-900/20 border-red-500/30 text-red-400"
                    }`}>
                      {selectedAppt.status === "Completed" && (
                        <>
                          <CheckCircle2 className="w-4 h-4" /> Consultation marked as Completed.
                        </>
                      )}
                      {selectedAppt.status === "Patient Absent" && (
                        <>
                          <AlertTriangle className="w-4 h-4" /> Patient was marked as Absent.
                        </>
                      )}
                      {selectedAppt.status === "Cancelled" && (
                        <>
                          <Lock className="w-4 h-4" /> Appointment was Cancelled.
                        </>
                      )}
                    </div>
                  )}

                  {/* CASE 2: Pending or Confirmed BUT time has NOT passed yet */}
                  {!expired && !isFinal && (
                    <div className="flex flex-col sm:flex-row gap-3">
                      <button
                        onClick={() => handleStatusUpdate(selectedAppt._id, "Confirmed")}
                        disabled={selectedAppt.status === "Confirmed"}
                        className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-500 disabled:bg-green-900/30 disabled:text-green-500/50 text-white py-3 rounded-lg text-sm font-bold transition-all hover:-translate-y-0.5"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        {selectedAppt.status === "Confirmed" ? "Already Confirmed" : "Confirm Appointment"}
                      </button>
                      <button
                        onClick={() => handleStatusUpdate(selectedAppt._id, "Cancelled")}
                        className="flex-1 flex items-center justify-center gap-2 bg-red-600 hover:bg-red-500 text-white py-3 rounded-lg text-sm font-bold transition-all hover:-translate-y-0.5"
                      >
                        <XCircle className="w-4 h-4" />
                        Cancel Appointment
                      </button>
                    </div>
                  )}

                  {/* CASE 3: Time HAS passed AND status is Confirmed → show outcome buttons */}
                  {expired && selectedAppt.status === "Confirmed" && (
                    <div className="flex flex-col gap-3">
                      <p className="text-gray-400 text-xs text-center uppercase tracking-wider">
                        Mark consultation outcome
                      </p>
                      <div className="flex flex-col sm:flex-row gap-3">
                        <button
                          onClick={() => handleStatusUpdate(selectedAppt._id, "Completed")}
                          className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-lg text-sm font-bold transition-all hover:-translate-y-0.5"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          Mark as Completed
                        </button>
                        <button
                          onClick={() => handleStatusUpdate(selectedAppt._id, "Patient Absent")}
                          className="flex-1 flex items-center justify-center gap-2 bg-orange-600 hover:bg-orange-500 text-white py-3 rounded-lg text-sm font-bold transition-all hover:-translate-y-0.5"
                        >
                          <AlertTriangle className="w-4 h-4" />
                          Patient Absent
                        </button>
                      </div>
                    </div>
                  )}

                  {/* CASE 4: Time HAS passed AND status is still Pending → expired, lock it */}
                  {expired && selectedAppt.status === "Pending" && (
                    <div className="w-full flex items-center justify-center gap-2 text-center py-3 bg-white/5 border border-white/10 text-gray-500 text-sm font-bold rounded-lg">
                      <Clock className="w-4 h-4" />
                      This appointment expired without confirmation.
                    </div>
                  )}
                </div>

                {/* AI Scan Report Section */}
                <div className="mt-2 border-t border-gray-800 pt-6">
                  <h3 className="text-lg font-bold text-gray-100 mb-4">Analysis Result</h3>
                  {!patientScan ? (
                    <div className="text-gray-500 text-center py-10 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 border-dashed text-sm">
                      No recent MRI scans found for this patient.
                    </div>
                  ) : (
                    <div className="flex flex-col gap-6">
                      <div className="w-full xl:w-1/2 aspect-square bg-[#0f111a] rounded-xl border border-white/10 overflow-hidden flex items-center justify-center p-2">
                        {patientScan.imageData ? (
                          <Image
                            src={patientScan.imageData}
                            alt="MRI Scan"
                            width={600}
                            height={600}
                            className="w-full h-full object-contain"
                            unoptimized
                          />
                        ) : (
                          <span className="text-gray-500 text-sm">Image Unavailable</span>
                        )}
                      </div>
                      <div className="flex flex-col gap-4">
                        <div className={`p-4 sm:p-6 rounded-xl border ${patientScan.tumorDetected ? "bg-red-900/10 border-red-500/30" : "bg-green-900/10 border-green-500/30"}`}>
                          <p className="text-gray-400 text-xs uppercase tracking-wider mb-2">Detection Result</p>
                          <h4 className={`text-xl font-bold mb-2 ${patientScan.tumorDetected ? "text-red-400" : "text-green-400"}`}>
                            {patientScan.className}
                          </h4>
                          <div className="w-full bg-gray-800 rounded-full h-2.5 mt-4">
                            <div className="bg-gradient-to-r from-blue-500 to-purple-500 h-2.5 rounded-full transition-all duration-500" style={{ width: `${patientScan.confidence}%` }} />
                          </div>
                          <p className="text-right text-xs text-gray-400 mt-2 font-semibold">
                            {patientScan.confidence.toFixed(2)}% AI Certainty
                          </p>
                        </div>
                        <div className="p-4 sm:p-6 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
                          <p className="text-gray-400 text-xs uppercase tracking-wider mb-3">Clinical Observations</p>
                          <p className="text-gray-200 text-sm leading-relaxed">
                            {patientScan.comment || <span className="italic text-gray-500">No clinical notes added yet.</span>}
                          </p>
                        </div>
                        <div className="p-4 sm:p-6 bg-[#1a163a] rounded-xl border border-purple-500/30">
                          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                            <p className="text-purple-400 text-xs uppercase tracking-wider font-bold">Radiologist Verification</p>
                            <span className={`rounded border px-2 py-1 text-[9px] font-bold uppercase ${getStatusBadge(patientScan.radiologistReviewStatus)}`}>
                              {getStatusLabel(patientScan.radiologistReviewStatus)}
                            </span>
                          </div>
                          <p className="text-gray-200 text-sm leading-relaxed">
                            {patientScan.radiologistComment || <span className="italic text-gray-500">Pending radiologist verification.</span>}
                          </p>
                          {patientScan.radiologistRecommendation && (
                            <div className="mt-3 p-3 bg-black/20 rounded-lg border border-gray-700/50">
                              <p className="text-[10px] text-gray-500 uppercase tracking-wider font-bold mb-1">Recommendation</p>
                              <p className="text-xs text-gray-300">{patientScan.radiologistRecommendation}</p>
                            </div>
                          )}
                        </div>
                        <div className="text-xs text-gray-500 text-right">
                          Scan Processed: {new Date(patientScan.createdAt).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })()}
        </main>
      </div>
    </ProtectedRoute>
  );
}