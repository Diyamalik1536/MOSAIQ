import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";

function StudentFilters({ students, onFilterChange }) {
    const { t } = useTranslation();
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

    function handleFieldChange(event) {
        const field = event.target.value;
        setSelectedField(field);
        onFilterChange({ skill: selectedSkill, field, year: selectedYear, availability: selectedAvailability });
    }

    function handleYearChange(event) {
        const year = event.target.value;
        setSelectedYear(year);
        onFilterChange({ skill: selectedSkill, field: selectedField, year, availability: selectedAvailability });
    }

    function handleAvailabilityChange(event) {
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
                </label>
                <select
                    id="field-filter"
                    value={selectedField}
                    onChange={handleFieldChange}
                >
                    <option value="">{t("students.allFields", "All Fields")}</option>
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
                </label>
                <select
                    id="year-filter"
                    value={selectedYear}
                    onChange={handleYearChange}
                >
                    <option value="">{t("students.allYears", "All Years")}</option>
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
                </label>
                <select
                    id="availability-filter"
                    value={selectedAvailability}
                    onChange={handleAvailabilityChange}
                >
                    <option value="">{t("students.allAvailability", "All Availability")}</option>
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
