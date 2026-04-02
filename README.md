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

Rules are organized into seven categories covering 27 distinct fraud and compliance signals. Every rule carries a unique ID, a severity level, a plain-English description, and the specific regulation or industry guideline it references. This creates a fully auditable record of why every transaction was scored the way it was.

**Amount Threshold Rules**

These rules enforce federal reporting thresholds and detect deliberate evasion of those thresholds. A transaction at or above $10,000 triggers a mandatory Currency Transaction Report under BSA 31 CFR 1010.311. Transactions between $9,000 and $9,999.99 are flagged as potential structuring because deliberately keeping amounts below the CTR threshold to avoid mandatory reporting is a federal crime under 31 U.S.C. 5324. Transactions between $5,001 and $8,999 require large transaction enhanced review under FFIEC guidelines, which mandate that the bank document the business purpose and verify the source of funds. Round dollar amounts over $1,000 with no cents are flagged because legitimate transactions almost always include fractional amounts — a clean round number suggests the sender chose it deliberately. Transactions that fall within 5% below a common internal review threshold are flagged as split structuring indicators, applying the same evasion logic to lower administrative thresholds the way AMT-002 applies it to the federal CTR ceiling.

**Geographic Risk Rules**

These rules check the transaction origin against three tiers of regulatory and institutional risk classification. The first tier is OFAC comprehensive sanctions — any transaction touching a sanctioned country is a critical violation under 31 CFR Chapter V that exposes the bank to civil and criminal penalties with no materiality threshold. The second tier is the FATF list of jurisdictions under increased monitoring, which have identified strategic deficiencies in their anti-money-laundering and counter-terrorist-financing regimes under FATF Recommendation 19. The third tier is the bank's internal elevated-risk jurisdiction model, which applies to countries that are not sanctioned and not on the FATF list but that carry elevated financial crime risk based on FFIEC guidance and transactional intelligence. A fourth rule checks for IP geolocation mismatch — when the originating device carries a private or domestic IP address but the declared transaction location is foreign, the discrepancy suggests falsified transaction metadata or use of a proxy to disguise the true origin.

**Time Pattern Rules**

Transaction timing is one of the most reliable passive fraud signals because it requires no additional data beyond what is already present in every transaction record. Transactions between midnight and 5:00 AM are flagged for off-hours activity because most legitimate retail and business transactions occur during normal operating hours, and off-hours activity is a well-established fraud indicator particularly for high-value transfers. A second, higher-severity rule isolates the 1:00 AM to 4:00 AM window specifically, which fraud datasets consistently identify as the period with the highest concentration of account takeover, unauthorized access, and card-not-present fraud events.

**Merchant Risk Rules**

These rules evaluate the nature of the receiving merchant rather than just the transaction amount or origin. Cryptocurrency and digital asset exchanges are flagged because they are a primary vehicle for converting illicit funds into assets that are difficult to trace or recover, and FinCEN requires money service business registration for crypto exchanges under FIN-2019-G001. Wire transfer services and money service businesses are flagged under BSA 31 CFR 1022 because they are the most common vehicle for layering funds across jurisdictions. Online gaming and gambling platforms are flagged because they allow funds to enter as deposits and exit as apparent winnings, creating a legitimate-looking paper trail for laundered money. Investment and financial platforms registered in known secrecy or low-regulation jurisdictions are flagged as offshore integration vehicles, which are frequently used in the final phase of money laundering to give illicit funds the appearance of legitimate investment returns. Unidentifiable merchants are flagged because FFIEC due diligence requirements mandate that every transaction have a verifiable business purpose. Peer-to-peer payment platforms are flagged because their instant settlement, limited KYC enforcement at lower transfer values, and difficulty tracing ultimate beneficiaries have made them an increasingly common layering mechanism under FinCEN FIN-2019-A003. Digital collectibles and NFT marketplaces are flagged because the FATF's 2021 updated guidance on virtual assets identified them as an emerging money laundering vehicle, citing the ability to conduct high-value ownership transfers anonymously without any corresponding movement of physical goods.

**AML and BSA Compliance Rules**

These rules operate at the intersection of transaction value, geography, and merchant type to identify patterns that individually might not trigger a threshold but in combination meet the standard for mandatory regulatory action. A transaction of $5,000 or more originating from a FATF high-risk jurisdiction meets the threshold for a mandatory Suspicious Activity Report filing with FinCEN under 31 CFR 1020.320. A transaction of $3,000 or more crossing an international border triggers the BSA Travel Rule under 31 CFR 1010.410, which requires the originating institution to pass specific customer identification to the receiving institution. A combination of a high-risk merchant type and a high-risk geographic location matches the layering typology described in FATF Recommendation 20, where funds are moved through multiple services across multiple jurisdictions to obscure their origin. Merchant names matching patterns associated with shell companies — such as generic holding company nomenclature with no verifiable operating history — trigger a rule under the FinCEN Beneficial Ownership Rule 31 CFR 1010.230, which requires banks to identify and verify the beneficial owners behind legal entity customers. Transactions loading stored-value instruments including gift cards and prepaid debit cards are flagged under the FinCEN Prepaid Access Rule 31 CFR 1022.210, which specifically identifies these instruments as a high-risk cash-equivalent conversion method due to their portability and limited traceability.

**Device and IP Rules**

These rules evaluate the network origin of the transaction rather than the transaction itself. A device IP registered to a commercial datacenter, hosting provider, or VPN service is flagged because legitimate retail banking customers almost never transact through commercial network infrastructure — this pattern is strongly associated with proxied or automated activity. Non-residential IP ranges are flagged at lower severity as a contextual signal, recognising that while not conclusive in isolation, they consistently appear in fraud event clusters alongside other indicators. IP addresses matching known TOR exit node and anonymizing proxy ranges are flagged at high severity because deliberate use of anonymizing networks for banking transactions is a strong indicator of identity concealment, as identified in the FFIEC Cybersecurity Assessment Tool.

**Velocity and Behavior Rules**

These rules detect behavioral patterns that indicate fraudulent intent independent of the transaction amount, location, or merchant. A transaction under $1.00 is a strong card testing signal — the established fraud technique of running a micro-charge first to confirm a stolen payment credential is active before escalating to larger fraudulent purchases. This precursor pattern is referenced in PCI DSS v4.0 Requirement 10.7. Transactions that fall just below a common internal review threshold by less than 5% are flagged as split structuring behavior, applying the same evasion logic to lower institutional thresholds that federal structuring law prohibits at the CTR level.

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

## Guardrails and Human-in-the-Loop

Automated fraud detection systems fail in predictable ways. They produce false positives that freeze legitimate customer accounts. They produce false negatives that let fraud pass. They generate outputs that sound authoritative but are wrong in ways that are difficult to detect without domain expertise. They make decisions that carry legal and regulatory consequences but cannot be explained to an auditor. Flagr is designed with the understanding that none of these failure modes are acceptable in a regulated financial institution, and that the appropriate response is not to pretend they will not occur but to build explicit guardrails that ensure a human being remains accountable for every consequential decision.

**The rule engine produces decisions, not recommendations.** Every rule that fires is a documented compliance signal tied to a specific regulation or institutional policy. The rule engine does not speculate. It does not produce probabilities. It evaluates a condition and either fires or does not fire. If AMT-001 fires, the bank has a legal obligation to file a Currency Transaction Report. If GEO-002 fires, the transaction involves a country under OFAC comprehensive sanctions. These are not suggestions — they are compliance events that require a specific response. The rule engine ensures that no transaction can pass through Flagr without being evaluated against every applicable regulatory threshold, and that every firing is recorded in the audit trail with its rule ID, description, severity, and regulation reference.

**The AI agents are explicitly constrained from making final decisions.** The root orchestrator agent operates under strict behavioral rules: it cannot approve any transaction with a risk score above 75 without a human review flag, it must escalate any score above 90 as CRITICAL, and it cannot override a fired compliance rule. The agents reason over the rule output and produce structured findings, but the account status, escalation decision, and recommended action are all surfaced to the compliance officer as inputs for a human decision — not as executed outcomes. No account is frozen, no SAR is filed, and no customer notification is sent by the AI. These actions require human confirmation.

**Escalation to human review is a first-class output.** The Action Recommender agent produces an explicit escalate-to-human field on every analysis. For any transaction scoring above 66, this field is set to true and the case is surfaced to the compliance officer queue with full context. The compliance officer sees the complete analysis — the rule engine output, the anomaly signals, the reasoning, the compliance report, and the recommended actions — and makes the final call. The AI does not bypass this step. It prepares the case so that the compliance officer can make an informed decision in seconds rather than hours, but it does not make the decision for them.

**Auditability is non-negotiable.** Every fired rule carries its regulation reference. Every analysis is assigned a case priority and a unique report ID. Every recommended action is tagged with a priority level. The full chain from raw transaction to final compliance determination is traceable, inspectable, and explainable. This matters for two reasons. First, if the system makes a mistake, a human can identify exactly where in the pipeline the error occurred and correct it. Second, when a regulator asks why a specific SAR was or was not filed, the answer is documented in the system and does not depend on anyone's memory.

**The risk of over-automation is treated as seriously as the risk of fraud.** A system that freezes legitimate accounts at scale damages customer trust and exposes the bank to liability. A system that flags everything as suspicious trains compliance officers to ignore alerts. Flagr's scoring model is calibrated to produce meaningful risk differentiation — not to maximize the flagging rate. Rules are severity-weighted so that a single low-severity signal does not produce the same response as a combination of critical violations. The AI reasoning layer is specifically designed to contextualize signals and explain why a particular combination is or is not consistent with known fraud typologies, rather than simply summing scores. Human judgment remains the final gate on every consequential action.

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
