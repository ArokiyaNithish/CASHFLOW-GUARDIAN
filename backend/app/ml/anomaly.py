"""
Anomaly Detector — Uses Isolation Forest / Z-score to detect abnormal transaction spikes or unusual payment behavior.
Deterministic ML component — LLM never calculates anomalies directly.
"""
import numpy as np
import pandas as pd
from typing import List, Dict, Any
from sklearn.ensemble import IsolationForest


class TransactionAnomalyDetector:
    def __init__(self, contamination: float = 0.05):
        self.model = IsolationForest(contamination=contamination, random_state=42)

    def detect_anomalies(self, transactions: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Takes list of transaction dicts: [{"txn_id", "amount", "category", "counterparty", "txn_date"}]
        Returns enriched list with 'is_anomaly' (bool) and 'anomaly_score' (float).
        """
        if not transactions or len(transactions) < 5:
            return [{**t, "is_anomaly": False, "anomaly_score": 0.0} for t in transactions]

        df = pd.DataFrame(transactions)
        
        # Feature extraction: log absolute amount, category encoding
        df["abs_amount"] = df["amount"].abs()
        df["log_amount"] = np.log1p(df["abs_amount"])

        # Fit isolation forest on numerical amount features
        X = df[["abs_amount", "log_amount"]].values
        preds = self.model.fit_predict(X)
        scores = self.model.decision_function(X)

        results = []
        for idx, row in df.iterrows():
            is_anom = bool(preds[idx] == -1)
            anom_score = round(float(-scores[idx]), 3)
            item = dict(transactions[idx])
            item["is_anomaly"] = is_anom
            item["anomaly_score"] = anom_score
            results.append(item)

        return results
