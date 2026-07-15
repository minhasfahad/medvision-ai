"use client";

import { useState, useEffect, useRef } from "react";
import { useAuthStore } from "@/src/lib/store/useAuthStore";
import api from "@/src/lib/axios";
import Image from "next/image"; // NEW: For avatar preview
import Reveal from "@/src/components/Reveal";
import {
  Camera,
  Plus,
  X,
  Loader2,
  Save,
  UserRound,
  Stethoscope,
  CalendarRange,
  NotebookPen,
} from "lucide-react";

// Quick-jump navigation for the sectioned layout below. Purely a visual aid —
// every section stays mounted in the DOM at all times (no hide/unmount), so
// native required-field validation on the single underlying <form> behaves
// exactly as it did before.
const SECTIONS = [
  { id: "identity", label: "Identity", icon: UserRound },
  { id: "professional", label: "Professional", icon: Stethoscope },
  { id: "availability", label: "Availability", icon: CalendarRange },
  { id: "bio", label: "Expertise & Bio", icon: NotebookPen },
] as const;

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

  // Purely presentational: which quick-nav pill is highlighted. Does not
  // gate rendering of any form field.
  const [activeSection, setActiveSection] = useState<(typeof SECTIONS)[number]["id"]>("identity");

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
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("Image is too large. Please select an image under 5MB.");
      return;
    }

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = document.createElement("img");
    const url = URL.createObjectURL(file);

    img.onload = () => {
      const maxSize = 800;
      let width = img.width;
      let height = img.height;

      if (width > height) {
        if (width > maxSize) {
          height = (height * maxSize) / width;
          width = maxSize;
        }
      } else {
        if (height > maxSize) {
          width = (width * maxSize) / height;
          height = maxSize;
        }
      }

      canvas.width = width;
      canvas.height = height;
      ctx?.drawImage(img, 0, 0, width, height);
      const compressedBase64 = canvas.toDataURL("image/jpeg", 0.8);
      setImage(compressedBase64);
      URL.revokeObjectURL(url);
    };

    img.src = url;
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

  const scrollToSection = (id: (typeof SECTIONS)[number]["id"]) => {
    setActiveSection(id);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  if (isLoading)
    return (
      <div className="flex items-center justify-center gap-2 text-white text-center py-10">
        <Loader2 className="w-5 h-5 animate-spin text-blue-400" />
        Loading profile...
      </div>
    );

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <Reveal>
        <div className="mb-6 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white tracking-wide">
              Professional Profile
            </h1>
            <p className="text-gray-400 mt-2 text-sm">
              Update your clinical details, professional photo, and available slots
              below.
            </p>
          </div>

          <div className="relative w-16 h-16 rounded-full overflow-hidden bg-white/5 border-2 border-white/10 flex-none">
            {image ? (
              <Image src={image} alt="Doctor Profile" fill className="object-cover" />
            ) : (
              <div className="flex items-center justify-center w-full h-full text-gray-500">
                <Camera className="w-6 h-6" />
              </div>
            )}
          </div>
        </div>
      </Reveal>

      {/* Sectioned quick-nav bar — scrolls to sections, all of which stay
          mounted below so the form's native validation is untouched. */}
      <Reveal delay={60}>
        <div className="mb-6 flex flex-wrap gap-2 rounded-2xl border border-white/10 bg-[#12172a]/90 backdrop-blur-sm p-2 sticky top-2 z-10">
          {SECTIONS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => scrollToSection(id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 ${
                activeSection === id
                  ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-[0_0_20px_rgba(37,99,235,0.3)]"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>
      </Reveal>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* --- SECTION: Identity & Photo --- */}
        <Reveal delay={80}>
          <section
            id="identity"
            className="bg-[#12172a]/85 backdrop-blur-md rounded-2xl border border-white/10 shadow-2xl p-6 sm:p-8 scroll-mt-20"
          >
            <div className="flex items-center gap-2 mb-6 pb-4 border-b border-white/10">
              <UserRound className="w-5 h-5 text-blue-400" />
              <h2 className="text-lg font-bold text-white">Identity &amp; Photo</h2>
            </div>

            <div className="flex flex-col items-start">
              <label className="block text-sm font-medium text-gray-300 mb-3">
                Professional Photo
              </label>
              <div className="flex items-center gap-5">
                <div
                  className="relative w-20 h-20 rounded-full overflow-hidden bg-white/5 border-2 border-white/10 cursor-pointer hover:border-blue-500 transition-colors flex-shrink-0"
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
                      <Camera className="w-8 h-8" />
                    </div>
                  )}
                </div>
                <div className="flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-2 text-sm bg-white/5 hover:bg-white/10 border border-white/10 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    <Camera className="w-4 h-4" />
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
          </section>
        </Reveal>

        {/* --- SECTION: Professional Details --- */}
        <Reveal delay={120}>
          <section
            id="professional"
            className="bg-[#12172a]/85 backdrop-blur-md rounded-2xl border border-white/10 shadow-2xl p-6 sm:p-8 scroll-mt-20"
          >
            <div className="flex items-center gap-2 mb-6 pb-4 border-b border-white/10">
              <Stethoscope className="w-5 h-5 text-blue-400" />
              <h2 className="text-lg font-bold text-white">Professional Details</h2>
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
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-colors"
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
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-colors"
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
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-colors"
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
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-colors"
                />
              </div>
            </div>
          </section>
        </Reveal>

        {/* --- SECTION: Availability --- */}
        <Reveal delay={160}>
          <section
            id="availability"
            className="bg-[#12172a]/85 backdrop-blur-md rounded-2xl border border-white/10 shadow-2xl p-6 sm:p-8 scroll-mt-20"
          >
            <div className="flex items-center gap-2 mb-6 pb-4 border-b border-white/10">
              <CalendarRange className="w-5 h-5 text-blue-400" />
              <h2 className="text-lg font-bold text-white">Available Slots</h2>
            </div>

            <div className="flex gap-2">
              <input
                type="datetime-local"
                value={slotInput}
                onChange={(e) => setSlotInput(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-colors [color-scheme:dark]"
              />
              <button
                type="button"
                onClick={addSlot}
                className="flex items-center gap-1.5 bg-blue-600 px-6 rounded-xl font-bold hover:bg-blue-500 hover:-translate-y-0.5 text-white transition-all"
              >
                <Plus className="w-4 h-4" />
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2 mt-4">
              {availableSlots.map((slot, idx) => (
                <div
                  key={slot}
                  style={{ animationDelay: `${idx * 40}ms` }}
                  className="bg-white/5 text-xs text-white px-3 py-2 rounded-lg flex items-center gap-2 border border-white/10 animate-fade-in-up"
                >
                  {new Date(slot).toLocaleString()}
                  <button
                    type="button"
                    onClick={() => removeSlot(slot)}
                    className="text-red-400 hover:text-red-300 transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </section>
        </Reveal>

        {/* --- SECTION: Expertise & Bio --- */}
        <Reveal delay={200}>
          <section
            id="bio"
            className="bg-[#12172a]/85 backdrop-blur-md rounded-2xl border border-white/10 shadow-2xl p-6 sm:p-8 scroll-mt-20"
          >
            <div className="flex items-center gap-2 mb-6 pb-4 border-b border-white/10">
              <NotebookPen className="w-5 h-5 text-blue-400" />
              <h2 className="text-lg font-bold text-white">Expertise &amp; Bio</h2>
            </div>

            <div className="space-y-6">
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
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-colors"
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
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-colors resize-none"
                />
              </div>
            </div>
          </section>
        </Reveal>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={isSaving}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 disabled:opacity-70 px-8 py-3 rounded-xl font-bold text-white transition-all duration-300 shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:shadow-[0_0_30px_rgba(37,99,235,0.5)] hover:-translate-y-1"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" /> Publish Profile
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
