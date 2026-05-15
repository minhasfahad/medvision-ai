"use client";

import React, { useState, useEffect } from 'react';
import api from "@/src/lib/axios";
import { useAuthStore } from "@/src/lib/store/useAuthStore";
import Link from 'next/link';

// Interface matching your MongoDB Appointment Schema
interface Appointment {
  _id: string;
  doctorName: string;
  clinic: string;
  appointmentDate: string;
  fee: string;
  status: "Pending" | "Confirmed" | "Cancelled";
  tumorType: string;
  createdAt: string;
}

export default function MyAppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { user, isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated || !user?.id) {
        return;
    }

    const fetchAppointments = async () => {
      try {
        setIsLoading(true);
        // Call the new API route we just created
        const response = await api.get(`/api/appointments?userId=${user.id}`); 
        
        if (response.data.success) {
           setAppointments(response.data.data); 
        } else {
           throw new Error(response.data.message || 'Failed to fetch appointments');
        }
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAppointments();
  }, [user, isAuthenticated]);

const handleCancelAppointment = async (appointmentId: string) => {
      // 1. Ask for confirmation before cancelling
      if (!window.confirm("Are you sure you want to cancel this appointment?")) return;

      try {
          // 2. Call our new PUT route
          const response = await api.put("/api/appointments", {
              appointmentId: appointmentId,
              status: "Cancelled"
          });

          if (response.data.success) {
              // 3. Instantly update the UI without refreshing the page
              setAppointments(prev => prev.map(appt => 
                  appt._id === appointmentId ? { ...appt, status: 'Cancelled' } : appt
              ));
          }
      } catch (err: unknown) {
          console.error("Error cancelling appointment:", err);
          alert("Failed to cancel appointment. Please try again.");
      }
  };

  if (!isAuthenticated) {
      return (
          <div className="min-h-screen bg-transparent flex flex-col items-center justify-center text-white pt-10">
              <h2 className="text-2xl font-bold mb-4">Access Denied</h2>
              <p className="text-gray-400 mb-6">Please log in to view your appointments.</p>
              <Link href="/login">
                  <button className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-lg font-semibold transition-colors">
                      Go to Login
                  </button>
              </Link>
          </div>
      );
  }

  return (
    <div className="min-h-screen bg-transparent text-white w-full max-w-[1200px] mx-auto pt-10 px-6 pb-12">
      
      <div className="mb-10 text-center md:text-left">
          <h1 className="text-[28px] font-bold text-gray-100 mb-2">My Appointments</h1>
          <p className="text-gray-400 text-sm">Manage your upcoming and past consultations.</p>
      </div>
      
      <section>
        {isLoading && <div className="text-blue-400 animate-pulse text-lg text-center md:text-left">Loading your schedule...</div>}

        {error && (
          <div className="text-red-400 bg-red-500/10 p-4 rounded-lg border border-red-500/30 text-center md:text-left">
            Error: {error}
          </div>
        )}

        {!isLoading && !error && appointments.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 bg-[#121726] rounded-2xl border border-[#2a3655]">
              <p className="text-gray-400 text-lg mb-4">You have no booked appointments.</p>
              <Link href="/appointments">
                  <button className="bg-[#00b85c] hover:bg-[#00a050] text-white px-6 py-2 rounded-lg font-semibold transition-colors shadow-lg shadow-green-900/20">
                      Book a Specialist
                  </button>
              </Link>
          </div>
        )}

        {!isLoading && !error && appointments.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {appointments.map((appt) => (
              <div 
                key={appt._id} 
                className="p-6 bg-[#121726] rounded-2xl border border-[#2a3655] flex flex-col h-full shadow-lg hover:border-[#3b4b75] transition-all"
              >
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h3 className="text-xl font-bold text-gray-100">{appt.doctorName}</h3>
                        <p className="text-blue-400 text-sm font-medium mt-1">{appt.tumorType} Consultation</p>
                    </div>
                    
                    {/* Status Badge */}
                    <span className={`text-[11px] px-3 py-1 rounded-full uppercase tracking-wider font-bold border ${
                        appt.status === 'Confirmed' ? 'bg-green-900/30 text-green-400 border-green-500/30' :
                        appt.status === 'Pending' ? 'bg-amber-900/30 text-amber-400 border-amber-500/30' :
                        'bg-gray-800 text-gray-400 border-gray-600'
                    }`}>
                        {appt.status}
                    </span>
                </div>

                <div className="space-y-3 mb-6 bg-[#1e2235] p-4 rounded-xl border border-gray-700/50">
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-400">Date & Time:</span>
                        <span className="text-gray-100 font-semibold">{appt.appointmentDate}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-400">Clinic:</span>
                        <span className="text-gray-100 font-semibold">{appt.clinic}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-400">Consultation Fee:</span>
                        <span className="text-gray-100 font-semibold">{appt.fee}</span>
                    </div>
                </div>
                
                {/* Action Buttons */}
                <div className="mt-auto flex gap-3">
                    <button 
                        onClick={() => handleCancelAppointment(appt._id)}
                        disabled={appt.status === 'Cancelled'}
                        className="w-full bg-[#4b5563] hover:bg-red-600 disabled:bg-gray-800 disabled:text-gray-500 text-white py-2.5 rounded-lg text-sm font-semibold transition-colors"
                    >
                        {appt.status === 'Cancelled' ? 'Cancelled' : 'Cancel Appointment'}
                    </button>
                    {appt.status !== 'Cancelled' && (
                        <button className="w-full bg-[#2a3655] hover:bg-[#3b4b75] text-white py-2.5 rounded-lg text-sm font-semibold transition-colors">
                            Reschedule
                        </button>
                    )}
                </div>

              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}