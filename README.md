# Flagr

AI-powered multi-agent fraud intelligence platform for bank risk and compliance teams.

Live Demo: https://flagr-xi.vercel.app

Youtube: https://youtu.be/X5xCgyFXfF0?si=0TGpU13hDoFi8ryz


---

## The Problem

Financial fraud costs banks billions annually. Most detection systems flag suspicious transactions but stop there. They produce no reasoning, no explanation, and no recommended action. Compliance officers are left drowning in alerts with no context, spending hours manually reviewing cases that should take seconds.

The bank absorbs the cost in analyst labor hours. The customer absorbs it in frozen accounts and delayed responses.

Flagr was built to change that.

---

## What Flagr Does

Flagr is a B2B fraud intelligence platform that takes a bank transaction and returns a complete compliance-ready fraud analysis in real time.

Every transaction runs through two layers of analysis:

1. A deterministic rule engine that checks the transaction against a library of regulation-mapped compliance rules instantly.
2. A four-agent AI pipeline that reasons over the rule results, generates a compliance report, and recommends a specific action.

The compliance officer sees a live dashboard of all transactions, each pre-scored by risk level. When they click Analyze on any transaction, the rule engine fires first, then four specialized AI agents work through the results in sequence. By the time the pipeline finishes, the output is a professional report with anomaly scoring, plain-English reasoning, regulatory compliance flags, and a clear recommended action the bank can act on immediately.

---

## The Rule Engine

The rule engine is the first layer of analysis. It is deterministic, auditable, and fast. Every transaction is evaluated against every rule in under a millisecond.

Rules are organized into six categories:

**Amount Threshold Rules**

These rules enforce BSA and FFIEC reporting thresholds. Every bank must file a Currency Transaction Report for transactions at or above $10,000. Transactions between $9,000 and $9,999 are flagged as potential structuring because deliberately keeping amounts below the CTR threshold to avoid reporting is a federal crime under 31 U.S.C. 5324. Round dollar amounts over $1,000 are also flagged because legitimate transactions almost always include cents.

**Geographic Risk Rules**

These rules check the transaction location against FATF high-risk jurisdictions, OFAC sanctioned countries, and the bank's internal elevated-risk list. A transaction from an OFAC sanctioned country like Iran or North Korea is a critical rule violation. FATF high-risk jurisdictions such as Russia, Nigeria, the Philippines, and Myanmar trigger high-severity flags. IP geolocation mismatch is also checked. If the device IP is domestic but the declared transaction location is foreign, the rule fires.

**Time Pattern Rules**

Transactions between midnight and 5:00 AM are flagged for off-hours activity. Transactions specifically between 1:00 AM and 4:00 AM trigger a higher-severity rule because fraud data shows this window has the highest concentration of account takeover and unauthorized access events.

**Merchant Risk Rules**

Cryptocurrency exchanges, wire transfer services, and online gambling platforms are flagged because they are the most common vehicles for layering funds in money laundering. Offshore investment platforms in known secrecy jurisdictions like the Cayman Islands or British Virgin Islands trigger a high-severity rule. Unknown or unidentifiable merchants are flagged because transactions must have a verifiable business purpose under FFIEC due diligence requirements.

**AML and BSA Compliance Rules**

These rules operate at the intersection of multiple factors. A transaction of $5,000 or more originating from a FATF high-risk country triggers the SAR threshold rule, which signals that a Suspicious Activity Report may need to be filed with FinCEN under 31 CFR 1020.320. A transaction of $3,000 or more crossing an international border triggers the BSA Travel Rule, which requires the bank to pass specific customer information to the receiving institution. Transactions that combine a high-risk merchant type with a high-risk geographic location are flagged for layering patterns.

**Device and IP Rules**

These rules check the device IP against known datacenter, VPN, and hosting provider ranges. Legitimate retail customers connect from residential or mobile IPs. Commercial IPs suggest proxied or automated activity. Non-residential IPs are flagged at lower severity as a contextual signal.

### How Scoring Works

Each rule has a severity and a point value:

- Critical rules: 35 points
- High rules: 22 points
- Medium rules: 12 points
- Low rules: 6 points

Points from all fired rules are summed and capped at 100. A transaction that fires the CTR threshold rule (35 points), a FATF geographic rule (22 points), and the off-hours rule (12 points) would have a rule score of 69, placing it firmly in the HIGH risk band. The AI agents then receive this score and the full list of fired rules as context.

Every fired rule includes the rule ID, the plain-English description, the severity, and the specific regulation or guideline it references. This creates a fully auditable paper trail.

---

## The Four AI Agents

Rather than sending everything to a single AI model, Flagr uses a multi-agent pipeline where each agent is designed and prompted for one task. The rule engine output becomes the input for the first agent. The output of each agent becomes the input context for the next.

**Agent 1 is the Anomaly Detector.**

It receives the transaction and the rule engine output. It computes a final fraud risk score, examines additional signals not covered by the rules, and produces a structured list of triggered signals with confidence levels.

**Agent 2 is the Reasoning Agent.**

This agent receives the anomaly output and explains in plain professional English why the transaction is suspicious. It maps everything to a risk level of LOW, MEDIUM, HIGH, or CRITICAL. Every explanation is specific to the exact signals and rules that were triggered.

**Agent 3 is the Report Generator.**

This agent produces a formal compliance report with a unique report ID, timestamp, executive summary, detailed findings, and specific regulatory references such as BSA/AML review requirements or SAR filing obligations. The output is formatted for direct inclusion in a compliance audit trail.

**Agent 4 is the Action Recommender.**

This is the final synthesis step. The action recommender receives everything the rule engine and the first three agents found and determines exactly what the bank must do. It produces a recommended action, specifies the account status change required, lists the immediate steps the compliance team must take, generates a customer notification message, determines whether the case requires human escalation, and assigns a case priority.

---

## Why Both Rule Engine and AI

The rule engine and the AI pipeline each do something the other cannot.

The rule engine is deterministic and auditable. Every rule either fires or it does not. There is no ambiguity. Regulators can inspect every rule and every firing. It catches every known pattern and regulatory threshold without fail.

The AI pipeline handles context, reasoning, and nuance. It can explain why a combination of signals is suspicious even if no single signal crosses a threshold. It can draft compliance language, generate customer notifications, and produce recommendations that account for the full picture.

Neither layer alone is sufficient. A rule engine without AI leaves compliance officers reading raw flags with no context. AI without a rule engine misses known patterns and cannot guarantee regulatory compliance thresholds are enforced. Flagr uses both.

---

## Who This Is Built For

Flagr is designed for bank risk and compliance teams that process large volumes of transactions and need to reduce manual analyst workload without cutting corners on accuracy or regulatory compliance.

For compliance officers, every transaction comes with a complete audit trail, plain-English reasoning, and a specific recommended action. No more spending hours on cases that should take seconds.

For the bank, Flagr can process hundreds of transactions simultaneously, flags only what matters, and produces documentation that satisfies regulatory requirements automatically.

---

## Technical Stack

Flagr is a full-stack web platform with a Next.js 14 frontend deployed on Vercel and a Python FastAPI backend deployed on Render. All AI processing runs through Google ADK with Gemini 2.5 Flash.

The rule engine runs entirely in the Next.js API layer with no external dependencies. It evaluates all rules on every transaction in a single synchronous pass. The four AI agents are orchestrated using Google ADK's LlmAgent and Runner pattern. Each agent runs on Gemini 2.5 Flash with a custom instruction set that defines its role, required output structure, and strict behavioral constraints.

The transaction data is sourced from the Kaggle Credit Card Fraud Detection dataset.

---

Built for GenAI Genesis 2026.
