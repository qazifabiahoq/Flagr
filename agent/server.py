from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, Dict, Any
import os
import json
import asyncio

app = FastAPI(
    title="Flagr Agent API",
    description="Multi-agent fraud intelligence backend powered by Google ADK",
    version="1.0.0"
)

# Enable CORS for all origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Transaction input model
class Transaction(BaseModel):
    transaction_id: Optional[str] = None
    account_id: Optional[str] = None
    amount: float
    time_seconds: Optional[float] = None
    merchant: Optional[str] = None
    location: Optional[str] = None
    device_ip: Optional[str] = None
    features: Optional[Dict[str, float]] = None

class AnalyzeRequest(BaseModel):
    transaction: Transaction

# Cache for loaded transactions
_transactions_cache = None

def load_kaggle_transactions():
    """Load credit card fraud dataset from Kaggle using kagglehub"""
    global _transactions_cache
    
    if _transactions_cache is not None:
        return _transactions_cache
    
    try:
        import kagglehub
        import pandas as pd
        
        # Download the dataset
        path = kagglehub.dataset_download("mlg-ulb/creditcardfraud")
        df = pd.read_csv(f"{path}/creditcard.csv")
        
        # Get 10 fraud and 10 legitimate transactions
        fraud = df[df['Class'] == 1].head(10)
        legit = df[df['Class'] == 0].head(10)
        sample = pd.concat([fraud, legit]).sample(frac=1).reset_index(drop=True)
        
        merchants = [
            "Global Electronics Ltd", "Amazon.com", "Unknown Merchant",
            "Spotify Premium", "Crypto Exchange XYZ", "Uber Technologies",
            "Wire Transfer - Offshore", "Target Stores", "Gaming Credits Inc",
            "Netflix Inc", "Whole Foods Market", "Electronics Depot",
            "Starbucks Coffee", "Investment Platform Z", "Home Depot",
            "Luxury Goods International", "CVS Pharmacy", "Digital Currency Exchange",
            "Best Buy Electronics", "PayPal Transfer"
        ]
        
        locations = ["US", "EU", "RU", "CN", "KY", "NG", "UA", "MX", "HK", "AE", "PH", "CA"]
        
        def format_transaction(row, idx):
            return {
                "transaction_id": f"TXN-{1000 + idx}",
                "account_id": f"ACC-{5000 + idx}",
                "amount": round(float(row['Amount']), 2),
                "time_seconds": float(row['Time']),
                "merchant": merchants[idx % len(merchants)],
                "location": locations[idx % len(locations)],
                "device_ip": f"192.168.{idx}.{idx + 1}",
                "features": {k: float(row[k]) for k in df.columns if k.startswith('V')},
                "actual_label": int(row['Class'])
            }
        
        _transactions_cache = [format_transaction(row, i) for i, row in sample.iterrows()]
        return _transactions_cache
        
    except Exception as e:
        print(f"Error loading Kaggle data: {e}")
        # Return mock data if Kaggle fails
        return get_mock_transactions()

def get_mock_transactions():
    """Fallback mock transactions if Kaggle is unavailable"""
    return [
        {
            "transaction_id": f"TXN-{1000 + i}",
            "account_id": f"ACC-{5000 + i}",
            "amount": [2489.50, 45.99, 8750.00, 129.00, 3299.99, 67.50, 15000.00, 234.00, 4500.00, 89.99][i % 10],
            "time_seconds": [84600, 32400, 3600, 43200, 7200, 54000, 10800, 61200, 14400, 68400][i % 10],
            "merchant": ["Global Electronics Ltd", "Amazon.com", "Unknown Merchant", "Spotify Premium", "Crypto Exchange XYZ", "Uber Technologies", "Wire Transfer - Offshore", "Target Stores", "Gaming Credits Inc", "Netflix Inc"][i % 10],
            "location": ["EU", "US", "RU", "US", "CN", "US", "KY", "US", "UA", "CA"][i % 10],
            "device_ip": f"192.168.{i}.1",
            "actual_label": 1 if i % 2 == 0 else 0
        }
        for i in range(20)
    ]

async def run_flagr_agent(transaction: dict) -> dict:
    """Run the Flagr multi-agent pipeline on a transaction"""
    try:
        from flagr_agent import root_agent
        from google.adk.runners import Runner
        from google.adk.sessions import InMemorySessionService
        from google.genai import types
        
        # Create session service and runner
        session_service = InMemorySessionService()
        runner = Runner(
            agent=root_agent,
            app_name="flagr",
            session_service=session_service
        )
        
        # Create session
        session_id = transaction.get('transaction_id', 'session-default')
        session = await session_service.create_session(
            app_name="flagr",
            user_id="compliance-officer",
            session_id=session_id
        )
        
        # Format the transaction as a prompt
        prompt = f"""Analyze this bank transaction for fraud:

Transaction ID: {transaction.get('transaction_id', 'N/A')}
Account ID: {transaction.get('account_id', 'N/A')}
Amount: ${transaction.get('amount', 0)}
Time (seconds from midnight): {transaction.get('time_seconds', 0)}
Location: {transaction.get('location', 'Unknown')}
Device IP: {transaction.get('device_ip', 'Unknown')}
Merchant: {transaction.get('merchant', 'Unknown')}

Run all 4 agents and return the final action recommendation as JSON."""
        
        # Run the agent
        content = types.Content(
            role="user",
            parts=[types.Part(text=prompt)]
        )
        
        final_response = None
        async for event in runner.run_async(
            user_id="compliance-officer",
            session_id=session_id,
            new_message=content
        ):
            if hasattr(event, 'content') and event.content:
                final_response = event.content
        
        # Parse the response
        if final_response and final_response.parts:
            response_text = final_response.parts[0].text
            # Try to extract JSON from response
            try:
                # Clean up response if it has markdown
                clean_text = response_text.replace("```json", "").replace("```", "").strip()
                return json.loads(clean_text)
            except json.JSONDecodeError:
                return {"raw_response": response_text, "error": "Could not parse JSON"}
        
        return {"error": "No response from agent"}
        
    except ImportError as e:
        print(f"Import error: {e}")
        # Fallback to mock analysis if google-adk is not available
        return generate_mock_analysis(transaction)
    except Exception as e:
        print(f"Agent error: {e}")
        return generate_mock_analysis(transaction)

def generate_mock_analysis(transaction: dict) -> dict:
    """Generate mock analysis when agent is unavailable"""
    import random
    import string
    from datetime import datetime
    
    amount = float(transaction.get('amount', 0))
    location = transaction.get('location', 'US')
    time_seconds = float(transaction.get('time_seconds', 43200))
    merchant = transaction.get('merchant', 'Unknown')
    
    # Calculate risk score based on factors
    risk_score = 20
    triggered_signals = []
    
    # Amount risk
    if amount > 5000:
        risk_score += 30
        triggered_signals.append("High transaction amount exceeds threshold")
    elif amount > 1000:
        risk_score += 15
        triggered_signals.append("Elevated transaction amount")
    
    # Location risk
    high_risk_locations = ['RU', 'NG', 'KY', 'CN', 'UA', 'PH']
    medium_risk_locations = ['MX', 'HK', 'AE', 'EU']
    if location in high_risk_locations:
        risk_score += 25
        triggered_signals.append(f"High-risk geographic location: {location}")
    elif location in medium_risk_locations:
        risk_score += 10
        triggered_signals.append(f"Moderate-risk location: {location}")
    
    # Time risk
    hours = int(time_seconds / 3600)
    if 0 <= hours <= 5:
        risk_score += 20
        triggered_signals.append(f"Unusual transaction time: {hours}:00")
    
    # Merchant risk
    risky_merchants = ['Unknown', 'Crypto', 'Wire Transfer', 'Gaming', 'Digital Currency']
    if any(rm.lower() in merchant.lower() for rm in risky_merchants):
        risk_score += 20
        triggered_signals.append(f"High-risk merchant category: {merchant}")
    
    risk_score = min(risk_score, 100)
    
    # Determine risk level
    if risk_score >= 90:
        risk_level = "CRITICAL"
        recommended_action = "BLOCK"
        account_status = "SUSPEND"
        case_priority = "URGENT"
    elif risk_score >= 66:
        risk_level = "HIGH"
        recommended_action = "BLOCK"
        account_status = "FREEZE"
        case_priority = "HIGH"
    elif risk_score >= 41:
        risk_level = "MEDIUM"
        recommended_action = "REVIEW"
        account_status = "MONITOR"
        case_priority = "MEDIUM"
    else:
        risk_level = "LOW"
        recommended_action = "APPROVE"
        account_status = "NO_CHANGE"
        case_priority = "LOW"
    
    report_id = ''.join(random.choices(string.ascii_uppercase + string.digits, k=10))
    
    return {
        "report_id": report_id,
        "risk_score": risk_score,
        "risk_level": risk_level,
        "confidence": round(85 + random.random() * 14, 2),
        "triggered_signals": triggered_signals,
        "reasoning": f"This transaction exhibits {len(triggered_signals)} risk indicator(s). " + 
                     " ".join(triggered_signals[:2]) + 
                     f" Based on our multi-agent analysis pipeline, we recommend {recommended_action.lower()}.",
        "executive_summary": f"{risk_level} risk transaction requiring {recommended_action.lower()} action.",
        "detailed_findings": f"Transaction analysis completed. Risk score: {risk_score}/100. " +
                            f"Primary concerns: {', '.join(triggered_signals[:3]) if triggered_signals else 'None identified'}. " +
                            f"Recommended action: {recommended_action}.",
        "compliance_flags": ["BSA/AML Review", "FFIEC Guidelines", "SAR Filing Requirements"] if risk_score >= 66 else [],
        "recommended_action": recommended_action,
        "immediate_actions": [
            "Temporarily freeze transaction" if risk_score >= 66 else "Continue monitoring",
            "Contact account holder for verification" if risk_score >= 41 else "No action required",
            "Review last 30 days of account activity" if risk_score >= 41 else "Standard processing"
        ],
        "customer_notification": f"We've detected unusual activity on your account. For your security, we've {'placed a hold on' if risk_score >= 66 else 'flagged'} a recent transaction. Please contact our fraud prevention team." if risk_score >= 41 else "No notification required.",
        "account_status": account_status,
        "escalate_to_human": risk_score >= 41,
        "escalation_reason": f"Risk score {risk_score} exceeds threshold for automatic approval" if risk_score >= 41 else None,
        "case_priority": case_priority,
        "agent_steps": [
            {"agent": "Anomaly Detector", "status": "complete", "result": f"{len(triggered_signals)} anomalies detected"},
            {"agent": "Reasoning Agent", "status": "complete", "result": f"{risk_level} fraud probability"},
            {"agent": "Report Generator", "status": "complete", "result": "Compliance report generated"},
            {"agent": "Action Recommender", "status": "complete", "result": f"{recommended_action} recommended"}
        ],
        "mock": True
    }

@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "service": "Flagr Agent API",
        "status": "healthy",
        "version": "1.0.0"
    }

@app.get("/api/health")
async def health():
    """Health check endpoint"""
    return {"status": "healthy"}

@app.get("/api/transactions")
async def get_transactions():
    """Load and return transactions from Kaggle credit card fraud dataset"""
    try:
        transactions = load_kaggle_transactions()
        return {"transactions": transactions}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/analyze")
async def analyze_transaction(request: AnalyzeRequest):
    """Analyze a transaction using the Flagr multi-agent pipeline"""
    try:
        transaction_dict = request.transaction.model_dump()
        result = await run_flagr_agent(transaction_dict)
        return {"analysis": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/stats")
async def get_stats():
    """Get transaction statistics"""
    transactions = load_kaggle_transactions()
    
    # Calculate stats based on mock risk scores
    stats = {
        "total": len(transactions),
        "flagged": sum(1 for t in transactions if t.get('actual_label') == 1),
        "blocked": 0,
        "review": 0,
        "clear": sum(1 for t in transactions if t.get('actual_label') == 0)
    }
    
    return {"stats": stats}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
