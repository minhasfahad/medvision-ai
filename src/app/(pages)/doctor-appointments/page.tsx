"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import api from "@/src/lib/axios";
import { useAuthStore } from "@/src/lib/store/useAuthStore";

// Interfaces matching your MongoDB schemas
interface Appointment {
  _id: string;
  userId: string; // Links to the patient
  patientName: string;
  doctorName: string;
  clinic: string;
  appointmentDate: string;
  fee: string;
  status: 'Pending' | 'Confirmed' | 'Cancelled' | 'Completed';
  tumorType: string;
  createdAt: string;
}

interface ScanResult {
  _id: string;
  user: string; // Links to the patient
  imageData: string;
  className: string;
  confidence: number;
  tumorDetected: boolean;
  createdAt: string;
  comment?: string;
}

export default function DoctorAppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [scans, setScans] = useState<ScanResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAppt, setSelectedAppt] = useState<Appointment | null>(null);
  
  const { user, isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchData = async () => {
      try {
        setIsLoading(true);
        // Fetch ALL appointments (Doctor view)
        const apptResponse = await api.get('/api/appointments');
        // Fetch ALL scans (Doctor view)
        const scanResponse = await api.get('/api/results');

        if (apptResponse.data.success && scanResponse.data.success) {
            setAppointments(apptResponse.data.data);
            setScans(scanResponse.data.data);
            
            // Auto-select the first appointment if it exists
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
  }, [isAuthenticated]);

  // Manage Status Function (Reused from Dashboard)
  const handleStatusUpdate = async (appointmentId: string, newStatus: Appointment['status']) => {
    try {
      const response = await api.put("/api/appointments", { appointmentId, status: newStatus });
      if (response.data.success) {
        setAppointments(prev => prev.map(appt => 
          appt._id === appointmentId ? { ...appt, status: newStatus } : appt
        ));
        if (selectedAppt?._id === appointmentId) {
            setSelectedAppt(prev => prev ? { ...prev, status: newStatus } : null);
        }
      }
    } catch (err) {
      console.error("Error updating status:", err);
      alert("Failed to update status.");
    }
  };

  // Find the most recent scan for the selected patient
  const patientScan = selectedAppt 
    ? scans.find(scan => scan.user === selectedAppt.userId) 
    : null;

  // Print to PDF function
  const handleDownloadPDF = () => {
      window.print();
  };

  if (!isAuthenticated || user?.role?.toLowerCase() !== 'doctor') {
      return (
          <div className="min-h-screen flex flex-col items-center justify-center text-white pt-10">
              <h2 className="text-2xl font-bold mb-4">Clinical Access Only</h2>
              <p className="text-gray-400">Please log in with a verified physician account.</p>
          </div>
      );
  }

return (
  <div className="min-h-screen bg-transparent text-white w-full max-w-[1600px] mx-auto pt-6 sm:pt-10 px-4 sm:px-6 pb-12 flex flex-col lg:flex-row gap-6 lg:gap-8 print:block print:p-0 print:m-0 print:bg-white">
    
    {/* LEFT COLUMN: APPOINTMENT LIST */}
    <aside className="w-full lg:w-[400px] flex flex-col gap-4 flex-none h-auto lg:h-[85vh] overflow-y-auto custom-scrollbar pr-0 lg:pr-2 print:hidden">
        <div className="mb-2 sm:mb-4">
            <h1 className="text-2xl sm:text-[28px] font-bold text-gray-100">All Appointments</h1>
            <p className="text-gray-400 text-xs sm:text-sm">Select a patient to view their clinical report.</p>
        </div>

        {isLoading ? (
            <div className="text-blue-400 animate-pulse text-sm sm:text-base py-4">Loading schedules...</div>
        ) : appointments.length === 0 ? (
            <div className="text-gray-500 bg-[#121726] p-6 rounded-xl border border-gray-800 text-center text-sm sm:text-base">
                No appointments found.
            </div>
        ) : (
            <div className="flex flex-col gap-3 sm:gap-4 max-h-[40vh] lg:max-h-none overflow-y-auto lg:overflow-visible p-1">
              {appointments.map(appt => (
                  <div 
                      key={appt._id}
                      onClick={() => setSelectedAppt(appt)}
                      className={`p-4 rounded-xl border cursor-pointer transition-all ${
                          selectedAppt?._id === appt._id 
                          ? 'bg-[#1e2235] border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.1)]' 
                          : 'bg-[#121726] border-[#2a3655] hover:border-gray-500'
                      }`}
                  >
                      <div className="flex justify-between items-start gap-2 mb-2">
                          <h3 className="font-bold text-gray-100 text-base sm:text-lg truncate">{appt.patientName}</h3>
                          <span className={`text-[9px] sm:text-[10px] px-2 py-0.5 sm:py-1 rounded-md uppercase tracking-wider font-bold whitespace-nowrap ${
                              appt.status === 'Confirmed' ? 'bg-green-900/30 text-green-400 border border-green-500/30' :
                              appt.status === 'Cancelled' ? 'bg-red-900/30 text-red-400 border border-green-500/30' :
                              'bg-amber-900/30 text-amber-400 border border-amber-500/30'
                          }`}>
                              {appt.status}
                          </span>
                      </div>
                      <p className="text-blue-400 text-xs sm:text-sm font-medium mb-1.5">{appt.appointmentDate}</p>
                      <p className="text-gray-500 text-xs truncate">Type: {appt.tumorType}</p>
                  </div>
              ))}
            </div>
        )}
    </aside>

    {/* RIGHT COLUMN: DETAILED VIEW & PDF REPORT */}
    {/* Added print:absolute print:inset-0 to make the report cleanly take over the whole PDF page */}
    <main className="flex-1 bg-[#121726] rounded-2xl border border-[#2a3655] p-4 sm:p-6 lg:p-8 shadow-xl overflow-y-auto h-auto lg:h-[85vh] custom-scrollbar print:absolute print:inset-0 print:w-full print:h-auto print:overflow-visible print:bg-white print:p-8 print:border-none print:shadow-none print:text-black w-full">
        {!selectedAppt ? (
            <div className="flex items-center justify-center h-48 lg:h-full text-gray-500 text-sm sm:text-base print:hidden">
                Select an appointment from the list to view details.
            </div>
        ) : (
            <div className="flex flex-col gap-6 sm:gap-8 print:gap-6 print:bg-white print:text-black">
                
                {/* Action Header (Hidden during PDF print) */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 sm:pb-6 border-b border-gray-800 print:hidden">
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-100">Consultation Details</h2>
                    <div className="flex gap-3 w-full sm:w-auto">
                        <button 
                            onClick={handleDownloadPDF}
                            className="bg-[#1e293b] border border-[#334155] hover:bg-gray-700 text-gray-200 px-4 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-2 w-full sm:w-auto"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                            Download PDF
                        </button>
                    </div>
                </div>

                {/* Print-Only Header (Shows up ONLY on the PDF) */}
                <div className="hidden print:block text-center mb-6 border-b-2 border-gray-200 pb-4">
                    <h1 className="text-3xl font-bold text-black mb-1">MedVision AI</h1>
                    <h2 className="text-lg text-gray-600 font-semibold uppercase tracking-widest">Official Diagnostics Report</h2>
                </div>

                {/* Top Details Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 bg-[#1e2235] p-4 sm:p-6 rounded-xl border border-gray-700/50 print:bg-transparent print:border-none print:p-0 print:gap-4">
                    <div>
                        <p className="text-gray-500 text-[11px] sm:text-xs uppercase tracking-wider mb-0.5 sm:mb-1 print:text-gray-500">Patient Name</p>
                        <p className="text-base sm:text-lg font-bold text-gray-100 print:text-black break-words">{selectedAppt.patientName || "Unknown Patient"}</p>
                    </div>
                    <div>
                        <p className="text-gray-500 text-[11px] sm:text-xs uppercase tracking-wider mb-0.5 sm:mb-1 print:text-gray-500">Time Slot</p>
                        <p className="text-base sm:text-lg font-bold text-gray-100 print:text-black break-words">{selectedAppt.appointmentDate}</p>
                    </div>
                    <div>
                        <p className="text-gray-500 text-[11px] sm:text-xs uppercase tracking-wider mb-0.5 sm:mb-1 print:text-gray-500">Clinic / Location</p>
                        <p className="text-xs sm:text-sm font-semibold text-gray-300 print:text-black break-words">{selectedAppt.clinic}</p>
                    </div>
                    <div>
                        <p className="text-gray-500 text-[11px] sm:text-xs uppercase tracking-wider mb-0.5 sm:mb-1 print:text-gray-500">Current Status</p>
                        <p className="text-xs sm:text-sm font-semibold text-blue-400 print:text-blue-700">{selectedAppt.status}</p>
                    </div>
                </div>

                {/* Doctor Status Controls (Hidden during PDF print) */}
                <div className="flex flex-col sm:flex-row gap-3 print:hidden">
                    {selectedAppt.status === 'Cancelled' ? (
                         <div className="w-full text-center py-3 bg-red-900/20 border border-red-500/30 text-red-400 text-sm font-bold rounded-lg">
                             🔒 Appointment Cancelled by Patient
                         </div>
                    ) : (
                        <>
                            <button 
                                onClick={() => handleStatusUpdate(selectedAppt._id, 'Confirmed')}
                                disabled={selectedAppt.status === 'Confirmed'}
                                className="flex-1 bg-green-600 hover:bg-green-500 disabled:bg-green-900/30 disabled:text-green-500/50 text-white py-2.5 sm:py-3 rounded-lg text-sm font-bold transition-colors"
                            >
                                {selectedAppt.status === 'Confirmed' ? 'Already Confirmed' : 'Confirm Appointment'}
                            </button>
                            <button 
                                onClick={() => handleStatusUpdate(selectedAppt._id, 'Cancelled')}
                                className="flex-1 bg-red-600 hover:bg-red-500 text-white py-2.5 sm:py-3 rounded-lg text-sm font-bold transition-colors"
                            >
                                Cancel Appointment
                            </button>
                        </>
                    )}
                </div>

                {/* AI Scan Report Section */}
                <div className="mt-2 sm:mt-4 border-t border-gray-800 pt-6 sm:pt-8 print:border-t-2 print:border-gray-200 print:pt-6">
                    <h3 className="text-lg sm:text-xl font-bold text-gray-100 mb-4 sm:mb-6 print:text-black print:mb-4">Analysis Result</h3>
                    
                    {!patientScan ? (
                        <div className="text-gray-500 text-center py-8 sm:py-10 bg-[#0f111a] rounded-xl border border-gray-800 border-dashed text-sm sm:text-base print:bg-transparent print:border-gray-300">
                            No recent MRI scans found for this patient in the database.
                        </div>
                    ) : (
                        <div className="flex flex-col gap-6 sm:gap-8 print:gap-6">
                            {/* MRI Image (Fixed the massive black box issue!) */}
                            <div className="w-full xl:w-1/2 aspect-square bg-[#0f111a] rounded-xl border border-gray-800 overflow-hidden flex items-center justify-center p-2 print:bg-transparent print:border-gray-300 print:aspect-auto print:h-64 print:w-auto print:mx-auto">
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
                                  <span className="text-gray-500 text-sm sm:text-base print:text-black">Image Data Unavailable</span>
                                )}
                            </div>

                            {/* Diagnostics Data */}
                            <div className="w-full flex flex-col gap-4 sm:gap-6 print:gap-4 print:break-inside-avoid">
                                <div className={`p-4 sm:p-6 rounded-xl border ${patientScan.tumorDetected ? 'bg-red-900/10 border-red-500/30 print:border-red-400' : 'bg-green-900/10 border-green-500/30 print:border-green-400'} print:bg-transparent`}>
                                    <p className="text-gray-400 text-[11px] sm:text-xs uppercase tracking-wider mb-1 sm:mb-2 print:text-gray-600">Detection Result</p>
                                    <h4 className={`text-xl sm:text-2xl font-bold mb-1.5 sm:mb-2 ${patientScan.tumorDetected ? 'text-red-400 print:text-red-600' : 'text-green-400 print:text-green-600'}`}>
                                        {patientScan.className}
                                    </h4>
                                    <div className="w-full bg-gray-800 rounded-full h-2 sm:h-2.5 mt-3 sm:mt-4 print:bg-gray-200">
                                        <div className="bg-blue-500 h-2 sm:h-2.5 rounded-full" style={{ width: `${patientScan.confidence}%` }}></div>
                                    </div>
                                    <p className="text-right text-[11px] sm:text-xs text-gray-400 mt-2 font-semibold print:text-gray-600">
                                        {patientScan.confidence.toFixed(2)}% AI Certainty
                                    </p>
                                </div>

                                <div className="p-4 sm:p-6 bg-[#1e2235] rounded-xl border border-gray-700/50 print:bg-transparent print:border-gray-300">
                                    <p className="text-gray-400 text-[11px] sm:text-xs uppercase tracking-wider mb-2 sm:mb-3 print:text-gray-600">Clinical Observations</p>
                                    <p className="text-gray-200 text-xs sm:text-sm leading-relaxed print:text-black">
                                        {patientScan.comment || <span className="italic text-gray-500">No clinical notes added yet.</span>}
                                    </p>
                                </div>
                                
                                <div className="text-[10px] sm:text-xs text-gray-500 text-right print:text-gray-400">
                                    Scan Processed: {new Date(patientScan.createdAt).toLocaleString()}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

            </div>
        )}
    </main>
  </div>
);
}