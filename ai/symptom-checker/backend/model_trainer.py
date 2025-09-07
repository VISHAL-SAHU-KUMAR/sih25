import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.neighbors import KNeighborsClassifier
from sklearn.svm import SVC
from sklearn.naive_bayes import GaussianNB
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix
import joblib
import json
import os
from pathlib import Path
import warnings
warnings.filterwarnings('ignore')

class MedicalModelTrainer:
    def __init__(self, data_dir='database'):
        self.data_dir = data_dir
        self.models = {}
        self.symptom_columns = []
        self.disease_list = []
        
        # Load all datasets
        self.load_datasets()
        
    def load_datasets(self):
        """Load all medical datasets"""
        print("Loading medical datasets...")
        
        # Training and testing data
        try:
            self.train_df = pd.read_csv(f'{self.data_dir}/Training.csv')
            self.test_df = pd.read_csv(f'{self.data_dir}/Testing.csv')
            print(f"✅ Loaded training data: {self.train_df.shape}")
            print(f"✅ Loaded testing data: {self.test_df.shape}")
        except FileNotFoundError as e:
            print(f"❌ Could not load training/testing files: {e}")
            return False
            
        # Get symptom columns (all except 'prognosis')
        self.symptom_columns = list(self.train_df.columns[:-1])
        self.disease_list = list(self.train_df['prognosis'].unique())
        
        print(f"📊 Total symptoms: {len(self.symptom_columns)}")
        print(f"🏥 Total diseases: {len(self.disease_list)}")
        
        # Load additional datasets if available
        self.load_additional_data()
        
        return True
        
    def load_additional_data(self):
        """Load additional medical information datasets"""
        
        # Symptom descriptions
        try:
            self.symptom_desc = pd.read_csv(f'{self.data_dir}/symptom_Description.csv')
            self.symptom_desc_dict = dict(zip(
                self.symptom_desc['Disease'], 
                self.symptom_desc['Description']
            ))
            print(f"✅ Loaded symptom descriptions: {len(self.symptom_desc_dict)} diseases")
        except:
            print("⚠️ Symptom descriptions not found")
            self.symptom_desc_dict = {}
            
        # Symptom severity
        try:
            self.symptom_severity = pd.read_csv(f'{self.data_dir}/symptom_severity.csv')
            self.severity_dict = dict(zip(
                self.symptom_severity['Symptom'], 
                self.symptom_severity['weight']
            ))
            print(f"✅ Loaded symptom severity: {len(self.severity_dict)} symptoms")
        except:
            print("⚠️ Symptom severity not found")
            self.severity_dict = {}
            
        # Precautions
        try:
            self.precautions = pd.read_csv(f'{self.data_dir}/symptom_precaution.csv')
            precaution_dict = {}
            for _, row in self.precautions.iterrows():
                precaution_dict[row['Disease']] = [
                    row['Precaution_1'], row['Precaution_2'], 
                    row['Precaution_3'], row['Precaution_4']
                ]
            self.precaution_dict = precaution_dict
            print(f"✅ Loaded precautions: {len(self.precaution_dict)} diseases")
        except:
            print("⚠️ Precautions not found")
            self.precaution_dict = {}
    
    def prepare_data(self):
        """Prepare data for training"""
        print("\n🔄 Preparing data for training...")
        
        # Features (symptoms) and target (disease)
        X_train = self.train_df[self.symptom_columns]
        y_train = self.train_df['prognosis']
        
        X_test = self.test_df[self.symptom_columns]
        y_test = self.test_df['prognosis']
        
        print(f"Training features shape: {X_train.shape}")
        print(f"Training target shape: {y_train.shape}")
        print(f"Testing features shape: {X_test.shape}")
        print(f"Testing target shape: {y_test.shape}")
        
        return X_train, X_test, y_train, y_test
    
    def train_models(self):
        """Train multiple machine learning models"""
        print("\n🤖 Training machine learning models...")
        
        X_train, X_test, y_train, y_test = self.prepare_data()
        
        # Define models to train
        model_configs = {
            'Random Forest': RandomForestClassifier(
                n_estimators=100, 
                random_state=42, 
                max_depth=10
            ),
            'K-Nearest Neighbors': KNeighborsClassifier(
                n_neighbors=5
            ),
            'Support Vector Machine': SVC(
                kernel='rbf', 
                probability=True, 
                random_state=42
            ),
            'Naive Bayes': GaussianNB()
        }
        
        results = {}
        
        for name, model in model_configs.items():
            print(f"\n📊 Training {name}...")
            
            # Train model
            model.fit(X_train, y_train)
            
            # Test predictions
            y_pred = model.predict(X_test)
            accuracy = accuracy_score(y_test, y_pred)
            
            # Cross-validation score
            cv_scores = cross_val_score(model, X_train, y_train, cv=5)
            
            results[name] = {
                'model': model,
                'accuracy': accuracy,
                'cv_mean': cv_scores.mean(),
                'cv_std': cv_scores.std()
            }
            
            print(f"✅ {name}:")
            print(f"   Accuracy: {accuracy:.4f}")
            print(f"   CV Score: {cv_scores.mean():.4f} (±{cv_scores.std():.4f})")
        
        # Find best model
        best_model_name = max(results.keys(), key=lambda k: results[k]['accuracy'])
        best_model = results[best_model_name]['model']
        
        print(f"\n🏆 Best model: {best_model_name} (Accuracy: {results[best_model_name]['accuracy']:.4f})")
        
        self.models = results
        self.best_model = best_model
        self.best_model_name = best_model_name
        
        return results
    
    def save_models(self):
        """Save trained models and data"""
        print("\n💾 Saving models and data...")
        
        # Create model directory
        os.makedirs('models', exist_ok=True)
        
        # Save best model
        joblib.dump(self.best_model, 'models/best_model.pkl')
        print(f"✅ Saved best model: {self.best_model_name}")
        
        # Save all models
        for name, data in self.models.items():
            model_filename = f"models/{name.lower().replace(' ', '_')}.pkl"
            joblib.dump(data['model'], model_filename)
        
        # Save symptom columns
        with open('models/symptom_columns.json', 'w') as f:
            json.dump(self.symptom_columns, f)
        
        # Save disease list
        with open('models/disease_list.json', 'w') as f:
            json.dump(self.disease_list, f)
            
        # Save additional data dictionaries
        with open('models/symptom_descriptions.json', 'w') as f:
            json.dump(self.symptom_desc_dict, f)
            
        with open('models/symptom_severity.json', 'w') as f:
            json.dump(self.severity_dict, f)
            
        with open('models/precautions.json', 'w') as f:
            json.dump(self.precaution_dict, f)
        
        # Create disease-symptom mapping
        disease_symptom_map = {}
        for disease in self.disease_list:
            disease_data = self.train_df[self.train_df['prognosis'] == disease]
            symptoms = []
            for _, row in disease_data.iterrows():
                disease_symptoms = [col for col in self.symptom_columns if row[col] == 1]
                symptoms.extend(disease_symptoms)
            disease_symptom_map[disease] = list(set(symptoms))
        
        with open('models/disease_symptom_mapping.json', 'w') as f:
            json.dump(disease_symptom_map, f)
        
        print("✅ All models and data saved successfully!")
    
    def create_symptom_dataset_json(self):
        """Create a JSON dataset compatible with your symptom checker"""
        print("\n📄 Creating JSON dataset...")
        
        disease_symptom_dataset = {}
        
        for disease in self.disease_list:
            # Get all rows for this disease
            disease_data = self.train_df[self.train_df['prognosis'] == disease]
            
            # Find symptoms that are present (value = 1) for this disease
            all_symptoms = set()
            for _, row in disease_data.iterrows():
                symptoms = [col.replace('_', ' ') for col in self.symptom_columns if row[col] == 1]
                all_symptoms.update(symptoms)
            
            disease_symptom_dataset[disease] = sorted(list(all_symptoms))
        
        # Save to database directory
        os.makedirs('database', exist_ok=True)
        with open('database/disease-symptom_dataset.json', 'w') as f:
            json.dump(disease_symptom_dataset, f, indent=2)
        
        print(f"✅ Created disease-symptom dataset with {len(disease_symptom_dataset)} diseases")
        return disease_symptom_dataset
    
    def generate_model_info(self):
        """Generate model performance information"""
        info = {
            'best_model': self.best_model_name,
            'model_performance': {},
            'dataset_info': {
                'total_diseases': len(self.disease_list),
                'total_symptoms': len(self.symptom_columns),
                'training_samples': len(self.train_df),
                'testing_samples': len(self.test_df)
            }
        }
        
        for name, data in self.models.items():
            info['model_performance'][name] = {
                'accuracy': float(data['accuracy']),
                'cv_mean': float(data['cv_mean']),
                'cv_std': float(data['cv_std'])
            }
        
        with open('models/model_info.json', 'w') as f:
            json.dump(info, f, indent=2)
        
        return info

def main():
    print("🏥 Medical Model Training Pipeline")
    print("=" * 50)
    
    # Initialize trainer
    trainer = MedicalModelTrainer()
    
    # Train models
    results = trainer.train_models()
    
    # Save everything
    trainer.save_models()
    
    # Create JSON dataset
    trainer.create_symptom_dataset_json()
    
    # Generate model info
    info = trainer.generate_model_info()
    
    print("\n" + "=" * 50)
    print("🎉 Training completed successfully!")
    print(f"🏆 Best model: {info['best_model']}")
    print(f"📊 Accuracy: {info['model_performance'][info['best_model']]['accuracy']:.4f}")
    print(f"🏥 Total diseases: {info['dataset_info']['total_diseases']}")
    print(f"🩺 Total symptoms: {info['dataset_info']['total_symptoms']}")
    print("\nFiles created:")
    print("- models/best_model.pkl")
    print("- models/symptom_columns.json")
    print("- models/disease_list.json")
    print("- database/disease-symptom_dataset.json")
    print("- models/model_info.json")

if __name__ == "__main__":
    main()