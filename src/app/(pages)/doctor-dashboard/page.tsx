"use client";

import Link from "next/link";
import api from "@/src/lib/axios";
import Image from "next/image";
import { useState, useEffect } from "react";

// 1. Interfaces (Updated to include nested user name object)
interface ScanResult {
  _id: string;
  user: {
    _id: string;
    name: string;
  } | string; // Can be a populated object or a raw ID string if population fails
  originalImage: string;
  imageData: string;
  className: string;
  confidence: number;
  tumorDetected: boolean;
  createdAt: string;
  updatedAt: string;
  comment?: string;
}

interface Appointment {
  _id: string;
  patientName: string;
  time: string;
  type: string;
  status: "Pending" | "Confirmed" | "Cancelled" | "Completed";
}

export default function DoctorDashboard() {
  const [scans, setScans] = useState<ScanResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [commentInputs, setCommentInputs] = useState<{ [key: string]: string }>({});
  const [savingComments, setSavingComments] = useState<{ [key: string]: boolean }>({});

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoadingAppointments, setIsLoadingAppointments] = useState(true);
  const [managingApptId, setManagingApptId] = useState<string | null>(null);

  // 1. Fetch Scans Logic using AXIOS instance
  useEffect(() => {
    const fetchScans = async () => {
      try {
        setIsLoading(true);
        const response = await api.get("/api/results");
        
        if (response.data.success) {
          setScans(response.data.data);
        } else {
          throw new Error(response.data.message || "API returned false success");
        }
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : "An unknown error occurred";
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    fetchScans();
  }, []);

  // 2. Fetch Appointments Logic using AXIOS instance
  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        setIsLoadingAppointments(true);
        const response = await api.get("/api/appointments");

        if (response.data.success) {
          setAppointments(response.data.data);
        }
      } catch (err: unknown) {
        console.error("Failed to load appointments", err);
      } finally {
        setIsLoadingAppointments(false);
      }
    };

    fetchAppointments();
  }, []);

  // 3. Save Comment Function using AXIOS instance
  const handleSaveComment = async (scanId: string) => {
    const commentText = commentInputs[scanId]?.trim();
    if (!commentText) return;

    setSavingComments((prev) => ({ ...prev, [scanId]: true }));

    try {
      const response = await api.put("/api/results", { 
        scanId, 
        comment: commentText 
      });

      if (response.data.success) {
        setScans((prevScans) =>
          prevScans.map((scan) =>
            scan._id === scanId ? { ...scan, comment: commentText } : scan,
          ),
        );
        setCommentInputs((prev) => ({ ...prev, [scanId]: "" }));
      } else {
        throw new Error(response.data.message || "Failed to save comment");
      }
    } catch (err: unknown) {
      console.error("Error saving comment:", err);
      alert("Failed to save comment");
    } finally {
      setSavingComments((prev) => ({ ...prev, [scanId]: false }));
    }
  };

  const handleStatusUpdate = async (appointmentId: string, newStatus: string) => {
    try {
      const response = await api.put("/api/appointments", {
        appointmentId,
        status: newStatus,
      });

      if (response.data.success) {
        setAppointments((prev) =>
          prev.map((appt) =>
            appt._id === appointmentId
              ? { ...appt, status: newStatus as Appointment["status"] }
              : appt,
          ),
        );
        setManagingApptId(null);
      }
    } catch (err: unknown) {
      console.error("Error updating status:", err);
      alert("Failed to update status.");
    }
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-transparent text-white w-full max-w-[1600px] mx-auto pt-6 sm:pt-10 px-4 sm:px-6 pb-12 gap-8">
      {/* Main Content Area */}
      <main className="flex-1 min-w-0 order-2 lg:order-1">
        <div className="mb-6 sm:mb-8">
          <h2 className="text-2xl sm:text-[28px] font-bold text-gray-100 mb-1 leading-tight">
            Clinical Dashboard
          </h2>
          <p className="text-gray-400 text-xs sm:text-sm">
            Review recent AI diagnostics and manage patient records.
          </p>
        </div>

        <section>
          {isLoading && (
            <div className="text-blue-400 animate-pulse text-base sm:text-lg py-4">
              Loading diagnostic records...
            </div>
          )}

          {error && (
            <div className="text-red-400 bg-red-500/10 p-4 rounded-lg border border-red-500/30 text-sm sm:text-base">
              Error loading scans: {error}
            </div>
          )}

          {!isLoading && !error && (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {Array.isArray(scans) &&
                scans.map((scan) => (
                  <div
                    key={scan._id}
                    className={`p-4 sm:p-5 bg-[#121726] rounded-2xl border flex flex-col h-full shadow-lg transition-all ${
                      scan.tumorDetected
                        ? "border-red-500/50 hover:border-red-400"
                        : "border-[#2a3655] hover:border-green-500/50"
                    }`}
                  >
                    {/* Patient Meta Data Row (Displays populated name & formatted date) */}
                    <div className="flex justify-between items-start mb-3 text-xs text-gray-400 border-b border-gray-800 pb-2">
                      <div className="min-w-0">
                        <p className="text-[10px] text-gray-500 uppercase font-semibold">Patient</p>
                        <p className="text-gray-200 font-bold truncate">
                          {typeof scan.user === "object" && scan.user !== null ? scan.user.name : "Anonymous User"}
                        </p>
                      </div>
                      <div className="text-right flex-none">
                        <p className="text-[10px] text-gray-500 uppercase font-semibold">Scan Date</p>
                        <p className="text-gray-300 font-medium">
                          {new Date(scan.createdAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric"
                          })}
                        </p>
                      </div>
                    </div>

                    <div className="w-full aspect-square bg-[#0f111a] rounded-xl mb-4 flex items-center justify-center overflow-hidden border border-gray-800 shadow-inner">
                      {scan.imageData ? (
                        <Image
                          src={scan.imageData}
                          alt={scan.className}
                          className="w-full h-full object-contain"
                          width={500}
                          height={500}
                          unoptimized
                        />
                      ) : (
                        <span className="text-gray-600 text-sm font-medium">
                          No Image Data
                        </span>
                      )}
                    </div>

                    <div className="flex justify-between items-center gap-2 mt-auto mb-4">
                      <p className={`text-sm sm:text-base font-bold truncate ${scan.tumorDetected ? "text-red-400" : "text-green-400"}`}>
                        {scan.className}
                      </p>
                      <p className="text-[10px] sm:text-xs font-semibold text-gray-400 bg-gray-800 px-2 py-1 rounded-md whitespace-nowrap">
                        {scan.confidence.toFixed(1)}% Certainty
                      </p>
                    </div>

                    {/* Comment Section */}
                    <div className="mt-auto pt-4 border-t border-[#2a3655]">
                      {scan.comment && (
                        <div className="mb-4 p-3 bg-blue-900/20 rounded-lg border border-blue-500/30">
                          <p className="text-[10px] text-blue-400 font-semibold mb-1 uppercase tracking-wider">
                            Physicians Note
                          </p>
                          <p className="text-xs sm:text-sm text-gray-200 leading-normal">
                            {scan.comment}
                          </p>
                        </div>
                      )}

                      <div className="flex gap-2 items-center">
                        <input
                          type="text"
                          placeholder="Add clinical observation..."
                          value={commentInputs[scan._id] || ""}
                          onChange={(e) =>
                            setCommentInputs((prev) => ({
                              ...prev,
                              [scan._id]: e.target.value,
                            }))
                          }
                          className="flex-1 min-w-0 px-3 py-2 bg-[#1e2235] text-white text-xs sm:text-sm rounded-lg border border-gray-600 focus:border-blue-500 outline-none transition-colors placeholder:text-gray-500"
                          disabled={savingComments[scan._id]}
                        />
                        <button
                          onClick={() => handleSaveComment(scan._id)}
                          disabled={
                            savingComments[scan._id] ||
                            !commentInputs[scan._id]?.trim()
                          }
                          className="px-3 sm:px-4 py-2 flex-none bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 text-white text-xs sm:text-sm rounded-lg font-semibold transition-colors min-h-[36px]"
                        >
                          {savingComments[scan._id] ? "..." : "Save"}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </section>
      </main>

      {/* Right Sidebar: Today's Appointments */}
      <aside className="w-full lg:w-80 flex-none order-1 lg:order-2">
        <div className="bg-[#121726] rounded-2xl border border-[#2a3655] p-5 sm:p-6 shadow-lg lg:sticky lg:top-24">
          <div className="flex items-center justify-between mb-5 sm:mb-6">
            <h3 className="text-base sm:text-lg font-bold text-gray-100">Todays Schedule</h3>
            <span className="bg-blue-900/30 text-blue-400 text-[11px] sm:text-xs px-2.5 py-0.5 sm:py-1 rounded-full font-bold border border-blue-500/30">
              {appointments.length}
            </span>
          </div>

          {isLoadingAppointments ? (
            <div className="text-center text-blue-400 text-xs sm:text-sm animate-pulse py-8">
              Syncing schedule...
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {appointments.map((appt) => (
                <div
                  key={appt._id}
                  className="bg-[#1e2235] p-4 rounded-xl border border-gray-700 hover:border-gray-500 transition-colors w-full"
                >
                  <div className="flex justify-between items-center gap-2 mb-2">
                    <span className="text-blue-400 text-xs sm:text-sm font-bold flex items-center gap-1.5 min-w-0">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500 flex-none animate-pulse"></span>
                      <span className="truncate">{appt.time}</span>
                    </span>
                    <span
                      className={`text-[9px] sm:text-[10px] px-2 py-0.5 sm:py-1 rounded-md uppercase tracking-wider font-bold whitespace-nowrap ${
                        appt.status === "Confirmed"
                          ? "bg-green-900/30 text-green-400 border border-green-500/30"
                          : appt.status === "Pending"
                            ? "bg-amber-900/30 text-amber-400 border border-amber-500/30"
                            : "bg-gray-800 text-gray-400 border border-gray-600"
                      }`}
                    >
                      {appt.status}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-gray-100 font-bold text-sm sm:text-base truncate">
                      {appt.patientName}
                    </h4>
                    <p className="text-gray-400 text-xs sm:text-sm mt-0.5 truncate">{appt.type}</p>
                  </div>

                  {/* Dynamic Action Controls */}
                  {appt.status === "Cancelled" ? (
                    <button
                      disabled
                      className="mt-4 w-full py-2 bg-red-900/20 border border-red-500/30 text-red-400 text-[11px] font-bold rounded-lg cursor-not-allowed"
                    >
                      🔒 Cancelled by Patient
                    </button>
                  ) : managingApptId === appt._id ? (
                    <div className="mt-4 flex flex-col gap-2 animate-in fade-in zoom-in-95 duration-200">
                      <div className="flex gap-2">
                        {appt.status !== "Confirmed" && (
                          <button
                            onClick={() => handleStatusUpdate(appt._id, "Confirmed")}
                            className="flex-1 py-1.5 bg-green-600 hover:bg-green-500 text-white text-[11px] font-bold rounded-lg transition-colors"
                          >
                            Confirm
                          </button>
                        )}
                        <button
                          onClick={() => handleStatusUpdate(appt._id, "Cancelled")}
                          className="flex-1 py-1.5 bg-red-600 hover:bg-red-500 text-white text-[11px] font-bold rounded-lg transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => setManagingApptId(null)}
                          className="flex-1 py-1.5 bg-gray-600 hover:bg-gray-500 text-white text-[11px] font-bold rounded-lg transition-colors"
                        >
                          Back
                        </button>
                      </div>

                      <Link href="/doctor-appointments" className="w-full mt-1">
                        <button className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-bold rounded-lg transition-colors">
                          View Full Clinical Report & MRI
                        </button>
                      </Link>
                    </div>
                  ) : (
                    <button
                      onClick={() => setManagingApptId(appt._id)}
                      className="mt-4 w-full py-2 bg-[#2a3655] hover:bg-[#3b4b75] text-white text-[11px] font-bold rounded-lg transition-colors"
                    >
                      Manage Appointment
                    </button>
                  )}
                </div>
              ))}
              {appointments.length === 0 && (
                <div className="text-center text-gray-500 py-6 text-xs sm:text-sm">
                  Schedule is clear for today.
                </div>
              )}
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}