/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type InputType = 'file' | 'url' | 'text';

export type RiskLevel = 'LOW' | 'GUARDED' | 'MODERATE' | 'HIGH' | 'CRITICAL';

export type SignalSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface RiskSignal {
  id: string;
  category: string;
  title: string;
  severity: SignalSeverity;
  confidence: number;
  evidence: string;
  explanation: string;
}

export interface DimensionRisk {
  score: number;
  severity: SignalSeverity;
  explanation: string;
}

export interface RiskBreakdown {
  paymentRisk: DimensionRisk;
  phishingRisk: DimensionRisk;
  impersonationRisk: DimensionRisk;
  urgencyRisk: DimensionRisk;
  credentialRisk: DimensionRisk;
  urlRisk: DimensionRisk;
  domainRisk: DimensionRisk;
  socialEngineeringRisk: DimensionRisk;
}

export interface ExtractedEntities {
  companyName?: string;
  jobTitle?: string;
  recruiterName?: string;
  contactInfo?: string;
  statedCompensation?: string;
  detectedUrls?: string[];
  paymentDemands?: string[];
}

export interface ObservableUrlIntelligence {
  submittedUrl: string;
  hostname: string;
  protocol: string;
  isHttps: boolean;
  tld: string;
  isSuspiciousTld: boolean;
  isIpAddress: boolean;
  hasLookalikeBrand: boolean;
  lookalikeTarget?: string;
  subdomainDepth: number;
  hasEncodedChars: boolean;
  isExcessivelyLong: boolean;
  domainAgeStatus: string; // explicitly "External domain intelligence unavailable" per guidelines if no live whois API
}

export interface VerificationTask {
  id: string;
  title: string;
  instruction: string;
  priority: 'CRITICAL' | 'RECOMMENDED' | 'ADVISORY';
  completed?: boolean;
}

export interface ThreatAssessment {
  id: string;
  createdAt: string;
  inputType: InputType;
  targetSummary: string;
  threatScore: number; // 0 - 100
  riskLevel: RiskLevel;
  confidence: number; // 0 - 100
  summary: string;
  verdictHeadline: string;
  isDemo?: boolean;
  demoLabel?: string;
  signals: RiskSignal[];
  breakdown: RiskBreakdown;
  entities: ExtractedEntities;
  urlAnalysis?: ObservableUrlIntelligence;
  recommendations: string[];
  verificationSteps: VerificationTask[];
  limitations: string[];
  processingTimeMs: number;
}

export interface DashboardStats {
  totalScans: number;
  highRiskScans: number;
  moderateRiskScans: number;
  lowRiskScans: number;
  averageThreatScore: number;
  recentScans: ThreatAssessment[];
}
