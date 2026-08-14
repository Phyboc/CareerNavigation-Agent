import { analyzeResumeText, getRequiredSkills, mergeResumeAnalysis } from '../../../lib/analyzer';
import { generateResumeAnalysis } from '../../../lib/aiProvider';
import { extractResumeSections, dedupeProjects } from '../../../lib/resumeExtractor';

export const runtime = 'nodejs';

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

    // Deterministic keyword analysis is the source of truth for scoring. The AI
    // result (when available) only enriches the detected skills on top of it,
    // and missing skills / score are always recomputed against the required list.
    const staticAnalysis = analyzeResumeText(text, career);
    const requiredSkills = getRequiredSkills(career);

    let aiResult = null;
    try {
      const candidate = await generateResumeAnalysis(text, career, requiredSkills);
      if (candidate && typeof candidate === 'object' && Array.isArray(candidate.detectedSkills)) {
        aiResult = candidate;
      }
    } catch (e) {
      console.warn('AI resume analysis failed, using static results:', e);
    }

    const merged = mergeResumeAnalysis(staticAnalysis, aiResult);
    const sections = extractResumeSections(text);

    // Merge heuristic sections with whatever the model found. Projects are
    // fuzzy-deduped because the heuristic captures full bullet lines while the
    // model often returns shortened titles for the same project.
    const projects = dedupeProjects([...(sections.projects || []), ...(aiResult?.projects || [])]);
    const education = [...new Set([...(sections.education || []), ...(aiResult?.education || [])])];
    const certifications = [...new Set([...(sections.certifications || []), ...(aiResult?.certifications || [])])];

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          name: sections.name || '',
          detectedSkills: merged.detectedSkills,
          strengths: merged.strengths,
          missingSkills: merged.missingSkills,
          suggestions: merged.suggestions,
          careerFit: merged.careerFit,
          matchScore: merged.matchScore,
          projects,
          education,
          certifications,
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
