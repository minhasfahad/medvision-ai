# 🧠 MedVision AI
### AI-Powered Brain Tumor Detection & Clinical Workflow Management

MedVision AI is a full-stack healthcare application developed as a final-year capstone project from December 2025 to April 2026. It combines deep learning-based brain tumor detection with clinical workflow management, enabling MRI image analysis, case verification, appointment scheduling, and patient-doctor communication through a unified web application.

The project integrates a Next.js frontend, Node.js backend, and Python FastAPI inference server to connect AI-powered image analysis with practical healthcare workflows.

## ✨ Key Features

- **AI Brain Tumor Detection:** YOLO11-seg for tumor detection and segmentation, with a reported 96.6% IoU on validation data.
- **MRI Pre-validation:** MobileNetV3 classifier to help validate MRI images before AI analysis.
- **Role-Based Access Control:** Separate workflows for Patients, Doctors, Radiologists, and Administrators using JWT and NextAuth.
- **MRI Analysis:** Image upload, prediction results, and tumor segmentation visualization.
- **Clinical Verification:** Automated PDF report generation with a two-stage verification workflow.
- **Appointment Management:** Appointment booking, patient rescheduling, and time-slot selection.
- **Video Consultation:** Integration with Whereby for online consultations.
- **AI Chatbot:** Anthropic Claude API integration with MongoDB-backed data persistence.
- **Cloud Image Storage:** Cloudinary integration for medical image storage.
- **Deployment & Automation:** Vercel frontend deployment, AWS EC2 AI hosting, GitHub Actions CI/CD, and PM2 process management for the Node.js backend.

## 🛠️ Tech Stack

| Category | Technologies |
|---|---|
| Frontend | Next.js, React, TypeScript, Tailwind CSS |
| State Management | Zustand |
| Authentication | NextAuth, JWT |
| Backend | Node.js, Express.js |
| AI Inference | Python, FastAPI |
| Deep Learning | YOLO11-seg, MobileNetV3 |
| Database | MongoDB |
| Image Storage | Cloudinary |
| AI Chatbot | Anthropic Claude API |
| Video Consultation | Whereby |
| Deployment | Vercel, AWS EC2 |
| CI/CD & Process Management | GitHub Actions, PM2 |

## 📸 Screenshots

> **Setup:** Create a folder named `screenshots` in the root of your GitHub repository and upload all 10 images below. GitHub will render them directly in this README.

### 1. Home Page
![MedVision AI Home Page](screenshots/medvision-home.png)

### 2. MRI Image Upload
![MRI Image Upload](screenshots/medvision-upload.png)

### 3. AI Detection Results
![AI Detection Results](screenshots/medvision-results.png)

### 4. Appointment Booking
![Appointment Booking](screenshots/medvision-appointment.png)

### 5. AI Healthcare Chatbot
![AI Healthcare Chatbot](screenshots/medvision-chatbot.png)

### 6. Doctor Dashboard
![Doctor Dashboard](screenshots/medvision-doctor-dashboard.png)

### 7. Pending Case Reviews
![Pending Case Reviews](screenshots/medvision-pending-reviews.png)

### 8. Admin Patient Management
![Admin Patient Management](screenshots/medvision-admin-patients.png)

### 9. Tumor Prediction Visualization
![Tumor Prediction Visualization](screenshots/medvision-prediction.png)

### 10. Radiology Portal
![Radiology Portal](screenshots/medvision-radiology-portal.png)

## 🏗️ System Architecture

MedVision AI uses a multi-service architecture that separates the user interface, application backend, and AI inference pipeline.

```text
User Interfaces
       │
       ▼
Next.js + TypeScript
       │
       ▼
Node.js + Express.js ───────► MongoDB
       │                         │
       │                         └── Application Data
       │
       ├──────────────────────► Cloudinary
       │                         Medical Image Storage
       │
       ▼
Python FastAPI AI Server
       │
       ▼
MobileNetV3 MRI Pre-validation
       │
       ▼
YOLO11-seg Tumor Detection
       │
       ▼
Prediction & Segmentation Results
       │
       ▼
Clinical Review & Verification
```

External integrations include Anthropic Claude API for chatbot functionality and Whereby for video consultations.

## 🚀 Getting Started

### Prerequisites

- Node.js and npm
- Python and pip
- MongoDB or MongoDB Atlas
- Required YOLO11-seg and MobileNetV3 model weights
- Cloudinary and Anthropic API credentials

### 1. Clone the Repository

```bash
git clone <YOUR_REPOSITORY_URL>
cd MedVision-AI
```

### 2. Install Frontend Dependencies

```bash
cd frontend
npm install
npm run dev
```

### 3. Install Backend Dependencies

Open a separate terminal:

```bash
cd backend
npm install
npm run dev
```

### 4. Start the AI Inference Server

Open another terminal:

```bash
cd ai-server
python -m venv venv
```

Activate the virtual environment, then install dependencies:

```bash
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8000
```

**Note:** The directory names and commands above are examples. Adjust them to match your actual repository structure, entry points, and `package.json` scripts.

### 🔑 Environment Variables

Configure the required environment variables in the appropriate frontend, backend, and AI server environment files.

Examples include:

```env
# Backend
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# AI Chatbot
ANTHROPIC_API_KEY=your_anthropic_api_key

# AI Server
YOLO_MODEL_PATH=weights/best.pt
MOBILENET_MODEL_PATH=weights/mri_validator_model.pth
```

Use the actual environment variable names expected by your code. Never commit real API keys, passwords, or production secrets to GitHub.

## ☁️ Deployment

- **Frontend:** Deployed on Vercel.
- **AI Inference Server:** Hosted on AWS EC2.
- **Node.js Backend:** Managed using PM2.
- **CI/CD:** GitHub Actions for configured automation workflows.
- **Image Storage:** Cloudinary.

Ensure production environment variables, CORS policies, API URLs, and access controls are configured correctly for each deployed service.

## 📊 Model Evaluation

The YOLO11-seg model achieved a reported **96.6% Intersection over Union (IoU)** on the validation dataset.

IoU measures the overlap between the predicted segmentation region and the ground-truth region. This result reflects the evaluated validation data and does not establish clinical accuracy or readiness for medical use.

## 📝 Notes

- This project was developed for academic and educational purposes.
- AI predictions are intended for demonstration and research, not as a replacement for professional medical diagnosis.
- Actual API endpoints and repository paths may vary according to the implementation.
- Screenshots should use synthetic or de-identified data to protect patient privacy.

## 👨‍💻 Author

**Fahad Hamza**  
Computer Science Graduate | Full-Stack Developer | AI & Deep Learning Enthusiast

- GitHub: [@minhasfahad](https://github.com/minhasfahad)

**Project:** MedVision AI  
**Duration:** December 2025 – April 2026  
**Type:** Final-Year Capstone Project

---

<p align="center">
  <b>MedVision AI</b><br>
  Integrating Deep Learning, Full-Stack Development, and Healthcare Workflows.
</p>
