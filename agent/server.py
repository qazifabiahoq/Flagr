import os
os.environ["GOOGLE_API_KEY"] = os.environ.get("GOOGLE_API_KEY", "")

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, Dict, Any
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

        # Ensure kagglehub picks up the token from environment
        kaggle_token = os.environ.get("KAGGLE_TOKEN", "")
        if kaggle_token:
            os.environ["KAGGLE_TOKEN"] = kaggle_token

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
    
    # Check if GOOGLE_API_KEY is set
    if not os.environ.get("GOOGLE_API_KEY"):
        raise HTTPException(status_code=500, detail="GOOGLE_API_KEY not configured")
    
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
                result = json.loads(clean_text)
                return result
            except json.JSONDecodeError:
                return {"raw_response": response_text, "error": "Could not parse JSON"}
        
        raise HTTPException(status_code=500, detail="No response from agent")
        
    except HTTPException:
        raise
    except ImportError as e:
        raise HTTPException(status_code=500, detail=f"Import error: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Agent error: {str(e)}")

@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "service": "Flagr Agent API",
        "status": "healthy",
        "version": "1.0.0",
        "google_api_key_set": bool(os.environ.get("GOOGLE_API_KEY"))
    }

@app.get("/api/health")
async def health():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "google_api_key_set": bool(os.environ.get("GOOGLE_API_KEY"))
    }

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
    transaction_dict = request.transaction.model_dump()
    result = await run_flagr_agent(transaction_dict)
    return {"analysis": result}

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
