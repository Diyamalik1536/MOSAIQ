//if the user has not entered their skills then values will be undefined an dundefined.map()=>error therefore i used an empty array to help sort this error
function toSet(values) //values are basically skills here
{
    return new Set((Array.isArray(values) ? values : []).map((value) => String(value || "").trim().toLowerCase()).filter(Boolean));
}
//example set A = react, java, python,B = react, python, figma
function jaccardScore(setA, setB) {
    if (setA.size === 0 && setB.size === 0) {
        return 0;
    }
    const intersection = new Set([...setA].filter((item) => setB.has(item)));
    //intersection set->{react,python}=>size=2
    const union = new Set([...setA, ...setB]);
    //union set->{react,python,java,figma}=>size=4
    return union.size === 0 ? 0 : (intersection.size / union.size) * 100; //output=2/4*100=50%
}

function getSkillsScore(studentA, studentB) {
    return jaccardScore(toSet(studentA.skills), toSet(studentB.skills));
}

function getInterestsScore(studentA, studentB) {
    return jaccardScore(toSet(studentA.interests), toSet(studentB.interests));
}

function getLookingForScore(studentA, studentB) {
    const lookingForWords = new Set(
        String(studentA.lookingFor || "")
            .toLowerCase()
            .split(/[^a-z0-9]+/)
            .filter(Boolean)
    );

    const skillsB = toSet(studentB.skills);
    let matches = 0;
    skillsB.forEach((skill) => {
        if (lookingForWords.has(skill)) {
            matches += 1;
        }
    });

    const lookingForWordsB = new Set(
        String(studentB.lookingFor || "")
            .toLowerCase()
            .split(/[^a-z0-9]+/)
            .filter(Boolean)
    );

    const skillsA = toSet(studentA.skills);
    skillsA.forEach((skill) => {
        if (lookingForWordsB.has(skill)) {
            matches += 1;
        }
    });

    const maxPossible = (studentA.skills || []).length + (studentB.skills || []).length;
    return maxPossible === 0 ? 0 : (matches / maxPossible) * 100;
}

function getAvailabilityScore(studentA, studentB) {
    const availabilityA = studentA.availability;
    const availabilityB = studentB.availability;

    if (!availabilityA || !availabilityB) {
        return 0;
    }

    const positive = new Set(["open", "open_to_collaborate"]);

    const aPositive = positive.has(String(availabilityA).toLowerCase());
    const bPositive = positive.has(String(availabilityB).toLowerCase());
    const aBusy = String(availabilityA).toLowerCase() === "busy";
    const bBusy = String(availabilityB).toLowerCase() === "busy";

    if (aPositive && bPositive) {
        return 100;
    }

    if ((aPositive && bBusy) || (aBusy && bPositive)) {
        return 40;
    }

    if (aBusy && bBusy) {
        return 50;
    }

    return 0;
}

function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}

export function calculateRecommendationScore(student, context) {
    const requiredSkills = [...context.requiredSkillWeights.values()];
    const studentSkills = toSet(student.skills);
    const requirementTotal = requiredSkills.reduce((total, skill) => total + skill.weight, 0);
    const requirementMatch = requirementTotal === 0
        ? 0
        : requiredSkills.reduce((total, skill) => (
            studentSkills.has(String(skill.name || "").trim().toLowerCase()) ? total + skill.weight : total
        ), 0) / requirementTotal * 100;
    const profileSkills = jaccardScore(toSet(student.skills), toSet(context.profile.skills));
    const interestMatch = jaccardScore(toSet(student.interests), toSet(context.profile.interests));
    const total = context.hasPostRequirements
        ? requirementMatch * 0.6 + profileSkills * 0.25 + interestMatch * 0.15
        : profileSkills * 0.7 + interestMatch * 0.3;

    return clamp(total, 0, 100);
}

export function calculateMatchScore(studentA, studentB) {
    const skillsScore = getSkillsScore(studentA, studentB);
    const interestsScore = getInterestsScore(studentA, studentB);
    const lookingForScore = getLookingForScore(studentA, studentB);
    const availabilityScore = getAvailabilityScore(studentA, studentB);

    const total =
        skillsScore * 0.4 +
        interestsScore * 0.25 +
        lookingForScore * 0.25 +
        availabilityScore * 0.1;

    return Math.round(clamp(total, 0, 100));
}
