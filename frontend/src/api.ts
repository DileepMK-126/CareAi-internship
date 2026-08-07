const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

async function request(method: string, path: string, body?: any, isForm = false) {
  const opts: RequestInit = { method };
  if (body) {
    if (isForm) {
      opts.body = body;
    } else {
      opts.headers = { "Content-Type": "application/json" };
      opts.body = JSON.stringify(body);
    }
  }
  const res = await fetch(`${API_BASE}${path}`, opts);
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Network error" }));
    throw new Error(err.detail || "Request failed");
  }
  return res.json();
}

const getUserId = (): string => {
  const user = localStorage.getItem("careai_user");
  if (!user) {
    throw new Error("No authenticated user found. Please log in before using CareAI.");
  }
  const parsed = JSON.parse(user);
  if (!parsed?.id) {
    throw new Error("Invalid user profile stored. Please log in again.");
  }
  return parsed.id;
};

const getLocal = (_key: string, defaultVal: any = []) => {
  return defaultVal;
};

const saveLocal = (_key: string, _data: any) => {
  return;
};

export const api = {
  uploadReport: async (file: File) => {
    const form = new FormData();
    form.append("file", file);
    form.append("user_id", getUserId());
    return request("POST", "/api/reports/upload", form, true);
  },

  getReports: async () => {
    return request("GET", `/api/reports?user_id=${getUserId()}`);
  },

  deleteReport: async (id: string) => {
    const reports = getLocal("careai_reports");
    const filtered = reports.filter((r: any) => r.id !== id);
    saveLocal("careai_reports", filtered);

    const analyses = getLocal("careai_analyses", {});
    delete analyses[id];
    saveLocal("careai_analyses", analyses);

    try {
      await request("DELETE", `/api/reports/${id}`);
    } catch {}
    return { message: "Report deleted successfully." };
  },

  getReportAnalysis: async (id: string) => {
    const analyses = getLocal("careai_analyses", {});
    if (analyses[id]) {
      return analyses[id];
    }
    return request("GET", `/api/reports/${id}/analysis`);
  },

  downloadPdf: (id: string) => `${API_BASE}/api/reports/${id}/pdf`,

  sendChat: async (query: string, reportText?: string) => {
    const res = await request("POST", `/api/chat?user_id=${getUserId()}`, { query, report_text: reportText });
    
    const chats = getLocal("careai_chats");
    chats.push({ role: "user", content: query, timestamp: new Date().toISOString() });
    chats.push({ role: "assistant", content: res.reply, timestamp: new Date().toISOString() });
    saveLocal("careai_chats", chats);

    return res;
  },

  getChatHistory: async () => {
    return getLocal("careai_chats");
  },

  classifyImage: async (file: File, modality: string) => {
    const form = new FormData();
    form.append("file", file);
    form.append("modality", modality);
    form.append("user_id", getUserId());
    const res = await request("POST", "/api/imaging/classify", form, true);
    
    const images = getLocal("careai_images");
    images.unshift(res.record);
    saveLocal("careai_images", images);

    return res;
  },

  getImages: async () => {
    return request("GET", `/api/imaging?user_id=${getUserId()}`);
  },

  predictRisk: async (data: object) => {
    const res = await request("POST", `/api/predict-risk?user_id=${getUserId()}`, data);
    
    const risks = getLocal("careai_risks");
    risks.unshift(res.record);
    saveLocal("careai_risks", risks);

    return res;
  },

  getRiskHistory: async () => {
    return request("GET", `/api/predict-risk/history?user_id=${getUserId()}`);
  },

  checkSymptoms: async (symptoms: string) => {
    const res = await request("POST", `/api/symptoms?user_id=${getUserId()}`, { symptoms });
    
    const symptomHistory = getLocal("careai_symptoms");
    symptomHistory.unshift(res.record);
    saveLocal("careai_symptoms", symptomHistory);

    return res;
  },

  getSymptomHistory: async () => {
    return request("GET", `/api/symptoms/history?user_id=${getUserId()}`);
  },

  logMood: async (moodScore: number, emotions: string, notes: string) => {
    const newMood = {
      id: Math.random().toString(36).substr(2, 9),
      mood_score: moodScore,
      emotions,
      notes,
      timestamp: new Date().toISOString()
    };
    const moods = getLocal("careai_moods");
    moods.unshift(newMood);
    saveLocal("careai_moods", moods);
    return newMood;
  },

  getMoodHistory: async () => {
    return request("GET", `/api/mood/history?user_id=${getUserId()}`);
  },

  checkDrugInteractions: (medications: string) =>
    request("POST", "/api/drug-interactions", { medications }),

  checkFoodDrugInteractions: (medication: string, foods: string) =>
    request("POST", "/api/food-drug-interactions", { medication, foods }),

  getSecondOpinion: (primaryDiagnosis: string, symptoms: string, labResults?: string, medications?: string) =>
    request("POST", "/api/second-opinion", { primary_diagnosis: primaryDiagnosis, symptoms, lab_results: labResults || "", medications: medications || "" }),

  getEmergencyGuidance: (emergencyType: string, context?: string) =>
    request("POST", "/api/emergency/guidance", { emergency_type: emergencyType, context: context || "" }),

  healthRiskV5: (profile: object) => request("POST", "/api/health-risk-v5", profile),

  bmiAdvice: (weightKg: number, heightCm: number, age: number, gender: string) =>
    request("POST", "/api/bmi-advice", { weight_kg: weightKg, height_cm: heightCm, age, gender }),

  getCopilot: async () => {
    const localCopilot = getLocal("careai_copilot", null);
    if (localCopilot) return localCopilot;
    return request("GET", `/api/copilot?user_id=${getUserId()}`);
  },

  refreshCopilot: async (medications?: string[], lastVitals?: object) => {
    const res = await request("POST", "/api/copilot", { user_id: getUserId(), medications, last_vitals: lastVitals });
    saveLocal("careai_copilot", res.copilot);
    return res;
  },

  emergencyTriage: async (symptoms: string[]) => {
    const res = await request("POST", "/api/emergency/triage", { symptoms, user_id: getUserId() });
    
    const triageList = getLocal("careai_triages");
    triageList.unshift(res.record);
    saveLocal("careai_triages", triageList);

    return res;
  },

  getEmergencyTriageHistory: async () => {
    return getLocal("careai_triages");
  },

  commandCenter: async (payload: { report_text: string; medications?: string[] }) => {
    const res = await request("POST", "/api/command-center", { ...payload, user_id: getUserId() });
    saveLocal("careai_command_center", res);
    return res;
  },

  commandCenterUpload: async (form: FormData) => {
    const res = await request("POST", "/api/command-center/upload", form, true);
    saveLocal("careai_command_center", res);
    return res;
  },

  preventionEngine: async (metrics: any) => {
    const res = await request("POST", "/api/prevention-engine", { ...metrics, user_id: getUserId() });
    
    const preventions = getLocal("careai_preventions");
    preventions.unshift(res.record);
    saveLocal("careai_preventions", preventions);

    return res;
  },

  getPreventionHistory: async () => {
    return getLocal("careai_preventions");
  },

  voiceRespond: (query: string, language = "en") =>
    request("POST", "/api/voice/respond", { query, language, user_id: getUserId() }),

  ruralTriage: async (payload: { symptoms_text: string; language?: string; village?: string; worker_name?: string }) => {
    const res = await request("POST", "/api/rural/triage", { ...payload, user_id: getUserId() });
    
    const ruralTriages = getLocal("careai_rural_triages");
    ruralTriages.unshift(res.record);
    saveLocal("careai_rural_triages", ruralTriages);

    return res;
  },

  getRuralTriageHistory: async () => {
    return getLocal("careai_rural_triages");
  },

  affordabilityEstimate: (payload: { condition: string; state?: string; severity?: string }) =>
    request("POST", "/api/affordability/estimate", { ...payload, user_id: getUserId() }),

  populationAnalytics: (state = "All India", disease = "diabetes") =>
    request("GET", `/api/population/analytics?state=${encodeURIComponent(state)}&disease=${disease}`),

  educatorExplain: (payload: { report_text: string; level: number }) =>
    request("POST", "/api/educator/explain", { ...payload, user_id: getUserId() }),

  xaiExplain: (payload: { prediction_type: string; input_data: any; result: any }) =>
    request("POST", "/api/xai/explain", { ...payload, user_id: getUserId() }),

  getMedications: async () => {
    return request("GET", `/api/medications?user_id=${getUserId()}`);
  },



  uploadPrescription: async (file: File) => {
    const form = new FormData();
    form.append("file", file);
    form.append("user_id", getUserId());
    const res = await request("POST", "/api/prescriptions/upload", form, true);
    const prescriptions = getLocal("careai_prescriptions");
    prescriptions.unshift(res.prescription);
    saveLocal("careai_prescriptions", prescriptions);
    return res;
  },

  getPrescriptions: async () => {
    return request("GET", `/api/prescriptions?user_id=${getUserId()}`);
  },
};
