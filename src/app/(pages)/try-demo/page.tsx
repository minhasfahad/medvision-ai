"use client";

import api from '@/src/lib/axios';
import { useState } from 'react';
// --- NEW IMPORT ADDED HERE ---
import GaugeChart from 'react-gauge-chart'; 
// -----------------------------

interface AnalysisResult {
  className: string;
  confidence: number;
  detected: boolean;
}

export default function TryDemoPage() {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [analyzedImage, setAnalyzedImage] = useState<string | null>(null);
  const [analysisData, setAnalysisData] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);

  const handleUpload = async () => {
    if (!selectedImage) return;
    setLoading(true);
    setAnalyzedImage(null);
    setAnalysisData(null);

    const formData = new FormData();
    formData.append("mri_image", selectedImage);

    try {
      // Calls the Next.js API route (bridge)
      const response = await api.post("/api/analyze", formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      const result = await response.data;

      if (!result.success) {
        throw new Error("Server response was not ok");
      }


      if (result.success) {
        // Update states with data from Python JSON response
        setAnalyzedImage(result.image);
        setAnalysisData({
          className: result.class_name,
          confidence: result.confidence,
          detected: result.tumor_detected
        });
      } else {
        alert("Analysis failed. Please check the Python server.");
      }
    } catch (error: any) {
      console.error("Upload failed", error);
      alert("Error connecting to server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen  text-white">
      <main className="pt-24 px-4 pb-12 flex flex-col items-center">
        <h1 className="text-3xl font-bold mb-2">MedVision AI Analysis</h1>
        <p className="text-gray-400 mb-8">Upload MRI scan for deep learning tumor detection</p>
        
        <div className="bg-white/5 p-8 rounded-2xl border border-white/10 w-full max-w-[60%] shadow-2xl rsults">
          {/* UPLOAD SECTION */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-300 mb-2">Select MRI Image</label>
            <input 
              type="file" 
              accept="image/*"
              onChange={(e) => setSelectedImage(e.target.files?.[0] || null)}
              className="block w-full text-sm text-gray-400
                file:mr-4 file:py-2.5 file:px-4
                file:rounded-lg file:border-0
                file:text-sm file:font-semibold
                file:bg-purple-600 file:text-white
                hover:file:bg-purple-500 transition-all"
            />
          </div>

          <button 
            onClick={handleUpload}
            disabled={loading || !selectedImage}
            className="w-full border-none bg-blue-600 hover:bg-blue-500 text-white py-3.5 rounded-xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-900/20"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                Processing Scan...
              </span>
            ) : "Analyze MRI Scan"}
          </button>

          {/* RESULTS DISPLAY */}
          {analyzedImage && analysisData && (
            <div className="mt-10 border-t border-white/10 pt-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <div className="flex flex-col md:flex-row gap-6">
                
                {/* Image Result */}
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wider">Visual Output</h3>
                  <div className="rounded-xl overflow-hidden border-2 border-purple-500 shadow-xl shadow-purple-500/20">
                    <img src={analyzedImage} alt="Analysis" className="w-full h-auto" />
                  </div>
                </div>

                {/* Data Result */}
                <div className="flex-1 flex flex-col justify-center">
                  <h3 className="text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wider">Diagnosis Details</h3>
                  <div className="space-y-4 p-5 bg-white/5 rounded-xl border border-white/10">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400 text-sm">Tumor Detected:</span>
                      <span className="font-bold text-lg">{analysisData.detected ? "✅ YES" : "❌ NO"}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400 text-sm">Classification:</span>
                      <span className={`font-bold ${analysisData.detected ? 'text-purple-400' : 'text-green-400'}`}>
                        {analysisData.className}
                      </span>
                    </div>
                    
                    {/* --- START CHANGED SECTION: CONFIDENCE GAUGE --- */}
                    <div className="flex flex-col items-center justify-center pt-2">
                      <span className="text-gray-400 text-sm mb-2 self-start">AI Confidence:</span>
                      
                      <div className="w-full flex justify-center h-[120px] relative"> 
                        <GaugeChart 
                          id="gauge-chart1" 
                          nrOfLevels={20} 
                          percent={analysisData.confidence / 100} 
                          colors={["#FF5F6D", "#FFC371", "#5BE12C"]} 
                          arcWidth={0.3}
                          textColor="#ffffff"
                          needleColor="#4c51bf"
                          needleBaseColor="#4c51bf"
                          hideText={true} // Hiding default text to customize it below
                          style={{ width: '100%' }}
                        />
                        {/* Custom Text Overlay for that "Digital Speedometer" look */}
                        <div className="absolute bottom-4 flex flex-col items-center">
                           <span className="text-3xl font-bold text-white">{analysisData.confidence}%</span>
                           <span className="text-[10px] text-gray-400 uppercase tracking-widest">Certainty</span>
                        </div>
                      </div>
                    </div>
                    {/* --- END CHANGED SECTION --- */}

                    <div className="pt-2">
                      <p className="text-[11px] leading-relaxed text-gray-500 italic">
                        {analysisData.detected 
                          ? "Note: High-confidence region identified. Consult a radiologist for clinical verification." 
                          : "Note: No abnormal tumor mass detected by the current model version."}
                      </p>
                    </div>
                  </div>

                  <div className='max-w-[100%] items-center'>
                    <button 
                    onClick={() => { setAnalyzedImage(null); setAnalysisData(null); }}
                    className=" result-btn w-full border-0 login-sigup-btn mt-6 text-xs text-gray-500 hover:text-white transition-colors flex  gap-1 self-end text-center justify-center rounded-2xl bg-[#9150f3e1] border-none p-2 text-xl text-white"
                  >
                    Clear Results & Scan New MRI
                  </button>
                  <button className=' result-btn border-0 login-signp-btn mt-6 text-xs text-gray-500 hover:text-white transition-colors flex  gap-1 self-end w-full justify-center rounded-2xl bg-blue-500 border-none p-2 text-xl text-white'>
                    Book Appointment?
                  </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}