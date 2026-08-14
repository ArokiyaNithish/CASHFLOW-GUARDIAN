import pandas as pd
import numpy as np
import xgboost as xgb
import joblib
import os
from datetime import datetime

class PaymentDelayPredictor:
    def __init__(self, model_path='d:/Hackathon/backend/app/ml/payment_delay_model.joblib'):
        self.model_path = model_path
        self.model = None
        if os.path.exists(self.model_path):
            self.model = joblib.load(self.model_path)

    def _prepare_features(self, df: pd.DataFrame) -> pd.DataFrame:
        features = pd.DataFrame()
        features['avg_delay_days'] = df['avg_delay_days']
        features['std_delay_days'] = df['std_delay_days']
        features['invoice_amount_bin'] = pd.qcut(df['amount'], q=5, labels=False, duplicates='drop')
        
        issue_dates = pd.to_datetime(df['issue_date'])
        due_dates = pd.to_datetime(df['due_date'])
        now = datetime.now()
        
        features['days_since_issue'] = (now - issue_dates).dt.days
        features['is_overdue'] = (now > due_dates).astype(int)
        features['month'] = issue_dates.dt.month
        return features

    def train(self, invoices_df: pd.DataFrame, customers_df: pd.DataFrame):
        df = pd.merge(invoices_df, customers_df, on='customer_id')
        df = df[df['status'] == 'paid'].copy()
        
        if df.empty:
            return
            
        due_dates = pd.to_datetime(df['due_date'])
        pay_dates = pd.to_datetime(df['actual_pay_date'])
        y = (pay_dates - due_dates).dt.days
        
        X = self._prepare_features(df)
        
        self.model = xgb.XGBRegressor(n_estimators=100, learning_rate=0.1, max_depth=5, random_state=42)
        self.model.fit(X, y)
        joblib.dump(self.model, self.model_path)

    def predict(self, invoice_dict: dict, customer_dict: dict):
        if not self.model:
            # Fallback heuristic
            return customer_dict.get('avg_delay_days', 0.0), 0.5
            
        df = pd.DataFrame([{**invoice_dict, **customer_dict}])
        X = self._prepare_features(df)
        pred_delay = self.model.predict(X)[0]
        confidence = max(0.1, 1.0 - (customer_dict.get('std_delay_days', 1.0) / 10.0))
        return float(pred_delay), float(confidence)

    def predict_batch(self, invoices_df: pd.DataFrame, customers_df: pd.DataFrame) -> pd.DataFrame:
        df = pd.merge(invoices_df, customers_df, on='customer_id')
        open_invoices = df[df['status'].isin(['open', 'overdue'])].copy()
        
        if open_invoices.empty or not self.model:
            return open_invoices
            
        X = self._prepare_features(open_invoices)
        preds = self.model.predict(X)
        
        open_invoices['predicted_delay_days'] = preds
        open_invoices['predicted_pay_prob'] = 1.0 - np.clip(open_invoices['std_delay_days'] / 20.0, 0.1, 0.9)
        due_dates = pd.to_datetime(open_invoices['due_date'])
        open_invoices['predicted_pay_date'] = due_dates + pd.to_timedelta(preds, unit='D')
        
        return open_invoices
