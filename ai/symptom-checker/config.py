import os
from pathlib import Path

class Config:
    """Application configuration settings"""
    
    # Base directories
    BASE_DIR = Path(__file__).parent
    DATABASE_DIR = BASE_DIR / 'database'
    MODELS_DIR = BASE_DIR / 'models'
    
    # Flask settings
    SECRET_KEY = os.environ.get('SECRET_KEY', 'medical-symptom-checker-dev-key')
    DEBUG = os.environ.get('FLASK_DEBUG', 'False').lower() == 'true'
    
    # CORS settings
    CORS_ORIGINS = ["http://localhost:3000", "http://127.0.0.1:3000"]
    
    # Model files
    BEST_MODEL_PATH = MODELS_DIR / 'best_model.pkl'
    SYMPTOM_COLUMNS_PATH = MODELS_DIR / 'symptom_columns.json'
    DISEASE_LIST_PATH = MODELS_DIR / 'disease_list.json'
    LABEL_ENCODER_PATH = MODELS_DIR / 'label_encoder.pkl'
    MODEL_INFO_PATH = MODELS_DIR / 'model_info.json'
    
    # Dataset files
    TRAINING_DATA_PATH = DATABASE_DIR / 'Training.csv'
    TESTING_DATA_PATH = DATABASE_DIR / 'Testing.csv'
    DISEASE_DATASET_PATH = DATABASE_DIR / 'disease-symptom_dataset.json'
    
    # API settings
    API_VERSION = "1.0"
    API_TITLE = "Medical Symptom Checker API"
    
    # Medical safety settings
    EMERGENCY_KEYWORDS = [
        'chest pain', 'difficulty breathing', 'shortness of breath', 'severe pain',
        'heart attack', 'stroke', 'bleeding', 'unconscious', 'seizure',
        'severe headache', 'vision loss', 'paralysis', 'severe allergic reaction'
    ]
    
    HIGH_RISK_KEYWORDS = [
        'persistent fever', 'severe fatigue', 'blood in stool', 'blood in urine',
        'severe vomiting', 'dehydration', 'fainting', 'rapid weight loss'
    ]
    
    # Age-based risk factors
    ELDERLY_AGE_THRESHOLD = 65
    CHILD_AGE_THRESHOLD = 12
    
    # ML Model settings
    MIN_CONFIDENCE_THRESHOLD = 0.1
    MAX_PREDICTIONS_RETURN = 5
    SIMILARITY_THRESHOLD = 0.7
    
    # Logging settings
    LOG_LEVEL = os.environ.get('LOG_LEVEL', 'INFO')
    LOG_FORMAT = '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    
    @classmethod
    def ensure_directories(cls):
        """Create necessary directories if they don't exist"""
        cls.DATABASE_DIR.mkdir(exist_ok=True)
        cls.MODELS_DIR.mkdir(exist_ok=True)
    
    @classmethod
    def validate_required_files(cls):
        """Check if required files exist"""
        required_files = [
            cls.TRAINING_DATA_PATH,
            cls.TESTING_DATA_PATH
        ]
        
        missing_files = [f for f in required_files if not f.exists()]
        
        if missing_files:
            return False, missing_files
        return True, []
    
    @classmethod
    def check_model_files(cls):
        """Check if trained model files exist"""
        model_files = [
            cls.BEST_MODEL_PATH,
            cls.SYMPTOM_COLUMNS_PATH,
            cls.DISEASE_LIST_PATH,
            cls.MODEL_INFO_PATH
        ]
        
        existing_files = [f for f in model_files if f.exists()]
        return len(existing_files) == len(model_files), existing_files


class DevelopmentConfig(Config):
    """Development configuration"""
    DEBUG = True
    LOG_LEVEL = 'DEBUG'


class ProductionConfig(Config):
    """Production configuration"""
    DEBUG = False
    LOG_LEVEL = 'WARNING'
    
    # Use environment variable if set, otherwise fallback to default
    SECRET_KEY = os.environ.get('SECRET_KEY', 'medical-symptom-checker-prod-key')


class TestingConfig(Config):
    """Testing configuration"""
    TESTING = True
    DEBUG = True
    LOG_LEVEL = 'DEBUG'


# Configuration mapping
config = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'testing': TestingConfig,
    'default': DevelopmentConfig
}
