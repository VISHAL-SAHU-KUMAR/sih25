from flask import Flask, request, jsonify
from flask_cors import CORS
import json
import os
import joblib
import numpy as np
import pandas as pd
from ml_symptom_analysis import MLSymptomAnalyzer
import traceback

app = Flask(__name__)
CORS(app)  # Enable CORS for React frontend

# Model and data paths
MODEL_DIR = 'models'
BEST_MODEL_PATH = f'{MODEL_DIR}/best_model.pkl'
SYMPTOM_COLUMNS_PATH = f'{MODEL_DIR}/symptom_columns.json'
DISEASE_LIST_PATH = f'{MODEL_DIR}/disease_list.json'
DATASET_PATH = 'database/disease-symptom_dataset.json'

class MedicalSymptomChecker:
    def __init__(self):
        self.model = None
        self.symptom_columns = []
        self.disease_list = []
        self.dataset = {}
        self.analyzer = None
        self.model_info = {}
        
        self.load_all_data()
    
    def load_all_data(self):
        """Load all models and data"""
        try:
            # Load trained model
            if os.path.exists(BEST_MODEL_PATH):
                self.model = joblib.load(BEST_MODEL_PATH)
                print(f"✅ Loaded trained model from {BEST_MODEL_PATH}")
            else:
                print(f"❌ Model not found at {BEST_MODEL_PATH}")
                return False
            
            # Load symptom columns
            if os.path.exists(SYMPTOM_COLUMNS_PATH):
                with open(SYMPTOM_COLUMNS_PATH, 'r') as f:
                    self.symptom_columns = json.load(f)
                print(f"✅ Loaded {len(self.symptom_columns)} symptom columns")
            
            # Load disease list
            if os.path.exists(DISEASE_LIST_PATH):
                with open(DISEASE_LIST_PATH, 'r') as f:
                    self.disease_list = json.load(f)
                print(f"✅ Loaded {len(self.disease_list)} diseases")
            
            # Load JSON dataset
            if os.path.exists(DATASET_PATH):
                with open(DATASET_PATH, 'r') as f:
                    self.dataset = json.load(f)
                print(f"✅ Loaded dataset with {len(self.dataset)} diseases")
            
            # Load model info
            model_info_path = f'{MODEL_DIR}/model_info.json'
            if os.path.exists(model_info_path):
                with open(model_info_path, 'r') as f:
                    self.model_info = json.load(f)
                print(f"✅ Loaded model info")
            
            # Initialize ML analyzer
            self.analyzer = MLSymptomAnalyzer(
                model=self.model,
                symptom_columns=self.symptom_columns,
                disease_list=self.disease_list,
                dataset=self.dataset,
                model_dir=MODEL_DIR
            )
            
            return True
            
        except Exception as e:
            print(f"❌ Error loading data: {e}")
            traceback.print_exc()
            return False

# Initialize the medical system
medical_system = MedicalSymptomChecker()

@app.route('/')
def home():
    """Home endpoint with system information"""
    return jsonify({
        "message": "ML-Based Medical Symptom Checker API",
        "version": "2.0",
        "model_loaded": medical_system.model is not None,
        "model_info": medical_system.model_info,
        "dataset_size": len(medical_system.dataset),
        "total_symptoms": len(medical_system.symptom_columns),
        "total_diseases": len(medical_system.disease_list),
        "endpoints": {
            "analyze": "/analyze",
            "predict": "/predict", 
            "symptoms": "/symptoms",
            "diseases": "/diseases",
            "disease_info": "/disease/<disease_name>",
            "health": "/health"
        }
    })

@app.route('/analyze', methods=['POST'])
def analyze_symptoms():
    """Comprehensive symptom analysis using ML and rule-based approaches"""
    try:
        data = request.json
        print(f"📥 Received analysis request: {data}")
        
        # Validate input
        if not data or 'symptoms' not in data:
            return jsonify({"error": "Symptoms are required"}), 400
        
        symptoms = data.get('symptoms', '').strip()
        age = data.get('age', '')
        gender = data.get('gender', '')
        duration = data.get('duration', '')
        medical_history = data.get('medical_history', '')
        
        if not symptoms:
            return jsonify({"error": "Symptoms cannot be empty"}), 400
        
        if not medical_system.analyzer:
            return jsonify({"error": "Medical analysis system not available"}), 500
        
        # Get comprehensive analysis
        analysis = medical_system.analyzer.comprehensive_analysis(
            symptoms=symptoms,
            age=age,
            gender=gender,
            duration=duration,
            medical_history=medical_history
        )
        
        print(f"✅ Analysis completed successfully")
        return jsonify(analysis)
        
    except Exception as e:
        print(f"❌ Error in analyze_symptoms: {str(e)}")
        traceback.print_exc()
        return jsonify({"error": f"Internal server error: {str(e)}"}), 500

@app.route('/predict', methods=['POST'])
def predict_disease():
    """Direct ML prediction from symptom list"""
    try:
        data = request.json
        
        if not data or 'symptoms' not in data:
            return jsonify({"error": "Symptoms list is required"}), 400
        
        symptoms = data.get('symptoms', [])
        if not isinstance(symptoms, list) or not symptoms:
            return jsonify({"error": "Symptoms must be a non-empty list"}), 400
        
        if not medical_system.model:
            return jsonify({"error": "ML model not available"}), 500
        
        # Create feature vector
        feature_vector = medical_system.analyzer.create_feature_vector(symptoms)
        
        # Get prediction and probabilities
        prediction = medical_system.model.predict([feature_vector])[0]
        
        # Get prediction probabilities if available
        probabilities = None
        if hasattr(medical_system.model, 'predict_proba'):
            proba = medical_system.model.predict_proba([feature_vector])[0]
            # Get top 5 predictions with probabilities
            top_indices = np.argsort(proba)[-5:][::-1]
            probabilities = [
                {
                    "disease": medical_system.disease_list[i],
                    "probability": float(proba[i])
                }
                for i in top_indices
            ]
        
        return jsonify({
            "prediction": prediction,
            "confidence": float(max(proba)) if probabilities else None,
            "top_predictions": probabilities,
            "input_symptoms": symptoms,
            "matched_features": sum(feature_vector)
        })
        
    except Exception as e:
        print(f"❌ Error in predict_disease: {str(e)}")
        return jsonify({"error": f"Prediction error: {str(e)}"}), 500

@app.route('/symptoms', methods=['GET'])
def get_symptoms():
    """Get all available symptoms"""
    try:
        symptoms_data = []
        for i, symptom in enumerate(medical_system.symptom_columns):
            clean_symptom = symptom.replace('_', ' ')
            symptoms_data.append({
                "id": i + 1,
                "symptom_name": clean_symptom,
                "original_name": symptom,
                "category": "medical"
            })
        
        return jsonify({
            "symptoms": symptoms_data,
            "total": len(symptoms_data)
        })
        
    except Exception as e:
        print(f"❌ Error in get_symptoms: {str(e)}")
        return jsonify({"error": "Error retrieving symptoms"}), 500

@app.route('/diseases', methods=['GET'])
def get_diseases():
    """Get all available diseases with basic information"""
    try:
        diseases_data = []
        
        # Load additional info if available
        descriptions = {}
        precautions = {}
        
        desc_path = f'{MODEL_DIR}/symptom_descriptions.json'
        if os.path.exists(desc_path):
            with open(desc_path, 'r') as f:
                descriptions = json.load(f)
        
        prec_path = f'{MODEL_DIR}/precautions.json'
        if os.path.exists(prec_path):
            with open(prec_path, 'r') as f:
                precautions = json.load(f)
        
        for i, disease in enumerate(medical_system.disease_list):
            disease_info = {
                "id": i + 1,
                "disease_name": disease,
                "description": descriptions.get(disease, "No description available"),
                "has_precautions": disease in precautions
            }
            
            # Add symptoms if available in dataset
            if disease in medical_system.dataset:
                disease_info["common_symptoms"] = medical_system.dataset[disease][:5]  # Top 5 symptoms
                disease_info["total_symptoms"] = len(medical_system.dataset[disease])
            
            diseases_data.append(disease_info)
        
        return jsonify({
            "diseases": diseases_data,
            "total": len(diseases_data)
        })
        
    except Exception as e:
        print(f"❌ Error in get_diseases: {str(e)}")
        return jsonify({"error": "Error retrieving diseases"}), 500

@app.route('/disease/<disease_name>', methods=['GET'])
def get_disease_info(disease_name):
    """Get detailed information about a specific disease"""
    try:
        if disease_name not in medical_system.disease_list:
            return jsonify({"error": "Disease not found"}), 404
        
        disease_info = {"disease_name": disease_name}
        
        # Load all available information
        info_files = {
            'description': f'{MODEL_DIR}/symptom_descriptions.json',
            'precautions': f'{MODEL_DIR}/precautions.json',
            'severity': f'{MODEL_DIR}/symptom_severity.json'
        }
        
        for key, file_path in info_files.items():
            if os.path.exists(file_path):
                with open(file_path, 'r') as f:
                    data = json.load(f)
                    if key == 'precautions' and disease_name in data:
                        disease_info[key] = data[disease_name]
                    elif key != 'precautions' and disease_name in data:
                        disease_info[key] = data[disease_name]
        
        # Add symptoms from dataset
        if disease_name in medical_system.dataset:
            disease_info["symptoms"] = medical_system.dataset[disease_name]
        
        return jsonify(disease_info)
        
    except Exception as e:
        print(f"❌ Error getting disease info: {str(e)}")
        return jsonify({"error": "Error retrieving disease information"}), 500

@app.route('/health', methods=['GET'])
def health_check():
    """Enhanced health check with system status"""
    try:
        status = {
            "status": "healthy",
            "model_loaded": medical_system.model is not None,
            "dataset_loaded": len(medical_system.dataset) > 0,
            "analyzer_ready": medical_system.analyzer is not None,
            "total_diseases": len(medical_system.disease_list),
            "total_symptoms": len(medical_system.symptom_columns),
            "model_info": medical_system.model_info
        }
        
        # Check if all critical components are loaded
        if not all([
            medical_system.model,
            medical_system.symptom_columns,
            medical_system.disease_list,
            medical_system.analyzer
        ]):
            status["status"] = "degraded"
            status["message"] = "Some components not loaded properly"
        
        return jsonify(status)
        
    except Exception as e:
        return jsonify({
            "status": "unhealthy",
            "error": str(e)
        }), 500

@app.route('/retrain', methods=['POST'])
def retrain_model():
    """Endpoint to trigger model retraining (if needed)"""
    try:
        # This would trigger the training script
        # For now, just return a message
        return jsonify({
            "message": "Model retraining not implemented in this version",
            "suggestion": "Run the model training script manually"
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    print("🏥 ML-Based Medical Symptom Checker API")
    print("=" * 50)
    
    if medical_system.model is None:
        print("❌ CRITICAL: ML model not loaded!")
        print("Please run the training script first:")
        print("python model_trainer.py")
    else:
        print(f"✅ System ready!")
        print(f"📊 Model: {medical_system.model_info.get('best_model', 'Unknown')}")
        print(f"🏥 Diseases: {len(medical_system.disease_list)}")
        print(f"🩺 Symptoms: {len(medical_system.symptom_columns)}")
    
    print("\n🚀 Starting server...")
    print("API endpoints available at:")
    print("- http://localhost:5000 (info)")
    print("- http://localhost:5000/analyze (symptom analysis)")
    print("- http://localhost:5000/predict (direct ML prediction)")
    print("- http://localhost:5000/health (health check)")
    
    app.run(debug=True, host='0.0.0.0', port=5000)