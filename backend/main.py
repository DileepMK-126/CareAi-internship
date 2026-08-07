import os
import sys
import uuid
import logging
from datetime import datetime, timezone
from typing import Optional, List

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

env_path = os.path.join(os.path.dirname(__file__), '.env')
if os.path.exists(env_path):
    with open(env_path, 'r') as f:
        for line in f:
            line = line.strip()
            if line and (not line.startswith('#')) and ('=' in line):
                key, val = line.split('=', 1)
                os.environ[key.strip()] = val.strip()
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.responses import Response
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
try:
    from PyPDF2 import PdfReader
    PYPDF2_AVAILABLE = True
except ImportError:
    PYPDF2_AVAILABLE = False
try:
    from docx import Document as DocxDocument
    DOCX_AVAILABLE = True
except ImportError:
    DOCX_AVAILABLE = False

def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()

def now_date() -> str:
    return datetime.now(timezone.utc).strftime('%Y-%m-%d')

def extract_text_from_file(content: bytes, ext: str, filename: str) -> str:
    if ext == '.txt':
        try:
            return content.decode('utf-8', errors='replace')
        except Exception:
            return ''
    if ext == '.pdf' and PYPDF2_AVAILABLE:
        try:
            import io
            reader = PdfReader(io.BytesIO(content))
            pages = [page.extract_text() or '' for page in reader.pages]
            extracted = '\n'.join(pages).strip()
            if extracted:
                return extracted
        except Exception as e:
            logger.warning(f'PyPDF2 extraction failed for {filename}: {e}')
    if ext == '.docx' and DOCX_AVAILABLE:
        try:
            import io
            doc = DocxDocument(io.BytesIO(content))
            return '\n'.join([p.text for p in doc.paragraphs if p.text.strip()])
        except Exception as e:
            logger.warning(f'python-docx extraction failed for {filename}: {e}')
    try:
        decoded = content.decode('utf-8', errors='replace')
        if decoded.strip():
            return decoded
    except Exception:
        pass
    return ''
from backend.database.db import DatabaseManager
from backend.engines import ai_engines
UPLOAD_DIR = os.path.join(os.path.dirname(__file__), 'uploads')
REPORTS_DIR = os.path.join(UPLOAD_DIR, 'reports')
PRESCRIPTIONS_DIR = os.path.join(UPLOAD_DIR, 'prescriptions')
IMAGES_DIR = os.path.join(UPLOAD_DIR, 'medical_images')
PROFILE_DIR = os.path.join(UPLOAD_DIR, 'profile_photos')
for directory in [REPORTS_DIR, PRESCRIPTIONS_DIR, IMAGES_DIR, PROFILE_DIR]:
    os.makedirs(directory, exist_ok=True)
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger('main')
app = FastAPI(title='CareAI API', description='Production-ready healthcare API supporting report uploads, diagnostics prediction, and clinical Q&A.', version='1.0.0')
app.add_middleware(CORSMiddleware, allow_origins=['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175', 'http://localhost:5176', 'http://localhost:5177', 'http://localhost:5178', 'http://localhost:5179', 'http://localhost:5180', 'http://localhost:5181', 'http://localhost:5182', 'http://localhost:3000'], allow_credentials=True, allow_methods=['*'], allow_headers=['*'])

class ChatQuery(BaseModel):
    query: str
    report_text: Optional[str] = None

class SymptomQuery(BaseModel):
    symptoms: str

class RiskParams(BaseModel):
    age: int = Field(..., ge=1, le=120)
    systolic_bp: int = Field(..., ge=60, le=250)
    cholesterol: int = Field(..., ge=80, le=500)
    bmi: float = Field(..., ge=10.0, le=60.0)
    smoker: bool = False
    patient_name: str = 'Unknown'

@app.get('/')
def health_check():
    return {'status': 'healthy', 'service': 'CareAI Platform API'}

@app.post('/api/reports/upload')
async def upload_report(file: UploadFile=File(...), user_id: str=Form(...)):
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in ['.pdf', '.docx', '.txt', '.png', '.jpg', '.jpeg']:
        raise HTTPException(status_code=400, detail='Unsupported file format.')
    doc_id = str(uuid.uuid4())
    filename = f'{doc_id}{ext}'
    save_path = os.path.join(REPORTS_DIR, filename)
    try:
        content = await file.read()
        with open(save_path, 'wb') as f:
            f.write(content)
    except Exception as e:
        logger.error(f'Failed to save uploaded report: {e}')
        raise HTTPException(status_code=500, detail='Local storage save failure.')
    raw_text = extract_text_from_file(content, ext, file.filename or 'upload')
    if not raw_text.strip():
        logger.warning(f'No text extracted from {file.filename}. Groq will still attempt analysis.')
    analysis_data = ai_engines.parse_medical_report(raw_text)
    report_record = {'id': doc_id, 'user_id': user_id, 'filename': file.filename, 'local_path': save_path, 'upload_date': now_date(), 'upload_timestamp': now_iso(), 'file_type': ext.replace('.', '').upper()}
    DatabaseManager.insert('reports', doc_id, report_record)
    DatabaseManager.insert('analysis_results', doc_id, {**analysis_data, 'id': doc_id, 'user_id': user_id})
    return {'message': 'Report uploaded successfully.', 'report': report_record, 'analysis': analysis_data}

@app.get('/api/reports')
def get_user_reports(user_id: str):
    return DatabaseManager.get_all('reports', {'user_id': user_id})

@app.get('/api/reports/{doc_id}/analysis')
def get_report_analysis(doc_id: str):
    analysis = DatabaseManager.get('analysis_results', doc_id)
    if not analysis:
        raise HTTPException(status_code=404, detail='Analysis records not found.')
    return analysis

@app.delete('/api/reports/{doc_id}')
def delete_report(doc_id: str):
    report = DatabaseManager.get('reports', doc_id)
    if report:
        path = report.get('local_path')
        if path and os.path.exists(path):
            os.remove(path)
        DatabaseManager.delete('reports', doc_id)
        DatabaseManager.delete('analysis_results', doc_id)
        return {'message': 'Report deleted successfully.'}
    raise HTTPException(status_code=404, detail='Document not found.')

@app.post('/api/chat')
def run_chat(payload: ChatQuery, user_id: str):
    answer = ai_engines.run_rag_query(payload.query, payload.report_text)
    chat_id = str(uuid.uuid4())
    record = {'id': chat_id, 'user_id': user_id, 'query': payload.query, 'answer': answer, 'timestamp': now_iso()}
    DatabaseManager.insert('chat_history', chat_id, record)
    return record

@app.get('/api/chat/history')
def get_chat_history(user_id: str):
    return DatabaseManager.get_all('chat_history', {'user_id': user_id})

@app.post('/api/imaging/classify')
async def run_imaging(file: UploadFile=File(...), modality: str=Form('xray'), user_id: str=Form(...)):
    if not file.content_type.startswith('image/'):
        raise HTTPException(status_code=400, detail='Uploaded file is not a valid image.')
    image_id = str(uuid.uuid4())
    ext = os.path.splitext(file.filename)[1].lower()
    filename = f'{image_id}{ext}'
    save_path = os.path.join(IMAGES_DIR, filename)
    try:
        content = await file.read()
        with open(save_path, 'wb') as f:
            f.write(content)
    except Exception as e:
        logger.error(f'Failed to save image file: {e}')
        raise HTTPException(status_code=500, detail='Failed to save image locally.')
    predictions = ai_engines.classify_medical_image(content, modality)
    record = {'id': image_id, 'user_id': user_id, 'filename': file.filename, 'local_path': save_path, 'modality': modality, 'prediction': predictions['prediction'], 'confidence_score': predictions['confidence_score'], 'xai_heatmap_grid': predictions['xai_heatmap_grid'], 'guidelines': predictions['clinical_guidelines'], 'date': now_date(), 'timestamp': now_iso()}
    DatabaseManager.insert('medical_images', image_id, record)
    return record

@app.get('/api/imaging')
def get_user_images(user_id: str):
    return DatabaseManager.get_all('medical_images', {'user_id': user_id})

@app.post('/api/prescriptions/upload')
async def upload_prescription(file: UploadFile=File(...), user_id: str=Form(...)):
    presc_id = str(uuid.uuid4())
    ext = os.path.splitext(file.filename)[1].lower()
    filename = f'{presc_id}{ext}'
    save_path = os.path.join(PRESCRIPTIONS_DIR, filename)
    try:
        content = await file.read()
        with open(save_path, 'wb') as f:
            f.write(content)
    except Exception as e:
        logger.error(f'Failed to save prescription: {e}')
        raise HTTPException(status_code=500, detail='Local storage save failure.')
    presc_content = content
    presc_text = extract_text_from_file(presc_content, ext, file.filename or 'prescription')
    meds = ai_engines.parse_prescription_medications(presc_text)
    record = {'id': presc_id, 'user_id': user_id, 'filename': file.filename, 'local_path': save_path, 'medications': meds, 'date': now_date(), 'timestamp': now_iso()}
    DatabaseManager.insert('prescriptions', presc_id, record)
    return record

@app.get('/api/prescriptions')
def get_user_prescriptions(user_id: str):
    return DatabaseManager.get_all('prescriptions', {'user_id': user_id})

@app.post('/api/predict-risk')
def calculate_risk(payload: RiskParams, user_id: str):
    age_factor = (payload.age - 30) * 0.15
    bp_factor = (payload.systolic_bp - 120) * 0.25
    chol_factor = (payload.cholesterol - 200) * 0.1
    bmi_factor = (payload.bmi - 22.0) * 0.2
    smoker_factor = 2.0 if payload.smoker else 0.0
    raw_heart_score = age_factor + bp_factor + chol_factor + bmi_factor + smoker_factor
    heart_risk = 'High Risk' if raw_heart_score > 6.0 else 'Moderate Risk' if raw_heart_score > 3.0 else 'Low Risk'
    diabetes_score = age_factor * 0.8 + bmi_factor * 1.5
    diabetes_risk = 'High Risk' if diabetes_score > 5.0 else 'Moderate Risk' if diabetes_score > 2.5 else 'Low Risk'
    hypertension_score = age_factor * 0.5 + bp_factor * 1.8
    hypertension_risk = 'High Risk' if hypertension_score > 4.5 else 'Moderate Risk' if hypertension_score > 2.0 else 'Low Risk'
    risk_id = str(uuid.uuid4())
    record = {'id': risk_id, 'user_id': user_id, 'date': now_date(), 'timestamp': now_iso(), 'scores': {'Heart Disease': heart_risk, 'Diabetes': diabetes_risk, 'Hypertension': hypertension_risk}, 'indicators': {'age': payload.age, 'sbp': payload.systolic_bp, 'chol': payload.cholesterol, 'bmi': payload.bmi, 'smoker': payload.smoker}}
    DatabaseManager.insert('risk_predictions', risk_id, record)
    return record

@app.get('/api/predict-risk/history')
def get_risk_history(user_id: str):
    return DatabaseManager.get_all('risk_predictions', {'user_id': user_id})

@app.post('/api/symptoms')
def check_symptoms(payload: SymptomQuery, user_id: str):
    res = ai_engines.check_symptoms(payload.symptoms)
    symptom_id = str(uuid.uuid4())
    record = {'id': symptom_id, 'user_id': user_id, 'date': now_date(), 'timestamp': now_iso(), **res}
    DatabaseManager.insert('symptoms', symptom_id, record)
    return record

@app.get('/api/symptoms/history')
def get_symptoms_history(user_id: str):
    return DatabaseManager.get_all('symptoms', {'user_id': user_id})

@app.get('/api/reports/{doc_id}/pdf')
def export_pdf_report(doc_id: str):
    analysis = DatabaseManager.get('analysis_results', doc_id)
    if not analysis:
        raise HTTPException(status_code=404, detail='Analysis not available for the requested report.')
    pdf_bytes = ai_engines.generate_pdf_report(doc_id, analysis)
    return Response(content=pdf_bytes, media_type='application/pdf', headers={'Content-Disposition': f'attachment; filename=careai_report_{doc_id}.pdf'})

class DrugInteractionQuery(BaseModel):
    medications: str

class FoodDrugQuery(BaseModel):
    medication: str
    foods: str

class HealthRiskProfileV5(BaseModel):
    age: int
    gender: str
    weight_kg: float
    height_cm: float
    smoker: bool = False
    alcohol: str = 'none'
    exercise: str = 'sedentary'
    family_history: str = ''
    existing_conditions: str = ''

class BMIQuery(BaseModel):
    weight_kg: float
    height_cm: float
    age: int
    gender: str

class MoodEntry(BaseModel):
    mood_score: int
    emotions: str
    notes: str = ''
    user_id: str

class MealAnalysisQuery(BaseModel):
    meal_description: str

class MealPlanQuery(BaseModel):
    condition: str
    dietary_preferences: str = 'vegetarian'
    duration_days: int = 7

class SecondOpinionQuery(BaseModel):
    primary_diagnosis: str
    symptoms: str
    lab_results: str = ''
    medications: str = ''

class DifferentialQuery(BaseModel):
    symptoms: str
    age: int
    gender: str

class EmergencyQuery(BaseModel):
    emergency_type: str
    context: str = ''

class MedReminderCreate(BaseModel):
    drug: str
    dosage: str
    frequency: str
    instructions: str = ''
    user_id: str

@app.post('/api/drug-interactions')
def check_drug_interactions(payload: DrugInteractionQuery):
    result = ai_engines.check_drug_interactions(payload.medications)
    return {'result': result, 'medications': payload.medications}

@app.post('/api/food-drug-interactions')
def check_food_drug_interactions(payload: FoodDrugQuery):
    result = ai_engines.check_food_drug_interactions(payload.medication, payload.foods)
    return {'result': result}

@app.post('/api/health-risk-v5')
def health_risk_v5(payload: HealthRiskProfileV5):
    profile = payload.dict()
    result = ai_engines.calculate_health_risk_score_v5(profile)
    return {'result': result, 'profile': profile}

@app.post('/api/bmi-advice')
def bmi_advice(payload: BMIQuery):
    result = ai_engines.calculate_bmi_with_advice(payload.weight_kg, payload.height_cm, payload.age, payload.gender)
    return {'result': result}

@app.post('/api/mood/log')
def log_mood(payload: MoodEntry):
    result = ai_engines.log_mood_entry_v5(payload.mood_score, payload.emotions, payload.notes)
    entry_id = str(uuid.uuid4())
    record = {'id': entry_id, 'user_id': payload.user_id, 'mood_score': payload.mood_score, 'emotions': payload.emotions, 'notes': payload.notes, 'ai_support': result, 'timestamp': now_iso()}
    DatabaseManager.insert('mood_logs', entry_id, record)
    return record

@app.get('/api/mood/history')
def get_mood_history(user_id: str):
    return DatabaseManager.get_all('mood_logs', {'user_id': user_id})

@app.post('/api/nutrition/analyze-meal')
def analyze_meal(payload: MealAnalysisQuery):
    result = ai_engines.analyze_meal_nutrition(payload.meal_description)
    return {'result': result}

@app.post('/api/nutrition/meal-plan')
def create_meal_plan(payload: MealPlanQuery):
    result = ai_engines.generate_condition_meal_plan(payload.condition, payload.dietary_preferences, payload.duration_days)
    return {'result': result, 'condition': payload.condition}

@app.post('/api/medications')
def add_medication_reminder(payload: MedReminderCreate):
    med_id = str(uuid.uuid4())
    record = {'id': med_id, 'user_id': payload.user_id, 'drug': payload.drug, 'dosage': payload.dosage, 'frequency': payload.frequency, 'instructions': payload.instructions, 'active': True}
    DatabaseManager.insert('medications', med_id, record)
    return record

@app.get('/api/medications')
def get_medications(user_id: str):
    return DatabaseManager.get_all('medications', {'user_id': user_id})

@app.delete('/api/medications/{med_id}')
def delete_medication(med_id: str):
    DatabaseManager.delete('medications', med_id)
    return {'message': 'Medication reminder deleted.'}

@app.post('/api/second-opinion')
def second_opinion(payload: SecondOpinionQuery):
    result = ai_engines.get_second_opinion(payload.primary_diagnosis, payload.symptoms, payload.lab_results, payload.medications)
    return {'result': result}

@app.post('/api/differential-diagnosis')
def differential_diagnosis(payload: DifferentialQuery):
    result = ai_engines.generate_differential_diagnosis(payload.symptoms, payload.age, payload.gender)
    return {'result': result}

@app.post('/api/emergency/guidance')
def emergency_guidance(payload: EmergencyQuery):
    result = ai_engines.get_emergency_guidance(payload.emergency_type, payload.context)
    return {'result': result}

class CopilotRequest(BaseModel):
    user_id: str
    medications: Optional[List[str]] = None
    last_vitals: Optional[dict] = None

class EmergencyTriageRequest(BaseModel):
    symptoms: List[str]
    user_id: str

class CommandCenterRequest(BaseModel):
    report_text: str
    medications: Optional[List[str]] = None
    user_id: str

@app.post('/api/copilot')
def get_copilot(payload: CopilotRequest):
    result = ai_engines.generate_copilot_recommendations(payload.user_id, payload.medications, payload.last_vitals)
    copilot_id = str(uuid.uuid4())
    record = {'id': copilot_id, 'user_id': payload.user_id, 'recommendations': result, 'timestamp': now_iso(), 'date': now_date()}
    DatabaseManager.insert('copilot_items', copilot_id, record)
    return record

@app.get('/api/copilot')
def get_copilot_latest(user_id: str):
    items = DatabaseManager.get_all('copilot_items', {'user_id': user_id})
    if items:
        items_sorted = sorted(items, key=lambda x: x.get('timestamp', ''), reverse=True)
        return items_sorted[0]
    result = ai_engines.generate_copilot_recommendations(user_id)
    copilot_id = str(uuid.uuid4())
    record = {'id': copilot_id, 'user_id': user_id, 'recommendations': result, 'timestamp': now_iso(), 'date': now_date()}
    DatabaseManager.insert('copilot_items', copilot_id, record)
    return record

@app.post('/api/emergency/triage')
def emergency_triage(payload: EmergencyTriageRequest):
    result = ai_engines.triage_emergency(payload.symptoms)
    event_id = str(uuid.uuid4())
    record = {'id': event_id, 'user_id': payload.user_id, 'symptoms': payload.symptoms, 'triage_result': result, 'timestamp': now_iso(), 'date': now_date()}
    DatabaseManager.insert('emergency_events', event_id, record)
    return {**result, 'event_id': event_id}

@app.get('/api/emergency/triage/history')
def get_emergency_history(user_id: str):
    return DatabaseManager.get_all('emergency_events', {'user_id': user_id})

@app.post('/api/command-center')
def healthcare_command_center(payload: CommandCenterRequest):
    result = ai_engines.run_command_center(payload.report_text, payload.user_id, payload.medications)
    timeline_id = str(uuid.uuid4())
    DatabaseManager.insert('timeline', timeline_id, {'id': timeline_id, 'user_id': payload.user_id, 'event': 'Command Center Pipeline Run', 'summary': result.get('timeline_entry', {}).get('summary', ''), 'date': now_date(), 'timestamp': now_iso()})
    return result

@app.post('/api/command-center/upload')
async def command_center_upload(file: UploadFile=File(...), user_id: str=Form(...), medications: str=Form('')):
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in ['.pdf', '.docx', '.txt']:
        raise HTTPException(status_code=400, detail='Unsupported file format. Use PDF, DOCX, or TXT.')
    content = await file.read()
    report_text = extract_text_from_file(content, ext, file.filename)
    meds_list = [m.strip() for m in medications.split(',') if m.strip()] if medications else []
    result = ai_engines.run_command_center(report_text, user_id, meds_list)
    doc_id = str(uuid.uuid4())
    save_path = os.path.join(REPORTS_DIR, f'{doc_id}{ext}')
    with open(save_path, 'wb') as f:
        f.write(content)
    DatabaseManager.insert('reports', doc_id, {'id': doc_id, 'user_id': user_id, 'filename': file.filename, 'local_path': save_path, 'upload_date': now_date(), 'upload_timestamp': now_iso(), 'file_type': ext.replace('.', '').upper()})
    return {'report_id': doc_id, **result}

class ExtendedForecastRequest(BaseModel):
    profile: dict
    years: int = Field(5, ge=1, le=10)
    user_id: str

class PreventionRequest(BaseModel):
    age: int = Field(40, ge=1, le=120)
    bmi: float = Field(26.0, ge=10.0, le=60.0)
    glucose: float = Field(95.0, ge=50.0, le=600.0)
    hba1c: float = Field(5.8, ge=4.0, le=15.0)
    systolic_bp: int = Field(130, ge=60, le=250)
    total_cholesterol: float = Field(210.0, ge=80.0, le=500.0)
    ldl: float = Field(130.0, ge=30.0, le=400.0)
    hdl: float = Field(45.0, ge=10.0, le=150.0)
    egfr: float = Field(75.0, ge=5.0, le=200.0)
    uric_acid: float = Field(6.5, ge=1.0, le=20.0)
    alt: float = Field(35.0, ge=5.0, le=500.0)
    exercise_days_per_week: int = Field(2, ge=0, le=7)
    smoking: bool = False
    alcohol_units_week: int = Field(0, ge=0, le=70)
    family_history: dict = {}
    user_id: str

class VoiceRequest(BaseModel):
    query: str
    language: str = 'en'
    user_id: str

class RuralTriageRequest(BaseModel):
    symptoms_text: str
    language: str = 'hi'
    village: str = ''
    worker_name: str = ''
    user_id: str

class AffordabilityRequest(BaseModel):
    condition: str
    state: str = 'Maharashtra'
    severity: str = 'Moderate'
    user_id: str

class PopulationRequest(BaseModel):
    state: str = 'All India'
    disease: str = 'diabetes'

class EducatorRequest(BaseModel):
    report_text: str
    level: int = Field(3, ge=1, le=5)
    user_id: str

class XAIRequest(BaseModel):
    prediction_type: str
    input_data: dict
    result: dict
    user_id: str

@app.post('/api/forecast/extended')
def forecast_extended(payload: ExtendedForecastRequest):
    result = ai_engines.extended_health_forecast(payload.profile, payload.years)
    forecast_id = str(uuid.uuid4())
    record = {'id': forecast_id, 'user_id': payload.user_id, 'years': payload.years, 'result': result, 'timestamp': now_iso(), 'date': now_date()}
    DatabaseManager.insert('health_forecasts', forecast_id, record)
    return record

@app.post('/api/prevention-engine')
def prevention_engine(payload: PreventionRequest):
    metrics = payload.dict(exclude={'user_id'})
    result = ai_engines.analyze_prevention_engine(metrics)
    prev_id = str(uuid.uuid4())
    record = {'id': prev_id, 'user_id': payload.user_id, 'metrics': metrics, 'result': result, 'timestamp': now_iso(), 'date': now_date()}
    DatabaseManager.insert('prevention_results', prev_id, record)
    return record

@app.get('/api/prevention-engine/history')
def get_prevention_history(user_id: str):
    return DatabaseManager.get_all('prevention_results', {'user_id': user_id})

@app.get('/api/doctor-visit/{session_id}/pdf')
def doctor_visit_pdf(session_id: str):
    record = DatabaseManager.get_by_id('doctor_sessions', session_id)
    if not record:
        raise HTTPException(status_code=404, detail='Session not found')
    result = record.get('result', {})
    from reportlab.lib.pagesizes import A4
    from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
    from reportlab.lib.styles import getSampleStyleSheet
    from reportlab.lib import colors as rl_colors
    import io as _io
    buf = _io.BytesIO()
    doc = SimpleDocTemplate(buf, pagesize=A4, topMargin=40, bottomMargin=40)
    styles = getSampleStyleSheet()
    story = []
    story.append(Paragraph('CareAI — Consultation Report', styles['Title']))
    story.append(Spacer(1, 12))
    story.append(Paragraph(f"Date: {record.get('date', now_date())}", styles['Normal']))
    story.append(Paragraph(f"Symptoms: {record.get('symptoms', '')}", styles['Normal']))
    story.append(Paragraph(f"Duration: {record.get('duration', '')}", styles['Normal']))
    story.append(Spacer(1, 12))
    if result.get('probable_conditions'):
        story.append(Paragraph('Probable Conditions', styles['Heading2']))
        for c in result['probable_conditions']:
            story.append(Paragraph(f"• {c.get('condition', '')} ({c.get('probability', '')}): {c.get('reasoning', '')}", styles['Normal']))
        story.append(Spacer(1, 8))
    if result.get('consultation_notes'):
        story.append(Paragraph('Clinical Notes', styles['Heading2']))
        story.append(Paragraph(result['consultation_notes'], styles['Normal']))
        story.append(Spacer(1, 8))
    if result.get('red_flags'):
        story.append(Paragraph('Red Flags to Watch', styles['Heading2']))
        for f in result['red_flags']:
            story.append(Paragraph(f'⚠ {f}', styles['Normal']))
        story.append(Spacer(1, 8))
    story.append(Paragraph('DISCLAIMER: This report is AI-generated and does not replace professional medical advice.', styles['Normal']))
    doc.build(story)
    pdf_bytes = buf.getvalue()
    return Response(content=pdf_bytes, media_type='application/pdf', headers={'Content-Disposition': f'attachment; filename=consultation_{session_id[:8]}.pdf'})

@app.post('/api/voice/respond')
def voice_health_respond(payload: VoiceRequest):
    result = ai_engines.generate_voice_health_response(payload.query, payload.language)
    session_id = str(uuid.uuid4())
    record = {'id': session_id, 'user_id': payload.user_id, **result, 'timestamp': now_iso()}
    DatabaseManager.insert('voice_sessions', session_id, record)
    return record

@app.post('/api/rural/triage')
def rural_triage_endpoint(payload: RuralTriageRequest):
    result = ai_engines.run_rural_triage(payload.symptoms_text, payload.language, payload.village, payload.worker_name)
    triage_id = str(uuid.uuid4())
    record = {'id': triage_id, 'user_id': payload.user_id, **result, 'timestamp': now_iso(), 'date': now_date()}
    DatabaseManager.insert('rural_triages', triage_id, record)
    return record

@app.get('/api/rural/triage/history')
def get_rural_triage_history(user_id: str):
    return DatabaseManager.get_all('rural_triages', {'user_id': user_id})

@app.post('/api/affordability/estimate')
def affordability_estimate(payload: AffordabilityRequest):
    result = ai_engines.estimate_treatment_cost(payload.condition, payload.state, payload.severity)
    est_id = str(uuid.uuid4())
    record = {'id': est_id, 'user_id': payload.user_id, **result, 'timestamp': now_iso(), 'date': now_date()}
    DatabaseManager.insert('affordability_estimates', est_id, record)
    return record

@app.get('/api/population/analytics')
def population_analytics(state: str='All India', disease: str='diabetes'):
    return ai_engines.compute_population_analytics(state, disease)

@app.post('/api/population/analytics')
def population_analytics_post(payload: PopulationRequest):
    return ai_engines.compute_population_analytics(payload.state, payload.disease)

@app.post('/api/educator/explain')
def educator_explain(payload: EducatorRequest):
    result = ai_engines.explain_report_by_level(payload.report_text, payload.level)
    edu_id = str(uuid.uuid4())
    record = {'id': edu_id, 'user_id': payload.user_id, **result, 'timestamp': now_iso(), 'date': now_date()}
    DatabaseManager.insert('education_sessions', edu_id, record)
    return record

@app.post('/api/xai/explain')
def xai_explain(payload: XAIRequest):
    result = ai_engines.build_explainable_prediction(payload.prediction_type, payload.input_data, payload.result)
    return {**result, 'user_id': payload.user_id, 'timestamp': now_iso()}

@app.post('/api/audit/log')
def write_audit_log(action: str, user_id: str, details: str=''):
    log_id = str(uuid.uuid4())
    DatabaseManager.insert('audit_logs', log_id, {'id': log_id, 'user_id': user_id, 'action': action, 'details': details, 'timestamp': now_iso(), 'date': now_date()})
    return {'status': 'logged', 'log_id': log_id}

@app.get('/api/audit/log')
def get_audit_log(user_id: str):
    return DatabaseManager.get_all('audit_logs', {'user_id': user_id})