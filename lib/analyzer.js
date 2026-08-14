import { careerPaths } from "./careerPaths";
import { dedupeProjects } from "./resumeExtractor";

// NOTE: lib/aiProvider (which reads GROQ_API_KEY and calls the Groq API) is
// intentionally NOT imported statically here – it is loaded via dynamic import
// inside analyzeCareerProfile only. That keeps the provider out of the client
// bundle when components import the deterministic functions from this module.

function normalizeSkill(skill = "") {
	return skill
		.toLowerCase()
		.replace(/[^a-z0-9+.#-]/g, "")
		.replace(/\./g, "");
}

function titleCase(value = "") {
	return value
		.split(" ")
		.filter(Boolean)
		.map(word => word[0].toUpperCase() + word.slice(1))
		.join(" ");
}

function parseList(value = "") {
	if (Array.isArray(value)) {
		return value.map(item => String(item).trim()).filter(Boolean);
	}

	return String(value)
		.split(/[\n,]/)
		.map(item => item.trim())
		.filter(Boolean);
}

function skillAliases() {
	return {
		dsa: "Data Structures",
		datastructures: "Data Structures",
		algorithms: "Algorithms",
		oop: "Object-Oriented Programming",
		objectorientedprogramming: "Object-Oriented Programming",
		dbms: "Database Systems",
		database: "Database Systems",
		databasesystems: "Database Systems",
		os: "Operating Systems",
		operatingsystems: "Operating Systems",
		ml: "Machine Learning",
		machinelearning: "Machine Learning",
		dl: "Deep Learning",
		deeplearning: "Deep Learning",
		sql: "SQL",
		mysql: "SQL",
		javascript: "JavaScript",
		js: "JavaScript",
		nodejs: "Node.js",
		node: "Node.js",
		reactjs: "React",
		api: "APIs",
		apis: "APIs",
		cloud: "Cloud",
		mlops: "MLOps"
	};
}

function canonicalizeSkill(skill) {
	const key = normalizeSkill(skill);
	return skillAliases()[key] || titleCase(skill.trim());
}

function parseSkills(value = "") {
	return [...new Set(parseList(value).map(canonicalizeSkill).filter(Boolean))];
}

function getRequiredSkills(goal = "AI Engineer") {
	return careerPaths[goal] || careerPaths["AI Engineer"];
}

function calculateReadiness(userSkills = [], requiredSkills = [], hoursPerDay = 0, projects = []) {
	const normalizedSkills = userSkills.map(canonicalizeSkill);
	const normalizedRequired = requiredSkills.map(canonicalizeSkill);
	const matchedSkills = normalizedRequired.filter(skill => normalizedSkills.includes(skill));
	const missingSkills = normalizedRequired.filter(skill => !matchedSkills.includes(skill));
	const skillScore = normalizedRequired.length > 0 ? matchedSkills.length / normalizedRequired.length : 0;
	const projectBonus = projects.length > 0 ? 8 : 0;
	const consistencyBonus = Math.min(12, Number(hoursPerDay || 0) * 3);
	const score = Math.min(100, Math.round(skillScore * 80 + projectBonus + consistencyBonus));

	return {
		score,
		matchedSkills,
		missingSkills,
		strengths: matchedSkills.slice(0, 4),
		weaknesses: missingSkills.slice(0, 4)
	};
}

function prioritizeSkills(missingSkills = [], goal = "") {
	const priorityMap = {
		"AI Engineer": ["Python", "Machine Learning", "Statistics", "Deep Learning"],
		"Software Engineer": ["Data Structures", "Algorithms", "Object-Oriented Programming", "System Design"],
		"Data Scientist": ["Python", "Statistics", "Machine Learning", "SQL"],
		"Full Stack Developer": ["JavaScript", "React", "Node.js", "APIs"]
	};

	const priorityOrder = priorityMap[goal] || [];
	const ranked = priorityOrder.filter(skill => missingSkills.includes(skill));
	const fallback = missingSkills.filter(skill => !ranked.includes(skill));
	return [...ranked, ...fallback].slice(0, 5);
}

function buildRoadmap(goal = "AI Engineer", missingSkills = [], projectRecommendations = {}) {
	const gaps = missingSkills.slice(0, 3);
	const gapList = gaps.length > 0 ? gaps.join(", ") : "your core role skills";
	const gapSkills = gaps.map(skill => `Practice: ${skill}`);
	const recommendedProjects = projectRecommendations && typeof projectRecommendations === "object"
		? [projectRecommendations.beginner?.title, projectRecommendations.intermediate?.title].filter(Boolean)
		: [];
	const projectItems = recommendedProjects.length > 0
		? recommendedProjects.map(title => `Build: ${title}`)
		: ["Ship one portfolio project", "Write clean documentation", "Use Git daily"];

	return [
		{
			phase: "Phase 1",
			title: "Close your skill gaps",
			items: gaps.length > 0
				? ["Learn: " + gapList, ...gapSkills, "Review core concepts"]
				: ["Review core concepts", "Problem-solving practice", "Solidify fundamentals"],
			outcome: gaps.length > 0 ? `Build a working foundation in ${gapList}.` : "Get the base layer solid."
		},
		{
			phase: "Phase 2",
			title: "Practice on projects",
			items: projectItems,
			outcome: "Convert learning into evidence."
		},
		{
			phase: "Phase 3",
			title: "Sharpen interviews",
			items: gaps[0]
				? [`Mock questions on ${gaps[0]}`, "Timed coding drills", "Communication practice"]
				: ["Timed coding drills", "System design notes", "Communication practice"],
			outcome: "Become interview ready."
		},
		{
			phase: "Phase 4",
			title: "Apply and iterate",
			items: ["Tailor resume", "Mock interviews", "Refine based on feedback"],
			outcome: "Move from preparation to action."
		}
	];
}

function buildWeeklySchedule(hoursPerDay = 2, roadmap = []) {
	const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
	const focusPool = roadmap.flatMap(item => item.items).filter(Boolean);

	return days.map((day, index) => ({
		day,
		focus: index === 6 ? "Weekly review and planning" : focusPool[index % focusPool.length] || "Core skill practice",
		task: index === 6 ? "Review progress, update notes, and plan next week" : "Study, practice, and document progress",
		hours: Math.max(1, Number(hoursPerDay) || 1)
	}));
}

// Skill-level learning resources used to personalize the resource list to the
// user's actual gaps (in addition to the career-level base list).
const skillResources = {
	Python: { courses: ["Python Crash Course (book)", "CS50P — Harvard"], youtubeChannels: ["Corey Schafer"] },
	"Machine Learning": { courses: ["Andrew Ng ML Specialization", "fast.ai Practical Deep Learning"], practicePlatforms: ["Kaggle"], youtubeChannels: ["StatQuest"] },
	"Deep Learning": { courses: ["fast.ai Practical Deep Learning", "DeepLearning.AI Specialization"], practicePlatforms: ["Kaggle"], youtubeChannels: ["DeepLearningAI"] },
	Statistics: { courses: ["Khan Academy Statistics", "StatQuest Statistics"], youtubeChannels: ["StatQuest"] },
	"Data Structures": { courses: ["NeetCode DSA roadmap", "Algorithms (Sedgewick)"], practicePlatforms: ["LeetCode"], youtubeChannels: ["NeetCode"] },
	Algorithms: { courses: ["MIT 6.006 Introduction to Algorithms", "Algorithms (Sedgewick)"], practicePlatforms: ["LeetCode", "Codeforces"] },
	SQL: { courses: ["SQLBolt", "Mode SQL Tutorial"], practicePlatforms: ["DataLemur", "HackerRank"] },
	Git: { courses: ["Git & GitHub (freeCodeCamp)"], practicePlatforms: ["GitHub"] },
	Cloud: { courses: ["AWS Cloud Practitioner Essentials"], practicePlatforms: ["AWS Skill Builder"] },
	MLOps: { courses: ["Made With ML", "Kubeflow docs"], youtubeChannels: ["DataTalksClub"] },
	JavaScript: { courses: ["freeCodeCamp JavaScript course"], practicePlatforms: ["Frontend Mentor"] },
	React: { courses: ["React docs", "Full Stack Open"], practicePlatforms: ["Frontend Mentor"] },
	"Node.js": { courses: ["The Odin Project", "Full Stack Open"] },
	HTML: { courses: ["MDN Web Docs"], practicePlatforms: ["Frontend Mentor"] },
	CSS: { courses: ["MDN Web Docs", "CSS Tricks"], practicePlatforms: ["Frontend Mentor"] },
	Database: { courses: ["SQLBolt", "PostgreSQL Tutorial"], practicePlatforms: ["DataLemur"] },
	"Database Systems": { courses: ["SQLBolt", "PostgreSQL Tutorial"], practicePlatforms: ["DataLemur"] },
	APIs: { courses: ["Full Stack Open", "REST API docs"], practicePlatforms: ["Postman Academy"] },
	"System Design": { courses: ["System Design Primer", "Designing Data-Intensive Applications"], youtubeChannels: ["ByteByteGo"] },
	"Object-Oriented Programming": { courses: ["Head First Object-Oriented Analysis & Design"], practicePlatforms: ["Exercism"] },
	"Operating Systems": { courses: ["Operating Systems: Three Easy Pieces"], practicePlatforms: ["LeetCode concurrency"] },
	"Data Visualization": { courses: ["Kaggle Learn Data Viz"], youtubeChannels: ["Data School"] },
	"Data Cleaning": { courses: ["Kaggle Learn Data Cleaning"], practicePlatforms: ["Kaggle"] }
};

function buildResources(goal = "AI Engineer", missingSkills = []) {
	const resources = {
		"AI Engineer": {
			courses: ["Andrew Ng Machine Learning Specialization", "fast.ai Practical Deep Learning", "Microsoft Learn AI Fundamentals"],
			documentation: ["PyTorch docs", "scikit-learn docs", "Pandas docs"],
			practicePlatforms: ["Kaggle", "Papers with Code", "LeetCode"],
			youtubeChannels: ["StatQuest", "DeepLearningAI", "freeCodeCamp"]
		},
		"Software Engineer": {
			courses: ["NeetCode roadmap", "System Design Primer", "freeCodeCamp JavaScript course"],
			documentation: ["MDN Web Docs", "React docs", "Node.js docs"],
			practicePlatforms: ["LeetCode", "Codeforces", "HackerRank"],
			youtubeChannels: ["NeetCode", "Traversy Media", "Fireship"]
		},
		"Data Scientist": {
			courses: ["Kaggle Learn", "IBM Data Science Certificate", "Microsoft Learn Data Fundamentals"],
			documentation: ["Pandas docs", "NumPy docs", "Matplotlib docs"],
			practicePlatforms: ["Kaggle", "DrivenData", "DataLemur"],
			youtubeChannels: ["StatQuest", "Krish Naik", "Data School"]
		},
		"Full Stack Developer": {
			courses: ["Next.js Learn", "Full Stack Open", "The Odin Project"],
			documentation: ["MDN Web Docs", "React docs", "Next.js docs"],
			practicePlatforms: ["Frontend Mentor", "CodePen", "LeetCode"],
			youtubeChannels: ["freeCodeCamp", "Traversy Media", "CodeWithAntonio"]
		}
	};

	const base = resources[goal] || resources["AI Engineer"];
	const merged = {
		courses: [...base.courses],
		documentation: [...base.documentation],
		practicePlatforms: [...base.practicePlatforms],
		youtubeChannels: [...base.youtubeChannels]
	};

	// Append resources targeted at the user's actual missing skills.
	for (const skill of missingSkills.slice(0, 3)) {
		const extra = skillResources[skill];
		if (!extra) continue;
		for (const [key, values] of Object.entries(extra)) {
			if (Array.isArray(values) && merged[key]) {
				merged[key] = [...new Set([...merged[key], ...values])];
			}
		}
	}

	return merged;
}

function buildCareerMatches(userSkills = [], selectedGoal = "AI Engineer") {
	const normalizedSkills = userSkills.map(canonicalizeSkill);

	return Object.entries(careerPaths)
		.map(([career, requiredSkills]) => {
			const normalizedRequired = requiredSkills.map(canonicalizeSkill);
			const matchedSkills = normalizedRequired.filter(skill => normalizedSkills.includes(skill));
			const matchPercentage = normalizedRequired.length > 0
				? Math.round((matchedSkills.length / normalizedRequired.length) * 100)
				: 0;

			const missing = normalizedRequired.filter(skill => !matchedSkills.includes(skill));

			return {
				career,
				score: matchPercentage,
				matchedSkills,
				missingSkills: missing,
				requiredSkills: normalizedRequired,
				estimatedWeeks: Math.max(4, Math.ceil(missing.length * 1.5)),
				selected: career === selectedGoal
			};
		})
		.sort((left, right) => right.score - left.score)
		.slice(0, 3);
}

function buildProjectRecommendations(goal = "AI Engineer") {
	const projectMap = {
		"AI Engineer": {
			beginner: {
				title: "Image classifier with transfer learning",
				description: "Build a simple classifier and document the model pipeline.",
				skills: ["Python", "Pandas", "Machine Learning"],
				difficulty: "Beginner",
				duration: "2-3 weeks"
			},
			intermediate: {
				title: "Resume screening assistant",
				description: "Create a small AI tool that ranks resumes against a target role.",
				skills: ["NLP", "APIs", "Prompting"],
				difficulty: "Intermediate",
				duration: "3-4 weeks"
			},
			advanced: {
				title: "AI career coach with RAG",
				description: "Combine retrieval, evaluation, and guidance into an intelligent assistant.",
				skills: ["MLOps", "Vector search", "Deployment"],
				difficulty: "Advanced",
				duration: "5-6 weeks"
			}
		},
		"Software Engineer": {
			beginner: {
				title: "Task tracker web app",
				description: "Ship a CRUD app with clean UI, state management, and local persistence.",
				skills: ["React", "JavaScript", "APIs"],
				difficulty: "Beginner",
				duration: "2 weeks"
			},
			intermediate: {
				title: "Interview prep dashboard",
				description: "Build a DSA practice dashboard with progress tracking and scheduling.",
				skills: ["Data Structures", "Algorithms", "Git"],
				difficulty: "Intermediate",
				duration: "3-4 weeks"
			},
			advanced: {
				title: "Scalable job platform",
				description: "Design a production-style platform with auth-ready service boundaries.",
				skills: ["System Design", "Databases", "Operating Systems"],
				difficulty: "Advanced",
				duration: "6-8 weeks"
			}
		},
		"Data Scientist": {
			beginner: {
				title: "Data exploration notebook",
				description: "Analyze a public dataset and explain the insights clearly.",
				skills: ["Python", "Pandas", "Visualization"],
				difficulty: "Beginner",
				duration: "2 weeks"
			},
			intermediate: {
				title: "Demand forecasting model",
				description: "Train and evaluate a forecasting pipeline on real business data.",
				skills: ["Statistics", "Machine Learning", "SQL"],
				difficulty: "Intermediate",
				duration: "4 weeks"
			},
			advanced: {
				title: "Decision intelligence platform",
				description: "Turn analysis into a dashboard that supports business decisions.",
				skills: ["Data Cleaning", "Dashboards", "Storytelling"],
				difficulty: "Advanced",
				duration: "5-6 weeks"
			}
		},
		"Full Stack Developer": {
			beginner: {
				title: "Portfolio site",
				description: "Build a responsive personal site with polished sections and deploy it.",
				skills: ["HTML", "CSS", "JavaScript"],
				difficulty: "Beginner",
				duration: "1-2 weeks"
			},
			intermediate: {
				title: "Student services portal",
				description: "Create a full-stack portal with forms, validation, and API integration.",
				skills: ["React", "Node.js", "Database"],
				difficulty: "Intermediate",
				duration: "3-4 weeks"
			},
			advanced: {
				title: "AI-powered product platform",
				description: "Blend frontend, backend, and AI features into a demo-ready product.",
				skills: ["APIs", "Deployment", "System Design"],
				difficulty: "Advanced",
				duration: "6 weeks"
			}
		}
	};

	return projectMap[goal] || projectMap["AI Engineer"];
}

function analyzeResumeText(resumeText = "", targetCareer = "AI Engineer") {
	// Collapse whitespace so multi-word skills still match when PDF extraction
	// wraps words across lines (e.g. "Data \nStructures").
	const text = String(resumeText || "").toLowerCase().replace(/\s+/g, " ");
	const requiredSkills = getRequiredSkills(targetCareer).map(canonicalizeSkill);
	const detectedSkills = requiredSkills.filter(skill => text.includes(skill.toLowerCase()));
	const broaderSkillBank = Array.from(new Set(Object.values(careerPaths).flat().map(canonicalizeSkill)));
	const extraSkills = broaderSkillBank.filter(skill => !requiredSkills.includes(skill) && text.includes(skill.toLowerCase()));
	const allDetectedSkills = [...new Set([...detectedSkills, ...extraSkills])];
	const missingSkills = requiredSkills.filter(skill => !allDetectedSkills.includes(skill));
	const keywordStrengths = [];

	if (text.includes("built") || text.includes("developed") || text.includes("created")) {
		keywordStrengths.push("Project ownership");
	}
	if (text.includes("deployed") || text.includes("published")) {
		keywordStrengths.push("Delivery experience");
	}
	if (text.includes("led") || text.includes("team") || text.includes("collaborated")) {
		keywordStrengths.push("Teamwork and leadership");
	}
	if (text.includes("certified") || text.includes("course")) {
		keywordStrengths.push("Learning discipline");
	}

	const strengths = [...new Set([...allDetectedSkills.slice(0, 6), ...keywordStrengths])];
	const suggestions = [
		missingSkills.length > 0 ? `Add evidence for ${missingSkills.slice(0, 3).join(", ")}.` : "The resume already covers the main role skills.",
		text.includes("project") ? "Strengthen project outcomes with impact metrics." : "Add 1-2 project bullets that show real outcomes.",
		text.includes("experience") ? "Keep the strongest experience bullets at the top." : "Add a short experience or internship section if available."
	];

	const matchScore = requiredSkills.length > 0
		? Math.round((allDetectedSkills.filter(skill => requiredSkills.includes(skill)).length / requiredSkills.length) * 100)
		: 0;

	const careerFit =
		matchScore >= 70 ? "Strong fit" : matchScore >= 40 ? "Moderate fit" : "Needs development";

	return {
		detectedSkills: allDetectedSkills,
		strengths,
		missingSkills,
		suggestions,
		recommendations: suggestions,
		matchScore,
		careerFit,
		targetCareer
	};
}

function normalizeProfile(profile = {}) {
	return {
		name: String(profile.name || "Student").trim(),
		degree: String(profile.degree || "").trim(),
		skills: parseSkills(profile.skills),
		projects: parseSkills(profile.projects),
		goal: profile.goal || "AI Engineer",
		hoursPerDay: Number(profile.hoursPerDay) || 1
	};
}

function buildAnalysisFromProfile(normalizedProfile) {
	const requiredSkills = getRequiredSkills(normalizedProfile.goal);
	const readiness = calculateReadiness(normalizedProfile.skills, requiredSkills, normalizedProfile.hoursPerDay, normalizedProfile.projects);
	const projectRecommendations = buildProjectRecommendations(normalizedProfile.goal);
	// Roadmap and resources are personalized to the user's actual gaps.
	const roadmap = buildRoadmap(normalizedProfile.goal, readiness.missingSkills, projectRecommendations);
	const weeklySchedule = buildWeeklySchedule(normalizedProfile.hoursPerDay, roadmap);
	const resources = buildResources(normalizedProfile.goal, readiness.missingSkills);
	const careerMatches = buildCareerMatches(normalizedProfile.skills, normalizedProfile.goal);

	return {
		profile: normalizedProfile,
		readiness: {
			score: readiness.score,
			label: readiness.score >= 80 ? "Strong match" : readiness.score >= 50 ? "Promising fit" : "Early stage",
			strengths: readiness.strengths,
			weaknesses: readiness.weaknesses,
			summary: readiness.score >= 80 ? "You are ready to apply and refine." : readiness.score >= 50 ? "You are close. Focus on the gaps and one strong project." : "Build fundamentals first, then revisit the role."
		},
		skillGap: {
			existingSkills: readiness.matchedSkills,
			missingSkills: readiness.missingSkills,
			prioritySkills: prioritizeSkills(readiness.missingSkills, normalizedProfile.goal)
		},
		roadmap,
		weeklySchedule,
		resources,
		careerMatches,
		projectRecommendations,
		resumeAnalysis: normalizedProfile._resumeAnalysis || null
	};
}

/**
 * Synchronous, deterministic analysis. Safe to call anywhere (client or server)
 * and used for defaults and fallbacks – it never touches the network.
 * @param {object} [profile] – Raw profile form data.
 * @returns {object} Full analysis object.
 */
export function buildAnalysis(profile = {}) {
	return buildAnalysisFromProfile(normalizeProfile(profile));
}

/**
 * Full analysis pipeline. Runs the deterministic engine first, then enriches
 * the profile with AI-extracted resume skills/projects when resume text is
 * provided. Falls back to the keyword analyzer (and merges its hits) whenever
 * the model call fails, so resume content always contributes to the score.
 * @param {object} [profile] – Raw profile form data.
 * @returns {Promise<object>} Full analysis object.
 */
export async function analyzeCareerProfile(profile = {}) {
	const normalizedProfile = normalizeProfile(profile);

	// If resume text/data is provided, integrate detected resume skills/projects.
	if (profile.resumeText) {
		// Deterministic keyword scan always runs – its hits are merged even when
		// the model succeeds, so keywords the model missed still count.
		const staticScan = analyzeResumeText(profile.resumeText, normalizedProfile.goal);
		try {
			const { generateResumeAnalysis } = await import("./aiProvider");
			const requiredSkills = getRequiredSkills(normalizedProfile.goal);
			const resumeAnalysis = await generateResumeAnalysis(profile.resumeText, normalizedProfile.goal, requiredSkills);
			if (resumeAnalysis && typeof resumeAnalysis === "object") {
				// Union of base skills + AI-detected + deterministic scan.
				const aiSkills = Array.isArray(resumeAnalysis.detectedSkills) ? parseSkills(resumeAnalysis.detectedSkills) : [];
				const merged = [...new Set([...normalizedProfile.skills, ...aiSkills, ...(staticScan.detectedSkills || [])])];
				normalizedProfile.skills = merged;
				if (Array.isArray(resumeAnalysis.projects) && resumeAnalysis.projects.length) {
					// Projects are stored as plain titles in the profile; the
					// descriptions live on `_resumeAnalysis` for the analysis view.
					const mergedProjects = dedupeProjects([...(normalizedProfile.projects || []), ...resumeAnalysis.projects])
						.map(project => project.title);
					normalizedProfile.projects = mergedProjects;
				}
				normalizedProfile._resumeAnalysis = resumeAnalysis;
			}
		} catch (e) {
			// Fallback to the deterministic keyword analyzer. Merge its detected
			// skills too, so resume content still counts toward readiness.
			try {
				const fallback = staticScan;
				if (Array.isArray(fallback.detectedSkills) && fallback.detectedSkills.length) {
					const merged = [...new Set([...normalizedProfile.skills, ...fallback.detectedSkills])];
					normalizedProfile.skills = merged;
				}
				normalizedProfile._resumeAnalysis = fallback;
			} catch (_) {}
		}
	}

	return buildAnalysisFromProfile(normalizedProfile);
}

/**
 * Merge the deterministic keyword analysis with AI-extracted skills, then
 * recompute missing skills / score deterministically against the required list.
 * The model's free-form output never replaces the app's canonical scoring.
 * @param {object} [staticAnalysis] – Result of `analyzeResumeText`.
 * @param {object|null} [aiResult]   – Normalized output of `generateResumeAnalysis`.
 * @returns {object} Merged resume analysis (same shape as `analyzeResumeText`).
 */
export function mergeResumeAnalysis(staticAnalysis = {}, aiResult = null) {
	const staticSkills = staticAnalysis.detectedSkills || [];
	const aiSkills = aiResult?.detectedSkills || [];
	const canonicalDetected = new Set([
		...staticSkills.map(canonicalizeSkill),
		...aiSkills.map(canonicalizeSkill)
	]);
	const requiredSkills = getRequiredSkills(staticAnalysis.targetCareer || aiResult?.targetCareer || "AI Engineer").map(canonicalizeSkill);
	const missingSkills = requiredSkills.filter(skill => !canonicalDetected.has(skill));
	const matchedCount = requiredSkills.filter(skill => canonicalDetected.has(skill)).length;
	const matchScore = requiredSkills.length > 0 ? Math.round((matchedCount / requiredSkills.length) * 100) : 0;
	const careerFit = matchScore >= 70 ? "Strong fit" : matchScore >= 40 ? "Moderate fit" : "Needs development";
	const strengths = [...new Set([...(staticAnalysis.strengths || []), ...(aiResult?.strengths || [])])];
	const suggestions = [...new Set([...(staticAnalysis.suggestions || []), ...(aiResult?.suggestions || [])])];

	return {
		detectedSkills: [...new Set([...staticSkills, ...aiSkills])],
		strengths,
		missingSkills,
		suggestions,
		recommendations: suggestions,
		matchScore,
		careerFit,
		targetCareer: staticAnalysis.targetCareer || aiResult?.targetCareer || "AI Engineer"
	};
}

export { parseSkills, normalizeSkill, getRequiredSkills, buildCareerMatches, analyzeResumeText, buildProjectRecommendations };