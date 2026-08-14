import { analyzeResumeText } from '../../../lib/analyzer';
import { generateResumeAnalysis } from '../../../lib/aiProvider';

export const runtime = 'nodejs';

// Enrichment heuristics: pull out projects, education, and certifications that the
// LLM output shape does not cover. Kept deliberately simple and lossless.
function extractResumeSections(text = '') {
  const projects = [];
  const education = [];
  const certifications = [];
  const lower = String(text || '').split(/\r?\n/).map(line => line.trim());

  for (const line of lower) {
    const projectLine = line.match(/projects?:?\s*(.+)/i);
    if (projectLine && projectLine[1]) {
      projects.push(...projectLine[1].split(/[,;]| and /).map(item => item.trim()).filter(Boolean));
    }
    // Lines that mention "project" and contain a list of items
    if (/project/i.test(line) && line.includes(',')) {
      projects.push(...line.split(/[,;]| and /).map(item => item.trim()).filter(Boolean));
    }
    if (/b\.?tech|bachelor|m\.?tech|m\.?sc|b\.sc|bsc|msc|degree/i.test(line)) {
      education.push(line);
    }
    if (/certif|certificate|aws certified|google certified|microsoft certified/i.test(line)) {
      certifications.push(line);
    }
  }

  return {
    // Dedupe while preserving order: the same line can match both heuristics.
    projects: [...new Set(projects.map(project => project.replace(/^projects?:/i, '').trim()).filter(Boolean))],
    education,
    certifications
  };
}

export async function POST(request) {
  try {
    const url = new URL(request.url);
    const career = url.searchParams.get('career') || 'AI Engineer';

    const contentType = request.headers.get('content-type') || '';
    const buffer = await request.arrayBuffer();
    let text = '';

    if (contentType.includes('pdf') || contentType === 'application/octet-stream') {
      // Parse PDF buffer
      try {
        const pdfParseModule = await import('pdf-parse');
        const pdfParse = pdfParseModule.default || pdfParseModule;
        const parsed = await pdfParse(Buffer.from(buffer));
        text = parsed && parsed.text ? String(parsed.text) : '';
      } catch (e) {
        text = '';
      }
    } else {
      // Text files and everything else: decode generically
      text = new TextDecoder().decode(buffer);
    }

    if (!text || !text.trim()) {
      return new Response(
        JSON.stringify({ success: false, error: 'No readable text found in the uploaded file.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // AI-first analysis (server-side, so GROQ_API_KEY stays out of the browser),
    // falling back to the deterministic keyword analyzer when the model call fails.
    let resumeAnalysis;
    try {
      const aiResult = await generateResumeAnalysis(text, career);
      if (aiResult && typeof aiResult === 'object' && Array.isArray(aiResult.detectedSkills)) {
        resumeAnalysis = aiResult;
      }
    } catch (e) {
      console.warn('AI resume analysis failed, using static fallback:', e);
    }
    if (!resumeAnalysis) {
      resumeAnalysis = analyzeResumeText(text, career);
    }

    const sections = extractResumeSections(text);

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          detectedSkills: Array.isArray(resumeAnalysis.detectedSkills) ? resumeAnalysis.detectedSkills : [],
          strengths: Array.isArray(resumeAnalysis.strengths) ? resumeAnalysis.strengths : [],
          missingSkills: Array.isArray(resumeAnalysis.missingSkills) ? resumeAnalysis.missingSkills : [],
          suggestions: resumeAnalysis.suggestions || [],
          careerFit: resumeAnalysis.careerFit || 'N/A',
          matchScore: resumeAnalysis.matchScore || 0,
          projects: sections.projects,
          education: sections.education,
          certifications: sections.certifications,
          fullText: text
        }
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ success: false, error: String(err) }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
