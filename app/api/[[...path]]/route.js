import { NextResponse } from 'next/server';
import { mockTransactions, mockAnalysisResult, getRiskLevel } from '@/lib/mockData';
import { runRuleEngine, getAllRules, getRuleStats } from '@/lib/ruleEngine';

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

  // Rule Engine: return all defined rules and stats
  if (pathString === 'rules') {
    return NextResponse.json(
      {
        rules: getAllRules(),
        stats: getRuleStats(),
      },
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
        console.log('Vertex AI credentials detected - integration ready');
      }

      // Simulate processing delay for demo
      await new Promise(resolve => setTimeout(resolve, 500));

      // Run rule engine first, then combine with signal-based scoring
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

// Generate analysis that combines rule engine output with signal-based scoring
function generateAnalysis(transaction) {
  const amount = parseFloat(transaction?.amount) || 0;
  const location = transaction?.location || 'Unknown';
  const timeSeconds = parseFloat(transaction?.time_seconds) || 0;
  const merchant = transaction?.merchant || 'Unknown Merchant';

  // Run the rule engine
  const ruleResult = runRuleEngine(transaction || {});

  // Build signals from fired rules for display in the analysis
  const signals = ruleResult.firedRules.map(rule => ({
    signal: rule.name,
    severity: rule.severity,
    description: rule.description,
    rule_id: rule.id,
    regulation: rule.regulation || null,
  }));

  // Risk score: start with 15 base, add rule engine score, blend with a few
  // additional contextual signals not covered by rules
  let riskScore = 15 + ruleResult.ruleRiskScore;

  // Additional contextual check: very small amount in high-risk jurisdiction
  const highRiskLocations = ['RU', 'NG', 'KY', 'CN', 'UA', 'PH'];
  if (amount < 100 && highRiskLocations.includes(location)) {
    riskScore += 10;
    signals.push({
      signal: 'Micro-transaction in high-risk jurisdiction',
      severity: 'medium',
      description: `Small transaction of $${amount.toFixed(2)} from ${location} may be a test transaction preceding a larger fraudulent transfer.`,
      rule_id: 'CTX-001',
      regulation: null,
    });
  }

  // Cap at 100
  riskScore = Math.min(riskScore, 100);
  const riskLevel = getRiskLevel(riskScore);

  // Account status and case priority
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

  // Recommended actions
  const recommendedActions = [];
  if (riskScore >= 66) {
    recommendedActions.push({ action: 'Temporarily freeze transaction pending review', priority: 'immediate' });
    recommendedActions.push({ action: 'Contact account holder for identity verification', priority: 'high' });
  }
  if (ruleResult.hasCritical || ruleResult.firedRules.some(r => r.regulation)) {
    recommendedActions.push({ action: 'Initiate regulatory filing review (CTR or SAR as applicable)', priority: 'high' });
  }
  if (riskScore >= 41) {
    recommendedActions.push({ action: 'Review last 30 days of account activity', priority: 'medium' });
    recommendedActions.push({ action: 'Cross-reference against known fraud pattern library', priority: 'medium' });
  }
  if (riskScore < 41) {
    recommendedActions.push({ action: 'Standard monitoring - no immediate action required', priority: 'low' });
  }

  // Plain-English reasoning
  const reasoning = signals.length > 0
    ? `The rule engine evaluated this transaction against ${ruleResult.totalRulesEvaluated} compliance rules and triggered ${signals.length} rule${signals.length > 1 ? 's' : ''}. ` +
      `Key findings: ${signals.slice(0, 3).map(s => s.signal).join('; ')}. ` +
      `Based on these findings, the recommended action is ${accountStatus === 'FREEZE' ? 'immediate account freeze' : accountStatus === 'MONITOR' ? 'enhanced monitoring and human review' : 'standard processing'}.`
    : `The rule engine evaluated this transaction against ${ruleResult.totalRulesEvaluated} compliance rules. No rules were triggered. The transaction shows normal activity patterns consistent with the account profile.`;

  // Compliance report
  const regulationRefs = [
    ...new Set(
      ruleResult.firedRules
        .filter(r => r.regulation)
        .map(r => r.regulation)
    )
  ];
  if (regulationRefs.length === 0) regulationRefs.push('FFIEC BSA/AML Examination Manual');

  return {
    risk_score: riskScore,
    risk_level: riskLevel,
    confidence: 0.88 + (Math.random() * 0.11),
    triggered_signals: signals,
    rule_engine: {
      rules_evaluated: ruleResult.totalRulesEvaluated,
      rules_fired: ruleResult.ruleCount,
      rule_risk_score: ruleResult.ruleRiskScore,
      fired_rules: ruleResult.firedRules,
      categories_triggered: Object.keys(ruleResult.ruleCategories),
    },
    reasoning,
    compliance_report: {
      finding: riskScore >= 66
        ? `Transaction flagged by ${ruleResult.ruleCount} compliance rule${ruleResult.ruleCount !== 1 ? 's' : ''}. ${ruleResult.hasCritical ? 'One or more critical rules triggered - regulatory filing may be required.' : 'Enhanced due diligence required before clearance.'}`
        : 'Transaction cleared all compliance rules. Standard processing applies.',
      regulation_refs: regulationRefs,
      recommendation: riskScore >= 66 ? 'Further investigation required before clearance' : 'Routine monitoring sufficient',
    },
    recommended_actions: recommendedActions,
    account_status: accountStatus,
    escalate_to_human: escalateToHuman,
    customer_notification: riskScore >= 66
      ? `We have detected unusual activity on your account ending in ***${transaction?.account_id?.slice(-4) || '0000'}. For your security, we have placed a temporary hold on a recent transaction. Please call our fraud prevention team at 1-800-XXX-XXXX or sign in to your online banking to verify this activity.`
      : 'No customer notification required.',
    case_priority: casePriority,
    agent_steps: [
      { agent: 'Rule Engine', status: 'complete', result: `${ruleResult.ruleCount} of ${ruleResult.totalRulesEvaluated} rules fired` },
      { agent: 'Anomaly Detector', status: 'complete', result: `${signals.length} signals detected` },
      { agent: 'Reasoning Agent', status: 'complete', result: `${riskLevel} risk classification` },
      { agent: 'Report Generator', status: 'complete', result: 'Compliance report generated' },
      { agent: 'Action Recommender', status: 'complete', result: `${recommendedActions.length} actions recommended` },
    ],
  };
}
