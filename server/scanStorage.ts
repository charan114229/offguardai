/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { DashboardStats, ThreatAssessment } from '../src/types.js';

// Pre-seeded competition-level demo scenarios
export const DEMO_SCENARIOS: Record<string, ThreatAssessment> = {
  'demo-fake-offer': {
    id: 'demo-fake-offer',
    createdAt: new Date().toISOString(),
    inputType: 'text',
    targetSummary: 'TechCorp Global - Remote Cloud Architect Appointment Letter',
    threatScore: 89,
    riskLevel: 'CRITICAL',
    confidence: 96,
    isDemo: true,
    demoLabel: 'DEMO ANALYSIS',
    summary: 'Critical threat signals identified: Demands mandatory upfront laptop courier fee of ₹8,499 via private UPI, communicates from an unverified @gmail address, and exerts a strict 24-hour acceptance ultimatum.',
    verdictHeadline: 'Critical threat indicators detected. High likelihood of recruitment fraud or financial extraction.',
    processingTimeMs: 1420,
    breakdown: {
      paymentRisk: { score: 98, severity: 'CRITICAL', explanation: 'Direct demand for upfront equipment deposit via non-traceable UPI.' },
      phishingRisk: { score: 75, severity: 'HIGH', explanation: 'Includes link to unverified Google Form claiming to be enterprise HR portal.' },
      impersonationRisk: { score: 92, severity: 'CRITICAL', explanation: 'Recruiter uses free webmail (techcorp.recruitment.hr@gmail.com) impersonating enterprise entity.' },
      urgencyRisk: { score: 85, severity: 'CRITICAL', explanation: 'Forces acceptance and deposit within 24 hours to forfeit independent verification.' },
      credentialRisk: { score: 60, severity: 'HIGH', explanation: 'Requests submission of government identity cards (Aadhaar & PAN) over unencrypted chat.' },
      urlRisk: { score: 40, severity: 'MEDIUM', explanation: 'Observable Google Form link masquerading as internal corporate portal.' },
      domainRisk: { score: 80, severity: 'CRITICAL', explanation: 'Lack of verified corporate domain infrastructure.' },
      socialEngineeringRisk: { score: 88, severity: 'CRITICAL', explanation: 'Promises inflated joining bonus to incentivize compliant payment.' },
    },
    signals: [
      {
        id: 'demo-sig-1',
        category: 'PAYMENT_REQUEST',
        title: 'Upfront Equipment Security Deposit',
        severity: 'CRITICAL',
        confidence: 99,
        evidence: 'Candidate must deposit refundable equipment insurance fee of ₹8,499 to UPI ID: techcorp-desk@oksbi prior to dispatch of company MacBook Pro.',
        explanation: 'Legitimate employers provide company-managed equipment at zero cost to the employee. Upfront equipment deposits are the primary vehicle of employment advance-fee scams.',
      },
      {
        id: 'demo-sig-2',
        category: 'RECRUITER_IMPERSONATION',
        title: 'Free Webmail Provider for Corporate Outreach',
        severity: 'HIGH',
        confidence: 94,
        evidence: 'Contact email listed as: hr.talent.techcorpglobal@gmail.com instead of verified @techcorp.com.',
        explanation: 'Global tech corporations never manage hiring pipelines or issue formal appointment contracts from free public email providers.',
      },
      {
        id: 'demo-sig-3',
        category: 'ARTIFICIAL_URGENCY',
        title: 'Strict 24-Hour Coercive Expiration',
        severity: 'HIGH',
        confidence: 91,
        evidence: 'Offer contract valid for 24 hours only. Deposit receipt must be sent before 5:00 PM tomorrow or position will be re-allocated.',
        explanation: 'Scammers engineer extreme urgency to bypass candidate due diligence, family consultation, and employer verification.',
      },
      {
        id: 'demo-sig-4',
        category: 'SUSPICIOUS_COMMUNICATION',
        title: 'Off-Platform Telegram Onboarding Link',
        severity: 'HIGH',
        confidence: 89,
        evidence: 'Connect with Senior Talent Lead at t.me/techcorp_onboarding for immediate digital onboarding.',
        explanation: 'Migrating recruitment to private encrypted chat channels insulates perpetrators from platform compliance and detection.',
      }
    ],
    entities: {
      companyName: 'TechCorp Global Ltd',
      jobTitle: 'Remote Senior Cloud Solutions Architect',
      recruiterName: 'Ananya Sharma (Senior HR Executive)',
      contactInfo: 'hr.talent.techcorpglobal@gmail.com',
      statedCompensation: '$145,000 / ₹42,00,000 PA',
      detectedUrls: ['t.me/techcorp_onboarding', 'https://forms.gle/x9923fakecorp'],
      paymentDemands: ['₹8,499 refundable equipment insurance deposit'],
    },
    recommendations: [
      'DO NOT transfer ₹8,499 or any funds to the provided UPI ID or bank account.',
      'Cease all communications on Telegram and do not send scans of Aadhaar, PAN, or passport.',
      'Report the incident to the official national cybercrime reporting portal (e.g. cybercrime.gov.in or ic3.gov).',
      'Independently notify the real company security team regarding brand impersonation.',
    ],
    verificationSteps: [
      { id: 'v1', title: 'Zero Onboarding Payment Rule', instruction: 'Verify policy: No genuine tech company ever asks candidates for courier, insurance, or laptop fees.', priority: 'CRITICAL', completed: false },
      { id: 'v2', title: 'Verify Corporate Domain', instruction: 'Check official careers website at techcorp.com to see if this requisition ID is live.', priority: 'CRITICAL', completed: false },
      { id: 'v3', title: 'Contact Verified HR Switchboard', instruction: 'Call official corporate reception and ask for talent acquisition verification.', priority: 'RECOMMENDED', completed: false },
    ],
    limitations: [
      'Assessment restricted to submitted text excerpt.',
      'External domain intelligence unavailable (WHOIS lookup offline).',
    ],
  },

  'demo-suspicious-url': {
    id: 'demo-suspicious-url',
    createdAt: new Date().toISOString(),
    inputType: 'url',
    targetSummary: 'https://careers-google-verify.biz-careers.top/onboard/portal',
    threatScore: 84,
    riskLevel: 'CRITICAL',
    confidence: 94,
    isDemo: true,
    demoLabel: 'DEMO ANALYSIS',
    summary: 'High-risk phishing infrastructure detected. Domain mimics Google recruitment portal on a high-abuse .top top-level domain with multiple unverified subdomain hops.',
    verdictHeadline: 'High-risk indicators detected. Verify independently before proceeding or sharing any information.',
    processingTimeMs: 1180,
    breakdown: {
      paymentRisk: { score: 20, severity: 'LOW', explanation: 'No direct payment strings in URL, but gateway points to credential harvesting.' },
      phishingRisk: { score: 95, severity: 'CRITICAL', explanation: 'Typosquatting and deceptive brand prefix targeting job seekers.' },
      impersonationRisk: { score: 90, severity: 'CRITICAL', explanation: 'Domain attempts to impersonate Google Careers infrastructure.' },
      urgencyRisk: { score: 40, severity: 'MEDIUM', explanation: 'Path indicates urgent verification gate.' },
      credentialRisk: { score: 85, severity: 'CRITICAL', explanation: 'URL structure indicates an enterprise login credential harvesting form.' },
      urlRisk: { score: 95, severity: 'CRITICAL', explanation: 'High-abuse TLD (.top), brand impersonation, and non-canonical domain.' },
      domainRisk: { score: 90, severity: 'CRITICAL', explanation: 'Unauthorized third-party domain masquerading as Google.' },
      socialEngineeringRisk: { score: 70, severity: 'HIGH', explanation: 'Uses familiarity of known brand to induce trust.' },
    },
    signals: [
      {
        id: 'demo-sig-url-1',
        category: 'PHISHING_URL',
        title: 'Brand Impersonation in Hostname',
        severity: 'CRITICAL',
        confidence: 98,
        evidence: 'Domain "careers-google-verify.biz-careers.top" embeds "google" but root is registered under "biz-careers.top".',
        explanation: 'Attackers create lookalike subdomains containing trusted enterprise brand names to deceive candidates on mobile browsers where full hostnames may be truncated.',
      },
      {
        id: 'demo-sig-url-2',
        category: 'HIGH_RISK_INFRASTRUCTURE',
        title: 'High-Abuse Top Level Domain (.top)',
        severity: 'HIGH',
        confidence: 92,
        evidence: 'TLD registered under .top suffix with anomalous naming structure.',
        explanation: 'Major technology companies host all career and applicant tracking portals on their authoritative .com or company-owned top-level domains (e.g. google.com/about/careers).',
      },
      {
        id: 'demo-sig-url-3',
        category: 'CREDENTIAL_HARVESTING',
        title: 'Credential Interception Gateway',
        severity: 'HIGH',
        confidence: 87,
        evidence: 'URL endpoint "/onboard/portal" prompts for candidate email and password credentials.',
        explanation: 'Fake onboarding portals harvest candidate corporate or personal Google account passwords under the guise of an assessment login.',
      }
    ],
    urlAnalysis: {
      submittedUrl: 'https://careers-google-verify.biz-careers.top/onboard/portal',
      hostname: 'careers-google-verify.biz-careers.top',
      protocol: 'https:',
      isHttps: true,
      tld: 'top',
      isSuspiciousTld: true,
      isIpAddress: false,
      hasLookalikeBrand: true,
      lookalikeTarget: 'google',
      subdomainDepth: 2,
      hasEncodedChars: false,
      isExcessivelyLong: false,
      domainAgeStatus: 'External domain intelligence unavailable.',
    },
    entities: {
      companyName: 'Targeted Brand: Google',
      detectedUrls: ['https://careers-google-verify.biz-careers.top/onboard/portal'],
    },
    recommendations: [
      'DO NOT enter your email, password, or login credentials on this website.',
      'Navigate directly to the official Google Careers portal at careers.google.com without using the link.',
      'Check browser history and reset credentials immediately if password was already entered.',
      'Report the phishing URL to Google Safe Browsing and PhishTank.',
    ],
    verificationSteps: [
      { id: 'v1', title: 'Official Domain Verification', instruction: 'Ensure the address bar shows strictly "careers.google.com" with no strange prefixes or suffixes.', priority: 'CRITICAL', completed: false },
      { id: 'v2', title: 'Inspect SSL Certificate Root', instruction: 'Legitimate Google sites feature Google Trust Services certificates issued directly to Google LLC.', priority: 'RECOMMENDED', completed: false },
    ],
    limitations: [
      'External domain intelligence unavailable (WHOIS registrar data offline).',
      'Site not executed in sandbox browser to protect user system.',
    ],
  },

  'demo-legitimate-offer': {
    id: 'demo-legitimate-offer',
    createdAt: new Date().toISOString(),
    inputType: 'text',
    targetSummary: 'Apex Cloud Systems - Software Engineer Formal Offer',
    threatScore: 12,
    riskLevel: 'LOW',
    confidence: 92,
    isDemo: true,
    demoLabel: 'DEMO ANALYSIS',
    summary: 'Low-risk profile. Offer document adheres to standard corporate hiring protocols: verified corporate domain, structured compensation breakdown, no upfront fees requested, standard 10-business-day acceptance period.',
    verdictHeadline: 'Low-risk indicators detected. Standard hiring patterns observed; always confirm via official career portals.',
    processingTimeMs: 980,
    breakdown: {
      paymentRisk: { score: 0, severity: 'LOW', explanation: 'Zero requests for fees, deposits, or candidate funds.' },
      phishingRisk: { score: 5, severity: 'LOW', explanation: 'All referenced URLs point to standard corporate apexcloud.io domains.' },
      impersonationRisk: { score: 12, severity: 'LOW', explanation: 'Recruiter communicates from official corporate enterprise domain.' },
      urgencyRisk: { score: 10, severity: 'LOW', explanation: 'Reasonable 10-business-day review window provided.' },
      credentialRisk: { score: 8, severity: 'LOW', explanation: 'Formal background verification conducted via standard accredited third-party portal.' },
      urlRisk: { score: 5, severity: 'LOW', explanation: 'Observable links conform to valid HTTPS enterprise structure.' },
      domainRisk: { score: 10, severity: 'LOW', explanation: 'Domain matches verified corporate entity.' },
      socialEngineeringRisk: { score: 10, severity: 'LOW', explanation: 'Professional, objective tone throughout.' },
    },
    signals: [
      {
        id: 'demo-sig-legit-1',
        category: 'COMPLIANT_RECRUITMENT',
        title: 'Zero-Fee Candidate Guarantee',
        severity: 'LOW',
        confidence: 98,
        evidence: 'All required enterprise hardware, monitors, and security tokens are provisioned directly by Apex Cloud Systems IT Operations with zero candidate liability.',
        explanation: 'Consistent with verified enterprise hiring standards where all IT assets are fully funded and managed.',
      },
      {
        id: 'demo-sig-legit-2',
        category: 'VERIFIED_DOMAIN',
        title: 'Enterprise Corporate Domain Match',
        severity: 'LOW',
        confidence: 95,
        evidence: 'Recruiter email: marcus.vance@apexcloud.io matching official corporate presence.',
        explanation: 'Communications originate from verified corporate domain with SPF/DKIM records.',
      },
      {
        id: 'demo-sig-legit-3',
        category: 'STANDARD_TIMELINE',
        title: 'Professional Consideration Window',
        severity: 'LOW',
        confidence: 90,
        evidence: 'Please review the offer package and return the signed countersignature within 10 business days.',
        explanation: 'Provides standard industry contemplation timeframe without coercive high-pressure psychological tactics.',
      }
    ],
    entities: {
      companyName: 'Apex Cloud Systems Inc.',
      jobTitle: 'Staff Backend Engineer (Distributed Systems)',
      recruiterName: 'Marcus Vance (Director of Talent)',
      contactInfo: 'marcus.vance@apexcloud.io',
      statedCompensation: '$175,000 Base + Equity & Healthcare',
      detectedUrls: ['https://apexcloud.io/careers/portal/req-8821'],
    },
    recommendations: [
      'Confirm the offer details by logging into the official applicant portal where you originally applied.',
      'Review intellectual property clauses and non-disclosure terms with your legal advisor if needed.',
      'Maintain standard caution and verify background check vendor credentials before submitting tax identification.',
    ],
    verificationSteps: [
      { id: 'v1', title: 'Cross-Check Application Portal', instruction: 'Log into your applicant tracking system account to confirm status has moved to Offer Extended.', priority: 'RECOMMENDED', completed: false },
      { id: 'v2', title: 'Verify Background Check Partner', instruction: 'Ensure background verification is managed by an accredited screening agency (e.g. HireRight, Sterling, Checkr).', priority: 'ADVISORY', completed: false },
    ],
    limitations: [
      'Document structure appears consistent, but always independently confirm employment offers directly with the hiring organization.',
      'External domain intelligence unavailable (WHOIS lookup offline).',
    ],
  }
};

// In-memory scan storage for active session with seed data
let scanStore: ThreatAssessment[] = [
  DEMO_SCENARIOS['demo-fake-offer'],
  DEMO_SCENARIOS['demo-suspicious-url'],
  DEMO_SCENARIOS['demo-legitimate-offer'],
];

export function getScanHistory(): ThreatAssessment[] {
  return [...scanStore].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function getScanById(id: string): ThreatAssessment | undefined {
  return scanStore.find((s) => s.id === id);
}

export function saveScan(scan: ThreatAssessment): void {
  // Avoid duplicate ID
  scanStore = scanStore.filter((s) => s.id !== scan.id);
  // Unshift to top
  scanStore.unshift(scan);
  // Cap at 100 scans to avoid memory bloat
  if (scanStore.length > 100) {
    scanStore = scanStore.slice(0, 100);
  }
}

export function deleteScan(id: string): boolean {
  const initialLen = scanStore.length;
  scanStore = scanStore.filter((s) => s.id !== id);
  return scanStore.length < initialLen;
}

export function getDashboardStats(): DashboardStats {
  const totalScans = scanStore.length;
  const highRiskScans = scanStore.filter((s) => s.riskLevel === 'HIGH' || s.riskLevel === 'CRITICAL').length;
  const moderateRiskScans = scanStore.filter((s) => s.riskLevel === 'MODERATE' || s.riskLevel === 'GUARDED').length;
  const lowRiskScans = scanStore.filter((s) => s.riskLevel === 'LOW').length;

  const sumScores = scanStore.reduce((acc, curr) => acc + curr.threatScore, 0);
  const averageThreatScore = totalScans > 0 ? Math.round(sumScores / totalScans) : 0;

  return {
    totalScans,
    highRiskScans,
    moderateRiskScans,
    lowRiskScans,
    averageThreatScore,
    recentScans: getScanHistory().slice(0, 10),
  };
}
