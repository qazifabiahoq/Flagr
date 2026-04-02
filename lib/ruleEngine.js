// Flagr Rule Engine
// Deterministic, auditable, regulation-mapped fraud detection rules.
// Each rule mirrors what a real bank compliance team would codify.

export const RULE_CATEGORIES = {
  AMOUNT: 'Amount Threshold',
  GEOGRAPHIC: 'Geographic Risk',
  TIME: 'Time Pattern',
  MERCHANT: 'Merchant Risk',
  AML: 'AML / BSA Compliance',
  DEVICE: 'Device and IP',
  VELOCITY: 'Velocity & Behavior',
};

// Severity to base risk points contributed by a fired rule
const SEVERITY_POINTS = {
  critical: 35,
  high: 22,
  medium: 12,
  low: 6,
};

// All fraud detection rules.
// Each rule:
//   id         - unique code used in reports and audit logs
//   category   - one of RULE_CATEGORIES keys
//   name       - short human-readable label
//   description - plain-English explanation of what the rule detects and why it matters
//   severity   - critical / high / medium / low
//   regulation - relevant regulation or guideline (optional)
//   check(txn) - pure function returning true if the rule fires on a given transaction
export const FRAUD_RULES = [

  // AMOUNT rules
  {
    id: 'AMT-001',
    category: 'AMOUNT',
    name: 'Currency Transaction Report Threshold',
    description:
      'A single transaction at or above $10,000 triggers a mandatory Currency Transaction Report under the Bank Secrecy Act. The bank must file a CTR with FinCEN within 15 days.',
    severity: 'critical',
    regulation: 'BSA 31 CFR 1010.311',
    check: (txn) => parseFloat(txn.amount) >= 10000,
  },
  {
    id: 'AMT-002',
    category: 'AMOUNT',
    name: 'Structuring Indicator Below CTR Threshold',
    description:
      'A transaction between $9,000 and $9,999.99 may indicate structuring: deliberately keeping amounts under $10,000 to avoid mandatory CTR reporting. Structuring is a federal crime under 31 U.S.C. 5324.',
    severity: 'high',
    regulation: 'BSA 31 U.S.C. 5324',
    check: (txn) => {
      const amount = parseFloat(txn.amount);
      return amount >= 9000 && amount < 10000;
    },
  },
  {
    id: 'AMT-003',
    category: 'AMOUNT',
    name: 'Large Transaction Enhanced Review',
    description:
      'Transactions over $5,000 require enhanced due diligence under FFIEC guidelines. The bank must document the business purpose and verify the source of funds.',
    severity: 'medium',
    regulation: 'FFIEC BSA/AML Examination Manual',
    check: (txn) => {
      const amount = parseFloat(txn.amount);
      return amount > 5000 && amount < 9000;
    },
  },
  {
    id: 'AMT-004',
    category: 'AMOUNT',
    name: 'Round Dollar Amount Over $1,000',
    description:
      'Transactions with exact round-dollar amounts over $1,000 are a recognized indicator of structuring. Legitimate transactions almost always include cents. Round amounts suggest the sender chose the number deliberately.',
    severity: 'low',
    regulation: 'FFIEC BSA/AML Examination Manual',
    check: (txn) => {
      const amount = parseFloat(txn.amount);
      return amount > 1000 && amount % 1 === 0;
    },
  },

  // GEOGRAPHIC rules
  {
    id: 'GEO-001',
    category: 'GEOGRAPHIC',
    name: 'FATF High-Risk Jurisdiction',
    description:
      'The transaction originates from a country on the FATF list of jurisdictions under increased monitoring. These countries have identified deficiencies in their anti-money-laundering and counter-terrorist-financing regimes.',
    severity: 'high',
    regulation: 'FATF Recommendation 19',
    check: (txn) =>
      ['RU', 'NG', 'KY', 'CN', 'UA', 'PH', 'MM', 'PK', 'VN'].includes(
        txn.location
      ),
  },
  {
    id: 'GEO-002',
    category: 'GEOGRAPHIC',
    name: 'OFAC Sanctioned Country',
    description:
      'The transaction routes through or originates from a country subject to OFAC comprehensive sanctions. Processing this transaction without prior authorization violates U.S. law and exposes the bank to significant civil and criminal penalties.',
    severity: 'critical',
    regulation: 'OFAC 31 CFR Chapter V',
    check: (txn) => ['IR', 'KP', 'SY', 'CU'].includes(txn.location),
  },
  {
    id: 'GEO-003',
    category: 'GEOGRAPHIC',
    name: 'Elevated Risk Jurisdiction',
    description:
      'The transaction is in a jurisdiction with elevated financial crime risk based on FFIEC guidance and the bank\'s internal risk model. These locations are not sanctioned but require additional scrutiny.',
    severity: 'medium',
    regulation: 'FFIEC BSA/AML Examination Manual',
    check: (txn) => ['MX', 'HK', 'AE', 'EU'].includes(txn.location),
  },
  {
    id: 'GEO-004',
    category: 'GEOGRAPHIC',
    name: 'IP Geolocation Mismatch',
    description:
      'The device IP address is a private or domestic IP but the declared transaction location is foreign. This mismatch suggests the transaction details may have been falsified, or the device is being used through a proxy.',
    severity: 'high',
    check: (txn) => {
      const ip = txn.device_ip || '';
      const isPrivateOrDomestic =
        ip.startsWith('192.168.') ||
        ip.startsWith('10.') ||
        ip.startsWith('172.');
      const isForeignLocation =
        txn.location && txn.location !== 'US' && txn.location !== 'CA';
      return isPrivateOrDomestic && isForeignLocation;
    },
  },

  // TIME rules
  {
    id: 'TIME-001',
    category: 'TIME',
    name: 'Off-Hours Transaction',
    description:
      'The transaction occurred between midnight and 5:00 AM. Most legitimate retail and business transactions occur during normal hours. Off-hours activity is a recognized fraud indicator, especially for large amounts.',
    severity: 'medium',
    check: (txn) => {
      const hours = Math.floor((parseFloat(txn.time_seconds) || 0) / 3600);
      return hours >= 0 && hours < 5;
    },
  },
  {
    id: 'TIME-002',
    category: 'TIME',
    name: 'High-Risk Night Window (1 AM to 4 AM)',
    description:
      'The transaction occurred between 1:00 AM and 4:00 AM, which fraud data shows is the single highest-risk time window. Account takeover fraud, unauthorized access, and card-not-present fraud cluster heavily in this window.',
    severity: 'high',
    check: (txn) => {
      const hours = Math.floor((parseFloat(txn.time_seconds) || 0) / 3600);
      return hours >= 1 && hours < 4;
    },
  },

  // MERCHANT rules
  {
    id: 'MER-001',
    category: 'MERCHANT',
    name: 'Cryptocurrency Exchange',
    description:
      'The transaction is directed to a cryptocurrency or digital asset exchange. Crypto exchanges are a primary vehicle for converting illicit funds into untraceable assets. FinCEN requires MSB registration for crypto exchanges but enforcement is uneven globally.',
    severity: 'high',
    regulation: 'FinCEN FIN-2019-G001',
    check: (txn) => {
      const m = (txn.merchant || '').toLowerCase();
      return (
        m.includes('crypto') ||
        m.includes('bitcoin') ||
        m.includes('digital currency') ||
        m.includes('digital asset') ||
        m.includes('coin')
      );
    },
  },
  {
    id: 'MER-002',
    category: 'MERCHANT',
    name: 'Wire Transfer or Money Service Business',
    description:
      'The transaction flows through a wire transfer service or money service business. MSBs are the most common vehicle for layering funds in money laundering schemes. The bank must apply enhanced due diligence for all MSB relationships.',
    severity: 'high',
    regulation: 'BSA 31 CFR 1022',
    check: (txn) => {
      const m = (txn.merchant || '').toLowerCase();
      return (
        m.includes('wire transfer') ||
        m.includes('wire') ||
        m.includes('remittance') ||
        m.includes('money transfer') ||
        m.includes('moneygram') ||
        m.includes('western union')
      );
    },
  },
  {
    id: 'MER-003',
    category: 'MERCHANT',
    name: 'Online Gaming or Gambling Platform',
    description:
      'The transaction goes to an online gaming or gambling platform. These platforms are commonly used for layering: funds go in as gambling deposits and come back out as winnings, appearing to have a legitimate source.',
    severity: 'medium',
    check: (txn) => {
      const m = (txn.merchant || '').toLowerCase();
      return (
        m.includes('gaming') ||
        m.includes('casino') ||
        m.includes('gambling') ||
        m.includes('game credit') ||
        m.includes('game credits')
      );
    },
  },
  {
    id: 'MER-004',
    category: 'MERCHANT',
    name: 'Unknown or Unverified Merchant',
    description:
      'The merchant cannot be identified in the bank\'s merchant database. Transactions to unknown merchants lack a verifiable business purpose, which is required for due diligence documentation under FFIEC guidelines.',
    severity: 'medium',
    check: (txn) => {
      const m = (txn.merchant || '').toLowerCase().trim();
      return m === '' || m === 'unknown merchant' || m.startsWith('unknown');
    },
  },
  {
    id: 'MER-005',
    category: 'MERCHANT',
    name: 'Offshore Investment Platform',
    description:
      'The transaction goes to an investment or financial platform registered in a known secrecy or low-regulation jurisdiction. Offshore investment platforms are frequently used in the integration phase of money laundering.',
    severity: 'high',
    regulation: 'FFIEC BSA/AML Examination Manual',
    check: (txn) => {
      const m = (txn.merchant || '').toLowerCase();
      const isInvestmentMerchant =
        m.includes('investment') ||
        m.includes('capital') ||
        m.includes('asset') ||
        m.includes('fund') ||
        m.includes('platform');
      const isOffshoreLocation = ['KY', 'MU', 'VG', 'BZ', 'HK', 'LI'].includes(
        txn.location
      );
      return isInvestmentMerchant && isOffshoreLocation;
    },
  },

  // AML rules
  {
    id: 'AML-001',
    category: 'AML',
    name: 'Suspicious Activity Report Threshold Met',
    description:
      'The transaction meets the FinCEN threshold for a mandatory Suspicious Activity Report. A SAR must be filed when a transaction of $5,000 or more involves funds from illegal activity, or when the bank suspects the customer is attempting to evade reporting requirements.',
    severity: 'critical',
    regulation: '31 CFR 1020.320',
    check: (txn) => {
      const amount = parseFloat(txn.amount);
      const isHighRiskLocation = ['RU', 'NG', 'KY', 'CN', 'UA', 'PH', 'IR', 'KP'].includes(
        txn.location
      );
      return amount >= 5000 && isHighRiskLocation;
    },
  },
  {
    id: 'AML-002',
    category: 'AML',
    name: 'Layering Pattern Detected',
    description:
      'The combination of a high-risk merchant type and a high-risk geographic location matches known money laundering layering patterns. Layering obscures the origin of funds by moving them through multiple accounts or services across jurisdictions.',
    severity: 'high',
    regulation: 'FATF Recommendation 20',
    check: (txn) => {
      const m = (txn.merchant || '').toLowerCase();
      const isRiskyMerchant =
        m.includes('wire') ||
        m.includes('crypto') ||
        m.includes('transfer') ||
        m.includes('digital currency');
      const isHighRiskGeo = ['RU', 'NG', 'KY', 'CN', 'UA', 'PH'].includes(
        txn.location
      );
      return isRiskyMerchant && isHighRiskGeo;
    },
  },
  {
    id: 'AML-003',
    category: 'AML',
    name: 'High-Value Cross-Border Transfer',
    description:
      'A transaction of $3,000 or more crossing international borders triggers the BSA Travel Rule. The originating bank must pass specific customer information to the receiving institution. Failure to comply is a BSA violation.',
    severity: 'high',
    regulation: 'BSA Travel Rule 31 CFR 1010.410',
    check: (txn) => {
      const amount = parseFloat(txn.amount);
      return amount >= 3000 && txn.location !== 'US' && txn.location !== 'CA';
    },
  },

  // DEVICE rules
  {
    id: 'DEV-001',
    category: 'DEVICE',
    name: 'Commercial or Datacenter IP Address',
    description:
      'The transaction originates from an IP address registered to a datacenter, VPN provider, or hosting company. Legitimate retail customers connect from residential or mobile IPs. Commercial IPs often indicate proxied or automated activity.',
    severity: 'medium',
    check: (txn) => {
      const ip = txn.device_ip || '';
      const suspiciousRanges = [
        '45.', '91.', '94.', '103.', '112.',
        '185.', '197.', '201.', '202.',
      ];
      return suspiciousRanges.some((prefix) => ip.startsWith(prefix));
    },
  },
  {
    id: 'DEV-002',
    category: 'DEVICE',
    name: 'Non-Residential Network',
    description:
      'The transaction does not originate from a private residential IP range. While not conclusive on its own, non-residential network access combined with other risk signals significantly elevates fraud probability.',
    severity: 'low',
    check: (txn) => {
      const ip = txn.device_ip || '';
      const isResidential =
        ip.startsWith('192.168.') ||
        ip.startsWith('10.') ||
        ip.startsWith('172.') ||
        ip === '';
      return !isResidential;
    },
  },

  // VELOCITY / BEHAVIOR rules
  {
    id: 'VEL-001',
    category: 'VELOCITY',
    name: 'Card Testing Micro-Transaction',
    description:
      'A transaction under $1.00 is a strong indicator of card testing — fraudsters make a tiny charge first to confirm a stolen card is active before running larger fraudulent purchases. This pattern almost always precedes escalating fraud.',
    severity: 'high',
    regulation: 'PCI DSS v4.0 Requirement 10.7',
    check: (txn) => {
      const amount = parseFloat(txn.amount);
      return amount > 0 && amount < 1.00;
    },
  },
  {
    id: 'VEL-002',
    category: 'VELOCITY',
    name: 'Split Transaction Structuring Pattern',
    description:
      'A transaction amount that falls within 5% below a common reporting threshold ($1,000, $3,000, or $5,000) suggests deliberate splitting to avoid triggering enhanced review thresholds. This is a recognised structuring indicator under BSA guidelines.',
    severity: 'medium',
    regulation: 'BSA 31 U.S.C. 5324',
    check: (txn) => {
      const amount = parseFloat(txn.amount);
      return [1000, 3000, 5000].some(t => amount >= t * 0.95 && amount < t);
    },
  },
  {
    id: 'MER-006',
    category: 'MERCHANT',
    name: 'Peer-to-Peer Payment Platform',
    description:
      'The transaction routes through a peer-to-peer payment app such as Venmo, CashApp, Zelle, or PayPal. P2P platforms are increasingly used for rapid fund layering due to instant settlement, limited KYC requirements for small transfers, and difficulty tracing beneficiaries.',
    severity: 'high',
    regulation: 'FinCEN FIN-2019-A003',
    check: (txn) => {
      const m = (txn.merchant || '').toLowerCase();
      return (
        m.includes('venmo') ||
        m.includes('cashapp') ||
        m.includes('cash app') ||
        m.includes('zelle') ||
        m.includes('paypal') ||
        m.includes('p2p') ||
        m.includes('peer to peer')
      );
    },
  },
  {
    id: 'MER-007',
    category: 'MERCHANT',
    name: 'NFT or Digital Collectibles Marketplace',
    description:
      'The transaction is directed to an NFT or digital collectibles platform. FinCEN and the FATF have flagged NFT markets as an emerging money laundering vehicle due to wash trading, anonymous ownership transfers, and the ability to move large value without physical goods crossing borders.',
    severity: 'medium',
    regulation: 'FATF Updated Guidance on Virtual Assets 2021',
    check: (txn) => {
      const m = (txn.merchant || '').toLowerCase();
      return (
        m.includes('nft') ||
        m.includes('opensea') ||
        m.includes('collectible') ||
        m.includes('digital art') ||
        m.includes('token market')
      );
    },
  },
  {
    id: 'AML-004',
    category: 'AML',
    name: 'Shell Company Indicator',
    description:
      'The merchant name matches patterns associated with shell companies: generic terms like "Holdings", "Capital Group", "Global Enterprises", or "International LLC" with no verifiable operating history. Shell companies are a primary tool for concealing beneficial ownership in money laundering schemes.',
    severity: 'medium',
    regulation: 'FinCEN Beneficial Ownership Rule 31 CFR 1010.230',
    check: (txn) => {
      const m = (txn.merchant || '').toLowerCase();
      return (
        m.includes('holdings') ||
        (m.includes('global') && (m.includes('enterprise') || m.includes('capital') || m.includes('trade'))) ||
        m.includes('international llc') ||
        m.includes('international ltd') ||
        (m.includes('capital group') && !m.includes('bank'))
      );
    },
  },
  {
    id: 'AML-005',
    category: 'AML',
    name: 'Gift Card or Prepaid Card Loading',
    description:
      'The transaction loads a gift card, prepaid debit card, or stored-value instrument. These are a common vehicle for converting stolen funds into spendable, hard-to-trace value. FinCEN specifically identifies prepaid access as a high-risk product category requiring enhanced monitoring.',
    severity: 'medium',
    regulation: 'FinCEN Prepaid Access Rule 31 CFR 1022.210',
    check: (txn) => {
      const m = (txn.merchant || '').toLowerCase();
      return (
        m.includes('gift card') ||
        m.includes('prepaid') ||
        m.includes('stored value') ||
        m.includes('vanilla card') ||
        m.includes('reload') ||
        m.includes('green dot')
      );
    },
  },
  {
    id: 'DEV-003',
    category: 'DEVICE',
    name: 'Anonymizing Proxy or TOR Exit Node',
    description:
      'The device IP address matches known TOR exit node or anonymizing proxy ranges. TOR usage in financial transactions is a strong indicator of deliberate identity concealment. Legitimate banking customers almost never route transactions through anonymizing networks.',
    severity: 'high',
    regulation: 'FFIEC Cybersecurity Assessment Tool',
    check: (txn) => {
      const ip = txn.device_ip || '';
      const torRanges = ['176.10.', '185.220.', '51.15.', '5.9.', '89.234.', '95.216.'];
      return torRanges.some(prefix => ip.startsWith(prefix));
    },
  },
];

// Run all rules against a single transaction.
// Returns an object with:
//   firedRules    - list of rules that fired, with details
//   ruleRiskScore - numeric score contributed by rules alone (0-100)
//   ruleCategories - breakdown of fired rules by category
//   ruleCount     - total number of rules fired
//   hasCritical   - true if any critical rule fired
//   hasHigh       - true if any high rule fired
export function runRuleEngine(transaction) {
  const firedRules = [];

  for (const rule of FRAUD_RULES) {
    let triggered = false;
    try {
      triggered = rule.check(transaction);
    } catch {
      triggered = false;
    }

    if (triggered) {
      firedRules.push({
        id: rule.id,
        category: rule.category,
        categoryLabel: RULE_CATEGORIES[rule.category] || rule.category,
        name: rule.name,
        description: rule.description,
        severity: rule.severity,
        points: SEVERITY_POINTS[rule.severity] || 6,
        regulation: rule.regulation || null,
      });
    }
  }

  // Score: sum of points from fired rules, capped at 100
  const rawPoints = firedRules.reduce((sum, r) => sum + r.points, 0);
  const ruleRiskScore = Math.min(rawPoints, 100);

  // Group by category for the UI breakdown
  const ruleCategories = {};
  for (const rule of firedRules) {
    if (!ruleCategories[rule.category]) {
      ruleCategories[rule.category] = {
        label: RULE_CATEGORIES[rule.category],
        rules: [],
      };
    }
    ruleCategories[rule.category].rules.push(rule);
  }

  return {
    firedRules,
    ruleRiskScore,
    ruleCategories,
    ruleCount: firedRules.length,
    hasCritical: firedRules.some((r) => r.severity === 'critical'),
    hasHigh: firedRules.some((r) => r.severity === 'high'),
    totalRulesEvaluated: FRAUD_RULES.length,
  };
}

// Returns a summary of all defined rules (for the Rule Engine tab in the UI)
export function getAllRules() {
  return FRAUD_RULES.map((rule) => ({
    id: rule.id,
    category: rule.category,
    categoryLabel: RULE_CATEGORIES[rule.category] || rule.category,
    name: rule.name,
    description: rule.description,
    severity: rule.severity,
    regulation: rule.regulation || null,
    points: SEVERITY_POINTS[rule.severity] || 6,
  }));
}

// Returns stats about the rule library
export function getRuleStats() {
  const counts = { critical: 0, high: 0, medium: 0, low: 0 };
  const categoryCount = {};
  for (const rule of FRAUD_RULES) {
    counts[rule.severity] = (counts[rule.severity] || 0) + 1;
    categoryCount[rule.category] = (categoryCount[rule.category] || 0) + 1;
  }
  return {
    total: FRAUD_RULES.length,
    bySeverity: counts,
    byCategory: categoryCount,
  };
}
