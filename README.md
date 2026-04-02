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

1. A deterministic rule engine that checks the transaction against a library of 27 regulation-mapped compliance rules across seven categories, evaluated in under a millisecond.
2. A four-agent AI pipeline that reasons over the rule results, generates a compliance report, and recommends a specific action.

The compliance officer sees a live dashboard of all transactions, each pre-scored by risk level. When they click Analyze on any transaction, the rule engine fires first, then four specialized AI agents work through the results in sequence. By the time the pipeline finishes, the output is a professional report with anomaly scoring, plain-English reasoning, regulatory compliance flags, and a clear recommended action the bank can act on immediately.

---

## The Rule Engine

The rule engine is the first layer of analysis. It is deterministic, auditable, and fast. Every transaction is evaluated against every rule in under a millisecond.

Rules are organized into seven categories, covering 27 distinct fraud and compliance signals. Every rule is auditable — each one carries a unique ID, a plain-English description, a severity level, and the specific regulation or guideline it references.

**Amount Threshold Rules** — 5 rules

AMT-001 flags any transaction at or above $10,000 as a mandatory Currency Transaction Report trigger under BSA 31 CFR 1010.311. AMT-002 flags transactions between $9,000 and $9,999.99 as potential structuring — deliberately keeping amounts below the CTR threshold to avoid mandatory reporting is a federal crime under 31 U.S.C. 5324. AMT-003 flags transactions between $5,001 and $8,999 for large transaction enhanced review under FFIEC guidelines, which require the bank to document the business purpose and verify the source of funds. AMT-004 flags round dollar amounts over $1,000 with no cents, because legitimate transactions almost always include fractional amounts and round numbers suggest deliberate selection. AMT-005 flags transactions that fall within 5% below a common internal review threshold at $1,000, $3,000, or $5,000 as a split structuring indicator.

**Geographic Risk Rules** — 4 rules

GEO-001 flags transactions originating from FATF-listed high-risk jurisdictions including Russia, Nigeria, China, the Philippines, Myanmar, Pakistan, Vietnam, and Ukraine, which have identified deficiencies in their AML and counter-terrorist financing regimes under FATF Recommendation 19. GEO-002 flags transactions involving OFAC comprehensively sanctioned countries — Iran, North Korea, Syria, and Cuba — as a critical violation under 31 CFR Chapter V that exposes the bank to civil and criminal penalties. GEO-003 flags transactions from elevated-risk jurisdictions including Mexico, Hong Kong, the UAE, and the EU, which are not sanctioned but require additional scrutiny under the bank's internal risk model and FFIEC guidance. GEO-004 flags IP geolocation mismatch — when the device IP is a private or domestic address but the declared transaction location is foreign, suggesting falsified transaction details or proxy use.

**Time Pattern Rules** — 2 rules

TIME-001 flags transactions occurring between midnight and 5:00 AM as off-hours activity. Most legitimate retail and business transactions occur during normal business hours, and off-hours activity is a well-established fraud indicator, particularly for large amounts. TIME-002 applies a higher-severity flag specifically to the 1:00 AM to 4:00 AM window, which fraud datasets consistently identify as the single highest-risk time period for account takeover, unauthorized access, and card-not-present fraud.

**Merchant Risk Rules** — 7 rules

MER-001 flags cryptocurrency and digital asset exchanges because they are a primary vehicle for converting illicit funds into untraceable assets, and FinCEN requires MSB registration for crypto exchanges under FIN-2019-G001. MER-002 flags wire transfer services and money service businesses, which are the most common vehicle for layering funds under BSA 31 CFR 1022. MER-003 flags online gaming and gambling platforms because funds can enter as deposits and exit as apparent winnings, providing a legitimate-seeming paper trail for laundered money. MER-004 flags unknown or unverifiable merchants because transactions must have a verifiable business purpose under FFIEC due diligence requirements. MER-005 flags investment or financial platforms registered in known secrecy jurisdictions such as the Cayman Islands, British Virgin Islands, Mauritius, or Belize as offshore investment platform indicators. MER-006 flags peer-to-peer payment platforms including Venmo, CashApp, Zelle, and PayPal because their instant settlement and limited KYC enforcement make them increasingly used for rapid fund layering under FinCEN FIN-2019-A003. MER-007 flags NFT and digital collectibles marketplaces because the FATF's 2021 updated guidance on virtual assets identified them as an emerging money laundering vehicle due to wash trading, anonymous transfers, and high-value movement without physical goods.

**AML and BSA Compliance Rules** — 5 rules

AML-001 fires when a transaction of $5,000 or more originates from a FATF high-risk jurisdiction, meeting the threshold for a mandatory Suspicious Activity Report filing with FinCEN under 31 CFR 1020.320. AML-002 fires when a high-risk merchant type combines with a high-risk geographic location, matching the layering pattern in money laundering where funds are moved through multiple services across jurisdictions to obscure their origin, under FATF Recommendation 20. AML-003 fires on any transaction of $3,000 or more crossing an international border, triggering the BSA Travel Rule under 31 CFR 1010.410, which requires the originating bank to pass specific customer identification to the receiving institution. AML-004 fires when the merchant name matches patterns associated with shell companies — generic terms like Holdings, Capital Group, Global Enterprises, or International LLC — which are a primary tool for concealing beneficial ownership under the FinCEN Beneficial Ownership Rule 31 CFR 1010.230. AML-005 fires on transactions loading gift cards, prepaid debit cards, or stored-value instruments, which FinCEN specifically identifies as a high-risk cash-equivalent conversion method under the Prepaid Access Rule 31 CFR 1022.210.

**Device and IP Rules** — 3 rules

DEV-001 flags transactions originating from IP addresses registered to datacenters, VPN providers, or hosting companies. Legitimate retail customers connect from residential or mobile IPs, and commercial IPs strongly suggest proxied or automated activity. DEV-002 flags any connection from a non-residential IP range at lower severity as a contextual signal, recognising that while not conclusive alone, it elevates risk when combined with other signals. DEV-003 flags IP addresses matching known TOR exit node and anonymizing proxy ranges because deliberate use of anonymizing networks in banking transactions is a strong indicator of identity concealment, as identified in the FFIEC Cybersecurity Assessment Tool.

**Velocity and Behavior Rules** — 2 rules

VEL-001 flags transactions under $1.00 as a card testing micro-transaction signal. Fraudsters run a tiny charge first to confirm a stolen card is active before escalating to larger fraudulent purchases. This pattern is specifically referenced in PCI DSS v4.0 Requirement 10.7 as a high-risk precursor signal. VEL-002 flags transaction amounts that fall within 5% below a commonly used internal review threshold — at $1,000, $3,000, or $5,000 — as a split structuring indicator, reflecting the same evasion logic as AMT-002 but applied to lower internal thresholds rather than the federal CTR ceiling.

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

## Flagr AI Assistant

One of the persistent failure modes in compliance tooling is that the output is written for systems, not for people. Rule codes, severity scores, and regulation references are necessary for audit trails, but they do not help a junior analyst understand what they are actually looking at or why it matters.

Flagr includes a conversational AI assistant that is present on every page of the dashboard. It is accessible through a persistent button in the bottom-right corner. The assistant is designed to translate everything on the screen into plain, accessible language. An analyst can ask why a transaction was flagged, what a particular risk score means in practical terms, what a regulation reference requires the bank to do, or whether a specific combination of signals is unusual. The assistant answers in straightforward English without jargon.

When the analyst has a transaction open in the case investigation drawer, the assistant receives full context on that transaction automatically — the ID, amount, location, merchant, and risk score. Every response is specific to the transaction being reviewed, not generic.

The assistant uses the HuggingFace Inference API with `HuggingFaceH4/zephyr-7b-beta`, a free open-weight instruction-tuned model. To enable AI responses, add a `HF_TOKEN` environment variable containing a HuggingFace account token. Tokens are free to obtain from huggingface.co. If no token is configured, the assistant falls back to a deterministic rule-based explanation derived directly from the transaction's risk score and signals. The fallback produces accurate, context-aware responses without any external API dependency.

---

## Alert Notifications

The notification system surfaces high-risk activity directly in the header without requiring the analyst to navigate to a separate page. The bell icon displays a live count of all transactions currently at HIGH or CRITICAL risk. Clicking the icon opens a panel listing each alert with the transaction ID, risk level, and merchant. Every item in the panel is a direct link — clicking it navigates immediately to the dashboard view for that transaction and opens the full case investigation drawer. A secondary action in the panel jumps to the dedicated Alerts tab where all high-risk transactions are listed together.

---

Built for GenAI Genesis 2026.
