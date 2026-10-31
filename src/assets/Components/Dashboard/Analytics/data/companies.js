const roles = [
  { id: "frontend", title: "Frontend Developer", category: "Frontend", must: [["javascript", 2, 3], ["react", 2, 3], ["html", 1, 1], ["css", 2, 2]], preferred: [["typescript", 2, 2], ["git", 1, 1]] },
  { id: "backend", title: "Backend Developer", category: "Backend", must: [["node", 2, 3], ["sql", 2, 2], ["dsa", 2, 2], ["git", 1, 1]], preferred: [["docker", 2, 2], ["aws", 2, 2]] },
  { id: "fullstack", title: "Full Stack Engineer", category: "Software Engineering", must: [["javascript", 2, 3], ["react", 2, 2], ["node", 2, 3], ["sql", 2, 2]], preferred: [["typescript", 2, 1], ["docker", 2, 1]] },
  { id: "data", title: "Data Analyst", category: "Data", must: [["python", 2, 3], ["sql", 2, 3], ["dsa", 1, 1]], preferred: [["machine-learning", 1, 2], ["aws", 1, 1]] },
  { id: "ml", title: "Machine Learning Engineer", category: "AI & ML", must: [["python", 2, 3], ["machine-learning", 2, 3], ["dsa", 2, 2]], preferred: [["pytorch", 2, 2], ["aws", 2, 1]] },
  { id: "cloud", title: "Cloud Engineer", category: "Cloud & DevOps", must: [["linux", 2, 3], ["aws", 2, 3], ["docker", 2, 2]], preferred: [["kubernetes", 2, 2], ["python", 1, 1]] },
];

const companies = [
  ["google", "Google", "Technology", "https://careers.google.com/", "Search, cloud and consumer technology"],
  ["microsoft", "Microsoft", "Technology", "https://careers.microsoft.com/", "Software, cloud and productivity technology"],
  ["amazon", "Amazon", "Technology & Retail", "https://www.amazon.jobs/", "E-commerce, logistics and cloud services"],
  ["adobe", "Adobe", "Software", "https://careers.adobe.com/", "Creative, document and marketing software"],
  ["nvidia", "NVIDIA", "Semiconductors", "https://www.nvidia.com/en-us/about-nvidia/careers/", "Accelerated computing and graphics"],
  ["meta", "Meta", "Technology", "https://www.metacareers.com/", "Social platforms and immersive technology"],
  ["apple", "Apple", "Consumer Electronics", "https://www.apple.com/careers/", "Consumer devices, software and services"],
  ["ibm", "IBM", "Technology & Consulting", "https://www.ibm.com/careers", "Enterprise technology and consulting"],
  ["oracle", "Oracle", "Enterprise Software", "https://www.oracle.com/careers/", "Database and cloud software"],
  ["intel", "Intel", "Semiconductors", "https://jobs.intel.com/", "Processors and semiconductor platforms"],
  ["infosys", "Infosys", "IT Services", "https://www.infosys.com/careers/", "Technology consulting and digital services"],
  ["tcs", "Tata Consultancy Services", "IT Services", "https://www.tcs.com/careers", "Technology consulting and IT services"],
  ["accenture", "Accenture", "IT Services & Consulting", "https://www.accenture.com/careers", "Technology and business consulting"],
  ["deloitte", "Deloitte", "Professional Services", "https://www2.deloitte.com/careers", "Consulting, audit and technology services"],
  ["flipkart", "Flipkart", "E-commerce", "https://www.flipkartcareers.com/", "Digital commerce and technology"],
];

const roleSets = [roles.slice(0, 3), [roles[0], roles[2], roles[4]], [roles[1], roles[2], roles[3]], [roles[0], roles[2], roles[3]], [roles[4], roles[5], roles[1]]];
export const datasetMetadata = {
  type: "sample", verificationStatus: "unverified", lastReviewed: "2026-10-31",
  sourceDescription: "Illustrative application dataset; requirements are not official hiring criteria.",
  label: "SAMPLE REQUIREMENTS — ILLUSTRATIVE DATA",
};

export const companiesDataset = companies.map(([id, name, industry, website, description], index) => ({
  id, name, industry, website, description,
  locations: ["India", "United States", "Remote"],
  roles: roleSets[index % roleSets.length].map((role) => ({
    ...role, id: `${id}-${role.id}`,
    requirements: [
      ...role.must.map(([skillId, requiredLevel, weight]) => ({ skillId, requiredLevel, type: "must-have", weight })),
      ...role.preferred.map(([skillId, requiredLevel, weight]) => ({ skillId, requiredLevel, type: "preferred", weight })),
    ],
    description: `Illustrative ${role.title} profile for exploring skill alignment at ${name}.`,
    minimumExperience: "Not specified in sample data", educationPreferences: "Not specified in sample data",
  })),
}));
