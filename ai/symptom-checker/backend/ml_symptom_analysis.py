import numpy as np
import pandas as pd
import json
import re
from typing import List, Dict, Any, Optional
from difflib import SequenceMatcher
import logging

class MLSymptomAnalyzer:
    """Enhanced ML-powered symptom analysis system"""
    
    def __init__(self, model=None, symptom_columns=None, disease_list=None, dataset=None, model_dir='models'):
        self.model = model
        self.symptom_columns = symptom_columns or []
        self.disease_list = disease_list or []
        self.dataset = dataset or {}
        self.model_dir = model_dir
        
        # Emergency and high-risk symptoms
        self.emergency_symptoms = [
            'chest pain', 'difficulty breathing', 'shortness of breath', 'severe pain',
            'heart attack symptoms', 'stroke symptoms', 'severe bleeding', 'unconsciousness',
            'seizure', 'severe headache', 'vision loss', 'paralysis', 'severe allergic reaction',
            'difficulty swallowing', 'severe abdominal pain', 'high fever over 103'
        ]
        
        self.high_risk_symptoms = [
            'persistent fever', 'severe fatigue', 'blood in stool', 'blood in urine',
            'severe nausea', 'severe vomiting', 'dehydration', 'fainting',
            'rapid weight loss', 'persistent cough with blood', 'severe diarrhea'
        ]
        
        # Age and gender risk factors
        self.age_risk_factors = {
            'elderly': ['heart disease', 'stroke', 'diabetes complications', 'pneumonia'],
            'child': ['meningitis', 'severe dehydration', 'respiratory distress'],
            'adult': ['heart attack', 'appendicitis', 'kidney stones']
        }
        
        self.gender_risk_factors = {
            'female': ['pregnancy complications', 'ovarian issues', 'breast cancer'],
            'male': ['prostate issues', 'heart disease'],
            'other': []
        }
    
    def preprocess_symptoms(self, symptom_text: str) -> List[str]:
        """Extract and clean symptoms from user input"""
        # Convert to lowercase and clean
        symptom_text = symptom_text.lower().strip()
        
        # Split by common separators
        symptoms = re.split(r'[,;]|(?:\s+and\s+)|(?:\s+&\s+)|(?:\s+\+\s+)', symptom_text)
        
        cleaned_symptoms = []
        for symptom in symptoms:
            # Remove common prefixes and suffixes
            symptom = re.sub(r'^(?:i\s+have\s+|i\s+am\s+|experiencing\s+|feeling\s+|my\s+|the\s+)', '', symptom.strip())
            symptom = re.sub(r'\s+(?:for\s+|since\s+|lasting\s+).*$', '', symptom)
            
            if symptom and len(symptom.strip()) > 2:
                cleaned_symptoms.append(symptom.strip())
        
        return list(set(cleaned_symptoms))  # Remove duplicates
    
    def create_feature_vector(self, user_symptoms: List[str]) -> List[int]:
        """Create binary feature vector for ML model"""
        if not self.symptom_columns:
            return []
        
        feature_vector = [0] * len(self.symptom_columns)
        
        for i, model_symptom in enumerate(self.symptom_columns):
            # Clean model symptom for comparison
            clean_model_symptom = model_symptom.replace('_', ' ').lower()
            
            # Check if any user symptom matches
            for user_symptom in user_symptoms:
                similarity = self.calculate_similarity(user_symptom.lower(), clean_model_symptom)
                if similarity > 0.7:  # Threshold for match
                    feature_vector[i] = 1
                    break
        
        return feature_vector
    
    def calculate_similarity(self, symptom1: str, symptom2: str) -> float:
        """Calculate similarity between two symptoms"""
        # Direct substring match
        if symptom1 in symptom2 or symptom2 in symptom1:
            return 1.0
        
        # Sequence matcher
        return SequenceMatcher(None, symptom1, symptom2).ratio()
    
    def get_ml_prediction(self, user_symptoms: List[str]) -> Dict[str, Any]:
        """Get ML model prediction"""
        if not self.model or not self.symptom_columns:
            return {"error": "ML model not available"}
        
        try:
            # Create feature vector
            feature_vector = self.create_feature_vector(user_symptoms)
            
            if sum(feature_vector) == 0:
                return {"error": "No matching symptoms found in model"}
            
            # Get prediction
            prediction = self.model.predict([feature_vector])[0]
            
            # Get prediction probabilities if available
            probabilities = None
            confidence = 0.0
            
            if hasattr(self.model, 'predict_proba'):
                proba = self.model.predict_proba([feature_vector])[0]
                confidence = float(max(proba))
                
                # Get top 5 predictions
                top_indices = np.argsort(proba)[-5:][::-1]
                probabilities = [
                    {
                        "disease": self.disease_list[i] if i < len(self.disease_list) else f"Disease_{i}",
                        "probability": float(proba[i]),
                        "percentage": round(float(proba[i]) * 100, 2)
                    }
                    for i in top_indices if proba[i] > 0.01  # Only show predictions > 1%
                ]
            
            return {
                "primary_prediction": prediction,
                "confidence": confidence,
                "confidence_percentage": round(confidence * 100, 2),
                "top_predictions": probabilities or [],
                "matched_symptoms_count": sum(feature_vector),
                "total_symptoms_checked": len(self.symptom_columns)
            }
            
        except Exception as e:
            logging.error(f"ML prediction error: {str(e)}")
            return {"error": f"Prediction failed: {str(e)}"}
    
    def assess_urgency(self, symptoms: List[str], age: str = "", gender: str = "", 
                      duration: str = "", medical_history: str = "") -> Dict[str, str]:
        """Assess urgency level based on symptoms and patient info"""
        
        symptoms_text = ' '.join(symptoms).lower()
        
        # Check for emergency symptoms
        for emergency in self.emergency_symptoms:
            if emergency.lower() in symptoms_text:
                return {
                    "level": "EMERGENCY",
                    "color": "#DC2626",
                    "action": "SEEK IMMEDIATE MEDICAL ATTENTION",
                    "description": "These symptoms may indicate a life-threatening condition. Call emergency services or go to the emergency room immediately."
                }
        
        # Check for high-risk symptoms
        for high_risk in self.high_risk_symptoms:
            if high_risk.lower() in symptoms_text:
                return {
                    "level": "HIGH",
                    "color": "#EA580C", 
                    "action": "CONSULT DOCTOR TODAY",
                    "description": "These symptoms require prompt medical evaluation. Contact your healthcare provider or urgent care center today."
                }
        
        # Age-based risk assessment
        age_num = 0
        try:
            age_num = int(age) if age else 0
        except ValueError:
            pass
        
        if age_num > 65 or age_num < 2:
            # Check for age-specific risks
            if any(symptom in symptoms_text for symptom in ['fever', 'difficulty breathing', 'chest pain']):
                return {
                    "level": "HIGH",
                    "color": "#EA580C",
                    "action": "CONSULT DOCTOR PROMPTLY", 
                    "description": "Age-related risk factors require prompt medical evaluation for these symptoms."
                }
        
        # Duration-based assessment
        if duration.lower():
            if any(word in duration.lower() for word in ['week', 'weeks', 'month', 'months']):
                return {
                    "level": "MEDIUM",
                    "color": "#D97706",
                    "action": "SCHEDULE DOCTOR VISIT",
                    "description": "Persistent symptoms lasting weeks should be evaluated by a healthcare provider."
                }
        
        # Severity keywords
        if any(word in symptoms_text for word in ['severe', 'intense', 'unbearable', 'worsening']):
            return {
                "level": "MEDIUM", 
                "color": "#D97706",
                "action": "CONSIDER MEDICAL CONSULTATION",
                "description": "Severe symptoms warrant medical evaluation, especially if worsening."
            }
        
        return {
            "level": "LOW",
            "color": "#059669",
            "action": "MONITOR AND SELF-CARE",
            "description": "These symptoms can likely be managed with self-care. Seek medical attention if symptoms worsen or persist."
        }
    
    def generate_recommendations(self, symptoms: List[str], urgency_level: str, 
                               age: str = "", predictions: Dict = None) -> List[str]:
        """Generate personalized recommendations"""
        recommendations = []
        symptoms_text = ' '.join(symptoms).lower()
        
        # Urgency-based recommendations
        if urgency_level == "EMERGENCY":
            recommendations.extend([
                "🚨 Call emergency services (911/108) immediately",
                "🏥 Go to the nearest emergency room",
                "👥 Have someone accompany you if possible",
                "📝 Bring a list of current medications"
            ])
        elif urgency_level == "HIGH":
            recommendations.extend([
                "📞 Contact your doctor or urgent care center today",
                "📋 Monitor symptoms closely and note any changes",
                "🚨 Seek immediate care if symptoms worsen",
                "💊 Bring current medications list to appointment"
            ])
        else:
            # General health recommendations
            recommendations.extend([
                "💧 Stay well hydrated with water",
                "😴 Get adequate rest and sleep",
                "🌡️ Monitor symptoms and keep a symptom diary"
            ])
        
        # Symptom-specific recommendations
        if any(term in symptoms_text for term in ['fever', 'temperature', 'hot']):
            recommendations.extend([
                "🌡️ Monitor temperature regularly",
                "🧊 Apply cool compresses to reduce fever",
                "💊 Consider acetaminophen or ibuprofen as directed"
            ])
        
        if any(term in symptoms_text for term in ['cough', 'throat']):
            recommendations.extend([
                "🍯 Try warm honey and lemon for throat relief",
                "💨 Use a humidifier to add moisture to air",
                "🚭 Avoid smoke and irritants"
            ])
        
        if any(term in symptoms_text for term in ['headache', 'head pain']):
            recommendations.extend([
                "🧊 Apply cold compress to forehead",
                "😌 Rest in a quiet, dark room",
                "💧 Stay hydrated and avoid triggers"
            ])
        
        if any(term in symptoms_text for term in ['nausea', 'stomach', 'vomiting']):
            recommendations.extend([
                "🍞 Try bland foods like toast or crackers",
                "🥤 Sip clear fluids slowly",
                "🚫 Avoid spicy, fatty, or dairy foods"
            ])
        
        # Age-specific recommendations
        try:
            age_num = int(age) if age else 0
            if age_num > 65:
                recommendations.append("👴 Consider having a family member assist with care")
            elif age_num < 18:
                recommendations.append("👶 Ensure adequate supervision and hydration")
        except ValueError:
            pass
        
        # Remove duplicates and limit
        return list(dict.fromkeys(recommendations))[:10]
    
    def comprehensive_analysis(self, symptoms: str, age: str = "", gender: str = "",
                             duration: str = "", medical_history: str = "") -> Dict[str, Any]:
        """Perform comprehensive symptom analysis"""
        
        try:
            # Preprocess symptoms
            symptom_list = self.preprocess_symptoms(symptoms)
            
            if not symptom_list:
                return {
                    "error": "No valid symptoms found. Please describe your symptoms clearly.",
                    "example": "Try: 'fever, headache, cough' or 'stomach pain and nausea'"
                }
            
            # Get ML predictions
            ml_results = self.get_ml_prediction(symptom_list)
            
            # Assess urgency
            urgency_info = self.assess_urgency(symptom_list, age, gender, duration, medical_history)
            
            # Generate recommendations  
            recommendations = self.generate_recommendations(
                symptom_list, urgency_info['level'], age, ml_results
            )
            
            # Extract possible causes
            possible_causes = []
            if not ml_results.get('error') and ml_results.get('top_predictions'):
                possible_causes = [pred['disease'] for pred in ml_results['top_predictions'][:5]]
            
            # Fallback causes if ML fails
            if not possible_causes:
                possible_causes = [
                    "Viral infection",
                    "Bacterial infection", 
                    "Stress-related symptoms",
                    "Dietary factors",
                    "Environmental factors"
                ]
            
            # Generate clarifying questions
            questions = self.generate_questions(symptom_list, age, duration)
            
            return {
                "input_symptoms": symptom_list,
                "possible_causes": possible_causes,
                "urgency_level": urgency_info['level'],
                "urgency_color": urgency_info['color'],
                "urgency_action": urgency_info['action'],
                "urgency_description": urgency_info['description'],
                "recommendations": recommendations,
                "clarifying_questions": questions,
                "ml_analysis": ml_results if not ml_results.get('error') else None,
                "patient_info": {
                    "age": age,
                    "gender": gender,
                    "duration": duration,
                    "has_medical_history": bool(medical_history.strip())
                },
                "disclaimer": "⚠️ This analysis is for informational purposes only. Always consult healthcare professionals for medical advice, diagnosis, and treatment."
            }
            
        except Exception as e:
            logging.error(f"Analysis error: {str(e)}")
            return {
                "error": f"Analysis failed: {str(e)}",
                "disclaimer": "Please consult a healthcare professional for medical advice."
            }
    
    def generate_questions(self, symptoms: List[str], age: str, duration: str) -> List[str]:
        """Generate relevant follow-up questions"""
        questions = []
        symptoms_text = ' '.join(symptoms).lower()
        
        # Duration questions
        if not duration:
            questions.append("When did these symptoms first start?")
        
        # Severity questions
        if any(term in symptoms_text for term in ['pain', 'ache']):
            questions.append("On a scale of 1-10, how severe is the pain?")
        
        # Fever questions
        if 'fever' in symptoms_text:
            questions.append("Have you measured your temperature? What was it?")
        
        # Context questions
        questions.extend([
            "Have you taken any medications for these symptoms?",
            "Have you been exposed to anyone who was ill recently?",
            "Are there any activities that make the symptoms better or worse?"
        ])
        
        return questions[:5]  # Limit to 5 questions