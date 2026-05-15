"use client";
import Link from "next/link";
import api from "@/src/lib/axios";
import Image from "next/image";
import { useState, useEffect } from "react";

// 1. Interfaces
interface ScanResult {
  _id: string;
  user: string;
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
  // UPDATE THIS LINE BELOW:
  status: "Pending" | "Confirmed" | "Cancelled" | "Completed";
}

export default function DoctorDashboard() {
  const [scans, setScans] = useState<ScanResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [commentInputs, setCommentInputs] = useState<{ [key: string]: string }>(
    {},
  );
  const [savingComments, setSavingComments] = useState<{
    [key: string]: boolean;
  }>({});

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoadingAppointments, setIsLoadingAppointments] = useState(true);
  const [managingApptId, setManagingApptId] = useState<string | null>(null);

  // Fetch Scans Logic
  useEffect(() => {
    const fetchScans = async () => {
      try {
        const response = await fetch("/api/results");
        if (!response.ok) throw new Error("Failed to fetch recent scans");

        const result = await response.json();
        if (result.success) {
          setScans(result.data);
        } else {
          throw new Error(result.message || "API returned false success");
        }
      } catch (err: unknown) {
        const errorMessage =
          err instanceof Error ? err.message : "An unknown error occurred";
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    fetchScans();
  }, []);

  // Fetch Appointments Logic
  // Fetch Appointments Logic
  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        setIsLoadingAppointments(true);

        // Fetch real appointments from the database
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

  // Save Comment Function
  const handleSaveComment = async (scanId: string) => {
    const commentText = commentInputs[scanId]?.trim();
    if (!commentText) return;

    setSavingComments((prev) => ({ ...prev, [scanId]: true }));

    try {
      const response = await fetch("/api/results", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scanId, comment: commentText }),
      });

      if (!response.ok) throw new Error("Failed to save comment");

      setScans((prevScans) =>
        prevScans.map((scan) =>
          scan._id === scanId ? { ...scan, comment: commentText } : scan,
        ),
      );

      setCommentInputs((prev) => ({ ...prev, [scanId]: "" }));
    } catch (err: unknown) {
      console.error("Error saving comment:", err);
      alert("Failed to save comment");
    } finally {
      setSavingComments((prev) => ({ ...prev, [scanId]: false }));
    }
  };
  const handleStatusUpdate = async (
    appointmentId: string,
    newStatus: string,
  ) => {
    try {
      const response = await api.put("/api/appointments", {
        appointmentId,
        status: newStatus,
      });

      if (response.data.success) {
        // Instantly update the UI
        setAppointments((prev) =>
          prev.map((appt) =>
            appt._id === appointmentId
              ? { ...appt, status: newStatus as Appointment["status"] }
              : appt,
          ),
        );
        setManagingApptId(null); // Close the manage menu
      }
    } catch (err: unknown) {
      console.error("Error updating status:", err);
      alert("Failed to update status.");
    }
  };
  return (
    // Removed hardcoded background, using transparent to inherit layout
    <div className="flex flex-col lg:flex-row min-h-screen bg-transparent text-white w-full max-w-400 mx-auto pt-10 px-4 gap-8">
      {/* Main Content Area */}
      <main className="flex-1 min-w-0">
        <div className="mb-8">
          <h2 className="text-[28px] font-bold text-gray-100 mb-1">
            Clinical Dashboard
          </h2>
          <p className="text-gray-400 text-sm">
            Review recent AI diagnostics and manage patient records.
          </p>
        </div>

        <section>
          {isLoading && (
            <div className="text-blue-400 animate-pulse text-lg">
              Loading diagnostic records...
            </div>
          )}

          {error && (
            <div className="text-red-400 bg-red-500/10 p-4 rounded-lg border border-red-500/30">
              Error loading scans: {error}
            </div>
          )}

          {!isLoading && !error && (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {Array.isArray(scans) &&
                scans.map((scan) => (
                  <div
                    key={scan._id}
                    className={`p-5 bg-[#121726] rounded-2xl border flex flex-col h-full shadow-lg transition-all ${
                      scan.tumorDetected
                        ? "border-red-500/50 hover:border-red-400"
                        : "border-[#2a3655] hover:border-green-500/50"
                    }`}
                  >
                    <div className="w-full aspect-square bg-[#0f111a] rounded-xl mb-4 flex items-center justify-center overflow-hidden border border-gray-800">
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

                    <div className="flex justify-between items-center mt-auto">
                      <p
                        className={`text-base font-bold ${scan.tumorDetected ? "text-red-400" : "text-green-400"}`}
                      >
                        {scan.className}
                      </p>
                      <p className="text-xs font-semibold text-gray-400 bg-gray-800 px-2 py-1 rounded-md">
                        {scan.confidence.toFixed(1)}% Certainty
                      </p>
                    </div>

                    {/* Comment Section */}
                    <div className="mt-5 pt-5 border-t border-[#2a3655]">
                      {scan.comment && (
                        <div className="mb-4 p-3 bg-blue-900/20 rounded-lg border border-blue-500/30">
                          <p className="text-[11px] text-blue-400 font-semibold mb-1 uppercase tracking-wider">
                            Physicians Note
                          </p>
                          <p className="text-sm text-gray-200">
                            {scan.comment}
                          </p>
                        </div>
                      )}

                      <div className="flex gap-2">
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
                          className="flex-1 px-3 py-2 bg-[#1e2235] text-white text-sm rounded-lg border border-gray-600 focus:border-blue-500 outline-none transition-colors"
                          disabled={savingComments[scan._id]}
                        />
                        <button
                          onClick={() => handleSaveComment(scan._id)}
                          disabled={
                            savingComments[scan._id] ||
                            !commentInputs[scan._id]?.trim()
                          }
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 text-white text-sm rounded-lg font-semibold transition-colors"
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
      <aside className="w-full lg:w-87.5 flex-none">
        <div className="bg-[#121726] rounded-2xl border border-[#2a3655] p-6 shadow-lg sticky top-24">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-100">Todays Schedule</h3>
            <span className="bg-blue-900/30 text-blue-400 text-xs px-3 py-1 rounded-full font-bold border border-blue-500/30">
              {appointments.length}
            </span>
          </div>

          {isLoadingAppointments ? (
            <div className="text-center text-blue-400 text-sm animate-pulse py-10">
              Syncing schedule...
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {appointments.map((appt) => (
                <div
                  key={appt._id}
                  className="bg-[#1e2235] p-4 rounded-xl border border-gray-700 hover:border-gray-500 transition-colors"
                >
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-blue-400 text-sm font-bold flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
                      {appt.time}
                    </span>
                    <span
                      className={`text-[10px] px-2 py-1 rounded-md uppercase tracking-wider font-bold ${
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
                  <div>
                    <h4 className="text-gray-100 font-bold text-base">
                      {appt.patientName}
                    </h4>
                    <p className="text-gray-400 text-sm mt-1">{appt.type}</p>
                  </div>
                  {/* Manage Button for Future Step */}
                  {/* --- DYNAMIC MANAGE MENU --- */}
                  {appt.status === "Cancelled" ? (
                    <button
                      disabled
                      className="mt-4 w-full py-2 bg-red-900/20 border border-red-500/30 text-red-400 text-xs font-bold rounded-lg cursor-not-allowed transition-colors"
                    >
                      🔒 Cancelled by Patient
                    </button>
                  ) : managingApptId === appt._id ? (
                    <div className="mt-4 flex flex-col gap-2 animate-in fade-in zoom-in duration-200">
                      {/* Quick Action Row */}
                      <div className="flex gap-2">
                        {appt.status !== "Confirmed" && (
                          <button
                            onClick={() =>
                              handleStatusUpdate(appt._id, "Confirmed")
                            }
                            className="flex-1 py-2 bg-green-600 hover:bg-green-500 text-white text-xs font-bold rounded-lg transition-colors"
                          >
                            Confirm
                          </button>
                        )}
                        <button
                          onClick={() =>
                            handleStatusUpdate(appt._id, "Cancelled")
                          }
                          className="flex-1 py-2 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-lg transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => setManagingApptId(null)}
                          className="flex-1 py-2 bg-gray-600 hover:bg-gray-500 text-white text-xs font-bold rounded-lg transition-colors"
                        >
                          Back
                        </button>
                      </div>

                      {/* NEW: Link to the full detailed page we built in Step 5 */}
                      <Link href="/doctor-appointments" className="w-full">
                        <button className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg transition-colors">
                          View Full Clinical Report & MRI
                        </button>
                      </Link>
                    </div>
                  ) : (
                    <button
                      onClick={() => setManagingApptId(appt._id)}
                      className="mt-4 w-full py-2 bg-[#2a3655] hover:bg-[#3b4b75] text-white text-xs font-bold rounded-lg transition-colors"
                    >
                      Manage Appointment
                    </button>
                  )}
                  {/* --------------------------- */}
                </div>
              ))}
              {appointments.length === 0 && (
                <div className="text-center text-gray-500 py-6 text-sm">
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
