"use client";

import { useState, useEffect, useRef } from "react";
import { useAuthStore } from "@/src/lib/store/useAuthStore";
import api from "@/src/lib/axios";
import Image from "next/image"; // NEW: For avatar preview

export default function DoctorProfileSettings() {
  const { user } = useAuthStore();
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // NEW: Reference for hidden file input
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [image, setImage] = useState(""); // NEW: State for doctor image

  const [formData, setFormData] = useState({
    specialty: "",
    expertise: "",
    clinic: "",
    experience: "",
    fee: "",
    about: "",
  });

  const [slotInput, setSlotInput] = useState("");
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user?.id) return;
      try {
        const res = await api.get(`/api/doctors/profile?userId=${user.id}`);
        if (res.data.success && res.data.data) {
          const profile = res.data.data;
          setFormData({
            specialty: profile.specialty || "",
            expertise: profile.expertise ? profile.expertise.join(", ") : "",
            clinic: profile.clinic || "",
            experience: profile.experience || "",
            fee: profile.fee || "",
            about: profile.about || "",
          });
          setAvailableSlots(profile.availableSlots || []);
          // NEW: Load existing image from doctor profile, fallback to user profile image
          setImage(profile.image || user?.image || "");
        }
      } catch (error) {
        console.error("No profile found, starting fresh.", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, [user?.id, user?.image]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // --- NEW: Handle Image Selection ---
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("Image is too large. Please select an image under 5MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => setImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const addSlot = () => {
    if (slotInput && !availableSlots.includes(slotInput)) {
      setAvailableSlots([...availableSlots, slotInput]);
      setSlotInput("");
    }
  };

  const removeSlot = (slotToRemove: string) => {
    setAvailableSlots(availableSlots.filter((s) => s !== slotToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      // ✅ Only send image if it's a new base64 upload
      const isNewImage = image.startsWith("data:image/");

      await api.post("/api/doctors/profile/update", {
        ...formData,
        availableSlots,
        userId: user?.id,
        name: user?.name,
        image: isNewImage ? image : undefined, // only send if new
        expertise: formData.expertise.split(",").map((item) => item.trim()),
      });
      alert("Profile and slots updated successfully!");
    } catch (error) {
      alert("Failed to save profile.");
      console.log(error);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading)
    return (
      <div className="text-white text-center py-10">Loading profile...</div>
    );

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white tracking-wide">
          Professional Profile
        </h1>
        <p className="text-gray-400 mt-2 text-sm">
          Update your clinical details, professional photo, and available slots
          below.
        </p>
      </div>

      <div className="bg-[#1a163a] rounded-xl border border-gray-800 shadow-2xl p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* --- NEW: Professional Photo Uploader --- */}
          <div className="flex flex-col items-start mb-6 pb-6 border-b border-gray-800">
            <label className="block text-sm font-medium text-gray-300 mb-3">
              Professional Photo
            </label>
            <div className="flex items-center gap-5">
              <div
                className="relative w-20 h-20 rounded-full overflow-hidden bg-[#120f26] border-2 border-gray-700 cursor-pointer hover:border-blue-500 transition-colors flex-shrink-0"
                onClick={() => fileInputRef.current?.click()}
              >
                {image ? (
                  <Image
                    src={image}
                    alt="Doctor Profile"
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center w-full h-full text-gray-500">
                    <svg
                      className="w-8 h-8"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                  </div>
                )}
              </div>
              <div className="flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-sm bg-[#120f26] hover:bg-gray-800 border border-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Upload Photo
                </button>
                <p className="text-xs text-gray-500">
                  JPG, PNG or WEBP. Max 5MB.
                </p>
              </div>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageChange}
                accept="image/jpeg, image/png, image/webp"
                className="hidden"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Primary Specialty
              </label>
              <input
                type="text"
                name="specialty"
                required
                placeholder="e.g. Neuro-Oncologist"
                value={formData.specialty}
                onChange={handleChange}
                className="w-full bg-[#120f26] border border-gray-700 rounded-lg p-3 text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Clinic / Hospital Location
              </label>
              <input
                type="text"
                name="clinic"
                required
                placeholder="e.g. City General Hospital, Lahore"
                value={formData.clinic}
                onChange={handleChange}
                className="w-full bg-[#120f26] border border-gray-700 rounded-lg p-3 text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Years of Experience
              </label>
              <input
                type="text"
                name="experience"
                required
                placeholder="e.g. 15 Yrs Exp"
                value={formData.experience}
                onChange={handleChange}
                className="w-full bg-[#120f26] border border-gray-700 rounded-lg p-3 text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Consultation Fee
              </label>
              <input
                type="text"
                name="fee"
                required
                placeholder="e.g. Rs. 3000"
                value={formData.fee}
                onChange={handleChange}
                className="w-full bg-[#120f26] border border-gray-700 rounded-lg p-3 text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Available Slots
            </label>
            <div className="flex gap-2">
              <input
                type="datetime-local"
                value={slotInput}
                onChange={(e) => setSlotInput(e.target.value)}
                className="w-full bg-[#120f26] border border-gray-700 rounded-lg p-3 text-white [color-scheme:dark]"
              />
              <button
                type="button"
                onClick={addSlot}
                className="bg-blue-600 px-6 rounded-lg font-bold hover:bg-blue-500 text-white"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2 mt-4">
              {availableSlots.map((slot) => (
                <div
                  key={slot}
                  className="bg-gray-800 text-xs text-white px-3 py-2 rounded-lg flex items-center gap-2 border border-gray-600"
                >
                  {new Date(slot).toLocaleString()}
                  <button
                    type="button"
                    onClick={() => removeSlot(slot)}
                    className="text-red-400 font-bold"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Expertise (Comma Separated)
            </label>
            <input
              type="text"
              name="expertise"
              required
              placeholder="e.g. Meningioma, Glioma"
              value={formData.expertise}
              onChange={handleChange}
              className="w-full bg-[#120f26] border border-gray-700 rounded-lg p-3 text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              About / Introduction
            </label>
            <textarea
              name="about"
              rows={4}
              placeholder="Briefly describe your background..."
              value={formData.about}
              onChange={handleChange}
              className="w-full bg-[#120f26] border border-gray-700 rounded-lg p-3 text-white resize-none"
            />
          </div>

          <div className="flex justify-end pt-4 border-t border-gray-800">
            <button
              type="submit"
              disabled={isSaving}
              className="bg-blue-600 px-8 py-3 rounded-xl font-bold text-white hover:bg-blue-500 transition-colors"
            >
              {isSaving ? "Saving..." : "Publish Profile"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
