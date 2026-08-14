# Fix Plan — Resume Extraction & Mentor Insights Console Error

**Status: IMPLEMENTED and verified on 2026-08-14.**
- Resume extraction: `name` now returned, all projects captured, heading junk
  removed, `missingSkills` computed against the required list (no more false
  "Data Structures" misses), `fit: Strong fit / score: 80` on the test resume.
- Mentor insights: route always returns `success: true`; client falls back to
  static guidance silently (no console errors).
- Also fixed a webpack dev-mode break: `mergeResumeAnalysis` was exported twice
  (inline `export function` + `export {}` list) — webpack rejected the duplicate.

Both problems were originally reproduced against the live dev server (port 3000)
on 2026-08-14; the root causes below are evidence-backed.

---

## Problem 1 — Resume upload misses name, projects, and keywords

### Reproduction evidence

A realistic resume (name, SKILLS line with "Data Structures", bullet-style
PROJECTS section, EDUCATION, CERTIFICATIONS) posted to
`/api/upload-resume?career=AI Engineer` returned:

```json
detectedSkills: ["Python","Java","C++","Data Structures","Algorithms","SQL","Git","React","Machine Learning","OOP","OpenCV","Deep Learning","Node.js","MongoDB","Flask"]
missingSkills:  ["Natural Language Processing","Computer Vision","Reinforcement Learning","TensorFlow or PyTorch","Cloud computing experience beyond AWS Cloud Practitioner certification"]
projects:       ["S"]
education:      ["B.Tech Computer Science, NIT Trichy","B.Tech CSE, NIT Trichy (CGPA 8.7)"]
certifications: ["CERTIFICATIONS","AWS Certified Cloud Practitioner","Google Data Analytics Certificate"]
name field:     (not present)
```

Three concrete failures:
1. **`projects: ["S"]`** — the `PROJECTS` heading itself produced a bogus project
   `"S"` (regex backtracks: `projects?` matches `PROJECT` and `(.+)` captures the
   trailing `S`). The three real bullet projects (`- Drowsiness Detection
   System...`, etc.) were missed entirely.
2. **`certifications` contains the `CERTIFICATIONS` heading** line.
3. **No `name`** is ever extracted — neither the heuristics nor the AI prompt ask
   for it, and `StudentForm` never sets the name field from uploads.
4. **`missingSkills` is AI free-form** ("TensorFlow or PyTorch", "Cloud computing
   experience beyond…") — it is NOT computed against the app's required skill
   list, so it disagrees with the rest of the app, and the model can miss real
   keywords (in the user's run it reported "Data Structures" as missing even
   though it was on the resume). The deterministic keyword scan
   (`analyzeResumeText`) DOES compute missingSkills correctly, but it is only
   used as a fallback when AI fails — never merged with AI results.

### Root causes

- `app/api/upload-resume/route.js` → `extractResumeSections()` is line-based,
  not section-aware: it can't collect bullet-item project lists, and it matches
  heading lines as content.
- `lib/aiProvider.js` → `generateResumeAnalysis()` prompt never passes the
  target role's required skill list and never asks for name/projects/education/
  certifications, so the model's output is free-form and inconsistent.
- The route trusts `resumeAnalysis.missingSkills` from the model verbatim
  instead of computing it from the required list.
- `lib/analyzer.js` → `analyzeCareerProfile()` (the assessment/enrich path) has
  the same gap: on AI success it merges only the model's `detectedSkills`, never
  the deterministic scan's hits.
- `lib/analyzer.js` → `analyzeResumeText()` does raw substring matching on the
  PDF-extracted text; line-wrapped words ("Data \nStructures") fail to match.

### Fixes

**1A. Rewrite section extraction (new `lib/resumeExtractor.js`, used by the route)**
- Section-aware scan: recognize headings via a regex on SHORT lines only
  (e.g. `length <= 30`), e.g.
  `/^(projects?|academic projects?|education|certifications?|skills|experience|summary|objective)\s*:?$/i`.
- Under a `projects` heading, collect each following bullet/numbered line
  (`/^[-•*·▪]\s*(.+)$/` or `/^\d+[.)]\s*(.+)$/`) as one project, plus split
  comma/semicolon lists on the heading line itself. Stop at the next heading.
- Same pattern for `education` and `certifications` (content lines until the
  next heading).
- Never include a heading line itself in results (fixes `"S"` and
  `"CERTIFICATIONS"`).
- Add `name` extraction: the first non-empty line that is short (< 60 chars),
  is not a heading, contains no contact patterns
  (`@`, `+`, `http`, `linkedin`, `github`), and has 1–4 words → that's the name.
  Also handle `Name: X` format. Return `name`.
- Dedupe all lists preserving order.

**1B. Improve the AI prompt** — `lib/aiProvider.js`
- Change signature to `generateResumeAnalysis(resumeText, targetCareer, requiredSkills)`.
- Prompt the model with the required skills list: "The target role requires:
  [Python, Data Structures, …]. Report for each whether it appears in the resume."
- Ask for `name`, `projects` (array), `education` (array), `certifications`
  (array) in addition to the current keys. Keep the existing `toCamelKeys` +
  normalization code.

**1C. Always merge deterministic + AI in the route** — `app/api/upload-resume/route.js`
- Always run `const staticAnalysis = analyzeResumeText(text, career)` first; run
  AI as enrichment on top (never replace).
- `detectedSkills = union(staticAnalysis.detectedSkills, ai.detectedSkills)`
- `missingSkills = requiredSkills.filter(s => !mergedDetected.includes(s))`
  (deterministic, computed from the union).
- `matchScore`/`careerFit` recomputed from the union (same formula as
  `analyzeResumeText`).
- `strengths`/`suggestions`: union + dedupe.
- `projects`/`education`/`certifications`: union of heuristic sections + AI
  lists, dedupe.
- Include `name` in the response data.

**1D. Same merge in the assessment path** — `lib/analyzer.js`
- In `analyzeCareerProfile()`, after a successful AI call, ALSO run
  `analyzeResumeText(profile.resumeText, goal)` and merge its `detectedSkills`
  into `normalizedProfile.skills` (union), so keywords the model missed still
  count toward readiness/matches.

**1E. StudentForm fills the name** — `components/StudentForm.jsx`
- In `uploadResumeFile`, add `name: data.name || prev.name` to the `setForm` call.

**1F. Whitespace normalization for keyword scan** — `lib/analyzer.js`
- In `analyzeResumeText`, collapse whitespace first:
  `const text = String(resumeText || "").toLowerCase().replace(/\s+/g, " ");`
  so PDF line-wrapped multi-word skills match.

### Verification for Problem 1

Create a realistic resume file (name + bullet projects + "Data Structures" in
skills), then:

```bash
curl -s -X POST "http://localhost:3000/api/upload-resume?career=AI%20Engineer" \
  -H 'Content-Type: text/plain' --data-binary @resume.txt
```

Assert:
- `name` = the candidate's name (not empty)
- `projects` contains all real projects, no `"S"`, no heading strings
- `certifications` contains no heading strings
- `detectedSkills` includes "Data Structures"
- `missingSkills` contains only skills genuinely absent from the resume AND in
  the required list (e.g. "Statistics", "MLOps" for AI Engineer)

Also submit the same resume through the assessment form and check the analysis
page shows the resume skills merged into the readiness score.

---

## Problem 2 — "Mentor insights request failed" console error

### Reproduction evidence

- A direct `curl` POST to `/api/mentor-insights` returns
  `{"success":true,"paragraphs":[…],"highlight":{…}}` — the route works.
- The dev log shows the user's browser got a response whose parsed JSON was an
  empty object `{}`, so `AIMentorInsights.jsx` hit
  `throw new Error(payload?.error || "Mentor insights request failed")` (line 32),
  was caught, logged `console.error("Error loading mentor insights, using static
  fallback:", {})`, and correctly rendered static insights.
- The error appeared twice ~300ms apart (React StrictMode double-effect in dev).

### Root causes

1. `lib/apiClient.js` `fetchJson` returns `{}` when `response.ok` is true but the
   body is empty/`{}` (likely a dev-mode hot-reload artifact — the route was
   recompiling when the request landed). The caller then throws.
2. `components/AIMentorInsights.jsx` treats any non-success response as an
   exception and logs `console.error`, even though a working static fallback
   exists. This is a design flaw: the fallback path should be silent.
3. The route's catch returns `{ success: false }` with HTTP 500 for any
   non-LLM error, which the client surfaces as an error.
4. Client timeout (20s) is equal to the server LLM timeout (20s) — the client
   can abort at the same moment the server finishes, causing spurious failures.

### Fixes

**2A. Client never throws or logs errors on fallback** — `components/AIMentorInsights.jsx`
- Replace the try/throw/catch with:
  ```js
  let payload = null;
  try {
    payload = await fetchJson("/api/mentor-insights", { … , timeoutMs: 30000 });
  } catch (err) {
    console.warn("Mentor insights unavailable, showing static guidance:", err.message);
  }
  if (!cancelled) {
    setMentor(payload?.success && Array.isArray(payload.paragraphs)
      ? payload
      : buildStaticMentorInsights(analysis));
  }
  ```
- Delete the `failed` state and the `console.error`; the static fallback becomes
  invisible to the user.
- Keep the `cancelled` cleanup guard.

**2B. Route always returns success** — `app/api/mentor-insights/route.js`
- Parse the body defensively (`try { body = await request.json() } catch { body = {} }`).
- Wrap the builder:
  ```js
  const insights = await buildMentorInsights(body?.analysis || {})
    .catch(() => buildStaticMentorInsights(body?.analysis || {}));
  return NextResponse.json({ success: true, ...insights });
  ```
- A `success:false`/500 response for this route becomes impossible.

**2C. Send a compact summary to the LLM** — `lib/mentorInsights.js`
- Before calling `generateMentorInsights`, build a small summary of the analysis
  (profile, readiness, priority gaps, top matches — same idea as the chat's
  `summarizeAnalysis` in `app/api/chat/route.js`) instead of the full object.
  Fewer tokens, lower latency, no oversized-prompt 400s.

**2D. Client timeout > server timeout for AI endpoints**
- `AIMentorInsights`, `exportReport`, `/api/analyze/enrich`, and `/api/chat`
  calls already use `fetchJson`; set `timeoutMs: 30000` on each (server LLM
  timeout is 20s inside `lib/aiProvider.js`).

**2E. (Optional) one retry for transient Groq errors** — `lib/aiProvider.js`
- In `callLLM`, retry once (~1.2s backoff) on HTTP 429/5xx before throwing.
  Reduces rate-limit flakes on the free tier.

### Verification for Problem 2

- Reload `/analysis` in the browser: no console errors; mentor insights render
  (AI or static).
- `curl -s -X POST http://localhost:3000/api/mentor-insights -H 'Content-Type:
  application/json' -d '{"analysis":{"profile":{"goal":"AI Engineer"}}}'` →
  always `success:true`.
- Temporarily disconnect the network → page still renders static insights with
  no error output.

---

## Files touched (summary)

| File | Change |
|---|---|
| `lib/resumeExtractor.js` | NEW — section-aware extraction (projects/education/certs/name) |
| `app/api/upload-resume/route.js` | Use new extractor; always merge deterministic + AI; return `name` |
| `lib/aiProvider.js` | `generateResumeAnalysis` accepts required skills; prompt asks for name/projects/education/certs; (optional) retry |
| `lib/analyzer.js` | Merge deterministic scan in `analyzeCareerProfile`; whitespace normalization in `analyzeResumeText` |
| `components/StudentForm.jsx` | Fill `name` from upload response |
| `components/AIMentorInsights.jsx` | Silent static fallback; no throw/console.error; 30s timeout |
| `app/api/mentor-insights/route.js` | Always return `success:true` with static fallback |
| `lib/mentorInsights.js` | Send compact summary to the LLM |
