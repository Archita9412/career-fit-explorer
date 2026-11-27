export type JobType = "Internship" | "Full-time" | "Part-time";
export type WorkMode = "Remote" | "Hybrid" | "On-site";
export type Domain = "Software" | "Data" | "Design" | "Marketing" | "AI & ML" | "Consulting" | "Content" | "Cloud";

export interface Job {
  slug: string;
  title: string;
  company: string;
  city: string;
  pay: string;
  deadline: string; // ISO date
  posted: string; // ISO date
  type: JobType;
  mode: WorkMode;
  domain: Domain;
  skills: string[];
  about: string;
  responsibilities: string[];
  requirements: string[];
}

export const JOBS: Job[] = [
  {
    slug: "frontend-developer-intern-brightlane", title: "Frontend Developer Intern", company: "Brightlane Labs",
    city: "Bengaluru", pay: "₹25,000 / month", deadline: "2026-12-11", posted: "2026-11-25", type: "Internship", mode: "Remote", domain: "Software",
    skills: ["React", "TypeScript", "CSS"],
    about: "Brightlane Labs builds friendly finance tools for small businesses. You'll ship real UI used by thousands of shop owners.",
    responsibilities: ["Build and polish React components", "Turn Figma designs into accessible, responsive pages", "Write tests and review pull requests with mentors"],
    requirements: ["Comfortable with React and modern JavaScript", "Some TypeScript experience", "A portfolio or GitHub with at least one project"],
  },
  {
    slug: "data-analyst-intern-quarry", title: "Data Analyst Intern", company: "Quarry Analytics",
    city: "Pune", pay: "₹20,000 / month", deadline: "2026-12-04", posted: "2026-11-24", type: "Internship", mode: "Hybrid", domain: "Data",
    skills: ["SQL", "Python", "Excel"],
    about: "Quarry helps retail brands understand their customers. Interns own small analyses end to end.",
    responsibilities: ["Write SQL to answer business questions", "Clean and explore data in Python", "Present findings in simple dashboards"],
    requirements: ["Solid SQL basics (joins, group by)", "Familiar with pandas or Excel pivots", "Clear written communication"],
  },
  {
    slug: "ui-ux-design-intern-fernwood", title: "UI/UX Design Intern", company: "Fernwood Studio",
    city: "Mumbai", pay: "₹18,000 / month", deadline: "2026-12-20", posted: "2026-11-23", type: "Internship", mode: "On-site", domain: "Design",
    skills: ["Figma", "User research", "Prototyping"],
    about: "Fernwood is a small product studio designing apps for health and education startups.",
    responsibilities: ["Run user interviews and usability tests", "Create wireframes and high-fidelity prototypes", "Maintain the studio design system"],
    requirements: ["A portfolio with 2+ case studies", "Strong Figma skills", "Curiosity about people"],
  },
  {
    slug: "backend-engineer-graduate-northwind", title: "Backend Engineer (Graduate)", company: "Northwind Cloud",
    city: "Hyderabad", pay: "₹9 LPA", deadline: "2026-12-30", posted: "2026-11-22", type: "Full-time", mode: "Hybrid", domain: "Software",
    skills: ["Node.js", "PostgreSQL", "APIs"],
    about: "Northwind runs logistics software for 400+ warehouses. Join the platform team as a graduate engineer.",
    responsibilities: ["Design and build REST APIs", "Write efficient PostgreSQL queries", "Participate in on-call with senior engineers"],
    requirements: ["B.Tech/B.E. graduating 2026 or 2027", "Experience with Node.js or similar", "Understanding of relational databases"],
  },
  {
    slug: "digital-marketing-intern-saffron", title: "Digital Marketing Intern", company: "Saffron & Co.",
    city: "Delhi", pay: "₹12,000 / month", deadline: "2026-11-30", posted: "2026-11-20", type: "Internship", mode: "Remote", domain: "Marketing",
    skills: ["SEO", "Content writing", "Social media"],
    about: "Saffron & Co. is a D2C spice brand growing fast on Instagram and marketplaces.",
    responsibilities: ["Plan and schedule social posts", "Research keywords and improve product pages", "Track campaign results weekly"],
    requirements: ["Great written English", "Active on social platforms", "Basic understanding of SEO"],
  },
  {
    slug: "machine-learning-intern-kestrel", title: "Machine Learning Intern", company: "Kestrel AI",
    city: "Bengaluru", pay: "₹35,000 / month", deadline: "2026-12-15", posted: "2026-11-21", type: "Internship", mode: "On-site", domain: "AI & ML",
    skills: ["Python", "PyTorch", "Machine learning"],
    about: "Kestrel builds computer vision models for agriculture. Interns train and evaluate real models.",
    responsibilities: ["Prepare datasets and training pipelines", "Train and evaluate PyTorch models", "Write up experiments clearly"],
    requirements: ["Strong Python", "Coursework or projects in ML", "Some PyTorch or TensorFlow experience"],
  },
  {
    slug: "business-analyst-meridian", title: "Business Analyst", company: "Meridian Consulting",
    city: "Gurugram", pay: "₹7.5 LPA", deadline: "2026-12-25", posted: "2026-11-19", type: "Full-time", mode: "On-site", domain: "Consulting",
    skills: ["Excel", "Communication", "PowerPoint"],
    about: "Meridian advises mid-size manufacturers on operations and growth strategy.",
    responsibilities: ["Build Excel models for client projects", "Prepare client-ready slide decks", "Join client workshops and take notes"],
    requirements: ["Any graduate degree, 2025–2026", "Advanced Excel", "Confident speaker and writer"],
  },
  {
    slug: "android-developer-intern-pocketful", title: "Android Developer Intern", company: "Pocketful Apps",
    city: "Chennai", pay: "₹22,000 / month", deadline: "2026-12-08", posted: "2026-11-18", type: "Internship", mode: "Remote", domain: "Software",
    skills: ["Kotlin", "Android", "Git"],
    about: "Pocketful makes budgeting apps with over a million downloads.",
    responsibilities: ["Build features in Kotlin and Jetpack Compose", "Fix bugs reported by users", "Write unit tests"],
    requirements: ["Built at least one Android app", "Comfortable with Git", "Kotlin basics"],
  },
  {
    slug: "content-writer-part-time-inkwell", title: "Content Writer (Part-time)", company: "Inkwell Media",
    city: "Kolkata", pay: "₹15,000 / month", deadline: "2026-12-10", posted: "2026-11-17", type: "Part-time", mode: "Remote", domain: "Content",
    skills: ["Content writing", "Research", "SEO"],
    about: "Inkwell publishes explainers on careers and personal finance for young Indians.",
    responsibilities: ["Write 3–4 well-researched articles a week", "Optimise articles for search", "Work with editors on feedback"],
    requirements: ["Writing samples", "Able to commit 20 hours a week", "Comfortable with research"],
  },
  {
    slug: "cloud-support-associate-stratus", title: "Cloud Support Associate", company: "Stratus Systems",
    city: "Noida", pay: "₹6 LPA", deadline: "2026-12-18", posted: "2026-11-16", type: "Full-time", mode: "Hybrid", domain: "Cloud",
    skills: ["Linux", "Networking", "AWS"],
    about: "Stratus is a managed cloud provider helping startups run reliably on AWS.",
    responsibilities: ["Troubleshoot customer cloud issues", "Monitor systems and respond to alerts", "Write knowledge-base articles"],
    requirements: ["Linux command-line basics", "Networking fundamentals", "AWS certification is a plus"],
  },
];

export const DOMAINS: Domain[] = ["Software", "Data", "Design", "Marketing", "AI & ML", "Consulting", "Content", "Cloud"];

export function getJob(slug: string) {
  return JOBS.find((j) => j.slug === slug);
}

const norm = (s: string) => s.trim().toLowerCase();

/** Percentage (0–100) of a job's skills the student has. */
export function matchScore(job: Job, skills: string[]): number {
  if (job.skills.length === 0) return 0;
  const mine = new Set(skills.map(norm));
  const hits = job.skills.filter((s) => mine.has(norm(s))).length;
  return Math.round((hits / job.skills.length) * 100);
}

/** Whole days from `now` until the end of the deadline day. */
export function daysLeft(job: Job, now: Date = new Date()): number {
  const end = new Date(job.deadline + "T23:59:59");
  return Math.ceil((end.getTime() - now.getTime()) / 86_400_000);
}

export function formatDeadline(job: Job) {
  return new Date(job.deadline + "T00:00:00").toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}
