import urllib.request
import json
import time

def test():
    base = "http://localhost:8000"
    print("Testing Backend API...")
    
    # 1. Health
    req = urllib.request.urlopen(f"{base}/health")
    print("1. Health:", req.read().decode())

    # 2. Login
    login_data = json.dumps({"email": "arun@abcprecision.com", "password": "demo1234"}).encode('utf-8')
    req = urllib.request.Request(f"{base}/auth/login", data=login_data, headers={'Content-Type': 'application/json'})
    res = json.loads(urllib.request.urlopen(req).read().decode())
    token = res["access_token"]
    headers = {'Authorization': f'Bearer {token}', 'Content-Type': 'application/json'}
    print("2. Login OK! Token:", token[:15], "...")

    # 3. Snapshot
    req = urllib.request.Request(f"{base}/companies/abc-precision-001/snapshot", headers=headers)
    snap = json.loads(urllib.request.urlopen(req).read().decode())
    print("3. Snapshot:", snap["health_label"], "| Cash:", snap["current_cash"], "| Risk:", snap["risk_score"])

    # 4. Forecast
    req = urllib.request.Request(f"{base}/companies/abc-precision-001/forecast", data=b'{}', headers=headers)
    fc = json.loads(urllib.request.urlopen(req).read().decode())
    forecast_id = fc["forecast_id"]
    print("4. Forecast generated:", forecast_id, "| Deficit Day:", fc.get("deficit_day"), "| Risk:", fc.get("risk_score"))

    # 5. Plan
    req = urllib.request.Request(f"{base}/forecasts/{forecast_id}/plan", data=b'{}', headers=headers)
    plan = json.loads(urllib.request.urlopen(req).read().decode())
    plan_id = plan["plan_id"]
    print("5. Plan generated! Recommended Option:", plan["recommended_option"], "| Options count:", len(plan["options"]))

    # 6. Approve Plan
    req = urllib.request.Request(f"{base}/plans/{plan_id}/approve", data=b'{}', headers=headers)
    app_res = json.loads(urllib.request.urlopen(req).read().decode())
    print("6. Plan approved:", app_res["status"])

    # 7. Get Actions
    req = urllib.request.Request(f"{base}/companies/abc-precision-001/actions", headers=headers)
    actions = json.loads(urllib.request.urlopen(req).read().decode())
    print(f"7. Actions created: {len(actions)}")
    action_id = actions[0]["action_id"]

    # 8. Approve Action (L2 Gate)
    req = urllib.request.Request(f"{base}/actions/{action_id}/approve", data=b'{}', headers=headers)
    act_app = json.loads(urllib.request.urlopen(req).read().decode())
    print("8. Action L2 approved:", act_app["status"])

    # 9. Execute Action (Simulated)
    req = urllib.request.Request(f"{base}/actions/{action_id}/execute", data=b'{}', headers=headers)
    act_exec = json.loads(urllib.request.urlopen(req).read().decode())
    print("9. Action executed! New Risk Score:", act_exec["new_risk_score"])

    # 10. Ask Guardian
    ask_payload = json.dumps({"question": "Why is our cash low?"}).encode('utf-8')
    req = urllib.request.Request(f"{base}/companies/abc-precision-001/ask", data=ask_payload, headers=headers)
    ask_res = json.loads(urllib.request.urlopen(req).read().decode())
    print("\n10. Ask Guardian Answer:\n", ask_res["answer"][:180].replace("₹", "Rs."), "...\n")

    print("ALL 10 API INTEGRATION TESTS PASSED PERFECTLY!")

if __name__ == "__main__":
    test()
