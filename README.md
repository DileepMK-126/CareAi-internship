# CareAI — Clinical Intelligence & Care Locator Platform

**CareAI** is a modern, responsive clinical intelligence web application built with **React, Vite, TypeScript, TailwindCSS, FastAPI, and OpenStreetMap Leaflet**. It provides automated medical report parsing, AI-assisted medical imaging analysis, multi-lingual voice assistance, ASHA health worker triage, generic drug affordability estimation, and interactive hospital & diagnostic lab finding.

---

## 🚀 Key Features

- **📍 Healthcare Location Finder**: Manual location search engine (City, Area, Pincode) powered by OpenStreetMap Nominatim and Leaflet.js maps. Locate nearby Hospitals, 24/7 Pharmacies, and Diagnostic Labs with 1-click directions.
- **📄 Medical Report Analysis**: Automatic extraction of structured patient vitals, diagnostic findings, and clinical summaries from uploaded medical PDFs or images.
- **🖼️ Medical Imaging Diagnostics**: AI vision analysis for X-Rays, MRIs, and CT scans with clinical diagnostic risk scoring.
- **🩺 Symptom Checker & Clinical Triage**: Intelligent symptom analyzer providing urgency grading and immediate action recommendations.
- **💊 Prescription Scanner & Drug Interactions**: Scans prescription documents, tracks active medications, and checks pairwise drug-drug contraindications.
- **🗣️ Multilingual Voice Assistant**: Regional voice-enabled healthcare guide supporting 8 Indian languages with offline capability.
- **👩‍⚕️ ASHA Rural Health Worker Support**: Simplified field-ready triage protocol designed for community health workers.
- **💰 Healthcare Affordability Engine**: Treatment cost estimation, PM-JAY government healthcare scheme lookup, and generic medicine alternatives.
- **📊 Population Health Analytics**: District-level epidemiological disease prevalence visualization based on public health data.

---

## 🛠️ Technology Stack

### Frontend
- **Framework**: React 18 + Vite + TypeScript
- **Styling**: TailwindCSS + Custom CSS tokens
- **Mapping**: Leaflet.js + OpenStreetMap + Overpass API
- **Icons**: Lucide React
- **Authentication**: Firebase Authentication (Google OAuth + Email/Password)

### Backend
- **Framework**: FastAPI (Python)
- **AI Core**: Groq API (Llama 3.1 8B) & Clinical Heuristics Engine
- **Document Processing**: PyMuPDF (PDF parsing), Pillow (Image processing)
- **PDF Generation**: ReportLab PDF library

---

## ⚡ Quick Start & Installation

### 1. Backend Setup
```bash
cd backend
python -m venv venv
# On Windows:
.\venv\Scripts\activate
pip install -r requirements.txt
python -m uvicorn backend.main:app --host 127.0.0.1 --port 8000
```

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5180` in your browser.

---

## 🎓 Summer Internship Program (2026)

This project is developed as part of the **Summer Internship Program** at **Presidency School of AI and Advanced Computing, Presidency University**.

### 📋 Program Details

| Parameter | Detail |
| :--- | :--- |
| **Program Title** | Artificial Intelligence & High-Performance Computing |
| **Duration** | 2 Weeks (14 Days) |
| **Credit Hours** | 2 Credits (30 Contact Hours) |
| **Hardware** | **NVIDIA H200 Tensor Core GPU** (141 GB HBM3e, 4.8 TB/s bandwidth) |
| **Location** | GPU Computing Lab (DGL04 / DGL05), Presidency University |
| **Supervisors** | **Dr. Robin Rohit Vincent** (Head AI CoE NVIDIA), **Dr. Shakkeera L** (Associate Dean), **Dr. S. Sivaperumal** (Pro Vice-Chancellor) |

---

## 📜 License & Disclaimers

CareAI is an educational and clinical decision-support tool. It is not a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of a qualified healthcare provider with any medical questions.