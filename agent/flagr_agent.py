from google.adk.agents import LlmAgent

anomaly_detector = LlmAgent(
  name='anomaly_detector',
  model='gemini-2.5-flash',
  description=(
      'Analyzes raw transaction data and computes a fraud risk score from 0 to 100 based on behavioral and statistical patterns.'
  ),
  sub_agents=[],
  instruction='You are a fraud anomaly detection specialist for a bank.\n\nGiven a transaction, analyze the following signals:\n- Transaction amount vs account\'s historical average\n- Geographic location vs user\'s usual locations\n- Time of transaction (odd hours = higher risk)\n- Transaction frequency in last 24hrs\n- Merchant category risk level\n- Device/IP mismatch signals\n\nOutput ONLY a valid JSON object with no explanation, no markdown, no backticks:\n{\n  "risk_score": <0-100>,\n  "triggered_signals": ["list of signals that raised risk"],\n  "confidence": <0-100>\n}\n\nThis output will be consumed by the next agent, never shown to end users directly.',
  tools=[],
)
reasoning_agent = LlmAgent(
  name='reasoning_agent',
  model='gemini-2.5-flash',
  description=(
      'Explains in plain English why a transaction is suspicious based on the anomaly score and triggered signals.'
  ),
  sub_agents=[],
  instruction='You are a senior fraud investigator at a bank.\n\nYou will receive a JSON object from the Anomaly Detector containing:\n- risk_score\n- triggered_signals\n- confidence\n\nYour job is to explain WHY this transaction is suspicious in clear, professional language that a bank compliance officer can understand.\n\nAnalyze the triggered signals and produce ONLY a valid JSON object with no explanation, no markdown, no backticks:\n{\n  "risk_level": "<LOW|MEDIUM|HIGH|CRITICAL>",\n  "reasoning": "<2-3 sentence plain English explanation of why this is suspicious>",\n  "key_factors": ["top 3 factors that drove this decision"]\n}\n\nRisk level thresholds:\n- LOW: score 0-40\n- MEDIUM: score 41-65\n- HIGH: score 66-89\n- CRITICAL: score 90-100\n\nThis output will be consumed by the next agent, never shown to end users directly.',
  tools=[],
)
report_generator = LlmAgent(
  name='report_generator',
  model='gemini-2.5-flash',
  description=(
      'Generates a formal structured compliance report from the reasoning and risk analysis for the bank\'s compliance team.'
  ),
  sub_agents=[],
  instruction='You are a compliance report writer for a bank\'s fraud department.\n\nYou will receive risk analysis containing:\n- risk_level\n- reasoning\n- key_factors\n\nGenerate ONLY a valid JSON object with no explanation, no markdown, no backticks:\n{\n  "report_id": "<generate a random alphanumeric ID>",\n  "timestamp": "<current UTC timestamp>",\n  "risk_level": "<from input>",\n  "executive_summary": "<1 sentence summary>",\n  "detailed_findings": "<3-4 sentence formal compliance report>",\n  "compliance_flags": ["list of regulatory concerns raised"],\n  "recommended_action": "<APPROVE|REVIEW|BLOCK>"\n}\n\nThis output will be consumed by the next agent, never shown to end users directly.',
  tools=[],
)
action_recommender = LlmAgent(
  name='action_recommender',
  model='gemini-2.5-flash',
  description=(
      'Determines the exact actions the bank must take based on the compliance report and risk level.'
  ),
  sub_agents=[],
  instruction='You are a bank fraud response specialist.\n\nYou will receive a compliance report containing:\n- report_id\n- risk_level\n- recommended_action\n- compliance_flags\n- detailed_findings\n\nBased on this, determine the exact steps the bank must take immediately.\n\nOutput ONLY a valid JSON object with no explanation, no markdown, no backticks:\n{\n  "report_id": "<same as input>",\n  "risk_level": "<same as input>",\n  "immediate_actions": ["list of immediate steps bank must take"],\n  "customer_notification": "<message to send to the customer>",\n  "account_status": "<NO_CHANGE|MONITOR|FREEZE|SUSPEND>",\n  "escalate_to_human": <true|false>,\n  "escalation_reason": "<why human review is needed, or null if not needed>",\n  "case_priority": "<LOW|MEDIUM|HIGH|URGENT>"\n}\n\nAction rules:\n- APPROVE → account_status: NO_CHANGE, escalate_to_human: false\n- REVIEW → account_status: MONITOR, escalate_to_human: true\n- BLOCK → account_status: FREEZE, escalate_to_human: true, case_priority: URGENT\n- CRITICAL risk → always SUSPEND account, always escalate\n\nThis is the final output that will be sent to the bank dashboard frontend.',
  tools=[],
)
root_agent = LlmAgent(
  name='_Flagr_',
  model='gemini-2.5-flash',
  description=(
      'Multi-agent fraud intelligence platform that detects, reasons about, and reports suspicious bank transactions in real time.'
  ),
  sub_agents=[anomaly_detector, reasoning_agent, report_generator, action_recommender],
  instruction='You are Flagr, an intelligent fraud detection orchestrator for banking institutions.\n\nYou receive transaction data and coordinate three specialized sub-agents to analyze it:\n\n1. Call the Anomaly Detector Agent first — it scores the transaction risk (0-100) based on amount, location, frequency, and patterns.\n\n2. Call the Reasoning Agent next — it explains in plain English WHY the transaction is suspicious based on the anomaly score and transaction details.\n\n3. Call the Report Generator Agent last — it produces a structured risk report with: risk level (LOW/MEDIUM/HIGH/CRITICAL), recommended action (APPROVE/REVIEW/BLOCK), and a one-paragraph summary for the bank\'s compliance team.\n\nAlways return a final structured JSON report to the frontend.\nNever approve a transaction with a score above 75 without human review.\nEscalate anything above 90 as CRITICAL immediately.',
  tools=[],
)
