"use client";

import Image from 'next/image';
import React, { useState, useEffect } from 'react';
import api from "@/src/lib/axios";
import { useAuthStore } from "@/src/lib/store/useAuthStore";
import Link from 'next/link';

// 1. Interface for the Scan Data
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
  comment?: string; // The doctor's comment
}

export default function MyHistoryPage() {
  const [scans, setScans] = useState<ScanResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { user, isAuthenticated } = useAuthStore();

  useEffect(() => {
    // Prevent fetching if not logged in
    if (!isAuthenticated || !user?.id) {
        return;
    }

    const fetchMyHistory = async () => {
      try {
        setIsLoading(true);
        // Assuming your backend can filter results by userId. 
        // If your API route is different, adjust this URL (e.g., '/api/results/history')
        const response = await api.get(`/api/results?userId=${user.id}`); 
        
        if (response.data.success) {
           setScans(response.data.data); 
        } else {
           throw new Error(response.data.message || 'Failed to fetch history');
        }
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMyHistory();
  }, [user, isAuthenticated]);

  // Security Check: If not logged in, prompt them
  if (!isAuthenticated) {
      return (
          <div className="min-h-screen bg-transparent flex flex-col items-center justify-center text-white pt-10">
              <h2 className="text-2xl font-bold mb-4">Access Denied</h2>
              <p className="text-gray-400 mb-6">Please log in to view your medical history.</p>
              <Link href="/login">
                  <button className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-lg font-semibold transition-colors">
                      Go to Login
                  </button>
              </Link>
          </div>
      );
  }

  return (
    <div className="min-h-screen bg-transparent text-white w-full max-w-[1400px] mx-auto pt-10 px-6 pb-12">
      
      {/* Header Section */}
      <div className="mb-10 text-center md:text-left">
          <h1 className="text-[28px] font-bold text-gray-100 mb-2">My Medical History</h1>
          <p className="text-gray-400 text-sm">Review your past MRI scans and clinical notes from your doctor.</p>
      </div>
      
      <section>
        {isLoading && <div className="text-blue-400 animate-pulse text-lg text-center md:text-left">Retrieving your secure records...</div>}

        {error && (
          <div className="text-red-400 bg-red-500/10 p-4 rounded-lg border border-red-500/30 text-center md:text-left">
            Error loading history: {error}
          </div>
        )}

        {!isLoading && !error && scans.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 bg-[#121726] rounded-2xl border border-[#2a3655]">
              <p className="text-gray-400 text-lg mb-4">You have no MRI scans in your history.</p>
              <Link href="/try-demo">
                  <button className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-lg font-semibold transition-colors shadow-lg shadow-blue-900/20">
                      Scan New MRI
                  </button>
              </Link>
          </div>
        )}

        {!isLoading && !error && scans.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {scans.map((scan) => (
              <div 
                key={scan._id} 
                className="p-5 bg-[#121726] rounded-2xl border border-[#2a3655] flex flex-col h-full shadow-lg hover:border-[#3b4b75] transition-all"
              >
                {/* Date Badge */}
                <div className="flex justify-between items-center mb-4">
                    <span className="bg-[#1e2235] text-gray-300 text-xs px-3 py-1 rounded-full border border-gray-700">
                        {new Date(scan.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                    {scan.comment && (
                        <span className="bg-green-900/30 text-green-400 text-[10px] px-2 py-1 rounded font-bold border border-green-500/30 uppercase tracking-wider">
                            Reviewed
                        </span>
                    )}
                </div>

                {/* Scan Image */}
                <div className="w-full aspect-square bg-[#0f111a] rounded-xl mb-4 flex items-center justify-center overflow-hidden border border-gray-800">
                  {scan.imageData ? (
                    <Image 
                      src={scan.imageData} 
                      alt={scan.className} 
                      className="w-full h-full object-contain"
                      width={400}
                      height={400}
                      unoptimized
                    />
                  ) : (
                    <span className="text-gray-600 text-sm font-medium">No Image Data</span>
                  )}
                </div>
                
                {/* AI Result Details */}
                <div className="flex justify-between items-center mt-2 mb-4">
                  <div>
                      <p className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold mb-0.5">AI Detection</p>
                      <p className={`text-base font-bold ${scan.tumorDetected ? 'text-red-400' : 'text-green-400'}`}>
                        {scan.className}
                      </p>
                  </div>
                  <div className="text-right">
                      <p className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold mb-0.5">Certainty</p>
                      <p className="text-sm font-semibold text-gray-300">
                        {scan.confidence.toFixed(1)}%
                      </p>
                  </div>
                </div>

                {/* Doctor's Comment Section (Patient View) */}
                <div className="mt-auto pt-4 border-t border-[#2a3655]">
                  {scan.comment ? (
                    <div className="p-3 bg-blue-900/10 rounded-lg border border-blue-500/20">
                      <p className="text-[11px] text-blue-400 font-bold mb-1 uppercase tracking-wider flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                        Doctor`s Clinical Note
                      </p>
                      <p className="text-sm text-gray-300 leading-relaxed">{scan.comment}</p>
                    </div>
                  ) : (
                    <div className="p-3 bg-gray-800/30 rounded-lg border border-gray-800 border-dashed text-center">
                      <p className="text-xs text-gray-500 italic">Awaiting doctors review.</p>
                    </div>
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