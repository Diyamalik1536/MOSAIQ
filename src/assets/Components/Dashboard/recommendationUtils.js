import { studentData } from "./BrowseStudents/studentData";
import { calculateMatchScore, calculateRecommendationScore } from "./BrowseStudents/matchUtils";
//Take any value and make sure that the result is an array.
function asArray(value) {
    return Array.isArray(value) ? value : [];
}
//Make sure a value is a valid, cleaned string before the matching/search/recommendation logic uses it.
function asText(value) {
    return typeof value === "string" ? value.trim() : "";
}

//optional chaining? post?.createdAt Answer:To safely access createdAt without throwing an error if post is null or undefined.
function getPostDate(post) {
    const time = new Date(post?.createdAt || 0).getTime();//getTime() return?The number of milliseconds elapsed since January 1, 1970 UTC.
    return Number.isFinite(time) ? time : 0;
}
//getKnownSkills() collects skills and interests from all students, safely cleans them, normalizes them case-insensitively using lowercase Map keys, removes duplicates, and returns a unique array of known skills that TalentForge can use for post skill detection and recommendations.
export function getKnownSkills(students = studentData) {
    return [...new Map(
        asArray(students)
            .flatMap((student) => [
                ...asArray(student?.skills),
                ...asArray(student?.interests)
            ])
            .map((skill) => asText(skill))
            .filter(Boolean)
            .map((skill) => [skill.toLowerCase(), skill])
    ).values()];
}
//Take all the relevant text from a project post, combine it into one clean searchable string, and convert it to lowercase.
function searchablePostText(post) {//Give me all the useful text from this post in a form that is easy to search.
    return [
        post?.title,
        post?.description,
        post?.skillsNeeded,
        post?.skills,
        post?.helpNeeded,
        post?.projectDescription
    ].flatMap((value) => Array.isArray(value) ? value : [value])
        .map(asText)
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
}

function skillMatchesText(skill, text) {
    const normalizedSkill = skill.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();//Convert the skill into a clean, lowercase, punctuation-normalized form.
    const normalizedText = text.replace(/[^a-z0-9]+/g, " ");//We don't use toLowerCase() here.Why?Because searchablePostText() already did:
    if (!normalizedSkill) return false;//An empty skill cannot match anything.
    if (` ${normalizedText} `.includes(` ${normalizedSkill} `)) return true;//Does the larger string contain this exact word/phrase surrounded by spaces
    return normalizedSkill.length >= 5 && normalizedText.replaceAll(" ", "").includes(normalizedSkill.replaceAll(" ", "")); //Imagine someone writes:"I am looking for machinelearning enthusiasts."instead of:"I am looking for machine learning enthusiasts."Normal matching:" machine learning "would NOT match:" machinelearning "because the space is different.But the fallback removes spaces:machine learning->machinelearning
}
//detected skills arrayy ko bna rha h
export function extractRequiredSkills(post, students = studentData) {
    if (!post || typeof post !== "object") return [];//If the post isn't valid, don't continue.
    const text = searchablePostText(post);
    return getKnownSkills(students).filter((skill) => skillMatchesText(skill, text));
}
//normalizePosts() is basically preparing the posts so that the rest of TalentForge can safely work with them.
//               normalizePosts()
//                      │
//        ┌─────────────┼─────────────┐
//        ↓             ↓             ↓
//    VALIDATE       NORMALIZE       SORT
//      POSTS        SKILLS          POSTS
//        │             │             │
//        ↓             ↓             ↓
//    filter()       detectedSkills  newest
//                   ↓                ↓
//               existing?          oldest
//               /      \
//             yes       no
//              ↓         ↓
//           clean     extractRequiredSkills()
export function normalizePosts(posts) {
    return asArray(posts)
        .filter((post) => post && typeof post === "object")
        .map((post) => ({
            ...post,
            detectedSkills: asArray(post.detectedSkills).length
                ? [...new Set(post.detectedSkills.filter((skill) => typeof skill === "string"))]
                : extractRequiredSkills(post)
        }))
        .sort((a, b) => getPostDate(b) - getPostDate(a));
}

export function getTrendingSkills(posts, students = studentData) {
    const counts = new Map();
    normalizePosts(posts).forEach((post) => {//Go through every post one by one.
        const skills = post.detectedSkills.length ? post.detectedSkills : extractRequiredSkills(post, students);//Does this post already have detected skills
        new Set(skills).forEach((skill) => {
            const key = skill.toLowerCase();
            const current = counts.get(key);
            counts.set(key, { name: current?.name || skill, count: (current?.count || 0) + 1 });
        });
    });

    return [...counts.values()]//gets only the values.Not the keys.
//     Map {
//     "react" => { name: "React", count: 4 },
//     "python" => { name: "Python", count: 3 }
// }
// [...]

// converts that iterable into an ordinary array.

// Result:

// [
//     { name: "React", count: 4 },
//     { name: "Python", count: 3 },
//     { name: "AI", count: 3 },
//     { name: "Java", count: 2 }
// ]
        .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name))
        .slice(0, 4)//.slice(0, 4)This means:Give me only the first 4 elements.
        .map((skill) => ({
            ...skill,
            icon: "bi bi-code-slash",
            status: `${skill.count} ${skill.count === 1 ? "request" : "requests"}`
        }));
}//The function counts per post, not duplicate mentions.

export function getRecommendationContext(posts, currentUser = {}) {
    const profile = currentUser || {};
    const recentPosts = normalizePosts(posts);
//     recentPosts

// might look like:

// [
//     {
//         id: 10,
//         title: "AI project",
//         detectedSkills: ["Python", "AI"]
//     },

//     {
//         id: 11,
//         title: "React project",
//         detectedSkills: ["React"]
//     },

//     {
//         id: 12,
//         title: "ML project",
//         detectedSkills: ["Python", "Machine Learning"]
//     }
// ]

// Notice that they're already sorted newest → oldest.
    const requiredSkillWeights = new Map();
// How strongly does a particular skill matter based on the user's recent posts
    recentPosts.forEach((post, index) => {
        const weight = Math.pow(0.45, index);//important decay factor chosen by the developer.
        // Recent posts have much more influence on recommendations than older posts.
        post.detectedSkills.forEach((skill) => {
            const key = skill.toLowerCase();
            const current = requiredSkillWeights.get(key);
            requiredSkillWeights.set(key, {
                name: current?.name || skill,
                weight: (current?.weight || 0) + weight
            });
        });
    });

    const profileSkills = asArray(profile.skills).length ? profile.skills : asArray(currentUser?.skills);
    const profileInterests = asArray(profile.interests).length ? profile.interests : asArray(currentUser?.interests);

    return {
        requiredSkillWeights,
        profile: { skills: profileSkills, interests: profileInterests },
        hasPostRequirements: requiredSkillWeights.size > 0,
        hasProfileSignals: profileSkills.length > 0 || profileInterests.length > 0
    };
}
//Given all these students, posts, and the current user, which 3 students should I return as recommendations
export function getRecommendedStudents(students, posts, currentUser = {}) {
    const context = getRecommendationContext(posts, currentUser);
    return asArray(students)
        .filter((student) => student?.id && student.id !== currentUser?.id) //Remove invalid students + yourself  student?.id && student.id !== currentUser?.id
        .map((student) => {
            const score = context.hasPostRequirements || context.hasProfileSignals
                ? calculateRecommendationScore(student, context)
                : calculateMatchScore(currentUser, student);
            const matchedRequirements = [...context.requiredSkillWeights.values()]
                .filter((requirement) => asArray(student.skills).some((skill) => asText(skill).toLowerCase() === requirement.name.toLowerCase()))
                .map((requirement) => requirement.name);
            const matchedProfileSkills = asArray(context.profile.skills)
                .filter((skill) => asArray(student.skills).some((studentSkill) => asText(studentSkill).toLowerCase() === asText(skill).toLowerCase()));
            const reasonSkills = matchedRequirements.length ? matchedRequirements : matchedProfileSkills;

            return {
                ...student,
                matchPercentage: Math.min(100, Math.max(0, Math.round(score))),
                recommendationReason: reasonSkills.length
                    ? `Matches ${reasonSkills.slice(0, 2).join(" + ")}`
                    : "Matches your profile"
            };
        })
        .sort((a, b) => b.matchPercentage - a.matchPercentage || asText(a.name).localeCompare(asText(b.name)))
        .slice(0, 3);  
}
