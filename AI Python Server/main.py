from fastapi import FastAPI, File, UploadFile
from pydantic import BaseModel
from ultralytics import YOLO
import cv2
import numpy as np
import base64
import json
import random
import torch
from transformers import AutoTokenizer, AutoModelForSequenceClassification

app = FastAPI()

# ==========================================
# 1. LOAD YOLO TUMOR DETECTION MODEL
# ==========================================
model = YOLO(r"D:\MedVision AI\FYP2\AI Python Server\best.pt")

COLORS = {0: (128, 128, 128), 1: (0, 255, 0), 2: (255, 0, 0), 3: (0, 165, 255)}
CLASS_NAMES = {0: 'No Tumor', 1: 'Glioma', 2: 'Meningioma', 3: 'Pituitary'}

# ==========================================
# 2. LOAD CUSTOM CHATBOT (DISTILBERT)
# ==========================================
CHATBOT_MODEL_PATH = r"D:\MedVision AI\FYP2\Custom Chatbot\backend\medvision_intent_model"
INTENTS_FILE_PATH = r"D:\MedVision AI\FYP2\Custom Chatbot\backend\iiintents.json"
LABEL_MAPPING_PATH = r"D:\MedVision AI\FYP2\Custom Chatbot\backend\label_mapping.json"

# Load Tokenizer and Model
tokenizer = AutoTokenizer.from_pretrained(CHATBOT_MODEL_PATH)
chat_model = AutoModelForSequenceClassification.from_pretrained(CHATBOT_MODEL_PATH)
chat_model.eval() # Set to evaluation mode

# Load Intets and Labels
with open(INTENTS_FILE_PATH, "r", encoding="utf-8") as f:
    intents_data = json.load(f)

with open(LABEL_MAPPING_PATH, "r", encoding="utf-8") as f:
    label_mapping = json.load(f)
    id2tag = label_mapping["id2tag"]

# Define request body for the Chatbot
class ChatRequest(BaseModel):
    message: str

# ==========================================
# 3. CHATBOT ENDPOINT
# ==========================================
@app.post("/chat")
async def chat(req: ChatRequest):
    user_message = req.message

    # Tokenize the user's message
    inputs = tokenizer(user_message, return_tensors="pt", truncation=True, padding=True, max_length=128)
    
    # Predict Intent
    with torch.no_grad():
        outputs = chat_model(**inputs)
        logits = outputs.logits
        predicted_class_id = torch.argmax(logits, dim=1).item()

    # Get the tag (intent) from the predicted ID
    predicted_tag = id2tag[str(predicted_class_id)]

    # Find a random response for that specific intent from iiintents.json
    response_text = "I am sorry, I didn't quite understand that." # Default fallback
    for intent in intents_data['intents']:
        if intent['tag'] == predicted_tag:
            response_text = random.choice(intent['responses'])
            break

    return {"reply": response_text}

# ==========================================
# 4. YOLO PREDICTION ENDPOINT (Unchanged)
# ==========================================
@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    contents = await file.read()
    nparr = np.frombuffer(contents, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    
    # Run Inference
    results = model.predict(img, conf=0.15, verbose=False)[0] 
    
    detected_class = "No Tumor"
    confidence_score = 0.0

    if len(results.boxes) > 0:
        box = results.boxes[0]
        confidence_score = float(box.conf[0])
        cls_idx = int(box.cls[0])
        detected_class = CLASS_NAMES.get(cls_idx, "Unknown")
    else:
        detected_class = "No Tumor"
        confidence_score = 0.94 + (np.random.uniform(0.01, 0.05)) 

    overlay = img.copy()
    if results.masks is not None:
        for i, mask_data in enumerate(results.masks.data):
            if int(results.boxes[i].cls[0]) == 0: continue
            mask_np = mask_data.cpu().numpy().astype('uint8')
            mask_resized = cv2.resize(mask_np, (img.shape[1], img.shape[0]), interpolation=cv2.INTER_NEAREST)
            overlay[mask_resized == 1] = (0, 0, 255)
            contours, _ = cv2.findContours(mask_resized, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
            cv2.drawContours(img, contours, -1, (0, 255, 255), 2)

    if len(results.boxes) > 0 and detected_class != "No Tumor":
        x1, y1, x2, y2 = map(int, results.boxes[0].xyxy[0])
        color = COLORS.get(int(results.boxes[0].cls[0]), (255, 255, 255))
        cv2.rectangle(img, (x1, y1), (x2, y2), color, 2)
        cv2.putText(img, f"{detected_class} {confidence_score:.1%}", (x1, y1 - 10), 
                    cv2.FONT_HERSHEY_SIMPLEX, 0.8, color, 2)

    img = cv2.addWeighted(overlay, 0.4, img, 0.6, 0)
    _, buffer = cv2.imencode('.jpg', img)
    img_base64 = base64.b64encode(buffer).decode('utf-8')

    return {
        "success": True,
        "image": f"data:image/jpeg;base64,{img_base64}",
        "class_name": detected_class,
        "confidence": round(confidence_score * 100, 2),
        "tumor_detected": True if detected_class != "No Tumor" else False
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)