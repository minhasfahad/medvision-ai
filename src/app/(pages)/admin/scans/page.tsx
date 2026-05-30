"use client";

import { useState, useEffect } from "react";
import api from "@/src/lib/axios";
import Image from "next/image";
import ProtectedRoute from "@/src/components/ProtectedRoute";
export default function ManageScans() {
  const [scans, setScans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    const fetchScans = async () => {
      try {
        const res = await api.get("/api/admin/scans");
        setScans(res.data);
      } catch (error) {
        console.error("Error loading scans:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchScans();
  }, [refreshTrigger]);

  const handleDelete = async (scanId: string) => {
    if (
      !confirm("Are you sure you want to delete this scan record permanently?")
    )
      return;

    setScans((prevScans) => prevScans.filter((scan) => scan._id !== scanId));

    try {
      await api.post("/api/admin/scans/delete", { scanId });
    } catch (error) {
      console.error("Deletion failed:", error);
      alert("Failed to delete scan. Reverting table...");
      setRefreshTrigger((prev) => prev + 1);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center p-8 text-white">
        <span className="text-lg font-semibold animate-pulse">
          Loading scan logs...
        </span>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="p-4 md:p-6 w-full max-w-full">
        <h1 className="text-xl md:text-2xl font-bold mb-4 md:mb-6 text-white tracking-wide">
          System Scan Logs
        </h1>

        <div className="w-full">
          <table className="w-full text-left border-collapse block md:table">
            <thead className="hidden md:table-header-group bg-[#120f26] text-gray-400 text-sm uppercase tracking-wider rounded-t-xl">
              <tr>
                {/* EVEN WIDER HEADER: Now w-40 to comfortably hold the 128px images */}
                <th className="p-5 font-semibold border-b border-gray-800 w-40">
                  Scan
                </th>
                <th className="p-5 font-semibold border-b border-gray-800">
                  Patient Name
                </th>
                <th className="p-5 font-semibold border-b border-gray-800">
                  AI Diagnosis
                </th>
                <th className="p-5 font-semibold border-b border-gray-800">
                  Date
                </th>
                <th className="p-5 font-semibold text-center border-b border-gray-800">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="block md:table-row-group text-sm md:text-base">
              {scans.length === 0 ? (
                <tr className="block md:table-row">
                  <td
                    colSpan={5}
                    className="p-6 md:p-8 text-center text-gray-500 block md:table-cell"
                  >
                    No scans found in the database.
                  </td>
                </tr>
              ) : (
                scans.map((scan: any) => (
                  <tr
                    key={scan._id}
                    className="block md:table-row bg-[#1a163a] md:bg-[#1a163a] border border-gray-800 md:border-none rounded-xl md:rounded-none mb-4 md:mb-0 text-gray-200 hover:bg-[#201c45] transition-colors duration-200 overflow-hidden shadow-lg md:shadow-none"
                  >
                    <td className="p-4 md:p-5 border-b border-gray-800 md:border-none flex justify-between md:table-cell items-center">
                      <span className="md:hidden text-xs uppercase text-gray-400 font-bold">
                        Scan Image
                      </span>

                      {/* MAXIMIZED IMAGE SIZES: Now h-24 w-24 on mobile, h-32 w-32 on desktop */}
                      <div className="relative h-40 w-40 md:h-50 md:w-50 rounded-lg bg-gray-900 overflow-hidden border border-gray-600 shadow-inner ml-auto md:ml-0">
                        <Image
                          src={
                            scan.imageData || scan.originalImage || "/logoo.jpg"
                          }
                          alt="MRI Scan"
                          fill
                          className="object-cover hover:scale-110 transition-transform duration-300"
                        />
                      </div>
                    </td>

                    <td className="p-4 md:p-5 border-b border-gray-800 md:border-none flex justify-between md:table-cell items-center">
                      <span className="md:hidden text-xs uppercase text-gray-400 font-bold">
                        Patient Name
                      </span>
                      <span className="font-medium capitalize text-blue-400 text-right md:text-left">
                        {scan.user?.name || "Unknown Patient"}
                      </span>
                    </td>

                    <td className="p-4 md:p-5 border-b border-gray-800 md:border-none flex justify-between md:table-cell items-center">
                      <span className="md:hidden text-xs uppercase text-gray-400 font-bold">
                        AI Diagnosis
                      </span>
                      <div className="text-right md:text-left">
                        {scan.tumorDetected ? (
                          <div className="flex flex-col">
                            <span className="text-red-400 font-bold tracking-wide text-base md:text-lg">
                              {scan.className}
                            </span>
                            <span className="text-sm text-gray-500 font-mono mt-1">
                              Confidence: {scan.confidence}%
                            </span>
                          </div>
                        ) : (
                          <span className="text-emerald-400 font-bold tracking-wide text-base md:text-lg">
                            Negative (Clear)
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="p-4 md:p-5 border-b border-gray-800 md:border-none flex justify-between md:table-cell items-center">
                      <span className="md:hidden text-xs uppercase text-gray-400 font-bold">
                        Date
                      </span>
                      <span className="text-gray-400 text-sm text-right md:text-left">
                        {new Date(scan.createdAt).toLocaleDateString(
                          undefined,
                          {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          },
                        )}
                      </span>
                    </td>

                    <td className="p-4 md:p-5 flex justify-between md:table-cell items-center text-center bg-[#15122e] md:bg-transparent">
                      <span className="md:hidden text-xs uppercase text-gray-400 font-bold">
                        Actions
                      </span>
                      <button
                        onClick={() => handleDelete(scan._id)}
                        className="bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white px-4 py-2 rounded-lg text-sm font-bold transition-all duration-300 shadow-[0_0_10px_rgba(239,68,68,0.0)] hover:shadow-[0_0_15px_rgba(239,68,68,0.4)] cursor-pointer border-0 ml-auto md:ml-0 md:mx-auto block"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </ProtectedRoute>
  );
}
