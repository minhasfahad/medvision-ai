export const runtime = "nodejs";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { connectDB } from "@/src/lib/mongoose";
import Result from "@/src/models/scanresult.model";
import { Appointment } from "@/src/models/appointment.model";
import Doctor from "@/src/models/doctor.model";
import { UserModel } from "@/src/models/user.model";
import mongoose from "mongoose";
const JWT_SECRET = process.env.JWT_SECRET!;

// ==========================================
// AUTH HELPER
// ==========================================
interface AuthUser {
  userId: string;
  role: string;
}

function verifyToken(token: string): AuthUser | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    console.log("DECODED TOKEN:", decoded); // ADD THIS
    return { userId: decoded.userId, role: decoded.role };
  } catch (err) {
    console.error("JWT VERIFY FAILED:", err); // ADD THIS
    return null;
  }
}

// ==========================================
// INTENT DETECTION — Rule Based (No extra API call)
// ==========================================
function detectIntent(message: string, role: string): string {
  const msg = message.toLowerCase().trim();

  // Admin intents
  if (role === "admin") {
    if (
      msg.includes("stats") ||
      msg.includes("statistics") ||
      msg.includes("overview") ||
      msg.includes("total") ||
      msg.includes("how many")
    ) return "GET_SYSTEM_STATS";

    if (
      msg.includes("search") ||
      msg.includes("find user") ||
      msg.includes("find patient") ||
      msg.includes("find doctor") ||
      msg.includes("lookup")
    ) return "ADMIN_SEARCH";
    if (
      msg.includes("recent scan") ||
      msg.includes("all scan") ||
      msg.includes("scan log") ||
      msg.includes("all mri")
    ) return "GET_ALL_SCANS";

    if (
      msg.includes("all appointment") ||
      msg.includes("total appointment") ||
      msg.includes("every appointment")
    ) return "GET_ALL_APPOINTMENTS";
  }

  // Doctor intents
  if (role === "doctor") {
    if (
      msg.includes("patient scan") ||
      msg.includes("my patients") ||
      msg.includes("assigned patient") ||
      msg.includes("patient mri") ||
      msg.includes("patient result")
    ) return "GET_PATIENT_SCANS";

    if (
      msg.includes("schedule") ||
      msg.includes("slot") ||
      msg.includes("availability") ||
      msg.includes("my slots")
    ) return "GET_MY_SCHEDULE";
    if (
      msg.includes("how many patient") ||
      msg.includes("total patient") ||
      msg.includes("my stats") ||
      msg.includes("my statistics") ||
      msg.includes("kitne patient")
    ) return "GET_DOCTOR_STATS";

    if (
      msg.includes("appointment") ||
      msg.includes("booking") ||
      msg.includes("upcoming")
    ) return "GET_MY_APPOINTMENTS";

    if (
      msg.includes("my scan") ||
      msg.includes("my own scan") ||
      msg.includes("personal scan") ||
      msg.includes("scan history") ||
      msg.includes("my result") ||
      msg.includes("my mri") ||
      msg.includes("apni scan")
    ) return "GET_MY_SCANS";
  }

  // Radiologist intents
  if (role === "radiologist") {
    if (
      msg.includes("pending") ||
      msg.includes("review") ||
      msg.includes("pending scan") ||
      msg.includes("to review")
    ) return "GET_PENDING_REVIEWS";
    if (
      msg.includes("reviewed scan") ||
      msg.includes("review history") ||
      msg.includes("my review") ||
      msg.includes("completed review")
    ) return "GET_REVIEW_HISTORY";

    if (
      msg.includes("my scan") ||
      msg.includes("scan history") ||
      msg.includes("my result") ||
      msg.includes("my mri") ||
      msg.includes("my own scan") ||
      msg.includes("personal scan") ||
      msg.includes("apni scan")
    ) return "GET_MY_SCANS";
  }

  // Patient + fallback intents for any role
  if (
    msg.includes("latest result") ||
    msg.includes("last result") ||
    msg.includes("latest scan") ||
    msg.includes("last scan") ||
    msg.includes("most recent scan") ||
    msg.includes("most recent result")
  ) return "GET_LATEST_SCAN";

  if (
    msg.includes("my scan") ||
    msg.includes("scan history") ||
    msg.includes("show scan") ||
    msg.includes("view scan") ||
    msg.includes("my result") ||
    msg.includes("my mri") ||
    msg.includes("past scan") ||
    msg.includes("previous scan") ||
    msg.includes("show my scan") ||
    msg.includes("meri scan")
  ) return "GET_MY_SCANS";

  if (
    msg.includes("appointment") ||
    msg.includes("booking") ||
    msg.includes("my appointment") ||
    msg.includes("upcoming appointment") ||
    msg.includes("booked") ||
    msg.includes("mera appointment") ||
    msg.includes("meri appointment")
  ) return "GET_MY_APPOINTMENTS";

  return "GENERAL";
}

// ==========================================
// DB FETCH HELPERS
// ==========================================
async function fetchDbContext(
  intent: string,
  authUser: AuthUser,
  message: string
): Promise<string> {
  await connectDB();

  const { userId, role } = authUser;
  const userObjectId = new mongoose.Types.ObjectId(userId);

  // ── PATIENT: MY SCANS ────────────────────────────────────
  if (intent === "GET_MY_SCANS") {
    const scans = await Result.find({ user: userObjectId })
      .sort({ createdAt: -1 })
      .limit(5)
      .select("className confidence tumorDetected radiologistReviewStatus createdAt reportConclusion");

    if (!scans.length) return "No scans found for this user.";

    const formatted = scans.map((s, i) => {
      const date = new Date(s.createdAt).toLocaleDateString("en-PK");
      return `Scan ${i + 1}: ${s.className} | Confidence: ${s.confidence.toFixed(1)}% | Tumor Detected: ${s.tumorDetected ? "Yes" : "No"} | Radiologist Status: ${s.radiologistReviewStatus} | Date: ${date}`;
    });

    return `User's last ${scans.length} scans:\n${formatted.join("\n")}`;
  }

  // ── PATIENT: LATEST SCAN ─────────────────────────────────
  if (intent === "GET_LATEST_SCAN") {
    const scan = await Result.findOne({ user: userObjectId })
      .sort({ createdAt: -1 })
      .select("className confidence tumorDetected radiologistReviewStatus reportConclusion reportRecommendation createdAt");

    if (!scan) return "No scans found for this user.";

    const date = new Date(scan.createdAt).toLocaleDateString("en-PK");
    return `Latest scan result:
- Tumor Class: ${scan.className}
- Confidence: ${scan.confidence.toFixed(1)}%
- Tumor Detected: ${scan.tumorDetected ? "Yes" : "No"}
- Radiologist Review Status: ${scan.radiologistReviewStatus}
- AI Conclusion: ${scan.reportConclusion || "Not available"}
- AI Recommendation: ${scan.reportRecommendation || "Not available"}
- Scan Date: ${date}`;
  }

  // ── APPOINTMENTS (Patient & Doctor) ──────────────────────
  if (intent === "GET_MY_APPOINTMENTS") {
    const doctorProfile2 = await Doctor.findOne({ userId: userObjectId }).select("_id");
    const query = role === "doctor"
      ? { doctorId: doctorProfile2?._id }
      : { userId: userId };

    const appointments = await Appointment.find(query)
      .sort({ createdAt: -1 })
      .limit(5)
      .select("doctorName patientName appointmentDate status tumorType fee clinic");

    if (!appointments.length) return "No appointments found.";

    const formatted = appointments.map((a, i) => {
      const label = role === "doctor"
        ? `Patient: ${a.patientName}`
        : `Doctor: ${a.doctorName}`;
      return `Appointment ${i + 1}: ${label} | Date: ${a.appointmentDate} | Status: ${a.status} | Tumor Type: ${a.tumorType} | Fee: ${a.fee} | Clinic: ${a.clinic}`;
    });

    return `${role === "doctor" ? "Doctor's" : "User's"} last ${appointments.length} appointments:\n${formatted.join("\n")}`;
  }

  // ── DOCTOR: PATIENT SCANS ────────────────────────────────
  if (intent === "GET_PATIENT_SCANS" && role === "doctor") {
    const doctorProfile = await Doctor.findOne({ userId: userObjectId }).select("_id");
    if (!doctorProfile) return "Doctor profile not found.";

    const patientIds = await Appointment.find({
      doctorId: doctorProfile._id
    }).distinct("userId");

    const patientObjectIds = patientIds.map((id: string) => new mongoose.Types.ObjectId(id));

    if (!patientIds.length) return "No patients assigned to this doctor yet.";

    const scans = await Result.find({ user: { $in: patientObjectIds } })
      .sort({ createdAt: -1 })
      .limit(10)
      .populate("user", "name email")
      .select("className confidence tumorDetected radiologistReviewStatus createdAt user");

    if (!scans.length) return "No patient scans found.";

    const formatted = scans.map((s, i) => {
      const date = new Date(s.createdAt).toLocaleDateString("en-PK");
      const patientName = (s.user as any)?.name || "Unknown";
      return `Scan ${i + 1}: Patient: ${patientName} | Result: ${s.className} | Confidence: ${s.confidence.toFixed(1)}% | Radiologist Status: ${s.radiologistReviewStatus} | Date: ${date}`;
    });

    return `Patient scans for this doctor:\n${formatted.join("\n")}`;
  }

  // ── DOCTOR: SCHEDULE ─────────────────────────────────────
  if (intent === "GET_MY_SCHEDULE" && role === "doctor") {
    const doctor = await Doctor.findOne({ userId: userObjectId })
      .select("availableSlots name specialty");

    if (!doctor) return "Doctor profile not found.";

    const slots = doctor.availableSlots?.length
      ? doctor.availableSlots.slice(0, 5).join("\n")
      : "No available slots configured.";

    return `Doctor: ${doctor.name} | Specialty: ${doctor.specialty}\nAvailable Slots:\n${slots}`;
  }

  if (intent === "GET_DOCTOR_STATS" && role === "doctor") {
    const doctorProfile3 = await Doctor.findOne({ userId: userObjectId }).select("_id name specialty");
    if (!doctorProfile3) return "Doctor profile not found.";

    const totalPatients = await Appointment.distinct("userId", {
      doctorId: doctorProfile3._id
    });
    const totalAppointments = await Appointment.countDocuments({
      doctorId: doctorProfile3._id
    });
    const confirmedAppointments = await Appointment.countDocuments({
      doctorId: doctorProfile3._id,
      status: "Confirmed"
    });

    return `Doctor Stats:
- Total Unique Patients: ${totalPatients.length}
- Total Appointments: ${totalAppointments}
- Confirmed Appointments: ${confirmedAppointments}`;
  }

  // ── RADIOLOGIST: PENDING REVIEWS ─────────────────────────
  if (intent === "GET_PENDING_REVIEWS" && role === "radiologist") {
    const scans = await Result.find({
      radiologistReviewStatus: "pending"
    })
      .sort({ createdAt: -1 })
      .limit(20)
      .populate("user", "name")
      .select("className confidence tumorDetected createdAt user");

    if (!scans.length) return "No pending reviews at the moment.";

    const formatted = scans.map((s, i) => {
      const date = new Date(s.createdAt).toLocaleDateString("en-PK");
      const patientName = (s.user as any)?.name || "Unknown";
      return `Review ${i + 1}: Patient: ${patientName} | Result: ${s.className} | Confidence: ${s.confidence.toFixed(1)}% | Date: ${date}`;
    });

    const totalPending = await Result.countDocuments({ radiologistReviewStatus: "pending" });
    return `You have ${totalPending} total pending reviews. Showing latest ${scans.length}:\n${formatted.join("\n")}`;
  }

  // ── ADMIN: SYSTEM STATS ──────────────────────────────────
  if (intent === "GET_SYSTEM_STATS" && role === "admin") {
    const [
      totalPatients,
      totalDoctors,
      totalRadiologists,
      totalScans,
      totalAppointments,
      pendingReviews,
    ] = await Promise.all([
      UserModel.countDocuments({ role: "patient" }),
      UserModel.countDocuments({ role: "doctor" }),
      UserModel.countDocuments({ role: "radiologist" }),
      Result.countDocuments(),
      Appointment.countDocuments(),
      Result.countDocuments({ radiologistReviewStatus: "pending" }),
    ]);

    return `System Statistics:
- Total Patients: ${totalPatients}
- Total Doctors: ${totalDoctors}
- Total Radiologists: ${totalRadiologists}
- Total Scans Processed: ${totalScans}
- Total Appointments: ${totalAppointments}
- Pending Radiologist Reviews: ${pendingReviews}`;
  }

  // ── ADMIN: SEARCH USER ───────────────────────────────────
  if (intent === "ADMIN_SEARCH" && role === "admin") {
    const msg = message.toLowerCase();

    // Extract search name — everything after "search", "find", "lookup"
    const searchMatch = msg.match(/(?:search|find|lookup)\s+(?:user|patient|doctor|radiologist)?\s*(?:named?|called)?\s*(.+)/);
    const searchTerm = searchMatch ? searchMatch[1].trim() : "";

    if (!searchTerm) return "No search term provided. Please specify a name to search for.";

    const users = await UserModel.find({
      name: { $regex: searchTerm, $options: "i" }
    })
      .limit(5)
      .select("name email role createdAt");

    if (!users.length) return `No users found matching "${searchTerm}".`;

    const formatted = users.map((u, i) => {
      const date = new Date(u.createdAt).toLocaleDateString("en-PK");
      return `User ${i + 1}: ${u.name} | Email: ${u.email} | Role: ${u.role} | Joined: ${date}`;
    });

    return `Search results for "${searchTerm}":\n${formatted.join("\n")}`;
  }
  if (intent === "GET_REVIEW_HISTORY" && role === "radiologist") {
    const scans = await Result.find({
      reviewedBy: userObjectId,
      radiologistReviewStatus: { $ne: "pending" }
    })
      .sort({ reviewedAt: -1 })
      .limit(5)
      .populate("user", "name")
      .select("className confidence radiologistReviewStatus reviewedAt user");

    if (!scans.length) return "No reviewed scans found yet.";

    const formatted = scans.map((s, i) => {
      const date = new Date(s.reviewedAt!).toLocaleDateString("en-PK");
      const patientName = (s.user as any)?.name || "Unknown";
      return `Review ${i + 1}: Patient: ${patientName} | Result: ${s.className} | Status: ${s.radiologistReviewStatus} | Reviewed: ${date}`;
    });

    return `Your reviewed scans:\n${formatted.join("\n")}`;
  }

  if (intent === "GET_ALL_SCANS" && role === "admin") {
    const scans = await Result.find({})
      .sort({ createdAt: -1 })
      .limit(10)
      .populate("user", "name")
      .select("className confidence tumorDetected radiologistReviewStatus createdAt user");

    if (!scans.length) return "No scans found in the system.";

    const total = await Result.countDocuments();
    const formatted = scans.map((s, i) => {
      const date = new Date(s.createdAt).toLocaleDateString("en-PK");
      const patientName = (s.user as any)?.name || "Unknown";
      return `Scan ${i + 1}: Patient: ${patientName} | Result: ${s.className} | Confidence: ${s.confidence.toFixed(1)}% | Status: ${s.radiologistReviewStatus} | Date: ${date}`;
    });

    return `Total scans in system: ${total}. Latest 10:\n${formatted.join("\n")}`;
  }

  if (intent === "GET_ALL_APPOINTMENTS" && role === "admin") {
    const appointments = await Appointment.find({})
      .sort({ createdAt: -1 })
      .limit(10)
      .select("patientName doctorName appointmentDate status tumorType clinic");

    if (!appointments.length) return "No appointments found in the system.";

    const total = await Appointment.countDocuments();
    const formatted = appointments.map((a, i) =>
      `Apt ${i + 1}: Patient: ${a.patientName} | Doctor: ${a.doctorName} | Date: ${a.appointmentDate} | Status: ${a.status} | Clinic: ${a.clinic}`
    );

    return `Total appointments: ${total}. Latest 10:\n${formatted.join("\n")}`;
  }

  return "";
}

// ==========================================
// SYSTEM PROMPT
// ==========================================
const SYSTEM_PROMPT = `
You are the official MedVision AI Assistant, a highly professional, empathetic, and bilingual healthcare chatbot for MedVision AI — a Final Year Project (FYP) platform for brain tumor MRI detection and doctor appointment booking.

[LANGUAGE RULES — FOLLOW STRICTLY]
- If the user writes in English → reply in English only.
- If the user writes in Roman Urdu (Urdu words typed in English letters, e.g. "kya", "kren", "boht", "kaise") → reply in Roman Urdu only. Use correct Roman Urdu grammar: "karen" not "karun", "dekhein" not "dekhun", "karein" not "krun".
- If the user writes in Urdu script (Arabic letters) → reply in Urdu script only.
- NEVER mix scripts or languages in the same response.

[PLATFORM OVERVIEW & AI MODELS]
- MedVision AI is a secure, authenticated web app built on Next.js, Node.js, and a FastAPI backend.
- It uses two Deep Learning models:
  1. MobileNetV3: Validates whether the uploaded image is a legitimate MRI scan before processing.
  2. YOLOv11s-seg: A highly accurate (96-97%) instance segmentation model detecting 4 classes: Glioma, Meningioma, Pituitary, and No Tumor.
- The AI outputs a segmented image with bounding box and confidence score.
- Users can download a comprehensive PDF report with patient details, AI results, and scan images.

[NAVBAR — SAME DESIGN FOR ALL USERS]
The navbar contains: Home, About, Contact, [Role-specific Portal Link], "Scan MRI Now" button, and a Profile Icon on the far right.
- The "Scan MRI Now" button is directly on the navbar — it is NOT inside any dropdown or submenu. Clicking it takes the user directly to the MRI scanning page.
- The role-specific navbar link is:
  - Patient → "Patient Dashboard"
  - Doctor → "Clinical Portal"
  - Radiologist → "Radiology Portal"
  - Admin → "Admin Portal"
- The Profile Icon (far right of navbar) opens a dropdown where users can: log out, manage their account, change their name, change their profile picture, or reset their password.

[HOW TO SCAN AN MRI]
To scan an MRI:
1. Click the "Scan MRI Now" button directly in the navbar.
2. Upload your MRI image (.png or .jpeg format).
3. The AI will validate and analyze the scan within seconds.
4. Results will appear with a segmented image, bounding box, confidence score, and tumor class.
5. Click the download button to save your PDF report immediately.

[USER ROLES & THEIR DASHBOARDS]

PATIENT — Navbar link: "Patient Dashboard"
Left sidebar inside Patient Dashboard contains:
- My Scan History: View all past MRI scans with PDF download button for each.
- My Appointments: View booked appointments, their status (pending/confirmed/cancelled), and join video consultation if active.
- Book Specialist: Browse available doctors and book an appointment.
Profile icon dropdown: Manage account (name, profile picture, password).

DOCTOR — Navbar link: "Clinical Portal"
Left sidebar inside Clinical Portal contains:
- Clinical Dashboard: Overview showing My Patients count, Upcoming Schedule, Consultations, and Patient Scans stats.
- Patient Scans: View MRI scans of patients assigned to this doctor.
- My Scan History: View the doctor's own personal MRI scans.
- My Schedule: Manage available appointment slots.
- Profile & Settings: Update profile info, specialty, clinic location, consultation fee, and about section.
Profile icon dropdown: Manage account (name, profile picture, password).

RADIOLOGIST — Navbar link: "Radiology Portal"
Left sidebar inside Radiology Portal contains:
- Scan Reviews: View all scans pending radiologist review and submit professional opinions.
- My Scans: View the radiologist's own personal MRI scans.
- My History: View complete review history.
- Needs Recheck: View scans flagged for re-evaluation.
- Reviewed Scans: View all scans already reviewed.
Profile icon dropdown: Manage account (name, profile picture, password).

ADMIN — Navbar link: "Admin Portal"
Left sidebar inside Admin Portal contains:
- Dashboard: System overview (total patients, doctors, radiologists, scans processed, appointments, system status).
- Manage Patients: View and delete patient accounts.
- Manage Doctors: View and delete doctor accounts.
- Manage Radiologists: View and delete radiologist accounts.
- Appointments: View and manage all appointments.
- Scan Logs: View all scans processed across the platform.
Profile icon dropdown: Manage account (name, profile picture, password).

[VIDEO CONSULTATION]
- MedVision AI supports online video consultation between doctors and patients.
- Patients can join a video call from the "My Appointments" section inside their Patient Dashboard when a session is active.
- Doctors can initiate or join video calls from their appointment management area in the Clinical Portal.

[PDF REPORT DOWNLOAD]
A PDF report can be downloaded in TWO ways:
1. Immediately after scan results appear — a download button shows up right after the AI analysis completes.
2. Later from your dashboard — go to your role's portal, open "My Scan History" (patient/doctor) or "My Scans" (radiologist) from the left sidebar, and click the download button next to any past scan.

[MEDICAL & EMOTIONAL SUPPORT]
- Educate users professionally on Glioma, Meningioma, and Pituitary tumors.
- If a user is scared or anxious about a tumor result, respond with deep empathy. Reassure them that AI is a screening tool only — not a final diagnosis — and that many tumors are highly treatable.
- If a user mentions financial difficulty, validate their stress and advise them to ask their doctor about government programs, charity hospitals, or payment plans.

[CONCISENESS RULES]
- Answer STRICTLY what the user asked. Nothing more.
- If user asks "what is X" → give ONLY a 2-3 line definition. No symptoms, no treatment, no next steps unless asked.
- If user asks "what are symptoms of X" → give ONLY symptoms as bullet points.
- If user asks "is it dangerous" → give ONLY a direct 2-3 line answer about danger level.
- If user asks "what are steps to do X" → give ONLY numbered steps as bullet points.
- NEVER add unrequested sections like "What to do next", "Key Facts", "Treatment Options" etc.
- Only suggest a next step or action (like booking an appointment) when it is genuinely relevant to what the user just asked — NOT after every single response.
- Use bullet points when the answer has multiple items (symptoms, steps, options).
- Use short paragraph (2-3 lines max) when the answer is a simple explanation or definition.
- NEVER write long paragraphs when bullet points are cleaner and more readable.

[STRICT GUARDRAILS]
- ONLY answer questions about MedVision AI, brain tumors, MRI scanning, or platform navigation.
- If asked about anything unrelated (recipes, weather, politics, other medical conditions, etc.), politely deflect.
- If the user asks a navigation or "how to" question, answer it directly and cleanly. Do NOT mix in emotional reassurance or medical context unless the user expressed fear in the SAME message.
- Radiologists on MedVision AI are independent reviewers. They access scans through their own Radiology Portal and submit professional reviews independently. Patients cannot directly request a radiologist review — radiologists review scans assigned to them by the platform.


[DATABASE-AWARE RESPONSES]
- If the message contains a "LIVE DATA" section, that data was fetched directly from the database for this specific user.
- Use it to give accurate, specific, clean answers. Never make up scan results or appointment details.
- ALWAYS present database results using standard Markdown list syntax ("- " or "1. "). NEVER use raw inline unicode bullets (•).
- CRITICAL MARKDOWN RULE: Every single list item MUST start on a brand new line. Do NOT glue multiple records onto one horizontal line.
- For scans, output strictly in this vertically stacked format:
  1. **Scan #1:** Result: [Value] | Confidence: [Value] | Detected: [Value] | Date: [Value]
  2. **Scan #2:** Result: [Value] | Confidence: [Value] | Detected: [Value] | Date: [Value]
- For appointments, output strictly in this vertically stacked format:
  1. **Appointment #1:** Doctor: [Name] | Date: [Date] | Status: [Status] | Fee: [Fee] | Clinic: [Clinic]
  2. **Appointment #2:** Doctor: [Name] | Date: [Date] | Status: [Status] | Fee: [Fee] | Clinic: [Clinic]
- For stats: show each stat on a brand new line formatted as: "- **[Stat Label]:** [Value]"
- Keep the response SHORT — show the data cleanly then add ONE line of guidance maximum.
- If no data is found, politely inform the user and guide them to the relevant page in ONE line.
- If a DB query was attempted but the user is not logged in, politely tell them to log in first in ONE line.
`

// ==========================================
// MAIN POST HANDLER
// ==========================================
export async function POST(req: Request) {
  try {
    const {
      message,
      username,
      userRole,
      token,
      history,
    } = await req.json();

    if (!message || !message.trim()) {
      return NextResponse.json(
        { error: "Message cannot be empty." },
        { status: 400 }
      );
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "API key not configured." },
        { status: 503 }
      );
    }

    // ── Step 1: Detect Intent (rule-based, no API call) ────
    const intent = detectIntent(message, userRole || "");

    console.log("=== CHATBOT DEBUG ===");
    console.log("Message:", message);
    console.log("UserRole:", userRole);
    console.log("Token received:", token ? "YES" : "NO");
    console.log("Intent:", intent);
    console.log("====================");

    // ── Step 2: DB intents that require auth ───────────────
    const DB_INTENTS = [
      "GET_MY_SCANS",
      "GET_LATEST_SCAN",
      "GET_MY_APPOINTMENTS",
      "GET_PATIENT_SCANS",
      "GET_MY_SCHEDULE",
      "GET_PENDING_REVIEWS",
      "GET_SYSTEM_STATS",
      "ADMIN_SEARCH",
      "GET_DOCTOR_STATS", // ADD THIS
      "GET_ALL_SCANS",
      "GET_ALL_APPOINTMENTS",
    ];

    let dbContext = "";

    if (DB_INTENTS.includes(intent)) {
      if (!token) {
        dbContext = "AUTH_REQUIRED";
      } else {
        const authUser = verifyToken(token);
        if (!authUser) {
          dbContext = "AUTH_REQUIRED";
        } else {
          const roleGuardFailed =
            (intent === "GET_PATIENT_SCANS" && authUser.role !== "doctor") ||
            (intent === "GET_MY_SCHEDULE" && authUser.role !== "doctor") ||
            (intent === "GET_PENDING_REVIEWS" && authUser.role !== "radiologist") ||
            (intent === "GET_SYSTEM_STATS" && authUser.role !== "admin") ||
            (intent === "ADMIN_SEARCH" && authUser.role !== "admin");

          if (roleGuardFailed) {
            dbContext = "ROLE_UNAUTHORIZED";
          } else {
            try {
              dbContext = await fetchDbContext(intent, authUser, message);
            } catch (dbError) {
              console.error("DB fetch error:", dbError);
              dbContext = "DB_ERROR";
            }
          }
        }
      }
    }

    // ── Step 3: Build user message with context ────────────
    let userContent = `User (${username}) asks: ${message}`;

    if (dbContext === "AUTH_REQUIRED") {
      userContent += `\n\nSYSTEM NOTE: This question requires database access but the user is not logged in. Politely tell them to log in first to access their personal data.`;
    } else if (dbContext === "ROLE_UNAUTHORIZED") {
      userContent += `\n\nSYSTEM NOTE: The user's role (${userRole}) does not have permission to access this data. Politely inform them.`;
    } else if (dbContext === "DB_ERROR") {
      userContent += `\n\nSYSTEM NOTE: There was a database error fetching this data. Apologize and ask them to try again.`;
    } else if (dbContext) {
      userContent += `\n\nLIVE DATA FROM DATABASE:\n${dbContext}`;
    }

    // ── Step 4: Call Claude with history + context ─────────
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 1024,
        system: SYSTEM_PROMPT,
        messages: [
          ...(history && history.length > 0
            ? history.map((msg: { role: string; text: string }) => ({
              role: msg.role === "bot" ? "assistant" : "user",
              content: msg.text,
            }))
            : []),
          { role: "user", content: userContent },
        ],
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("Anthropic API error:", errText);
      return NextResponse.json(
        { error: "AI service unavailable." },
        { status: 502 }
      );
    }

    const data = await response.json();
    const reply = data.content
      .map((item: any) => (item.type === "text" ? item.text : ""))
      .join("")
      .trim();

    return NextResponse.json({ reply, intent });

  } catch (error: any) {
    console.error("CHATBOT ERROR:", error);
    return NextResponse.json(
      { error: "Failed to connect to MedVision AI chatbot." },
      { status: 500 }
    );
  }
}