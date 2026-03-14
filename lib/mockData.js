// Mock transaction data - 20 realistic synthetic transactions
export const mockTransactions = [
  {
    transaction_id: "TXN-1001",
    account_id: "ACC-5001",
    amount: 2489.50,
    time_seconds: 84600,
    merchant: "Global Electronics Ltd",
    location: "EU",
    device_ip: "192.168.1.1",
    actual_label: 1,
    risk_score: 92,
    status: "flagged"
  },
  {
    transaction_id: "TXN-1002",
    account_id: "ACC-5002",
    amount: 45.99,
    time_seconds: 32400,
    merchant: "Amazon.com",
    location: "US",
    device_ip: "192.168.2.15",
    actual_label: 0,
    risk_score: 12,
    status: "clear"
  },
  {
    transaction_id: "TXN-1003",
    account_id: "ACC-5003",
    amount: 8750.00,
    time_seconds: 3600,
    merchant: "Unknown Merchant",
    location: "RU",
    device_ip: "185.243.112.45",
    actual_label: 1,
    risk_score: 98,
    status: "blocked"
  },
  {
    transaction_id: "TXN-1004",
    account_id: "ACC-5004",
    amount: 129.00,
    time_seconds: 43200,
    merchant: "Spotify Premium",
    location: "US",
    device_ip: "192.168.4.22",
    actual_label: 0,
    risk_score: 8,
    status: "clear"
  },
  {
    transaction_id: "TXN-1005",
    account_id: "ACC-5005",
    amount: 3299.99,
    time_seconds: 7200,
    merchant: "Crypto Exchange XYZ",
    location: "CN",
    device_ip: "103.45.67.89",
    actual_label: 1,
    risk_score: 87,
    status: "review"
  },
  {
    transaction_id: "TXN-1006",
    account_id: "ACC-5006",
    amount: 67.50,
    time_seconds: 54000,
    merchant: "Uber Technologies",
    location: "US",
    device_ip: "192.168.6.33",
    actual_label: 0,
    risk_score: 15,
    status: "clear"
  },
  {
    transaction_id: "TXN-1007",
    account_id: "ACC-5007",
    amount: 15000.00,
    time_seconds: 10800,
    merchant: "Wire Transfer - Offshore",
    location: "KY",
    device_ip: "45.77.123.99",
    actual_label: 1,
    risk_score: 95,
    status: "blocked"
  },
  {
    transaction_id: "TXN-1008",
    account_id: "ACC-5008",
    amount: 234.00,
    time_seconds: 61200,
    merchant: "Target Stores",
    location: "US",
    device_ip: "192.168.8.44",
    actual_label: 0,
    risk_score: 18,
    status: "clear"
  },
  {
    transaction_id: "TXN-1009",
    account_id: "ACC-5009",
    amount: 4500.00,
    time_seconds: 14400,
    merchant: "Gaming Credits Inc",
    location: "UA",
    device_ip: "91.234.56.78",
    actual_label: 1,
    risk_score: 78,
    status: "review"
  },
  {
    transaction_id: "TXN-1010",
    account_id: "ACC-5010",
    amount: 89.99,
    time_seconds: 68400,
    merchant: "Netflix Inc",
    location: "CA",
    device_ip: "192.168.10.55",
    actual_label: 0,
    risk_score: 5,
    status: "clear"
  },
  {
    transaction_id: "TXN-1011",
    account_id: "ACC-5011",
    amount: 6780.00,
    time_seconds: 18000,
    merchant: "Unknown Merchant",
    location: "NG",
    device_ip: "197.210.45.123",
    actual_label: 1,
    risk_score: 91,
    status: "flagged"
  },
  {
    transaction_id: "TXN-1012",
    account_id: "ACC-5012",
    amount: 156.78,
    time_seconds: 72000,
    merchant: "Whole Foods Market",
    location: "US",
    device_ip: "192.168.12.66",
    actual_label: 0,
    risk_score: 11,
    status: "clear"
  },
  {
    transaction_id: "TXN-1013",
    account_id: "ACC-5013",
    amount: 1999.00,
    time_seconds: 21600,
    merchant: "Electronics Depot",
    location: "MX",
    device_ip: "201.175.34.56",
    actual_label: 1,
    risk_score: 65,
    status: "review"
  },
  {
    transaction_id: "TXN-1014",
    account_id: "ACC-5014",
    amount: 42.00,
    time_seconds: 75600,
    merchant: "Starbucks Coffee",
    location: "US",
    device_ip: "192.168.14.77",
    actual_label: 0,
    risk_score: 3,
    status: "clear"
  },
  {
    transaction_id: "TXN-1015",
    account_id: "ACC-5015",
    amount: 12500.00,
    time_seconds: 25200,
    merchant: "Investment Platform Z",
    location: "HK",
    device_ip: "202.89.45.67",
    actual_label: 1,
    risk_score: 88,
    status: "flagged"
  },
  {
    transaction_id: "TXN-1016",
    account_id: "ACC-5016",
    amount: 320.50,
    time_seconds: 79200,
    merchant: "Home Depot",
    location: "US",
    device_ip: "192.168.16.88",
    actual_label: 0,
    risk_score: 22,
    status: "clear"
  },
  {
    transaction_id: "TXN-1017",
    account_id: "ACC-5017",
    amount: 5600.00,
    time_seconds: 28800,
    merchant: "Luxury Goods International",
    location: "AE",
    device_ip: "94.56.78.90",
    actual_label: 1,
    risk_score: 72,
    status: "review"
  },
  {
    transaction_id: "TXN-1018",
    account_id: "ACC-5018",
    amount: 78.25,
    time_seconds: 82800,
    merchant: "CVS Pharmacy",
    location: "US",
    device_ip: "192.168.18.99",
    actual_label: 0,
    risk_score: 7,
    status: "clear"
  },
  {
    transaction_id: "TXN-1019",
    account_id: "ACC-5019",
    amount: 9999.99,
    time_seconds: 36000,
    merchant: "Digital Currency Exchange",
    location: "PH",
    device_ip: "112.204.56.78",
    actual_label: 1,
    risk_score: 94,
    status: "blocked"
  },
  {
    transaction_id: "TXN-1020",
    account_id: "ACC-5020",
    amount: 199.00,
    time_seconds: 86400,
    merchant: "Best Buy Electronics",
    location: "US",
    device_ip: "192.168.20.111",
    actual_label: 0,
    risk_score: 14,
    status: "clear"
  }
];

// Mock analysis result for demonstration
export const mockAnalysisResult = {
  risk_score: 87,
  risk_level: "HIGH",
  confidence: 0.94,
  triggered_signals: [
    { signal: "Unusual transaction time", severity: "high", description: "Transaction occurred at 01:00 AM local time" },
    { signal: "High-risk merchant category", severity: "high", description: "Merchant associated with frequent fraud reports" },
    { signal: "Geographic anomaly", severity: "medium", description: "Transaction location differs from account holder's usual pattern" },
    { signal: "Amount exceeds typical pattern", severity: "medium", description: "Transaction 340% above account's average" }
  ],
  reasoning: "This transaction exhibits multiple high-risk indicators. The combination of unusual timing (01:00 AM), a high-risk merchant category, and significant deviation from the account holder's typical transaction pattern suggests potential fraudulent activity. The transaction amount of $2,489.50 is substantially higher than the account's historical average, further elevating the risk profile.",
  compliance_report: {
    finding: "Transaction flagged for potential AML/CFT review",
    regulation_refs: ["BSA/AML", "FFIEC Guidelines", "SAR Filing Requirements"],
    recommendation: "Further investigation recommended before clearance"
  },
  recommended_actions: [
    { action: "Temporarily freeze transaction", priority: "immediate" },
    { action: "Contact account holder for verification", priority: "high" },
    { action: "Review last 30 days of account activity", priority: "medium" },
    { action: "Cross-reference with known fraud patterns", priority: "medium" }
  ],
  account_status: "MONITOR",
  escalate_to_human: true,
  customer_notification: "We've detected unusual activity on your account ending in ***5001. For your security, we've placed a temporary hold on a recent transaction. Please call our fraud prevention team at 1-800-XXX-XXXX or log into your online banking to verify this activity.",
  case_priority: "URGENT",
  agent_steps: [
    { agent: "Anomaly Detector", status: "complete", result: "4 anomalies detected" },
    { agent: "Reasoning Agent", status: "complete", result: "High fraud probability" },
    { agent: "Report Generator", status: "complete", result: "Compliance report generated" },
    { agent: "Action Recommender", status: "complete", result: "4 actions recommended" }
  ]
};

export function getRiskLevel(score) {
  if (score >= 90) return 'CRITICAL';
  if (score >= 66) return 'HIGH';
  if (score >= 41) return 'MEDIUM';
  return 'LOW';
}

export function getRiskColor(score) {
  if (score >= 90) return '#E63946';
  if (score >= 66) return '#E63946';
  if (score >= 41) return '#F4A261';
  return '#2DC653';
}

export function formatTime(seconds) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
}

export function formatCurrency(amount) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
}
