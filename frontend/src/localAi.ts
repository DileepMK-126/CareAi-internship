export interface LocalAiResponse {
  answer: string;
  source: "Gemini Nano" | "Local Rule Engine";
}

export const detectLocalAi = (): boolean => {
  return typeof (window as any).ai !== "undefined" || typeof (window as any).translation !== "undefined";
};

export const runLocalAiQuery = async (query: string, contextText?: string): Promise<LocalAiResponse> => {
  const queryLower = query.toLowerCase();

  
  const win = window as any;
  if (win.ai && win.ai.assistant) {
    try {
      const capabilities = await win.ai.assistant.capabilities();
      if (capabilities.available !== "no") {
        const session = await win.ai.assistant.create({
          systemPrompt: "You are a professional medical assistant running locally on the user's device. Keep your answers brief, private, and highly focused."
        });
        const prompt = contextText 
          ? `Patient Context: ${contextText}\n\nUser Question: ${query}` 
          : query;
        const answer = await session.prompt(prompt);
        session.destroy();
        return {
          answer: answer.trim() + "\n\n*Processed locally on-device via built-in Gemini Nano.*",
          source: "Gemini Nano"
        };
      }
    } catch (err) {
      console.warn("Failed to execute query using window.ai, falling back to local clinical rule engine:", err);
    }
  }

  
  let answer = "I am processing your query locally. ";
  
  if (queryLower.includes("cholesterol") || queryLower.includes("ldl")) {
    answer += "Normal cholesterol reference ranges are:\n" +
      "- LDL Cholesterol: < 100 mg/dL (Optimal)\n" +
      "- Total Cholesterol: < 200 mg/dL (Desirable)\n\n" +
      "If your LDL is elevated, clinical recommendations suggest restricting saturated fat intake, consuming soluble fiber, and engaging in regular moderate aerobic exercise. Statins may be considered depending on overall cardiovascular risk assessment.";
  } else if (queryLower.includes("glucose") || queryLower.includes("hba1c") || queryLower.includes("diabetes")) {
    answer += "Standard clinical diagnostic thresholds for glucose metrics:\n" +
      "- Fasting Blood Glucose: 70-99 mg/dL is normal. >= 126 mg/dL indicates diabetes.\n" +
      "- HbA1c: < 5.7% is normal. >= 6.5% confirms diabetes.\n\n" +
      "First-line management usually involves dietary carbohydrate control, physical training, and oral therapies like metformin under clinical guidance.";
  } else if (queryLower.includes("blood pressure") || queryLower.includes("hypertension") || queryLower.includes("bp")) {
    answer += "Blood pressure classification standards:\n" +
      "- Normal: < 120/80 mmHg\n" +
      "- Elevated: 120-129 / < 80 mmHg\n" +
      "- Stage 1 Hypertension: 130-139 / 80-89 mmHg\n\n" +
      "Lowering BP naturally involves sodium restriction (< 1,500mg daily), the DASH diet (high potassium/magnesium), weight management, and stress mitigation.";
  } else {
    answer += "I have received your health-related query. I can analyze metrics like Cholesterol, blood sugar, and blood pressure. For specific symptoms, please navigate to the Symptom Checker or Clinical Second Opinion page for a detailed simulated specialist consultation.\n\n" +
      "Always verify clinical findings with a licensed medical practitioner.";
  }

  return {
    answer: answer + "\n\n*Processed locally on-device. Absolute privacy guaranteed.*",
    source: "Local Rule Engine"
  };
};
