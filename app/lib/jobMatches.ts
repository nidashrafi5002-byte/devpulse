export type SkillSummary = {
  name: string;
  level: number;
};

export type JobMatch = {
  title: string;
  company: string;
  type: string;
  keywords: string[];
  match: number;
};

const jobTemplates: Omit<JobMatch, "match">[] = [
  {
    title: "Frontend Developer",
    keywords: ["react", "javascript", "typescript", "css", "html", "vue", "angular"],
    company: "Startup Inc",
    type: "Remote",
  },
  {
    title: "Full Stack Engineer",
    keywords: ["node", "javascript", "typescript", "react", "python", "mongodb"],
    company: "Tech Corp",
    type: "Hybrid",
  },
  {
    title: "AI/ML Engineer",
    keywords: ["python", "machine learning", "tensorflow", "pytorch", "ai", "data"],
    company: "AI Labs",
    type: "Remote",
  },
  {
    title: "Backend Developer",
    keywords: ["python", "java", "node", "go", "rust", "c++", "api"],
    company: "Scale AI",
    type: "Remote",
  },
  {
    title: "DevOps Engineer",
    keywords: ["docker", "kubernetes", "aws", "linux", "bash", "ci/cd"],
    company: "Cloud Corp",
    type: "Hybrid",
  },
  {
    title: "Systems Engineer",
    keywords: ["c", "c++", "rust", "linux", "embedded", "assembly"],
    company: "Intel Labs",
    type: "Onsite",
  },
  {
    title: "Data Engineer",
    keywords: ["python", "sql", "spark", "hadoop", "data", "etl"],
    company: "DataFlow",
    type: "Remote",
  },
  {
    title: "Mobile Developer",
    keywords: ["swift", "kotlin", "react native", "flutter", "android", "ios"],
    company: "AppStudio",
    type: "Remote",
  },
];

const normalizeSkillName = (value: string) => value.toLowerCase().trim();

export function getJobMatches(skills: SkillSummary[] | undefined): JobMatch[] {
  if (!skills || skills.length === 0) return [];

  const scored = jobTemplates.map((job) => {
    const matchedSkills = skills.filter((skill) => {
      const normalizedSkill = normalizeSkillName(skill.name);
      return job.keywords.some((keyword) => {
        const normalizedKeyword = normalizeSkillName(keyword);
        return normalizedSkill.includes(normalizedKeyword) || normalizedKeyword.includes(normalizedSkill);
      });
    });

    const matchedScore = matchedSkills.reduce((total, skill) => total + skill.level, 0);
    const match = Math.min(95, 60 + matchedSkills.length * 8 + Math.round(matchedScore / 25));

    return {
      ...job,
      match,
    };
  });

  return scored
    .filter((job) => job.match > 65)
    .sort((a, b) => b.match - a.match)
    .slice(0, 3);
}
