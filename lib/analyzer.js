import { careerPaths } from "./careerPaths";
import { prompts } from "./prompts";

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

function buildRoadmap(goal = "AI Engineer", missingSkills = []) {
	const coreGap = missingSkills[0] || goal;
	return [
		{ phase: "Phase 1", title: "Build foundations", items: ["Review core concepts", coreGap, "Problem-solving practice"], outcome: "Get the base layer solid." },
		{ phase: "Phase 2", title: "Practice on projects", items: ["Ship one portfolio project", "Write clean documentation", "Use Git daily"], outcome: "Convert learning into evidence." },
		{ phase: "Phase 3", title: "Sharpen interviews", items: ["Timed coding drills", "System design notes", "Communication practice"], outcome: "Become interview ready." },
		{ phase: "Phase 4", title: "Apply and iterate", items: ["Tailor resume", "Mock interviews", "Refine based on feedback"], outcome: "Move from preparation to action." }
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

function buildResources(goal = "AI Engineer") {
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

	return resources[goal] || resources["AI Engineer"];
}

export function analyzeCareerProfile(profile = {}) {
	const normalizedProfile = {
		name: String(profile.name || "Student").trim(),
		degree: String(profile.degree || "").trim(),
		skills: parseSkills(profile.skills),
		projects: parseSkills(profile.projects),
		goal: profile.goal || "AI Engineer",
		hoursPerDay: Number(profile.hoursPerDay) || 1
	};

	const requiredSkills = getRequiredSkills(normalizedProfile.goal);
	const readiness = calculateReadiness(normalizedProfile.skills, requiredSkills, normalizedProfile.hoursPerDay, normalizedProfile.projects);
	const roadmap = buildRoadmap(normalizedProfile.goal, readiness.missingSkills);
	const weeklySchedule = buildWeeklySchedule(normalizedProfile.hoursPerDay, roadmap);
	const resources = buildResources(normalizedProfile.goal);

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
		workflow: [
			{ step: "Profile Analysis", description: "Understand the student's background and target role." },
			{ step: "Skill Gap Analysis", description: "Compare current skills to the target role." },
			{ step: "Readiness Assessment", description: "Score current preparedness and confidence." },
			{ step: "Roadmap Generation", description: "Turn the gaps into a structured plan." },
			{ step: "Study Plan Generation", description: "Convert the roadmap into a weekly schedule." }
		],
		prompts: prompts
	};
}

export { parseSkills, normalizeSkill, getRequiredSkills };