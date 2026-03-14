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

TRANSACTIONS = [
    {"transaction_id": "TXN-1001", "account_id": "ACC-5001", "amount": 12450.00, "time_seconds": 84600, "merchant": "Crypto Exchange XYZ", "location": "RU", "device_ip": "185.220.101.45", "actual_label": 1},
    {"transaction_id": "TXN-1002", "account_id": "ACC-5002", "amount": 34.99,    "time_seconds": 32400, "merchant": "Netflix Inc",           "location": "US", "device_ip": "192.168.1.10",   "actual_label": 0},
    {"transaction_id": "TXN-1003", "account_id": "ACC-5003", "amount": 9870.50,  "time_seconds": 3600,  "merchant": "Unknown Merchant",       "location": "NG", "device_ip": "41.58.92.17",    "actual_label": 1},
    {"transaction_id": "TXN-1004", "account_id": "ACC-5004", "amount": 129.00,   "time_seconds": 43200, "merchant": "Spotify Premium",        "location": "US", "device_ip": "192.168.2.5",    "actual_label": 0},
    {"transaction_id": "TXN-1005", "account_id": "ACC-5005", "amount": 24999.99, "time_seconds": 2100,  "merchant": "Wire Transfer - Offshore","location": "KY", "device_ip": "103.45.67.89",   "actual_label": 1},
    {"transaction_id": "TXN-1006", "account_id": "ACC-5006", "amount": 67.50,    "time_seconds": 54000, "merchant": "Uber Technologies",      "location": "US", "device_ip": "10.0.0.22",      "actual_label": 0},
    {"transaction_id": "TXN-1007", "account_id": "ACC-5007", "amount": 18750.00, "time_seconds": 900,   "merchant": "Digital Gold Exchange",  "location": "AE", "device_ip": "213.108.105.3",  "actual_label": 1},
    {"transaction_id": "TXN-1008", "account_id": "ACC-5008", "amount": 234.00,   "time_seconds": 61200, "merchant": "Target Stores",          "location": "US", "device_ip": "192.168.3.8",    "actual_label": 0},
    {"transaction_id": "TXN-1009", "account_id": "ACC-5009", "amount": 5500.00,  "time_seconds": 7200,  "merchant": "Gaming Credits Inc",     "location": "UA", "device_ip": "91.200.12.54",   "actual_label": 1},
    {"transaction_id": "TXN-1010", "account_id": "ACC-5010", "amount": 89.99,    "time_seconds": 68400, "merchant": "Whole Foods Market",     "location": "US", "device_ip": "172.16.0.5",     "actual_label": 0},
    {"transaction_id": "TXN-1011", "account_id": "ACC-5011", "amount": 47300.00, "time_seconds": 1200,  "merchant": "Offshore Asset Transfer","location": "CN", "device_ip": "36.110.50.97",   "actual_label": 1},
    {"transaction_id": "TXN-1012", "account_id": "ACC-5012", "amount": 156.78,   "time_seconds": 72000, "merchant": "Amazon.com",             "location": "US", "device_ip": "192.168.4.2",    "actual_label": 0},
    {"transaction_id": "TXN-1013", "account_id": "ACC-5013", "amount": 3299.99,  "time_seconds": 10800, "merchant": "Luxury Goods Intl",      "location": "HK", "device_ip": "59.148.22.11",   "actual_label": 1},
    {"transaction_id": "TXN-1014", "account_id": "ACC-5014", "amount": 45.00,    "time_seconds": 57600, "merchant": "Starbucks Coffee",       "location": "US", "device_ip": "10.0.1.3",       "actual_label": 0},
    {"transaction_id": "TXN-1015", "account_id": "ACC-5015", "amount": 8900.00,  "time_seconds": 4500,  "merchant": "Crypto ATM Network",     "location": "MX", "device_ip": "187.216.33.45",  "actual_label": 1},
    {"transaction_id": "TXN-1016", "account_id": "ACC-5016", "amount": 312.40,   "time_seconds": 50400, "merchant": "Best Buy Electronics",   "location": "CA", "device_ip": "192.168.5.7",    "actual_label": 0},
    {"transaction_id": "TXN-1017", "account_id": "ACC-5017", "amount": 15600.00, "time_seconds": 3000,  "merchant": "Darknet Marketplace",    "location": "TOR","device_ip": "198.96.155.3",   "actual_label": 1},
    {"transaction_id": "TXN-1018", "account_id": "ACC-5018", "amount": 78.25,    "time_seconds": 46800, "merchant": "CVS Pharmacy",           "location": "US", "device_ip": "10.0.2.9",       "actual_label": 0},
    {"transaction_id": "TXN-1019", "account_id": "ACC-5019", "amount": 6750.00,  "time_seconds": 5400,  "merchant": "Investment Platform Z",  "location": "PH", "device_ip": "112.198.77.22",  "actual_label": 1},
    {"transaction_id": "TXN-1020", "account_id": "ACC-5020", "amount": 199.99,   "time_seconds": 64800, "merchant": "Home Depot",             "location": "US", "device_ip": "192.168.6.4",    "actual_label": 0},
    {"transaction_id": "TXN-1021", "account_id": "ACC-5021", "amount": 31200.00, "time_seconds": 600,   "merchant": "Anonymous Wire Transfer","location": "KY", "device_ip": "45.33.32.156",   "actual_label": 1},
    {"transaction_id": "TXN-1022", "account_id": "ACC-5022", "amount": 55.00,    "time_seconds": 36000, "merchant": "Spotify Premium",        "location": "US", "device_ip": "172.16.1.2",     "actual_label": 0},
    {"transaction_id": "TXN-1023", "account_id": "ACC-5023", "amount": 4200.00,  "time_seconds": 8100,  "merchant": "FX Trading Platform",   "location": "EU", "device_ip": "185.130.44.55",  "actual_label": 1},
    {"transaction_id": "TXN-1024", "account_id": "ACC-5024", "amount": 23.49,    "time_seconds": 75600, "merchant": "McDonald's",             "location": "US", "device_ip": "10.0.3.7",       "actual_label": 0},
    {"transaction_id": "TXN-1025", "account_id": "ACC-5025", "amount": 11000.00, "time_seconds": 2700,  "merchant": "Shell Company Ltd",      "location": "PA", "device_ip": "200.55.99.12",   "actual_label": 1},
]

def load_transactions():
    return TRANSACTIONS

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
    """Return fraud detection transactions"""
    return {"transactions": load_transactions()}

@app.post("/api/analyze")
async def analyze_transaction(request: AnalyzeRequest):
    """Analyze a transaction using the Flagr multi-agent pipeline"""
    transaction_dict = request.transaction.model_dump()
    result = await run_flagr_agent(transaction_dict)
    return {"analysis": result}

@app.get("/api/stats")
async def get_stats():
    """Get transaction statistics"""
    transactions = load_transactions()
    fraud = [t for t in transactions if t.get('actual_label') == 1]
    legit = [t for t in transactions if t.get('actual_label') == 0]
    stats = {
        "total": len(transactions),
        "flagged": len(fraud) // 2,
        "blocked": len(fraud) // 3,
        "review": len(fraud) - (len(fraud) // 2) - (len(fraud) // 3),
        "clear": len(legit),
    }
    return {"stats": stats}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
