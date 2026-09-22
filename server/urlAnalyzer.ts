/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ObservableUrlIntelligence } from '../src/types.js';

const SUSPICIOUS_TLDS = new Set([
  'top', 'xyz', 'work', 'click', 'loan', 'gq', 'cf', 'tk', 'ml', 'ga', 
  'icu', 'fit', 'buzz', 'rest', 'monster', 'hair', 'quest', 'skin', 'cam'
]);

const FAMOUS_BRANDS = [
  'google', 'microsoft', 'apple', 'amazon', 'meta', 'netflix', 
  'deloitte', 'accenture', 'tcs', 'infosys', 'wipro', 'cognizant',
  'ibm', 'oracle', 'salesforce', 'cisco', 'intel', 'paypal', 'stripe'
];

export function analyzeObservableUrl(rawUrl: string): { 
  intelligence: ObservableUrlIntelligence; 
  detectedFlags: string[];
  urlRiskScore: number;
} {
  const flags: string[] = [];
  let parsed: URL;

  let normalizedUrl = rawUrl.trim();
  if (!/^https?:\/\//i.test(normalizedUrl)) {
    normalizedUrl = 'https://' + normalizedUrl;
  }

  try {
    parsed = new URL(normalizedUrl);
  } catch {
    return {
      intelligence: {
        submittedUrl: rawUrl,
        hostname: 'invalid-url',
        protocol: 'unknown',
        isHttps: false,
        tld: 'unknown',
        isSuspiciousTld: false,
        isIpAddress: false,
        hasLookalikeBrand: false,
        subdomainDepth: 0,
        hasEncodedChars: false,
        isExcessivelyLong: rawUrl.length > 80,
        domainAgeStatus: 'External domain intelligence unavailable.',
      },
      detectedFlags: ['Invalid URL format provided.'],
      urlRiskScore: 75,
    };
  }

  const hostname = parsed.hostname.toLowerCase();
  const isHttps = parsed.protocol === 'https:';
  if (!isHttps) {
    flags.push('Unencrypted HTTP protocol in use instead of secure HTTPS.');
  }

  // Check IP address format
  const isIpAddress = /^(\d{1,3}\.){3}\d{1,3}$/.test(hostname) || hostname.startsWith('[') || hostname.includes('::');
  if (isIpAddress) {
    flags.push('URL points directly to an IP address rather than a registered enterprise domain.');
  }

  // TLD analysis
  const parts = hostname.split('.');
  const tld = parts.length > 1 ? parts[parts.length - 1] : '';
  const isSuspiciousTld = SUSPICIOUS_TLDS.has(tld);
  if (isSuspiciousTld) {
    flags.push(`Domain utilizes a high-abuse TLD (.${tld}) frequently leveraged in recruitment phishing campaigns.`);
  }

  // Subdomain depth
  const subdomainDepth = Math.max(0, parts.length - 2);
  if (subdomainDepth >= 3) {
    flags.push(`Excessive subdomain nesting (${subdomainDepth} levels) indicative of DNS tunneling or evasion tactics.`);
  }

  // Brand impersonation heuristic
  let hasLookalikeBrand = false;
  let lookalikeTarget: string | undefined;

  for (const brand of FAMOUS_BRANDS) {
    if (hostname.includes(brand)) {
      // Check if it's the official root domain
      const isOfficial = hostname === `${brand}.com` || 
                         hostname.endsWith(`.${brand}.com`) || 
                         hostname === `${brand}.in` || 
                         hostname.endsWith(`.${brand}.in`);
      
      if (!isOfficial) {
        hasLookalikeBrand = true;
        lookalikeTarget = brand;
        flags.push(`Possible brand impersonation: Domain contains "${brand}" but is not officially hosted on ${brand}.com.`);
        break;
      }
    }
  }

  // Look for recruitment keywords in suspicious contexts
  const suspiciousKeywords = ['career', 'job', 'onboard', 'offer', 'verify', 'hiring', 'recruitment', 'hr-portal', 'interview'];
  const matchedKeywords = suspiciousKeywords.filter(kw => hostname.includes(kw));
  if (matchedKeywords.length > 0 && !hasLookalikeBrand && (isSuspiciousTld || subdomainDepth > 1)) {
    flags.push(`Recruitment lures in domain (${matchedKeywords.join(', ')}) combined with suspicious infrastructure.`);
  }

  // Encoded chars and excessive length
  const hasEncodedChars = /%[0-9a-fA-F]{2}/.test(parsed.pathname) || /%[0-9a-fA-F]{2}/.test(parsed.search);
  if (hasEncodedChars) {
    flags.push('URL contains hex-encoded characters that may obfuscate true destinations.');
  }

  const isExcessivelyLong = rawUrl.length > 120;
  if (isExcessivelyLong) {
    flags.push('Abnormally long URL (>120 characters), commonly used in credential harvesting redirects.');
  }

  // Calculate observable URL risk score (0 - 100)
  let score = 5;
  if (!isHttps) score += 20;
  if (isIpAddress) score += 45;
  if (isSuspiciousTld) score += 35;
  if (hasLookalikeBrand) score += 45;
  if (subdomainDepth >= 3) score += 20;
  if (hasEncodedChars) score += 15;
  if (isExcessivelyLong) score += 10;
  score = Math.min(100, Math.max(0, score));

  return {
    intelligence: {
      submittedUrl: rawUrl,
      hostname,
      protocol: parsed.protocol,
      isHttps,
      tld,
      isSuspiciousTld,
      isIpAddress,
      hasLookalikeBrand,
      lookalikeTarget,
      subdomainDepth,
      hasEncodedChars,
      isExcessivelyLong,
      domainAgeStatus: 'External domain intelligence unavailable.',
    },
    detectedFlags: flags,
    urlRiskScore: score,
  };
}
