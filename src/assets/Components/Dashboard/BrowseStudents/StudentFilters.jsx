import { useState, useMemo } from "react";
import { useUser } from "../../../../context/UserContext";
import { useTranslation } from "react-i18next";

function StudentFilters({ students, onFilterChange }) {
    const { t } = useTranslation();
    const { isPro, openUpgradeModal } = useUser();
    const [selectedSkill, setSelectedSkill] = useState("");
    const [selectedField, setSelectedField] = useState("");
    const [selectedYear, setSelectedYear] = useState("");
    const [selectedAvailability, setSelectedAvailability] = useState("");

    const availabilityOptions = [
        { label: t("students.availability.open", "Open"), value: "open" },
        { label: t("students.availability.open_to_collaborate", "Open to Collaborate"), value: "open_to_collaborate" },
        { label: t("students.availability.busy", "Busy"), value: "busy" }
    ];

    const allSkills = useMemo(() => {
        const skillSet = new Set();
        students.forEach((student) => {
            (student.skills || []).forEach((skill) => skillSet.add(skill));
        });
        return Array.from(skillSet).sort();
    }, [students]);

    const allFields = useMemo(() => {
        const fieldSet = new Set();
        students.forEach((student) => {
            if (student.major) fieldSet.add(student.major);
        });
        return Array.from(fieldSet).sort();
    }, [students]);

    const allYears = useMemo(() => {
        const yearSet = new Set();
        students.forEach((student) => {
            if (student.year) yearSet.add(student.year);
        });
        return Array.from(yearSet).sort();
    }, [students]);

    function handleSkillChange(event) {
        const skill = event.target.value;
        setSelectedSkill(skill);
        onFilterChange({ skill, field: selectedField, year: selectedYear, availability: selectedAvailability });
    }

    const interceptProFilter = (e, featureName) => {
        if (!isPro) {
            e.preventDefault();
            openUpgradeModal(featureName);
        }
    };

    function handleFieldChange(event) {
        if (!isPro) {
            openUpgradeModal("Advanced Filters (Field)");
            return;
        }
        const field = event.target.value;
        setSelectedField(field);
        onFilterChange({ skill: selectedSkill, field, year: selectedYear, availability: selectedAvailability });
    }

    function handleYearChange(event) {
        if (!isPro) {
            openUpgradeModal("Advanced Filters (Year)");
            return;
        }
        const year = event.target.value;
        setSelectedYear(year);
        onFilterChange({ skill: selectedSkill, field: selectedField, year, availability: selectedAvailability });
    }

    function handleAvailabilityChange(event) {
        if (!isPro) {
            openUpgradeModal("Advanced Filters (Availability)");
            return;
        }
        const availability = event.target.value;
        setSelectedAvailability(availability);
        onFilterChange({ skill: selectedSkill, field: selectedField, year: selectedYear, availability });
    }

    return (
        <div className="student-filters">
            <div className="filter-group">
                <label htmlFor="skill-filter">{t("students.skillsLabel", "Skills")}</label>
                <select
                    id="skill-filter"
                    value={selectedSkill}
                    onChange={handleSkillChange}
                >
                    <option value="">{t("students.allSkills", "All Skills")}</option>
                    {allSkills.map((skill) => (
                        <option key={skill} value={skill}>
                            {skill}
                        </option>
                    ))}
                </select>
            </div>

            <div className="filter-group">
                <label htmlFor="field-filter">
                    {t("students.fieldLabel", "Field")}
                    {!isPro && (
                        <span
                            className="filter-pro-pill"
                            onClick={() => openUpgradeModal("Advanced Filters (Field)")}
                            title="Pro Feature: Advanced Filter"
                        >
                            <i className="bi bi-lock-fill"></i> {t("students.proFeature", "PRO")}
                        </span>
                    )}
                </label>
                <select
                    id="field-filter"
                    value={selectedField}
                    onMouseDown={(e) => interceptProFilter(e, "Advanced Filters (Field)")}
                    onChange={handleFieldChange}
                    className={!isPro ? "pro-restricted-select" : ""}
                >
                    <option value="">{t("students.allFields", "All Fields")} {!isPro ? "(Pro)" : ""}</option>
                    {allFields.map((field) => (
                        <option key={field} value={field}>
                            {field}
                        </option>
                    ))}
                </select>
            </div>

            <div className="filter-group">
                <label htmlFor="year-filter">
                    {t("students.yearLabel", "Year")}
                    {!isPro && (
                        <span
                            className="filter-pro-pill"
                            onClick={() => openUpgradeModal("Advanced Filters (Year)")}
                            title="Pro Feature: Advanced Filter"
                        >
                            <i className="bi bi-lock-fill"></i> {t("students.proFeature", "PRO")}
                        </span>
                    )}
                </label>
                <select
                    id="year-filter"
                    value={selectedYear}
                    onMouseDown={(e) => interceptProFilter(e, "Advanced Filters (Year)")}
                    onChange={handleYearChange}
                    className={!isPro ? "pro-restricted-select" : ""}
                >
                    <option value="">{t("students.allYears", "All Years")} {!isPro ? "(Pro)" : ""}</option>
                    {allYears.map((year) => (
                        <option key={year} value={year}>
                            {year}
                        </option>
                    ))}
                </select>
            </div>

            <div className="filter-group">
                <label htmlFor="availability-filter">
                    {t("students.availabilityLabel", "Availability")}
                    {!isPro && (
                        <span
                            className="filter-pro-pill"
                            onClick={() => openUpgradeModal("Advanced Filters (Availability)")}
                            title="Pro Feature: Advanced Filter"
                        >
                            <i className="bi bi-lock-fill"></i> {t("students.proFeature", "PRO")}
                        </span>
                    )}
                </label>
                <select
                    id="availability-filter"
                    value={selectedAvailability}
                    onMouseDown={(e) => interceptProFilter(e, "Advanced Filters (Availability)")}
                    onChange={handleAvailabilityChange}
                    className={!isPro ? "pro-restricted-select" : ""}
                >
                    <option value="">{t("students.allAvailability", "All Availability")} {!isPro ? "(Pro)" : ""}</option>
                    {availabilityOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
            </div>
        </div>
    );
}

export default StudentFilters;
