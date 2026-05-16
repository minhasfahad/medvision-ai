"use client";

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import api from "@/src/lib/axios"; 
import { useAuthStore } from "@/src/lib/store/useAuthStore"; 
import Image from 'next/image';

// 1. Interface
interface Doctor {
  _id: string;
  name: string;
  specialty: string;
  clinic: string;
  experience: string;
  nextSlot: string;
  fee: string;
  badge?: string;
  image?: string;
  isBooked?: boolean;
}

// 2. Main Content Component
function AppointmentContent() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bookingId, setBookingId] = useState<string | null>(null); 
  
  const { user } = useAuthStore();
  const searchParams = useSearchParams();
  const tumorType = searchParams.get('tumor');

  // --- FETCH REAL DOCTORS FROM DATABASE ---
  useEffect(() => {
    const fetchDatabaseDoctors = async () => {
      try {
        setIsLoading(true);
        const response = await api.get(`/api/doctors?tumor=${tumorType || ''}`); 
        
        if (response.data.success) {
          setDoctors(response.data.data);
        } else {
          setError("Failed to load recommended specialists.");
        }
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDatabaseDoctors();
  }, [tumorType]);

  // --- TASK 5: REAL BOOKING FUNCTION (SAVES TO DB) ---
  const handleBookAppointment = async (doctor: Doctor) => {
    if (!user || !user.id) {
      alert("Please login first to book an appointment.");
      return;
    }

    setBookingId(doctor._id);

    try {
      const appointmentData = {
        userId: user.id,
        doctorId: doctor._id,
        patientName: user.name, 
        doctorName: doctor.name,
        clinic: doctor.clinic,
        appointmentDate: doctor.nextSlot,
        fee: doctor.fee,
        tumorType: tumorType || "General Consultation" 
      };

      // This makes the API call to your backend to save into the Appointment Collection
      const response = await api.post("/api/appointments", appointmentData);
      
      if (response.data.success) {
         alert(`✅ Success! Your appointment with ${doctor.name} is confirmed for ${doctor.nextSlot}.`);
         
         setDoctors(prevDoctors => 
           prevDoctors.map(doc => 
             doc._id === doctor._id ? { ...doc, isBooked: true } : doc
           )
         );
      }
    } catch (err: unknown) {
      console.error("Booking Error:", err);
      const errorMessage = err instanceof Error ? err.message : "Failed to book appointment. Please try again.";
      alert(errorMessage);
    } finally {
      setBookingId(null);
    }
  };

  return (
    // TASK 1: Changed background to transparent. Adjusted top padding.
    <div className="min-h-screen bg-transparent text-white font-sans pb-10 pt-6 sm:pt-10 px-4 sm:px-6 lg:px-12 max-w-4xl mx-auto flex flex-col gap-8 sm:gap-10"> 
      
      {/* TASK 2 & 3: Navbar and Sidebar Removed */}
      
      <main className="w-full">
        {/* Centered the header text since there is no longer a left sidebar */}
        <div className="mb-8 sm:mb-10 text-center">
          <h1 className="text-2xl sm:text-[28px] font-bold text-gray-100 mb-2 leading-tight">
            {tumorType && tumorType !== "No Tumor" ? `Recommended Specialists for ${tumorType}` : "Available Specialists"}
          </h1>
          <p className="text-gray-400 text-xs sm:text-sm max-w-md mx-auto">Based on your scan analysis, our AI suggests these specialists.</p>
        </div>

        {isLoading && <div className="text-blue-400 animate-pulse text-base sm:text-lg text-center py-6">Loading database records...</div>}
        {error && <div className="text-red-500 p-4 bg-red-900/20 border border-red-500 rounded-lg text-center text-sm sm:text-base">{error}</div>}
        
        {!isLoading && !error && doctors.length === 0 && (
          <div className="text-gray-400 text-center py-6 text-sm sm:text-base">No doctors currently available for this specialty.</div>
        )}

        {!isLoading && !error && doctors.length > 0 && (
          <div className="space-y-4 sm:space-y-5">
            {doctors.map((doc) => (
              <div key={doc._id} className="bg-[#121726] p-4 sm:p-5 rounded-2xl border border-[#2a3655] flex flex-col md:flex-row items-center gap-4 sm:gap-6 shadow-md hover:border-[#3b4b75] transition-all">
                
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-lg overflow-hidden flex-none bg-gray-800 shadow-inner">
                  <Image 
                    src={doc.image || "https://via.placeholder.com/150"} 
                    alt={doc.name} 
                    className="w-full h-full object-cover"
                    width={96}       
                    height={96}
                    unoptimized       
                  />
                </div>
                
                <div className="flex-1 min-w-0 text-center md:text-left w-full">
                  <div className="flex flex-col md:flex-row items-center gap-2 md:gap-3 mb-1.5">
                      <h3 className="text-base sm:text-lg font-bold text-gray-100">{doc.name}</h3>
                      {doc.badge && (
                        <span className="bg-[#2a2f42] text-gray-300 text-[10px] sm:text-[11px] px-2.5 py-0.5 rounded-full font-medium whitespace-nowrap">
                          {doc.badge}
                        </span>
                      )}
                  </div>
                  <p className="text-[#8498c7] text-xs sm:text-sm font-medium mb-1">{doc.specialty}</p> 
                  <p className="text-gray-400 text-xs sm:text-sm mb-1">Clinic info: {doc.clinic} - {doc.experience}</p> 
                  <p className="text-xs sm:text-sm mt-2 text-gray-400 leading-normal">
                    <strong className="text-gray-200">Next Slot:</strong> {doc.nextSlot} <span className="mx-1 hidden sm:inline">|</span> <br className="sm:hidden" /> <strong className="text-gray-200">Fee:</strong> {doc.fee}
                  </p>
                </div>

                <div className="flex flex-col gap-2 w-full md:w-auto md:min-w-[180px] flex-none mt-2 md:mt-0">
                  
                  {doc.isBooked ? (
                     <button 
                       disabled 
                       className="bg-[#1e293b] border border-[#334155] text-gray-400 w-full py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-semibold cursor-not-allowed flex justify-center items-center gap-2"
                     >
                       🔒 Slot Reserved
                     </button>
                  ) : (
                    <button 
                      onClick={() => handleBookAppointment(doc)}
                      disabled={bookingId === doc._id}
                      className="bg-[#00b85c] hover:bg-[#00a050] text-white w-full py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-semibold transition-colors disabled:opacity-70 disabled:cursor-wait flex justify-center items-center gap-2"
                    >
                      {bookingId === doc._id ? (
                        <>
                          <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Booking...
                        </>
                      ) : (
                        "Confirm Appointment"
                      )}
                    </button>
                  )}

                  <button className="bg-[#4b5563] hover:bg-[#374151] text-white w-full py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-semibold transition-colors">
                      Cancel 
                  </button>
                </div>

              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

// 3. Export default wrapped in Suspense
export default function AppointmentPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-transparent flex items-center justify-center text-blue-400 text-base sm:text-xl font-bold animate-pulse px-4 text-center">
        Loading MedVision AI Booking System...
      </div>
    }>
      <AppointmentContent />
    </Suspense>
  );
}