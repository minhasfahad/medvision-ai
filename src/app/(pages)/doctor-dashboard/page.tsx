"use client";

import React, { useState, useEffect } from 'react';
// import { LayoutDashboard, Users, Calendar, Settings, Activity, Brain, Clock, Loader2 } from 'lucide-react';

// 1. Existing Scan Interface
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
}

// --- NEW: Appointment Interface ---
interface Appointment {
  _id: string;
  patientName: string;
  time: string;
  type: string;
  status: 'Confirmed' | 'Waiting' | 'Completed';
}

export default function DoctorDashboard() {
  const [scans, setScans] = useState<ScanResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // --- NEW: State for Appointments ---
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoadingAppointments, setIsLoadingAppointments] = useState(true);

  // Fetch Scans Logic
  useEffect(() => {
    const fetchScans = async () => {
      try {
        const response = await fetch('/api/results'); 
        if (!response.ok) throw new Error('Failed to fetch recent scans');
        
        const result = await response.json();
        if (result.success) {
           setScans(result.data); 
        } else {
           throw new Error(result.message || 'API returned false success');
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchScans();
  }, []);

  // --- NEW: Fetch Appointments Logic ---
  useEffect(() => {
    // Is function ko aap apne actual backend endpoint se replace kar sakte hain
    // misal ke taur par: fetch('/api/appointments/today')
    const fetchAppointments = async () => {
      try {
        setIsLoadingAppointments(true);
        // Simulating an API call with setTimeout
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock Data - Jab backend ready ho, toh isay mita kar API response set karein
        const mockData: Appointment[] = [
          { _id: 'a1', patientName: 'Ahmed Ali', time: '10:00 AM', type: 'MRI Review', status: 'Confirmed' },
          { _id: 'a2', patientName: 'Sara Khan', time: '11:30 AM', type: 'Initial Consult', status: 'Waiting' },
          { _id: 'a3', patientName: 'Usman Tariq', time: '02:15 PM', type: 'Follow-up', status: 'Confirmed' },
          { _id: 'a4', patientName: 'Zainab Noor', time: '04:00 PM', type: 'Scan Analysis', status: 'Waiting' },
        ];
        
        setAppointments(mockData);
      } catch (err) {
        console.error("Failed to load appointments", err);
      } finally {
        setIsLoadingAppointments(false);
      }
    };

    fetchAppointments();
  }, []);

  return (
    <div className="flex min-h-screen bg-[#0f111a] text-white">
      {/* Sidebar */}
      <aside className="w-20 lg:w-64 border-r border-gray-800 p-6 flex flex-col items-center lg:items-start gap-12">
        <h1 className="text-xl font-bold text-purple-400">MedVision AI</h1>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8">
        <h2 className="text-2xl font-semibold mb-6">Doctor's Dashboard</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Stats cards commented out for now */}
        </div>

        <section>
          <h3 className="text-lg mb-4">Recent Scans</h3>
          
          {isLoading && (
            <div className="flex justify-center items-center h-32 text-purple-400">
              <p className="animate-pulse">Loading scans...</p>
            </div>
          )}

          {error && (
            <div className="text-red-400 bg-red-500/10 p-4 rounded-lg border border-red-500/30">
              Error loading scans: {error}
            </div>
          )}

          {!isLoading && !error && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.isArray(scans) && scans.map((scan) => (
                <div 
                  key={scan._id} 
                  className={`p-4 bg-[#1a1c27] rounded-xl border-2 transition-all flex flex-col h-full ${
                    scan.tumorDetected ? 'border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.2)]' : 'border-green-500'
                  }`}
                >
                  <div 
                    style={{ aspectRatio: '1 / 1' }} 
                    className="w-full bg-black/40 rounded-lg mb-4 flex items-center justify-center overflow-hidden"
                  >
                    {scan.imageData ? (
                      <img 
                        src={scan.imageData} 
                        alt={scan.className} 
                        className="w-full h-full object-contain p-2"
                      />
                    ) : (
                      <span className="text-gray-500 text-sm">No Image Data</span>
                    )}
                  </div>
                  
                  <div className="flex justify-between items-center mt-auto">
                    <p className={`text-sm font-bold ${scan.tumorDetected ? 'text-red-400' : 'text-green-400'}`}>
                      {scan.className}
                    </p>
                    <p className="text-xs text-gray-400">
                      {scan.confidence.toFixed(1)}% Confidence
                    </p>
                  </div>
                  <p className="text-[10px] text-gray-500 mt-2">
                    {new Date(scan.createdAt).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      {/* --- UPDATED: Right Sidebar (Today's Appointments) --- */}
      <aside className="hidden xl:flex w-80 p-8 border-l border-gray-800 flex-col bg-[#0c0e15]">
        <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-100">Today's Schedule</h3>
            <span className="bg-purple-600/20 text-purple-400 text-xs px-2.5 py-1 rounded-full font-medium border border-purple-500/30">
                {appointments.length}
            </span>
        </div>

        {isLoadingAppointments ? (
            <div className="text-center text-gray-500 mt-10 animate-pulse">
                Loading schedule...
            </div>
        ) : (
            <div className="flex flex-col gap-4 overflow-y-auto pr-2 custom-scrollbar">
                {appointments.map((appt) => (
                    <div 
                        key={appt._id} 
                        className="bg-[#1a1c27] p-4 rounded-xl border border-gray-800 hover:border-gray-600 transition-colors flex flex-col gap-3"
                    >
                        {/* Time & Status Row */}
                        <div className="flex justify-between items-center">
                            <span className="text-blue-400 text-sm font-semibold flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                                {appt.time}
                            </span>
                            <span className={`text-[10px] px-2 py-0.5 rounded uppercase tracking-wider font-bold ${
                                appt.status === 'Confirmed' ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
                                appt.status === 'Waiting' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                                'bg-gray-500/10 text-gray-400 border border-gray-500/20'
                            }`}>
                                {appt.status}
                            </span>
                        </div>
                        
                        {/* Patient Details */}
                        <div>
                            <h4 className="text-gray-100 font-bold text-base mb-0.5">{appt.patientName}</h4>
                            <p className="text-gray-400 text-xs">{appt.type}</p>
                        </div>
                    </div>
                ))}

                {appointments.length === 0 && (
                    <div className="text-center text-gray-500 mt-10 text-sm">
                        No appointments scheduled for today.
                    </div>
                )}
            </div>
        )}
      </aside>
    </div>
  );
}