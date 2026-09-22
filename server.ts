/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { analyzeContentWithGemini } from './server/geminiService.js';
import { calculateDeterministicScamIndex } from './server/scoringEngine.js';
import { analyzeObservableUrl } from './server/urlAnalyzer.js';
import { 
  deleteScan, 
  DEMO_SCENARIOS, 
  getDashboardStats, 
  getScanById, 
  getScanHistory, 
  saveScan 
} from './server/scanStorage.js';
import { ThreatAssessment } from './src/types.js';

dotenv.config();

const app = express();
const PORT = 3000;

// Increase JSON body limit to support document/image base64 uploads safely
app.use(express.json({ limit: '15mb' }));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'OFFERGUARD AI Security Engine',
    timestamp: new Date().toISOString(),
  });
});

// Demo scenarios endpoint
app.get('/api/demo/:scenarioKey', (req, res) => {
  const scenarioKey = req.params.scenarioKey;
  const demoData = DEMO_SCENARIOS[scenarioKey];
  if (!demoData) {
    return res.status(404).json({ error: 'Demo scenario not found', available: Object.keys(DEMO_SCENARIOS) });
  }
  return res.json(demoData);
});

// 1. Analyze Text Endpoint
app.post('/api/analyze/text', async (req, res) => {
  const startTime = Date.now();
  try {
    const { text, demoKey } = req.body;

    if (demoKey && DEMO_SCENARIOS[demoKey]) {
      return res.json(DEMO_SCENARIOS[demoKey]);
    }

    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return res.status(400).json({ error: 'Please provide the text content of the job offer or message to analyze.' });
    }

    if (text.length > 50000) {
      return res.status(400).json({ error: 'Text content exceeds maximum limit (50,000 characters). Please provide a concise excerpt.' });
    }

    // Extract any embedded URLs in the text to augment analysis
    const urlMatches = text.match(/https?:\/\/[^\s]+/g) || [];
    let observableUrlRisk = 0;
    let urlIntelligence;
    if (urlMatches.length > 0 && urlMatches[0]) {
      const firstUrl = urlMatches[0].replace(/[.,;)]+$/, '');
      const urlAnalysis = analyzeObservableUrl(firstUrl);
      observableUrlRisk = urlAnalysis.urlRiskScore;
      urlIntelligence = urlAnalysis.intelligence;
    }

    // Run AI analysis
    const aiResult = await analyzeContentWithGemini(text, 'text');

    // Run deterministic scoring engine
    const scoring = calculateDeterministicScamIndex(
      aiResult.signals,
      {
        paymentRisk: aiResult.paymentRisk,
        phishingRisk: aiResult.phishingRisk,
        impersonationRisk: aiResult.impersonationRisk,
        urgencyRisk: aiResult.urgencyRisk,
        credentialRisk: aiResult.credentialRisk,
        urlRisk: aiResult.urlRisk,
        domainRisk: aiResult.domainRisk,
        socialEngineeringRisk: aiResult.socialEngineeringRisk,
      },
      observableUrlRisk
    );

    // Target summary snippet
    const firstLine = text.trim().split('\n')[0].substring(0, 60);
    const targetSummary = aiResult.entities.companyName 
      ? `${aiResult.entities.companyName} - ${aiResult.entities.jobTitle || 'Offer Text'}`
      : (firstLine.length > 10 ? firstLine : 'Pasted Job Offer / Recruiter Communication');

    const assessment: ThreatAssessment = {
      id: `scan-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      createdAt: new Date().toISOString(),
      inputType: 'text',
      targetSummary,
      threatScore: scoring.threatScore,
      riskLevel: scoring.riskLevel,
      confidence: scoring.confidence,
      summary: aiResult.summary,
      verdictHeadline: scoring.verdictHeadline,
      signals: aiResult.signals,
      breakdown: scoring.breakdown,
      entities: {
        ...aiResult.entities,
        detectedUrls: urlMatches.slice(0, 5),
      },
      urlAnalysis: urlIntelligence,
      recommendations: aiResult.recommendations,
      verificationSteps: aiResult.verificationSteps,
      limitations: aiResult.limitations,
      processingTimeMs: Date.now() - startTime,
    };

    saveScan(assessment);
    res.json(assessment);
  } catch (error: any) {
    console.error('Text analysis failed:', error);
    res.status(500).json({
      error: 'Security analysis could not be completed. Please verify the input and retry.',
      details: error?.message || 'Internal analysis error',
    });
  }
});

// 2. Analyze URL Endpoint
app.post('/api/analyze/url', async (req, res) => {
  const startTime = Date.now();
  try {
    const { url, demoKey } = req.body;

    if (demoKey && DEMO_SCENARIOS[demoKey]) {
      return res.json(DEMO_SCENARIOS[demoKey]);
    }

    if (!url || typeof url !== 'string' || url.trim().length === 0) {
      return res.status(400).json({ error: 'Please enter a valid URL to inspect.' });
    }

    // Observable structural inspection
    const observable = analyzeObservableUrl(url);

    // AI context analysis
    const prompt = `Inspect this recruitment/onboarding URL:
URL: ${url}
Observable Findings:
- Protocol: ${observable.intelligence.protocol}
- Hostname: ${observable.intelligence.hostname}
- TLD: .${observable.intelligence.tld} (High risk TLD: ${observable.intelligence.isSuspiciousTld})
- Direct IP: ${observable.intelligence.isIpAddress}
- Lookalike brand detected: ${observable.intelligence.hasLookalikeBrand ? observable.intelligence.lookalikeTarget : 'none'}
- Subdomain depth: ${observable.intelligence.subdomainDepth}
- Structural flags: ${observable.detectedFlags.join('; ') || 'Standard structure'}

Perform structured security analysis on the recruitment threat level of this URL.`;

    const aiResult = await analyzeContentWithGemini(prompt, 'url');

    // Add observable flags as signals if not already present
    for (const flag of observable.detectedFlags) {
      aiResult.signals.push({
        id: `sig-url-${Date.now()}-${aiResult.signals.length}`,
        category: 'URL_OBSERVABLE_RISK',
        title: 'Observable URL Anomaly',
        severity: observable.intelligence.hasLookalikeBrand || observable.intelligence.isIpAddress ? 'CRITICAL' : 'HIGH',
        confidence: 95,
        evidence: `Direct URL pattern: ${url}`,
        explanation: flag,
      });
    }

    // Merge observable risk with AI
    aiResult.urlRisk = Math.max(aiResult.urlRisk, observable.urlRiskScore);
    if (observable.intelligence.hasLookalikeBrand) {
      aiResult.impersonationRisk = Math.max(aiResult.impersonationRisk, 85);
      aiResult.domainRisk = Math.max(aiResult.domainRisk, 90);
    }

    const scoring = calculateDeterministicScamIndex(
      aiResult.signals,
      {
        paymentRisk: aiResult.paymentRisk,
        phishingRisk: Math.max(aiResult.phishingRisk, observable.urlRiskScore),
        impersonationRisk: aiResult.impersonationRisk,
        urgencyRisk: aiResult.urgencyRisk,
        credentialRisk: aiResult.credentialRisk,
        urlRisk: Math.max(aiResult.urlRisk, observable.urlRiskScore),
        domainRisk: aiResult.domainRisk,
        socialEngineeringRisk: aiResult.socialEngineeringRisk,
      },
      observable.urlRiskScore
    );

    const assessment: ThreatAssessment = {
      id: `scan-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      createdAt: new Date().toISOString(),
      inputType: 'url',
      targetSummary: observable.intelligence.hostname,
      threatScore: scoring.threatScore,
      riskLevel: scoring.riskLevel,
      confidence: scoring.confidence,
      summary: aiResult.summary,
      verdictHeadline: scoring.verdictHeadline,
      signals: aiResult.signals,
      breakdown: scoring.breakdown,
      entities: {
        ...aiResult.entities,
        detectedUrls: [url],
      },
      urlAnalysis: observable.intelligence,
      recommendations: [
        'Do not submit login credentials, employee IDs, or passwords on this web page.',
        'Navigate independently to the company main official portal via a verified search engine or bookmarked URL.',
        ...aiResult.recommendations.filter(r => !r.includes('credentials')),
      ],
      verificationSteps: aiResult.verificationSteps,
      limitations: [
        'Website was not visited or executed in an active browser sandbox to prevent credential leakage.',
        'External domain intelligence unavailable (WHOIS lookup offline).',
      ],
      processingTimeMs: Date.now() - startTime,
    };

    saveScan(assessment);
    res.json(assessment);
  } catch (error: any) {
    console.error('URL analysis failed:', error);
    res.status(500).json({
      error: 'URL analysis failed. Please verify the link and try again.',
      details: error?.message || 'Internal analysis error',
    });
  }
});

// 3. Analyze File Upload Endpoint (Images, PDFs)
app.post('/api/analyze/file', async (req, res) => {
  const startTime = Date.now();
  try {
    const { fileName, fileType, fileBase64, fileSize } = req.body;

    if (!fileBase64 || !fileType) {
      return res.status(400).json({ error: 'File data or MIME type missing from upload request.' });
    }

    // Supported formats validation
    const allowedTypes = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
    if (!allowedTypes.includes(fileType.toLowerCase())) {
      return res.status(400).json({
        error: `Unsupported file format (${fileType}). Supported formats: PDF, PNG, JPG, JPEG, WEBP.`,
      });
    }

    // File size validation (10 MB max)
    if (fileSize && fileSize > 10 * 1024 * 1024) {
      return res.status(400).json({ error: 'File size exceeds maximum permitted limit (10MB).' });
    }

    // Multimodal AI analysis
    const cleanBase64 = fileBase64.replace(/^data:[^;]+;base64,/, '');
    const aiResult = await analyzeContentWithGemini(
      `Inspect uploaded offer letter document: ${fileName || 'Uploaded Offer File'}`,
      'file',
      {
        mimeType: fileType,
        base64: cleanBase64,
      }
    );

    const scoring = calculateDeterministicScamIndex(aiResult.signals, {
      paymentRisk: aiResult.paymentRisk,
      phishingRisk: aiResult.phishingRisk,
      impersonationRisk: aiResult.impersonationRisk,
      urgencyRisk: aiResult.urgencyRisk,
      credentialRisk: aiResult.credentialRisk,
      urlRisk: aiResult.urlRisk,
      domainRisk: aiResult.domainRisk,
      socialEngineeringRisk: aiResult.socialEngineeringRisk,
    });

    const targetSummary = aiResult.entities.companyName 
      ? `${aiResult.entities.companyName} - ${aiResult.entities.jobTitle || 'Appointment Letter'}`
      : (fileName || 'Uploaded Offer Letter Document');

    const assessment: ThreatAssessment = {
      id: `scan-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      createdAt: new Date().toISOString(),
      inputType: 'file',
      targetSummary,
      threatScore: scoring.threatScore,
      riskLevel: scoring.riskLevel,
      confidence: scoring.confidence,
      summary: aiResult.summary,
      verdictHeadline: scoring.verdictHeadline,
      signals: aiResult.signals,
      breakdown: scoring.breakdown,
      entities: aiResult.entities,
      recommendations: aiResult.recommendations,
      verificationSteps: aiResult.verificationSteps,
      limitations: [
        'Document content analyzed via visual/text inspection; cryptographic signature validation was not performed.',
        'External domain intelligence unavailable (WHOIS lookup offline).',
      ],
      processingTimeMs: Date.now() - startTime,
    };

    // Save metadata without storing raw base64 (respecting user privacy requirement)
    saveScan(assessment);
    res.json(assessment);
  } catch (error: any) {
    console.error('File analysis failed:', error);
    res.status(500).json({
      error: 'Document analysis failed. Please verify the document is not password-protected and retry.',
      details: error?.message || 'Internal analysis error',
    });
  }
});

// Scan History & Dashboard Endpoints
app.get('/api/scans', (req, res) => {
  res.json(getScanHistory());
});

app.get('/api/scans/:id', (req, res) => {
  const scan = getScanById(req.params.id);
  if (!scan) {
    return res.status(404).json({ error: 'Scan record not found' });
  }
  res.json(scan);
});

app.delete('/api/scans/:id', (req, res) => {
  const deleted = deleteScan(req.params.id);
  if (!deleted) {
    return res.status(404).json({ error: 'Scan record not found or already deleted' });
  }
  res.json({ success: true, message: 'Scan record deleted from local telemetry.' });
});

app.get('/api/dashboard/stats', (req, res) => {
  res.json(getDashboardStats());
});

// Vite & Static Serving configuration
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`OFFERGUARD AI Server running on port ${PORT}`);
  });
}

startServer();
