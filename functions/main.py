from firebase_functions import firestore_fn, https_fn, options
from firebase_admin import initialize_app, firestore
import google.cloud.firestore
import requests
import json
import os

# Text analysis modules
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
import time

initialize_app()

# Hardcoded Training Dataset mimicking the target requirements
TRAIN_TEXTS = [
    "people need food urgently",
    "people are starving we need rations",
    "starving people",
    "no water available",
    "severe thirst, dehydration",
    "need clean drinking water",
    "injured people need doctor",
    "severe bleeding and unconscious",
    "medical trauma alert"
]
TRAIN_LABELS = [
    "Food", "Food", "Food", 
    "Water", "Water", "Water", 
    "Healthcare", "Healthcare", "Healthcare"
]

# Initialize and train the ML prediction engine inside memory upon Cloud instance cold boot
vectorizer = TfidfVectorizer()
X = vectorizer.fit_transform(TRAIN_TEXTS)

model = LogisticRegression()
model.fit(X, TRAIN_LABELS)

@firestore_fn.on_document_created(document="needs/{needId}")
def categorize_need(event: firestore_fn.Event[firestore_fn.DocumentSnapshot]) -> None:
    """
    Triggered when a new need is requested/uploaded into the 'needs' collection.
    It runs ML NLP categorization instantly on the description.
    """
    if event.data is None:
        return
        
    need_data = event.data.to_dict()
    description = need_data.get("description", "")
    current_category = need_data.get("category", "")
    
    # We only overwrite if it is Unclassified or marked General by default
    if not description or current_category not in ["General", "Unclassified"]:
        return

    # TF-IDF Feature Extraction & Prediction
    print(f"Executing NLP classification on description: '{description}'")
    X_new = vectorizer.transform([description])
    prediction = model.predict(X_new)
    predicted_category = prediction[0]
    
    print(f"ML classified as -> {predicted_category}")
    
    event.data.reference.update({"category": predicted_category})

@https_fn.on_call()
def process_recon_intel(req: https_fn.CallableRequest) -> any:
    """
    Receives compressed base64 image and needId from frontend.
    Calls Gemini API and updates Firestore.
    """
    data = req.data
    need_id = data.get("needId")
    base64_data = data.get("image")
    
    if not need_id or not base64_data:
        raise https_fn.HttpsError(
            code=https_fn.FunctionsErrorCode.INVALID_ARGUMENT,
            message="Missing needId or image data."
        )

    # API call to Gemini
    API_KEY = os.environ.get("GEMINI_API_KEY", "")
    if not API_KEY:
        raise https_fn.HttpsError(
            code=https_fn.FunctionsErrorCode.INTERNAL,
            message="Gemini API key not configured on server."
        )
    prompt = '''Act as a Combat Engineer & Triage Medic. Analyze this disaster image. You MUST output ONLY valid JSON in this exact structure:
{
  "keywords": ["CRITICAL TAG 1", "CRITICAL TAG 2", "CRITICAL TAG 3"],
  "damages": ["bullet 1 describing damages", "bullet 2"],
  "solutions": ["bullet 1 outlining rescue actions", "bullet 2"]
}
Provide exactly 3 overarching, high-impact uppercase tags in the keywords array summarizing the core crisis (e.g. "THERMAL_BREACH", "HEMORRHAGE", "STRUCTURAL_COLLAPSE").
Provide exactly 2 bullet points for damages (max 15 words each), and exactly 2 for solutions (max 15 words each). 
CRITICAL RULE: Vigorously highlight essential tactical nouns within damages and solutions independently by wrapping them in **asterisks**. Do NOT wrap your whole response in markdown code blocks. Just raw JSON.'''

    payload = {
        "contents": [{
            "parts": [
                { "text": prompt },
                { "inlineData": { "mimeType": "image/jpeg", "data": base64_data } }
            ]
        }]
    }
    
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={API_KEY}"
    resp = requests.post(url, headers={'Content-Type': 'application/json'}, json=payload)
    if resp.status_code != 200:
        raise https_fn.HttpsError(
            code=https_fn.FunctionsErrorCode.INTERNAL,
            message=f"Gemini API error: {resp.text}"
        )
        
    result_data = resp.json()
    try:
        vision_intel_raw = result_data['candidates'][0]['content']['parts'][0]['text']
        vision_intel_raw = vision_intel_raw.replace('```json', '').replace('```', '').strip()
        vision_intel = json.loads(vision_intel_raw)
    except Exception as e:
        raise https_fn.HttpsError(
            code=https_fn.FunctionsErrorCode.INTERNAL,
            message=f"Failed to parse Gemini response: {str(e)}"
        )

    # Update Firestore
    db = firestore.client()
    db.collection("needs").document(need_id).update({
        "aiReconIntel": vision_intel,
        "aiReconImage": f"data:image/jpeg;base64,{base64_data}",
        "aiReconTimestamp": google.cloud.firestore.SERVER_TIMESTAMP
    })

    return {"status": "success"}
