/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { 
  RiskBreakdown, 
  RiskLevel, 
  RiskSignal, 
  SignalSeverity 
} from '../src/types.js';

interface RawDimensionInput {
  paymentRisk?: number;
  phishingRisk?: number;
  impersonationRisk?: number;
  urgencyRisk?: number;
  credentialRisk?: number;
  urlRisk?: number;
  domainRisk?: number;
  socialEngineeringRisk?: number;
}

export function calculateDeterministicScamIndex(
  signals: RiskSignal[],
  rawDimensionScores: RawDimensionInput,
  observableUrlRisk?: number
): {
  threatScore: number;
  riskLevel: RiskLevel;
  confidence: number;
  breakdown: RiskBreakdown;
  verdictHeadline: string;
} {
  // Determine severity multipliers and dimension weights
  // In recruitment fraud, upfront payment demands & credential harvesting are lethal red flags.
  let paymentScore = rawDimensionScores.paymentRisk ?? 0;
  let phishingScore = rawDimensionScores.phishingRisk ?? 0;
  let impersonationScore = rawDimensionScores.impersonationRisk ?? 0;
  let urgencyScore = rawDimensionScores.urgencyRisk ?? 0;
  let credentialScore = rawDimensionScores.credentialRisk ?? 0;
  let urlScore = Math.max(rawDimensionScores.urlRisk ?? 0, observableUrlRisk ?? 0);
  let domainScore = rawDimensionScores.domainRisk ?? 0;
  let socialScore = rawDimensionScores.socialEngineeringRisk ?? 0;

  // Signal-based adjustments
  let hasCriticalPaymentSignal = false;
  let hasCriticalCredentialSignal = false;
  let hasCriticalImpersonationSignal = false;
  let totalSignalConfidence = 0;

  for (const s of signals) {
    totalSignalConfidence += s.confidence || 75;
    const cat = s.category.toUpperCase();

    if (cat.includes('PAY') || cat.includes('FEE') || cat.includes('DEPOSIT') || cat.includes('EQUIPMENT')) {
      if (s.severity === 'CRITICAL') {
        hasCriticalPaymentSignal = true;
        paymentScore = Math.max(paymentScore, 95);
      } else if (s.severity === 'HIGH') {
        paymentScore = Math.max(paymentScore, 80);
      }
    }

    if (cat.includes('CREDENTIAL') || cat.includes('PASSWORD') || cat.includes('OTP')) {
      if (s.severity === 'CRITICAL' || s.severity === 'HIGH') {
        hasCriticalCredentialSignal = true;
        credentialScore = Math.max(credentialScore, 90);
      }
    }

    if (cat.includes('IMPERSONATION') || cat.includes('RECRUITER') || cat.includes('DOMAIN')) {
      if (s.severity === 'CRITICAL' || s.severity === 'HIGH') {
        hasCriticalImpersonationSignal = true;
        impersonationScore = Math.max(impersonationScore, 85);
      }
    }

    if (cat.includes('URGENCY') || cat.includes('DEADLINE')) {
      urgencyScore = Math.max(urgencyScore, s.severity === 'CRITICAL' ? 85 : 70);
    }

    if (cat.includes('URL') || cat.includes('PHISH') || cat.includes('LINK')) {
      phishingScore = Math.max(phishingScore, s.severity === 'CRITICAL' ? 90 : 75);
    }
  }

  // Dimension weights (normalized to 1.0)
  // Payment: 0.28, Phishing: 0.16, Impersonation: 0.16, Credential: 0.14, Urgency: 0.08, URL: 0.08, Domain: 0.05, Social: 0.05
  const weightedBase = (
    paymentScore * 0.28 +
    phishingScore * 0.16 +
    impersonationScore * 0.16 +
    credentialScore * 0.14 +
    urgencyScore * 0.08 +
    urlScore * 0.08 +
    domainScore * 0.05 +
    socialScore * 0.05
  );

  let finalThreatScore = Math.round(weightedBase);

  // Critical floors: In recruitment fraud, genuine employers NEVER ask candidates to pay onboarding fees,
  // training deposits, or send OTPs/passwords. Such signals must guarantee a HIGH or CRITICAL score.
  if (hasCriticalPaymentSignal && (urgencyScore > 50 || impersonationScore > 50)) {
    finalThreatScore = Math.max(finalThreatScore, 88);
  } else if (hasCriticalPaymentSignal) {
    finalThreatScore = Math.max(finalThreatScore, 82);
  } else if (hasCriticalCredentialSignal) {
    finalThreatScore = Math.max(finalThreatScore, 84);
  } else if (hasCriticalImpersonationSignal && urgencyScore > 50) {
    finalThreatScore = Math.max(finalThreatScore, 72);
  }

  // Ensure 0 - 100 range
  finalThreatScore = Math.min(100, Math.max(0, finalThreatScore));

  // Determine Risk Level
  let riskLevel: RiskLevel;
  if (finalThreatScore >= 81) {
    riskLevel = 'CRITICAL';
  } else if (finalThreatScore >= 61) {
    riskLevel = 'HIGH';
  } else if (finalThreatScore >= 41) {
    riskLevel = 'MODERATE';
  } else if (finalThreatScore >= 21) {
    riskLevel = 'GUARDED';
  } else {
    riskLevel = 'LOW';
  }

  // Calculate system confidence (weighted by signal count and clarity)
  const averageSignalConf = signals.length > 0 ? (totalSignalConfidence / signals.length) : 85;
  const confidence = Math.min(99, Math.max(65, Math.round(averageSignalConf)));

  // Severity helper
  const toSeverity = (val: number): SignalSeverity => {
    if (val >= 80) return 'CRITICAL';
    if (val >= 60) return 'HIGH';
    if (val >= 35) return 'MEDIUM';
    return 'LOW';
  };

  const breakdown: RiskBreakdown = {
    paymentRisk: {
      score: paymentScore,
      severity: toSeverity(paymentScore),
      explanation: paymentScore > 50 
        ? 'Explicit or implied demand for candidate funds, fees, or refundable deposits.' 
        : 'No direct or indirect fee or monetary extraction demands detected.',
    },
    phishingRisk: {
      score: phishingScore,
      severity: toSeverity(phishingScore),
      explanation: phishingScore > 50
        ? 'Suspicious redirect chains, deceptive forms, or unverified link patterns.'
        : 'Links appear consistent or no hazardous redirection payloads identified.',
    },
    impersonationRisk: {
      score: impersonationScore,
      severity: toSeverity(impersonationScore),
      explanation: impersonationScore > 50
        ? 'Discrepancy between stated enterprise identity and recruitment infrastructure/email.'
        : 'Contact channels reflect conventional corporate outreach patterns.',
    },
    urgencyRisk: {
      score: urgencyScore,
      severity: toSeverity(urgencyScore),
      explanation: urgencyScore > 50
        ? 'Artificial time-constraints designed to pressure acceptance before verification.'
        : 'Standard or professional timeline communicated without coercive urgency.',
    },
    credentialRisk: {
      score: credentialScore,
      severity: toSeverity(credentialScore),
      explanation: credentialScore > 50
        ? 'Solicitation of sensitive credentials, passwords, or premature personal identification.'
        : 'No unauthorized credential or identity access requested.',
    },
    urlRisk: {
      score: urlScore,
      severity: toSeverity(urlScore),
      explanation: urlScore > 50
        ? 'Observable structural anomalies, IP destinations, or high-risk TLD infrastructure.'
        : 'Observable web endpoints conform to standard enterprise structures.',
    },
    domainRisk: {
      score: domainScore,
      severity: toSeverity(domainScore),
      explanation: domainScore > 50
        ? 'Domain mimicry, lack of verified enterprise affiliation, or lookalike typosquatting.'
        : 'Domain indicators do not exhibit recognizable typosquatting patterns.',
    },
    socialEngineeringRisk: {
      score: socialScore,
      severity: toSeverity(socialScore),
      explanation: socialScore > 50
        ? 'Tactics aimed at bypassing scrutiny, off-platform chat migration, or emotional leverage.'
        : 'Professional tone consistent with typical recruitment workflows.',
    },
  };

  // Generate explainable headline
  let verdictHeadline: string;
  if (riskLevel === 'CRITICAL') {
    verdictHeadline = 'Critical threat indicators detected. High likelihood of recruitment fraud or financial extraction.';
  } else if (riskLevel === 'HIGH') {
    verdictHeadline = 'High-risk indicators detected. Verify independently before proceeding or sharing any information.';
  } else if (riskLevel === 'MODERATE') {
    verdictHeadline = 'Moderate risk signals identified. Several inconsistencies warrant careful independent validation.';
  } else if (riskLevel === 'GUARDED') {
    verdictHeadline = 'Guarded status. Low anomalies observed, but maintain standard digital safety hygiene.';
  } else {
    verdictHeadline = 'Low-risk indicators detected. Standard hiring patterns observed; always confirm via official career portals.';
  }

  return {
    threatScore: finalThreatScore,
    riskLevel,
    confidence,
    breakdown,
    verdictHeadline,
  };
}
