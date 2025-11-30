"""
Model Registry for ML Models
"""
from typing import Any, Dict, Optional
from pathlib import Path
import logging

logger = logging.getLogger(__name__)


class ModelRegistry:
    """Centralized model loading and versioning"""
    
    def __init__(self):
        self.models: Dict[str, Any] = {}
        self.model_info: Dict[str, Dict] = {}
        
    def load_model(self, model_name: str, model_path: str) -> Any:
        """Load model from disk"""
        if model_name in self.models:
            return self.models[model_name]
            
        path = Path(model_path)
        if not path.exists():
            logger.warning(f"Model not found: {model_path}, using mock")
            return None
            
        try:
            import joblib
            model = joblib.load(model_path)
            self.models[model_name] = model
            logger.info(f"Loaded model: {model_name} from {model_path}")
            return model
        except Exception as e:
            logger.error(f"Failed to load model {model_name}: {e}")
            return None
    
    def get_model(self, model_name: str) -> Optional[Any]:
        """Get loaded model"""
        return self.models.get(model_name)
    
    def register_model_info(self, model_name: str, info: Dict):
        """Register model metadata"""
        self.model_info[model_name] = info
        
    def get_model_info(self, model_name: str) -> Dict:
        """Get model information"""
        return self.model_info.get(model_name, {
            'model_name': model_name,
            'version': 'unknown',
            'status': 'not_loaded'
        })
    
    def list_models(self) -> Dict[str, str]:
        """List all registered models and their versions"""
        return {
            name: info.get('version', 'unknown')
            for name, info in self.model_info.items()
        }


# Singleton
_registry: Optional[ModelRegistry] = None


def get_model_registry() -> ModelRegistry:
    """Get or create model registry instance"""
    global _registry
    if _registry is None:
        _registry = ModelRegistry()
        
        # Register default model info
        _registry.register_model_info('churn_predictor', {
            'model_name': 'churn_predictor',
            'version': 'v1.8',
            'model_type': 'LightGBM',
            'status': 'production',
            'metrics': {
                'auc': 0.82,
                'precision': 0.78,
                'recall': 0.75,
                'f1_score': 0.76
            },
            'feature_count': 25,
            'inference_latency_ms': 15
        })
        
    return _registry