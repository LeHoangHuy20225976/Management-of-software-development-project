"""
Training Script for Customer Lifetime Value (CLV) Models

This script trains three separate XGBoost models:
1. Booking Frequency Model (Regressor) - Predicts number of future bookings
2. Booking Value Model (Regressor) - Predicts average booking value
3. Retention Model (Classifier) - Predicts customer retention probability

Usage:
    python -m src.application.services.ml.training.train_clv \
        --data-path data/bookings.csv \
        --output-dir models/clv \
        --test-size 0.2 \
        --log-mlflow
"""

import argparse
import logging
from pathlib import Path
from typing import Dict, Tuple, Any
import sys

import numpy as np
import pandas as pd
import joblib
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.metrics import (
    mean_absolute_error, mean_squared_error, r2_score,
    roc_auc_score, precision_score, recall_score, f1_score,
    classification_report
)
import xgboost as xgb

# MLflow for experiment tracking (optional)
try:
    import mlflow
    import mlflow.xgboost
    MLFLOW_AVAILABLE = True
except ImportError:
    MLFLOW_AVAILABLE = False
    logging.warning("MLflow not available. Experiment tracking disabled.")

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


class CLVModelTrainer:
    """
    Trainer for CLV prediction models
    
    Trains three XGBoost models using prepared features
    """
    
    def __init__(self, output_dir: str = "models/clv", log_mlflow: bool = False):
        """
        Initialize trainer
        
        Args:
            output_dir: Directory to save trained models
            log_mlflow: Whether to log experiments to MLflow
        """
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(parents=True, exist_ok=True)
        
        self.log_mlflow = log_mlflow and MLFLOW_AVAILABLE
        
        if self.log_mlflow:
            mlflow.set_experiment("clv_training")
    
    
    def load_and_prepare_data(
        self,
        data_path: str,
        test_size: float = 0.2,
        random_state: int = 42
    ) -> Tuple[pd.DataFrame, pd.DataFrame]:
        """
        Load and prepare training data
        
        Args:
            data_path: Path to CSV file with booking data
            test_size: Proportion of data for testing
            random_state: Random seed for reproducibility
            
        Returns:
            Tuple of (train_df, test_df)
        """
        logger.info(f"Loading data from {data_path}")
        
        # Load booking data
        bookings_df = pd.read_csv(data_path)
        
        # Convert date columns
        date_cols = ['booking_date', 'checkin_date', 'checkout_date']
        for col in date_cols:
            if col in bookings_df.columns:
                bookings_df[col] = pd.to_datetime(bookings_df[col])
        
        logger.info(f"Loaded {len(bookings_df)} bookings for {bookings_df['guest_id'].nunique()} guests")
        
        # Engineer features
        from src.application.services.ml.clv_feature_engineering import get_feature_engineer
        
        feature_engineer = get_feature_engineer()
        features_df = feature_engineer.engineer_features_for_training(bookings_df)
        
        logger.info(f"Engineered {len(features_df)} feature sets with {len(feature_engineer.feature_names)} features")
        
        # Create target variables
        features_df = self._create_target_variables(features_df, bookings_df)
        
        # Split data
        train_df, test_df = train_test_split(
            features_df,
            test_size=test_size,
            random_state=random_state,
            stratify=features_df['is_retained']  # Stratify by retention
        )
        
        logger.info(f"Split: {len(train_df)} train, {len(test_df)} test samples")
        
        return train_df, test_df
    
    
    def _create_target_variables(
        self,
        features_df: pd.DataFrame,
        bookings_df: pd.DataFrame
    ) -> pd.DataFrame:
        """
        Create target variables for the three models
        
        Targets:
        1. future_bookings_per_year - Number of bookings in next 12 months
        2. future_avg_booking_value - Average booking value in next 12 months
        3. is_retained - Whether customer made booking in next 12 months (binary)
        """
        logger.info("Creating target variables...")
        
        targets = []
        
        for guest_id in features_df['guest_id']:
            guest_bookings = bookings_df[bookings_df['guest_id'] == guest_id].copy()
            guest_bookings = guest_bookings.sort_values('booking_date')
            
            # Get last booking date from features (training cutoff)
            last_booking = guest_bookings['booking_date'].max()
            
            # Define future window (12 months after last booking)
            future_start = last_booking
            future_end = future_start + pd.Timedelta(days=365)
            
            # Get future bookings (this would need actual future data in production)
            # For training, we simulate by using bookings after a certain date
            future_bookings = guest_bookings[
                (guest_bookings['booking_date'] > future_start) &
                (guest_bookings['booking_date'] <= future_end)
            ]
            
            # Calculate targets
            future_booking_count = len(future_bookings)
            future_avg_value = future_bookings['total_amount'].mean() if len(future_bookings) > 0 else 0
            is_retained = 1 if future_booking_count > 0 else 0
            
            targets.append({
                'guest_id': guest_id,
                'future_bookings_per_year': future_booking_count,
                'future_avg_booking_value': future_avg_value,
                'is_retained': is_retained
            })
        
        targets_df = pd.DataFrame(targets)
        
        # Merge with features
        features_df = features_df.merge(targets_df, on='guest_id')
        
        logger.info(f"Target distribution:")
        logger.info(f"  - Avg future bookings: {features_df['future_bookings_per_year'].mean():.2f}")
        logger.info(f"  - Avg future value: {features_df['future_avg_booking_value'].mean():,.0f} VND")
        logger.info(f"  - Retention rate: {features_df['is_retained'].mean():.2%}")
        
        return features_df
    
    
    def train_booking_frequency_model(
        self,
        train_df: pd.DataFrame,
        test_df: pd.DataFrame
    ) -> Dict[str, Any]:
        """
        Train booking frequency prediction model (XGBoost Regressor)
        
        Predicts: Number of bookings per year
        """
        logger.info("=" * 80)
        logger.info("Training Booking Frequency Model")
        logger.info("=" * 80)
        
        # Get feature names
        from src.application.services.ml.clv_feature_engineering import get_feature_engineer
        feature_names = get_feature_engineer().feature_names
        
        # Prepare data
        X_train = train_df[feature_names]
        y_train = train_df['future_bookings_per_year']
        X_test = test_df[feature_names]
        y_test = test_df['future_bookings_per_year']
        
        # Model parameters
        params = {
            'objective': 'reg:squarederror',
            'max_depth': 6,
            'learning_rate': 0.05,
            'n_estimators': 200,
            'min_child_weight': 3,
            'subsample': 0.8,
            'colsample_bytree': 0.8,
            'gamma': 0.1,
            'reg_alpha': 0.1,
            'reg_lambda': 1.0,
            'random_state': 42,
            'n_jobs': -1
        }
        
        # Train model
        logger.info("Training with parameters:")
        for key, value in params.items():
            logger.info(f"  {key}: {value}")
        
        model = xgb.XGBRegressor(**params)
        
        model.fit(
            X_train, y_train,
            eval_set=[(X_test, y_test)],
            early_stopping_rounds=20,
            verbose=False
        )
        
        # Evaluate
        y_pred_train = model.predict(X_train)
        y_pred_test = model.predict(X_test)
        
        metrics = {
            'train_mae': mean_absolute_error(y_train, y_pred_train),
            'train_rmse': np.sqrt(mean_squared_error(y_train, y_pred_train)),
            'train_r2': r2_score(y_train, y_pred_train),
            'test_mae': mean_absolute_error(y_test, y_pred_test),
            'test_rmse': np.sqrt(mean_squared_error(y_test, y_pred_test)),
            'test_r2': r2_score(y_test, y_pred_test),
        }
        
        logger.info("Performance Metrics:")
        logger.info(f"  Train MAE: {metrics['train_mae']:.4f}")
        logger.info(f"  Train RMSE: {metrics['train_rmse']:.4f}")
        logger.info(f"  Train R²: {metrics['train_r2']:.4f}")
        logger.info(f"  Test MAE: {metrics['test_mae']:.4f}")
        logger.info(f"  Test RMSE: {metrics['test_rmse']:.4f}")
        logger.info(f"  Test R²: {metrics['test_r2']:.4f}")
        
        # Save model
        model_path = self.output_dir / "clv_booking_frequency_v1.5.pkl"
        joblib.dump(model, model_path)
        logger.info(f"Model saved to {model_path}")
        
        # Log to MLflow
        if self.log_mlflow:
            with mlflow.start_run(run_name="booking_frequency"):
                mlflow.log_params(params)
                mlflow.log_metrics(metrics)
                mlflow.xgboost.log_model(model, "model")
        
        return {
            'model': model,
            'metrics': metrics,
            'model_path': str(model_path)
        }
    
    
    def train_booking_value_model(
        self,
        train_df: pd.DataFrame,
        test_df: pd.DataFrame
    ) -> Dict[str, Any]:
        """
        Train booking value prediction model (XGBoost Regressor)
        
        Predicts: Average booking value in VND
        """
        logger.info("=" * 80)
        logger.info("Training Booking Value Model")
        logger.info("=" * 80)
        
        # Get feature names
        from src.application.services.ml.clv_feature_engineering import get_feature_engineer
        feature_names = get_feature_engineer().feature_names
        
        # Prepare data (only guests who had future bookings)
        train_active = train_df[train_df['future_avg_booking_value'] > 0].copy()
        test_active = test_df[test_df['future_avg_booking_value'] > 0].copy()
        
        X_train = train_active[feature_names]
        y_train = train_active['future_avg_booking_value']
        X_test = test_active[feature_names]
        y_test = test_active['future_avg_booking_value']
        
        logger.info(f"Training on {len(train_active)} active customers")
        
        # Model parameters
        params = {
            'objective': 'reg:squarederror',
            'max_depth': 5,
            'learning_rate': 0.05,
            'n_estimators': 200,
            'min_child_weight': 3,
            'subsample': 0.8,
            'colsample_bytree': 0.8,
            'gamma': 0.1,
            'reg_alpha': 0.1,
            'reg_lambda': 1.0,
            'random_state': 42,
            'n_jobs': -1
        }
        
        # Train model
        model = xgb.XGBRegressor(**params)
        
        model.fit(
            X_train, y_train,
            eval_set=[(X_test, y_test)],
            early_stopping_rounds=20,
            verbose=False
        )
        
        # Evaluate
        y_pred_train = model.predict(X_train)
        y_pred_test = model.predict(X_test)
        
        metrics = {
            'train_mae': mean_absolute_error(y_train, y_pred_train),
            'train_rmse': np.sqrt(mean_squared_error(y_train, y_pred_train)),
            'train_r2': r2_score(y_train, y_pred_train),
            'train_mape': np.mean(np.abs((y_train - y_pred_train) / y_train)) * 100,
            'test_mae': mean_absolute_error(y_test, y_pred_test),
            'test_rmse': np.sqrt(mean_squared_error(y_test, y_pred_test)),
            'test_r2': r2_score(y_test, y_pred_test),
            'test_mape': np.mean(np.abs((y_test - y_pred_test) / y_test)) * 100,
        }
        
        logger.info("Performance Metrics:")
        logger.info(f"  Train MAE: {metrics['train_mae']:,.0f} VND")
        logger.info(f"  Train RMSE: {metrics['train_rmse']:,.0f} VND")
        logger.info(f"  Train R²: {metrics['train_r2']:.4f}")
        logger.info(f"  Train MAPE: {metrics['train_mape']:.2f}%")
        logger.info(f"  Test MAE: {metrics['test_mae']:,.0f} VND")
        logger.info(f"  Test RMSE: {metrics['test_rmse']:,.0f} VND")
        logger.info(f"  Test R²: {metrics['test_r2']:.4f}")
        logger.info(f"  Test MAPE: {metrics['test_mape']:.2f}%")
        
        # Save model
        model_path = self.output_dir / "clv_booking_value_v1.5.pkl"
        joblib.dump(model, model_path)
        logger.info(f"Model saved to {model_path}")
        
        # Log to MLflow
        if self.log_mlflow:
            with mlflow.start_run(run_name="booking_value"):
                mlflow.log_params(params)
                mlflow.log_metrics(metrics)
                mlflow.xgboost.log_model(model, "model")
        
        return {
            'model': model,
            'metrics': metrics,
            'model_path': str(model_path)
        }
    
    
    def train_retention_model(
        self,
        train_df: pd.DataFrame,
        test_df: pd.DataFrame
    ) -> Dict[str, Any]:
        """
        Train customer retention prediction model (XGBoost Classifier)
        
        Predicts: Whether customer will make future booking (binary)
        """
        logger.info("=" * 80)
        logger.info("Training Retention Model")
        logger.info("=" * 80)
        
        # Get feature names
        from src.application.services.ml.clv_feature_engineering import get_feature_engineer
        feature_names = get_feature_engineer().feature_names
        
        # Prepare data
        X_train = train_df[feature_names]
        y_train = train_df['is_retained']
        X_test = test_df[feature_names]
        y_test = test_df['is_retained']
        
        # Calculate class weights for imbalanced data
        neg_count = (y_train == 0).sum()
        pos_count = (y_train == 1).sum()
        scale_pos_weight = neg_count / pos_count if pos_count > 0 else 1.0
        
        logger.info(f"Class distribution: Retained={pos_count}, Churned={neg_count}")
        logger.info(f"Scale pos weight: {scale_pos_weight:.2f}")
        
        # Model parameters
        params = {
            'objective': 'binary:logistic',
            'max_depth': 5,
            'learning_rate': 0.05,
            'n_estimators': 200,
            'min_child_weight': 3,
            'subsample': 0.8,
            'colsample_bytree': 0.8,
            'gamma': 0.1,
            'reg_alpha': 0.1,
            'reg_lambda': 1.0,
            'scale_pos_weight': scale_pos_weight,
            'random_state': 42,
            'n_jobs': -1
        }
        
        # Train model
        model = xgb.XGBClassifier(**params)
        
        model.fit(
            X_train, y_train,
            eval_set=[(X_test, y_test)],
            early_stopping_rounds=20,
            verbose=False
        )
        
        # Evaluate
        y_pred_train = model.predict(X_train)
        y_pred_test = model.predict(X_test)
        y_pred_proba_test = model.predict_proba(X_test)[:, 1]
        
        metrics = {
            'train_accuracy': (y_train == y_pred_train).mean(),
            'train_precision': precision_score(y_train, y_pred_train),
            'train_recall': recall_score(y_train, y_pred_train),
            'train_f1': f1_score(y_train, y_pred_train),
            'test_accuracy': (y_test == y_pred_test).mean(),
            'test_precision': precision_score(y_test, y_pred_test),
            'test_recall': recall_score(y_test, y_pred_test),
            'test_f1': f1_score(y_test, y_pred_test),
            'test_auc': roc_auc_score(y_test, y_pred_proba_test),
        }
        
        logger.info("Performance Metrics:")
        logger.info(f"  Train Accuracy: {metrics['train_accuracy']:.4f}")
        logger.info(f"  Train Precision: {metrics['train_precision']:.4f}")
        logger.info(f"  Train Recall: {metrics['train_recall']:.4f}")
        logger.info(f"  Train F1: {metrics['train_f1']:.4f}")
        logger.info(f"  Test Accuracy: {metrics['test_accuracy']:.4f}")
        logger.info(f"  Test Precision: {metrics['test_precision']:.4f}")
        logger.info(f"  Test Recall: {metrics['test_recall']:.4f}")
        logger.info(f"  Test F1: {metrics['test_f1']:.4f}")
        logger.info(f"  Test AUC-ROC: {metrics['test_auc']:.4f}")
        
        logger.info("\nClassification Report:")
        logger.info("\n" + classification_report(y_test, y_pred_test, target_names=['Churned', 'Retained']))
        
        # Save model
        model_path = self.output_dir / "clv_retention_v1.5.pkl"
        joblib.dump(model, model_path)
        logger.info(f"Model saved to {model_path}")
        
        # Log to MLflow
        if self.log_mlflow:
            with mlflow.start_run(run_name="retention"):
                mlflow.log_params(params)
                mlflow.log_metrics(metrics)
                mlflow.xgboost.log_model(model, "model")
        
        return {
            'model': model,
            'metrics': metrics,
            'model_path': str(model_path)
        }
    
    
    def train_all_models(
        self,
        data_path: str,
        test_size: float = 0.2
    ) -> Dict[str, Any]:
        """
        Train all three CLV models
        
        Args:
            data_path: Path to booking data CSV
            test_size: Test set proportion
            
        Returns:
            Dict with all trained models and metrics
        """
        logger.info("=" * 80)
        logger.info("Starting CLV Model Training Pipeline")
        logger.info("=" * 80)
        
        # Load and prepare data
        train_df, test_df = self.load_and_prepare_data(data_path, test_size)
        
        # Train all three models
        frequency_results = self.train_booking_frequency_model(train_df, test_df)
        value_results = self.train_booking_value_model(train_df, test_df)
        retention_results = self.train_retention_model(train_df, test_df)
        
        # Summary
        logger.info("=" * 80)
        logger.info("Training Complete!")
        logger.info("=" * 80)
        logger.info(f"Models saved to: {self.output_dir}")
        logger.info(f"\nBooking Frequency Model:")
        logger.info(f"  Test R²: {frequency_results['metrics']['test_r2']:.4f}")
        logger.info(f"  Test RMSE: {frequency_results['metrics']['test_rmse']:.4f}")
        logger.info(f"\nBooking Value Model:")
        logger.info(f"  Test R²: {value_results['metrics']['test_r2']:.4f}")
        logger.info(f"  Test MAPE: {value_results['metrics']['test_mape']:.2f}%")
        logger.info(f"\nRetention Model:")
        logger.info(f"  Test AUC: {retention_results['metrics']['test_auc']:.4f}")
        logger.info(f"  Test F1: {retention_results['metrics']['test_f1']:.4f}")
        
        return {
            'booking_frequency': frequency_results,
            'booking_value': value_results,
            'retention': retention_results
        }


def main():
    """Main training script"""
    parser = argparse.ArgumentParser(description='Train CLV prediction models')
    parser.add_argument(
        '--data-path',
        type=str,
        required=True,
        help='Path to booking data CSV file'
    )
    parser.add_argument(
        '--output-dir',
        type=str,
        default='models/clv',
        help='Directory to save trained models'
    )
    parser.add_argument(
        '--test-size',
        type=float,
        default=0.2,
        help='Proportion of data for testing (default: 0.2)'
    )
    parser.add_argument(
        '--log-mlflow',
        action='store_true',
        help='Log experiments to MLflow'
    )
    
    args = parser.parse_args()
    
    # Initialize trainer
    trainer = CLVModelTrainer(
        output_dir=args.output_dir,
        log_mlflow=args.log_mlflow
    )
    
    # Train all models
    try:
        results = trainer.train_all_models(
            data_path=args.data_path,
            test_size=args.test_size
        )
        
        logger.info("\n✅ Training completed successfully!")
        
    except Exception as e:
        logger.error(f"❌ Training failed: {e}", exc_info=True)
        sys.exit(1)


if __name__ == "__main__":
    main()
