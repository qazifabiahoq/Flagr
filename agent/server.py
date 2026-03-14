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

        # Authenticate with Kaggle using available credentials
        kaggle_token = os.environ.get("KAGGLE_TOKEN", "")
        kaggle_username = os.environ.get("KAGGLE_USERNAME", "")
        kaggle_key = os.environ.get("KAGGLE_KEY", "")

        if kaggle_token:
            # New-style Access Token (KGAT_*)
            kagglehub.login(token=kaggle_token)
        elif kaggle_username and kaggle_key:
            # Legacy API key: write ~/.kaggle/kaggle.json
            import pathlib, json as _json
            kaggle_dir = pathlib.Path.home() / ".kaggle"
            kaggle_dir.mkdir(exist_ok=True)
            creds_file = kaggle_dir / "kaggle.json"
            creds_file.write_text(_json.dumps({"username": kaggle_username, "key": kaggle_key}))
            creds_file.chmod(0o600)

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
        raise

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
        "google_api_key_set": bool(os.environ.get("GOOGLE_API_KEY")),
        "kaggle_token_set": bool(os.environ.get("KAGGLE_TOKEN")),
        "kaggle_username_set": bool(os.environ.get("KAGGLE_USERNAME")),
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
