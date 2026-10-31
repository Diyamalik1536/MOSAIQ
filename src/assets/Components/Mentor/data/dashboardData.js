export const initialProjects = [
    { id: 1, title: "TalentForge", student: "Ayush Thakur", initials: "AT", category: "Web", members: 3, reviewEstimate: "8 min", color: "lavender", version: "v2.4", status: "Pending", repositoryUrl: "https://github.com/Ayush-thakur07/TalentForge" },
    { id: 2, title: "Smart Campus Navigator", student: "Aarav Mehta", initials: "AM", category: "Web", members: 4, reviewEstimate: "6 min", color: "mint", version: "v1.8", status: "Pending", repositoryUrl: "https://github.com/openstreetmap/openstreetmap-website" },
    { id: 3, title: "AI Resume Analyzer", student: "Karan Malhotra", initials: "KM", category: "NLP", members: 2, reviewEstimate: "10 min", color: "peach", version: "v1.3", status: "Pending", repositoryUrl: "https://github.com/adrianhajdin/ai-resume-analyzer" },
    { id: 4, title: "Blockchain Voting System", student: "Riya Kapoor", initials: "RK", category: "Blockchain", members: 3, reviewEstimate: "12 min", color: "blue", version: "v1.1", status: "Pending", repositoryUrl: "https://github.com/ethereum-boilerplate/ethereum-boilerplate" },
    { id: 5, title: "HealthAssist App", student: "Nikhil Shah", initials: "NS", category: "HealthTech", members: 2, color: "rose", version: "v2.0", status: "Completed", repositoryUrl: "https://github.com/medplum/medplum" },
    { id: 6, title: "The Patterns of Lies", student: "Ayush Thakur", initials: "AT", category: "Research", members: 1, reviewEstimate: "7 min", color: "blue", version: "v1.0", status: "Pending", repositoryUrl: "https://github.com/Ayush-thakur07/The-Patterns-of-Lies" },
    { id: 7, title: "Prjoectmed", student: "Ayush Thakur", initials: "AT", category: "HealthTech", members: 1, reviewEstimate: "8 min", color: "rose", version: "v1.0", status: "Pending", repositoryUrl: "https://github.com/Ayush-thakur07/Prjoectmed" },
    { id: 8, title: "Photography Portfolio", student: "Ayush Thakur", initials: "AT", category: "Web", members: 1, reviewEstimate: "5 min", color: "peach", version: "v1.0", status: "Pending", repositoryUrl: "https://github.com/Ayush-thakur07/photography-portfolio" },
    { id: 9, title: "Form", student: "Ayush Thakur", initials: "AT", category: "Web", members: 1, reviewEstimate: "5 min", color: "mint", version: "v1.0", status: "Pending", repositoryUrl: "https://github.com/Ayush-thakur07/form" },
    { id: 10, title: "Visionary", student: "Ayush Thakur", initials: "AT", category: "AI / ML", members: 1, reviewEstimate: "9 min", color: "lavender", version: "v1.0", status: "Pending", repositoryUrl: "https://github.com/Ayush-thakur07/Visionary" },
    { id: 11, title: "NumPy Microscopy Toolkit", student: "Misthi Rawal", initials: "MR", category: "Data Science", members: 1, reviewEstimate: "8 min", color: "blue", version: "v1.0", status: "Pending", repositoryUrl: "https://github.com/misthirawal/numpy-microscopy-toolkit" },
    { id: 12, title: "Runtime Visualization Platform", student: "Misthi Rawal", initials: "MR", category: "Developer Tools", members: 1, reviewEstimate: "10 min", color: "mint", version: "v1.0", status: "Pending", repositoryUrl: "https://github.com/misthirawal/Runtime-Visualization-Platform" },
];

export const navigation = [
    { label: "Overview", icon: "⌂", section: "Workspace" },
    { label: "Review Queue", icon: "▤", section: "Workspace", badge: true },
    { label: "Assignments", icon: "▣", section: "Workspace" },
    { label: "My Reviews", icon: "✓", section: "Workspace" },
    { label: "Students", icon: "♙", section: "Manage" },
    { label: "Teams", icon: "♧", section: "Manage" },
    { label: "Projects", icon: "▧", section: "Manage" },
    { label: "Analytics", icon: "▥", section: "Insights" },
    { label: "Skill Insights", icon: "◈", section: "Insights" },
    { label: "Reports", icon: "▧", section: "Insights" },
    { label: "Messages", icon: "▱", section: "More" },
    { label: "Rubrics", icon: "☷", section: "More" },
    { label: "Settings", icon: "⚙", section: "More" },
];

export const activities = [
    { initials: "MR", title: "Misha Rawal submitted v2.4", detail: "MemoVision AI", time: "2 hours ago", color: "lavender" },
    { initials: "AS", title: "Evaluation submitted", detail: "Smart Parking System", time: "5 hours ago", color: "mint" },
    { initials: "KR", title: "Re-evaluation requested", detail: "HealthAssist App", time: "Yesterday", color: "peach" },
    { initials: "NP", title: "New project assigned", detail: "Data Analytics Dashboard", time: "2 days ago", color: "blue" },
];

export const rubric = [
    { key: "problem", title: "Problem Definition", description: "Clarity and relevance of the problem statement" },
    { key: "data", title: "Dataset Quality", description: "Appropriateness, quality, and preprocessing" },
    { key: "design", title: "Model Design & Architecture", description: "Technical design and choice of approach" },
    { key: "testing", title: "Training & Evaluation", description: "Testing methodology and evaluation metrics" },
    { key: "innovation", title: "Innovation & Real-world Applicability", description: "Originality and practical value" },
];

export const defaultRatings = { problem: 4, data: 4, design: 4, testing: 4, innovation: 4 };

export const copilotSuggestion = {
    ratings: { problem: 4, data: 4, design: 5, testing: 4, innovation: 4 },
    feedback: "The implementation evidence shows a clear model-training workflow and verified architecture changes. Add more API setup documentation so another developer can reproduce the project.",
};

export const analyticsMetrics = [
    { icon: "▤", label: "Projects evaluated", value: "86", detail: "+12% this semester", tone: "purple" },
    { icon: "♙", label: "Students evaluated", value: "142", detail: "Across 8 courses", tone: "green" },
    { icon: "★", label: "Average rating", value: "4.7", detail: "Across all reviews", tone: "amber" },
    { icon: "◷", label: "Average review time", value: "6m 42s", detail: "2m faster this month", tone: "coral" },
];

export const chartMonths = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
export const chartValues = [42, 63, 49, 78, 59, 88, 71, 96, 69, 84, 76, 100];
export const skillDistribution = [
    ["AI / Machine Learning", 78],
    ["Web development", 62],
    ["Data analytics", 54],
    ["Mobile applications", 42],
];

export const messages = [
    "Could you take a look at our latest project update?",
    "Thanks for the feedback on our design!",
    "We’ve uploaded the new evaluation results.",
];
export const messageTimes = ["10:42 AM", "Yesterday", "Monday"];
export const reportTypes = [
    ["Review activity", "Your completed and pending evaluations", "86 evaluations"],
    ["Student progress", "Project progress across your mentees", "142 students"],
    ["Course summary", "Submissions and reviews by course", "8 courses"],
];
export const notificationSettings = [
    ["reviewAlerts", "Review reminders", "Get notified when a student submission is waiting for review."],
    ["weeklySummary", "Weekly summary", "Receive a weekly overview of your mentoring activity."],
    ["showcaseUpdates", "Showcase updates", "Get updates when students recommend projects for showcase."],
];
