import { NextResponse } from 'next/server';
import { mockTransactions, mockAnalysisResult, getRiskLevel } from '@/lib/mockData';

// Helper to add CORS headers
function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };
}

// Handle OPTIONS requests for CORS
export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders() });
}

export async function GET(request, { params }) {
  const path = params?.path || [];
  const pathString = path.join('/');

  // Health check
  if (pathString === 'health') {
    return NextResponse.json(
      { status: 'healthy', timestamp: new Date().toISOString() },
      { headers: corsHeaders() }
    );
  }

  // Get all transactions
  if (pathString === 'transactions') {
    return NextResponse.json(
      { transactions: mockTransactions },
      { headers: corsHeaders() }
    );
  }

  // Get single transaction
  if (pathString.startsWith('transactions/')) {
    const txnId = path[1];
    const transaction = mockTransactions.find(t => t.transaction_id === txnId);
    if (transaction) {
      return NextResponse.json(
        { transaction },
        { headers: corsHeaders() }
      );
    }
    return NextResponse.json(
      { error: 'Transaction not found' },
      { status: 404, headers: corsHeaders() }
    );
  }

  // Get alerts (high risk transactions only)
  if (pathString === 'alerts') {
    const alerts = mockTransactions.filter(t => t.risk_score >= 66);
    return NextResponse.json(
      { alerts: alerts.sort((a, b) => b.risk_score - a.risk_score) },
      { headers: corsHeaders() }
    );
  }

  // Get dashboard stats
  if (pathString === 'stats') {
    const stats = {
      total: mockTransactions.length,
      flagged: mockTransactions.filter(t => t.status === 'flagged').length,
      blocked: mockTransactions.filter(t => t.status === 'blocked').length,
      review: mockTransactions.filter(t => t.status === 'review').length,
      clear: mockTransactions.filter(t => t.status === 'clear').length,
    };
    return NextResponse.json(
      { stats },
      { headers: corsHeaders() }
    );
  }

  return NextResponse.json(
    { error: 'Not found', path: pathString },
    { status: 404, headers: corsHeaders() }
  );
}

export async function POST(request, { params }) {
  const path = params?.path || [];
  const pathString = path.join('/');

  // Analyze transaction endpoint
  if (pathString === 'analyze') {
    try {
      const body = await request.json();
      const { transaction } = body;

      // Check if we have Vertex AI credentials configured
      const hasVertexAI = process.env.GOOGLE_PROJECT_ID && 
                          process.env.VERTEX_AGENT_ID && 
                          process.env.GOOGLE_CREDENTIALS_JSON;

      if (hasVertexAI) {
        // Real Vertex AI analysis would go here
        // For now, return mock data with a note
        console.log('Vertex AI credentials detected - integration ready');
        // TODO: Implement actual Vertex AI Dialogflow call
        // const projectId = process.env.GOOGLE_PROJECT_ID;
        // const location = process.env.GOOGLE_LOCATION || 'us-central1';
        // const agentId = process.env.VERTEX_AGENT_ID;
        // const credentialsJson = process.env.GOOGLE_CREDENTIALS_JSON;
      }

      // Simulate processing delay for demo
      await new Promise(resolve => setTimeout(resolve, 500));

      // Generate mock analysis based on transaction data
      const analysis = generateAnalysis(transaction);

      return NextResponse.json(
        { analysis, mock: !hasVertexAI },
        { headers: corsHeaders() }
      );
    } catch (error) {
      console.error('Analysis error:', error);
      return NextResponse.json(
        { error: 'Analysis failed', details: error.message },
        { status: 500, headers: corsHeaders() }
      );
    }
  }

  return NextResponse.json(
    { error: 'Not found' },
    { status: 404, headers: corsHeaders() }
  );
}

// Generate realistic mock analysis based on transaction
function generateAnalysis(transaction) {
  const amount = parseFloat(transaction?.amount) || 0;
  const location = transaction?.location || 'Unknown';
  const timeSeconds = parseFloat(transaction?.time_seconds) || 0;
  const merchant = transaction?.merchant || 'Unknown Merchant';

  // Calculate risk score based on factors
  let riskScore = 20;
  const signals = [];

  // Amount risk
  if (amount > 5000) {
    riskScore += 30;
    signals.push({
      signal: "High transaction amount",
      severity: "high",
      description: `Transaction amount of $${amount.toFixed(2)} exceeds monitoring threshold`
    });
  } else if (amount > 1000) {
    riskScore += 15;
    signals.push({
      signal: "Elevated transaction amount",
      severity: "medium",
      description: `Transaction amount of $${amount.toFixed(2)} requires additional review`
    });
  }

  // Location risk
  const highRiskLocations = ['RU', 'NG', 'KY', 'CN', 'UA', 'PH'];
  const mediumRiskLocations = ['MX', 'HK', 'AE', 'EU'];
  if (highRiskLocations.includes(location)) {
    riskScore += 25;
    signals.push({
      signal: "High-risk geographic location",
      severity: "high",
      description: `Transaction originated from ${location}, a region with elevated fraud rates`
    });
  } else if (mediumRiskLocations.includes(location)) {
    riskScore += 10;
    signals.push({
      signal: "Moderate-risk location",
      severity: "medium",
      description: `Transaction from ${location} flagged for geographic review`
    });
  }

  // Time risk (late night/early morning transactions)
  const hours = Math.floor(timeSeconds / 3600);
  if (hours >= 0 && hours <= 5) {
    riskScore += 20;
    signals.push({
      signal: "Unusual transaction time",
      severity: "high",
      description: `Transaction at ${hours}:${Math.floor((timeSeconds % 3600) / 60).toString().padStart(2, '0')} - outside normal business hours`
    });
  }

  // Merchant risk
  const riskyMerchants = ['Unknown Merchant', 'Crypto', 'Wire Transfer', 'Gaming', 'Digital Currency'];
  const isRiskyMerchant = riskyMerchants.some(rm => merchant.toLowerCase().includes(rm.toLowerCase()));
  if (isRiskyMerchant) {
    riskScore += 20;
    signals.push({
      signal: "High-risk merchant category",
      severity: "high",
      description: `Merchant "${merchant}" associated with elevated fraud risk`
    });
  }

  // Cap risk score at 100
  riskScore = Math.min(riskScore, 100);
  const riskLevel = getRiskLevel(riskScore);

  // Determine account status
  let accountStatus = 'NO_CHANGE';
  let casePriority = 'STANDARD';
  let escalateToHuman = false;

  if (riskScore >= 90) {
    accountStatus = 'FREEZE';
    casePriority = 'URGENT';
    escalateToHuman = true;
  } else if (riskScore >= 66) {
    accountStatus = 'MONITOR';
    casePriority = 'HIGH';
    escalateToHuman = true;
  } else if (riskScore >= 41) {
    accountStatus = 'MONITOR';
    casePriority = 'MEDIUM';
  }

  // Generate recommended actions
  const recommendedActions = [];
  if (riskScore >= 66) {
    recommendedActions.push({ action: "Temporarily freeze transaction", priority: "immediate" });
    recommendedActions.push({ action: "Contact account holder for verification", priority: "high" });
  }
  if (riskScore >= 41) {
    recommendedActions.push({ action: "Review last 30 days of account activity", priority: "medium" });
    recommendedActions.push({ action: "Cross-reference with known fraud patterns", priority: "medium" });
  }
  if (riskScore < 41) {
    recommendedActions.push({ action: "Standard monitoring - no immediate action required", priority: "low" });
  }

  // Generate reasoning
  const reasoning = signals.length > 0
    ? `This transaction exhibits ${signals.length} risk indicator${signals.length > 1 ? 's' : ''}. ${signals.map(s => s.description).join('. ')}. Based on our multi-agent analysis pipeline, we recommend ${accountStatus === 'FREEZE' ? 'immediate account freeze' : accountStatus === 'MONITOR' ? 'enhanced monitoring' : 'standard processing'}.`
    : `This transaction shows normal activity patterns. No significant risk indicators detected. Recommended for standard processing.`;

  return {
    risk_score: riskScore,
    risk_level: riskLevel,
    confidence: 0.85 + (Math.random() * 0.14),
    triggered_signals: signals,
    reasoning,
    compliance_report: {
      finding: riskScore >= 66 ? "Transaction flagged for potential AML/CFT review" : "Transaction cleared for standard processing",
      regulation_refs: ["BSA/AML", "FFIEC Guidelines", "SAR Filing Requirements"],
      recommendation: riskScore >= 66 ? "Further investigation recommended before clearance" : "Routine monitoring sufficient"
    },
    recommended_actions: recommendedActions,
    account_status: accountStatus,
    escalate_to_human: escalateToHuman,
    customer_notification: riskScore >= 66
      ? `We've detected unusual activity on your account ending in ***${transaction?.account_id?.slice(-4) || '0000'}. For your security, we've placed a temporary hold on a recent transaction. Please call our fraud prevention team at 1-800-XXX-XXXX or log into your online banking to verify this activity.`
      : "No customer notification required.",
    case_priority: casePriority,
    agent_steps: [
      { agent: "Anomaly Detector", status: "complete", result: `${signals.length} anomalies detected` },
      { agent: "Reasoning Agent", status: "complete", result: `${riskLevel} fraud probability` },
      { agent: "Report Generator", status: "complete", result: "Compliance report generated" },
      { agent: "Action Recommender", status: "complete", result: `${recommendedActions.length} actions recommended` }
    ]
  };
}
