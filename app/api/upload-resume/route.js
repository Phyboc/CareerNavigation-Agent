import { analyzeResumeText } from '../../../lib/analyzer';

export const runtime = 'nodejs';

export async function POST(request) {
  try {
    const url = new URL(request.url);
    const career = url.searchParams.get('career') || 'AI Engineer';

    const contentType = request.headers.get('content-type') || '';
    const buffer = await request.arrayBuffer();
    let text = '';

    if (contentType.includes('pdf') || contentType === 'application/octet-stream') {
      // parse PDF buffer
      try {
        const pdfParseModule = await import('pdf-parse');
        const pdfParse = pdfParseModule.default || pdfParseModule;
        const parsed = await pdfParse(Buffer.from(buffer));
        text = parsed && parsed.text ? String(parsed.text) : '';
      } catch (e) {
        // fallback to empty
        text = '';
      }
    } else if (contentType.includes('text')) {
      text = new TextDecoder().decode(buffer);
    } else {
      // attempt to decode generically
      text = new TextDecoder().decode(buffer);
    }

    const resumeAnalysis = analyzeResumeText(text || '', career);

    // simple project extraction: look for a 'projects' line
    const projects = [];
    const lower = String(text || '').split(/\r?\n/).map(l => l.trim());
    for (const line of lower) {
      const m = line.match(/projects?:\s*(.+)/i);
      if (m && m[1]) {
        projects.push(...m[1].split(/[,;]| and /).map(s => s.trim()).filter(Boolean));
      }
      // lines that mention 'project' and have commas
      if (/project/i.test(line) && line.includes(',')) {
        projects.push(...line.split(/[,;]| and /).map(s => s.trim()).filter(Boolean));
      }
    }

    // education extraction (simple heuristics)
    const education = [];
    const certs = [];
    for (const line of lower) {
      if (/b\.?tech|bachelor|m\.?tech|m\.?sc|b\.sc|bsc|msc|degree/i.test(line)) {
        education.push(line);
      }
      if (/certif|certificate|aws certified|google certified|microsoft certified/i.test(line)) {
        certs.push(line);
      }
    }

    const detectedSkills = Array.isArray(resumeAnalysis.detectedSkills) ? resumeAnalysis.detectedSkills : [];

    return new Response(JSON.stringify({
      success: true,
      data: {
        detectedSkills,
        projects: projects.map(p => p.replace(/^projects?:/i, '').trim()),
        education,
        certifications: certs,
        suggestions: resumeAnalysis.suggestions || [],
        fullText: text,
        matchScore: resumeAnalysis.matchScore || 0
      }
    }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (err) {
    return new Response(JSON.stringify({ success: false, error: String(err) }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}
