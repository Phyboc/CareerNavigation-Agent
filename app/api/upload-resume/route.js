import { analyzeResumeText, getRequiredSkills, mergeResumeAnalysis } from '../../../lib/analyzer';
import { generateResumeAnalysis } from '../../../lib/aiProvider';
import { extractResumeSections, dedupeProjects } from '../../../lib/resumeExtractor';
import { clientIp, rateLimit, tooManyRequests } from '../../../lib/rateLimit';

export const runtime = 'nodejs';

const MAX_FILE_BYTES = 15 * 1024 * 1024; // 15 MB upload cap
const MAX_TEXT_CHARS = 300 * 1024; // 300 KB of extracted text

export async function POST(request) {
  // Rate limit: 10 resume uploads per minute per client (each may hit the LLM).
  const { limited, retryAfter } = rateLimit(`upload:${clientIp(request)}`, 10);
  if (limited) return tooManyRequests(retryAfter);

  try {
    const url = new URL(request.url);
    const career = url.searchParams.get('career') || 'AI Engineer';

    const contentType = request.headers.get('content-type') || '';
    const contentLength = Number(request.headers.get('content-length') || 0);
    if (contentLength > MAX_FILE_BYTES) {
      return new Response(
        JSON.stringify({ success: false, error: 'File is too large (max 15 MB).' }),
        { status: 413, headers: { 'Content-Type': 'application/json' } }
      );
    }
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
    if (text.length > MAX_TEXT_CHARS) {
      text = text.slice(0, MAX_TEXT_CHARS);
    }

    // Deterministic keyword analysis is the source of truth for scoring. The AI
    // result (when available) only enriches the detected skills on top of it,
    // and missing skills / score are always recomputed against the required list.
    const staticAnalysis = analyzeResumeText(text, career);
    const requiredSkills = getRequiredSkills(career);

    let aiResult = null;
    try {
      const candidate = await generateResumeAnalysis(text, career, requiredSkills);
      // Accept the AI result as long as it's an object – even if a field is
      // missing, the deterministic scan and heuristics fill the gaps. (The
      // provider already coerces every field to a safe default.)
      if (candidate && typeof candidate === 'object' && !Array.isArray(candidate)) {
        aiResult = candidate;
      }
    } catch (e) {
      // Fallback is by design – log a short line, not the full error body.
      console.warn('AI resume analysis unavailable (%s); using static results', e.message || e);
    }

    const merged = mergeResumeAnalysis(staticAnalysis, aiResult);
    const sections = extractResumeSections(text);

    // Merge heuristic sections with whatever the model found. Projects are
    // fuzzy-deduped and returned as { title, description } – titles drive the
    // form prefill, descriptions feed the analysis view.
    const projects = dedupeProjects([...(sections.projects || []), ...(aiResult?.projects || [])]);
    const education = [...new Set([...(sections.education || []), ...(aiResult?.education || [])])];
    const certifications = [...new Set([...(sections.certifications || []), ...(aiResult?.certifications || [])])];

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          name: sections.name || aiResult?.name || '',
          detectedSkills: merged.detectedSkills,
          strengths: merged.strengths,
          missingSkills: merged.missingSkills,
          suggestions: merged.suggestions,
          careerFit: merged.careerFit,
          matchScore: merged.matchScore,
          projects,
          projectTitles: projects.map(project => project.title),
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
