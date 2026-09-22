/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GoogleGenAI, Type } from '@google/genai';
import { ExtractedEntities, RiskSignal, VerificationTask } from '../src/types.js';

let aiInstance: GoogleGenAI | null = null;

function getGenAI(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  if (!aiInstance) {
    aiInstance = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiInstance;
}

export interface RawAiAnalysisResult {
  summary: string;
  signals: RiskSignal[];
  paymentRisk: number;
  phishingRisk: number;
  impersonationRisk: number;
  urgencyRisk: number;
  credentialRisk: number;
  urlRisk: number;
  domainRisk: number;
  socialEngineeringRisk: number;
  entities: ExtractedEntities;
  recommendations: string[];
  verificationSteps: VerificationTask[];
  limitations: string[];
}

const SYSTEM_INSTRUCTION = `You are OFFERGUARD AI, an elite cybersecurity and recruitment-fraud threat inspection engine.
Your purpose is to inspect suspicious job offers, appointment letters, recruiter messages, recruitment URLs, and onboarding communications.

You inspect for:
1. PAYMENT REQUESTS: Registration fees, training fees, mandatory equipment purchases, background check charges, gift cards, cryptocurrency, or UPI/wire transfers.
2. RECRUITER IMPERSONATION: Free email domains (@gmail, @yahoo, @hotmail) purporting to represent Fortune 500 / global enterprises; unverified Telegram/WhatsApp redirects.
3. ARTIFICIAL URGENCY: Coercive deadlines ("within 24 hours", "offer expires today") pressuring candidate to act without independent verification.
4. CREDENTIAL / IDENTITY HARVESTING: Premature demands for banking PINs, OTPs, Aadhaar/SSN scans, passport uploads, or login credentials.
5. UNREALISTIC COMPENSATION: Staggeringly high compensation for minimal qualifications with zero technical interview rounds.
6. PHISHING & URL HAZARDS: Suspicious portals, lookalike subdomains, unverified forms, or deceptive links.

RULES:
- Extract EXACT quotes from the submitted text/image into the 'evidence' field of signals.
- In 'explanation', provide an objective, cybersecurity-grounded rationale.
- Never declare absolute statements like "This is definitely a scam." Use measured threat intelligence language like "High-risk indicators detected." or "Suspicious payment solicitation identified."
- Return pure structured JSON according to the schema.`;

const RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    summary: {
      type: Type.STRING,
      description: "Concise 2-3 sentence executive threat summary of the analyzed content.",
    },
    paymentRisk: { type: Type.INTEGER, description: "0-100 risk score for payment demands or fee extraction." },
    phishingRisk: { type: Type.INTEGER, description: "0-100 risk score for deceptive links or harvesting forms." },
    impersonationRisk: { type: Type.INTEGER, description: "0-100 risk score for recruiter/brand impersonation." },
    urgencyRisk: { type: Type.INTEGER, description: "0-100 risk score for artificial pressure or rapid deadlines." },
    credentialRisk: { type: Type.INTEGER, description: "0-100 risk score for identity or credential harvesting." },
    urlRisk: { type: Type.INTEGER, description: "0-100 risk score for suspicious domain or link structures." },
    domainRisk: { type: Type.INTEGER, description: "0-100 risk score for domain spoofing or lookalikes." },
    socialEngineeringRisk: { type: Type.INTEGER, description: "0-100 risk score for manipulative psychological tactics." },
    signals: {
      type: Type.ARRAY,
      description: "List of detected risk signals with exact evidence quotes.",
      items: {
        type: Type.OBJECT,
        properties: {
          category: { type: Type.STRING, description: "e.g. PAYMENT_REQUEST, ARTIFICIAL_URGENCY, IMPERSONATION, CREDENTIAL_HARVESTING" },
          title: { type: Type.STRING, description: "Short descriptive signal name, e.g. Upfront Laptop Fee Demanded" },
          severity: { type: Type.STRING, description: "LOW, MEDIUM, HIGH, or CRITICAL" },
          confidence: { type: Type.INTEGER, description: "Confidence score between 0 and 100" },
          evidence: { type: Type.STRING, description: "Exact quotation or text excerpt from the input that triggered this flag." },
          explanation: { type: Type.STRING, description: "Clear, concise cybersecurity explanation of why this is a risk." },
        },
        required: ["category", "title", "severity", "confidence", "evidence", "explanation"],
      },
    },
    entities: {
      type: Type.OBJECT,
      properties: {
        companyName: { type: Type.STRING },
        jobTitle: { type: Type.STRING },
        recruiterName: { type: Type.STRING },
        contactInfo: { type: Type.STRING },
        statedCompensation: { type: Type.STRING },
        detectedUrls: { type: Type.ARRAY, items: { type: Type.STRING } },
        paymentDemands: { type: Type.ARRAY, items: { type: Type.STRING } },
      },
    },
    recommendations: {
      type: Type.ARRAY,
      description: "Direct actionable next steps for the candidate.",
      items: { type: Type.STRING },
    },
    verificationSteps: {
      type: Type.ARRAY,
      description: "Concrete verification checklist items.",
      items: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          instruction: { type: Type.STRING },
          priority: { type: Type.STRING, description: "CRITICAL, RECOMMENDED, or ADVISORY" },
        },
        required: ["title", "instruction", "priority"],
      },
    },
    limitations: {
      type: Type.ARRAY,
      description: "Analytical limitations, e.g., external whois not accessed, context restricted to submitted excerpt.",
      items: { type: Type.STRING },
    },
  },
  required: [
    "summary",
    "paymentRisk",
    "phishingRisk",
    "impersonationRisk",
    "urgencyRisk",
    "credentialRisk",
    "urlRisk",
    "domainRisk",
    "socialEngineeringRisk",
    "signals",
    "recommendations",
    "verificationSteps",
    "limitations"
  ],
};

export async function analyzeContentWithGemini(
  content: string,
  inputType: 'text' | 'url' | 'file',
  fileData?: { mimeType: string; base64: string }
): Promise<RawAiAnalysisResult> {
  const ai = getGenAI();

  if (!ai) {
    // Graceful offline heuristic analyzer if API key is not yet set
    return fallbackHeuristicAnalyzer(content, inputType);
  }

  try {
    let contentsPayload: any;

    if (fileData) {
      contentsPayload = {
        parts: [
          {
            inlineData: {
              mimeType: fileData.mimeType,
              data: fileData.base64,
            },
          },
          {
            text: `Analyze this uploaded document/image for recruitment fraud, fake appointment/offer clauses, upfront fees, recruiter impersonation, phishing links, and suspicious urgency. Input type: ${inputType}. Context notes: ${content || 'Uploaded file inspection'}`,
          },
        ],
      };
    } else {
      contentsPayload = `Perform structured cybersecurity analysis on the following submitted recruitment ${inputType}:\n\n${content}`;
    }

    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('AI analysis timed out after 12s, falling back to local heuristic inspection')), 12000)
    );

    const callPromise = ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: contentsPayload,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: 'application/json',
        responseSchema: RESPONSE_SCHEMA,
      },
    });

    const response = await Promise.race([callPromise, timeoutPromise]);

    const text = response.text;
    if (!text) {
      throw new Error('Empty response from AI engine');
    }

    const parsed = JSON.parse(text);

    // Sanitize and ensure format
    const signals: RiskSignal[] = (parsed.signals || []).map((s: any, idx: number) => ({
      id: `sig-${Date.now()}-${idx}`,
      category: String(s.category || 'GENERAL_RISK').toUpperCase(),
      title: String(s.title || 'Suspicious Indicator'),
      severity: (['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].includes(s.severity) ? s.severity : 'MEDIUM') as any,
      confidence: typeof s.confidence === 'number' ? Math.min(100, Math.max(0, s.confidence)) : 80,
      evidence: String(s.evidence || 'Pattern detected in content body.'),
      explanation: String(s.explanation || 'Evaluated as a potential recruitment risk indicator.'),
    }));

    const verificationSteps: VerificationTask[] = (parsed.verificationSteps || []).map((v: any, idx: number) => ({
      id: `vtask-${idx}`,
      title: String(v.title || 'Verification Step'),
      instruction: String(v.instruction || 'Verify independently through official channels.'),
      priority: (['CRITICAL', 'RECOMMENDED', 'ADVISORY'].includes(v.priority) ? v.priority : 'RECOMMENDED') as any,
      completed: false,
    }));

    return {
      summary: parsed.summary || 'Security assessment completed.',
      signals,
      paymentRisk: clamp(parsed.paymentRisk),
      phishingRisk: clamp(parsed.phishingRisk),
      impersonationRisk: clamp(parsed.impersonationRisk),
      urgencyRisk: clamp(parsed.urgencyRisk),
      credentialRisk: clamp(parsed.credentialRisk),
      urlRisk: clamp(parsed.urlRisk),
      domainRisk: clamp(parsed.domainRisk),
      socialEngineeringRisk: clamp(parsed.socialEngineeringRisk),
      entities: parsed.entities || {},
      recommendations: Array.isArray(parsed.recommendations) ? parsed.recommendations : [],
      verificationSteps,
      limitations: Array.isArray(parsed.limitations) ? parsed.limitations : ['Assessment restricted to submitted content.'],
    };
  } catch (err: any) {
    console.error('Gemini security analysis error, triggering heuristic fallback:', err?.message || err);
    return fallbackHeuristicAnalyzer(content, inputType);
  }
}

function clamp(val: any): number {
  if (typeof val !== 'number' || isNaN(val)) return 0;
  return Math.min(100, Math.max(0, Math.round(val)));
}

/**
 * Robust heuristic security analyzer for zero-failure resilience
 */
export function fallbackHeuristicAnalyzer(text: string, inputType: 'text' | 'url' | 'file'): RawAiAnalysisResult {
  const lower = text.toLowerCase();
  const signals: RiskSignal[] = [];
  const recommendations: string[] = [];
  const verificationSteps: VerificationTask[] = [];

  let paymentRisk = 5;
  let phishingRisk = 10;
  let impersonationRisk = 10;
  let urgencyRisk = 10;
  let credentialRisk = 5;
  let urlRisk = 10;
  let domainRisk = 10;
  let socialRisk = 10;

  // 1. Payment detection
  const paymentKeywords = [
    'registration fee', 'training fee', 'security deposit', 'equipment fee', 
    'laptop deposit', 'processing charge', 'refundable fee', 'pay ₹', 'pay $', 
    'gift card', 'bitcoin', 'crypto', 'wire transfer', 'google play card', 'upi transfer'
  ];
  for (const kw of paymentKeywords) {
    if (lower.includes(kw)) {
      paymentRisk = Math.max(paymentRisk, 95);
      signals.push({
        id: `sig-pay-${signals.length}`,
        category: 'PAYMENT_REQUEST',
        title: 'Upfront Financial Solicitation Detected',
        severity: 'CRITICAL',
        confidence: 96,
        evidence: `Matches keyword pattern: "${kw}" within submitted content.`,
        explanation: 'Legitimate employers never demand upfront fees, equipment deposits, or training charges from job applicants.',
      });
      break;
    }
  }

  // 2. Impersonation / Free email domains
  const freeMails = ['@gmail.com', '@yahoo.com', '@outlook.com', '@hotmail.com', '@proton.me'];
  for (const mail of freeMails) {
    if (lower.includes(mail)) {
      impersonationRisk = Math.max(impersonationRisk, 85);
      signals.push({
        id: `sig-imp-${signals.length}`,
        category: 'RECRUITER_IMPERSONATION',
        title: 'Free Webmail Recruiter Identity',
        severity: 'HIGH',
        confidence: 92,
        evidence: `Contact address contains public domain "${mail}".`,
        explanation: 'Corporate HR representatives communicate exclusively from verified enterprise domain names, not free webmail providers.',
      });
      break;
    }
  }

  // 3. Telegram / WhatsApp redirection
  if (lower.includes('telegram') || lower.includes('t.me/') || lower.includes('whatsapp') || lower.includes('chat with hr')) {
    socialRisk = Math.max(socialRisk, 75);
    signals.push({
      id: `sig-soc-${signals.length}`,
      category: 'SUSPICIOUS_COMMUNICATION',
      title: 'Off-Platform Messaging Redirection',
      severity: 'HIGH',
      confidence: 88,
      evidence: 'Redirection to private encrypted messenger (Telegram/WhatsApp) for onboarding.',
      explanation: 'Scammers shift candidates to unmonitored encrypted apps to evade platform security controls and anti-fraud monitoring.',
    });
  }

  // 4. Urgency
  if (lower.includes('within 24 hours') || lower.includes('immediate joining') || lower.includes('urgent') || lower.includes('offer expires today')) {
    urgencyRisk = Math.max(urgencyRisk, 80);
    signals.push({
      id: `sig-urg-${signals.length}`,
      category: 'ARTIFICIAL_URGENCY',
      title: 'Coercive Immediate Deadline',
      severity: 'HIGH',
      confidence: 85,
      evidence: 'Strict immediate response window detected in offer text.',
      explanation: 'Artificial urgency is a psychological tactic designed to induce panic and prevent candidates from independently verifying credentials.',
    });
  }

  // 5. Credential / Identity documents
  if (lower.includes('otp') || lower.includes('password') || lower.includes('bank pin') || lower.includes('send aadhaar and pan copy immediately')) {
    credentialRisk = Math.max(credentialRisk, 90);
    signals.push({
      id: `sig-cred-${signals.length}`,
      category: 'CREDENTIAL_HARVESTING',
      title: 'Sensitive Credential or Identity Solicitation',
      severity: 'CRITICAL',
      confidence: 95,
      evidence: 'Solicitation of OTP, banking credentials, or unencrypted identity documents.',
      explanation: 'Never share OTPs, passwords, or personal banking credentials under any pretense of employment onboarding.',
    });
  }

  // Build recommendations
  if (paymentRisk > 50) {
    recommendations.push('Do NOT transfer any money, deposits, or purchase gift cards under any circumstances.');
    recommendations.push('Cease all financial transactions and report the payment request to cybercrime authorities.');
  }
  if (impersonationRisk > 50) {
    recommendations.push('Independently verify recruiter credentials by calling the company switchboard directly.');
    recommendations.push('Check the organization official careers portal to verify if the job requisition ID is valid.');
  }
  if (urgencyRisk > 50) {
    recommendations.push('Do not allow artificial deadlines to rush your due diligence.');
  }
  recommendations.push('Never disclose one-time passwords (OTPs), bank logins, or credit card details.');
  recommendations.push('Avoid clicking unverified links or downloading attachments from unconfirmed addresses.');

  // Verification Checklist
  verificationSteps.push({
    id: 'vtask-1',
    title: 'Verify on Official Careers Portal',
    instruction: 'Search the company official domain (not links from the message) for this specific Job Title / Requisition ID.',
    priority: 'CRITICAL',
  });
  verificationSteps.push({
    id: 'vtask-2',
    title: 'Validate Recruiter LinkedIn Identity',
    instruction: 'Cross-reference recruiter name, tenure, and listed enterprise domain on professional networks.',
    priority: 'RECOMMENDED',
  });
  verificationSteps.push({
    id: 'vtask-3',
    title: 'Company Switchboard Confirmation',
    instruction: 'Call the main corporate telephone line listed on public business directories and ask for HR Talent Acquisition.',
    priority: 'RECOMMENDED',
  });
  verificationSteps.push({
    id: 'vtask-4',
    title: 'Zero Onboarding Payment Rule',
    instruction: 'Confirm company policy: Legitimate corporate employers never charge candidates for equipment or training.',
    priority: 'CRITICAL',
  });

  return {
    summary: signals.length > 0 
      ? `Threat engine detected ${signals.length} notable security signal(s) indicating potential recruitment risks.` 
      : 'No high-risk threat indicators flagged in the submitted content; standard hiring hygiene advised.',
    signals,
    paymentRisk,
    phishingRisk,
    impersonationRisk,
    urgencyRisk,
    credentialRisk,
    urlRisk,
    domainRisk,
    socialEngineeringRisk: socialRisk,
    entities: {
      companyName: text.match(/(?:at|for|from|with)\s+([A-Z][A-Za-z0-9\s&]{2,30})/)?.[1]?.trim() || undefined,
      contactInfo: text.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/)?.[0] || undefined,
    },
    recommendations,
    verificationSteps,
    limitations: [
      'Assessment is based strictly on observable submitted patterns and semantic security analysis.',
      'External domain intelligence unavailable (real-time WHOIS/registrar lookup offline).',
    ],
  };
}
