import re
from typing import List, Dict, Any
import json
from difflib import SequenceMatcher

class SymptomAnalyzer:
    """AI-powered symptom analysis engine using JSON dataset."""
    
    def __init__(self, dataset: Dict[str, List[str]]):
        self.dataset = dataset
        
        # Emergency keywords that indicate high urgency
        self.emergency_keywords = [
            'chest pain', 'difficulty breathing', 'shortness of breath', 'severe pain',
            'heart attack', 'stroke', 'bleeding', 'unconscious', 'seizure',
            'severe headache', 'vision loss', 'paralysis', 'severe allergic reaction',
            'difficulty swallowing', 'severe abdominal pain', 'high fever'
        ]
        
        # High urgency keywords
        self.high_urgency_keywords = [
            'persistent fever', 'severe fatigue', 'blood in stool', 'blood in urine',
            'severe nausea', 'severe vomiting', 'dehydration', 'fainting',
            'rapid weight loss', 'persistent cough', 'severe diarrhea'
        ]
        
        # Common condition mappings for fallback
        self.condition_patterns = {
            'Common Cold': ['runny nose', 'sneezing', 'mild cough', 'sore throat'],
            'Influenza': ['fever', 'body aches', 'fatigue', 'headache', 'cough'],
            'Migraine': ['severe headache', 'nausea', 'sensitivity to light', 'visual disturbance'],
            'Gastroenteritis': ['nausea', 'vomiting', 'diarrhea', 'stomach cramps', 'abdominal pain'],
            'Anxiety': ['nervousness', 'rapid heartbeat', 'sweating', 'trembling', 'restlessness'],
            'Allergic Reaction': ['itching', 'hives', 'swelling', 'rash', 'difficulty breathing']
        }
    
    def extract_symptoms_from_text(self, text: str) -> List[str]:
        """Extract individual symptoms from user input text."""
        # Convert to lowercase and clean
        text = text.lower().strip()
        
        symptoms = []
        
        # Split by common separators
        parts = re.split(r'[,;]|(?:\s+and\s+)|(?:\s+&\s+)', text)
        
        for part in parts:
            part = part.strip()
            if part and len(part) > 2:
                # Remove common prefixes
                part = re.sub(r'^(?:have|having|experiencing|feel|feeling|got|get|i|my|the)\s+', '', part)
                part = re.sub(r'\s+(?:for|since|lasting).*$', '', part)
                if part:
                    symptoms.append(part.strip())
        
        return list(set(symptoms))  # Remove duplicates
    
    def similarity_score(self, a: str, b: str) -> float:
        """Calculate similarity between two strings."""
        return SequenceMatcher(None, a.lower(), b.lower()).ratio()
    
    def find_matching_diseases(self, user_symptoms: List[str]) -> List[Dict[str, Any]]:
        """Find diseases that match the user's symptoms."""
        matches = []
        
        for disease, disease_symptoms in self.dataset.items():
            if not isinstance(disease_symptoms, list):
                continue
            
            disease_symptoms_lower = [s.lower().strip() for s in disease_symptoms]
            match_score = 0
            matched_symptoms = []
            
            # Check each user symptom against disease symptoms
            for user_symptom in user_symptoms:
                best_match_score = 0
                best_match = None
                
                for disease_symptom in disease_symptoms_lower:
                    # Direct substring match
                    if user_symptom in disease_symptom or disease_symptom in user_symptom:
                        score = 1.0
                    else:
                        # Similarity score
                        score = self.similarity_score(user_symptom, disease_symptom)
                    
                    if score > best_match_score and score > 0.6:  # Minimum similarity threshold
                        best_match_score = score
                        best_match = disease_symptom
                
                if best_match:
                    match_score += best_match_score
                    matched_symptoms.append(best_match)
            
            if match_score > 0:
                # Calculate match percentage
                match_percentage = (match_score / len(user_symptoms)) * 100
                symptom_coverage = (len(matched_symptoms) / len(disease_symptoms)) * 100
                
                # Combined score considering both user symptom coverage and disease symptom coverage
                combined_score = (match_percentage + symptom_coverage) / 2
                
                matches.append({
                    'disease': disease,
                    'all_symptoms': disease_symptoms,
                    'matched_symptoms': matched_symptoms,
                    'match_score': round(match_score, 2),
                    'match_percentage': round(match_percentage, 2),
                    'symptom_coverage': round(symptom_coverage, 2),
                    'combined_score': round(combined_score, 2)
                })
        
        # Sort by combined score (descending)
        matches.sort(key=lambda x: x['combined_score'], reverse=True)
        return matches
    
    def calculate_urgency_level(self, symptoms: List[str], user_input: str, matched_diseases: List[Dict]) -> Dict[str, str]:
        """Calculate urgency level based on symptoms and matched diseases."""
        user_input_lower = user_input.lower()
        
        # Check for emergency symptoms
        for keyword in self.emergency_keywords:
            if keyword in user_input_lower:
                return {
                    "level": "High",
                    "description": "Seek immediate medical attention. These symptoms may indicate a serious condition requiring urgent care."
                }
        
        # Check for high urgency symptoms
        for keyword in self.high_urgency_keywords:
            if keyword in user_input_lower:
                return {
                    "level": "High", 
                    "description": "Schedule a doctor visit as soon as possible. These symptoms warrant prompt medical evaluation."
                }
        
        # Check matched diseases for severity indicators
        if matched_diseases:
            top_disease = matched_diseases[0]['disease'].lower()
            
            # High urgency conditions
            high_urgency_conditions = [
                'heart attack', 'stroke', 'pneumonia', 'appendicitis', 'meningitis',
                'kidney stones', 'gallbladder', 'asthma', 'diabetes', 'hypertension'
            ]
            
            if any(condition in top_disease for condition in high_urgency_conditions):
                return {
                    "level": "High",
                    "description": "These symptoms may indicate a serious condition. Please consult a healthcare provider promptly."
                }
        
        # Check for duration and severity indicators
        if any(term in user_input_lower for term in ['severe', 'intense', 'unbearable', 'weeks', 'persistent']):
            return {
                "level": "Medium",
                "description": "Consider seeing a healthcare provider within the next few days for proper evaluation."
            }
        
        # Check for worsening symptoms
        if any(term in user_input_lower for term in ['getting worse', 'worsening', 'not improving']):
            return {
                "level": "Medium", 
                "description": "If symptoms continue to worsen or don't improve, consult a healthcare provider."
            }
        
        return {
            "level": "Low",
            "description": "Monitor symptoms at home. Seek medical care if symptoms worsen or don't improve in a few days."
        }
    
    def generate_recommendations(self, symptoms: List[str], urgency_level: str, matched_diseases: List[Dict]) -> List[str]:
        """Generate personalized recommendations based on symptoms and matched conditions."""
        recommendations = []
        
        # Urgency-based recommendations
        if urgency_level.lower() == 'high':
            recommendations.extend([
                "Seek immediate medical attention",
                "Call emergency services if symptoms are severe",
                "Do not delay medical care",
                "Have someone accompany you to the hospital if possible"
            ])
        elif urgency_level.lower() == 'medium':
            recommendations.extend([
                "Schedule an appointment with your healthcare provider",
                "Monitor symptoms closely and keep a symptom diary",
                "Seek immediate care if symptoms worsen"
            ])
        else:
            recommendations.extend([
                "Get adequate rest and sleep",
                "Stay well hydrated with water and clear fluids", 
                "Monitor symptoms and seek care if they worsen or persist"
            ])
        
        # Symptom-specific recommendations
        user_symptoms_text = ' '.join(symptoms).lower()
        
        if any(term in user_symptoms_text for term in ['fever', 'temperature', 'hot', 'chills']):
            recommendations.extend([
                "Monitor body temperature regularly",
                "Use over-the-counter fever reducers as directed",
                "Apply cool compresses to help reduce fever"
            ])
        
        if any(term in user_symptoms_text for term in ['cough', 'throat', 'sore']):
            recommendations.extend([
                "Use throat lozenges or warm salt water gargle",
                "Stay hydrated with warm liquids like tea with honey",
                "Use a humidifier to add moisture to the air"
            ])
        
        if any(term in user_symptoms_text for term in ['headache', 'head pain', 'migraine']):
            recommendations.extend([
                "Apply cold or warm compress to head or neck",
                "Rest in a quiet, dark room",
                "Ensure adequate sleep and manage stress levels"
            ])
        
        if any(term in user_symptoms_text for term in ['nausea', 'stomach', 'abdominal', 'vomiting']):
            recommendations.extend([
                "Try bland foods like crackers, toast, or rice",
                "Avoid spicy, fatty, or dairy foods",
                "Sip clear fluids slowly to prevent dehydration"
            ])
        
        if any(term in user_symptoms_text for term in ['pain', 'ache', 'sore']):
            recommendations.extend([
                "Apply ice or heat as appropriate for pain relief",
                "Consider over-the-counter pain relievers as directed",
                "Avoid activities that worsen the pain"
            ])
        
        # Disease-specific recommendations from top matches
        if matched_diseases:
            top_disease = matched_diseases[0]['disease'].lower()
            
            if 'cold' in top_disease or 'flu' in top_disease:
                recommendations.extend([
                    "Increase vitamin C intake through citrus fruits",
                    "Wash hands frequently to prevent spread"
                ])
            
            if 'allerg' in top_disease:
                recommendations.extend([
                    "Identify and avoid potential allergens",
                    "Consider antihistamines if appropriate"
                ])
            
            if 'anxiety' in top_disease or 'stress' in top_disease:
                recommendations.extend([
                    "Practice deep breathing exercises",
                    "Try relaxation techniques or meditation"
                ])
        
        # Remove duplicates while preserving order
        seen = set()
        unique_recommendations = []
        for rec in recommendations:
            if rec not in seen:
                seen.add(rec)
                unique_recommendations.append(rec)
        
        return unique_recommendations[:8]  # Limit to 8 recommendations
    
    def generate_clarifying_questions(self, symptoms: List[str], user_input: str) -> List[str]:
        """Generate relevant clarifying questions."""
        questions = []
        user_input_lower = user_input.lower()
        
        # General clarifying questions based on symptoms
        if any(term in user_input_lower for term in ['pain', 'ache', 'hurt']):
            questions.extend([
                "On a scale of 1-10, how would you rate the pain intensity?",
                "Is the pain constant or does it come and go?",
                "Does anything make the pain better or worse?"
            ])
        
        if any(term in user_input_lower for term in ['fever', 'temperature']):
            questions.extend([
                "Have you measured your temperature? What was the reading?",
                "Are you experiencing chills or night sweats?",
                "How long have you had the fever?"
            ])
        
        if any(term in user_input_lower for term in ['cough', 'breathing', 'chest']):
            questions.extend([
                "Are you experiencing any difficulty breathing?",
                "Is the cough producing any phlegm or blood?",
                "Does the cough interfere with your sleep?"
            ])
        
        if any(term in user_input_lower for term in ['headache', 'head']):
            questions.extend([
                "Where exactly is the headache located?",
                "Are you experiencing any vision changes or sensitivity to light?",
                "Have you had similar headaches before?"
            ])
        
        if any(term in user_input_lower for term in ['stomach', 'nausea', 'abdominal']):
            questions.extend([
                "Have you had any recent changes in diet?",
                "Are you experiencing any vomiting or diarrhea?",
                "When did you last have a normal bowel movement?"
            ])
        
        # Duration questions if not mentioned
        if not any(term in user_input_lower for term in ['day', 'week', 'month', 'hour', 'ago', 'since']):
            questions.append("When did these symptoms first start?")
        
        # Context questions
        questions.extend([
            "Have you traveled recently or been exposed to anyone who was ill?",
            "Are you currently taking any medications or supplements?",
            "Do you have any known allergies or medical conditions?"
        ])
        
        # Remove duplicates and limit
        return list(dict.fromkeys(questions))[:5]
    
    def analyze_symptoms(self, symptoms: str, age: str = "", gender: str = "", 
                        duration: str = "", medical_history: str = "") -> Dict[str, Any]:
        """Main analysis function that processes symptoms and returns comprehensive analysis."""
        
        # Extract individual symptoms from text
        symptom_list = self.extract_symptoms_from_text(symptoms)
        
        # Find matching diseases from dataset
        matched_diseases = self.find_matching_diseases(symptom_list)
        
        # Extract possible causes from top matches
        possible_causes = []
        if matched_diseases:
            for disease_match in matched_diseases[:5]:  # Top 5 matches
                possible_causes.append(disease_match['disease'])
        
        # If no good matches from dataset, use fallback patterns
        if not possible_causes or (matched_diseases and matched_diseases[0]['combined_score'] < 30):
            for condition, patterns in self.condition_patterns.items():
                pattern_matches = sum(1 for pattern in patterns 
                                   if any(pattern in symptoms.lower() for symptom in symptom_list))
                if pattern_matches >= 2:  # At least 2 pattern matches
                    possible_causes.append(condition)
            
            # General fallback causes if still no matches
            if not possible_causes:
                possible_causes = [
                    "Viral infection",
                    "Bacterial infection", 
                    "Stress or anxiety",
                    "Dietary factors",
                    "Environmental factors"
                ]
        
        # Generate urgency level
        urgency_info = self.calculate_urgency_level(symptom_list, symptoms, matched_diseases)
        
        # Generate recommendations
        recommendations = self.generate_recommendations(
            symptom_list, urgency_info['level'], matched_diseases
        )
        
        # Generate clarifying questions
        clarifying_questions = self.generate_clarifying_questions(symptom_list, symptoms)
        
        # Additional analysis data
        analysis_data = {
            "extracted_symptoms": symptom_list,
            "top_disease_matches": [
                {
                    "disease": match['disease'],
                    "confidence": f"{match['combined_score']:.1f}%",
                    "matched_symptoms": match['matched_symptoms'][:3]  # Show top 3 matched symptoms
                }
                for match in matched_diseases[:3]
            ] if matched_diseases else []
        }
        
        # Compile final analysis
        analysis = {
            "possible_causes": possible_causes[:5],  # Limit to top 5
            "urgency_level": urgency_info['level'],
            "urgency_description": urgency_info['description'],
            "recommendations": recommendations,
            "clarifying_questions": clarifying_questions,
            "analysis_data": analysis_data,
            "disclaimer": "This analysis is for informational purposes only and should not replace professional medical advice. Always consult with a healthcare provider for accurate diagnosis and treatment."
        }
        
        return analysis