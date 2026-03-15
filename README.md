# Flagr

AI-powered multi-agent fraud intelligence platform for bank risk and compliance teams.

Live Demo: https://flagr-xi.vercel.app

---

## The Problem

Financial fraud costs banks billions annually. Existing rule-based detection systems flag suspicious transactions but stop there. They produce no reasoning, no explanation, and no recommended action. Compliance officers are left drowning in alerts with no context, spending hours manually reviewing cases that should take seconds.

The bank absorbs the cost in analyst labor hours. The customer absorbs it in frozen accounts and delayed responses after an already stressful event.

Flagr was built to change that.

---

## What Flagr Does

Flagr is a B2B fraud intelligence platform that takes a bank transaction and returns a complete compliance-ready fraud analysis in real time.

The compliance officer sees a live dashboard of all transactions, each pre-scored by risk level. When they click Analyze on any transaction, four specialized AI agents work through it in sequence, each doing one job precisely and passing their findings to the next. By the time the pipeline finishes, the output is a professional report with anomaly scoring, plain-English reasoning, regulatory compliance flags, and a clear recommended action the bank can act on immediately.

The entire analysis takes seconds. What previously required a trained fraud analyst now happens automatically.

---

## The Four AI Agents

Rather than sending everything to a single AI model, Flagr uses a multi-agent pipeline where each agent is specifically designed, prompted, and configured for one task. The output of each agent becomes the input context for the next.

**Agent 1 is the Anomaly Detector.**

It analyzes the raw transaction and computes a fraud risk score from 0 to 100. It examines transaction amount against historical averages, geographic location risk, time of transaction, merchant category risk, transaction frequency in the last 24 hours, and device or IP mismatch signals. It produces a structured risk score with triggered signals and confidence level.

**Agent 2 is the Reasoning Agent.**

This agent receives the anomaly output and explains in plain professional English why the transaction is suspicious. It maps the triggered signals to a risk level: LOW, MEDIUM, HIGH, or CRITICAL, and produces a clear explanation a compliance officer can read and act on immediately. It does not produce generic responses. Every explanation is specific to the exact signals that were triggered.

**Agent 3 is the Report Generator.**

This agent receives the reasoning output and produces a formal compliance report. It generates a unique report ID, timestamps the analysis, writes an executive summary, documents detailed findings in compliance language, and flags specific regulatory concerns such as BSA/AML review requirements or SAR filing obligations. The output is formatted for direct inclusion in a compliance audit trail.

**Agent 4 is the Action Recommender.**

This is the final synthesis step. The action recommender receives everything the first three agents found and determines exactly what the bank must do next. It produces a recommended action of APPROVE, REVIEW, or BLOCK, specifies the account status change required, lists the immediate steps the compliance team must take, generates a customer notification message, determines whether the case requires human escalation, and assigns a case priority. This is what the compliance officer acts on.

---

## Why Multi-Agent Architecture

A single AI model given all four tasks at once produces inconsistent and hard-to-audit results. Separating the work into four specialized agents means each one can be optimized independently for exactly what it needs to do. The anomaly detector never has to think about regulatory language. The report generator never has to think about risk scoring. The action recommender has the benefit of three structured expert inputs before it makes any recommendation.

This approach also makes the system transparent and auditable. Every step of the reasoning is visible separately. When a compliance officer reviews a Flagr analysis, they can see exactly what each agent found and why the final recommendation was made. That matters in an industry where documentation and compliance are non-negotiable.

---

## Who This Is Built For

Flagr is designed for bank risk and compliance teams that process large volumes of transactions and need to reduce manual analyst workload without cutting corners on accuracy or regulatory compliance.

For compliance officers, the benefit is immediate. Every transaction comes with a complete audit trail, plain-English reasoning, and a specific recommended action. No more spending hours on cases that should take seconds.

For the bank, the benefit is systemic. Flagr can process hundreds of transactions simultaneously, flags only what matters, and produces documentation that satisfies regulatory requirements automatically.

---

## Technical Stack

Flagr is a full-stack web platform with a Next.js 14 frontend deployed on Vercel and a Python FastAPI backend deployed on Render. All AI processing runs through Google ADK with Gemini 2.5 Flash.

The four agents are orchestrated using Google ADK's LlmAgent and Runner pattern. Each agent runs on Gemini 2.5 Flash with a custom instruction set that defines its role, required output structure, and strict behavioral constraints. Agents are designed to produce clean structured JSON output every time, not conversational filler text.

The backend orchestrates the pipeline sequentially, passing each agent's structured output as context to the next one. All API credentials are stored server-side only and never exposed to the client.

The transaction data is sourced from the Kaggle Credit Card Fraud Detection dataset, providing a realistic foundation of real-world fraud patterns for the demo.

---

## The Bigger Picture

Banks process hundreds of millions of transactions every year. The labor cost of manual fraud review runs into the billions. The human cost of slow processing falls on customers whose accounts are frozen or whose legitimate transactions are declined while waiting for a human to review an alert.

Flagr demonstrates that the core fraud workflow, anomaly detection, reasoning, compliance reporting, and action recommendation, can be fully automated for the majority of transactions. This frees human analysts to focus their expertise on complex cases, coordinated fraud rings, and the edge cases that genuinely need human judgment.

An analysis that used to take hours now takes seconds. That is the whole point.

---

Built for GenAI Genesis 2026.
